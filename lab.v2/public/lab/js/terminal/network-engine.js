'use strict';

(function(){
  window.LABDS = window.LABDS || {};

  const profiles = {
    rede_estavel:{label:'Rede estável', base:9, jitter:5, loss:0.01, dns:true, gateway:true, bandwidth:600, signal:100},
    rede_domestica:{label:'Rede doméstica', base:24, jitter:18, loss:0.04, dns:true, gateway:true, bandwidth:180, signal:82},
    wifi_distante:{label:'Wi-Fi distante', base:48, jitter:42, loss:0.12, dns:true, gateway:true, bandwidth:38, signal:38},
    rede_congestionada:{label:'Rede congestionada', base:85, jitter:95, loss:0.16, dns:true, gateway:true, bandwidth:18, signal:76},
    rede_instavel:{label:'Rede instável', base:55, jitter:160, loss:0.28, dns:true, gateway:true, bandwidth:12, signal:48},
    dns_com_problema:{label:'DNS com problema', base:22, jitter:12, loss:0.02, dns:false, gateway:true, bandwidth:140, signal:88},
    gateway_indisponivel:{label:'Gateway indisponível', base:0, jitter:0, loss:1, dns:true, gateway:false, bandwidth:0, signal:90},
    sem_conexao:{label:'Sem conexão', base:0, jitter:0, loss:1, dns:false, gateway:false, bandwidth:0, signal:0}
  };

  function hashSeed(text){
    let h = 2166136261;
    for(const char of String(text || 'labds')){ h ^= char.charCodeAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  function createRandom(seedText){
    let seed = hashSeed(seedText || `${Date.now()}-${Math.random()}`) || 1;
    return () => {
      seed += 0x6D2B79F5;
      let t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function resolveHost(host, profile){
    const raw = String(host || '').trim();
    if(!raw) return {ok:false, error:'Destino não informado.'};
    if(!profile.dns && !/^\d{1,3}(?:\.\d{1,3}){3}$/.test(raw)) return {ok:false, dns:true, error:`Não foi possível localizar o host ${raw}. Verifique o nome e tente novamente.`};
    if(/^\d{1,3}(?:\.\d{1,3}){3}$/.test(raw)) return {ok:true, host:raw, ip:raw};
    const known = {
      localhost:'127.0.0.1', 'gateway.local':'192.168.0.1', 'dns.google':'8.8.8.8', 'google.com':'142.250.219.14', 'github.com':'20.201.28.151', 'escola.local':'10.20.0.10', 'servidor.local':'10.20.0.20'
    };
    const ip = known[raw.toLowerCase()] || `203.0.113.${(hashSeed(raw) % 220) + 10}`;
    return {ok:true, host:raw, ip};
  }

  function latency(profile, random){
    const spike = random() < 0.12 ? profile.jitter * (1.5 + random() * 2.2) : 0;
    return Math.max(1, Math.round(profile.base + (random() - 0.35) * profile.jitter + spike));
  }

  function packet(profile, random){
    if(!profile.gateway || random() < profile.loss) return {received:false};
    return {received:true, ms:latency(profile, random), ttl:profile.base > 60 ? 112 : 117};
  }

  function delay(ms, signal){
    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, ms);
      if(signal){
        if(signal.aborted){ clearTimeout(timer); reject(new DOMException('Interrompido','AbortError')); }
        signal.addEventListener('abort', () => { clearTimeout(timer); reject(new DOMException('Interrompido','AbortError')); }, {once:true});
      }
    });
  }

  async function ping({host, count = 4, continuous = false, style = 'windows', profileId = 'rede_domestica', seed = '', onLine = () => {}, signal}){
    const profile = profiles[profileId] || profiles.rede_domestica;
    const resolved = resolveHost(host, profile);
    if(!resolved.ok){ onLine(resolved.error, 'error'); return {sent:0, received:0, loss:100, values:[]}; }
    const random = createRandom(seed ? `${seed}|${host}|ping` : `${host}|ping|${Date.now()}|${Math.random()}`);
    if(!profile.gateway){
      onLine(style === 'windows' ? `Disparando ${resolved.host} [${resolved.ip}] com 32 bytes de dados:` : `PING ${resolved.host} (${resolved.ip}) 56(84) bytes of data.`);
      await delay(260, signal);
      onLine(style === 'windows' ? 'Falha geral.' : 'connect: Network is unreachable', 'error');
      return {sent:1, received:0, loss:100, values:[]};
    }
    onLine(style === 'windows' ? `Disparando ${resolved.host} [${resolved.ip}] com 32 bytes de dados:` : `PING ${resolved.host} (${resolved.ip}) 56(84) bytes of data.`);
    let sent = 0, received = 0;
    const values = [];
    const max = continuous ? 100000 : Math.min(Math.max(Number(count) || 4, 1), 20);
    for(let index = 1; index <= max; index++){
      await delay(650 + Math.round(random() * 350), signal);
      sent++;
      const result = packet(profile, random);
      if(result.received){
        received++; values.push(result.ms);
        onLine(style === 'windows'
          ? `Resposta de ${resolved.ip}: bytes=32 tempo=${result.ms < 1 ? '<1' : result.ms}ms TTL=${result.ttl}`
          : `64 bytes from ${resolved.ip}: icmp_seq=${index} ttl=${result.ttl} time=${result.ms.toFixed(1)} ms`);
      }else{
        onLine(style === 'windows' ? 'Esgotado o tempo limite do pedido.' : `From 192.168.0.1 icmp_seq=${index} Destination Host Unreachable`, 'warning');
      }
    }
    const lost = sent - received;
    const loss = sent ? Math.round(lost / sent * 100) : 0;
    const min = values.length ? Math.min(...values) : 0;
    const maxValue = values.length ? Math.max(...values) : 0;
    const avg = values.length ? Math.round(values.reduce((a,b)=>a+b,0)/values.length) : 0;
    onLine('');
    if(style === 'windows'){
      onLine(`Estatísticas do Ping para ${resolved.ip}:`);
      onLine(`    Pacotes: Enviados = ${sent}, Recebidos = ${received}, Perdidos = ${lost} (${loss}% de perda),`);
      if(values.length){ onLine('Aproximar um número redondo de vezes em milissegundos:'); onLine(`    Mínimo = ${min}ms, Máximo = ${maxValue}ms, Média = ${avg}ms`); }
    }else{
      onLine(`--- ${resolved.host} ping statistics ---`);
      onLine(`${sent} packets transmitted, ${received} received, ${loss}% packet loss`);
      if(values.length) onLine(`rtt min/avg/max = ${min.toFixed(1)}/${avg.toFixed(1)}/${maxValue.toFixed(1)} ms`);
    }
    return {sent, received, loss, values, resolved};
  }

  function routeTemplate(host, ip, profileId){
    const congested = ['rede_congestionada','rede_instavel','wifi_distante'].includes(profileId);
    return [
      {ip:'192.168.0.1', host:'roteador.local'},
      {ip:'10.20.0.1', host:'gateway.escola.local'},
      {ip:'100.64.0.1', host:'cgnat.provedor.local'},
      {ip:'198.51.100.17', host:'core-01.provedor.exemplo'},
      ...(congested ? [{ip:'198.51.100.44', host:'transito-regional.exemplo'}] : []),
      {ip, host}
    ];
  }

  async function traceroute({host, style='windows', profileId='rede_domestica', seed='', onLine=()=>{}, signal}){
    const profile = profiles[profileId] || profiles.rede_domestica;
    const resolved = resolveHost(host, profile);
    if(!resolved.ok){ onLine(resolved.error,'error'); return []; }
    if(!profile.gateway){ onLine(style === 'windows' ? 'Não é possível acessar o destino.' : 'connect: Network is unreachable','error'); return []; }
    const random = createRandom(seed ? `${seed}|${host}|trace` : `${host}|trace|${Date.now()}|${Math.random()}`);
    const route = routeTemplate(resolved.host, resolved.ip, profileId);
    onLine(style === 'windows' ? `Rastreando a rota para ${resolved.host} [${resolved.ip}]` : `traceroute to ${resolved.host} (${resolved.ip}), ${route.length} hops max`);
    const results = [];
    for(let i=0;i<route.length;i++){
      await delay(500 + Math.round(random()*450), signal);
      const hop = route[i];
      const base = Math.max(1, profile.base * (0.2 + i * 0.35));
      const times = [0,1,2].map(() => random() < profile.loss * 0.55 ? null : Math.max(1, Math.round(base + random()*profile.jitter)));
      const timeText = times.map(value => value === null ? '*' : style === 'windows' ? `${String(value).padStart(4)} ms` : `${value.toFixed(1)} ms`).join('  ');
      const line = style === 'windows'
        ? `${String(i+1).padStart(3)}  ${timeText}  ${hop.host} [${hop.ip}]`
        : `${String(i+1).padStart(2)}  ${hop.host} (${hop.ip})  ${timeText}`;
      onLine(line, times.every(v=>v===null) ? 'warning' : '');
      results.push({...hop,times});
    }
    if(style === 'windows') onLine('Rastreamento concluído.');
    return results;
  }

  async function dnsLookup({host, profileId='rede_domestica', onLine=()=>{}, signal}){
    const profile = profiles[profileId] || profiles.rede_domestica;
    await delay(350, signal);
    const resolved = resolveHost(host, profile);
    if(!resolved.ok){ onLine('Servidor:  dns.escola.local\n*** A solicitação expirou.','error'); return resolved; }
    onLine(`Servidor:  dns.escola.local\nAddress:  192.168.0.53\n\nResposta não autoritativa:\nNome:    ${resolved.host}\nAddress: ${resolved.ip}`);
    return resolved;
  }

  window.LABDS.NetworkEngine = {profiles, createRandom, resolveHost, ping, traceroute, dnsLookup, latency};
})();
