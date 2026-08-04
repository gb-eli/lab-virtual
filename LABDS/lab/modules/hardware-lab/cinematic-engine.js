'use strict';
(function(global){
  const VERSION='1.0.0';
  const SPEEDS={slow:.55,normal:1,fast:1.75};
  const SHOTS=[
    {id:'overview',label:'Visão geral do ambiente',yaw:-.78,pitch:.38,distance:1.08,target:[0,0,0],duration:5.2},
    {id:'front',label:'Frente do computador',yaw:0,pitch:.15,distance:.82,target:[-.18,.25,.2],duration:4.2},
    {id:'side',label:'Painel lateral e interior',yaw:-Math.PI/2,pitch:.2,distance:.72,target:[-.15,.15,0],duration:4.8},
    {id:'cpu',label:'Processador e memória',yaw:-1.18,pitch:.32,distance:.58,target:[-.9,.45,-.15],duration:4.2},
    {id:'gpu',label:'Placa de vídeo',yaw:-1.34,pitch:.12,distance:.58,target:[.2,-.55,.1],duration:4.2},
    {id:'cooling',label:'Refrigeração e airflow',yaw:.86,pitch:.5,distance:.72,target:[0,.65,.2],duration:4.4},
    {id:'rear',label:'Conexões traseiras',yaw:Math.PI,pitch:.14,distance:.74,target:[0,.05,-.25],duration:4.3},
    {id:'displays',label:'Monitores e periféricos',yaw:.22,pitch:.26,distance:.98,target:[2.2,.3,.2],duration:5},
    {id:'hero',label:'Plano final do setup',yaw:-.62,pitch:.28,distance:1.02,target:[.7,.15,.1],duration:5.4}
  ];
  function normalize(raw={}){return{active:Boolean(raw.active),playing:Boolean(raw.playing),shot:Math.max(0,Math.min(SHOTS.length-1,Math.round(Number(raw.shot)||0))),elapsed:Math.max(0,Number(raw.elapsed)||0),speed:SPEEDS[raw.speed]?raw.speed:'normal',hideUi:Boolean(raw.hideUi),loop:raw.loop!==false};}
  function current(state){return SHOTS[Math.max(0,Math.min(SHOTS.length-1,state.shot||0))];}
  function start(state){state.active=true;state.playing=true;state.elapsed=0;return state;}
  function stop(state){state.active=false;state.playing=false;state.elapsed=0;state.shot=0;return state;}
  function pause(state){state.playing=false;return state;}
  function next(state){state.shot=(state.shot+1)%SHOTS.length;state.elapsed=0;return state;}
  function previous(state){state.shot=(state.shot-1+SHOTS.length)%SHOTS.length;state.elapsed=0;return state;}
  function tick(state,dt){if(!state.active||!state.playing)return{changed:false,shot:current(state),progress:0};const shot=current(state),speed=SPEEDS[state.speed]||1;state.elapsed+=Math.max(0,dt)*speed;let changed=false;if(state.elapsed>=shot.duration){state.elapsed=0;if(state.shot>=SHOTS.length-1){if(state.loop)state.shot=0;else{state.playing=false;state.shot=SHOTS.length-1;}}else state.shot++;changed=true;}const active=current(state);return{changed,shot:active,progress:Math.min(1,state.elapsed/active.duration)};}
  function cameraPose(state,layout){const shot=current(state),baseTarget=layout?.camera?.target||[0,0,0],radius=layout?.camera?.radius||15,distance=Math.max(layout?.camera?.minDistance||8,radius*shot.distance),target=[baseTarget[0]+shot.target[0],baseTarget[1]+shot.target[1],baseTarget[2]+shot.target[2]];return{yaw:shot.yaw,pitch:shot.pitch,distance,target,label:shot.label};}
  global.LABDS_HARDWARE_CINEMATIC={VERSION,SPEEDS,SHOTS,normalize,current,start,stop,pause,next,previous,tick,cameraPose};
})(window);
