'use strict';

(function(){
  window.LABDS = window.LABDS || {};
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const state = {currentTool:null,currentLab:null,activeFilter:'all',deferredInstall:null,loadedModules:new Set(),pendingToolId:null,exportAbort:null};
  const screens={home:$('#homeScreen'),terminal:$('#terminalScreen'),lab:$('#labScreen')};

  function toast(message,tone='info',duration=3000){const region=$('#toastRegion'),item=document.createElement('div');item.className=`toast ${tone}`;item.textContent=message;region.appendChild(item);requestAnimationFrame(()=>item.classList.add('show'));setTimeout(()=>{item.classList.remove('show');setTimeout(()=>item.remove(),250);},duration);}
  function showScreen(name){Object.entries(screens).forEach(([key,element])=>element?.classList.toggle('active',key===name));window.scrollTo({top:0,behavior:'instant'});}
  function runtimeClass(runtime){return runtime==='real'?'runtime-real':runtime==='real-online'?'runtime-online':runtime==='simulation'?'runtime-sim':'runtime-demo';}
  function formatDuration(seconds){return window.LABDS.SessionExporter.duration(seconds);}
  function normalizeSearch(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
  function expandedQuery(value){const query=normalizeSearch(value),aliases={js:'javascript',vm:'virtualizacao',bd:'sql',so:'sistemas operacionais'};return aliases[query]||query;}

  function card(tool){
    const article=document.createElement('article');article.className='tool-card';article.dataset.toolId=tool.id;article.dataset.category=tool.category;
    const button=document.createElement('button');button.type='button';button.className='tool-card-button';button.setAttribute('aria-label',`Abrir ${tool.name}`);
    button.innerHTML=`<div class="tool-card-top"><span class="tool-icon"></span><span class="runtime-dot ${runtimeClass(tool.runtime)}" title="${tool.runtimeLabel}"></span></div><div class="tool-card-copy"><h3></h3><p></p></div><div class="tool-card-meta"><span></span><span></span></div><div class="tool-card-footer"><small class="runtime-label ${runtimeClass(tool.runtime)}"></small><span aria-hidden="true">↗</span></div>`;
    button.querySelector('.tool-icon').textContent=tool.icon;button.querySelector('h3').textContent=tool.name;button.querySelector('.tool-card-copy p').textContent=tool.description;
    const meta=button.querySelectorAll('.tool-card-meta span');meta[0].textContent=window.LABDS.CATEGORY_LABELS[tool.category]||tool.category;meta[1].textContent=tool.level==='basic'?'Básico':tool.level==='intermediate'?'Intermediário':'Avançado';button.querySelector('.runtime-label').textContent=tool.runtimeLabel;
    button.addEventListener('click',()=>openTool(tool.id));article.appendChild(button);return article;
  }
  function renderHome(){const all=$('#allTools');if(all)all.textContent='';filterCatalog();}
  function filterCatalog(){const query=expandedQuery($('#toolSearch')?.value||''),os=$('#osFilter')?.value||'all',level=$('#levelFilter')?.value||'all';const tools=window.LABDS.TOOLS.filter(tool=>{const text=normalizeSearch(`${tool.id} ${tool.shortName||''} ${tool.name} ${tool.description} ${(tool.tags||[]).join(' ')} ${(tool.os||[]).join(' ')} ${tool.runtimeLabel||''} ${window.LABDS.CATEGORY_LABELS[tool.category]||''}`);const categoryOk=state.activeFilter==='featured'?tool.featured:state.activeFilter==='all'||tool.category===state.activeFilter;return categoryOk&&(os==='all'||tool.os.includes(os)||tool.os.includes('multi'))&&(level==='all'||tool.level===level)&&(!query||text.includes(query));});const all=$('#allTools');all.textContent='';tools.forEach(t=>all.appendChild(card(t)));$('#emptyTools').classList.toggle('hidden',tools.length>0);const count=$('#toolResultCount');if(count)count.textContent=`${tools.length} ${tools.length===1?'ferramenta encontrada':'ferramentas encontradas'}`;}
  function showCatalog(filter='all'){$('#catalogSection').classList.remove('hidden');state.activeFilter=filter;$$('.filter-chip').forEach(btn=>{const active=btn.dataset.filter===filter;btn.classList.toggle('active',active);btn.setAttribute('aria-selected',String(active));});filterCatalog();$('#catalogSection').scrollIntoView({behavior:'smooth',block:'start'});}
  async function loadModule(moduleName){if(state.loadedModules.has(moduleName)||window.LABDS_LABS?.[moduleName])return;await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=`js/labs/${moduleName}.js`;script.onload=()=>{state.loadedModules.add(moduleName);resolve();};script.onerror=()=>reject(new Error(`Não foi possível carregar o módulo ${moduleName}.`));document.head.appendChild(script);});}

  function updateSessionHeader(){
    const session=window.LABDS.Session.get(),header=$('#sessionHeader');
    if(!session){header.classList.add('hidden');return;}
    header.classList.remove('hidden');$('#sessionStudentName').textContent=session.studentName;$('#sessionStudentClass').textContent=session.studentClass;
  }
  function populateStudentClasses(){const select=$('#studentClassSelect');select.textContent='';window.LABDS.STUDENT_CLASSES.forEach(value=>{const option=document.createElement('option');option.value=value;option.textContent=value;select.appendChild(option);});$('#studentPrivacyNotice').textContent=window.LABDS.SESSION_PRIVACY_NOTICE;}
  function requestIdentification(toolId=null){state.pendingToolId=toolId;$('#studentNameInput').value='';$('#studentClassSelect').value=window.LABDS.STUDENT_CLASSES[0];$('#otherClassField').classList.add('hidden');$('#studentFormError').classList.add('hidden');$('#studentDialog').showModal();setTimeout(()=>$('#studentNameInput').focus(),50);}

  async function openTool(id){
    const tool=window.LABDS.TOOLS.find(item=>item.id===id);if(!tool)return toast('Ferramenta não encontrada.','error');
    if(!window.LABDS.Session.get()){requestIdentification(id);return;}
    state.currentTool=tool;window.LABDS.Storage.smallSet('lastTool',id);window.LABDS.Session.registerLab(tool);updateSessionHeader();document.body.classList.toggle('immersive-lab',Boolean(tool.immersive));$('#labScreen')?.classList.toggle('immersive-tool',Boolean(tool.immersive));
    if(tool.type==='terminal'){showScreen('terminal');try{await window.LABDS.Terminal.open(tool.id);document.dispatchEvent(new CustomEvent('labds:toolopen',{detail:{tool}}));}catch(error){toast(error.message,'error');goHome();}return;}
    showScreen('lab');$('#labTitle').textContent=tool.name;$('#labDescription').textContent=tool.description;$('#labEyebrow').textContent=(window.LABDS.CATEGORY_LABELS[tool.category]||'LABORATÓRIO').toUpperCase();$('#labRuntimeBadge').textContent=tool.runtimeLabel;$('#labRuntimeBadge').className=`runtime-badge ${runtimeClass(tool.runtime)}`;$('#labLoading').classList.remove('hidden');$('#labHost').textContent='';if(state.currentLab?.unmount){try{await state.currentLab.unmount();}catch{}}
    state.currentLab=null;
    try{await loadModule(tool.module);const lab=window.LABDS_LABS?.[tool.module];if(!lab)throw new Error('O módulo foi carregado, mas não registrou uma interface válida.');state.currentLab=lab;await lab.mount($('#labHost'),{tool,toast,storage:window.LABDS.Session.scopedStorage(window.LABDS.Storage),exporter:window.LABDS.Exporter,session:window.LABDS.Session,logEvent:data=>window.LABDS.Session.record({laboratoryId:tool.id,laboratoryName:tool.name,...data})});$('#labLoading').classList.add('hidden');document.dispatchEvent(new CustomEvent('labds:toolopen',{detail:{tool}}));}
    catch(error){$('#labLoading').classList.add('hidden');window.LABDS.Session.record({laboratoryId:tool.id,laboratoryName:tool.name,eventType:'error',action:'Falha ao abrir laboratório',status:'error',error:error.message});const failure=document.createElement('div');failure.className='lab-error-state';const strong=document.createElement('strong');strong.textContent='Não foi possível abrir este laboratório.';const p=document.createElement('p');p.textContent=error.message;const button=document.createElement('button');button.className='btn primary';button.type='button';button.textContent='Tentar novamente';button.addEventListener('click',()=>openTool(id));failure.append(strong,p,button);$('#labHost').appendChild(failure);toast(error.message,'error',5000);}
  }

  async function goHome(){window.LABDS.Terminal?.cancelOperation(false);if(state.currentLab?.unmount){try{await state.currentLab.unmount();}catch{}}if(state.currentTool&&window.LABDS.Session.get())window.LABDS.Session.record({laboratoryId:state.currentTool.id,laboratoryName:state.currentTool.name,eventType:'laboratory',action:'Laboratório fechado',status:'success'});document.dispatchEvent(new CustomEvent('labds:toolclose'));state.currentLab=null;state.currentTool=null;document.body.classList.remove('immersive-lab');$('#labScreen')?.classList.remove('immersive-tool');showScreen('home');document.body.removeAttribute('data-terminal-theme');if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});}
  function currentExportPayload(){if(state.currentTool?.type==='terminal')return window.LABDS.Terminal.exportPayload();return state.currentLab?.exportPayload?state.currentLab.exportPayload():{text:'Nenhum conteúdo disponível.',native:'',backup:{}};}
  function openExport(){if(!state.currentTool)return;$('#exportDialogDescription').textContent=`${state.currentTool.name} — escolha como deseja salvar a sessão.`;$('#nativeExportExtension').textContent=`.${String(state.currentTool.extension||'txt').toUpperCase()}`;$('#nativeExportName').textContent=`Arquivo ${state.currentTool.extension||'txt'}`;$('#nativeExportHelp').textContent='Formato próprio ou mais adequado para esta ferramenta.';$('#exportDialog').showModal();}
  async function exportCurrent(format){try{if(format==='native'&&state.currentLab?.exportNative)await state.currentLab.exportNative();else window.LABDS.Exporter.exportTextPackage(state.currentTool,currentExportPayload(),format);window.LABDS.Session.record({laboratoryId:state.currentTool.id,laboratoryName:state.currentTool.name,eventType:'export',action:`Artefato exportado em ${format.toUpperCase()}`,status:'success',context:{format}});toast(format==='pdf'?'Relatório aberto para salvar como PDF.':'Arquivo exportado.','success');$('#exportDialog').close();}catch(error){toast(error.message,'error',5000);}}
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
  function openHistory(){renderHistory();$('#historyDialog').showModal();}
  function renderFinish(){const session=window.LABDS.Session.get();if(!session)return;const sum=window.LABDS.Session.summary(session);$('#finishSummary').textContent=`${session.studentName} • ${session.studentClass} • sessão ${session.sessionId}`;const values=[['Duração',formatDuration(sum.duration)],['Laboratórios',sum.laboratories],['Ações',sum.actions],['Comandos',sum.commands],['Execuções',sum.executions],['Arquivos',sum.files],['Erros',sum.errors],['Testes',sum.tests]];const host=$('#finishStats');host.textContent='';values.forEach(([label,value])=>{const div=document.createElement('div');div.className='finish-stat';const span=document.createElement('span'),b=document.createElement('b');span.textContent=label;b.textContent=value;div.append(span,b);host.appendChild(div);});}
  function openFinish(){if(!window.LABDS.Session.get())return;renderFinish();$('#finishSessionDialog').showModal();}
  function openSessionInfo(){const session=window.LABDS.Session.get();if(!session)return;const sum=window.LABDS.Session.summary(session),host=$('#sessionInfoContent');host.textContent='';[['Estudante',session.studentName],['Turma',session.studentClass],['Sessão',session.sessionId],['Início',new Date(session.startedAt).toLocaleString('pt-BR')],['Tempo',formatDuration(sum.duration)],['Ações',sum.actions]].forEach(([a,b])=>{const row=document.createElement('div');row.className='session-info-row';const span=document.createElement('span'),strong=document.createElement('strong');span.textContent=a;strong.textContent=b;row.append(span,strong);host.appendChild(row);});$('#sessionInfoDialog').showModal();}

  async function exportSession(format){
    const session=window.LABDS.Session.get();if(!session)return toast('Não há sessão ativa.','warning');state.exportAbort=new AbortController();$('#exportProgressBar').style.width='0%';$('#exportProgressText').textContent='Iniciando...';$('#exportProgressDialog').showModal();
    try{await window.LABDS.SessionExporter.exportFormat(format,session,{signal:state.exportAbort.signal,onProgress:(value,text)=>{$('#exportProgressBar').style.width=`${value}%`;$('#exportProgressText').textContent=text;}});toast(`Sessão exportada em ${format.toUpperCase()}.`,'success',4200);renderHistory();}
    catch(error){if(error.name==='AbortError')toast('Exportação cancelada.','warning');else toast(`Falha na exportação: ${error.message}`,'error',6000);}
    finally{state.exportAbort=null;$('#exportProgressDialog').close();}
  }

  function setTheme(theme){if(window.LABDS.Accessibility)window.LABDS.Accessibility.set({theme});else{document.documentElement.dataset.theme=theme;window.LABDS.Storage.smallSet('theme',theme);$('#themeToggle').textContent=theme==='light'?'◑':'◐';}}
  function bind(){
    $$('[data-home-link]').forEach(el=>el.addEventListener('click',event=>{event.preventDefault();goHome();}));$('#allToolsBtn')?.addEventListener('click',()=>showCatalog('all'));$('#showAllInlineBtn')?.addEventListener('click',()=>showCatalog('all'));$('#heroExploreBtn').addEventListener('click',()=>$('#catalogSection').scrollIntoView({behavior:'smooth',block:'start'}));$('#toolSearch').addEventListener('input',()=>{if($('#catalogSection').classList.contains('hidden'))$('#catalogSection').classList.remove('hidden');filterCatalog();});$('#searchToggle').addEventListener('click',()=>{$('#toolSearch').focus();$('#toolSearch').scrollIntoView({behavior:'smooth',block:'center'});});$('#toolSearch').addEventListener('focus',()=>$('#catalogSection').classList.remove('hidden'));$$('.filter-chip').forEach(button=>button.addEventListener('click',()=>{state.activeFilter=button.dataset.filter;$$('.filter-chip').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-selected',String(active));});$('#catalogSection').classList.remove('hidden');filterCatalog();}));$('#osFilter').addEventListener('change',filterCatalog);$('#levelFilter').addEventListener('change',filterCatalog);if(!window.LABDS.Accessibility)$('#themeToggle').addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='light'?'dark':'light'));$('#terminalExportBtn').addEventListener('click',openExport);$('#labExportBtn').addEventListener('click',openExport);$('#labHelpBtn').addEventListener('click',openHelp);$('#labFullscreenBtn').addEventListener('click',async()=>{try{if(!document.fullscreenElement)await $('.lab-shell').requestFullscreen();else await document.exitFullscreen();}catch{}});$$('#exportDialog [data-export-format]').forEach(button=>button.addEventListener('click',()=>exportCurrent(button.dataset.exportFormat)));
    $('#networkProfileBtn').addEventListener('click',()=>{const select=$('#terminalNetworkProfile');select.textContent='';Object.entries(window.LABDS.NetworkEngine.profiles).forEach(([value,item])=>{const option=document.createElement('option');option.value=value;option.textContent=item.label;select.appendChild(option);});const terminalState=window.LABDS.Terminal.getState();select.value=terminalState.networkProfile;$('#terminalNetworkSeed').value=terminalState.networkSeed||'';$('#networkProfileDialog').showModal();});$('#saveNetworkProfileBtn').addEventListener('click',()=>{window.LABDS.Terminal.setNetworkProfile($('#terminalNetworkProfile').value,$('#terminalNetworkSeed').value.trim());toast('Perfil de rede aplicado.','success');});
    document.addEventListener('keydown',event=>{if(event.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){event.preventDefault();$('#toolSearch').focus();}if(event.key==='Escape'&&screens.lab.classList.contains('active'))goHome();});$('#resumeToolBtn').addEventListener('click',()=>openTool(window.LABDS.Storage.smallGet('lastTool')));
    $('#backupAllBtn').addEventListener('click',async()=>{const payload=await window.LABDS.Storage.dump();window.LABDS.Exporter.download(JSON.stringify(payload,null,2),`laboratorio-virtual-ds-backup-${new Date().toISOString().slice(0,10)}.json`,'application/json;charset=utf-8');toast('Backup completo exportado.','success');});$('#restoreAllBtn').addEventListener('click',()=>$('#restoreAllFile').click());$('#restoreAllFile').addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;try{if(file.size>20*1024*1024)throw new Error('O backup excede 20 MB.');const result=await window.LABDS.Storage.restore(JSON.parse(await file.text()));toast(`Backup restaurado (${result.restored||0} itens). Recarregando...`,'success');setTimeout(()=>location.reload(),700);}catch(error){toast(error.message,'error');}event.target.value='';});$('#clearAllDataBtn').addEventListener('click',async()=>{if(confirm('Excluir todos os arquivos virtuais, códigos, sessões e preferências deste navegador?')){await window.LABDS.Storage.clearAll();Object.keys(localStorage).filter(key=>key.startsWith('labds.')).forEach(key=>localStorage.removeItem(key));toast('Dados locais removidos.','success');setTimeout(()=>location.reload(),600);}});

    $('#studentClassSelect').addEventListener('change',()=>$('#otherClassField').classList.toggle('hidden',$('#studentClassSelect').value!=='Outra turma'));$('#studentCancelBtn').addEventListener('click',()=>{$('#studentDialog').close();state.pendingToolId=null;});$('#studentForm').addEventListener('submit',event=>{event.preventDefault();try{const turma=$('#studentClassSelect').value==='Outra turma'?$('#otherClassInput').value:$('#studentClassSelect').value;window.LABDS.Session.create($('#studentNameInput').value,turma);$('#studentDialog').close();updateSessionHeader();const pending=state.pendingToolId;state.pendingToolId=null;if(pending)openTool(pending);}catch(error){$('#studentFormError').textContent=error.message;$('#studentFormError').classList.remove('hidden');}});
    $('#sessionHistoryBtn').addEventListener('click',openHistory);$('#sessionExportBtn').addEventListener('click',openHistory);$('#sessionFinishBtn').addEventListener('click',openFinish);$('#sessionIdentityBtn').addEventListener('click',openSessionInfo);$('#historySearch').addEventListener('input',renderHistory);$('#historyLabFilter').addEventListener('change',renderHistory);$('#historyTypeFilter').addEventListener('change',renderHistory);$('#copyHistoryBtn').addEventListener('click',()=>{const text=window.LABDS.SessionExporter.textReport(window.LABDS.Session.get());navigator.clipboard?.writeText(text).then(()=>toast('Histórico copiado.','success')).catch(()=>toast('Não foi possível copiar.','error'));});$$('[data-session-export]').forEach(button=>button.addEventListener('click',()=>exportSession(button.dataset.sessionExport)));$('#cancelSessionExportBtn').addEventListener('click',()=>state.exportAbort?.abort());
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

  async function init(){window.LABDS.Accessibility?.init?.();if(!window.LABDS.Accessibility)setTheme(window.LABDS.Storage.smallGet('theme',matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'));populateStudentClasses();renderHome();bind();window.LABDS.Learning?.init?.();await window.LABDS.Session.init();if(window.LABDS.Session.hasRestorable())$('#restoreSessionDialog').showModal();const last=window.LABDS.Storage.smallGet('lastTool');if(last&&window.LABDS.TOOLS.some(tool=>tool.id===last)){$('#resumeToolBtn').classList.remove('hidden');$('#resumeToolBtn').textContent=`Retomar ${window.LABDS.TOOLS.find(t=>t.id===last).shortName}`;}const requested=new URLSearchParams(location.search).get('tool');if(requested&&window.LABDS.TOOLS.some(tool=>tool.id===requested)&&!window.LABDS.Session.hasRestorable())setTimeout(()=>openTool(requested),100);if('serviceWorker'in navigator&&location.protocol.startsWith('http'))registerServiceWorker();}
  window.LABDS.App={init,openTool,goHome,toast,showCatalog,getState:()=>state,openHistory,openFinish};document.addEventListener('DOMContentLoaded',init);
})();
