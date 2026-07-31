function renderChoiceStep(step) {
  const options = state.difficulty === 'especialista' ? [...step.options].sort(() => Math.random() - 0.5) : step.options;
  const content = `
    <div class="selection-grid">
      ${options.map((option) => `<button class="option-card" type="button" data-value="${escapeHtml(option.id)}"><strong>${escapeHtml(option.label)}</strong><small>${escapeHtml(option.detail)}</small></button>`).join('')}
    </div>
    <div class="validate-row"><button class="primary-button validate-step" type="button">Validar decisão</button></div>`;
  ui.missionContent.innerHTML = toolFrame(step, content);
  $$('.option-card', ui.missionContent).forEach((button) => button.addEventListener('click', () => {
    $$('.option-card', ui.missionContent).forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
    currentSelection = button.dataset.value;
    audio.click();
  }));
  $('.validate-step', ui.missionContent).addEventListener('click', () => validateCurrentStep(currentSelection === step.correct));
}

function renderNetworkStep(step) {
  const nodeById = Object.fromEntries(step.nodes.map((node) => [node.id, node]));
  const lines = step.links.map(([from, to], index) => {
    const a = nodeById[from];
    const b = nodeById[to];
    const active = from === step.correct || to === step.correct;
    return `<line class="network-line ${active ? 'active' : ''}" x1="${a.x}%" y1="${a.y}%" x2="${b.x}%" y2="${b.y}%"></line>`;
  }).join('');
  const devices = step.nodes.map((node) => `
    <button class="network-device ${node.alert ? 'alert' : ''}" type="button" data-value="${node.id}" style="--x:${node.x}%;--y:${node.y}%">
      <span class="device-icon"></span>
      <b>${escapeHtml(node.label)}</b>
      <small>${escapeHtml(node.detail)}</small>
    </button>`).join('');
  const pulses = step.links.map(([from, to], index) => {
    const a = nodeById[from]; const b = nodeById[to];
    const path = `'M ${a.x} ${a.y} L ${b.x} ${b.y}'`;
    return `<div class="packet-pulse" style="--path:${path};--speed:${4 + (index % 3)}s"></div>`;
  }).join('');
  const content = `<div class="network-canvas"><svg viewBox="0 0 100 100" preserveAspectRatio="none">${lines}</svg>${devices}${pulses}</div><div class="validate-row"><button class="primary-button validate-step" type="button">Isolar dispositivo</button></div>`;
  ui.missionContent.innerHTML = toolFrame(step, content, 'Mapa de rede e telemetria');
  $$('.network-device', ui.missionContent).forEach((button) => button.addEventListener('click', () => {
    $$('.network-device', ui.missionContent).forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
    currentSelection = button.dataset.value;
    audio.click();
  }));
  $('.validate-step', ui.missionContent).addEventListener('click', () => validateCurrentStep(currentSelection === step.correct));
}

function renderPacketStep(step) {
  const rows = step.packets.map((packet) => `<tr data-value="${packet.id}" class="${packet.risk ? 'risk' : ''}"><td>${packet.time}</td><td>${escapeHtml(packet.source)}</td><td>${escapeHtml(packet.target)}</td><td>${escapeHtml(packet.protocol)}</td><td>${escapeHtml(packet.size)}</td><td>${escapeHtml(packet.note)}</td></tr>`).join('');
  const dots = Array.from({ length: 12 }, (_, index) => `<i class="packet-dot ${index % 5 === 0 ? 'bad' : ''}" style="--y:${14 + (index % 5) * 14}px;--speed:${2.2 + (index % 4)}s;--delay:-${index * .3}s"></i>`).join('');
  const content = `
    <div class="packet-zone">
      <div class="packet-flow">${dots}</div>
      <div class="packet-toolbar">${step.filters.map((filter, index) => `<button type="button" class="${index===0?'active':''}">${escapeHtml(filter)}</button>`).join('')}</div>
      <div style="overflow:auto"><table class="packet-table"><thead><tr><th>HORA</th><th>ORIGEM</th><th>DESTINO</th><th>PROTOCOLO</th><th>TAMANHO</th><th>OBSERVAÇÃO</th></tr></thead><tbody>${rows}</tbody></table></div>
    </div>
    <div class="validate-row"><button class="primary-button validate-step" type="button">Marcar fluxo</button></div>`;
  ui.missionContent.innerHTML = toolFrame(step, content, 'Analisador de pacotes');
  $$('.packet-toolbar button', ui.missionContent).forEach((button) => button.addEventListener('click', () => {
    $$('.packet-toolbar button', ui.missionContent).forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    audio.click();
  }));
  $$('.packet-table tbody tr', ui.missionContent).forEach((row) => row.addEventListener('click', () => {
    $$('.packet-table tbody tr', ui.missionContent).forEach((item) => item.classList.remove('selected'));
    row.classList.add('selected');
    currentSelection = row.dataset.value;
    audio.click();
  }));
  $('.validate-step', ui.missionContent).addEventListener('click', () => validateCurrentStep(currentSelection === step.correct));
}

