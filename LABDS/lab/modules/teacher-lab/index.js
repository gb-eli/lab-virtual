'use strict';
(function(){
  window.LABDS_LABS=window.LABDS_LABS||{};
  let root=null;
  function mount(host){
    root=host;
    root.innerHTML='<section class="v3-module"><div class="state-card warning"><strong>Módulo removido da versão pública</strong><p>O antigo “Modo Professor e Atividades” foi desativado porque uma aplicação estática não consegue comprovar a identidade do professor nem a autoria de uma atividade. Use somente atividades publicadas pelos canais oficiais da escola.</p></div></section>';
  }
  function unmount(){if(root)root.textContent='';root=null;}
  function exportPayload(){return{text:'Módulo removido da versão pública.',native:'',backup:{removed:true}};}
  function help(){return'<p>Este módulo foi removido por segurança e coerência pedagógica.</p>';}
  window.LABDS_LABS['teacher-lab']={mount,unmount,exportPayload,help,removed:true};
})();
