'use strict';
(function(){
  window.LABDS_LABS=window.LABDS_LABS||{};
  let root=null,ctx=null,frame=null,messageHandler=null,state={status:'ready',progress:0,xp:0,mode:'learning',quality:'auto',lastEvent:'Aguardando abertura',rewarded:false};

  function setStatus(text,tone='info'){
    state.status=tone;state.lastEvent=text;
    const label=root?.querySelector('#voxelStatus');if(label){label.textContent=text;label.dataset.tone=tone;}
  }
  function gameUrl(){return `games/voxelcraft/index.html?embed=1&v=${encodeURIComponent(window.LABDS.VERSION||'4.0.0-pages')}`;}
  function reload(){if(!frame)return;setStatus('Recarregando o mundo 3D...');frame.src='about:blank';setTimeout(()=>{if(frame)frame.src=gameUrl();},60);}
  function openExternal(){window.open(gameUrl().replace('embed=1','embed=0'),'_blank','noopener,noreferrer');}
  function requestFullscreen(){const target=frame||root?.querySelector('.voxel-frame-shell');if(document.fullscreenElement)document.exitFullscreen?.();else target?.requestFullscreen?.();}

  function onMessage(event){
    if(!frame||event.source!==frame.contentWindow||event.origin!==location.origin)return;
    const data=event.data;if(!data||data.source!=='voxelcraft-ds')return;
    const detail=data.detail&&typeof data.detail==='object'?data.detail:{};
    if(data.type==='ready'){setStatus('VoxelCraft pronto para jogar','success');ctx?.logEvent?.({eventType:'game',action:'VoxelCraft carregado',status:'success'});}
    if(data.type==='started'){state.mode=String(detail.mode||'learning');state.quality=String(detail.quality||'auto');setStatus(`Mundo iniciado • ${state.mode} • ${state.quality}`,'success');ctx?.logEvent?.({eventType:'game',action:'Mundo VoxelCraft iniciado',status:'success',context:{mode:state.mode,quality:state.quality,continued:Boolean(detail.continued)}});}
    if(data.type==='progress'){state.progress=Math.max(0,Math.min(100,Number(detail.progress)||0));if(state.progress>=100&&!state.rewarded&&state.mode!=='free'){state.rewarded=true;(ctx?.core||window.LABDS?.Core)?.complete?.(`voxelcraft:${state.mode}:mission`,{xp:state.mode==='challenge'?80:50,credits:state.mode==='challenge'?18:10,reason:'Missão do VoxelCraft concluída'});}state.xp=Math.max(0,Number(detail.xp)||0);const bar=root?.querySelector('#voxelProgressBar'),label=root?.querySelector('#voxelProgressText'),xp=root?.querySelector('#voxelXp');if(bar)bar.style.width=`${state.progress}%`;if(label)label.textContent=`${Math.round(state.progress)}%`;if(xp)xp.textContent=`${Math.round(state.xp)} XP`;}
    if(data.type==='saved'){setStatus('Mundo salvo no dispositivo','success');ctx?.logEvent?.({eventType:'save',action:'Mundo VoxelCraft salvo',status:'success',context:{xp:Number(detail.xp)||0,edits:Number(detail.edits)||0}});}
    if(data.type==='error'){setStatus(String(detail.message||'Falha no jogo 3D'),'error');ctx?.logEvent?.({eventType:'error',action:'Falha no VoxelCraft',status:'error',context:{message:String(detail.message||'erro')}});}
    if(data.type==='exit'){document.querySelector('#labScreen [data-home-link]')?.click();}
  }

  function render(){
    root.innerHTML=`<section class="voxelcraft-tool" aria-label="VoxelCraft DS 3D integrado"><header class="voxel-tool-head"><div><span class="eyebrow">WEBGL • CHUNKS • FÍSICA • PROGRAMAÇÃO</span><h2>VoxelCraft DS 3D</h2><p>Mundo voxel educacional com perfis de qualidade para celular, Chromebook e computador. O progresso é salvo localmente no navegador.</p></div><div class="voxel-tool-actions"><button id="voxelReload" type="button">Recarregar</button><button id="voxelNewTab" type="button">Abrir separado</button><button id="voxelFullscreen" class="btn primary" type="button">Tela cheia</button></div></header><div class="voxel-status-row"><span id="voxelStatus" data-tone="info">Carregando o jogo 3D...</span><span id="voxelXp">0 XP</span><div class="voxel-progress"><i><b id="voxelProgressBar"></b></i><small id="voxelProgressText">0%</small></div></div><div class="voxel-frame-shell"><iframe id="voxelFrame" title="VoxelCraft DS 3D" src="${gameUrl()}" sandbox="allow-scripts allow-same-origin allow-pointer-lock" allow="fullscreen; gamepad" referrerpolicy="no-referrer"></iframe></div><p class="voxel-runtime-note"><strong>Execução real:</strong> a cena usa WebGL/Three.js incluído no próprio projeto, com mundo procedural, física, chunks, inventário, construção, destruição e salvamento — sem depender de CDN externa.</p></section>`;
    frame=root.querySelector('#voxelFrame');root.querySelector('#voxelReload').addEventListener('click',reload);root.querySelector('#voxelNewTab').addEventListener('click',openExternal);root.querySelector('#voxelFullscreen').addEventListener('click',requestFullscreen);
  }

  async function mount(host,context){root=host;ctx=context;state={status:'ready',progress:0,xp:0,mode:'learning',quality:'auto',lastEvent:'Carregando',rewarded:false};render();messageHandler=onMessage;window.addEventListener('message',messageHandler);ctx?.logEvent?.({eventType:'game',action:'Ferramenta VoxelCraft aberta',status:'success'});}
  async function unmount(){if(frame?.contentWindow)frame.contentWindow.postMessage({source:'lab-virtual-ds',type:'shutdown'},location.origin);if(messageHandler)window.removeEventListener('message',messageHandler);messageHandler=null;frame=null;root=null;ctx=null;}
  function exportPayload(){return{text:`VOXELCRAFT DS 3D\nProgresso da missão: ${Math.round(state.progress)}%\nXP: ${Math.round(state.xp)}\nModo: ${state.mode}\nQualidade: ${state.quality}\nÚltimo evento: ${state.lastEvent}`,native:JSON.stringify({version:1,tool:'voxelcraft-3d',...state},null,2),backup:{version:1,tool:'voxelcraft-3d',...state},meta:[{label:'XP',value:String(Math.round(state.xp))},{label:'Progresso',value:`${Math.round(state.progress)}%`},{label:'Modo',value:state.mode},{label:'Qualidade',value:state.quality}]};}
  function help(){return'<h3>VoxelCraft DS 3D</h3><p>Use teclado e mouse no computador ou joysticks virtuais no celular. O jogo possui modos Livre, Aprendizagem e Desafio, perfis gráficos e salvamento local.</p><p>A renderização é real em WebGL. O mundo é procedural e utiliza carregamento progressivo por chunks para controlar memória e desempenho.</p>';}
  window.LABDS_LABS['voxelcraft-lab']={mount,unmount,exportPayload,help};
})();
