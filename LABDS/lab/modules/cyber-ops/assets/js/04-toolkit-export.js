const intelCities = [
  { city: 'Curitiba', country: 'Brasil', region: 'Paraná', ip: '192.0.2.24', vpn: 'Risco baixo', domain: 'finance-gateway-curitiba.example' },
  { city: 'São Paulo', country: 'Brasil', region: 'São Paulo', ip: '192.0.2.80', vpn: 'Proxy detectado', domain: 'sp-ledger-sync.example' },
  { city: 'Lisboa', country: 'Portugal', region: 'Lisboa', ip: '198.51.100.17', vpn: 'Risco médio', domain: 'lisboa-cloud-broker.example' },
  { city: 'Londres', country: 'Reino Unido', region: 'England', ip: '198.51.100.9', vpn: 'Túnel corporativo', domain: 'london-payment-node.example' },
  { city: 'Berlim', country: 'Alemanha', region: 'Berlin', ip: '203.0.113.44', vpn: 'VPN suspeita', domain: 'berlin-orbit-relay.example' },
  { city: 'Dubai', country: 'Emirados Árabes Unidos', region: 'Dubai', ip: '203.0.113.99', vpn: 'Saída mascarada', domain: 'dubai-transfer-hub.example' },
  { city: 'Singapura', country: 'Singapura', region: 'Central Region', ip: '203.0.113.63', vpn: 'Risco crítico', domain: 'sg-core-mirror.example' },
  { city: 'Tóquio', country: 'Japão', region: 'Tokyo', ip: '192.0.2.105', vpn: 'Rota limpa', domain: 'tokyo-sensor-grid.example' },
  { city: 'Nova York', country: 'Estados Unidos', region: 'New York', ip: '198.51.100.230', vpn: 'ASN ofuscado', domain: 'ny-banking-switch.example' }
];

const toolkitModules = [
  { id: 'computer', label: 'Computador 3D', icon: '🖥', title: 'Simulador de computador operacional' },
  { id: 'network', label: 'Rede', icon: '🛰', title: 'Projeção 3D de rede e acessos' },
  { id: 'access', label: 'Acessos', icon: '🔐', title: 'Validação de acessos e credenciais' },
  { id: 'antivirus', label: 'Antivírus', icon: '🛡', title: 'Escaneamento e contenção' },
  { id: 'kali', label: 'Kali Linux', icon: '⌨', title: 'Deck tático estilo Kali Linux' },
  { id: 'bank', label: 'Transações', icon: '💳', title: 'Transações bancárias simuladas e suspeitas' },
  { id: 'domain', label: 'Domínios', icon: '🌐', title: 'Validação de domínio, IP, país e região' },
  { id: 'trace', label: 'Rastreamento', icon: '📡', title: 'Rastreamento por ligação, IMEI e torres' },
  { id: 'vpn', label: 'VPN / GeoIP', icon: '🧭', title: 'Conferência de IP, VPN, país e região' },
  { id: 'translate', label: 'Tradução / Códigos', icon: '文', title: 'Tradutor e decodificador educacional' },
  { id: 'agency', label: 'Bases simuladas', icon: '◉', title: 'Consulta de integridade em bases institucionais fictícias' }
];

