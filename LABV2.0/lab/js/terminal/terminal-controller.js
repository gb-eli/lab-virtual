'use strict';

(function(){
  window.LABDS = window.LABDS || {};

  const $ = selector => document.querySelector(selector);
  const state = {
    profile:null, fs:null, shell:null, history:[], historyIndex:0,
    fontSize:Number(window.LABDS.Storage?.smallGet('terminalFont', 15) || 15),
    activeOperation:null, networkProfile:window.LABDS.Storage?.smallGet('networkProfile', window.LABDS.DEFAULT_NETWORK_PROFILE) || window.LABDS.DEFAULT_NETWORK_PROFILE,
    networkSeed:window.LABDS.Storage?.smallGet('networkSeed','') || '', minimized:false
  };

  const output = $('#terminalOutput');
  const input = $('#terminalInput');
  const form = $('#terminalForm');
  const prompt = $('#terminalPrompt');
  const windowEl = $('#terminalWindow');
  const side = $('#terminalSidePanel');
  const helpContent = $('#terminalHelpContent');
  const helpSearch = $('#terminalHelpSearch');

  function historyKey(){ return state.profile ? window.LABDS.Session.scopeKey(`terminalHistory.${state.profile.id}`) : ''; }

  function lineCount(){ return output ? output.childElementCount : 0; }
  function trimOutput(){
    const max = window.LABDS.MAX_TERMINAL_LINES || 1200;
    while(lineCount() > max) output.firstElementChild?.remove();
  }

  function print(text = '', kind = ''){
    if(!output) return;
    String(text ?? '').split('\n').forEach(value => {
      const div = document.createElement('div');
      div.className = `terminal-line ${kind}`.trim();
      div.textContent = value || ' ';
      output.appendChild(div);
    });
    trimOutput();
    output.scrollTop = output.scrollHeight;
  }

  function printCommand(command){
    const div = document.createElement('div');
    div.className = 'terminal-line command-echo';
    const p = document.createElement('span');
    p.className = 'echo-prompt';
    p.textContent = state.shell?.prompt() || '> ';
    div.append(p, document.createTextNode(command));
    output.appendChild(div);
    trimOutput();
    output.scrollTop = output.scrollHeight;
  }

  function clear(){ if(output) output.textContent = ''; }

  function status(value, tone = ''){
    const element = $('#terminalOperationStatus');
    if(!element) return;
    element.textContent = value;
    element.dataset.tone = tone;
  }

  function updatePrompt(){
    if(!state.shell) return;
    prompt.textContent = state.shell.prompt();
    $('#terminalStatusPath').textContent = state.fs.displayPath();
  }

  function getCatalog(){
    const key = state.profile?.shell === 'cmd' ? 'cmd' : state.profile?.shell === 'powershell' ? 'powershell' : state.profile?.os === 'macos' ? 'macos' : 'bash';
    return (window.LABDS_COMMAND_CATALOG || {})[key] || [];
  }

  function renderHelp(query = ''){
    const q = query.trim().toLowerCase();
    const rows = getCatalog().filter(item => !q || `${item.command} ${item.description} ${item.example}`.toLowerCase().includes(q));
    helpContent.innerHTML = rows.length ? rows.map(item => {
      const article = document.createElement('article');
      article.className = 'command-item';
      const code = document.createElement('code'); code.textContent = item.command;
      const p = document.createElement('p'); p.textContent = item.description;
      const small = document.createElement('small'); small.textContent = item.example;
      article.append(code,p,small);
      return article.outerHTML;
    }).join('') : '<p class="empty-copy">Nenhum comando encontrado.</p>';
  }

  function setTheme(profile){
    document.body.dataset.terminalTheme = profile.id;
    document.documentElement.style.setProperty('--terminal-font-size', `${state.fontSize}px`);
  }

  async function loadHistory(){
    state.history = await window.LABDS.Storage.get(historyKey(), []);
    if(!Array.isArray(state.history)) state.history = [];
    state.history = state.history.slice(-400);
    state.historyIndex = state.history.length;
  }

  async function saveHistory(){ await window.LABDS.Storage.set(historyKey(), state.history.slice(-400)); }

  async function open(profileId){
    const profile = window.LABDS.TERMINALS.find(item => item.id === profileId);
    if(!profile) throw new Error('Terminal não encontrado.');
    cancelOperation(false);
    state.profile = profile;
    state.fs = window.LABDS.VirtualFS.load(profile);
    state.shell = window.LABDS.createShell(profile, state.fs, print, clear);
    await loadHistory();
    state.shell.history = state.history;
    setTheme(profile);
    $('#terminalTitle').textContent = profile.name;
    $('#terminalSubtitle').textContent = profile.subtitle;
    $('#terminalStatusType').textContent = profile.runtimeLabel;
    clear();
    print(profile.boot || '', 'dim');
    renderHelp();
    updatePrompt();
    status('pronto','success');
    input.value = '';
    window.LABDS.Session.record({laboratoryId:profile.id,laboratoryName:profile.name,eventType:'terminal',action:'Terminal iniciado',status:'success',context:{currentDirectory:state.fs.displayPath(),shell:profile.shell,simulation:true}});
    setTimeout(() => input.focus(), 50);
  }

  function parseCommand(raw){ return window.LABDS.CommandAudit.parse(raw); }

  function networkStyle(){ return state.profile?.os === 'windows' ? 'windows' : 'unix'; }

  function networkCommand(parsed){
    if(['ping','tracert','traceroute','nslookup','resolve-dnsname','test-connection'].includes(parsed.command)) return true;
    return false;
  }

  async function runNetwork(parsed){
    const controller = new AbortController();
    state.activeOperation = controller;
    status('executando','busy');
    const profileId = state.networkProfile, seed = state.networkSeed, style = networkStyle();
    const outputLines=[];
    const line = (text, kind='') => { outputLines.push(String(text??'')); print(text,kind); };
    const startedAt=performance.now(),cwd=state.fs.displayPath();
    let result=null,eventStatus='success',errorText='';
    try{
      if(parsed.command === 'ping' || parsed.command === 'test-connection'){
        const host = parsed.args.find(arg => !arg.startsWith('-') && !arg.startsWith('/')) || 'localhost';
        let count = 4;
        const countFlag = parsed.args.findIndex(arg => ['-n','-c','-count'].includes(arg.toLowerCase()));
        if(countFlag >= 0) count = Number(parsed.args[countFlag+1]) || 4;
        const continuous = parsed.args.some(arg => ['-t','-continuous'].includes(arg.toLowerCase()));
        result=await window.LABDS.NetworkEngine.ping({host,count,continuous,style,profileId,seed,onLine:line,signal:controller.signal});
      }else if(parsed.command === 'tracert' || parsed.command === 'traceroute'){
        const host = parsed.args.find(arg => !arg.startsWith('-') && !arg.startsWith('/')) || 'servidor.local';
        result=await window.LABDS.NetworkEngine.traceroute({host,style,profileId,seed,onLine:line,signal:controller.signal});
      }else{
        const host = parsed.args.find(arg => !arg.startsWith('-')) || 'servidor.local';
        result=await window.LABDS.NetworkEngine.dnsLookup({host,profileId,onLine:line,signal:controller.signal});
      }
      status('concluído','success');
    }catch(error){
      if(error.name === 'AbortError'){print('^C','warning');outputLines.push('^C');status('interrompido','warning');eventStatus='interrupted';errorText='Operação interrompida com Ctrl+C';}
      else{print(`Erro na simulação de rede: ${error.message}`,'error');outputLines.push(error.message);status('erro','error');eventStatus='error';errorText=error.message;}
    }finally{
      const elapsed=Math.round(performance.now()-startedAt);
      window.LABDS.Session.record({laboratoryId:state.profile.id,laboratoryName:state.profile.name,eventType:'network_test',action:`${parsed.command} ${parsed.args.join(' ')}`.trim(),input:parsed.line,output:outputLines.join('\n'),status:eventStatus,error:errorText,context:{currentDirectory:cwd,profile:profileId,seed:seed||null,durationMs:elapsed,result}});
      state.activeOperation = null;updatePrompt();input.focus();
    }
  }
  async function execute(raw){
    const parsed = parseCommand(raw);
    if(!parsed.line || !state.shell || state.activeOperation) return;
    printCommand(parsed.line);state.history.push(parsed.line);state.history=state.history.slice(-400);state.historyIndex=state.history.length;state.shell.history=state.history;saveHistory();input.value='';
    if(networkCommand(parsed)) return runNetwork(parsed);
    status('processando','busy');
    const started=performance.now(),cwdBefore=state.fs.displayPath(),fsBefore=JSON.stringify(state.fs.root);
    let result='',eventStatus='success',errorText='';
    try{
      result=await state.shell.run(parsed.line);
      const elapsed=performance.now()-started;if(elapsed<70)await new Promise(resolve=>setTimeout(resolve,45+Math.random()*70));
      if(result!==''&&result!==null&&result!==undefined){const isError=/(não é reconhecido|comando não encontrado|not found|erro|incorreta|cannot|não encontrado|acesso negado|invalid|permission denied|não suportad)/i.test(String(result));print(result,isError?'error':'');if(isError)eventStatus='error';}
      state.fs.save();status(eventStatus==='error'?'erro':'pronto',eventStatus==='error'?'error':'success');
    }catch(error){errorText=error?.message||'Erro interno do terminal.';result=errorText;eventStatus='error';print(errorText,'error');status('erro','error');}
    const cwdAfter=state.fs.displayPath(),fsChanged=fsBefore!==JSON.stringify(state.fs.root),descriptor=window.LABDS.CommandAudit.descriptor(state.profile.shell==='cmd'?'cmd':state.profile.shell==='powershell'?'powershell':'bash',parsed.command);
    window.LABDS.Session.record({laboratoryId:state.profile.id,laboratoryName:state.profile.name,eventType:'command_execution',action:`Comando ${parsed.command}`,input:parsed.line,output:String(result??''),status:eventStatus,error:errorText,context:{currentDirectory:cwdBefore,currentDirectoryAfter:cwdAfter,command:parsed.command,arguments:parsed.args,options:parsed.options,operands:parsed.operands,resultCode:eventStatus==='success'?0:1,durationMs:Math.round(performance.now()-started),filesystemChanged:fsChanged,declaredChanges:descriptor?.changes||[]}});
    updatePrompt();input.focus();
  }
  function cancelOperation(show = true){
    if(state.activeOperation){ state.activeOperation.abort(); state.activeOperation = null; window.LABDS.Session.record({laboratoryId:state.profile?.id,laboratoryName:state.profile?.name,eventType:'command_interrupt',action:'Operação interrompida com Ctrl+C',status:'interrupted',context:{currentDirectory:state.fs?.displayPath()}}); return true; }
    if(show && state.shell){ printCommand(`${input.value}^C`); input.value = ''; }
    status('pronto','success');
    return false;
  }

  function complete(){
    if(!state.fs || !state.profile) return;
    const value = input.value;
    const match = value.match(/(?:^|\s)([^\s]*)$/);
    const token = match ? match[1] : '';
    if(!token) return;
    const before = value.slice(0,value.length-token.length);
    const first = before.trim() === '';
    if(first){
      const names = [...new Set(getCatalog().flatMap(item => item.command.split(/[\s|/]+/)).filter(Boolean))];
      const matches = names.filter(name => name.toLowerCase().startsWith(token.toLowerCase()));
      if(matches.length === 1){ input.value = `${before}${matches[0]} `; return; }
      if(matches.length > 1){ print(matches.join('  '),'dim'); return; }
    }
    try{
      const sep = state.profile.os === 'windows' ? '\\' : '/';
      const pieces = token.split(/[\\/]/);
      const prefix = pieces.pop() || '';
      const dirToken = pieces.join(sep);
      const base = dirToken ? state.fs.resolve(dirToken) : state.fs.cwd;
      const node = state.fs.getNode(base);
      if(!node || node.type !== 'dir') return;
      const matches = Object.keys(node.children).filter(name => state.fs.caseSensitive ? name.startsWith(prefix) : name.toLowerCase().startsWith(prefix.toLowerCase()));
      if(matches.length === 1){ const name=matches[0]; input.value = `${before}${dirToken ? dirToken+sep : ''}${name}${node.children[name].type==='dir'?sep:''}`; }
      else if(matches.length>1) print(matches.join('  '),'dim');
    }catch{}
  }

  function transcript(){
    return [
      'LABORATÓRIO VIRTUAL DS',
      `Ferramenta: ${state.profile?.name || 'Terminal'}`,
      `Ambiente: ${state.profile?.subtitle || ''}`,
      `Perfil de rede: ${window.LABDS.NetworkEngine.profiles[state.networkProfile]?.label || state.networkProfile}`,
      `Exportado em: ${new Date().toLocaleString('pt-BR')}`,
      `Diretório atual: ${state.fs?.displayPath() || '/'}`,
      '', '===== SESSÃO =====', output.innerText || '(sem saída)', '', '===== COMANDOS =====',
      state.history.map((command,index)=>`${String(index+1).padStart(3,'0')}. ${command}`).join('\n') || '(nenhum)', ''
    ].join('\n');
  }

  function native(){
    const commands = state.history.join(state.profile?.os === 'windows' ? '\r\n' : '\n');
    if(state.profile?.shell === 'cmd') return `@echo off\r\nREM Exportado do Laboratório Virtual DS\r\nREM Revise antes de executar em um sistema real.\r\n\r\n${commands}\r\n`;
    if(state.profile?.shell === 'powershell') return `# Exportado do Laboratório Virtual DS\n# Revise antes de executar em um sistema real.\n\n${commands}\n`;
    return `#!/usr/bin/env bash\n# Exportado do Laboratório Virtual DS\n# Revise antes de executar em um sistema real.\n\n${commands}\n`;
  }

  function exportPayload(){ return {text:transcript(),native:native(),backup:{...state.fs.exportData(),history:state.history,networkProfile:state.networkProfile,networkSeed:state.networkSeed},meta:[{label:'Diretório atual',value:state.fs?.displayPath()||'/'},{label:'Perfil de rede',value:window.LABDS.NetworkEngine.profiles[state.networkProfile]?.label||state.networkProfile}]}; }

  function getState(){ return {...state}; }
  function setNetworkProfile(profileId, seed=''){
    if(window.LABDS.NetworkEngine.profiles[profileId]) state.networkProfile=profileId;
    state.networkSeed=String(seed||'');
    window.LABDS.Storage.smallSet('networkProfile',state.networkProfile);
    window.LABDS.Storage.smallSet('networkSeed',state.networkSeed);
  }

  function reset(){
    if(!state.fs) return;
    state.fs.reset(); state.history=[]; state.historyIndex=0; saveHistory(); clear(); print(state.profile.boot||'','dim'); updatePrompt(); window.LABDS.Session.record({laboratoryId:state.profile.id,laboratoryName:state.profile.name,eventType:'terminal_reset',action:'Terminal restaurado ao estado inicial',status:'success'});
  }

  function bind(){
    form.addEventListener('submit', event => { event.preventDefault(); execute(input.value); });
    input.addEventListener('keydown', event => {
      if(event.key === 'ArrowUp'){ event.preventDefault(); if(state.history.length){ state.historyIndex=Math.max(0,state.historyIndex-1); input.value=state.history[state.historyIndex]||''; queueMicrotask(()=>input.setSelectionRange(input.value.length,input.value.length)); } }
      else if(event.key === 'ArrowDown'){ event.preventDefault(); if(state.history.length){ state.historyIndex=Math.min(state.history.length,state.historyIndex+1); input.value=state.history[state.historyIndex]||''; queueMicrotask(()=>input.setSelectionRange(input.value.length,input.value.length)); } }
      else if(event.key === 'Tab'){ event.preventDefault(); complete(); }
      else if(event.ctrlKey && event.key.toLowerCase()==='l'){ event.preventDefault(); clear(); }
      else if(event.ctrlKey && event.key.toLowerCase()==='c'){ event.preventDefault(); cancelOperation(true); }
    });
    helpSearch.addEventListener('input',()=>renderHelp(helpSearch.value));
    $('#terminalHelpBtn').addEventListener('click',()=>{ windowEl.classList.toggle('side-open'); if(windowEl.classList.contains('side-open')) setTimeout(()=>helpSearch.focus(),50); else input.focus(); });
    $('#closeTerminalSide').addEventListener('click',()=>{windowEl.classList.remove('side-open');input.focus();});
    $('#terminalMinDot').addEventListener('click',()=>windowEl.classList.toggle('minimized'));
    $('#terminalMaxDot').addEventListener('click',()=>windowEl.classList.toggle('maximized'));
    $('#terminalCloseDot').addEventListener('click',()=>window.LABDS.App.goHome());
    $('#terminalFontUp').addEventListener('click',()=>{state.fontSize=Math.min(26,state.fontSize+1);document.documentElement.style.setProperty('--terminal-font-size',`${state.fontSize}px`);window.LABDS.Storage.smallSet('terminalFont',state.fontSize);});
    $('#terminalFontDown').addEventListener('click',()=>{state.fontSize=Math.max(11,state.fontSize-1);document.documentElement.style.setProperty('--terminal-font-size',`${state.fontSize}px`);window.LABDS.Storage.smallSet('terminalFont',state.fontSize);});
    $('#terminalFullscreenBtn').addEventListener('click',async()=>{try{if(!document.fullscreenElement) await windowEl.requestFullscreen();else await document.exitFullscreen();}catch{windowEl.classList.toggle('maximized');}});
    $('#terminalResetBtn').addEventListener('click',()=>{if(confirm('Restaurar este terminal? Os arquivos virtuais e o histórico serão apagados.')) reset();});
    $('#terminalCopyBtn').addEventListener('click',()=>{navigator.clipboard?.writeText(output.innerText||'').then(()=>window.LABDS.App.toast('Saída copiada.','success')).catch(()=>window.LABDS.App.toast('Não foi possível copiar a saída.','error'));});
    $('#terminalImportBtn').addEventListener('click',()=>$('#terminalImportFile').click());
    $('#terminalImportFile').addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file||!state.fs)return;try{const data=JSON.parse(await file.text());state.fs.importData(data);if(Array.isArray(data.history)){state.history=data.history.slice(-400);state.shell.history=state.history;await saveHistory();}if(data.networkProfile)state.networkProfile=data.networkProfile;if(data.networkSeed)state.networkSeed=data.networkSeed;clear();print(state.profile.boot||'','dim');print('Ambiente importado com sucesso.','success');updatePrompt();window.LABDS.Session.record({laboratoryId:state.profile.id,laboratoryName:state.profile.name,eventType:'import',action:'Ambiente virtual importado',status:'success',context:{fileName:file.name,fileSize:file.size}});}catch(error){print(`Falha ao importar: ${error.message}`,'error');}event.target.value='';});
    $('.mobile-keybar').addEventListener('click',event=>{
      const button=event.target.closest('button');if(!button)return;
      if(button.dataset.insert){const start=input.selectionStart,end=input.selectionEnd;input.value=input.value.slice(0,start)+button.dataset.insert+input.value.slice(end);input.setSelectionRange(start+button.dataset.insert.length,start+button.dataset.insert.length);}
      else if(button.dataset.key==='Tab') complete();
      else if(button.dataset.key==='ArrowUp'){input.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true}));}
      else if(button.dataset.key==='ArrowDown'){input.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));}
      else if(button.dataset.action==='interrupt') cancelOperation(true);
      input.focus();
    });
  }

  bind();
  window.LABDS.Terminal = {open,execute,cancelOperation,exportPayload,getState,setNetworkProfile,reset,renderHelp};
})();
