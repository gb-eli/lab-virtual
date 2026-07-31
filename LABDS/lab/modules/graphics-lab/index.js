'use strict';

(function(){
  window.LABDS_LABS=window.LABDS_LABS||{};
  let root=null,ctx=null,state=null,drawing=false,lastKey=null;
  const STORAGE_KEY='lab.graphics.state';
  const defaults={schemaVersion:1,color:'#38e0bd',alpha:1,width:16,height:16,zoom:22,showGrid:true,tool:'paint',pixels:{},history:[]};
  const undoStack=[],redoStack=[];
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
  const $=selector=>root?.querySelector(selector);

  function hexToRgb(hex){const value=String(hex||'#000000').replace('#','');const n=parseInt(value.length===3?value.split('').map(c=>c+c).join(''):value,16)||0;return{r:(n>>16)&255,g:(n>>8)&255,b:n&255};}
  function rgbToHex(r,g,b){return`#${[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('')}`;}
  function rgbaString(){const {r,g,b}=hexToRgb(state.color);return`rgba(${r}, ${g}, ${b}, ${Number(state.alpha).toFixed(2)})`;}
  function parseColor(value){
    const text=String(value||'');
    if(/^#[0-9a-f]{6}$/i.test(text))return{hex:text.toLowerCase(),alpha:1};
    const match=/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([\d.]+))?\s*\)/i.exec(text);
    return match?{hex:rgbToHex(Number(match[1]),Number(match[2]),Number(match[3])),alpha:clamp(Number(match[4]??1),0,1)}:null;
  }
  function rgbToHsl(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b);let h=0,s=0,l=(max+min)/2,d=max-min;if(d){s=l>.5?d/(2-max-min):d/(max+min);if(max===r)h=(g-b)/d+(g<b?6:0);else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;h/=6;}return{h:Math.round(h*360),s:Math.round(s*100),l:Math.round(l*100)};}
  function rgbToHsv(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;if(d){if(max===r)h=((g-b)/d)%6;else if(max===g)h=(b-r)/d+2;else h=(r-g)/d+4;h=Math.round(h*60);if(h<0)h+=360;}return{h,s:Math.round((max?d/max:0)*100),v:Math.round(max*100)};}
  function rgbToCmyk(r,g,b){r/=255;g/=255;b/=255;const k=1-Math.max(r,g,b);if(k===1)return{c:0,m:0,y:0,k:100};return{c:Math.round((1-r-k)/(1-k)*100),m:Math.round((1-g-k)/(1-k)*100),y:Math.round((1-b-k)/(1-k)*100),k:Math.round(k*100)};}
  function luminance({r,g,b}){const v=[r,g,b].map(x=>{x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4);});return v[0]*.2126+v[1]*.7152+v[2]*.0722;}
  function composite(rgb,alpha,bg){return{r:rgb.r*alpha+bg.r*(1-alpha),g:rgb.g*alpha+bg.g*(1-alpha),b:rgb.b*alpha+bg.b*(1-alpha)};}
  function contrast(a,b){const l1=luminance(a),l2=luminance(b);return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05);}
  function clonePixels(){return JSON.parse(JSON.stringify(state.pixels||{}));}
  function checkpoint(){undoStack.push(clonePixels());if(undoStack.length>60)undoStack.shift();redoStack.length=0;updateUndoButtons();}
  function restorePixels(snapshot){state.pixels=snapshot||{};renderGrid(false);persist();}
  function undo(){if(!undoStack.length)return;redoStack.push(clonePixels());restorePixels(undoStack.pop());updateUndoButtons();ctx.toast('Última alteração desfeita.','success');}
  function redo(){if(!redoStack.length)return;undoStack.push(clonePixels());restorePixels(redoStack.pop());updateUndoButtons();ctx.toast('Alteração refeita.','success');}
  function updateUndoButtons(){const undoBtn=$('#undoPixels'),redoBtn=$('#redoPixels');if(undoBtn)undoBtn.disabled=!undoStack.length;if(redoBtn)redoBtn.disabled=!redoStack.length;}
  function persist(){return ctx?.storage?.set(STORAGE_KEY,state);}

  function setTool(tool){state.tool=['paint','erase','pick'].includes(tool)?tool:'paint';root.querySelectorAll('[name="pixelTool"]').forEach(input=>input.checked=input.value===state.tool);const grid=$('#pixelGrid');if(grid)grid.dataset.tool=state.tool;$('#pixelToolStatus').textContent=state.tool==='paint'?'Pincel':state.tool==='erase'?'Borracha':'Conta-gotas';persist();}

  function renderColorValues(){
    const rgb=hexToRgb(state.color),hsl=rgbToHsl(rgb.r,rgb.g,rgb.b),hsv=rgbToHsv(rgb.r,rgb.g,rgb.b),cmyk=rgbToCmyk(rgb.r,rgb.g,rgb.b),rgba=rgbaString();
    const values=[['HEX',state.color.toUpperCase()],['RGB',`${rgb.r}, ${rgb.g}, ${rgb.b}`],['RGBA',rgba],['HSL',`${hsl.h}°, ${hsl.s}%, ${hsl.l}%`],['HSV',`${hsv.h}°, ${hsv.s}%, ${hsv.v}%`],['CMYK',`${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%`],['CSS',`background-color: ${rgba};`]];
    const host=$('#colorValues');host.textContent='';values.forEach(([label,value])=>{const button=document.createElement('button');button.className='color-value';button.type='button';button.dataset.copy=value;const span=document.createElement('span');span.textContent=label;const strong=document.createElement('b');strong.textContent=value;button.append(span,strong);host.appendChild(button);});
  }

  function renderColorHistory(){const host=$('#colorHistory');host.textContent='';state.history.forEach(value=>{const button=document.createElement('button');button.type='button';button.title=value;button.dataset.historyColor=value;button.style.background=value;button.setAttribute('aria-label',`Usar cor ${value}`);host.appendChild(button);});}

  function renderContrast(){
    const rgb=hexToRgb(state.color),alpha=state.alpha,white={r:255,g:255,b:255},black={r:0,g:0,b:0};
    const onWhite=composite(rgb,alpha,white),onBlack=composite(rgb,alpha,black);
    const combinations=[
      {label:'Texto preto em fundo claro',ratio:contrast(onWhite,black),background:'#fff',color:'#000'},
      {label:'Texto branco em fundo escuro',ratio:contrast(onBlack,white),background:'#06111d',color:'#fff'}
    ];
    const host=$('#contrastInfo');host.textContent='';combinations.forEach(item=>{const card=document.createElement('div');card.style.background=item.background;card.style.color=item.color;card.textContent=`${item.label} — ${item.ratio.toFixed(2)}:1`;host.appendChild(card);});
    const best=Math.max(...combinations.map(item=>item.ratio));const p=document.createElement('p');p.textContent=best>=7?'Contraste excelente para texto comum.':best>=4.5?'Existe uma combinação que atende ao nível AA para texto comum.':best>=3?'Adequado apenas para texto grande em algumas condições.':'Contraste insuficiente. Ajuste a cor ou o alfa.';host.appendChild(p);
  }

  function updateColor({addHistory=true}={}){
    state.color=$('#gfxColor').value;state.alpha=clamp(Number($('#gfxAlpha').value),0,1);
    $('#gfxAlphaOut').textContent=`${Math.round(state.alpha*100)}% · ${state.alpha.toFixed(2)}`;
    $('#colorSample').style.background=rgbaString();
    root.querySelectorAll('[data-alpha-preview]').forEach(el=>el.style.background=rgbaString());
    renderColorValues();renderContrast();
    if(addHistory){const current=rgbaString();state.history=[current,...state.history.filter(item=>item!==current)].slice(0,20);renderColorHistory();}
    persist();
  }

  function renderGrid(save=true){
    state.width=Math.round(clamp(Number($('#pixelWidth').value)||16,2,48));state.height=Math.round(clamp(Number($('#pixelHeight').value)||16,2,48));state.zoom=Math.round(clamp(Number($('#pixelZoom').value)||22,10,42));state.showGrid=$('#pixelShowGrid').checked;
    const valid={};for(const [key,value] of Object.entries(state.pixels||{})){const [x,y]=key.split(',').map(Number);if(Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<state.width&&y<state.height)valid[key]=value;}state.pixels=valid;
    const grid=$('#pixelGrid');grid.style.gridTemplateColumns=`repeat(${state.width},${state.zoom}px)`;grid.style.gridAutoRows=`${state.zoom}px`;grid.classList.toggle('no-grid',!state.showGrid);grid.dataset.tool=state.tool;grid.textContent='';
    for(let y=0;y<state.height;y++)for(let x=0;x<state.width;x++){
      const key=`${x},${y}`,cell=document.createElement('button');cell.type='button';cell.className='pixel-cell';cell.dataset.x=String(x);cell.dataset.y=String(y);cell.style.background=state.pixels[key]||'transparent';cell.title=`X:${x} Y:${y} — ${state.pixels[key]||'transparente'}`;cell.setAttribute('aria-label',cell.title);grid.appendChild(cell);
    }
    $('#imageSize').textContent=`${state.width} × ${state.height} = ${state.width*state.height} pixels`;const raw=state.width*state.height*4;$('#rawSize').textContent=raw<1024?`${raw} bytes`:`${(raw/1024).toFixed(2)} KB`;$('#paintedCount').textContent=`${Object.keys(state.pixels).length} pintado(s)`;if(save)persist();updateUndoButtons();
  }

  function applyCell(cell,force=false){
    if(!cell||!cell.classList.contains('pixel-cell'))return;const key=`${cell.dataset.x},${cell.dataset.y}`;if(key===lastKey&&!force)return;lastKey=key;
    if(state.tool==='pick'){
      const parsed=parseColor(state.pixels[key]);if(parsed){$('#gfxColor').value=parsed.hex;$('#gfxAlpha').value=parsed.alpha;updateColor();ctx.toast(`Cor do pixel ${key} selecionada.`,'success');}else ctx.toast('Este pixel está transparente.','warning');drawing=false;return;
    }
    if(state.tool==='erase')delete state.pixels[key];else state.pixels[key]=rgbaString();
    cell.style.background=state.pixels[key]||'transparent';cell.title=`X:${cell.dataset.x} Y:${cell.dataset.y} — ${state.pixels[key]||'transparente'}`;cell.setAttribute('aria-label',cell.title);$('#paintedCount').textContent=`${Object.keys(state.pixels).length} pintado(s)`;
  }

  function pointerDown(event){const cell=event.target.closest('.pixel-cell');if(!cell)return;event.preventDefault();checkpoint();drawing=true;lastKey=null;cell.setPointerCapture?.(event.pointerId);applyCell(cell,true);}
  function pointerMove(event){if(!drawing)return;const hit=document.elementFromPoint(event.clientX,event.clientY);const cell=hit?.closest?.('.pixel-cell');if(cell&&root.contains(cell))applyCell(cell);}
  function pointerUp(){if(!drawing)return;drawing=false;lastKey=null;persist();updateUndoButtons();}

  function clearPixels(){if(!Object.keys(state.pixels).length)return;checkpoint();state.pixels={};renderGrid();ctx.toast('Todos os pixels foram apagados.','success');}
  function restoreDefault(){if(!confirm('Restaurar cores, grade e desenho para o estado inicial?'))return;checkpoint();state={...defaults,pixels:{},history:[]};undoStack.length=0;redoStack.length=0;mount(root,ctx);}

  function createPngBlob(){return new Promise(resolve=>{const canvas=document.createElement('canvas');canvas.width=state.width;canvas.height=state.height;const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);for(const [key,color] of Object.entries(state.pixels)){const[x,y]=key.split(',').map(Number);c.fillStyle=color;c.fillRect(x,y,1,1);}canvas.toBlob(resolve,'image/png');});}
  async function exportPng(){const blob=await createPngBlob();if(!blob)return;const name=`pixel-art-${Date.now()}.png`;window.LABDS.Exporter.download(blob,name,'image/png');ctx.logEvent({eventType:'graphics_export',action:'Imagem PNG exportada',status:'success',context:{fileName:name,width:state.width,height:state.height,color:state.color,alpha:state.alpha,pixelsPainted:Object.keys(state.pixels).length}});if(Object.keys(state.pixels).length>=4)window.LABDS.Core?.complete?.('graphics:first-valid-export',{xp:35,credits:12,reason:'Arte em pixels exportada com transparência'});ctx.toast('PNG exportado com transparência preservada.','success');}

  function template(){return`<div class="graphics-lab"><section class="graphics-color-panel"><div class="panel-title"><div><h2>Cores, alfa e contraste</h2><p>Compare RGBA em fundos diferentes e copie o código CSS.</p></div><button id="restoreGraphics" class="btn subtle" type="button">Restaurar</button></div><div class="color-controls"><div id="colorSample" class="color-sample checker-surface" aria-label="Amostra da cor"></div><label>Cor<input id="gfxColor" type="color"></label><label class="range-field"><span>Alfa <output id="gfxAlphaOut"></output></span><input id="gfxAlpha" type="range" min="0" max="1" step="0.01"></label></div><div class="alpha-preview-grid"><div class="alpha-preview checker"><i data-alpha-preview></i><span>Transparência</span></div><div class="alpha-preview light"><i data-alpha-preview></i><span>Fundo claro</span></div><div class="alpha-preview dark"><i data-alpha-preview></i><span>Fundo escuro</span></div></div><div id="colorValues" class="color-values"></div><div><h3>Histórico</h3><div id="colorHistory" class="color-history"></div></div><div><h3>Contraste após composição</h3><div id="contrastInfo" class="contrast-info"></div></div></section><section class="graphics-pixel-panel"><div class="panel-title"><div><h2>Editor de pixels</h2><p>Pincel, borracha, conta-gotas, toque, desfazer e refazer.</p></div><div class="graphics-actions"><button id="undoPixels" class="btn secondary" type="button">↶ Desfazer</button><button id="redoPixels" class="btn secondary" type="button">↷ Refazer</button><button id="exportPixelPng" class="btn primary" type="button">Exportar PNG</button></div></div><div class="pixel-toolbar"><label>Largura<input id="pixelWidth" type="number" min="2" max="48"></label><label>Altura<input id="pixelHeight" type="number" min="2" max="48"></label><label>Zoom<input id="pixelZoom" type="range" min="10" max="42"></label><label><input id="pixelShowGrid" type="checkbox"> Grade</label><label class="pixel-tool-button">🖌️ <input type="radio" name="pixelTool" value="paint">Pincel</label><label class="pixel-tool-button">🧽 <input type="radio" name="pixelTool" value="erase">Borracha</label><label class="pixel-tool-button">💧 <input type="radio" name="pixelTool" value="pick">Conta-gotas</label><button id="clearPixels" class="btn secondary" type="button">Limpar tudo</button></div><div class="pixel-stage checker-surface"><div id="pixelGrid" class="pixel-grid"></div></div><div class="pixel-info"><span id="imageSize"></span><span id="pixelToolStatus">Pincel</span><span id="paintedCount"></span><span>Tamanho RGBA: <b id="rawSize"></b></span></div></section></div>`;}

  async function mount(host,context){
    root=host;ctx=context;const saved=await ctx.storage.get(STORAGE_KEY,defaults);state=window.LABDS.Schemas?.sanitizeGraphics?.({...defaults,...saved})||{...defaults,...saved};state.pixels=state.pixels||{};state.history=state.history||[];undoStack.length=0;redoStack.length=0;root.innerHTML=template();
    $('#gfxColor').value=state.color;$('#gfxAlpha').value=state.alpha;$('#pixelWidth').value=state.width;$('#pixelHeight').value=state.height;$('#pixelZoom').value=state.zoom;$('#pixelShowGrid').checked=state.showGrid;setTool(state.tool);
    $('#gfxColor').addEventListener('input',()=>updateColor());$('#gfxAlpha').addEventListener('input',()=>updateColor());
    ['pixelWidth','pixelHeight','pixelZoom','pixelShowGrid'].forEach(id=>$('#'+id).addEventListener('change',()=>{checkpoint();renderGrid();}));
    root.querySelectorAll('[name="pixelTool"]').forEach(input=>input.addEventListener('change',()=>input.checked&&setTool(input.value)));
    const grid=$('#pixelGrid');grid.addEventListener('pointerdown',pointerDown);grid.addEventListener('pointermove',pointerMove);grid.addEventListener('pointerup',pointerUp);grid.addEventListener('pointercancel',pointerUp);grid.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();checkpoint();applyCell(event.target,true);persist();}});
    $('#clearPixels').addEventListener('click',clearPixels);$('#undoPixels').addEventListener('click',undo);$('#redoPixels').addEventListener('click',redo);$('#exportPixelPng').addEventListener('click',exportPng);$('#restoreGraphics').addEventListener('click',restoreDefault);
    $('#colorValues').addEventListener('click',event=>{const button=event.target.closest('[data-copy]');if(!button)return;navigator.clipboard?.writeText(button.dataset.copy).then(()=>ctx.toast('Valor copiado.','success')).catch(()=>ctx.toast('Não foi possível copiar.','warning'));});
    $('#colorHistory').addEventListener('click',event=>{const button=event.target.closest('[data-history-color]');if(!button)return;const parsed=parseColor(button.dataset.historyColor);if(parsed){$('#gfxColor').value=parsed.hex;$('#gfxAlpha').value=parsed.alpha;updateColor({addHistory:false});}});
    updateColor({addHistory:false});renderColorHistory();renderGrid(false);persist();
  }

  function exportPayload(){return{text:['LABORATÓRIO DE COMPUTAÇÃO GRÁFICA',`Cor atual: ${state.color}`,`Alfa: ${state.alpha}`,`RGBA: ${rgbaString()}`,`Grade: ${state.width} × ${state.height}`,`Pixels pintados: ${Object.keys(state.pixels).length}`].join('\n'),native:JSON.stringify(state,null,2),backup:state,meta:[{label:'Cor',value:rgbaString()},{label:'Resolução',value:`${state.width}×${state.height}`}]};}
  function help(){return '<p>O canal alfa varia de 0 (totalmente transparente) a 1 (opaco). O fundo quadriculado revela transparência. A borracha grava pixels transparentes; Desfazer e Refazer preservam até 60 alterações.</p>';}
  async function unmount(){drawing=false;await persist();root=null;ctx=null;state=null;}
  window.LABDS_LABS['graphics-lab']={mount,unmount,exportPayload,help,createPngBlob};
})();
