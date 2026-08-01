'use strict';
(function(){
  window.LABDS_LABS=window.LABDS_LABS||{};
  let root=null;
  function mount(host){
    root=host;
    root.innerHTML='<section class="v3-module"><div class="state-card warning"><strong>Módulo indisponível</strong><p>O “Modo Professor e Atividades” foi removido da versão pública. Este arquivo existe somente para neutralizar links e caches antigos; não há painel, autenticação, criação de atividades, importação ou exportação.</p><button type="button" class="btn primary" data-return-home>Voltar à página inicial</button></div></section>';
    root.querySelector('[data-return-home]')?.addEventListener('click',()=>window.LABDS?.App?.goHome?.());
  }
  function unmount(){if(root)root.textContent='';root=null;}
  function exportPayload(){return{text:'Módulo removido da versão pública.',native:'',backup:{removed:true}};}
  function help(){return'<p>Módulo definitivamente indisponível na versão pública.</p>';}
  window.LABDS_LABS['teacher-lab']={mount,unmount,exportPayload,help,removed:true};
})();
