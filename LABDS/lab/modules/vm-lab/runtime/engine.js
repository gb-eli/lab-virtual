'use strict';
(function(){
  const clone=value=>JSON.parse(JSON.stringify(value));
  const uid=()=>globalThis.crypto?.randomUUID?.()||`vm-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const now=()=>new Date().toISOString();
  const SPEED={quick:.38,normal:.8,detailed:1.45,instructor:.08};
  const TRANSIENT_STATES=new Set(['powering_on','post','firmware_splash','bootloader','installer_copying','restarting']);
  const sleep=(ms,signal)=>new Promise((resolve,reject)=>{const id=setTimeout(resolve,ms);if(signal)signal.addEventListener('abort',()=>{clearTimeout(id);const error=new Error('Operação interrompida');error.name='AbortError';reject(error);},{once:true});});
  class VMEngine{
    constructor({profiles,initial,onChange,onEvent}){
      this.profiles=profiles;this.onChange=onChange||(()=>{});this.onEvent=onEvent||(()=>{});this.abortController=null;this.transitionLocked=false;
      this.state=this.normalize(initial||{});
    }
    normalize(initial){
      const profileId=this.profiles[initial.profileId]?initial.profileId:'windows10';
      const p=this.profiles[profileId];
      const state={
        vmId:initial.vmId||uid(),profileId,mode:initial.mode||'simple',speed:initial.speed||'normal',
        machineName:initial.machineName||'LAB-DS-01',formFactor:initial.formFactor||this.defaultFormFactor(p),manufacturer:initial.manufacturer||'LAB DS Virtual',model:initial.model||'Education Workstation',serial:initial.serial||`DS-${Math.random().toString(36).slice(2,10).toUpperCase()}`,
        arch:initial.arch||p.defaultArch,cpuCores:Number(initial.cpuCores||2),cpuSockets:Number(initial.cpuSockets||1),virtualization:initial.virtualization!==false,nx:initial.nx!==false,ramGB:Number(initial.ramGB||Math.max(p.minRam,p.recRam||p.minRam)),
        diskType:initial.diskType||'ssd-sata',diskGB:Number(initial.diskGB||Math.max(p.minDisk,64)),diskController:initial.diskController||'ahci',allocation:initial.allocation||'dynamic',partitionTable:initial.partitionTable||p.partitionTable,partitions:Array.isArray(initial.partitions)?initial.partitions:[],
        firmware:initial.firmware||p.defaultFirmware,secureBoot:initial.secureBoot??(p.secureBoot==='required'),tpm:initial.tpm|| (p.tpm==='required'?'2.0':'none'),bootOrder:Array.isArray(initial.bootOrder)?initial.bootOrder:['media','disk','network'],
        graphics:initial.graphics||'integrated',videoMB:Number(initial.videoMB||128),acceleration3d:initial.acceleration3d!==false,
        network:initial.network||'nat',networkConnected:initial.networkConnected!==false,audio:initial.audio!==false,usb:initial.usb||'3.0',keyboard:initial.keyboard||(p.keyboards?.[0]||'ABNT2'),language:initial.language||(p.languages?.[0]||'Português (Brasil)'),region:initial.region||'Brasil',timezone:initial.timezone||'America/Sao_Paulo',
        media:initial.media||{type:'iso',label:p.product,architecture:p.defaultArch,integrity:'valid',inserted:true,bootMode:p.defaultFirmware},
        username:initial.username||'aluno',hostname:initial.hostname||'laboratorio-ds',passwordDefined:Boolean(initial.passwordDefined),
        powerState:initial.powerState||'powered_off',previousState:initial.previousState||null,progress:Number(initial.progress||0),installStep:Number(initial.installStep||0),oobeStep:Number(initial.oobeStep||0),
        selectedBoot:initial.selectedBoot||'media',storageMode:initial.storageMode||'automatic',selectedDisk:'disk0',errorCode:initial.errorCode||null,errorMessage:initial.errorMessage||'',
        checkpoints:Array.isArray(initial.checkpoints)?initial.checkpoints:[],logs:Array.isArray(initial.logs)?initial.logs.slice(-300):[],history:Array.isArray(initial.history)?initial.history.slice(-300):[],desktopApp:initial.desktopApp||null,
        educationalLayer:Boolean(initial.educationalLayer),instructorUnlocked:Boolean(initial.instructorUnlocked),paused:Boolean(initial.paused),createdAt:initial.createdAt||now(),updatedAt:now(),installed:Boolean(initial.installed),
        installStartedAt:initial.installStartedAt||null,installFinishedAt:initial.installFinishedAt||null,restartCount:Number(initial.restartCount||0),lastInstallDetail:initial.lastInstallDetail||''
      };
      if(!state.partitions.length&&state.installed)state.partitions=this.defaultPartitions(state,p);
      return state;
    }
    defaultFormFactor(profile){if(profile.family==='macos')return profile.id==='mac-apple'?'macbook':'imac';if(profile.family==='chrome')return profile.id==='chromeos'?'chromebook':'notebook';return 'desktop';}
    profile(){return this.profiles[this.state.profileId];}
    isTransient(){return TRANSIENT_STATES.has(this.state.powerState);}
    isConfigLocked(){return !['powered_off','error'].includes(this.state.powerState);}
    canCheckpoint(){return !TRANSIENT_STATES.has(this.state.powerState);}
    emit(reason='update'){this.state.updatedAt=now();this.onChange(clone(this.state),reason);}
    log(message,tone='info',context={}){const item={id:uid(),timestamp:now(),state:this.state.powerState,message:String(message),tone,context};this.state.logs.push(item);this.state.logs=this.state.logs.slice(-300);this.state.history.push({state:this.state.powerState,timestamp:item.timestamp});this.state.history=this.state.history.slice(-300);this.onEvent({eventType:'vm_event',action:message,status:tone==='error'?'error':'success',input:'',output:message,context:{profileId:this.state.profileId,powerState:this.state.powerState,...context}});this.emit('log');return item;}
    updateConfig(patch,reason='configuration'){this.state={...this.state,...patch};const p=this.profile();if(p&&!p.architectures.includes(this.state.arch))this.state.arch=p.defaultArch;if(p&&!p.firmwareSupport.includes(this.state.firmware))this.state.firmware=p.defaultFirmware;this.emit(reason);}
    selectProfile(profileId){if(!this.profiles[profileId])return;const old=this.state;const p=this.profiles[profileId];this.cancel();this.state=this.normalize({...old,profileId,arch:p.defaultArch,firmware:p.defaultFirmware,partitionTable:p.partitionTable,keyboard:p.keyboards?.[0]||old.keyboard,language:p.languages?.[0]||old.language,ramGB:Math.max(old.ramGB,p.minRam),diskGB:Math.max(old.diskGB,p.minDisk),secureBoot:p.secureBoot==='required'?true:p.secureBoot==='unsupported'?false:old.secureBoot,tpm:p.tpm==='required'?'2.0':p.tpm==='unsupported'?'none':old.tpm,powerState:'powered_off',progress:0,installStep:0,oobeStep:0,errorCode:null,errorMessage:'',installed:false,partitions:[],desktopApp:null,media:{type:'iso',label:p.product,architecture:p.defaultArch,integrity:'valid',inserted:true,bootMode:p.defaultFirmware}});this.log(`Perfil selecionado: ${p.product} ${p.version}.`,'info');}
    validation(){
      const s=this.state,p=this.profile(),issues=[],warnings=[];
      if(!p.architectures.includes(s.arch))issues.push(`A arquitetura ${s.arch} não é compatível com esta mídia.`);
      if(s.ramGB<p.minRam)issues.push(`Memória insuficiente: mínimo ${p.minRam} GB.`);else if(s.ramGB<p.recRam)warnings.push(`Memória abaixo do recomendado de ${p.recRam} GB.`);
      if(s.diskGB<p.minDisk)issues.push(`Disco insuficiente: mínimo ${p.minDisk} GB.`);
      if(!p.firmwareSupport.includes(s.firmware))issues.push(`O firmware ${s.firmware} não é aceito neste perfil.`);
      if(p.secureBoot==='required'&&!s.secureBoot)issues.push('Secure Boot é obrigatório para este perfil.');
      if(p.secureBoot==='unsupported'&&s.secureBoot)issues.push('Secure Boot não é suportado por este perfil.');
      if(p.tpm==='required'&&s.tpm!=='2.0')issues.push('TPM 2.0 é obrigatório para este perfil.');
      if(!s.media?.inserted){if(!s.installed)issues.push('Nenhuma mídia inicializável está conectada.');else warnings.push('A mídia foi removida; o sistema instalado iniciará pelo disco virtual.');}
      if(s.media?.integrity==='corrupt'){if(!s.installed)issues.push('A mídia selecionada está corrompida.');else warnings.push('A mídia conectada está corrompida, mas o disco instalado ainda pode iniciar.');}
      if(s.media?.architecture&&s.media.architecture!==s.arch){if(!s.installed)issues.push('A arquitetura da mídia é diferente da máquina virtual.');else warnings.push('A mídia conectada tem arquitetura incompatível; use o disco instalado.');}
      if(s.firmware==='uefi'&&s.partitionTable==='mbr'&&p.family==='windows')warnings.push('Inicialização UEFI costuma exigir disco GPT.');
      if(s.firmware==='bios'&&s.partitionTable==='gpt'&&p.family==='windows'&&['windows7','windows8','windows81','windows10'].includes(p.id))warnings.push('Boot Legacy com GPT pode impedir a instalação do Windows.');
      if(p.id==='chromeos-flex'&&s.arch!=='x64')issues.push('ChromeOS Flex exige computador x86-64.');
      if(p.family==='macos'&&s.formFactor==='desktop'&&!String(s.model).toLowerCase().includes('mac'))warnings.push('Use um perfil de hardware Mac para maior coerência.');
      if(!s.networkConnected&&p.family==='chrome')warnings.push('A configuração inicial terá recursos limitados sem rede.');
      return{ok:issues.length===0,issues,warnings};
    }
    defaultPartitions(state=this.state,profile=this.profile()){
      const gb=state.diskGB;
      if(profile.family==='windows'&&state.firmware==='uefi')return[
        {name:'Sistema EFI',sizeGB:.1,filesystem:'fat32',type:'efi',mount:'EFI',flags:['boot']},
        {name:'MSR',sizeGB:.016,filesystem:'reserved',type:'msr',mount:'',flags:['hidden']},
        {name:'Windows',sizeGB:Math.max(1,gb-.766),filesystem:'ntfs',type:'primary',mount:'C:',flags:[]},
        {name:'Recuperação',sizeGB:.65,filesystem:'ntfs',type:'recovery',mount:'',flags:['hidden','recovery']}
      ];
      if(profile.family==='windows')return[
        {name:'Reservado pelo Sistema',sizeGB:.5,filesystem:'ntfs',type:'system',mount:'',flags:['active','boot']},
        {name:'Windows',sizeGB:Math.max(1,gb-.5),filesystem:'ntfs',type:'primary',mount:'C:',flags:[]}
      ];
      if(profile.family==='linux')return[
        ...(state.firmware==='uefi'?[{name:'EFI',sizeGB:.512,filesystem:'fat32',type:'efi',mount:'/boot/efi',flags:['boot']}]:[]),
        {name:'Raiz',sizeGB:Math.max(8,gb-Math.max(4,Math.min(8,state.ramGB))-(state.firmware==='uefi'?.512:0)),filesystem:profile.filesystem||'ext4',type:'linux',mount:'/',flags:[]},
        {name:'Swap',sizeGB:Math.max(2,Math.min(8,state.ramGB)),filesystem:'swap',type:'swap',mount:'swap',flags:[]}
      ];
      if(profile.family==='macos')return[
        {name:'EFI',sizeGB:.2,filesystem:'fat32',type:'efi',mount:'EFI',flags:['boot']},
        {name:'Container APFS',sizeGB:Math.max(1,gb-.2),filesystem:'apfs',type:'container',mount:'/',flags:[]}
      ];
      if(profile.family==='chrome')return[
        {name:'EFI-SYSTEM',sizeGB:.064,filesystem:'fat32',type:'efi',mount:'',flags:['boot']},
        {name:'ROOT-A',sizeGB:4,filesystem:'chromeos',type:'system',mount:'',flags:['verified']},
        {name:'ROOT-B',sizeGB:4,filesystem:'chromeos',type:'system',mount:'',flags:['verified']},
        {name:'STATE',sizeGB:Math.max(1,gb-8.064),filesystem:'chromeos',type:'data',mount:'/home/chronos',flags:[]}
      ];
      return[];
    }
    setAutomaticPartitions(){this.state.storageMode='automatic';this.state.partitions=this.defaultPartitions();this.log('Particionamento automático preparado.','success',{partitions:this.state.partitions});}
    clearDisk(){this.state.partitions=[];this.state.partitionTable=this.profile().partitionTable;this.log('Disco virtual limpo.','warning');}
    addPartition({name='Nova partição',sizeGB=10,filesystem,mount=''}){const used=this.state.partitions.reduce((sum,p)=>sum+Number(p.sizeGB||0),0);if(used+Number(sizeGB)>this.state.diskGB)throw new Error('Não há espaço livre suficiente no disco virtual.');this.state.partitions.push({name,sizeGB:Number(sizeGB),filesystem:filesystem||this.profile().filesystem,type:'primary',mount,flags:[]});this.state.storageMode='manual';this.log(`Partição criada: ${name} (${sizeGB} GB).`,'success');}
    validatePartitions(){const p=this.profile(),parts=this.state.partitions,errors=[];if(!parts.length)errors.push('Nenhuma partição foi criada.');if(p.family==='windows'&&!parts.some(x=>x.filesystem==='ntfs'))errors.push('O Windows precisa de uma partição NTFS.');if(p.family==='linux'&&!parts.some(x=>x.mount==='/'))errors.push('Defina uma partição raiz montada em /.');if(p.family==='linux'&&this.state.firmware==='uefi'&&!parts.some(x=>x.mount==='/boot/efi'&&x.filesystem==='fat32'))errors.push('Uma partição EFI FAT32 montada em /boot/efi é necessária.');if(p.family==='macos'&&!parts.some(x=>x.filesystem==='apfs'))errors.push('O macOS moderno exige volume APFS.');return errors;}
    checkpoint(label){if(!this.canCheckpoint())throw new Error('Aguarde a operação atual terminar antes de salvar um checkpoint.');const snapshot=clone({...this.state,checkpoints:[]});const item={id:uid(),label,timestamp:now(),state:snapshot};this.state.checkpoints.push(item);this.state.checkpoints=this.state.checkpoints.slice(-16);this.log(`Checkpoint criado: ${label}.`,'success');return item;}
    restoreCheckpoint(id){const found=this.state.checkpoints.find(c=>c.id===id);if(!found)return false;const checkpoints=this.state.checkpoints;this.cancel();let restored=clone(found.state),restoredState=restored.powerState||'powered_off';if(TRANSIENT_STATES.has(restoredState)){restoredState=restored.installed?'powered_off':'installer_summary';restored.progress=restored.installed?100:0;restored.installStep=0;}this.state=this.normalize({...restored,checkpoints,powerState:restoredState});this.log(`Checkpoint restaurado: ${found.label}.`,'success');return true;}
    setState(next,reason='transition'){this.state.previousState=this.state.powerState;this.state.powerState=next;this.state.desktopApp=null;this.emit(reason);}
    duration(base){return Math.max(30,base*(SPEED[this.state.speed]||SPEED.normal));}
    cancel(){this.abortController?.abort();this.abortController=null;this.state.paused=false;}
    async powerOn(){
      if(['powering_on','post','bootloader','installer_copying','restarting'].includes(this.state.powerState))return;
      const check=this.validation();if(!check.ok){this.state.errorCode='HARDWARE_CONFIGURATION';this.state.errorMessage=check.issues[0];this.setState('error');this.log(check.issues[0],'error');return;}
      this.cancel();this.abortController=new AbortController();const signal=this.abortController.signal;
      try{
        this.setState('powering_on');this.log(`Ligando ${this.state.machineName}...`);
        await sleep(this.duration(450),signal);
        this.setState('post');this.log(`POST: CPU ${this.state.cpuCores} núcleo(s), ${this.state.ramGB} GB RAM, disco ${this.state.diskGB} GB.`);
        await sleep(this.duration(1250),signal);
        this.setState('firmware_splash');
        await sleep(this.duration(650),signal);
        this.setState('boot_device_menu');
      }catch(error){if(error.name!=='AbortError')throw error;}
    }
    enterFirmware(){this.cancel();this.setState('firmware_setup');this.log(`Acesso ao firmware ${this.state.firmware}.`);}
    openBootMenu(){this.cancel();this.setState('boot_device_menu');this.log('Menu de boot aberto.');}
    selectBoot(device){
      this.state.selectedBoot=device;
      if(device==='media'){
        if(!this.state.media?.inserted){this.state.errorCode='NO_BOOTABLE_MEDIA';this.state.errorMessage='Nenhuma mídia de instalação está conectada à unidade virtual.';this.setState('error');this.log(this.state.errorMessage,'error');return;}
        if(this.state.media.integrity==='corrupt'){this.state.errorCode='MEDIA_READ_ERROR';this.state.errorMessage='Falha ao ler a mídia: a imagem de instalação está corrompida.';this.setState('error');this.log(this.state.errorMessage,'error');return;}
        if(this.state.media.architecture&&this.state.media.architecture!==this.state.arch){this.state.errorCode='BOOT_ARCH_MISMATCH';this.state.errorMessage='A arquitetura da mídia não corresponde à arquitetura da máquina.';this.setState('error');this.log(this.state.errorMessage,'error');return;}
      }
      if(device==='disk'&&!this.state.installed){this.state.errorCode='NO_BOOTABLE_DEVICE';this.state.errorMessage='Nenhum sistema inicializável foi encontrado no disco virtual.';this.setState('error');this.log(this.state.errorMessage,'error');return;}
      if(device==='network'&&(this.state.network==='off'||!this.state.networkConnected)){this.state.errorCode='PXE_NETWORK_UNAVAILABLE';this.state.errorMessage='PXE-E61: falha no teste de mídia. Adaptador ou link de rede indisponível.';this.setState('error');this.log(this.state.errorMessage,'error');return;}
      if(device==='recovery'){this.setState('recovery');this.log('Ambiente de recuperação iniciado.');return;}
      if(device==='disk'&&this.state.installed){this.setState('bootloader');this.emit();setTimeout(()=>{this.setState('desktop');this.log(`${this.profile().product} iniciado pelo disco virtual.`,'success');},this.duration(900));return;}
      this.setState('bootloader');this.log(`Inicializando pela mídia: ${this.state.media.label}.`);setTimeout(()=>this.setState('installer_loading'),this.duration(750));
    }
    continueInstaller(payload={}){
      if(this.transitionLocked)throw new Error('Aguarde a etapa atual terminar antes de continuar.');
      const current=this.state.powerState;
      if(current==='installer_loading'){this.setState('installer_language');return;}
      if(current==='installer_language'){
        const profile=this.profile();
        const language=String(payload.language||'').trim();
        const keyboard=String(payload.keyboard||'').trim();
        const region=String(payload.region||'').trim().replace(/[\u0000-\u001f\u007f<>]/g,'').replace(/\s+/g,' ').slice(0,60);
        if(!profile.languages.includes(language))throw new Error('Selecione um idioma disponível para este sistema.');
        if(!profile.keyboards.includes(keyboard))throw new Error('Selecione um layout de teclado disponível.');
        if(region.length<2)throw new Error('Informe um país ou região válido antes de continuar.');
        this.updateConfig({language,keyboard,region},'installer_language');
        this.log(`Idioma ${language}, região ${region} e teclado ${keyboard} confirmados.`,'success');
        this.setState('installer_storage');return;
      }
      if(current==='installer_storage'){
        if(payload.mode==='automatic'||!this.state.partitions.length)this.setAutomaticPartitions();
        const errors=this.validatePartitions();if(errors.length){this.state.errorCode='PARTITION_LAYOUT';this.state.errorMessage=errors[0];this.emit('partition_error');return;}
        this.state.errorMessage='';this.setState('installer_user');return;
      }
      if(current==='installer_user'){
        const username=String(payload.username||this.state.username).trim().replace(/[^a-zA-Z0-9._-]/g,'').slice(0,30)||'aluno';
        const hostname=String(payload.hostname||this.state.hostname).trim().replace(/[^a-zA-Z0-9-]/g,'').slice(0,30)||'laboratorio-ds';
        this.updateConfig({username,hostname,passwordDefined:Boolean(payload.passwordDefined)},'installer_user');this.setState('installer_summary');return;
      }
      if(current==='installer_summary'){this.install();return;}
      if(current==='initial_setup'){this.state.oobeStep++;if(this.state.oobeStep>=this.profile().oobe.length){this.state.installed=true;this.checkpoint('Instalação concluída');this.setState('desktop');this.log(`${this.profile().product} pronto para uso.`,'success');}else this.emit('oobe_next');return;}
      if(current==='recovery'){this.setState('installer_loading');return;}
    }
    back(){if(this.transitionLocked)return false;const map={installer_language:'installer_loading',installer_storage:'installer_language',installer_user:'installer_storage',installer_summary:'installer_user',initial_setup:'restarting',boot_device_menu:'firmware_splash'};const next=map[this.state.powerState];if(next){this.setState(next,'back');return true;}return false;}
    abortInstaller(){this.cancel();this.transitionLocked=false;this.state.progress=0;this.state.installStep=0;this.state.errorCode=null;this.state.errorMessage='';this.setState('powered_off','installer_cancelled');this.log('Instalação cancelada pelo usuário. A máquina foi desligada.','warning');}
    async install(){
      if(this.transitionLocked)throw new Error('A instalação já está sendo processada.');
      this.transitionLocked=true;
      const partitionErrors=this.validatePartitions();if(partitionErrors.length){this.transitionLocked=false;this.state.errorCode='PARTITION_LAYOUT';this.state.errorMessage=partitionErrors[0];this.setState('error');this.log(this.state.errorMessage,'error');return;}
      this.cancel();this.checkpoint('Antes da instalação');this.abortController=new AbortController();const signal=this.abortController.signal;this.state.progress=0;this.state.installStep=0;this.state.installStartedAt=now();this.state.installFinishedAt=null;this.state.lastInstallDetail='Preparando o disco virtual';this.setState('installer_copying');this.log('Gravação no disco virtual confirmada.','warning');
      const steps=this.profile().installSteps||['Copiando arquivos','Configurando sistema','Finalizando'];
      try{
        for(let step=0;step<steps.length;step++){
          this.state.installStep=step;this.state.lastInstallDetail=steps[step];this.log(steps[step]);
          const target=Math.round(((step+1)/steps.length)*100);
          while(this.state.progress<target){await sleep(this.duration(90+Math.random()*130),signal);this.state.progress=Math.min(target,this.state.progress+Math.max(1,Math.round(Math.random()*4)));this.emit('install_progress');}
        }
        this.state.installFinishedAt=now();this.state.selectedBoot='disk';this.state.restartCount++;this.setState('restarting');this.log('Instalação gravada. Removendo a prioridade da mídia e reiniciando pelo disco virtual...');await sleep(this.duration(1200),signal);
        this.state.oobeStep=0;this.setState('initial_setup');this.checkpoint('Primeira inicialização');
      }catch(error){if(error.name!=='AbortError'){this.state.errorMessage=error.message;this.setState('error');this.log(error.message,'error');}}finally{this.transitionLocked=false;this.abortController=null;this.emit('install_finished');}
    }
    pause(){this.state.paused=!this.state.paused;if(this.state.paused)this.cancel();this.emit('pause');}
    shutdown(){this.cancel();this.transitionLocked=false;this.state.progress=0;this.setState('powered_off');this.log('Máquina desligada.');}
    restart(){this.cancel();this.setState('restarting');setTimeout(()=>{this.state.powerState=this.state.installed?'desktop':'boot_device_menu';this.emit('restart_complete');},this.duration(900));this.log('Reinicialização solicitada.');}
    resetMachine(){this.transitionLocked=false;const profileId=this.state.profileId,mode=this.state.mode,speed=this.state.speed,instructorUnlocked=this.state.instructorUnlocked;this.cancel();this.state=this.normalize({profileId,mode,speed,instructorUnlocked});this.log('Máquina virtual restaurada ao estado inicial.','warning');}
    openDesktopApp(app){this.state.desktopApp=app;this.emit('desktop_app');this.log(`Aplicativo aberto: ${app}.`);}
    closeDesktopApp(){this.state.desktopApp=null;this.emit('desktop_app_close');}
    instructorJump(state){if(!this.state.instructorUnlocked)return;this.cancel();this.setState(state,'instructor_jump');this.log(`Instrutor avançou para: ${state}.`,'warning');}
    injectError(code){if(!this.state.instructorUnlocked)return;const messages={ram:'Falha: memória insuficiente.',disk:'Falha: espaço insuficiente no disco.',media:'Falha: mídia de instalação corrompida.',boot:'Falha: nenhum dispositivo inicializável.',network:'Falha: rede indisponível para continuar.'};this.state.errorCode=code;this.state.errorMessage=messages[code]||'Erro simulado pelo instrutor.';this.setState('error');this.log(this.state.errorMessage,'error');}
    report(){const p=this.profile();return{vmId:this.state.vmId,system:`${p.product} ${p.version}`,edition:p.edition,architecture:this.state.arch,firmware:this.state.firmware,secureBoot:this.state.secureBoot,tpm:this.state.tpm,boot:this.state.selectedBoot,disk:{sizeGB:this.state.diskGB,type:this.state.diskType,table:this.state.partitionTable,partitions:this.state.partitions},memoryGB:this.state.ramGB,cpu:{sockets:this.state.cpuSockets,cores:this.state.cpuCores},language:this.state.language,keyboard:this.state.keyboard,region:this.state.region,network:this.state.network,username:this.state.username,hostname:this.state.hostname,passwordDefined:this.state.passwordDefined,passwordContentStored:false,state:this.state.powerState,installed:this.state.installed,installation:{startedAt:this.state.installStartedAt,finishedAt:this.state.installFinishedAt,progress:this.state.progress,currentStep:this.state.lastInstallDetail,restarts:this.state.restartCount},checkpoints:this.state.checkpoints.map(c=>({id:c.id,label:c.label,timestamp:c.timestamp})),logs:this.state.logs,simulation:true,generatedAt:now()};}
  }
  window.LABDS_VM_ENGINE={VMEngine,SPEED};
})();
