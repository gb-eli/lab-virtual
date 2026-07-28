'use strict';
(function(){
  window.LABDS_LABS=window.LABDS_LABS||{};
  let root=null,ctx=null,frame=null,messageHandler=null,accessibilityHandler=null,loadTimer=null,pingTimer=null,frameRevealTimer=null,navigationTimer=null,bootToken=0;
  let state={status:'loading',ready:false,frameLoaded:false,questions:0,tokensUsed:0,lastTopic:'',lastEvent:'Aguardando inicialização',diagnostic:''};

  function safeText(value,max=180){return String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);}
  function assistantUrl(embed=true,token=bootToken){const version=window.LABDS.VERSION||'8.2.3-pages';return `assistants/iara/index.html?embed=${embed?'1':'0'}&v=${encodeURIComponent(version)}&boot=${encodeURIComponent(token)}`;}
  function setStatus(text,tone='info'){
    state.status=tone;state.lastEvent=safeText(text,220);
    const label=root?.querySelector('#iaraStatus');if(label){label.textContent=state.lastEvent;label.dataset.tone=tone;}
    const shell=root?.querySelector('.iara-frame-shell');
    shell?.classList.toggle('is-ready',tone==='success');
    shell?.classList.toggle('is-loaded',state.frameLoaded||state.ready);
    shell?.classList.toggle('has-error',tone==='error'||tone==='warning');
  }
  function currentAccessibility(){const prefs=window.LABDS.Accessibility?.get?.()||{};return{theme:window.LABDS.Accessibility?.resolvedTheme?.()||document.documentElement.dataset.theme||'dark',themeMode:prefs.theme||'system',fontSize:prefs.fontSize||'normal',reducedMotion:Boolean(prefs.reducedMotion),highContrast:Boolean(prefs.highContrast)};}
  function publicTools(){return(window.LABDS.TOOLS||[]).map(tool=>({id:tool.id,name:tool.name,shortName:tool.shortName||tool.name,description:tool.description,category:tool.category,categoryLabel:window.LABDS.CATEGORY_LABELS?.[tool.category]||tool.category,level:tool.level,runtime:tool.runtime,runtimeLabel:tool.runtimeLabel,tags:Array.isArray(tool.tags)?tool.tags.slice(0,16):[]}));}
  function sendToFrame(type,detail={}){if(!frame?.contentWindow)return;frame.contentWindow.postMessage({source:'lab-virtual-ds',type,detail:{...detail,boot:bootToken}},location.origin);}
  function sendContext(){const session=window.LABDS.Session?.publicSession?.()||null;sendToFrame('context',{version:window.LABDS.VERSION,student:session?{name:session.studentName,className:session.studentClass}:null,accessibility:currentAccessibility(),tools:publicTools()});}
  function ping(){if(!frame?.contentWindow||state.ready)return;sendToFrame('ping',{version:window.LABDS.VERSION});sendContext();}
  function clearBootTimers(){clearTimeout(loadTimer);clearInterval(pingTimer);clearTimeout(frameRevealTimer);clearTimeout(navigationTimer);loadTimer=null;pingTimer=null;frameRevealTimer=null;navigationTimer=null;}
  function setDiagnostic(message=''){state.diagnostic=safeText(message,360);const text=root?.querySelector('#iaraDiagnosticText');if(text)text.textContent=state.diagnostic||'A interface foi carregada, mas a confirmação do motor local demorou mais do que o esperado.';}
  function revealFrame(message='Interface da IARA carregada; preparando conhecimento...'){
    if(!root)return;state.frameLoaded=true;root.querySelector('.iara-frame-shell')?.classList.add('is-loaded');
    if(!state.ready)setStatus(message,'loading');
  }
  function showRecovery(message){revealFrame();setDiagnostic(message);root?.querySelector('#iaraRecovery')?.classList.remove('hidden');}
  function hideRecovery(){root?.querySelector('#iaraRecovery')?.classList.add('hidden');}
  function compatibleBoot(detail){
    if(!detail||detail.boot===undefined||detail.boot===null||detail.boot===''||Number(detail.boot)===0)return true;
    return Number(detail.boot)===Number(bootToken);
  }
  function beginHandshake(){
    clearBootTimers();state.ready=false;setStatus('Inicializando a IARA...','loading');ping();
    pingTimer=setInterval(ping,600);
    frameRevealTimer=setTimeout(()=>{if(!state.ready)revealFrame();},1800);
    loadTimer=setTimeout(()=>{
      if(state.ready)return;clearInterval(pingTimer);pingTimer=null;
      setStatus('Interface carregada; confirmação do motor local pendente.','warning');
      showRecovery('A interface foi liberada para uso. Se os botões internos não responderem, recarregue somente a IARA. Esta situação normalmente é causada por arquivos antigos no cache do navegador.');
    },15000);
  }
  function startFrame(){
    if(!frame)return;clearBootTimers();bootToken=Date.now();state.ready=false;state.frameLoaded=false;hideRecovery();setDiagnostic('');
    root?.querySelector('.iara-frame-shell')?.classList.remove('is-ready','is-loaded','has-error');
    setStatus('Inicializando a IARA...','loading');frame.src=assistantUrl(true,bootToken);navigationTimer=setTimeout(()=>{if(!state.frameLoaded&&!state.ready){setStatus('O documento interno da IARA não terminou de carregar.','error');showRecovery('Verifique se a pasta lab/assistants/iara foi publicada integralmente. Recarregue a IARA ou abra em uma nova guia para visualizar o erro direto do navegador.');}},12000);
  }
  function reload(){startFrame();}
  function openExternal(){window.open(assistantUrl(false,Date.now()),'_blank','noopener,noreferrer');}
  function requestFullscreen(){const target=root?.querySelector('.iara-frame-shell')||frame;if(document.fullscreenElement)document.exitFullscreen?.();else target?.requestFullscreen?.();}
  function goHome(){window.LABDS.App?.goHome?.();}
  function onMessage(event){
    if(!frame||event.source!==frame.contentWindow||event.origin!==location.origin)return;
    const data=event.data;if(!data||data.source!=='iara-ds')return;const detail=data.detail&&typeof data.detail==='object'?data.detail:{};
    if(!compatibleBoot(detail))return;
    if(data.type==='frame-loaded'){
      revealFrame('Interface carregada; preparando a base de conhecimento...');sendContext();return;
    }
    if(data.type==='ready'){
      state.ready=true;state.frameLoaded=true;clearBootTimers();hideRecovery();setStatus(detail.degraded?'IARA pronta em modo contextual; base protegida indisponível.':'IARA pronta',detail.degraded?'warning':'success');sendContext();
      ctx?.logEvent?.({eventType:'assistant',action:'IARA inicializada',status:'success',context:{routes:Number(detail.routes)||0,tools:Number(detail.tools)||0,legacyBoot:detail.boot===undefined||detail.boot===null}});return;
    }
    if(data.type==='interaction'){
      state.questions+=1;state.tokensUsed+=Math.max(0,Number(detail.cost)||0);state.lastTopic=safeText(detail.topic||detail.question,100);setStatus('IARA pronta','success');
      const q=root?.querySelector('#iaraQuestions'),t=root?.querySelector('#iaraTokens');if(q)q.textContent=String(state.questions);if(t)t.textContent=String(Math.round(state.tokensUsed));
      ctx?.logEvent?.({eventType:'assistant',action:'Pergunta respondida pela IARA',status:'success',input:safeText(detail.question,260),output:safeText(detail.summary,340),context:{cost:Math.max(0,Number(detail.cost)||0),confidence:Math.max(0,Math.min(100,Number(detail.confidence)||0)),topic:state.lastTopic}});return;
    }
    if(data.type==='open-tool'){
      const toolId=safeText(detail.toolId,80),tool=(window.LABDS.TOOLS||[]).find(item=>item.id===toolId);if(!tool){setStatus('Ferramenta recomendada não reconhecida.','error');return;}
      ctx?.logEvent?.({eventType:'navigation',action:`Ferramenta recomendada pela IARA: ${tool.name}`,status:'success',context:{toolId}});window.LABDS.App?.openTool?.(toolId);return;
    }
    if(data.type==='status'){setStatus(safeText(detail.message||'IARA em processamento',180),safeText(detail.tone||'info',20));return;}
    if(data.type==='error'){
      clearBootTimers();revealFrame();const message=safeText(detail.message||'Falha ao iniciar o motor local da IARA',300);setStatus('A IARA encontrou um problema de inicialização.','error');showRecovery(message);ctx?.logEvent?.({eventType:'error',action:'Falha na IARA',status:'error',error:message});
    }
  }
  function render(){
    root.innerHTML=`<section class="iara-tool iara-immersive" aria-label="IARA DS integrada ao Laboratório Virtual DS"><div class="iara-compact-bar"><div class="iara-compact-status"><span class="iara-live-dot" aria-hidden="true"></span><strong id="iaraStatus" data-tone="loading">Inicializando a IARA...</strong><span class="iara-metric"><b id="iaraQuestions">0</b> perguntas</span><span class="iara-metric"><b id="iaraTokens">0</b> tokens</span></div><div class="iara-tool-actions"><button id="iaraHome" type="button">Início</button><button id="iaraReload" type="button">Recarregar</button><button id="iaraNewTab" type="button">Abrir separado</button><button id="iaraFullscreen" class="btn primary" type="button">Tela cheia</button></div></div><div class="iara-frame-shell"><div class="iara-loading-layer" aria-hidden="true"><span class="spinner"></span><strong>Preparando a base local da IARA</strong><small>Carregando conhecimento e contexto do portal...</small></div><iframe id="iaraFrame" title="IARA DS — Assistente Educacional" sandbox="allow-scripts allow-same-origin" referrerpolicy="no-referrer"></iframe><aside id="iaraRecovery" class="iara-recovery hidden" role="status"><strong>Diagnóstico de carregamento</strong><p id="iaraDiagnosticText">A interface foi carregada, mas a confirmação do motor local demorou.</p><div><button id="iaraRetry" class="btn primary" type="button">Recarregar IARA</button><button id="iaraFallbackOpen" type="button">Abrir separado</button><button id="iaraDismiss" type="button">Continuar nesta tela</button></div></aside></div></section>`;
    frame=root.querySelector('#iaraFrame');
    root.querySelector('#iaraHome').addEventListener('click',goHome);root.querySelector('#iaraReload').addEventListener('click',reload);root.querySelector('#iaraNewTab').addEventListener('click',openExternal);root.querySelector('#iaraFullscreen').addEventListener('click',requestFullscreen);root.querySelector('#iaraRetry').addEventListener('click',reload);root.querySelector('#iaraFallbackOpen').addEventListener('click',openExternal);root.querySelector('#iaraDismiss').addEventListener('click',hideRecovery);
    frame.addEventListener('load',()=>{clearTimeout(navigationTimer);navigationTimer=null;revealFrame('Interface carregada; preparando a base de conhecimento...');if(!state.ready)beginHandshake();},{passive:true});
    startFrame();
  }
  async function mount(host,context){
    root=host;ctx=context;state={status:'loading',ready:false,frameLoaded:false,questions:0,tokensUsed:0,lastTopic:'',lastEvent:'Inicializando',diagnostic:''};
    messageHandler=onMessage;window.addEventListener('message',messageHandler);accessibilityHandler=sendContext;document.addEventListener('labds:accessibilitychange',accessibilityHandler);render();ctx?.logEvent?.({eventType:'assistant',action:'Ferramenta IARA aberta',status:'success'});
  }
  async function unmount(){clearBootTimers();sendToFrame('shutdown');if(messageHandler)window.removeEventListener('message',messageHandler);if(accessibilityHandler)document.removeEventListener('labds:accessibilitychange',accessibilityHandler);messageHandler=null;accessibilityHandler=null;frame=null;root=null;ctx=null;}
  function exportPayload(){const payload={version:3,tool:'iara-ds',questions:state.questions,tokensUsed:Math.round(state.tokensUsed),lastTopic:state.lastTopic,lastEvent:state.lastEvent,ready:state.ready,frameLoaded:state.frameLoaded,diagnostic:state.diagnostic};return{text:`IARA DS\nPerguntas respondidas: ${payload.questions}\nTokens usados: ${payload.tokensUsed}\nÚltimo assunto: ${payload.lastTopic||'não registrado'}\nStatus: ${payload.lastEvent}`,native:JSON.stringify(payload,null,2),backup:payload,meta:[{label:'Perguntas',value:String(payload.questions)},{label:'Tokens usados',value:String(payload.tokensUsed)},{label:'Último assunto',value:payload.lastTopic||'—'}]};}
  function help(){return'<h3>IARA DS</h3><p>Digite perguntas sobre programação, tecnologia, conteúdos escolares ou ferramentas do Laboratório Virtual DS.</p><p>A interface é liberada assim que o documento interno carrega. A confirmação do motor de conhecimento ocorre em seguida e é compatível com arquivos antigos ainda presentes no cache.</p>';}
  window.LABDS_LABS['iara-lab']={mount,unmount,exportPayload,help};
})();
