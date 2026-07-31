'use strict';
(function(){
  window.LABDS=window.LABDS||{};
  let current=null,idleStarted=false,runtimeOverride=null,lastFps=null,monitoring=false;
  function deviceProfile(){
    const memory=Number(navigator.deviceMemory||0),cores=Number(navigator.hardwareConcurrency||0),connection=navigator.connection||{},saveData=Boolean(connection.saveData),effectiveType=String(connection.effectiveType||''),mobile=matchMedia('(pointer:coarse)').matches||innerWidth<720;
    let tier='balanced';
    if(saveData||['slow-2g','2g'].includes(effectiveType)||(memory&&memory<=2)||(cores&&cores<=2))tier='economy';
    else if((memory>=8&&cores>=8)&&!mobile)tier='quality';
    return{memory,cores,saveData,effectiveType,mobile,tier};
  }
  function resolve(graphics='auto'){
    const device=deviceProfile();let profile=device.tier;
    if(['economy','low'].includes(graphics))profile='economy';
    else if(graphics==='medium')profile='balanced';
    else if(['high','ultra'].includes(graphics))profile='quality';
    else if(graphics==='auto'&&runtimeOverride)profile=runtimeOverride;
    return{...device,graphics,profile,prefetch:profile==='quality',idleDelay:profile==='economy'?3500:profile==='balanced'?1700:650,maxConcurrent:profile==='economy'?1:profile==='balanced'?2:4,fps:lastFps};
  }
  function apply(graphics){
    current=resolve(graphics||window.LABDS.Core?.getSnapshot?.()?.settings?.graphics||'auto');
    const root=document.documentElement;root.dataset.performance=current.profile;root.dataset.loaderConcurrency=String(current.maxConcurrent);root.classList.toggle('performance-economy',current.profile==='economy');root.classList.toggle('performance-quality',current.profile==='quality');
    document.dispatchEvent(new CustomEvent('labds:performancechange',{detail:{...current}}));return{...current};
  }
  function schedule(callback,delay){if('requestIdleCallback'in window)return requestIdleCallback(callback,{timeout:Math.max(2000,delay+1500)});return setTimeout(callback,delay);}
  function monitorFrames(durationMs=3200){
    if(monitoring||document.hidden||typeof requestAnimationFrame!=='function')return Promise.resolve(lastFps);monitoring=true;
    return new Promise(resolve=>{let start=0,frames=0;const tick=time=>{if(!start)start=time;frames++;if(time-start<durationMs){requestAnimationFrame(tick);return;}lastFps=Math.round(frames/((time-start)/1000));monitoring=false;const graphics=window.LABDS.Core?.getSnapshot?.()?.settings?.graphics||'auto';if(graphics==='auto'){runtimeOverride=lastFps<30?'economy':lastFps<48?'balanced':null;apply('auto');}resolve(lastFps);};requestAnimationFrame(tick);});
  }
  function startIdleWarmup(){
    if(idleStarted)return;idleStarted=true;const profile=apply();
    schedule(async()=>{try{const latest=apply();if(latest.profile==='economy'){monitorFrames(1800);return;}await window.LABDS.ResourceLoader?.loadBundle?.('shell');if(latest.profile==='quality'){await window.LABDS.ResourceLoader?.loadBundle?.('effects');await window.LABDS.ResourceLoader?.loadBundle?.('learning');}else schedule(()=>window.LABDS.ResourceLoader?.loadBundle?.('effects').catch(()=>{}),1200);monitorFrames();}catch(error){console.warn('[Lab DS] aquecimento opcional não concluído:',error);}},profile.idleDelay);
    document.addEventListener('labds:toolopen',()=>schedule(()=>monitorFrames(2200),500));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule(()=>monitorFrames(1800),700);});
  }
  function resetAutoTuning(){runtimeOverride=null;lastFps=null;return apply();}
  function getSnapshot(){return{...(current||resolve()),runtimeOverride,resources:window.LABDS.ResourceLoader?.getState?.()||null};}
  window.LABDS.PerformanceManager={deviceProfile,resolve,apply,applyFromCore:()=>apply(),startIdleWarmup,monitorFrames,resetAutoTuning,getSnapshot};
})();
