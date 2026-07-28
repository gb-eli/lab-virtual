import { MODELS, STORAGE_KEYS, DEFAULT_TOKENS, CREDIT_PEPPER } from './config.js?v=8.2.3';
import { initializeTokenBalance, MAX_TOKENS } from './token-policy.js?v=8.2.3';
import { KnowledgeVault } from './crypto-vault.js?v=8.2.3';
import { routeCandidates, similarity, isContinuation, normalize } from './search-engine.js?v=8.2.3';
import { sanitizeLabContext, answerFromLabContext } from './lab-context.js?v=8.2.3';
import { $, $$, createElement, addUserMessage, addTypingMessage, addAssistantMessage, setImageSafely } from './ui.js?v=8.2.3';

function safeNumberStorage(key,fallback){const raw=localStorage.getItem(key);if(raw===null||String(raw).trim()==='')return fallback;const value=Number(raw);return Number.isFinite(value)&&value>=0?Math.min(value,MAX_TOKENS):fallback;}
function safeArrayStorage(key){try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value.filter(item=>typeof item==='string'&&/^[a-f0-9]{64}$/i.test(item)).slice(-500):[];}catch{return[];}}
function clean(value,max=500){return String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);}

const state={
  model:MODELS[0],effort:'simple',tokens:initializeTokenBalance(localStorage,{balanceKey:STORAGE_KEYS.tokens,grantKey:STORAGE_KEYS.initialGrant,initialTokens:DEFAULT_TOKENS,maxTokens:MAX_TOKENS}),usedCodes:safeArrayStorage(STORAGE_KEYS.usedCodes),
  vault:null,manifest:null,imageCatalog:null,topicRegistry:null,context:null,busy:false,creditPolicy:null,labContext:null,
  integration:{embedded:new URLSearchParams(location.search).get('embed')==='1'&&window.parent!==window,boot:Number(new URLSearchParams(location.search).get('boot'))||0,student:null,labVersion:'',ready:false}
};
const el={modelLabel:$('#modelLabel'),tokenBalance:$('#tokenBalance'),tokenBig:$('#tokenBig'),tokenMeter:$('#tokenMeter'),modelList:$('#modelList'),messages:$('#messages'),hero:$('#hero'),prompt:$('#prompt'),sendBtn:$('#sendBtn'),liveCost:$('#liveCost'),statusText:$('#statusText'),backdrop:$('#backdrop'),toast:$('#toast'),imageStage:$('#imageStage'),imagePrompt:$('#imagePrompt'),imagePresets:$('#imagePresets'),topicChips:$('#topicChips'),labToolList:$('#labToolList'),labToolSearch:$('#labToolSearch')};
const sheets=$$('.sheet'),sideMenu=$('#sideMenu'),wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function formatNumber(value){return new Intl.NumberFormat('pt-BR').format(Math.max(0,Math.floor(value)));}
function persist(){localStorage.setItem(STORAGE_KEYS.tokens,String(state.tokens));localStorage.setItem(STORAGE_KEYS.usedCodes,JSON.stringify(state.usedCodes));}
function openPanel(panel){if(!panel)return;closeAll();el.backdrop?.classList.add('show');panel.classList.add('open');}
function closeAll(){sheets.forEach(sheet=>sheet.classList.remove('open'));sideMenu?.classList.remove('open');el.backdrop?.classList.remove('show');}
function showToast(message){if(!el.toast)return;el.toast.textContent=clean(message,180);el.toast.classList.add('show');clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>el.toast.classList.remove('show'),2500);}
function postToLab(type,detail={}){if(!state.integration.embedded)return;window.parent.postMessage({source:'iara-ds',type,detail:{...detail,boot:state.integration.boot}},location.origin);}
function estimate(question=el.prompt?.value||''){const effortCost=state.effort==='deep'?22:state.effort==='guided'?12:0;return Math.ceil(state.model.cost+Math.max(1,question.length/18)*(.7+MODELS.indexOf(state.model)*.34)+effortCost);}