function renderDocumentStep(step) {
  const list = step.documents.map((doc, index) => `<button type="button" class="file-item ${index === 0 ? 'active' : ''}" data-value="${doc.id}">▤ ${escapeHtml(doc.name)}</button>`).join('');
  const content = `<div class="document-desk"><div class="file-list">${list}</div><div class="document-viewer"></div></div><div class="validate-row"><button class="primary-button validate-step" type="button">Marcar documento</button></div>`;
  ui.missionContent.innerHTML = toolFrame(step, content, 'Leitor e validador de documentos');
  const viewer = $('.document-viewer', ui.missionContent);
  const showDoc = (doc) => {
    const stampClass = doc.risk ? 'stamp-bad' : 'stamp-good';
    viewer.innerHTML = `
      <article class="document-page">
        <div class="${stampClass}">${escapeHtml(doc.stamp || (doc.risk ? 'REVISAR' : 'OK'))}</div>
        <h4>${escapeHtml(doc.title)}</h4>
        <p>${escapeHtml(doc.text)}</p>
        <div class="metadata-grid">
          <div>AUTOR<br><strong>${escapeHtml(doc.author)}</strong></div>
          <div>CRIADO<br><strong>${escapeHtml(doc.created)}</strong></div>
          <div>ASSINATURA<br><strong class="${doc.clue ? 'highlight-clue' : ''}">${escapeHtml(doc.signature)}</strong></div>
          <div>STATUS<br><strong>${doc.risk ? 'DIVERGENTE' : 'CONSISTENTE'}</strong></div>
        </div>
      </article>`;
  };
  showDoc(step.documents[0]);
  currentSelection = step.documents[0].id;
  $$('.file-item', ui.missionContent).forEach((button) => button.addEventListener('click', () => {
    $$('.file-item', ui.missionContent).forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    currentSelection = button.dataset.value;
    showDoc(step.documents.find((doc) => doc.id === currentSelection));
    audio.scan();
  }));
  $('.validate-step', ui.missionContent).addEventListener('click', () => validateCurrentStep(currentSelection === step.correct));
}

function renderCctvStep(step) {
  const content = `
    <div class="cctv-grid">
      <div class="cctv-feed">
        <div class="camera-scene"></div>
        <div class="cctv-overlay"><span id="cameraLabel">${escapeHtml(step.cameras[0].name)}</span><span id="cameraTime">${escapeHtml(step.cameras[0].time)}</span></div>
      </div>
      <div class="camera-list">
        ${step.cameras.map((cam, index) => `<button type="button" data-camera="${cam.id}" class="camera-button ${index===0?'active':''}">${escapeHtml(cam.name)}<br><small>${escapeHtml(cam.note)}</small></button>`).join('')}
        <div class="timeline-strip"><i></i></div>
      </div>
    </div>
    <div class="validate-row"><button class="primary-button validate-step" type="button">Selecionar câmera</button></div>`;
  ui.missionContent.innerHTML = toolFrame(step, content, 'Central CFTV');
  const scene = $('.camera-scene', ui.missionContent);
  const label = $('#cameraLabel', ui.missionContent);
  const time = $('#cameraTime', ui.missionContent);
  const bar = $('.timeline-strip i', ui.missionContent);
  const updateCamera = (cam) => {
    scene.style.setProperty('--person-x', cam.x || '50%');
    scene.style.setProperty('--person-y', cam.y || '50%');
    scene.style.setProperty('--mark', cam.mark ? '1' : '.18');
    label.textContent = cam.name;
    time.textContent = cam.time;
    bar.style.width = cam.mark ? '62%' : '28%';
  };
  updateCamera(step.cameras[0]);
  currentSelection = step.cameras[0].id;
  $$('.camera-button', ui.missionContent).forEach((button) => button.addEventListener('click', () => {
    $$('.camera-button', ui.missionContent).forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    currentSelection = button.dataset.camera;
    const cam = step.cameras.find((item) => item.id === currentSelection);
    updateCamera(cam);
    audio.scan();
  }));
  $('.validate-step', ui.missionContent).addEventListener('click', () => validateCurrentStep(currentSelection === step.correct));
}

function drawGraph(points) {
  const max = Math.max(...points);
  const coords = points.map((point, index) => {
    const x = (index / (points.length - 1)) * 100;
    const y = 100 - (point / max) * 85;
    return `${x},${y}`;
  }).join(' ');
  return `<svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline fill="none" stroke="var(--theme-primary)" stroke-width="3" points="${coords}"></polyline></svg>`;
}

function renderWalletStep(step) {
  const trans = step.transactions.map((tx) => `<button class="trans-card" type="button" data-value="${tx.id}"><strong>${escapeHtml(tx.date)} • ${escapeHtml(tx.label)}</strong><small>${tx.amount} BTC-LAB • ${escapeHtml(tx.note)}</small><code>${escapeHtml(tx.hash)}</code></button>`).join('');
  const nodes = step.mesh.nodes.map((node) => `<div class="mesh-node ${node.suspect ? 'suspect' : ''}" style="--x:${node.x};--y:${node.y}">${escapeHtml(node.label)}</div>`).join('');
  const lines = step.mesh.lines.map((line) => {
    const [x1,y1] = line.from; const [x2,y2] = line.to;
    const length = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    return `<div class="mesh-line ${line.alert ? 'alert' : ''}" style="left:${x1}%;top:${y1}%;width:${length}%;transform:rotate(${angle}deg)"></div>`;
  }).join('');
  const content = `
    <div class="wallet-grid">
      <div class="wallet-left">
        <div class="wallet-balance"><span>SALDO OPERACIONAL</span><strong>${escapeHtml(step.balance)}</strong><small>Ambiente fictício BTC-LAB</small></div>
        <div class="wallet-graph">${drawGraph(step.graph)}</div>
        <div class="trans-list" style="margin-top:12px">${trans}</div>
      </div>
      <div class="wallet-right">
        <div class="intel-card"><span>CARTEIRA</span><strong>${escapeHtml(selectedMissionBase.code)}-WALLET</strong></div>
        <div class="intel-card"><span>MODO</span><strong>ANÁLISE DE SAÍDAS</strong></div>
        <div class="address-mesh">${lines}${nodes}</div>
      </div>
    </div>
    <div class="validate-row"><button class="primary-button validate-step" type="button">Marcar transação</button></div>`;
  ui.missionContent.innerHTML = toolFrame(step, content, 'Carteira BTC-LAB');
  $$('.trans-card', ui.missionContent).forEach((button) => button.addEventListener('click', () => {
    $$('.trans-card', ui.missionContent).forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
    currentSelection = button.dataset.value;
    audio.click();
  }));
  $('.validate-step', ui.missionContent).addEventListener('click', () => validateCurrentStep(currentSelection === step.correct));
}

