'use strict';
(function(global){
  const VERSION='1.0.0';
  const OS_PROFILES={
    windows11:{id:'windows11',label:'Windows 11 educacional',short:'Windows 11',accent:'#2f7cf6',wallpaper:'windows',installLabel:'Instalando Windows',apps:['Área de trabalho','Gerenciador de tarefas','Benchmark 3D','Configurações']},
    linuxMint:{id:'linuxMint',label:'Linux Mint educacional',short:'Linux Mint',accent:'#58b15b',wallpaper:'mint',installLabel:'Instalando Linux Mint',apps:['Área de trabalho','Monitor do sistema','Benchmark OpenGL','Terminal']}
  };
  const PHASES=['off','post','firmware','boot','install','desktop','benchmark','warning','throttling','shutdown','smoke','fire','extinguished','error'];
  const POST_STEPS=[
    {id:'power',label:'Fonte, tensões e proteção elétrica',duration:330},
    {id:'cpu',label:'Processador, microcódigo e refrigeração',duration:420},
    {id:'memory',label:'Treinamento e teste da memória RAM',duration:470},
    {id:'video',label:'GPU, saídas de vídeo e monitor',duration:390},
    {id:'storage',label:'Armazenamento e unidade inicializável',duration:390},
    {id:'io',label:'USB, áudio, rede e periféricos',duration:320},
    {id:'boot',label:'Firmware e ordem de inicialização',duration:320}
  ];
  const INSTALL_STEPS=['Preparando arquivos','Criando partições','Copiando sistema','Instalando componentes','Configurando dispositivos','Aplicando preferências','Finalizando instalação'];
  function clamp(value,min,max){return Math.min(max,Math.max(min,Number(value)||0));}
  function normalize(raw={}){
    const os=OS_PROFILES[raw.os]?raw.os:'windows11';
    const phase=PHASES.includes(raw.phase)?raw.phase:'off';
    return{os,phase,installed:raw.installed!==false,progress:clamp(raw.progress,0,100),postIndex:Math.max(0,Math.min(POST_STEPS.length-1,Math.round(Number(raw.postIndex)||0))),installIndex:Math.max(0,Math.min(INSTALL_STEPS.length-1,Math.round(Number(raw.installIndex)||0))),desktopApp:['desktop','system','benchmark','settings','terminal'].includes(raw.desktopApp)?raw.desktopApp:'desktop',uptime:Math.max(0,Number(raw.uptime)||0),lastBoot:raw.lastBoot||null,lastShutdown:raw.lastShutdown||null,message:String(raw.message||''),error:String(raw.error||''),throttling:clamp(raw.throttling,0,100),screenBrightness:clamp(raw.screenBrightness||1,.2,1.35)};
  }
  function setPhase(system,phase,message=''){system.phase=PHASES.includes(phase)?phase:'error';system.message=String(message||'');if(phase!=='error')system.error='';return system;}
  function beginPost(system){system.phase='post';system.progress=0;system.postIndex=0;system.message=POST_STEPS[0].label;system.error='';return system;}
  function advancePost(system){if(system.postIndex<POST_STEPS.length-1){system.postIndex++;system.progress=Math.round(system.postIndex/POST_STEPS.length*100);system.message=POST_STEPS[system.postIndex].label;return{done:false,step:POST_STEPS[system.postIndex]};}system.progress=100;system.phase='firmware';system.message='POST concluído. Firmware pronto.';return{done:true,step:null};}
  function beginBoot(system){system.phase='boot';system.progress=0;system.message=`Inicializando ${OS_PROFILES[system.os].short}`;return system;}
  function beginInstall(system){system.phase='install';system.installed=false;system.progress=0;system.installIndex=0;system.message=INSTALL_STEPS[0];return system;}
  function installTick(system,amount=8){system.progress=clamp(system.progress+amount,0,100);system.installIndex=Math.min(INSTALL_STEPS.length-1,Math.floor(system.progress/100*INSTALL_STEPS.length));system.message=INSTALL_STEPS[system.installIndex];if(system.progress>=100){system.installed=true;system.phase='boot';system.progress=0;system.message=`Instalação concluída. Reiniciando ${OS_PROFILES[system.os].short}.`;return{done:true};}return{done:false};}
  function bootTick(system,amount=12){system.progress=clamp(system.progress+amount,0,100);if(system.progress>=100){system.phase='desktop';system.progress=100;system.lastBoot=new Date().toISOString();system.message='Sistema pronto para uso.';return{done:true};}return{done:false};}
  function shutdown(system,reason='Desligamento solicitado'){system.phase='shutdown';system.message=reason;system.lastShutdown=new Date().toISOString();system.throttling=0;return system;}
  function finishShutdown(system){system.phase='off';system.progress=0;system.message='Computador desligado.';return system;}
  function screenModel(system,context={}){
    const os=OS_PROFILES[system.os]||OS_PROFILES.windows11,temps=context.temperatures||{},phase=system.phase;
    const base={phase,os,title:'SEM SINAL',subtitle:'Aguardando energia',accent:os.accent,progress:system.progress,classes:[`phase-${phase}`,`os-${os.wallpaper}`],tiles:[],temperatures:temps};
    if(phase==='off')return base;
    if(phase==='post')return{...base,title:'POWER-ON SELF-TEST',subtitle:system.message||POST_STEPS[system.postIndex]?.label,tiles:[['POST',`${system.postIndex+1}/${POST_STEPS.length}`],['CPU',context.cpu||'—'],['RAM',context.ram||'—']]};
    if(phase==='firmware')return{...base,title:'UEFI / FIRMWARE',subtitle:'Hardware validado. Selecione iniciar ou instalar.',tiles:[['Boot',context.storage||'—'],['Temperatura',`${temps.cpu||'—'} °C`],['Ventoinhas',context.fans||'—']]};
    if(phase==='install')return{...base,title:os.installLabel,subtitle:system.message,tiles:[['Progresso',`${Math.round(system.progress)}%`],['Etapa',`${system.installIndex+1}/${INSTALL_STEPS.length}`],['Destino',context.storage||'—']]};
    if(phase==='boot')return{...base,title:os.short,subtitle:system.message||'Inicializando sistema',tiles:[['Inicialização',`${Math.round(system.progress)}%`],['Unidade',context.storage||'—'],['Perfil',context.family||'—']]};
    if(['desktop','benchmark','warning','throttling'].includes(phase))return{...base,title:phase==='benchmark'?'BENCHMARK EM EXECUÇÃO':phase==='warning'?'ALERTA TÉRMICO':phase==='throttling'?'LIMITAÇÃO TÉRMICA':os.short,subtitle:system.message||'Área de trabalho simulada',tiles:[['CPU',`${temps.cpu||'—'} °C`],['GPU',`${temps.gpu||'—'} °C`],['Uso',phase==='desktop'?'Pronto':`${context.load||0}%`],['FPS',context.fps||'—']]};
    if(phase==='shutdown')return{...base,title:'DESLIGAMENTO DE PROTEÇÃO',subtitle:system.message||'Protegendo os componentes',tiles:[['CPU',`${temps.cpu||'—'} °C`],['GPU',`${temps.gpu||'—'} °C`],['Ação','Corte de energia']]};
    if(phase==='smoke')return{...base,title:'TELA DESLIGADA',subtitle:'Falha térmica grave. Fumaça detectada no gabinete.',tiles:[]};
    if(phase==='fire')return{...base,title:'EMERGÊNCIA VIRTUAL',subtitle:'Princípio de incêndio simulado. Use o extintor virtual.',tiles:[]};
    if(phase==='extinguished')return{...base,title:'INCIDENTE CONTIDO',subtitle:'Equipamento isolado. Realize o diagnóstico antes de reiniciar.',tiles:[]};
    return{...base,title:'FALHA NO SISTEMA',subtitle:system.error||system.message||'Verifique a montagem.',tiles:[]};
  }
  global.LABDS_HARDWARE_SYSTEM={VERSION,OS_PROFILES,PHASES,POST_STEPS,INSTALL_STEPS,normalize,setPhase,beginPost,advancePost,beginBoot,beginInstall,installTick,bootTick,shutdown,finishShutdown,screenModel};
})(window);
