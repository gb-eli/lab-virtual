'use strict';

(function(){
  window.LABDS_LABS=window.LABDS_LABS||{};
  let root,ctx,state,updateTimer;
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
button {
  padding: 10px 14px;
  border: 0;
  border-radius: 9px;
  background: #38e0bd;
  cursor: pointer;
}`,js:`const button = document.querySelector('#actionButton');

button.addEventListener('click', () => {
  button.textContent = 'Interação executada!';
  console.log('Clique capturado no preview isolado.');
});`,device:'desktop',auto:true,console:[]};
  const devices={mobile:{label:'Celular',width:390,height:700},tablet:{label:'Tablet',width:768,height:720},laptop:{label:'Notebook',width:1100,height:700},desktop:{label:'Desktop',width:1440,height:800},wide:{label:'Tela ampla',width:1920,height:900}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function current(){return{html:root.querySelector('#webHtml').value,css:root.querySelector('#webCss').value,js:root.querySelector('#webJs').value,device:root.querySelector('#webDevice').value,auto:root.querySelector('#webAuto').checked};}
  function srcdoc(){const value=current();const policy=`<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; font-src data:; connect-src 'none';">`;const bridge=`<script>['log','warn','error','info'].forEach(level=>{const original=console[level];console[level]=(...args)=>{parent.postMessage({source:'labds-preview',level,text:args.map(v=>{try{return typeof v==='string'?v:JSON.stringify(v)}catch{return String(v)}}).join(' ')},'*');original(...args);};});window.addEventListener('error',e=>parent.postMessage({source:'labds-preview',level:'error',text:e.message+' (linha '+e.lineno+')'},'*'));<\/script>`;return`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${policy}<style>${value.css}</style></head><body>${value.html}${bridge}<script>${value.js}<\/script></body></html>`;}
  function renderPreview(source='manual'){clearTimeout(updateTimer);const value=current();state={...state,...value};const iframe=root.querySelector('#webPreview');iframe.srcdoc=srcdoc();const device=devices[value.device];root.querySelector('#webViewport').style.setProperty('--preview-width',`${device.width}px`);root.querySelector('#webViewport').style.setProperty('--preview-height',`${device.height}px`);root.querySelector('#webViewportLabel').textContent=`${device.label} • ${device.width} × ${device.height}`;ctx.storage.set('lab.web.state',state);if(source!=='auto'&&source!=='mount')ctx.logEvent({eventType:'code_execution',action:'Preview front-end atualizado',input:[`===== HTML =====`,value.html,'',`===== CSS =====`,value.css,'',`===== JAVASCRIPT =====`,value.js].join('\n'),output:state.console.map(l=>`[${l.time}] ${l.text}`).join('\n'),status:state.console.some(l=>l.level==='error')?'error':'success',context:{language:'HTML/CSS/JavaScript',files:['index.html','style.css','app.js'],device:device.label,iframeSandbox:true,source}});}
  function schedule(){if(root.querySelector('#webAuto').checked){clearTimeout(updateTimer);updateTimer=setTimeout(()=>renderPreview('auto'),350);}}
  function setTab(tab){root.querySelectorAll('[data-web-tab]').forEach(b=>b.classList.toggle('active',b.dataset.webTab===tab));root.querySelectorAll('[data-web-editor]').forEach(e=>e.classList.toggle('hidden',e.dataset.webEditor!==tab));}
  function onMessage(event){const frame=root?.querySelector('#webPreview');if(!frame||event.source!==frame.contentWindow||event.data?.source!=='labds-preview')return;state.console.push({time:new Date().toLocaleTimeString('pt-BR'),level:event.data.level,text:event.data.text});state.console=state.console.slice(-100);renderConsole();}
  function renderConsole(){const box=root.querySelector('#webConsole');box.innerHTML=state.console.map(l=>`<div class="code-log ${l.level}"><span>${l.time}</span>${esc(l.text)}</div>`).join('')||'<div class="muted-copy">O console do preview aparecerá aqui.</div>';box.scrollTop=box.scrollHeight;}
  async function mount(host,context){root=host;ctx=context;state={...defaults,...(await ctx.storage.get('lab.web.state',{}))};state.console=[];root.innerHTML=`<div class="web-lab-layout"><section class="web-editor-panel"><div class="panel-toolbar"><div class="tabs"><button class="tab-btn active" data-web-tab="html">index.html</button><button class="tab-btn" data-web-tab="css">style.css</button><button class="tab-btn" data-web-tab="js">app.js</button></div><div class="button-row"><button id="webRun" class="btn primary" type="button">Executar</button><button id="webReload" class="btn secondary" type="button">Recarregar</button><button id="webRestore" class="btn subtle" type="button">Restaurar</button></div></div><textarea id="webHtml" data-web-editor="html" class="code-editor"></textarea><textarea id="webCss" data-web-editor="css" class="code-editor hidden"></textarea><textarea id="webJs" data-web-editor="js" class="code-editor hidden"></textarea></section><section class="web-preview-panel"><div class="panel-toolbar"><div class="button-row"><select id="webDevice">${Object.entries(devices).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('')}</select><label class="check-field"><input id="webAuto" type="checkbox"> Atualização automática</label></div><span id="webViewportLabel"></span></div><div id="webViewport" class="web-viewport"><iframe id="webPreview" class="preview-frame" sandbox="allow-scripts"></iframe></div><div class="panel-toolbar"><strong>Console do preview</strong><button id="clearWebConsole" class="icon-btn" type="button">Limpar</button></div><div id="webConsole" class="console-card web-console"></div></section></div>`;root.querySelector('#webHtml').value=state.html;root.querySelector('#webCss').value=state.css;root.querySelector('#webJs').value=state.js;root.querySelector('#webDevice').value=state.device;root.querySelector('#webAuto').checked=state.auto;root.querySelectorAll('[data-web-tab]').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.webTab)));root.querySelectorAll('.code-editor').forEach(editor=>{editor.addEventListener('input',schedule);editor.addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();const s=editor.selectionStart,e=editor.selectionEnd;editor.value=editor.value.slice(0,s)+'  '+editor.value.slice(e);editor.selectionStart=editor.selectionEnd=s+2;}if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();renderPreview('keyboard');}});});root.querySelector('#webRun').addEventListener('click',()=>renderPreview('run'));root.querySelector('#webReload').addEventListener('click',()=>renderPreview('reload'));root.querySelector('#webDevice').addEventListener('change',()=>renderPreview('device'));root.querySelector('#webAuto').addEventListener('change',()=>{state.auto=root.querySelector('#webAuto').checked;schedule();});root.querySelector('#webRestore').addEventListener('click',()=>{if(confirm('Restaurar o exemplo inicial?')){root.querySelector('#webHtml').value=defaults.html;root.querySelector('#webCss').value=defaults.css;root.querySelector('#webJs').value=defaults.js;renderPreview('restore');}});root.querySelector('#clearWebConsole').addEventListener('click',()=>{state.console=[];renderConsole();});addEventListener('message',onMessage);renderConsole();renderPreview('mount');}
  function exportPayload(){const v=current();const full=`<!doctype html>\n<html lang="pt-BR">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<style>\n${v.css}\n</style>\n</head>\n<body>\n${v.html}\n<script>\n${v.js}\n<\/script>\n</body>\n</html>`;return{text:['LABORATÓRIO FRONT-END','', '===== HTML =====',v.html,'','===== CSS =====',v.css,'','===== JAVASCRIPT =====',v.js,'','===== CONSOLE =====',...state.console.map(l=>`[${l.time}] ${l.text}`)].join('\n'),native:full,backup:v,meta:[{label:'Dispositivo',value:devices[v.device].label},{label:'Preview',value:'iframe sandbox'}]};}
  function help(){return '<p>O preview é renderizado em um iframe com sandbox. Use Ctrl+Enter para executar. O JavaScript não acessa o contexto principal do Laboratório Virtual DS.</p>';}
  async function unmount(){clearTimeout(updateTimer);removeEventListener('message',onMessage);if(ctx&&root){state={...state,...current()};await ctx.storage.set('lab.web.state',state);}root=null;ctx=null;}
  window.LABDS_LABS['web-lab']={mount,unmount,exportPayload,help};
})();
