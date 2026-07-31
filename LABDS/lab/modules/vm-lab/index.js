'use strict';
(function(){
  window.LABDS_LABS=window.LABDS_LABS||{};
  let root=null,ctx=null,engine=null,keyHandler=null,actionsBound=false,dialogResolver=null,actionLocked=false;
  const deps=['modules/vm-lab/runtime/profiles.js','modules/vm-lab/runtime/engine.js','modules/vm-lab/runtime/renderer.js'];
  const loadScript=src=>new Promise((resolve,reject)=>{if([...document.scripts].some(s=>s.src.endsWith(src)))return resolve();const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error(`Falha ao carregar ${src}`));document.head.appendChild(s);});
  const ensureDeps=async()=>{for(const src of deps)await loadScript(src);};
  const $=sel=>root?.querySelector(sel);
  const $$=sel=>[...(root?.querySelectorAll(sel)||[])];
  const esc=s=>window.LABDS_VM_RENDERER?.esc(s)||String(s??'');
  const STORAGE_KEY='lab.vm.v5.state';
  function profileOptions(selected){return window.LABDS_VM_PROFILE_GROUPS.map(group=>`<optgroup label="${esc(group.label)}">${group.ids.map(id=>{const p=window.LABDS_VM_PROFILES[id];return `<option value="${id}"${id===selected?' selected':''}>${esc(p.product)} — ${esc(p.version)}</option>`;}).join('')}</optgroup>`).join('');}
  function formFactorOptions(selected){const items=[['desktop','Desktop'],['notebook','Notebook'],['server','Servidor'],['chromebook','Chromebook'],['macbook','MacBook'],['imac','iMac'],['macmini','Mac mini']];return items.map(([v,l])=>`<option value="${v}"${v===selected?' selected':''}>${l}</option>`).join('');}
  function selectOptions(values,selected){return values.map(v=>`<option${String(v)===String(selected)?' selected':''}>${esc(v)}</option>`).join('');}
  const PHASES=[['hardware','Hardware'],['firmware','Firmware'],['boot','Boot'],['storage','Disco'],['install','Instalação'],['setup','Configuração'],['desktop','Sistema pronto']];
  function phaseIndex(state){
    if(['powered_off','powering_on','post','error'].includes(state))return 0;
    if(['firmware_splash','firmware_setup'].includes(state))return 1;
    if(['boot_device_menu','bootloader','installer_loading'].includes(state))return 2;
    if(['installer_language','installer_storage','installer_user','installer_summary'].includes(state))return 3;
    if(['installer_copying','restarting'].includes(state))return 4;
    if(state==='initial_setup')return 5;
    return state==='desktop'?6:2;
  }
  function phaseRail(state){const active=phaseIndex(state);return `<nav class="vm-phase-rail" aria-label="Etapas da máquina virtual">${PHASES.map(([id,label],index)=>`<div class="${index<active?'done':index===active?'active':''}" data-phase="${id}"><i>${index<active?'✓':index+1}</i><span>${label}</span></div>`).join('')}</nav>`;}
  function stateLabel(state){const labels={powered_off:'Desligada',powering_on:'Energizando',post:'POST em andamento',firmware_splash:'Inicializando firmware',firmware_setup:'Firmware aberto',boot_device_menu:'Menu de boot',bootloader:'Carregando sistema',installer_loading:'Carregando instalador',installer_language:'Idioma e teclado',installer_storage:'Particionamento',installer_user:'Conta local',installer_summary:'Pronta para instalar',installer_copying:'Instalando sistema',restarting:'Reiniciando',initial_setup:'Configuração inicial',desktop:'Sistema pronto',recovery:'Recuperação',error:'Atenção necessária'};return labels[state]||state;}
  function renderShell(){
    const s=engine.state,p=engine.profile(),v=engine.validation(),locked=engine.isConfigLocked(),canCheckpoint=engine.canCheckpoint(),firmwareBlocked=!['powered_off','post','firmware_splash','firmware_setup','boot_device_menu','error'].includes(s.powerState);
    root.innerHTML=`<div class="vm-lab-v5" data-vm-family="${esc(p.family)}" data-vm-visual="${esc(p.visual)}">
      <aside class="vm-config-panel">
        <header class="vm-config-head"><div><span class="eyebrow">MÁQUINA VIRTUAL SIMULADA</span><h2>Configurar máquina</h2><p>${esc(p.product)} ${esc(p.version)}</p></div><button class="icon-btn" data-vm-action="toggle-config" title="Recolher painel">⇤</button></header>
        <div class="vm-config-lock ${locked?'locked':''}"><i>${locked?'●':'○'}</i><span>${locked?'Hardware bloqueado enquanto a máquina está ligada':'Hardware editável — máquina desligada'}</span></div>
        <div class="vm-config-tabs"><button class="active" data-vm-tab="simple">Simplificado</button><button data-vm-tab="advanced">Avançado</button><button data-vm-tab="scenario">Cenários</button></div>
        <div class="vm-config-scroll">
          <section data-vm-panel="simple">
            <label>Sistema operacional<select id="vmProfile">${profileOptions(s.profileId)}</select></label>
            <label>Nome da máquina<input id="vmMachineName" maxlength="28" value="${esc(s.machineName)}"></label>
            <label>Tipo de equipamento<select id="vmFormFactor">${formFactorOptions(s.formFactor)}</select></label>
            <div class="vm-range"><span>Memória RAM <output>${s.ramGB} GB</output></span><input id="vmRam" type="range" min="0.5" max="32" step="0.5" value="${s.ramGB}"></div>
            <div class="vm-range"><span>Processador <output>${s.cpuCores} núcleo(s)</output></span><input id="vmCores" type="range" min="1" max="12" step="1" value="${s.cpuCores}"></div>
            <div class="vm-range"><span>Disco virtual <output>${s.diskGB} GB</output></span><input id="vmDisk" type="range" min="8" max="1024" step="8" value="${s.diskGB}"></div>
            <label>Velocidade da simulação<select id="vmSpeed"><option value="quick"${s.speed==='quick'?' selected':''}>Demonstração rápida</option><option value="normal"${s.speed==='normal'?' selected':''}>Prática normal</option><option value="detailed"${s.speed==='detailed'?' selected':''}>Realista detalhado</option><option value="instructor"${s.speed==='instructor'?' selected':''}>Instrutor acelerado</option></select></label>
            <div class="vm-primary-actions"><button class="btn primary" data-vm-action="power"${locked?' disabled':''}>${s.powerState==='powered_off'?'Ligar máquina':s.powerState==='error'?'Tentar novamente':'Máquina em execução'}</button><button class="btn secondary" data-vm-action="firmware"${firmwareBlocked?' disabled':''}>BIOS / UEFI</button><button class="btn subtle" data-vm-action="boot-menu"${firmwareBlocked?' disabled':''}>Menu de boot</button></div>
          </section>
          <section data-vm-panel="advanced" class="hidden">
            <div class="field-row"><label>Arquitetura<select id="vmArch">${selectOptions(p.architectures,s.arch)}</select></label><label>Firmware<select id="vmFirmware">${selectOptions(p.firmwareSupport,s.firmware)}</select></label></div>
            <div class="field-row"><label>Tipo do disco<select id="vmDiskType"><option value="hdd-ide"${s.diskType==='hdd-ide'?' selected':''}>HDD IDE</option><option value="hdd-sata"${s.diskType==='hdd-sata'?' selected':''}>HDD SATA</option><option value="ssd-sata"${s.diskType==='ssd-sata'?' selected':''}>SSD SATA</option><option value="ssd-nvme"${s.diskType==='ssd-nvme'?' selected':''}>SSD NVMe</option><option value="emmc"${s.diskType==='emmc'?' selected':''}>eMMC</option></select></label><label>Controlador<select id="vmController"><option value="ide"${s.diskController==='ide'?' selected':''}>IDE</option><option value="ahci"${s.diskController==='ahci'?' selected':''}>AHCI</option><option value="raid"${s.diskController==='raid'?' selected':''}>RAID</option><option value="nvme"${s.diskController==='nvme'?' selected':''}>NVMe</option><option value="virtio"${s.diskController==='virtio'?' selected':''}>VirtIO</option></select></label></div>
            <div class="field-row"><label>Tabela de partição<select id="vmPartitionTable"><option value="gpt"${s.partitionTable==='gpt'?' selected':''}>GPT</option><option value="mbr"${s.partitionTable==='mbr'?' selected':''}>MBR</option><option value="apm"${s.partitionTable==='apm'?' selected':''}>Apple Partition Map</option><option value="none"${s.partitionTable==='none'?' selected':''}>Não inicializado</option></select></label><label>Rede<select id="vmNetwork"><option value="nat"${s.network==='nat'?' selected':''}>NAT</option><option value="bridge"${s.network==='bridge'?' selected':''}>Bridge</option><option value="host-only"${s.network==='host-only'?' selected':''}>Host-only</option><option value="off"${s.network==='off'?' selected':''}>Sem adaptador</option></select></label></div>
            <div class="field-row"><label>TPM<select id="vmTpm"><option value="none"${s.tpm==='none'?' selected':''}>Ausente</option><option value="1.2"${s.tpm==='1.2'?' selected':''}>TPM 1.2</option><option value="2.0"${s.tpm==='2.0'?' selected':''}>TPM 2.0</option></select></label><label>Vídeo<select id="vmGraphics"><option value="integrated"${s.graphics==='integrated'?' selected':''}>Integrado</option><option value="virtio"${s.graphics==='virtio'?' selected':''}>VirtIO</option><option value="amd"${s.graphics==='amd'?' selected':''}>AMD virtual</option><option value="nvidia"${s.graphics==='nvidia'?' selected':''}>NVIDIA virtual</option></select></label></div>
            <div class="check-grid"><label><input id="vmSecureBoot" type="checkbox"${s.secureBoot?' checked':''}> Secure Boot</label><label><input id="vmVirtualization" type="checkbox"${s.virtualization?' checked':''}> Virtualização</label><label><input id="vmNetworkConnected" type="checkbox"${s.networkConnected?' checked':''}> Rede conectada</label><label><input id="vmAudio" type="checkbox"${s.audio?' checked':''}> Áudio</label></div>
            <label>Mídia de instalação<select id="vmMediaIntegrity"><option value="valid"${s.media.integrity==='valid'?' selected':''}>ISO válida simulada</option><option value="corrupt"${s.media.integrity==='corrupt'?' selected':''}>ISO corrompida</option><option value="missing"${!s.media.inserted?' selected':''}>Sem mídia</option></select></label>
            <div class="field-row"><label>Idioma<select id="vmLanguage">${selectOptions(p.languages,s.language)}</select></label><label>Teclado<select id="vmKeyboard">${selectOptions(p.keyboards,s.keyboard)}</select></label></div>
            <div class="field-row"><label>Região<input id="vmRegion" value="${esc(s.region)}"></label><label>Fuso horário<input id="vmTimezone" value="${esc(s.timezone)}"></label></div>
            <div class="field-row"><label>Usuário inicial<input id="vmUsername" maxlength="30" value="${esc(s.username)}"></label><label>Hostname<input id="vmHostname" maxlength="30" value="${esc(s.hostname)}"></label></div>
            <label>Senha simulada<input id="vmPassword" type="password" autocomplete="new-password" placeholder="Não use uma senha real"></label><p class="password-warning">A senha não é salva nem incluída no relatório.</p>
          </section>
          <section data-vm-panel="scenario" class="hidden">
            <div class="scenario-grid">
              <button data-vm-scenario="standard"><b>Instalação padrão</b><small>Hardware compatível e disco vazio.</small></button>
              <button data-vm-scenario="gpt-mbr"><b>GPT/MBR incompatível</b><small>Exercite a correção do modo de boot.</small></button>
              <button data-vm-scenario="low-memory"><b>Memória insuficiente</b><small>O POST funciona, mas o instalador bloqueia.</small></button>
              <button data-vm-scenario="corrupt-media"><b>Mídia corrompida</b><small>A inicialização falha na leitura da ISO.</small></button>
              <button data-vm-scenario="no-network"><b>Sem internet</b><small>Rede desconectada durante a configuração.</small></button>
              <button data-vm-scenario="dual-boot"><b>Cenário dual boot</b><small>Disco com partições Windows e Linux.</small></button>
            </div>
            <div class="vm-instructor-box"><h3>Modo instrutor</h3><p>Permite avançar etapas, provocar erros e inspecionar o estado interno.</p><button class="btn secondary" data-vm-action="instructor">${s.instructorUnlocked?'Painel liberado':'Liberar painel'}</button></div>
          </section>
          <div class="vm-validation ${v.ok?'ok':'blocked'}"><strong>${v.ok?'Configuração inicializável':'Configuração bloqueada'}</strong><p>${[...v.issues,...v.warnings].map(esc).join(' ')||'Todos os requisitos do perfil foram atendidos.'}</p></div>
        </div>
      </aside>
      <main class="vm-runtime-panel">
        <header class="vm-runtime-toolbar">
          <div><span>${esc(p.product)}</span><b>${esc(p.version)} • ${esc(p.edition)}</b><small class="vm-live-state" data-tone="${s.powerState==='error'?'error':engine.isTransient()?'busy':s.powerState==='desktop'?'success':'idle'}">${esc(stateLabel(s.powerState))}</small></div>
          <div><button data-vm-action="checkpoint"${canCheckpoint?'':' disabled'}>Salvar checkpoint</button><button data-vm-action="restore-checkpoint"${s.checkpoints.length&&!engine.isTransient()?'':' disabled'}>Restaurar</button><button data-vm-action="education">${s.educationalLayer?'Ocultar explicações':'Ativar explicações'}</button><button data-vm-action="restart"${s.powerState==='powered_off'?' disabled':''}>Reiniciar</button><button data-vm-action="power-off"${s.powerState==='powered_off'?' disabled':''}>Desligar</button></div>
        </header>
        ${phaseRail(s.powerState)}
        <section class="vm-stage-v5">
          <div class="vm-hardware-visual ${esc(s.formFactor)}"><div class="device-shell"><div class="device-screen-glow"></div><div class="device-label">${esc(s.model)}</div><div class="device-leds"><i class="power ${s.powerState!=='powered_off'?'on':''}"></i><i class="disk ${['installer_copying','restarting'].includes(s.powerState)?'busy':''}"></i><i class="network ${s.networkConnected?'on':''}"></i></div></div><div class="hardware-summary"><span>CPU<b>${s.cpuCores}C</b></span><span>RAM<b>${s.ramGB}G</b></span><span>DISK<b>${s.diskGB}G</b></span><span>BOOT<b>${esc(s.selectedBoot)}</b></span></div></div>
          <div class="vm-monitor-frame"><div class="vm-monitor-bezel"><span class="vm-monitor-camera" aria-hidden="true"></span><div id="vmScreenHost" class="vm-screen-host" aria-live="polite"></div><div class="vm-monitor-osd"><span>${esc(s.machineName)}</span><span>${esc(s.arch.toUpperCase())} • ${s.ramGB} GB • ${s.cpuCores} vCPU</span></div></div><div class="vm-monitor-base"></div></div>
        </section>
        <section class="vm-bottom-grid">
          <div class="vm-log-panel"><header><h3>Logs técnicos</h3><span>${s.logs.length} evento(s)</span></header><div id="vmLogList"></div></div>
          <div class="vm-checkpoint-panel"><header><h3>Checkpoints</h3><span>${s.checkpoints.length}</span></header><div id="vmCheckpointList"></div></div>
        </section>
        <div id="vmEducationPanel" class="vm-education-panel ${s.educationalLayer?'':'hidden'}"></div>
        <div id="vmInstructorPanel" class="vm-instructor-panel ${s.instructorUnlocked?'':'hidden'}"></div>
        <div id="vmLocalDialog" class="vm-local-dialog hidden" role="dialog" aria-modal="true"><div><header><h3 id="vmDialogTitle">Confirmar ação</h3><button type="button" data-vm-dialog="cancel">×</button></header><p id="vmDialogText"></p><input id="vmDialogInput" type="text"><footer><button type="button" data-vm-dialog="cancel">Cancelar</button><button type="button" class="primary" data-vm-dialog="confirm">Confirmar</button></footer></div></div>
      </main>
    </div>`;
    applyConfigLock();renderDynamic();bindInputs();bindActions();
  }
  function applyConfigLock(){const locked=engine?.isConfigLocked?.();$$('.vm-config-scroll input,.vm-config-scroll select').forEach(el=>{if(el.id==='vmSpeed')return;el.disabled=Boolean(locked);});$$('[data-vm-scenario]').forEach(button=>button.disabled=Boolean(locked));}
  function renderDynamic(){
    const s=engine.state,p=engine.profile(),v=engine.validation();
    const rail=$('.vm-phase-rail');if(rail)rail.outerHTML=phaseRail(s.powerState);
    const live=$('.vm-live-state');if(live){live.textContent=stateLabel(s.powerState);live.dataset.tone=s.powerState==='error'?'error':engine.isTransient()?'busy':s.powerState==='desktop'?'success':'idle';}
    const lock=$('.vm-config-lock');if(lock){const locked=engine.isConfigLocked();lock.classList.toggle('locked',locked);lock.querySelector('i').textContent=locked?'●':'○';lock.querySelector('span').textContent=locked?'Hardware bloqueado enquanto a máquina está ligada':'Hardware editável — máquina desligada';}
    const power=$('[data-vm-action="power"]');if(power){const locked=engine.isConfigLocked();power.disabled=locked;power.textContent=s.powerState==='powered_off'?'Ligar máquina':s.powerState==='error'?'Tentar novamente':'Máquina em execução';}
    const firmwareBlocked=!['powered_off','post','firmware_splash','firmware_setup','boot_device_menu','error'].includes(s.powerState);['firmware','boot-menu'].forEach(action=>{const button=$(`[data-vm-action="${action}"]`);if(button)button.disabled=firmwareBlocked;});
    const checkpoint=$('[data-vm-action="checkpoint"]');if(checkpoint)checkpoint.disabled=!engine.canCheckpoint();const restore=$('[data-vm-action="restore-checkpoint"]');if(restore)restore.disabled=!s.checkpoints.length||engine.isTransient();const restart=$('[data-vm-action="restart"]');if(restart)restart.disabled=s.powerState==='powered_off';const powerOff=$('[data-vm-action="power-off"]');if(powerOff)powerOff.disabled=s.powerState==='powered_off';applyConfigLock();
    const host=$('#vmScreenHost');if(host)host.innerHTML=window.LABDS_VM_RENDERER.render(p,s,v);
    const logs=$('#vmLogList');if(logs){logs.innerHTML=s.logs.slice(-70).map(item=>`<div class="vm-log-item ${esc(item.tone)}"><time>${new Date(item.timestamp).toLocaleTimeString('pt-BR')}</time><span>${esc(item.message)}</span></div>`).join('')||'<p class="muted-copy">Nenhum evento registrado.</p>';logs.scrollTop=logs.scrollHeight;}
    const cps=$('#vmCheckpointList');if(cps)cps.innerHTML=s.checkpoints.slice().reverse().map(cp=>`<button data-vm-checkpoint-id="${esc(cp.id)}"${engine.isTransient()?' disabled':''}><b>${esc(cp.label)}</b><small>${new Date(cp.timestamp).toLocaleString('pt-BR')}</small></button>`).join('')||'<p class="muted-copy">Nenhum checkpoint salvo.</p>';
    const edu=$('#vmEducationPanel');if(edu&&s.educationalLayer){const tips=educationForState(s.powerState,p);edu.innerHTML=`<header><b>${esc(tips.title)}</b><button data-vm-action="education">×</button></header><p>${esc(tips.text)}</p><small>${esc(tips.risk)}</small>`;}
    const inst=$('#vmInstructorPanel');if(inst&&s.instructorUnlocked){inst.innerHTML=`<header><b>Painel do instrutor</b><button data-vm-action="instructor-close">×</button></header><div class="instructor-controls"><select id="vmInstructorState">${['powered_off','post','firmware_setup','boot_device_menu','installer_language','installer_storage','installer_user','installer_summary','installer_copying','initial_setup','desktop','recovery'].map(v=>`<option>${v}</option>`).join('')}</select><button data-vm-action="instructor-jump">Ir para estado</button><select id="vmInstructorError"><option value="ram">RAM insuficiente</option><option value="disk">Disco insuficiente</option><option value="media">Mídia corrompida</option><option value="boot">Sem dispositivo de boot</option><option value="network">Sem rede</option></select><button data-vm-action="instructor-error">Provocar erro</button><button data-vm-action="instructor-inspect">Copiar estado técnico</button></div>`;}
  }
  function educationForState(state,p){const map={powered_off:['Configuração de hardware','A máquina ainda não foi ligada. Ajuste RAM, CPU, disco, firmware e mídia.','Configurações incompatíveis podem impedir o boot.'],post:['POST','O firmware testa processador, memória e dispositivos antes de procurar um sistema inicializável.','Interromper o POST pode impedir a inicialização.'],firmware_setup:['Firmware','A BIOS/UEFI controla dispositivos, segurança e ordem de inicialização.','Alterar Secure Boot ou o modo de disco pode impedir o sistema instalado de iniciar.'],boot_device_menu:['Menu de boot','Escolha qual dispositivo será usado nesta inicialização.','Selecionar um disco vazio produz erro de boot.'],installer_storage:['Particionamento','Partições organizam o disco e definem onde o sistema e o bootloader serão gravados.','Excluir ou formatar remove somente os dados virtuais deste laboratório.'],installer_copying:['Instalação','O instalador copia arquivos, configura serviços e prepara o bootloader.','Não desligue a máquina durante esta etapa.'],initial_setup:['Configuração inicial','Defina região, rede, usuário e preferências após a instalação.','Não use dados ou senhas reais.'],desktop:['Sistema instalado','A área de trabalho permite explorar arquivos, configurações e terminal do sistema simulado.','As ações continuam restritas ao navegador.']};const [title,text,risk]=map[state]||[p.product,'Explore esta etapa livremente dentro do ambiente simulado.','Nenhum recurso real do computador será alterado.'];return{title,text,risk};}
  function bindInputs(){
    const map={vmMachineName:'machineName',vmFormFactor:'formFactor',vmRam:'ramGB',vmCores:'cpuCores',vmDisk:'diskGB',vmSpeed:'speed',vmArch:'arch',vmFirmware:'firmware',vmDiskType:'diskType',vmController:'diskController',vmPartitionTable:'partitionTable',vmNetwork:'network',vmTpm:'tpm',vmGraphics:'graphics',vmLanguage:'language',vmKeyboard:'keyboard',vmRegion:'region',vmTimezone:'timezone',vmUsername:'username',vmHostname:'hostname'};
    Object.entries(map).forEach(([id,key])=>{const el=$(`#${id}`);if(!el)return;el.addEventListener('input',()=>{const value=['ramGB','cpuCores','diskGB'].includes(key)?Number(el.value):el.value;engine.updateConfig({[key]:value});refreshNonStructural();});});
    $('#vmProfile')?.addEventListener('change',e=>{engine.selectProfile(e.target.value);persist();renderShell();});
    [['vmSecureBoot','secureBoot'],['vmVirtualization','virtualization'],['vmNetworkConnected','networkConnected'],['vmAudio','audio']].forEach(([id,key])=>$('#'+id)?.addEventListener('change',e=>{engine.updateConfig({[key]:e.target.checked});refreshNonStructural();}));
    $('#vmMediaIntegrity')?.addEventListener('change',e=>{const value=e.target.value;engine.updateConfig({media:{...engine.state.media,inserted:value!=='missing',integrity:value==='missing'?'valid':value}});refreshNonStructural();});
    $('#vmPassword')?.addEventListener('input',e=>{engine.updateConfig({passwordDefined:Boolean(e.target.value)});});
    $$('[data-vm-tab]').forEach(btn=>btn.addEventListener('click',()=>{$$('[data-vm-tab]').forEach(b=>b.classList.toggle('active',b===btn));$$('[data-vm-panel]').forEach(panel=>panel.classList.toggle('hidden',panel.dataset.vmPanel!==btn.dataset.vmTab));}));
  }
  function refreshNonStructural(){
    const s=engine.state,p=engine.profile(),v=engine.validation();
    root.dataset.vmFamily=p.family;root.dataset.vmVisual=p.visual;
    const validation=$('.vm-validation');if(validation){validation.className=`vm-validation ${v.ok?'ok':'blocked'}`;validation.innerHTML=`<strong>${v.ok?'Configuração inicializável':'Configuração bloqueada'}</strong><p>${[...v.issues,...v.warnings].map(esc).join(' ')||'Todos os requisitos do perfil foram atendidos.'}</p>`;}
    $$('.vm-range').forEach(row=>{const input=row.querySelector('input'),out=row.querySelector('output');if(input&&out)out.textContent=input.id==='vmRam'?`${input.value} GB`:input.id==='vmCores'?`${input.value} núcleo(s)`:input.id==='vmDisk'?`${input.value} GB`:input.value;});
    renderDynamic();persist();
  }
  function bindActions(){
    if(actionsBound)return;actionsBound=true;
    root.addEventListener('click',handleClick);
    keyHandler=e=>{if(!root||!['post','firmware_splash'].includes(engine.state.powerState))return;if(['F2','Delete'].includes(e.key)){e.preventDefault();engine.enterFirmware();renderDynamic();}else if(e.key==='F12'){e.preventDefault();engine.openBootMenu();renderDynamic();}};
    document.addEventListener('keydown',keyHandler);
  }
  function askDialog({title,text='',type='text',value='',min='',max='',confirmLabel='Confirmar'}){
    const box=$('#vmLocalDialog'),input=$('#vmDialogInput');if(!box||!input)return Promise.resolve(null);
    $('#vmDialogTitle').textContent=title;$('#vmDialogText').textContent=text;input.type=type;input.value=value;input.min=min;input.max=max;box.querySelector('[data-vm-dialog=confirm]').textContent=confirmLabel;box.classList.remove('hidden');
    setTimeout(()=>input.focus(),20);return new Promise(resolve=>{dialogResolver=resolve;});
  }
  function closeDialog(value){const box=$('#vmLocalDialog');box?.classList.add('hidden');const resolve=dialogResolver;dialogResolver=null;resolve?.(value);}
  async function handleClick(event){
    const dialogButton=event.target.closest('[data-vm-dialog]');if(dialogButton){closeDialog(dialogButton.dataset.vmDialog==='confirm'?$('#vmDialogInput')?.value:null);return;}
    const actionButton=event.target.closest('[data-vm-action]');
    const scenarioButton=event.target.closest('[data-vm-scenario]');
    const checkpointButton=event.target.closest('[data-vm-checkpoint-id]');
    if(scenarioButton){applyScenario(scenarioButton.dataset.vmScenario);return;}
    if(checkpointButton){if(engine.isConfigLocked()&&!confirm('Restaurar este checkpoint descartará o estado atual da máquina. Continuar?'))return;engine.restoreCheckpoint(checkpointButton.dataset.vmCheckpointId);renderShell();persist();return;}
    if(!actionButton)return;
    if(actionLocked||actionButton.disabled)return;
    const action=actionButton.dataset.vmAction;
    actionLocked=true;actionButton.disabled=true;root?.classList.add('vm-action-busy');
    try{
      if(action==='noop')return;
      if(action==='power')await engine.powerOn();
      else if(action==='firmware'){if(!['powered_off','post','firmware_splash','firmware_setup','boot_device_menu','error'].includes(engine.state.powerState))throw new Error('Desligue a máquina ou conclua a operação atual antes de abrir o firmware.');engine.enterFirmware();}
      else if(action==='boot-menu'){if(!['powered_off','post','firmware_splash','firmware_setup','boot_device_menu','error'].includes(engine.state.powerState))throw new Error('O menu de boot não pode ser aberto durante esta etapa.');engine.openBootMenu();}
      else if(action==='firmware-save'){engine.setState('boot_device_menu');engine.log('Configurações do firmware salvas.','success');}
      else if(action.startsWith('boot-'))engine.selectBoot(action.replace('boot-',''));
      else if(action==='installer-next')engine.continueInstaller();
      else if(action==='installer-back')engine.back();
      else if(action==='installer-cancel'){if(confirm('Cancelar a instalação e desligar a máquina virtual? O progresso não concluído será descartado.'))engine.abortInstaller();}
      else if(action==='installer-language-next')engine.continueInstaller({language:$('#vmScreenLanguage')?.value,keyboard:$('#vmScreenKeyboard')?.value,region:$('#vmScreenRegion')?.value});
      else if(action==='partition-auto')engine.setAutomaticPartitions();
      else if(action==='partition-clear')engine.clearDisk();
      else if(action==='partition-add'){const free=Math.max(1,engine.state.diskGB-engine.state.partitions.reduce((n,p)=>n+Number(p.sizeGB||0),0));const raw=await askDialog({title:'Criar partição virtual',text:`Informe o tamanho em GB. Espaço livre: ${free.toFixed(1)} GB.`,type:'number',value:String(Math.min(20,free)),min:'0.1',max:String(free),confirmLabel:'Criar partição'});const size=Number(raw)||0;if(size>0)engine.addPartition({name:`Partição ${engine.state.partitions.length+1}`,sizeGB:size,filesystem:engine.profile().filesystem,mount:engine.profile().family==='linux'&&!engine.state.partitions.some(p=>p.mount==='/')?'/':''});}
      else if(action==='installer-storage-next')engine.continueInstaller({mode:engine.state.partitions.length?'manual':'automatic'});
      else if(action==='installer-user-next'){const password=$('#vmScreenPassword');engine.continueInstaller({username:$('#vmScreenUsername')?.value,hostname:$('#vmScreenHostname')?.value,passwordDefined:Boolean(password?.value)});if(password)password.value='';}
      else if(action==='installer-start')engine.continueInstaller();
      else if(action==='oobe-next')engine.continueInstaller();
      else if(action==='desktop-app')engine.openDesktopApp(actionButton.dataset.app);
      else if(action==='desktop-close')engine.closeDesktopApp();
      else if(action==='power-off'){if(engine.isTransient()&&!confirm('Desligar agora interromperá a operação em andamento e poderá deixar a instalação incompleta. Continuar?'))return;engine.shutdown();}
      else if(action==='restart'){if(engine.isTransient()&&!confirm('Reiniciar agora interromperá a operação em andamento. Continuar?'))return;engine.restart();}
      else if(action==='back-safe'){engine.cancel();engine.setState('powered_off');engine.state.errorMessage='';engine.state.errorCode=null;}
      else if(action==='checkpoint'){const label=await askDialog({title:'Salvar checkpoint',text:'Digite um nome para identificar este estado da máquina.',value:'Checkpoint manual',confirmLabel:'Salvar'});if(label)engine.checkpoint(label.slice(0,60));}
      else if(action==='restore-checkpoint'){if(engine.state.checkpoints.length){if(engine.isConfigLocked()&&!confirm('Restaurar o último checkpoint descartará o estado atual. Continuar?'))return;const last=engine.state.checkpoints.at(-1);engine.restoreCheckpoint(last.id);renderShell();}else ctx.toast('Nenhum checkpoint disponível.','warning');}
      else if(action==='education'){engine.updateConfig({educationalLayer:!engine.state.educationalLayer});}
      else if(action==='instructor')await unlockInstructor();
      else if(action==='instructor-close')engine.updateConfig({instructorUnlocked:false});
      else if(action==='instructor-jump')engine.instructorJump($('#vmInstructorState')?.value);
      else if(action==='instructor-error')engine.injectError($('#vmInstructorError')?.value);
      else if(action==='instructor-inspect'){await navigator.clipboard?.writeText(JSON.stringify(engine.report(),null,2));ctx.toast('Estado técnico copiado.','success');}
      else if(action==='toggle-config')root.classList.toggle('config-collapsed');
      renderDynamic();persist();
    }catch(error){ctx.toast(error.message||'Não foi possível concluir a ação.','error');engine.log(error.message||'Erro interno','error');renderDynamic();persist();}
    finally{actionLocked=false;root?.classList.remove('vm-action-busy');if(actionButton?.isConnected)actionButton.disabled=false;}
  }
  async function unlockInstructor(){
    if(engine.state.instructorUnlocked){renderDynamic();return;}
    const allowed=await ctx.eduauth?.authorize?.({actionId:'vm-instructor-access',resourceId:`vm-instructor:${engine.state.profileId}`,resourceLabel:`Painel do instrutor — ${engine.profile().product}`,classId:ctx.session?.get?.()?.studentClass||'Outra turma',subjectId:'sistemas-operacionais',lessonId:'atividade-atual',activityId:'maquina-virtual-instrutor'});
    if(!allowed){ctx.toast('O painel do instrutor permanece bloqueado.','warning');return;}
    engine.updateConfig({instructorUnlocked:true});engine.log('Modo instrutor liberado por autorização EduAuth vinculada à sessão.','warning');ctx.toast('Painel do instrutor liberado para esta sessão do laboratório.','success');
  }
  function applyScenario(id){
    const p=engine.profile();
    const base={powerState:'powered_off',progress:0,installStep:0,errorCode:null,errorMessage:'',partitions:[],installed:false};
    if(id==='standard')engine.updateConfig({...base,ramGB:Math.max(p.recRam,p.minRam),diskGB:Math.max(p.minDisk,64),arch:p.defaultArch,firmware:p.defaultFirmware,partitionTable:p.partitionTable,secureBoot:p.secureBoot==='required',tpm:p.tpm==='required'?'2.0':'none',networkConnected:true,media:{...engine.state.media,inserted:true,integrity:'valid',architecture:p.defaultArch}});
    else if(id==='gpt-mbr')engine.updateConfig({...base,firmware:'uefi',partitionTable:'mbr'});
    else if(id==='low-memory')engine.updateConfig({...base,ramGB:Math.max(.5,p.minRam/2)});
    else if(id==='corrupt-media')engine.updateConfig({...base,media:{...engine.state.media,inserted:true,integrity:'corrupt'}});
    else if(id==='no-network')engine.updateConfig({...base,networkConnected:false,network:'off'});
    else if(id==='dual-boot'){engine.updateConfig({...base,partitionTable:'gpt',partitions:[{name:'EFI',sizeGB:.5,filesystem:'fat32',mount:'/boot/efi',type:'efi',flags:['boot']},{name:'Windows',sizeGB:Math.max(20,engine.state.diskGB*.48),filesystem:'ntfs',mount:'C:',type:'primary',flags:[]},{name:'Linux',sizeGB:Math.max(16,engine.state.diskGB*.42),filesystem:'ext4',mount:'/',type:'linux',flags:[]},{name:'Swap',sizeGB:4,filesystem:'swap',mount:'swap',type:'swap',flags:[]} ]});}
    engine.log(`Cenário aplicado: ${id}.`,'warning');renderShell();persist();
  }
  async function persist(){if(ctx&&engine)await ctx.storage.set(STORAGE_KEY,{...engine.state,instructorUnlocked:false});}
  async function mount(host,context){
    root=host;ctx=context;await ensureDeps();const initial={...(await ctx.storage.get(STORAGE_KEY,{})),instructorUnlocked:false};
    engine=new window.LABDS_VM_ENGINE.VMEngine({profiles:window.LABDS_VM_PROFILES,initial,onChange:()=>{renderDynamic();persist();if(engine?.state?.installed&&engine?.state?.powerState==='desktop')window.LABDS.Core?.complete?.(`vm:installed:${engine.state.profileId}`,{xp:120,credits:45,reason:'Sistema operacional instalado e iniciado'});},onEvent:event=>ctx.logEvent({...event,context:{...(event.context||{}),technicalReport:engine?.report?.()}})});
    renderShell();engine.emit('mount');ctx.logEvent({eventType:'vm_session',action:'Laboratório de sistemas operacionais aberto',status:'success',context:{profileId:engine.state.profileId,simulation:true}});
  }
  function exportPayload(){const report=engine?.report?.()||{};const lines=['LABORATÓRIO VIRTUAL DS — SISTEMAS OPERACIONAIS','RELATÓRIO TÉCNICO','',`Sistema: ${report.system||''}`,`Edição: ${report.edition||''}`,`Arquitetura: ${report.architecture||''}`,`Firmware: ${report.firmware||''}`,`Secure Boot: ${report.secureBoot?'Ativado':'Desativado'}`,`TPM: ${report.tpm||''}`,`RAM: ${report.memoryGB||0} GB`,`CPU: ${report.cpu?.sockets||1} × ${report.cpu?.cores||0} núcleo(s)`,`Disco: ${report.disk?.sizeGB||0} GB ${report.disk?.table||''}`,`Idioma: ${report.language||''}`,`Teclado: ${report.keyboard||''}`,`Rede: ${report.network||''}`,`Usuário: ${report.username||''}`,`Senha definida: ${report.passwordDefined?'sim':'não'}`,'Conteúdo da senha: não armazenado',`Estado final: ${report.state||''}`,`Instalação concluída: ${report.installed?'Sim':'Não'}`,'','PARTIÇÕES',...(report.disk?.partitions||[]).map((p,i)=>`${i+1}. ${p.name} — ${p.sizeGB} GB — ${p.filesystem} — ${p.mount||'-'}`),'','LOGS',...(report.logs||[]).map(l=>`[${new Date(l.timestamp).toLocaleString('pt-BR')}] ${l.message}`)];return{text:lines.join('\n'),native:JSON.stringify(report,null,2),backup:engine?.state||{},meta:[{label:'Sistema',value:report.system||''},{label:'Estado',value:report.state||''},{label:'Instalado',value:report.installed?'Sim':'Não'}]};}
  function help(){return `<h3>Laboratório de Sistemas Operacionais</h3><p>Configure hardware virtual, firmware, mídia, discos e acompanhe uma instalação simulada. Cada perfil possui boot, instalador, configuração inicial e área de trabalho próprios.</p><ul><li>Use <b>Ligar máquina</b> para executar POST e abrir o menu de boot.</li><li>Abra <b>BIOS/UEFI</b> para observar o firmware.</li><li>Escolha a mídia de instalação, idioma, teclado, disco e usuário.</li><li>Não utilize senhas reais. O conteúdo do campo de senha não é salvo.</li><li>Todos os discos e sistemas existem somente dentro do navegador.</li></ul><p><b>Modo instrutor:</b> permite saltar etapas e provocar falhas para demonstração. A antiga senha fixa foi removida e substituída por uma autorização EduAuth temporária, vinculada à sessão e somente a este painel.</p>`;}
  async function unmount(){document.removeEventListener('keydown',keyHandler);if(root)root.removeEventListener('click',handleClick);keyHandler=null;actionsBound=false;dialogResolver?.(null);dialogResolver=null;engine?.cancel();await persist();root=null;ctx=null;engine=null;}
  window.LABDS_LABS['vm-lab']={mount,unmount,exportPayload,help};
})();
