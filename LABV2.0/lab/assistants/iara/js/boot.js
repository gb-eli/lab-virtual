'use strict';
(function(){
  const params=new URLSearchParams(location.search);
  const embedded=params.get('embed')==='1'&&window.parent!==window;
  const boot=Number(params.get('boot'))||0;
  let ready=false,lastDetail={routes:0,tools:0};
  function safe(value,max=260){return String(value??'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max);}
  function post(type,detail={}){if(!embedded)return;window.parent.postMessage({source:'iara-ds',type,detail:{...detail,boot}},location.origin);}
  function markReady(detail={}){ready=true;lastDetail={...detail,routes:Number(detail.routes)||0,tools:Number(detail.tools)||0,degraded:Boolean(detail.degraded)};post('ready',{...lastDetail,initialized:true});}
  function markError(error){const message=safe(error?.message||error||'Falha desconhecida ao iniciar a IARA.');const status=document.querySelector('#statusText');if(status)status.textContent=`Falha ao iniciar: ${message}`;post('error',{message});}
  window.__IARA_BOOT__={boot,embedded,get ready(){return ready;},markReady,markError,post};
  window.addEventListener('message',event=>{
    if(!embedded||event.source!==window.parent||event.origin!==location.origin)return;
    const data=event.data;if(!data||data.source!=='lab-virtual-ds')return;
    if(data.type==='ping')post(ready?'ready':'frame-loaded',ready?{...lastDetail,initialized:true}:{initialized:false});
  });
  window.addEventListener('error',event=>markError(event.error||event.message));
  window.addEventListener('unhandledrejection',event=>markError(event.reason));
  const announce=()=>post('frame-loaded',{initialized:false});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',announce,{once:true});else announce();
  let attempts=0;const timer=setInterval(()=>{if(ready||attempts++>24){clearInterval(timer);return;}announce();},500);
})();
