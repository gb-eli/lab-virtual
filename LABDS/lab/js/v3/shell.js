'use strict';

(function(){
  window.LABDS=window.LABDS||{};

  const $=selector=>document.querySelector(selector);
  const $$=selector=>[...document.querySelectorAll(selector)];
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const formatNumber=value=>Intl.NumberFormat('pt-BR').format(Number(value)||0);
  let ui=null;

  function download(content,name,type='application/json'){
    const blob=content instanceof Blob?content:new Blob([content],{type});
    const url=URL.createObjectURL(blob),anchor=document.createElement('a');
    anchor.href=url;anchor.download=name;anchor.rel='noopener';document.body.appendChild(anchor);anchor.click();anchor.remove();
    document.dispatchEvent(new CustomEvent('labds:artifactexported',{detail:{filename:name,mime:type,kind:'download'}}));
    setTimeout(()=>URL.revokeObjectURL(url),1000);return{name,mime:type};
  }

  function avatarMarkup(snapshot,{compact=false}={}){
    const avatar=snapshot.profile.avatar||{};
    const attrs={
      frame:avatar.frame||'cyan',hair:avatar.hairStyle||'short',top:avatar.topStyle||'basic-shirt',bottom:avatar.bottomStyle||'basic-pants',
      shoes:avatar.shoeStyle||'basic-shoes',gloves:avatar.gloves||'none',belt:avatar.belt||'none',eyewear:avatar.eyewear||'none',
      headwear:avatar.headwear||'none',backpack:avatar.backpack||'none',aura:avatar.aura||'none'
    };
    return `<div class="v3-avatar${compact?' compact':''}" data-frame="${escapeHtml(attrs.frame)}" data-hair-style="${escapeHtml(attrs.hair)}" data-top-style="${escapeHtml(attrs.top)}" data-bottom-style="${escapeHtml(attrs.bottom)}" data-shoe-style="${escapeHtml(attrs.shoes)}" data-gloves="${escapeHtml(attrs.gloves)}" data-belt="${escapeHtml(attrs.belt)}" data-eyewear="${escapeHtml(attrs.eyewear)}" data-headwear="${escapeHtml(attrs.headwear)}" data-backpack="${escapeHtml(attrs.backpack)}" data-aura="${escapeHtml(attrs.aura)}" style="--skin:${escapeHtml(avatar.skin||'#d9a879')};--hair:${escapeHtml(avatar.hair||'#18243d')};--shirt:${escapeHtml(avatar.shirt||'#2f7df6')};--pants:${escapeHtml(avatar.pants||'#1e3a8a')};--shoes:${escapeHtml(avatar.shoes||'#111827')}">
      <span class="v3-avatar-aura" aria-hidden="true"></span>
      <span class="v3-avatar-backpack" aria-hidden="true"></span>
      <span class="v3-avatar-legs" aria-hidden="true"></span>
      <span class="v3-avatar-shoes" aria-hidden="true"></span>
      <span class="v3-avatar-torso" aria-hidden="true"></span>
      <span class="v3-avatar-belt" aria-hidden="true"></span>
      <span class="v3-avatar-gloves" aria-hidden="true"></span>
      <span class="v3-avatar-head" aria-hidden="true"></span>
      <span class="v3-avatar-hair" aria-hidden="true"></span>
      <span class="v3-avatar-headwear" aria-hidden="true"></span>
      <span class="v3-avatar-face" aria-hidden="true">•‿•</span>
      <span class="v3-avatar-eyewear" aria-hidden="true"></span>
      <b class="v3-avatar-accessory">${escapeHtml(avatar.accessory||'')}</b>
      <i class="v3-avatar-mascot">${escapeHtml(avatar.mascot||'')}</i>
      <em class="v3-avatar-badge">${escapeHtml(avatar.badge||'')}</em>
    </div>`;
  }

  function inject(){
    const header=$('.header-actions');if(!header)return;
    const group=document.createElement('div');group.className='v3-header-cluster';
    group.innerHTML=`<button id="v3ProfileBtn" class="v3-profile-chip" type="button"><span id="v3MiniAvatar"></span><span><b id="v3ProfileName">Perfil</b><small id="v3LevelLabel">Nível 1</small></span></button><button id="v3CreditsBtn" class="v3-credit-chip" type="button"><b id="v3CreditsValue">0</b><small>Créditos</small></button><button id="v3MenuBtn" class="icon-btn" type="button" aria-label="Abrir menu do V3">☰</button>`;
    header.prepend(group);

    const dashboard=document.createElement('section');dashboard.id='v3Dashboard';dashboard.className='v3-dashboard';
    dashboard.innerHTML=`<article class="v3-dashboard-profile"><div id="v3DashboardAvatar"></div><div><span class="eyebrow">PERFIL DO ESTUDANTE</span><h2 id="v3DashboardName">Estudante</h2><p id="v3DashboardClass">Turma</p><div class="v3-xp-track"><i id="v3XpFill"></i></div><small id="v3XpText">0 XP</small><div class="v35-coverage-mini"><span id="v35CoverageText">0% explorado</span><i><b id="v35CoverageFill"></b></i></div></div></article><button type="button" data-v3-open="profile"><b>Perfil</b><span>Avatar, progresso e histórico</span></button><button type="button" data-v3-open="store"><b>Loja Tech</b><span>Skins, acessórios e animações</span></button><button type="button" data-v3-open="achievements"><b>Conquistas</b><span>Metas acadêmicas desbloqueadas</span></button><button type="button" data-v3-open="diagnostic"><b>Diagnóstico</b><span>Compatibilidade e qualidade sugerida</span></button>`;
    $('.quick-launch-v8')?.before(dashboard);

    const container=document.createElement('div');
    container.innerHTML=`
      <dialog id="v3Drawer" class="v3-drawer"><form method="dialog"><header><div><span class="eyebrow">LAB VIRTUAL DS V4.0</span><h2>Central do estudante</h2></div><button class="icon-btn" value="cancel" aria-label="Fechar">×</button></header><nav class="v3-drawer-nav"><button type="button" data-v3-open="profile">Perfil e avatar</button><button type="button" data-v3-open="store">Loja Tech</button><button type="button" data-v3-open="achievements">Conquistas</button><button type="button" data-v3-open="diagnostic">Diagnóstico do dispositivo</button><button type="button" data-v3-open="settings">Preferências avançadas</button><button type="button" data-open-tool="tutorial-center">Tutoriais passo a passo</button><button type="button" data-open-tool="tech-explorer">Explorar linguagens e carreiras</button><button type="button" data-open-tool="solar-system">Sistema Solar</button><button type="button" data-open-tool="school-randomizer">Sorteios escolares</button><button type="button" data-open-tool="thermal-panel">Clima Extremo</button><button type="button" data-open-tool="audio-lab">AudioLab</button><button type="button" data-v3-open="bug">Reportar problema</button><button type="button" data-open-tool="help-center">Ajuda rápida</button></nav></form></dialog>
      <dialog id="v3Panel" class="v3-panel"><form method="dialog"><header><div><span id="v3PanelEyebrow" class="eyebrow">V4.0</span><h2 id="v3PanelTitle">Painel</h2></div><button class="icon-btn" value="cancel" aria-label="Fechar">×</button></header><div id="v3PanelBody" class="v3-panel-body"></div></form></dialog>`;
    document.body.append(...container.children);
    ui={drawer:$('#v3Drawer'),panel:$('#v3Panel'),body:$('#v3PanelBody'),title:$('#v3PanelTitle'),eyebrow:$('#v3PanelEyebrow')};
    bind();render();
  }

  function bind(){
    $('#v3ProfileBtn')?.addEventListener('click',()=>openPanel('profile'));
    $('#v3CreditsBtn')?.addEventListener('click',()=>openPanel('store'));
    $('#v3MenuBtn')?.addEventListener('click',()=>ui.drawer.showModal());
    document.addEventListener('click',event=>{
      const action=event.target.closest('[data-v3-open]');
      if(action){event.preventDefault();ui.drawer?.close();openPanel(action.dataset.v3Open);}
      const tool=event.target.closest('[data-open-tool]');
      if(tool&&ui.drawer?.open){ui.drawer.close();window.LABDS.App?.openTool?.(tool.dataset.openTool);}
    });
    document.addEventListener('labds:v3:change',render);
    document.addEventListener('labds:v3:reward',event=>rewardToast(event.detail));
    document.addEventListener('labds:v3:achievement',event=>rewardToast({kind:'achievement',reason:event.detail.title,amount:0}));
    document.addEventListener('labds:v3:completion',event=>playCelebration(event.detail));
  }

  function rewardToast(detail){
    const toast=document.createElement('div');toast.className='v3-reward-toast';
    toast.textContent=detail.kind==='xp'?`+${detail.amount} XP • ${detail.reason}`:detail.kind==='credits'?`${detail.amount>0?'+':''}${detail.amount} Créditos • ${detail.reason}`:`Conquista: ${detail.reason}`;
    document.body.appendChild(toast);requestAnimationFrame(()=>toast.classList.add('show'));
    setTimeout(()=>{toast.classList.remove('show');setTimeout(()=>toast.remove(),300);},2800);
  }

  function playCelebration(detail={}){
    const snapshot=window.LABDS.Core?.getSnapshot?.();
    const celebration=detail.celebration||snapshot?.profile?.avatar?.celebration||'';
    if(!celebration||matchMedia('(prefers-reduced-motion: reduce)').matches||snapshot?.settings?.sensoryReduced)return;
    $$('.v3-avatar').forEach(avatar=>{avatar.classList.remove('celebration-active');void avatar.offsetWidth;avatar.dataset.celebration=celebration;avatar.classList.add('celebration-active');setTimeout(()=>avatar.classList.remove('celebration-active'),2200);});
    const overlay=document.createElement('div');overlay.className=`v35-celebration-overlay celebration-${celebration}`;
    overlay.setAttribute('aria-live','polite');overlay.innerHTML=`<div class="v35-celebration-avatar">${avatarMarkup(snapshot)}</div><strong>Atividade concluída!</strong><span>${escapeHtml(detail.reason||'Progresso registrado')}</span><div class="v35-celebration-particles" aria-hidden="true"></div>`;
    const particles=overlay.querySelector('.v35-celebration-particles');
    const count=celebration==='quantum-triumph'?34:celebration==='pixel-confetti'?26:celebration==='orbit-spin'?18:10;
    for(let index=0;index<count;index++){const particle=document.createElement('i');particle.style.setProperty('--i',String(index));particle.style.setProperty('--x',`${(index*47)%100}%`);particle.style.setProperty('--delay',`${(index%8)*40}ms`);particles.appendChild(particle);}
    document.body.appendChild(overlay);requestAnimationFrame(()=>overlay.classList.add('show'));
    setTimeout(()=>{overlay.classList.remove('show');setTimeout(()=>overlay.remove(),450);},2600);
  }

  function render(){
    const snapshot=window.LABDS.Core?.getSnapshot?.();if(!snapshot)return;
    const level=snapshot.levelInfo,coverage=snapshot.coverage;
    const mini=$('#v3MiniAvatar'),profile=$('#v3ProfileName'),levelLabel=$('#v3LevelLabel'),credits=$('#v3CreditsValue');
    if(mini)mini.innerHTML=avatarMarkup(snapshot,{compact:true});if(profile)profile.textContent=snapshot.profile.name;if(levelLabel)levelLabel.textContent=`Nível ${level.level} • ${level.name}`;if(credits)credits.textContent=formatNumber(snapshot.techCredits);
    const dashAvatar=$('#v3DashboardAvatar'),dashName=$('#v3DashboardName'),dashClass=$('#v3DashboardClass'),xpFill=$('#v3XpFill'),xpText=$('#v3XpText');
    if(dashAvatar)dashAvatar.innerHTML=avatarMarkup(snapshot);if(dashName)dashName.textContent=snapshot.profile.name;if(dashClass)dashClass.textContent=snapshot.profile.studentClass;if(xpFill)xpFill.style.width=`${level.progress}%`;if(xpText)xpText.textContent=level.next?`${formatNumber(snapshot.xp)} XP • faltam ${formatNumber(level.next.xp-snapshot.xp)} para ${level.next.name}`:`${formatNumber(snapshot.xp)} XP • nível máximo atual`;
    const coverageText=$('#v35CoverageText'),coverageFill=$('#v35CoverageFill');if(coverageText)coverageText.textContent=`${coverage.coverage}% explorado • ${coverage.validatedCount} ferramentas validadas`;if(coverageFill)coverageFill.style.width=`${coverage.coverage}%`;
  }

  function openPanel(type){
    if(!ui)return;
    const renders={profile:renderProfile,store:renderStore,achievements:renderAchievements,diagnostic:renderDiagnostic,settings:renderSettings,bug:renderBug};
    (renders[type]||renderProfile)();if(!ui.panel.open)ui.panel.showModal();
  }
  function setPanel(title,eyebrow='LAB VIRTUAL DS V4.0'){ui.title.textContent=title;ui.eyebrow.textContent=eyebrow;ui.body.textContent='';}

  function renderProfile(){
    const snapshot=window.LABDS.Core.getSnapshot(),level=snapshot.levelInfo,coverage=snapshot.coverage;
    setPanel('Perfil e progresso');
    ui.body.innerHTML=`<div class="v3-profile-layout"><section class="v3-profile-card">${avatarMarkup(snapshot)}<label>Nome ou apelido<input id="v3NameInput" maxlength="80" value="${escapeHtml(snapshot.profile.name)}"></label><label>Turma<input id="v3ClassInput" maxlength="100" value="${escapeHtml(snapshot.profile.studentClass)}"></label><div class="state-card info compact"><strong>Cores gratuitas</strong><p>A escolha de cor é livre. Formatos de cabelo, roupas, calçados, acessórios, auras e animações são obtidos na Loja Tech.</p></div><div class="v3-color-row v35-color-row"><label>Pele<input id="v3Skin" type="color" value="${escapeHtml(snapshot.profile.avatar.skin)}"></label><label>Cabelo<input id="v3Hair" type="color" value="${escapeHtml(snapshot.profile.avatar.hair)}"></label><label>Parte superior<input id="v3Shirt" type="color" value="${escapeHtml(snapshot.profile.avatar.shirt)}"></label><label>Parte inferior<input id="v3Pants" type="color" value="${escapeHtml(snapshot.profile.avatar.pants)}"></label><label>Calçados<input id="v3Shoes" type="color" value="${escapeHtml(snapshot.profile.avatar.shoes)}"></label></div><div class="button-row"><button id="v3SaveProfile" class="btn primary" type="button">Salvar perfil</button><button id="v35PreviewCelebration" class="btn secondary" type="button" ${snapshot.profile.avatar.celebration?'':'disabled'}>Testar comemoração</button></div></section><section><div class="v3-stats-grid"><article><b>${formatNumber(snapshot.xp)}</b><span>XP acadêmico</span></article><article><b>${level.level}</b><span>${escapeHtml(level.name)}</span></article><article><b>${formatNumber(snapshot.techCredits)}</b><span>Créditos Tech</span></article><article><b>${Object.keys(snapshot.achievements).length}</b><span>Conquistas</span></article><article><b>${coverage.exploredCount}/${coverage.total}</b><span>Ferramentas exploradas</span></article><article><b>${coverage.validatedCount}</b><span>Ferramentas validadas</span></article><article><b>${coverage.validActivities}</b><span>Atividades válidas</span></article><article><b>${snapshot.wallet?.arcadeMinutes||0}</b><span>Minutos Arcade</span></article></div><div class="v35-profile-coverage"><header><strong>Cobertura da plataforma</strong><span>${coverage.coverage}%</span></header><div><i style="width:${coverage.coverage}%"></i></div><p>${coverage.nextMilestone?`Próximo marco: ${coverage.nextMilestone.percent}% — bônus de ${coverage.nextMilestone.credits} créditos.`:'Todas as ferramentas desta versão foram exploradas.'}</p></div></section></div><section class="v3-history"><h3>Histórico resumido</h3>${snapshot.history.slice(-12).reverse().map(item=>`<p><time>${new Date(item.at).toLocaleString('pt-BR')}</time><span>${escapeHtml(item.message)}</span></p>`).join('')||'<p>Nenhuma atividade registrada.</p>'}</section><div class="button-row"><button id="v3ExportProgress" class="btn secondary" type="button">Exportar progresso JSON</button><button id="v3ImportProgress" class="btn secondary" type="button">Importar progresso</button><button id="v3ExportWallet" class="btn secondary" type="button">Exportar extrato da carteira</button><input id="v3ImportFile" type="file" accept="application/json" hidden></div>`;
    $('#v3SaveProfile').onclick=()=>{window.LABDS.Core.setProfile({name:$('#v3NameInput').value.trim()||'Estudante',studentClass:$('#v3ClassInput').value.trim()||'Turma não informada',avatar:{skin:$('#v3Skin').value,hair:$('#v3Hair').value,shirt:$('#v3Shirt').value,pants:$('#v3Pants').value,shoes:$('#v3Shoes').value}});renderProfile();render();};
    $('#v35PreviewCelebration').onclick=()=>playCelebration({reason:'Prévia da animação equipada',celebration:snapshot.profile.avatar.celebration});
    $('#v3ExportProgress').onclick=()=>{const name=`lab-ds-v3.5-progresso-${new Date().toISOString().slice(0,10)}.json`;download(JSON.stringify(window.LABDS.Core.exportProgress(),null,2),name);window.LABDS.App?.toast?.('Progresso exportado.','success');};
    $('#v3ImportProgress').onclick=()=>$('#v3ImportFile').click();
    $('#v3ImportFile').onchange=async event=>{const file=event.target.files?.[0];if(!file)return;try{if(file.size>10*1024*1024)throw new Error('O arquivo excede 10 MB.');await window.LABDS.Core.importProgress(JSON.parse(await file.text()));renderProfile();render();window.LABDS.App?.toast?.('Progresso importado.','success');}catch(error){window.LABDS.App?.toast?.(error.message,'warning');}event.target.value='';};
    $('#v3ExportWallet').onclick=()=>download(JSON.stringify(window.LABDS.Core.walletExport(),null,2),`lab-ds-carteira-${new Date().toISOString().slice(0,10)}.json`);
  }

  const storeTypeLabels={all:'Todos',cabelo:'Cabelo',roupas:'Roupas',calçados:'Calçados',acessórios:'Acessórios',molduras:'Molduras',temas:'Temas',mascotes:'Mascotes',emblemas:'Emblemas',efeitos:'Auras e efeitos',animações:'Animações',skins:'Skins completas',arcade:'Arcade'};
  const rarityLabels={all:'Todas',comum:'Comum',incomum:'Incomum',raro:'Raro',épico:'Épico',lendário:'Lendário',mítico:'Mítico'};

  function renderStore(){
    const snapshot=window.LABDS.Core.getSnapshot(),coverage=snapshot.coverage,economy=snapshot.economy;
    setPanel('Loja Tech e personalização','ECONOMIA PEDAGÓGICA V4.0');
    ui.body.innerHTML=`<section class="v35-store-summary"><div class="v3-store-balance"><b>${formatNumber(snapshot.techCredits)}</b><span>Créditos Tech disponíveis</span><small>${snapshot.wallet?.arcadeMinutes||0} minuto(s) Arcade acumulado(s)</small></div><div class="v35-coverage-card"><header><strong>Cobertura do portal</strong><span>${coverage.exploredCount}/${coverage.total} ferramentas</span></header><div class="v35-progress-track"><i style="width:${coverage.coverage}%"></i></div><p><b>${coverage.coverage}% explorado</b> • ${coverage.validActivities} atividades válidas • ${coverage.validatedCount} ferramentas com conclusão validada.</p></div><div class="v35-economy-card"><strong>Quanto vale explorar toda a plataforma?</strong><p>Uma primeira atividade validada em cada uma das ${economy.toolCount} ferramentas representa aproximadamente <b>${formatNumber(economy.firstValidatedUseCredits)} créditos-base</b>. Os marcos de 30%, 50%, 70%, 80%, 90% e 100% podem acrescentar mais <b>${formatNumber(economy.milestoneCredits)} créditos</b>. Repetir ações simples não gera saldo infinito.</p><small>Referência de entrada: ${formatNumber(economy.referenceTotal)} créditos incluindo o saldo inicial e todos os marcos. Projetos, desafios avançados e novas atividades continuam podendo render créditos adicionais.</small></div></section><div class="v34-store-toolbar v35-store-toolbar"><label>Categoria<select id="storeTypeFilter">${Object.entries(storeTypeLabels).map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label><label>Raridade<select id="storeRarityFilter">${Object.entries(rarityLabels).map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label><label>Ordenar<select id="storeSort"><option value="price-asc">Menor preço</option><option value="price-desc">Maior preço</option><option value="rarity">Raridade</option><option value="coverage">Exigência de cobertura</option></select></label><label class="v35-lock-toggle"><input id="storeShowLocked" type="checkbox" checked> Mostrar itens bloqueados</label></div><div id="v3StoreGrid" class="v3-store-grid v35-store-grid"></div><div class="state-card info"><strong>Regra de progressão</strong><p>Itens épicos, lendários e míticos podem exigir cobertura mínima e atividades válidas, além do preço. Apenas abrir e fechar uma ferramenta não substitui a conclusão de práticas. A transferência entre aparelhos permanece desativada até existir validação segura contra duplicação.</p></div>`;

    const draw=()=>{
      const fresh=window.LABDS.Core.getSnapshot(),type=$('#storeTypeFilter').value,rarity=$('#storeRarityFilter').value,sort=$('#storeSort').value,showLocked=$('#storeShowLocked').checked;
      const rarityOrder=fresh.rarityOrder||{};
      const items=fresh.storeItems.filter(item=>!item.starter&&(!item.hidden||fresh.inventory.includes(item.id))&&(type==='all'||item.category===type)&&(rarity==='all'||item.rarity===rarity)).map(item=>({...item,unlockState:window.LABDS.Core.getItemUnlockState(item)})).filter(item=>showLocked||item.unlockState.unlocked).sort((a,b)=>sort==='price-desc'?b.price-a.price:sort==='rarity'?(rarityOrder[a.rarity]||0)-(rarityOrder[b.rarity]||0):sort==='coverage'?Number(a.unlock?.coverage||0)-Number(b.unlock?.coverage||0):a.price-b.price);
      $('#v3StoreGrid').innerHTML=items.map(item=>{
        const owned=fresh.inventory.includes(item.id),equipped=Object.values(fresh.equipped).includes(item.id),locked=!item.unlockState.unlocked;
        const requirements=[];if(item.unlock?.coverage)requirements.push(`${item.unlock.coverage}% do portal`);if(item.unlock?.validActivities)requirements.push(`${item.unlock.validActivities} atividades válidas`);if(item.unlock?.level)requirements.push(`nível ${item.unlock.level}`);
        return `<article class="v35-store-item rarity-card-${escapeHtml(item.rarity)} ${locked?'locked':''}"><div class="v35-item-preview" aria-hidden="true">${escapeHtml(item.preview||'◆')}</div><div class="v35-item-heading"><span class="rarity ${escapeHtml(item.rarity)}">${escapeHtml(item.rarity)}</span><span>${escapeHtml(storeTypeLabels[item.category]||item.category)}</span></div><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description||item.type)}</p>${requirements.length?`<div class="v35-requirements"><b>Requisitos</b><span>${escapeHtml(requirements.join(' • '))}</span>${locked?`<small>${escapeHtml(item.unlockState.reasons.join(' • '))}</small>`:'<small>Requisitos alcançados.</small>'}</div>`:''}<footer><b>${formatNumber(item.price)} créditos</b><button class="btn ${owned?'secondary':'primary'}" type="button" data-store-id="${item.id}" ${equipped||locked?'disabled':''}>${locked?'Bloqueado':equipped?'Equipado':item.consumable?'Comprar':owned?'Equipar':'Comprar'}</button></footer></article>`;
      }).join('')||'<div class="empty-state">Nenhum item corresponde aos filtros escolhidos.</div>';
      ui.body.querySelectorAll('[data-store-id]').forEach(button=>button.onclick=()=>{
        const id=button.dataset.storeId,snap=window.LABDS.Core.getSnapshot(),item=snap.storeItems.find(entry=>entry.id===id);
        if(snap.inventory.includes(id)&&!item?.consumable)window.LABDS.Core.equipItem(id);
        else{const result=window.LABDS.Core.buyItem(id);if(!result.ok)return window.LABDS.App?.toast?.(result.error,'warning',6500);}
        renderStore();render();
      });
    };
    $('#storeTypeFilter').onchange=draw;$('#storeRarityFilter').onchange=draw;$('#storeSort').onchange=draw;$('#storeShowLocked').onchange=draw;draw();
  }

  function renderAchievements(){
    const snapshot=window.LABDS.Core.getSnapshot();setPanel('Conquistas','PROGRESSÃO ACADÊMICA');
    ui.body.innerHTML=`<div class="v3-achievements">${Object.entries(snapshot.achievementsCatalog).map(([id,item])=>{const unlocked=snapshot.achievements[id];return`<article class="${unlocked?'unlocked':'locked'}"><span>${escapeHtml(item.icon)}</span><div><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p><small>${unlocked?`Desbloqueada em ${new Date(unlocked.unlockedAt).toLocaleDateString('pt-BR')}`:'Ainda bloqueada'}</small></div></article>`;}).join('')}</div>`;
  }

  async function renderDiagnostic(){
    setPanel('Diagnóstico do dispositivo','COMPATIBILIDADE');ui.body.innerHTML='<div class="v3-diagnostic"><p>Executando verificações locais...</p></div>';
    const checks=[],add=(name,value,status='ok',detail='')=>checks.push({name,value,status,detail});
    add('Navegador',navigator.userAgent.includes('Firefox')?'Firefox':navigator.userAgent.includes('Edg')?'Edge':navigator.userAgent.includes('Chrome')?'Chrome/Chromium':'Outro');
    add('Resolução',`${screen.width} × ${screen.height}`);add('Viewport',`${innerWidth} × ${innerHeight}`);
    const webgl=Boolean(document.createElement('canvas').getContext('webgl2')||document.createElement('canvas').getContext('webgl'));add('WebGL',webgl?'Disponível':'Indisponível',webgl?'ok':'warn');
    add('IndexedDB','indexedDB'in window?'Disponível':'Indisponível','indexedDB'in window?'ok':'warn');add('Service Worker','serviceWorker'in navigator?'Disponível':'Indisponível','serviceWorker'in navigator?'ok':'warn');
    add('Câmera/microfone',navigator.mediaDevices?.getUserMedia?'Compatível':'Sem API','ok','A permissão só será solicitada no laboratório específico.');add('Sensores','DeviceMotionEvent'in window?'Possível':'Não detectado');add('Conexão',navigator.onLine?'Online':'Offline',navigator.onLine?'ok':'warn');
    const memory=navigator.deviceMemory||0,cores=navigator.hardwareConcurrency||0,quality=memory&&memory<=2||cores&&cores<=2?'low':memory>=8&&cores>=8?'ultra':memory>=4&&cores>=4?'high':'medium',qualityLabel={low:'BAIXA',medium:'MÉDIA',high:'ALTA',ultra:'ULTRA'}[quality];
    add('Qualidade sugerida',qualityLabel,'ok',`${cores||'?'} núcleos lógicos • ${memory||'?'} GB informados pelo navegador`);const loaderProfile=window.LABDS.PerformanceManager?.getSnapshot?.();if(loaderProfile)add('Perfil de carregamento',loaderProfile.profile==='economy'?'ECONOMIA':loaderProfile.profile==='quality'?'QUALIDADE':'EQUILIBRADO','ok',`${loaderProfile.maxConcurrent||1} recurso(s) simultâneo(s) • módulos sob demanda`);
    ui.body.innerHTML=`<div class="v3-diagnostic">${checks.map(item=>`<article class="${item.status}"><div><b>${escapeHtml(item.name)}</b><span>${escapeHtml(item.detail)}</span></div><strong>${escapeHtml(item.value)}</strong></article>`).join('')}</div><button id="applySuggestedQuality" class="btn primary" type="button">Aplicar qualidade ${qualityLabel.toLowerCase()}</button>`;
    $('#applySuggestedQuality').onclick=async()=>{if(quality==='ultra')await runUltraDemo();window.LABDS.Core.settings({graphics:quality});window.LABDS.App?.toast?.('Qualidade aplicada.','success');};
  }

  function runUltraDemo(){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return Promise.resolve();
    return new Promise(resolve=>{const overlay=document.createElement('div');overlay.className='ultra-quality-demo';overlay.innerHTML='<div class="ultra-grid"></div><div class="ultra-core"><span>ULTRA</span><strong>Teste gráfico</strong><small>Sombras • partículas • resolução • iluminação</small><i></i></div>';document.body.appendChild(overlay);requestAnimationFrame(()=>overlay.classList.add('active'));setTimeout(()=>overlay.classList.add('boost'),650);setTimeout(()=>{overlay.classList.remove('active');setTimeout(()=>{overlay.remove();resolve();},450);},2300);});
  }

  function renderSettings(){
    const snapshot=window.LABDS.Core.getSnapshot();setPanel('Preferências avançadas','ACESSIBILIDADE E DESEMPENHO');
    ui.body.innerHTML=`<div class="v3-settings-grid"><label>Modo gráfico<select id="v3Graphics"><option value="auto">Automático</option><option value="economy">Econômico</option><option value="low">Baixo</option><option value="medium">Médio</option><option value="high">Alto</option><option value="ultra">Ultra</option></select></label><label><input id="v3Focus" type="checkbox"> Modo foco</label><label><input id="v3Sensory" type="checkbox"> Modo sensorial reduzido</label><label><input id="v3Reading" type="checkbox"> Leitura facilitada</label><label>Visão de cores<select id="v3ColorVision"><option value="default">Padrão</option><option value="deuteranopia">Deuteranopia</option><option value="protanopia">Protanopia</option><option value="tritanopia">Tritanopia</option></select></label><label><input id="v3Sound" type="checkbox"> Sons opcionais</label><label><input id="v3Music" type="checkbox"> Música opcional</label><label><input id="v3StudyGate" type="checkbox"> Modo estudo protegido: jogos usam minutos Arcade</label></div><button id="v3SaveSettings" class="btn primary" type="button">Salvar preferências</button>`;
    $('#v3Graphics').value=snapshot.settings.graphics;$('#v3Focus').checked=snapshot.settings.focusMode;$('#v3Sensory').checked=snapshot.settings.sensoryReduced;$('#v3Reading').checked=snapshot.settings.readingMode;$('#v3ColorVision').value=snapshot.settings.colorVision;$('#v3Sound').checked=snapshot.settings.sound;$('#v3Music').checked=snapshot.settings.music;$('#v3StudyGate').checked=Boolean(snapshot.settings.studyGateGames);
    $('#v3SaveSettings').onclick=async()=>{const selectedGraphics=$('#v3Graphics').value;if(selectedGraphics==='ultra')await runUltraDemo();window.LABDS.Core.settings({graphics:selectedGraphics,focusMode:$('#v3Focus').checked,sensoryReduced:$('#v3Sensory').checked,readingMode:$('#v3Reading').checked,colorVision:$('#v3ColorVision').value,sound:$('#v3Sound').checked,music:$('#v3Music').checked,studyGateGames:$('#v3StudyGate').checked});window.LABDS.PerformanceManager?.applyFromCore?.();window.LABDS.App?.toast?.('Preferências salvas.','success');};
  }

  function renderBug(){
    const tool=window.LABDS.App?.getState?.().currentTool;setPanel('Reportar problema','RELATÓRIO LOCAL');
    ui.body.innerHTML=`<div class="v3-bug-form"><label>Laboratório<input id="bugTool" value="${escapeHtml(tool?.name||'Tela inicial')}" readonly></label><label>O que aconteceu?<textarea id="bugMessage" rows="4" placeholder="Descreva o problema"></textarea></label><label>Passos para reproduzir<textarea id="bugSteps" rows="4"></textarea></label><label>Resultado esperado<textarea id="bugExpected" rows="3"></textarea></label><label>Resultado observado<textarea id="bugActual" rows="3"></textarea></label><div class="button-row"><button id="bugGenerate" class="btn primary" type="button">Gerar relatório</button></div><pre id="bugPreview" class="v3-bug-preview hidden"></pre></div>`;
    $('#bugGenerate').onclick=()=>{const report=window.LABDS.Core.reportBug({toolId:tool?.id,message:$('#bugMessage').value,steps:$('#bugSteps').value,expected:$('#bugExpected').value,actual:$('#bugActual').value}),text=JSON.stringify(report,null,2),preview=$('#bugPreview');preview.textContent=text;preview.classList.remove('hidden');const row=document.createElement('div');row.className='button-row';row.innerHTML='<button class="btn secondary" type="button">Copiar JSON</button><button class="btn secondary" type="button">Baixar JSON</button><button class="btn secondary" type="button">Baixar TXT</button>';const [copy,json,txt]=row.querySelectorAll('button');copy.onclick=()=>navigator.clipboard?.writeText(text);json.onclick=()=>download(text,`bug-lab-ds-${report.id}.json`);txt.onclick=()=>download(`RELATÓRIO DE PROBLEMA\nVersão: ${report.version}\nData: ${report.at}\nLaboratório: ${report.toolId}\n\nProblema:\n${report.message}\n\nPassos:\n${report.steps}\n\nEsperado:\n${report.expected}\n\nObservado:\n${report.actual}`,`bug-lab-ds-${report.id}.txt`,'text/plain;charset=utf-8');preview.after(row);};
  }

  const bootShell=async()=>{await window.LABDS.Core?.init?.();inject();};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootShell,{once:true});else bootShell();
  window.LABDS.V3Shell={openPanel,render,runUltraDemo,playCelebration,avatarMarkup};
})();