function renderSocialStep(step) {
  const content = `
    <div class="social-layout">
      <div class="comms-grid">
        ${step.messages.map((msg) => `<button class="msg-card" type="button" data-value="${msg.id}" data-tag="${escapeHtml(msg.tag)}"><strong>${escapeHtml(msg.title)}</strong><small>${escapeHtml(msg.text)}</small><small>${escapeHtml(msg.note)}</small></button>`).join('')}
      </div>
      <aside class="social-aside">
        <div class="intel-card"><span>OBJETIVO</span><strong>Descobrir a peça de engenharia social</strong></div>
        <ul class="checklist">
          <li>Observe urgência artificial</li>
          <li>Confira domínio e origem</li>
          <li>Desconfie de pedido de token, senha ou OTP</li>
          <li>Analise se o fluxo faz sentido para o contexto</li>
        </ul>
      </aside>
    </div>
    <div class="validate-row"><button class="primary-button validate-step" type="button">Marcar comunicação</button></div>`;
  ui.missionContent.innerHTML = toolFrame(step, content, 'Análise de engenharia social');
  $$('.msg-card', ui.missionContent).forEach((button) => button.addEventListener('click', () => {
    $$('.msg-card', ui.missionContent).forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
    currentSelection = button.dataset.value;
    audio.click();
  }));
  $('.validate-step', ui.missionContent).addEventListener('click', () => validateCurrentStep(currentSelection === step.correct));
}

function renderInterceptStep(step) {
  const content = `
    <div class="intercept-layout">
      <section class="intercept-console">
        <div class="intercept-header"><span>CANAL INTERCEPTADO</span><strong>${escapeHtml(step.language)}</strong></div>
        <div class="intercept-raw">${escapeHtml(step.raw)}</div>
        <div class="signal-bars" aria-hidden="true">${Array.from({ length: 18 }, (_, index) => `<i style="--h:${22 + ((index * 17) % 70)}%"></i>`).join('')}</div>
        <p>Processamento sugerido: <strong>${escapeHtml(step.cipher || 'Tradução contextual')}</strong>. Abra Ferramentas → Tradução / Códigos para apoio visual.</p>
      </section>
      <section class="intercept-options">
        ${step.options.map((option) => `<button class="option-card intercept-option" type="button" data-value="${escapeHtml(option.id)}"><strong>${escapeHtml(option.label)}</strong><small>${escapeHtml(option.detail)}</small></button>`).join('')}
      </section>
    </div>
    <div class="validate-row"><button class="secondary-button open-decoder" type="button">Abrir decodificador</button><button class="primary-button validate-step" type="button">Validar interpretação</button></div>`;
  ui.missionContent.innerHTML = toolFrame(step, content, 'Interceptação e tradução');
  $$('.intercept-option', ui.missionContent).forEach((button) => button.addEventListener('click', () => {
    $$('.intercept-option', ui.missionContent).forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
    currentSelection = button.dataset.value;
    audio.click();
  }));
  $('.open-decoder', ui.missionContent).addEventListener('click', () => openToolkit('translate'));
  $('.validate-step', ui.missionContent).addEventListener('click', () => validateCurrentStep(currentSelection === step.correct));
}

function renderLogicStep(step) {
  const cells = Array.from({ length: step.cells }, (_, index) => `<button class="bin-card" type="button" data-index="${index}">0</button>`).join('');
  const content = `
    <div class="logic-layout">
      <div class="logic-clues">${step.clues.map((clue) => `<span>${escapeHtml(clue)}</span>`).join('')}</div>
      <div class="logic-board">${cells}</div>
      <div class="code-output">SEQUÊNCIA: <span id="codeDisplay">${'0'.repeat(step.cells)}</span></div>
    </div>
    <div class="validate-row"><button class="primary-button validate-step" type="button">Validar sequência</button></div>`;
  ui.missionContent.innerHTML = toolFrame(step, content, 'Console lógico');
  const bits = Array(step.cells).fill(0);
  currentSelection = bits.join('');
  $$('.bin-card', ui.missionContent).forEach((button) => button.addEventListener('click', () => {
    const index = Number(button.dataset.index);
    bits[index] = bits[index] ? 0 : 1;
    button.textContent = bits[index];
    button.classList.toggle('active', Boolean(bits[index]));
    currentSelection = bits.join('');
    $('#codeDisplay', ui.missionContent).textContent = currentSelection;
    audio.click();
  }));
  $('.validate-step', ui.missionContent).addEventListener('click', () => validateCurrentStep(currentSelection === step.correct));
}

