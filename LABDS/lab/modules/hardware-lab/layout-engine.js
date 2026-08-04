'use strict';
(function(global){
  // LABDS_LABS: motor auxiliar carregado antes do módulo principal.
  const VERSION='1.0.0';
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

  function monitorGeometry(item){
    if(!item||item.connector===null||item.label==='Sem monitor')return{width:0,height:0,depth:0,screenWidth:0,screenHeight:0,standHeight:0,inches:0,aspect:16/9};
    const inches=parseInches(item),aspect=aspectRatio(item);
    const diagonal=5.74*(inches/24);
    const screenWidth=diagonal*aspect/Math.sqrt(aspect*aspect+1);
    const screenHeight=diagonal/Math.sqrt(aspect*aspect+1);
    const bezel=clamp(.12+(inches-24)*.002,.11,.19);
    const standHeight=clamp(screenHeight*.43,.9,1.55);
    return{
      inches,aspect,
      width:round(screenWidth+bezel*2),
      height:round(screenHeight+bezel*2+standHeight+.2),
      depth:round(aspect>2.1?1.35:1.18),
      screenWidth:round(screenWidth),screenHeight:round(screenHeight),standHeight:round(standHeight),bezel:round(bezel)
    };
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
    const caseGeometry=input.caseGeometry||resolveCaseGeometry(input.caseItem);
    const monitor=monitorGeometry(input.monitor);
    const hasMonitor=monitor.width>0;
    const hasPrinter=input.printer&&input.printer.type!=='—'&&input.printer.label!=='Sem impressora';
    const hasKeyboard=input.keyboard&&input.keyboard.label!=='Sem teclado';
    const hasMouse=input.mouse&&input.mouse.label!=='Sem mouse';
    const audioType=String(input.audio?.type||'—');
    const hasAudio=input.audio&&input.audio.label!=='Sem áudio';
    const hasWebcam=input.webcam&&input.webcam.label!=='Sem webcam'&&hasMonitor;
    const hasController=input.controller&&input.controller.label!=='Sem controle';
    const hasUps=input.ups&&number(input.ups.watts,0)>0;

    const deskTopY=round(-caseGeometry.height/2-.025);
    const floorY=round(deskTopY-2.7);
    const left=-caseGeometry.width/2-.85;
    const monitorGap=hasMonitor?.72:0;
    const monitorCenterX=hasMonitor?caseGeometry.width/2+monitorGap+monitor.width/2:caseGeometry.width/2+1;
    const keyboardWidth=input.keyboard?.type==='Ergonômico'?4.75:input.keyboard?.type?.includes('compacto')?3.5:4.15;
    const keyboardX=hasMonitor?monitorCenterX-.15:caseGeometry.width/2+2.7;
    const mouseWidth=.78;
    const mouseDesiredX=keyboardX+keyboardWidth/2+.75;
    const printerWidth=hasPrinter?3:0;
    const rightRequired=Math.max(
      caseGeometry.width/2+.8,
      hasMonitor?monitorCenterX+monitor.width/2+.85:0,
      hasPrinter?(hasMonitor?monitorCenterX+monitor.width/2+.65:caseGeometry.width/2+.65)+printerWidth+.85:0,
      hasKeyboard?keyboardX+keyboardWidth/2+.42:0,
      hasMouse?mouseDesiredX+mouseWidth/2+.35:0
    );
    const deskRight=Math.max(9.2,rightRequired);
    const deskWidth=round(deskRight-left);
    const deskDepth=round(Math.max(9.1,caseGeometry.depth+1.2));
    const deskCenterX=round((left+deskRight)/2);
    const deskCenterZ=.15;
    const desk=box('desk',[deskWidth,.46,deskDepth],[deskCenterX,deskTopY-.23,deskCenterZ],'surface',{surface:'floor'});
    const floor=box('floor',[Math.max(30,deskWidth+12),.12,Math.max(23,deskDepth+12)],[deskCenterX,floorY-.06,0],'surface',{surface:'world'});
    const objects=[];

    objects.push(box('case',[caseGeometry.width,caseGeometry.height,caseGeometry.depth],[0,deskTopY+caseGeometry.height/2+.02,0],'computer'));

    if(hasMonitor){
      const baseDepth=monitor.depth,baseWidth=clamp(monitor.width*.43,1.9,3.15);
      const base=box('monitor-base',[baseWidth,.18,baseDepth],[monitorCenterX,deskTopY+.1,-.18],'monitor');
      const neckY=deskTopY+.18+monitor.standHeight/2;
      const neck=box('monitor-neck',[.34,monitor.standHeight,.34],[monitorCenterX,neckY,-.18],'monitor',{surface:'monitor'});
      const screenY=deskTopY+.18+monitor.standHeight+monitor.screenHeight/2+.14;
      const screen=box('monitor-screen',[monitor.width,monitor.screenHeight+.24,.24],[monitorCenterX,screenY,-.18],'monitor',{surface:'monitor'});
      objects.push(base,neck,screen);
    }

    if(hasKeyboard)objects.push(box('keyboard',[keyboardWidth,.22,1.28],[keyboardX,deskTopY+.12,2.45],'peripheral'));

    if(hasMouse){
      const mouseX=clamp(mouseDesiredX,left+.65,deskRight-.65);
      objects.push(box('mouse',[mouseWidth,.25,1.08],[mouseX,deskTopY+.135,2.38],'peripheral'));
    }

    if(hasAudio){
      if(audioType.includes('Headset')||audioType.includes('Criação')){
        const standX=clamp(deskRight-1.05,left+1,deskRight-1.05);
        objects.push(box('headset-stand',[.55,1.8,.65],[standX,deskTopY+.91,1.35],'peripheral'));
        objects.push(box('headset',[1.25,1.12,.55],[standX,deskTopY+1.55,1.35],'peripheral',{surface:'stand',allowOverlapWith:['headset-stand']}));
        if(audioType.includes('Criação'))objects.push(box('microphone',[.55,1.65,.55],[standX-1.15,deskTopY+.83,1.15],'peripheral'));
      }else if(hasMonitor){
        const speakerOffset=Math.max(1.4,monitor.width/2-.48);
        objects.push(box('speaker-left',[.72,1.75,.72],[monitorCenterX-speakerOffset,deskTopY+.885,.58],'peripheral'));
        objects.push(box('speaker-right',[.72,1.75,.72],[monitorCenterX+speakerOffset,deskTopY+.885,.58],'peripheral'));
      }
    }

    if(hasWebcam&&hasMonitor){
      const screen=objects.find(item=>item.id==='monitor-screen');
      const webcamY=bounds(screen).maxY+.18;
      objects.push(box('webcam',[1.05,.32,.36],[monitorCenterX,webcamY,-.02],'peripheral',{surface:'monitor',allowOverlapWith:['monitor-screen']}));
    }

    if(hasPrinter){
      const printerX=deskRight-printerWidth/2-.55;
      objects.push(box('printer',[printerWidth,1.6,2.5],[printerX,deskTopY+.81,-2.45],'peripheral'));
    }

    if(hasController){
      const controllerX=hasMonitor?monitorCenterX-monitor.width/2+.9:caseGeometry.width/2+1.45;
      objects.push(box('controller',[1.65,.34,1.12],[controllerX,deskTopY+.18,Math.min(deskDepth/2+deskCenterZ-.58,3.75)],'peripheral'));
    }

    if(hasUps){
      const upsHeight=1.65;
      objects.push(box('ups',[1.8,upsHeight,1.55],[0,floorY+upsHeight/2+.02,2.45],'peripheral',{surface:'floor'}));
    }

    const legHeight=Math.max(.9,deskTopY-floorY-.45);
    const legY=floorY+legHeight/2+.02;
    const legX=[left+.5,deskRight-.5];
    const legZ=[-deskDepth/2+.55,deskDepth/2-.55];
    const supports=[];
    for(const x of legX)for(const z of legZ)supports.push(box(`desk-leg-${supports.length+1}`,[.42,legHeight,.52],[x,legY,z],'support',{surface:'floor'}));

    const warnings=[];
    const errors=[];
    for(const item of objects){
      const surface=item.meta.surface==='floor'?floor:desk;
      if(['monitor','stand'].includes(item.meta.surface))continue;
      if(!insideSurface(item,surface,item.meta.surface==='floor'?.1:.04))errors.push(`${item.id}: fora dos limites da ${item.meta.surface==='floor'?'área de piso':'bancada'}.`);
      if(!supported(item,surface,item.meta.surface==='floor'?.11:.1))errors.push(`${item.id}: sem apoio físico correto.`);
    }

    for(let i=0;i<objects.length;i++){
      for(let j=i+1;j<objects.length;j++){
        const a=objects[i],b=objects[j];
        const allowed=a.allowOverlapWith.includes(b.id)||b.allowOverlapWith.includes(a.id)||(a.role==='monitor'&&b.role==='monitor');
        if(!allowed&&overlaps(a,b,.01))errors.push(`${a.id} colide com ${b.id}.`);
      }
    }

    if(monitor.width>7.3)warnings.push('Monitor ultrawide exige bancada ampla e distância maior da câmera.');
    if(caseGeometry.width>8.2)warnings.push('Gabinete/open bench largo: área de trabalho foi ampliada automaticamente.');
    if(hasPrinter)warnings.push('Impressora posicionada na zona traseira dedicada da bancada.');

    const setupHeight=Math.max(caseGeometry.height,...objects.map(item=>bounds(item).maxY-deskTopY));
    const targetX=round((left+deskRight)/2-.2);
    const radius=Math.sqrt((deskWidth/2)**2+(Math.max(setupHeight,6)/2)**2+(deskDepth/2)**2);
    const minDistance=round(clamp(radius*.78,9,17));
    const maxDistance=round(clamp(radius*2.35,28,48));
    const camera={target:vec(targetX,deskTopY+Math.min(3.2,setupHeight*.42),0),radius:round(radius),minDistance,maxDistance,minPitch:-.08,maxPitch:1.18};

    return{
      version:VERSION,
      safe:errors.length===0,
      status:errors.length?'Correções necessárias':warnings.length?'Seguro com recomendações':'Setup fisicamente seguro',
      desk:{...desk,topY:deskTopY,left:round(left),right:round(deskRight),front:round(deskDepth/2+deskCenterZ),back:round(-deskDepth/2+deskCenterZ)},
      floor,
      supports,
      objects,
      monitor,
      caseGeometry,
      camera,
      errors:[...new Set(errors)],
      warnings:[...new Set(warnings)],
      summary:{objects:objects.length,collisions:errors.filter(item=>item.includes('colide')).length,unsupported:errors.filter(item=>item.includes('apoio')).length,outOfBounds:errors.filter(item=>item.includes('limites')).length,deskWidth,deskDepth,deskTopY,floorY}
    };
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
