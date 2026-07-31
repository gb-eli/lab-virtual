const ui = {
  bootScreen: $('#bootScreen'),
  bootLog: $('#bootLog'),
  bootProgress: $('#bootProgress'),
  skipBootBtn: $('#skipBootBtn'),
  loginScreen: $('#loginScreen'),
  loginStream: $('#loginStream'),
  agentForm: $('#agentForm'),
  agentName: $('#agentName'),
  agentCode: $('#agentCode'),
  agentClass: $('#agentClass'),
  hqScreen: $('#hqScreen'),
  difficultySelect: $('#difficultySelect'),
  difficultyBrief: $('#difficultyBrief'),
  moduleNav: $('#moduleNav'),
  campaignBrief: $('#campaignBrief'),
  mapNodes: $('#mapNodes'),
  hqThreatLabel: $('#hqThreatLabel'),
  hqThreatBar: $('#hqThreatBar'),
  hqAgentCode: $('#hqAgentCode'),
  completedCount: $('#completedCount'),
  totalScore: $('#totalScore'),
  lastAlert: $('#lastAlert'),
  missionList: $('#missionList'),
  missionScreen: $('#missionScreen'),
  missionClassification: $('#missionClassification'),
  missionTitle: $('#missionTitle'),
  missionLocation: $('#missionLocation'),
  missionCodename: $('#missionCodename'),
  stepCounter: $('#stepCounter'),
  missionTimer: $('#missionTimer'),
  threatValue: $('#threatValue'),
  lossValue: $('#lossValue'),
  missionScore: $('#missionScore'),
  missionBackdrop: $('#missionBackdrop'),
  missionContent: $('#missionContent'),
  eventBanner: $('#eventBanner'),
  objectivePanel: $('#objectivePanel'),
  evidencePanel: $('#evidencePanel'),
  commsPanel: $('#commsPanel'),
  commanderBtn: $('#commanderBtn'),
  intelSearchBtn: $('#intelSearchBtn'),
  hintBtn: $('#hintBtn'),
  continueBtn: $('#continueBtn'),
  exitMissionBtn: $('#exitMissionBtn'),
  intelSidebar: $('#intelSidebar'),
  sidebarToggle: $('#sidebarToggle'),
  briefingDialog: $('#briefingDialog'),
  briefingAgency: $('#briefingAgency'),
  briefingTitle: $('#briefingTitle'),
  briefingText: $('#briefingText'),
  briefingMeta: $('#briefingMeta'),
  startMissionBtn: $('#startMissionBtn'),
  resultDialog: $('#resultDialog'),
  resultSeal: $('#resultSeal'),
  resultEyebrow: $('#resultEyebrow'),
  resultTitle: $('#resultTitle'),
  resultMessage: $('#resultMessage'),
  resultStats: $('#resultStats'),
  retryMissionBtn: $('#retryMissionBtn'),
  exportReportBtn: $('#exportReportBtn'),
  openClassroomBtn: $('#openClassroomBtn'),
  returnHqBtn: $('#returnHqBtn'),
  tutorialBtn: $('#tutorialBtn'),
  settingsBtn: $('#settingsBtn'),
  settingsDialog: $('#settingsDialog'),
  soundToggle: $('#soundToggle'),
  motionToggle: $('#motionToggle'),
  classroomUrl: $('#classroomUrl'),
  saveSettingsBtn: $('#saveSettingsBtn'),
  honorsBtn: $('#honorsBtn'),
  toolkitBtn: $('#toolkitBtn'),
  missionToolkitBtn: $('#missionToolkitBtn'),
  profileBtn: $('#profileBtn'),
  tutorialDialog: $('#tutorialDialog'),
  tutorialTitle: $('#tutorialTitle'),
  tutorialText: $('#tutorialText'),
  tutorialSteps: $('#tutorialSteps'),
  tutorialPrevBtn: $('#tutorialPrevBtn'),
  tutorialNextBtn: $('#tutorialNextBtn'),
  closeTutorialBtn: $('#closeTutorialBtn'),
  profileDialog: $('#profileDialog'),
  profileCode: $('#profileCode'),
  profileDetails: $('#profileDetails'),
  exportAllBtn: $('#exportAllBtn'),
  resetProgressBtn: $('#resetProgressBtn'),
  closeProfileBtn: $('#closeProfileBtn'),
  cutsceneDialog: $('#cutsceneDialog'),
  cutsceneBackdrop: $('#cutsceneBackdrop'),
  cutsceneLabel: $('#cutsceneLabel'),
  cutsceneFaction: $('#cutsceneFaction'),
  cutsceneAvatar: $('#cutsceneAvatar'),
  cutsceneSpeaker: $('#cutsceneSpeaker'),
  cutsceneText: $('#cutsceneText'),
  cutsceneProgress: $('#cutsceneProgress'),
  nextCutsceneBtn: $('#nextCutsceneBtn'),
  skipCutsceneBtn: $('#skipCutsceneBtn'),
  honorsDialog: $('#honorsDialog'),
  honorsName: $('#honorsName'),
  honorsSubtitle: $('#honorsSubtitle'),
  honorsAvatar: $('#honorsAvatar'),
  honorsMedals: $('#honorsMedals'),
  honorsTitles: $('#honorsTitles'),
  honorsMessage: $('#honorsMessage'),
  exportHonorsBtn: $('#exportHonorsBtn'),
  closeHonorsBtn: $('#closeHonorsBtn'),
  toolkitDialog: $('#toolkitDialog'),
  toolkitTitle: $('#toolkitTitle'),
  toolkitSubtitle: $('#toolkitSubtitle'),
  toolkitSceneInfo: $('#toolkitSceneInfo'),
  toolkitTabs: $('#toolkitTabs'),
  toolkitContent: $('#toolkitContent'),
  closeToolkitBtn: $('#closeToolkitBtn'),
  supportDialog: $('#supportDialog'),
  supportAvatar: $('#supportAvatar'),
  supportFaction: $('#supportFaction'),
  supportName: $('#supportName'),
  supportMessage: $('#supportMessage'),
  supportContext: $('#supportContext'),
  requestAnalysisBtn: $('#requestAnalysisBtn'),
  closeSupportBtn: $('#closeSupportBtn'),
  closeSupportActionBtn: $('#closeSupportActionBtn'),
  toastRegion: $('#toastRegion')
};

