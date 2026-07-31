'use strict';

(function(){
  window.LABDS=window.LABDS||{};
  let tool=null,mode='free',step=0,practiceIndex=0,practiceScore=0,challengeStartedAt=0,challengeTimer=null;
  const $=sel=>document.querySelector(sel);
  const host=()=>$('#learningPanel');

  function cryptoShuffle(items){
    const result=[...items];
    for(let i=result.length-1;i>0;i--){
      const arr=new Uint32Array(1);crypto.getRandomValues(arr);const j=arr[0]%(i+1);
      [result[i],result[j]]=[result[j],result[i]];
    }
    return result;
  }

  function content(){
    const bank=window.LABDS.LEARNING_CONTENT;
    const specific=bank?.content?.[tool?.id]||{};
    return {
      summary:specific.summary||tool?.description||'',
      realWorld:specific.realWorld||'Esta ferramenta aparece em rotinas de desenvolvimento, suporte, análise e administração de tecnologia.',
      tutorial:specific.tutorial||bank?.common?.tutorial||[],
      guided:specific.guided||bank?.common?.guided||[],
      practice:specific.practice||bank?.common?.practice||[]
    };
  }

  function clearTimer(){clearInterval(challengeTimer);challengeTimer=null;}
  function save(extra={}){
    if(!tool)return;
    const current=window.LABDS.Storage.smallGet(`learning.${tool.id}`,{});
    window.LABDS.Storage.smallSet(`learning.${tool.id}`,{...current,mode,step,practiceIndex,practiceScore,updatedAt:new Date().toISOString(),...extra});
  }

  function element(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
  function button(text,action,className='btn secondary'){const el=element('button',className,text);el.type='button';el.dataset.learningAction=action;return el;}

  function renderHeader(container,c){
    const top=element('div','learning-top');
    const titleWrap=element('div','learning-title');
    titleWrap.append(element('span','eyebrow','MODO DE APRENDIZAGEM'),element('strong','',tool?.name||'Laboratório'),element('p','',c.summary));
    const modes=element('div','learning-modes');
    [['free','Livre'],['tutorial','Tutorial'],['guided','Guiado'],['practice','Prática'],['challenge','Desafio']].forEach(([id,label])=>{
      const b=button(label,`mode:${id}`,'learning-mode-btn');b.classList.toggle('active',mode===id);b.setAttribute('aria-pressed',String(mode===id));modes.appendChild(b);
    });
    const close=button('Recolher','collapse','btn subtle learning-collapse');
    top.append(titleWrap,modes,close);container.appendChild(top);
  }

  function renderFree(container,c){
    const body=element('div','learning-body free-mode');
    const text=element('div','learning-callout');text.append(element('h3','', 'Exploração livre'),element('p','', 'Use todas as ferramentas sem sequência obrigatória. O estado é salvo localmente e pode ser exportado.'));
    const real=button('Como isso é usado na vida real?','real','btn primary');
    body.append(text,real);container.appendChild(body);
  }

  function renderTutorial(container,c){
    const steps=c.tutorial;step=Math.max(0,Math.min(step,steps.length-1));const current=steps[step]||{};
    const body=element('div','learning-body tutorial-mode');
    const rail=element('div','learning-progress-rail');
    steps.forEach((item,index)=>{const dot=element('button',index<step?'done':index===step?'active':'',index<step?'✓':String(index+1));dot.type='button';dot.title=item.title;dot.dataset.learningAction=`step:${index}`;rail.appendChild(dot);});
    const card=element('article','learning-step-card');card.append(element('span','learning-step-label',`Etapa ${step+1} de ${steps.length}`),element('h3','',current.title||'Etapa'),element('p','',current.text||''));
    const actions=element('div','button-row');if(step>0)actions.append(button('Voltar','prev'));actions.append(button(step===steps.length-1?'Concluir tutorial':'Próxima etapa','next','btn primary'));card.appendChild(actions);
    body.append(rail,card);container.appendChild(body);
  }

  function renderGuided(container,c){
    const saved=window.LABDS.Storage.smallGet(`learning.${tool.id}`,{});const done=new Set(Array.isArray(saved.guidedDone)?saved.guidedDone:[]);
    const body=element('div','learning-body guided-mode');
    const intro=element('div','learning-callout');intro.append(element('h3','', 'Missão guiada'),element('p','', 'Realize cada ação no laboratório e marque somente depois de conferir o resultado.'));
    const list=element('ol','guided-checklist');c.guided.forEach((text,index)=>{const li=element('li',done.has(index)?'done':'');const check=element('input');check.type='checkbox';check.checked=done.has(index);check.dataset.guidedIndex=String(index);const span=element('span','',text);li.append(check,span);list.appendChild(li);});
    const progress=element('div','guided-progress');const percent=Math.round(done.size/Math.max(1,c.guided.length)*100);progress.append(element('strong','',`${percent}% concluído`),element('span','',`${done.size} de ${c.guided.length} ações`));
    body.append(intro,list,progress,button('Abrir aplicação profissional','real','btn secondary'));container.appendChild(body);
  }

  function mappedQuestion(question){
    const entries=question.options.map((text,index)=>({text,index}));
    return cryptoShuffle(entries);
  }

  function renderPractice(container,c){
    const questions=c.practice;practiceIndex=Math.max(0,Math.min(practiceIndex,questions.length));const body=element('div','learning-body practice-mode');
    if(practiceIndex>=questions.length){
      const result=element('article','learning-result');result.append(element('span','achievement-icon','✓'),element('h3','', 'Prática concluída'),element('p','',`Você acertou ${practiceScore} de ${questions.length}. Revise as explicações e tente novamente para consolidar.`),button('Tentar novamente','practice-reset','btn primary'));body.appendChild(result);container.appendChild(body);return;
    }
    const q=questions[practiceIndex];const card=element('article','practice-card');card.append(element('span','learning-step-label',`Questão ${practiceIndex+1} de ${questions.length}`),element('h3','',q.q));
    const options=element('div','practice-options');mappedQuestion(q).forEach(entry=>{const b=button(entry.text,`answer:${entry.index}`,'practice-option');options.appendChild(b);});
    const feedback=element('div','practice-feedback');feedback.id='learningPracticeFeedback';feedback.setAttribute('aria-live','polite');card.append(options,feedback);body.appendChild(card);container.appendChild(body);
  }

  function renderChallenge(container,c){
    const tasks=[...c.guided,...c.practice.map(q=>q.q)].slice(0,7);const saved=window.LABDS.Storage.smallGet(`learning.${tool.id}.challenge`,{});const done=new Set(Array.isArray(saved.done)?saved.done:[]);
    if(!challengeStartedAt) challengeStartedAt=Number(saved.startedAt)||Date.now();
    const body=element('div','learning-body challenge-mode');
    const header=element('div','challenge-header');header.append(element('div','', 'Missão técnica'),element('strong','challenge-clock','00:00'));
    const list=element('ol','challenge-list');tasks.forEach((text,index)=>{const li=element('li',done.has(index)?'done':'');const check=element('input');check.type='checkbox';check.checked=done.has(index);check.dataset.challengeIndex=String(index);li.append(check,element('span','',text));list.appendChild(li);});
    const score=Math.round(done.size/Math.max(1,tasks.length)*100);const footer=element('div','challenge-footer');footer.append(element('strong','',`${score} XP de missão`),element('span','',score===100?'Desafio concluído. Exporte a sessão e entregue no Classroom.':'Marque as etapas somente após validar no laboratório.'));if(score===100)footer.append(button('Preparar entrega','deliver','btn primary'));
    body.append(header,list,footer);container.appendChild(body);
    clearTimer();challengeTimer=setInterval(()=>{const clock=$('.challenge-clock');if(clock){const sec=Math.floor((Date.now()-challengeStartedAt)/1000);clock.textContent=`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`;}},1000);
  }

  function renderRealWorld(){
    const c=content(),dialog=$('#realWorldDialog');if(!dialog)return;
    dialog.querySelector('#realWorldTitle').textContent=tool?.name||'Aplicação profissional';
    dialog.querySelector('#realWorldContent').textContent='';
    const contentHost=dialog.querySelector('#realWorldContent');
    contentHost.append(element('h3','', 'Como isso é usado na vida real?'),element('p','',c.realWorld));
    const list=element('ol','real-world-flow');['Contexto profissional','Problema a resolver','Ferramenta utilizada','Procedimento seguro','Resultado esperado'].forEach((label,index)=>{const li=element('li');li.append(element('strong','',label),element('span','',index===0?c.realWorld:index===1?'Identificar uma tarefa real que possa ser reproduzida sem usar dados sensíveis.':index===2?tool.name:index===3?'Testar em ambiente isolado, observar mensagens e registrar as ações.':'Uma evidência exportável e a compreensão do processo.'));list.appendChild(li);});contentHost.appendChild(list);dialog.showModal();
  }

  function render(){
    const panel=host();if(!panel||!tool)return;clearTimer();panel.textContent='';panel.classList.remove('collapsed');panel.dataset.mode=mode;const c=content();renderHeader(panel,c);
    if(mode==='free')renderFree(panel,c);else if(mode==='tutorial')renderTutorial(panel,c);else if(mode==='guided')renderGuided(panel,c);else if(mode==='practice')renderPractice(panel,c);else renderChallenge(panel,c);
    save();
  }

  function handleClick(event){
    const action=event.target.closest('[data-learning-action]')?.dataset.learningAction;if(!action)return;
    if(action.startsWith('mode:')){mode=action.split(':')[1];step=0;practiceIndex=0;practiceScore=0;render();return;}
    if(action==='collapse'){host()?.classList.toggle('collapsed');event.target.textContent=host()?.classList.contains('collapsed')?'Expandir':'Recolher';return;}
    if(action==='real'){renderRealWorld();return;}
    if(action==='deliver'){window.LABDS.App?.openFinish?.();return;}
    if(action==='prev'){step=Math.max(0,step-1);render();return;}
    if(action==='next'){const max=content().tutorial.length-1;if(step<max){step++;render();}else{window.LABDS.App?.toast?.('Tutorial concluído. Agora pratique no laboratório.','success',4000);mode='guided';step=0;render();}return;}
    if(action.startsWith('step:')){step=Number(action.split(':')[1])||0;render();return;}
    if(action==='practice-reset'){practiceIndex=0;practiceScore=0;render();return;}
    if(action.startsWith('answer:')){
      const selected=Number(action.split(':')[1]);const q=content().practice[practiceIndex];const feedback=$('#learningPracticeFeedback');
      host().querySelectorAll('.practice-option').forEach(b=>b.disabled=true);
      const correct=selected===q.answer;if(correct)practiceScore++;
      feedback.className=`practice-feedback ${correct?'success':'error'}`;
      feedback.textContent=`${correct?'Correto.':'Ainda não.'} ${q.explanation}`;
      setTimeout(()=>{practiceIndex++;render();},correct?1200:2200);return;
    }
  }

  function handleChange(event){
    if(event.target.matches('[data-guided-index]')){
      const saved=window.LABDS.Storage.smallGet(`learning.${tool.id}`,{});const done=new Set(Array.isArray(saved.guidedDone)?saved.guidedDone:[]);const index=Number(event.target.dataset.guidedIndex);event.target.checked?done.add(index):done.delete(index);window.LABDS.Storage.smallSet(`learning.${tool.id}`,{...saved,guidedDone:[...done],updatedAt:new Date().toISOString()});render();
    }
    if(event.target.matches('[data-challenge-index]')){
      const key=`learning.${tool.id}.challenge`,saved=window.LABDS.Storage.smallGet(key,{}),done=new Set(Array.isArray(saved.done)?saved.done:[]),index=Number(event.target.dataset.challengeIndex);event.target.checked?done.add(index):done.delete(index);window.LABDS.Storage.smallSet(key,{done:[...done],startedAt:challengeStartedAt,updatedAt:new Date().toISOString()});render();
    }
  }

  function open(nextTool){tool=nextTool;const panel=host();if(tool?.learningModes===false||tool?.immersive===true){clearTimer();if(panel){panel.textContent='';panel.classList.add('hidden');panel.removeAttribute('data-mode');}return;}const saved=window.LABDS.Storage.smallGet(`learning.${tool.id}`,{});mode=['free','tutorial','guided','practice','challenge'].includes(saved.mode)?saved.mode:'free';step=Number(saved.step)||0;practiceIndex=Number(saved.practiceIndex)||0;practiceScore=Number(saved.practiceScore)||0;challengeStartedAt=0;render();}
  function close(){clearTimer();tool=null;const panel=host();if(panel){panel.textContent='';panel.classList.add('hidden');}}
  function init(){host()?.addEventListener('click',handleClick);host()?.addEventListener('change',handleChange);document.addEventListener('labds:toolopen',event=>{host()?.classList.remove('hidden');open(event.detail.tool);});document.addEventListener('labds:toolclose',close);}
  window.LABDS.Learning={init,open,close,getMode:()=>mode};
})();
