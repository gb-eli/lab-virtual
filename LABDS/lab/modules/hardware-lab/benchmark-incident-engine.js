'use strict';
(function(global){
  const VERSION='1.0.0';
  const STRESS_LEVELS={
    light:{label:'Leve',load:.48,duration:7,risk:0,scoreFactor:.96,description:'Verificação curta e segura para uso diário.'},
    medium:{label:'Médio',load:.72,duration:9,risk:5,scoreFactor:1,description:'Carga equilibrada de CPU, GPU e memória.'},
    heavy:{label:'Pesado',load:1,duration:12,risk:13,scoreFactor:1.04,description:'Carga prolongada para avaliar refrigeração e estabilidade.'},
    extreme:{label:'Extremo',load:1.28,duration:15,risk:25,scoreFactor:1.08,description:'Cenário educacional de estresse máximo com risco térmico.'}
  };
  const ENVIRONMENTS={
    conditioned:{label:'Sala climatizada',temperature:20,airflow:1.1,dust:.75,description:'Ar-condicionado e circulação adequada.'},
    normal:{label:'Ambiente comum',temperature:25,airflow:1,dust:1,description:'Condição doméstica ou escolar típica.'},
    hot:{label:'Ambiente quente',temperature:32,airflow:.86,dust:1.08,description:'Temperatura elevada e menor margem térmica.'},
    poor:{label:'Ambiente abafado',temperature:35,airflow:.7,dust:1.25,description:'Pouca ventilação e forte acúmulo de calor.'}
  };
  const PROTECTIONS={standard:{label:'Proteções ativas',shutdown:true,description:'Throttling e desligamento de emergência habilitados.'},educationalOverride:{label:'Falha múltipla simulada',shutdown:false,description:'Cenário extremo controlado para demonstrar consequências.'}};
  const STAGES=['idle','running','hot','warning','throttling','critical','shutdown','smoke','fire','extinguished','cancelled','completed'];
  function clamp(v,min,max){return Math.min(max,Math.max(min,Number(v)||0));}
  function normalize(raw={}){return{level:STRESS_LEVELS[raw.level]?raw.level:'medium',environment:ENVIRONMENTS[raw.environment]?raw.environment:'normal',protection:PROTECTIONS[raw.protection]?raw.protection:'standard',stage:STAGES.includes(raw.stage)?raw.stage:'idle',progress:clamp(raw.progress,0,1),elapsed:Math.max(0,Number(raw.elapsed)||0),cpuTemp:Math.round(Number(raw.cpuTemp)||0),gpuTemp:Math.round(Number(raw.gpuTemp)||0),caseTemp:Math.round(Number(raw.caseTemp)||0),load:clamp(raw.load,0,100),warningAcknowledged:Boolean(raw.warningAcknowledged),continuedAfterWarning:Boolean(raw.continuedAfterWarning),awaitingDecision:Boolean(raw.awaitingDecision),smokeSeconds:Math.max(0,Number(raw.smokeSeconds)||0),fireSeconds:Math.max(0,Number(raw.fireSeconds)||0),extinguisherUsed:Boolean(raw.extinguisherUsed),reason:String(raw.reason||''),events:Array.isArray(raw.events)?raw.events.slice(-30):[]};}
  function faultScore(input={}){let score=0;const thermal=input.thermal||{},state=input.state||{};score+=Math.max(0,78-(thermal.airflowScore||0))*.35;score+=Math.max(0,(thermal.dustRisk||0)-25)*.22;score+=Math.max(0,(state.ambientTemperature||25)-26)*1.6;if(state.filterCondition==='clogged')score+=18;if(state.fanSpeed==='quiet')score+=8;if((state.fans||0)<2)score+=20;if(state.cpuPaste===false)score+=22;if(state.coolerMounted===false)score+=35;if(thermal.radiatorValid===false)score+=14;if(state.caseSidePanel==='closed'&&input.caseFront==='solid')score+=8;if(state.benchmarkFaultInjection)score+=55;return clamp(score,0,100);}
  function predict(input={}){
    const level=STRESS_LEVELS[input.level]||STRESS_LEVELS.medium,environment=ENVIRONMENTS[input.environment]||ENVIRONMENTS.normal,thermal=input.thermal||{},progress=clamp(input.progress,0,1),faults=faultScore(input),baseCpu=Math.max(environment.temperature,Number(thermal.cpuTemperature)||45),baseGpu=Math.max(environment.temperature,Number(thermal.gpuTemperature)||42),baseCase=Math.max(environment.temperature,Number(thermal.caseTemperature)||35),airflow=Math.max(.45,((thermal.airflowScore||50)/100)*environment.airflow),rise=(8+level.load*29+level.risk+faults*.28)*Math.pow(progress,.82)/airflow;
    const cpu=Math.round(baseCpu+rise),gpu=Math.round(baseGpu+rise*.84),caseTemp=Math.round(baseCase+rise*.42),peak=Math.max(cpu,gpu),load=Math.round(level.load*78+progress*18),protection=PROTECTIONS[input.protection]||PROTECTIONS.standard,continued=Boolean(input.continuedAfterWarning);
    let stage='running',reason='Temperaturas dentro da faixa de acompanhamento.';
    if(peak>=82){stage='hot';reason='Temperatura elevada; ventoinhas aumentam a rotação.';}
    if(peak>=90){stage='warning';reason='Superaquecimento detectado. Pausar o teste é recomendado.';}
    if(peak>=96){stage='throttling';reason='Throttling térmico reduz frequência e desempenho.';}
    if(peak>=103){stage='critical';reason='Temperatura crítica e risco de desligamento.';}
    if(peak>=103&&protection.shutdown){stage='shutdown';reason='Proteção térmica desligou o computador.';}
    const multipleFaults=faults>=48&&input.level==='extreme'&&input.protection==='educationalOverride'&&continued;
    if(multipleFaults&&progress>=.82){stage='smoke';reason='Falha múltipla simulada: fumaça no gabinete.';}
    if(multipleFaults&&progress>=.94){stage='fire';reason='Princípio de incêndio virtual após insistência e falhas múltiplas.';}
    return{stage,reason,cpuTemp:cpu,gpuTemp:gpu,caseTemp,peak,load,faults,airflow:Math.round(airflow*100),shouldPrompt:stage==='warning'&&!input.warningAcknowledged,shouldShutdown:stage==='shutdown',canIgnite:multipleFaults,scoreFactor:level.scoreFactor};
  }
  function event(incident,type,detail={}){incident.events.push({time:new Date().toISOString(),type,detail});incident.events=incident.events.slice(-30);return incident;}
  function applySnapshot(incident,snapshot,progress,elapsed){incident.stage=snapshot.stage;incident.progress=clamp(progress,0,1);incident.elapsed=elapsed;incident.cpuTemp=snapshot.cpuTemp;incident.gpuTemp=snapshot.gpuTemp;incident.caseTemp=snapshot.caseTemp;incident.load=snapshot.load;incident.reason=snapshot.reason;return incident;}
  function extinguish(incident){incident.stage='extinguished';incident.extinguisherUsed=true;incident.awaitingDecision=false;incident.reason='Incidente virtual contido com o extintor. Equipamento isolado.';event(incident,'extinguisher',{result:'contained'});return incident;}
  global.LABDS_HARDWARE_BENCHMARK_INCIDENT={VERSION,STRESS_LEVELS,ENVIRONMENTS,PROTECTIONS,STAGES,normalize,faultScore,predict,event,applySnapshot,extinguish};
})(window);
