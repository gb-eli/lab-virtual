'use strict';
(function(){
  const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const fmtGB=n=>Number(n)<1?`${Math.round(Number(n)*1024)} MB`:`${Number(n).toFixed(Number(n)%1?1:0)} GB`;
  function logo(profile){
    if(profile.visual==='win7')return '<div class="windows-orb"><i></i><i></i><i></i><i></i></div>';
    if(['win8','win81','win10','win11','winxp'].includes(profile.visual))return '<div class="windows-mark"><i></i><i></i><i></i><i></i></div>';
    if(profile.visual.startsWith('ubuntu'))return '<div class="ubuntu-mark">●</div>';
    if(profile.visual==='mint')return '<div class="mint-mark">LM</div>';
    if(profile.visual==='debian')return '<div class="debian-mark">◉</div>';
    if(profile.visual==='fedora')return '<div class="fedora-mark">f</div>';
    if(profile.visual==='arch')return '<div class="arch-mark">▲</div>';
    if(profile.visual==='kde')return '<div class="kde-mark">K</div>';
    if(profile.family==='chrome')return '<div class="chrome-mark"><i></i></div>';
    if(profile.family==='macos')return '<div class="mac-mark">◐</div>';
    return `<div class="generic-mark">${esc(profile.product.slice(0,2).toUpperCase())}</div>`;
  }
  function footerActions(actions){return `<div class="os-actions">${actions.map(a=>`<button type="button" class="${a.primary?'primary':''} ${a.danger?'danger':''}" data-vm-action="${a.action}"${a.disabled?' disabled':''}>${esc(a.label)}</button>`).join('')}</div>`;}
  function shell(profile,state,content,{title='',subtitle='',showLogo=true,className=''}={}){
    return `<div class="os-screen os-${esc(profile.visual)} state-${esc(state.powerState)} ${className}" data-family="${esc(profile.family)}">
      <div class="os-safe-label">SIMULAÇÃO EDUCACIONAL • ${esc(profile.product)} ${esc(profile.version)}</div>
      <div class="os-viewport">${showLogo?`<div class="os-brand">${logo(profile)}</div>`:''}${title?`<h2>${esc(title)}</h2>`:''}${subtitle?`<p class="os-subtitle">${esc(subtitle)}</p>`:''}${content}</div>
    </div>`;
  }
  function renderOff(profile,state,validation){
    const issues=validation.issues.length?`<div class="vm-screen-alert error">${validation.issues.map(esc).join('<br>')}</div>`:validation.warnings.length?`<div class="vm-screen-alert warning">${validation.warnings.map(esc).join('<br>')}</div>`:'<div class="vm-screen-alert success">Hardware virtual pronto para inicialização.</div>';
    const mediaState=!state.media?.inserted?'Mídia não conectada':state.media.integrity==='corrupt'?'Imagem corrompida':`${state.media.label} • ${String(state.media.type||'ISO').toUpperCase()} ${state.media.architecture||state.arch}`;
    return shell(profile,state,`<div class="power-summary"><div><span>CPU</span><b>${state.cpuCores} núcleo(s)</b></div><div><span>RAM</span><b>${fmtGB(state.ramGB)}</b></div><div><span>Disco</span><b>${state.diskGB} GB</b></div><div><span>Firmware</span><b>${esc(state.firmware.toUpperCase())}</b></div></div><div class="vm-media-card"><span>${state.installed?'SISTEMA NO DISCO':'MÍDIA DE INSTALAÇÃO'}</span><b>${state.installed?`${esc(profile.product)} instalado`:esc(mediaState)}</b><small>${state.installed?'A máquina pode iniciar sem a ISO conectada.':'Imagem educacional simulada; nenhum arquivo ISO real é distribuído.'}</small></div>${issues}${footerActions([{action:'power',label:state.installed?'Iniciar sistema':'Ligar máquina',primary:true},{action:'firmware',label:'Abrir firmware'}])}`,{title:'Máquina desligada',subtitle:state.installed?'Sistema instalado e pronto para iniciar pelo disco virtual.':'Revise o hardware, conecte a mídia e inicie o processo de boot.'});
  }
  function renderPost(profile,state){
    const classic=state.firmware==='bios';
    const lines=[`${state.manufacturer} ${state.model}`,`CPU: ${state.cpuCores} Core Virtual Processor`, `Memory Test: ${Math.round(state.ramGB*1024)} MB OK`,`${state.diskType.toUpperCase()} 0: ${state.diskGB} GB`,state.networkConnected?'Network Adapter: detected':'Network Adapter: disconnected',classic?'Press DEL to enter SETUP • F12 Boot Menu':'Press F2 for Setup • F12 Boot Menu'];
    return shell(profile,state,`<div class="post-screen">${lines.map((l,i)=>`<div style="--delay:${i*120}ms">${esc(l)}</div>`).join('')}<span class="post-cursor">_</span></div><div class="virtual-keys"><button data-vm-action="firmware">F2 / DEL</button><button data-vm-action="boot-menu">F12</button></div>`,{showLogo:false,className:'firmware-post'});
  }
  function renderFirmwareSplash(profile,state){
    if(state.firmware==='mac-apple')return shell(profile,state,'<div class="boot-progress"><i style="width:32%"></i></div><p>Continue pressionando o botão de energia para abrir as opções.</p>',{title:'Carregando opções de inicialização'});
    if(state.firmware==='mac-intel')return shell(profile,state,'<div class="boot-progress"><i style="width:34%"></i></div><p>Command + R: Recuperação • Option: volumes de inicialização</p>',{title:'Inicializando Mac virtual'});
    if(state.firmware==='chrome')return shell(profile,state,'<div class="boot-progress"><i style="width:36%"></i></div><p>Verified Boot • firmware educacional</p>',{title:'Verificando sistema'});
    return shell(profile,state,'<div class="boot-progress"><i style="width:38%"></i></div><p>Detectando mídia e dispositivos inicializáveis...</p>',{title:state.firmware==='bios'?'BIOS Legacy':'UEFI Firmware'});
  }
  function renderFirmware(profile,state){
    if(state.firmware==='bios')return shell(profile,state,`<div class="bios-classic"><nav><b>Main</b><b>Advanced</b><b class="active">Boot</b><b>Security</b><b>Exit</b></nav><section><div><h3>System Information</h3><p>Processor: ${state.cpuCores} Core(s)</p><p>Memory: ${fmtGB(state.ramGB)}</p><p>Disk: ${state.diskGB} GB ${esc(state.diskType.toUpperCase())}</p><p>Virtualization: ${state.virtualization?'Enabled':'Disabled'}</p></div><div><h3>Boot Priority</h3>${state.bootOrder.map((b,i)=>`<p>${i+1}. ${esc(b.toUpperCase())}</p>`).join('')}<p>Secure Boot: Not available</p></div></section><footer>F10 Save & Exit • ESC Exit</footer></div>${footerActions([{action:'firmware-save',label:'Salvar e sair',primary:true},{action:'power-off',label:'Desligar'}])}`,{showLogo:false,className:'bios-classic-wrap'});
    if(state.firmware==='mac-intel'||state.firmware==='mac-apple')return shell(profile,state,`<div class="mac-startup-options"><button data-vm-action="boot-media"><span>◉</span><b>Instalador</b></button><button data-vm-action="boot-disk"><span>▣</span><b>Macintosh HD</b></button><button data-vm-action="boot-recovery"><span>⚙</span><b>Opções</b></button></div>${footerActions([{action:'firmware-save',label:'Continuar',primary:true},{action:'power-off',label:'Desligar'}])}`,{title:'Opções de Inicialização',subtitle:state.firmware==='mac-apple'?'Apple silicon — botão de energia mantido pressionado':'Mac Intel — Startup Manager'});
    if(state.firmware==='chrome')return shell(profile,state,`<div class="chrome-firmware"><h3>ChromeOS Firmware</h3><div><span>Verified Boot</span><b>${state.secureBoot?'Ativado':'Desativado'}</b></div><div><span>Modo desenvolvedor</span><b>Desativado</b></div><div><span>Mídia de recuperação</span><b>${state.media.inserted?'Detectada':'Ausente'}</b></div></div>${footerActions([{action:'firmware-save',label:'Continuar',primary:true},{action:'boot-recovery',label:'Recuperação'}])}`,{title:'Firmware do Chromebook virtual'});
    return shell(profile,state,`<div class="uefi-grid"><section><h3>Resumo do sistema</h3><div class="uefi-metrics"><span>CPU<b>${state.cpuCores} cores</b></span><span>RAM<b>${fmtGB(state.ramGB)}</b></span><span>Temperatura<b>36°C</b></span><span>Disco<b>${state.diskGB} GB</b></span></div></section><section><h3>Inicialização</h3>${state.bootOrder.map((b,i)=>`<div class="boot-row"><b>${i+1}</b><span>${esc(b.toUpperCase())}</span></div>`).join('')}</section><section><h3>Segurança</h3><p>Secure Boot: <b>${state.secureBoot?'Ativado':'Desativado'}</b></p><p>TPM: <b>${esc(state.tpm)}</b></p><p>Virtualização: <b>${state.virtualization?'Ativada':'Desativada'}</b></p></section></div>${footerActions([{action:'firmware-save',label:'Salvar e sair',primary:true},{action:'boot-menu',label:'Menu de boot'}])}`,{title:'UEFI Setup Utility',showLogo:false,className:'uefi-modern'});
  }
  function renderBootMenu(profile,state){
    const options=[
      {id:'media',label:state.media?.label||'Mídia de instalação',meta:`${state.media?.type||'ISO'} • ${state.media?.architecture||state.arch}`},
      {id:'disk',label:state.installed?(profile.family==='windows'?'Windows Boot Manager':profile.family==='linux'?'GRUB / Linux':'Disco do sistema'):'Disco virtual vazio',meta:`${state.diskGB} GB ${state.diskType}`},
      {id:'network',label:'PXE Network',meta:state.networkConnected?'Adaptador disponível':'Sem conexão'},
      ...(profile.family==='macos'||profile.family==='chrome'?[{id:'recovery',label:'Recovery',meta:'Ambiente de recuperação'}]:[])
    ];
    return shell(profile,state,`<div class="boot-device-list">${options.map(o=>`<button data-vm-action="boot-${o.id}"><span>${o.id==='media'?'▣':o.id==='disk'?'▤':o.id==='network'?'⌁':'⚙'}</span><b>${esc(o.label)}</b><small>${esc(o.meta)}</small></button>`).join('')}</div>`,{title:'Selecione o dispositivo de inicialização',subtitle:`Firmware: ${state.firmware.toUpperCase()}`});
  }
  function renderBootloader(profile,state){
    if(profile.family==='linux')return shell(profile,state,`<div class="grub-menu"><b>GNU GRUB</b><button class="selected">${esc(profile.bootLabel)}</button><button>Advanced options</button><button>Firmware Settings</button></div>`,{showLogo:false,className:'linux-boot'});
    if(profile.family==='windows'&&profile.visual==='win7')return shell(profile,state,'<div class="win7-loading"><span>Starting Windows</span><div class="win7-dots"><i></i><i></i><i></i><i></i></div></div>',{showLogo:false});
    if(profile.family==='windows')return shell(profile,state,'<div class="spinner-dots"><i></i><i></i><i></i><i></i><i></i></div>',{title:profile.bootLabel});
    if(profile.family==='chrome')return shell(profile,state,'<div class="chrome-loader"><i></i><i></i><i></i><i></i></div>',{title:profile.bootLabel});
    if(profile.family==='macos')return shell(profile,state,'<div class="boot-progress"><i style="width:22%"></i></div>',{title:profile.bootLabel});
    return shell(profile,state,'<div class="spinner-dots"><i></i><i></i><i></i></div>',{title:profile.bootLabel});
  }
  function renderInstallerLoading(profile,state){
    const text=profile.family==='windows'?'A instalação está sendo iniciada':profile.family==='linux'?'Carregando ambiente de instalação':profile.family==='chrome'?'Verificando mídia e hardware':'Carregando utilitários de recuperação';
    return shell(profile,state,`<div class="installer-spinner"></div><p>${esc(text)}</p>${footerActions([{action:'installer-next',label:'Continuar',primary:true}])}`,{title:profile.product,subtitle:`${profile.version} • ${profile.edition}`});
  }
  function renderLanguage(profile,state){
    const title=profile.family==='windows'?'Instalação do Windows':profile.family==='macos'?'Recuperação do macOS':profile.family==='chrome'?'Configurar ChromeOS':profile.visual==='arch'?'archinstall — localização':'Instalar sistema';
    return shell(profile,state,`<div class="installer-window"><header><div class="installer-heading"><span>1</span><div><small>${esc(profile.product)} ${esc(profile.version)}</small><h3>${esc(title)}</h3></div></div><p>Escolha o idioma, a região e o layout de teclado usados durante a instalação.</p></header><div class="installer-fields"><label>Idioma do instalador<select id="vmScreenLanguage">${profile.languages.map(v=>`<option${v===state.language?' selected':''}>${esc(v)}</option>`).join('')}</select></label><label>País ou região<input id="vmScreenRegion" maxlength="60" autocomplete="country-name" value="${esc(state.region)}"></label><label>Layout do teclado<select id="vmScreenKeyboard">${profile.keyboards.map(v=>`<option${v===state.keyboard?' selected':''}>${esc(v)}</option>`).join('')}</select></label><div class="keyboard-test"><span>Teste o teclado antes de continuar</span><input placeholder="Digite acentos, símbolos e caracteres especiais"></div></div>${footerActions([{action:'installer-cancel',label:'Cancelar instalação'},{action:'installer-back',label:'Voltar'},{action:'installer-language-next',label:'Continuar',primary:true}])}</div>`,{showLogo:false,className:'installer-stage'});
  }
  function partitionBar(state){const used=state.partitions.reduce((n,p)=>n+Number(p.sizeGB||0),0),free=Math.max(0,state.diskGB-used);return `<div class="disk-map">${state.partitions.map(p=>`<div style="--part:${Math.max(5,p.sizeGB/state.diskGB*100)}%"><b>${esc(p.name)}</b><small>${fmtGB(p.sizeGB)} • ${esc(p.filesystem)}</small></div>`).join('')}${free?`<div class="free" style="--part:${Math.max(5,free/state.diskGB*100)}%"><b>Não alocado</b><small>${fmtGB(free)}</small></div>`:''}</div>`;}
  function renderStorage(profile,state){
    const error=state.errorMessage?`<div class="vm-screen-alert error">${esc(state.errorMessage)}</div>`:'';
    const windowsTitle=profile.family==='windows'?'Onde você deseja instalar o Windows?':profile.family==='macos'?'Utilitário de Disco — selecione o volume':profile.family==='chrome'?'Selecione o armazenamento interno':'Tipo de instalação e particionamento';
    return shell(profile,state,`<div class="installer-window storage-window"><header><h3>${esc(windowsTitle)}</h3><small>Disco 0 • ${state.diskGB} GB • ${esc(state.partitionTable.toUpperCase())}</small></header>${partitionBar(state)}<div class="partition-list">${state.partitions.length?state.partitions.map((p,i)=>`<div><span>${i+1}</span><b>${esc(p.name)}</b><small>${fmtGB(p.sizeGB)}</small><small>${esc(p.filesystem)}</small><small>${esc(p.mount||'-')}</small></div>`).join(''):'<p>Nenhuma partição criada.</p>'}</div><div class="partition-actions"><button data-vm-action="partition-auto">Usar configuração recomendada</button><button data-vm-action="partition-clear">Excluir tudo</button><button data-vm-action="partition-add">Nova partição</button></div>${error}${footerActions([{action:'installer-back',label:'Voltar'},{action:'installer-storage-next',label:'Avançar',primary:true}])}</div>`,{showLogo:false,className:'installer-stage'});
  }
  function renderUser(profile,state){
    return shell(profile,state,`<div class="installer-window account-window"><header><h3>${profile.family==='windows'?'Criar conta local':profile.family==='macos'?'Criar uma conta de computador':profile.family==='chrome'?'Criar perfil local simulado':'Quem é você?'}</h3></header><div class="installer-fields"><label>Nome de usuário<input id="vmScreenUsername" value="${esc(state.username)}" maxlength="30"></label><label>Nome do computador<input id="vmScreenHostname" value="${esc(state.hostname)}" maxlength="30"></label><label>Senha simulada<input id="vmScreenPassword" type="password" autocomplete="new-password" placeholder="Não utilize senha real"></label><p class="password-warning">Ambiente educacional simulado. O conteúdo da senha não é armazenado.</p></div>${footerActions([{action:'installer-back',label:'Voltar'},{action:'installer-user-next',label:'Avançar',primary:true}])}</div>`,{showLogo:false,className:'installer-stage'});
  }
  function renderSummary(profile,state){
    return shell(profile,state,`<div class="installer-window summary-window"><header><h3>Pronto para instalar</h3><p>Revise as escolhas antes de gravar no disco virtual.</p></header><div class="summary-grid"><div><span>Sistema</span><b>${esc(profile.product)} ${esc(profile.version)}</b></div><div><span>Arquitetura</span><b>${esc(state.arch)}</b></div><div><span>Firmware</span><b>${esc(state.firmware.toUpperCase())}</b></div><div><span>Disco</span><b>${state.diskGB} GB ${esc(state.partitionTable.toUpperCase())}</b></div><div><span>Idioma</span><b>${esc(state.language)}</b></div><div><span>Teclado</span><b>${esc(state.keyboard)}</b></div><div><span>Usuário</span><b>${esc(state.username)}</b></div><div><span>Rede</span><b>${esc(state.network)}</b></div></div><div class="vm-screen-alert warning">Somente o disco virtual será alterado. Nenhum arquivo real será acessado.</div>${footerActions([{action:'installer-back',label:'Voltar'},{action:'installer-start',label:'Instalar agora',primary:true}])}</div>`,{showLogo:false,className:'installer-stage'});
  }
  function renderProgress(profile,state){
    const step=profile.installSteps[state.installStep]||'Instalando sistema';
    const estimated=Math.max(1,Math.ceil((100-state.progress)/(state.speed==='detailed'?5:state.speed==='quick'?16:9)));
    const checklist=profile.installSteps.map((label,index)=>`<li class="${index<state.installStep?'done':index===state.installStep?'active':''}"><i>${index<state.installStep?'✓':index===state.installStep?'●':'○'}</i><span>${esc(label)}</span></li>`).join('');
    return shell(profile,state,`<div class="install-progress-layout"><div class="install-progress-ui"><span class="install-kicker">INSTALAÇÃO EM ANDAMENTO</span><h3>${esc(step)}</h3><p class="install-detail">${esc(state.lastInstallDetail||'Preparando componentes do sistema')}</p><div class="large-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(state.progress)}"><i style="width:${Math.min(100,state.progress)}%"></i></div><div class="install-progress-meta"><b>${Math.round(state.progress)}%</b><span>aprox. ${estimated} min restantes</span></div><p>${profile.family==='windows'?'A máquina reiniciará automaticamente. Não desligue o disco virtual.':profile.family==='linux'?'Os pacotes, o bootloader e o sistema de arquivos estão sendo configurados.':profile.family==='chrome'?'A assinatura da imagem e as partições de recuperação serão verificadas.':'O volume do sistema será preparado e a máquina poderá reiniciar.'}</p><div class="disk-activity"><i></i><span>Disco virtual em atividade</span></div></div><ol class="install-checklist">${checklist}</ol></div>`,{title:profile.product,subtitle:`${profile.version} • ${profile.edition}`});
  }
  function renderRestart(profile,state){return shell(profile,state,`<div class="restart-sequence"><div class="spinner-dots"><i></i><i></i><i></i><i></i></div><div><h3>Preparando a primeira inicialização</h3><p>Instalação gravada no disco virtual. A prioridade de boot foi alterada para o sistema instalado.</p><small>Reinicialização ${Math.max(1,state.restartCount)} • firmware ${esc(state.firmware.toUpperCase())} • disco ${state.diskGB} GB</small></div></div>`,{title:'Reiniciando',subtitle:'Não desligue a máquina durante esta etapa.'});}
  function renderOobe(profile,state){
    const step=profile.oobe[state.oobeStep]||'Finalização';
    const steps=profile.oobe.map((label,index)=>`<i class="${index<state.oobeStep?'done':index===state.oobeStep?'active':''}" title="${esc(label)}"></i>`).join('');
    return shell(profile,state,`<div class="oobe-card"><div class="oobe-progress" aria-label="Progresso da configuração inicial">${steps}</div><span>ETAPA ${state.oobeStep+1} DE ${profile.oobe.length}</span><h3>${esc(step)}</h3><p>${oobeText(profile,step,state)}</p><div class="oobe-placeholder">${oobeVisual(step,state,profile)}</div>${footerActions([{action:'oobe-next',label:state.oobeStep+1>=profile.oobe.length?'Entrar no sistema':'Continuar',primary:true}])}</div>`,{showLogo:false,className:'oobe-stage'});
  }
  function oobeText(profile,step,state){if(/rede/i.test(step))return state.networkConnected?'A rede virtual está conectada e pronta.':'Você pode continuar com recursos limitados ou conectar a rede.';if(/privacidade/i.test(step))return 'Escolha quais recursos simulados deseja manter habilitados.';if(/usuário|conta/i.test(step))return `Conta local simulada: ${esc(state.username)}. Nenhuma autenticação externa será realizada.`;if(/aparência|cor/i.test(step))return 'Selecione a aparência inicial do ambiente.';return `Configure ${esc(step.toLowerCase())} para concluir a instalação.`;}
  function oobeVisual(step,state,profile){if(/rede/i.test(step))return `<div class="network-choice"><button>${state.networkConnected?'Laboratorio_DS • Conectado':'Conectar rede virtual'}</button></div>`;if(/privacidade/i.test(step))return '<div class="toggle-list"><label><input type="checkbox" checked> Localização simulada</label><label><input type="checkbox"> Diagnóstico opcional</label><label><input type="checkbox"> Experiências personalizadas</label></div>';if(/aparência|cor/i.test(step))return '<div class="appearance-choice"><button class="light">Claro</button><button class="dark">Escuro</button><button class="auto">Automático</button></div>';return `<div class="oobe-icon">${logo(profile)}</div>`;}
  function desktopWindow(profile,state){
    if(!state.desktopApp)return '';
    const app=esc(state.desktopApp);
    let content='';
    if(/arquivos|explor|finder|files|nemo|dolphin/i.test(state.desktopApp))content=`<div class="file-manager"><aside>${profile.desktopApps.map(a=>`<button>${esc(a)}</button>`).join('')}</aside><main><div class="folder-grid"><button>📁 Documentos</button><button>📁 Downloads</button><button>📁 Projetos</button><button>📄 README.txt</button></div></main></div>`;
    else if(/terminal|prompt|powershell|crosh|konsole/i.test(state.desktopApp))content=`<div class="desktop-terminal"><span>${esc(state.username)}@${esc(state.hostname)}${profile.family==='windows'?'>':profile.family==='macos'?' %':' $'} </span><i></i></div>`;
    else content=`<div class="settings-grid"><button>Sistema</button><button>Rede</button><button>Contas</button><button>Armazenamento</button><button>Aparência</button><button>Atualizações</button></div>`;
    return `<section class="desktop-window"><header><b>${app}</b><button data-vm-action="desktop-close">×</button></header>${content}</section>`;
  }
  function renderDesktop(profile,state){
    const apps=profile.desktopApps.map((a,i)=>`<button data-vm-action="desktop-app" data-app="${esc(a)}"><span>${i===0?'📁':i===1?'⚙':'⌨'}</span><b>${esc(a)}</b></button>`).join('');
    if(profile.visual==='win8'||profile.visual==='win81')return shell(profile,state,`<div class="start-screen"><header><h3>Iniciar</h3><span>${esc(state.username)}</span></header><div class="tile-grid">${apps}<button><span>☁</span><b>Loja simulada</b></button><button><span>☀</span><b>Clima</b></button><button><span>✉</span><b>Email</b></button></div></div>${desktopWindow(profile,state)}${footerActions([{action:'restart',label:'Reiniciar'},{action:'power-off',label:'Desligar'}])}`,{showLogo:false,className:'desktop-stage'});
    const shellClass=profile.family==='windows'?'desktop-windows':profile.family==='linux'?'desktop-linux':profile.family==='chrome'?'desktop-chrome':'desktop-macos';
    return shell(profile,state,`<div class="desktop-runtime ${shellClass}"><div class="desktop-topbar"><span>${profile.family==='macos'?'● ':''}${esc(profile.product)}</span><span>${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span></div><div class="desktop-icons">${apps}</div><div class="desktop-panel">${profile.family==='windows'?'<button class="start-button">⊞</button>':profile.family==='linux'?'<button>◉</button>':profile.family==='chrome'?'<button>●</button>':'<button>Finder</button>'}<span>${esc(state.username)}</span><button data-vm-action="power-off">⏻</button></div></div>${desktopWindow(profile,state)}`,{showLogo:false,className:'desktop-stage'});
  }
  function renderError(profile,state){return shell(profile,state,`<div class="error-screen"><b>${esc(state.errorCode||'VM_ERROR')}</b><p>${esc(state.errorMessage||'A máquina virtual encontrou um erro.')}</p>${footerActions([{action:'back-safe',label:'Voltar à configuração'},{action:'boot-menu',label:'Menu de boot',primary:true}])}</div>`,{title:'Não foi possível continuar'});}
  function renderRecovery(profile,state){
    const options=profile.family==='windows'?['Continuar','Usar um dispositivo','Solução de Problemas','Desligar']:profile.family==='macos'?['Restaurar do backup','Reinstalar macOS','Utilitário de Disco','Terminal']:profile.family==='chrome'?['Recuperação pela internet','Recuperação por USB','Diagnóstico','Desligar']:['Modo de recuperação','Terminal root','Reparar bootloader','Reiniciar'];
    return shell(profile,state,`<div class="recovery-grid">${options.map((o,i)=>`<button data-vm-action="${i===1?'installer-next':'noop'}"><span>${['↻','▣','⚙','⌨'][i]||'•'}</span><b>${esc(o)}</b></button>`).join('')}</div>${footerActions([{action:'boot-menu',label:'Voltar ao boot'},{action:'power-off',label:'Desligar'}])}`,{title:'Ambiente de recuperação'});
  }
  function render(profile,state,validation){
    switch(state.powerState){
      case 'powered_off':return renderOff(profile,state,validation);
      case 'powering_on':return shell(profile,state,'<div class="power-pulse"></div><p>Energizando componentes virtuais...</p>',{title:'Ligando'});
      case 'post':return renderPost(profile,state);
      case 'firmware_splash':return renderFirmwareSplash(profile,state);
      case 'firmware_setup':return renderFirmware(profile,state);
      case 'boot_device_menu':return renderBootMenu(profile,state);
      case 'bootloader':return renderBootloader(profile,state);
      case 'installer_loading':return renderInstallerLoading(profile,state);
      case 'installer_language':return renderLanguage(profile,state);
      case 'installer_storage':return renderStorage(profile,state);
      case 'installer_user':return renderUser(profile,state);
      case 'installer_summary':return renderSummary(profile,state);
      case 'installer_copying':return renderProgress(profile,state);
      case 'restarting':return renderRestart(profile,state);
      case 'initial_setup':return renderOobe(profile,state);
      case 'desktop':return renderDesktop(profile,state);
      case 'recovery':return renderRecovery(profile,state);
      case 'error':return renderError(profile,state);
      default:return renderOff(profile,state,validation);
    }
  }
  window.LABDS_VM_RENDERER={render,esc,fmtGB};
})();
