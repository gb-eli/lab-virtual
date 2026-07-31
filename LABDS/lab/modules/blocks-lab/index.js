'use strict';

(function(){
  window.LABDS_LABS=window.LABDS_LABS||{};
  let root=null,ctx=null,state=null;
  const STORAGE_KEY='lab.blocks.state';
  const catalog=Object.freeze([
    {type:'start',label:'Início',color:'green'},
    {type:'set',label:'Variável: contador = 0',color:'blue'},
    {type:'input',label:'Entrada: nome',color:'cyan'},
    {type:'output',label:'Saída: Olá, nome',color:'purple'},
    {type:'if',label:'Se contador < 3',color:'yellow'},
    {type:'else',label:'Senão',color:'orange'},
    {type:'repeat',label:'Repetir 3 vezes',color:'pink'},
    {type:'increment',label:'contador = contador + 1',color:'blue'},
    {type:'wait',label:'Esperar 1 segundo',color:'gray'},
    {type:'function',label:'Função saudacao()',color:'purple'},
    {type:'end',label:'Fim',color:'red'}
  ].map(item=>Object.freeze(item)));
  const byType=new Map(catalog.map(item=>[item.type,item]));
  const defaultTypes=['start','input','output','repeat','increment','end'];
  const $=sel=>root?.querySelector(sel);

  function normalize(input){
    const safe=window.LABDS.Schemas?.sanitizeBlocks?.(input)||{blocks:[]};
    const types=safe.blocks.map(item=>item.type).filter(type=>byType.has(type)).slice(0,200);
    return {schemaVersion:1,blocks:types.map(type=>({type})),logs:[]};
  }
  function descriptor(block){return byType.get(block?.type)||byType.get('output');}
  function persist(){return ctx?.storage?.set(STORAGE_KEY,state);}

  function makeButton(label,action,title){const button=document.createElement('button');button.type='button';button.textContent=label;button.dataset.blockAction=action;if(title)button.title=title;return button;}

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
    generate();persist();
  }

  function generate(){
    let indent=0;const pseudo=[],js=[];
    state.blocks.forEach(block=>{
      const pad='  '.repeat(indent),type=descriptor(block).type;
      switch(type){
        case'start':pseudo.push('INÍCIO');js.push('// Início');break;
        case'end':pseudo.push('FIM');js.push('// Fim');break;
        case'set':pseudo.push(`${pad}contador ← 0`);js.push(`${pad}let contador = 0;`);break;
        case'input':pseudo.push(`${pad}LER nome`);js.push(`${pad}const nome = prompt("Digite seu nome:");`);break;
        case'output':pseudo.push(`${pad}ESCREVER "Olá, " + nome`);js.push(`${pad}console.log("Olá, " + nome);`);break;
        case'repeat':pseudo.push(`${pad}REPITA 3 VEZES`);js.push(`${pad}for (let i = 0; i < 3; i++) {`);indent++;break;
        case'increment':pseudo.push(`${pad}contador ← contador + 1`);js.push(`${pad}contador += 1;`);break;
        case'if':pseudo.push(`${pad}SE contador < 3 ENTÃO`);js.push(`${pad}if (contador < 3) {`);indent++;break;
        case'else':indent=Math.max(0,indent-1);pseudo.push(`${'  '.repeat(indent)}SENÃO`);js.push(`${'  '.repeat(indent)}} else {`);indent++;break;
        case'wait':pseudo.push(`${pad}ESPERAR 1 SEGUNDO`);js.push(`${pad}await new Promise(r => setTimeout(r, 1000));`);break;
        case'function':pseudo.push(`${pad}FUNÇÃO saudacao()`);js.push(`${pad}function saudacao() {`);indent++;break;
      }
    });
    while(indent>0){indent--;pseudo.push(`${'  '.repeat(indent)}FIM`);js.push(`${'  '.repeat(indent)}}`);}
    $('#pseudoOutput').textContent=pseudo.join('\n');$('#blockCodeOutput').textContent=js.join('\n');
  }

  function move(index,delta){const target=index+delta;if(target<0||target>=state.blocks.length)return;[state.blocks[index],state.blocks[target]]=[state.blocks[target],state.blocks[index]];render();$('#blockFlow').children[target]?.focus();}
  function remove(index){state.blocks.splice(index,1);render();}

  function run(){
    const logs=[];let counter=0,name='Aluno',iterations=1;
    const started=performance.now();
    for(const block of state.blocks){
      const type=descriptor(block).type;
      if(type==='input'){const raw=prompt('Digite um nome fictício:');name=String(raw||'Aluno').slice(0,40);}
      if(type==='set')counter=0;
      if(type==='output')logs.push(`Olá, ${name}`);
      if(type==='increment')counter++;
      if(type==='repeat'){iterations=3;logs.push('Repetição configurada para 3 ciclos.');}
      if(type==='if')logs.push(`Condição contador < 3: ${counter<3?'verdadeira':'falsa'}`);
      if(type==='wait')logs.push('Espera simulada de 1 segundo.');
      if(type==='function')logs.push('Função saudacao() declarada.');
    }
    if(iterations>1)logs.push(`Fluxo analisado com repetição de ${iterations} ciclos.`);
    state.logs=logs.slice(-100);$('#blockConsole').textContent=state.logs.join('\n')||'Fluxo executado sem saída.';
    ctx.logEvent({eventType:'code_execution',action:'Fluxo em blocos executado',input:$('#pseudoOutput').textContent,output:state.logs.join('\n')||'Fluxo executado sem saída.',status:'success',context:{language:'Programação visual',blocks:state.blocks.map(item=>item.type),durationMs:Math.round(performance.now()-started),sanitized:true}});
  }

  async function mount(host,context){
    root=host;ctx=context;state=normalize(await ctx.storage.get(STORAGE_KEY,{blocks:defaultTypes.map(type=>({type}))}));
    if(!state.blocks.length)state.blocks=defaultTypes.map(type=>({type}));
    root.innerHTML='<div class="blocks-layout"><aside class="blocks-palette"><div class="panel-title"><div><h2>Blocos permitidos</h2><p>Clique ou use o teclado. Blocos importados são reconstruídos pelo tipo seguro.</p></div></div><div id="blockPaletteList"></div></aside><main class="blocks-canvas"><div class="panel-toolbar"><strong>Fluxo do programa</strong><div class="button-row"><button id="runBlocks" class="btn primary" type="button">Executar</button><button id="clearBlocks" class="btn secondary" type="button">Limpar</button><button id="restoreBlocks" class="btn subtle" type="button">Restaurar</button></div></div><div id="blockFlow" class="block-flow" aria-label="Fluxo de blocos"></div><div class="blocks-output-grid"><section><h3>Pseudocódigo</h3><pre id="pseudoOutput"></pre></section><section><h3>JavaScript equivalente</h3><pre id="blockCodeOutput"></pre></section><section><h3>Execução</h3><pre id="blockConsole"></pre></section></div></main></div>';
    const palette=$('#blockPaletteList');catalog.forEach(item=>{const button=document.createElement('button');button.type='button';button.className=`palette-block ${item.color}`;button.dataset.addType=item.type;button.textContent=item.label;palette.appendChild(button);});
    palette.addEventListener('click',event=>{const button=event.target.closest('[data-add-type]');if(!button)return;state.blocks.push({type:button.dataset.addType});render();});
    $('#blockFlow').addEventListener('click',event=>{const item=event.target.closest('.logic-block');if(!item)return;const index=Number(item.dataset.index),action=event.target.closest('[data-block-action]')?.dataset.blockAction;if(action==='remove')remove(index);else if(action==='up')move(index,-1);else if(action==='down')move(index,1);});
    $('#blockFlow').addEventListener('keydown',event=>{const item=event.target.closest('.logic-block');if(!item)return;const index=Number(item.dataset.index);if(event.altKey&&event.key==='ArrowUp'){event.preventDefault();move(index,-1);}else if(event.altKey&&event.key==='ArrowDown'){event.preventDefault();move(index,1);}else if(event.key==='Delete'){event.preventDefault();remove(index);}});
    $('#blockFlow').addEventListener('dragstart',event=>{const item=event.target.closest('.logic-block');if(item)event.dataTransfer.setData('text/plain',item.dataset.index);});
    $('#blockFlow').addEventListener('dragover',event=>event.preventDefault());
    $('#blockFlow').addEventListener('drop',event=>{event.preventDefault();const from=Number(event.dataTransfer.getData('text/plain')),target=event.target.closest('.logic-block');if(!Number.isInteger(from)||!target)return;const to=Number(target.dataset.index);if(from<0||from>=state.blocks.length||to<0||to>=state.blocks.length)return;const [moved]=state.blocks.splice(from,1);state.blocks.splice(to,0,moved);render();});
    $('#runBlocks').addEventListener('click',run);$('#clearBlocks').addEventListener('click',()=>{state.blocks=[];render();});$('#restoreBlocks').addEventListener('click',()=>{state.blocks=defaultTypes.map(type=>({type}));render();});render();
  }

  function exportPayload(){const safe={schemaVersion:1,blocks:state.blocks.map(item=>({type:descriptor(item).type}))};return{text:['PROGRAMAÇÃO EM BLOCOS','',$('#pseudoOutput').textContent,'','===== JAVASCRIPT =====',$('#blockCodeOutput').textContent].join('\n'),native:JSON.stringify(safe,null,2),backup:safe,meta:[{label:'Blocos',value:String(safe.blocks.length)},{label:'Importação',value:'allowlist por tipo'}]};}
  function help(){return '<p>Os blocos são reconstruídos por uma lista interna permitida. Rótulo, cor, HTML e eventos vindos de backup são ignorados. Use Alt+↑ e Alt+↓ para reorganizar pelo teclado.</p>';}
  async function unmount(){await persist();root=null;ctx=null;state=null;}
  window.LABDS_LABS['blocks-lab']={mount,unmount,exportPayload,help};
})();
