import { startGame } from './game.js';
import { saveWorld, loadWorld, hasSave, clearWorld, saveSettings, loadSettings } from './storage.js';

const $ = id => document.getElementById(id);
const EMBEDDED = new URLSearchParams(location.search).get('embed') === '1';
const ITEM_DEFAULTS = [
  { name:'HTML', color:'#f06529', count:20 },
  { name:'CSS', color:'#2965f1', count:20 },
  { name:'JavaScript', color:'#f0db4f', count:20 },
  { name:'Madeira', color:'#8b5a2b', count:0 },
  { name:'Pedra', color:'#777f85', count:0 },
  { name:'Maçã', color:'#d83b3b', count:3 }
];
const ITEMS = ITEM_DEFAULTS.map(item => ({...item}));
const MODE_LABELS = { learning:'APRENDIZAGEM', free:'LIVRE', challenge:'DESAFIO' };
const state = { engine:null, selected:0, saveTimer:null, launching:false, lastProgress:null, lastError:null };

function postParent(type, detail={}) {
  if (!EMBEDDED || window.parent === window) return;
  window.parent.postMessage({ source:'voxelcraft-ds', type, detail }, location.origin);
}

function setText(id, text) { const element=$(id); if (element) element.textContent=String(text ?? ''); }
function clamp(value,min,max){return Math.min(max,Math.max(min,Number(value)||0));}

function currentSettings() {
  return {
    quality:$('quality').value,
    mode:$('gameMode').value,
    fov:Number($('fov').value),
    sensitivity:Number($('sensitivity').value),
    learning:$('learning').checked
  };
}

function applySettings(settings) {
  $('quality').value=settings.quality;
  $('gameMode').value=settings.mode;
  $('fov').value=String(settings.fov);
  $('sensitivity').value=String(settings.sensitivity);
  $('learning').checked=settings.learning;
  setText('fovValue', `${settings.fov}°`);
  setText('sensitivityValue', `${settings.sensitivity}%`);
}

function persistSettings(){ saveSettings(currentSettings()); }

function resolvedQuality() {
  const selected=$('quality').value;
  if(selected!=='auto') return selected;
  const cores=navigator.hardwareConcurrency||4;
  const memory=navigator.deviceMemory||4;
  const coarse=matchMedia('(pointer:coarse)').matches;
  if(cores<=2||memory<=2) return 'economy';
  if(coarse||cores<=4||memory<=4) return 'medium';
  if(cores>=8&&memory>=8) return 'ultra';
  return 'high';
}

function resetItems(){ITEM_DEFAULTS.forEach((item,index)=>{ITEMS[index]={...item};});state.selected=0;}
function restoreItems(savedItems){
  resetItems();
  if(!Array.isArray(savedItems)) return;
  for(const saved of savedItems){
    const item=ITEMS.find(entry=>entry.name===saved.name);
    if(item) item.count=Math.round(clamp(saved.count,0,999));
  }
}

function makeItemMarker(item){const marker=document.createElement('i');marker.style.backgroundColor=item.color;return marker;}
function renderHotbar(){
  const bar=$('hotbar');bar.replaceChildren();
  ITEMS.forEach((item,index)=>{
    const button=document.createElement('button');button.type='button';button.className=`slot${state.selected===index?' active':''}`;button.title=`${index+1}: ${item.name}`;
    const small=document.createElement('small');small.textContent=item.name;
    const count=document.createElement('b');count.textContent=String(item.count);
    button.append(makeItemMarker(item),small,count);
    button.addEventListener('click',()=>{state.selected=index;renderHotbar();state.engine?.setSelected?.(item);});
    bar.appendChild(button);
  });
}

function renderInventory(){
  const grid=$('inventoryGrid');grid.replaceChildren();
  ITEMS.forEach((item,index)=>{
    const card=document.createElement('article');card.className='item-card';
    const title=document.createElement('strong');title.textContent=item.name;
    const count=document.createElement('p');count.textContent=String(item.count);
    const button=document.createElement('button');button.type='button';button.textContent='Selecionar';
    button.addEventListener('click',()=>{state.selected=index;renderHotbar();state.engine?.setSelected?.(ITEMS[state.selected]);closeModal('inventoryModal');});
    card.append(title,count,button);grid.appendChild(card);
  });
}

