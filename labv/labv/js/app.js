'use strict';

(function(){
  const $ = sel => document.querySelector(sel);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const state = {
    profile:null,
    fs:null,
    shell:null,
    history:[],
    historyIndex:0,
    fontSize:Number(localStorage.getItem('labds.ui.fontSize') || 15),
    toastTimer:null
  };

  const toolGrid = $('#toolGrid');
  const home = $('#home');
  const terminalScreen = $('#terminalScreen');
  const terminalWindow = $('#terminalWindow');
  const output = $('#terminalOutput');
  const form = $('#terminalForm');
  const input = $('#commandInput');
  const promptLabel = $('#promptLabel');
  const guideContent = $('#guideContent');
  const guideSearch = $('#guideSearch');
  const exportModal = $('#exportModal');
  const nativeExportIcon = $('#nativeExportIcon');
  const nativeExportTitle = $('#nativeExportTitle');
  const nativeExportDescription = $('#nativeExportDescription');

  document.documentElement.style.setProperty('--term-font', `${state.fontSize}px`);

  function toast(message){
    const t = $('#toast');
    clearTimeout(state.toastTimer);
    t.textContent = message;
    t.classList.remove('hidden');
    state.toastTimer = setTimeout(() => t.classList.add('hidden'), 2800);
  }

  function storageHistoryKey(profile){ return `labds.history.${profile.id}.v1`; }
  function loadHistory(profile){
    try{
      const data = JSON.parse(localStorage.getItem(storageHistoryKey(profile)) || '[]');
      return Array.isArray(data) ? data.slice(-300) : [];
    }catch{return [];}
  }
  function saveHistory(){
    if(!state.profile) return;
    try{ localStorage.setItem(storageHistoryKey(state.profile), JSON.stringify(state.history.slice(-300))); }catch{}
  }

  function renderCards(){
    toolGrid.innerHTML = window.LABDS_TERMINALS.map(t => `
      <button class="tool-card" type="button" data-id="${esc(t.id)}" aria-label="Abrir ${esc(t.name)}">
        <div class="tool-top">
          <span class="tool-icon">${esc(t.icon)}</span>
          <div><h3>${esc(t.name)}</h3><p>${esc(t.subtitle)}</p></div>
        </div>
        <div class="tool-tags">${t.tags.map(tag => `<span>${esc(tag)}</span>`).join('')}</div>
      </button>
    `).join('');
  }

  function print(text = '', cls = ''){
    const fragment = document.createDocumentFragment();
    String(text ?? '').split('\n').forEach(line => {
      const div = document.createElement('div');
      div.className = `line ${cls}`.trim();
      div.textContent = line || ' ';
      fragment.appendChild(div);
    });
    output.appendChild(fragment);
    output.scrollTop = output.scrollHeight;
  }

  function printCommand(prompt, command){
    const div = document.createElement('div');
    div.className = 'line';
    const p = document.createElement('span');
    p.style.color = 'var(--accent)';
    p.textContent = prompt;
    div.append(p, document.createTextNode(command));
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
  }

  function clearOutput(){ output.textContent = ''; }

  function updatePrompt(){
    const prompt = state.shell ? state.shell.prompt() : '> ';
    promptLabel.textContent = prompt;
    $('#statusPath').textContent = state.fs ? state.fs.displayPath() : '/';
  }

  function catalogKey(profile){
    if(!profile) return 'bash';
    if(profile.shell === 'cmd') return 'cmd';
    if(profile.shell === 'powershell') return 'powershell';
    if(profile.os === 'macos') return 'macos';
    return 'bash';
  }

  function getCatalog(){
    return (window.LABDS_COMMAND_CATALOG || {})[catalogKey(state.profile)] || [];
  }

  function renderGuide(filter = ''){
    const q = filter.trim().toLowerCase();
    const rows = getCatalog().filter(item => !q || `${item.command} ${item.description} ${item.example}`.toLowerCase().includes(q));
    guideContent.innerHTML = rows.length ? rows.map(item => `
      <article class="command-item">
        <code>${esc(item.command)}</code>
        <p>${esc(item.description)}</p>
        <small>${esc(item.example)}</small>
      </article>
    `).join('') : '<p>Nenhum comando encontrado.</p>';
  }

  function openTerminal(id){
    const profile = window.LABDS_TERMINALS.find(t => t.id === id);
    if(!profile) return;

    state.profile = profile;
    state.fs = window.LABDS.VirtualFS.load(profile);
    state.shell = window.LABDS.createShell(profile, state.fs, print, clearOutput);
    state.history = loadHistory(profile);
    state.historyIndex = state.history.length;
    state.shell.history = state.history;

    document.body.className = profile.theme || '';
    $('#terminalTitle').textContent = profile.name;
    $('#terminalSubtitle').textContent = profile.subtitle;
    $('#statusShell').textContent = `${profile.name} • ${window.LABDS_VERSION}`;

    terminalWindow.classList.remove('minimized');
    clearOutput();
    print(profile.boot || '', 'dim');
    home.classList.remove('active');
    terminalScreen.classList.add('active');
    renderGuide();
    guideSearch.value = '';
    updatePrompt();
    input.value = '';
    setTimeout(() => input.focus(), 40);
  }

  async function executeCommand(rawCommand){
    const command = String(rawCommand ?? '').trim();
    if(!state.shell || !command) return;

    printCommand(state.shell.prompt(), command);
    state.history.push(command);
    state.history = state.history.slice(-300);
    state.historyIndex = state.history.length;
    saveHistory();
    state.shell.history = state.history;
    input.value = '';

    try{
      const result = await state.shell.run(command);
      if(result !== '' && result !== null && result !== undefined){
        const isError = /(não é reconhecido|comando não encontrado|not found|erro|incorreta|cannot|não encontrado|acesso negado|invalid)/i.test(String(result));
        print(result, isError ? 'bash-error' : '');
      }
    }catch(error){
      console.error(error);
      print(`Erro interno do laboratório: ${error.message}`, 'bash-error');
    }

    updatePrompt();
    state.fs.save();
    input.focus();
  }

  function getCommandNames(){
    const names = [];
    getCatalog().forEach(item => item.command.split(/\s*\/\s*|\s+/).forEach(name => {
      const clean = name.replace(/[|]/g, '').trim();
      if(clean && !clean.startsWith('-')) names.push(clean);
    }));
    return [...new Set(names)];
  }

  function autocomplete(){
    if(!state.fs) return;
    const value = input.value;
    const tokenMatch = value.match(/(?:^|\s)([^\s]*)$/);
    const last = tokenMatch ? tokenMatch[1] : '';
    if(!last) return;

    const before = value.slice(0, value.length - last.length);
    const isFirstToken = before.trim() === '';

    if(isFirstToken){
      const matches = getCommandNames().filter(name => name.toLowerCase().startsWith(last.toLowerCase()));
      if(matches.length === 1){ input.value = before + matches[0] + ' '; return; }
      if(matches.length > 1){ print(matches.join('  '), 'dim'); return; }
    }

    try{
      const separator = state.profile.os === 'windows' ? '\\' : '/';
      const chunks = last.split(/[\\/]/);
      const prefix = chunks.pop() || '';
      const directoryToken = chunks.join(separator);
      const base = directoryToken ? state.fs.resolve(directoryToken) : state.fs.cwd;
      const node = state.fs.getNode(base);
      if(!node || node.type !== 'dir') return;

      const matches = Object.keys(node.children).filter(name => state.fs.caseSensitive
        ? name.startsWith(prefix)
        : name.toLowerCase().startsWith(prefix.toLowerCase()));

      if(matches.length === 1){
        const found = matches[0];
        const leading = directoryToken ? directoryToken + separator : '';
        input.value = before + leading + found + (node.children[found].type === 'dir' ? separator : '');
      }else if(matches.length > 1){
        print(matches.join('  '), 'dim');
      }
    }catch{}
  }

  function goHome(){
    terminalScreen.classList.remove('active');
    home.classList.add('active');
    terminalWindow.classList.remove('full', 'minimized', 'guide-open');
    document.body.className = '';
    if(document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }

  function safeFilename(value){
    return String(value || 'laboratorio')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }

  function downloadBlob(content, filename, mime = 'text/plain;charset=utf-8'){
    const blob = content instanceof Blob ? content : new Blob([content], {type:mime});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  }

  function exportJson(data, filename){
    downloadBlob(JSON.stringify(data, null, 2), filename, 'application/json;charset=utf-8');
  }

  function sessionDate(){
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  }

  function terminalTranscript(){
    const profile = state.profile || {};
    const lines = [
      'LABORATÓRIO VIRTUAL DS',
      `Ferramenta: ${profile.name || 'Terminal'}`,
      `Ambiente: ${profile.subtitle || ''}`,
      `Exportado em: ${new Date().toLocaleString('pt-BR')}`,
      `Diretório atual: ${state.fs ? state.fs.displayPath() : '/'}`,
      '',
      '===== HISTÓRICO VISÍVEL DA SESSÃO =====',
      output.innerText || '(sem saída registrada)',
      '',
      '===== COMANDOS EXECUTADOS =====',
      state.history.length ? state.history.map((cmd, index) => `${String(index + 1).padStart(3, '0')}. ${cmd}`).join('\n') : '(nenhum comando executado)',
      ''
    ];
    return lines.join('\n');
  }

  function nativeScriptContent(){
    const profile = state.profile || {};
    const commands = state.history.slice();
    const exported = new Date().toLocaleString('pt-BR');

    if(profile.shell === 'cmd'){
      return [
        '@echo off',
        'REM Laboratório Virtual DS - script exportado do ambiente CMD',
        `REM Exportado em ${exported}`,
        'REM Revise os comandos antes de executar fora do laboratório.',
        '',
        ...commands,
        ''
      ].join('\r\n');
    }

    if(profile.shell === 'powershell'){
      return [
        '# Laboratório Virtual DS - script exportado do PowerShell',
        `# Exportado em ${exported}`,
        '# Revise os comandos antes de executar fora do laboratório.',
        '',
        ...commands,
        ''
      ].join('\n');
    }

    return [
      '#!/usr/bin/env bash',
      '# Laboratório Virtual DS - script exportado do terminal Unix',
      `# Exportado em ${exported}`,
      '# Revise os comandos antes de executar fora do laboratório.',
      '',
      ...commands,
      ''
    ].join('\n');
  }

  function openPdfPrintView(){
    const profile = state.profile || {};
    const popup = window.open('', '_blank');
    if(popup) popup.opener = null;
    if(!popup){
      toast('O navegador bloqueou a janela do PDF. Libere pop-ups e tente novamente.');
      return;
    }
    const transcript = terminalTranscript();
    const escaped = transcript.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    popup.document.open();
    popup.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório - ${esc(profile.name || 'Laboratório Virtual DS')}</title><style>
      @page{size:A4;margin:16mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#152033;margin:0}header{border-bottom:3px solid #0a7d5d;padding-bottom:12px;margin-bottom:18px}h1{font-size:24px;margin:0 0 5px}p{margin:3px 0;color:#526175}.meta{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:14px 0;padding:12px;background:#f1f6f5;border:1px solid #d5e3df;border-radius:8px}.meta b{display:block;color:#132a23}pre{white-space:pre-wrap;word-break:break-word;font:11px/1.45 Consolas,monospace;background:#f7f9fb;border:1px solid #d9e0e8;padding:14px;border-radius:8px}footer{margin-top:14px;font-size:10px;color:#68788c}@media print{button{display:none}}
    </style></head><body><header><h1>Laboratório Virtual DS</h1><p>Relatório de sessão do terminal simulado</p></header><section class="meta"><div><b>Ferramenta</b>${esc(profile.name || 'Terminal')}</div><div><b>Data</b>${esc(new Date().toLocaleString('pt-BR'))}</div><div><b>Ambiente</b>${esc(profile.subtitle || '')}</div><div><b>Diretório atual</b>${esc(state.fs ? state.fs.displayPath() : '/')}</div></section><pre>${escaped}</pre><footer>Este relatório foi gerado por um ambiente totalmente simulado no navegador. Nenhum comando foi executado no sistema real.</footer><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250));<\/script></body></html>`);
    popup.document.close();
  }

  function updateExportModal(){
    if(!state.profile) return;
    const ext = (state.profile.exportExtension || 'txt').toUpperCase();
    nativeExportIcon.textContent = `.${ext}`;
    nativeExportTitle.textContent = state.profile.exportLabel || `Arquivo .${ext.toLowerCase()}`;
    nativeExportDescription.textContent = `Exporta os comandos executados como .${ext.toLowerCase()}, adequado ao ambiente ${state.profile.name}.`;
    $('#exportModalDescription').textContent = `${state.profile.name} — escolha como deseja salvar esta sessão.`;
  }

  function openExportModal(){
    if(!state.profile || !state.fs) return;
    updateExportModal();
    exportModal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    setTimeout(() => exportModal.querySelector('[data-export-format="txt"]')?.focus(), 40);
  }

  function closeExportModal(){
    exportModal.classList.add('hidden');
    document.body.classList.remove('modal-open');
    setTimeout(() => input.focus(), 30);
  }

  function exportCurrent(format){
    if(!state.profile || !state.fs) return;
    const base = safeFilename(`${state.profile.id}-${sessionDate()}`);

    if(format === 'txt'){
      downloadBlob(terminalTranscript(), `${base}.txt`, 'text/plain;charset=utf-8');
      toast('Relatório TXT exportado.');
    }else if(format === 'pdf'){
      openPdfPrintView();
    }else if(format === 'native'){
      const ext = state.profile.exportExtension || 'txt';
      downloadBlob(nativeScriptContent(), `${base}.${ext}`, state.profile.exportMime || 'text/plain;charset=utf-8');
      toast(`Arquivo .${ext} exportado.`);
    }else if(format === 'backup'){
      exportJson(state.fs.exportData(), `ambiente-${state.profile.id}-${new Date().toISOString().slice(0,10)}.json`);
      toast('Backup JSON exportado.');
    }
    closeExportModal();
  }

  function exportAll(){
    const environments = {};
    window.LABDS_TERMINALS.forEach(profile => {
      const fs = window.LABDS.VirtualFS.load(profile);
      environments[profile.id] = fs.exportData();
    });
    exportJson({version:window.LABDS_VERSION, type:'labds-all', exportedAt:new Date().toISOString(), environments}, `laboratorio-ds-backup-${new Date().toISOString().slice(0,10)}.json`);
  }

  async function importAll(file){
    const data = JSON.parse(await file.text());
    if(!data || data.type !== 'labds-all' || !data.environments) throw new Error('Este arquivo não é um backup completo do Laboratório Virtual DS.');
    Object.entries(data.environments).forEach(([id, env]) => {
      const profile = window.LABDS_TERMINALS.find(t => t.id === id);
      if(!profile) return;
      const fs = window.LABDS.VirtualFS.load(profile);
      fs.importData(env);
    });
  }

  toolGrid.addEventListener('click', event => {
    const card = event.target.closest('[data-id]');
    if(card) openTerminal(card.dataset.id);
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    executeCommand(input.value);
  });

  input.addEventListener('keydown', event => {
    if(event.key === 'ArrowUp'){
      event.preventDefault();
      if(state.history.length){
        state.historyIndex = Math.max(0, state.historyIndex - 1);
        input.value = state.history[state.historyIndex] || '';
        queueMicrotask(() => input.setSelectionRange(input.value.length, input.value.length));
      }
    }else if(event.key === 'ArrowDown'){
      event.preventDefault();
      if(state.history.length){
        state.historyIndex = Math.min(state.history.length, state.historyIndex + 1);
        input.value = state.history[state.historyIndex] || '';
        queueMicrotask(() => input.setSelectionRange(input.value.length, input.value.length));
      }
    }else if(event.key === 'Tab'){
      event.preventDefault();
      autocomplete();
    }else if(event.ctrlKey && event.key.toLowerCase() === 'l'){
      event.preventDefault();
      clearOutput();
    }else if(event.ctrlKey && event.key.toLowerCase() === 'c'){
      event.preventDefault();
      printCommand(state.shell.prompt(), `${input.value}^C`);
      input.value = '';
    }
  });

  guideSearch.addEventListener('input', () => renderGuide(guideSearch.value));
  $('#guideBtn').addEventListener('click', () => {
    terminalWindow.classList.toggle('guide-open');
    if(terminalWindow.classList.contains('guide-open')) setTimeout(() => guideSearch.focus(), 80);
    else input.focus();
  });
  $('#closeGuideBtn').addEventListener('click', () => { terminalWindow.classList.remove('guide-open'); input.focus(); });

  $('#backBtn').addEventListener('click', goHome);
  $('#closeWindowBtn').addEventListener('click', goHome);
  $('#minimizeWindowBtn').addEventListener('click', () => terminalWindow.classList.toggle('minimized'));
  $('#maximizeWindowBtn').addEventListener('click', () => { terminalWindow.classList.toggle('full'); terminalWindow.classList.remove('minimized'); setTimeout(() => input.focus(), 50); });

  $('#fullscreenBtn').addEventListener('click', async () => {
    try{
      if(!document.fullscreenElement) await terminalWindow.requestFullscreen();
      else await document.exitFullscreen();
    }catch{
      terminalWindow.classList.toggle('full');
    }
    setTimeout(() => input.focus(), 80);
  });

  $('#fontPlusBtn').addEventListener('click', () => {
    state.fontSize = Math.min(26, state.fontSize + 1);
    document.documentElement.style.setProperty('--term-font', `${state.fontSize}px`);
    localStorage.setItem('labds.ui.fontSize', state.fontSize);
  });
  $('#fontMinusBtn').addEventListener('click', () => {
    state.fontSize = Math.max(11, state.fontSize - 1);
    document.documentElement.style.setProperty('--term-font', `${state.fontSize}px`);
    localStorage.setItem('labds.ui.fontSize', state.fontSize);
  });

  $('#resetBtn').addEventListener('click', () => {
    if(!state.fs) return;
    if(confirm('Restaurar o ambiente original deste terminal? Todos os arquivos virtuais deste ambiente serão apagados.')){
      state.fs.reset();
      localStorage.removeItem(storageHistoryKey(state.profile));
      openTerminal(state.profile.id);
      toast('Ambiente restaurado.');
    }
  });

  $('#clearAllBtn').addEventListener('click', () => {
    if(confirm('Excluir todos os arquivos, históricos e configurações virtuais salvos neste navegador?')){
      Object.keys(localStorage).filter(key => key.startsWith('labds.')).forEach(key => localStorage.removeItem(key));
      toast('Todos os dados virtuais foram excluídos.');
    }
  });

  $('#exportBtn').addEventListener('click', openExportModal);
  $('#closeExportModalBtn').addEventListener('click', closeExportModal);
  $('#cancelExportBtn').addEventListener('click', closeExportModal);
  exportModal.addEventListener('click', event => {
    if(event.target === exportModal) closeExportModal();
    const option = event.target.closest('[data-export-format]');
    if(option) exportCurrent(option.dataset.exportFormat);
  });
  document.addEventListener('keydown', event => {
    if(event.key === 'Escape' && !exportModal.classList.contains('hidden')){
      event.preventDefault();
      closeExportModal();
    }
  });

  $('#exportAllBtn').addEventListener('click', exportAll);

  $('#importInput').addEventListener('change', async event => {
    const file = event.target.files[0];
    if(!file || !state.fs) return;
    try{
      const data = JSON.parse(await file.text());
      if(data.profile && data.profile !== state.profile.id && !confirm(`Este backup pertence ao terminal “${data.profile}”. Importar mesmo assim?`)) return;
      state.fs.importData(data);
      openTerminal(state.profile.id);
      toast('Ambiente importado.');
    }catch(error){ toast(`Falha ao importar: ${error.message}`); }
    event.target.value = '';
  });

  $('#importAllBtn').addEventListener('click', () => $('#importAllInput').click());
  $('#importAllInput').addEventListener('change', async event => {
    const file = event.target.files[0];
    if(!file) return;
    try{ await importAll(file); toast('Backup completo importado.'); }
    catch(error){ toast(`Falha ao importar: ${error.message}`); }
    event.target.value = '';
  });

  document.addEventListener('click', event => {
    if(terminalScreen.classList.contains('active') && !event.target.closest('button,label,input,.guide-panel')) input.focus();
  });

  window.addEventListener('beforeunload', () => state.fs?.save());
  renderCards();
})();