function resetState() {
  return {
    profile: null,
    difficulty: 'recruta',
    activeModule: 'incident-response',
    completed: {},
    badges: {},
    totalScore: 0,
    history: [],
    settings: {
      sound: true,
      reducedMotion: false,
      classroomUrl: 'https://classroom.google.com/'
    },
    tutorialSeen: false,
    firstMissionTutorialDone: false,
    honorsSeen: false
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
    if (!raw) return resetState();
    const parsed = JSON.parse(raw);
    return {
      ...resetState(),
      ...parsed,
      settings: { ...resetState().settings, ...(parsed.settings || {}) }
    };
  } catch {
    return resetState();
  }
}

let state = loadState();
let selectedMissionBase = null;
let currentMissionBase = null;
let currentMission = null;
let currentStepIndex = 0;
let currentSelection = null;
let currentEvidence = [];
let currentComms = [];
let currentHintsUsed = 0;
let currentAttempts = 0;
let currentStepPenalties = 0;
let missionScoreValue = 0;
let missionTimerId = null;
let missionTickId = null;
let eventTimeoutId = null;
let threatLevel = 0;
let moneyLoss = 0;
let timeRemaining = 0;
let latestResult = null;
let currentMissionFailed = false;
let tutorialIndex = 0;
let missionTutorialIndex = 0;
let activeToolkitModule = 'computer';
let cutsceneIndex = 0;
let cutsceneScenes = [];
let cutsceneOnComplete = null;
let currentWorldLocation = null;
let missionPausedForTutorial = false;
let supportRequestsByStep = {};
let intelSearchesByStep = {};
let toolkitBusy = false;
let bootRunId = 0;

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // O laboratório continua funcional mesmo quando o navegador bloqueia o armazenamento local.
  }
  window.CyberOpsLabDSBridge?.stateChanged?.(state);
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function showScreen(name) {
  ['bootScreen','loginScreen','hqScreen','missionScreen'].forEach((id) => {
    ui[id].classList.toggle('active', id === `${name}Screen` || id === name);
  });
}

function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function formatCurrency(value) {
  return `R$ ${Math.max(0, Math.round(value)).toLocaleString('pt-BR')}`;
}

function toast(title, text = '', variant = '') {
  const el = document.createElement('div');
  el.className = `toast ${variant}`.trim();
  el.innerHTML = `<strong>${escapeHtml(title)}</strong>${text ? `<div>${escapeHtml(text)}</div>` : ''}`;
  ui.toastRegion.appendChild(el);
  setTimeout(() => el.remove(), 3400);
}

const audio = (() => {
  let ctx;
  function ensure() {
    if (!state.settings.sound) return null;
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }
  function beep(freq, duration = 0.08, type = 'sine', volume = 0.03) {
    const c = ensure();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain); gain.connect(c.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + duration);
    osc.stop(c.currentTime + duration);
  }
  return {
    click: () => beep(540, .05, 'triangle', .018),
    scan: () => { beep(240, .08, 'sine', .018); setTimeout(() => beep(360, .08, 'sine', .012), 70); },
    success: () => { beep(620, .08, 'triangle', .02); setTimeout(() => beep(820, .12, 'triangle', .02), 90); },
    error: () => { beep(190, .18, 'sawtooth', .028); },
    alert: () => { beep(760, .08, 'square', .022); setTimeout(() => beep(620, .08, 'square', .02), 100); }
  };
})();