function showAnalysisOverlay(message = 'Correlacionando evidências...') {
  const overlay = document.createElement('div');
  overlay.className = 'analysis-overlay';
  overlay.innerHTML = `<div class="analysis-box"><div class="analysis-spinner"></div><strong>${escapeHtml(message)}</strong><small>Consultando registros simulados</small></div>`;
  $('.tool-window', ui.missionContent)?.appendChild(overlay);
  return overlay;
}

function validateCurrentStep(isCorrect) {
  const step = currentStep();
  if (!currentSelection && currentSelection !== '0'.repeat(step.cells || 0)) {
    audio.error();
    toast('Seleção necessária', 'Use a ferramenta antes de validar.', 'error');
    return;
  }
  const overlay = showAnalysisOverlay(isCorrect ? 'Validando hipótese...' : 'Conferindo seleção...');
  setTimeout(() => {
    overlay.remove();
    if (isCorrect) {
      handleCorrectStep(step);
    } else {
      handleWrongStep();
    }
  }, state.settings.reducedMotion ? 40 : 680);
}

function markSelectedWrong() {
  const selected = $('.selected', ui.missionContent) || $('.active.selected', ui.missionContent);
  if (selected) {
    selected.classList.add('wrong');
    setTimeout(() => selected.classList.remove('wrong'), 450);
    return;
  }
  if (currentStep().type === 'document') {
    $('.file-item.active', ui.missionContent)?.classList.add('wrong');
    setTimeout(() => $('.file-item.active', ui.missionContent)?.classList.remove('wrong'), 450);
  }
  if (currentStep().type === 'cctv') {
    $('.camera-button.active', ui.missionContent)?.classList.add('wrong');
    setTimeout(() => $('.camera-button.active', ui.missionContent)?.classList.remove('wrong'), 450);
  }
}

function handleCorrectStep(step) {
  audio.success();
  const timeFactor = Math.max(.55, timeRemaining / currentMission.timeLimit);
  const base = Math.max(40, 110 - currentStepPenalties);
  const earned = Math.round(base * difficultyRules[state.difficulty].scoreMultiplier * (0.7 + timeFactor * 0.5));
  missionScoreValue += earned;
  threatLevel = Math.max(0, threatLevel - 8);
  currentEvidence.push(step.evidence);
  currentComms.unshift(`CONFIRMADO // ${step.evidence}`);
  renderIntelPanels();
  updateMissionStats();
  ui.continueBtn.textContent = currentStepIndex === currentMission.steps.length - 1 ? 'Concluir operação →' : 'Próxima fase →';
  ui.continueBtn.classList.remove('hidden');
  ui.hintBtn.disabled = true;
  $$('.validate-step', ui.missionContent).forEach((button) => button.disabled = true);
  toast('Evidência confirmada', `+${earned} pontos`, 'success');
}

function handleWrongStep() {
  currentAttempts += 1;
  currentStepPenalties += 18;
  threatLevel = Math.min(100, threatLevel + difficultyRules[state.difficulty].wrongThreat);
  moneyLoss += 22000 + (currentAttempts * 4000);
  currentComms.unshift('ERRO TÁTICO // A hipótese não foi confirmada e o incidente ganhou tempo.');
  currentComms = currentComms.slice(0, 12);
  renderIntelPanels();
  updateMissionStats();
  markSelectedWrong();
  audio.error();
  toast('Hipótese não confirmada', 'Revise a ferramenta e tente novamente.', 'error');
  if (currentAttempts > 0 && currentAttempts % 2 === 0) {
    threatLevel = Math.min(100, threatLevel + 5);
    timeRemaining = Math.max(1, timeRemaining - 8);
    currentComms.unshift('RISCO DE DESCOBERTA // Consultas repetidas alertaram o adversário simulado. A central alterou a rota de acesso.');
    showBanner('AGENTE PARCIALMENTE EXPOSTO // ROTA DE ACESSO ALTERADA', 'critical');
    document.body.classList.add('exposure-event');
    setTimeout(() => document.body.classList.remove('exposure-event'), 1100);
  }
  if (threatLevel >= 100) {
    failMission('Ameaça máxima atingida', 'Uma sequência de respostas inadequadas agravou o incidente.');
  }
}

function getSupportCharacter() {
  const byMission = {
    'eclipse-black': characters.diego,
    'packet-phantom': characters.mason,
    'ghost-sentinel': characters.mei,
    'spectral-vault': characters.sofia,
    'grey-cipher': characters.mei,
    'chimera-zero': characters.helena
  };
  return byMission[selectedMissionBase?.id] || characters.ravi;
}

