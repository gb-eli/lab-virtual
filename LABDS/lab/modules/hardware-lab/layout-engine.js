'use strict';
(function(global){
  // LABDS_LABS: motor auxiliar carregado antes do módulo principal.
  const VERSION='1.1.0';
  const PERIPHERAL_API=global.LABDS_HARDWARE_PERIPHERALS;
  const EPSILON=.035;
  const DEFAULT_CASE={width:6.9,height:7.25,depth:7.35};

  const number=(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback;
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,number(value,min)));
  const round=(value,digits=2)=>Number(number(value).toFixed(digits));
  const vec=(x=0,y=0,z=0)=>[round(x),round(y),round(z)];

  function parseInches(item){
    const match=String(item?.label||'').match(/(\d{2}(?:[.,]\d+)?)\s*[″"]/u);
    return clamp(match?Number(match[1].replace(',','.')):24,15,57);
  }

  function aspectRatio(item){
    const width=Math.max(1,number(item?.res?.[0],1920));
    const height=Math.max(1,number(item?.res?.[1],1080));
    const raw=width/height;
    return clamp(raw,1.25,3.8);
  }

  function monitorGeometry(item,orientation='landscape'){
    if(PERIPHERAL_API?.monitorGeometry)return PERIPHERAL_API.monitorGeometry(item,orientation);
    if(!item||item.connector===null||item.label==='Sem monitor')return{width:0,height:0,depth:0,screenWidth:0,screenHeight:0,standHeight:0,inches:0,aspect:16/9,orientation};
    const inches=parseInches(item),aspect=aspectRatio(item);
    const diagonal=5.74*(inches/24);
    let screenWidth=diagonal*aspect/Math.sqrt(aspect*aspect+1),screenHeight=diagonal/Math.sqrt(aspect*aspect+1);
    if(orientation==='portrait')[screenWidth,screenHeight]=[screenHeight,screenWidth];
    const bezel=clamp(.12+(inches-24)*.002,.11,.19),standHeight=clamp(screenHeight*.43,.9,1.55);
    return{inches,aspect,orientation,width:round(screenWidth+bezel*2),height:round(screenHeight+bezel*2),depth:round(aspect>2.1?1.35:1.18),screenWidth:round(screenWidth),screenHeight:round(screenHeight),standHeight:round(standHeight),bezel:round(bezel)};
  }

  function box(id,size,position,role='object',meta={}){
    const safeSize=size.map(value=>Math.max(.01,number(value,.01)));
    const safePosition=position.map(value=>number(value,0));
    return{id,role,size:safeSize.map(value=>round(value)),position:safePosition.map(value=>round(value)),rotation:meta.rotation||[0,0,0],surface:meta.surface||'desk',allowOverlapWith:meta.allowOverlapWith||[],meta};
  }

  function bounds(item,padding=0){
    const [w,h,d]=item.size,[x,y,z]=item.position,p=number(padding,0);
    return{minX:x-w/2-p,maxX:x+w/2+p,minY:y-h/2-p,maxY:y+h/2+p,minZ:z-d/2-p,maxZ:z+d/2+p};
  }

  function overlaps(a,b,padding=EPSILON){
    const A=bounds(a,padding),B=bounds(b,padding);
    return A.minX<B.maxX&&A.maxX>B.minX&&A.minY<B.maxY&&A.maxY>B.minY&&A.minZ<B.maxZ&&A.maxZ>B.minZ;
  }

  function insideSurface(item,surface,margin=.06){
    const itemBounds=bounds(item),surfaceBounds=bounds(surface);
    return itemBounds.minX>=surfaceBounds.minX+margin&&itemBounds.maxX<=surfaceBounds.maxX-margin&&itemBounds.minZ>=surfaceBounds.minZ+margin&&itemBounds.maxZ<=surfaceBounds.maxZ-margin;
  }

  function supported(item,surface,tolerance=.08){
    const itemBottom=bounds(item).minY,surfaceTop=bounds(surface).maxY;
    return Math.abs(itemBottom-surfaceTop)<=tolerance;
  }

  function resolveCaseGeometry(item){
    const scene=item?.scene;
    if(Array.isArray(scene)&&scene.length===3)return{width:number(scene[0],DEFAULT_CASE.width),height:number(scene[1],DEFAULT_CASE.height),depth:number(scene[2],DEFAULT_CASE.depth)};
    return{...DEFAULT_CASE};
  }

  function calculate(input={}){
    const caseGeometry=input.caseGeometry||resolveCaseGeometry(input.caseItem),state=input.state||{};
    const previewPlan=PERIPHERAL_API?.buildMonitorPlan?.({primary:input.monitor,secondary:input.monitor2,tertiary:input.monitor3,state,deskTopY:0,centerX:0,z:-.18})||null;
    const fallbackMonitor=monitorGeometry(input.monitor),hasMonitor=previewPlan?previewPlan.items.length>0:fallbackMonitor.width>0;
    const monitorFootprint=previewPlan?.width||fallbackMonitor.width,monitorHeight=previewPlan?.height||fallbackMonitor.screenHeight;
    const hasPrinter=input.printer&&input.printer.type!=='—'&&input.printer.label!=='Sem impressora';
    const hasKeyboard=input.keyboard&&input.keyboard.label!=='Sem teclado';
    const hasMouse=input.mouse&&input.mouse.label!=='Sem mouse';
    const audioType=String(input.audio?.type||'—');
    const hasAudio=input.audio&&input.audio.label!=='Sem áudio';
    const hasWebcam=input.webcam&&input.webcam.label!=='Sem webcam'&&hasMonitor;
    const desktopSpeakers=hasAudio&&!audioType.includes('Headset')&&!audioType.includes('Criação');
    const hasController=input.controller&&input.controller.label!=='Sem controle';
    const controllerType=String(input.controller?.type||'Gamepad');
    let controllerSize=[1.65,.34,1.12];
    if(controllerType.includes('automobilística'))controllerSize=[2.5,1.45,1.65];
    else if(controllerType.includes('voo'))controllerSize=[1.9,1.7,1.5];
    else if(controllerType.includes('Arcade'))controllerSize=[2.2,.7,1.45];
    else if(controllerType.includes('Realidade'))controllerSize=[1.9,.72,1.15];
    const controllerReplacesFrontKeyboard=hasController&&(controllerType.includes('automobilística')||controllerType.includes('Arcade'));
    const controllerUsesSideZone=hasController&&controllerType.includes('voo');
    const hasUps=input.ups&&number(input.ups.watts,0)>0;

    const deskTopY=round(-caseGeometry.height/2-.025),floorY=round(deskTopY-2.7),left=-caseGeometry.width/2-.85;
    const monitorGap=hasMonitor?(desktopSpeakers?1.25:.72):0,monitorCenterX=hasMonitor?caseGeometry.width/2+monitorGap+monitorFootprint/2:caseGeometry.width/2+1;
    const keyboardWidth=input.keyboard?.type?.includes('dividido')?5.15:input.keyboard?.type==='Ergonômico'?4.75:input.keyboard?.type?.includes('compacto')?3.5:input.keyboard?.type?.includes('full size')?4.65:4.15;
    const keyboardX=hasMonitor?monitorCenterX-.15:caseGeometry.width/2+2.7,mouseWidth=.78,mouseDesiredX=keyboardX+keyboardWidth/2+.75,printerWidth=hasPrinter?3:0;
    const controllerSideRight=controllerUsesSideZone?mouseDesiredX+mouseWidth/2+controllerSize[0]+.7:0;
    const monitorRight=hasMonitor?monitorCenterX+monitorFootprint/2:0;
    const rightRequired=Math.max(caseGeometry.width/2+.8,hasMonitor?monitorRight+(desktopSpeakers?1.35:.85):0,hasPrinter?(hasMonitor?monitorRight+.65:caseGeometry.width/2+.65)+printerWidth+.85:0,hasKeyboard?keyboardX+keyboardWidth/2+.42:0,hasMouse?mouseDesiredX+mouseWidth/2+.35:0,controllerSideRight);
    const deskRight=Math.max(9.2,rightRequired),deskWidth=round(deskRight-left),deskDepth=round(Math.max(9.1,caseGeometry.depth+1.2)),deskCenterX=round((left+deskRight)/2),deskCenterZ=.15;
    const desk=box('desk',[deskWidth,.46,deskDepth],[deskCenterX,deskTopY-.23,deskCenterZ],'surface',{surface:'floor'}),floor=box('floor',[Math.max(30,deskWidth+12),.12,Math.max(23,deskDepth+12)],[deskCenterX,floorY-.06,0],'surface',{surface:'world'}),objects=[];
    objects.push(box('case',[caseGeometry.width,caseGeometry.height,caseGeometry.depth],[0,deskTopY+caseGeometry.height/2+.02,0],'computer'));

    const monitorPlan=PERIPHERAL_API?.buildMonitorPlan?.({primary:input.monitor,secondary:input.monitor2,tertiary:input.monitor3,state,deskTopY,centerX:monitorCenterX,z:-.18})||null;
    if(monitorPlan?.objects?.length)objects.push(...monitorPlan.objects);
    else if(hasMonitor){
      const baseDepth=fallbackMonitor.depth,baseWidth=clamp(fallbackMonitor.width*.43,1.9,3.15);
      const base=box('monitor-base-1',[baseWidth,.18,baseDepth],[monitorCenterX,deskTopY+.1,-.18],'monitor',{kind:'base'}),neckY=deskTopY+.18+fallbackMonitor.standHeight/2;
      const neck=box('monitor-neck-1',[.34,fallbackMonitor.standHeight,.34],[monitorCenterX,neckY,-.18],'monitor',{surface:'monitor',kind:'neck'}),screenY=deskTopY+.18+fallbackMonitor.standHeight+fallbackMonitor.screenHeight/2+.14;
      const screen=box('monitor-screen-1',[fallbackMonitor.width,fallbackMonitor.screenHeight+.24,.24],[monitorCenterX,screenY,-.18],'monitor',{surface:'monitor',kind:'screen',item:input.monitor,geometry:fallbackMonitor});objects.push(base,neck,screen);
    }

    const keyboardZ=controllerReplacesFrontKeyboard?1.62:2.45,mouseZ=controllerReplacesFrontKeyboard?1.55:2.38;
    if(hasKeyboard)objects.push(box('keyboard',[keyboardWidth,.22,1.28],[keyboardX,deskTopY+.12,keyboardZ],'peripheral'));
    if(hasMouse){const mouseX=clamp(mouseDesiredX,left+.65,deskRight-.65);objects.push(box('mouse',[mouseWidth,.25,1.08],[mouseX,deskTopY+.135,mouseZ],'peripheral'));}

    if(hasAudio){
      if(audioType.includes('Headset')||audioType.includes('Criação')){
        const standX=clamp(deskRight-1.05,left+1,deskRight-1.05);objects.push(box('headset-stand',[.55,1.8,.65],[standX,deskTopY+.91,1.35],'peripheral'));objects.push(box('headset',[1.25,1.12,.55],[standX,deskTopY+1.55,1.35],'peripheral',{surface:'stand',allowOverlapWith:['headset-stand']}));
        if(audioType.includes('Criação'))objects.push(box('microphone',[.55,1.65,.55],[standX-1.15,deskTopY+.83,1.15],'peripheral'));
      }else if(audioType.includes('Soundbar')&&hasMonitor){
        objects.push(box('soundbar',[Math.min(4.8,Math.max(2.8,monitorFootprint*.52)),.42,.48],[monitorCenterX,deskTopY+.22,.72],'peripheral'));
      }else if(hasMonitor){
        const speakerOffset=Math.max(1.4,monitorFootprint/2+.52);objects.push(box('speaker-left',[.72,1.75,.72],[monitorCenterX-speakerOffset,deskTopY+.885,.58],'peripheral'));objects.push(box('speaker-right',[.72,1.75,.72],[monitorCenterX+speakerOffset,deskTopY+.885,.58],'peripheral'));
      }
    }

    if(hasWebcam&&hasMonitor){
      const screens=objects.filter(item=>item.meta?.kind==='screen'),primaryScreen=screens.sort((a,b)=>bounds(b).maxY-bounds(a).maxY)[0];
      if(primaryScreen){const webcamY=bounds(primaryScreen).maxY+.2;objects.push(box('webcam',[1.05,.32,.36],[primaryScreen.position[0],webcamY,primaryScreen.position[2]+.2],'peripheral',{surface:'monitor',allowOverlapWith:objects.filter(item=>item.role==='monitor').map(item=>item.id)}));}
    }
    if(hasPrinter){const printerX=deskRight-printerWidth/2-.55;objects.push(box('printer',[printerWidth,1.6,2.5],[printerX,deskTopY+.81,-2.45],'peripheral'));}
    if(hasController){
      const frontZ=deskDepth/2+deskCenterZ-controllerSize[2]/2-.18;
      let controllerX=hasMonitor?monitorCenterX-monitorFootprint/2+.9:caseGeometry.width/2+1.45;
      if(controllerReplacesFrontKeyboard)controllerX=keyboardX;
      else if(controllerUsesSideZone)controllerX=mouseDesiredX+mouseWidth/2+controllerSize[0]/2+.35;
      controllerX=clamp(controllerX,left+controllerSize[0]/2+.12,deskRight-controllerSize[0]/2-.12);
      objects.push(box('controller',controllerSize,[controllerX,deskTopY+controllerSize[1]/2+.02,frontZ],'peripheral',{controllerType,zone:controllerReplacesFrontKeyboard?'front-center':controllerUsesSideZone?'right-side':'front-left'}));
    }
    if(hasUps){const upsHeight=1.65;objects.push(box('ups',[1.8,upsHeight,1.55],[0,floorY+upsHeight/2+.02,2.45],'peripheral',{surface:'floor'}));}

    const legHeight=Math.max(.9,deskTopY-floorY-.45),legY=floorY+legHeight/2+.02,legX=[left+.5,deskRight-.5],legZ=[-deskDepth/2+.55,deskDepth/2-.55],supports=[];
    for(const x of legX)for(const z of legZ)supports.push(box(`desk-leg-${supports.length+1}`,[.42,legHeight,.52],[x,legY,z],'support',{surface:'floor'}));

    const warnings=[],errors=[];
    for(const item of objects){const surface=item.meta.surface==='floor'?floor:desk;if(['monitor','stand'].includes(item.meta.surface))continue;if(!insideSurface(item,surface,item.meta.surface==='floor'?.1:.04))errors.push(`${item.id}: fora dos limites da ${item.meta.surface==='floor'?'área de piso':'bancada'}.`);if(!supported(item,surface,item.meta.surface==='floor'?.11:.1))errors.push(`${item.id}: sem apoio físico correto.`);}
    for(let i=0;i<objects.length;i++)for(let j=i+1;j<objects.length;j++){const a=objects[i],b=objects[j],allowed=a.allowOverlapWith.includes(b.id)||b.allowOverlapWith.includes(a.id)||(a.role==='monitor'&&b.role==='monitor');if(!allowed&&overlaps(a,b,.01))errors.push(`${a.id} colide com ${b.id}.`);}
    if(monitorFootprint>7.3)warnings.push('Conjunto de telas largo: a bancada e a distância da câmera foram ampliadas automaticamente.');
    if((monitorPlan?.items?.length||0)>=3)warnings.push('Setup com três telas requer suporte e distância ergonômica adequados.');
    if(caseGeometry.width>8.2)warnings.push('Gabinete/open bench largo: área de trabalho foi ampliada automaticamente.');
    if(hasPrinter)warnings.push('Impressora posicionada na zona traseira dedicada da bancada.');

    const setupHeight=Math.max(caseGeometry.height,monitorHeight+2.8,...objects.map(item=>bounds(item).maxY-deskTopY)),targetX=round((left+deskRight)/2-.2),radius=Math.sqrt((deskWidth/2)**2+(Math.max(setupHeight,6)/2)**2+(deskDepth/2)**2),minDistance=round(clamp(radius*.78,9,22)),maxDistance=round(clamp(radius*2.35,28,58));
    const camera={target:vec(targetX,deskTopY+Math.min(3.2,setupHeight*.42),0),radius:round(radius),minDistance,maxDistance,minPitch:-.08,maxPitch:1.18};
    return{version:VERSION,safe:errors.length===0,status:errors.length?'Correções necessárias':warnings.length?'Seguro com recomendações':'Setup fisicamente seguro',desk:{...desk,topY:deskTopY,left:round(left),right:round(deskRight),front:round(deskDepth/2+deskCenterZ),back:round(-deskDepth/2+deskCenterZ)},floor,supports,objects,monitor:fallbackMonitor,monitorPlan,caseGeometry,camera,errors:[...new Set(errors)],warnings:[...new Set(warnings)],summary:{objects:objects.length,monitors:monitorPlan?.items?.length||Number(hasMonitor),monitorLayout:monitorPlan?.monitorLayout||'single',monitorMount:monitorPlan?.monitorMount||'stock',collisions:errors.filter(item=>item.includes('colide')).length,unsupported:errors.filter(item=>item.includes('apoio')).length,outOfBounds:errors.filter(item=>item.includes('limites')).length,deskWidth,deskDepth,deskTopY,floorY}};
  }

  function clampCameraDistance(layout,value){
    const min=layout?.camera?.minDistance||9,max=layout?.camera?.maxDistance||32;
    return clamp(value,min,max);
  }

  function clampCameraPitch(layout,value){
    const min=layout?.camera?.minPitch??-.08,max=layout?.camera?.maxPitch??1.18;
    return clamp(value,min,max);
  }

  global.LABDS_HARDWARE_LAYOUT={VERSION,calculate,monitorGeometry,bounds,overlaps,insideSurface,supported,clampCameraDistance,clampCameraPitch};
})(window);