function addItem(name,count=1){
  const item=ITEMS.find(value=>value.name===name);
  if(item)item.count=Math.round(clamp(item.count+count,0,999));
  renderHotbar();renderInventory();
  setText('prompt',`+${count} ${name}`);
  setTimeout(()=>{if($('prompt').textContent.startsWith('+'))setText('prompt','');},1500);
}

function openModal(id){
  const element=$(id);if(!element)return;element.classList.remove('hidden');
  if(element.classList.contains('modal'))state.engine?.setPaused?.(true);
}
function closeModal(id){
  const element=$(id);if(!element)return;element.classList.add('hidden');
  if(element.classList.contains('modal')){
    const any=[...document.querySelectorAll('.modal')].some(modal=>!modal.classList.contains('hidden')&&modal.id!=='loadingModal');
    if(!any)state.engine?.setPaused?.(false);
  }
}

function showLoading(title='Preparando o mundo...',text='Carregando renderizador 3D e criando os primeiros chunks.'){
  setText('loadingTitle',title);setText('loadingText',text);$('loadingModal').classList.remove('hidden');
}
function hideLoading(){$('loadingModal').classList.add('hidden');}
function showError(error){
  state.lastError=error;hideLoading();setText('errorText',error?.message||'Erro desconhecido.');$('errorModal').classList.remove('hidden');
  postParent('error',{message:error?.message||String(error)});
}

async function updateSaveSummary(){
  try{
    const saved=await loadWorld();
    $('continueBtn').disabled=!saved;$('clearSaveBtn').disabled=!saved;
    if(!saved){setText('saveSummary','Nenhum mundo salvo neste dispositivo.');return;}
    const date=new Date(saved.savedAt||Date.now()).toLocaleString('pt-BR');
    setText('saveSummary',`Mundo salvo em ${date} • ${saved.stats?.xp||0} XP • ${saved.edits?.length||0} alterações.`);
  }catch{setText('saveSummary','Não foi possível consultar o armazenamento local.');}
}

function updateProgress(data={}){
  state.lastProgress=data;
  const progress=clamp(data.progress,0,100);
  $('missionBar').style.width=`${progress}%`;setText('missionText',`${Math.round(progress)}%`);
  setText('missionTitle',data.title||'Exploração do mundo');
  if(data.lesson)setText('lesson',data.lesson);
  if(data.code)setText('codeExplain',data.code);
  if(Number.isFinite(data.xp))setText('xpLabel',`${Math.round(data.xp)} XP`);
  postParent('progress',{...data,progress});
}

async function save(){
  const data=state.engine?.serialize?.();
  if(!data)return null;
  const saved=await saveWorld({...data,items:ITEMS});
  await updateSaveSummary();
  postParent('saved',{xp:saved.stats?.xp||0,edits:saved.edits?.length||0,savedAt:saved.savedAt});
  return saved;
}

function switchToGame(){ $('menu').classList.remove('active');$('gameScreen').classList.add('active'); }
function switchToMenu(){ $('gameScreen').classList.remove('active');$('menu').classList.add('active'); }

async function launch(useSave){
  if(state.launching)return;
  state.launching=true;state.lastError=null;persistSettings();showLoading();
  try{
    const saved=useSave?await loadWorld():null;
    restoreItems(saved?.items);
    renderHotbar();renderInventory();switchToGame();
    const quality=resolvedQuality();const mode=$('gameMode').value;
    setText('qualityLabel',quality.toUpperCase());setText('modeLabel',MODE_LABELS[mode]||mode.toUpperCase());
    state.engine=await startGame({
      quality,mode,fov:Number($('fov').value),sensitivity:Number($('sensitivity').value)/100,
      selected:ITEMS[state.selected],saved,onCollect:addItem,onInventoryChange:()=>{renderHotbar();renderInventory();},onProgress:updateProgress,
      onHud:data=>{
        setText('fps',`${Math.round(data.fps||0)} FPS`);setText('chunkCount',`${data.chunks||0} chunks`);setText('triangleCount',`${data.triangles||0} tri`);
        $('healthBar').style.width=`${clamp(data.health,0,100)}%`;$('hungerBar').style.width=`${clamp(data.hunger,0,100)}%`;
        if(data.lesson)setText('lesson',data.lesson);if(data.code)setText('codeExplain',data.code);if(Number.isFinite(data.xp))setText('xpLabel',`${Math.round(data.xp)} XP`);
      }
    });
    $('learningPanel').classList.toggle('hidden',!$('learning').checked||mode==='free');
    hideLoading();openModal('helpModal');clearInterval(state.saveTimer);state.saveTimer=setInterval(()=>save().catch(()=>{}),30000);
    postParent('started',{quality,mode,continued:Boolean(saved)});
  }catch(error){
    state.engine?.destroy?.();state.engine=null;showError(error);
  }finally{state.launching=false;}
}