function applySettings() {
  if (!missionModules.some((module) => module.id === state.activeModule)) state.activeModule = missionModules[0].id;
  state.badges = state.badges || {};
  document.body.dataset.theme = state.difficulty;
  document.body.dataset.module = state.activeModule;
  ui.difficultySelect.value = state.difficulty;
  ui.soundToggle.checked = state.settings.sound;
  ui.motionToggle.checked = state.settings.reducedMotion;
  ui.classroomUrl.value = state.settings.classroomUrl || 'https://classroom.google.com/';
  document.body.classList.toggle('reduced-motion', !!state.settings.reducedMotion);
}

function getMissionVariant(baseMission) {
  return baseMission.variants[state.difficulty];
}

function updateHQThreat() {
  const completionRatio = missions.length ? Object.keys(state.completed).length / missions.length : 0;
  const posture = completionRatio > .7 ? { label: 'ESTABILIZADA', width: '32%' } : completionRatio > .35 ? { label: 'VIGILÂNCIA ELEVADA', width: '54%' } : { label: 'EQUILIBRADA', width: '66%' };
  ui.hqThreatLabel.textContent = posture.label;
  ui.hqThreatBar.style.width = posture.width;
}

const phaseColors = ['#14dfff', '#ffc857', '#a77bff', '#ff6b7d', '#59ffa8', '#ff934f', '#6ec8ff'];

function applyMissionVisualTheme() {
  const module = selectedMissionBase ? getMissionModule(selectedMissionBase.id) : getActiveModule();
  const missionColor = selectedMissionBase?.color || module.color;
  const phaseColor = phaseColors[currentStepIndex % phaseColors.length];
  document.body.dataset.module = module.id;
  document.body.style.setProperty('--module-color', module.color);
  document.body.style.setProperty('--mission-color', missionColor);
  document.body.style.setProperty('--phase-color', phaseColor);
}

function clearMissionVisualTheme() {
  const module = getActiveModule();
  document.body.dataset.module = module.id;
  document.body.style.setProperty('--module-color', module.color);
  document.body.style.setProperty('--mission-color', module.color);
  document.body.style.setProperty('--phase-color', module.color);
}

function renderMapNodes() {
  ui.mapNodes.innerHTML = missions.map((mission) => {
    const done = Boolean(state.completed[mission.id]);
    const unlocked = isMissionUnlocked(mission.id);
    const module = getMissionModule(mission.id);
    const activeModule = module.id === state.activeModule;
    return `<button class="map-node ${activeModule ? 'active-module' : 'other-module'} ${done ? 'completed' : unlocked ? 'alert' : ''}" ${unlocked ? '' : 'disabled'} style="--x:${mission.map.x};--y:${mission.map.y};--node-color:${mission.color};border-color:${mission.color};opacity:${unlocked ? 1 : .38}" data-id="${mission.id}" data-label="${escapeHtml(module.code)} • ${escapeHtml(mission.code)}"></button>`;
  }).join('');
  $$('.map-node', ui.mapNodes).forEach((node) => node.addEventListener('click', () => {
    const mission = missions.find((item) => item.id === node.dataset.id);
    if (!mission) return;
    const module = getMissionModule(mission.id);
    state.activeModule = module.id;
    saveState();
    if (!isMissionUnlocked(mission.id)) {
      toast('Fase bloqueada', 'Conclua a fase anterior deste módulo para continuar.', 'error');
      audio.error();
      renderHQ();
      return;
    }
    renderHQ();
    openMissionBriefing(mission);
  }));
}

function renderModuleNav() {
  ui.moduleNav.innerHTML = missionModules.map((module) => {
    const progress = getModuleProgress(module.id);
    const active = module.id === state.activeModule;
    return `<button class="module-chip ${active ? 'active' : ''}" type="button" data-module="${module.id}" style="--module-chip-color:${module.color}">
      <span class="module-icon">${module.icon}</span>
      <span><strong>${escapeHtml(module.title)}</strong><small>${progress.completed}/${progress.total} fases • ${progress.percent}%</small></span>
    </button>`;
  }).join('');
  $$('.module-chip', ui.moduleNav).forEach((button) => button.addEventListener('click', () => {
    state.activeModule = button.dataset.module;
    saveState();
    clearMissionVisualTheme();
    renderModuleNav();
    renderCampaignBrief();
    renderMissionList();
    audio.click();
  }));
}

