const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const CYBER_OPS_URL_PARAMS = new URLSearchParams(location.search);
const CYBER_OPS_HASH_PARAMS = new URLSearchParams(location.hash.replace(/^#/, ''));
const CYBER_OPS_EMBEDDED = CYBER_OPS_URL_PARAMS.get('embedded') === '1';
const CYBER_OPS_LABDS_SESSION = String(CYBER_OPS_HASH_PARAMS.get('session') || '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 80);
const STORAGE_KEY = CYBER_OPS_EMBEDDED && CYBER_OPS_LABDS_SESSION
  ? `labds.cyber_ops_shadow_grid_v6.${CYBER_OPS_LABDS_SESSION}`
  : 'cyber_ops_shadow_grid_v6';
const LEGACY_STORAGE_KEYS = CYBER_OPS_EMBEDDED ? [] : ['cyber_ops_shadow_grid_v4', 'cyber_ops_shadow_grid_v2'];
const BOOT_LOGS = [
  'Inicializando a malha segura Shadow Grid...',
  'Sincronizando satélites táticos e sensores periféricos...',
  'Montando o cofre de evidências temporárias...',
  'Ativando matriz de resposta a incidentes...',
  'Verificando canais de vídeo, rede e criptoanálise...',
  'Credenciais prontas. Acesso liberado para o agente.'
];

const difficultyRules = {
  recruta: {
    key: 'recruta',
    label: 'Recruta // Assistido',
    brief: 'Missões com mais contexto visual, pressão moderada, menos distrações e até 3 pistas.',
    hints: 3,
    wrongThreat: 7,
    eventMin: 16,
    eventMax: 24,
    scoreMultiplier: 1,
    threatStart: 18
  },
  agente: {
    key: 'agente',
    label: 'Agente // Tático',
    brief: 'Missões intermediárias com mais ruído, dados misturados, tempo menor e até 2 pistas.',
    hints: 2,
    wrongThreat: 10,
    eventMin: 14,
    eventMax: 21,
    scoreMultiplier: 1.25,
    threatStart: 24
  },
  especialista: {
    key: 'especialista',
    label: 'Especialista // Operação Crítica',
    brief: 'Missões densas, com pressão alta, dados ambíguos, armadilhas narrativas e apenas 1 pista.',
    hints: 1,
    wrongThreat: 14,
    eventMin: 12,
    eventMax: 18,
    scoreMultiplier: 1.55,
    threatStart: 32
  }
};

const campaignTimeline = [
  {
    missionId: 'eclipse-black', chapter: 1, moduleId: 'incident-response',
    title: 'Fase 1 — Eclipse Negro',
    hook: 'Uma empresa financeira fictícia sofre criptografia em massa. A equipe precisa conter o incidente, preservar evidências e restaurar serviços com segurança.',
    suspense: 'A telemetria indica que o incidente pode evoluir para uma sobrecarga coordenada na borda da rede.',
    after: 'A contenção revelou uma infraestrutura de comando distribuída. A próxima fase do módulo investiga a tempestade de pacotes.'
  },
  {
    missionId: 'packet-phantom', chapter: 2, moduleId: 'incident-response',
    title: 'Fase 2 — Pacote Fantasma',
    hook: 'Uma sobrecarga coordenada tenta cegar os sensores de uma infraestrutura urbana fictícia. O objetivo é identificar o fluxo dominante e manter os serviços essenciais.',
    suspense: 'Falhas de rede, sensores inoperantes e rotas falsas podem surgir durante a análise.',
    after: 'O módulo de Resposta a Incidentes foi estabilizado. As operações podem ser repetidas em qualquer dificuldade.'
  },
  {
    missionId: 'ghost-sentinel', chapter: 1, moduleId: 'human-intelligence',
    title: 'Fase 1 — Sentinela Fantasma',
    hook: 'Uma intrusão física fictícia aparece nos registros de CFTV. O agente deve cruzar horários, acessos e uma conversa interceptada em outro idioma.',
    suspense: 'Uma escolha inadequada pode alertar o suspeito e comprometer a investigação.',
    after: 'O rastro físico aponta para uma tentativa de engenharia social contra uma tesouraria digital simulada.'
  },
  {
    missionId: 'spectral-vault', chapter: 2, moduleId: 'human-intelligence',
    title: 'Fase 2 — Cofre Espectral',
    hook: 'Mensagens falsas, pressão psicológica e transações BTC-LAB formam uma fraude simulada. O agente precisa reconhecer o golpe e preservar a trilha.',
    suspense: 'O adversário usa portunhol, urgência artificial e identidades falsas para confundir a equipe.',
    after: 'O módulo de Investigação e Inteligência Humana foi concluído com a carteira fictícia protegida.'
  },
  {
    missionId: 'grey-cipher', chapter: 1, moduleId: 'cryptointel',
    title: 'Fase 1 — Código Cinza',
    hook: 'Um mecanismo lógico de persistência utiliza bits, código Morse e mensagens fragmentadas. O agente precisa decodificar o padrão antes da reexecução.',
    suspense: 'O sistema pode entrar em modo inoperante, apagar registros temporários ou simular uma descoberta da investigação.',
    after: 'O núcleo lógico foi neutralizado. A fase seguinte simula uma operação global independente e mais complexa.'
  },
  {
    missionId: 'chimera-zero', chapter: 2, moduleId: 'cryptointel',
    title: 'Fase 2 — Quimera Zero',
    hook: 'Uma operação global fictícia combina rede, documentos, engenharia social, códigos e decisões de contenção. Todas as instituições e bancos de dados são simulados.',
    suspense: 'O agente deverá distinguir dados confiáveis, mensagens traduzidas e rotas de sincronização falsas.',
    after: 'O módulo de Criptointeligência e Operações Globais foi concluído. Nenhuma conexão externa real foi realizada.'
  }
];

const missionModules = [
  {
    id: 'incident-response', code: 'MOD-IR', title: 'Resposta a Incidentes', icon: '🛡', color: '#14dfff',
    description: 'Ransomware, disponibilidade, análise de tráfego, contenção e recuperação segura.',
    missions: ['eclipse-black', 'packet-phantom']
  },
  {
    id: 'human-intelligence', code: 'MOD-HUMINT', title: 'Investigação e Inteligência Humana', icon: '◎', color: '#ffc857',
    description: 'CFTV, controle de acesso, engenharia social, rastreamento simulado e conversas multilíngues.',
    missions: ['ghost-sentinel', 'spectral-vault']
  },
  {
    id: 'cryptointel', code: 'MOD-CRYPT', title: 'Criptointeligência e Operações Globais', icon: '◇', color: '#a77bff',
    description: 'Lógica, binário, Morse, tradução, integridade de dados e coordenação internacional fictícia.',
    missions: ['grey-cipher', 'chimera-zero']
  }
];

const tutorialSlides = [
  { title: '1. Escolha um módulo', text: 'Resposta a Incidentes, Inteligência Humana e Criptointeligência podem ser iniciados em qualquer ordem. A progressão acontece apenas dentro do módulo escolhido.' },
  { title: '2. Leia o briefing', text: 'Cada operação apresenta contexto, risco, objetivos, tempo e aviso de simulação. Instituições, satélites, telefonia e bancos de dados não possuem conexão real.' },
  { title: '3. Use a ferramenta da fase', text: 'Analise rede, pacotes, documentos, CFTV, carteira BTC-LAB, mensagens, tradução, códigos e decisões de contenção.' },
  { title: '4. Libere informações aos poucos', text: 'Converse com a central, faça pesquisas táticas ou use pistas. Cada apoio reduz parte da pontuação e nunca precisa aparecer todo de uma vez.' },
  { title: '5. Feche a operação', text: 'Ao concluir, exporte a evidência e abra o Google Classroom. A fase seguinte do mesmo módulo será liberada; os outros módulos continuam disponíveis.' }
];

const worldLocations = [
  { city: 'Curitiba', country: 'Brasil', region: 'América do Sul', site: 'Centro de Dados Araucária' },
  { city: 'São Paulo', country: 'Brasil', region: 'América do Sul', site: 'Hub Financeiro Paulista' },
  { city: 'Rio de Janeiro', country: 'Brasil', region: 'América do Sul', site: 'Centro Costeiro de Comunicações' },
  { city: 'Lisboa', country: 'Portugal', region: 'Europa', site: 'Nó Atlântico de Inteligência' },
  { city: 'Londres', country: 'Reino Unido', region: 'Europa', site: 'Distrito Financeiro Thames' },
  { city: 'Berlim', country: 'Alemanha', region: 'Europa', site: 'Centro Europeu de Resposta' },
  { city: 'Paris', country: 'França', region: 'Europa', site: 'Arquivo Diplomático Seine' },
  { city: 'Madrid', country: 'Espanha', region: 'Europa', site: 'Rede Ibérica de Segurança' },
  { city: 'Roma', country: 'Itália', region: 'Europa', site: 'Centro Mediterrâneo de Operações' },
  { city: 'Nova York', country: 'Estados Unidos', region: 'América do Norte', site: 'Financial District Cyber Hub' },
  { city: 'Washington', country: 'Estados Unidos', region: 'América do Norte', site: 'Centro Federal Fictício de Segurança' },
  { city: 'Montreal', country: 'Canadá', region: 'América do Norte', site: 'Laboratório Boreal de Criptografia' },
  { city: 'Tóquio', country: 'Japão', region: 'Ásia', site: 'Nó Shibuya de Controle Digital' },
  { city: 'Seul', country: 'Coreia do Sul', region: 'Ásia', site: 'Centro Han de Defesa Cibernética' },
  { city: 'Singapura', country: 'Singapura', region: 'Ásia', site: 'Porto Digital Merlion' },
  { city: 'Dubai', country: 'Emirados Árabes Unidos', region: 'Oriente Médio', site: 'Torre Fictícia de Ativos Digitais' },
  { city: 'Istambul', country: 'Turquia', region: 'Oriente Médio', site: 'Ponte Eurasiana de Dados' },
  { city: 'Cairo', country: 'Egito', region: 'África e Oriente Médio', site: 'Centro Nilo de Telecomunicações' },
  { city: 'Nairóbi', country: 'Quênia', region: 'África', site: 'Hub Africano de Resposta' },
  { city: 'Cidade do Cabo', country: 'África do Sul', region: 'África', site: 'Estação Atlântica de Monitoramento' },
  { city: 'Sydney', country: 'Austrália', region: 'Oceania', site: 'Centro Pacífico de Operações' },
  { city: 'Buenos Aires', country: 'Argentina', region: 'América do Sul', site: 'Rede Plata de Inteligência' },
  { city: 'Santiago', country: 'Chile', region: 'América do Sul', site: 'Estação Andina de Segurança' }
];

const factions = {
  cyberOps: { name: 'CYBER OPS', emblem: 'CO', description: 'Coalizão internacional fictícia de defesa e investigação cibernética.' },
  nexusUmbra: { name: 'NEXUS UMBRA', emblem: 'NU', description: 'Facção rival que combina extorsão digital, sabotagem e desinformação.' },
  glassJackal: { name: 'CHACAL DE VIDRO', emblem: 'CJ', description: 'Rede de corretores de acesso e identidades roubadas.' },
  sentinelNine: { name: 'SENTINELA NOVE', emblem: 'S9', description: 'Célula clandestina de infiltradores físicos e operadores de vigilância.' }
};

const characters = {
  helena: { name: 'Comandante Helena Voss', faction: 'CYBER OPS', avatar: 'HV' },
  ravi: { name: 'Analista Ravi Nunes', faction: 'CYBER OPS', avatar: 'RN' },
  amina: { name: 'Agente Amina Haddad', faction: 'CYBER OPS', avatar: 'AH' },
  arconte: { name: 'Arconte Zero', faction: 'NEXUS UMBRA', avatar: 'A0' },
  jackal: { name: 'Chacal de Vidro', faction: 'CHACAL DE VIDRO', avatar: 'CJ' },
  sentinel: { name: 'Operador Nove', faction: 'SENTINELA NOVE', avatar: '09', language: 'Português' },
  diego: { name: 'Inspetor Diego Rocha', faction: 'LIGAÇÃO PF-LAB', avatar: 'DR', language: 'Português (Brasil)' },
  mason: { name: 'Agente Ethan Mason', faction: 'FEDERAL CYBER LAB', avatar: 'EM', language: 'English / Português' },
  mei: { name: 'Analista Mei Tanaka', faction: 'PACIFIC CYBER LAB', avatar: 'MT', language: 'Português / 日本語' },
  sofia: { name: 'Agente Sofía Benítez', faction: 'REDE LATAM-LAB', avatar: 'SB', language: 'Portunhol' },
  volkov: { name: 'Fonte Viktor Volkov', faction: 'CANAL EXTERNO', avatar: 'VV', language: 'Русский' }
};

const globalCriticalEvents = [
  { text: 'ATAQUE DUPLO // Dois vetores foram ativados simultaneamente.', threat: 10, loss: 90000, time: 15, kind: 'double' },
  { text: 'DESTRUIÇÃO DE PROVAS // Logs temporários começaram a desaparecer.', threat: 9, loss: 70000, time: 10, kind: 'erase' },
  { text: 'CONTRAINTELIGÊNCIA // O adversário percebeu sua investigação.', threat: 11, loss: 110000, time: 18, kind: 'counter' },
  { text: 'VAZAMENTO PARCIAL // Um lote de dados fictícios foi publicado.', threat: 8, loss: 130000, time: 8, kind: 'leak' },
  { text: 'FALHA DE SENSOR // O radar perdeu parte da telemetria.', threat: 7, loss: 60000, time: 12, kind: 'sensor' },
  { text: 'ALERTA GLOBAL // Um novo ponto de ataque apareceu em outro continente.', threat: 12, loss: 150000, time: 20, kind: 'global' },
  { text: 'FALHA DE REDE // O enlace principal ficou indisponível e a central migrou para uma rota simulada.', threat: 7, loss: 45000, time: 12, kind: 'network-failure' },
  { text: 'SISTEMA INOPERANTE // Uma ferramenta ficou temporariamente bloqueada para verificação de integridade.', threat: 8, loss: 55000, time: 10, kind: 'tool-lock' },
  { text: 'RISCO DE DESCOBERTA // O adversário percebeu uma consulta fora do padrão.', threat: 10, loss: 80000, time: 15, kind: 'exposure' },
  { text: 'EXTORSÃO SIMULADA // Uma nova exigência em BTC-LAB foi publicada no canal do incidente.', threat: 9, loss: 120000, time: 8, kind: 'extortion' }
];

const missionTutorialSlides = [
  { title: 'Briefing em campo', text: 'Observe o nome da operação, a cidade e o objetivo atual. Todos os locais são reais, mas os incidentes são totalmente fictícios.' },
  { title: 'Ferramenta ativa', text: 'Toque nos equipamentos, pacotes, documentos ou registros. A resposta não fica pronta no texto: você precisa cruzar os indicadores.' },
  { title: 'Pressão operacional', text: 'O cronômetro, a ameaça e o prejuízo mudam enquanto você investiga. Eventos críticos podem reduzir seu tempo.' },
  { title: 'Painel tático', text: 'Use Objetivo, Evidências e Comms para reconstruir a história. Pistas são limitadas conforme a dificuldade.' },
  { title: 'Validação', text: 'Depois de selecionar uma hipótese, pressione o botão de validação. Erros elevam o risco e podem alterar a história da missão.' }
];

function chooseWorldLocation(missionId) {
  const salt = [...missionId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const day = Math.floor(Date.now() / 86400000);
  return worldLocations[(salt + day) % worldLocations.length];
}

function formatWorldLocation(location) {
  return `${location.city}, ${location.country} // ${location.site}`;
}

function buildCutscenes(missionId, phase = 'pre') {
  const chapter = getCampaignChapter(missionId);
  const location = currentWorldLocation || chooseWorldLocation(missionId);
  const pre = {
    'eclipse-black': [
      { speaker: characters.helena, mood: 'mystery', text: `Agente, uma holding financeira em ${location.city} perdeu o controle de seus servidores. A nota de extorsão apareceu antes que o centro de operações recebesse qualquer alarme.` },
      { speaker: characters.diego, mood: 'danger', text: 'Sou o inspetor Diego, da ligação PF-LAB. A base policial exibida no painel é cenográfica; use apenas os indicadores locais para preservar a cadeia de evidências.' },
      { speaker: characters.helena, mood: 'mystery', text: `Entre no ${location.site}, preserve as evidências e descubra o que a Nexus Umbra realmente quer.` }
    ],
    'packet-phantom': [
      { speaker: characters.ravi, mood: 'danger', text: `O rastro de Eclipse Negro reapareceu em ${location.city}. Agora ele está misturado a um ataque DDoS que tenta cegar os sensores urbanos.` },
      { speaker: characters.mason, mood: 'mystery', text: 'Federal Cyber Lab speaking. O painel FBI-LAB é totalmente simulado. Foque na taxa, repetição e destino dos pacotes para separar ataque de tráfego legítimo.' },
      { speaker: characters.helena, mood: 'danger', text: 'Encontre o fluxo dominante. Cada segundo de atraso deixa outro serviço crítico sem proteção.' }
    ],
    'ghost-sentinel': [
      { speaker: characters.amina, mood: 'mystery', text: `As câmeras de ${location.city} registraram uma pessoa usando um crachá incompatível com o setor. Ela passou pela sala segura durante o ataque à rede.` },
      { speaker: characters.volkov, mood: 'danger', text: 'Проверьте северный вход в девятнадцать часов. Курьер будет с синим пропуском.' },
      { speaker: characters.mei, mood: 'mystery', text: 'A fonte falou em russo. Não presuma o significado: preserve horário, direção e identificadores e use o decodificador local.' },
      { speaker: characters.helena, mood: 'danger', text: 'Cruze CFTV e logs. Descubra quem entrou e o que estava procurando.' }
    ],
    'spectral-vault': [
      { speaker: characters.jackal, mood: 'mystery', text: 'Uma senha vale pouco. Uma pessoa com medo entrega muito mais.' },
      { speaker: characters.sofia, mood: 'danger', text: `Oye, agente: la tesouraria fictícia em ${location.city} recebeu mensagens falsas. Está todo mezclado em portunhol para gerar pressa e confusión.` },
      { speaker: characters.helena, mood: 'danger', text: 'Encontre a peça de engenharia social, siga as transações e feche o cofre antes da próxima drenagem.' }
    ],
    'grey-cipher': [
      { speaker: characters.ravi, mood: 'mystery', text: `Os fragmentos do cofre apontam para o ${location.site}. Lá está o Grey Cipher: um mecanismo de persistência criado para trancar sistemas e apagar rastros.` },
      { speaker: characters.mei, mood: 'mystery', text: 'A transmissão mistura matriz binária e Morse. Resolva uma camada por vez; o tradutor local preserva o conteúdo sem consultar serviços externos.' },
      { speaker: characters.helena, mood: 'danger', text: 'Resolva a matriz e neutralize o gatilho. Se falharmos, a operação final começa.' }
    ],
    'chimera-zero': [
      { speaker: characters.helena, mood: 'danger', text: 'Alerta máximo. Ataques simultâneos foram confirmados em vários continentes. Bancos, centros urbanos e redes de comunicação estão sendo pressionados ao mesmo tempo.' },
      { speaker: characters.arconte, mood: 'danger', text: 'Bem-vindo à Quimera Zero. Cada cabeça que você cortar fará outra surgir em outra cidade.' },
      { speaker: characters.amina, mood: 'mystery', text: `O centro de comando móvel está operando a partir de ${location.city}. Os painéis NASA-LAB, FBI-LAB, Interpol-LAB e PF-LAB apenas simulam verificação de integridade.` },
      { speaker: characters.helena, mood: 'danger', text: 'Esta é a missão final. Se o Arconte completar a sincronização, a campanha inteira se repete em escala global.' }
    ]
  };
  const post = {
    'eclipse-black': [
      { speaker: characters.ravi, mood: 'victory', text: 'O ambiente voltou, mas encontramos uma assinatura no túnel de exfiltração: Nexus Umbra.' },
      { speaker: characters.helena, mood: 'mystery', text: 'Eles não queriam apenas dinheiro. Queriam medir quanto tempo levaríamos para reagir.' }
    ],
    'packet-phantom': [
      { speaker: characters.amina, mood: 'victory', text: 'O flood foi reduzido. Durante a distração, uma porta segura foi aberta em outro ponto da cidade.' },
      { speaker: characters.helena, mood: 'mystery', text: 'O módulo de Resposta a Incidentes foi concluído. Os outros módulos permanecem independentes e disponíveis.' }
    ],
    'ghost-sentinel': [
      { speaker: characters.ravi, mood: 'mystery', text: 'O crachá clonado estava ligado a um operador financeiro. A intrusão física abriu caminho para uma carteira digital.' },
      { speaker: characters.helena, mood: 'danger', text: 'A primeira fase deste módulo foi concluída. A próxima investiga a fraude contra o cofre digital.' }
    ],
    'spectral-vault': [
      { speaker: characters.ravi, mood: 'victory', text: 'A carteira foi congelada e a trilha preservada. O módulo de Inteligência Humana está concluído.' },
      { speaker: characters.arconte, mood: 'mystery', text: 'Vocês seguiram as pistas exatamente como eu esperava.' }
    ],
    'grey-cipher': [
      { speaker: characters.helena, mood: 'victory', text: 'O núcleo cinza caiu. Mas a última transmissão já foi enviada.' },
      { speaker: characters.arconte, mood: 'danger', text: 'Quimera Zero está acordada. Procure por mim em todas as cidades ao mesmo tempo.' }
    ],
    'chimera-zero': [
      { speaker: characters.arconte, mood: 'danger', text: 'Impossível... vocês quebraram a sincronização.' },
      { speaker: characters.helena, mood: 'victory', text: 'Quimera Zero foi neutralizada. Todos os setores confirmam recuperação.' },
      { speaker: characters.amina, mood: 'victory', text: 'A central preparou uma cerimônia. O agente que chegou até aqui não será lembrado apenas por uma pontuação.' }
    ]
  };
  return (phase === 'post' ? post : pre)[missionId] || [
    { speaker: characters.helena, mood: 'mystery', text: chapter?.hook || 'Uma nova operação foi autorizada.' }
  ];
}


function getCampaignChapter(missionId) {
  return campaignTimeline.find((item) => item.missionId === missionId);
}

function getMissionModule(missionId) {
  return missionModules.find((module) => module.missions.includes(missionId)) || missionModules[0];
}

function getActiveModule() {
  return missionModules.find((module) => module.id === state.activeModule) || missionModules[0];
}

function isMissionUnlocked(missionId) {
  const module = getMissionModule(missionId);
  const index = module.missions.indexOf(missionId);
  if (index <= 0) return true;
  return Boolean(state.completed[module.missions[index - 1]]);
}

function getCurrentCampaignIndex() {
  return campaignTimeline.findIndex((item) => !state.completed[item.missionId]);
}

function getModuleProgress(moduleId) {
  const module = missionModules.find((item) => item.id === moduleId) || missionModules[0];
  const completed = module.missions.filter((missionId) => state.completed[missionId]).length;
  return { completed, total: module.missions.length, percent: Math.round((completed / module.missions.length) * 100) };
}


function createMissions() {
  return [
    {
      id: 'eclipse-black',
      code: 'OP-ECL-09',
      title: 'Operação Eclipse Negro',
      subtitle: 'Ransomware no datacenter financeiro',
      classification: 'SIGILO NÍVEL RUBRO',
      location: 'NOVA AURORA // DATACENTER OESTE',
      color: '#12dfff',
      map: { x: '20%', y: '33%' },
      synopsis: 'Uma holding financeira sofreu criptografia em massa. Você precisa encontrar o ponto inicial, bloquear a exfiltração e restaurar a cópia segura antes do vazamento.',
      skills: ['Rede', 'Pacotes', 'Backup', 'Resposta a incidentes'],
      variants: {
        recruta: {
          timeLimit: 480,
          threatStart: 20,
          initialLoss: 120000,
          briefing: 'Às 07:19 a matriz de pagamentos da empresa LumenPay ficou indisponível. Uma nota de extorsão em BTC-LAB surgiu em 12 hosts. Há risco de vazamento de contratos e chaves de integração.',
          objectives: [
            'Isolar o host que iniciou a propagação.',
            'Encontrar o fluxo de exfiltração antes do bloqueio total.',
            'Selecionar a cópia íntegra do backup.',
            'Escolher a ação final de contenção.'
          ],
          events: [
            { text: 'ALERTA // O invasor tentou apagar snapshots antigos.', threat: 6, loss: 85000 },
            { text: 'SENSOR // Nova estação entrou em modo de criptografia.', threat: 5, loss: 65000 },
            { text: 'COMMS // Financeiro relata fila de pagamentos bloqueada.', threat: 4, loss: 40000 }
          ],
          steps: [
            {
              id: 'ecl-net-r',
              type: 'network',
              title: 'Mapa de propagação',
              instruction: 'Selecione o equipamento que deve ser isolado primeiro. Observe o horário de login e os fluxos laterais.',
              hint: 'O host correto iniciou comunicação com o servidor SQL minutos antes da criptografia geral e também tocou o storage de backup.',
              evidence: 'Host WS-13 identificado como ponto inicial da propagação após login remoto comprometido.',
              correct: 'ws13',
              nodes: [
                { id: 'vpn', x: 16, y: 34, label: 'VPN-EDGE', detail: 'Conexões externas', alert: false },
                { id: 'ws13', x: 32, y: 24, label: 'WS-13', detail: 'Suporte terceirizado // login 07:12', alert: true },
                { id: 'sql', x: 54, y: 28, label: 'SQL-CLUSTER', detail: 'ERP financeiro', alert: false },
                { id: 'backup', x: 70, y: 48, label: 'BACKUP-02', detail: 'Snapshots horários', alert: false },
                { id: 'mail', x: 34, y: 66, label: 'MAIL-GW', detail: 'Gateway interno', alert: false },
                { id: 'hr', x: 58, y: 72, label: 'HR-PORTAL', detail: 'Portal RH', alert: false }
              ],
              links: [['vpn', 'ws13'], ['ws13', 'sql'], ['ws13', 'backup'], ['sql', 'hr'], ['mail', 'ws13'], ['sql', 'backup']]
            },
            {
              id: 'ecl-packet-r',
              type: 'packet',
              title: 'Fluxo de exfiltração',
              instruction: 'Selecione o fluxo mais suspeito para bloqueio imediato.',
              hint: 'Procure um tráfego fora do padrão do ambiente, com volume alto e destino não usual logo após a nota de extorsão.',
              evidence: 'Fluxo HTTPS 10.0.7.13 → 203.0.113.19 identificado como canal de exfiltração.',
              correct: 'pkt5',
              filters: ['TODOS', 'TCP', 'HTTPS', 'INTERNO', 'EXTERNO'],
              packets: [
                { id: 'pkt1', time: '07:20:09', source: '10.0.1.14', target: '10.0.1.30', protocol: 'SMB', size: '18 KB', note: 'Sincronização de pasta' },
                { id: 'pkt2', time: '07:20:16', source: '10.0.2.6', target: '10.0.1.9', protocol: 'HTTPS', size: '22 KB', note: 'API contábil' },
                { id: 'pkt3', time: '07:20:24', source: '10.0.7.13', target: '10.0.1.20', protocol: 'RDP', size: '6 KB', note: 'Sessão administrativa' },
                { id: 'pkt4', time: '07:20:28', source: '10.0.3.14', target: '10.0.2.2', protocol: 'DNS', size: '3 KB', note: 'Consulta local' },
                { id: 'pkt5', time: '07:20:31', source: '10.0.7.13', target: '203.0.113.19', protocol: 'HTTPS', size: '820 MB', note: 'Upload contínuo', risk: true },
                { id: 'pkt6', time: '07:20:52', source: '10.0.2.15', target: '10.0.1.8', protocol: 'MQTT', size: '8 KB', note: 'Telemetria' }
              ]
            },
            {
              id: 'ecl-doc-r',
              type: 'document',
              title: 'Manifestos de backup',
              instruction: 'Abra os manifestos e marque a cópia íntegra para restauração.',
              hint: 'A cópia correta deve ser anterior ao ataque, conter hash válido e não registrar alteração após 07:10.',
              evidence: 'Snapshot BK-2026-07-28-0600 selecionado como base íntegra para restauração.',
              correct: 'bk3',
              documents: [
                { id: 'bk1', name: 'manifesto_0700.txt', title: 'Manifesto BK-0700', text: 'Base: pagamentos, contratos, clientes. Última modificação: 07:17. Integridade parcial.', author: 'daemon.auto', created: '07:00', signature: 'MATCH 71%', risk: true, stamp: 'REVISAR' },
                { id: 'bk2', name: 'manifesto_0630.txt', title: 'Manifesto BK-0630', text: 'Base: pagamentos, contratos, clientes. Snapshot iniciado 06:30. Erro ao fechar índice de contratos.', author: 'backup.job', created: '06:30', signature: 'MATCH 93%', risk: true, stamp: 'ALERTA' },
                { id: 'bk3', name: 'manifesto_0600.txt', title: 'Manifesto BK-0600', text: 'Base: pagamentos, contratos, clientes. Snapshot offline concluído sem divergência. Nenhum índice fora do padrão.', author: 'backup.job', created: '06:00', signature: 'HASH OK // MATCH 100%', clue: true, stamp: 'ÍNTEGRO' }
              ]
            },
            {
              id: 'ecl-choice-r',
              type: 'choice',
              title: 'Plano de contenção',
              instruction: 'Escolha a ação final mais segura para a continuidade do serviço.',
              hint: 'A melhor resposta preserva evidências, bloqueia o vazamento e restaura o ambiente a partir da cópia íntegra.',
              evidence: 'Rede segmentada, fluxo bloqueado e restauração iniciada a partir do snapshot íntegro com credenciais rotacionadas.',
              correct: 'contain_restore',
              options: [
                { id: 'pay', label: 'Pagar o resgate', detail: 'Gera chave supostamente válida e não exige restauração.' },
                { id: 'wipe', label: 'Formatar todos os hosts afetados', detail: 'Interrompe a operação mas destrói evidências importantes.' },
                { id: 'contain_restore', label: 'Segmentar a rede, bloquear o canal, restaurar do backup íntegro e rotacionar credenciais', detail: 'Preserva a investigação e reduz a chance de reinfecção.' },
                { id: 'ignore', label: 'Aguardar estabilização do sistema', detail: 'Mantém operação em produção durante o incidente.' }
              ]
            }
          ]
        },
        agente: {
          timeLimit: 420,
          threatStart: 28,
          initialLoss: 180000,
          briefing: 'A LumenPay agora relata também atividade lateral sobre o cofre de chaves. O atacante executou tarefas programadas e iniciou compressão seletiva em contratos premium.',
          objectives: [
            'Descobrir o host pivot entre VPN e storage.',
            'Marcar o túnel de exfiltração mascarado.',
            'Selecionar o backup válido sem assinatura corrompida.',
            'Escolher a sequência final de contenção.'
          ],
          events: [
            { text: 'ALERTA // O adversário acionou tarefa de limpeza de logs.', threat: 8, loss: 120000 },
            { text: 'CRISE // Contratos premium começaram a ser compactados.', threat: 7, loss: 90000 },
            { text: 'RISCO // O gateway SQL perdeu mais dois índices de busca.', threat: 6, loss: 70000 }
          ],
          steps: [
            {
              id: 'ecl-net-a', type: 'network', title: 'Pivot de infecção', instruction: 'Selecione o host pivot que conectou VPN, storage e nó de tarefas.', hint: 'O pivot mantém conexões simultâneas com storage, scheduler e borda.', evidence: 'Host APP-22 identificado como pivot da invasão.', correct: 'app22',
              nodes: [
                { id: 'vpn2', x: 12, y: 24, label: 'VPN-02', detail: 'Acesso terceirizado', alert: false },
                { id: 'mail2', x: 24, y: 63, label: 'MX-11', detail: 'Fluxo de e-mail', alert: false },
                { id: 'app22', x: 36, y: 33, label: 'APP-22', detail: 'Agendador híbrido // 07:11', alert: true },
                { id: 'vault', x: 56, y: 20, label: 'KEY-VAULT', detail: 'Cofre de chaves', alert: false },
                { id: 'stor', x: 60, y: 56, label: 'STORAGE-09', detail: 'Volume de snapshots', alert: false },
                { id: 'sql2', x: 78, y: 36, label: 'SQL-02', detail: 'Segmento de billing', alert: false },
                { id: 'sched', x: 76, y: 74, label: 'TASK-SRV', detail: 'Tarefas programadas', alert: false }
              ],
              links: [['vpn2','app22'],['mail2','app22'],['app22','vault'],['app22','stor'],['app22','sched'],['stor','sql2'],['sched','sql2']]
            },
            {
              id: 'ecl-packet-a', type: 'packet', title: 'Canal mascarado', instruction: 'Identifique o fluxo camuflado como atualização de telemetria.', hint: 'O fluxo correto usa TLS como os demais, porém possui volume fora de escala e destino recém-observado.', evidence: 'Fluxo 10.4.2.22 → 198.51.100.88 marcado como túnel mascarado.', correct: 'pkt4', filters: ['TODOS','TLS','BILLING','SNAPSHOT','EXTERNO'],
              packets: [
                { id: 'pkt1', time: '07:24:11', source: '10.4.2.7', target: '10.4.2.9', protocol: 'TLS', size: '18 KB', note: 'Heartbeat cluster' },
                { id: 'pkt2', time: '07:24:22', source: '10.4.7.14', target: '10.4.2.7', protocol: 'SFTP', size: '12 MB', note: 'Replicação rotina' },
                { id: 'pkt3', time: '07:24:39', source: '10.4.2.22', target: '10.4.2.18', protocol: 'HTTPS', size: '4 MB', note: 'Painel interno' },
                { id: 'pkt4', time: '07:24:42', source: '10.4.2.22', target: '198.51.100.88', protocol: 'TLS', size: '1.1 GB', note: 'telemetry-sync', risk: true },
                { id: 'pkt5', time: '07:24:58', source: '10.4.6.11', target: '10.4.2.14', protocol: 'DNS', size: '2 KB', note: 'Resolver interno' }
              ]
            },
            {
              id: 'ecl-doc-a', type: 'document', title: 'Cópias de recuperação', instruction: 'Marque a cópia que não sofreu reabertura após o início da intrusão.', hint: 'A cópia válida é a única offline, fechada antes de 07:00 e sem reindexação posterior.', evidence: 'Snapshot OFFLINE-0555 validado para recuperação.', correct: 'doc2', documents: [
                { id: 'doc1', name: 'daily_0620.md', title: 'Backup 06:20', text: 'Snapshot quente. Reindexação parcial às 07:18 por daemon.task.', author: 'ops.backup', created: '06:20', signature: 'ASSINATURA DUPLA', risk: true, stamp: 'CORROMPIDO' },
                { id: 'doc2', name: 'offline_0555.md', title: 'Backup 05:55', text: 'Snapshot frio offline. Catálogo sem divergência. Última assinatura encerrada às 05:58.', author: 'ops.backup', created: '05:55', signature: 'HASH VERDE // 100%', clue: true, stamp: 'ÍNTEGRO' },
                { id: 'doc3', name: 'mirror_0640.md', title: 'Backup 06:40', text: 'Espelho de contingência. Índice de clientes reaplicado às 07:13.', author: 'ops.mirror', created: '06:40', signature: 'MATCH 87%', risk: true, stamp: 'REVISAR' }
              ]
            },
            {
              id: 'ecl-choice-a', type: 'choice', title: 'Resposta coordenada', instruction: 'Defina a melhor sequência de resposta.', hint: 'A decisão correta combina contenção, preservação de logs, restauração e troca de segredos.', evidence: 'Segmentação, bloqueio de túnel, restauração segura e rotação de segredos aprovadas.', correct: 'seq3', options: [
                { id: 'seq1', label: 'Derrubar datacenter inteiro e reiniciar do zero', detail: 'Reduz atividade porém remove visibilidade da intrusão.' },
                { id: 'seq2', label: 'Restaurar backup sem bloquear o túnel primeiro', detail: 'Aumenta a chance de reinfecção e novo vazamento.' },
                { id: 'seq3', label: 'Isolar pivot, bloquear túnel, preservar logs, restaurar backup íntegro e rotacionar segredos', detail: 'A resposta reduz impacto e sustenta a investigação.' },
                { id: 'seq4', label: 'Esperar a extorsão terminar para negociar', detail: 'Mantém a exposição ativa e amplia o prejuízo.' }
              ]
            }
          ]
        },
        especialista: {
          timeLimit: 360,
          threatStart: 35,
          initialLoss: 260000,
          briefing: 'Além do ransomware, há indício de dupla extorsão com compressão seletiva, criação de contas temporárias e sabotagem do catálogo de restauração. A janela para resposta é estreita.',
          objectives: ['Isolar o pivô verdadeiro entre múltiplos candidatos.', 'Descobrir o túnel cifrado camuflado.', 'Selecionar a cópia fria consistente.', 'Executar a única sequência de resposta que minimiza danos.'],
          events: [
            { text: 'CRÍTICO // O atacante iniciou destruição de evidências auxiliares.', threat: 10, loss: 160000 },
            { text: 'VAZAMENTO // Contratos sensíveis começaram a sair em lotes.', threat: 9, loss: 130000 },
            { text: 'BLOQUEIO // Um novo job de criptografia atingiu o storage secundário.', threat: 8, loss: 110000 }
          ],
          steps: [
            {
              id: 'ecl-net-e', type: 'network', title: 'Nó pivô', instruction: 'Entre os diversos candidatos, marque o host que fecha o triângulo VPN, vault e scheduler.', hint: 'Observe quem se conecta simultaneamente aos três setores e não apenas a dois.', evidence: 'Host CORE-17 marcado como pivô principal.', correct: 'core17', nodes: [
                { id: 'vpn3', x: 12, y: 30, label: 'VPN-EDGE', detail: 'Borda externa', alert: false },
                { id: 'mail3', x: 22, y: 68, label: 'MAIL-13', detail: 'Fila SMTP', alert: false },
                { id: 'core17', x: 37, y: 36, label: 'CORE-17', detail: 'Runtime híbrido // 07:09', alert: true },
                { id: 'app31', x: 42, y: 68, label: 'APP-31', detail: 'Portal billing', alert: false },
                { id: 'vault3', x: 58, y: 18, label: 'VAULT-X', detail: 'Segredos ativos', alert: false },
                { id: 'stor3', x: 61, y: 50, label: 'SNAP-COLD', detail: 'Cold storage', alert: false },
                { id: 'sched3', x: 77, y: 70, label: 'TASK-HUB', detail: 'Job runner', alert: false },
                { id: 'sql3', x: 79, y: 36, label: 'SQL-PRM', detail: 'Ledger premium', alert: false }
              ], links: [['vpn3','core17'],['mail3','core17'],['core17','vault3'],['core17','stor3'],['core17','sched3'],['app31','stor3'],['app31','sql3'],['sched3','sql3'],['vault3','sql3']]
            },
            {
              id: 'ecl-packet-e', type: 'packet', title: 'Túnel cifrado', instruction: 'Marque o fluxo que se disfarça entre jobs de replicação.', hint: 'O fluxo correto sai da máquina pivô para ASN externo recém-observado e usa volume anômalo.', evidence: 'Túnel 10.8.4.17 → 192.0.2.166 destacado para corte.', correct: 'pkt6', filters: ['TODOS','TLS','SQL','TASKS','CROSS-DC','EXTERNO'], packets: [
                { id: 'pkt1', time: '07:18:04', source: '10.8.4.31', target: '10.8.4.48', protocol: 'TLS', size: '28 MB', note: 'Replicação fria' },
                { id: 'pkt2', time: '07:18:07', source: '10.8.4.17', target: '10.8.4.48', protocol: 'HTTPS', size: '18 MB', note: 'Painel interno' },
                { id: 'pkt3', time: '07:18:22', source: '10.8.4.9', target: '10.8.4.17', protocol: 'DNS', size: '1 KB', note: 'resolver' },
                { id: 'pkt4', time: '07:18:33', source: '10.8.4.40', target: '10.8.4.3', protocol: 'SFTP', size: '96 MB', note: 'envio legítimo' },
                { id: 'pkt5', time: '07:18:41', source: '10.8.4.17', target: '10.8.4.61', protocol: 'TLS', size: '12 MB', note: 'sync interno' },
                { id: 'pkt6', time: '07:18:46', source: '10.8.4.17', target: '192.0.2.166', protocol: 'TLS', size: '1.4 GB', note: 'snapshot-sync', risk: true }
              ]
            },
            {
              id: 'ecl-doc-e', type: 'document', title: 'Catálogo de restauração', instruction: 'Encontre a única cópia fria sem reabertura e com hash total.', hint: 'Só uma cópia traz catálogo fechado, índice de contratos estável e assinatura final íntegra.', evidence: 'Cold snapshot COLD-0540 selecionado.', correct: 'cold1', documents: [
                { id: 'hot2', name: 'restore_0610.log', title: 'Restore 06:10', text: 'Catálogo quente com reindexação às 07:14 e checksum parcial em ledger_contracts.', author: 'restore.hot', created: '06:10', signature: '74% MATCH', risk: true, stamp: 'ALTERADO' },
                { id: 'cold1', name: 'cold_0540.log', title: 'Cold Snapshot 05:40', text: 'Catálogo frio lacrado. Índices de contratos, pagamentos e KMS sem divergência. Nenhuma reabertura.', author: 'restore.cold', created: '05:40', signature: '100% MATCH // GREEN SEAL', clue: true, stamp: 'ÍNTEGRO' },
                { id: 'warm3', name: 'warm_0600.log', title: 'Warm Snapshot 06:00', text: 'Snapshot híbrido. Tabela de tokens reaplicada às 07:08 por runtime.service.', author: 'restore.warm', created: '06:00', signature: '88% MATCH', risk: true, stamp: 'REVISAR' }
              ]
            },
            {
              id: 'ecl-choice-e', type: 'choice', title: 'Ação crítica', instruction: 'Escolha a resposta que reduz dano, preserva prova e impede reinfecção.', hint: 'A alternativa correta bloqueia o túnel antes da restauração e considera rotação de segredos.', evidence: 'Plano crítico aprovado: corte do túnel, isolamento do pivô, preservação do vault e restauração fria.', correct: 'opt4', options: [
                { id: 'opt1', label: 'Restaurar primeiro, investigar depois', detail: 'Recupera parcialmente mas deixa o túnel aberto.' },
                { id: 'opt2', label: 'Desligar tudo, inclusive o cold storage', detail: 'Preserva menos dados e aumenta o downtime.' },
                { id: 'opt3', label: 'Negociar com o extorsionário e congelar pagamentos', detail: 'Não resolve a persistência e amplia o dano reputacional.' },
                { id: 'opt4', label: 'Isolar o pivô, cortar o túnel, preservar vault/logs, restaurar cold snapshot e rotacionar segredos', detail: 'Mitiga risco e reduz a chance de nova tomada do ambiente.' }
              ]
            }
          ]
        }
      }
    },
    {
      id: 'packet-phantom',
      code: 'OP-PKT-12',
      title: 'Operação Pacote Fantasma',
      subtitle: 'Ataque DDoS contra infraestrutura crítica',
      classification: 'SIGILO NÍVEL ÂMBAR',
      location: 'CIDADE ALVORADA // HUB METROPOLITANO',
      color: '#ffa24a',
      map: { x: '52%', y: '24%' },
      synopsis: 'Um ataque de negação de serviço derruba APIs públicas e painéis de monitoramento. É preciso achar o fluxo dominante, o gateway comprometido e a defesa correta.',
      skills: ['Tráfego', 'Gateway', 'Mitigação', 'Priorização'],
      variants: {
        recruta: {
          timeLimit: 420, threatStart: 22, initialLoss: 90000,
          briefing: 'O portal de serviços urbanos e o painel de mobilidade começaram a cair intermitentemente. A central suspeita de flood UDP vindo de múltiplos sensores falsos.',
          objectives: ['Descobrir o fluxo dominante do ataque.', 'Localizar o gateway mais comprometido.', 'Definir a resposta correta ao DDoS.'],
          events: [
            { text: 'ALERTA // Filas do portal cidadão cresceram 200%.', threat: 5, loss: 30000 },
            { text: 'SENSOR // Dois novos IPs aderiram ao flood.', threat: 6, loss: 35000 },
            { text: 'PRESSÃO // Painel de mobilidade perdeu telemetria.', threat: 5, loss: 28000 }
          ],
          steps: [
            { id: 'pkt-r-1', type: 'packet', title: 'Analisador de tráfego', instruction: 'Marque o fluxo que representa o ataque dominante.', hint: 'O ataque usa muito UDP, tamanho pequeno e enorme volume por segundo.', evidence: 'Flood UDP 172.16.4.99 → api.city.example identificado.', correct: 'd3', filters: ['TODOS','UDP','HTTPS','INTERNO','BORDA'], packets: [
              { id: 'd1', time: '16:40:03', source: '172.16.1.18', target: 'api.city.example', protocol: 'HTTPS', size: '44 KB', note: 'Consulta legítima' },
              { id: 'd2', time: '16:40:08', source: '172.16.2.7', target: 'cache.edge.example', protocol: 'TCP', size: '12 KB', note: 'Sincronização' },
              { id: 'd3', time: '16:40:09', source: '172.16.4.99', target: 'api.city.example', protocol: 'UDP', size: '512 B', note: '65.000 pps', risk: true },
              { id: 'd4', time: '16:40:14', source: '172.16.5.10', target: 'db.city.example', protocol: 'DNS', size: '2 KB', note: 'resolver' }
            ]},
            { id: 'pkt-r-2', type: 'network', title: 'Mapa dos gateways', instruction: 'Selecione o gateway saturado pela borda falsa.', hint: 'O gateway certo recebe o maior número de pulsos da nuvem de bots.', evidence: 'Gateway EDGE-03 selecionado para contenção.', correct: 'edge3', nodes: [
              { id: 'api', x: 76, y: 30, label: 'API-CITY', detail: 'Serviços públicos', alert: false },
              { id: 'edge1', x: 26, y: 22, label: 'EDGE-01', detail: 'Portal', alert: false },
              { id: 'edge2', x: 30, y: 58, label: 'EDGE-02', detail: 'Telemetria', alert: false },
              { id: 'edge3', x: 45, y: 38, label: 'EDGE-03', detail: 'API gateway // saturado', alert: true },
              { id: 'bots', x: 16, y: 80, label: 'BOT-CLOUD', detail: 'Origem difusa', alert: false },
              { id: 'traffic', x: 58, y: 68, label: 'CDN-LIGHT', detail: 'Cache legítimo', alert: false }
            ], links: [['bots','edge1'],['bots','edge2'],['bots','edge3'],['edge1','api'],['edge2','api'],['edge3','api'],['traffic','api']] },
            { id: 'pkt-r-3', type: 'choice', title: 'Mitigação', instruction: 'Escolha a ação mais apropriada para mitigar o DDoS sem derrubar tudo.', hint: 'A resposta correta filtra tráfego na borda e protege a API com rate limit e ACL.', evidence: 'Rate limit, ACL e upstream filtering aplicados com priorização da API pública.', correct: 'm3', options: [
              { id: 'm1', label: 'Desligar a API por tempo indeterminado', detail: 'Interrompe o serviço e não elimina a causa.' },
              { id: 'm2', label: 'Reiniciar o banco de dados principal', detail: 'Não atua sobre o flood.' },
              { id: 'm3', label: 'Aplicar upstream filtering, rate limit e ACL no gateway comprometido', detail: 'Reduz o impacto mantendo o serviço crítico.' },
              { id: 'm4', label: 'Bloquear todos os sensores metropolitanos', detail: 'Remove tráfego legítimo e causa perda operacional.' }
            ]}
          ]
        },
        agente: {
          timeLimit: 360, threatStart: 29, initialLoss: 130000,
          briefing: 'O ataque agora alterna UDP e HTTP GET flood, tentando ocultar o vetor principal. Serviços de mobilidade e semaforização digital já sofreram atraso.',
          objectives: ['Separar o fluxo misto dominante.', 'Marcar o gateway de borda correto.', 'Escolher a mitigação com prioridade operacional.'],
          events: [
            { text: 'CRISE // API de mobilidade ficou 70% indisponível.', threat: 7, loss: 48000 },
            { text: 'ALERTA // O atacante mudou parte do flood para HTTP GET.', threat: 8, loss: 52000 },
            { text: 'TRÂNSITO // Painel de semáforos perdeu sincronismo parcial.', threat: 7, loss: 43000 }
          ],
          steps: [
            { id: 'pkt-a-1', type: 'packet', title: 'Tráfego combinado', instruction: 'Identifique a assinatura predominante do ataque.', hint: 'Mesmo alternando protocolos, o fluxo dominante segue com altíssima taxa e origem repetitiva sobre a mesma API.', evidence: 'Assinatura mista GET flood / UDP burst identificada.', correct: 'f4', filters: ['TODOS','UDP','HTTP','API','EDGE'], packets: [
              { id: 'f1', time: '16:44:01', source: '172.20.1.11', target: 'mobility.api', protocol: 'HTTPS', size: '26 KB', note: 'Consulta app usuário' },
              { id: 'f2', time: '16:44:08', source: '172.20.8.21', target: 'mobility.api', protocol: 'HTTP', size: '4 KB', note: '32 req/s' },
              { id: 'f3', time: '16:44:14', source: '172.20.8.89', target: 'map.cache', protocol: 'UDP', size: '610 B', note: '200 pps' },
              { id: 'f4', time: '16:44:17', source: '172.20.8.21', target: 'mobility.api', protocol: 'HTTP/UDP', size: '620 B', note: '85.000 pps + 11.000 req/s', risk: true }
            ]},
            { id: 'pkt-a-2', type: 'network', title: 'Borda saturada', instruction: 'Marque o gateway que concentra o tráfego de ataque.', hint: 'A borda correta toca a CDN, a API e os bots ao mesmo tempo.', evidence: 'Gateway GATE-07 selecionado como foco de mitigação.', correct: 'gate7', nodes: [
              { id: 'gate5', x: 24, y: 26, label: 'GATE-05', detail: 'Borda leste', alert: false },
              { id: 'gate6', x: 24, y: 66, label: 'GATE-06', detail: 'Borda sul', alert: false },
              { id: 'gate7', x: 44, y: 38, label: 'GATE-07', detail: 'Borda metropolitana', alert: true },
              { id: 'cdn', x: 58, y: 68, label: 'CDN-EDGE', detail: 'Cache dinâmica', alert: false },
              { id: 'api2', x: 76, y: 28, label: 'MOBILITY-API', detail: 'API crítica', alert: false },
              { id: 'botnet', x: 14, y: 84, label: 'BOTNET-LAKE', detail: 'Origem dispersa', alert: false }
            ], links: [['botnet','gate5'],['botnet','gate6'],['botnet','gate7'],['gate7','api2'],['gate7','cdn'],['cdn','api2']] },
            { id: 'pkt-a-3', type: 'choice', title: 'Mitigação priorizada', instruction: 'Defina a resposta correta para o cenário atual.', hint: 'A melhor resposta combina filtros de borda com proteção da API crítica e priorização operacional.', evidence: 'Mitigação escalonada aplicada com proteção da API crítica.', correct: 'x2', options: [
              { id: 'x1', label: 'Desligar toda a borda e aguardar', detail: 'Paralisa serviços e não trata o aprendizado do ataque.' },
              { id: 'x2', label: 'Aplicar scrubbing/upstream filtering, ACL e challenge/rate-limit na API', detail: 'Reduz o dano mantendo os serviços essenciais.' },
              { id: 'x3', label: 'Migrar imediatamente o banco para outro datacenter', detail: 'Não elimina o flood.' },
              { id: 'x4', label: 'Bloquear todos os IPs públicos indiscriminadamente', detail: 'Remove acesso legítimo da população.' }
            ]}
          ]
        },
        especialista: {
          timeLimit: 300, threatStart: 36, initialLoss: 190000,
          briefing: 'O ataque alterna bursts sincronizados, explora falhas de cache e tenta mascarar parte do tráfego via sensores clonados. A cidade está a minutos de perder múltiplos painéis críticos.',
          objectives: ['Separar o burst dominante entre vários ruídos.', 'Identificar a borda que amplifica o ataque.', 'Escolher a mitigação crítica sem derrubar sistemas essenciais.'],
          events: [
            { text: 'CRÍTICO // Painel de incidentes urbanos saiu do ar.', threat: 9, loss: 62000 },
            { text: 'BOTNET // Novo burst mascarado via sensores clonados.', threat: 10, loss: 70000 },
            { text: 'RISCO // A borda cache começou a ecoar o flood.', threat: 8, loss: 56000 }
          ],
          steps: [
            { id: 'pkt-e-1', type: 'packet', title: 'Burst mascarado', instruction: 'Marque o burst dominante do ataque entre múltiplos fluxos parecidos.', hint: 'Observe a combinação de taxa, repetição e alvo crítico.', evidence: 'Burst combinado 10.31.8.77 → urban.core.example identificado.', correct: 'q5', filters: ['TODOS','UDP','HTTP','CACHE','SENSORES','EDGE'], packets: [
              { id: 'q1', time: '16:48:01', source: '10.31.2.14', target: 'urban.core.example', protocol: 'HTTP', size: '4 KB', note: '42 req/s' },
              { id: 'q2', time: '16:48:05', source: '10.31.9.40', target: 'cdn.edge', protocol: 'UDP', size: '640 B', note: '1.200 pps' },
              { id: 'q3', time: '16:48:09', source: '10.31.8.77', target: 'sensor.bus', protocol: 'MQTT', size: '2 KB', note: 'telemetria normal' },
              { id: 'q4', time: '16:48:16', source: '10.31.8.77', target: 'urban.core.example', protocol: 'HTTP', size: '4 KB', note: '7.000 req/s' },
              { id: 'q5', time: '16:48:18', source: '10.31.8.77', target: 'urban.core.example', protocol: 'HTTP/UDP', size: '640 B', note: '96.000 pps + 14.000 req/s', risk: true }
            ]},
            { id: 'pkt-e-2', type: 'network', title: 'Amplificação de borda', instruction: 'Selecione a borda que concentra e amplifica o flood.', hint: 'A borda correta conversa com cache, core e botnet ao mesmo tempo.', evidence: 'EDGE-K7 identificada como ponto de amplificação.', correct: 'k7', nodes: [
              { id: 'k5', x: 22, y: 24, label: 'EDGE-K5', detail: 'Borda oeste', alert: false },
              { id: 'k6', x: 22, y: 64, label: 'EDGE-K6', detail: 'Borda sul', alert: false },
              { id: 'k7', x: 44, y: 42, label: 'EDGE-K7', detail: 'Borda core-cache', alert: true },
              { id: 'core', x: 77, y: 26, label: 'URBAN-CORE', detail: 'Painéis críticos', alert: false },
              { id: 'cache2', x: 64, y: 69, label: 'CACHE-MESH', detail: 'Camada cache', alert: false },
              { id: 'clones', x: 14, y: 84, label: 'SENSOR-CLONES', detail: 'sensores falsos', alert: false }
            ], links: [['clones','k5'],['clones','k6'],['clones','k7'],['k7','core'],['k7','cache2'],['cache2','core']] },
            { id: 'pkt-e-3', type: 'choice', title: 'Mitigação crítica', instruction: 'Defina a resposta que melhor preserva serviço e investigação.', hint: 'Procure a resposta que trata a borda, a API e a amplificação por cache.', evidence: 'Scrubbing, ACL progressiva e contenção da amplificação em cache executados.', correct: 'z3', options: [
              { id: 'z1', label: 'Desligar o urban core e esperar estabilizar', detail: 'Interrompe serviços essenciais.' },
              { id: 'z2', label: 'Somente reiniciar a borda', detail: 'Não reduz o flood sustentado.' },
              { id: 'z3', label: 'Ativar scrubbing upstream, ACL progressiva, rate-limit e contenção da amplificação em cache', detail: 'Mitigação mais equilibrada.' },
              { id: 'z4', label: 'Bloquear o tráfego de sensores legítimos', detail: 'Cria dano operacional sem mitigar completamente.' }
            ]}
          ]
        }
      }
    },
    {
      id: 'ghost-sentinel',
      code: 'OP-SEN-07',
      title: 'Operação Sentinela Fantasma',
      subtitle: 'Invasão física e lógica na sala segura',
      classification: 'SIGILO NÍVEL PRATA',
      location: 'TORRE ORION // SETOR DE MONITORAMENTO',
      color: '#69ffb8',
      map: { x: '69%', y: '67%' },
      synopsis: 'A sala segura de uma empresa de defesa pode ter sido acessada por um crachá clonado. Você precisa cruzar CFTV, registros e definir a contenção.',
      skills: ['CFTV', 'Logs de acesso', 'Identidade', 'Resposta rápida'],
      variants: {
        recruta: {
          timeLimit: 390, threatStart: 20, initialLoss: 60000,
          briefing: 'Entre 20:10 e 20:22 alguém entrou no corredor da sala segura. Um crachá foi usado fora do perfil habitual e a equipe teme cópia de documentos sensíveis.',
          objectives: ['Escolher a câmera com o movimento suspeito.', 'Identificar o crachá fora do padrão.', 'Escolher a resposta de contenção.'],
          events: [
            { text: 'MOVIMENTO // Porta lateral detectou presença novamente.', threat: 5, loss: 22000 },
            { text: 'ALERTA // Um armário de contratos foi aberto.', threat: 6, loss: 26000 },
            { text: 'PRESSÃO // O suspeito pode ainda estar no edifício.', threat: 5, loss: 18000 }
          ],
          steps: [
            { id: 'sen-r-1', type: 'cctv', title: 'Central CFTV', instruction: 'Selecione a câmera que capturou o momento relevante do acesso indevido.', hint: 'A câmera correta mostra presença no corredor da sala segura exatamente no intervalo crítico.', evidence: 'Câmera C-04 mostrou deslocamento incomum na porta da sala segura.', correct: 'c4', cameras: [
              { id: 'c1', name: 'C-01 Recepção', time: '20:11:18', x: '34%', y: '58%', note: 'Fluxo comum de entrada' },
              { id: 'c2', name: 'C-02 Elevador', time: '20:13:42', x: '48%', y: '49%', note: 'Equipe de limpeza' },
              { id: 'c3', name: 'C-03 Corredor Norte', time: '20:15:03', x: '56%', y: '56%', note: 'Sem anomalia visível' },
              { id: 'c4', name: 'C-04 Sala Segura', time: '20:16:27', x: '68%', y: '44%', note: 'Pessoa com crachá oculto', mark: 1 }
            ]},
            { id: 'sen-r-2', type: 'document', title: 'Registros de acesso', instruction: 'Marque o registro de crachá que mais destoou do padrão.', hint: 'O crachá correto pertence a um colaborador que não atua naquele turno e foi usado próximo da sala segura.', evidence: 'Crachá ID-7741 identificado como uso fora de perfil.', correct: 'r2', documents: [
              { id: 'r1', name: 'badge_7710.log', title: 'Badge 7710', text: 'Usuário: Daniela Costa. Setor: limpeza. Horário: 20:13. Área: elevador. Padrão habitual.', author: 'access.sys', created: '20:13', signature: 'NORMAL', stamp: 'OK' },
              { id: 'r2', name: 'badge_7741.log', title: 'Badge 7741', text: 'Usuário: Mauro Neri. Setor: compras. Horário: 20:16. Área: sala segura. Uso fora do turno e área não autorizada.', author: 'access.sys', created: '20:16', signature: 'ALTA DIVERGÊNCIA', clue: true, risk: true, stamp: 'ALERTA' },
              { id: 'r3', name: 'badge_7792.log', title: 'Badge 7792', text: 'Usuário: Ana Ribeiro. Setor: TI. Horário: 20:18. Área: CPD. Registro habitual.', author: 'access.sys', created: '20:18', signature: 'NORMAL', stamp: 'OK' }
            ]},
            { id: 'sen-r-3', type: 'choice', title: 'Contenção', instruction: 'Qual é a melhor ação imediata?', hint: 'A melhor resposta bloqueia o crachá, preserva o vídeo e direciona a busca física.', evidence: 'Crachá bloqueado, vídeo preservado e setor isolado com busca interna.', correct: 'c', options: [
              { id: 'a', label: 'Apagar o vídeo e trocar a fechadura depois', detail: 'Destrói prova importante.' },
              { id: 'b', label: 'Ignorar pois o acesso já ocorreu', detail: 'Mantém o risco ativo.' },
              { id: 'c', label: 'Bloquear o crachá, preservar evidências e isolar a área', detail: 'Resposta adequada.' },
              { id: 'd', label: 'Mandar apenas um e-mail para a gerência', detail: 'Ação lenta para um incidente em andamento.' }
            ]}
          ]
        },
        agente: {
          timeLimit: 330, threatStart: 27, initialLoss: 88000,
          briefing: 'O crachá suspeito pode ser clonado e uma pen drive pode ter sido conectada na sala segura. O suspeito passou por mais de um corredor e há registros cruzados.',
          objectives: ['Escolher a câmera crítica.', 'Selecionar o registro que indica clonagem/uso indevido.', 'Definir a resposta correta.'],
          events: [
            { text: 'ALERTA // Um gabinete interno foi aberto.', threat: 7, loss: 28000 },
            { text: 'RISCO // Sinal de mídia removível detectado no setor.', threat: 8, loss: 34000 },
            { text: 'MISTÉRIO // O suspeito mudou de rota para o corredor sul.', threat: 6, loss: 23000 }
          ],
          steps: [
            { id: 'sen-a-1', type: 'cctv', title: 'CFTV multicâmeras', instruction: 'Selecione a câmera em que o suspeito se aproxima do gabinete seguro com item oculto.', hint: 'A câmera correta marca o corredor sul em horário coincidente com o registro divergente.', evidence: 'Câmera C-07 confirmou presença suspeita no corredor sul.', correct: 'c7', cameras: [
              { id: 'c5', name: 'C-05 Recepção técnica', time: '20:24:10', x: '30%', y: '60%', note: 'Equipe regular' },
              { id: 'c6', name: 'C-06 Corredor central', time: '20:25:02', x: '45%', y: '55%', note: 'Trânsito leve' },
              { id: 'c7', name: 'C-07 Corredor sul', time: '20:25:44', x: '66%', y: '42%', note: 'Volume oculto na mão direita', mark: 1 },
              { id: 'c8', name: 'C-08 CPD', time: '20:26:31', x: '54%', y: '48%', note: 'Técnico habitual' }
            ]},
            { id: 'sen-a-2', type: 'document', title: 'Trilha de crachá', instruction: 'Marque a identidade cuja trilha não condiz com o perfil do usuário.', hint: 'O registro correto mostra área atípica, horário incomum e incompatibilidade de setor.', evidence: 'Badge 8891 apontado como provável clonagem.', correct: 'a2', documents: [
              { id: 'a1', name: 'badge_8801.log', title: 'Badge 8801', text: 'Usuário: Leandro Matos. Setor TI. Corredor central. Tráfego rotineiro.', author: 'access.core', created: '20:24', signature: 'MATCH NORMAL', stamp: 'OK' },
              { id: 'a2', name: 'badge_8891.log', title: 'Badge 8891', text: 'Usuário: Sofia Luz. Setor Jurídico. Corredor sul e sala segura. Perfil incompatível com horário/área.', author: 'access.core', created: '20:25', signature: 'PADRÃO INCOMPATÍVEL', clue: true, risk: true, stamp: 'SUSPEITO' },
              { id: 'a3', name: 'badge_8817.log', title: 'Badge 8817', text: 'Usuário: Marco Reis. Facilities. Área de suporte. Trajeto esperado.', author: 'access.core', created: '20:26', signature: 'NORMAL', stamp: 'OK' }
            ]},
            { id: 'sen-a-3', type: 'choice', title: 'Resposta coordenada', instruction: 'Escolha a melhor resposta de contenção.', hint: 'A resposta correta envolve bloqueio, revista da área e preservação da mídia e do vídeo.', evidence: 'Setor bloqueado, mídia controlada e evidências preservadas.', correct: 'r3', options: [
              { id: 'r1', label: 'Somente notificar a gerência no dia seguinte', detail: 'Lento e insuficiente.' },
              { id: 'r2', label: 'Reiniciar os sistemas da sala segura', detail: 'Prejudica a prova e não contém o suspeito.' },
              { id: 'r3', label: 'Bloquear badge, isolar área, recolher mídia e preservar logs e vídeo', detail: 'Melhor resposta.' },
              { id: 'r4', label: 'Ignorar porque não houve confirmação facial', detail: 'Mantém risco ativo.' }
            ]}
          ]
        },
        especialista: {
          timeLimit: 285, threatStart: 34, initialLoss: 120000,
          briefing: 'Há indício de clonagem de crachá, possível mídia removível e desvio de rota deliberado. O suspeito pode ter acessado também o armário de contratos e a antecâmara do cofre digital.',
          objectives: ['Capturar a câmera mais decisiva.', 'Cruzar o registro verdadeiro de desvio.', 'Executar a contenção crítica.'],
          events: [
            { text: 'CRÍTICO // O gabinete de contratos foi acessado.', threat: 8, loss: 42000 },
            { text: 'INTRUSÃO // Mídia removível pode ter sido conectada no terminal.', threat: 9, loss: 47000 },
            { text: 'PRESSÃO // O suspeito pode estar saindo pelo corredor de contingência.', threat: 8, loss: 32000 }
          ],
          steps: [
            { id: 'sen-e-1', type: 'cctv', title: 'Corredores cruzados', instruction: 'Escolha a câmera que mostra o suspeito entrando na antecâmara do cofre digital.', hint: 'A câmera correta apresenta a rota de contingência e o item oculto.', evidence: 'Câmera C-11 revelou entrada indevida na antecâmara.', correct: 'c11', cameras: [
              { id: 'c9', name: 'C-09 Lobby', time: '20:31:02', x: '28%', y: '60%', note: 'Movimento comum' },
              { id: 'c10', name: 'C-10 Corredor leste', time: '20:31:55', x: '49%', y: '54%', note: 'Equipe regular' },
              { id: 'c11', name: 'C-11 Contingência', time: '20:32:27', x: '70%', y: '40%', note: 'Acesso com volume oculto', mark: 1 },
              { id: 'c12', name: 'C-12 Cofre digital', time: '20:33:08', x: '55%', y: '46%', note: 'Reflexo parcial na porta' }
            ]},
            { id: 'sen-e-2', type: 'document', title: 'Divergência de trilha', instruction: 'Marque o registro que melhor indica clonagem e desvio deliberado.', hint: 'Procure uma identidade com área incompatível, dois acessos em sequência e ausência do titular no prédio.', evidence: 'Badge 9912 tratado como provável clonagem operacional.', correct: 's2', documents: [
              { id: 's1', name: 'badge_9901.log', title: 'Badge 9901', text: 'Usuário: Paulo Torres. TI. Trânsito previsto em CPD.', author: 'secure.access', created: '20:31', signature: 'OK', stamp: 'NORMAL' },
              { id: 's2', name: 'badge_9912.log', title: 'Badge 9912', text: 'Usuária: Elisa Mota. Jurídico. Dois acessos em sequência em setor não autorizado, sem presença confirmada da titular no prédio.', author: 'secure.access', created: '20:32', signature: 'ALTA SUSPEITA', clue: true, risk: true, stamp: 'CLONAGEM' },
              { id: 's3', name: 'badge_9904.log', title: 'Badge 9904', text: 'Usuário: André Lima. Facilities. Rota prevista de manutenção.', author: 'secure.access', created: '20:33', signature: 'OK', stamp: 'NORMAL' }
            ]},
            { id: 'sen-e-3', type: 'choice', title: 'Contenção crítica', instruction: 'Defina a resposta mais completa.', hint: 'A resposta correta trata badge, saída física, mídia, vídeo e ativos digitais.', evidence: 'Contenção física e lógica sincronizada concluída.', correct: 't4', options: [
              { id: 't1', label: 'Fechar o caso e trocar a fechadura depois', detail: 'Permite fuga e perda de prova.' },
              { id: 't2', label: 'Reiniciar todos os terminais e apagar os logs locais', detail: 'Destrói evidências e não contém o suspeito.' },
              { id: 't3', label: 'Somente bloquear o crachá', detail: 'Não resolve fuga nem coleta de prova.' },
              { id: 't4', label: 'Bloquear crachá, isolar rotas, reter mídia e preservar CFTV/logs', detail: 'Ação crítica adequada.' }
            ]}
          ]
        }
      }
    },
    {
      id: 'spectral-vault',
      code: 'OP-VLT-15',
      title: 'Operação Cofre Espectral',
      subtitle: 'Carteira BTC-LAB e golpe de engenharia social',
      classification: 'SIGILO NÍVEL VIOLETA',
      location: 'FINTECH NÓRION // TESOURARIA DIGITAL',
      color: '#a267ff',
      map: { x: '81%', y: '36%' },
      synopsis: 'A tesouraria de uma fintech sofreu um golpe de engenharia social. Você precisa detectar a mensagem suspeita, identificar a transação irregular e responder antes de nova drenagem.',
      skills: ['Phishing', 'Carteira digital', 'Autenticação', 'Resposta financeira'],
      variants: {
        recruta: {
          timeLimit: 420, threatStart: 21, initialLoss: 150000,
          briefing: 'Uma carteira operacional BTC-LAB registrou uma saída não autorizada. Minutos antes, o financeiro recebeu uma mensagem pedindo “revalidação urgente” do token de aprovação.',
          objectives: ['Identificar a mensagem de phishing.', 'Marcar a transação suspeita.', 'Definir a resposta mais segura.'],
          events: [
            { text: 'ALERTA // O atacante tentou nova aprovação de saque.', threat: 6, loss: 48000 },
            { text: 'RISCO // Canal de suporte recebeu contato insistente.', threat: 5, loss: 32000 },
            { text: 'TESOURARIA // Existe risco sobre a chave de sessão.', threat: 6, loss: 42000 }
          ],
          steps: [
            { id: 'vlt-r-1', type: 'social', title: 'Mensagens recebidas', instruction: 'Selecione a mensagem suspeita.', hint: 'Procure urgência artificial, domínio estranho e solicitação de token.', evidence: 'Mensagem com domínio lab-wallet-secure.net identificada como phishing.', correct: 'm2', messages: [
              { id: 'm1', tag: 'CHAT INTERNO', title: 'Financeiro // Reunião 09h30', text: 'Bom dia, confirmar saldo de fechamento após o café.', note: 'Comunicação habitual' },
              { id: 'm2', tag: 'E-MAIL', title: 'Revalidação urgente da carteira', text: 'Seu token vai expirar em 3 minutos. Clique em lab-wallet-secure.net e informe o código de aprovação.', note: 'Urgência + domínio estranho + coleta de código', suspicious: true },
              { id: 'm3', tag: 'SMS', title: 'Código de entrega do almoxarifado', text: 'Entrega prevista para 14h. Código 1782.', note: 'Não relacionado ao cofre digital' }
            ]},
            { id: 'vlt-r-2', type: 'wallet', title: 'Painel BTC-LAB', instruction: 'Marque a transação mais suspeita.', hint: 'A transação correta ocorreu fora do padrão de valores, para um destino sem histórico e logo após a coleta do token.', evidence: 'Transação TX-93B destacada como saque indevido.', correct: 'tx3', balance: '74.22 BTC-LAB', graph: [18,22,24,29,26,25,12], transactions: [
              { id: 'tx1', date: '09:07', amount: '-1.2', label: 'Fornecedor Alpha', hash: '0xAB712C3F001', note: 'Destino habitual' },
              { id: 'tx2', date: '09:12', amount: '+0.8', label: 'Reembolso interno', hash: '0xCD441EF2002', note: 'Entrada regular' },
              { id: 'tx3', date: '09:16', amount: '-14.0', label: 'Wallet 9J-KT-44', hash: '0x9F93B77C991', note: 'Novo destino // após e-mail', suspicious: true },
              { id: 'tx4', date: '09:21', amount: '-0.6', label: 'Taxa de rede', hash: '0xAA115BB3001', note: 'Rotina' }
            ], mesh: { nodes: [{label:'TESOURARIA',x:'22%',y:'52%'},{label:'FORN-ALPHA',x:'50%',y:'22%'},{label:'REEMBOLSO',x:'48%',y:'76%'},{label:'9J-KT-44',x:'78%',y:'50%',suspect:true}], lines:[{from:[22,52],to:[50,22]},{from:[22,52],to:[48,76]},{from:[22,52],to:[78,50],alert:true}] } },
            { id: 'vlt-r-3', type: 'choice', title: 'Resposta da tesouraria', instruction: 'Escolha a resposta mais segura.', hint: 'É preciso conter a conta, bloquear novas aprovações e preservar a investigação.', evidence: 'Conta congelada, sessões revogadas e MFA rotacionado com preservação da trilha.', correct: 'w3', options: [
              { id: 'w1', label: 'Continuar operando normalmente para não alarmar o time', detail: 'Mantém o risco ativo.' },
              { id: 'w2', label: 'Pagar uma carteira externa para tentar recuperar', detail: 'Sem garantia e com risco ampliado.' },
              { id: 'w3', label: 'Congelar a carteira, revogar sessões e rotacionar MFA/chaves', detail: 'Resposta adequada.' },
              { id: 'w4', label: 'Apagar o histórico da carteira', detail: 'Destrói evidência.' }
            ]}
          ]
        },
        agente: {
          timeLimit: 360, threatStart: 28, initialLoss: 210000,
          briefing: 'O golpe envolveu e-mail falso, provável sessão já aberta no navegador da tesouraria e tentativa de segunda aprovação para wallet recém-observada.',
          objectives: ['Identificar a comunicação de engenharia social.', 'Marcar a saída indevida na carteira.', 'Escolher a resposta coordenada.'],
          events: [
            { text: 'ALERTA // Há nova tentativa de aprovação pendente.', threat: 7, loss: 65000 },
            { text: 'PHISHING // Outro operador recebeu mensagem semelhante.', threat: 8, loss: 52000 },
            { text: 'RISCO // Uma sessão de navegador continua ativa.', threat: 7, loss: 47000 }
          ],
          steps: [
            { id: 'vlt-a-1', type: 'social', title: 'Fila de comunicações', instruction: 'Marque a peça de engenharia social.', hint: 'A mensagem correta tenta se passar pelo suporte e pede ação urgente fora do fluxo interno.', evidence: 'Mensagem do falso suporte marcada como vetor inicial.', correct: 'n3', messages: [
              { id: 'n1', tag: 'INTRANET', title: 'Agenda do time financeiro', text: 'Reunião de revisão de tesouraria 10h.', note: 'Fluxo regular' },
              { id: 'n2', tag: 'CHAT', title: 'Solicitação de auditoria interna', text: 'Favor separar relatório de saldo do dia.', note: 'Processo esperado' },
              { id: 'n3', tag: 'E-MAIL', title: 'Suporte premium da carteira', text: 'Seu ambiente será bloqueado. Confirme em support-wallet-fast.pro e informe o token OTP.', note: 'Domínio estranho e coleta indevida', suspicious: true }
            ]},
            { id: 'vlt-a-2', type: 'wallet', title: 'Saídas anômalas', instruction: 'Selecione a transação com maior probabilidade de fraude.', hint: 'A fraude surge para destino novo, valor alto e logo após a mensagem falsa.', evidence: 'Transação TX-771P identificada como saída irregular.', correct: 'ta4', balance: '61.10 BTC-LAB', graph: [30,32,29,35,33,17,16], transactions: [
              { id: 'ta1', date: '10:05', amount: '+3.2', label: 'Ajuste interno', hash: '0x7700AB11', note: 'Regular' },
              { id: 'ta2', date: '10:11', amount: '-2.1', label: 'Fornecedor Sigma', hash: '0x7700AB12', note: 'Histórico conhecido' },
              { id: 'ta3', date: '10:14', amount: '-0.4', label: 'Taxa', hash: '0x7700AB13', note: 'Rotina' },
              { id: 'ta4', date: '10:16', amount: '-18.7', label: 'Wallet QL-7X-90', hash: '0x771PDD44', note: 'Novo destino // alta quantia', suspicious: true }
            ], mesh: { nodes: [{label:'TESOURARIA',x:'20%',y:'52%'},{label:'SIGMA',x:'48%',y:'24%'},{label:'TAXA',x:'46%',y:'76%'},{label:'QL-7X-90',x:'78%',y:'52%',suspect:true}], lines:[{from:[20,52],to:[48,24]},{from:[20,52],to:[46,76]},{from:[20,52],to:[78,52],alert:true}] } },
            { id: 'vlt-a-3', type: 'choice', title: 'Resposta coordenada', instruction: 'Escolha a melhor resposta.', hint: 'A melhor resposta congela a carteira, revoga sessão, preserva evidências e reforça MFA.', evidence: 'Carteira congelada, sessão revogada e MFA rotacionado.', correct: 'va2', options: [
              { id: 'va1', label: 'Somente avisar o usuário que clicou no link', detail: 'Não resolve as sessões já comprometidas.' },
              { id: 'va2', label: 'Congelar wallet, revogar sessão, preservar trilhas e forçar nova autenticação', detail: 'Resposta adequada.' },
              { id: 'va3', label: 'Desligar a internet da empresa toda', detail: 'Excessivo e sem foco.' },
              { id: 'va4', label: 'Apagar a conta comprometida', detail: 'Perde visibilidade da trilha.' }
            ]}
          ]
        },
        especialista: {
          timeLimit: 310, threatStart: 35, initialLoss: 290000,
          briefing: 'O invasor obteve token OTP, mantém sessão aberta e pode ter capturado também um segredo de API para novas transferências automatizadas. A tesouraria está em risco crítico.',
          objectives: ['Detectar a mensagem vetorial.', 'Marcar a saída principal e o destino novo.', 'Escolher a resposta crítica ao cofre.'],
          events: [
            { text: 'CRÍTICO // Há tentativa de automação de novo saque.', threat: 9, loss: 88000 },
            { text: 'RISCO // Sessão privilegiada ainda não foi revogada.', threat: 8, loss: 67000 },
            { text: 'PHISHING // O atacante enviou nova rodada para outro operador.', threat: 8, loss: 56000 }
          ],
          steps: [
            { id: 'vlt-e-1', type: 'social', title: 'Engenharia social avançada', instruction: 'Selecione a mensagem que iniciou a captura do token.', hint: 'A mensagem correta usa urgência, domínio paralelo e tom de suporte premium.', evidence: 'Peça de engenharia social inicial identificada.', correct: 'p4', messages: [
              { id: 'p1', tag: 'INTRANET', title: 'Checklist diário de caixa', text: 'Conferir fechamentos de 09h e 11h.', note: 'Interno' },
              { id: 'p2', tag: 'CHAT', title: 'Ajuda do time de risco', text: 'Favor enviar relatório já salvo na pasta segura.', note: 'Fluxo conhecido' },
              { id: 'p3', tag: 'SMS', title: 'Código de entrega', text: 'Código 7781.', note: 'Não relacionado' },
              { id: 'p4', tag: 'E-MAIL', title: 'Suporte executiva / bloqueio iminente', text: 'A sessão premium foi marcada por fraude. Valide em executive-wallet-now.io e informe OTP e PIN de autorização.', note: 'Domínio paralelo + coleta de credenciais', suspicious: true }
            ]},
            { id: 'vlt-e-2', type: 'wallet', title: 'Transações do cofre', instruction: 'Marque a saída mais crítica.', hint: 'A fraude principal vai para destino sem histórico, alto valor e foi confirmada após o OTP.', evidence: 'Saída 0x8A4D11 marcada como exfiltração principal.', correct: 've5', balance: '55.04 BTC-LAB', graph: [36,34,38,35,27,22,10], transactions: [
              { id: 've1', date: '10:44', amount: '-0.9', label: 'Taxa rotineira', hash: '0x8A4D01', note: 'Rotina' },
              { id: 've2', date: '10:45', amount: '+1.5', label: 'Ajuste interno', hash: '0x8A4D07', note: 'Entrada' },
              { id: 've3', date: '10:46', amount: '-2.9', label: 'Fornecedor Kappa', hash: '0x8A4D08', note: 'Histórico comum' },
              { id: 've4', date: '10:47', amount: '-3.1', label: 'Bridge test', hash: '0x8A4D10', note: 'Pequena saída' },
              { id: 've5', date: '10:48', amount: '-21.4', label: 'Wallet YR-44-NQ', hash: '0x8A4D11', note: 'Novo destino // autenticação suspeita', suspicious: true }
            ], mesh: { nodes: [{label:'TREASURY',x:'18%',y:'50%'},{label:'KAPPA',x:'48%',y:'24%'},{label:'BRIDGE',x:'46%',y:'76%'},{label:'YR-44-NQ',x:'80%',y:'50%',suspect:true}], lines:[{from:[18,50],to:[48,24]},{from:[18,50],to:[46,76]},{from:[18,50],to:[80,50],alert:true}] } },
            { id: 'vlt-e-3', type: 'choice', title: 'Resposta crítica', instruction: 'Escolha a resposta mais robusta.', hint: 'A resposta correta congela o cofre, corta automações, revoga sessão e preserva trilhas.', evidence: 'Cofre congelado, automações desativadas e sessão revogada.', correct: 'vv3', options: [
              { id: 'vv1', label: 'Pedir ao invasor que devolva os fundos', detail: 'Sem valor defensivo.' },
              { id: 'vv2', label: 'Trocar somente a senha do usuário', detail: 'Não cobre sessão e chave de API.' },
              { id: 'vv3', label: 'Congelar wallet, revogar sessões/chaves de API, suspender automações e preservar logs', detail: 'Resposta crítica adequada.' },
              { id: 'vv4', label: 'Apagar o histórico para evitar pânico', detail: 'Destrói a trilha.' }
            ]}
          ]
        }
      }
    },
    {
      id: 'grey-cipher',
      code: 'OP-COD-21',
      title: 'Operação Código Cinza',
      subtitle: 'Lógica, descriptografia e persistência',
      classification: 'SIGILO NÍVEL ÔNIX',
      location: 'LAB ORBITAL // NÚCLEO DE CRIPTOANÁLISE',
      color: '#ff577b',
      map: { x: '38%', y: '78%' },
      synopsis: 'Um sistema crítico foi trancado por sequência lógica e tarefas persistentes. Você precisa montar o código, identificar o fragmento correto e eliminar a persistência.',
      skills: ['Lógica binária', 'Documentos', 'Persistência', 'Tomada de decisão'],
      variants: {
        recruta: {
          timeLimit: 420, threatStart: 18, initialLoss: 50000,
          briefing: 'O laboratório perdeu o acesso a um módulo de controle. Um código lógico precisa ser reconstruído, e há indícios de tarefa agendada maliciosa aguardando nova execução.',
          objectives: ['Montar a sequência binária correta.', 'Escolher o fragmento documental válido.', 'Definir a resposta final contra a persistência.'],
          events: [
            { text: 'ALERTA // Novo temporizador apareceu na rotina agendada.', threat: 5, loss: 18000 },
            { text: 'RISCO // O módulo perdeu mais uma chave intermediária.', threat: 5, loss: 20000 },
            { text: 'PRESSÃO // A persistência será reexecutada em breve.', threat: 6, loss: 24000 }
          ],
          steps: [
            { id: 'cod-r-1', type: 'logic', title: 'Console lógico', instruction: 'Clique nos blocos para formar a sequência correta.', hint: 'A sequência correta segue o padrão 101101 e respeita as pistas de paridade e início seguro.', evidence: 'Sequência 101101 validada no console.', correct: '101101', cells: 6, clues: ['Início com 1', 'Paridade final ímpar', 'Blocos 3 e 4 diferentes', 'Último bloco = 1'] },
            { id: 'cod-r-2', type: 'document', title: 'Fragmentos descriptografados', instruction: 'Escolha o fragmento consistente com a sequência montada.', hint: 'O fragmento correto menciona a tarefa persistente e a janela de reexecução.', evidence: 'Fragmento F-02 confirmou persistência agendada.', correct: 'f2', documents: [
              { id: 'f1', name: 'fragmento_A.txt', title: 'Fragmento A', text: 'Bloco auxiliar do motor lógico. Chave parcial de cache e referência a rota antiga.', author: 'cipher.lab', created: '12:08', signature: 'PARCIAL', stamp: 'INCOMPLETO' },
              { id: 'f2', name: 'fragmento_B.txt', title: 'Fragmento B', text: 'Sequência final aponta para tarefa agendada task_relock_07 e janela de reexecução de 180 segundos.', author: 'cipher.lab', created: '12:09', signature: 'CONSISTENTE', clue: true, stamp: 'VÁLIDO' },
              { id: 'f3', name: 'fragmento_C.txt', title: 'Fragmento C', text: 'Trecho redundante sem relação com o temporizador principal.', author: 'cipher.lab', created: '12:10', signature: 'DIVERGENTE', risk: true, stamp: 'REVISAR' }
            ]},
            { id: 'cod-r-3', type: 'choice', title: 'Eliminar persistência', instruction: 'Qual ação é mais adequada?', hint: 'A melhor opção encerra a tarefa, remove persistência e rotaciona a chave de execução.', evidence: 'Persistência removida e chave de execução rotacionada.', correct: 'cr3', options: [
              { id: 'cr1', label: 'Reiniciar o módulo sem olhar a tarefa', detail: 'A persistência volta na próxima execução.' },
              { id: 'cr2', label: 'Formatar toda a estação', detail: 'Excessivo e sem preservar a trilha.' },
              { id: 'cr3', label: 'Remover task_relock_07, revogar agendamento e rotacionar chave', detail: 'Resposta correta.' },
              { id: 'cr4', label: 'Ignorar o temporizador', detail: 'Risco de reexecução.' }
            ]}
          ]
        },
        agente: {
          timeLimit: 350, threatStart: 26, initialLoss: 72000,
          briefing: 'O sistema agora possui dois agendamentos e fragmentos misturados. A sequência lógica foi embaralhada e a persistência usa chave auxiliar.',
          objectives: ['Montar o código binário correto.', 'Escolher o fragmento que indica a persistência real.', 'Definir a resposta correta.'],
          events: [
            { text: 'TEMPORIZADOR // job secundário foi armado.', threat: 7, loss: 22000 },
            { text: 'BLOQUEIO // Módulo perdeu mais um segmento de chave.', threat: 8, loss: 26000 },
            { text: 'CRISE // Persistência tenta novo lock parcial.', threat: 7, loss: 24000 }
          ],
          steps: [
            { id: 'cod-a-1', type: 'logic', title: 'Matriz lógica', instruction: 'Monte a sequência correta.', hint: 'A sequência correta é 110010 e satisfaz o início duplo e o término neutro.', evidence: 'Código 110010 validado.', correct: '110010', cells: 6, clues: ['Começa com 11', 'Bloco 4 = 0', 'Últimos dois blocos diferentes', 'Quantidade de 1 = 3'] },
            { id: 'cod-a-2', type: 'document', title: 'Fragmentos mistos', instruction: 'Selecione o fragmento que revela a tarefa persistente verdadeira.', hint: 'O fragmento correto menciona o job secundário e a chave auxiliar.', evidence: 'Fragmento G-03 apontou task_shadow_relock.', correct: 'g3', documents: [
              { id: 'g1', name: 'frag_01.txt', title: 'Fragmento 01', text: 'Chave parcial de interface e cache antigo.', author: 'orbit.core', created: '12:31', signature: 'SEM RELAÇÃO', stamp: 'INERTE' },
              { id: 'g2', name: 'frag_02.txt', title: 'Fragmento 02', text: 'Task_main_unlock encerrada às 12:27 sem alerta de retorno.', author: 'orbit.core', created: '12:32', signature: 'OBSOLETO', stamp: 'OBSOLETO' },
              { id: 'g3', name: 'frag_03.txt', title: 'Fragmento 03', text: 'Job task_shadow_relock e chave auxiliar grey_seed_2 ativados quando a sequência correta é aplicada.', author: 'orbit.core', created: '12:33', signature: 'ALTA CONSISTÊNCIA', clue: true, stamp: 'VÁLIDO' }
            ]},
            { id: 'cod-a-3', type: 'choice', title: 'Desativação coordenada', instruction: 'Escolha a melhor ação.', hint: 'A melhor ação remove o job persistente e sua chave associada antes da reexecução.', evidence: 'Job persistente e chave auxiliar neutralizados.', correct: 'ga2', options: [
              { id: 'ga1', label: 'Rodar a sequência novamente e torcer para abrir', detail: 'Sem remover a persistência.' },
              { id: 'ga2', label: 'Encerrar task_shadow_relock, invalidar grey_seed_2 e revisar agendamentos', detail: 'Resposta correta.' },
              { id: 'ga3', label: 'Desligar apenas o painel visual', detail: 'Persistência continua.' },
              { id: 'ga4', label: 'Apagar todos os fragmentos', detail: 'Perde a trilha de investigação.' }
            ]}
          ]
        },
        especialista: {
          timeLimit: 290, threatStart: 34, initialLoss: 98000,
          briefing: 'Há múltiplas pistas enganosas, dois agendamentos e um mecanismo de re-lock condicionado por chave lateral. O sistema cairá em modo de destruição lógica se a persistência não for removida a tempo.',
          objectives: ['Montar o código entre pistas enganosas.', 'Encontrar o fragmento que expõe o re-lock real.', 'Executar a resposta crítica.'],
          events: [
            { text: 'CRÍTICO // O módulo entrou em contagem para re-lock total.', threat: 9, loss: 33000 },
            { text: 'RISCO // Chave lateral foi rearmada pelo scheduler.', threat: 8, loss: 29000 },
            { text: 'DESTRUIÇÃO // O sistema ameaça corromper a matriz lógica.', threat: 10, loss: 36000 }
          ],
          steps: [
            { id: 'cod-e-1', type: 'logic', title: 'Cipher matrix', instruction: 'Monte a sequência correta.', hint: 'A sequência correta é 111001 e atende o triplo início, bloco 4 zero e total de quatro bits 1.', evidence: 'Código 111001 validado no núcleo.', correct: '111001', cells: 6, clues: ['Começa com 111', 'Bloco 4 = 0', 'Total de bits 1 = 4', 'Último bloco = 1'] },
            { id: 'cod-e-2', type: 'document', title: 'Fragmentos críticos', instruction: 'Escolha o fragmento que expõe o gatilho de re-lock.', hint: 'O fragmento correto menciona o gatilho final, o job oculto e a seed lateral.', evidence: 'Fragmento X-02 confirmou o gatilho shadow_final_lock.', correct: 'x2', documents: [
              { id: 'x1', name: 'x_01.txt', title: 'Fragmento X-01', text: 'Cache de visualização e flag de auditoria. Não indica re-lock.', author: 'nexus.core', created: '13:04', signature: 'BAIXA CORRELAÇÃO', stamp: 'RUIDO' },
              { id: 'x2', name: 'x_02.txt', title: 'Fragmento X-02', text: 'Job shadow_final_lock invocado por seed lateral onyx_seed_7 quando a sequência correta é validada sem revogação prévia.', author: 'nexus.core', created: '13:05', signature: 'CONSISTÊNCIA TOTAL', clue: true, stamp: 'CRÍTICO' },
              { id: 'x3', name: 'x_03.txt', title: 'Fragmento X-03', text: 'Relatório de manutenção antigo, sem relação com o scheduler oculto.', author: 'nexus.core', created: '13:06', signature: 'INCONSISTENTE', risk: true, stamp: 'REVISAR' }
            ]},
            { id: 'cod-e-3', type: 'choice', title: 'Resposta crítica', instruction: 'Escolha a resposta mais completa.', hint: 'A melhor resposta trata scheduler oculto, seed lateral e rota de re-lock.', evidence: 'Gatilho shadow_final_lock e seed lateral desarmados com auditoria concluída.', correct: 'xe4', options: [
              { id: 'xe1', label: 'Aplicar a sequência de novo e reiniciar o painel', detail: 'Não remove o gatilho.' },
              { id: 'xe2', label: 'Formatar o equipamento imediatamente', detail: 'Excessivo e perde prova.' },
              { id: 'xe3', label: 'Ignorar a seed lateral e remover apenas o job principal', detail: 'A persistência reaparece.' },
              { id: 'xe4', label: 'Revogar shadow_final_lock, invalidar onyx_seed_7 e revisar o scheduler oculto', detail: 'Resposta crítica adequada.' }
            ]}
          ]
        }
      }
    }
  ];
}


function createChimeraVariant(level) {
  const configs = {
    recruta: {
      timeLimit: 600, threatStart: 34, initialLoss: 650000,
      networkCorrect: 'relay-rio', packetCorrect: 'boss-p4', socialCorrect: 'boss-m2', docCorrect: 'boss-d3', logicCorrect: '10101110', finalCorrect: 'boss-plan-3',
      sequenceClues: ['Começa com 10', 'Blocos 3 e 4 são diferentes', 'Termina com 10', 'Total de bits 1 = 5']
    },
    agente: {
      timeLimit: 520, threatStart: 42, initialLoss: 900000,
      networkCorrect: 'relay-berlin', packetCorrect: 'boss-a5', socialCorrect: 'boss-a3', docCorrect: 'boss-ad2', logicCorrect: '11010101', finalCorrect: 'boss-ap4',
      sequenceClues: ['Começa com 11', 'Bloco 3 = 0', 'Últimos quatro bits = 0101', 'Total de bits 1 = 5']
    },
    especialista: {
      timeLimit: 440, threatStart: 52, initialLoss: 1400000,
      networkCorrect: 'relay-singapore', packetCorrect: 'boss-e6', socialCorrect: 'boss-e4', docCorrect: 'boss-ed4', logicCorrect: '11100101', finalCorrect: 'boss-ep5',
      sequenceClues: ['Começa com 111', 'Bloco 4 = 0', 'Final = 0101', 'Total de bits 1 = 5']
    }
  };
  const c = configs[level];
  const levelLabel = difficultyRules[level].label;
  const networkNodes = level === 'recruta' ? [
    { id:'relay-lisbon',x:18,y:28,label:'LISBOA-RELAY',detail:'Nó atlântico // 34% carga' },
    { id:'relay-rio',x:36,y:62,label:'RIO-RELAY',detail:'Sincroniza vault, botnet e scheduler',alert:true },
    { id:'relay-dubai',x:58,y:24,label:'DUBAI-RELAY',detail:'Carteira e telemetria' },
    { id:'relay-tokyo',x:78,y:62,label:'TÓQUIO-RELAY',detail:'Sistemas urbanos' },
    { id:'chimera-core',x:58,y:48,label:'QUIMERA-CORE',detail:'Núcleo global' },
    { id:'command',x:82,y:28,label:'ARCONTE-C2',detail:'Comando e controle' }
  ] : level === 'agente' ? [
    { id:'relay-london',x:14,y:24,label:'LONDRES-K2',detail:'Borda financeira' },
    { id:'relay-berlin',x:34,y:52,label:'BERLIM-K7',detail:'Conecta C2, ledger e scheduler',alert:true },
    { id:'relay-cairo',x:30,y:78,label:'CAIRO-K4',detail:'Comunicações' },
    { id:'relay-seoul',x:62,y:20,label:'SEUL-K9',detail:'Infraestrutura urbana' },
    { id:'relay-sao',x:70,y:70,label:'SÃO-PAULO-K5',detail:'Ativos financeiros' },
    { id:'chimera-core',x:58,y:48,label:'QUIMERA-CORE',detail:'Núcleo global' },
    { id:'command',x:86,y:42,label:'ARCONTE-C2',detail:'Comando e controle' }
  ] : [
    { id:'relay-paris',x:12,y:20,label:'PARIS-X1',detail:'Arquivo diplomático' },
    { id:'relay-washington',x:18,y:70,label:'WASHINGTON-X3',detail:'Rede federal fictícia' },
    { id:'relay-singapore',x:38,y:46,label:'SINGAPURA-X7',detail:'Fecha triângulo C2, vault e botnet',alert:true },
    { id:'relay-sydney',x:61,y:78,label:'SYDNEY-X8',detail:'Pacífico' },
    { id:'relay-istanbul',x:62,y:18,label:'ISTAMBUL-X5',detail:'Ponte eurasiana' },
    { id:'relay-curitiba',x:82,y:70,label:'CURITIBA-X9',detail:'Datacenter sul' },
    { id:'chimera-core',x:62,y:48,label:'QUIMERA-CORE',detail:'Núcleo global' },
    { id:'command',x:88,y:30,label:'ARCONTE-C2',detail:'Comando e controle' }
  ];
  const links = networkNodes.filter(n => n.id !== 'chimera-core' && n.id !== 'command').map(n => [n.id,'chimera-core']);
  links.push(['chimera-core','command'],[c.networkCorrect,'command']);

  const packetRows = level === 'recruta' ? [
    {id:'boss-p1',time:'23:41:04',source:'RIO-RELAY',target:'QUIMERA-CORE',protocol:'TLS',size:'42 MB',note:'sync padrão'},
    {id:'boss-p2',time:'23:41:08',source:'DUBAI-RELAY',target:'VAULT-LAB',protocol:'HTTPS',size:'18 MB',note:'consulta de saldo'},
    {id:'boss-p3',time:'23:41:11',source:'TÓQUIO-RELAY',target:'URBAN-GRID',protocol:'MQTT',size:'8 MB',note:'telemetria'},
    {id:'boss-p4',time:'23:41:14',source:'RIO-RELAY',target:'198.51.100.77',protocol:'TLS',size:'2.8 GB',note:'chimera-global-sync',risk:true}
  ] : level === 'agente' ? [
    {id:'boss-a1',time:'23:44:01',source:'LONDON-K2',target:'QUIMERA-CORE',protocol:'TLS',size:'84 MB',note:'replicação'},
    {id:'boss-a2',time:'23:44:05',source:'CAIRO-K4',target:'COMMS-MESH',protocol:'QUIC',size:'22 MB',note:'voz cifrada'},
    {id:'boss-a3',time:'23:44:09',source:'SAO-K5',target:'LEDGER-GRID',protocol:'HTTPS',size:'63 MB',note:'ledger'},
    {id:'boss-a4',time:'23:44:12',source:'BERLIN-K7',target:'SEUL-K9',protocol:'TLS',size:'90 MB',note:'cross-region'},
    {id:'boss-a5',time:'23:44:15',source:'BERLIN-K7',target:'203.0.113.46',protocol:'TLS/QUIC',size:'4.1 GB',note:'global-mirror',risk:true}
  ] : [
    {id:'boss-e1',time:'23:47:01',source:'PARIS-X1',target:'QUIMERA-CORE',protocol:'TLS',size:'120 MB',note:'arquivo sync'},
    {id:'boss-e2',time:'23:47:04',source:'WASHINGTON-X3',target:'LEDGER-X',protocol:'HTTPS',size:'74 MB',note:'ledger batch'},
    {id:'boss-e3',time:'23:47:06',source:'ISTAMBUL-X5',target:'COMMS-X',protocol:'QUIC',size:'46 MB',note:'relay cifrado'},
    {id:'boss-e4',time:'23:47:08',source:'SINGAPURA-X7',target:'CURITIBA-X9',protocol:'TLS',size:'92 MB',note:'cross-region'},
    {id:'boss-e5',time:'23:47:11',source:'SYDNEY-X8',target:'QUIMERA-CORE',protocol:'SFTP',size:'110 MB',note:'snapshot'},
    {id:'boss-e6',time:'23:47:14',source:'SINGAPURA-X7',target:'192.0.2.88',protocol:'TLS/QUIC',size:'6.8 GB',note:'chimera-final-sync',risk:true}
  ];

  const socialMessages = level === 'recruta' ? [
    {id:'boss-m1',tag:'COMMS',title:'Atualização da central',text:'Use somente o canal interno confirmado.',note:'Fluxo esperado'},
    {id:'boss-m2',tag:'TRANSMISSÃO',title:'Ordem emergencial do Arconte',text:'Para interromper Quimera, envie o código mestre ao canal unlock-chimera-now.io.',note:'Coleta de segredo + domínio externo',suspicious:true},
    {id:'boss-m3',tag:'ALERTA',title:'Sensor de Lisboa',text:'Relay atlântico operando com latência.',note:'Telemetria'}
  ] : level === 'agente' ? [
    {id:'boss-a1m',tag:'COMMS',title:'Comandante Helena',text:'Não compartilhe códigos fora do cofre de missão.',note:'Canal validado'},
    {id:'boss-a2m',tag:'SENSOR',title:'Berlim K7',text:'Carga aumentou em 31%.',note:'Telemetria'},
    {id:'boss-a3',tag:'TRANSMISSÃO',title:'Suporte global de emergência',text:'A falha exige sua seed de restauração em global-safe-recovery.pro.',note:'Domínio falso + solicitação de seed',suspicious:true},
    {id:'boss-a4m',tag:'COMMS',title:'Agente Amina',text:'Há atividade física em dois centros.',note:'Canal interno'}
  ] : [
    {id:'boss-e1m',tag:'C2',title:'Arconte Zero',text:'Entregue a seed e eu desligo uma das cabeças da Quimera.',note:'Manipulação direta'},
    {id:'boss-e2m',tag:'COMMS',title:'Ravi Nunes',text:'A seed nunca deve sair do cofre.',note:'Canal interno'},
    {id:'boss-e3m',tag:'SENSOR',title:'Singapura X7',text:'Sincronização lateral detectada.',note:'Telemetria'},
    {id:'boss-e4',tag:'TRANSMISSÃO',title:'Recuperação diplomática urgente',text:'Cole a seed onyx e o token OTP em diplomatic-zero-response.net.',note:'Domínio falso + coleta dupla',suspicious:true}
  ];

  const documents = level === 'recruta' ? [
    {id:'boss-d1',name:'quimera_a.log',title:'Fragmento A',text:'Plano de redundância parcial sem chave final.',author:'nexus.archive',created:'23:40',signature:'MATCH 62%',stamp:'INCOMPLETO'},
    {id:'boss-d2',name:'quimera_b.log',title:'Fragmento B',text:'Rotina antiga de teste sem relação com a sincronização.',author:'nexus.archive',created:'23:41',signature:'MATCH 48%',stamp:'RUIDO'},
    {id:'boss-d3',name:'quimera_core.log',title:'Fragmento Core',text:'A sincronização global depende do relay-rio, do túnel 198.51.100.77 e da sequência 10101110.',author:'arconte.zero',created:'23:42',signature:'CONSISTÊNCIA TOTAL',clue:true,stamp:'CRÍTICO'}
  ] : level === 'agente' ? [
    {id:'boss-ad1',name:'kappa.log',title:'Fragmento Kappa',text:'Rotina de cache em Londres.',author:'nexus.archive',created:'23:43',signature:'BAIXA CORRELAÇÃO',stamp:'RUIDO'},
    {id:'boss-ad2',name:'chimera_master.log',title:'Plano Mestre',text:'Berlim K7 mantém a sincronização, canal 203.0.113.46 e cipher 11010101.',author:'arconte.zero',created:'23:44',signature:'100% MATCH',clue:true,stamp:'CRÍTICO'},
    {id:'boss-ad3',name:'omega.log',title:'Fragmento Omega',text:'Tarefa obsoleta de teste.',author:'nexus.archive',created:'23:45',signature:'OBSOLETO',stamp:'ARQUIVADO'}
  ] : [
    {id:'boss-ed1',name:'umbra_x1.log',title:'Umbra X1',text:'Rota diplomática sem seed final.',author:'nexus.core',created:'23:45',signature:'MATCH 51%',stamp:'INCOMPLETO'},
    {id:'boss-ed2',name:'umbra_x2.log',title:'Umbra X2',text:'Tarefa de distração em Washington.',author:'nexus.core',created:'23:46',signature:'MATCH 73%',stamp:'PARCIAL'},
    {id:'boss-ed3',name:'umbra_x3.log',title:'Umbra X3',text:'Rota de contingência encerrada.',author:'nexus.core',created:'23:46',signature:'OBSOLETO',stamp:'ARQUIVADO'},
    {id:'boss-ed4',name:'chimera_zero.log',title:'Quimera Zero',text:'Singapura X7 sustenta o túnel 192.0.2.88. A sequência final é 11100101 e exige corte simultâneo do C2.',author:'arconte.zero',created:'23:47',signature:'CONSISTÊNCIA TOTAL',clue:true,stamp:'ULTRASSECRETO'}
  ];

  const finalOptions = level === 'recruta' ? [
    {id:'boss-plan-1',label:'Desligar uma cidade e aguardar',detail:'A Quimera migra para outro relay.'},
    {id:'boss-plan-2',label:'Enviar o código ao Arconte',detail:'Entrega a chave ao adversário.'},
    {id:'boss-plan-3',label:'Isolar relay, cortar túnel, revogar mensagens falsas, validar documento e aplicar cipher',detail:'Resposta coordenada contra todas as cabeças.'},
    {id:'boss-plan-4',label:'Reiniciar o mapa global',detail:'Não elimina persistência nem C2.'}
  ] : level === 'agente' ? [
    {id:'boss-ap1',label:'Restaurar os serviços sem cortar o C2',detail:'Risco de reinfecção global.'},
    {id:'boss-ap2',label:'Bloquear somente Berlim K7',detail:'Outros vetores continuam ativos.'},
    {id:'boss-ap3',label:'Negociar uma pausa com o Arconte',detail:'Sem garantia defensiva.'},
    {id:'boss-ap4',label:'Cortar relay/túnel, revogar sessões, preservar provas e aplicar cipher em sincronismo',detail:'Resposta global completa.'}
  ] : [
    {id:'boss-ep1',label:'Eliminar o arquivo central e perder a trilha',detail:'Destrói evidência.'},
    {id:'boss-ep2',label:'Aplicar somente o cipher',detail:'O C2 continua enviando comandos.'},
    {id:'boss-ep3',label:'Bloquear todos os países do mapa',detail:'Causa dano operacional massivo.'},
    {id:'boss-ep4',label:'Restaurar antes de revogar a seed',detail:'Permite nova sincronização.'},
    {id:'boss-ep5',label:'Cortar X7 e C2, bloquear túnel, invalidar seed/OTP, preservar provas e aplicar cipher final',detail:'Neutralização simultânea da Quimera.'}
  ];

  return {
    timeLimit:c.timeLimit, threatStart:c.threatStart, initialLoss:c.initialLoss,
    briefing:`Quimera Zero está ativa em escala global. Nível ${levelLabel}. Todos os locais são reais, mas o incidente e as instituições são fictícios.`,
    objectives:['Encontrar o relay principal da rede mundial.','Identificar o canal global de sincronização.','Detectar a mensagem de contrainteligência.','Validar o documento do Arconte.','Montar a sequência final.','Executar o plano de neutralização.'],
    events:[
      {text:'GLOBAL // Uma nova cidade entrou no mapa de risco.',threat:10,loss:180000},
      {text:'ARCONTE // O adversário iniciou nova sincronização.',threat:12,loss:240000},
      {text:'CRÍTICO // Um setor perdeu acesso a evidências temporárias.',threat:11,loss:200000}
    ],
    steps:[
      {id:`boss-net-${level}`,type:'network',title:'Mapa mundial da Quimera',instruction:'Selecione o relay que sustenta a maior parte da sincronização.',hint:'O relay correto se conecta diretamente ao núcleo e ao comando do Arconte.',evidence:`Relay global ${c.networkCorrect} isolado.`,correct:c.networkCorrect,nodes:networkNodes,links},
      {id:`boss-pkt-${level}`,type:'packet',title:'Canal global de sincronização',instruction:'Marque o fluxo de comando e exfiltração da Quimera.',hint:'Procure volume muito alto, destino externo e origem no relay identificado.',evidence:'Canal global da Quimera identificado e preparado para bloqueio.',correct:c.packetCorrect,filters:['TODOS','TLS','QUIC','CROSS-REGION','C2'],packets:packetRows},
      {id:`boss-social-${level}`,type:'social',title:'Contrainteligência do Arconte',instruction:'Selecione a mensagem usada para roubar a seed ou o token do agente.',hint:'O adversário tenta provocar urgência e pedir segredos fora dos canais internos.',evidence:'Mensagem de contrainteligência identificada.',correct:c.socialCorrect,messages:socialMessages},
      {id:`boss-doc-${level}`,type:'document',title:'Arquivo ultrassecreto',instruction:'Abra os fragmentos e marque o documento que revela a arquitetura final.',hint:'O documento correto conecta relay, túnel e cipher.',evidence:'Plano mestre da Quimera validado.',correct:c.docCorrect,documents},
      {id:`boss-logic-${level}`,type:'logic',title:'Cipher de neutralização',instruction:'Monte a sequência final antes do próximo pulso do C2.',hint:`A sequência correta é ${c.logicCorrect}. Use as pistas do documento para confirmar.`,evidence:`Cipher ${c.logicCorrect} validado.`,correct:c.logicCorrect,cells:8,clues:c.sequenceClues},
      {id:`boss-choice-${level}`,type:'choice',title:'Confronto final com Arconte Zero',instruction:'Escolha o plano que neutraliza todas as cabeças da Quimera e preserva as provas.',hint:'A resposta correta combina tudo que você descobriu nas fases anteriores.',evidence:'Quimera Zero neutralizada e Arconte Zero desconectado do C2.',correct:c.finalCorrect,options:finalOptions}
    ]
  };
}

function createFinalBossMission() {
  return {
    id:'chimera-zero',code:'OP-QZ-00',title:'Operação Quimera Zero',subtitle:'Chefe final — ataque global sincronizado',classification:'SIGILO MÁXIMO // BLACK OMEGA',
    location:'MÚLTIPLAS CIDADES // REDE MUNDIAL',color:'#ff365f',map:{x:'52%',y:'50%'},
    synopsis:'A facção Nexus Umbra ativa um ataque simultâneo em diferentes continentes. O agente deve reunir tudo que aprendeu e enfrentar Arconte Zero.',
    skills:['Investigação global','Rede','Pacotes','Engenharia social','Documentos','Lógica','Resposta coordenada'],
    variants:{recruta:createChimeraVariant('recruta'),agente:createChimeraVariant('agente'),especialista:createChimeraVariant('especialista')}
  };
}

let missions = createMissions();
missions.push(createFinalBossMission());

const interceptSteps = {
  'ghost-sentinel': {
    objective: 'Traduzir a conversa russa e identificar o ponto de encontro.',
    step: {
      id: 'ghost-intercept', type: 'intercept', title: 'Conversa interceptada',
      instruction: 'Use o contexto e a ferramenta de tradução para selecionar a interpretação correta da mensagem em russo.',
      hint: 'A mensagem menciona uma entrada ao norte, dezenove horas e um crachá azul. Não apresenta ordem de ataque.',
      evidence: 'Conversa russa traduzida: encontro na entrada norte às 19h com crachá azul.',
      correct: 'ru-correct', language: 'Русский',
      raw: 'Проверьте северный вход в девятнадцать часов. Курьер будет с синим пропуском.',
      cipher: 'Tradução contextual',
      options: [
        { id: 'ru-a', label: 'Evacuar a entrada sul às 17h.', detail: 'Horário e direção incompatíveis.' },
        { id: 'ru-correct', label: 'Verificar a entrada norte às 19h; o mensageiro terá um crachá azul.', detail: 'Mantém local, horário e identificador.' },
        { id: 'ru-c', label: 'Desligar as câmeras e aguardar um veículo vermelho.', detail: 'Elementos que não aparecem na mensagem.' }
      ]
    }
  },
  'spectral-vault': {
    objective: 'Interpretar a mensagem em portunhol sem seguir a instrução fraudulenta.',
    step: {
      id: 'vault-intercept', type: 'intercept', title: 'Mensagem em portunhol',
      instruction: 'Analise o texto e selecione a interpretação segura. A tradução não deve transformar uma solicitação suspeita em ação legítima.',
      hint: 'Urgência, pedido de OTP e domínio paralelo são sinais de engenharia social.',
      evidence: 'Mensagem em portunhol classificada como tentativa de coleta de OTP e credenciais.',
      correct: 'ptn-correct', language: 'Portunhol',
      raw: 'Tu cuenta está bloqueada ahora. Confirma rapidinho el OTP en soporte-wallet-seguro.info para no perder los fondos.',
      cipher: 'Análise semântica',
      options: [
        { id: 'ptn-a', label: 'Aviso legítimo para atualizar o aplicativo oficial.', detail: 'O texto pede código em domínio externo.' },
        { id: 'ptn-correct', label: 'Tentativa de phishing que usa urgência para capturar OTP.', detail: 'Interpretação segura e coerente.' },
        { id: 'ptn-c', label: 'Confirmação de transferência já aprovada.', detail: 'Não há evidência de aprovação.' }
      ]
    }
  },
  'grey-cipher': {
    objective: 'Decodificar a transmissão Morse e localizar o job persistente.',
    step: {
      id: 'grey-intercept', type: 'intercept', title: 'Transmissão em Morse',
      instruction: 'Decodifique a sequência e selecione a mensagem correta.',
      hint: 'Separe letras por espaço e palavras por barra. A sequência forma TASK RELOCK.',
      evidence: 'Código Morse decodificado como TASK RELOCK, confirmando a persistência agendada.',
      correct: 'morse-correct', language: 'Código Morse',
      raw: '- .- ... -.- / .-. . .-.. --- -.-. -.-',
      cipher: 'Morse',
      options: [
        { id: 'morse-a', label: 'SAFE BACKUP', detail: 'Não corresponde à sequência.' },
        { id: 'morse-correct', label: 'TASK RELOCK', detail: 'Decodificação correta.' },
        { id: 'morse-c', label: 'TRACE NETWORK', detail: 'Quantidade de sinais incompatível.' }
      ]
    }
  },
  'chimera-zero': {
    objective: 'Converter o fragmento binário e confirmar o comando global.',
    step: {
      id: 'chimera-intercept', type: 'intercept', title: 'Fragmento binário',
      instruction: 'Converta os blocos de 8 bits em ASCII e selecione a mensagem resultante.',
      hint: '01001100 = L, 01001111 = O, 01000011 = C, 01001011 = K.',
      evidence: 'Fragmento binário convertido para LOCK, identificando o comando de sincronização.',
      correct: 'bin-correct', language: 'Binário / ASCII',
      raw: '01001100 01001111 01000011 01001011',
      cipher: 'Binário',
      options: [
        { id: 'bin-a', label: 'LINK', detail: 'O terceiro bloco não representa N.' },
        { id: 'bin-correct', label: 'LOCK', detail: 'Conversão ASCII correta.' },
        { id: 'bin-c', label: 'LOOK', detail: 'O terceiro bloco representa C, não O.' }
      ]
    }
  }
};

function enhanceMissionArchitecture() {
  missions.forEach((mission) => {
    const module = getMissionModule(mission.id);
    mission.moduleId = module.id;
    mission.moduleOrder = module.missions.indexOf(mission.id) + 1;
    const enhancement = interceptSteps[mission.id];
    if (!enhancement) return;
    Object.values(mission.variants).forEach((variant) => {
      if (variant.steps.some((step) => step.id === enhancement.step.id)) return;
      const insertAt = Math.max(1, variant.steps.length - 1);
      variant.steps.splice(insertAt, 0, JSON.parse(JSON.stringify(enhancement.step)));
      variant.objectives.splice(insertAt, 0, enhancement.objective);
    });
  });
}

enhanceMissionArchitecture();

