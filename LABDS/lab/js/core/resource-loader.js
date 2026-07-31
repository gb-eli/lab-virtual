'use strict';
(function(){
  window.LABDS=window.LABDS||{};
  const loadedScripts=new Map(),loadedStyles=new Map(),loadedBundles=new Map(),manifestCache=new Map();
  const metrics=[];
  const BUNDLES={
    eduauth:{scripts:['js/eduauth/eduauth.js'],styles:['css/eduauth.css'],afterLoad:()=>window.LABDS.EduAuth?.init?.()},
    shell:{scripts:['js/v3/shell.js'],styles:[]},
    export:{scripts:['js/exporter.js','js/session-exporter.js','js/classroom.js'],styles:[]},
    network:{scripts:['js/terminal/network-engine.js'],styles:[]},
    terminal:{scripts:['js/terminal/command-catalog.js','js/terminal/command-matrix.js','js/terminal/fs.js','js/terminal/network-engine.js','js/terminal/shells.js','js/terminal/terminal-controller.js'],styles:[]},
    learning:{scripts:['js/learning-content.js','js/learning-mode.js'],styles:['css/accessibility-learning.css'],afterLoad:()=>window.LABDS.Learning?.init?.()},
    effects:{scripts:['js/ui-effects.js'],styles:['css/v8-design.css']}
  };
  const now=()=>globalThis.performance?.now?.()||Date.now();
  function record(type,id,start,ok=true,extra={}){metrics.push({type,id,durationMs:Math.round((now()-start)*10)/10,ok,at:new Date().toISOString(),...extra});if(metrics.length>120)metrics.splice(0,metrics.length-120);}
  function loadScript(src,{timeout=30000,module=false}={}){
    if(loadedScripts.has(src))return loadedScripts.get(src);
    const existing=[...document.scripts].find(node=>node.src&&new URL(node.src,location.href).href===new URL(src,location.href).href);
    if(existing){const ready=Promise.resolve(existing);loadedScripts.set(src,ready);return ready;}
    const start=now();
    const task=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src=src;script.async=true;if(module)script.type='module';script.dataset.labdsResource=src;
      const timer=setTimeout(()=>{script.remove();reject(new Error(`Tempo excedido ao carregar ${src}.`));},timeout);
      script.onload=()=>{clearTimeout(timer);record('script',src,start,true);resolve(script);};
      script.onerror=()=>{clearTimeout(timer);record('script',src,start,false);loadedScripts.delete(src);reject(new Error(`Não foi possível carregar ${src}.`));};
      document.head.appendChild(script);
    });loadedScripts.set(src,task);return task;
  }
  function loadStyle(href,{timeout=20000,scope='global'}={}){
    if(loadedStyles.has(href))return loadedStyles.get(href);
    const existing=[...document.querySelectorAll('link[rel="stylesheet"]')].find(node=>node.href&&new URL(node.href,location.href).href===new URL(href,location.href).href);
    if(existing){const ready=Promise.resolve(existing);loadedStyles.set(href,ready);return ready;}
    const start=now();
    const task=new Promise((resolve,reject)=>{
      const link=document.createElement('link');link.rel='stylesheet';link.href=href;link.dataset.labdsResource=href;link.dataset.labdsScope=scope;
      const timer=setTimeout(()=>{link.remove();reject(new Error(`Tempo excedido ao carregar ${href}.`));},timeout);
      link.onload=()=>{clearTimeout(timer);record('style',href,start,true,{scope});resolve(link);};
      link.onerror=()=>{clearTimeout(timer);record('style',href,start,false,{scope});loadedStyles.delete(href);reject(new Error(`Não foi possível carregar ${href}.`));};
      document.head.appendChild(link);
    });loadedStyles.set(href,task);return task;
  }
  async function loadBundle(name){
    if(loadedBundles.has(name))return loadedBundles.get(name);
    const def=BUNDLES[name];if(!def)throw new Error(`Pacote desconhecido: ${name}`);
    const start=now();
    const task=(async()=>{for(const href of def.styles||[])await loadStyle(href,{scope:`bundle:${name}`});for(const src of def.scripts||[])await loadScript(src);await def.afterLoad?.();record('bundle',name,start,true);return true;})().catch(error=>{loadedBundles.delete(name);record('bundle',name,start,false);throw error;});
    loadedBundles.set(name,task);return task;
  }
  async function loadManifest(moduleName){
    if(manifestCache.has(moduleName))return manifestCache.get(moduleName);
    const fallback={id:moduleName,version:'1',weight:'medium',load:'on-demand',scripts:[`modules/${moduleName}/index.js`],styles:[],bundles:[]};
    const task=(async()=>{try{const response=await fetch(`modules/${encodeURIComponent(moduleName)}/module.json`,{cache:'no-cache'});if(!response.ok)throw new Error(String(response.status));const data=await response.json();return{...fallback,...data,id:moduleName};}catch{return fallback;}})();
    manifestCache.set(moduleName,task);return task;
  }
  async function loadModule(moduleName,tool={}){
    if(window.LABDS_LABS?.[moduleName])return window.LABDS_LABS[moduleName];
    const start=now(),manifest=await loadManifest(moduleName);
    document.dispatchEvent(new CustomEvent('labds:moduleloadstart',{detail:{moduleName,manifest,tool}}));
    try{
      for(const bundle of manifest.bundles||[])await loadBundle(bundle);
      await Promise.all((manifest.styles||[]).map(href=>loadStyle(href,{scope:`module:${moduleName}`})));
      for(const src of manifest.scripts||[])await loadScript(src,{timeout:manifest.timeoutMs||45000});
      const lab=window.LABDS_LABS?.[moduleName];if(!lab)throw new Error(`O módulo ${moduleName} não registrou uma interface válida.`);
      record('module',moduleName,start,true,{weight:manifest.weight||'medium'});
      document.dispatchEvent(new CustomEvent('labds:moduleloadend',{detail:{moduleName,manifest,tool,durationMs:Math.round(now()-start)}}));
      return lab;
    }catch(error){record('module',moduleName,start,false,{weight:manifest.weight||'medium'});document.dispatchEvent(new CustomEvent('labds:moduleloaderror',{detail:{moduleName,manifest,tool,error}}));throw error;}
  }
  function unloadModuleStyles(moduleName){
    document.querySelectorAll('link[data-labds-scope]').forEach(link=>{if(link.dataset.labdsScope!==`module:${moduleName}`)return;loadedStyles.delete(link.dataset.labdsResource||link.getAttribute('href'));link.remove();});
  }
  function getMetrics(){return metrics.map(item=>({...item}));}
  function getState(){return{scripts:[...loadedScripts.keys()],styles:[...loadedStyles.keys()],bundles:[...loadedBundles.keys()],manifests:[...manifestCache.keys()],metrics:getMetrics()};}
  window.LABDS.ResourceLoader={loadScript,loadStyle,loadBundle,loadManifest,loadModule,unloadModuleStyles,getMetrics,getState,BUNDLES};
})();
