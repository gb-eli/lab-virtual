'use strict';

(function(){
  window.LABDS = window.LABDS || {};

  const ACTIVE_KEY = 'session.active.v2';
  const ARCHIVE_KEY = 'session.archive.v2';
  const MAX_EVENTS = 5000;
  const MAX_TEXT = 24000;
  let current = null;
  let persistTimer = null;

  function uuid(){
    if(globalThis.crypto?.randomUUID) return crypto.randomUUID();
    if(globalThis.crypto?.getRandomValues){
      const bytes=new Uint8Array(16);crypto.getRandomValues(bytes);bytes[6]=(bytes[6]&0x0f)|0x40;bytes[8]=(bytes[8]&0x3f)|0x80;
      const hex=[...bytes].map(value=>value.toString(16).padStart(2,'0')).join('');
      return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
    }
    throw new Error('Este navegador não oferece geração criptográfica segura para iniciar a sessão.');
  }

  function cleanText(value, max = 120){
    return String(value ?? '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .replace(/[<>`]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, max);
  }

  function clip(value, max = MAX_TEXT){
    const text = String(value ?? '');
    return text.length > max ? `${text.slice(0,max)}\n[saída reduzida: ${text.length-max} caracteres omitidos]` : text;
  }


  function isRemovedTool(value){
    const id=String(value||'').trim().toLowerCase();
    return (window.LABDS.REMOVED_TOOL_IDS||[]).includes(id)||id.includes('iara');
  }

  function sanitizeRemovedTools(session){
    if(!session||typeof session!=='object')return session;
    session.labsUsed=Array.isArray(session.labsUsed)?session.labsUsed.filter(item=>!isRemovedTool(item?.id)&&!isRemovedTool(item?.name)):[];
    session.events=Array.isArray(session.events)?session.events.filter(item=>!isRemovedTool(item?.laboratoryId)&&!isRemovedTool(item?.laboratoryName)):[];
    session.sequenceNumber=Math.max(Number(session.sequenceNumber)||0,session.events.reduce((max,item)=>Math.max(max,Number(item?.sequenceNumber)||0),0));
    return session;
  }

  function redact(value, key = ''){
    if(/senha|password|passwd|secret|credential/i.test(key)) return value ? '[não armazenado]' : '';
    if(value == null || typeof value === 'number' || typeof value === 'boolean') return value;
    if(typeof value === 'string') return clip(value);
    if(Array.isArray(value)) return value.slice(0,500).map(item => redact(item));
    if(typeof value === 'object'){
      const out = {};
      Object.entries(value).slice(0,300).forEach(([k,v]) => { out[cleanText(k,80)] = redact(v,k); });
      return out;
    }
    return cleanText(value,200);
  }

  function emit(){
    document.dispatchEvent(new CustomEvent('labds:sessionchange',{detail:{session:publicSession()}}));
  }

  function schedulePersist(){
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => persist().catch(()=>{}), 80);
  }

  async function persist(){
    if(!current) return window.LABDS.Storage.remove(ACTIVE_KEY);
    await window.LABDS.Storage.set(ACTIVE_KEY, current);
  }

  function publicSession(){
    if(!current) return null;
    return {
      sessionId:current.sessionId,
      studentName:current.studentName,
      studentClass:current.studentClass,
      startedAt:current.startedAt,
      finishedAt:current.finishedAt,
      status:current.status,
      applicationVersion:current.applicationVersion,
      labsUsed:[...current.labsUsed],
      eventCount:current.events.length
    };
  }

  function create(studentName, studentClass){
    const name = cleanText(studentName,80);
    const turma = cleanText(studentClass,50);
    if(name.length < 3) throw new Error('Informe o nome completo do estudante.');
    if(!turma) throw new Error('Selecione ou informe a turma.');
    current = {
      sessionId:uuid(), studentName:name, studentClass:turma,
      startedAt:new Date().toISOString(), finishedAt:null, status:'Em andamento',
      applicationVersion:window.LABDS.VERSION || 'desconhecida', labsUsed:[], events:[], exportHistory:[],
      sequenceNumber:0, restoredCount:0, createdOnDevice:true
    };
    record({laboratoryId:'system',laboratoryName:'Sistema',eventType:'session',action:'Sessão iniciada',status:'success'});
    schedulePersist(); emit(); return publicSession();
  }

  async function init(){
    const saved = await window.LABDS.Storage.get(ACTIVE_KEY,null);
    if(saved && saved.sessionId && ['Em andamento','Pausada','Restaurada','Exportada'].includes(saved.status)){current=sanitizeRemovedTools(saved);await persist();}
    const archived=await window.LABDS.Storage.get(ARCHIVE_KEY,[]);
    if(Array.isArray(archived)){const cleaned=archived.map(sanitizeRemovedTools);await window.LABDS.Storage.set(ARCHIVE_KEY,cleaned);}
    return current;
  }

  function hasRestorable(){ return !!current; }
  function get(){ return current; }
  function scopeId(){ return current?.sessionId || 'sem-sessao'; }
  function scopeKey(key, sessionId = scopeId()){ return `session.${sessionId}.${String(key)}`; }
  function scopedStorage(base = window.LABDS.Storage){
    return {
      get:(key,fallback)=>base.get(scopeKey(key),fallback),
      set:(key,value)=>base.set(scopeKey(key),value),
      remove:key=>base.remove(scopeKey(key)),
      smallGet:base.smallGet,
      smallSet:base.smallSet
    };
  }

  async function continueSaved(){
    if(!current) return null;
    current.status='Restaurada'; current.restoredCount=(current.restoredCount||0)+1;
    record({laboratoryId:'system',laboratoryName:'Sistema',eventType:'session',action:'Sessão restaurada após recarregamento',status:'success'});
    await persist(); emit(); return publicSession();
  }

  async function archive(session){
    const list = await window.LABDS.Storage.get(ARCHIVE_KEY,[]);
    const safe = Array.isArray(list) ? list.slice(-19) : [];
    safe.push(sanitizeRemovedTools(session));
    await window.LABDS.Storage.set(ARCHIVE_KEY,safe);
  }


  async function clearWorkspace(sessionId){
    if(!sessionId) return;
    await Promise.all([
      window.LABDS.Storage.removePrefix(`session.${sessionId}.`),
      window.LABDS.Storage.removePrefix(`labds.fs.${sessionId}.`)
    ]);
    try{localStorage.removeItem(`labds.cyber_ops_shadow_grid_v6.${sessionId}`);}catch{}
  }

  async function discardSaved(clearWorkspace = true){
    if(!current) return;
    const oldId=current.sessionId;
    current.status='Descartada'; current.finishedAt=new Date().toISOString();
    await archive(current);
    current=null; await window.LABDS.Storage.remove(ACTIVE_KEY);
    if(clearWorkspace) await clearWorkspace(oldId);
    emit();
  }

  async function finalize(status='Finalizada', {clearPersonal=false}={}){
    if(!current) return null;
    current.status=status; current.finishedAt=current.finishedAt || new Date().toISOString();
    record({laboratoryId:'system',laboratoryName:'Sistema',eventType:'session',action:`Sessão ${status.toLowerCase()}`,status:'success'});
    const snapshot=JSON.parse(JSON.stringify(current));
    if(!clearPersonal) await archive(snapshot);
    await window.LABDS.Storage.remove(ACTIVE_KEY);
    const oldId=current.sessionId;
    current=null;
    if(clearPersonal) await clearWorkspace(oldId);
    emit(); return snapshot;
  }

  function registerLab(tool){
    if(!current || !tool) return;
    if(!current.labsUsed.some(item=>item.id===tool.id)) current.labsUsed.push({id:tool.id,name:tool.name,runtime:tool.runtimeLabel,firstOpenedAt:new Date().toISOString()});
    record({laboratoryId:tool.id,laboratoryName:tool.name,eventType:'laboratory',action:'Laboratório aberto',status:'success',context:{runtime:tool.runtimeLabel,category:tool.category}});
  }

  function record(data={}){
    if(!current) return null;
    const now = new Date();
    const event = redact({
      eventId:uuid(), sessionId:current.sessionId,
      sequenceNumber:++current.sequenceNumber,
      timestamp:now.toISOString(),
      elapsedTime:Math.max(0,Math.round((now-new Date(current.startedAt))/1000)),
      laboratoryId:data.laboratoryId || 'system',
      laboratoryName:data.laboratoryName || 'Sistema',
      eventType:data.eventType || 'action',
      action:data.action || 'Ação registrada',
      input:data.input ?? '', output:data.output ?? '',
      status:data.status || 'success', context:data.context || {}, error:data.error || ''
    });
    current.events.push(event);
    if(current.events.length>MAX_EVENTS) current.events=current.events.slice(-MAX_EVENTS);
    schedulePersist(); emit(); return event;
  }

  function recordExport(format, filename, scope='session'){
    if(!current) return;
    const entry={timestamp:new Date().toISOString(),format,filename,scope};
    current.exportHistory.push(entry);
    current.status='Exportada';
    record({laboratoryId:'system',laboratoryName:'Sistema',eventType:'export',action:`Exportação ${format.toUpperCase()}`,status:'success',context:entry});
  }

  function summary(session=current){
    if(!session) return null;
    const end=session.finishedAt?new Date(session.finishedAt):new Date();
    const duration=Math.max(0,Math.round((end-new Date(session.startedAt))/1000));
    const events=session.events||[];
    const count=type=>events.filter(e=>e.eventType===type).length;
    return {
      duration,
      laboratories:session.labsUsed?.length||0,
      actions:events.length,
      commands:count('command_execution'),
      executions:events.filter(e=>['code_execution','sql_execution'].includes(e.eventType)).length,
      files:events.filter(e=>/arquivo|diretório|pasta/i.test(`${e.action} ${e.context?.changeType||''}`)).length,
      errors:events.filter(e=>e.status==='error').length,
      tests:events.filter(e=>/network|ping|traceroute|dns/i.test(e.eventType+' '+e.action)).length
    };
  }

  function filteredEvents({lab='all',type='all',query=''}={}){
    if(!current) return [];
    const q=cleanText(query,120).toLowerCase();
    return current.events.filter(event=>{
      const labOk=lab==='all'||event.laboratoryId===lab;
      const typeOk=type==='all'||event.eventType===type||event.status===type||(type==='file_operation'&&event.context?.filesystemChanged===true);
      const text=`${event.laboratoryName} ${event.eventType} ${event.action} ${event.input} ${event.output} ${event.error}`.toLowerCase();
      return labOk&&typeOk&&(!q||text.includes(q));
    });
  }

  window.LABDS.Session={init,create,get,publicSession,hasRestorable,continueSaved,discardSaved,finalize,registerLab,record,recordExport,summary,filteredEvents,scopeId,scopeKey,scopedStorage,cleanText,redact,clip,persist,clearWorkspace};
})();