function getContextualSupport(step, depth = 1) {
  const base = {
    network: ['Organize os nós por horário, alcance e quantidade de conexões.', 'Compare qual equipamento toca mais de um ativo crítico e apareceu próximo ao início do incidente.'],
    packet: ['Separe tráfego comum de anomalias de volume, destino e repetição.', 'Cruze origem, destino externo, tamanho e momento do incidente; um único indicador isolado pode enganar.'],
    document: ['Priorize autoria, horário, assinatura e integridade.', 'Compare o documento com a linha do tempo e descarte registros alterados depois do início do incidente.'],
    cctv: ['Cruze câmera, horário, direção e credencial usada.', 'Procure divergências entre a imagem, o setor autorizado e o registro de acesso.'],
    wallet: ['Observe valor, destino, histórico e método de autorização.', 'Uma transação crítica costuma combinar destino novo, valor fora do padrão e autenticação suspeita.'],
    social: ['Analise urgência, domínio, pedido de segredo e coerência do canal.', 'Não execute a solicitação; compare o texto com o procedimento oficial e os sinais de coleta de credenciais.'],
    logic: ['Converta cada pista em uma restrição e teste a sequência completa.', 'Comece pelas posições fixas, depois confira quantidade e paridade dos bits.'],
    intercept: ['Preserve nomes, horários, direções e objetos durante a tradução.', 'Use o idioma ou código para confirmar entidades; não complete lacunas com suposições.'],
    choice: ['Escolha a resposta que contenha, preserve evidências e reduza recorrência.', 'Evite ações irreversíveis antes de isolar, registrar e validar a causa.']
  };
  const messages = base[step.type] || base.choice;
  return messages[Math.min(depth - 1, messages.length - 1)];
}

function openSupportChannel() {
  if (!currentMission || currentMissionFailed) return;
  const step = currentStep();
  const character = getSupportCharacter();
  const key = step.id;
  const depth = (supportRequestsByStep[key] || 0) + 1;
  ui.supportAvatar.textContent = character.avatar;
  ui.supportFaction.textContent = `${character.faction} • ${character.language || 'Português'}`;
  ui.supportName.textContent = character.name;
  ui.supportMessage.textContent = depth === 1
    ? `Estou acompanhando a fase “${step.title}”. Posso orientar seu método de análise, mas não confirmar a resposta.`
    : 'Posso aprofundar a estratégia, porém cada nova análise reduz parte da pontuação desta fase.';
  ui.supportContext.innerHTML = `<strong>Orientação atual</strong><p>${escapeHtml(getContextualSupport(step, depth))}</p><small>Solicitações usadas nesta fase: ${supportRequestsByStep[key] || 0}/2</small>`;
  ui.requestAnalysisBtn.disabled = (supportRequestsByStep[key] || 0) >= 2;
  ui.requestAnalysisBtn.textContent = ui.requestAnalysisBtn.disabled ? 'Limite de análises atingido' : 'Pedir análise contextual';
  if (!ui.supportDialog.open) ui.supportDialog.showModal();
  audio.scan();
}

function requestSupportAnalysis() {
  const step = currentStep();
  const key = step.id;
  const used = supportRequestsByStep[key] || 0;
  if (used >= 2) return;
  supportRequestsByStep[key] = used + 1;
  currentStepPenalties += used === 0 ? 6 : 10;
  const character = getSupportCharacter();
  const message = `${character.name}: ${getContextualSupport(step, supportRequestsByStep[key])}`;
  currentComms.unshift(`APOIO // ${message}`);
  currentComms = currentComms.slice(0, 14);
  renderIntelPanels();
  openSupportChannel();
  toast('Apoio recebido', 'A central orientou o método sem entregar a resposta.', 'hint');
}

function getSearchFinding(step, depth) {
  const findings = {
    network: ['Índice parcial: horários e conexões laterais foram organizados.', 'Correlação ampliada: destaque equipamentos com acesso simultâneo a ativos críticos.'],
    packet: ['Índice parcial: fluxos foram agrupados por protocolo e volume.', 'Correlação ampliada: destinos externos recém-observados receberam prioridade.'],
    document: ['Índice parcial: assinaturas e horários foram normalizados.', 'Correlação ampliada: alterações posteriores ao incidente foram marcadas como risco.'],
    cctv: ['Índice parcial: quadros foram sincronizados com os logs de acesso.', 'Correlação ampliada: divergências de setor, crachá e direção foram destacadas.'],
    wallet: ['Índice parcial: destinos novos e valores atípicos foram separados.', 'Correlação ampliada: autorizações fora do padrão receberam risco elevado.'],
    social: ['Índice parcial: domínios, urgência e pedidos de segredo foram extraídos.', 'Correlação ampliada: mensagens que solicitam OTP ou senha foram marcadas.'],
    logic: ['Índice parcial: restrições fixas foram convertidas em uma grade.', 'Correlação ampliada: combinações que violam paridade ou quantidade foram descartadas.'],
    intercept: ['Índice parcial: idioma, entidades e separadores foram reconhecidos.', 'Correlação ampliada: nomes, horários, direções e palavras-chave foram preservados.'],
    choice: ['Índice parcial: ações foram classificadas por impacto e reversibilidade.', 'Correlação ampliada: opções que preservam evidências e contêm recorrência foram priorizadas.']
  };
  const list = findings[step.type] || findings.choice;
  return list[Math.min(depth - 1, list.length - 1)];
}

function runIntelSearch() {
  if (!currentMission || currentMissionFailed || toolkitBusy) return;
  const step = currentStep();
  const key = step.id;
  const used = intelSearchesByStep[key] || 0;
  if (used >= 2) {
    toast('Pesquisa concluída', 'Todas as correlações permitidas para esta fase já foram liberadas.');
    return;
  }
  toolkitBusy = true;
  ui.intelSearchBtn.disabled = true;
  ui.intelSearchBtn.textContent = 'Pesquisando…';
  const overlay = showAnalysisOverlay('Consultando índices simulados...');
  const delay = state.settings.reducedMotion ? 80 : 1700;
  setTimeout(() => {
    overlay?.remove();
    toolkitBusy = false;
    intelSearchesByStep[key] = used + 1;
    currentStepPenalties += used === 0 ? 5 : 9;
    const finding = getSearchFinding(step, intelSearchesByStep[key]);
    currentComms.unshift(`PESQUISA TÁTICA ${intelSearchesByStep[key]}/2 // ${finding}`);
    currentComms = currentComms.slice(0, 14);
    renderIntelPanels();
    ui.intelSearchBtn.disabled = false;
    ui.intelSearchBtn.textContent = intelSearchesByStep[key] >= 2 ? 'Pesquisa concluída' : 'Aprofundar pesquisa';
    toast('Nova correlação liberada', finding, 'hint');
    audio.success();
  }, delay);
}

