'use strict';

(function(){
  window.LABDS_LABS = window.LABDS_LABS || {};
  let ctx = null;
  let root = null;
  let controller = null;
  let state = null;

  const defaultState = () => ({
    profile:'rede_domestica', seed:'', connection:'wifi', dhcp:true, ip:'192.168.0.25', mask:'255.255.255.0', gateway:'192.168.0.1', dns1:'192.168.0.53', dns2:'8.8.8.8', signal:78, distance:8, interference:18, bandwidth:180, baseLatency:24, jitter:18, loss:4,
    issue:'none', logs:[]
  });

  function esc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
  function addLog(text,tone=''){
    state.logs.push({time:new Date().toLocaleTimeString('pt-BR'),text,tone});
    state.logs=state.logs.slice(-120);
    renderLogs();
  }
  function renderLogs(){
    const box=root.querySelector('#networkLog');
    if(!box)return;
    box.innerHTML=state.logs.map(item=>`<div class="net-log-line ${item.tone}"><span>${esc(item.time)}</span>${esc(item.text)}</div>`).join('')||'<div class="muted-copy">Nenhum teste executado.</div>';
    box.scrollTop=box.scrollHeight;
  }
  function profileData(){return window.LABDS.NetworkEngine.profiles[state.profile]||window.LABDS.NetworkEngine.profiles.rede_domestica;}
  function applyIssue(){
    const profile=profileData();
    const flags={dns:true,gateway:true,router:true,cable:true,dhcp:true,server:true,duplicate:false,subnet:true,port:true};
    switch(state.issue){
      case 'dns':flags.dns=false;break;case 'gateway':flags.gateway=false;break;case 'router':flags.router=false;break;case 'cable':flags.cable=false;break;case 'dhcp':flags.dhcp=false;break;case 'server':flags.server=false;break;case 'duplicate':flags.duplicate=true;break;case 'subnet':flags.subnet=false;break;case 'port':flags.port=false;break;
    }
    return {...flags,profile};
  }
  function renderTopology(){
    const flags=applyIssue();
    const nodes=[
      ['device','Dispositivo',flags.cable?'online':'offline'],['adapter',state.connection==='wifi'?'Wi-Fi':'Ethernet',flags.cable?'online':'offline'],['router','Roteador',flags.router?'online':'offline'],['gateway','Gateway',flags.gateway?'online':'offline'],['dns','DNS',flags.dns?'online':'warning'],['provider','Provedor',profileData().bandwidth?'online':'offline'],['server','Servidor',flags.server?'online':'offline']
    ];
    root.querySelector('#topology').innerHTML=nodes.map(([id,label,status],index)=>`${index?'<span class="topology-link"></span>':''}<div class="topology-node ${status}" data-node="${id}"><i></i><strong>${label}</strong><small>${status==='online'?'ativo':status==='warning'?'falha':'indisponível'}</small></div>`).join('');
    const p=profileData();
    root.querySelector('#networkMetrics').innerHTML=[['IPv4',state.ip],['Gateway',state.gateway],['DNS',state.dns1],['Link',`${state.bandwidth||p.bandwidth} Mb/s`],['Sinal',`${state.signal}%`],['MTU','1500'],['Latência base',`${state.baseLatency} ms`],['Perda',`${state.loss}%`]].map(([a,b])=>`<div class="metric"><span>${a}</span><b>${b}</b></div>`).join('');
  }
  function syncFromForm(event){
    ['profile','seed','connection','ip','mask','gateway','dns1','dns2','issue'].forEach(key=>{const el=root.querySelector(`#net_${key}`);if(el)state[key]=el.type==='checkbox'?el.checked:el.value;});
    ['signal','distance','interference','bandwidth','baseLatency','jitter','loss'].forEach(key=>{const el=root.querySelector(`#net_${key}`);state[key]=Number(el.value);root.querySelector(`[data-out="${key}"]`).textContent=key==='bandwidth'?`${state[key]} Mb/s`:key==='distance'?`${state[key]} m`:key==='loss'?`${state[key]}%`:key==='signal'||key==='interference'?`${state[key]}%`:`${state[key]} ms`;});
    state.dhcp=root.querySelector('#net_dhcp').checked;
    const base=profileData();
    const sourceId=event?.target?.id || '';
    if(!event || ['net_profile','net_distance','net_interference','net_signal'].includes(sourceId)){
      state.baseLatency=Math.max(1,Math.round(base.base+state.distance*1.1+state.interference*.3));
      state.jitter=Math.max(1,Math.round(base.jitter+state.interference*.45));
      state.loss=Math.min(90,Math.round(base.loss*100+Math.max(0,55-state.signal)*.22+state.interference*.05));
    }
    root.querySelector('#net_baseLatency').value=state.baseLatency;root.querySelector('[data-out="baseLatency"]').textContent=`${state.baseLatency} ms`;
    root.querySelector('#net_jitter').value=state.jitter;root.querySelector('[data-out="jitter"]').textContent=`${state.jitter} ms`;
    root.querySelector('#net_loss').value=state.loss;root.querySelector('[data-out="loss"]').textContent=`${state.loss}%`;
    renderTopology();
    ctx.storage.set('lab.network.state',state);
  }
  function testProfile(){
    const base=profileData();
    return {...base,base:state.baseLatency,jitter:state.jitter,loss:state.loss/100,dns:applyIssue().dns,gateway:applyIssue().gateway&&applyIssue().router&&applyIssue().cable,bandwidth:state.bandwidth,signal:state.signal};
  }
  async function runTest(type){
    if(controller)controller.abort();
    controller=new AbortController();
    const host=root.querySelector('#netTarget').value.trim()||'servidor.local';
    const startTime=performance.now(),logStart=state.logs.length;
    addLog(`Iniciando ${type} para ${host}...`,'info');
    const original=window.LABDS.NetworkEngine.profiles.__custom;
    window.LABDS.NetworkEngine.profiles.__custom=testProfile();
    const line=(text,tone='')=>addLog(text,tone);
    let result=null,status='success',errorText='';
    try{
      if(type==='ping')result=await window.LABDS.NetworkEngine.ping({host,count:4,style:'unix',profileId:'__custom',seed:state.seed,onLine:line,signal:controller.signal});
      else if(type==='traceroute')result=await window.LABDS.NetworkEngine.traceroute({host,style:'unix',profileId:'__custom',seed:state.seed,onLine:line,signal:controller.signal});
      else if(type==='dns')result=await window.LABDS.NetworkEngine.dnsLookup({host,profileId:'__custom',onLine:line,signal:controller.signal});
      else if(type==='speed'){
        const p=testProfile();
        for(const step of [15,32,51,70,86,100]){await new Promise((res,rej)=>{const t=setTimeout(res,180);controller.signal.addEventListener('abort',()=>{clearTimeout(t);rej(new DOMException('Interrompido','AbortError'));},{once:true});});addLog(`Teste de velocidade: ${step}%`);}
        const download=Number((p.bandwidth*(.72+Math.random()*.22)).toFixed(1)),upload=Number((p.bandwidth*(.18+Math.random()*.18)).toFixed(1));
        addLog(`Download: ${download} Mb/s`,'success');addLog(`Upload: ${upload} Mb/s`,'success');addLog(`Ping: ${p.base} ms | Jitter: ${p.jitter} ms | Perda: ${(p.loss*100).toFixed(1)}%`);result={download,upload,ping:p.base,jitter:p.jitter,loss:p.loss*100};
      }else if(type==='diagnostic'){
        const f=applyIssue(),checks=[];
        const add=(label,ok,text)=>{addLog(text,ok?'success':'error');checks.push({label,ok,text});};
        add('adaptador',f.cable,f.cable?'Adaptador: conectado':'Adaptador: cabo/sinal desconectado');add('dhcp',f.dhcp,f.dhcp?'DHCP: concessão válida':'DHCP: servidor indisponível');add('gateway',f.gateway,f.gateway?'Gateway: alcançável':'Gateway: incorreto ou indisponível');add('dns',f.dns,f.dns?'DNS: resolução disponível':'DNS: falha de resolução');add('subnet',f.subnet,f.subnet?'Sub-rede: configuração coerente':'Sub-rede: IP fora da faixa');if(f.duplicate){addLog('Conflito: endereço IPv4 duplicado detectado','error');checks.push({label:'duplicidade',ok:false});}result={checks};
      }
    }catch(error){if(error.name==='AbortError'){addLog('Operação interrompida.','warning');status='interrupted';}else{addLog(error.message,'error');status='error';errorText=error.message;}}
    finally{
      controller=null;if(original)window.LABDS.NetworkEngine.profiles.__custom=original;else delete window.LABDS.NetworkEngine.profiles.__custom;ctx.storage.set('lab.network.state',state);
      ctx.logEvent({eventType:'network_test',action:`Teste de rede: ${type}`,input:host,output:state.logs.slice(logStart).map(l=>`[${l.time}] ${l.text}`).join('\n'),status,error:errorText,context:{simulation:true,profile:state.profile,seed:state.seed||null,connection:state.connection,dhcp:state.dhcp,ip:state.ip,mask:state.mask,gateway:state.gateway,dns:[state.dns1,state.dns2],signal:state.signal,bandwidth:state.bandwidth,baseLatency:state.baseLatency,jitter:state.jitter,loss:state.loss,issue:state.issue,durationMs:Math.round(performance.now()-startTime),result}});
    }
  }

  async function mount(host,context){
    ctx=context;root=host;state={...defaultState(),...(await ctx.storage.get('lab.network.state',{}))};
    root.innerHTML=`<div class="workspace network-workspace">
      <aside class="workspace-panel"><div class="panel-title"><div><h2>Ambiente de rede</h2><p>Configure a conexão e observe o comportamento.</p></div></div>
      <div class="form-stack">
        <label>Perfil<select id="net_profile">${Object.entries(window.LABDS.NetworkEngine.profiles).filter(([k])=>!k.startsWith('__')).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('')}</select></label>
        <label>Semente repetível<input id="net_seed" value="${esc(state.seed)}" placeholder="Ex.: aula-redes-01"></label>
        <div class="field-row"><label>Conexão<select id="net_connection"><option value="wifi">Wi-Fi</option><option value="ethernet">Ethernet</option></select></label><label class="check-field"><input id="net_dhcp" type="checkbox"> Usar DHCP</label></div>
        <label>Problema simulado<select id="net_issue"><option value="none">Nenhum</option><option value="dns">DNS incorreto</option><option value="gateway">Gateway incorreto</option><option value="cable">Cabo desconectado</option><option value="router">Roteador desligado</option><option value="dhcp">DHCP indisponível</option><option value="server">Servidor fora do ar</option><option value="duplicate">IP duplicado</option><option value="subnet">IP fora da sub-rede</option><option value="port">Porta bloqueada</option></select></label>
        <div class="field-row"><label>IPv4<input id="net_ip" value="${esc(state.ip)}"></label><label>Máscara<input id="net_mask" value="${esc(state.mask)}"></label></div>
        <div class="field-row"><label>Gateway<input id="net_gateway" value="${esc(state.gateway)}"></label><label>DNS primário<input id="net_dns1" value="${esc(state.dns1)}"></label></div>
        ${[['signal','Sinal',0,100],['distance','Distância',1,40],['interference','Interferência',0,100],['bandwidth','Largura de banda',1,1000],['baseLatency','Latência base',1,400],['jitter','Jitter',0,300],['loss','Perda de pacotes',0,80]].map(([id,label,min,max])=>`<label class="range-field"><span>${label}<output data-out="${id}"></output></span><input id="net_${id}" type="range" min="${min}" max="${max}" value="${state[id]}"></label>`).join('')}
      </div></aside>
      <main class="workspace-main network-main"><section class="network-topology-card"><div class="panel-title"><div><h2>Topologia simulada</h2><p>O estado dos nós muda conforme a configuração.</p></div></div><div id="topology" class="topology"></div></section>
      <section class="network-test-card"><div class="network-test-head"><input id="netTarget" value="servidor.local" aria-label="Destino"><div class="button-row"><button class="btn primary" data-test="ping">Ping</button><button class="btn secondary" data-test="traceroute">Traceroute</button><button class="btn secondary" data-test="dns">DNS</button><button class="btn secondary" data-test="speed">Velocidade</button><button class="btn secondary" data-test="diagnostic">Diagnóstico</button><button class="btn subtle" id="stopNetworkTest">Parar</button></div></div><div id="networkLog" class="console-card network-log"></div></section>
      <section><div class="panel-title"><h3>Informações do adaptador</h3></div><div id="networkMetrics" class="metric-grid network-metrics"></div></section></main></div>`;
    root.querySelector('#net_profile').value=state.profile;root.querySelector('#net_connection').value=state.connection;root.querySelector('#net_issue').value=state.issue;root.querySelector('#net_dhcp').checked=state.dhcp;
    root.querySelectorAll('input,select').forEach(el=>el.addEventListener('input',syncFromForm));
    root.querySelectorAll('[data-test]').forEach(btn=>btn.addEventListener('click',()=>runTest(btn.dataset.test)));
    root.querySelector('#stopNetworkTest').addEventListener('click',()=>controller?.abort());
    syncFromForm();renderLogs();
  }
  function exportPayload(){return {text:['LABORATÓRIO DE REDES',`Exportado em: ${new Date().toLocaleString('pt-BR')}`,`Perfil: ${profileData().label}`,`IPv4: ${state.ip}`,`Máscara: ${state.mask}`,`Gateway: ${state.gateway}`,`DNS: ${state.dns1}`,`Problema: ${state.issue}`,'','===== LOGS =====',...state.logs.map(l=>`[${l.time}] ${l.text}`)].join('\n'),native:JSON.stringify(state,null,2),backup:state,meta:[{label:'Perfil',value:profileData().label},{label:'IPv4',value:state.ip}]};}
  function help(){return '<p>Altere o perfil e os parâmetros para observar latência, jitter, perda, DNS e gateway. Os testes não enviam pacotes reais.</p>';}
  async function unmount(){controller?.abort();if(ctx&&state)await ctx.storage.set('lab.network.state',state);root=null;ctx=null;}
  window.LABDS_LABS['network-lab']={mount,unmount,exportPayload,help};
})();