function renderMissionList() {
  const module = getActiveModule();
  const moduleMissions = module.missions.map((id) => missions.find((mission) => mission.id === id)).filter(Boolean);
  ui.difficultyBrief.innerHTML = `<strong>${escapeHtml(difficultyRules[state.difficulty].label)}</strong><br>${escapeHtml(difficultyRules[state.difficulty].brief)}`;
  ui.missionList.innerHTML = moduleMissions.map((mission) => {
    const variant = getMissionVariant(mission);
    const completed = state.completed[mission.id];
    const unlocked = isMissionUnlocked(mission.id);
    const chapter = getCampaignChapter(mission.id);
    const city = chooseWorldLocation(mission.id);
    return `
      <button class="mission-card ${completed ? 'completed' : ''} ${unlocked ? '' : 'locked'}" type="button" data-id="${mission.id}" style="--mission-color:${mission.color}">
        <div class="mission-card-header">
          <div>
            <div class="code">${escapeHtml(module.code)} • ${escapeHtml(mission.code)}</div>
            <h4>${escapeHtml(mission.title)}</h4><div class="code">${escapeHtml(chapter?.title || '')}</div>
          </div>
          <div class="status">${completed ? `Concluída • ${escapeHtml(completed.rank)}` : unlocked ? 'Disponível' : 'Conclua a fase anterior'}</div>
        </div>
        <p>${escapeHtml(mission.subtitle)} — ${escapeHtml(mission.synopsis)}</p>
        <div class="mission-card-meta">
          <span>${Math.round(variant.timeLimit / 60)} min</span>
          <span>${escapeHtml(variant.steps.length)} etapas</span>
          <span>◉ ${escapeHtml(city.city)}, ${escapeHtml(city.country)}</span>
          <span>${escapeHtml(variant.objectives[0])}</span>
        </div>
      </button>`;
  }).join('');
  $$('.mission-card', ui.missionList).forEach((button) => button.addEventListener('click', () => {
    const mission = missions.find((item) => item.id === button.dataset.id);
    if (!mission) return;
    if (!isMissionUnlocked(mission.id)) {
      toast('Fase bloqueada', 'Finalize a fase anterior dentro deste módulo. Os outros módulos continuam livres.', 'error');
      audio.error();
      return;
    }
    openMissionBriefing(mission);
  }));
}

function renderCampaignBrief() {
  const module = getActiveModule();
  const progress = getModuleProgress(module.id);
  const moduleStories = module.missions.map((id) => getCampaignChapter(id)).filter(Boolean);
  const nextStory = moduleStories.find((story) => !state.completed[story.missionId]);
  const heading = progress.completed === progress.total ? 'Módulo concluído' : nextStory?.title || 'Operações disponíveis';
  const text = progress.completed === progress.total
    ? 'Todas as fases deste módulo foram concluídas. Você pode repetir as operações ou abrir qualquer outro módulo.'
    : nextStory?.hook || module.description;
  ui.campaignBrief.innerHTML = `
    <div class="module-brief-heading"><span class="module-emblem" style="--module-color:${module.color}">${module.icon}</span><div><small>${escapeHtml(module.code)}</small><h4>${escapeHtml(module.title)}</h4></div></div>
    <p><strong>${escapeHtml(heading)}</strong></p>
    <p>${escapeHtml(text)}</p>
    <div class="module-progress"><span style="width:${progress.percent}%;background:${module.color}"></span></div>
    <p><em>${escapeHtml(nextStory?.suspense || 'Módulo estabilizado. Nenhuma conexão externa real é utilizada.')}</em></p>
    <div class="simulation-notice"><strong>SIMULAÇÃO EDUCACIONAL</strong><span>NASA, FBI, Interpol, Polícia Federal, satélites, telefonia, IMEI, bancos e redes externas aparecem somente como interfaces fictícias locais.</span></div>
    <div class="campaign-track">
      ${moduleStories.map((item, index) => {
        const done = Boolean(state.completed[item.missionId]);
        const unlocked = isMissionUnlocked(item.missionId);
        const cls = done ? 'done' : unlocked && !done ? 'current' : 'locked';
        return `<div class="campaign-node ${cls}"><b>${index + 1}</b><div><strong>${escapeHtml(item.title)}</strong><br><small>${escapeHtml(item.suspense)}</small></div><span>${done ? '✓' : unlocked ? '•' : '🔒'}</span></div>`;
      }).join('')}
    </div>`;
}

function renderHQ() {
  applySettings();
  clearMissionVisualTheme();
  ui.hqAgentCode.textContent = state.profile?.code || '—';
  ui.completedCount.textContent = `${Object.keys(state.completed).length}/${missions.length}`;
  ui.totalScore.textContent = state.totalScore.toLocaleString('pt-BR');
  ui.lastAlert.textContent = state.history[0] ? `${missions.find((m) => m.id === state.history[0].missionId)?.code || ''} // ${state.history[0].status}` : 'NENHUM';
  ui.honorsBtn.classList.toggle('hidden', !Object.keys(state.badges || {}).length && !state.completed['chimera-zero']);
  updateHQThreat();
  renderMapNodes();
  renderModuleNav();
  renderCampaignBrief();
  renderMissionList();
  if (!state.tutorialSeen) setTimeout(() => openTutorial(true), 350);
}