async function exitToMenu({saveFirst=true}={}){
  clearInterval(state.saveTimer);state.saveTimer=null;
  if(saveFirst&&state.engine){try{await save();}catch{}}
  state.engine?.destroy?.();state.engine=null;document.exitPointerLock?.();
  document.querySelectorAll('.modal').forEach(modal=>modal.classList.add('hidden'));
  switchToMenu();await updateSaveSummary();postParent('stopped',{});
}

function requestLabReturn(){postParent('exit',{});}

applySettings(loadSettings());
if(EMBEDDED)$('returnLabBtn').classList.remove('hidden');
updateSaveSummary();renderHotbar();renderInventory();postParent('ready',{version:10});

$('playBtn').addEventListener('click',()=>launch(false));
$('continueBtn').addEventListener('click',()=>launch(true));
$('startBtn').addEventListener('click',()=>closeModal('helpModal'));
$('menuBtn').addEventListener('click',()=>openModal('pauseModal'));
$('resumeBtn').addEventListener('click',()=>closeModal('pauseModal'));
$('inventoryBtn').addEventListener('click',()=>openModal('inventoryModal'));
$('saveBtn').addEventListener('click',()=>save().then(()=>setText('prompt','Mundo salvo.')).catch(showError));
$('cameraBtn').addEventListener('click',()=>state.engine?.toggleCamera?.());
$('fullscreenBtn').addEventListener('click',()=>document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen?.());
$('exitBtn').addEventListener('click',()=>exitToMenu());
$('returnLabBtn').addEventListener('click',requestLabReturn);
$('retryBtn').addEventListener('click',()=>{$('errorModal').classList.add('hidden');exitToMenu({saveFirst:false}).then(()=>launch(false));});
$('errorBackBtn').addEventListener('click',()=>{$('errorModal').classList.add('hidden');exitToMenu({saveFirst:false});});
$('clearSaveBtn').addEventListener('click',async()=>{if(!confirm('Apagar o mundo salvo deste dispositivo?'))return;await clearWorld();resetItems();renderHotbar();renderInventory();await updateSaveSummary();postParent('cleared',{});});
$('fov').addEventListener('input',()=>{setText('fovValue',`${$('fov').value}°`);persistSettings();});
$('sensitivity').addEventListener('input',()=>{setText('sensitivityValue',`${$('sensitivity').value}%`);persistSettings();});
['quality','gameMode','learning'].forEach(id=>$(id).addEventListener('change',persistSettings));

document.addEventListener('click',event=>{const close=event.target.closest('[data-close]');if(close){event.preventDefault();closeModal(close.dataset.close);}});
document.addEventListener('keydown',event=>{
  if(!$('gameScreen').classList.contains('active'))return;
  if(event.key==='Escape'&&state.engine&&!state.launching){openModal('pauseModal');return;}
  const index=Number(event.key)-1;
  if(index>=0&&index<ITEMS.length){state.selected=index;renderHotbar();state.engine?.setSelected?.(ITEMS[index]);}
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){state.engine?.setPaused?.(true);save().catch(()=>{});}else if(state.engine&&!document.querySelector('.modal:not(.hidden)'))state.engine.setPaused?.(false);});
window.addEventListener('pagehide',()=>{if(state.engine)save().catch(()=>{});});
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.data?.source!=='lab-virtual-ds')return;if(event.data.type==='shutdown')exitToMenu({saveFirst:true});});
