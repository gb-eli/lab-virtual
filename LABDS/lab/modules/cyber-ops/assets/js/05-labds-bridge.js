'use strict';

(function () {
  const SOURCE = 'cyber-ops-shadow-grid';
  const targetOrigin = location.origin === 'null' ? '*' : location.origin;
  let initialized = false;
  let lastStateSignature = '';

  function post(type, payload = {}) {
    if (!CYBER_OPS_EMBEDDED || window.parent === window) return;
    window.parent.postMessage({ source: SOURCE, type, payload }, targetOrigin);
  }

  function missionInfo(missionId) {
    const mission = missions.find((item) => item.id === missionId);
    const module = mission ? getMissionModule(mission.id) : null;
    return mission ? {
      id: mission.id,
      code: mission.code,
      title: mission.title,
      moduleId: module?.id || mission.moduleId || '',
      moduleTitle: module?.title || ''
    } : { id: missionId || '', code: '', title: '', moduleId: '', moduleTitle: '' };
  }

  function summary(current = state) {
    const latest = current.history?.[0] || null;
    const latestMission = latest ? missionInfo(latest.missionId) : null;
    return {
      version: '6.1-labds',
      storageScope: CYBER_OPS_LABDS_SESSION || 'standalone',
      profile: current.profile ? {
        name: current.profile.name || '',
        code: current.profile.code || '',
        className: current.profile.className || ''
      } : null,
      difficulty: current.difficulty,
      activeModule: current.activeModule,
      completedCount: Object.keys(current.completed || {}).length,
      totalMissions: missions.length,
      totalScore: Number(current.totalScore || 0),
      badgeCount: Object.keys(current.badges || {}).length,
      badges: Object.keys(current.badges || {}).map((id) => ({ id, title: badgeCatalog?.[id]?.title || id })),
      role: typeof getAgentRole === 'function' ? getAgentRole() : 'Recruta Digital',
      modules: missionModules.map((module) => ({
        id: module.id,
        title: module.title,
        progress: getModuleProgress(module.id)
      })),
      latest: latest ? {
        ...latest,
        mission: latestMission
      } : null,
      updatedAt: new Date().toISOString()
    };
  }

  function stateChanged(current = state) {
    if (!CYBER_OPS_EMBEDDED) return;
    const payload = summary(current);
    const signature = JSON.stringify({
      profile: payload.profile,
      difficulty: payload.difficulty,
      activeModule: payload.activeModule,
      completedCount: payload.completedCount,
      totalScore: payload.totalScore,
      badgeCount: payload.badgeCount,
      latest: payload.latest ? [payload.latest.missionId, payload.latest.completedAt, payload.latest.status] : null
    });
    if (signature === lastStateSignature) return;
    lastStateSignature = signature;
    post('state', payload);
  }

  function applyLabContext(payload = {}) {
    const profile = payload.profile || {};
    if (profile.name) {
      state.profile = {
        name: String(profile.name).slice(0, 50),
        code: String(profile.code || 'AGENTE-DS').slice(0, 24),
        className: String(profile.className || '').slice(0, 30),
        createdAt: state.profile?.createdAt || new Date().toISOString(),
        source: 'lab-virtual-ds',
        sessionId: String(payload.sessionId || CYBER_OPS_LABDS_SESSION || '').slice(0, 80)
      };
    }
    if (payload.classroomUrl) state.settings.classroomUrl = String(payload.classroomUrl).slice(0, 500);
    if (typeof payload.reducedMotion === 'boolean') state.settings.reducedMotion = payload.reducedMotion;
    if (['economy', 'balanced', 'quality'].includes(payload.performanceProfile)) document.body.dataset.performance = payload.performanceProfile;
    if (typeof payload.sound === 'boolean') state.settings.sound = payload.sound;
    saveState();
    applySettings();
    if (ui.loginScreen.classList.contains('active') && state.profile) {
      bootRunId += 1;
      showScreen('hq');
      renderHQ();
    }
    post('context-applied', { profile: state.profile, storageScope: CYBER_OPS_LABDS_SESSION });
    stateChanged(state);
  }

  function exported(payload = {}) {
    post('export', { ...payload, at: new Date().toISOString() });
  }

  function handleMessage(event) {
    if (window.parent !== event.source) return;
    if (location.origin !== 'null' && event.origin !== location.origin) return;
    const message = event.data || {};
    if (message.source !== 'lab-virtual-ds') return;
    if (message.type === 'context') applyLabContext(message.payload);
    if (message.type === 'request-state') stateChanged(state);
    if (message.type === 'export-history') {
      exportHistory();
      post('command-complete', { requestId: message.requestId || '', command: 'export-history' });
    }
    if (message.type === 'set-sound') {
      state.settings.sound = Boolean(message.payload?.enabled);
      saveState();
      applySettings();
    }
  }

  function init() {
    if (initialized || !CYBER_OPS_EMBEDDED) return;
    initialized = true;
    document.body.classList.add('labds-embedded');
    addEventListener('message', handleMessage);
    post('ready', {
      version: '6.1-labds',
      storageScope: CYBER_OPS_LABDS_SESSION,
      capabilities: ['session-profile', 'progress-events', 'exports', 'offline-runtime-cache']
    });
    stateChanged(state);
  }

  window.CyberOpsLabDSBridge = { init, stateChanged, exported, summary };
})();
