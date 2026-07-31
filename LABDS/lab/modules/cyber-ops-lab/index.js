'use strict';

(function(){
  window.LABDS=window.LABDS||{};
  window.LABDS_LABS=window.LABDS_LABS||{};

  const MODULE_ID='cyber-ops-lab';
  const MESSAGE_SOURCE='cyber-ops-shadow-grid';
  let root=null,ctx=null,frame=null,statusText=null,progressText=null,messageHandler=null;
  let latestSummary=null,lastMissionEventKey='',ready=false,contextApplied=false,pendingCommands=new Map();

  function escapeHtml(value=''){
    return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  }

  function ensureStyles(){
    if(document.getElementById('cyberOpsLabStyles'))return;
    const style=document.createElement('style');
    style.id='cyberOpsLabStyles';
    style.textContent=`
      .cyber-ops-lab{display:grid;gap:12px;min-width:0}
      .cyber-ops-integration-bar{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 14px;border:1px solid color-mix(in srgb,var(--accent,#47d7ff) 28%,transparent);border-radius:16px;background:linear-gradient(135deg,rgba(8,22,38,.94),rgba(5,14,26,.86));box-shadow:0 16px 40px rgba(0,0,0,.18)}
      .cyber-ops-integration-copy{display:grid;gap:3px;min-width:0}.cyber-ops-integration-copy strong{font-size:.95rem}.cyber-ops-integration-copy span{font-size:.8rem;opacity:.78;white-space:normal}
      .cyber-ops-integration-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}
      .cyber-ops-status{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border-radius:999px;background:rgba(50,210,160,.12);border:1px solid rgba(50,210,160,.28);font-size:.78rem;font-weight:700}
      .cyber-ops-status::before{content:'';width:8px;height:8px;border-radius:50%;background:#f3c969;box-shadow:0 0 14px currentColor}.cyber-ops-status.is-ready::before{background:#49e1a8}.cyber-ops-status.is-error::before{background:#ff6d7b}
      .cyber-ops-frame-shell{position:relative;min-height:720px;border-radius:18px;overflow:hidden;border:1px solid rgba(98,205,255,.22);background:#020712;box-shadow:0 24px 70px rgba(0,0,0,.28)}
      .cyber-ops-frame{display:block;width:100%;height:max(720px,calc(100dvh - 190px));border:0;background:#020712}
      .cyber-ops-loading{position:absolute;inset:0;display:grid;place-items:center;background:radial-gradient(circle at 50% 20%,rgba(20,95,130,.28),transparent 45%),#020712;z-index:2;transition:opacity .25s ease,visibility .25s ease}.cyber-ops-loading.hidden{opacity:0;visibility:hidden;pointer-events:none}
      .cyber-ops-loading-card{display:grid;gap:12px;text-align:center;max-width:360px;padding:24px}.cyber-ops-loader{width:68px;height:68px;margin:auto;border:2px solid rgba(90,220,255,.2);border-top-color:#58ddff;border-radius:50%;animation:cyberOpsSpin 1s linear infinite}
      @keyframes cyberOpsSpin{to{transform:rotate(360deg)}}
      @media(max-width:760px){.cyber-ops-integration-bar{align-items:flex-start;flex-direction:column}.cyber-ops-integration-actions{justify-content:flex-start}.cyber-ops-frame-shell{min-height:690px;border-radius:12px}.cyber-ops-frame{height:max(690px,calc(100dvh - 150px))}}
    `;
    document.head.appendChild(style);
  }

  function currentSession(){return ctx?.session?.get?.()||null;}
  function codename(session){
    const initials=String(session?.studentName||'AGENTE').split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join('').toUpperCase()||'AG';
    const suffix=String(session?.sessionId||'0000').replace(/-/g,'').slice(-4).toUpperCase();
    return `${initials}-${suffix}`.slice(0,24);
  }
  function moduleUrl(){
    const session=currentSession();
    const version=encodeURIComponent(window.LABDS.VERSION||'4.0.0-pages');
    const sid=encodeURIComponent(session?.sessionId||'sem-sessao');
    return `modules/cyber-ops/index.html?embedded=1&v=${version}#session=${sid}`;
  }
  function post(type,payload={},extra={}){
    if(!frame?.contentWindow)return;
    frame.contentWindow.postMessage({source:'lab-virtual-ds',type,payload,...extra},location.origin==='null'?'*':location.origin);
  }
  function sendContext(){
    const session=currentSession();
    if(!session)return;
    post('context',{
      sessionId:session.sessionId,
      profile:{name:session.studentName,className:session.studentClass,code:codename(session)},
      classroomUrl:window.LABDS.CLASSROOM_DEFAULT_URL,
      reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,
      performanceProfile:window.LABDS.PerformanceManager?.getSnapshot?.().profile||'balanced',
      sound:true,
      applicationVersion:window.LABDS.VERSION
    });
  }
  function updateStatus(label,className=''){
    if(!statusText)return;
    statusText.textContent=label;
    statusText.className=`cyber-ops-status ${className}`.trim();
  }
  function renderProgress(summary){
    if(!progressText||!summary)return;
    const completed=Number(summary.completedCount||0),total=Number(summary.totalMissions||6),score=Number(summary.totalScore||0),badges=Number(summary.badgeCount||0);
    progressText.textContent=`${completed}/${total} missões • ${score.toLocaleString('pt-BR')} pontos • ${badges} emblema(s) • ${summary.role||'Recruta Digital'}`;
  }
  function logLatest(summary){
    const latest=summary?.latest;if(!latest)return;
    const key=`${latest.missionId||''}|${latest.completedAt||''}|${latest.status||''}`;
    if(!latest.completedAt||key===lastMissionEventKey)return;
    lastMissionEventKey=key;
    const mission=latest.mission||{};
    ctx?.logEvent?.({
      eventType:'mission',
      action:`Missão ${latest.status==='Concluída'?'concluída':'encerrada'}: ${mission.title||mission.code||latest.missionId}`,
      status:latest.status==='Concluída'?'success':'error',
      output:`Pontuação ${latest.score||0}; precisão ${latest.accuracy||0}%; tempo ${latest.timeLabel||'—'}; classificação ${latest.rank||'—'}.`,
      context:{
        missionId:latest.missionId,moduleId:mission.moduleId||'',moduleTitle:mission.moduleTitle||'',difficulty:latest.difficulty||summary.difficulty,
        score:latest.score||0,accuracy:latest.accuracy||0,hints:latest.hints||0,attempts:latest.attempts||0,threat:latest.threat||0,
        badgesUnlocked:latest.badgesUnlocked||[],completedCount:summary.completedCount,totalScore:summary.totalScore
      }
    });
    if(Array.isArray(latest.badgesUnlocked)&&latest.badgesUnlocked.length){
      ctx?.logEvent?.({eventType:'achievement',action:'Emblemas Cyber Ops desbloqueados',status:'success',output:latest.badgesUnlocked.join(', '),context:{badges:latest.badgesUnlocked}});
    }
  }
  function handleMessage(event){
    if(!frame||event.source!==frame.contentWindow)return;
    if(location.origin!=='null'&&event.origin!==location.origin)return;
    const message=event.data||{};if(message.source!==MESSAGE_SOURCE)return;
    if(message.type==='ready'){
      ready=true;updateStatus('Módulo conectado','is-ready');
      root?.querySelector('.cyber-ops-loading')?.classList.add('hidden');
      sendContext();post('request-state');
      ctx?.logEvent?.({eventType:'integration',action:'Ponte do Cyber Ops conectada',status:'success',context:{version:message.payload?.version||'6.1'}});
    }
    if(message.type==='context-applied'){
      contextApplied=true;
      updateStatus('Sessão sincronizada','is-ready');
    }
    if(message.type==='state'){
      latestSummary=message.payload||null;
      renderProgress(latestSummary);
      if(!contextApplied){
        const latest=latestSummary?.latest;
        if(latest?.completedAt)lastMissionEventKey=`${latest.missionId||''}|${latest.completedAt}|${latest.status||''}`;
      }else logLatest(latestSummary);
    }
    if(message.type==='export'){
      const file=message.payload?.filename||'arquivo Cyber Ops';
      ctx?.logEvent?.({eventType:'export',action:'Evidência exportada no Cyber Ops',status:'success',output:file,context:message.payload||{}});
      ctx?.toast?.('Evidência do Cyber Ops gerada.','success');
    }
    if(message.type==='command-complete'){
      const pending=pendingCommands.get(message.payload?.requestId||'');
      if(pending){clearTimeout(pending.timer);pending.resolve(message.payload);pendingCommands.delete(message.payload.requestId);}
    }
  }
  function command(type,payload={}){
    return new Promise((resolve,reject)=>{
      if(!ready)return reject(new Error('O Cyber Ops ainda não terminou de carregar.'));
      const requestId=globalThis.crypto?.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random()}`;
      const timer=setTimeout(()=>{pendingCommands.delete(requestId);reject(new Error('O Cyber Ops não respondeu ao comando de exportação.'));},6000);
      pendingCommands.set(requestId,{resolve,reject,timer});post(type,payload,{requestId});
    });
  }
  function template(){
    return `<div class="cyber-ops-lab">
      <section class="cyber-ops-integration-bar" aria-label="Integração do Cyber Ops">
        <div class="cyber-ops-integration-copy"><strong>Shadow Grid conectado ao Lab Virtual DS</strong><span id="cyberOpsProgress">Preparando missões, progresso e evidências da sessão atual.</span></div>
        <div class="cyber-ops-integration-actions"><span id="cyberOpsStatus" class="cyber-ops-status">Inicializando</span><button id="cyberOpsReload" class="btn secondary" type="button">Recarregar módulo</button><button id="cyberOpsFullscreen" class="btn secondary" type="button">Tela cheia</button></div>
      </section>
      <div class="cyber-ops-frame-shell">
        <div class="cyber-ops-loading"><div class="cyber-ops-loading-card"><div class="cyber-ops-loader"></div><strong>Conectando à Shadow Grid</strong><span>Carregando o módulo apenas quando solicitado.</span></div></div>
        <iframe class="cyber-ops-frame" title="Cyber Ops — Shadow Grid" loading="eager" referrerpolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads allow-popups allow-popups-to-escape-sandbox"></iframe>
      </div>
    </div>`;
  }
  async function mount(host,context){
    root=host;ctx=context;ready=false;contextApplied=false;latestSummary=null;lastMissionEventKey='';ensureStyles();root.innerHTML=template();
    frame=root.querySelector('.cyber-ops-frame');statusText=root.querySelector('#cyberOpsStatus');progressText=root.querySelector('#cyberOpsProgress');
    messageHandler=handleMessage;addEventListener('message',messageHandler);
    frame.addEventListener('load',()=>{if(!ready){updateStatus('Aguardando conexão');setTimeout(sendContext,80);}});
    frame.addEventListener('error',()=>{updateStatus('Falha de carregamento','is-error');ctx?.logEvent?.({eventType:'error',action:'Falha ao carregar o iframe do Cyber Ops',status:'error'});});
    root.querySelector('#cyberOpsReload').addEventListener('click',()=>{ready=false;contextApplied=false;updateStatus('Recarregando');root.querySelector('.cyber-ops-loading')?.classList.remove('hidden');frame.src=moduleUrl();});
    root.querySelector('#cyberOpsFullscreen').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await frame.requestFullscreen();else await document.exitFullscreen();}catch{ctx?.toast?.('O navegador não permitiu abrir o módulo em tela cheia.','warning');}});
    frame.src=moduleUrl();
  }
  async function unmount(){
    if(messageHandler)removeEventListener('message',messageHandler);messageHandler=null;
    for(const pending of pendingCommands.values()){clearTimeout(pending.timer);pending.reject(new Error('O módulo foi fechado.'));}pendingCommands.clear();
    if(frame)frame.src='about:blank';
    root=null;ctx=null;frame=null;statusText=null;progressText=null;latestSummary=null;ready=false;contextApplied=false;
  }
  function exportPayload(){
    const summary=latestSummary||{completedCount:0,totalMissions:6,totalScore:0,badgeCount:0,role:'Recruta Digital',modules:[]};
    const text=[
      'CYBER OPS — SHADOW GRID',
      `Estudante: ${currentSession()?.studentName||'—'}`,
      `Turma: ${currentSession()?.studentClass||'—'}`,
      `Progresso: ${summary.completedCount||0}/${summary.totalMissions||6} missões`,
      `Pontuação total: ${summary.totalScore||0}`,
      `Emblemas: ${summary.badgeCount||0}`,
      `Cargo: ${summary.role||'Recruta Digital'}`
    ].join('\n');
    return{text,native:JSON.stringify(summary,null,2),backup:summary};
  }
  async function exportNative(){await command('export-history');}
  function help(){return `<p><strong>Cyber Ops — Shadow Grid</strong> é um laboratório narrativo de defesa cibernética totalmente simulado. Escolha um dos três módulos, conclua suas duas fases e exporte as evidências pelo próprio painel.</p><ul><li>O nome e a turma vêm da sessão ativa do Lab Virtual DS.</li><li>O progresso fica isolado pela sessão do estudante.</li><li>Instituições, redes, IPs, satélites, bancos e consultas são fictícios ou reservados para documentação.</li><li>Nenhuma ferramenta ofensiva real ou consulta externa é executada.</li></ul>`;}

  window.LABDS_LABS[MODULE_ID]={mount,unmount,exportPayload,exportNative,help};
})();