function renderModels(){
  el.modelList?.replaceChildren();
  MODELS.forEach(model=>{const button=createElement('button',`model-row ${model.id===state.model.id?'active':''}`);button.type='button';button.dataset.model=model.id;const icon=createElement('span','model-icon','I');icon.style.setProperty('--c1',model.c1);icon.style.setProperty('--c2',model.c2);const info=createElement('span');info.append(createElement('strong','',model.name),createElement('small','',`${model.sub} • ${model.cost}+ tokens`));button.append(icon,info,createElement('span','check',model.id===state.model.id?'✓':''));button.addEventListener('click',()=>{state.model=model;updateUI();closeAll();showToast(`${model.name} ativada`);});el.modelList?.append(button);});
}
function updateUI(){
  if(el.modelLabel)el.modelLabel.textContent=state.model.name.replace('IARA ','');if(el.tokenBalance)el.tokenBalance.textContent=formatNumber(state.tokens);if(el.tokenBig)el.tokenBig.textContent=formatNumber(state.tokens);if(el.tokenMeter)el.tokenMeter.style.width=`${Math.min(100,state.tokens/50)}%`;if(el.liveCost)el.liveCost.textContent=`≈ ${estimate()} tokens`;document.documentElement.style.setProperty('--energy',state.model.c1);document.documentElement.style.setProperty('--energy2',state.model.c2);renderModels();
}
function scrollBottom(){requestAnimationFrame(()=>{const chat=$('.chat');if(chat)chat.scrollTop=chat.scrollHeight;});}
function autoGrow(){if(!el.prompt)return;el.prompt.style.height='auto';el.prompt.style.height=`${Math.min(150,el.prompt.scrollHeight)}px`;if(el.liveCost)el.liveCost.textContent=`≈ ${estimate()} tokens`;}

function selectAnswer(entry,question){
  let effort=state.effort;if(/não entendi|nao entendi|passo a passo|estou perdido|mais fácil|mais facil/i.test(question))effort='guided';
  const modelDepth={core:'quick',flux:'simple',plus:'simple',advanced:'deep',solar:'deep'},rank={quick:0,simple:1,guided:2,deep:3},minimum=modelDepth[state.model.id]||'simple';if(rank[effort]<rank[minimum])effort=minimum;
  let answer=entry.answers?.[effort]||entry.answers?.simple||entry.answers?.quick||'O módulo foi localizado, mas não possui uma explicação compatível.';
  if(state.model.id==='solar'&&entry.related?.length)answer+=`\n\nConexões úteis: ${entry.related.slice(0,6).join(', ')}.`;
  if(entry.current_info?.ultima_verificacao)answer+=`\n\nDados atualizáveis verificados em ${entry.current_info.ultima_verificacao.split('-').reverse().join('/')}.`;
  return clean(answer,12000);
}
async function searchEncryptedKnowledge(question){
  const routeLimit={core:2,flux:3,plus:4,advanced:6,solar:8}[state.model.id]||3;let candidates=await routeCandidates(question,state.vault?.routes||[],routeLimit);
  if(!candidates.length&&state.context&&isContinuation(question)){const route=state.vault.routes.find(item=>item.id===state.context.id);if(route)candidates=[{route,score:1}];}
  const opened=[];for(const candidate of candidates){try{const entry=await state.vault.decryptFile(candidate.route.file);opened.push({entry,routeScore:candidate.score,semantic:similarity(question,entry)});}catch(error){console.warn('Módulo protegido rejeitado.',error);}}
  opened.sort((a,b)=>(b.semantic+b.routeScore*.2)-(a.semantic+a.routeScore*.2));return{best:opened[0]||null,loaded:opened.length};
}

