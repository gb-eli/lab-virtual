'use strict';

(function(){
  window.LABDS = window.LABDS || {};

  const DEFAULT_URL = 'https://classroom.google.com/';
  const URL_KEY = 'labds.classroom.url';
  const EXPORT_PREFIX = 'labds.classroom.export.';
  const MAX_URL_LENGTH = 2048;
  let lastAnnouncedKey = '';

  function storageGet(key){
    try{return localStorage.getItem(key);}catch{return null;}
  }
  function storageSet(key,value){
    try{localStorage.setItem(key,value);return true;}catch{return false;}
  }
  function normalizeUrl(value){
    const raw=String(value||'').trim().slice(0,MAX_URL_LENGTH);
    if(!raw)return '';
    try{
      const url=new URL(raw);
      if(url.protocol!=='https:'||url.hostname!=='classroom.google.com')return '';
      url.username='';url.password='';url.hash='';
      return url.href;
    }catch{return '';}
  }
  function queryUrl(){
    const raw=new URLSearchParams(location.search).get('classroom');
    const valid=normalizeUrl(raw);
    if(valid)storageSet(URL_KEY,valid);
    return valid;
  }
  function getUrl(){return queryUrl()||normalizeUrl(storageGet(URL_KEY))||DEFAULT_URL;}
  function setUrl(value){
    const valid=normalizeUrl(value);
    if(!valid)throw new Error('Use um endereço HTTPS do domínio classroom.google.com.');
    storageSet(URL_KEY,valid);update();return valid;
  }
  function contextKey(){
    const session=window.LABDS.Session?.get?.();
    if(session?.sessionId)return `session-${session.sessionId}`;
    const profile=window.LABDS.Core?.getSnapshot?.()?.profile;
    return `profile-${String(profile?.name||'local').replace(/[^a-z0-9_-]+/gi,'-').slice(0,60)}`;
  }
  function exportKey(){return `${EXPORT_PREFIX}${contextKey()}`;}
  function readRecord(){
    try{const parsed=JSON.parse(storageGet(exportKey())||'null');return parsed&&typeof parsed==='object'?parsed:null;}catch{return null;}
  }
  function markExported(detail={}){
    const record={
      at:new Date().toISOString(),
      sessionId:window.LABDS.Session?.get?.()?.sessionId||null,
      toolId:window.LABDS.App?.getState?.()?.currentTool?.id||detail.toolId||null,
      toolName:window.LABDS.App?.getState?.()?.currentTool?.name||detail.toolName||'Atividade do Lab Virtual DS',
      filename:String(detail.filename||detail.name||'arquivo exportado').slice(0,180),
      format:String(detail.format||detail.mime||'arquivo').slice(0,80)
    };
    storageSet(exportKey(),JSON.stringify(record));
    update();
    document.dispatchEvent(new CustomEvent('labds:classroomready',{detail:record}));
    const announceKey=`${contextKey()}:${record.filename}`;
    if(lastAnnouncedKey!==announceKey){
      lastAnnouncedKey=announceKey;
      window.LABDS.App?.toast?.('Exportação concluída. O botão do Classroom foi liberado.','success',4200);
    }
    return record;
  }
  function isReady(){return Boolean(readRecord());}
  function update(){
    const ready=isReady();
    document.querySelectorAll('[data-classroom-delivery]').forEach(button=>{
      button.classList.toggle('classroom-ready',ready);
      button.classList.toggle('classroom-locked',!ready);
      button.setAttribute('aria-disabled',String(!ready));
      button.title=ready?'Abrir a etapa de entrega no Google Classroom':'Exporte um relatório ou arquivo antes de abrir o Classroom';
      const label=button.querySelector('[data-classroom-label]');
      if(label)label.textContent=ready?'Ir para o Classroom':'Classroom bloqueado';
    });
    const record=readRecord();
    const info=document.querySelector('#classroomExportInfo');
    if(info)info.textContent=record?`${record.filename} • ${new Date(record.at).toLocaleString('pt-BR')}`:'Nenhum arquivo foi exportado nesta sessão.';
    const destination=document.querySelector('#classroomDestinationInfo');
    if(destination)destination.textContent=getUrl()===DEFAULT_URL?'Página inicial do Google Classroom':'Link específico configurado para esta atividade';
  }
  function guideToExport(){
    window.LABDS.App?.toast?.('Primeiro exporte o relatório ou o arquivo da atividade. Depois o Classroom será liberado.','warning',5200);
    const state=window.LABDS.App?.getState?.();
    if(state?.currentTool){
      const dialog=document.querySelector('#exportDialog');
      if(dialog&&!dialog.open)dialog.showModal();
      return;
    }
    window.LABDS.App?.openHistory?.();
  }
  function prompt(){
    if(!isReady()){guideToExport();return false;}
    update();
    const dialog=document.querySelector('#classroomDialog');
    if(dialog&&!dialog.open)dialog.showModal();
    return true;
  }
  function openClassroom(){
    if(!isReady()){guideToExport();return false;}
    const url=getUrl();
    const anchor=document.createElement('a');anchor.href=url;anchor.target='_blank';anchor.rel='noopener noreferrer';document.body.appendChild(anchor);anchor.click();anchor.remove();
    window.LABDS.Session?.record?.({
      laboratoryId:'classroom-delivery',
      laboratoryName:'Entrega no Google Classroom',
      eventType:'delivery',
      action:'Google Classroom aberto após exportação',
      status:'success',
      context:{url:new URL(url).origin,export:readRecord()}
    });
    window.LABDS.Core?.record?.('classroom_opened',{export:readRecord()?.filename||''});
    window.LABDS.App?.toast?.('Classroom aberto. Agora anexe o arquivo baixado e conclua a entrega.','success',6000);
    return true;
  }
  function bind(){
    document.addEventListener('click',event=>{
      const button=event.target.closest('[data-classroom-delivery]');
      if(button){event.preventDefault();prompt();}
    });
    document.querySelector('#openClassroomBtn')?.addEventListener('click',openClassroom);
    document.querySelector('#saveClassroomUrlBtn')?.addEventListener('click',()=>{
      try{
        const value=document.querySelector('#classroomUrlInput')?.value||'';
        const valid=setUrl(value);
        window.LABDS.App?.toast?.('Link do Classroom salvo neste navegador.','success');
        const input=document.querySelector('#classroomUrlInput');if(input)input.value=valid;
      }catch(error){window.LABDS.App?.toast?.(error.message,'error',5000);}
    });
    document.querySelector('#classroomUrlInput')?.addEventListener('focus',event=>{event.target.value=getUrl();});
    document.addEventListener('labds:artifactexported',event=>{
      const detail=event.detail||{};
      const name=String(detail.filename||'').toLowerCase();
      if(name.includes('bug-lab-ds')||name.includes('backup'))return;
      markExported(detail);
    });
    document.addEventListener('labds:sessionchange',update);
    update();
  }

  window.LABDS.Classroom={DEFAULT_URL,normalizeUrl,getUrl,setUrl,markExported,isReady,update,prompt,open:openClassroom};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})();