function showHint() {
  if (currentHintsUsed >= difficultyRules[state.difficulty].hints) {
    toast('Sem pistas disponíveis', 'Este nível não permite novas pistas.');
    return;
  }
  currentHintsUsed += 1;
  currentStepPenalties += 12;
  ui.hintBtn.textContent = `Solicitar pista (${Math.max(0, difficultyRules[state.difficulty].hints - currentHintsUsed)})`;
  ui.hintBtn.disabled = currentHintsUsed >= difficultyRules[state.difficulty].hints;
  toast('Pista da central', currentStep().hint, 'hint');
  audio.alert();
}

function advanceMission() {
  if (currentStepIndex < currentMission.steps.length - 1) {
    currentStepIndex += 1;
    renderCurrentStep();
    return;
  }
  completeMission();
}

const badgeCatalog = {
  firstMission: { icon: '◈', title: 'Primeira Operação', description: 'Concluiu a primeira missão.' },
  incidentResponse: { icon: '🛡', title: 'Guardião de Incidentes', description: 'Concluiu o módulo de Resposta a Incidentes.' },
  humanIntel: { icon: '◎', title: 'Investigador Multilíngue', description: 'Concluiu o módulo de Inteligência Humana.' },
  cryptIntel: { icon: '◇', title: 'Criptoanalista Global', description: 'Concluiu o módulo de Criptointeligência.' },
  flawless: { icon: '★', title: 'Precisão Total', description: 'Concluiu uma missão com 100% de precisão.' },
  autonomous: { icon: '⚡', title: 'Autonomia Tática', description: 'Concluiu uma missão sem usar pistas.' },
  allModules: { icon: '⬢', title: 'Comandante Shadow Grid', description: 'Concluiu todos os módulos.' }
};

function getAgentRole() {
  const completed = Object.keys(state.completed).length;
  const score = state.totalScore || 0;
  if (completed >= missions.length && score >= 2500) return 'Comandante de Operações';
  if (completed >= 5) return 'Especialista Cyber Ops';
  if (completed >= 3) return 'Agente de Inteligência';
  if (completed >= 1) return 'Analista Tático';
  return 'Recruta Digital';
}

function evaluateBadges(result) {
  const unlocked = [];
  const grant = (id) => {
    if (state.badges[id]) return;
    state.badges[id] = { unlockedAt: new Date().toISOString() };
    unlocked.push(badgeCatalog[id]);
  };
  if (Object.keys(state.completed).length >= 1) grant('firstMission');
  if (result.accuracy === 100) grant('flawless');
  if (result.hints === 0) grant('autonomous');
  if (getModuleProgress('incident-response').completed === 2) grant('incidentResponse');
  if (getModuleProgress('human-intelligence').completed === 2) grant('humanIntel');
  if (getModuleProgress('cryptointel').completed === 2) grant('cryptIntel');
  if (Object.keys(state.completed).length >= missions.length) grant('allModules');
  return unlocked;
}

function buildHonorsData() {
  const name = state.profile?.name || state.profile?.code || 'Agente';
  const earned = Object.keys(state.badges || {}).map((id) => badgeCatalog[id]).filter(Boolean);
  const medals = earned.length ? earned : [{ icon: '◈', title: 'Agente em treinamento' }];
  const titles = [getAgentRole(), ...earned.map((badge) => badge.title)];
  return { name, medals, titles };
}

function showHonorsCeremony() {
  const data = buildHonorsData();
  const initials = data.name.split(/\s+/).filter(Boolean).slice(0,2).map((part) => part[0]).join('').toUpperCase() || 'AG';
  ui.honorsName.textContent = `Agente ${data.name}`;
  ui.honorsSubtitle.textContent = `${getAgentRole()} • ${Object.keys(state.badges || {}).length} emblema(s) conquistado(s).`;
  ui.honorsAvatar.textContent = initials;
  ui.honorsMedals.innerHTML = data.medals.map((medal) => `<div class="medal"><div class="medal-icon">${medal.icon}</div><strong>${escapeHtml(medal.title)}</strong></div>`).join('');
  ui.honorsTitles.innerHTML = data.titles.map((title) => `<span>${escapeHtml(title)}</span>`).join('');
  ui.honorsMessage.textContent = 'O mural registra competências demonstradas em investigação, resposta a incidentes, tradução, lógica, tomada de decisão e preservação de evidências em ambiente totalmente simulado.';
  state.honorsSeen = true;
  saveState();
  if (!ui.honorsDialog.open) ui.honorsDialog.showModal();
  audio.success();
}