function randomPick(list) { return list[Math.floor(Math.random() * list.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function getToolkitContext() {
  const missionLoc = currentMissionBase?.location || selectedMissionBase?.location || '';
  const matched = intelCities.find((item) => missionLoc.toLowerCase().includes(item.city.toLowerCase()));
  const city = matched || randomPick(intelCities);
  const subjectId = `PX-${randomInt(1400, 9999)}`;
  const imei = `${randomInt(100000,999999)}-${randomInt(100000,999999)}-${randomInt(100000,999999)}`;
  const callTarget = ['+55 41 98844-1023', '+351 91 441 7722', '+44 20 7946 0113', '+971 55 443 9071', '+81 90 4417 2840'][randomInt(0,4)];
  return { ...city, subjectId, imei, callTarget, profile: state.profile?.code || 'AGENTE', mission: currentMissionBase?.title || 'ANÁLISE GLOBAL' };
}

function renderToolkitTabs() {
  ui.toolkitTabs.innerHTML = toolkitModules.map((item) => `<button class="toolkit-tab ${item.id === activeToolkitModule ? 'active' : ''}" type="button" data-tool="${item.id}"><span>${item.icon}</span>${escapeHtml(item.label)}</button>`).join('');
  $$('.toolkit-tab', ui.toolkitTabs).forEach((button) => button.addEventListener('click', () => {
    activeToolkitModule = button.dataset.tool;
    renderToolkitModule();
    audio.click();
  }));
}

function buildToolkitMarkup(moduleId, ctx) {
  const terminalLines = ['labscan --inventory 192.0.2.0/24', 'cred-audit --sandbox --policy MFA', 'packet-view --dataset mission_capture.lab', 'domain-check ' + ctx.domain, 'dns-lab --resolve ' + ctx.domain, 'geo-lab --lookup ' + ctx.ip];
  const txRows = [
    ['02:14', 'Pagamento instantâneo', 'R$ 12.400,00', 'Curitiba → Lisboa', 'normal'],
    ['02:19', 'Saída TED', 'R$ 188.900,00', `${ctx.city} → Dubai`, 'risk'],
    ['02:21', 'Carteira digital', '₿ 0.294', `${ctx.city} → Nó externo`, 'risk'],
    ['02:24', 'Estorno suspeito', 'R$ 48.200,00', 'Berlim → São Paulo', 'risk']
  ];
  const domainRisk = ctx.domain.includes('mirror') || ctx.domain.includes('gateway') ? 'MÉDIO' : 'ALTO';
  const commonHeader = `<div class="toolkit-meta-grid"><div><span>Missão</span><strong>${escapeHtml(ctx.mission)}</strong></div><div><span>Cidade</span><strong>${escapeHtml(ctx.city)}</strong></div><div><span>Agente</span><strong>${escapeHtml(ctx.profile)}</strong></div><div><span>País</span><strong>${escapeHtml(ctx.country)}</strong></div></div>`;
  switch (moduleId) {
    case 'computer':
      return `${commonHeader}<div class="sim-grid two"><section class="sim-card holo-card"><div class="device-3d"><div class="device-screen"><div class="boot-seq"><span>Kernel safe-mode: ONLINE</span><span>Monitorando processos, disco e conexões</span><span>Credenciais temporárias em sandbox</span></div></div><div class="device-base"></div></div></section><section class="sim-card"><h4>Workstation em projeção</h4><div class="sim-kpi"><div><span>CPU</span><strong>${randomInt(18,69)}%</strong></div><div><span>RAM</span><strong>${randomInt(36,82)}%</strong></div><div><span>Sessões</span><strong>${randomInt(2,8)}</strong></div><div><span>Alertas</span><strong>${randomInt(1,4)}</strong></div></div><div class="credential-flow"><span>admin.secure</span><span>vault.audit</span><span>forense.node</span></div></section></div>`;
    case 'network':
      return `${commonHeader}<div class="sim-grid two"><section class="sim-card holo-card"><div class="network-3d"><span class="orb orb-a"></span><span class="orb orb-b"></span><span class="orb orb-c"></span><span class="link l1"></span><span class="link l2"></span><span class="link l3"></span></div></section><section class="sim-card"><h4>Mapa de rede</h4><div class="access-list"><div><strong>${ctx.city}-GW</strong><span>Gateway principal</span></div><div><strong>VAULT-SYNC</strong><span>Credenciais e tokens</span></div><div><strong>C2-FILTER</strong><span>Firewall reverso</span></div><div><strong>${ctx.country.toUpperCase()}-EDGE</strong><span>Borda regional ${ctx.region}</span></div></div></section></div>`;
    case 'access':
      return `${commonHeader}<div class="sim-grid two"><section class="sim-card"><h4>Matriz de credenciais</h4><div class="cred-matrix">${['root.audit','sec.ops','db.shadow','finance.admin','vpn.ops','soc.tier2'].map((item,i)=>`<button class="cred-chip ${i%2?'warn':''}" type="button">${item}</button>`).join('')}</div><div class="scan-bar"><i style="width:${randomInt(62,94)}%"></i></div></section><section class="sim-card holo-card"><div class="access-stack"><div class="access-ring"></div><div class="access-legend"><strong>OTP</strong><span>Válido por ${randomInt(18,54)} s</span><strong>Seed</strong><span>Encapsulada</span><strong>Privilege</strong><span>Nível ${randomInt(3,8)}</span></div></div></section></div>`;
    case 'antivirus':
      return `${commonHeader}<div class="sim-grid two"><section class="sim-card holo-card"><div class="shield-3d"><div class="shield-core">SAFE</div></div></section><section class="sim-card"><h4>Antivírus / EDR</h4><div class="scan-list"><div><span>Memória volátil</span><b>${randomInt(91,99)}%</b></div><div><span>Assinaturas</span><b>ATUALIZADAS</b></div><div><span>Processos monitorados</span><b>${randomInt(112,248)}</b></div><div><span>IOC suspeitos</span><b>${randomInt(2,11)}</b></div></div><div class="loader-panel"><span>Escaneando módulos, persistência e registry...</span><div class="scan-bar"><i style="width:${randomInt(68,96)}%"></i></div></div></section></div>`;
    case 'kali':
      return `${commonHeader}<div class="sim-card holo-card"><h4>Kali Linux Deck</h4><div class="terminal-3d">${terminalLines.map((line, index)=>`<div><span>root@ops</span><code>${escapeHtml(line)}</code><em>${index < 2 ? 'OK' : 'RUN'}</em></div>`).join('')}</div></div>`;
    case 'bank':
      return `${commonHeader}<div class="sim-grid two"><section class="sim-card"><h4>Painel bancário</h4><div class="bank-card-3d"><div class="bank-chip"></div><div class="bank-lines"></div><strong>Conta operacional 8742</strong><span>Modo: Monitoramento de fraude</span></div></section><section class="sim-card"><h4>Transações suspeitas</h4><div class="tx-list">${txRows.map(row=>`<div class="tx-row ${row[4]}"><span>${row[0]}</span><strong>${row[1]}</strong><b>${row[2]}</b><small>${row[3]}</small></div>`).join('')}</div></section></div>`;
    case 'domain':
      return `${commonHeader}<div class="sim-grid two"><section class="sim-card"><h4>Validação de domínio</h4><div class="domain-card"><strong>${ctx.domain}</strong><span>DNS A → ${ctx.ip}</span><span>SSL: ativo / emissor simulador interno</span><span>Reputação: ${domainRisk}</span></div></section><section class="sim-card holo-card"><div class="geo-grid"><div><span>IP</span><strong>${ctx.ip}</strong></div><div><span>País</span><strong>${ctx.country}</strong></div><div><span>Região</span><strong>${ctx.region}</strong></div><div><span>ASN</span><strong>AS${randomInt(14000, 58000)}</strong></div></div></section></div>`;
    case 'trace':
      return `${commonHeader}<div class="sim-grid two"><section class="sim-card"><h4>Rastreamento por ligação / IMEI</h4><div class="trace-card"><div><span>Alvo</span><strong>${ctx.subjectId}</strong></div><div><span>Linha</span><strong>${ctx.callTarget}</strong></div><div><span>IMEI</span><strong>${ctx.imei}</strong></div><div><span>Última antena</span><strong>${ctx.city} // setor ${randomInt(2,9)}</strong></div></div></section><section class="sim-card holo-card"><div class="radial-locate"><span class="pulse p1"></span><span class="pulse p2"></span><span class="pulse p3"></span><strong>${ctx.city}</strong></div></section></div>`;
    case 'vpn':
      return `${commonHeader}<div class="sim-grid two"><section class="sim-card holo-card"><div class="vpn-tunnel"><div class="vpn-node left">AGENTE</div><div class="vpn-stream"></div><div class="vpn-node right">${ctx.city.toUpperCase()}</div></div></section><section class="sim-card"><h4>GeoIP / VPN / País / Região</h4><div class="geo-grid"><div><span>IP atual</span><strong>${ctx.ip}</strong></div><div><span>País</span><strong>${ctx.country}</strong></div><div><span>Região</span><strong>${ctx.region}</strong></div><div><span>VPN</span><strong>${ctx.vpn}</strong></div><div><span>Latência</span><strong>${randomInt(18,149)} ms</strong></div><div><span>Risco</span><strong>${['BAIXO','MÉDIO','ALTO'][randomInt(0,2)]}</strong></div></div></section></div>`;
    case 'translate': {
      const step = currentMission && currentStep()?.type === 'intercept' ? currentStep() : interceptSteps['ghost-sentinel'].step;
      const answer = step.options.find((option) => option.id === step.correct)?.label || 'Interpretação indisponível';
      return `${commonHeader}<div class="sim-grid two"><section class="sim-card holo-card"><h4>Entrada interceptada</h4><div class="decoder-input"><span>${escapeHtml(step.language)}</span><code>${escapeHtml(step.raw)}</code></div><div class="signal-bars compact">${Array.from({length:20},(_,i)=>`<i style="--h:${20+((i*23)%72)}%"></i>`).join('')}</div></section><section class="sim-card"><h4>Processador linguístico local</h4><p>Preserva nomes, horários, direções e contexto. Não envia o texto para serviços externos.</p><button class="primary-button toolkit-action" data-tool-action="decode" data-answer="${escapeHtml(answer)}" type="button">Processar localmente</button><div class="toolkit-result" data-tool-result hidden></div></section></div>`;
    }
    case 'agency':
      return `${commonHeader}<div class="sim-card agency-sim"><div class="simulation-notice"><strong>SEM CONEXÃO REAL</strong><span>As instituições abaixo são painéis cenográficos locais usados para ensinar verificação de fonte e integridade.</span></div><div class="agency-grid">${['NASA-LAB • Telemetria orbital','FBI-LAB • Indicadores federais','INTERPOL-LAB • Alertas internacionais','PF-LAB • Integridade nacional','SATCOM-LAB • Enlace satelital','TELCO-LAB • Telefonia e antenas'].map((name,index)=>`<div><span>${name}</span><strong data-agency-status>${index === 0 ? 'AGUARDANDO' : 'EM FILA'}</strong></div>`).join('')}</div><button class="primary-button toolkit-action" data-tool-action="agency" type="button">Executar verificação simulada</button><div class="toolkit-result" data-tool-result hidden></div></div>`;
    default:
      return commonHeader;
  }
}

function attachToolkitInteractions() {
  const action = $('[data-tool-action]', ui.toolkitContent);
  if (!action) return;
  action.addEventListener('click', () => {
    if (toolkitBusy) return;
    toolkitBusy = true;
    action.disabled = true;
    const result = $('[data-tool-result]', ui.toolkitContent);
    if (result) {
      result.hidden = false;
      result.innerHTML = '<div class="analysis-spinner small"></div><strong>Processando dados fictícios localmente…</strong>';
    }
    const delay = state.settings.reducedMotion ? 80 : 1300;
    setTimeout(() => {
      toolkitBusy = false;
      if (action.dataset.toolAction === 'decode') {
        const answer = action.dataset.answer || 'Interpretação concluída.';
        result.innerHTML = `<strong>Resultado contextual</strong><p>${escapeHtml(answer)}</p><small>Processamento local; nenhuma API externa foi usada.</small>`;
        if (currentMission && currentStep()?.type === 'intercept') {
          currentStepPenalties += 8;
          currentComms.unshift('DECODIFICADOR // Tradução contextual processada pela ferramenta local.');
          renderIntelPanels();
        }
      } else {
        const statuses = $$('[data-agency-status]', ui.toolkitContent);
        statuses.forEach((status, index) => { status.textContent = index % 3 === 0 ? 'ÍNTEGRO' : index % 3 === 1 ? 'SEM CORRESPONDÊNCIA' : 'DADOS FICTÍCIOS'; });
        result.innerHTML = '<strong>Verificação encerrada</strong><p>6 fontes cenográficas consultadas; integridade do dataset local confirmada.</p><small>Não houve conexão com NASA, FBI, Interpol, Polícia Federal, satélites ou operadoras.</small>';
      }
      action.disabled = false;
      audio.success();
    }, delay);
  });
}

function renderToolkitModule() {
  const ctx = getToolkitContext();
  const module = toolkitModules.find((item) => item.id === activeToolkitModule) || toolkitModules[0];
  ui.toolkitTitle.textContent = module.title;
  ui.toolkitSubtitle.textContent = `Ambiente visual simulado para ${module.label.toLowerCase()}. Todos os dados, credenciais e incidentes são fictícios e educativos.`;
  ui.toolkitSceneInfo.textContent = `CENÁRIO: ${ctx.city.toUpperCase()} • ${ctx.country.toUpperCase()}`;
  renderToolkitTabs();
  ui.toolkitContent.innerHTML = buildToolkitMarkup(module.id, ctx);
  attachToolkitInteractions();
}

function openToolkit(moduleId = activeToolkitModule) {
  activeToolkitModule = moduleId;
  renderToolkitModule();
  if (!ui.toolkitDialog.open) ui.toolkitDialog.showModal();
  audio.scan();
}

function closeToolkit() {
  ui.toolkitDialog.close();
}

function exportMissionReport() {
  if (!latestResult || !selectedMissionBase) return;
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório ${escapeHtml(selectedMissionBase.code)}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#12202d}h1,h2{margin-bottom:8px}table{border-collapse:collapse;width:100%;margin-top:16px}td,th{border:1px solid #c8d3dc;padding:8px;text-align:left}.card{border:1px solid #d7e1ea;border-radius:12px;padding:16px;margin-bottom:16px}ul{line-height:1.6}</style></head><body><h1>Cyber Ops — Evidência da atividade</h1><div class="card"><strong>Aluno:</strong> ${escapeHtml(state.profile?.name || '')}<br><strong>Codinome:</strong> ${escapeHtml(state.profile?.code || '')}<br><strong>Turma:</strong> ${escapeHtml(state.profile?.className || '')}</div><div class="card"><h2>${escapeHtml(selectedMissionBase.title)}</h2><p><strong>Codinome:</strong> ${escapeHtml(selectedMissionBase.code)}<br><strong>Dificuldade:</strong> ${escapeHtml(difficultyRules[state.difficulty].label)}<br><strong>Status:</strong> ${escapeHtml(latestResult.status)}<br><strong>Data:</strong> ${new Date(latestResult.completedAt).toLocaleString('pt-BR')}</p></div><table><tr><th>Pontuação</th><th>Precisão</th><th>Tempo</th><th>Classificação</th><th>Ameaça final</th><th>Prejuízo estimado</th></tr><tr><td>${latestResult.score}</td><td>${latestResult.accuracy}%</td><td>${latestResult.timeLabel}</td><td>${escapeHtml(latestResult.rank)}</td><td>${latestResult.threat}%</td><td>${formatCurrency(latestResult.loss)}</td></tr></table><div class="card"><h2>Evidências confirmadas</h2><ul>${currentEvidence.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div><div class="card"><h2>Competências trabalhadas</h2><p>${escapeHtml(selectedMissionBase.skills.join(', '))}</p></div></body></html>`;
  downloadFile(`${selectedMissionBase.id}-evidencia.html`, 'text/html;charset=utf-8', html);
}

function exportHistory() {
  const payload = {
    profile: state.profile,
    difficulty: state.difficulty,
    completed: state.completed,
    totalScore: state.totalScore,
    badges: state.badges,
    modules: missionModules.map((module) => ({ id: module.id, title: module.title, progress: getModuleProgress(module.id) })),
    history: state.history
  };
  downloadFile('cyber-ops-historico.json', 'application/json;charset=utf-8', JSON.stringify(payload, null, 2));
}

function downloadFile(filename, mime, content) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.CyberOpsLabDSBridge?.exported?.({ filename, mime, bytes: blob.size });
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function getRecommendedToolkitModule() {
  if (!currentMission) return 'computer';
  const mapping = {
    network: 'network', packet: 'network', document: 'computer', cctv: 'trace', wallet: 'bank',
    social: 'domain', logic: 'computer', intercept: 'translate', choice: 'agency'
  };
  return mapping[currentStep()?.type] || 'computer';
}

