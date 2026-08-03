'use strict';
(function(){
  window.LABDS_LABS=window.LABDS_LABS||{};

  const STORAGE_KEY='lab.blocks.state';
  const GRID_SIZE=9;
  const catalog=Object.freeze([
    {type:'start',label:'Início',color:'green',group:'estrutura'},
    {type:'end',label:'Fim do programa',color:'red',group:'estrutura'},
    {type:'close',label:'Fechar bloco',color:'gray',group:'estrutura'},
    {type:'set',label:'contador = 0',color:'blue',group:'dados'},
    {type:'input',label:'Entrada: nome',color:'cyan',group:'dados'},
    {type:'output',label:'Saída: Olá, nome',color:'purple',group:'dados'},
    {type:'if',label:'Se contador < 3',color:'yellow',group:'controle'},
    {type:'else',label:'Senão',color:'orange',group:'controle'},
    {type:'repeat',label:'Repetir 3 vezes',color:'pink',group:'controle'},
    {type:'increment',label:'contador = contador + 1',color:'blue',group:'dados'},
    {type:'wait',label:'Esperar 1 segundo',color:'gray',group:'controle'},
    {type:'move',label:'Mover 1 casa',color:'green',group:'visual'},
    {type:'turnRight',label:'Girar 90° à direita',color:'cyan',group:'visual'},
    {type:'turnLeft',label:'Girar 90° à esquerda',color:'cyan',group:'visual'},
    {type:'paint',label:'Trocar cor do robô',color:'purple',group:'visual'},
    {type:'function',label:'Função saudacao()',color:'purple',group:'funcoes'},
    {type:'call',label:'Chamar saudacao()',color:'pink',group:'funcoes'}
  ].map(item=>Object.freeze(item)));
  const byType=new Map(catalog.map(item=>[item.type,item]));
  const defaultTypes=['start','input','set','move','repeat','turnRight','move','increment','close','output','end'];
  const colors=['#62e6ff','#7bf1a8','#ffcb6b','#ff7aa8','#b99cff','#ffffff'];
  let root,ctx,state,resizeObserver,raf=0,runToken=0,running=false,paused=false;
  const $=sel=>root?.querySelector(sel);
  const $$=sel=>[...(root?.querySelectorAll(sel)||[])];
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));

  function normalize(input){
    const safe=window.LABDS.Schemas?.sanitizeBlocks?.(input)||input||{};
    const raw=Array.isArray(safe.blocks)?safe.blocks:[];
    const types=raw.map(item=>typeof item==='string'?item:item?.type).filter(type=>byType.has(type)).slice(0,240);
    return {
      schemaVersion:2,
      blocks:(types.length?types:defaultTypes).map(type=>({type})),
      logs:Array.isArray(input?.logs)?input.logs.slice(-100):[],
      speed:clamp(input?.speed||1,0.5,2),
      studentName:String(input?.studentName||'Aluno').slice(0,40),
      visual:{x:clamp(input?.visual?.x??4,0,GRID_SIZE-1),y:clamp(input?.visual?.y??6,0,GRID_SIZE-1),dir:clamp(input?.visual?.dir??0,0,3),color:String(input?.visual?.color||colors[0]),counter:Number(input?.visual?.counter)||0,message:String(input?.visual?.message||'')}
    };
  }
  function descriptor(block){return byType.get(block?.type)||byType.get('output');}
  function persist(){return ctx?.storage?.set(STORAGE_KEY,state);}
  function makeButton(label,action,title){const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.blockAction=action;if(title)button.title=title;return button;}

  function parseProgram(blocks){
    const rootNode={type:'program',children:[]};
    const stack=[rootNode];
    let current=rootNode.children;
    for(let index=0;index<blocks.length;index++){
      const type=descriptor(blocks[index]).type;
      if(type==='close'){
        if(stack.length>1)stack.pop();
        current=stack.at(-1).activeChildren||stack.at(-1).children;
        continue;
      }
      if(type==='else'){
        const parent=stack.at(-1);
        if(parent?.type==='if'){
          parent.activeChildren=parent.elseChildren;
          current=parent.elseChildren;
        }else current.push({type:'else-orphan',sourceIndex:index});
        continue;
      }
      const node={type,sourceIndex:index,children:[]};
      current.push(node);
      if(['repeat','if','function'].includes(type)){
        if(type==='if')node.elseChildren=[];
        stack.push(node);
        node.activeChildren=node.children;
        current=node.children;
      }
    }
    return rootNode;
  }

  function generate(){
    const pseudo=[],js=[];
    let indent=0;
    for(const block of state.blocks){
      const type=descriptor(block).type,pad='  '.repeat(indent);
      switch(type){
        case'start':pseudo.push('INÍCIO');js.push('// Início');break;
        case'end':while(indent>0){indent--;pseudo.push(`${'  '.repeat(indent)}FIM`);js.push(`${'  '.repeat(indent)}}`);}pseudo.push('FIM DO PROGRAMA');js.push('// Fim');break;
        case'close':if(indent>0){indent--;pseudo.push(`${'  '.repeat(indent)}FIM`);js.push(`${'  '.repeat(indent)}}`);}else{pseudo.push('⚠ FIM sem bloco aberto');js.push('// Fim sem bloco aberto');}break;
        case'set':pseudo.push(`${pad}contador ← 0`);js.push(`${pad}let contador = 0;`);break;
        case'input':pseudo.push(`${pad}LER nome`);js.push(`${pad}const nome = "${state.studentName.replaceAll('"','\\"')}";`);break;
        case'output':pseudo.push(`${pad}ESCREVER "Olá, " + nome`);js.push(`${pad}console.log("Olá, " + nome);`);break;
        case'repeat':pseudo.push(`${pad}REPITA 3 VEZES`);js.push(`${pad}for (let i = 0; i < 3; i++) {`);indent++;break;
        case'increment':pseudo.push(`${pad}contador ← contador + 1`);js.push(`${pad}contador += 1;`);break;
        case'if':pseudo.push(`${pad}SE contador < 3 ENTÃO`);js.push(`${pad}if (contador < 3) {`);indent++;break;
        case'else':if(indent>0)indent--;pseudo.push(`${'  '.repeat(indent)}SENÃO`);js.push(`${'  '.repeat(indent)}} else {`);indent++;break;
        case'wait':pseudo.push(`${pad}ESPERAR 1 SEGUNDO`);js.push(`${pad}await new Promise(r => setTimeout(r, 1000));`);break;
        case'move':pseudo.push(`${pad}MOVER 1 CASA`);js.push(`${pad}robo.mover(1);`);break;
        case'turnRight':pseudo.push(`${pad}GIRAR 90° À DIREITA`);js.push(`${pad}robo.girarDireita();`);break;
        case'turnLeft':pseudo.push(`${pad}GIRAR 90° À ESQUERDA`);js.push(`${pad}robo.girarEsquerda();`);break;
        case'paint':pseudo.push(`${pad}TROCAR COR DO ROBÔ`);js.push(`${pad}robo.proximaCor();`);break;
        case'function':pseudo.push(`${pad}FUNÇÃO saudacao()`);js.push(`${pad}function saudacao() {`);indent++;break;
        case'call':pseudo.push(`${pad}CHAMAR saudacao()`);js.push(`${pad}saudacao();`);break;
      }
    }
    while(indent>0){indent--;pseudo.push(`${'  '.repeat(indent)}FIM`);js.push(`${'  '.repeat(indent)}}`);}
    $('#pseudoOutput').textContent=pseudo.join('\n');
    $('#blockCodeOutput').textContent=js.join('\n');
  }

  function previewRoute(){
    const sim={x:4,y:6,dir:0,color:colors[0],counter:0,name:state.studentName,message:'',path:[{x:4,y:6,dir:0}],steps:[]};
    const tree=parseProgram(state.blocks);
    const exec=(nodes,depth=0)=>{
      if(depth>12||sim.steps.length>160)return;
      for(const node of nodes){
        if(sim.steps.length>160)break;
        const step=()=>sim.steps.push({sourceIndex:node.sourceIndex,x:sim.x,y:sim.y,dir:sim.dir,color:sim.color,message:sim.message,counter:sim.counter});
        switch(node.type){
          case'set':sim.counter=0;step();break;
          case'input':sim.name=state.studentName;step();break;
          case'output':sim.message=`Olá, ${sim.name}`;step();break;
          case'increment':sim.counter++;step();break;
          case'turnRight':sim.dir=(sim.dir+1)%4;step();break;
          case'turnLeft':sim.dir=(sim.dir+3)%4;step();break;
          case'paint':sim.color=colors[(colors.indexOf(sim.color)+1)%colors.length];step();break;
          case'move':{
            const dirs=[[0,-1],[1,0],[0,1],[-1,0]],d=dirs[sim.dir];
            sim.x=clamp(sim.x+d[0],0,GRID_SIZE-1);sim.y=clamp(sim.y+d[1],0,GRID_SIZE-1);
            sim.path.push({x:sim.x,y:sim.y,dir:sim.dir});step();break;
          }
          case'repeat':for(let i=0;i<3;i++)exec(node.children,depth+1);break;
          case'if':exec(sim.counter<3?node.children:node.elseChildren,depth+1);break;
          case'function':break;
          case'call':{
            const fn=tree.children.find(item=>item.type==='function');if(fn)exec(fn.children,depth+1);break;
          }
          default:step();
        }
      }
    };
    exec(tree.children);
    return sim;
  }

  function drawScene(route=previewRoute(),runtime=state.visual){
    const canvas=$('#blocksVisualCanvas');if(!canvas)return;
    const rect=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);
    const width=Math.max(320,Math.floor(rect.width)),height=Math.max(300,Math.floor(rect.height));
    if(canvas.width!==Math.floor(width*dpr)||canvas.height!==Math.floor(height*dpr)){canvas.width=Math.floor(width*dpr);canvas.height=Math.floor(height*dpr);}
    const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,width,height);
    const bg=c.createLinearGradient(0,0,width,height);bg.addColorStop(0,'#071421');bg.addColorStop(1,'#11182c');c.fillStyle=bg;c.fillRect(0,0,width,height);
    const pad=26,side=Math.min((width-pad*2)/GRID_SIZE,(height-pad*2-44)/GRID_SIZE),board=side*GRID_SIZE,ox=(width-board)/2,oy=26;
    c.fillStyle='rgba(255,255,255,.025)';c.fillRect(ox,oy,board,board);
    c.strokeStyle='rgba(110,190,230,.16)';c.lineWidth=1;
    for(let i=0;i<=GRID_SIZE;i++){c.beginPath();c.moveTo(ox+i*side,oy);c.lineTo(ox+i*side,oy+board);c.stroke();c.beginPath();c.moveTo(ox,oy+i*side);c.lineTo(ox+board,oy+i*side);c.stroke();}
    if(route.path.length>1){c.strokeStyle='rgba(98,230,255,.55)';c.lineWidth=Math.max(2,side*.08);c.setLineDash([side*.18,side*.16]);c.beginPath();route.path.forEach((p,i)=>{const x=ox+(p.x+.5)*side,y=oy+(p.y+.5)*side;if(i)c.lineTo(x,y);else c.moveTo(x,y);});c.stroke();c.setLineDash([]);}
    route.path.forEach((p,i)=>{const x=ox+(p.x+.5)*side,y=oy+(p.y+.5)*side;c.beginPath();c.arc(x,y,Math.max(2,side*.055),0,Math.PI*2);c.fillStyle=i===route.path.length-1?'#ffcb6b':'#62e6ff';c.fill();});
    const r=runtime||route,rx=ox+(r.x+.5)*side,ry=oy+(r.y+.5)*side,angle=[-Math.PI/2,0,Math.PI/2,Math.PI][r.dir]||0;
    c.save();c.translate(rx,ry);c.rotate(angle);c.shadowColor=r.color||route.color;c.shadowBlur=18;c.fillStyle=r.color||route.color;c.strokeStyle='#07111f';c.lineWidth=2;c.beginPath();c.moveTo(side*.28,0);c.lineTo(-side*.2,-side*.22);c.lineTo(-side*.1,0);c.lineTo(-side*.2,side*.22);c.closePath();c.fill();c.stroke();c.restore();
    c.shadowBlur=0;c.fillStyle='#dceefa';c.font='700 13px system-ui';c.fillText(`Posição: (${r.x}, ${r.y}) • direção ${['N','L','S','O'][r.dir]}`,ox,oy+board+24);
    c.fillStyle='#91abc0';c.font='12px system-ui';c.fillText(`Caminho previsto: ${Math.max(0,route.path.length-1)} movimento(s)`,ox,oy+board+42);
    const message=runtime?.message||route.message;if(message){const text=String(message).slice(0,34),bubbleW=Math.min(width-30,Math.max(140,c.measureText(text).width+30)),bx=Math.min(width-bubbleW-12,Math.max(12,rx-bubbleW/2)),by=Math.max(8,ry-side*.9);c.fillStyle='rgba(6,16,29,.92)';c.strokeStyle='rgba(98,230,255,.55)';c.lineWidth=1;c.beginPath();c.roundRect(bx,by,bubbleW,36,10);c.fill();c.stroke();c.fillStyle='#effaff';c.font='600 12px system-ui';c.fillText(text,bx+15,by+23);}
  }

  function updateVisualMetrics(step=0,total=0){
    $('#blocksVarName').textContent=state.studentName||'Aluno';
    $('#blocksVarCounter').textContent=String(state.visual.counter||0);
    $('#blocksVarPosition').textContent=`${state.visual.x}, ${state.visual.y}`;
    $('#blocksVarStep').textContent=total?`${step}/${total}`:'prévia';
    $('#blocksRunState').textContent=running?(paused?'Pausado':'Executando'):'Pronto';
  }

  function render(){
    const flow=$('#blockFlow');flow.textContent='';
    state.blocks.forEach((block,index)=>{
      const info=descriptor(block),item=document.createElement('article');
      item.className=`logic-block ${info.color}`;item.draggable=true;item.dataset.index=String(index);item.tabIndex=0;item.setAttribute('aria-label',`Bloco ${index+1}: ${info.label}`);
      const number=document.createElement('span');number.textContent=String(index+1);
      const label=document.createElement('strong');label.textContent=info.label;
      const actions=document.createElement('div');actions.append(makeButton('↑','up','Mover para cima'),makeButton('↓','down','Mover para baixo'),makeButton('×','remove','Remover bloco'));
      item.append(number,label,actions);flow.appendChild(item);
    });
    generate();drawScene();updateVisualMetrics();persist();
  }

  function move(index,delta){const target=index+delta;if(target<0||target>=state.blocks.length)return;[state.blocks[index],state.blocks[target]]=[state.blocks[target],state.blocks[index]];render();$('#blockFlow').children[target]?.focus();}
  function remove(index){state.blocks.splice(index,1);render();}
  function stopRun(message='Execução interrompida.'){
    runToken++;running=false;paused=false;$$('.logic-block').forEach(item=>item.classList.remove('is-running','is-complete'));$('#blockConsole').textContent=message;updateVisualMetrics();
  }
  async function waitWhilePaused(token){while(paused&&token===runToken)await sleep(80);}

  async function run(){
    if(running){paused=!paused;$('#runBlocks').textContent=paused?'Continuar':'Pausar';updateVisualMetrics();return;}
    const token=++runToken;running=true;paused=false;$('#runBlocks').textContent='Pausar';$('#stopBlocks').disabled=false;
    const route=previewRoute(),steps=route.steps;state.visual={x:4,y:6,dir:0,color:colors[0],counter:0,message:''};state.logs=[];drawScene(route,state.visual);updateVisualMetrics(0,steps.length);
    const started=performance.now(),delay=()=>Math.round(650/state.speed);
    for(let i=0;i<steps.length&&token===runToken;i++){
      await waitWhilePaused(token);if(token!==runToken)break;
      const step=steps[i],card=$(`.logic-block[data-index="${step.sourceIndex}"]`);$$('.logic-block').forEach(item=>item.classList.remove('is-running'));card?.classList.add('is-running');card?.scrollIntoView({block:'nearest',behavior:'smooth'});
      state.visual={x:step.x,y:step.y,dir:step.dir,color:step.color,counter:step.counter,message:step.message||''};
      const label=descriptor(state.blocks[step.sourceIndex])?.label||'Etapa';state.logs.push(`${String(i+1).padStart(2,'0')} • ${label}`);$('#blockConsole').textContent=state.logs.join('\n');drawScene(route,state.visual);updateVisualMetrics(i+1,steps.length);await sleep(delay());card?.classList.remove('is-running');card?.classList.add('is-complete');
    }
    if(token!==runToken)return;
    running=false;paused=false;$('#runBlocks').textContent='Executar visualmente';$('#stopBlocks').disabled=true;updateVisualMetrics(steps.length,steps.length);
    const output=state.visual.message||`Fluxo concluído em ${steps.length} etapa(s).`;state.logs.push(output);$('#blockConsole').textContent=state.logs.join('\n');
    ctx.logEvent({eventType:'code_execution',action:'Fluxo em blocos executado visualmente',input:$('#pseudoOutput').textContent,output:state.logs.join('\n'),status:'success',context:{language:'Programação visual',blocks:state.blocks.map(item=>item.type),durationMs:Math.round(performance.now()-started),visualPath:route.path.length-1,sanitized:true}});
    ctx.core?.complete?.('blocks:visual-flow-v2',{complexity:'medium',actions:Math.max(4,steps.length),reason:'Algoritmo em blocos executado com visualização 2D'});persist();
  }

  async function mount(host,context){
    root=host;ctx=context;state=normalize(await ctx.storage.get(STORAGE_KEY,{blocks:defaultTypes.map(type=>({type}))}));
    root.innerHTML=`<div class="blocks-lab-v2"><header class="blocks-hero"><div><span class="eyebrow">PROGRAMAÇÃO VISUAL • ALGORITMOS E EXECUÇÃO 2D</span><h2>Programação em Blocos</h2><p>Monte o algoritmo, veja o caminho previsto mudar imediatamente e execute cada bloco passo a passo em uma cena 2D.</p></div><div class="blocks-run-controls"><label>Nome de entrada<input id="blocksStudentName" maxlength="40" value="${state.studentName.replaceAll('&','&amp;').replaceAll('"','&quot;')}"></label><label>Velocidade<input id="blocksSpeed" type="range" min="0.5" max="2" step="0.25" value="${state.speed}"></label><button id="runBlocks" class="btn primary" type="button">Executar visualmente</button><button id="stopBlocks" class="btn secondary" type="button" disabled>Parar</button></div></header><div class="blocks-workspace-v2"><aside class="blocks-palette"><div class="panel-title"><div><h2>Blocos permitidos</h2><p>Clique para adicionar. Os blocos visuais alteram o robô e o caminho em tempo real.</p></div></div><div id="blockPaletteList"></div></aside><main class="blocks-canvas"><div class="panel-toolbar"><strong>Fluxo do programa</strong><div class="button-row"><button id="clearBlocks" class="btn secondary" type="button">Limpar</button><button id="restoreBlocks" class="btn subtle" type="button">Restaurar exemplo</button></div></div><div id="blockFlow" class="block-flow" aria-label="Fluxo de blocos"></div></main><section class="blocks-visual-panel"><div class="blocks-visual-head"><div><span>SIMULAÇÃO AO VIVO</span><strong id="blocksRunState">Pronto</strong></div><small>Arraste para reorganizar; a rota pontilhada é recalculada automaticamente.</small></div><canvas id="blocksVisualCanvas" aria-label="Cena 2D do algoritmo em blocos"></canvas><div class="blocks-variable-grid"><article><span>nome</span><b id="blocksVarName"></b></article><article><span>contador</span><b id="blocksVarCounter"></b></article><article><span>posição</span><b id="blocksVarPosition"></b></article><article><span>etapa</span><b id="blocksVarStep"></b></article></div></section></div><div class="blocks-output-grid blocks-output-v2"><section><h3>Pseudocódigo</h3><pre id="pseudoOutput"></pre></section><section><h3>JavaScript equivalente</h3><pre id="blockCodeOutput"></pre></section><section><h3>Execução</h3><pre id="blockConsole">Clique em Executar visualmente.</pre></section></div></div>`;
    const palette=$('#blockPaletteList'),groups={estrutura:'Estrutura',dados:'Dados',controle:'Controle',visual:'Movimento 2D',funcoes:'Funções'};
    Object.entries(groups).forEach(([group,title])=>{const section=document.createElement('section');section.className='palette-group';section.innerHTML=`<h3>${title}</h3>`;catalog.filter(item=>item.group===group).forEach(item=>{const button=document.createElement('button');button.type='button';button.className=`palette-block ${item.color}`;button.dataset.addType=item.type;button.textContent=item.label;section.appendChild(button);});palette.appendChild(section);});
    palette.addEventListener('click',event=>{const button=event.target.closest('[data-add-type]');if(!button||running)return;state.blocks.push({type:button.dataset.addType});render();});
    $('#blockFlow').addEventListener('click',event=>{if(running)return;const item=event.target.closest('.logic-block');if(!item)return;const index=Number(item.dataset.index),action=event.target.closest('[data-block-action]')?.dataset.blockAction;if(action==='remove')remove(index);else if(action==='up')move(index,-1);else if(action==='down')move(index,1);});
    $('#blockFlow').addEventListener('keydown',event=>{if(running)return;const item=event.target.closest('.logic-block');if(!item)return;const index=Number(item.dataset.index);if(event.altKey&&event.key==='ArrowUp'){event.preventDefault();move(index,-1);}else if(event.altKey&&event.key==='ArrowDown'){event.preventDefault();move(index,1);}else if(event.key==='Delete'){event.preventDefault();remove(index);}});
    $('#blockFlow').addEventListener('dragstart',event=>{if(running){event.preventDefault();return;}const item=event.target.closest('.logic-block');if(item)event.dataTransfer.setData('text/plain',item.dataset.index);});
    $('#blockFlow').addEventListener('dragover',event=>event.preventDefault());
    $('#blockFlow').addEventListener('drop',event=>{event.preventDefault();if(running)return;const from=Number(event.dataTransfer.getData('text/plain')),target=event.target.closest('.logic-block');if(!Number.isInteger(from)||!target)return;const to=Number(target.dataset.index);if(from<0||from>=state.blocks.length||to<0||to>=state.blocks.length)return;const[moved]=state.blocks.splice(from,1);state.blocks.splice(to,0,moved);render();});
    $('#runBlocks').addEventListener('click',run);$('#stopBlocks').addEventListener('click',()=>{stopRun();$('#runBlocks').textContent='Executar visualmente';$('#stopBlocks').disabled=true;drawScene();});
    $('#clearBlocks').addEventListener('click',()=>{if(running)return;state.blocks=[];render();});$('#restoreBlocks').addEventListener('click',()=>{if(running)return;state.blocks=defaultTypes.map(type=>({type}));state.visual={x:4,y:6,dir:0,color:colors[0],counter:0,message:''};render();});
    $('#blocksStudentName').addEventListener('input',event=>{state.studentName=String(event.target.value||'Aluno').slice(0,40);generate();drawScene();updateVisualMetrics();persist();});
    $('#blocksSpeed').addEventListener('input',event=>{state.speed=clamp(event.target.value,.5,2);persist();});
    resizeObserver=new ResizeObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>drawScene());});resizeObserver.observe($('#blocksVisualCanvas'));render();
  }

  function exportPayload(){const safe={schemaVersion:2,blocks:state.blocks.map(item=>({type:descriptor(item).type})),studentName:state.studentName,speed:state.speed};return{text:['PROGRAMAÇÃO EM BLOCOS','',$('#pseudoOutput').textContent,'','===== JAVASCRIPT =====',$('#blockCodeOutput').textContent,'','===== EXECUÇÃO =====',$('#blockConsole').textContent].join('\n'),native:JSON.stringify(safe,null,2),backup:safe,meta:[{label:'Blocos',value:String(safe.blocks.length)},{label:'Visualização',value:'Cena 2D ao vivo'},{label:'Importação',value:'allowlist por tipo'}]};}
  function help(){return'<p>Adicione blocos de movimento para alterar o robô e a rota 2D. A prévia pontilhada muda imediatamente quando o fluxo é reorganizado. Use Fechar bloco para encerrar Repetir, Se ou Função. Alt+↑ e Alt+↓ reorganizam pelo teclado.</p>';}
  async function unmount(){runToken++;running=false;paused=false;cancelAnimationFrame(raf);resizeObserver?.disconnect();await persist();root=null;ctx=null;state=null;}
  window.LABDS_LABS['blocks-lab']={mount,unmount,exportPayload,help};
})();