function startBoot() {
  const runId = ++bootRunId;
  showScreen('boot');
  ui.bootLog.innerHTML = '';
  ui.bootProgress.style.width = '0%';
  let index = 0;
  const run = () => {
    if (runId !== bootRunId) return;
    if (index >= BOOT_LOGS.length) {
      setTimeout(() => {
        if (runId !== bootRunId) return;
        if (state.profile) {
          showScreen('hq');
          renderHQ();
        } else {
          showScreen('login');
        }
      }, state.settings.reducedMotion ? 20 : 220);
      return;
    }
    const line = document.createElement('div');
    line.textContent = `> ${BOOT_LOGS[index]}`;
    ui.bootLog.appendChild(line);
    ui.bootProgress.style.width = `${((index + 1) / BOOT_LOGS.length) * 100}%`;
    audio.scan();
    index += 1;
    setTimeout(run, state.settings.reducedMotion ? 40 : 420);
  };
  run();
}

function renderLoginStream() {
  const lines = [
    '• Operações curtas com narrativa, cronômetro e pressão dinâmica',
    '• Dificuldades diferentes com missões, dados e respostas diferentes',
    '• Progresso salvo localmente // sem servidores externos',
    '• Ideal para GitHub Pages e uso em laboratório virtual'
  ];
  ui.loginStream.innerHTML = lines.map((line) => `<div>${escapeHtml(line)}</div>`).join('');
}

function renderCutsceneFrame() {
  const scene = cutsceneScenes[cutsceneIndex];
  if (!scene) return;
  ui.cutsceneBackdrop.dataset.mood = scene.mood || 'mystery';
  ui.cutsceneLabel.textContent = cutsceneIndex === 0 ? 'TRANSMISSÃO CRIPTOGRAFADA' : 'CANAL SEGURO // CONTINUAÇÃO';
  ui.cutsceneFaction.textContent = scene.speaker?.faction || 'CYBER OPS';
  ui.cutsceneAvatar.textContent = scene.speaker?.avatar || 'CO';
  ui.cutsceneSpeaker.textContent = scene.speaker?.name || 'Central de Operações';
  ui.cutsceneText.textContent = scene.text;
  ui.cutsceneProgress.innerHTML = cutsceneScenes.map((_, index) => `<i class="${index <= cutsceneIndex ? 'active' : ''}"></i>`).join('');
  ui.nextCutsceneBtn.textContent = cutsceneIndex >= cutsceneScenes.length - 1 ? 'Encerrar transmissão →' : 'Continuar →';
  audio.scan();
}

function playCutscene(scenes, onComplete) {
  cutsceneScenes = scenes || [];
  cutsceneIndex = 0;
  cutsceneOnComplete = onComplete || null;
  if (!cutsceneScenes.length) {
    cutsceneOnComplete?.();
    return;
  }
  renderCutsceneFrame();
  if (!ui.cutsceneDialog.open) ui.cutsceneDialog.showModal();
}

function finishCutscene() {
  if (ui.cutsceneDialog.open) ui.cutsceneDialog.close();
  const callback = cutsceneOnComplete;
  cutsceneOnComplete = null;
  callback?.();
}

function nextCutscene() {
  if (cutsceneIndex >= cutsceneScenes.length - 1) {
    finishCutscene();
    return;
  }
  cutsceneIndex += 1;
  renderCutsceneFrame();
}

function launchSelectedMission() {
  if (!selectedMissionBase) return;
  ui.briefingDialog.close();
  playCutscene(buildCutscenes(selectedMissionBase.id, 'pre'), startMission);
}

function renderMissionTutorialOverlay() {
  const slide = missionTutorialSlides[missionTutorialIndex];
  const overlay = document.createElement('div');
  overlay.className = 'mission-tutorial-overlay';
  overlay.innerHTML = `
    <div class="mission-tutorial-card">
      <p class="eyebrow">TREINAMENTO EM CAMPO</p>
      <h3>${escapeHtml(slide.title)}</h3>
      <p>${escapeHtml(slide.text)}</p>
      <div class="mission-tutorial-steps">${missionTutorialSlides.map((_, index) => `<i class="${index <= missionTutorialIndex ? 'active' : ''}"></i>`).join('')}</div>
      <div class="dialog-actions wrap-actions">
        <button class="secondary-button tutorial-skip" type="button">Pular treinamento</button>
        <button class="primary-button tutorial-next" type="button">${missionTutorialIndex >= missionTutorialSlides.length - 1 ? 'Entrar na missão' : 'Próximo →'}</button>
      </div>
    </div>`;
  ui.missionContent.appendChild(overlay);
  $('.tutorial-skip', overlay).addEventListener('click', () => {
    state.firstMissionTutorialDone = true;
    missionPausedForTutorial = false;
    saveState();
    overlay.remove();
    scheduleRandomEvent();
  });
  $('.tutorial-next', overlay).addEventListener('click', () => {
    if (missionTutorialIndex >= missionTutorialSlides.length - 1) {
      state.firstMissionTutorialDone = true;
      missionPausedForTutorial = false;
      saveState();
      overlay.remove();
      scheduleRandomEvent();
      toast('Treinamento concluído', 'A central liberou o controle total da ferramenta.', 'success');
      return;
    }
    missionTutorialIndex += 1;
    overlay.remove();
    renderMissionTutorialOverlay();
  });
}

