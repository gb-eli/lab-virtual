'use strict';

(function(){
  window.LABDS=window.LABDS||{};

  const STORAGE_KEY='lab.v3.global';
  const SCHEMA=5;
  const listeners=new Map();
  const RARITY_ORDER={inicial:0,comum:1,incomum:2,raro:3,épico:4,lendário:5,mítico:6};
  const TOOL_FIRST_COMPLETION_REWARDS={basic:15,intermediate:30,advanced:50};
  const COVERAGE_MILESTONES=[
    {percent:30,credits:100,achievement:'coverage30'},
    {percent:50,credits:150,achievement:'coverage50'},
    {percent:70,credits:250,achievement:'coverage70'},
    {percent:80,credits:300,achievement:'coverage80'},
    {percent:90,credits:400,achievement:'coverage90'},
    {percent:100,credits:750,achievement:'coverage100'}
  ];

  const LEVELS=[
    {level:1,name:'Iniciante',xp:0},{level:2,name:'Explorador',xp:250},{level:3,name:'Aprendiz',xp:650},
    {level:4,name:'Construtor',xp:1300},{level:5,name:'Analista',xp:2300},{level:6,name:'Desenvolvedor',xp:3800},
    {level:7,name:'Especialista',xp:6000},{level:8,name:'Arquiteto',xp:9000},{level:9,name:'Mestre Tech',xp:13500}
  ];

  const ACHIEVEMENTS={
    first_lab:{title:'Primeiro laboratório',description:'Concluiu uma atividade válida em um laboratório.',icon:'◈'},
    first_export:{title:'Backup responsável',description:'Exportou o progresso local.',icon:'⇩'},
    formula:{title:'Especialista em fórmulas',description:'Concluiu um desafio de planilhas.',icon:'ƒx'},
    phishing:{title:'Caçador de phishing',description:'Identificou uma mensagem suspeita.',icon:'⌁'},
    hardware:{title:'Montador consciente',description:'Validou uma configuração de hardware.',icon:'PC'},
    network:{title:'Conexão estabelecida',description:'Concluiu uma atividade de redes.',icon:'NET'},
    arcade:{title:'Arcade pedagógico',description:'Concluiu uma fase válida em um jogo.',icon:'GAME'},
    productivity:{title:'Produtividade integrada',description:'Usou dois aplicativos de escritório na mesma atividade.',icon:'OFF'},
    creator:{title:'Criador digital',description:'Exportou um artefato produzido no laboratório.',icon:'✦'},
    explorer:{title:'Explorador do Lab',description:'Utilizou dez ferramentas diferentes.',icon:'⌘'},
    coverage30:{title:'Rota de exploração — 30%',description:'Conheceu pelo menos 30% das ferramentas do portal.',icon:'30%'},
    coverage50:{title:'Meio caminho tecnológico',description:'Conheceu pelo menos metade das ferramentas do portal.',icon:'50%'},
    coverage70:{title:'Explorador avançado',description:'Conheceu pelo menos 70% das ferramentas do portal.',icon:'70%'},
    coverage80:{title:'Especialista multidisciplinar',description:'Conheceu pelo menos 80% das ferramentas do portal.',icon:'80%'},
    coverage90:{title:'Veterano do Lab',description:'Conheceu pelo menos 90% das ferramentas do portal.',icon:'90%'},
    coverage100:{title:'Mestre de toda a plataforma',description:'Visitou todas as ferramentas disponíveis nesta versão.',icon:'100%'},
    collector:{title:'Colecionador Tech',description:'Adquiriu dez itens diferentes na Loja Tech.',icon:'SHOP'}
  };

  const STORE_ITEMS=[
    {id:'starter-frame',name:'Moldura inicial',description:'Moldura padrão incluída no perfil.',price:0,type:'frame',category:'molduras',rarity:'inicial',value:'cyan',starter:true,preview:'◇'},
    /* IDs legados preservados para inventários das versões anteriores. Cores novas continuam gratuitas no editor do perfil. */
    {id:'frame-cyan',name:'Moldura Ciano — legado',description:'Compatibilidade com perfis anteriores.',price:50,type:'frame',category:'molduras',rarity:'comum',value:'cyan',preview:'◇',hidden:true,legacy:true},
    {id:'hair-cyan',name:'Cabelo Ciano — legado',description:'Item adquirido em versões anteriores; a escolha de cores agora é gratuita.',price:25,type:'hairColor',category:'cabelo',rarity:'comum',value:'#22d3ee',preview:'●',hidden:true,legacy:true},
    {id:'hair-purple',name:'Cabelo Violeta — legado',description:'Item adquirido em versões anteriores; a escolha de cores agora é gratuita.',price:60,type:'hairColor',category:'cabelo',rarity:'comum',value:'#a855f7',preview:'●',hidden:true,legacy:true},
    {id:'shirt-green',name:'Camiseta Verde — legado',description:'Cor de roupa preservada para perfis anteriores.',price:30,type:'shirtColor',category:'roupas',rarity:'comum',value:'#22c55e',preview:'◫',hidden:true,legacy:true},
    {id:'shirt-orange',name:'Jaqueta Laranja — legado',description:'Cor de roupa preservada para perfis anteriores.',price:90,type:'shirtColor',category:'roupas',rarity:'comum',value:'#f97316',preview:'◫',hidden:true,legacy:true},
    {id:'avatar-headset',name:'Fone Tech — legado',description:'Acessório preservado para inventários anteriores.',price:75,type:'accessory',category:'acessórios',rarity:'comum',value:'🎧',preview:'🎧',hidden:true,legacy:true},
    {id:'avatar-glasses',name:'Óculos Neon — legado',description:'Acessório preservado para inventários anteriores.',price:180,type:'accessory',category:'acessórios',rarity:'raro',value:'🕶️',preview:'🕶️',hidden:true,legacy:true},

    {id:'hair-style-wave',name:'Cabelo Ondulado',description:'Novo formato de cabelo para combinar com qualquer cor escolhida gratuitamente.',price:25,type:'hairStyle',category:'cabelo',rarity:'comum',value:'wave',preview:'〰'},
    {id:'hair-style-spike',name:'Cabelo Tech Spike',description:'Corte pontudo inspirado em personagens de jogos.',price:45,type:'hairStyle',category:'cabelo',rarity:'comum',value:'spike',preview:'▲'},
    {id:'hair-style-braids',name:'Tranças Digitais',description:'Estilo de cabelo com detalhes laterais.',price:80,type:'hairStyle',category:'cabelo',rarity:'incomum',value:'braids',preview:'≋'},
    {id:'hair-style-holo',name:'Cabelo Holográfico',description:'Formato com brilho sutil em qualidade Alta ou Ultra.',price:420,type:'hairStyle',category:'cabelo',rarity:'raro',value:'holographic',preview:'✦'},

    {id:'top-green-shirt',name:'Camiseta Circuito',description:'Camiseta básica com símbolo de circuito.',price:30,type:'top',category:'roupas',rarity:'comum',value:'circuit-shirt',preview:'◫'},
    {id:'top-hoodie',name:'Moletom Dev',description:'Moletom com capuz para sessões de programação.',price:90,type:'top',category:'roupas',rarity:'incomum',value:'dev-hoodie',preview:'⌂'},
    {id:'top-space-jacket',name:'Jaqueta Espacial',description:'Jaqueta com linhas refletivas e identificação orbital.',price:240,type:'top',category:'roupas',rarity:'raro',value:'space-jacket',preview:'🚀'},
    {id:'top-gradient',name:'Jaqueta Gradiente',description:'Roupa com gradiente animado controlado pelas preferências gráficas.',price:520,type:'top',category:'roupas',rarity:'épico',value:'gradient-jacket',preview:'◩'},
    {id:'top-cyber-armor',name:'Peitoral Cibernético',description:'Armadura gráfica com placas e iluminação.',price:1500,type:'top',category:'roupas',rarity:'épico',value:'cyber-armor',preview:'⬢',unlock:{coverage:70,validActivities:18}},

    {id:'bottom-shorts',name:'Bermuda Maker',description:'Parte inferior leve para o avatar.',price:35,type:'bottom',category:'roupas',rarity:'comum',value:'maker-shorts',preview:'▥'},
    {id:'bottom-cargo',name:'Calça Cargo Tech',description:'Calça com bolsos de ferramentas simulados.',price:110,type:'bottom',category:'roupas',rarity:'incomum',value:'tech-cargo',preview:'▤'},
    {id:'bottom-orbit',name:'Calça Órbita',description:'Calça épica com linhas orbitais luminosas.',price:760,type:'bottom',category:'roupas',rarity:'épico',value:'orbit-pants',preview:'◎',unlock:{coverage:50,validActivities:10}},

    {id:'shoes-basic-sneaker',name:'Tênis Pixel',description:'Calçado com detalhes em pixels.',price:40,type:'shoes',category:'calçados',rarity:'comum',value:'pixel-sneaker',preview:'▰'},
    {id:'shoes-runner',name:'Tênis Runner',description:'Calçado esportivo para o explorador.',price:95,type:'shoes',category:'calçados',rarity:'incomum',value:'runner',preview:'➤'},
    {id:'shoes-magnetic',name:'Botas Magnéticas',description:'Botas raras inspiradas em exploração espacial.',price:390,type:'shoes',category:'calçados',rarity:'raro',value:'magnetic-boots',preview:'⬒'},
    {id:'shoes-quantum',name:'Botas Quantum',description:'Botas lendárias com rastro visual discreto.',price:2750,type:'shoes',category:'calçados',rarity:'lendário',value:'quantum-boots',preview:'✧',unlock:{coverage:90,validActivities:32}},

    {id:'gloves-maker',name:'Luvas Maker',description:'Luvas para montagem, eletrônica e fabricação digital.',price:55,type:'gloves',category:'acessórios',rarity:'comum',value:'maker-gloves',preview:'◇'},
    {id:'gloves-cyber',name:'Luvas Cibernéticas',description:'Luvas com painéis luminosos.',price:460,type:'gloves',category:'acessórios',rarity:'raro',value:'cyber-gloves',preview:'✣'},
    {id:'belt-tools',name:'Cinto de Ferramentas',description:'Cinto com compartimentos para itens virtuais.',price:70,type:'belt',category:'acessórios',rarity:'comum',value:'tool-belt',preview:'═'},
    {id:'belt-holo',name:'Cinto Holográfico',description:'Cinto épico com indicador animado.',price:680,type:'belt',category:'acessórios',rarity:'épico',value:'holo-belt',preview:'▣',unlock:{coverage:30,validActivities:5}},
    {id:'eyewear-neon',name:'Óculos Neon',description:'Óculos com lentes tecnológicas.',price:75,type:'eyewear',category:'acessórios',rarity:'comum',value:'neon-glasses',preview:'◉◉'},
    {id:'eyewear-ar',name:'Óculos de Realidade Aumentada',description:'Visor raro inspirado em interfaces espaciais.',price:360,type:'eyewear',category:'acessórios',rarity:'raro',value:'ar-visor',preview:'▱'},
    {id:'headwear-cap',name:'Boné Código',description:'Boné com símbolo de programação.',price:50,type:'headwear',category:'acessórios',rarity:'comum',value:'code-cap',preview:'⌁'},
    {id:'headwear-helmet',name:'Capacete Orbital',description:'Capacete lendário com visor e comunicação.',price:1850,type:'headwear',category:'acessórios',rarity:'lendário',value:'orbital-helmet',preview:'◉',unlock:{coverage:80,validActivities:24}},
    {id:'backpack-school',name:'Mochila Escolar Tech',description:'Mochila com compartimento para notebook fictício.',price:85,type:'backpack',category:'acessórios',rarity:'incomum',value:'school-tech',preview:'▣'},
    {id:'backpack-jet',name:'Mochila Propulsora',description:'Mochila épica com chama visual em animações de vitória.',price:1250,type:'backpack',category:'acessórios',rarity:'épico',value:'jetpack',preview:'♨',unlock:{coverage:70,validActivities:18}},
    {id:'accessory-headset',name:'Fone Tech',description:'Acessório para estudos e AudioLab.',price:65,type:'accessory',category:'acessórios',rarity:'comum',value:'🎧',preview:'🎧'},

    {id:'frame-purple',name:'Moldura Violeta',description:'Moldura com brilho controlado.',price:150,type:'frame',category:'molduras',rarity:'raro',value:'purple',preview:'◇'},
    {id:'frame-hologram',name:'Moldura Holográfica',description:'Moldura com profundidade e brilho Ultra.',price:850,type:'frame',category:'molduras',rarity:'épico',value:'hologram',preview:'⬡',unlock:{coverage:50,validActivities:10}},
    {id:'frame-master',name:'Moldura Mestre do Lab',description:'Moldura mítica disponível somente após explorar toda a plataforma.',price:3500,type:'frame',category:'molduras',rarity:'mítico',value:'master',preview:'✹',unlock:{coverage:100,validActivities:40}},

    {id:'theme-terminal',name:'Tema Terminal',description:'Tema escuro com destaque verde.',price:120,type:'theme',category:'temas',rarity:'comum',value:'terminal',preview:'>_'},
    {id:'theme-aurora',name:'Tema Aurora',description:'Gradientes suaves e brilho adicional.',price:220,type:'theme',category:'temas',rarity:'raro',value:'aurora',preview:'◒'},
    {id:'theme-orbit',name:'Tema Órbita',description:'Tema espacial com estrelas e órbitas.',price:720,type:'theme',category:'temas',rarity:'épico',value:'orbit',preview:'◎',unlock:{coverage:30,validActivities:5}},
    {id:'theme-quantum',name:'Tema Quantum',description:'Tema lendário com partículas controladas.',price:2400,type:'theme',category:'temas',rarity:'lendário',value:'quantum',preview:'✦',unlock:{coverage:80,validActivities:24}},
    {id:'theme-all-tools',name:'Tema Convergência 100%',description:'Tema mítico que combina cores de todas as áreas do portal.',price:5000,type:'theme',category:'temas',rarity:'mítico',value:'convergence',preview:'∞',unlock:{coverage:100,validActivities:40}},

    {id:'mascot-byte',name:'Mascote Byte',description:'Robô assistente do perfil.',price:320,type:'mascot',category:'mascotes',rarity:'raro',value:'🤖',preview:'🤖'},
    {id:'mascot-drone',name:'Mascote Drone',description:'Drone virtual para o perfil.',price:480,type:'mascot',category:'mascotes',rarity:'épico',value:'🛸',preview:'🛸'},
    {id:'mascot-rover',name:'Mascote Rover Lunar',description:'Mascote lendário inspirado em exploração espacial.',price:1650,type:'mascot',category:'mascotes',rarity:'lendário',value:'🛰️',preview:'🛰️',unlock:{coverage:70,validActivities:18}},
    {id:'mascot-ai',name:'Mascote Núcleo IA',description:'Companheiro mítico para quem domina quase todo o portal.',price:3600,type:'mascot',category:'mascotes',rarity:'mítico',value:'🧠',preview:'🧠',unlock:{coverage:90,validActivities:32}},

    {id:'badge-first',name:'Emblema Primeiro Código',description:'Emblema de entrada para o perfil.',price:40,type:'badge',category:'emblemas',rarity:'comum',value:'</>',preview:'</>'},
    {id:'badge-security',name:'Emblema Segurança',description:'Emblema para quem explora cibersegurança.',price:260,type:'badge',category:'emblemas',rarity:'raro',value:'🛡️',preview:'🛡️'},
    {id:'badge-explorer-30',name:'Emblema Explorador 30%',description:'Disponível após conhecer 30% do portal e concluir atividades válidas.',price:600,type:'badge',category:'emblemas',rarity:'épico',value:'30%',preview:'30%',unlock:{coverage:30,validActivities:5}},
    {id:'badge-specialist-70',name:'Emblema Especialista 70%',description:'Marca de domínio multidisciplinar.',price:1450,type:'badge',category:'emblemas',rarity:'lendário',value:'70%',preview:'70%',unlock:{coverage:70,validActivities:18}},
    {id:'badge-master-100',name:'Emblema Mestre 100%',description:'Emblema mítico disponível somente após visitar todas as ferramentas.',price:3000,type:'badge',category:'emblemas',rarity:'mítico',value:'100%',preview:'100%',unlock:{coverage:100,validActivities:40}},
    {id:'clan-founder',name:'Emblema Fundador de Clã',description:'Item de prestígio para o perfil e futuras equipes locais.',price:2500,type:'badge',category:'emblemas',rarity:'lendário',value:'◆',preview:'◆',unlock:{coverage:80,validActivities:24}},

    {id:'aura-pixel',name:'Aura Pixel',description:'Pequenas partículas quadradas ao redor do avatar.',price:280,type:'aura',category:'efeitos',rarity:'raro',value:'pixel',preview:'▪'},
    {id:'aura-orbit',name:'Aura Orbital',description:'Anel luminoso em torno do perfil.',price:980,type:'aura',category:'efeitos',rarity:'épico',value:'orbit',preview:'◉',unlock:{coverage:50,validActivities:10}},
    {id:'aura-cyberstorm',name:'Aura Tempestade Cibernética',description:'Efeito lendário com energia e faíscas controladas.',price:2200,type:'aura',category:'efeitos',rarity:'lendário',value:'cyberstorm',preview:'ϟ',unlock:{coverage:80,validActivities:24}},
    {id:'aura-convergence',name:'Aura Convergência',description:'Aura mítica liberada apenas ao explorar 100% da plataforma.',price:4800,type:'aura',category:'efeitos',rarity:'mítico',value:'convergence',preview:'∞',unlock:{coverage:100,validActivities:40}},

    {id:'celebration-jump',name:'Comemoração — Salto',description:'O avatar salta ao concluir uma atividade válida.',price:80,type:'celebration',category:'animações',rarity:'comum',value:'jump',preview:'↑'},
    {id:'celebration-victory',name:'Comemoração — Vitória Tech',description:'Pose de vitória com brilho ao finalizar uma atividade.',price:240,type:'celebration',category:'animações',rarity:'raro',value:'victory',preview:'V'},
    {id:'celebration-confetti',name:'Comemoração — Pixels',description:'Chuva controlada de pixels coloridos.',price:620,type:'celebration',category:'animações',rarity:'épico',value:'pixel-confetti',preview:'✦',unlock:{coverage:30,validActivities:5}},
    {id:'celebration-orbit',name:'Comemoração — Órbita',description:'O avatar realiza um giro orbital com partículas.',price:1600,type:'celebration',category:'animações',rarity:'lendário',value:'orbit-spin',preview:'◎',unlock:{coverage:70,validActivities:18}},
    {id:'celebration-quantum',name:'Comemoração — Triunfo Quantum',description:'Animação mítica com expansão holográfica e emblema de vitória.',price:3400,type:'celebration',category:'animações',rarity:'mítico',value:'quantum-triumph',preview:'✹',unlock:{coverage:90,validActivities:32}},

    {id:'outfit-explorer',name:'Skin Explorador Neon',description:'Conjunto épico com moletom, calça cargo, tênis e visor.',price:900,type:'outfit',category:'skins',rarity:'épico',value:{hairStyle:'spike',topStyle:'dev-hoodie',bottomStyle:'tech-cargo',shoeStyle:'runner',eyewear:'neon-glasses',belt:'holo-belt'},preview:'EX',unlock:{coverage:30,validActivities:5}},
    {id:'outfit-fullstack',name:'Skin Full Stack',description:'Conjunto épico para quem conhece metade da plataforma.',price:1450,type:'outfit',category:'skins',rarity:'épico',value:{hairStyle:'wave',topStyle:'gradient-jacket',bottomStyle:'orbit-pants',shoeStyle:'magnetic-boots',eyewear:'ar-visor',backpack:'school-tech'},preview:'FS',unlock:{coverage:50,validActivities:10}},
    {id:'outfit-cyber-legend',name:'Skin Guardião Cibernético',description:'Conjunto lendário com armadura, luvas e mochila propulsora.',price:3000,type:'outfit',category:'skins',rarity:'lendário',value:{hairStyle:'holographic',topStyle:'cyber-armor',bottomStyle:'orbit-pants',shoeStyle:'quantum-boots',gloves:'cyber-gloves',belt:'holo-belt',backpack:'jetpack',eyewear:'ar-visor'},preview:'GC',unlock:{coverage:90,validActivities:32}},
    {id:'outfit-master-lab',name:'Skin Mestre do Lab Virtual',description:'Skin mítica que somente aparece para quem explorou todas as ferramentas e concluiu dezenas de atividades.',price:5200,type:'outfit',category:'skins',rarity:'mítico',value:{hairStyle:'holographic',topStyle:'master-armor',bottomStyle:'master-pants',shoeStyle:'quantum-boots',gloves:'cyber-gloves',belt:'master-belt',headwear:'master-crown',backpack:'jetpack',eyewear:'master-visor',aura:'convergence',badge:'100%'},preview:'100%',unlock:{coverage:100,validActivities:40}},

    {id:'arcade-15',name:'Passe Arcade — 15 minutos',description:'Tempo opcional para jogos quando o modo estudo protegido estiver ativo.',price:40,type:'gameTime',category:'arcade',rarity:'comum',value:15,consumable:true,preview:'15m'},
    {id:'arcade-30',name:'Passe Arcade — 30 minutos',description:'Sessão maior de jogos conquistada com estudo.',price:70,type:'gameTime',category:'arcade',rarity:'comum',value:30,consumable:true,preview:'30m'},
    {id:'arcade-60',name:'Passe Arcade — 60 minutos',description:'Uma hora de jogos no modo estudo protegido.',price:120,type:'gameTime',category:'arcade',rarity:'raro',value:60,consumable:true,preview:'60m'}
  ];

  const avatarDefaults={
    skin:'#d9a879',hair:'#18243d',shirt:'#2f7df6',pants:'#1e3a8a',shoes:'#111827',
    hairStyle:'short',topStyle:'basic-shirt',bottomStyle:'basic-pants',shoeStyle:'basic-shoes',
    gloves:'',belt:'',accessory:'',eyewear:'',headwear:'',backpack:'',mascot:'',frame:'cyan',badge:'',aura:'',celebration:''
  };

  const equippedDefaults={
    frame:'starter-frame',theme:null,mascot:null,accessory:null,hairStyle:null,top:null,bottom:null,shoes:null,
    gloves:null,belt:null,eyewear:null,headwear:null,backpack:null,badge:null,aura:null,celebration:null,outfit:null,hairColor:null,shirtColor:null
  };

  const defaults=()=>({
    schemaVersion:SCHEMA,
    profile:{name:'Estudante',studentClass:'Turma não informada',avatar:{...avatarDefaults},createdAt:new Date().toISOString()},
    xp:0,techCredits:250,tempPoints:0,
    achievements:{},inventory:['starter-frame'],equipped:{...equippedDefaults},
    records:{},completed:{},rewardLedger:{},labsUsed:{},toolProgress:{},coverageMilestones:{},history:[],
    settings:{graphics:'auto',sound:false,music:false,focusMode:false,sensoryReduced:false,readingMode:false,colorVision:'default',studyGateGames:false},
    wallet:{version:2,deviceId:'',transactions:[],arcadeMinutes:0},badges:[],bugReports:[],lastUpdated:new Date().toISOString()
  });

  let state=defaults(),initialized=false,initPromise=null,saveTimer=null;
  const clone=value=>JSON.parse(JSON.stringify(value));
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,Number(n)||0));
  const toolCatalog=()=>Array.isArray(window.LABDS.TOOLS)?window.LABDS.TOOLS:[];
  const currentTool=()=>window.LABDS.App?.getState?.().currentTool||null;
  const removedToolIds=()=>new Set((window.LABDS.REMOVED_TOOL_IDS||[]).map(id=>String(id).toLowerCase()));
  function isRemovedTool(value){const id=String(value||'').toLowerCase();return removedToolIds().has(id)||id.includes('iara');}
  function cleanToolMap(value){if(!value||typeof value!=='object')return{};return Object.fromEntries(Object.entries(value).filter(([id,item])=>!isRemovedTool(id)&&!isRemovedTool(item?.toolId)));}
  function cleanCompleted(value){if(!value||typeof value!=='object')return{};return Object.fromEntries(Object.entries(value).filter(([id,item])=>!isRemovedTool(id)&&!isRemovedTool(item?.toolId)));}
  function cleanHistory(value){return Array.isArray(value)?value.filter(item=>!isRemovedTool(item?.meta?.toolId)&&!isRemovedTool(item?.toolId)&&!/iara/i.test(String(item?.message||''))).slice(-700):[];}

  function sanitize(input){
    const base=defaults(),raw=input&&typeof input==='object'?input:{},profile=raw.profile&&typeof raw.profile==='object'?raw.profile:{};
    const rawAvatar=profile.avatar&&typeof profile.avatar==='object'?profile.avatar:{};
    return {
      ...base,...raw,schemaVersion:SCHEMA,
      profile:{...base.profile,...profile,avatar:{...avatarDefaults,...rawAvatar},name:String(profile.name||base.profile.name).slice(0,80),studentClass:String(profile.studentClass||base.profile.studentClass).slice(0,100)},
      xp:clamp(raw.xp,0,10_000_000),techCredits:clamp(raw.techCredits,0,1_000_000),tempPoints:clamp(raw.tempPoints,-100_000,100_000),
      achievements:raw.achievements&&typeof raw.achievements==='object'?raw.achievements:{},
      inventory:Array.isArray(raw.inventory)?[...new Set(['starter-frame',...raw.inventory.map(String)])].slice(0,500):base.inventory,
      equipped:{...equippedDefaults,...(raw.equipped||{})},records:raw.records&&typeof raw.records==='object'?raw.records:{},
      completed:cleanCompleted(raw.completed),rewardLedger:raw.rewardLedger&&typeof raw.rewardLedger==='object'?raw.rewardLedger:{},
      labsUsed:cleanToolMap(raw.labsUsed),toolProgress:cleanToolMap(raw.toolProgress),
      coverageMilestones:raw.coverageMilestones&&typeof raw.coverageMilestones==='object'?raw.coverageMilestones:{},history:cleanHistory(raw.history),
      settings:{...base.settings,...(raw.settings||{})},wallet:{...base.wallet,...(raw.wallet||{}),transactions:Array.isArray(raw.wallet?.transactions)?raw.wallet.transactions.slice(-700):[]},
      badges:Array.isArray(raw.badges)?[...new Set(raw.badges.map(String))].slice(0,150):[],bugReports:Array.isArray(raw.bugReports)?raw.bugReports.slice(-100):[]
    };
  }

  function emit(type,detail={}){
    (listeners.get(type)||[]).forEach(fn=>{try{fn(detail);}catch(error){console.warn('[V3 event]',error);}});
    document.dispatchEvent(new CustomEvent(`labds:v3:${type}`,{detail}));
  }
  function on(type,fn){if(!listeners.has(type))listeners.set(type,[]);listeners.get(type).push(fn);return()=>off(type,fn);}
  function off(type,fn){const list=listeners.get(type)||[];listeners.set(type,list.filter(item=>item!==fn));}
  async function persist(){state.lastUpdated=new Date().toISOString();await window.LABDS.Storage?.set?.(STORAGE_KEY,state);emit('change',getSnapshot());return true;}
  function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>persist(),120);}
  function levelInfo(xp=state.xp){let current=LEVELS[0],next=null;for(let i=0;i<LEVELS.length;i++){if(xp>=LEVELS[i].xp)current=LEVELS[i];else{next=LEVELS[i];break;}}const span=next?next.xp-current.xp:1;return {...current,next,progress:next?clamp((xp-current.xp)/span*100,0,100):100};}
  function addHistory(type,message,meta={}){state.history.push({id:crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`,type,message:String(message).slice(0,300),meta,at:new Date().toISOString()});state.history=state.history.slice(-700);}

  function platformEconomy(){
    const tools=toolCatalog();
    const byLevel={basic:0,intermediate:0,advanced:0,other:0};
    let firstValidatedUseCredits=0;
    for(const tool of tools){const level=TOOL_FIRST_COMPLETION_REWARDS[tool.level]?'basic intermediate advanced'.split(' ').find(key=>key===tool.level):'other';byLevel[level]=(byLevel[level]||0)+1;firstValidatedUseCredits+=TOOL_FIRST_COMPLETION_REWARDS[tool.level]||20;}
    const milestoneCredits=COVERAGE_MILESTONES.reduce((sum,item)=>sum+item.credits,0);
    return {toolCount:tools.length,byLevel,firstValidatedUseCredits,milestoneCredits,startingCredits:250,referenceTotal:firstValidatedUseCredits+milestoneCredits+250};
  }

  function coverageStats(){
    const ids=new Set(toolCatalog().map(tool=>tool.id));
    const exploredIds=Object.keys(state.labsUsed).filter(id=>ids.has(id));
    const validatedIds=Object.entries(state.toolProgress).filter(([id,item])=>ids.has(id)&&Number(item?.validCompletions)>0).map(([id])=>id);
    const total=Math.max(1,ids.size);
    const coverage=Math.floor(exploredIds.length/total*100);
    const validatedCoverage=Math.floor(validatedIds.length/total*100);
    const nextMilestone=COVERAGE_MILESTONES.find(item=>coverage<item.percent)||null;
    return {total,exploredCount:exploredIds.length,validatedCount:validatedIds.length,coverage,validatedCoverage,validActivities:Object.keys(state.completed).length,nextMilestone,milestones:clone(state.coverageMilestones)};
  }

  function gainXP(amount,reason='Atividade concluída',uniqueId=''){
    amount=Math.round(clamp(amount,0,5000));
    if(!amount)return{awarded:0};
    if(uniqueId&&state.rewardLedger[uniqueId])return{awarded:0,duplicate:true};
    if(uniqueId)state.rewardLedger[uniqueId]=new Date().toISOString();
    const before=levelInfo();state.xp+=amount;addHistory('xp',`+${amount} XP — ${reason}`,{amount,reason,uniqueId});
    const after=levelInfo();if(after.level>before.level)emit('levelup',{before,after});scheduleSave();emit('reward',{kind:'xp',amount,reason});return{awarded:amount,level:after};
  }

  function walletTransaction(kind,amount,reason,meta={}){
    if(!state.wallet.deviceId)state.wallet.deviceId=crypto.randomUUID?.()||`device-${Date.now()}`;
    state.wallet.transactions.push({id:crypto.randomUUID?.()||String(Date.now()),kind,amount,reason,meta,at:new Date().toISOString(),balance:state.techCredits});
    state.wallet.transactions=state.wallet.transactions.slice(-700);
  }

  function addCredits(amount,reason='Recompensa',meta={}){
    amount=Math.round(clamp(amount,-100000,100000));
    const before=state.techCredits;state.techCredits=clamp(state.techCredits+amount,0,1_000_000);const delta=state.techCredits-before;
    if(delta){walletTransaction(delta>0?'credit':'debit',delta,reason,meta);addHistory('credits',`${delta>0?'+':''}${delta} Créditos Tech — ${reason}`,{amount:delta,reason,...meta});scheduleSave();emit('reward',{kind:'credits',amount:delta,reason});}
    return delta;
  }
  function spendCredits(amount,reason='Compra',meta={}){amount=Math.round(clamp(amount,0,1_000_000));if(state.techCredits<amount)return false;addCredits(-amount,reason,meta);return true;}
  function addTempPoints(amount,reason='Desafio'){state.tempPoints=clamp(state.tempPoints+Number(amount||0),-100000,100000);addHistory('temp',`${amount>=0?'+':''}${amount} pontos temporários — ${reason}`);scheduleSave();return state.tempPoints;}

  function unlockAchievement(id){if(!ACHIEVEMENTS[id]||state.achievements[id])return false;state.achievements[id]={unlockedAt:new Date().toISOString()};addHistory('achievement',`Conquista desbloqueada: ${ACHIEVEMENTS[id].title}`,{id});scheduleSave();emit('achievement',{id,...ACHIEVEMENTS[id]});return true;}

  function checkCoverageMilestones(){
    const stats=coverageStats();
    for(const milestone of COVERAGE_MILESTONES){
      const key=String(milestone.percent);
      if(stats.coverage>=milestone.percent&&!state.coverageMilestones[key]){
        state.coverageMilestones[key]={at:new Date().toISOString(),credits:milestone.credits};
        addCredits(milestone.credits,`Marco de exploração: ${milestone.percent}% da plataforma`,{coverage:milestone.percent});
        unlockAchievement(milestone.achievement);
      }
    }
  }

  function rewardEstimate(complexity='standard',actions=0,toolId=''){
    const table={quick:{xp:15,credits:10},standard:{xp:35,credits:20},complex:{xp:70,credits:35},advanced:{xp:110,credits:50},capstone:{xp:180,credits:80}};
    const base=table[complexity]||table.standard,bonus=Math.min(20,Math.max(0,Math.floor(Number(actions||0)/4)*2));
    const tool=toolCatalog().find(item=>item.id===toolId);
    const levelBonus=tool?.level==='advanced'?8:tool?.level==='intermediate'?4:0;
    return{xp:base.xp,credits:base.credits+bonus+levelBonus};
  }

  function complete(id,{xp=0,credits=0,achievement=null,reason='Atividade concluída',complexity='standard',actions=0,toolId=''}={}){
    if(state.completed[id])return{duplicate:true};
    const activeTool=toolId?toolCatalog().find(item=>item.id===toolId):currentTool();
    const resolvedToolId=activeTool?.id||toolId||'';
    if(!xp&&!credits){const estimated=rewardEstimate(complexity,actions,resolvedToolId);xp=estimated.xp;credits=estimated.credits;}
    state.completed[id]={at:new Date().toISOString(),reason,complexity,actions,toolId:resolvedToolId};
    let firstToolBonus=0;
    if(resolvedToolId){
      const progress=state.toolProgress[resolvedToolId]||{validCompletions:0,firstAt:new Date().toISOString()};
      if(Number(progress.validCompletions||0)===0){
        firstToolBonus=TOOL_FIRST_COMPLETION_REWARDS[activeTool?.level]||20;
        addCredits(firstToolBonus,`Primeira atividade validada em ${activeTool?.shortName||activeTool?.name||resolvedToolId}`,{toolId:resolvedToolId,firstValidatedUse:true});
      }
      progress.validCompletions=Number(progress.validCompletions||0)+1;progress.lastAt=new Date().toISOString();progress.name=activeTool?.name||resolvedToolId;
      state.toolProgress[resolvedToolId]=progress;
    }
    if(xp)gainXP(xp,reason,`complete:${id}`);
    if(credits)addCredits(credits,reason,{toolId:resolvedToolId,complexity,actions});
    if(achievement)unlockAchievement(achievement);
    if(Object.keys(state.completed).length===1)unlockAchievement('first_lab');
    scheduleSave();
    const detail={id,toolId:resolvedToolId,xp,credits,firstToolBonus,reason,complexity,celebration:state.profile.avatar.celebration||''};
    emit('completion',detail);
    return{ok:true,...detail};
  }

  function recordLabUse(tool){
    if(!tool?.id)return;
    const item=state.labsUsed[tool.id]||{count:0,firstAt:new Date().toISOString()};item.count++;item.lastAt=new Date().toISOString();item.name=tool.name;state.labsUsed[tool.id]=item;
    addHistory('lab',`Acesso: ${tool.name}`,{toolId:tool.id});
    if(Object.keys(state.labsUsed).length>=10)unlockAchievement('explorer');
    checkCoverageMilestones();scheduleSave();
  }

  function setRecord(game,value){const current=Number(state.records[game]||0);if(Number(value)>current){state.records[game]=Number(value);scheduleSave();return true;}return false;}
  function setProfile(update){state.profile={...state.profile,...update,avatar:{...state.profile.avatar,...(update.avatar||{})}};scheduleSave();return clone(state.profile);}
  function syncSession(){const session=window.LABDS.Session?.get?.();if(session)setProfile({name:session.studentName,studentClass:session.studentClass});}

  function getItemUnlockState(item){
    const stats=coverageStats(),level=levelInfo().level,requirements=item.unlock||{},reasons=[];
    if(requirements.coverage&&stats.coverage<requirements.coverage)reasons.push(`Explore ${requirements.coverage}% da plataforma (${stats.coverage}% atual)`);
    if(requirements.validActivities&&stats.validActivities<requirements.validActivities)reasons.push(`Conclua ${requirements.validActivities} atividades válidas (${stats.validActivities} atual)`);
    if(requirements.level&&level<requirements.level)reasons.push(`Alcance o nível ${requirements.level}`);
    if(Array.isArray(requirements.achievements))for(const achievement of requirements.achievements)if(!state.achievements[achievement])reasons.push(`Desbloqueie ${ACHIEVEMENTS[achievement]?.title||achievement}`);
    return{unlocked:reasons.length===0,reasons,requirements,coverage:stats.coverage,validActivities:stats.validActivities};
  }

  function buyItem(id){
    const item=STORE_ITEMS.find(entry=>entry.id===id);if(!item)return{ok:false,error:'Item inexistente.'};
    const unlock=getItemUnlockState(item);if(!unlock.unlocked)return{ok:false,error:unlock.reasons.join(' • '),locked:true};
    if(item.starter)return{ok:false,error:'Este item já faz parte do perfil inicial.'};
    if(!item.consumable&&state.inventory.includes(id))return{ok:false,error:'Este item já pertence ao inventário.'};
    if(!spendCredits(item.price,`Compra: ${item.name}`,{itemId:id,rarity:item.rarity}))return{ok:false,error:'Créditos Tech insuficientes.'};
    if(item.type==='gameTime')state.wallet.arcadeMinutes=clamp((state.wallet.arcadeMinutes||0)+Number(item.value||0),0,10000);
    else{
      state.inventory.push(id);
      if(item.type==='badge'&&!state.badges.includes(id))state.badges.push(id);
      if(state.inventory.filter(itemId=>!STORE_ITEMS.find(entry=>entry.id===itemId)?.starter).length>=10)unlockAchievement('collector');
    }
    addHistory('store',`Item adquirido: ${item.name}`,{id,rarity:item.rarity});scheduleSave();emit('purchase',{item});return{ok:true,item};
  }

  function applyItemToAvatar(item){
    const avatar=state.profile.avatar;
    if(item.type==='frame')avatar.frame=item.value;
    else if(item.type==='accessory')avatar.accessory=item.value;
    else if(item.type==='mascot')avatar.mascot=item.value;
    else if(item.type==='hairStyle')avatar.hairStyle=item.value;
    else if(item.type==='hairColor')avatar.hair=item.value;
    else if(item.type==='shirtColor')avatar.shirt=item.value;
    else if(item.type==='top')avatar.topStyle=item.value;
    else if(item.type==='bottom')avatar.bottomStyle=item.value;
    else if(item.type==='shoes')avatar.shoeStyle=item.value;
    else if(item.type==='gloves')avatar.gloves=item.value;
    else if(item.type==='belt')avatar.belt=item.value;
    else if(item.type==='eyewear')avatar.eyewear=item.value;
    else if(item.type==='headwear')avatar.headwear=item.value;
    else if(item.type==='backpack')avatar.backpack=item.value;
    else if(item.type==='badge')avatar.badge=item.value;
    else if(item.type==='aura')avatar.aura=item.value;
    else if(item.type==='celebration')avatar.celebration=item.value;
    else if(item.type==='outfit'&&item.value&&typeof item.value==='object')Object.assign(avatar,item.value);
    else if(item.type==='theme')document.documentElement.dataset.v3Theme=item.value;
  }

  function equipItem(id){
    const item=STORE_ITEMS.find(entry=>entry.id===id);if(!item||!state.inventory.includes(id)||item.consumable)return false;
    state.equipped[item.type]=id;applyItemToAvatar(item);scheduleSave();emit('equip',{item});return true;
  }

  function consumeArcadeMinute(reason='Uso do Arcade'){if((state.wallet.arcadeMinutes||0)<=0)return false;state.wallet.arcadeMinutes=clamp(state.wallet.arcadeMinutes-1,0,10000);walletTransaction('arcade-minute',-1,reason);addHistory('arcade',`-1 minuto Arcade — ${reason}`);scheduleSave();emit('arcade',{remaining:state.wallet.arcadeMinutes});return true;}
  function walletExport(){return{schema:'labds-wallet-proof',version:2,generatedAt:new Date().toISOString(),deviceId:state.wallet.deviceId,balance:state.techCredits,arcadeMinutes:state.wallet.arcadeMinutes||0,coverage:coverageStats(),transactions:clone(state.wallet.transactions)};}

  function settings(update){state.settings={...state.settings,...update};applySettings();scheduleSave();return clone(state.settings);}
  function applySettings(){
    const root=document.documentElement;root.dataset.graphics=state.settings.graphics;window.LABDS.PerformanceManager?.apply?.(state.settings.graphics);
    const themeItem=STORE_ITEMS.find(item=>item.id===state.equipped.theme);root.dataset.v3Theme=themeItem?.value||'default';
    root.classList.toggle('focus-mode',Boolean(state.settings.focusMode));root.classList.toggle('sensory-reduced',Boolean(state.settings.sensoryReduced));root.classList.toggle('reading-mode',Boolean(state.settings.readingMode));root.dataset.colorVision=state.settings.colorVision||'default';
  }

  function reportBug(report){const safe={id:crypto.randomUUID?.()||String(Date.now()),version:window.LABDS.VERSION,at:new Date().toISOString(),toolId:String(report.toolId||''),message:String(report.message||'').slice(0,4000),steps:String(report.steps||'').slice(0,4000),expected:String(report.expected||'').slice(0,3000),actual:String(report.actual||'').slice(0,3000),device:{userAgent:navigator.userAgent,screen:`${screen.width}x${screen.height}`,viewport:`${innerWidth}x${innerHeight}`,online:navigator.onLine,graphics:state.settings.graphics},lastHistory:state.history.slice(-10)};state.bugReports.push(safe);state.bugReports=state.bugReports.slice(-100);scheduleSave();return safe;}
  function exportProgress(){unlockAchievement('first_export');return{type:'lab-virtual-ds-v3-progress',schemaVersion:SCHEMA,version:window.LABDS.VERSION,exportedAt:new Date().toISOString(),data:clone(state)};}
  async function importProgress(payload){if(payload?.type!=='lab-virtual-ds-v3-progress'||!payload.data)throw new Error('Arquivo de progresso incompatível.');state=sanitize(payload.data);applySettings();await persist();return getSnapshot();}

  function getSnapshot(){
    return clone({...state,levelInfo:levelInfo(),coverage:coverageStats(),economy:platformEconomy(),achievementsCatalog:ACHIEVEMENTS,storeItems:STORE_ITEMS,rarityOrder:RARITY_ORDER,coverageMilestoneCatalog:COVERAGE_MILESTONES});
  }

  async function init(){
    if(initialized)return getSnapshot();
    if(initPromise)return initPromise;
    initPromise=(async()=>{
      const saved=await window.LABDS.Storage?.get?.(STORAGE_KEY,null);state=sanitize(saved);syncSession();applySettings();
      document.addEventListener('labds:toolopen',event=>recordLabUse(event.detail?.tool));
      window.addEventListener('error',event=>{if(event.error?.message)addHistory('error',event.error.message,{source:event.filename,line:event.lineno});});
      window.addEventListener('unhandledrejection',event=>addHistory('error',String(event.reason?.message||event.reason||'Falha assíncrona')));
      initialized=true;checkCoverageMilestones();await persist();return getSnapshot();
    })();
    try{return await initPromise;}finally{if(!initialized)initPromise=null;}
  }

  window.LABDS.Core={
    init,on,off,emit,persist,getSnapshot,levelInfo,gainXP,addCredits,spendCredits,addTempPoints,unlockAchievement,
    complete,recordLabUse,setRecord,setProfile,syncSession,buyItem,equipItem,getItemUnlockState,rewardEstimate,
    coverageStats,platformEconomy,consumeArcadeMinute,walletExport,settings,applySettings,reportBug,exportProgress,importProgress,
    ACHIEVEMENTS,STORE_ITEMS,COVERAGE_MILESTONES,TOOL_FIRST_COMPLETION_REWARDS,RARITY_ORDER
  };
})();
