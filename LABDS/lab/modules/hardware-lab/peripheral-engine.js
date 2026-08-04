'use strict';
(function(global){
  // LABDS_LABS: motor auxiliar de periféricos e múltiplos monitores.
  const VERSION='1.0.0';
  const COUNTS={1:'Uma tela',2:'Duas telas',3:'Três telas'};
  const LAYOUTS={
    single:{label:'Tela única',counts:[1]},
    dual:{label:'Duas telas lado a lado',counts:[2]},
    triple:{label:'Três telas lado a lado',counts:[3]},
    creator:{label:'Principal + laterais verticais',counts:[2,3]},
    stacked:{label:'Telas empilhadas',counts:[2,3]},
    cockpit:{label:'Cockpit panorâmico',counts:[3]}
  };
  const MOUNTS={
    stock:{label:'Bases originais',counts:[1,2,3]},
    singleArm:{label:'Braço articulado individual',counts:[1]},
    dualArm:{label:'Suporte articulado duplo',counts:[2]},
    tripleArm:{label:'Suporte articulado triplo',counts:[3]},
    rail:{label:'Trilho profissional',counts:[2,3]}
  };
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0));
  const round=(value,digits=3)=>Number(Number(value||0).toFixed(digits));

  function parseInches(item){
    const match=String(item?.label||'').match(/(\d{2}(?:[.,]\d+)?)\s*[″"]/u);
    return clamp(match?Number(match[1].replace(',','.')):24,14,57);
  }
  function aspectRatio(item){
    const width=Math.max(1,Number(item?.res?.[0])||1920),height=Math.max(1,Number(item?.res?.[1])||1080);
    return clamp(width/height,1.15,3.8);
  }
  function monitorGeometry(item,orientation='landscape'){
    if(!item||item.connector===null||item.label==='Sem monitor')return{width:0,height:0,depth:0,screenWidth:0,screenHeight:0,standHeight:0,inches:0,aspect:16/9,orientation};
    const inches=parseInches(item),aspect=aspectRatio(item),diagonal=5.74*(inches/24);
    let screenWidth=diagonal*aspect/Math.sqrt(aspect*aspect+1),screenHeight=diagonal/Math.sqrt(aspect*aspect+1);
    if(orientation==='portrait')[screenWidth,screenHeight]=[screenHeight,screenWidth];
    const bezel=clamp(.12+(inches-24)*.002,.11,.2),standHeight=clamp(screenHeight*.4,.88,1.6);
    return{inches,aspect,orientation,width:round(screenWidth+bezel*2),height:round(screenHeight+bezel*2),depth:round(aspect>2.1?1.35:1.18),screenWidth:round(screenWidth),screenHeight:round(screenHeight),standHeight:round(standHeight),bezel:round(bezel)};
  }
  function normalize(settings={}){
    let count=Math.round(clamp(settings.monitorCount,1,3));
    let layout=LAYOUTS[settings.monitorLayout]?settings.monitorLayout:(count===1?'single':count===2?'dual':'triple');
    if(!LAYOUTS[layout].counts.includes(count))layout=count===1?'single':count===2?'dual':'triple';
    let mount=MOUNTS[settings.monitorMount]?settings.monitorMount:'stock';
    if(!MOUNTS[mount].counts.includes(count))mount=count===1?'singleArm':count===2?'dualArm':'tripleArm';
    if(layout==='stacked'&&mount==='stock')mount='rail';
    if(layout==='cockpit'&&mount==='stock')mount='tripleArm';
    return{monitorCount:count,monitorLayout:layout,monitorMount:mount};
  }
  function activeItems(input={}){
    const normalized=normalize(input.state||input),primary=input.primary,secondary=input.secondary,tertiary=input.tertiary;
    if(!primary||primary.connector===null)return{...normalized,items:[]};
    const fallback=primary;
    const items=[primary,secondary?.connector===null?fallback:(secondary||fallback),tertiary?.connector===null?fallback:(tertiary||fallback)].slice(0,normalized.monitorCount);
    return{...normalized,items};
  }
  function orientationFor(layout,index){
    if(layout==='creator'&&index>0)return'portrait';
    return'landscape';
  }
  function localScreens(config){
    const gap=.34,geometries=config.items.map((item,index)=>monitorGeometry(item,orientationFor(config.monitorLayout,index)));
    const points=[];
    if(!geometries.length)return{geometries,points,width:0,height:0};
    if(config.monitorLayout==='stacked'){
      const lower=geometries[0],upper=geometries[1]||lower;
      points.push({x:0,y:0,yaw:0});
      points.push({x:0,y:(lower.screenHeight+upper.screenHeight)/2+.32,yaw:0});
      if(geometries[2])points.push({x:(lower.width+geometries[2].width)/2+gap,y:0,yaw:-.08});
    }else{
      const total=geometries.reduce((sum,item)=>sum+item.width,0)+gap*(geometries.length-1);
      let cursor=-total/2;
      geometries.forEach((geometry,index)=>{
        const x=cursor+geometry.width/2;cursor+=geometry.width+gap;
        let yaw=0;if(config.monitorLayout==='cockpit'){if(index===0)yaw=.18;if(index===2)yaw=-.18;}
        points.push({x,y:0,yaw});
      });
    }
    let minX=Math.min(...points.map((point,index)=>point.x-geometries[index].width/2));
    let maxX=Math.max(...points.map((point,index)=>point.x+geometries[index].width/2));
    const shiftX=(minX+maxX)/2;if(Math.abs(shiftX)>.0001)for(const point of points)point.x-=shiftX;
    minX=Math.min(...points.map((point,index)=>point.x-geometries[index].width/2));
    maxX=Math.max(...points.map((point,index)=>point.x+geometries[index].width/2));
    const minY=Math.min(...points.map((point,index)=>point.y-geometries[index].screenHeight/2));
    const maxY=Math.max(...points.map((point,index)=>point.y+geometries[index].screenHeight/2));
    return{geometries,points,width:round(maxX-minX),height:round(maxY-minY),minX,maxX,minY,maxY};
  }
  function box(id,size,position,role='monitor',meta={}){return{id,role,size:size.map(v=>round(Math.max(.01,Number(v)||.01))),position:position.map(v=>round(Number(v)||0)),rotation:meta.rotation||[0,0,0],surface:meta.surface||'desk',allowOverlapWith:meta.allowOverlapWith||[],meta};}
  function buildMonitorPlan(input={}){
    const config=activeItems(input),local=localScreens(config),deskTopY=Number(input.deskTopY)||0,centerX=Number(input.centerX)||0,z=Number.isFinite(Number(input.z))?Number(input.z):-.18;
    const objects=[],screenIds=[];
    if(!config.items.length)return{...config,objects,screenIds,width:0,height:0,centerX,labels:[]};
    const sharedMount=config.monitorMount!=='stock';
    let poleTop=deskTopY+Math.max(3.1,local.height+.65);
    if(sharedMount){
      objects.push(box('monitor-clamp',[1.05,.24,.72],[centerX,deskTopY+.12,z+.08],'monitor',{kind:'clamp',surface:'desk'}));
      objects.push(box('monitor-pole',[.28,poleTop-deskTopY,.28],[centerX,deskTopY+(poleTop-deskTopY)/2,z+.04],'monitor',{kind:'pole',surface:'monitor',allowOverlapWith:['monitor-clamp']}));
      if(config.monitorMount==='rail')objects.push(box('monitor-rail',[Math.max(2.4,local.width*.86),.24,.28],[centerX,poleTop-.55,z+.02],'monitor',{kind:'rail',surface:'monitor',allowOverlapWith:['monitor-pole']}));
    }
    config.items.forEach((item,index)=>{
      const geometry=local.geometries[index],point=local.points[index],id=index+1,x=centerX+point.x;
      const screenY=sharedMount?deskTopY+2.45+point.y:deskTopY+.18+geometry.standHeight+geometry.screenHeight/2+.14+point.y;
      const screenId=`monitor-screen-${id}`,allowed=[`monitor-neck-${id}`,`monitor-base-${id}`,`monitor-arm-${id}`,'monitor-pole','monitor-rail'];
      objects.push(box(screenId,[geometry.width,geometry.screenHeight+.24,.24],[x,screenY,z],'monitor',{kind:'screen',surface:'monitor',allowOverlapWith:allowed,rotation:[0,point.yaw,0],monitorIndex:id,item,geometry}));
      screenIds.push(screenId);
      if(sharedMount){
        const armLength=Math.max(.7,Math.abs(point.x)+.45),armX=centerX+point.x/2,armY=screenY-.1;
        objects.push(box(`monitor-arm-${id}`,[armLength,.18,.18],[armX,armY,z+.03],'monitor',{kind:'arm',surface:'monitor',allowOverlapWith:[screenId,'monitor-pole','monitor-rail'],rotation:[0,0,Math.atan2(point.y,Math.max(.2,point.x||.2))]}));
      }else{
        const baseWidth=clamp(geometry.width*.43,1.9,3.15),base=box(`monitor-base-${id}`,[baseWidth,.18,geometry.depth],[x,deskTopY+.1,z],'monitor',{kind:'base',surface:'desk',monitorIndex:id});
        const neckY=deskTopY+.18+geometry.standHeight/2,neck=box(`monitor-neck-${id}`,[.34,geometry.standHeight,.34],[x,neckY,z],'monitor',{kind:'neck',surface:'monitor',allowOverlapWith:[base.id,screenId],monitorIndex:id});
        objects.push(base,neck);
      }
    });
    return{...config,objects,screenIds,width:local.width,height:local.height,centerX,labels:config.items.map(item=>item.label),geometries:local.geometries,summary:`${config.items.length} tela${config.items.length>1?'s':''} • ${LAYOUTS[config.monitorLayout].label} • ${MOUNTS[config.monitorMount].label}`};
  }
  function compatibleMounts(count){return Object.entries(MOUNTS).filter(([,item])=>item.counts.includes(Number(count))).map(([id,item])=>({id,label:item.label}));}
  function compatibleLayouts(count){return Object.entries(LAYOUTS).filter(([,item])=>item.counts.includes(Number(count))).map(([id,item])=>({id,label:item.label}));}

  global.LABDS_HARDWARE_PERIPHERALS={VERSION,COUNTS,LAYOUTS,MOUNTS,normalize,monitorGeometry,activeItems,buildMonitorPlan,compatibleMounts,compatibleLayouts};
})(window);
