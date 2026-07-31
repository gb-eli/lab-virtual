'use strict';
(function(){
  window.LABDS_LABS=window.LABDS_LABS||{};
  const KEY='lab.codegames.v3';
  const DEFAULT={schemaVersion:3,game:'snake',bits:100,best:{snake:0,hangman:0,trio:0,trend:0,pac:0,runner:0,memory:0},plays:{},wins:{},learned:[]};
  const TECH=[
    {id:'JS',label:'JavaScript',color:'#f7df1e',lesson:'JavaScript controla eventos, interfaces e jogos no navegador.'},
    {id:'PY',label:'Python',color:'#56a5d8',lesson:'Python é usado em automação, dados, web e inteligência artificial.'},
    {id:'SQL',label:'SQL',color:'#62d3ff',lesson:'SQL consulta, relaciona e modifica dados estruturados.'},
    {id:'HTML',label:'HTML',color:'#ff7a55',lesson:'HTML descreve a estrutura semântica de uma página.'},
    {id:'CSS',label:'CSS',color:'#7c8fff',lesson:'CSS define layout, aparência, adaptação e animações.'},
    {id:'GIT',label:'Git',color:'#f06b49',lesson:'Git registra versões e facilita colaboração.'},
    {id:'API',label:'API',color:'#55e6b2',lesson:'APIs definem contratos de comunicação entre sistemas.'},
    {id:'AI',label:'IA',color:'#c58cff',lesson:'Sistemas de IA processam dados usando modelos e regras.'}
  ];
  const WORDS=[
    {word:'ALGORITMO',hint:'Sequência finita de passos para resolver um problema.'},
    {word:'VARIAVEL',hint:'Espaço nomeado que guarda um valor durante a execução.'},
    {word:'FUNCAO',hint:'Bloco reutilizável que recebe dados e executa uma tarefa.'},
    {word:'CRIPTOGRAFIA',hint:'Técnicas para proteger confidencialidade e integridade.'},
    {word:'COMPILADOR',hint:'Programa que traduz código-fonte para outra representação.'},
    {word:'FIREWALL',hint:'Mecanismo que filtra tráfego conforme regras.'},
    {word:'PROTOCOLO',hint:'Conjunto de regras para comunicação.'},
    {word:'RECURSAO',hint:'Técnica em que uma função chama a si mesma.'},
    {word:'INTERFACE',hint:'Camada de interação entre pessoas, programas ou sistemas.'},
    {word:'BANCO',hint:'Estrutura usada para armazenar e consultar dados.'}
  ];
  const MEMORY_THEMES={
    linguagens:[['HTML','estrutura'],['CSS','aparência'],['SQL','dados'],['Git','versões'],['Python','automação'],['JavaScript','interação']],
    hardware:[['CPU','processamento'],['RAM','memória temporária'],['SSD','armazenamento'],['GPU','gráficos'],['PSU','energia'],['Cooler','refrigeração']],
    redes:[['DNS','nomes'],['DHCP','endereços'],['NAT','tradução'],['TLS','proteção'],['Switch','comutação'],['Roteador','rotas']],
    seguranca:[['Hash','integridade'],['2FA','segunda etapa'],['Backup','recuperação'],['Firewall','filtragem'],['CSP','conteúdo'],['Senha','autenticação']]
  };
  const GAMES={
    snake:{name:'Cobrinha Tech',emoji:'🐍',desc:'Colete conceitos, complete fases e evite bugs.',code:'const next = move(snake[0], direction);\nif (collision(next)) endGame();\nelse snake.unshift(next);'},
    hangman:{name:'Forca da Tecnologia',emoji:'⌨️',desc:'Descubra termos técnicos usando as pistas.',code:'if (word.includes(letter)) reveal(letter);\nelse attempts -= 1;'},
    trio:{name:'Combinação de Linguagens',emoji:'◫',desc:'Três símbolos iguais geram Créditos Tech; não concede XP por sorte.',code:'const win = reels.every(item => item.id === reels[0].id);'},
    trend:{name:'Tendência Digital',emoji:'📈',desc:'Interprete séries independentes da sua escolha.',code:'const movement = nextValue - currentValue;\ncompare(choice, Math.sign(movement));'},
    pac:{name:'Pac-Tech',emoji:'🟡',desc:'Complete labirintos, colete tecnologias e evite quatro bugs.',code:'if (tile === TOKEN) collect();\nif (enemyTouchesPlayer()) loseLife();'},
    runner:{name:'Corrida Offline',emoji:'🏃',desc:'Use salto duplo, alcance checkpoints e conclua a fase.',code:'if (jumpCount < 2) velocityY = -jumpForce;'},
    memory:{name:'Memória Tech',emoji:'🧩',desc:'Associe tecnologias às finalidades sem respostas expostas.',code:'if (first.pair === second.pair) markAsMatched();'}
  };
  let root,ctx,state,raf=0,last=0,keyHandler=null,cleanup=null;
  const rnd=max=>Math.floor(Math.random()*max);
  const core=()=>ctx?.core||window.LABDS?.Core;
  async function save(){await ctx.storage.set(KEY,state);}
  function setStatus(text,type='info'){const el=root?.querySelector('#arcadeStatus');if(el){el.textContent=text;el.dataset.type=type;}}
  function setKnowledge(text){const el=root?.querySelector('#arcadeKnowledge');if(el){el.textContent='Aprendizado: '+text;}}
  function updateWallet(){root?.querySelector('#arcadeBits')&&(root.querySelector('#arcadeBits').textContent=state.bits);root?.querySelector('#arcadeBest')&&(root.querySelector('#arcadeBest').textContent=state.best[state.game]||0);}
  function addBits(amount,reason){state.bits=Math.max(0,Math.min(100000,state.bits+Math.round(amount)));if(amount>0)core()?.addCredits?.(amount,reason);else if(amount<0)core()?.addCredits?.(amount,reason);updateWallet();save();}
  function validCompletion(game,score,{xp=0,credits=0,reason='Fase concluída'}={}){
    state.wins[game]=(state.wins[game]||0)+1;state.best[game]=Math.max(state.best[game]||0,Math.floor(score));
    core()?.complete?.(`arcade:${game}:phase:${state.wins[game]}`,{xp,credits,reason});
    if(credits)state.bits=Math.max(0,state.bits+credits);updateWallet();save();ctx.toast?.(`${reason}${xp?` • +${xp} XP`:''}${credits?` • +${credits} Créditos`:''}`,'success');
  }
  function recordPlay(game,score){state.plays[game]=(state.plays[game]||0)+1;state.best[game]=Math.max(state.best[game]||0,Math.floor(score));core()?.setRecord?.(`arcade-${game}`,score);updateWallet();save();}
  function stop(){cancelAnimationFrame(raf);raf=0;last=0;if(keyHandler){document.removeEventListener('keydown',keyHandler);keyHandler=null;}cleanup?.();cleanup=null;}
  function stage(){return root.querySelector('#arcadePlayfield');}
  function canvas(label){stage().innerHTML=`<canvas id="arcadeCanvas" tabindex="0" aria-label="${label}"></canvas><div class="arcade-overlay"><span id="arcadeHud">Pronto</span><div class="mobile-game-controls"><button data-dir="left" aria-label="Esquerda">←</button><button data-dir="up" aria-label="Cima">↑</button><button data-dir="down" aria-label="Baixo">↓</button><button data-dir="right" aria-label="Direita">→</button><button data-action="jump">Saltar</button><button data-action="pause">Pausar</button></div></div>`;return stage().querySelector('canvas');}
  function size(cv,min=420){const r=cv.getBoundingClientRect(),ratio=Math.min(2,devicePixelRatio||1),w=Math.max(280,r.width),h=Math.max(min,r.height||min);if(cv.width!==Math.round(w*ratio)||cv.height!==Math.round(h*ratio)){cv.width=Math.round(w*ratio);cv.height=Math.round(h*ratio);}const c=cv.getContext('2d');c.setTransform(ratio,0,0,ratio,0,0);return{c,w,h};}
  function bg(c,w,h){const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#020813');g.addColorStop(1,'#10293e');c.fillStyle=g;c.fillRect(0,0,w,h);c.strokeStyle='rgba(102,220,255,.07)';for(let x=0;x<w;x+=30){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke()}for(let y=0;y<h;y+=30){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke()}}
  function controls(fn,{jump=false}={}){const map={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down',' ':'jump',p:'pause',P:'pause'};keyHandler=e=>{if(e.isComposing)return;const action=map[e.key];if(action){e.preventDefault();fn(action)}};document.addEventListener('keydown',keyHandler);root.querySelectorAll('[data-dir],[data-action]').forEach(b=>{if(b.dataset.action==='jump'&&!jump)b.hidden=true;const handler=()=>fn(b.dataset.dir||b.dataset.action);b.addEventListener('click',handler);});cleanup=()=>root.querySelectorAll('[data-dir],[data-action]').forEach(b=>b.replaceWith(b.cloneNode(true)));}
  function freeCell(cols,rows,blocked=[]){for(let i=0;i<500;i++){const p={x:rnd(cols),y:rnd(rows)};if(!blocked.some(b=>b.x===p.x&&b.y===p.y))return p;}return{x:1,y:1};}
  function startSnake(){
    const cv=canvas('Cobrinha Tech');let dir={x:1,y:0},queued=dir,score=0,items=0,phase=1,acc=0,paused=false,cell=24,snake=[{x:5,y:5},{x:4,y:5},{x:3,y:5}],token={x:12,y:7,tech:TECH[rnd(TECH.length)]},bug={x:16,y:4};
    controls(action=>{if(action==='pause'){paused=!paused;setStatus(paused?'Jogo pausado.':'Jogo retomado.');return;}const dirs={left:{x:-1,y:0},right:{x:1,y:0},up:{x:0,y:-1},down:{x:0,y:1}},n=dirs[action];if(n&&!(n.x===-dir.x&&n.y===-dir.y))queued=n;});
    setKnowledge('A cobra é um array ordenado de coordenadas; cada quadro move a cabeça e remove a cauda.');
    const end=won=>{recordPlay('snake',score);if(won)validCompletion('snake',score,{xp:35,credits:8,reason:'Fase da Cobrinha Tech concluída'});else setStatus(`Fim da partida. ${score} pontos. XP não concedido por derrota.`,'error');stop();};
    const loop=t=>{const {c,w,h}=size(cv),cols=Math.max(12,Math.floor(w/cell)),rows=Math.max(10,Math.floor((h-50)/cell)),dt=Math.min(80,t-(last||t));last=t;if(!paused)acc+=dt;if(acc>Math.max(72,150-phase*12)){acc=0;dir=queued;const head={x:snake[0].x+dir.x,y:snake[0].y+dir.y};if(head.x<0||head.y<0||head.x>=cols||head.y>=rows||snake.some(s=>s.x===head.x&&s.y===head.y)||(head.x===bug.x&&head.y===bug.y)){end(false);return;}snake.unshift(head);if(head.x===token.x&&head.y===token.y){score+=10;items++;phase=1+Math.floor(items/4);setKnowledge(token.tech.lesson);const blocked=[...snake,bug];const p=freeCell(cols,rows,blocked);token={...p,tech:TECH[rnd(TECH.length)]};bug=freeCell(cols,rows,[...snake,token]);if(items>=12){end(true);return;}}else snake.pop();}
      bg(c,w,h);c.fillStyle='#ff647d';c.fillRect(bug.x*cell+5,bug.y*cell+5,cell-10,cell-10);c.fillStyle=token.tech.color;c.fillRect(token.x*cell+2,token.y*cell+2,cell-4,cell-4);c.fillStyle='#06111d';c.font='800 8px monospace';c.textAlign='center';c.fillText(token.tech.id,token.x*cell+cell/2,token.y*cell+cell/2+3);snake.forEach((s,i)=>{c.fillStyle=i?'#45d99e':'#b8ffdf';c.fillRect(s.x*cell+2,s.y*cell+2,cell-4,cell-4)});c.fillStyle='#edfaff';c.font='700 15px system-ui';c.textAlign='left';c.fillText(`Fase ${phase} • ${items}/12 conceitos • ${score} pontos`,12,h-18);root.querySelector('#arcadeHud').textContent=paused?'Pausado':'Setas/WASD ou botões';raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  }
  function startHangman(){
    const chosen=WORDS[rnd(WORDS.length)],word=chosen.word.normalize('NFD').replace(/[\u0300-\u036f]/g,''),used=new Set();let attempts=7,finished=false;
    stage().innerHTML=`<div class="hangman-stage"><div class="hangman-drawing" id="hangmanDrawing"></div><p id="hangmanHint"></p><div id="hangmanWord" class="hangman-word"></div><div id="hangmanKeys" class="keyboard-grid"></div><p id="hangmanMeta"></p><button id="hangmanNew" class="btn secondary">Nova palavra</button></div>`;
    const done=()=>[...word].every(ch=>!/[A-Z]/.test(ch)||used.has(ch));
    const render=()=>{const box=root.querySelector('#hangmanWord');box.textContent='';for(const ch of word){const s=document.createElement('span');s.className='hangman-letter';s.textContent=used.has(ch)||!/[A-Z]/.test(ch)?ch:'';box.appendChild(s)}root.querySelector('#hangmanHint').textContent=`Dica: ${chosen.hint}`;root.querySelector('#hangmanMeta').textContent=`Tentativas: ${attempts} • usadas: ${[...used].join(', ')||'nenhuma'}`;root.querySelector('#hangmanDrawing').textContent='⚙'.repeat(Math.max(1,8-attempts));if(done()&&!finished){finished=true;const score=attempts*20;recordPlay('hangman',score);validCompletion('hangman',score,{xp:30,credits:5,reason:'Termo técnico identificado'});setKnowledge(`${chosen.word}: ${chosen.hint}`)}else if(attempts<=0&&!finished){finished=true;recordPlay('hangman',0);setStatus(`A palavra era ${chosen.word}. Revise a dica e tente outra vez. Nenhum XP foi concedido.`,'error')}};
    const keys=root.querySelector('#hangmanKeys');'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter=>{const b=document.createElement('button');b.textContent=letter;b.onclick=()=>{if(finished||used.has(letter))return;used.add(letter);b.disabled=true;if(!word.includes(letter))attempts--;render()};keys.appendChild(b)});root.querySelector('#hangmanNew').onclick=startHangman;render();
  }
  function startTrio(){
    stage().innerHTML=`<div class="trio-stage"><div class="trio-rule"><b>Regra:</b> somente três símbolos exatamente iguais geram Créditos Tech. Este jogo nunca concede XP acadêmico.</div><div class="trio-reels"><div class="trio-reel">?</div><div class="trio-reel">?</div><div class="trio-reel">?</div></div><p id="trioMeta">Custo: 2 Bits por rodada • prêmio comum: 8 • raro: 20.</p><button id="trioSpin" class="btn primary">Combinar</button></div>`;
    const reels=[...root.querySelectorAll('.trio-reel')],button=root.querySelector('#trioSpin');let spinning=false,rounds=0;
    button.onclick=()=>{if(spinning||rounds>=20)return;if(state.bits<2){setStatus('Bits insuficientes. Complete atividades acadêmicas ou outros jogos de habilidade.','error');return;}spinning=true;rounds++;state.bits-=2;updateWallet();button.disabled=true;let ticks=0;const timer=setInterval(()=>{reels.forEach((r,i)=>{const t=TECH[rnd(TECH.length)];r.textContent=t.id;r.style.color=t.color;r.dataset.id=t.id});if(++ticks>=12){clearInterval(timer);const result=reels.map(r=>r.dataset.id),win=result.every(v=>v===result[0]),rare=win&&['AI','API'].includes(result[0]),prize=win?(rare?20:8):0;if(win){addBits(prize,'Combinação de três tecnologias');setStatus(`Três ${result[0]} iguais: +${prize} Créditos Tech.` ,'success');}else{setStatus('Os três símbolos são diferentes. Nenhum prêmio e nenhum XP.');}recordPlay('trio',prize);spinning=false;button.disabled=rounds>=20;root.querySelector('#trioMeta').textContent=`Rodadas ${rounds}/20 • Probabilidade teórica de três iguais: 1/${TECH.length*TECH.length}.`; }},70);};
    setKnowledge('Resultados aleatórios não medem aprendizagem; por isso, este minijogo usa apenas Créditos Tech.')
  }
  function startTrend(){
    stage().innerHTML=`<div class="trend-stage"><canvas id="trendCanvas"></canvas><div class="trend-controls"><button data-choice="up">Subirá</button><button data-choice="down">Cairá</button></div><p id="trendMeta"></p></div>`;
    const cv=root.querySelector('#trendCanvas');let data=[100],round=0,correct=0,seed=(Date.now()%2147483647)||1,locked=false;
    const random=()=>{seed=seed*48271%2147483647;return seed/2147483647};
    for(let i=0;i<16;i++)data.push(Math.max(5,data.at(-1)+(random()-.5)*8));
    const draw=()=>{const {c,w,h}=size(cv,280);bg(c,w,h);const min=Math.min(...data)-4,max=Math.max(...data)+4;c.strokeStyle='#5fe3ff';c.lineWidth=3;c.beginPath();data.forEach((v,i)=>{const x=20+i*(w-40)/(data.length-1),y=h-25-(v-min)/(max-min)*(h-50);i?c.lineTo(x,y):c.moveTo(x,y)});c.stroke();c.fillStyle='#eaf9ff';c.font='700 14px system-ui';c.fillText(`Rodada ${round}/10 • acertos ${correct}`,14,20)};
    const choose=choice=>{if(locked||round>=10)return;locked=true;const drift=(random()-.5)*2,shock=random()<.12?(random()<.5?-9:9):0,next=Math.max(5,data.at(-1)+drift+(random()-.5)*9+shock),actual=next>=data.at(-1)?'up':'down';data.push(next);if(data.length>24)data.shift();round++;if(choice===actual)correct++;root.querySelector('#trendMeta').textContent=`Valor seguinte: ${next.toFixed(1)} • ${choice===actual?'interpretação correta':'movimento diferente do esperado'}.`;draw();setTimeout(()=>{locked=false;if(round>=10){const score=correct*10;recordPlay('trend',score);if(correct>=7)validCompletion('trend',score,{xp:35,credits:6,reason:'Série de análise concluída'});else setStatus(`Você acertou ${correct}/10. Revise tendência e volatilidade; nenhum XP por desempenho insuficiente.`,'error')}},250)};
    root.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>choose(b.dataset.choice));setKnowledge('O próximo valor é calculado antes de avaliar sua escolha e não é alterado para favorecer o jogador.');draw();
  }
  function startPac(){
    const cv=canvas('Pac-Tech');const raw=[
      '#####################',
      '#.........#.........#',
      '#.###.###.#.###.###.#',
      '#o#.....#...#.....#o#',
      '#.###.#.#####.#.###.#',
      '#.....#...#...#.....#',
      '#####.### # ###.#####',
      '    #.#   E   #.#    ',
      '#####.# ## ## #.#####',
      '#.........P.........#',
      '#.###.###.#.###.###.#',
      '#o..#.....#.....#..o#',
      '###.#.#.#####.#.#.###',
      '#.....#...#...#.....#',
      '#.#######.#.#######.#',
      '#...................#',
      '#####################'
    ],map=raw.map(r=>r.padEnd(21,'#').split(''));let player={x:10,y:9},dir={x:0,y:0},queued=dir,score=0,lives=3,power=0,paused=false,acc=0,enemyAcc=0;const enemies=[{x:10,y:7,color:'#ff5b76',mode:'chase',home:{x:10,y:7}},{x:9,y:7,color:'#58d7ff',mode:'ambush',home:{x:9,y:7}},{x:11,y:7,color:'#ff8bd1',mode:'scatter',home:{x:11,y:7}},{x:10,y:8,color:'#ffb856',mode:'random',home:{x:10,y:8}}];const tokens=[];
    for(let y=0;y<map.length;y++)for(let x=0;x<map[y].length;x++){if(map[y][x]==='.'||map[y][x]==='o')tokens.push({x,y,power:map[y][x]==='o',taken:false,tech:TECH[rnd(TECH.length)]});if('PE'.includes(map[y][x]))map[y][x]=' ';}
    controls(action=>{if(action==='pause'){paused=!paused;return;}const d={left:{x:-1,y:0},right:{x:1,y:0},up:{x:0,y:-1},down:{x:0,y:1}}[action];if(d)queued=d});
    const wrap=p=>{if(p.x<0)p.x=20;if(p.x>20)p.x=0;};const can=(p,d)=>{const x=p.x+d.x,y=p.y+d.y;return y>=0&&y<map.length&&map[y][((x%21)+21)%21]!=='#'};
    const reset=()=>{player={x:10,y:9};dir={x:0,y:0};enemies.forEach(e=>Object.assign(e,e.home));power=0};
    const end=won=>{recordPlay('pac',score);if(won)validCompletion('pac',score,{xp:55,credits:12,reason:'Labirinto Pac-Tech concluído'});else setStatus(`Fim da partida: ${score} pontos. Nenhum XP por derrota.`,'error');stop()};
    const enemyMove=e=>{const opts=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}].filter(d=>can(e,d));if(!opts.length)return;let target={x:player.x,y:player.y};if(e.mode==='ambush')target={x:player.x+queued.x*3,y:player.y+queued.y*3};if(e.mode==='scatter')target={x:1,y:1};if(e.mode==='random'||power>0){const d=opts[rnd(opts.length)];e.x+=d.x;e.y+=d.y;wrap(e);return;}opts.sort((a,b)=>Math.hypot(e.x+a.x-target.x,e.y+a.y-target.y)-Math.hypot(e.x+b.x-target.x,e.y+b.y-target.y));e.x+=opts[0].x;e.y+=opts[0].y;wrap(e)};
    const loop=t=>{const {c,w,h}=size(cv,430),cell=Math.min(w/21,(h-54)/17),ox=(w-cell*21)/2,oy=8,dt=Math.min(80,t-(last||t));last=t;if(!paused){acc+=dt;enemyAcc+=dt;power=Math.max(0,power-dt)}if(acc>122){acc=0;if(can(player,queued))dir=queued;if(can(player,dir)){player.x+=dir.x;player.y+=dir.y;wrap(player)}const tok=tokens.find(o=>!o.taken&&o.x===player.x&&o.y===player.y);if(tok){tok.taken=true;score+=tok.power?25:5;if(tok.power)power=7000;setKnowledge(tok.tech.lesson);if(tokens.every(o=>o.taken)){end(true);return;}}for(const e of enemies){if(e.x===player.x&&e.y===player.y){if(power>0){score+=50;Object.assign(e,e.home)}else{lives--;reset();if(lives<=0){end(false);return}}}}}if(enemyAcc>220){enemyAcc=0;enemies.forEach(enemyMove)}
      bg(c,w,h);for(let y=0;y<map.length;y++)for(let x=0;x<21;x++)if(map[y][x]==='#'){c.fillStyle='#214ea0';c.fillRect(ox+x*cell,oy+y*cell,cell-1,cell-1)}for(const tok of tokens)if(!tok.taken){c.beginPath();c.arc(ox+(tok.x+.5)*cell,oy+(tok.y+.5)*cell,tok.power?cell*.18:Math.max(2,cell*.07),0,Math.PI*2);c.fillStyle=tok.power?'#fff2a0':tok.tech.color;c.fill()}const angle=dir.x<0?Math.PI:dir.y<0?-Math.PI/2:dir.y>0?Math.PI/2:0;c.save();c.translate(ox+(player.x+.5)*cell,oy+(player.y+.5)*cell);c.rotate(angle);c.beginPath();c.arc(0,0,cell*.34,.2*Math.PI,1.8*Math.PI);c.lineTo(0,0);c.fillStyle='#ffdc58';c.fill();c.restore();enemies.forEach(e=>{c.beginPath();c.arc(ox+(e.x+.5)*cell,oy+(e.y+.5)*cell,cell*.3,Math.PI,0);c.lineTo(ox+(e.x+.8)*cell,oy+(e.y+.8)*cell);c.lineTo(ox+(e.x+.2)*cell,oy+(e.y+.8)*cell);c.closePath();c.fillStyle=power>0?'#4d73d9':e.color;c.fill()});c.fillStyle='#eaf9ff';c.font='700 14px system-ui';c.fillText(`Pontos ${score} • vidas ${lives} • itens ${tokens.filter(o=>o.taken).length}/${tokens.length}${power>0?' • bugs vulneráveis':''}`,10,h-15);root.querySelector('#arcadeHud').textContent=paused?'Pausado':'Setas/WASD • P pausa';raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  }
  function startRunner(){
    const cv=canvas('Corrida Offline');let p={x:70,y:0,w:32,h:48,vy:0,jumps:0},obstacles=[],tokens=[],distance=0,score=0,spawn=0,itemSpawn=0,paused=false,checkpoint=0;
    controls(action=>{if(action==='pause'){paused=!paused;return;}if(action==='jump'&&p.jumps<2){p.vy=-12;p.jumps++}},{jump:true});
    const click=()=>{if(p.jumps<2){p.vy=-12;p.jumps++}};cv.addEventListener('click',click);const oldCleanup=cleanup;cleanup=()=>{oldCleanup?.();cv.removeEventListener('click',click)};
    const finish=won=>{recordPlay('runner',score);if(won)validCompletion('runner',score,{xp:45,credits:9,reason:'Corrida Offline concluída'});else setStatus(`Colisão antes do final. ${score} pontos; nenhum XP por derrota.`,'error');stop()};
    const loop=t=>{const {c,w,h}=size(cv),ground=h-70,dt=Math.min(2,(t-(last||t))/16.67);last=t;if(!paused){distance+=5.3*dt;score=Math.floor(distance/10);p.vy+=.72*dt;p.y+=p.vy*dt;if(p.y>ground-p.h){p.y=ground-p.h;p.vy=0;p.jumps=0}spawn-=dt;if(spawn<=0){obstacles.push({x:w+30,w:22+rnd(18),h:28+rnd(40),type:rnd(2)});spawn=62+rnd(50)}itemSpawn-=dt;if(itemSpawn<=0){tokens.push({x:w+70,y:ground-75-rnd(95),tech:TECH[rnd(TECH.length)],taken:false});itemSpawn=70+rnd(80)}obstacles.forEach(o=>o.x-=6.2*dt);tokens.forEach(o=>o.x-=6.2*dt);obstacles=obstacles.filter(o=>o.x>-80);tokens=tokens.filter(o=>o.x>-80&&!o.taken);for(const o of obstacles)if(p.x<o.x+o.w&&p.x+p.w>o.x&&p.y+p.h>ground-o.h){finish(false);return}for(const tok of tokens)if(Math.hypot(p.x+16-tok.x,p.y+24-tok.y)<30){tok.taken=true;score+=20;setKnowledge(tok.tech.lesson)}if(distance>1000&&checkpoint<1){checkpoint=1;setStatus('Checkpoint 1 alcançado.');}if(distance>2000&&checkpoint<2){checkpoint=2;setStatus('Checkpoint 2 alcançado.');}if(distance>=3000){finish(true);return}}
      bg(c,w,h);c.strokeStyle='#64e9ff';c.beginPath();c.moveTo(0,ground);c.lineTo(w,ground);c.stroke();c.fillStyle='#5eeab4';c.fillRect(p.x,p.y,p.w,p.h);for(const o of obstacles){c.fillStyle=o.type?'#ff7187':'#ffca67';c.fillRect(o.x,ground-o.h,o.w,o.h);c.fillStyle='#07111c';c.font='700 8px monospace';c.fillText(o.type?'BUG':'ERR',o.x+2,ground-o.h+13)}for(const tok of tokens){c.beginPath();c.arc(tok.x,tok.y,12,0,Math.PI*2);c.fillStyle=tok.tech.color;c.fill();c.fillStyle='#06111d';c.textAlign='center';c.font='800 8px monospace';c.fillText(tok.tech.id,tok.x,tok.y+3)}c.fillStyle='#eaf9ff';c.textAlign='left';c.font='700 14px system-ui';c.fillText(`Fase ${checkpoint+1}/3 • ${Math.min(100,Math.floor(distance/30))}% • salto ${p.jumps}/2`,10,22);root.querySelector('#arcadeHud').textContent=paused?'Pausado':'Espaço/clique: salto duplo';raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  }
  function startMemory(){
    const theme=state.memoryTheme||'linguagens',pairs=MEMORY_THEMES[theme],cards=pairs.flatMap(([a,b],i)=>[{pair:i,label:a},{pair:i,label:b}]).sort(()=>crypto.getRandomValues(new Uint32Array(1))[0]-.5);let open=[],moves=0,matched=0,locked=false,start=Date.now();
    stage().innerHTML=`<div class="memory-toolbar"><label>Tema <select id="memoryTheme">${Object.keys(MEMORY_THEMES).map(k=>`<option value="${k}" ${k===theme?'selected':''}>${k}</option>`).join('')}</select></label><span id="memoryMeta">0 movimentos</span><button id="memoryReset">Embaralhar</button></div><div class="memory-grid" id="memoryGrid"></div>`;
    const grid=root.querySelector('#memoryGrid');cards.forEach(card=>{const b=document.createElement('button');b.className='memory-card';b.textContent='?';b.setAttribute('aria-label','Carta fechada');b.oncontextmenu=e=>e.preventDefault();b.onselectstart=e=>e.preventDefault();b.onclick=()=>{if(locked||b.classList.contains('open')||b.classList.contains('done')||open.length>=2)return;b.classList.add('open');b.textContent=card.label;b.setAttribute('aria-label',card.label);open.push({b,card});if(open.length===2){moves++;root.querySelector('#memoryMeta').textContent=`${moves} movimentos`;if(open[0].card.pair===open[1].card.pair){open.forEach(x=>x.b.classList.add('done'));matched+=2;open=[];if(matched===cards.length){const seconds=Math.floor((Date.now()-start)/1000),score=Math.max(10,300-moves*10-seconds);recordPlay('memory',score);validCompletion('memory',score,{xp:35,credits:6,reason:'Memória Tech concluída'});setKnowledge('Associações entre conceito e finalidade ajudam a formar mapas mentais.')}}else{locked=true;setTimeout(()=>{open.forEach(x=>{x.b.classList.remove('open');x.b.textContent='?';x.b.setAttribute('aria-label','Carta fechada')});open=[];locked=false},700)}}};grid.appendChild(b)});root.querySelector('#memoryReset').onclick=startMemory;root.querySelector('#memoryTheme').onchange=e=>{state.memoryTheme=e.target.value;save();startMemory()};setKnowledge('As respostas só entram no DOM quando a carta é aberta e são ocultadas novamente após erro.');
  }
  function renderGame(){stop();setStatus('Jogue a fase. XP acadêmico só é concedido por conclusão válida.');if(state.game==='snake')startSnake();else if(state.game==='hangman')startHangman();else if(state.game==='trio')startTrio();else if(state.game==='trend')startTrend();else if(state.game==='pac')startPac();else if(state.game==='runner')startRunner();else startMemory();}
  function setGame(id){if(!GAMES[id])return;state.game=id;root.querySelectorAll('[data-game]').forEach(b=>b.classList.toggle('active',b.dataset.game===id));root.querySelector('#arcadeGameTitle').textContent=GAMES[id].name;root.querySelector('#arcadeGameDesc').textContent=GAMES[id].desc;root.querySelector('#arcadeCode').textContent=GAMES[id].code;updateWallet();renderGame();save();}
  function render(){root.innerHTML=`<div class="arcade-shell"><header class="immersive-hero arcade-hero"><div><span class="eyebrow">ARCADE EDUCACIONAL • JOGUE PRIMEIRO</span><h2>Arcade Tech</h2><p>Fases concluíveis, controles de teclado e toque e recompensas separadas entre habilidade e sorte.</p></div><div class="arcade-currency"><span>Créditos <b id="arcadeBits">${state.bits}</b></span><span>Recorde <b id="arcadeBest">0</b></span></div></header><div class="arcade-grid"><nav class="arcade-menu">${Object.entries(GAMES).map(([id,g])=>`<button type="button" data-game="${id}"><span class="game-emoji">${g.emoji}</span><span><strong>${g.name}</strong><small>${g.desc}</small></span></button>`).join('')}</nav><section class="arcade-stage"><header class="arcade-stage-head"><div><span class="eyebrow">JOGO ATUAL</span><h3 id="arcadeGameTitle"></h3><p id="arcadeGameDesc"></p></div><button id="restartGame" class="btn secondary">Reiniciar</button></header><div id="arcadePlayfield" class="arcade-playfield"></div><div class="arcade-info"><div id="arcadeKnowledge" class="knowledge-card"></div><details class="code-reveal"><summary>Como esta mecânica funciona?</summary><pre id="arcadeCode"></pre><p>Trecho simplificado. Use o Ambiente JavaScript para editar programas completos.</p></details></div><div id="arcadeStatus" class="practice-feedback"></div></section></div></div>`;root.querySelectorAll('[data-game]').forEach(b=>b.onclick=()=>setGame(b.dataset.game));root.querySelector('#restartGame').onclick=renderGame;setGame(state.game)}
  async function mount(host,context){root=host;ctx=context;const saved=await ctx.storage.get(KEY,DEFAULT);state={...DEFAULT,...saved,best:{...DEFAULT.best,...saved?.best},plays:{...saved?.plays},wins:{...saved?.wins}};render();}
  async function unmount(){stop();await save();root=null;ctx=null;state=null;}
  function exportPayload(){return{text:['ARCADE TECH',`Créditos locais: ${state.bits}`,...Object.entries(GAMES).map(([id,g])=>`${g.name}: recorde ${state.best[id]||0}, vitórias ${state.wins[id]||0}`)].join('\n'),native:JSON.stringify(state,null,2),backup:state,meta:[{label:'Créditos',value:String(state.bits)}]};}
  function help(){return'<h3>Arcade Tech</h3><p>Use teclado ou controles de toque. XP acadêmico só é concedido quando uma fase baseada em habilidade é concluída. A combinação aleatória concede apenas Créditos Tech.</p>';}
  window.LABDS_LABS['code-games-lab']={mount,unmount,exportPayload,help};
})();