function maybeRunFirstMissionTutorial() {
  if (state.firstMissionTutorialDone || currentStepIndex !== 0) return;
  missionTutorialIndex = 0;
  setTimeout(renderMissionTutorialOverlay, state.settings.reducedMotion ? 50 : 450);
}

function openMissionBriefing(mission) {
  selectedMissionBase = mission;
  state.activeModule = getMissionModule(mission.id).id;
  saveState();
  currentWorldLocation = worldLocations[Math.floor(Math.random() * worldLocations.length)];
  const variant = getMissionVariant(mission);
  const chapter = getCampaignChapter(mission.id);
  const module = getMissionModule(mission.id);
  applyMissionVisualTheme();
  ui.briefingAgency.textContent = mission.classification;
  ui.briefingTitle.textContent = mission.title;
  ui.briefingText.textContent = `${chapter?.title ? chapter.title + ' — ' : ''}${variant.briefing} ${chapter?.hook || ''} Cenário localizado em ${currentWorldLocation.city}, ${currentWorldLocation.country}. Toda consulta institucional, satelital, telefônica, financeira ou policial é uma simulação local e educativa.`;
  ui.briefingMeta.innerHTML = `
    <div><span>MÓDULO</span><strong>${escapeHtml(module.title)}</strong></div>
    <div><span>FASE DO MÓDULO</span><strong>${mission.moduleOrder}/${module.missions.length}</strong></div>
    <div><span>CODINOME</span><strong>${escapeHtml(mission.code)}</strong></div>
    <div><span>LOCAL DA OPERAÇÃO</span><strong>${escapeHtml(formatWorldLocation(currentWorldLocation))}</strong></div>
    <div><span>REGIÃO</span><strong>${escapeHtml(currentWorldLocation.region)}</strong></div>
    <div><span>NÍVEL</span><strong>${escapeHtml(difficultyRules[state.difficulty].label)}</strong></div>
    <div><span>TEMPO ESTIMADO</span><strong>${Math.round(variant.timeLimit / 60)} minutos</strong></div>
    <div><span>FACÇÃO ADVERSÁRIA</span><strong>${escapeHtml(mission.id === 'ghost-sentinel' ? factions.sentinelNine.name : mission.id === 'spectral-vault' ? factions.glassJackal.name : factions.nexusUmbra.name)}</strong></div>
    <div><span>ATENÇÃO</span><strong>${escapeHtml(chapter?.suspense || 'Atenção a mudanças no incidente')}</strong></div>`;
  ui.briefingDialog.showModal();
}

function clearMissionTimers() {
  clearInterval(missionTimerId);
  clearInterval(missionTickId);
  clearTimeout(eventTimeoutId);
}

function currentStep() {
  return currentMission.steps[currentStepIndex];
}