function exportHonorsCertificate() {
  const data = buildHonorsData();
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Certificado Cyber Ops</title><style>body{font-family:Arial,sans-serif;background:#07101b;color:#eef8ff;padding:40px;text-align:center}.certificate{max-width:850px;margin:auto;padding:50px;border:4px double #e8c66a;background:linear-gradient(145deg,#0b1728,#050a12)}h1{color:#ffe297;font-size:40px}.medals{font-size:42px;letter-spacing:16px}.titles{line-height:1.8;color:#cceeff}.seal{width:120px;height:120px;border:4px solid #e8c66a;border-radius:50%;display:grid;place-items:center;margin:30px auto;font-size:34px;color:#ffe297}</style></head><body><div class="certificate"><p>CYBER OPS // SHADOW GRID</p><h1>Certificado de Honra</h1><p>Concedido a</p><h2>${escapeHtml(data.name)}</h2><p>pelas competências demonstradas nas operações educativas e simuladas do Shadow Grid.</p><div class="seal">CO</div><div class="medals">★ ⬢ ◆ 🛡</div><div class="titles">${data.titles.map(escapeHtml).join('<br>')}</div><p>${new Date().toLocaleDateString('pt-BR')}</p></div></body></html>`;
  downloadFile('certificado-cyber-ops-shadow-grid.html','text/html;charset=utf-8',html);
}

function failMission(title, message) {
  if (currentMissionFailed) return;
  currentMissionFailed = true;
  clearMissionTimers();
  audio.error();
  latestResult = {
    missionId: selectedMissionBase.id,
    score: Math.round(missionScoreValue),
    accuracy: Math.max(0, Math.round((currentStepIndex / currentMission.steps.length) * 100)),
    seconds: currentMission.timeLimit - timeRemaining,
    timeLabel: formatTime(currentMission.timeLimit - timeRemaining),
    attempts: currentAttempts,
    hints: currentHintsUsed,
    rank: 'Operação comprometida',
    completedAt: new Date().toISOString(),
    status: 'Falhou',
    threat: Math.round(threatLevel),
    loss: moneyLoss
  };
  state.history.unshift({ ...latestResult, difficulty: state.difficulty, evidence: [...currentEvidence] });
  state.history = state.history.slice(0, 100);
  saveState();

  ui.resultSeal.textContent = '✕';
  ui.resultSeal.classList.add('fail');
  ui.resultEyebrow.textContent = 'FALHA OPERACIONAL';
  ui.resultTitle.textContent = title;
  ui.returnHqBtn.textContent = 'Voltar à central';
  ui.resultMessage.textContent = `${message} O ambiente entrou em estado crítico e a simulação foi encerrada.`;
  ui.resultStats.innerHTML = `
    <div><span>PONTUAÇÃO</span><strong>${Math.round(missionScoreValue)}</strong></div>
    <div><span>FASES CONCLUÍDAS</span><strong>${currentStepIndex}/${currentMission.steps.length}</strong></div>
    <div><span>AMEAÇA FINAL</span><strong>${Math.round(threatLevel)}%</strong></div>
    <div><span>PREJUÍZO</span><strong>${formatCurrency(moneyLoss)}</strong></div>`;
  showBanner('SISTEMA COMPROMETIDO // OPERAÇÃO INTERROMPIDA');
  const failureScenes = selectedMissionBase?.id === 'chimera-zero'
    ? [{ speaker: characters.arconte, mood: 'danger', text: 'A Quimera continua. Reorganize suas evidências e tente novamente antes que a sincronização seja concluída.' }]
    : [{ speaker: characters.helena, mood: 'danger', text: 'A operação falhou nesta tentativa. A central preservou o treinamento para que você possa revisar as decisões e retornar.' }];
  playCutscene(failureScenes, () => ui.resultDialog.showModal());
}

function completeMission() {
  clearMissionTimers();
  const secondsSpent = currentMission.timeLimit - timeRemaining;
  const totalAttempts = currentMission.steps.length + currentAttempts;
  const accuracy = Math.round((currentMission.steps.length / totalAttempts) * 100);
  const rank = missionScoreValue >= 520 ? 'Comandante Cyber Ops' : missionScoreValue >= 430 ? 'Especialista de Inteligência' : missionScoreValue >= 340 ? 'Investigador Digital' : missionScoreValue >= 250 ? 'Analista Tático' : 'Agente de Campo';
  latestResult = {
    missionId: selectedMissionBase.id,
    score: Math.round(missionScoreValue),
    accuracy,
    seconds: secondsSpent,
    timeLabel: formatTime(secondsSpent),
    attempts: currentAttempts,
    hints: currentHintsUsed,
    rank,
    completedAt: new Date().toISOString(),
    status: 'Concluída',
    threat: Math.round(threatLevel),
    loss: moneyLoss
  };

  const previous = state.completed[selectedMissionBase.id];
  state.completed[selectedMissionBase.id] = {
    bestScore: Math.max(previous?.bestScore || 0, latestResult.score),
    lastScore: latestResult.score,
    completedAt: latestResult.completedAt,
    rank
  };
  state.totalScore = Object.values(state.completed).reduce((sum, entry) => sum + (entry.bestScore || 0), 0);
  const newBadges = evaluateBadges(latestResult);
  state.history.unshift({ ...latestResult, difficulty: state.difficulty, moduleId: selectedMissionBase.moduleId, evidence: [...currentEvidence], badgesUnlocked: newBadges.map((badge) => badge.title) });
  state.history = state.history.slice(0, 100);
  saveState();

  ui.resultSeal.textContent = '✓';
  ui.resultSeal.classList.remove('fail');
  ui.resultEyebrow.textContent = 'RELATÓRIO DA OPERAÇÃO';
  ui.resultTitle.textContent = `${selectedMissionBase.title} concluída`;
  ui.returnHqBtn.textContent = selectedMissionBase.id === 'chimera-zero' ? 'Receber condecorações →' : 'Voltar à central';
  const chapter = getCampaignChapter(selectedMissionBase.id);
  const module = getMissionModule(selectedMissionBase.id);
  const missionIndex = module.missions.indexOf(selectedMissionBase.id);
  const nextMissionId = module.missions[missionIndex + 1];
  const nextChapter = nextMissionId ? getCampaignChapter(nextMissionId) : null;
  const badgeText = newBadges.length ? ` Novos emblemas: ${newBadges.map((badge) => badge.title).join(', ')}.` : '';
  ui.resultMessage.textContent = `A operação foi encerrada com êxito. ${chapter?.after || 'A central consolidou a linha do tempo, as evidências e o impacto evitado.'}${nextChapter ? ' Próxima fase deste módulo: ' + nextChapter.title + '. ' + nextChapter.hook : ' Este módulo está concluído; os demais módulos continuam disponíveis.'}${badgeText}`;
  ui.resultStats.innerHTML = `
    <div><span>PONTUAÇÃO</span><strong>${latestResult.score}</strong></div>
    <div><span>PRECISÃO</span><strong>${accuracy}%</strong></div>
    <div><span>TEMPO</span><strong>${formatTime(secondsSpent)}</strong></div>
    <div><span>CLASSIFICAÇÃO</span><strong>${escapeHtml(rank)}</strong></div>
    <div><span>AMEAÇA FINAL</span><strong>${Math.round(threatLevel)}%</strong></div>
    <div><span>PREJUÍZO ESTIMADO</span><strong>${formatCurrency(moneyLoss)}</strong></div>`;
  playCutscene(buildCutscenes(selectedMissionBase.id, 'post'), () => ui.resultDialog.showModal());
  audio.success();
}

function exitMission() {
  if (!currentMission) return;
  const confirmed = confirm('Sair da operação? O progresso desta tentativa será perdido.');
  if (!confirmed) return;
  clearMissionTimers();
  currentMission = null;
  currentMissionBase = null;
  showScreen('hq');
  renderHQ();
}

function retryMission() {
  ui.resultDialog.close();
  selectedMissionBase = currentMissionBase || selectedMissionBase;
  startMission();
}

function openProfile() {
  const badges = Object.keys(state.badges || {}).map((id) => badgeCatalog[id]).filter(Boolean);
  const moduleSummary = missionModules.map((module) => {
    const progress = getModuleProgress(module.id);
    return `${module.icon} ${module.title}: ${progress.completed}/${progress.total}`;
  }).join('<br>');
  ui.profileCode.textContent = state.profile?.code || 'AGENTE';
  ui.profileDetails.innerHTML = `
    <div><span>NOME</span><strong>${escapeHtml(state.profile?.name || '—')}</strong></div>
    <div><span>TURMA</span><strong>${escapeHtml(state.profile?.className || '—')}</strong></div>
    <div><span>CARGO</span><strong>${escapeHtml(getAgentRole())}</strong></div>
    <div><span>NÍVEL</span><strong>${escapeHtml(difficultyRules[state.difficulty].label)}</strong></div>
    <div><span>MISSÕES</span><strong>${Object.keys(state.completed).length}/${missions.length}</strong></div>
    <div><span>PONTUAÇÃO</span><strong>${state.totalScore.toLocaleString('pt-BR')}</strong></div>
    <div><span>REGISTROS</span><strong>${state.history.length}</strong></div>
    <div><span>EMBLEMAS</span><strong>${badges.length}</strong></div>
    <div class="profile-wide"><span>PROGRESSO POR MÓDULO</span><strong>${moduleSummary}</strong></div>
    <div class="profile-wide badge-wall"><span>MURAL DE EMBLEMAS</span>${badges.length ? badges.map((badge) => `<article><b>${badge.icon}</b><div><strong>${escapeHtml(badge.title)}</strong><small>${escapeHtml(badge.description)}</small></div></article>`).join('') : '<p>Nenhum emblema conquistado ainda.</p>'}</div>`;
  ui.profileDialog.showModal();
}

function renderTutorial() {
  const slide = tutorialSlides[tutorialIndex];
  ui.tutorialTitle.textContent = slide.title;
  ui.tutorialText.textContent = slide.text;
  ui.tutorialSteps.innerHTML = tutorialSlides.map((item, index) => `<div class="tutorial-step ${index === tutorialIndex ? 'active' : ''}"><strong>${escapeHtml(item.title)}</strong>${escapeHtml(item.text)}</div>`).join('');
  ui.tutorialPrevBtn.disabled = tutorialIndex === 0;
  ui.tutorialNextBtn.textContent = tutorialIndex === tutorialSlides.length - 1 ? 'Concluir tutorial' : 'Próximo →';
}

function openTutorial(auto = false) {
  tutorialIndex = 0;
  renderTutorial();
  if (!ui.tutorialDialog.open) ui.tutorialDialog.showModal();
  if (auto) toast('Tutorial guiado disponível', 'Use-o para entender os módulos, as ferramentas e o painel tático.');
}

function closeTutorial(markSeen = true) {
  if (markSeen) {
    state.tutorialSeen = true;
    saveState();
  }
  ui.tutorialDialog.close();
}

