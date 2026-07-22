'use strict';

(function(){
  window.LABDS_LABS=window.LABDS_LABS||{};
  let root,ctx,state,timer;
  const parts={
    boards:{b650:{label:'B650 ATX',socket:'AM5',ram:'DDR5',tdp:35,slots:4},b760:{label:'B760 ATX',socket:'LGA1700',ram:'DDR5',tdp:40,slots:4},h610:{label:'H610 mATX',socket:'LGA1700',ram:'DDR4',tdp:28,slots:2}},
    cpus:{r5:{label:'Ryzen 5 7600',socket:'AM5',tdp:65,igpu:true,cores:6},r9:{label:'Ryzen 9 7900X',socket:'AM5',tdp:170,igpu:true,cores:12},i5:{label:'Core i5-13400',socket:'LGA1700',tdp:65,igpu:true,cores:10},i9:{label:'Core i9-13900K',socket:'LGA1700',tdp:253,igpu:true,cores:24}},
    ram:{d5_16:{label:'16 GB DDR5',type:'DDR5',sticks:2,capacity:16},d5_32:{label:'32 GB DDR5',type:'DDR5',sticks:2,capacity:32},d4_16:{label:'16 GB DDR4',type:'DDR4',sticks:2,capacity:16},d4_32:{label:'32 GB DDR4',type:'DDR4',sticks:4,capacity:32}},
    gpus:{integrated:{label:'Vídeo integrado',tdp:0,requiresCable:false,vram:0},rx7600:{label:'Radeon RX 7600',tdp:165,requiresCable:true,vram:8},rtx4070:{label:'GeForce RTX 4070',tdp:200,requiresCable:true,vram:12},rtx4090:{label:'GeForce RTX 4090',tdp:450,requiresCable:true,vram:24}},
    storages:{nvme:{label:'SSD NVMe 1 TB',power:8,boot:true},sata:{label:'SSD SATA 480 GB',power:5,boot:true},hdd:{label:'HD SATA 2 TB',power:12,boot:true},none:{label:'Sem armazenamento',power:0,boot:false}},
    psus:{p400:{label:'400 W 80 Plus',watts:400},p550:{label:'550 W 80 Plus Bronze',watts:550},p650:{label:'650 W 80 Plus Gold',watts:650},p850:{label:'850 W 80 Plus Gold',watts:850},p1000:{label:'1000 W 80 Plus Platinum',watts:1000}},
    coolers:{stock:{label:'Cooler padrão',capacity:95},tower:{label:'Air cooler torre',capacity:180},water:{label:'Water cooler 360 mm',capacity:320},none:{label:'Sem refrigeração',capacity:0}}
  };
  const defaults={board:'b650',cpu:'r5',ram:'d5_16',gpu:'integrated',storage:'nvme',psu:'p650',cooler:'tower',cpuPower:true,boardPower:true,gpuPower:true,ramSeated:true,storageCable:true,frontPanel:true,state:'off',logs:[]};
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function selected(group,key){return parts[group][state[key]];}
  function evaluate(){
    const b=selected('boards','board'),c=selected('cpus','cpu'),r=selected('ram','ram'),g=selected('gpus','gpu'),s=selected('storages','storage'),p=selected('psus','psu'),cool=selected('coolers','cooler');
    const errors=[],warnings=[];
    if(b.socket!==c.socket)errors.push(`Socket incompatível: ${b.socket} × ${c.socket}.`);
    if(b.ram!==r.type)errors.push(`Memória ${r.type} não encaixa em placa ${b.ram}.`);
    if(!state.boardPower)errors.push('Conector ATX de 24 pinos desconectado.');
    if(!state.cpuPower)errors.push('Conector EPS da CPU desconectado.');
    if(!state.ramSeated)errors.push('Memória RAM não está totalmente encaixada.');
    if(g.requiresCable&&!state.gpuPower)errors.push('Alimentação PCIe da placa de vídeo desconectada.');
    if(s.boot&&!state.storageCable&&state.storage!=='nvme')errors.push('Cabo de dados do armazenamento desconectado.');
    if(!state.frontPanel)errors.push('Botão Power do gabinete não está conectado.');
    if(cool.capacity<c.tdp)errors.push('Refrigeração insuficiente para o TDP do processador.');
    if(!s.boot)warnings.push('Sem dispositivo de inicialização.');
    const consumption=Math.round((b.tdp+c.tdp+g.tdp+s.power+35)*1.12);
    const recommended=Math.ceil(consumption*1.35/50)*50;
    if(p.watts<consumption)errors.push(`Fonte insuficiente: consumo estimado ${consumption} W.`);else if(p.watts<recommended)warnings.push(`Fonte funciona, mas o recomendado é aproximadamente ${recommended} W.`);
    if(state.gpu==='integrated'&&!c.igpu)errors.push('O processador não possui vídeo integrado.');
    return{errors,warnings,consumption,recommended,ok:!errors.length,parts:{b,c,r,g,s,p,cool}};
  }
  function log(text,tone=''){state.logs.push({time:new Date().toLocaleTimeString('pt-BR'),text,tone});state.logs=state.logs.slice(-100);renderLog();}
  function renderLog(){const box=root.querySelector('#hwLog');if(box){box.innerHTML=state.logs.map(l=>`<div class="vm-log-line ${l.tone}"><span>${l.time}</span>${esc(l.text)}</div>`).join('')||'<div class="muted-copy">Computador desligado.</div>';box.scrollTop=box.scrollHeight;}}
  function sync(){
    ['board','cpu','ram','gpu','storage','psu','cooler'].forEach(k=>state[k]=root.querySelector(`#hw_${k}`).value);
    ['cpuPower','boardPower','gpuPower','ramSeated','storageCable','frontPanel'].forEach(k=>state[k]=root.querySelector(`#hw_${k}`).checked);
    render();ctx.storage.set('lab.hardware.state',state);
  }
  function render(){
    const e=evaluate();
    root.querySelectorAll('[data-part]').forEach(el=>{const key=el.dataset.part;const map={board:e.parts.b,cpu:e.parts.c,ram:e.parts.r,gpu:e.parts.g,storage:e.parts.s,psu:e.parts.p,cooler:e.parts.cool};el.querySelector('small').textContent=map[key]?.label||'';el.classList.toggle('installed',Boolean(map[key]));});
    const status=root.querySelector('#hwStatus');status.className=`state-card ${e.ok?(e.warnings.length?'warning':'success'):'error'}`;status.innerHTML=`<h3>${e.ok?'Montagem compatível':'Montagem com falhas'}</h3><p>${[...e.errors,...e.warnings].join(' ')||'Todos os componentes e cabos principais estão corretos.'}</p>`;
    root.querySelector('#hwMetrics').innerHTML=[['Consumo',`${e.consumption} W`],['Fonte',`${e.parts.p.watts} W`],['Recomendado',`${e.recommended} W`],['Socket',e.parts.b.socket],['Memória',e.parts.r.capacity+' GB'],['Núcleos',e.parts.c.cores]].map(([a,b])=>`<div class="metric"><span>${a}</span><b>${b}</b></div>`).join('');
    const screen=root.querySelector('#hwScreen');screen.dataset.state=state.state;root.querySelector('#hwScreenTitle').textContent=state.state==='ready'?'Sistema iniciado':state.state==='post'?'Executando POST':state.state==='error'?'Falha no POST':'SEM SINAL';root.querySelector('#hwScreenText').textContent=state.state==='ready'?`${e.parts.c.label} • ${e.parts.r.label} • ${e.parts.s.label}`:state.state==='error'?(e.errors[0]||'Verifique a montagem.'):'Aguardando energia.';
  }
  async function powerOn(){
    clearTimeout(timer);const e=evaluate();const started=performance.now();ctx.logEvent({eventType:'hardware_test',action:'POST iniciado',status:'success',context:hardwareContext(e)});state.logs=[];state.state='post';render();log('Power button pressionado.');await wait(450);log(`PSU: ${e.parts.p.watts} W detectada.`);await wait(420);if(!e.ok){state.state='error';for(const error of e.errors){log(`POST ERROR: ${error}`,'error');await wait(280);}render();ctx.logEvent({eventType:'hardware_test',action:'Falha no POST',output:state.logs.map(l=>`[${l.time}] ${l.text}`).join('\n'),status:'error',error:e.errors.join(' '),context:{...hardwareContext(e),durationMs:Math.round(performance.now()-started)}});return;}
    log(`CPU: ${e.parts.c.label} detectado.`,'success');await wait(400);log(`Memory Test: ${e.parts.r.capacity} GB ${e.parts.r.type} OK`,'success');await wait(500);log(`Storage: ${e.parts.s.label}`,'success');await wait(450);if(e.warnings.length)e.warnings.forEach(w=>log(`WARNING: ${w}`,'warning'));log('Boot device encontrado. Iniciando sistema...');await wait(700);state.state='ready';log('Sistema iniciado com sucesso.','success');render();ctx.storage.set('lab.hardware.state',state);ctx.logEvent({eventType:'hardware_test',action:'POST concluído e sistema iniciado',output:state.logs.map(l=>`[${l.time}] ${l.text}`).join('\n'),status:'success',context:{...hardwareContext(e),durationMs:Math.round(performance.now()-started)}});
  }
  function hardwareContext(e=evaluate()){return {board:e.parts.b.label,cpu:e.parts.c.label,ram:e.parts.r.label,gpu:e.parts.g.label,storage:e.parts.s.label,psu:e.parts.p.label,cooling:e.parts.cool.label,consumptionW:e.consumption,recommendedW:e.recommended,compatible:e.ok,warnings:e.warnings,errors:e.errors};}
  function wait(ms){return new Promise(resolve=>timer=setTimeout(resolve,ms));}
  async function mount(host,context){
    root=host;ctx=context;state={...defaults,...(await ctx.storage.get('lab.hardware.state',{}))};state.logs=state.logs||[];
    root.innerHTML=`<div class="workspace hardware-workspace"><aside class="workspace-panel"><div class="panel-title"><div><h2>Componentes</h2><p>Compatibilidade, cabos, energia e refrigeração.</p></div></div><div class="form-stack">
      ${[['board','Placa-mãe','boards'],['cpu','Processador','cpus'],['ram','Memória RAM','ram'],['gpu','Placa de vídeo','gpus'],['storage','Armazenamento','storages'],['psu','Fonte de alimentação','psus'],['cooler','Refrigeração','coolers']].map(([id,label,group])=>`<label>${label}<select id="hw_${id}">${Object.entries(parts[group]).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('')}</select></label>`).join('')}
      <div class="cable-grid"><label><input id="hw_boardPower" type="checkbox"> ATX 24 pinos</label><label><input id="hw_cpuPower" type="checkbox"> EPS CPU</label><label><input id="hw_gpuPower" type="checkbox"> Energia GPU</label><label><input id="hw_ramSeated" type="checkbox"> RAM encaixada</label><label><input id="hw_storageCable" type="checkbox"> Cabo SATA</label><label><input id="hw_frontPanel" type="checkbox"> Front panel</label></div>
      <div class="button-row"><button id="hwPower" class="btn primary" type="button">Montar e ligar</button><button id="hwShutdown" class="btn secondary" type="button">Desligar</button><button id="hwReset" class="btn subtle" type="button">Desmontar</button></div><div id="hwStatus" class="state-card"></div><div id="hwMetrics" class="metric-grid"></div>
    </div></aside><main class="workspace-main hardware-main"><div class="pc-bench"><div class="motherboard-board"><span class="board-caption">MOTHERBOARD</span><div class="part-slot cpu" data-part="cpu"><b>CPU</b><small></small></div><div class="part-slot ram" data-part="ram"><b>RAM</b><small></small></div><div class="part-slot gpu" data-part="gpu"><b>PCIe GPU</b><small></small></div><div class="part-slot storage" data-part="storage"><b>STORAGE</b><small></small></div><div class="part-slot psu" data-part="psu"><b>PSU</b><small></small></div><div class="part-slot cooler" data-part="cooler"><b>COOLER</b><small></small></div><div class="part-slot board installed" data-part="board"><b>BOARD</b><small></small></div></div><div class="pc-monitor"><div id="hwScreen" class="pc-screen"><strong id="hwScreenTitle">SEM SINAL</strong><p id="hwScreenText">Aguardando montagem.</p></div><div class="monitor-neck"></div></div></div><div id="hwLog" class="console-card hardware-log"></div></main></div>`;
    Object.keys(defaults).forEach(k=>{const el=root.querySelector(`#hw_${k}`);if(!el)return;if(el.type==='checkbox')el.checked=Boolean(state[k]);else el.value=state[k];});root.querySelectorAll('select,input').forEach(el=>el.addEventListener('input',sync));root.querySelector('#hwPower').addEventListener('click',powerOn);root.querySelector('#hwShutdown').addEventListener('click',()=>{clearTimeout(timer);state.state='off';log('Sistema desligado.','warning');render();ctx.logEvent({eventType:'hardware_power',action:'Computador simulado desligado',status:'success',context:hardwareContext()});});root.querySelector('#hwReset').addEventListener('click',()=>{if(confirm('Desmontar e restaurar componentes padrão?')){state={...defaults,logs:[]};ctx.storage.set('lab.hardware.state',state);mount(root,ctx);}});render();renderLog();
  }
  function exportPayload(){const e=evaluate();return{text:['SIMULADOR DE MONTAGEM DE COMPUTADOR',`Placa-mãe: ${e.parts.b.label}`,`Processador: ${e.parts.c.label}`,`Memória: ${e.parts.r.label}`,`GPU: ${e.parts.g.label}`,`Armazenamento: ${e.parts.s.label}`,`Fonte: ${e.parts.p.label}`,`Refrigeração: ${e.parts.cool.label}`,`Consumo estimado: ${e.consumption} W`,`Compatibilidade: ${e.ok?'OK':'FALHA'}`,'','===== POST =====',...state.logs.map(l=>`[${l.time}] ${l.text}`)].join('\n'),native:JSON.stringify(state,null,2),backup:state,meta:[{label:'Compatibilidade',value:e.ok?'OK':'Falha'},{label:'Consumo',value:`${e.consumption} W`}]};}
  function help(){return '<p>Monte uma configuração coerente. Socket, tipo de RAM, energia, refrigeração e cabos influenciam o POST simulado.</p>';}
  async function unmount(){clearTimeout(timer);if(ctx&&state)await ctx.storage.set('lab.hardware.state',state);root=null;ctx=null;}
  window.LABDS_LABS['hardware-lab']={mount,unmount,exportPayload,help};
})();
