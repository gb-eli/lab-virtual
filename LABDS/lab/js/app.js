'use strict';

(function(){
  window.LABDS = window.LABDS || {};
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const state = {currentTool:null,currentLab:null,activeFilter:'all',deferredInstall:null,loadedModules:new Set(),pendingToolId:null,exportAbort:null,showcaseOrder:[],showcaseIndex:0,showcaseTimer:0,showcaseManualPause:false,showcaseReady:false,showcaseBatchSize:4,arcadeTimer:0,versionTimer:0,remoteRelease:null,versionCheckState:'checking'};
  const screens={home:$('#homeScreen'),terminal:$('#terminalScreen'),lab:$('#labScreen')};

  function toast(message,tone='info',duration=3000){const region=$('#toastRegion'),item=document.createElement('div');item.className=`toast ${tone}`;item.textContent=message;region.appendChild(item);requestAnimationFrame(()=>item.classList.add('show'));setTimeout(()=>{item.classList.remove('show');setTimeout(()=>item.remove(),250);},duration);}
  function showScreen(name){Object.entries(screens).forEach(([key,element])=>element?.classList.toggle('active',key===name));window.scrollTo({top:0,behavior:'instant'});}
  function runtimeClass(runtime){return runtime==='real'?'runtime-real':runtime==='real-online'?'runtime-online':runtime==='simulation'?'runtime-sim':'runtime-demo';}
  function formatDuration(seconds){if(window.LABDS.SessionExporter?.duration)return window.LABDS.SessionExporter.duration(seconds);const total=Math.max(0,Math.round(Number(seconds)||0)),h=Math.floor(total/3600),m=Math.floor(total%3600/60),sec=total%60;return h?`${h}h ${m}min`:(m?`${m}min ${sec}s`:`${sec}s`);}
  async function ensureBundle(name){return window.LABDS.ResourceLoader?.loadBundle?.(name);}
  async function ensureExportTools(){await ensureBundle('export');}
  function normalizeSearch(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
  function expandedQuery(value){const query=normalizeSearch(value),aliases={js:'javascript',vm:'virtualizacao',bd:'sql',so:'sistemas operacionais'};return aliases[query]||query;}


  function normalizeRelease(raw){
    const fallback=window.LABDS.RELEASE||{};
    return {
      version:String(raw?.version||fallback.version||window.LABDS.VERSION||'desconhecida').replace(/^v/i,''),
      updatedAt:String(raw?.updatedAt||fallback.updatedAt||window.LABDS.RELEASE_DATE||''),
      channel:String(raw?.channel||fallback.channel||'stable'),
      title:String(raw?.title||fallback.title||'Atualização da plataforma'),
      notes:Array.isArray(raw?.notes)?raw.notes.map(String):Array.isArray(fallback.notes)?[...fallback.notes]:[]
    };
  }
  function versionParts(value){return String(value||'').replace(/[^0-9.]/g,'').split('.').map(part=>Number(part)||0).slice(0,4);}
  function compareVersions(a,b){const left=versionParts(a),right=versionParts(b),length=Math.max(left.length,right.length);for(let i=0;i<length;i++){const diff=(left[i]||0)-(right[i]||0);if(diff)return diff>0?1:-1;}return 0;}
  function releaseDate(value){const date=new Date(value);return Number.isFinite(date.getTime())?date:null;}
  function plural(value,singular,pluralForm=`${singular}s`){return `${value} ${value===1?singular:pluralForm}`;}
  function relativeUpdate(value){
    const date=releaseDate(value);if(!date)return 'data não informada';
    const seconds=Math.round((Date.now()-date.getTime())/1000),future=seconds<0,total=Math.abs(seconds);
    let text='agora';
    if(total>=31536000)text=plural(Math.floor(total/31536000),'ano');
    else if(total>=2592000)text=plural(Math.floor(total/2592000),'mês','meses');
    else if(total>=86400)text=plural(Math.floor(total/86400),'dia');
    else if(total>=3600)text=plural(Math.floor(total/3600),'hora');
    else if(total>=60)text=plural(Math.floor(total/60),'minuto');
    else if(total>=10)text=plural(total,'segundo');
    return text==='agora'?'agora':future?`em ${text}`:`há ${text}`;
  }
  function exactUpdate(value){const date=releaseDate(value);if(!date)return 'Data não informada';try{return new Intl.DateTimeFormat('pt-BR',{dateStyle:'long',timeStyle:'short'}).format(date);}catch{return date.toLocaleString('pt-BR');}}
  function channelLabel(value){const labels={stable:'Estável',beta:'Beta',preview:'Prévia',development:'Desenvolvimento'};return labels[String(value||'').toLowerCase()]||String(value||'Não informado');}
  function renderVersionControl(){
    const local=normalizeRelease(window.LABDS.RELEASE),remote=normalizeRelease(state.remoteRelease||local),comparison=compareVersions(remote.version,local.version);
    const legacy=comparison>0,current=comparison===0,focus=remote;
    const stateLabel=legacy?'Atualização publicada — esta aba está em versão anterior':current?(state.versionCheckState==='offline'?'Versão instalada; verificação online indisponível':'Versão atual confirmada'):'Versão local mais recente que o registro público';
    const age=relativeUpdate(focus.updatedAt),summary=legacy?`v${focus.version} publicada ${age}`:`Atualizado ${age}`;
    const homeNumber=$('#homeVersionNumber');if(homeNumber)homeNumber.textContent=`v${local.version}`;
    const homeAge=$('#homeVersionAge');if(homeAge)homeAge.textContent=summary;
    const homeButton=$('#homeVersionStatusBtn');if(homeButton){homeButton.dataset.versionState=legacy?'legacy':state.versionCheckState==='offline'?'offline':'current';homeButton.title=stateLabel;}
    const badge=$('#appVersionBadge');if(badge){badge.textContent=`v${local.version}`;badge.dataset.versionState=legacy?'legacy':'current';badge.title=`${stateLabel}. ${summary}.`;}
    const overview=$('.version-overview');if(overview)overview.dataset.versionState=legacy?'legacy':state.versionCheckState==='offline'?'offline':'current';
    if($('#versionStateLabel'))$('#versionStateLabel').textContent=stateLabel;
    if($('#versionLatestNumber'))$('#versionLatestNumber').textContent=`v${focus.version}`;
    if($('#versionRelativeTime'))$('#versionRelativeTime').textContent=summary;
    if($('#versionInstalledNumber'))$('#versionInstalledNumber').textContent=`v${local.version}`;
    if($('#versionPublishedNumber'))$('#versionPublishedNumber').textContent=`v${remote.version}`;
    if($('#versionPublishedAt')){$('#versionPublishedAt').textContent=exactUpdate(remote.updatedAt);$('#versionPublishedAt').dateTime=remote.updatedAt;}
    if($('#versionChannel'))$('#versionChannel').textContent=channelLabel(remote.channel);
    if($('#versionReleaseTitle'))$('#versionReleaseTitle').textContent=remote.title;
    const list=$('#versionReleaseNotes');if(list){list.innerHTML='';(remote.notes.length?remote.notes:['Nenhuma nota informada para esta publicação.']).forEach(note=>{const item=document.createElement('li');item.textContent=note;list.appendChild(item);});}
    const connectivity=$('#versionConnectivityNote');if(connectivity)connectivity.textContent=state.versionCheckState==='offline'?'Não foi possível consultar o arquivo público agora. A data exibida veio da versão instalada e será verificada novamente quando houver conexão.':'A verificação consulta somente o arquivo público version.json do próprio Lab Virtual DS. Nenhum dado pessoal é enviado.';
  }
  async function refreshVersionControl({announce=false}={}){
    state.versionCheckState='checking';renderVersionControl();
    try{
      const response=await fetch('./version.json',{cache:'no-store',headers:{Accept:'application/json'}});if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const remote=await response.json();if(!remote?.version||!remote?.updatedAt)throw new Error('Metadados incompletos');
      state.remoteRelease=remote;state.versionCheckState='online';renderVersionControl();
      if(announce){const local=normalizeRelease(window.LABDS.RELEASE);toast(compareVersions(remote.version,local.version)>0?`Versão v${remote.version} publicada. Atualize a página.`:'Esta aba está usando a versão publicada mais recente.','success',4400);}
    }catch(error){state.remoteRelease=null;state.versionCheckState='offline';renderVersionControl();if(announce)toast('Não foi possível verificar a versão online agora.','warning',4200);}
  }
  function openVersionDialog(){renderVersionControl();$('#versionDialog')?.showModal();}


  function isRemovedToolId(value){return (window.LABDS.REMOVED_TOOL_IDS||[]).includes(String(value||'').trim().toLowerCase());}
  async function cleanupRemovedFeatures(){
    const removed=new Set((window.LABDS.REMOVED_TOOL_IDS||[]).map(id=>String(id).toLowerCase()));
    const matches=value=>{const text=String(value||'').toLowerCase();return removed.has(text)||text.includes('iara');};
    try{
      for(const storage of [localStorage,sessionStorage]){
        const keys=[];for(let i=0;i<storage.length;i++)keys.push(storage.key(i));
        keys.filter(key=>matches(key)).forEach(key=>storage.removeItem(key));
      }
      const last=window.LABDS.Storage?.smallGet?.('lastTool');if(matches(last))window.LABDS.Storage?.smallRemove?.('lastTool');
      const dump=await window.LABDS.Storage?.dump?.();for(const key of Object.keys(dump?.states||{}))if(matches(key))await window.LABDS.Storage.remove(key);
      if('caches'in window)for(const key of await caches.keys())if(matches(key))await caches.delete(key);
    }catch(error){console.warn('[Lab DS] limpeza de recurso removido não concluída:',error);}
  }
  function resolveRequestedTool(raw){const id=String(raw||'').trim().toLowerCase();return window.LABDS.DEPRECATED_TOOL_REDIRECTS?.[id]||id;}

  function card(tool){
    const article=document.createElement('article');article.className='tool-card';article.dataset.toolId=tool.id;article.dataset.category=tool.category;
    const button=document.createElement('button');button.type='button';button.className='tool-card-button';button.setAttribute('aria-label',`Abrir ${tool.name}`);
    button.innerHTML=`<div class="tool-card-top"><span class="tool-icon"></span><span class="runtime-dot ${runtimeClass(tool.runtime)}" title="${tool.runtimeLabel}"></span></div><div class="tool-card-copy"><h3></h3><p></p></div><div class="tool-card-meta"><span></span><span></span></div><div class="tool-card-footer"><small class="runtime-label ${runtimeClass(tool.runtime)}"></small><span aria-hidden="true">↗</span></div>`;
    button.querySelector('.tool-icon').textContent=tool.icon;button.querySelector('h3').textContent=tool.name;button.querySelector('.tool-card-copy p').textContent=tool.description;
    const meta=button.querySelectorAll('.tool-card-meta span');meta[0].textContent=window.LABDS.CATEGORY_LABELS[tool.category]||tool.category;meta[1].textContent=tool.level==='basic'?'Básico':tool.level==='intermediate'?'Intermediário':'Avançado';button.querySelector('.runtime-label').textContent=tool.runtimeLabel;
    button.addEventListener('click',()=>openTool(tool.id));article.appendChild(button);return article;
  }
  function secureRandom(){try{const values=new Uint32Array(1);crypto.getRandomValues(values);return values[0]/4294967296;}catch{return Math.random();}}
  function shuffleShowcase(items){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(secureRandom()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
  function showcaseBatchSize(){return innerWidth<=620?1:innerWidth<=1050?2:4;}
  function buildShowcaseOrder(){const usage=window.LABDS.Core?.getSnapshot?.().labsUsed||{},buckets=new Map();for(const tool of window.LABDS.TOOLS){if(!buckets.has(tool.category))buckets.set(tool.category,[]);buckets.get(tool.category).push(tool);}for(const [category,tools] of buckets){buckets.set(category,shuffleShowcase(tools).sort((a,b)=>(usage[a.id]?.count||0)-(usage[b.id]?.count||0)));}const categories=shuffleShowcase([...buckets.keys()]),order=[];let pending=true;while(pending){pending=false;for(const category of categories){const item=buckets.get(category)?.shift();if(item){order.push(item);pending=true;}}}state.showcaseOrder=order;state.showcaseIndex=Math.floor(secureRandom()*Math.max(1,order.length));}
  function showcaseCard(tool,index){const article=document.createElement('article');article.className='showcase-card';article.style.setProperty('--showcase-delay',`${index*65}ms`);const top=document.createElement('div');top.className='showcase-card-top';const icon=document.createElement('span');icon.className='showcase-card-icon';icon.textContent=tool.icon;const category=document.createElement('span');category.className='showcase-card-category';category.textContent=window.LABDS.CATEGORY_LABELS[tool.category]||tool.category;top.append(icon,category);const copy=document.createElement('div'),title=document.createElement('h3'),description=document.createElement('p');title.textContent=tool.name;description.textContent=tool.description;copy.append(title,description);const actions=document.createElement('div');actions.className='button-row';const open=document.createElement('button');open.className='btn primary';open.type='button';open.textContent='Abrir';open.addEventListener('click',()=>openTool(tool.id));const search=document.createElement('button');search.className='btn secondary';search.type='button';search.textContent='Ver área';search.setAttribute('aria-label',`Ver ferramentas de ${category.textContent}`);search.addEventListener('click',()=>showCatalog(tool.category));actions.append(open,search);article.append(top,copy,actions);return article;}
  function restartShowcaseProgress(){const progress=$('#showcaseProgress');if(!progress)return;progress.classList.remove('running');void progress.offsetWidth;if(!state.showcaseManualPause&&!document.hidden&&!matchMedia('(prefers-reduced-motion: reduce)').matches)progress.classList.add('running');}
  function renderShowcase(){const grid=$('#showcaseGrid');if(!grid||!state.showcaseOrder.length)return;state.showcaseBatchSize=showcaseBatchSize();const fragment=document.createDocumentFragment();for(let i=0;i<state.showcaseBatchSize;i++){const tool=state.showcaseOrder[(state.showcaseIndex+i)%state.showcaseOrder.length];fragment.appendChild(showcaseCard(tool,i));}grid.classList.add('is-changing');requestAnimationFrame(()=>{grid.replaceChildren(fragment);requestAnimationFrame(()=>grid.classList.remove('is-changing'));});const page=Math.floor(state.showcaseIndex/state.showcaseBatchSize)+1,total=Math.ceil(state.showcaseOrder.length/state.showcaseBatchSize);$('#showcaseIndicator').textContent=`Seleção ${page} de ${total}`;restartShowcaseProgress();}
  function scheduleShowcase(){clearTimeout(state.showcaseTimer);if(state.showcaseManualPause||document.hidden||matchMedia('(prefers-reduced-motion: reduce)').matches)return;state.showcaseTimer=setTimeout(()=>moveShowcase(1),window.LABDS.HOME_SHOWCASE_INTERVAL||7000);}
  function moveShowcase(direction=1){if(!state.showcaseOrder.length)buildShowcaseOrder();const step=state.showcaseBatchSize||showcaseBatchSize();state.showcaseIndex=(state.showcaseIndex+direction*step+state.showcaseOrder.length)%state.showcaseOrder.length;renderShowcase();scheduleShowcase();}
  function updateShowcasePause(){const paused=state.showcaseManualPause||document.hidden||matchMedia('(prefers-reduced-motion: reduce)').matches,button=$('#showcasePause');if(button){button.textContent=paused?'▶':'Ⅱ';button.setAttribute('aria-label',paused?'Retomar vitrine':'Pausar vitrine');}restartShowcaseProgress();if(paused)clearTimeout(state.showcaseTimer);else scheduleShowcase();}
  function initShowcase(){const section=$('#dynamicShowcase');if(!section)return;if(!state.showcaseOrder.length)buildShowcaseOrder();renderShowcase();if(!state.showcaseReady){state.showcaseReady=true;$('#showcasePrev').addEventListener('click',()=>moveShowcase(-1));$('#showcaseNext').addEventListener('click',()=>moveShowcase(1));$('#showcasePause').addEventListener('click',()=>{state.showcaseManualPause=!state.showcaseManualPause;updateShowcasePause();});$('#showcaseSurprise').addEventListener('click',()=>{const usage=window.LABDS.Core?.getSnapshot?.().labsUsed||{},least=Math.min(...window.LABDS.TOOLS.map(tool=>usage[tool.id]?.count||0)),pool=window.LABDS.TOOLS.filter(tool=>(usage[tool.id]?.count||0)===least);openTool(pool[Math.floor(secureRandom()*pool.length)]?.id);});$('#showcaseAll').addEventListener('click',()=>showCatalog('all'));let resizeTimer=0,lastSize=showcaseBatchSize();addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{const size=showcaseBatchSize();if(size!==lastSize){lastSize=size;state.showcaseBatchSize=size;renderShowcase();scheduleShowcase();}},260);});document.addEventListener('visibilitychange',updateShowcasePause);matchMedia('(prefers-reduced-motion: reduce)').addEventListener?.('change',updateShowcasePause);}updateShowcasePause();}
  function renderHome(){const all=$('#allTools');if(all)all.textContent='';filterCatalog();initShowcase();}
  function filterCatalog(){const query=expandedQuery($('#toolSearch')?.value||''),os=$('#osFilter')?.value||'all',level=$('#levelFilter')?.value||'all',experience=$('#experienceFilter')?.value||'all';const tools=window.LABDS.TOOLS.filter(tool=>{const expLabels=(tool.experiences||[]).map(id=>window.LABDS.EXPERIENCE_LABELS?.[id]||id).join(' '),text=normalizeSearch(`${tool.id} ${tool.shortName||''} ${tool.name} ${tool.description} ${(tool.tags||[]).join(' ')} ${(tool.os||[]).join(' ')} ${tool.runtimeLabel||''} ${window.LABDS.CATEGORY_LABELS[tool.category]||''} ${expLabels}`);const categoryOk=state.activeFilter==='featured'?tool.featured:state.activeFilter==='all'||tool.category===state.activeFilter;const experienceOk=experience==='all'||(tool.experiences||[]).includes(experience);return categoryOk&&experienceOk&&(os==='all'||tool.os.includes(os)||tool.os.includes('multi'))&&(level==='all'||tool.level===level)&&(!query||text.includes(query));});const all=$('#allTools');all.textContent='';tools.forEach(t=>all.appendChild(card(t)));$('#emptyTools').classList.toggle('hidden',tools.length>0);const count=$('#toolResultCount');if(count)count.textContent=`${tools.length} ${tools.length===1?'ferramenta encontrada':'ferramentas encontradas'}`;}
  function showCatalog(filter='all'){$('#homeSearchWrap')?.classList.remove('hidden');$('#catalogSection').classList.remove('hidden');state.activeFilter=filter;$$('.filter-chip').forEach(btn=>{const active=btn.dataset.filter===filter;btn.classList.toggle('active',active);btn.setAttribute('aria-selected',String(active));});filterCatalog();$('#catalogSection').scrollIntoView({behavior:'smooth',block:'start'});}
  async function loadModule(moduleName,tool){const lab=await window.LABDS.ResourceLoader.loadModule(moduleName,tool);state.loadedModules.add(moduleName);return lab;}

  function updateSessionHeader(){
    const session=window.LABDS.Session.get(),header=$('#sessionHeader');
    if(!session){header.classList.add('hidden');window.LABDS.Classroom?.update?.();return;}
    header.classList.remove('hidden');$('#sessionStudentName').textContent=session.studentName;$('#sessionStudentClass').textContent=session.studentClass;window.LABDS.Classroom?.update?.();
  }
  function populateStudentClasses(){const select=$('#studentClassSelect');select.textContent='';window.LABDS.STUDENT_CLASSES.forEach(value=>{const option=document.createElement('option');option.value=value;option.textContent=value;select.appendChild(option);});$('#studentPrivacyNotice').textContent=window.LABDS.SESSION_PRIVACY_NOTICE;}
  function requestIdentification(toolId=null){state.pendingToolId=toolId;$('#studentNameInput').value='';$('#studentClassSelect').value=window.LABDS.STUDENT_CLASSES[0];$('#otherClassField').classList.add('hidden');$('#studentFormError').classList.add('hidden');$('#studentDialog').showModal();setTimeout(()=>$('#studentNameInput').focus(),50);}

  function authorizationOptionsForTool(tool){
    if(!window.LABDS.EduAuth)return null;
    const params=new URLSearchParams(location.search),session=window.LABDS.Session.get()||{};
    const actionId=params.get('eduauthAction');
    if(actionId&&params.get('tool')===tool.id&&window.LABDS.EduAuth.actions[actionId])return{actionId,resourceId:params.get('activity')||tool.id,resourceLabel:tool.name,classId:params.get('classId')||session.studentClass,subjectId:params.get('subjectId')||'desenvolvimento-de-sistemas',lessonId:params.get('lessonId')||'atividade-atual',activityId:params.get('activityId')||'atividade-principal'};
    return null;
  }

  async function openTool(id){
    if(isRemovedToolId(id)){
      window.LABDS.Storage?.smallRemove?.('lastTool');
      const url=new URL(location.href);url.searchParams.delete('tool');history.replaceState(null,'',url);
      toast('Este módulo foi removido da versão pública e não pode ser aberto.','warning',5200);
      return;
    }
    const tool=window.LABDS.TOOLS.find(item=>item.id===id);if(!tool)return toast('Ferramenta não encontrada.','error');clearTimeout(state.showcaseTimer);
    if(!window.LABDS.Session.get()){requestIdentification(id);return;}
    const snapshot=window.LABDS.Core?.getSnapshot?.();
    if((tool.experiences||[]).includes('game')&&snapshot?.settings?.studyGateGames){if((snapshot.wallet?.arcadeMinutes||0)<=0){toast('O modo estudo protegido está ativo. Adquira minutos Arcade na Loja Tech.','warning',5600);await ensureBundle('shell');window.LABDS.V3Shell?.openPanel?.('store');scheduleShowcase();return;}clearInterval(state.arcadeTimer);state.arcadeTimer=setInterval(()=>{if(!window.LABDS.Core?.consumeArcadeMinute?.(`Jogo: ${tool.name}`)){clearInterval(state.arcadeTimer);state.arcadeTimer=0;toast('Os minutos Arcade terminaram. O jogo foi pausado e você voltou às ferramentas.','warning',6000);goHome(true);}},60000);}
    const authParams=new URLSearchParams(location.search),needsEduAuth=tool.module==='vm-lab'||(authParams.get('eduauthAction')&&authParams.get('tool')===tool.id);
    if(needsEduAuth)await ensureBundle('eduauth');
    const authorization=authorizationOptionsForTool(tool);
    if(authorization&&!(await window.LABDS.EduAuth.authorize(authorization))){toast('A ferramenta não foi aberta porque a autorização não foi concluída.','warning',4800);scheduleShowcase();return;}
    state.currentTool=tool;window.LABDS.Storage.smallSet('lastTool',id);window.LABDS.Session.registerLab(tool);updateSessionHeader();document.body.classList.toggle('immersive-lab',Boolean(tool.immersive));$('#labScreen')?.classList.toggle('immersive-tool',Boolean(tool.immersive));
    if(tool.type==='terminal'){showScreen('terminal');try{await Promise.all([ensureBundle('terminal'),ensureBundle('export'),tool.learningModes===false?Promise.resolve():ensureBundle('learning')]);await window.LABDS.Terminal.open(tool.id);document.dispatchEvent(new CustomEvent('labds:toolopen',{detail:{tool}}));}catch(error){toast(error.message,'error');goHome();}return;}
    showScreen('lab');$('#labTitle').textContent=tool.name;$('#labDescription').textContent=tool.description;$('#labEyebrow').textContent=(window.LABDS.CATEGORY_LABELS[tool.category]||'LABORATÓRIO').toUpperCase();$('#labBreadcrumbCurrent').textContent=tool.shortName||tool.name;$('#labRuntimeBadge').textContent=tool.runtimeLabel;$('#labRuntimeBadge').className=`runtime-badge ${runtimeClass(tool.runtime)}`;$('#labLoading').classList.remove('hidden');$('#labHost').textContent='';if(state.currentLab?.unmount){try{await state.currentLab.unmount();}catch{}}
    state.currentLab=null;
    try{const [lab]=await Promise.all([loadModule(tool.module,tool),ensureBundle('export'),tool.learningModes===false||tool.immersive?Promise.resolve():ensureBundle('learning')]);state.currentLab=lab;await lab.mount($('#labHost'),{tool,toast,storage:window.LABDS.Session.scopedStorage(window.LABDS.Storage),exporter:window.LABDS.Exporter,session:window.LABDS.Session,core:window.LABDS.Core,eduauth:window.LABDS.EduAuth,logEvent:data=>window.LABDS.Session.record({laboratoryId:tool.id,laboratoryName:tool.name,...data})});$('#labLoading').classList.add('hidden');document.dispatchEvent(new CustomEvent('labds:toolopen',{detail:{tool}}));}
    catch(error){$('#labLoading').classList.add('hidden');window.LABDS.Session.record({laboratoryId:tool.id,laboratoryName:tool.name,eventType:'error',action:'Falha ao abrir laboratório',status:'error',error:error.message});const failure=document.createElement('div');failure.className='lab-error-state';const strong=document.createElement('strong');strong.textContent='Não foi possível abrir este laboratório.';const p=document.createElement('p');p.textContent=error.message;const button=document.createElement('button');button.className='btn primary';button.type='button';button.textContent='Tentar novamente';button.addEventListener('click',()=>openTool(id));failure.append(strong,p,button);$('#labHost').appendChild(failure);toast(error.message,'error',5000);}
  }

  async function goHome(openCatalogAfter=false){clearInterval(state.arcadeTimer);state.arcadeTimer=0;window.LABDS.Terminal?.cancelOperation(false);if(state.currentLab?.unmount){try{await state.currentLab.unmount();}catch{}}if(state.currentTool&&window.LABDS.Session.get())window.LABDS.Session.record({laboratoryId:state.currentTool.id,laboratoryName:state.currentTool.name,eventType:'laboratory',action:'Laboratório fechado',status:'success'});document.dispatchEvent(new CustomEvent('labds:toolclose'));state.currentLab=null;state.currentTool=null;document.body.classList.remove('immersive-lab');$('#labScreen')?.classList.remove('immersive-tool');showScreen('home');document.body.removeAttribute('data-terminal-theme');if(openCatalogAfter){showCatalog('all');}else{$('#homeSearchWrap')?.classList.add('hidden');$('#catalogSection')?.classList.add('hidden');scheduleShowcase();}if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});}
  function currentExportPayload(){if(state.currentTool?.type==='terminal')return window.LABDS.Terminal.exportPayload();return state.currentLab?.exportPayload?state.currentLab.exportPayload():{text:'Nenhum conteúdo disponível.',native:'',backup:{}};}
  async function openExport(){if(!state.currentTool)return;await ensureExportTools();$('#exportDialogDescription').textContent=`${state.currentTool.name} — escolha como deseja salvar a sessão.`;$('#nativeExportExtension').textContent=`.${String(state.currentTool.extension||'txt').toUpperCase()}`;$('#nativeExportName').textContent=`Arquivo ${state.currentTool.extension||'txt'}`;$('#nativeExportHelp').textContent='Formato próprio ou mais adequado para esta ferramenta.';$('#exportDialog').showModal();}
  async function exportCurrent(format){try{await ensureExportTools();if(format==='native'&&state.currentLab?.exportNative)await state.currentLab.exportNative();else window.LABDS.Exporter.exportTextPackage(state.currentTool,currentExportPayload(),format);window.LABDS.Session.record({laboratoryId:state.currentTool.id,laboratoryName:state.currentTool.name,eventType:'export',action:`Artefato exportado em ${format.toUpperCase()}`,status:'success',context:{format}});if(!window.LABDS.Classroom?.isReady?.())window.LABDS.Classroom?.markExported?.({toolId:state.currentTool.id,toolName:state.currentTool.name,filename:`${state.currentTool.shortName||state.currentTool.id}-${format}`,format});toast(format==='pdf'?'Relatório aberto para salvar como PDF.':'Arquivo exportado.','success');$('#exportDialog').close();setTimeout(()=>window.LABDS.Classroom?.prompt?.(),240);}catch(error){toast(error.message,'error',5000);}}
  function openHelp(){const tool=state.currentTool;if(!tool)return;$('#helpDialogTitle').textContent=tool.name;const content=$('#helpDialogContent');content.textContent='';const p=document.createElement('p');p.textContent=window.LABDS.RUNTIME_HELP[tool.runtime]||'';const list=document.createElement('ul');['Explore livremente: não há pontuação nem sequência obrigatória.','Use Restaurar para voltar ao estado inicial.','Os dados desta prática são isolados pela sessão do estudante.','Recursos de sistema e rede são simulados e nunca acessam o equipamento real.'].forEach(text=>{const li=document.createElement('li');li.textContent=text;list.appendChild(li);});content.append(p,list);if(state.currentLab?.help){const custom=document.createElement('div');custom.className='custom-help';const template=document.createElement('template');template.innerHTML=String(state.currentLab.help()||'');template.content.querySelectorAll('script,iframe,object,embed,form,link,meta').forEach(node=>node.remove());template.content.querySelectorAll('*').forEach(node=>[...node.attributes].forEach(attr=>{if(/^on/i.test(attr.name)||['srcdoc'].includes(attr.name))node.removeAttribute(attr.name);}));custom.appendChild(template.content.cloneNode(true));content.appendChild(custom);}$('#helpDialog').showModal();}

  function renderHistory(){
    const session=window.LABDS.Session.get();
    if(!session)return toast('Não há sessão ativa.','warning');
    const sum=window.LABDS.Session.summary(session);
    $('#historyTitle').textContent=`${session.studentName} — ${session.studentClass}`;
    $('#historySummary').textContent=`Início: ${new Date(session.startedAt).toLocaleString('pt-BR')} • ${formatDuration(sum.duration)} • ${sum.actions} ações`;

    const labSelect=$('#historyLabFilter'),selected=labSelect.value;
    labSelect.innerHTML='<option value="all">Todos os laboratórios</option>';
    session.labsUsed.forEach(lab=>{
      const option=document.createElement('option');
      option.value=lab.id;option.textContent=lab.name;labSelect.appendChild(option);
    });
    if([...labSelect.options].some(option=>option.value===selected))labSelect.value=selected;

    const events=window.LABDS.Session.filteredEvents({
      lab:labSelect.value,
      type:$('#historyTypeFilter').value,
      query:$('#historySearch').value
    });
    const host=$('#historyTimeline');host.textContent='';
    if(!events.length){
      const empty=document.createElement('div');empty.className='history-empty';
      empty.textContent='Nenhuma ação encontrada com esses filtros.';host.appendChild(empty);return;
    }

    events.forEach(event=>{
      const details=document.createElement('details');details.className='history-event';details.dataset.status=event.status;
      const summary=document.createElement('summary'),time=document.createElement('time'),lab=document.createElement('b'),action=document.createElement('span'),status=document.createElement('em');
      time.textContent=new Date(event.timestamp).toLocaleTimeString('pt-BR');lab.textContent=event.laboratoryName;action.textContent=event.action;status.textContent=event.status;
      summary.append(time,lab,action,status);
      const body=document.createElement('div');body.className='history-event-body';
      [['Entrada',event.input],['Saída',event.output],['Erro',event.error],['Contexto',Object.keys(event.context||{}).length?JSON.stringify(event.context,null,2):'']].forEach(([title,value])=>{
        if(!value)return;
        const label=document.createElement('b');label.textContent=title;
        const pre=document.createElement('pre');pre.textContent=String(value);
        body.append(label,pre);
      });
      const copy=document.createElement('button');copy.type='button';copy.className='btn subtle history-copy-item';copy.textContent='Copiar item';
      copy.addEventListener('click',click=>{
        click.preventDefault();click.stopPropagation();
        const text=[
          `[${new Date(event.timestamp).toLocaleString('pt-BR')}] ${event.laboratoryName}`,
          event.action,
          event.input&&`Entrada:\n${event.input}`,
          event.output&&`Saída:\n${event.output}`,
          event.error&&`Erro:\n${event.error}`
        ].filter(Boolean).join('\n\n');
        navigator.clipboard?.writeText(text).then(()=>toast('Item copiado.','success')).catch(()=>toast('Não foi possível copiar o item.','error'));
      });
      body.appendChild(copy);details.append(summary,body);host.appendChild(details);
    });
  }
  async function openHistory(){await ensureExportTools();renderHistory();$('#historyDialog').showModal();}
  function renderFinish(){const session=window.LABDS.Session.get();if(!session)return;const sum=window.LABDS.Session.summary(session);$('#finishSummary').textContent=`${session.studentName} • ${session.studentClass} • sessão ${session.sessionId}`;const values=[['Duração',formatDuration(sum.duration)],['Laboratórios',sum.laboratories],['Ações',sum.actions],['Comandos',sum.commands],['Execuções',sum.executions],['Arquivos',sum.files],['Erros',sum.errors],['Testes',sum.tests]];const host=$('#finishStats');host.textContent='';values.forEach(([label,value])=>{const div=document.createElement('div');div.className='finish-stat';const span=document.createElement('span'),b=document.createElement('b');span.textContent=label;b.textContent=value;div.append(span,b);host.appendChild(div);});}
  function openFinish(){if(!window.LABDS.Session.get())return;renderFinish();$('#finishSessionDialog').showModal();}
  function openSessionInfo(){const session=window.LABDS.Session.get();if(!session)return;const sum=window.LABDS.Session.summary(session),host=$('#sessionInfoContent');host.textContent='';[['Estudante',session.studentName],['Turma',session.studentClass],['Sessão',session.sessionId],['Início',new Date(session.startedAt).toLocaleString('pt-BR')],['Tempo',formatDuration(sum.duration)],['Ações',sum.actions]].forEach(([a,b])=>{const row=document.createElement('div');row.className='session-info-row';const span=document.createElement('span'),strong=document.createElement('strong');span.textContent=a;strong.textContent=b;row.append(span,strong);host.appendChild(row);});$('#sessionInfoDialog').showModal();}

  async function exportSession(format){
    await ensureExportTools();
    const session=window.LABDS.Session.get();if(!session)return toast('Não há sessão ativa.','warning');state.exportAbort=new AbortController();$('#exportProgressBar').style.width='0%';$('#exportProgressText').textContent='Iniciando...';$('#exportProgressDialog').showModal();let completed=false;
    try{await window.LABDS.SessionExporter.exportFormat(format,session,{signal:state.exportAbort.signal,onProgress:(value,text)=>{$('#exportProgressBar').style.width=`${value}%`;$('#exportProgressText').textContent=text;}});completed=true;if(!window.LABDS.Classroom?.isReady?.())window.LABDS.Classroom?.markExported?.({toolId:'session',toolName:'Relatório da sessão',filename:`sessao-${session.sessionId}.${format}`,format});toast(`Sessão exportada em ${format.toUpperCase()}.`,'success',4200);renderHistory();}
    catch(error){if(error.name==='AbortError')toast('Exportação cancelada.','warning');else toast(`Falha na exportação: ${error.message}`,'error',6000);}
    finally{state.exportAbort=null;$('#exportProgressDialog').close();if(completed)setTimeout(()=>window.LABDS.Classroom?.prompt?.(),240);}
  }

  function setTheme(theme){if(window.LABDS.Accessibility)window.LABDS.Accessibility.set({theme});else{document.documentElement.dataset.theme=theme;window.LABDS.Storage.smallSet('theme',theme);$('#themeToggle').textContent=theme==='light'?'◑':'◐';}}
  function bind(){
    $$('[data-home-link]').forEach(el=>el.addEventListener('click',event=>{event.preventDefault();goHome();}));$('#allToolsBtn')?.addEventListener('click',()=>showCatalog('all'));$('#showAllInlineBtn')?.addEventListener('click',()=>showCatalog('all'));$('#heroExploreBtn')?.addEventListener('click',()=>showCatalog('all'));$$('[data-home-goal]').forEach(button=>button.addEventListener('click',()=>{const goal=button.dataset.homeGoal;if(goal==='simulators')showCatalog('all');if(goal==='tutorials')openTool('tutorial-center');if(goal==='explore')openTool('tech-explorer');}));$('#closeCatalogBtn')?.addEventListener('click',()=>{$('#homeSearchWrap')?.classList.add('hidden');$('#catalogSection')?.classList.add('hidden');document.querySelector('.goal-selector')?.scrollIntoView({behavior:'smooth',block:'start'});});$('#toolSearch').addEventListener('input',()=>{if($('#catalogSection').classList.contains('hidden'))showCatalog(state.activeFilter||'all');filterCatalog();});$('#searchToggle').addEventListener('click',()=>{showCatalog('all');$('#toolSearch').focus();$('#toolSearch').scrollIntoView({behavior:'smooth',block:'center'});});$('#toolSearch').addEventListener('focus',()=>{$('#homeSearchWrap')?.classList.remove('hidden');$('#catalogSection').classList.remove('hidden');});$$('.filter-chip').forEach(button=>button.addEventListener('click',()=>{state.activeFilter=button.dataset.filter;$$('.filter-chip').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});$('#homeSearchWrap')?.classList.remove('hidden');$('#catalogSection').classList.remove('hidden');filterCatalog();}));$('#osFilter').addEventListener('change',filterCatalog);$('#levelFilter').addEventListener('change',filterCatalog);$('#experienceFilter')?.addEventListener('change',filterCatalog);$('#clearCatalogFilters')?.addEventListener('click',()=>{$('#toolSearch').value='';$('#osFilter').value='all';$('#levelFilter').value='all';$('#experienceFilter').value='all';showCatalog('all');});if(!window.LABDS.Accessibility)$('#themeToggle').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='light'?'dark':'light'));$('#terminalExportBtn').addEventListener('click',openExport);$('#labExportBtn').addEventListener('click',openExport);$('#labHelpBtn').addEventListener('click',openHelp);$('#labFullscreenBtn').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await $('.lab-shell').requestFullscreen();else await document.exitFullscreen();}catch{}});$('#labBackCatalogBtn')?.addEventListener('click',()=>goHome(true));$('#labHomeBtn')?.addEventListener('click',()=>goHome(false));$('#labBreadcrumbHome')?.addEventListener('click',()=>goHome(false));$('#labBreadcrumbCatalog')?.addEventListener('click',()=>goHome(true));$$('[data-catalog-link]').forEach(button=>button.addEventListener('click',()=>goHome(true)));$$('#exportDialog [data-export-format]').forEach(button=>button.addEventListener('click',()=>exportCurrent(button.dataset.exportFormat)));
    $('#networkProfileBtn').addEventListener('click',()=>{const select=$('#terminalNetworkProfile');select.textContent='';Object.entries(window.LABDS.NetworkEngine.profiles).forEach(([value,item])=>{const option=document.createElement('option');option.value=value;option.textContent=item.label;select.appendChild(option);});const terminalState=window.LABDS.Terminal.getState();select.value=terminalState.networkProfile;$('#terminalNetworkSeed').value=terminalState.networkSeed||'';$('#networkProfileDialog').showModal();});$('#saveNetworkProfileBtn').addEventListener('click',()=>{window.LABDS.Terminal.setNetworkProfile($('#terminalNetworkProfile').value,$('#terminalNetworkSeed').value.trim());toast('Perfil de rede aplicado.','success');});
    document.addEventListener('keydown',event=>{if(event.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){event.preventDefault();showCatalog('all');$('#toolSearch').focus();}if(event.key==='Escape'&&screens.lab.classList.contains('active'))goHome();const focusable=[...document.querySelectorAll('.screen.active .goal-card:not([disabled]), .screen.active .tool-card-button:not([disabled])')];const index=focusable.indexOf(document.activeElement);if(index>=0&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();const columns=innerWidth>=1100?3:innerWidth>=680?2:1;const delta=event.key==='ArrowLeft'?-1:event.key==='ArrowRight'?1:event.key==='ArrowUp'?-columns:columns;focusable[Math.max(0,Math.min(focusable.length-1,index+delta))]?.focus();}});$('#resumeToolBtn').addEventListener('click',()=>openTool(window.LABDS.Storage.smallGet('lastTool')));$('#appVersionBadge')?.addEventListener('click',openVersionDialog);$('#homeVersionStatusBtn')?.addEventListener('click',openVersionDialog);$('#versionRefreshBtn')?.addEventListener('click',()=>refreshVersionControl({announce:true}));
    $('#backupAllBtn').addEventListener('click',async()=>{await ensureExportTools();const payload=await window.LABDS.Storage.dump();window.LABDS.Exporter.download(JSON.stringify(payload,null,2),`laboratorio-virtual-ds-backup-${new Date().toISOString().slice(0,10)}.json`,'application/json;charset=utf-8');toast('Backup completo exportado.','success');});$('#restoreAllBtn').addEventListener('click',()=>$('#restoreAllFile').click());$('#restoreAllFile').addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;try{if(file.size>20*1024*1024)throw new Error('O backup excede 20 MB.');const result=await window.LABDS.Storage.restore(JSON.parse(await file.text()));toast(`Backup restaurado (${result.restored||0} itens). Recarregando...`,'success');setTimeout(()=>location.reload(),700);}catch(error){toast(error.message,'error');}event.target.value='';});$('#clearAllDataBtn').addEventListener('click',async()=>{if(confirm('Excluir todos os arquivos virtuais, códigos, sessões e preferências deste navegador?')){await window.LABDS.Storage.clearAll();Object.keys(localStorage).filter(key=>key.startsWith('labds.')).forEach(key=>localStorage.removeItem(key));toast('Dados locais removidos.','success');setTimeout(()=>location.reload(),600);}});

    $('#studentClassSelect').addEventListener('change',()=>$('#otherClassField').classList.toggle('hidden',$('#studentClassSelect').value!=='Outra turma'));$('#studentCancelBtn').addEventListener('click',()=>{$('#studentDialog').close();state.pendingToolId=null;});$('#studentForm').addEventListener('submit',event=>{event.preventDefault();try{const turma=$('#studentClassSelect').value==='Outra turma'?$('#otherClassInput').value:$('#studentClassSelect').value;window.LABDS.Session.create($('#studentNameInput').value,turma);$('#studentDialog').close();updateSessionHeader();window.LABDS.Core?.syncSession?.();const pending=state.pendingToolId;state.pendingToolId=null;if(pending)openTool(pending);}catch(error){$('#studentFormError').textContent=error.message;$('#studentFormError').classList.remove('hidden');}});
    $('#sessionHistoryBtn').addEventListener('click',openHistory);$('#sessionExportBtn').addEventListener('click',openHistory);$('#sessionFinishBtn').addEventListener('click',openFinish);$('#sessionIdentityBtn').addEventListener('click',openSessionInfo);$('#historySearch').addEventListener('input',renderHistory);$('#historyLabFilter').addEventListener('change',renderHistory);$('#historyTypeFilter').addEventListener('change',renderHistory);$('#copyHistoryBtn').addEventListener('click',async()=>{await ensureExportTools();const text=window.LABDS.SessionExporter.textReport(window.LABDS.Session.get());navigator.clipboard?.writeText(text).then(()=>toast('Histórico copiado.','success')).catch(()=>toast('Não foi possível copiar.','error'));});$$('[data-session-export]').forEach(button=>button.addEventListener('click',()=>exportSession(button.dataset.sessionExport)));$('#cancelSessionExportBtn').addEventListener('click',()=>state.exportAbort?.abort());
    $('#finishKeepBtn').addEventListener('click',async()=>{if(!confirm('Finalizar esta sessão e manter uma cópia local do histórico?'))return;await window.LABDS.Session.finalize('Finalizada',{clearPersonal:false});$('#finishSessionDialog').close();await goHome();updateSessionHeader();toast('Sessão finalizada e arquivada localmente.','success');});$('#finishClearBtn').addEventListener('click',async()=>{if(!confirm('Finalizar e apagar os dados pessoais e o ambiente desta sessão? Esta ação não pode ser desfeita.'))return;await window.LABDS.Session.finalize('Finalizada e limpa',{clearPersonal:true});$('#finishSessionDialog').close();await goHome();updateSessionHeader();toast('Sessão finalizada e dados pessoais removidos.','success');});$('#switchStudentBtn').addEventListener('click',async()=>{if(!confirm('Finalizar a sessão atual antes de trocar o estudante? O histórico será mantido localmente até ser limpo.'))return;await window.LABDS.Session.finalize('Finalizada por troca de estudante',{clearPersonal:false});$('#sessionInfoDialog').close();await goHome();updateSessionHeader();requestIdentification(null);});
    $('#restoreContinueBtn').addEventListener('click',async()=>{await window.LABDS.Session.continueSaved();$('#restoreSessionDialog').close();updateSessionHeader();toast('Sessão anterior restaurada.','success');});$('#restoreDiscardBtn').addEventListener('click',async()=>{if(!confirm('Descartar e apagar completamente a sessão encontrada?'))return;await window.LABDS.Session.discardSaved(true);$('#restoreSessionDialog').close();updateSessionHeader();toast('Sessão anterior removida.','success');});$('#restoreExportBtn').addEventListener('click',async()=>{try{await exportSession('zip');await window.LABDS.Session.discardSaved(true);$('#restoreSessionDialog').close();updateSessionHeader();toast('Sessão exportada e removida deste navegador.','success');}catch{}});
    document.addEventListener('labds:sessionchange',updateSessionHeader);window.addEventListener('beforeunload',()=>window.LABDS.Session.persist());window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();state.deferredInstall=event;$('#installAppBtn').classList.remove('hidden');});$('#installAppBtn').addEventListener('click',async()=>{if(!state.deferredInstall)return;state.deferredInstall.prompt();await state.deferredInstall.userChoice;state.deferredInstall=null;$('#installAppBtn').classList.add('hidden');});
  }

  async function registerServiceWorker(){
    try{
      const registration=await navigator.serviceWorker.register('./service-worker.js');
      const notify=worker=>{if(!worker)return;const bar=$('#updateBanner');bar?.classList.remove('hidden');$('#updateNowBtn')?.addEventListener('click',()=>worker.postMessage({type:'SKIP_WAITING'}),{once:true});};
      if(registration.waiting)notify(registration.waiting);
      registration.addEventListener('updatefound',()=>{const worker=registration.installing;if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed'&&navigator.serviceWorker.controller)notify(worker);});});
      navigator.serviceWorker.addEventListener('controllerchange',()=>location.reload());
      $('#checkUpdateBtn')?.addEventListener('click',async()=>{await registration.update();toast('Verificação de atualização concluída.','success');});
    }catch(error){console.warn('Service Worker não registrado:',error);}
  }

  document.addEventListener('labds:moduleloadstart',event=>{const loading=$('#labLoading');if(!loading)return;const manifest=event.detail?.manifest||{};loading.querySelector('strong').textContent=`Preparando ${event.detail?.tool?.shortName||event.detail?.tool?.name||'laboratório'}...`;loading.querySelector('small').textContent=manifest.weight==='heavy'?'Módulo avançado: os arquivos maiores serão carregados somente agora.':'Carregamento modular sob demanda.';});
  document.addEventListener('labds:moduleloadend',event=>{const loading=$('#labLoading');if(loading)loading.querySelector('small').textContent=`Módulo pronto em ${event.detail?.durationMs||0} ms.`;});

  async function init(){await cleanupRemovedFeatures();await window.LABDS.Core?.init?.();window.LABDS.Accessibility?.init?.();renderVersionControl();refreshVersionControl();clearInterval(state.versionTimer);state.versionTimer=setInterval(renderVersionControl,60000);if(!window.LABDS.Accessibility)setTheme(window.LABDS.Storage.smallGet('theme',matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'));populateStudentClasses();renderHome();bind();await window.LABDS.Session.init();if(window.LABDS.Session.hasRestorable())$('#restoreSessionDialog').showModal();const resume=$('#resumeToolBtn'),last=window.LABDS.Storage.smallGet('lastTool'),lastTool=window.LABDS.TOOLS.find(tool=>tool.id===last);if(lastTool&&!isRemovedToolId(last)){resume?.classList.remove('hidden');if(resume)resume.textContent=`Retomar ${lastTool.shortName}`;}else{window.LABDS.Storage.smallRemove('lastTool');resume?.classList.add('hidden');}const rawRequested=new URLSearchParams(location.search).get('tool'),requested=resolveRequestedTool(rawRequested);if(rawRequested&&isRemovedToolId(rawRequested)){const url=new URL(location.href);url.searchParams.delete('tool');history.replaceState(null,'',url);toast('O módulo solicitado foi removido e está indisponível.','warning',5200);}else if(rawRequested&&requested!==rawRequested){const url=new URL(location.href);url.searchParams.set('tool',requested);history.replaceState(null,'',url);toast('O recurso antigo foi removido. A Central de Ajuda foi aberta como alternativa leve.','info',5200);}if(requested&&!isRemovedToolId(rawRequested)&&window.LABDS.TOOLS.some(tool=>tool.id===requested)&&!window.LABDS.Session.hasRestorable())setTimeout(()=>openTool(requested),100);if('serviceWorker'in navigator&&location.protocol.startsWith('http'))registerServiceWorker();}
  window.LABDS.App={init,openTool,goHome,toast,showCatalog,getState:()=>state,openHistory,openFinish,cleanupRemovedFeatures,resolveRequestedTool,isRemovedToolId};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
