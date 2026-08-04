'use strict';
(function(global){
  const VERSION='1.0.0';
  const PRICE_REFERENCE='agosto/2026';
  const FAMILIES={
    school:{label:'Laboratório escolar',category:'Educação',formFactor:'tower',icon:'🏫',description:'Desktop equilibrado para aulas, programação e ferramentas educacionais.',preset:'school',scene:[6.4,6.7,6.5],manualAssembly:true,inspection:['case','board','cpu','ram','storage','psu','cooler','monitor','keyboard','mouse'],priceBand:[3500,5600]},
    office:{label:'Escritório compacto',category:'Produtividade',formFactor:'tower',icon:'🗂️',description:'Computador silencioso e econômico para produtividade, navegação e sistemas empresariais.',preset:'office',scene:[5.75,6.15,6.2],manualAssembly:true,inspection:['case','board','cpu','ram','storage','psu','monitor','keyboard','mouse'],priceBand:[3200,5200]},
    developer:{label:'Estação de desenvolvimento',category:'Programação',formFactor:'tower',icon:'💻',description:'Setup com duas telas para programação, banco de dados, containers e estudos.',preset:'study',scene:[5.9,6.3,6.35],manualAssembly:true,inspection:['case','board','cpu','ram','storage','monitor','keyboard','mouse'],priceBand:[6200,10500]},
    gamer_entry:{label:'Gamer de entrada',category:'Jogos',formFactor:'tower',icon:'🎮',description:'Desktop gamer acessível para Full HD e evolução gradual de componentes.',preset:'gamerBudget',scene:[6.65,6.9,7],manualAssembly:true,inspection:['case','board','cpu','ram','gpu','storage','psu','cooler','monitor','controller'],priceBand:[5200,8200]},
    gamer_ultra:{label:'Gamer extremo multitelas',category:'Jogos',formFactor:'tower',icon:'⚡',description:'Máquina de alto desempenho com três telas, iluminação e refrigeração avançada.',preset:'gamerUltra',scene:[8.15,7.2,7.45],manualAssembly:true,inspection:['case','board','cpu','ram','gpu','storage','storage2','psu','cooler','monitor','controller'],priceBand:[22000,43000]},
    creator:{label:'Criação de conteúdo',category:'Produção',formFactor:'tower',icon:'🎬',description:'Configuração para vídeo, áudio, design, renderização e produção multimídia.',preset:'creator',scene:[6.9,7.25,7.35],manualAssembly:true,inspection:['case','board','cpu','ram','gpu','storage','storage2','monitor','audio','webcam'],priceBand:[14500,28000]},
    workstation:{label:'Workstation CAD/IA',category:'Profissional',formFactor:'workstation',icon:'🧠',description:'Estação profissional para CAD, ciência de dados, IA e renderização pesada.',preset:'workstation',scene:[7.35,7.85,7.8],manualAssembly:true,inspection:['case','board','cpu','ram','gpu','storage','storage2','psu','cooler','monitor'],priceBand:[26000,56000]},
    openbench:{label:'Open bench técnico',category:'Manutenção',formFactor:'openbench',icon:'🧰',description:'Bancada aberta para testes, diagnóstico, manutenção e troca rápida de peças.',preset:'school',patch:{case:'openbench',caseSidePanel:'removed',monitor:'fhd75',monitorCount:1,monitorLayout:'single',monitorMount:'stock',printer:'none'},scene:[8.55,5.65,7.4],manualAssembly:true,inspection:['case','board','cpu','ram','gpu','storage','psu','cooler'],priceBand:[4500,18000]},
    mini_workstation:{label:'Mini workstation',category:'Profissional compacto',formFactor:'mini-workstation',icon:'🧊',description:'Estação compacta de alta densidade para criação, engenharia e trabalho técnico.',preset:'compact',patch:{cpu:'r7_9700x',board:'asus_b650',ram:'d5_64_6400',gpu:'rtx4070s',psu:'p850',cooler:'aio240',case:'compact_matx',monitor:'uwqhd144',monitorCount:1,monitorMount:'singleArm'},scene:[4.9,5.2,5.6],manualAssembly:true,inspection:['family','board','cpu','ram','gpu','storage','psu','cooler','monitor'],priceBand:[11500,22000]},
    mini_pc:{label:'Mini PC',category:'Computação compacta',formFactor:'mini-pc',icon:'📦',description:'Computador ultracompacto com memória e NVMe acessíveis por tampa inferior.',preset:'compact',patch:{case:'mini_itx',gpu:'integrated',psu:'p450',cooler:'lowprofile',monitor:'qhd165',monitorCount:1,monitorMount:'singleArm',printer:'none',ups:'none'},scene:[3.5,1.25,3.5],manualAssembly:false,inspection:['family','board','cpu','ram','storage','cooler','monitor'],priceBand:[2800,8200]},
    all_in_one:{label:'All-in-one',category:'Computação integrada',formFactor:'all-in-one',icon:'🖥️',description:'Computador integrado à tela com acesso traseiro para manutenção e expansão limitada.',preset:'office',patch:{case:'mini_itx',gpu:'integrated',monitor:'none',monitorCount:1,monitorMount:'stock',printer:'none',ups:'none',keyboard:'wireless',mouse:'wireless'},scene:[7.2,5.1,1.05],manualAssembly:false,inspection:['family','board','cpu','ram','storage','monitor','keyboard','mouse'],priceBand:[5200,12500]},
    notebook:{label:'Notebook profissional',category:'Mobilidade',formFactor:'notebook',icon:'💼',description:'Notebook fino com tela articulada, bateria, teclado, touchpad e manutenção inferior.',preset:'study',patch:{case:'mini_itx',gpu:'integrated',monitor:'none',monitor2:'none',monitor3:'none',monitorCount:1,monitorMount:'stock',keyboard:'none',mouse:'none',audio:'none',webcam:'none',printer:'none',controller:'none',ups:'none'},scene:[7.1,4.65,4.55],manualAssembly:false,inspection:['family','board','cpu','ram','storage','cooler'] ,priceBand:[4200,11500]},
    gaming_notebook:{label:'Notebook gamer',category:'Mobilidade gamer',formFactor:'gaming-notebook',icon:'🔥',description:'Notebook de alto desempenho com GPU dedicada, refrigeração dupla e tela rápida.',preset:'gamerBudget',patch:{case:'mini_itx',gpu:'rtx4060',monitor:'none',monitor2:'none',monitor3:'none',monitorCount:1,monitorMount:'stock',keyboard:'none',mouse:'gaming',audio:'wirelessHeadset',webcam:'none',printer:'none',ups:'none'},scene:[7.5,5.0,5],manualAssembly:false,inspection:['family','board','cpu','ram','gpu','storage','cooler'],priceBand:[8500,19000]}
  };
  const PRICE_UNITS=[0,420,780,1450,2650,5200];
  function clone(value){return JSON.parse(JSON.stringify(value));}
  function normalize(id){return FAMILIES[id]?id:'school';}
  function profile(id){return clone(FAMILIES[normalize(id)]);}
  function patch(id,presets={}){
    const family=FAMILIES[normalize(id)],preset=presets[family.preset]||{};
    return{...clone(preset),...clone(family.patch||{}),family:normalize(id)};
  }
  function sceneGeometry(id,fallback){const family=FAMILIES[normalize(id)];return family.scene?{width:family.scene[0],height:family.scene[1],depth:family.scene[2]}:fallback;}
  function supportsManualAssembly(id){return FAMILIES[normalize(id)].manualAssembly!==false;}
  function availableInspectionTargets(id){return clone(FAMILIES[normalize(id)].inspection||[]);}
  function estimate(parts={},state={}){
    const family=FAMILIES[normalize(state.family)],keys=['cs','board','cpu','ram','gpu','storage','storage2','psu','cooler','nic','monitor','monitor2','monitor3','keyboard','mouse','audio','webcam','printer','controller','ups'];
    let base=0;
    for(const key of keys){const item=parts[key];if(!item)continue;base+=PRICE_UNITS[Math.max(0,Math.min(5,Number(item.price)||0))]||0;}
    base+=Math.max(0,(Number(state.monitorCount)||1)-1)*380;
    const min=Math.max(family.priceBand[0],Math.round(base*.82/50)*50),max=Math.max(family.priceBand[1],Math.round(base*1.22/50)*50);
    return{min,max,formatted:`R$ ${min.toLocaleString('pt-BR')} – R$ ${max.toLocaleString('pt-BR')}`,reference:PRICE_REFERENCE,educational:true};
  }
  function summary(id){const item=FAMILIES[normalize(id)];return{...clone(item),id:normalize(id),manualAssembly:item.manualAssembly!==false};}
  function categories(){return[...new Set(Object.values(FAMILIES).map(item=>item.category))];}
  global.LABDS_HARDWARE_FAMILIES={VERSION,PRICE_REFERENCE,FAMILIES,normalize,profile,patch,sceneGeometry,supportsManualAssembly,availableInspectionTargets,estimate,summary,categories};
})(window);
