'use strict';

(function(){
  window.LABDS_LABS=window.LABDS_LABS||{};
  let root=null,ctx=null,state=null,updateTimer=null,watchdogTimer=null,currentFrame=null,messageWindowStarted=0,messageCount=0,runId=0;
  const STORAGE_KEY='lab.web.state';
  const LIMITS=()=>window.LABDS.SECURITY_LIMITS||{};
  const defaults={html:`<main class="page">
  <article class="card">
    <span class="tag">Laboratório Virtual DS</span>
    <h1>Desenvolvimento web</h1>
    <p>Edite HTML, CSS e JavaScript e observe o resultado real.</p>
    <button id="actionButton">Testar interação</button>
  </article>
</main>`,css:`* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: Arial, sans-serif;
  background: #0b1220;
  color: white;
}
.card {
  width: min(460px, 90vw);
  padding: 28px;
  border: 1px solid #29405a;
  border-radius: 18px;
  background: #111d2d;
}
.tag { color: #38e0bd; }
button { padding: 10px 14px; border: 0; border-radius: 9px; background: #38e0bd; cursor: pointer; }`,js:`const button = document.querySelector('#actionButton');

button.addEventListener('click', () => {
  button.textContent = 'Interação executada!';
  console.log('Clique capturado no preview isolado.');
});`,device:'desktop',auto:true,console:[]};
  const devices={mobile:{label:'Celular',width:390,height:700},tablet:{label:'Tablet',width:768,height:720},laptop:{label:'Notebook',width:1100,height:700},desktop:{label:'Desktop',width:1440,height:800},wide:{label:'Tela ampla',width:1920,height:900}};
  const $=sel=>root?.querySelector(sel);
  const text=(value,max=200000)=>String(value??'').slice(0,max);

  function current(){return{schemaVersion:1,html:text($('#webHtml').value),css:text($('#webCss').value),js:text($('#webJs').value),device:devices[$('#webDevice').value]?$('#webDevice').value:'desktop',auto:$('#webAuto').checked,console:[]};}
  function status(label,stateName='idle'){const box=$('#webPreviewStatus');if(box){box.dataset.state=stateName;box.querySelector('span').textContent=label;}}
  function log(line,level='log'){
    const safe=text(line,LIMITS().previewMessageBytes||16384);state.console.push({time:new Date().toLocaleTimeString('pt-BR'),level:['log','info','warn','error'].includes(level)?level:'log',text:safe});state.console=state.console.slice(-150);renderConsole();
  }
  function renderConsole(){const box=$('#webConsole');if(!box)return;box.textContent='';if(!state.console.length){const empty=document.createElement('div');empty.className='muted-copy';empty.textContent='O console do preview aparecerá aqui.';box.appendChild(empty);return;}state.console.forEach(item=>{const row=document.createElement('div');row.className=`code-log ${item.level}`;const time=document.createElement('span');time.textContent=item.time;row.append(time,document.createTextNode(item.text));box.appendChild(row);});box.scrollTop=box.scrollHeight;}

  function buildSrcdoc(value,id){
    const policy=`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; media-src data: blob:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none';">`;
    const bridge=`<script>(function(){\n'use strict';\nconst RUN_ID=${JSON.stringify(id)};let sent=0,bytes=0;const MAX_MESSAGES=${Number(LIMITS().previewMessages||250)},MAX_BYTES=${Number(LIMITS().outputBytes||200000)};\nfunction safe(v){try{if(typeof v==='string')return v.slice(0,12000);return JSON.stringify(v).slice(0,12000)}catch{return String(v).slice(0,12000)}}\nfunction send(level,args){if(sent>=MAX_MESSAGES||bytes>=MAX_BYTES)return;const text=args.map(safe).join(' ');bytes+=text.length;sent++;parent.postMessage({source:'labds-preview',runId:RUN_ID,level,text},'*')}\n['log','warn','error','info'].forEach(level=>{const original=console[level];console[level]=(...args)=>{send(level,args);try{original.apply(console,args)}catch{}}});\nwindow.alert=(message)=>send('warn',['alert:',message]);window.confirm=(message)=>{send('warn',['confirm bloqueado:',message]);return false};window.prompt=(message)=>{send('warn',['prompt bloqueado:',message]);return ''};\nwindow.open=()=>{send('warn',['window.open bloqueado']);return null};\naddEventListener('error',e=>send('error',[e.message+' (linha '+e.lineno+')']));addEventListener('unhandledrejection',e=>send('error',['Promise rejeitada:',e.reason?.message||e.reason]));\nconst observer=new MutationObserver(()=>{if(document.getElementsByTagName('*').length>5000){observer.disconnect();document.body.textContent='Preview interrompido: limite de 5.000 elementos excedido.';send('error',['Limite de elementos excedido.'])}});observer.observe(document.documentElement,{childList:true,subtree:true});\naddEventListener('load',()=>parent.postMessage({source:'labds-preview',runId:RUN_ID,level:'ready',text:'Preview pronto'},'*'));\n})();<\/script>`;
    return`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${policy}<style>${value.css}</style></head><body>${value.html}${bridge}<script>${value.js}<\/script></body></html>`;
  }

  function createFrame(){const frame=document.createElement('iframe');frame.id='webPreview';frame.className='preview-frame';frame.sandbox='allow-scripts';frame.title='Prévia isolada do código HTML, CSS e JavaScript';return frame;}
  function stopPreview(reason='Preview interrompido pelo usuário.'){
    clearTimeout(watchdogTimer);watchdogTimer=null;if(currentFrame){currentFrame.src='about:blank';currentFrame.remove();currentFrame=null;}const viewport=$('#webViewport');if(viewport){viewport.textContent='';const card=document.createElement('div');card.className='preview-stopped';card.textContent=reason;viewport.appendChild(card);}status('interrompido','error');
  }

  function renderPreview(source='manual'){
    clearTimeout(updateTimer);clearTimeout(watchdogTimer);const value=current();state={...state,...value,console:source==='mount'?[]:state.console};runId++;messageWindowStarted=performance.now();messageCount=0;
    const viewport=$('#webViewport');viewport.textContent='';currentFrame=createFrame();viewport.appendChild(currentFrame);const device=devices[value.device];viewport.style.setProperty('--preview-width',`${device.width}px`);viewport.style.setProperty('--preview-height',`${device.height}px`);$('#webViewportLabel').textContent=`${device.label} • ${device.width} × ${device.height}`;status('executando preview','running');currentFrame.srcdoc=buildSrcdoc(value,runId);
    watchdogTimer=setTimeout(()=>{if(currentFrame){log('O preview não concluiu o carregamento em 4 segundos. Um loop ou script bloqueante pode ter sido executado.','error');stopPreview('Preview interrompido pelo watchdog. Revise loops e scripts executados imediatamente.');ctx.logEvent({eventType:'security_limit',action:'Watchdog do preview acionado',status:'warning',context:{source,runId,timeoutMs:4000}});}},4000);
    ctx.storage.set(STORAGE_KEY,state);
    if(!['auto','mount'].includes(source))ctx.logEvent({eventType:'code_execution',action:'Preview front-end atualizado',input:[`===== HTML =====`,value.html,'',`===== CSS =====`,value.css,'',`===== JAVASCRIPT =====`,value.js].join('\n'),output:state.console.map(l=>`[${l.time}] ${l.text}`).join('\n'),status:'success',context:{language:'HTML/CSS/JavaScript',files:['index.html','style.css','app.js'],device:device.label,iframeSandbox:true,source,watchdog:true}});
  }

  function schedule(){if($('#webAuto').checked){clearTimeout(updateTimer);updateTimer=setTimeout(()=>renderPreview('auto'),650);}}
  function setTab(tab){root.querySelectorAll('[data-web-tab]').forEach(button=>button.classList.toggle('active',button.dataset.webTab===tab));root.querySelectorAll('[data-web-editor]').forEach(editor=>editor.classList.toggle('hidden',editor.dataset.webEditor!==tab));const active=$(`[data-web-editor="${tab}"]`);active?.focus();}
  function onMessage(event){
    const frame=currentFrame;if(!frame||event.source!==frame.contentWindow||event.data?.source!=='labds-preview'||event.data.runId!==runId)return;
    const now=performance.now();if(now-messageWindowStarted>1000){messageWindowStarted=now;messageCount=0;}messageCount++;
    if(messageCount>(LIMITS().previewMessages||250)){log('Mensagens demais no preview. O console foi limitado.','warn');return;}
    if(event.data.level==='ready'){clearTimeout(watchdogTimer);watchdogTimer=null;status('preview pronto','idle');return;}
    log(event.data.text,event.data.level);
  }

  function fullDocument(){const value=current();return`<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<style>\n${value.css}\n</style>\n</head>\n<body>\n${value.html}\n<script>\n${value.js}\n<\/script>\n</body>\n</html>`;}
  function downloadProject(){window.LABDS.Exporter.download(fullDocument(),`projeto-front-end-${Date.now()}.html`,'text/html;charset=utf-8');ctx.toast('Projeto HTML exportado.','success');}
  async function importHtml(file){
    if(!file||file.size>1_000_000)throw new Error('O arquivo HTML deve ter no máximo 1 MB.');const source=await file.text();const doc=new DOMParser().parseFromString(source,'text/html');
    const styles=[...doc.querySelectorAll('style')].map(el=>el.textContent).join('\n\n');const scripts=[...doc.querySelectorAll('script')].map(el=>el.textContent).join('\n\n');doc.querySelectorAll('style,script').forEach(el=>el.remove());
    $('#webHtml').value=doc.body.innerHTML.trim()||'<main><h1>Projeto importado</h1></main>';$('#webCss').value=styles;$('#webJs').value=scripts;renderPreview('import');ctx.logEvent({eventType:'import',action:'Projeto HTML importado',status:'success',context:{fileName:file.name,fileSize:file.size}});
  }

  async function mount(host,context){
    root=host;ctx=context;const saved=await ctx.storage.get(STORAGE_KEY,defaults);state=window.LABDS.Schemas?.sanitizeWeb?.({...defaults,...saved})||{...defaults,...saved};state.console=[];
    root.innerHTML=`<div class="web-lab-layout"><section class="web-editor-panel"><div class="panel-toolbar"><div class="tabs"><button class="tab-btn active" data-web-tab="html" type="button">index.html</button><button class="tab-btn" data-web-tab="css" type="button">style.css</button><button class="tab-btn" data-web-tab="js" type="button">app.js</button></div><div class="button-row"><button id="webRun" class="btn primary" type="button">Executar</button><button id="webStop" class="btn secondary" type="button">Parar</button><button id="webReload" class="btn secondary" type="button">Recarregar</button><button id="webRestore" class="btn subtle" type="button">Restaurar</button></div></div><textarea id="webHtml" data-web-editor="html" class="code-editor" spellcheck="false" aria-label="Código HTML"></textarea><textarea id="webCss" data-web-editor="css" class="code-editor hidden" spellcheck="false" aria-label="Código CSS"></textarea><textarea id="webJs" data-web-editor="js" class="code-editor hidden" spellcheck="false" aria-label="Código JavaScript"></textarea><div class="panel-toolbar"><div class="button-row"><button id="webImport" class="btn secondary" type="button">Importar HTML</button><input id="webImportFile" type="file" accept=".html,text/html" hidden><button id="webDownload" class="btn secondary" type="button">Baixar projeto</button><button id="webClear" class="btn subtle" type="button">Limpar editores</button></div><span>Ctrl+Enter executa</span></div></section><section class="web-preview-panel"><div class="panel-toolbar"><div class="button-row"><select id="webDevice" aria-label="Dispositivo da prévia">${Object.entries(devices).map(([key,item])=>`<option value="${key}">${item.label}</option>`).join('')}</select><label class="check-field"><input id="webAuto" type="checkbox"> Atualização automática</label><button id="webPreviewFullscreen" class="icon-btn" type="button" aria-label="Prévia em tela cheia">⛶</button></div><div class="web-preview-status" id="webPreviewStatus" data-state="idle"><i></i><span>aguardando</span></div><span id="webViewportLabel"></span></div><div id="webViewport" class="web-viewport"></div><div class="panel-toolbar"><strong>Console do preview</strong><button id="clearWebConsole" class="icon-btn" type="button">Limpar</button></div><div id="webConsole" class="console-card web-console"></div></section></div>`;
    $('#webHtml').value=state.html;$('#webCss').value=state.css;$('#webJs').value=state.js;$('#webDevice').value=state.device;$('#webAuto').checked=state.auto;
    root.querySelectorAll('[data-web-tab]').forEach(button=>button.addEventListener('click',()=>setTab(button.dataset.webTab)));
    root.querySelectorAll('.code-editor').forEach(editor=>{editor.readOnly=false;editor.disabled=false;editor.addEventListener('input',schedule);editor.addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();const start=editor.selectionStart,end=editor.selectionEnd;editor.setRangeText('  ',start,end,'end');}if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();renderPreview('keyboard');}});});
    $('#webRun').addEventListener('click',()=>renderPreview('run'));$('#webStop').addEventListener('click',()=>stopPreview());$('#webReload').addEventListener('click',()=>renderPreview('reload'));$('#webDevice').addEventListener('change',()=>renderPreview('device'));$('#webAuto').addEventListener('change',()=>{state.auto=$('#webAuto').checked;schedule();});
    $('#webRestore').addEventListener('click',()=>{if(confirm('Restaurar o exemplo inicial?')){$('#webHtml').value=defaults.html;$('#webCss').value=defaults.css;$('#webJs').value=defaults.js;renderPreview('restore');}});$('#webClear').addEventListener('click',()=>{if(confirm('Limpar os três editores?')){$('#webHtml').value='';$('#webCss').value='';$('#webJs').value='';stopPreview('Editores limpos. Use Executar quando estiver pronto.');}});
    $('#clearWebConsole').addEventListener('click',()=>{state.console=[];renderConsole();});$('#webDownload').addEventListener('click',downloadProject);$('#webImport').addEventListener('click',()=>$('#webImportFile').click());$('#webImportFile').addEventListener('change',async event=>{try{await importHtml(event.target.files?.[0]);ctx.toast('Projeto importado.','success');}catch(error){ctx.toast(error.message,'error');}event.target.value='';});
    $('#webPreviewFullscreen').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await $('#webViewport').requestFullscreen();else await document.exitFullscreen();}catch{ctx.toast('Tela cheia indisponível neste navegador.','warning');}});
    addEventListener('message',onMessage);renderConsole();renderPreview('mount');
  }

  function exportPayload(){const value=current();return{text:['LABORATÓRIO FRONT-END','','===== HTML =====',value.html,'','===== CSS =====',value.css,'','===== JAVASCRIPT =====',value.js,'','===== CONSOLE =====',...state.console.map(item=>`[${item.time}] ${item.text}`)].join('\n'),native:fullDocument(),backup:value,meta:[{label:'Dispositivo',value:devices[value.device].label},{label:'Preview',value:'iframe sandbox sem same-origin'},{label:'Watchdog',value:'4 segundos'}]};}
  function help(){return '<p>Os editores são editáveis e o preview usa iframe sandboxado sem <code>allow-same-origin</code>. O watchdog interrompe previews que não concluem o carregamento em quatro segundos. Use Parar para reconstruir o iframe após loops ou DOM excessivo.</p>';}
  async function unmount(){clearTimeout(updateTimer);clearTimeout(watchdogTimer);removeEventListener('message',onMessage);if(ctx&&root){state={...state,...current()};await ctx.storage.set(STORAGE_KEY,state);}if(currentFrame){currentFrame.src='about:blank';currentFrame.remove();}currentFrame=null;root=null;ctx=null;state=null;}
  window.LABDS_LABS['web-lab']={mount,unmount,exportPayload,help};
})();
