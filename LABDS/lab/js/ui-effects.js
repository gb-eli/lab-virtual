'use strict';
(function(){
  const coarse=matchMedia('(pointer:coarse)').matches;
  if(!coarse){
    let raf=0,x=-300,y=-300;
    addEventListener('pointermove',event=>{x=event.clientX;y=event.clientY;if(raf)return;raf=requestAnimationFrame(()=>{document.documentElement.style.setProperty('--pointer-x',`${x}px`);document.documentElement.style.setProperty('--pointer-y',`${y}px`);raf=0;});},{passive:true});
  }
  const bind=()=>document.querySelectorAll('[data-open-tool]').forEach(button=>button.addEventListener('click',()=>window.LABDS?.App?.openTool?.(button.dataset.openTool)));
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
