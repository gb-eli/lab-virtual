function registerEvents() {
  ui.skipBootBtn.addEventListener('click', () => {
    bootRunId += 1;
    if (state.profile) { showScreen('hq'); renderHQ(); } else { showScreen('login'); }
  });

  ui.agentForm.addEventListener('submit', (event) => {
    event.preventDefault();
    state.profile = {
      name: ui.agentName.value.trim(),
      code: ui.agentCode.value.trim(),
      className: ui.agentClass.value.trim(),
      createdAt: new Date().toISOString()
    };
    saveState();
    audio.success();
    showScreen('hq');
    renderHQ();
  });

  ui.tutorialBtn.addEventListener('click', () => openTutorial(false));
  ui.toolkitBtn.addEventListener('click', () => openToolkit('computer'));
  ui.missionToolkitBtn.addEventListener('click', () => openToolkit(getRecommendedToolkitModule()));
  ui.closeToolkitBtn.addEventListener('click', closeToolkit);
  ui.closeSupportBtn.addEventListener('click', () => ui.supportDialog.close());
  ui.closeSupportActionBtn.addEventListener('click', () => ui.supportDialog.close());
  ui.requestAnalysisBtn.addEventListener('click', requestSupportAnalysis);
  ui.closeTutorialBtn.addEventListener('click', () => closeTutorial(true));
  ui.tutorialPrevBtn.addEventListener('click', () => { tutorialIndex = Math.max(0, tutorialIndex - 1); renderTutorial(); audio.click(); });
  ui.tutorialNextBtn.addEventListener('click', () => {
    if (tutorialIndex >= tutorialSlides.length - 1) { closeTutorial(true); toast('Tutorial concluído', 'Agora você pode escolher qualquer módulo e seguir suas fases.', 'success'); return; }
    tutorialIndex += 1; renderTutorial(); audio.click();
  });

  ui.difficultySelect.addEventListener('change', () => {
    state.difficulty = ui.difficultySelect.value;
    saveState();
    document.body.dataset.theme = state.difficulty;
    renderHQ();
    toast('Dificuldade atualizada', difficultyRules[state.difficulty].label);
  });

  ui.startMissionBtn.addEventListener('click', launchSelectedMission);
  ui.nextCutsceneBtn.addEventListener('click', nextCutscene);
  ui.skipCutsceneBtn.addEventListener('click', finishCutscene);
  ui.commanderBtn.addEventListener('click', openSupportChannel);
  ui.intelSearchBtn.addEventListener('click', runIntelSearch);
  ui.hintBtn.addEventListener('click', showHint);
  ui.continueBtn.addEventListener('click', advanceMission);
  ui.exitMissionBtn.addEventListener('click', exitMission);
  ui.retryMissionBtn.addEventListener('click', retryMission);
  ui.exportReportBtn.addEventListener('click', () => {
    exportMissionReport();
    toast('Evidência exportada', 'Relatório gerado no dispositivo.', 'success');
  });
  ui.openClassroomBtn.addEventListener('click', () => {
    window.open(state.settings.classroomUrl || 'https://classroom.google.com/', '_blank', 'noopener,noreferrer');
  });
  ui.returnHqBtn.addEventListener('click', () => {
    const shouldHonor = latestResult?.status === 'Concluída' && latestResult?.missionId === 'chimera-zero';
    ui.resultDialog.close();
    currentMission = null; currentMissionBase = null;
    if (shouldHonor) {
      showHonorsCeremony();
      return;
    }
    showScreen('hq');
    renderHQ();
  });
  ui.exportHonorsBtn.addEventListener('click', () => { exportHonorsCertificate(); toast('Certificado exportado', 'O arquivo de honra foi gerado.', 'success'); });
  ui.closeHonorsBtn.addEventListener('click', () => {
    ui.honorsDialog.close();
    showScreen('hq');
    renderHQ();
  });

  $$('.intel-tab').forEach((tab) => tab.addEventListener('click', () => {
    $$('.intel-tab').forEach((item) => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', String(active));
    });
    $$('.intel-panel').forEach((panel) => panel.classList.remove('active'));
    $(`#${tab.dataset.tab}Panel`).classList.add('active');
  }));

  ui.sidebarToggle.addEventListener('click', () => {
    const hidden = ui.intelSidebar.classList.toggle('collapsed');
    $$('.intel-panel, .mission-actions, .intel-tabs', ui.intelSidebar).forEach((el) => el.classList.toggle('hidden', hidden));
    ui.sidebarToggle.textContent = hidden ? 'Mostrar' : 'Ocultar';
  });

  ui.settingsBtn.addEventListener('click', () => ui.settingsDialog.showModal());
  ui.saveSettingsBtn.addEventListener('click', () => {
    const url = ui.classroomUrl.value.trim();
    if (url && !/^https?:\/\//i.test(url)) {
      toast('Link inválido', 'Use um endereço iniciado por http:// ou https://', 'error');
      return;
    }
    state.settings.sound = ui.soundToggle.checked;
    state.settings.reducedMotion = ui.motionToggle.checked;
    state.settings.classroomUrl = url || 'https://classroom.google.com/';
    saveState();
    applySettings();
    ui.settingsDialog.close();
    toast('Configurações salvas');
  });

  ui.honorsBtn.addEventListener('click', showHonorsCeremony);
  ui.profileBtn.addEventListener('click', openProfile);
  ui.closeProfileBtn.addEventListener('click', () => ui.profileDialog.close());
  ui.exportAllBtn.addEventListener('click', () => { exportHistory(); toast('Histórico exportado'); });
  ui.resetProgressBtn.addEventListener('click', () => {
    const confirmed = confirm('Redefinir perfil e todo o progresso salvo neste dispositivo?');
    if (!confirmed) return;
    state = resetState();
    saveState();
    applySettings();
    ui.profileDialog.close();
    showScreen('login');
    toast('Progresso redefinido');
  });
}

