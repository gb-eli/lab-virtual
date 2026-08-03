'use strict';
(function(){
  window.LABDS_LABS=window.LABDS_LABS||{};

  const KEY='lab.printing3d.v34';
  const THREE_URL='../../vendor/three/three.module.min.js';
  const MM=.032;
  const MATERIALS={
    PLA:{process:'FDM',temp:[185,235],bed:[50,60],density:1.24,cost:.12,difficulty:'Fácil',color:'#45d9ff',use:'Modelos, protótipos visuais e peças detalhadas.',notes:'Baixo empenamento; não é ideal para calor elevado.'},
    PETG:{process:'FDM',temp:[215,270],bed:[70,90],density:1.27,cost:.16,difficulty:'Fácil/intermediário',color:'#72f2b0',use:'Peças funcionais, recipientes e componentes resistentes.',notes:'Boa resistência química e tenacidade.'},
    ABS:{process:'FDM',temp:[230,255],bed:[95,110],density:1.04,cost:.14,difficulty:'Intermediário',color:'#ff735f',use:'Peças mecânicas e protótipos resistentes ao calor.',notes:'Recomenda gabinete e ventilação adequada.'},
    ASA:{process:'FDM',temp:[220,275],bed:[90,110],density:1.07,cost:.19,difficulty:'Intermediário',color:'#ffb45f',use:'Peças externas e aplicações resistentes a UV.',notes:'Gabinete recomendado para reduzir empenamento.'},
    TPU:{process:'FDM',temp:[220,260],bed:[40,85],density:1.21,cost:.22,difficulty:'Intermediário',color:'#d986ff',use:'Capas, amortecedores e peças flexíveis.',notes:'Exige velocidade reduzida e caminho de filamento bem guiado.'},
    Nylon:{process:'FDM',temp:[240,285],bed:[70,115],density:1.14,cost:.28,difficulty:'Avançado',color:'#f4efe2',use:'Engrenagens, dobradiças e peças técnicas.',notes:'Higroscópico; deve permanecer seco.'},
    PC:{process:'FDM',temp:[270,275],bed:[100,115],density:1.2,cost:.34,difficulty:'Avançado',color:'#91b7ff',use:'Peças de alta resistência e temperatura.',notes:'Requer hotend, mesa e gabinete adequados.'},
    PVA:{process:'FDM',temp:[195,215],bed:[60,60],density:1.23,cost:.42,difficulty:'Avançado',color:'#ffe08a',use:'Suporte solúvel para geometrias complexas.',notes:'Muito sensível à umidade.'},
    HIPS:{process:'FDM',temp:[225,255],bed:[100,110],density:1.04,cost:.2,difficulty:'Intermediário',color:'#c8f3ff',use:'Suportes e modelos grandes.',notes:'Pode ser usado como suporte em combinações compatíveis.'},
    PP:{process:'FDM',temp:[220,245],bed:[70,100],density:.9,cost:.25,difficulty:'Avançado',color:'#f8f8ff',use:'Peças leves, dobradiças vivas e recipientes.',notes:'Aderência à mesa exige superfície apropriada.'},
    'Composto CF':{process:'FDM',temp:[225,290],bed:[40,120],density:1.3,cost:.48,difficulty:'Avançado',color:'#424b57',use:'Peças rígidas e componentes técnicos.',notes:'Bico endurecido recomendado por abrasividade.'},
    Resina:{process:'SLA',temp:[20,30],bed:[0,0],density:1.1,cost:.38,difficulty:'Intermediário',color:'#7b72ff',use:'Miniaturas, detalhes finos, odontologia e protótipos.',notes:'Exige luvas, lavagem e pós-cura conforme o fabricante.'}
  };
  const PRINTERS={
    'DS Mini 180':{process:'FDM',kinematics:'Mesa móvel',volume:[180,180,180],nozzle:.4,maxTemp:260,enclosed:false,level:'Escolar',detail:'Compacta para PLA, PETG e primeiras atividades.',frame:'#7f91a4'},
    'DS Maker 250':{process:'FDM',kinematics:'Cartesiana',volume:[250,210,220],nozzle:.4,maxTemp:300,enclosed:false,level:'Intermediária',detail:'Perfil versátil com sensor de nivelamento simulado.',frame:'#4c6680'},
    'CoreXY Lab 300':{process:'FDM',kinematics:'CoreXY',volume:[300,300,300],nozzle:.4,maxTemp:320,enclosed:true,level:'Avançada',detail:'Gabinete fechado e maior velocidade para materiais técnicos.',frame:'#263b50'},
    'HighTemp 350':{process:'FDM',kinematics:'CoreXY industrial',volume:[350,350,400],nozzle:.6,maxTemp:450,enclosed:true,level:'Industrial',detail:'Perfil educacional de alta temperatura e bico endurecido.',frame:'#171f2a'},
    'Resin Lab 8K':{process:'SLA',kinematics:'MSLA',volume:[192,120,245],nozzle:0,maxTemp:35,enclosed:true,level:'Resina',detail:'Cura camadas por luz UV em tanque de resina.',frame:'#392d55'}
  };
  const MODELS={
    'Cubo de calibração DS':{dims:[20,20,20],complexity:'Baixa',supports:false,kind:'cube',icon:'▣',description:'Verifica dimensões, fluxo e precisão dos eixos.'},
    'Barco de teste DS':{dims:[60,32,48],complexity:'Média',supports:false,kind:'boat',icon:'⛵',description:'Avalia pontes, paredes, resfriamento e detalhes.'},
    'Ponte técnica':{dims:[90,30,35],complexity:'Média',supports:true,kind:'bridge',icon:'⌒',description:'Demonstra balanços, suportes e orientação.'},
    'Engrenagem funcional':{dims:[55,55,12],complexity:'Média',supports:false,kind:'gear',icon:'⚙',description:'Explora tolerância, dentes e resistência mecânica.'},
    'Suporte de celular':{dims:[85,75,95],complexity:'Média',supports:true,kind:'stand',icon:'▱',description:'Peça prática com inclinação e base.'},
    'Foguete SLS educacional':{dims:[45,45,160],complexity:'Alta',supports:true,kind:'rocket',icon:'▲',description:'Modelo estilizado inspirado em veículos de exploração.'},
    'Base lunar modular':{dims:[150,130,80],complexity:'Alta',supports:true,kind:'lunar',icon:'◒',description:'Projeto de arquitetura e montagem por módulos.'},
    'Vaso paramétrico':{dims:[90,90,120],complexity:'Média',supports:false,kind:'vase',icon:'◡',description:'Explora espiralização, paredes e padrões.'}
  };

  let root,ctx,state,timer=null,resizeObserver,three=null,raf=0,runToken=0,rebuildTimer=0;
  const $=s=>root?.querySelector(s),$$=s=>[...(root?.querySelectorAll(s)||[])];
  const clamp=(n,a,b)=>Math.min(b,Math.max(a,Number(n)||0));
  const defaults=()=>({
    tab:'simulate',technology:'FDM',printer:'DS Maker 250',material:'PLA',model:'Cubo de calibração DS',scale:100,layer:.2,infill:20,supports:false,adhesion:'Saia',nozzle:.4,temp:205,bed:60,speed:50,fan:100,
    progress:0,status:'idle',phaseProgress:0,elapsed:0,errors:[],history:[],autoRotate:false,showFrame:true,showGhost:true,showLayers:true,cameraYaw:-.72,cameraPitch:.48,cameraDistance:18,
    liveNozzle:24,liveBed:24,preflight:{bedClean:false,level:false,materialLoaded:false,fileSliced:false,safety:false}
  });
  function normalize(input){
    const base=defaults(),value=input&&typeof input==='object'?input:{};
    const result={...base,...value,preflight:{...base.preflight,...(value.preflight||{})}};
    result.scale=clamp(result.scale,25,200);result.layer=clamp(result.layer,.05,.6);result.infill=clamp(result.infill,0,100);result.speed=clamp(result.speed,10,250);result.fan=clamp(result.fan,0,100);result.cameraPitch=clamp(result.cameraPitch,-.05,1.25);result.cameraDistance=clamp(result.cameraDistance,7,42);
    if(!PRINTERS[result.printer])result.printer=base.printer;if(!MATERIALS[result.material])result.material=base.material;if(!MODELS[result.model])result.model=base.model;
    if(!['idle','heating','homing','printing','paused','cooling','done','done-with-errors'].includes(result.status))result.status='idle';
    if(['heating','homing','printing','paused','cooling'].includes(result.status)){result.status='idle';result.progress=0;result.phaseProgress=0;}
    return result;
  }
  const model=()=>MODELS[state.model]||MODELS['Cubo de calibração DS'];
  const printer=()=>PRINTERS[state.printer]||PRINTERS['DS Maker 250'];
  const material=()=>MATERIALS[state.material]||MATERIALS.PLA;
  function dimensions(){return model().dims.map(v=>v*state.scale/100);}
  function estimate(){
    const[w,d,h]=dimensions(),shell=Math.max(.08,Math.min(.34,.1+state.layer*.35)),solid=w*d*h*(shell+(state.infill/100)*(1-shell)*.68),m=material(),grams=solid/1000*m.density,supportFactor=state.supports&&model().supports?1.17:1,time=Math.max(2,(h/state.layer)*(w*d/1800)*(60/state.speed)*.5*supportFactor),cost=grams*m.cost;
    return{volume:solid,grams,time,cost,layers:Math.max(1,Math.ceil(h/state.layer)),dims:[w,d,h]};
  }
  function validate(){
    const errors=[],m=material(),p=printer(),[w,d,h]=dimensions();
    if(m.process!==p.process)errors.push(`O material ${state.material} pertence ao processo ${m.process}, mas a impressora usa ${p.process}.`);
    if(state.technology!==p.process)errors.push(`A tecnologia selecionada não corresponde à impressora ${state.printer}.`);
    if(w>p.volume[0]||d>p.volume[1]||h>p.volume[2])errors.push('O modelo ultrapassa o volume de impressão da máquina.');
    if(p.process==='FDM'){
      if(state.temp<m.temp[0])errors.push('Temperatura do bico abaixo da faixa educacional do material.');
      if(state.temp>m.temp[1])errors.push('Temperatura do bico acima da faixa educacional do material.');
      if(state.temp>p.maxTemp)errors.push('A temperatura ultrapassa o limite da impressora.');
      if(state.bed<m.bed[0])errors.push('Mesa abaixo da faixa recomendada: risco de descolamento.');
      if(state.layer>state.nozzle*.8)errors.push('Camada muito alta para o diâmetro do bico.');
      if(model().supports&&!state.supports)errors.push('A orientação atual possui balanços e pode precisar de suportes.');
      if(['ABS','ASA','Nylon','PC'].includes(state.material)&&!p.enclosed)errors.push('Material técnico em impressora aberta: maior risco de empenamento.');
      if(state.material==='Composto CF'&&state.nozzle<.5)errors.push('Composto abrasivo: prefira bico endurecido de 0,5 mm ou maior.');
      if(state.speed>100&&state.layer<.15)errors.push('Velocidade alta para camada fina.');
    }else{
      if(state.material!=='Resina')errors.push('Selecione Resina para o processo SLA/MSLA.');
      if(state.temp<20)errors.push('Resina fria aumenta viscosidade e pode reduzir a qualidade.');
    }
    state.errors=errors;return errors;
  }
  function preflightReady(){return Object.values(state.preflight).every(Boolean);}
  function statusLabel(){return({idle:'Pronta para preparar',heating:'Aquecendo',homing:'Referenciando eixos',printing:'Imprimindo',paused:'Pausada',cooling:'Resfriando',done:'Concluída', 'done-with-errors':'Concluída com falhas'})[state.status]||'Pronta';}
  function statusProgress(){if(state.status==='heating'||state.status==='homing'||state.status==='cooling')return state.phaseProgress;if(state.status==='printing'||state.status==='paused'||state.status.startsWith('done'))return state.progress;return 0;}

  function disposeObject(object){if(!object)return;object.traverse?.(item=>{item.geometry?.dispose?.();if(Array.isArray(item.material))item.material.forEach(m=>m.dispose?.());else item.material?.dispose?.();});object.parent?.remove(object);}
  function mesh(THREE,geometry,material,position=[0,0,0],rotation=[0,0,0]){const item=new THREE.Mesh(geometry,material);item.position.set(...position);item.rotation.set(...rotation);item.castShadow=true;item.receiveShadow=true;return item;}
  function bar(THREE,material,x,y,z,px,py,pz){return mesh(THREE,new THREE.BoxGeometry(x,y,z),material,[px,py,pz]);}

  function createModelAsset(THREE,name,mat,accent){
    const group=new THREE.Group(),kind=(MODELS[name]||MODELS['Cubo de calibração DS']).kind;
    if(kind==='cube'){
      group.add(mesh(THREE,new THREE.BoxGeometry(1,1,1,4,4,4),mat,[0,.5,0]));
      const inset=mesh(THREE,new THREE.BoxGeometry(.58,.08,.58),accent,[0,1.01,0]);group.add(inset);
    }else if(kind==='boat'){
      const shape=new THREE.Shape();shape.moveTo(-1,0);shape.lineTo(-.72,.55);shape.quadraticCurveTo(0,.9,.92,.55);shape.lineTo(1,.08);shape.quadraticCurveTo(0,-.2,-1,0);
      const hull=new THREE.ExtrudeGeometry(shape,{depth:.62,bevelEnabled:true,bevelSize:.08,bevelThickness:.08,bevelSegments:2});hull.center();const hullMesh=mesh(THREE,hull,mat,[0,.55,0],[0,0,0]);group.add(hullMesh);
      group.add(bar(THREE,accent,.12,.85,.12,0,1.3,0));group.add(bar(THREE,mat,.8,.1,.08,.2,1.56,0));
      group.add(mesh(THREE,new THREE.TorusGeometry(.2,.05,8,24,Math.PI),accent,[.15,1.02,-.33],[Math.PI/2,0,0]));
    }else if(kind==='bridge'){
      group.add(bar(THREE,mat,2.4,.22,.72,0,1.12,0));group.add(bar(THREE,accent,.3,1.05,.68,-.86,.52,0));group.add(bar(THREE,accent,.3,1.05,.68,.86,.52,0));
      const arch=mesh(THREE,new THREE.TorusGeometry(.62,.16,10,40,Math.PI),mat,[0,.48,.02],[0,0,0]);group.add(arch);
      for(let x=-.62;x<=.62;x+=.31)group.add(bar(THREE,accent,.06,.7,.08,x,.85,-.27));
    }else if(kind==='gear'){
      const shape=new THREE.Shape(),teeth=18;for(let i=0;i<teeth*2;i++){const a=i/(teeth*2)*Math.PI*2,r=i%2?1:.82;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?shape.lineTo(x,y):shape.moveTo(x,y);}shape.closePath();const hole=new THREE.Path();hole.absarc(0,0,.28,0,Math.PI*2,true);shape.holes.push(hole);
      const geometry=new THREE.ExtrudeGeometry(shape,{depth:.3,bevelEnabled:true,bevelSize:.045,bevelThickness:.045,bevelSegments:2});geometry.center();group.add(mesh(THREE,geometry,mat,[0,.2,0],[-Math.PI/2,0,0]));
    }else if(kind==='stand'){
      group.add(bar(THREE,mat,1.7,.18,1.25,0,.09,0));const back=bar(THREE,mat,1.45,1.7,.16,0,.92,.33);back.rotation.x=-.32;group.add(back);group.add(bar(THREE,accent,1.55,.18,.28,0,.25,-.42));
      group.add(bar(THREE,accent,.16,.46,.16,-.67,.29,-.47));group.add(bar(THREE,accent,.16,.46,.16,.67,.29,-.47));
    }else if(kind==='rocket'){
      group.add(mesh(THREE,new THREE.CylinderGeometry(.48,.58,2.3,28),mat,[0,1.18,0]));group.add(mesh(THREE,new THREE.ConeGeometry(.48,.9,28),accent,[0,2.78,0]));group.add(mesh(THREE,new THREE.CylinderGeometry(.58,.46,.32,28),accent,[0,.16,0]));
      for(let i=0;i<4;i++){const fin=bar(THREE,mat,.15,.72,.55,0,.45,.42);fin.rotation.y=i*Math.PI/2;fin.position.x=Math.sin(i*Math.PI/2)*.45;fin.position.z=Math.cos(i*Math.PI/2)*.45;group.add(fin);}
    }else if(kind==='lunar'){
      const domeGeo=new THREE.SphereGeometry(.65,24,14,0,Math.PI*2,0,Math.PI/2);group.add(mesh(THREE,domeGeo,mat,[-.75,.04,0]));group.add(mesh(THREE,domeGeo,mat,[.75,.04,.2]));group.add(mesh(THREE,new THREE.CylinderGeometry(.25,.25,1.3,16),accent,[0,.3,.1],[0,0,Math.PI/2]));
      group.add(mesh(THREE,new THREE.CylinderGeometry(.32,.38,.8,18),mat,[0,.4,-.65]));group.add(bar(THREE,accent,2.4,.12,1.55,0,.02,0));
    }else if(kind==='vase'){
      const points=[];for(let i=0;i<=28;i++){const y=i/28*2.4,r=.48+Math.sin(i/28*Math.PI*3)*.12+(i/28)*.25;points.push(new THREE.Vector2(r,y));}group.add(mesh(THREE,new THREE.LatheGeometry(points,48),mat,[0,0,0]));
    }
    return group;
  }

  function normalizeAsset(THREE,group,dims){
    group.updateMatrixWorld(true);let box=new THREE.Box3().setFromObject(group),size=new THREE.Vector3();box.getSize(size);
    group.scale.set((dims[0]*MM)/Math.max(.01,size.x),(dims[2]*MM)/Math.max(.01,size.y),(dims[1]*MM)/Math.max(.01,size.z));group.updateMatrixWorld(true);
    box=new THREE.Box3().setFromObject(group);const center=new THREE.Vector3();box.getCenter(center);group.position.x-=center.x;group.position.z-=center.z;group.position.y-=box.min.y;group.updateMatrixWorld(true);
    box=new THREE.Box3().setFromObject(group);return box;
  }

  function buildMachine(THREE){
    if(three.machineRoot)disposeObject(three.machineRoot);
    const p=printer(),rootGroup=new THREE.Group(),frameMat=new THREE.MeshStandardMaterial({color:p.frame,metalness:.72,roughness:.28}),dark=new THREE.MeshStandardMaterial({color:0x111923,metalness:.45,roughness:.38}),bedMat=new THREE.MeshStandardMaterial({color:0x26384a,metalness:.25,roughness:.55}),accent=new THREE.MeshStandardMaterial({color:0x54dfff,emissive:0x0d6172,emissiveIntensity:.55,metalness:.15,roughness:.35});
    const vw=p.volume[0]*MM,vd=p.volume[1]*MM,vh=p.volume[2]*MM,fw=vw+3.2,fd=vd+3.2,fh=vh+3.4;
    rootGroup.userData={vw,vd,vh,fw,fd,fh};
    rootGroup.add(bar(THREE,dark,fw+.8,.55,fd+.8,0,-.25,0));
    const corners=[[-fw/2,-fd/2],[fw/2,-fd/2],[-fw/2,fd/2],[fw/2,fd/2]];for(const[x,z]of corners)rootGroup.add(bar(THREE,frameMat,.34,fh,.34,x,fh/2,z));
    rootGroup.add(bar(THREE,frameMat,fw,.34,.34,0,fh,-fd/2),bar(THREE,frameMat,fw,.34,.34,0,fh,fd/2),bar(THREE,frameMat,.34,.34,fd,-fw/2,fh,0),bar(THREE,frameMat,.34,.34,fd,fw/2,fh,0));
    if(p.enclosed){const glass=new THREE.MeshPhysicalMaterial({color:0x8fdcff,transparent:true,opacity:.08,roughness:.12,metalness:0,side:THREE.DoubleSide,depthWrite:false});rootGroup.add(mesh(THREE,new THREE.BoxGeometry(fw-.3,fh-.4,.04),glass,[0,fh/2,fd/2-.18]));rootGroup.add(mesh(THREE,new THREE.BoxGeometry(.04,fh-.4,fd-.3),glass,[fw/2-.18,fh/2,0]));}
    if(p.process==='FDM'){
      const bed=bar(THREE,bedMat,vw+.6,.28,vd+.6,0,.18,0);rootGroup.add(bed);const grid=new THREE.GridHelper(Math.max(vw,vd),12,0x4edfff,0x28445d);grid.position.y=.34;rootGroup.add(grid);
      const gantry=new THREE.Group();gantry.add(bar(THREE,frameMat,fw-.55,.26,.28,0,0,0),bar(THREE,dark,.2,.2,fd-.7,-fw/2+.25,0,0),bar(THREE,dark,.2,.2,fd-.7,fw/2-.25,0,0));gantry.position.y=Math.min(fh-.8,Math.max(3.2,vh*.62));rootGroup.add(gantry);
      const head=new THREE.Group();head.add(bar(THREE,dark,1.05,.78,.9,0,.3,0));head.add(mesh(THREE,new THREE.ConeGeometry(.14,.48,18),new THREE.MeshStandardMaterial({color:0xd7b56d,metalness:.8,roughness:.25}),[0,-.3,0],[0,0,Math.PI]));const glow=mesh(THREE,new THREE.SphereGeometry(.12,12,8),accent,[0,-.54,0]);head.add(glow);head.position.y=gantry.position.y-.52;rootGroup.add(head);
      const spool=new THREE.Group();spool.add(mesh(THREE,new THREE.CylinderGeometry(.72,.72,.48,32),dark,[0,0,0],[Math.PI/2,0,0]));spool.add(mesh(THREE,new THREE.TorusGeometry(.58,.12,10,30),new THREE.MeshStandardMaterial({color:material().color,roughness:.55}),[0,0,.26]));spool.position.set(fw/2-.85,fh+.35,-fd/2+.7);rootGroup.add(spool);
      three.machine={bed,gantry,head,spool,vat:null,buildPlate:null};
    }else{
      const vat=bar(THREE,new THREE.MeshPhysicalMaterial({color:0x342d5d,transparent:true,opacity:.72,roughness:.25}),vw+.5,1.1,vd+.5,0,.55,0);rootGroup.add(vat);const resin=mesh(THREE,new THREE.BoxGeometry(vw+.25,.08,vd+.25),new THREE.MeshPhysicalMaterial({color:material().color,transparent:true,opacity:.52,transmission:.25,roughness:.12}),[0,1.08,0]);rootGroup.add(resin);
      const tower=bar(THREE,frameMat,.75,fh,1.05,0,fh/2,-fd/2-.7);rootGroup.add(tower);const buildPlate=new THREE.Group();buildPlate.add(bar(THREE,dark,vw+.2,.25,vd+.2,0,0,0));buildPlate.add(bar(THREE,frameMat,.4,2,.4,0,1,0));buildPlate.position.y=Math.min(fh-1.8,vh*.8);rootGroup.add(buildPlate);const uv=bar(THREE,accent,vw+.1,.12,vd+.1,0,.02,0);rootGroup.add(uv);three.machine={bed:null,gantry:null,head:null,spool:null,vat,resin,buildPlate};
    }
    three.scene.add(rootGroup);three.machineRoot=rootGroup;three.target.set(0,Math.min(vh*.42,5.5),0);updateCamera();
  }

  function buildModel(THREE){
    for(const key of['modelRoot','ghostRoot','supportRoot','layerMarker']){if(three[key])disposeObject(three[key]);three[key]=null;}
    const color=new THREE.Color(material().color),printedMat=new THREE.MeshStandardMaterial({color,metalness:state.material==='Composto CF'?.38:.08,roughness:state.material==='Resina'?.22:.48,transparent:state.material==='Resina',opacity:state.material==='Resina'?.82:1}),accentMat=new THREE.MeshStandardMaterial({color:color.clone().offsetHSL(.08,.05,.15),metalness:.28,roughness:.35});
    const ghostMat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.1,wireframe:true,depthWrite:false}),ghostAccent=ghostMat.clone();
    const printed=createModelAsset(THREE,state.model,printedMat,accentMat),ghost=createModelAsset(THREE,state.model,ghostMat,ghostAccent),dims=dimensions();const box=normalizeAsset(THREE,printed,dims);normalizeAsset(THREE,ghost,dims);
    const bedY=printer().process==='FDM'?.38:1.12;printed.position.y+=bedY;ghost.position.y+=bedY;three.scene.add(ghost,printed);three.modelRoot=printed;three.ghostRoot=ghost;three.modelBox=box.clone();three.modelHeight=Math.max(.1,dims[2]*MM);three.ghostRoot.visible=state.showGhost;
    if(state.supports&&model().supports){const supports=new THREE.Group(),supportMat=new THREE.MeshStandardMaterial({color:0xe6ad4d,transparent:true,opacity:.62,roughness:.65}),sx=dims[0]*MM*.34,sz=dims[1]*MM*.3,h=three.modelHeight*.65;for(const x of[-sx,sx])for(const z of[-sz,sz])supports.add(mesh(THREE,new THREE.CylinderGeometry(.07,.1,h,8),supportMat,[x,bedY+h/2,z]));three.scene.add(supports);three.supportRoot=supports;}
    const markerMat=new THREE.MeshBasicMaterial({color:0xfff0a8,transparent:true,opacity:.78,wireframe:true,depthWrite:false});const marker=mesh(THREE,new THREE.BoxGeometry(dims[0]*MM*1.06,.035,dims[1]*MM*1.06),markerMat,[0,bedY+.02,0]);three.scene.add(marker);three.layerMarker=marker;
    updateSceneProgress();
  }

  function updateCamera(){if(!three)return;const d=state.cameraDistance,p=state.cameraPitch,y=state.cameraYaw;three.camera.position.set(three.target.x+Math.cos(p)*Math.sin(y)*d,three.target.y+Math.sin(p)*d,three.target.z+Math.cos(p)*Math.cos(y)*d);three.camera.lookAt(three.target);}
  function setView(view){
    if(view==='front'){state.cameraYaw=0;state.cameraPitch=.22;}else if(view==='side'){state.cameraYaw=Math.PI/2;state.cameraPitch=.22;}else if(view==='top'){state.cameraYaw=0;state.cameraPitch=1.18;}else{state.cameraYaw=-.72;state.cameraPitch=.48;state.cameraDistance=18;}updateCamera();ctx.storage.set(KEY,state);
  }
  function updateSceneProgress(time=0){
    if(!three?.modelRoot)return;const visible=state.status==='printing'||state.status==='paused'||state.status==='cooling'||state.status.startsWith('done')?clamp(state.progress/100,.003,1):1,bedY=printer().process==='FDM'?.38:1.12;
    three.modelRoot.scale.y=visible;three.modelRoot.position.y=bedY;three.modelRoot.visible=visible>.005;three.ghostRoot.visible=state.showGhost&&visible<.999;three.supportRoot&&(three.supportRoot.scale.y=visible);
    if(three.layerMarker){three.layerMarker.visible=state.showLayers&&visible<.999;three.layerMarker.position.y=bedY+three.modelHeight*visible+.025;}
    if(three.machine?.head){const width=dimensions()[0]*MM*.42,depth=dimensions()[1]*MM*.42,phase=(time*.0025)+(state.progress*.18);three.machine.head.position.x=Math.sin(phase)*width;three.machine.head.position.z=Math.cos(phase*1.37)*depth;three.machine.head.position.y=bedY+three.modelHeight*visible+.65;three.machine.gantry.position.y=Math.max(2.2,three.machine.head.position.y+.52);if(printer().kinematics==='Mesa móvel')three.machine.bed.position.z=Math.sin(phase*.7)*depth*.42;three.machine.spool.rotation.z-=.006*(state.status==='printing'?1:0);}
    if(three.machine?.buildPlate){three.machine.buildPlate.position.y=bedY+three.modelHeight*visible+1.1;}
  }

  function fallbackDraw(){
    const canvas=$('#printCanvas3d');if(!canvas||three)return;const rect=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),w=Math.max(420,Math.floor(rect.width)),h=Math.max(380,Math.floor(rect.height));canvas.width=w*dpr;canvas.height=h*dpr;const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);const bg=c.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#061522');bg.addColorStop(1,'#17152b');c.fillStyle=bg;c.fillRect(0,0,w,h);c.strokeStyle='rgba(103,214,255,.18)';for(let x=20;x<w;x+=28){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}for(let y=20;y<h;y+=28){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
    const cx=w/2,base=h-70,frameW=Math.min(w*.68,430),frameH=Math.min(h*.7,300);c.strokeStyle='#7d91a5';c.lineWidth=8;c.strokeRect(cx-frameW/2,base-frameH,frameW,frameH);c.fillStyle='#26384a';c.fillRect(cx-frameW*.42,base-12,frameW*.84,18);const visible=state.status==='printing'||state.status==='paused'?state.progress/100:1,modelH=Math.min(frameH*.62,dimensions()[2]*1.2),modelW=Math.min(frameW*.48,dimensions()[0]*1.3);c.fillStyle=material().color;c.globalAlpha=.88;c.fillRect(cx-modelW/2,base-modelH*visible-12,modelW,modelH*visible);c.globalAlpha=1;c.fillStyle='#dbefff';c.font='700 16px system-ui';c.fillText(`${model().icon} ${state.model}`,22,30);c.fillStyle='#93afc4';c.font='12px system-ui';c.fillText('Fallback 2D — WebGL indisponível',22,50);
  }

  async function init3D(){
    const token=++runToken,canvas=$('#printCanvas3d');if(!canvas)return;
    let THREE;try{THREE=await import(THREE_URL);}catch(error){if(token===runToken){canvas.dataset.fallback='true';fallbackDraw();$('#printWebglStatus').textContent='Modo 2D de compatibilidade';}return;}
    if(token!==runToken||!root)return;destroy3D(false);
    try{
      const quality=ctx.core?.getSnapshot?.().settings?.graphics||'high',renderer=new THREE.WebGLRenderer({canvas,antialias:!['economy','low'].includes(quality),alpha:false,powerPreference:['economy','low'].includes(quality)?'low-power':'high-performance'}),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(46,1,.1,180),target=new THREE.Vector3();
      renderer.setPixelRatio(Math.min(['ultra','high'].includes(quality)?2:1.35,devicePixelRatio||1));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.shadowMap.enabled=!['economy','low'].includes(quality);scene.background=new THREE.Color(0x07111e);scene.fog=new THREE.Fog(0x07111e,32,72);
      scene.add(new THREE.HemisphereLight(0xc7efff,0x10141d,2.3));const key=new THREE.DirectionalLight(0xffffff,3.1);key.position.set(12,22,16);key.castShadow=renderer.shadowMap.enabled;scene.add(key);const rim=new THREE.PointLight(0x765cff,18,40);rim.position.set(-10,11,-8);scene.add(rim);const floor=mesh(THREE,new THREE.CircleGeometry(30,64),new THREE.MeshStandardMaterial({color:0x0b1724,roughness:.86,metalness:.06}),[0,-.54,0],[-Math.PI/2,0,0]);floor.receiveShadow=true;scene.add(floor);
      three={THREE,renderer,scene,camera,target,machineRoot:null,modelRoot:null,ghostRoot:null,supportRoot:null,layerMarker:null,machine:null,dragging:false,pointers:new Map(),lastTime:performance.now()};buildMachine(THREE);buildModel(THREE);bindOrbit(canvas);
      delete canvas.dataset.fallback;$('#printWebglStatus').textContent='WebGL 3D ativo';resize3D();animate3D();
    }catch(error){
      destroy3D(false);canvas.dataset.fallback='true';fallbackDraw();$('#printWebglStatus').textContent='Modo 2D de compatibilidade';console.warn('[Printing3D] WebGL indisponível; fallback 2D ativado.',error);
    }
  }

  function bindOrbit(canvas){
    const down=event=>{canvas.setPointerCapture?.(event.pointerId);three.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});three.dragging=true;};
    const move=event=>{if(!three?.pointers.has(event.pointerId))return;const prev=three.pointers.get(event.pointerId),dx=event.clientX-prev.x,dy=event.clientY-prev.y;three.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});if(three.pointers.size===1){state.cameraYaw-=dx*.008;state.cameraPitch=clamp(state.cameraPitch+dy*.006,-.02,1.25);updateCamera();}else if(three.pointers.size===2){const pts=[...three.pointers.values()],distance=Math.hypot(pts[0].x-pts[1].x,pts[0].y-pts[1].y),old=three.lastPinch||distance;state.cameraDistance=clamp(state.cameraDistance-(distance-old)*.025,7,42);three.lastPinch=distance;updateCamera();}};
    const up=event=>{three?.pointers.delete(event.pointerId);if(three){three.dragging=three.pointers.size>0;if(three.pointers.size<2)three.lastPinch=0;ctx.storage.set(KEY,state);}};
    const wheel=event=>{event.preventDefault();state.cameraDistance=clamp(state.cameraDistance+Math.sign(event.deltaY)*1.1,7,42);updateCamera();ctx.storage.set(KEY,state);};
    canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('wheel',wheel,{passive:false});canvas.addEventListener('dblclick',()=>setView('iso'));
    three.orbitCleanup=()=>{canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('wheel',wheel);};
  }
  function resize3D(){if(!three)return;const canvas=$('#printCanvas3d'),rect=canvas?.getBoundingClientRect();if(!rect?.width||!rect?.height)return;three.renderer.setSize(rect.width,Math.max(380,rect.height),false);three.camera.aspect=rect.width/Math.max(380,rect.height);three.camera.updateProjectionMatrix();}
  function animate3D(time=performance.now()){
    if(!three)return;const dt=Math.min(.05,(time-three.lastTime)/1000);three.lastTime=time;if(state.autoRotate&&!three.dragging){state.cameraYaw+=dt*.25;updateCamera();}updateSceneProgress(time);three.machineRoot.visible=state.showFrame;three.renderer.render(three.scene,three.camera);raf=requestAnimationFrame(animate3D);
  }
  function destroy3D(increment=true){if(increment)runToken++;cancelAnimationFrame(raf);raf=0;if(!three)return;three.orbitCleanup?.();three.renderer?.dispose?.();three.scene?.traverse?.(item=>{item.geometry?.dispose?.();if(Array.isArray(item.material))item.material.forEach(m=>m.dispose?.());else item.material?.dispose?.();});three=null;}
  function scheduleRebuild(machine=false){clearTimeout(rebuildTimer);rebuildTimer=setTimeout(()=>{if(three){if(machine)buildMachine(three.THREE);buildModel(three.THREE);}else fallbackDraw();},40);}

  function render(){
    const e=estimate(),errors=validate(),ready=preflightReady(),phase=statusProgress();
    $('#printLayers').textContent=e.layers.toLocaleString('pt-BR');$('#printTime').textContent=`${e.time.toFixed(1)} min`;$('#printMaterial').textContent=`${e.grams.toFixed(1)} g`;$('#printCost').textContent=e.cost.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    $('#printErrors').innerHTML=errors.length?errors.map(item=>`<li>${item}</li>`).join(''):'<li class="ok">Configuração tecnicamente coerente para a simulação.</li>';
    $('#printProgress').style.width=`${phase}%`;$('#printStatus').textContent=statusLabel();$('#printStatus').dataset.status=state.status;$('#printProgressText').textContent=`${phase.toFixed(0)}%`;
    $('#printerProfile').innerHTML=`<strong>${state.printer}</strong><span>${printer().kinematics} • ${printer().volume.join(' × ')} mm • ${printer().enclosed?'fechada':'aberta'}</span><p>${printer().detail}</p>`;
    $('#p3d-start').disabled=!ready||!['idle','done','done-with-errors'].includes(state.status);$('#p3d-pause').disabled=!['printing','paused'].includes(state.status);$('#p3d-pause').textContent=state.status==='paused'?'Continuar':'Pausar';$('#p3d-cancel').disabled=['idle','done','done-with-errors'].includes(state.status);
    $('#printPreflightBadge').textContent=ready?'Pré-voo concluído':'Preparação pendente';$('#printPreflightBadge').dataset.ready=String(ready);
    $('#telemetryNozzle').textContent=`${state.liveNozzle.toFixed(0)} / ${state.temp} °C`;$('#telemetryBed').textContent=printer().process==='FDM'?`${state.liveBed.toFixed(0)} / ${state.bed} °C`:'Tanque UV';$('#telemetryLayer').textContent=`${Math.round((state.progress/100)*e.layers)} / ${e.layers}`;$('#telemetryElapsed').textContent=`${Math.floor(state.elapsed/60)}:${String(Math.floor(state.elapsed%60)).padStart(2,'0')}`;$('#telemetryFlow').textContent=state.status==='printing'?`${Math.max(.4,(state.nozzle*state.layer*state.speed).toFixed(1))} mm³/s`:'0 mm³/s';$('#telemetryFan').textContent=`${state.fan}%`;
    $$('[data-preflight]').forEach(input=>{input.checked=Boolean(state.preflight[input.dataset.preflight]);});
    if(three){three.ghostRoot&&(three.ghostRoot.visible=state.showGhost);three.machineRoot&&(three.machineRoot.visible=state.showFrame);updateSceneProgress();}else fallbackDraw();ctx.storage.set(KEY,state);
  }

  function syncInputs(){
    const keys=['technology','printer','material','model','scale','layer','infill','supports','adhesion','nozzle','temp','bed','speed','fan'];
    for(const key of keys){const el=$(`#p3d-${key}`);if(!el)continue;if(el.type==='checkbox')el.checked=Boolean(state[key]);else el.value=state[key];el.addEventListener('input',()=>{state[key]=el.type==='checkbox'?el.checked:['number','range'].includes(el.type)?Number(el.value):el.value;let machineChanged=false;
      if(key==='printer'){state.technology=printer().process;$('#p3d-technology').value=state.technology;state.nozzle=printer().nozzle||.4;$('#p3d-nozzle').value=state.nozzle;if(printer().process==='SLA'){state.material='Resina';state.temp=25;state.bed=0;}else if(material().process!=='FDM'){state.material='PLA';state.temp=205;state.bed=60;}$('#p3d-material').value=state.material;$('#p3d-temp').value=state.temp;$('#p3d-bed').value=state.bed;machineChanged=true;}
      if(key==='technology'){const desired=Object.keys(PRINTERS).find(name=>PRINTERS[name].process===state.technology);if(desired){state.printer=desired;$('#p3d-printer').value=desired;}if(state.technology==='SLA'){state.material='Resina';state.temp=25;state.bed=0;}else if(material().process!=='FDM'){state.material='PLA';state.temp=205;state.bed=60;}$('#p3d-material').value=state.material;$('#p3d-temp').value=state.temp;$('#p3d-bed').value=state.bed;machineChanged=true;}
      if(key==='material'){const m=material();state.temp=clamp(state.temp,m.temp[0],m.temp[1]);state.bed=m.bed[0];$('#p3d-temp').value=state.temp;$('#p3d-bed').value=state.bed;}
      if(['printer','technology','material','model','scale','supports'].includes(key))scheduleRebuild(machineChanged);render();});}
    $$('[data-scene-toggle]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.sceneToggle;state[key]=!state[key];button.classList.toggle('active',state[key]);button.setAttribute('aria-pressed',String(state[key]));render();}));
  }

  function start(){
    if(timer)return;if(!preflightReady()){setTab('preparation');ctx.toast('Conclua a preparação antes de iniciar a impressão.','warning');return;}
    const errors=validate();if(errors.length&&!confirm(`Há ${errors.length} alerta(s). Iniciar para observar as falhas simuladas?`))return;
    state.status='heating';state.progress=0;state.phaseProgress=0;state.elapsed=0;state.liveNozzle=Math.min(state.liveNozzle,35);state.liveBed=Math.min(state.liveBed,35);timer=setInterval(tick,180);render();ctx.logEvent({eventType:'simulation',action:'Impressão 3D iniciada',status:'info',context:{printer:state.printer,material:state.material,model:state.model,technology:state.technology}});
  }
  function tick(){
    if(state.status==='paused')return;state.elapsed+=.18;
    if(state.status==='heating'){
      state.liveNozzle+=(state.temp-state.liveNozzle)*.075;state.liveBed+=(state.bed-state.liveBed)*.06;state.phaseProgress=Math.min(100,state.phaseProgress+2.4);if(state.phaseProgress>=100||Math.abs(state.temp-state.liveNozzle)<3){state.status='homing';state.phaseProgress=0;}
    }else if(state.status==='homing'){
      state.phaseProgress=Math.min(100,state.phaseProgress+4.5);if(state.phaseProgress>=100){state.status='printing';state.phaseProgress=0;}
    }else if(state.status==='printing'){
      const speedFactor=(state.speed/50)*Math.pow(.2/state.layer,.24),penalty=Math.min(.58,state.errors.length*.075);state.progress=Math.min(100,state.progress+Math.max(.16,.62*speedFactor*(1-penalty)));if(state.progress>=100){state.status='cooling';state.phaseProgress=0;}
    }else if(state.status==='cooling'){
      state.liveNozzle+=(35-state.liveNozzle)*.06;state.liveBed+=(30-state.liveBed)*.06;state.phaseProgress=Math.min(100,state.phaseProgress+3.4);if(state.phaseProgress>=100){finish();return;}
    }
    render();
  }
  function finish(){clearInterval(timer);timer=null;state.progress=100;state.status=state.errors.length?'done-with-errors':'done';state.history.push({at:new Date().toISOString(),printer:state.printer,material:state.material,model:state.model,estimate:estimate(),errors:[...state.errors]});state.history=state.history.slice(-20);if(!state.errors.length)ctx.core?.complete?.('printing3d:successful-print-v40',{complexity:'advanced',actions:16,reason:'Impressão 3D preparada, fatiada e concluída corretamente'});ctx.toast(state.errors.length?'Impressão concluída com defeitos simulados.':'Impressão concluída com sucesso.','success');render();}
  function pause(){if(state.status==='printing'){state.status='paused';}else if(state.status==='paused'){state.status='printing';}render();}
  function cancel(){clearInterval(timer);timer=null;state.status='idle';state.progress=0;state.phaseProgress=0;render();}

  function gcode(){
    const e=estimate(),lines=['; G-code educacional — NÃO enviar diretamente a uma impressora real',`; Impressora: ${state.printer}`,`; Modelo: ${state.model}`,`G21 ; milímetros`,`G90 ; coordenadas absolutas`,printer().process==='FDM'?`M104 S${state.temp}`:'; Processo SLA/MSLA não usa movimentos FDM reais',printer().process==='FDM'?`M140 S${state.bed}`:'; Exposição UV simulada','G28 ; home'];
    for(let layer=0;layer<Math.min(e.layers,220);layer++){const z=((layer+1)*state.layer).toFixed(2);lines.push(`;LAYER:${layer}`,`G1 Z${z} F1200`,`G1 X10 Y10 E${(layer*.8).toFixed(3)}`,`G1 X${10+e.dims[0].toFixed(1)} Y10 E${(layer*.8+1).toFixed(3)}`,`G1 X${10+e.dims[0].toFixed(1)} Y${10+e.dims[1].toFixed(1)} E${(layer*.8+2).toFixed(3)}`);}
    lines.push('M104 S0','M140 S0','M84');return lines.join('\n');
  }

  function template(){return `<div class="printing-lab printing-v40"><header class="printing-hero"><div><span class="eyebrow">FABRICAÇÃO ADITIVA • SIMULAÇÃO 3D INTERATIVA</span><h2>Impressão 3D e Modelagem</h2><p>Prepare a máquina, fatie modelos diferentes e acompanhe uma impressora FDM ou SLA em uma cena WebGL com câmera 360°, camadas, cabeçote e telemetria.</p></div><div class="printing-main-actions"><button id="p3d-start" class="btn primary" type="button">Iniciar impressão</button><button id="p3d-pause" class="btn secondary" type="button">Pausar</button><button id="p3d-cancel" class="btn secondary" type="button">Cancelar</button><button id="p3d-gcode" class="btn subtle" type="button">Baixar G-code</button></div></header><nav class="print-tabs"><button data-print-tab="simulate" class="active">Simulação 3D</button><button data-print-tab="preparation">Preparação</button><button data-print-tab="materials">Materiais</button><button data-print-tab="printers">Impressoras</button><button data-print-tab="models">Modelos</button></nav><section id="printSimulate" class="print-panel active"><div class="printing-layout-v40"><aside class="printing-settings"><h3>Fatiamento</h3><label>Tecnologia<select id="p3d-technology"><option>FDM</option><option>SLA</option></select></label><label>Impressora<select id="p3d-printer">${Object.keys(PRINTERS).map(x=>`<option>${x}</option>`).join('')}</select></label><label>Modelo<select id="p3d-model">${Object.keys(MODELS).map(x=>`<option>${x}</option>`).join('')}</select></label><label>Material<select id="p3d-material">${Object.keys(MATERIALS).map(x=>`<option>${x}</option>`).join('')}</select></label><label>Escala<input id="p3d-scale" type="range" min="25" max="200"><output id="p3d-scale-out"></output></label><label>Altura da camada<input id="p3d-layer" type="number" min=".05" max=".6" step=".05"></label><label>Preenchimento<input id="p3d-infill" type="range" min="0" max="100"></label><label class="check-row"><input id="p3d-supports" type="checkbox"> Gerar suportes</label><label>Aderência<select id="p3d-adhesion"><option>Saia</option><option>Borda</option><option>Raft</option><option>Nenhuma</option></select></label><label>Bico<input id="p3d-nozzle" type="number" min=".2" max="1.2" step=".1"></label><label>Bico/Resina °C<input id="p3d-temp" type="number" min="15" max="450"></label><label>Mesa °C<input id="p3d-bed" type="number" min="0" max="160"></label><label>Velocidade mm/s<input id="p3d-speed" type="number" min="10" max="250"></label><label>Ventilação %<input id="p3d-fan" type="range" min="0" max="100"></label></aside><div class="printing-stage-shell"><div class="printing-stage-toolbar"><div class="view-presets"><button data-print-view="iso" type="button">Perspectiva</button><button data-print-view="front" type="button">Frente</button><button data-print-view="side" type="button">Lado</button><button data-print-view="top" type="button">Topo</button></div><div class="scene-toggles"><button data-scene-toggle="autoRotate" aria-pressed="${state.autoRotate}" class="${state.autoRotate?'active':''}" type="button">Rotação automática</button><button data-scene-toggle="showFrame" aria-pressed="${state.showFrame}" class="${state.showFrame?'active':''}" type="button">Estrutura</button><button data-scene-toggle="showGhost" aria-pressed="${state.showGhost}" class="${state.showGhost?'active':''}" type="button">Modelo fantasma</button><button data-scene-toggle="showLayers" aria-pressed="${state.showLayers}" class="${state.showLayers?'active':''}" type="button">Camada atual</button><button id="p3d-fullscreen" type="button">Tela cheia</button></div></div><div class="printing-stage"><canvas id="printCanvas3d" aria-label="Simulação tridimensional interativa da impressora 3D"></canvas><div class="printing-stage-hud"><span id="printWebglStatus">Carregando cena 3D…</span><span id="printPreflightBadge">Preparação pendente</span></div><div class="printing-orbit-hint">Arraste para girar • Pinça ou rolagem para zoom • Toque duplo restaura</div></div><div class="print-progress-v40"><div><strong id="printStatus">Pronta</strong><span id="printProgressText">0%</span></div><i><b id="printProgress"></b></i></div><div class="printing-telemetry"><article><span>Bico</span><b id="telemetryNozzle"></b></article><article><span>Mesa/processo</span><b id="telemetryBed"></b></article><article><span>Camada</span><b id="telemetryLayer"></b></article><article><span>Tempo simulado</span><b id="telemetryElapsed"></b></article><article><span>Fluxo</span><b id="telemetryFlow"></b></article><article><span>Ventilação</span><b id="telemetryFan"></b></article></div></div><aside class="printing-info"><article id="printerProfile" class="printer-profile"></article><div class="printing-stats"><article><b id="printLayers"></b><span>camadas</span></article><article><b id="printTime"></b><span>tempo estimado</span></article><article><b id="printMaterial"></b><span>material</span></article><article><b id="printCost"></b><span>custo fictício</span></article></div><h3>Diagnóstico técnico</h3><ul id="printErrors"></ul><div class="state-card warning"><strong>Segurança</strong><p>Temperaturas e materiais são referências educacionais. Use perfis do fabricante, ventilação, EPIs e supervisão.</p></div></aside></div></section><section id="printPreparation" class="print-panel"><div class="printing-preflight-layout"><div><span class="eyebrow">CHECKLIST ANTES DE IMPRIMIR</span><h2>Preparação e calibração da máquina</h2><p>A simulação bloqueia o início enquanto as verificações essenciais não forem concluídas.</p><div class="preflight-checks"><label><input type="checkbox" data-preflight="bedClean"> Mesa ou tanque limpo e sem resíduos</label><label><input type="checkbox" data-preflight="level"> Nivelamento e referência dos eixos conferidos</label><label><input type="checkbox" data-preflight="materialLoaded"> Filamento carregado ou resina preparada</label><label><input type="checkbox" data-preflight="fileSliced"> Modelo fatiado e orientação revisada</label><label><input type="checkbox" data-preflight="safety"> Ventilação, EPI e área de movimento conferidos</label></div><button id="prepareDemo" class="btn primary" type="button">Preparar demonstração automaticamente</button></div><div class="preflight-diagram"><div class="printer-check-visual"><span>1</span><b>Inspecionar</b><i></i><span>2</span><b>Nivelar</b><i></i><span>3</span><b>Carregar</b><i></i><span>4</span><b>Fatiar</b><i></i><span>5</span><b>Imprimir</b></div><p>Em uma máquina real, os procedimentos variam por fabricante. A sequência serve para ensinar a lógica operacional.</p></div></div></section><section id="printMaterials" class="print-panel"><div class="material-guide-grid">${Object.entries(MATERIALS).map(([name,m])=>`<article style="--material-color:${m.color}"><span class="material-chip">${m.process}</span><h3>${name}</h3><strong>${m.difficulty}</strong><p>${m.use}</p><dl><dt>Faixa principal</dt><dd>${m.process==='FDM'?`${m.temp[0]}–${m.temp[1]} °C / mesa ${m.bed[0]}–${m.bed[1]} °C`:'Ambiente recomendado 20–30 °C'}</dd><dt>Atenção</dt><dd>${m.notes}</dd></dl></article>`).join('')}</div></section><section id="printPrinters" class="print-panel"><div class="printer-compare-grid">${Object.entries(PRINTERS).map(([name,p])=>`<article><span>${p.process} • ${p.level}</span><h3>${name}</h3><p>${p.detail}</p><dl><dt>Cinemática</dt><dd>${p.kinematics}</dd><dt>Volume</dt><dd>${p.volume.join(' × ')} mm</dd><dt>Temperatura máxima</dt><dd>${p.maxTemp} °C</dd><dt>Gabinete</dt><dd>${p.enclosed?'Fechado':'Aberto'}</dd></dl><button class="btn secondary" data-printer-pick="${name}" type="button">Usar esta impressora</button></article>`).join('')}</div></section><section id="printModels" class="print-panel"><div class="model-library-grid">${Object.entries(MODELS).map(([name,m])=>`<article><div class="model-thumb">${m.icon}</div><span>${m.complexity}</span><h3>${name}</h3><p>${m.description}</p><small>${m.dims.join(' × ')} mm • ${m.supports?'pode exigir suportes':'normalmente sem suporte'}</small><button class="btn secondary" data-model-pick="${name}" type="button">Usar no fatiador</button></article>`).join('')}</div></section></div>`;}

  function setTab(tab){state.tab=tab;$$('[data-print-tab]').forEach(b=>b.classList.toggle('active',b.dataset.printTab===tab));$$('.print-panel').forEach(p=>p.classList.toggle('active',p.id===`print${tab[0].toUpperCase()}${tab.slice(1)}`));ctx.storage.set(KEY,state);if(tab==='simulate')setTimeout(()=>{resize3D();fallbackDraw();},40);}

  async function mount(host,context){
    root=host;ctx=context;state=normalize(await ctx.storage.get(KEY,{}));root.innerHTML=template();
    $$('[data-print-tab]').forEach(b=>b.onclick=()=>setTab(b.dataset.printTab));$$('[data-model-pick]').forEach(b=>b.onclick=()=>{state.model=b.dataset.modelPick;$('#p3d-model').value=state.model;setTab('simulate');scheduleRebuild();render();});$$('[data-printer-pick]').forEach(b=>b.onclick=()=>{state.printer=b.dataset.printerPick;state.technology=printer().process;if(state.technology==='SLA'){state.material='Resina';state.temp=25;state.bed=0;}else if(material().process!=='FDM'){state.material='PLA';state.temp=205;state.bed=60;}$('#p3d-printer').value=state.printer;$('#p3d-technology').value=state.technology;$('#p3d-material').value=state.material;$('#p3d-temp').value=state.temp;$('#p3d-bed').value=state.bed;setTab('simulate');scheduleRebuild(true);render();});
    syncInputs();$$('[data-print-view]').forEach(button=>button.onclick=()=>setView(button.dataset.printView));$$('[data-preflight]').forEach(input=>input.onchange=()=>{state.preflight[input.dataset.preflight]=input.checked;render();});
    $('#prepareDemo').onclick=()=>{Object.keys(state.preflight).forEach(key=>state.preflight[key]=true);ctx.toast('Checklist preparado para a demonstração.','success');render();};$('#p3d-start').onclick=start;$('#p3d-pause').onclick=pause;$('#p3d-cancel').onclick=cancel;$('#p3d-gcode').onclick=()=>ctx.exporter.download(gcode(),`modelo-${Date.now()}.gcode`,'text/plain;charset=utf-8');$('#p3d-fullscreen').onclick=()=>{const stage=$('.printing-stage-shell');if(document.fullscreenElement)document.exitFullscreen?.();else stage?.requestFullscreen?.();};
    setTab(state.tab);resizeObserver=new ResizeObserver(()=>{resize3D();fallbackDraw();});resizeObserver.observe($('#printCanvas3d'));render();init3D();
  }
  async function unmount(){clearInterval(timer);timer=null;clearTimeout(rebuildTimer);resizeObserver?.disconnect();destroy3D();await ctx?.storage?.set?.(KEY,state);root=null;ctx=null;state=null;}
  function exportPayload(){return{text:`IMPRESSÃO 3D\nImpressora: ${state.printer}\nTecnologia: ${state.technology}\nModelo: ${state.model}\nMaterial: ${state.material}\nProgresso: ${Math.round(state.progress)}%\nStatus: ${statusLabel()}\nAlertas: ${state.errors.length}`,native:gcode(),backup:state,meta:[{label:'Visualização',value:'WebGL 3D / fallback 2D'},{label:'Preparação',value:preflightReady()?'Concluída':'Pendente'}]};}
  function help(){return'<p>Conclua o checklist de preparação, selecione impressora, modelo e material e use a câmera 360° para inspecionar a máquina. A simulação mostra aquecimento, homing, deposição de camadas e resfriamento. O G-code é educacional e não deve ser enviado diretamente a uma máquina real.</p>';}
  window.LABDS_LABS['printing3d-lab']={mount,unmount,exportPayload,help};
})();
