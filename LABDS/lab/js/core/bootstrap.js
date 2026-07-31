'use strict';
(function(){
  window.LABDS=window.LABDS||{};
  const CRITICAL_STYLES=['css/style.css','css/session.css','css/performance.css','css/v3.css','css/v32.css'];
  const CRITICAL_SCRIPTS=['js/config.js','js/schemas.js','js/storage.js','js/session.js','js/v3/core.js','js/accessibility.js','js/app.js'];
  function style(href){return new Promise((resolve,reject)=>{if([...document.styleSheets].some(sheet=>sheet.href&&sheet.href.endsWith(href)))return resolve();const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.onload=resolve;link.onerror=reject;document.head.appendChild(link);});}
  function script(src){return new Promise((resolve,reject)=>{const node=document.createElement('script');node.src=src;node.async=true;node.onload=resolve;node.onerror=()=>reject(new Error(`Falha ao carregar ${src}`));document.head.appendChild(node);});}
  async function boot(){
    const started=performance.now();document.documentElement.dataset.boot='loading';
    try{
      await Promise.all(CRITICAL_STYLES.map(style));
      await script('js/core/resource-loader.js');await script('js/core/performance-manager.js');
      for(const src of CRITICAL_SCRIPTS)await script(src);
      document.documentElement.dataset.boot='ready';
      window.LABDS.BOOT_METRICS={startedAt:new Date().toISOString(),criticalMs:Math.round(performance.now()-started),criticalStyles:CRITICAL_STYLES.length,criticalScripts:CRITICAL_SCRIPTS.length};
      window.LABDS.PerformanceManager?.startIdleWarmup?.();
    }catch(error){document.documentElement.dataset.boot='error';console.error('[Lab DS] falha de inicialização',error);const region=document.querySelector('#toastRegion')||document.body;const message=document.createElement('div');message.className='boot-error';message.textContent='Não foi possível iniciar todos os componentes. Recarregue a página ou limpe o cache do site.';region.appendChild(message);}
  }
  boot();
})();
