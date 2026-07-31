'use strict';
window.LABDS_LABS = window.LABDS_LABS || {};
(function(){
  const KEY='lab.teacher.state';
  const safe=(value,max=180)=>String(value??'').replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,max);
  const csvCell=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
  const uid=()=>crypto?.randomUUID?.() || (()=>{const bytes=new Uint8Array(8);crypto.getRandomValues(bytes);return `act-${[...bytes].map(v=>v.toString(16).padStart(2,'0')).join('')}`;})();
  const initial=()=>({schemaVersion:2,classes:[],activities:[],results:[],classroomUrl:'',createdAt:new Date().toISOString()});
  let ctx,state,root;

  async function save(){await ctx.storage.set(KEY,state);}
  function download(name,text,type='application/json'){
    const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function activityLink(a){
    const base=new URL('./index.html',location.href);
    base.searchParams.set('tool',a.toolId);base.searchParams.set('activity',a.id);base.searchParams.set('difficulty',a.difficulty);const classroom=window.LABDS.Classroom?.normalizeUrl?.(a.classroomUrl||state.classroomUrl);if(classroom)base.searchParams.set('classroom',classroom);
    if(a.eduauthRequired){base.searchParams.set('eduauthAction',a.eduauthAction||'lesson-start');base.searchParams.set('classId',a.className||'Outra turma');base.searchParams.set('subjectId',a.subjectId||'desenvolvimento-de-sistemas');base.searchParams.set('lessonId',a.lessonId||'atividade-atual');base.searchParams.set('activityId','atividade-principal');}
    return base.href;
  }
  function optionsFromRegistry(name,labels={}){return Object.values(window.LABDS.EduAuth?.registries?.[name]||{}).map(id=>`<option value="${id}">${safe(labels[id]||id.replace(/-/g,' '),120)}</option>`).join('');}
  function render(){
    const tools=(window.LABDS?.TOOLS||[]).filter(t=>t.id!=='teacher-mode'),registries=window.LABDS.EduAuth?.registries||{};
    root.innerHTML=`<section class="teacher-lab v3-module">
      <div class="module-hero"><div><span class="module-eyebrow">GESTÃO LOCAL • EDUAUTH</span><h2>Modo Professor</h2><p>Crie atividades, gere links protegidos e reúna resultados exportados pelos estudantes. Tudo permanece neste navegador até a exportação.</p></div><div class="metric-row"><div class="metric"><b>${state.activities.length}</b><span>atividades</span></div><div class="metric"><b>${state.results.length}</b><span>resultados</span></div></div></div>
      <div class="teacher-layout">
        <section class="lab-card"><h3>Nova atividade</h3><div class="control-stack">
          <label>Título<input id="teacherTitle" maxlength="100" placeholder="Ex.: Configurar rede local"></label>
          <label>Turma<input id="teacherClass" maxlength="60" placeholder="Ex.: 2º DS — Manhã"></label>
          <label>Disciplina<select id="teacherSubject">${optionsFromRegistry('subjects',registries.subjectLabels||{})}</select></label>
          <label>Aula<select id="teacherLesson">${optionsFromRegistry('lessons')}</select></label>
          <label>Laboratório<select id="teacherTool">${tools.map(t=>`<option value="${t.id}">${t.name}</option>`).join('')}</select></label>
          <label>Dificuldade<select id="teacherDifficulty"><option value="basic">Básica</option><option value="intermediate" selected>Intermediária</option><option value="advanced">Avançada</option></select></label>
          <label>XP acadêmico<input id="teacherXP" type="number" min="0" max="500" value="40"></label>
          <label class="settings-check"><input id="teacherEduAuth" type="checkbox"> Exigir autorização EduAuth para abrir a atividade</label>
          <label>Tipo de autorização<select id="teacherEduAuthAction"><option value="lesson-start">Iniciar atividade</option><option value="challenge-start">Iniciar desafio</option></select></label>
          <label>Link do Google Classroom (opcional)<input id="teacherClassroomUrl" type="url" inputmode="url" maxlength="2048" placeholder="https://classroom.google.com/..." value="${safe(state.classroomUrl||'',500)}"></label>
          <label>Instruções<textarea id="teacherInstructions" rows="6" maxlength="1800" placeholder="Objetivo, passos e critérios de conclusão"></textarea></label>
          <button id="teacherCreate" class="primary">Criar atividade</button>
        </div></section>
        <section class="lab-card"><div class="office-section-head"><h3>Atividades criadas</h3><button id="teacherExportActivities">Exportar JSON</button></div><div id="teacherActivityList" class="teacher-activity-list"></div></section>
      </div>
      <section class="lab-card teacher-results"><div class="office-section-head"><div><h3>Resultados importados</h3><p>Importe arquivos JSON exportados pelo Lab Virtual DS.</p></div><div><input id="teacherResultFile" type="file" accept="application/json,.json" multiple hidden><button id="teacherImportResults">Importar resultados</button> <button id="teacherExportCsv">Gerar CSV</button></div></div><div id="teacherResults"></div></section>
      <section class="lab-card"><h3>EduAuth Offline</h3><p>O acesso ao Modo Professor e as exclusões usam autorizações vinculadas à sessão. Links protegidos podem usar um PIN coletivo da turma. Nesta versão, as chaves são exclusivamente de desenvolvimento e precisam ser substituídas pelo EduAuth Professor antes do uso real.</p></section>
      <section class="lab-card"><h3>Privacidade e limitações</h3><p>Este painel não envia dados. Não existe sincronização entre aparelhos. Use apenas identificadores adequados ao contexto escolar e exporte os relatórios necessários.</p></section>
    </section>`;
    bind();renderActivities();renderResults();
  }
  function renderActivities(){
    const box=root.querySelector('#teacherActivityList');
    if(!state.activities.length){box.innerHTML='<p>Nenhuma atividade criada.</p>';return;}
    box.innerHTML=state.activities.slice().reverse().map(a=>`<article class="teacher-activity"><strong>${safe(a.title)}</strong><small>${safe(a.className)} • ${safe(a.toolName)} • ${safe(a.difficulty)} • ${a.xp} XP ${a.eduauthRequired?'• EduAuth':''}</small><p>${safe(a.instructions,500)}</p><input value="${activityLink(a)}" readonly aria-label="Link da atividade"><footer><button data-copy="${a.id}">Copiar link</button><button data-download="${a.id}">Baixar instruções</button><button data-delete="${a.id}">Excluir</button></footer></article>`).join('');
    box.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>{const a=state.activities.find(x=>x.id===b.dataset.copy);navigator.clipboard?.writeText(activityLink(a));ctx.toast?.('Link copiado.','success')});
    box.querySelectorAll('[data-download]').forEach(b=>b.onclick=()=>{const a=state.activities.find(x=>x.id===b.dataset.download);download(`atividade-${a.id}.json`,JSON.stringify({...a,link:activityLink(a)},null,2));});
    box.querySelectorAll('[data-delete]').forEach(b=>b.onclick=async()=>{const activity=state.activities.find(x=>x.id===b.dataset.delete);if(!activity)return;const allowed=await ctx.eduauth?.authorize?.({actionId:'teacher-activity-delete',resourceId:activity.id,resourceLabel:activity.title,classId:activity.className,subjectId:activity.subjectId||'desenvolvimento-de-sistemas',lessonId:activity.lessonId||'atividade-atual',activityId:'atividade-professor-local'});if(!allowed)return;state.activities=state.activities.filter(x=>x.id!==activity.id);await save();renderActivities();ctx.toast?.('Atividade excluída com autorização registrada.','success');});
  }
  function normalizeResult(obj,fileName='resultado.json'){
    const source=obj?.result||obj?.session||obj;
    return {id:uid(),fileName:safe(fileName,100),student:safe(source.studentName||source.student?.name||source.name||'Não identificado',100),className:safe(source.studentClass||source.student?.className||source.className||'',80),tool:safe(source.toolName||source.tool||source.lab||'',100),score:Number(source.score??source.percentage??source.progress??0)||0,xp:Number(source.xp??source.academicXP??0)||0,duration:Number(source.durationMs??source.duration??0)||0,errors:Array.isArray(source.errors)?source.errors.slice(0,30).map(e=>safe(e,180)):[],importedAt:new Date().toISOString()};
  }
  function renderResults(){
    const box=root.querySelector('#teacherResults');
    if(!state.results.length){box.innerHTML='<p>Nenhum resultado importado.</p>';return;}
    const rows=state.results.slice().reverse().map(r=>`<tr><td>${safe(r.student)}</td><td>${safe(r.className)}</td><td>${safe(r.tool)}</td><td>${r.score}</td><td>${r.xp}</td><td>${r.errors.length}</td></tr>`).join('');
    box.innerHTML=`<div style="overflow:auto"><table><thead><tr><th>Estudante</th><th>Turma</th><th>Laboratório</th><th>Resultado</th><th>XP</th><th>Erros</th></tr></thead><tbody>${rows}</tbody></table></div><p><b>Erros frequentes:</b> ${frequentErrors()}</p>`;
  }
  function frequentErrors(){const m=new Map();state.results.flatMap(r=>r.errors).forEach(e=>m.set(e,(m.get(e)||0)+1));return [...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([e,n])=>`${e} (${n})`).join('; ')||'nenhum registrado';}
  function bind(){
    root.querySelector('#teacherCreate').onclick=async()=>{
      const title=safe(root.querySelector('#teacherTitle').value,100),className=safe(root.querySelector('#teacherClass').value,60),toolId=root.querySelector('#teacherTool').value,instructions=safe(root.querySelector('#teacherInstructions').value,1800),classroomUrl=window.LABDS.Classroom?.normalizeUrl?.(root.querySelector('#teacherClassroomUrl').value)||'';
      if(!title||!instructions){ctx.toast?.('Informe título e instruções.','error');return;}
      const tool=window.LABDS.TOOLS.find(t=>t.id===toolId);state.classroomUrl=classroomUrl;state.activities.push({id:uid(),title,className,toolId,toolName:tool?.name||toolId,difficulty:root.querySelector('#teacherDifficulty').value,xp:Math.max(0,Math.min(500,Number(root.querySelector('#teacherXP').value)||0)),instructions,classroomUrl,subjectId:root.querySelector('#teacherSubject').value,lessonId:root.querySelector('#teacherLesson').value,eduauthRequired:root.querySelector('#teacherEduAuth').checked,eduauthAction:root.querySelector('#teacherEduAuthAction').value,createdAt:new Date().toISOString()});await save();renderActivities();ctx.toast?.('Atividade criada.','success');
    };
    root.querySelector('#teacherExportActivities').onclick=()=>download('atividades-lab-virtual-ds.json',JSON.stringify({schemaVersion:2,version:window.LABDS.VERSION,activities:state.activities},null,2));
    const input=root.querySelector('#teacherResultFile');root.querySelector('#teacherImportResults').onclick=()=>input.click();
    input.onchange=async()=>{let count=0;for(const file of [...input.files]){try{if(file.size>2*1024*1024)throw new Error('arquivo grande');const parsed=JSON.parse(await file.text());state.results.push(normalizeResult(parsed,file.name));count++;}catch(e){ctx.toast?.(`Não foi possível importar ${file.name}.`,'error')}}await save();renderResults();ctx.toast?.(`${count} resultado(s) importado(s).`,'success');input.value='';};
    root.querySelector('#teacherExportCsv').onclick=()=>{const head=['Estudante','Turma','Laboratório','Resultado','XP','Erros','Importado em'];const rows=state.results.map(r=>[r.student,r.className,r.tool,r.score,r.xp,r.errors.join(' | '),r.importedAt]);download('resultados-lab-virtual-ds.csv','\ufeff'+[head,...rows].map(row=>row.map(csvCell).join(';')).join('\n'),'text/csv;charset=utf-8');};
  }
  window.LABDS_LABS['teacher-lab']={
    async mount(container,context){ctx=context;root=container;const saved=await ctx.storage.get(KEY,initial());state=saved&&typeof saved==='object'?saved:initial();if(state.schemaVersion!==2)state={...initial(),...state,schemaVersion:2,activities:Array.isArray(state.activities)?state.activities.map(item=>({...item,eduauthRequired:Boolean(item.eduauthRequired),subjectId:item.subjectId||'desenvolvimento-de-sistemas',lessonId:item.lessonId||'atividade-atual'})):[]};state.classroomUrl=window.LABDS.Classroom?.normalizeUrl?.(state.classroomUrl)||'';await save();render();ctx.logEvent?.({eventType:'teacher',action:'Modo Professor aberto com EduAuth',status:'success',context:{activities:state.activities.length,results:state.results.length}});},
    unmount(){root=null;ctx=null;state=null;},
    help(){return '<h3>Modo Professor</h3><p>Crie atividades locais, compartilhe links, configure proteção EduAuth e importe resultados JSON. O acesso e as exclusões são vinculados à sessão; nenhuma senha fixa permanece no código.</p>';},
    exportState(){return state}
  };
})();