const STARTER_TOOL_IDS=new Set(['voxelcraft-3d','python','javascript','frontend','sql','virtual-machine','code-games','artificial-intelligence','iara-ds']);
function openLabTool(toolId){
  const id=clean(toolId,80).replace(/[^a-z0-9-]/gi,'');
  const exists=Boolean(id)&&(state.labContext?.tools?.some(tool=>tool.id===id)||STARTER_TOOL_IDS.has(id));
  if(!exists){showToast('Ferramenta não reconhecida. Abra o catálogo para localizar o laboratório.');return;}
  if(state.integration.embedded)postToLab('open-tool',{toolId:id});else location.href=`../../index.html?tool=${encodeURIComponent(id)}`;
}
function renderLabTools(query=''){
  if(!el.labToolList||!state.labContext)return;const normalized=normalize(query);const terms=normalized.split(' ').filter(Boolean);const tools=state.labContext.tools.filter(tool=>{if(!terms.length)return true;const corpus=normalize([tool.name,tool.shortName,tool.description,tool.categoryLabel,...tool.tags,...tool.aliases].join(' '));return terms.every(term=>corpus.includes(term));}).slice(0,80);el.labToolList.replaceChildren();
  if(!tools.length){el.labToolList.append(createElement('div','lab-tool-empty','Nenhuma ferramenta encontrada.'));return;}
  tools.forEach(tool=>{const card=createElement('article','lab-tool-card'),copy=createElement('div');copy.append(createElement('strong','',tool.name),createElement('small','',`${tool.categoryLabel} • ${tool.levelLabel} • ${tool.runtimeLabel}`));const button=createElement('button','','Abrir');button.type='button';button.addEventListener('click',()=>openLabTool(tool.id));card.append(copy,button);el.labToolList.append(card);});
}
function applyAccessibility(settings={}){const html=document.documentElement;const theme=['light','dark'].includes(settings.theme)?settings.theme:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');html.dataset.theme=theme;html.dataset.fontSize=['normal','large','xlarge'].includes(settings.fontSize)?settings.fontSize:'normal';html.dataset.reducedMotion=String(Boolean(settings.reducedMotion));html.dataset.highContrast=String(Boolean(settings.highContrast));html.style.colorScheme=theme;}
function handleParentMessage(event){
  if(!state.integration.embedded||event.source!==window.parent||event.origin!==location.origin)return;const data=event.data;if(!data||data.source!=='lab-virtual-ds')return;const detail=data.detail&&typeof data.detail==='object'?data.detail:{};
  if(data.type==='context'){
    state.integration.student=detail.student&&typeof detail.student==='object'?{name:clean(detail.student.name,80),className:clean(detail.student.className,60)}:null;state.integration.labVersion=clean(detail.version,40);applyAccessibility(detail.accessibility||{});
    if(Array.isArray(detail.tools)){const existing=new Map((state.labContext?.tools||[]).map(tool=>[tool.id,tool]));const merged=detail.tools.map(tool=>({...existing.get(String(tool?.id||'')),...tool}));state.labContext=sanitizeLabContext({...state.labContext,labVersion:state.integration.labVersion,tools:merged});renderLabTools(el.labToolSearch?.value||'');}
    const note=$('#integrationNote');if(note)note.textContent=`Lab Virtual DS ${state.integration.labVersion||''} • ${state.labContext?.tools?.length||0} ferramentas`;
    const status=$('#bankIntegrationStatus');if(status)status.textContent=`Integrada ao Lab Virtual DS ${state.integration.labVersion||''}`;
  }
  if(data.type==='ping'){postToLab('ready',{routes:state.manifest?.routes?.length||0,tools:state.labContext?.tools?.length||0,initialized:Boolean(state.integration.ready)});return;}
  if(data.type==='shutdown'){state.vault?.clear?.();}
}

async function ask(question){
  question=clean(question,600);if(state.busy||!question)return;const cost=estimate(question);if(state.tokens<cost){openPanel($('#tokenSheet'));showToast('Tokens insuficientes');return;}
  state.busy=true;el.sendBtn.disabled=true;document.body.classList.add('processing');el.hero?.classList.add('hidden');addUserMessage(el.messages,question);addTypingMessage(el.messages,state.model.name);el.prompt.value='';autoGrow();scrollBottom();
  const start=performance.now(),labAnswer=answerFromLabContext(question,state.labContext),stages=labAnswer?.primary?['Interpretando objetivo','Consultando catálogo do Lab Virtual DS','Montando orientação contextual']:['Interpretando pergunta','Criando rota protegida','Abrindo somente o módulo necessário','Montando explicação'];
  for(const stage of stages){el.statusText.textContent=stage;postToLab('status',{message:stage,tone:'info'});await wait(state.model.delay/stages.length);}
  let result={best:null,loaded:0};if(!labAnswer?.primary)result=await searchEncryptedKnowledge(question);
  let text='',confidence=36,actions=[];
  if(labAnswer?.primary){text=labAnswer.text;confidence=labAnswer.confidence;actions=labAnswer.actions||[];state.context={id:'lab-context',topic:labAnswer.topic,answers:{simple:text,quick:text,guided:text,deep:text}};}
  else if(result.best){state.context=result.best.entry;text=selectAnswer(result.best.entry,question);confidence=Math.min(98,Math.round(58+result.best.semantic*30+result.best.routeScore*7+state.model.intelligence/100));if(labAnswer){text+=`\n\n${labAnswer.text}`;actions=labAnswer.actions||[];confidence=Math.max(confidence,labAnswer.confidence||0);}}
  else if(state.context&&isContinuation(question)){text=selectAnswer(state.context,question);confidence=74;}
  else if(labAnswer){text=labAnswer.text;confidence=labAnswer.confidence;actions=labAnswer.actions||[];}
  else{text='Ainda não encontrei uma correspondência segura. Informe o conteúdo, a linguagem ou a ferramenta. Exemplos: “variáveis em Python”, “qual laboratório ensina SQL?” ou “como publicar no GitHub Pages?”.';confidence=36;}
  state.tokens=Math.max(0,state.tokens-cost);persist();const elapsed=Math.round(performance.now()-start);addAssistantMessage(el.messages,text,{cost,ms:elapsed,conf:confidence,loaded:result.loaded,actions},state.model.name);updateUI();scrollBottom();el.statusText.textContent='Pronta';document.body.classList.remove('processing');state.busy=false;el.sendBtn.disabled=false;postToLab('interaction',{question,summary:clean(text,340),topic:labAnswer?.topic||result.best?.entry?.topic||'',cost,confidence});
}

async function ensureTopics(){if(!state.manifest?.topicsFile){showToast('Conteúdos adicionais indisponíveis no modo contextual.');return;}if(!state.topicRegistry)state.topicRegistry=await state.vault.decryptFile(state.manifest.topicsFile);el.topicChips?.replaceChildren();state.topicRegistry.slice(0,180).forEach(item=>{const button=createElement('button','',item.topic);button.type='button';button.addEventListener('click',()=>{closeAll();el.prompt.value=`Explique ${item.topic} de forma simples`;autoGrow();el.prompt.focus();});el.topicChips?.append(button);});}
async function ensureImages(){if(!state.manifest?.imagesFile){showToast('Catálogo de imagens indisponível no modo contextual.');return;}if(!state.imageCatalog)state.imageCatalog=await state.vault.decryptFile(state.manifest.imagesFile);const categories=[...new Set(state.imageCatalog.map(item=>item.category))];el.imagePresets?.replaceChildren();categories.forEach(category=>{const button=createElement('button','',category);button.type='button';button.addEventListener('click',()=>{el.imagePrompt.value=category;generateImage();});el.imagePresets?.append(button);});}
function chooseImage(question){const query=normalize(question);const ranked=state.imageCatalog.map(image=>{const corpus=normalize([image.title,image.category,...(image.keywords||[])].join(' ')),matches=query.split(' ').filter(token=>token.length>=3&&corpus.includes(token)).length;return{image,matches};}).sort((a,b)=>b.matches-a.matches);return ranked[0]?.matches?ranked[0].image:state.imageCatalog[Math.floor(Math.random()*state.imageCatalog.length)];}
async function generateImage(){try{await ensureImages();const prompt=clean(el.imagePrompt?.value||'tecnologia',180),image=chooseImage(prompt),cost=state.model.id==='solar'?180:90;if(state.tokens<cost){showToast('Tokens insuficientes para gerar imagem');return;}const overlay=createElement('div','generation-overlay');overlay.append(createElement('div','pixel-grid'));const core=createElement('div','gen-core');core.append(createElement('b','','Gerando imagem'),createElement('small','','Selecionando composição no catálogo local...'));overlay.append(core);el.imageStage.replaceChildren(overlay);await wait(Math.max(700,state.model.delay));state.tokens-=cost;persist();updateUI();setImageSafely(el.imageStage,image);showToast(`Imagem simulada • ${cost} tokens`);}catch(error){showToast(`Falha na simulação visual: ${error.message}`);}}
async function sha256Hex(text){const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return[...new Uint8Array(digest)].map(byte=>byte.toString(16).padStart(2,'0')).join('');}
async function activateCreditCode(code){const normalized=clean(code,80).toUpperCase(),hash=await sha256Hex(CREDIT_PEPPER+normalized),amount=Number(state.creditPolicy?.codes?.[hash]);if(!Number.isFinite(amount)||amount<=0)return'Código inválido.';if(state.usedCodes.includes(hash))return'Código já utilizado neste navegador.';state.usedCodes.push(hash);state.tokens=Math.min(MAX_TOKENS,state.tokens+amount);persist();updateUI();return`+${formatNumber(amount)} tokens adicionados.`;}

function bindEvents(){
  $('#composer')?.addEventListener('submit',event=>{event.preventDefault();ask(el.prompt.value);});el.prompt?.addEventListener('input',autoGrow);
  $$('[data-prompt]').forEach(button=>button.addEventListener('click',()=>ask(button.dataset.prompt||'')));$$('[data-open-tool]').forEach(button=>button.addEventListener('click',()=>openLabTool(button.dataset.openTool)));
  $('#modelBtn')?.addEventListener('click',()=>openPanel($('#modelSheet')));$('#tokenBtn')?.addEventListener('click',()=>openPanel($('#tokenSheet')));$('#toolsBtn')?.addEventListener('click',()=>openPanel($('#toolsSheet')));$('#menuBtn')?.addEventListener('click',()=>{closeAll();el.backdrop?.classList.add('show');sideMenu?.classList.add('open');});
  $('#openImageTool')?.addEventListener('click',async()=>{openPanel($('#imageSheet'));await ensureImages();});$('#imageToolRow')?.addEventListener('click',async()=>{openPanel($('#imageSheet'));await ensureImages();});$('#resourcesRow')?.addEventListener('click',()=>openPanel($('#resourcesSheet')));$('#topicsRow')?.addEventListener('click',async()=>{openPanel($('#topicsSheet'));await ensureTopics();});$('#labToolsRow')?.addEventListener('click',()=>{openPanel($('#labToolsSheet'));renderLabTools(el.labToolSearch?.value||'');});
  $('#sideModelBtn')?.addEventListener('click',()=>openPanel($('#modelSheet')));$('#sideBankBtn')?.addEventListener('click',()=>openPanel($('#bankSheet')));$('#sideLabToolsBtn')?.addEventListener('click',()=>{openPanel($('#labToolsSheet'));renderLabTools(el.labToolSearch?.value||'');});$('#sideResourcesBtn')?.addEventListener('click',()=>openPanel($('#resourcesSheet')));$('#sideImagesBtn')?.addEventListener('click',async()=>{openPanel($('#imageSheet'));await ensureImages();});
  $('#newChatBtn')?.addEventListener('click',()=>{el.messages.replaceChildren();el.hero?.classList.remove('hidden');state.context=null;state.vault.clear();closeAll();});$('#generateImageBtn')?.addEventListener('click',generateImage);el.backdrop?.addEventListener('click',closeAll);$$('[data-close]').forEach(button=>button.addEventListener('click',closeAll));el.labToolSearch?.addEventListener('input',event=>renderLabTools(event.target.value));
  $('#effortGroup')?.addEventListener('click',event=>{const button=event.target.closest('button');if(!button||!['quick','simple','guided','deep'].includes(button.dataset.effort))return;state.effort=button.dataset.effort;$$('[data-effort]').forEach(item=>item.classList.toggle('active',item===button));showToast(`Explicação: ${button.textContent}`);updateUI();});
  $('#creditForm')?.addEventListener('submit',async event=>{event.preventDefault();const message=await activateCreditCode($('#creditCode')?.value||'');if($('#creditFeedback'))$('#creditFeedback').textContent=message;if($('#creditCode'))$('#creditCode').value='';showToast(message);});
  document.addEventListener('iara:open-tool',event=>openLabTool(event.detail?.toolId));window.addEventListener('message',handleParentMessage);
}

async function fetchJson(url){const response=await fetch(url,{cache:'no-store'});if(!response.ok)throw new Error(`${url}: HTTP ${response.status}`);return response.json();}
async function init(){
  try{
    const [manifestResult,creditResult,contextResult]=await Promise.allSettled([
      fetchJson('data/manifest.json?v=8.2.3'),fetchJson('data/credit-policy.json?v=8.2.3'),fetchJson('data/lab-virtual-ds-context.json?v=8.2.3')
    ]);
    const degraded=manifestResult.status!=='fulfilled';
    state.creditPolicy=creditResult.status==='fulfilled'?creditResult.value:{codes:{}};
    state.labContext=sanitizeLabContext(contextResult.status==='fulfilled'?contextResult.value:{appName:'Laboratório Virtual DS',overview:{summary:'Assistente contextual do Lab Virtual DS.',execution:'execução local no navegador',privacy:'dados mantidos localmente'},tools:[]});
    if(!degraded){state.manifest=manifestResult.value;state.vault=new KnowledgeVault(state.manifest);}
    else{
      console.error('Base criptografada indisponível.',manifestResult.reason);state.manifest={routes:[],knowledgeStats:{nodes:0},topicsFile:null,imagesFile:null};
      state.vault={routes:[],clear(){},async decryptFile(){throw new Error('Base criptografada indisponível nesta execução.');}};
    }
    bindEvents();updateUI();renderLabTools();
    if($('#bankRouteCount'))$('#bankRouteCount').textContent=String(state.manifest.routes?.length||0);if($('#bankToolCount'))$('#bankToolCount').textContent=String(state.labContext.tools.length);if($('#bankNodeCount')&&state.manifest.knowledgeStats?.nodes)$('#bankNodeCount').textContent=formatNumber(state.manifest.knowledgeStats.nodes);
    el.statusText.textContent=degraded?'Modo contextual do Lab pronto; base protegida indisponível':'Cofre protegido e catálogo do Lab prontos';state.integration.ready=true;
    const readyDetail={routes:state.manifest.routes?.length||0,tools:state.labContext.tools.length,degraded};window.__IARA_BOOT__?.markReady?.(readyDetail);postToLab('ready',readyDetail);
    if(degraded)showToast('A IARA abriu em modo contextual. Recarregue quando a conexão estiver estável para acessar toda a base.');
  }catch(error){console.error(error);if(el.statusText)el.statusText.textContent='Falha ao iniciar';showToast('Não foi possível iniciar nem o modo contextual local.');window.__IARA_BOOT__?.markError?.(error);postToLab('error',{message:error.message});}
}
init();