function registerServiceWorker() {
  if (CYBER_OPS_EMBEDDED) return;
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

function initAmbientCanvas() {
  const canvas = $('#ambientCanvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  let w = 0, h = 0, lastFrame = 0, lastScale = 0;
  const particles = Array.from({ length: 80 }, () => ({ x: Math.random(), y: Math.random(), z: 0.4 + Math.random() * 1.2, size: 1 + Math.random() * 2 }));
  function profile() { return document.body.dataset.performance || 'balanced'; }
  function scale() { return profile() === 'economy' ? 1 : profile() === 'quality' ? Math.min(devicePixelRatio, 2) : Math.min(devicePixelRatio, 1.5); }
  function resize() {
    const ratio = scale();
    w = canvas.width = Math.max(1, Math.round(innerWidth * ratio));
    h = canvas.height = Math.max(1, Math.round(innerHeight * ratio));
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    lastScale = ratio;
  }
  resize();
  addEventListener('resize', resize, { passive: true });
  function loop(time) {
    const mode = profile();
    const reduced = !!state.settings.reducedMotion;
    const interval = reduced ? 500 : mode === 'economy' ? 42 : mode === 'balanced' ? 25 : 16;
    if (time - lastFrame < interval) { requestAnimationFrame(loop); return; }
    lastFrame = time;
    if (lastScale !== scale()) resize();
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    if (!reduced) {
      const count = mode === 'economy' ? 24 : mode === 'balanced' ? 48 : particles.length;
      for (let index = 0; index < count; index += 1) {
        const p = particles[index];
        p.x += 0.0006 * p.z;
        p.y += (index % 2 ? 0.0004 : -0.0003) * p.z;
        if (p.x > 1.05) p.x = -0.05;
        if (p.y > 1.05) p.y = -0.05;
        if (p.y < -0.05) p.y = 1.05;
        const x = p.x * innerWidth;
        const y = p.y * innerHeight;
        ctx.fillStyle = `rgba(120,230,255,${0.06 * p.z})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

function init() {
  window.CyberOpsLabDSBridge?.init?.();
  applySettings();
  renderLoginStream();
  registerEvents();
  registerServiceWorker();
  initAmbientCanvas();
  startBoot();
}

init();
