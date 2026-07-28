import { normalize, words } from './search-engine.js?v=8.2.3';

const LEVEL_ORDER={basic:1,intermediate:2,advanced:3};
const STOP=new Set(['como','qual','quais','para','uma','uns','das','dos','que','onde','pode','posso','sobre','mais','usar','abrir','laboratorio','laboratorios','ferramenta','ferramentas','virtual','portal']);

function clean(value,max=240){return String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);}
function cleanList(value,max=24){return Array.isArray(value)?value.map(item=>clean(item,90)).filter(Boolean).slice(0,max):[];}

export function sanitizeLabContext(raw){
  const input=raw&&typeof raw==='object'?raw:{};
  const categories=input.categories&&typeof input.categories==='object'?Object.fromEntries(Object.entries(input.categories).slice(0,40).map(([key,value])=>[clean(key,40),clean(value,80)])):{};
  const tools=Array.isArray(input.tools)?input.tools.slice(0,120).map(item=>({
    id:clean(item?.id,80).replace(/[^a-z0-9-]/gi,''),name:clean(item?.name,140),shortName:clean(item?.shortName||item?.name,80),description:clean(item?.description,520),category:clean(item?.category,50),categoryLabel:clean(item?.categoryLabel||categories[item?.category],80),level:clean(item?.level,30),levelLabel:clean(item?.levelLabel,50),runtime:clean(item?.runtime,40),runtimeLabel:clean(item?.runtimeLabel,120),runtimeExplanation:clean(item?.runtimeExplanation,300),tags:cleanList(item?.tags),aliases:cleanList(item?.aliases),uses:cleanList(item?.uses),route:clean(item?.route,180)
  })).filter(item=>item.id&&item.name):[];
  return {
    schemaVersion:1,labVersion:clean(input.labVersion,50),appName:clean(input.appName||'Laboratório Virtual DS',100),
    overview:{summary:clean(input.overview?.summary,700),execution:clean(input.overview?.execution,700),privacy:clean(input.overview?.privacy,700),modes:cleanList(input.overview?.modes,12),limitations:cleanList(input.overview?.limitations,12)},
    categories,tools,stats:{tools:tools.length,terminals:tools.filter(t=>t.runtimeLabel&&/terminal/i.test(`${t.name} ${t.categoryLabel}`)).length,labs:tools.length}
  };
}

function tokensForTool(tool){return new Set(words([tool.id,tool.name,tool.shortName,tool.description,tool.categoryLabel,...tool.tags,...tool.aliases,...tool.uses].join(' ')));}
function scoreTool(question,tool){
  const q=normalize(question),query=[...new Set(words(question).filter(word=>!STOP.has(word)))],corpus=tokensForTool(tool);
  let score=0;
  for(const token of query){if(corpus.has(token))score+=2;else if([...corpus].some(word=>word.includes(token)||token.includes(word)))score+=.7;}
  const exact=[tool.id,tool.name,tool.shortName,...tool.aliases].map(normalize).filter(Boolean);
  if(exact.some(value=>q.includes(value)))score+=7;
  if(q.includes(normalize(tool.categoryLabel)))score+=1.5;
  return score;
}

export function rankLabTools(question,context,limit=5){
  if(!context?.tools?.length)return[];
  return context.tools.map(tool=>({tool,score:scoreTool(question,tool)})).filter(item=>item.score>.5).sort((a,b)=>b.score-a.score||(LEVEL_ORDER[a.tool.level]||0)-(LEVEL_ORDER[b.tool.level]||0)).slice(0,limit);
}

function toolSummary(tool){
  const uses=tool.uses.length?` Você pode usar para ${tool.uses.join(', ')}.`:'';
  return `${tool.name}: ${tool.description} Nível ${tool.levelLabel||tool.level}; ${tool.runtimeLabel}. ${tool.runtimeExplanation}${uses}`.replace(/\s+/g,' ').trim();
}
function action(tool,label){return{toolId:tool.id,label:label||`Abrir ${tool.shortName}`};}

export function answerFromLabContext(question,context){
  if(!context?.tools?.length)return null;
  const q=normalize(question),ranked=rankLabTools(question,context,6);
  const asksCatalog=/\b(quais|lista|listar|todos|quantos)\b.*\b(laboratorio|ferramenta|modulo|terminal|jogo)/i.test(q)||/o que tem no lab|ferramentas disponiveis/i.test(q);
  const asksOverview=/o que e o lab|como funciona o lab|laboratorio virtual ds|sobre o portal/i.test(q);
  const asksRecommend=/qual.*(laboratorio|ferramenta)|onde.*(aprender|praticar|testar)|recomenda.*(laboratorio|ferramenta)|o que usar para/i.test(q);
  const asksOpen=/\b(abrir|acesse|acessar|entrar|iniciar|executar)\b/i.test(q);
  const explicitLab=/\b(lab|laboratorio|ferramenta|portal|modulo|simulador|emulador)\b/i.test(q);

  if(asksOverview){
    const s=context.stats||{};
    return{primary:true,text:`${context.overview.summary}\n\nHoje o catálogo integrado possui ${s.tools||context.tools.length} ferramentas. A execução combina ${context.overview.execution}\n\nPrivacidade: ${context.overview.privacy}`,confidence:96,topic:'Lab Virtual DS',actions:context.tools.filter(t=>['iara-ds','python','voxelcraft-3d'].includes(t.id)).map(t=>action(t)).slice(0,3)};
  }
  if(asksCatalog){
    const groups=new Map();for(const tool of context.tools){const label=tool.categoryLabel||tool.category||'Outros';if(!groups.has(label))groups.set(label,[]);groups.get(label).push(tool.shortName);}
    const lines=[...groups.entries()].sort((a,b)=>a[0].localeCompare(b[0],'pt-BR')).map(([label,names])=>`${label}: ${names.slice(0,8).join(', ')}${names.length>8?` e mais ${names.length-8}`:''}.`);
    return{primary:true,text:`O Lab Virtual DS possui ${context.tools.length} ferramentas organizadas por área.\n\n${lines.join('\n')}\n\nDiga o que deseja aprender e eu indico a opção mais adequada.`,confidence:95,topic:'Catálogo do Lab Virtual DS',actions:context.tools.filter(t=>t.id==='iara-ds'||t.id==='code-games'||t.id==='virtual-machine').map(t=>action(t)).slice(0,3)};
  }
  if(ranked.length&&((ranked[0].score>=6)||explicitLab||asksRecommend||asksOpen)){
    const top=ranked[0].tool;
    if(asksOpen)return{primary:true,text:`Encontrei ${top.name}. ${top.description}\n\nUse o botão abaixo para abrir a ferramenta sem precisar voltar ao catálogo.`,confidence:94,topic:top.name,actions:[action(top)]};
    if(asksRecommend){
      const picks=ranked.slice(0,3).map(item=>item.tool);
      return{primary:true,text:`Para esse objetivo, as melhores opções do portal são:\n\n${picks.map((tool,index)=>`${index+1}. ${toolSummary(tool)}`).join('\n\n')}`,confidence:90,topic:'Recomendação de laboratórios',actions:picks.map(tool=>action(tool))};
    }
    return{primary:true,text:toolSummary(top),confidence:92,topic:top.name,actions:[action(top)]};
  }
  if(ranked.length&&ranked[0].score>=2.2){
    const top=ranked[0].tool;
    return{primary:false,text:`Você também pode praticar este assunto em ${top.name}.`,confidence:78,topic:top.name,actions:[action(top)]};
  }
  return null;
}