function renderEvidencePanel() {
  ui.evidencePanel.innerHTML = `<h4>Evidências coletadas</h4>${currentEvidence.length ? `<ul>${currentEvidence.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '<p>Nenhuma evidência confirmada.</p>'}`;
}

function renderIntelPanels() {
  const chapter = getCampaignChapter(selectedMissionBase.id);
  ui.objectivePanel.innerHTML = `
    <h4>Objetivos da operação</h4>
    <p><strong>${escapeHtml(chapter?.title || '')}</strong><br>${escapeHtml(chapter?.suspense || 'Incidente em andamento.')}</p>
    <ul class="timeline-list">
      ${currentMission.objectives.map((objective, index) => `<li class="${index < currentStepIndex ? 'done' : ''}"><strong>Fase ${index + 1}</strong><br>${escapeHtml(objective)}</li>`).join('')}
    </ul>
    <h4 style="margin-top:14px">Pressão dinâmica</h4>
    <p>O ambiente pode gerar novos incidentes enquanto você investiga. Respostas erradas, demora ou falta de contenção elevam a ameaça.</p>`;
  renderEvidencePanel();
  ui.commsPanel.innerHTML = `<h4>Canal de comunicações</h4>${currentComms.length ? `<ul>${currentComms.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '<p>Sem mensagens adicionais no momento.</p>'}`;
}

function showBanner(text, variant = 'alert') {
  ui.eventBanner.textContent = text;
  ui.eventBanner.className = `overlay-banner ${variant}`;
  ui.eventBanner.classList.remove('hidden');
  setTimeout(() => ui.eventBanner.classList.add('hidden'), state.settings.reducedMotion ? 400 : 2600);
}

function updateMissionStats() {
  ui.stepCounter.textContent = `${Math.min(currentStepIndex + 1, currentMission.steps.length)}/${currentMission.steps.length}`;
  ui.missionTimer.textContent = formatTime(timeRemaining);
  ui.threatValue.textContent = `${Math.min(100, Math.round(threatLevel))}%`;
  ui.lossValue.textContent = formatCurrency(moneyLoss);
  ui.missionScore.textContent = Math.round(missionScoreValue).toLocaleString('pt-BR');

  const hue = threatLevel < 35 ? '#56ffb0' : threatLevel < 65 ? '#ffc54d' : '#ff4d70';
  ui.threatValue.style.color = hue;
  ui.missionBackdrop.style.filter = `saturate(${100 + threatLevel / 2}%) brightness(${100 - Math.min(35, threatLevel / 3)}%)`;
}

function scheduleRandomEvent() {
  const events = currentMission.events || [];
  if ((!events.length && !globalCriticalEvents.length) || currentMissionFailed || missionPausedForTutorial) return;
  const rule = difficultyRules[state.difficulty];
  const bossBoost = selectedMissionBase?.id === 'chimera-zero' ? 0.32 : 0;
  const criticalChance = Math.min(.85, (state.difficulty === 'especialista' ? .48 : state.difficulty === 'agente' ? .3 : .16) + bossBoost);
  const delay = Math.floor((Math.random() * (rule.eventMax - rule.eventMin) + rule.eventMin) * 1000 * (selectedMissionBase?.id === 'chimera-zero' ? .7 : 1));
  eventTimeoutId = setTimeout(() => {
    if (currentMissionFailed || missionPausedForTutorial) return;
    const useCritical = Math.random() < criticalChance;
    const baseEvent = useCritical ? globalCriticalEvents[Math.floor(Math.random() * globalCriticalEvents.length)] : events[Math.floor(Math.random() * events.length)];
    if (!baseEvent) return scheduleRandomEvent();
    const event = { ...baseEvent };
    if (event.kind === 'global') {
      const extraLocation = worldLocations[Math.floor(Math.random() * worldLocations.length)];
      event.text = `${event.text} ${extraLocation.city}, ${extraLocation.country} entrou no mapa.`;
    }
    threatLevel = Math.min(100, threatLevel + event.threat);
    moneyLoss += event.loss;
    if (event.time) timeRemaining = Math.max(1, timeRemaining - event.time);
    currentComms.unshift(event.text);
    if (event.kind === 'erase') currentComms.unshift('EVIDÊNCIA // Cache temporário parcialmente corrompido; valide os registros restantes.');
    if (event.kind === 'counter') {
      ui.hintBtn.disabled = true;
      setTimeout(() => {
        if (!currentMissionFailed) ui.hintBtn.disabled = currentHintsUsed >= difficultyRules[state.difficulty].hints;
      }, 7000);
    }
    if (event.kind === 'tool-lock' || event.kind === 'network-failure') {
      ui.missionToolkitBtn.disabled = true;
      ui.intelSearchBtn.disabled = true;
      document.body.classList.add('system-disruption');
      setTimeout(() => {
        document.body.classList.remove('system-disruption');
        if (!currentMissionFailed) {
          ui.missionToolkitBtn.disabled = false;
          ui.intelSearchBtn.disabled = false;
        }
      }, state.settings.reducedMotion ? 800 : 6000);
    }
    if (event.kind === 'exposure') {
      document.body.classList.add('exposure-event');
      currentComms.unshift('PROTOCOLO // A central trocou o identificador da sessão para reduzir o risco de descoberta.');
      setTimeout(() => document.body.classList.remove('exposure-event'), 1200);
    }
    if (event.kind === 'extortion') {
      currentComms.unshift('BTC-LAB // A exigência financeira é fictícia. O objetivo educacional continua sendo conter, preservar evidências e não realizar pagamentos.');
    }
    currentComms = currentComms.slice(0, 14);
    renderIntelPanels();
    updateMissionStats();
    ui.lastAlert.textContent = event.text.slice(0, 34).toUpperCase();
    showBanner(event.text, useCritical ? 'critical' : 'alert');
    document.body.classList.add('critical-flash');
    setTimeout(() => document.body.classList.remove('critical-flash'), 650);
    audio.alert();
    if (threatLevel >= 100) {
      failMission('Colapso do incidente', 'A ameaça atingiu o nível máximo. O ataque evoluiu além da contenção possível nesta tentativa.');
      return;
    }
    scheduleRandomEvent();
  }, delay);
}

function applyMissionSidebarMode() {
  const compact = window.innerWidth <= 720;
  ui.intelSidebar.classList.toggle('collapsed', compact);
  $$('.intel-panel, .mission-actions, .intel-tabs', ui.intelSidebar).forEach((el) => el.classList.toggle('hidden', compact));
  ui.sidebarToggle.textContent = compact ? 'Mostrar' : 'Ocultar';
}

function startMission() {
  if (!selectedMissionBase) return;
  currentMissionBase = selectedMissionBase;
  currentMission = getMissionVariant(selectedMissionBase);
  currentStepIndex = 0;
  currentSelection = null;
  currentEvidence = [];
  const chapter = getCampaignChapter(selectedMissionBase.id);
  currentWorldLocation = currentWorldLocation || chooseWorldLocation(selectedMissionBase.id);
  currentComms = [selectedMissionBase.subtitle, `CENÁRIO FICTÍCIO // ${formatWorldLocation(currentWorldLocation)}`, currentMission.briefing, chapter?.hook || '', chapter?.suspense || ''];
  currentHintsUsed = 0;
  currentAttempts = 0;
  currentStepPenalties = 0;
  supportRequestsByStep = {};
  intelSearchesByStep = {};
  missionScoreValue = 0;
  currentMissionFailed = false;
  missionPausedForTutorial = !state.firstMissionTutorialDone;
  latestResult = null;
  threatLevel = Math.max(currentMission.threatStart || 0, difficultyRules[state.difficulty].threatStart);
  moneyLoss = currentMission.initialLoss || 0;
  timeRemaining = currentMission.timeLimit;

  if (ui.briefingDialog.open) ui.briefingDialog.close();
  ui.missionClassification.textContent = selectedMissionBase.classification;
  ui.missionTitle.textContent = selectedMissionBase.title;
  ui.missionLocation.textContent = formatWorldLocation(currentWorldLocation);
  ui.missionCodename.textContent = `${getMissionModule(selectedMissionBase.id).code} • ${selectedMissionBase.code}`;
  ui.continueBtn.classList.add('hidden');
  applyMissionVisualTheme();
  showScreen('mission');
  applyMissionSidebarMode();
  updateMissionStats();
  renderIntelPanels();
  renderMissionIntro();
  clearMissionTimers();
  missionTickId = setInterval(tickMission, 1000);
  if (!missionPausedForTutorial) scheduleRandomEvent();
}

function tickMission() {
  if (currentMissionFailed || missionPausedForTutorial) return;
  timeRemaining -= 1;
  if (timeRemaining <= 0) {
    timeRemaining = 0;
    updateMissionStats();
    failMission('Tempo esgotado', 'Os sistemas críticos entraram em falha operacional antes da contenção.');
    return;
  }
  if (timeRemaining <= Math.ceil(currentMission.timeLimit * 0.25)) {
    threatLevel = Math.min(100, threatLevel + 0.7);
  } else if (timeRemaining <= Math.ceil(currentMission.timeLimit * 0.5)) {
    threatLevel = Math.min(100, threatLevel + 0.35);
  }
  if (threatLevel >= 100) {
    failMission('Ameaça máxima atingida', 'O incidente saiu do controle e gerou falha catastrófica.');
    return;
  }
  updateMissionStats();
}

function renderMissionIntro() {
  ui.missionContent.innerHTML = `
    <div class="operation-intro">
      <div class="classified-line">${escapeHtml(selectedMissionBase.code)} // ${escapeHtml(difficultyRules[state.difficulty].label)}</div>
      <p class="eyebrow">CARREGANDO DOSSIÊ DA OPERAÇÃO</p>
      <h3>${escapeHtml(selectedMissionBase.title)}</h3>
      <p>${escapeHtml(currentMission.briefing)}</p>
      <div class="operation-loader"><i></i><i></i><i></i><i></i></div>
    </div>`;
  setTimeout(() => renderCurrentStep(), state.settings.reducedMotion ? 50 : 1100);
}

function resetStepState() {
  currentSelection = null;
  currentStepPenalties = 0;
  ui.continueBtn.classList.add('hidden');
  ui.hintBtn.disabled = currentHintsUsed >= difficultyRules[state.difficulty].hints;
  ui.hintBtn.textContent = `Solicitar pista (${Math.max(0, difficultyRules[state.difficulty].hints - currentHintsUsed)})`;
  ui.commanderBtn.disabled = false;
  ui.intelSearchBtn.disabled = false;
  ui.intelSearchBtn.textContent = 'Pesquisa tática';
}

function toolFrame(step, content, title = step.title) {
  return `
    <div class="tool-shell">
      <div class="tool-heading">
        <div>
          <p class="eyebrow">FERRAMENTA AUTORIZADA</p>
          <h3>${escapeHtml(title)}</h3>
        </div>
        <p>${escapeHtml(step.instruction)}</p>
      </div>
      <div class="tool-window">
        <div class="tool-toolbar"><i class="light"></i><i class="light"></i><i class="light"></i><span>AMBIENTE ISOLADO • SIMULAÇÃO EDUCACIONAL</span></div>
        ${content}
      </div>
    </div>`;
}

function renderCurrentStep() {
  resetStepState();
  applyMissionVisualTheme();
  renderIntelPanels();
  updateMissionStats();
  const step = currentStep();
  const renderers = {
    choice: renderChoiceStep,
    network: renderNetworkStep,
    packet: renderPacketStep,
    document: renderDocumentStep,
    cctv: renderCctvStep,
    wallet: renderWalletStep,
    social: renderSocialStep,
    logic: renderLogicStep,
    intercept: renderInterceptStep
  };
  (renderers[step.type] || renderChoiceStep)(step);
  audio.scan();
  maybeRunFirstMissionTutorial();
}

