'use strict';
(function(){
  // LABDS_LABS: motor auxiliar carregado antes do módulo principal.
  const FAN_PROFILES={
    balanced:{label:'Balanceado',intakeRatio:.5,rpm:1,noise:1,description:'Entrada e exaustão próximas para uso geral.'},
    positive:{label:'Pressão positiva',intakeRatio:.67,rpm:1.02,noise:1.02,description:'Mais entrada filtrada para reduzir a entrada de poeira por frestas.'},
    negative:{label:'Pressão negativa',intakeRatio:.34,rpm:1.05,noise:1.05,description:'Mais exaustão; remove calor rápido, mas puxa poeira por frestas.'},
    silent:{label:'Silencioso',intakeRatio:.56,rpm:.68,noise:.72,description:'Rotações menores e curva térmica mais conservadora.'},
    performance:{label:'Desempenho',intakeRatio:.5,rpm:1.28,noise:1.34,description:'Maior vazão e resposta térmica, com mais ruído.'}
  };
  const SPEED_PROFILES={quiet:{label:'Baixa',rpm:.7,cfm:.72,noise:.7},auto:{label:'Automática',rpm:1,cfm:1,noise:1},turbo:{label:'Turbo',rpm:1.3,cfm:1.32,noise:1.42}};
  const FILTERS={clean:{label:'Filtro limpo',flow:1,dust:.28},used:{label:'Filtro usado',flow:.84,dust:.48},clogged:{label:'Filtro obstruído',flow:.55,dust:.7},none:{label:'Sem filtro',flow:1.08,dust:1}};
  const WORKLOADS={idle:{label:'Ocioso',factor:.22},study:{label:'Estudo e programação',factor:.48},gaming:{label:'Jogos',factor:.78},render:{label:'Renderização',factor:.92},stress:{label:'Estresse total',factor:1.08}};
  const FRONT_FLOW={mesh:1,perforated:.9,'side-intake':.76,workstation:.68,glass:.54,solid:.43,open:1.18};
  const SIDE_FLOW={'tempered-glass':.96,steel:.9,'vented-steel':1.04,open:1.22};
  const LOCATION_LABELS={front:'frente',top:'topo',rear:'traseira',side:'lateral',bottom:'base',auto:'automático'};
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0));

  function normalize(raw={}){
    return{
      fanProfile:FAN_PROFILES[raw.fanProfile]?raw.fanProfile:'balanced',
      fanSpeed:SPEED_PROFILES[raw.fanSpeed]?raw.fanSpeed:'auto',
      filterCondition:FILTERS[raw.filterCondition]?raw.filterCondition:'clean',
      workload:WORKLOADS[raw.workload]?raw.workload:'study',
      ambientTemperature:Math.round(clamp(raw.ambientTemperature??23,16,38)),
      radiatorPosition:['auto','front','top','side','bottom','rear'].includes(raw.radiatorPosition)?raw.radiatorPosition:'auto',
      thermalOverlay:raw.thermalOverlay!==false
    };
  }

  function availableLocations(caseItem,size=0){
    const entries=Object.entries(caseItem?.mounts||{});
    return entries.filter(([,sizes])=>!size||(sizes||[]).includes(Number(size))).map(([location])=>location);
  }

  function chooseRadiatorLocation(caseItem,cooler,preferred='auto'){
    if(!cooler?.radiator)return null;
    const available=availableLocations(caseItem,cooler.radiator);
    if(preferred!=='auto'&&available.includes(preferred))return preferred;
    const order=['top','front','side','bottom','rear'];
    return order.find(location=>available.includes(location))||available[0]||null;
  }

  function splitFans(total,profileId){
    const totalFans=Math.max(0,Math.round(Number(total)||0));
    if(!totalFans)return{intake:0,exhaust:0};
    const ratio=(FAN_PROFILES[profileId]||FAN_PROFILES.balanced).intakeRatio;
    let intake=Math.round(totalFans*ratio);
    if(totalFans>1)intake=clamp(intake,1,totalFans-1);
    const exhaust=totalFans-intake;
    return{intake,exhaust};
  }

  function pressureLabel(delta){
    if(delta>=20)return'positiva forte';
    if(delta>=8)return'positiva';
    if(delta<=-20)return'negativa forte';
    if(delta<=-8)return'negativa';
    return'neutra';
  }

  function statusLabel(cpu,gpu,caseTemp){
    const hottest=Math.max(cpu,gpu,caseTemp);
    if(hottest>=95)return'crítica';
    if(hottest>=86)return'elevada';
    if(hottest>=76)return'atenção';
    if(hottest<=48)return'fria';
    return'estável';
  }

  function simulate(input={}){
    const settings=normalize(input.settings||input);
    const cs=input.caseItem||{};
    const cpu=input.cpu||{tdp:65};
    const gpu=input.gpu||{tdp:0};
    const cooler=input.cooler||{type:'none',capacity:0,noise:0,radiator:0};
    const storageHeat=Math.max(0,Number(input.storageHeat)||0);
    const cableManagement=input.cableManagement||'standard';
    const panelState=input.panelState||'closed';
    const fanCount=Math.min(Number(cs.fans)||10,Math.max(0,Math.round(Number(input.fans)||0)));
    const profile=FAN_PROFILES[settings.fanProfile];
    const speed=SPEED_PROFILES[settings.fanSpeed];
    const filter=FILTERS[settings.filterCondition];
    const workload=WORKLOADS[settings.workload];
    const split=splitFans(fanCount,settings.fanProfile);
    const frontFactor=FRONT_FLOW[cs.frontPanel]||.72;
    const sideFactor=panelState==='removed'||panelState==='open'?1.16:(SIDE_FLOW[cs.sidePanel]||.92);
    const cableFactor=cableManagement==='premium'?1.09:cableManagement==='basic'?.82:1;
    const chamberFactor=Number(cs.chambers)===2?1.07:Number(cs.chambers)===0?1.18:1;
    const filterFactor=cs.frontPanel==='open'?1:filter.flow;
    const baseFanCfm=47;
    const intakeCfm=split.intake*baseFanCfm*profile.rpm*speed.cfm*frontFactor*filterFactor*sideFactor*chamberFactor;
    const exhaustCfm=split.exhaust*baseFanCfm*profile.rpm*speed.cfm*(cs.frontPanel==='solid'?.96:1)*chamberFactor;
    const passiveCfm=(Number(cs.airflowBias)||0)*2.2*(panelState==='removed'||panelState==='open'?1.25:1);
    const effectiveCfm=(Math.min(intakeCfm,exhaustCfm)+Math.max(intakeCfm,exhaustCfm)*.38+passiveCfm)*cableFactor;
    const pressureDelta=Math.round(intakeCfm-exhaustCfm);
    const pressure=pressureLabel(pressureDelta);
    const workloadHeat=(Number(cpu.tdp)||0)*workload.factor+(Number(gpu.tdp)||0)*Math.min(1.08,workload.factor*1.04)+storageHeat*workload.factor+35;
    const coolerHeadroom=Math.max(0,(Number(cooler.capacity)||0)-(Number(cpu.tdp)||0)*workload.factor);
    const coolerEfficiency=clamp(.52+(Number(cooler.capacity)||0)/520+(cooler.type==='aio'?.12:cooler.type==='custom'?.2:cooler.type==='air'?.08:0),.32,1.32);
    const airflowScore=Math.round(clamp(effectiveCfm/2.7+(Number(cs.airflowBias)||0)*1.35,0,100));
    const ambient=settings.ambientTemperature;
    const pastePenalty=input.cpuPaste===false?12:0;
    const mountPenalty=input.coolerMounted===false?24:0;
    const cpuDelta=(Number(cpu.tdp)||0)*workload.factor/Math.max(18,(Number(cooler.capacity)||45)*coolerEfficiency)*33+workloadHeat/Math.max(45,effectiveCfm)*7;
    const gpuDelta=(Number(gpu.tdp)||0)*workload.factor/Math.max(42,effectiveCfm)*10+(Number(gpu.tdp)||0)*workload.factor/80;
    const caseDelta=workloadHeat/Math.max(55,effectiveCfm)*5.5;
    const cpuTemperature=Math.round(ambient+cpuDelta+pastePenalty+mountPenalty+(coolerHeadroom<0?8:0));
    const gpuTemperature=Math.round(ambient+gpuDelta+(panelState==='closed'&&frontFactor<.6?4:0));
    const caseTemperature=Math.round(ambient+caseDelta+(cableManagement==='basic'?4:0));
    const hottestTemperature=Math.max(cpuTemperature,gpuTemperature,caseTemperature);
    const noise=Math.round(clamp(17+fanCount*1.55*profile.noise*speed.noise+(Number(cooler.noise)||0)*.48+(hottestTemperature>86?7:0)-(cs.frontPanel==='solid'?3:0),15,67));
    const dustRisk=Math.round(clamp(filter.dust*58+(pressureDelta<0?22:pressureDelta>6?-8:3)+(settings.filterCondition==='clogged'?18:0)+(cs.frontPanel==='open'?18:0),0,100));
    const radiatorLocation=chooseRadiatorLocation(cs,cooler,settings.radiatorPosition);
    const radiatorValid=!cooler.radiator||Boolean(radiatorLocation)&&(settings.radiatorPosition==='auto'||radiatorLocation===settings.radiatorPosition);
    const warnings=[];
    const info=[];
    if(fanCount===0)warnings.push('Nenhuma ventoinha de gabinete foi instalada.');
    if(split.intake===0&&fanCount)warnings.push('Não há ventoinhas configuradas como entrada de ar.');
    if(split.exhaust===0&&fanCount>1)warnings.push('Não há ventoinhas configuradas como exaustão.');
    if(settings.filterCondition==='clogged')warnings.push('O filtro obstruído reduz fortemente a vazão de entrada.');
    if(pressure.includes('negativa'))warnings.push('A pressão negativa aumenta a entrada de poeira por frestas.');
    if(cs.frontPanel==='solid'&&workload.factor>=.78)warnings.push('O painel frontal sólido restringe a entrada sob carga elevada.');
    if(hottestTemperature>=88)warnings.push(`Ponto térmico crítico estimado em ${hottestTemperature} °C.`);
    if(cooler.radiator&&!radiatorLocation)warnings.push(`Não há suporte compatível para radiador de ${cooler.radiator} mm.`);
    if(cooler.radiator&&settings.radiatorPosition!=='auto'&&!radiatorValid)warnings.push(`O radiador não pode ser instalado em ${LOCATION_LABELS[settings.radiatorPosition]||settings.radiatorPosition}.`);
    if(panelState==='removed')info.push('Painel removido melhora o acesso e a troca de ar, mas reduz o controle de poeira e pressão.');
    if(pressure.includes('positiva'))info.push('Pressão positiva favorece entrada filtrada e menor acúmulo por frestas.');
    if(Number(cs.chambers)===2)info.push('A câmara dupla separa fonte e cabos da zona térmica principal.');
    return{
      settings,fanCount,intakeFans:split.intake,exhaustFans:split.exhaust,intakeCfm:Math.round(intakeCfm),exhaustCfm:Math.round(exhaustCfm),effectiveCfm:Math.round(effectiveCfm),pressureDelta,pressure,airflowScore,
      cpuTemperature,gpuTemperature,caseTemperature,hottestTemperature,status:statusLabel(cpuTemperature,gpuTemperature,caseTemperature),noise,dustRisk,workloadHeat:Math.round(workloadHeat),radiatorLocation,radiatorValid,warnings,info,
      labels:{fanProfile:profile.label,fanSpeed:speed.label,filter:filter.label,workload:workload.label,radiator:radiatorLocation?LOCATION_LABELS[radiatorLocation]||radiatorLocation:'não aplicável'},
      paths:buildPaths(cs,split,radiatorLocation)
    };
  }

  function buildPaths(cs,split,radiatorLocation){
    const intake=[];const exhaust=[];
    if(split.intake){
      if(['mesh','perforated','side-intake','workstation','solid'].includes(cs.frontPanel))intake.push({from:[0,0,1],to:[0,0,-.1],location:'front',weight:split.intake});
      if(cs.frontPanel==='glass'||cs.chambers===2)intake.push({from:[1,0,.25],to:[.15,0,-.1],location:'side',weight:split.intake});
      if(cs.frontPanel==='open')intake.push({from:[0,-.4,.8],to:[0,0,0],location:'open',weight:split.intake});
      if((cs.mounts?.bottom||[]).length)intake.push({from:[0,-1,.2],to:[0,-.1,0],location:'bottom',weight:Math.max(1,Math.floor(split.intake/2))});
    }
    if(split.exhaust){
      exhaust.push({from:[0,.1,0],to:[0,.35,-1],location:'rear',weight:Math.max(1,Math.ceil(split.exhaust/2))});
      if((cs.mounts?.top||[]).length)exhaust.push({from:[0,.05,0],to:[0,1,.1],location:'top',weight:Math.max(1,Math.floor(split.exhaust/2))});
    }
    if(radiatorLocation==='front')intake.push({from:[0,0,1],to:[0,.05,0],location:'radiator-front',weight:2});
    if(radiatorLocation==='top')exhaust.push({from:[0,.15,0],to:[0,1,0],location:'radiator-top',weight:2});
    return{intake,exhaust};
  }

  window.LABDS_HARDWARE_THERMAL={FAN_PROFILES,SPEED_PROFILES,FILTERS,WORKLOADS,LOCATION_LABELS,normalize,simulate,splitFans,chooseRadiatorLocation,availableLocations};
})();
