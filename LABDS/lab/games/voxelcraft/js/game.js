const THREE_URL='../../../vendor/three/three.module.min.js';

export async function startGame({quality='medium',mode='learning',fov=78,sensitivity=1,selected,saved,onCollect=()=>{},onInventoryChange=()=>{},onHud=()=>{},onProgress=()=>{}}){
  let THREE;
  try{THREE=await import(THREE_URL);}catch(error){throw new Error('O renderizador 3D local não pôde ser carregado. Recarregue a página ou republique a pasta vendor/three.');}
  const host=document.getElementById('game3d');
  if(!host)throw new Error('Área de renderização não encontrada.');
  if(!window.WebGLRenderingContext&&!window.WebGL2RenderingContext)throw new Error('Este navegador ou aparelho não oferece WebGL para executar o jogo 3D.');

  const mobile=matchMedia('(pointer:coarse)').matches;
  const presets={
    economy:{view:1,pixel:.48,shadow:false,animals:0,trees:5,grass:0,clouds:0,queuePerFrame:1,fog:.045},
    low:{view:2,pixel:.62,shadow:false,animals:3,trees:10,grass:0,clouds:3,queuePerFrame:1,fog:.032},
    medium:{view:3,pixel:.82,shadow:false,animals:6,trees:22,grass:100,clouds:6,queuePerFrame:1,fog:.023},
    high:{view:5,pixel:Math.min(devicePixelRatio,1.25),shadow:true,animals:12,trees:45,grass:350,clouds:12,queuePerFrame:2,fog:.014},
    ultra:{view:8,pixel:Math.min(devicePixelRatio,2),shadow:true,animals:28,trees:110,grass:1200,clouds:28,queuePerFrame:3,fog:.007}
  };
  const cfg={...(presets[quality]||presets.medium)};
  if(mobile&&['economy','low','medium'].includes(quality)){cfg.view=Math.min(cfg.view,3);cfg.pixel=Math.min(cfg.pixel,.9);cfg.animals=Math.min(cfg.animals,6);cfg.trees=Math.min(cfg.trees,24);cfg.grass=Math.min(cfg.grass,120);cfg.clouds=Math.min(cfg.clouds,6);cfg.queuePerFrame=1;}

  const scene=new THREE.Scene();scene.background=new THREE.Color(0x91d7ff);scene.fog=new THREE.FogExp2(0x91d7ff,cfg.fog);
  const size=()=>({width:Math.max(1,host.clientWidth||innerWidth),height:Math.max(1,host.clientHeight||innerHeight)});
  const initial=size();
  const camera=new THREE.PerspectiveCamera(fov,initial.width/initial.height,.08,360);
  const renderer=new THREE.WebGLRenderer({antialias:!['low','economy'].includes(quality),powerPreference:quality==='ultra'?'high-performance':'default'});
  renderer.setPixelRatio(cfg.pixel);renderer.setSize(initial.width,initial.height,false);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.shadowMap.enabled=cfg.shadow;
  if(cfg.shadow)renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  host.replaceChildren(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xdaf3ff,0x334727,2.1));
  const sun=new THREE.DirectionalLight(0xfff1cf,3);sun.position.set(35,60,24);sun.castShadow=cfg.shadow;
  if(cfg.shadow){const shadowSize=Math.min(quality==='ultra'?4096:2048,renderer.capabilities.maxTextureSize||2048);sun.shadow.mapSize.set(shadowSize,shadowSize);sun.shadow.camera.left=-80;sun.shadow.camera.right=80;sun.shadow.camera.top=80;sun.shadow.camera.bottom=-80;}
  scene.add(sun);

  const atlas=document.createElement('canvas');atlas.width=288;atlas.height=32;const atlasCtx=atlas.getContext('2d');
  const tileColors=['#5fae52','#78543a','#70787f','#8b5a2b','#3e8b45','#d9c27a','#f06529','#2965f1','#f0db4f'];
  tileColors.forEach((color,index)=>{const gradient=atlasCtx.createLinearGradient(index*32,0,index*32+32,32);gradient.addColorStop(0,color);gradient.addColorStop(1,'#26333a');atlasCtx.fillStyle=gradient;atlasCtx.fillRect(index*32,0,32,32);const noise=quality==='ultra'?90:quality==='high'?55:25;for(let n=0;n<noise;n++){atlasCtx.fillStyle=`rgba(${Math.random()>.5?'255,255,255':'0,0,0'},${.03+Math.random()*.15})`;atlasCtx.fillRect(index*32+Math.random()*31,Math.random()*31,1+Math.random()*3,1+Math.random()*3);}});
  const texture=new THREE.CanvasTexture(atlas);texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;

  const CHUNK=12,HEIGHT=36,TILES=9;
  const edits=new Map(Array.isArray(saved?.edits)?saved.edits:[]),chunks=new Map(),queue=[];
  const type={grass:0,dirt:1,stone:2,wood:3,leaves:4,sand:5,html:6,css:7,javascript:8};
  const key3=(x,y,z)=>`${x},${y},${z}`,chunkKey=(cx,cz)=>`${cx},${cz}`;
  const terrainHeight=(x,z)=>Math.floor(5+Math.sin(x*.08)*5+Math.cos(z*.07)*4+Math.sin((x+z)*.035)*8+Math.cos(Math.hypot(x,z)*.035)*4);
  const isCave=(x,y,z)=>y<8&&Math.sin(x*.31+y*.51)*Math.cos(z*.29-y*.22)>.68;
  function block(x,y,z){const key=key3(x,y,z);if(edits.has(key))return edits.get(key);const top=terrainHeight(x,z);if(y>top||y<-7||isCave(x,y,z))return null;if(y===top)return top<1?type.sand:type.grass;if(y>top-4)return type.dirt;return type.stone;}
  function uv(tile,u,v){const step=1/TILES;return[tile*step+u*step,v];}
  function addQuad(buffer,origin,du,dv,tile,flip){const base=buffer.positions.length/3;const points=[origin,[origin[0]+du[0],origin[1]+du[1],origin[2]+du[2]],[origin[0]+du[0]+dv[0],origin[1]+du[1]+dv[1],origin[2]+du[2]+dv[2]],[origin[0]+dv[0],origin[1]+dv[1],origin[2]+dv[2]]];points.forEach(point=>buffer.positions.push(...point));buffer.uvs.push(...uv(tile,0,1),...uv(tile,1,1),...uv(tile,1,0),...uv(tile,0,0));if(flip)buffer.indices.push(base,base+2,base+1,base,base+3,base+2);else buffer.indices.push(base,base+1,base+2,base,base+2,base+3);}
  function meshChunk(cx,cz){
    const dims=[CHUNK,HEIGHT+8,CHUNK],offset=[cx*CHUNK,-7,cz*CHUNK],buffer={positions:[],uvs:[],indices:[]};
    for(let axis=0;axis<3;axis++){
      const u=(axis+1)%3,v=(axis+2)%3,x=[0,0,0],q=[0,0,0];q[axis]=1;const mask=new Array(dims[u]*dims[v]);
      for(x[axis]=-1;x[axis]<dims[axis];){
        let n=0;
        for(x[v]=0;x[v]<dims[v];x[v]++)for(x[u]=0;x[u]<dims[u];x[u]++){
          const a=x[axis]>=0?block(offset[0]+x[0],offset[1]+x[1],offset[2]+x[2]):null;
          const b=x[axis]<dims[axis]-1?block(offset[0]+x[0]+q[0],offset[1]+x[1]+q[1],offset[2]+x[2]+q[2]):null;
          mask[n++]=(a!==null&&b===null)?{t:a,back:false}:(b!==null&&a===null)?{t:b,back:true}:null;
        }
        x[axis]++;n=0;
        for(let j=0;j<dims[v];j++)for(let i=0;i<dims[u];){
          const cell=mask[n];if(!cell){i++;n++;continue;}
          let width=1;while(i+width<dims[u]){const next=mask[n+width];if(!next||next.t!==cell.t||next.back!==cell.back)break;width++;}
          let height=1;outer:for(;j+height<dims[v];height++)for(let k=0;k<width;k++){const next=mask[n+k+height*dims[u]];if(!next||next.t!==cell.t||next.back!==cell.back)break outer;}
          x[u]=i;x[v]=j;const origin=[offset[0]+x[0],offset[1]+x[1],offset[2]+x[2]],du=[0,0,0],dv=[0,0,0];du[u]=width;dv[v]=height;
          if(cell.back)addQuad(buffer,origin,dv,du,cell.t,true);else addQuad(buffer,origin,du,dv,cell.t,false);
          for(let row=0;row<height;row++)for(let col=0;col<width;col++)mask[n+col+row*dims[u]]=null;
          i+=width;n+=width;
        }
      }
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(buffer.positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(buffer.uvs,2));geometry.setIndex(buffer.indices);geometry.computeVertexNormals();return geometry;
  }
  const terrainMaterial=new THREE.MeshStandardMaterial({map:texture,roughness:.9});
  function buildChunk(cx,cz){const key=chunkKey(cx,cz);if(chunks.has(key))return;const mesh=new THREE.Mesh(meshChunk(cx,cz),terrainMaterial);mesh.castShadow=cfg.shadow;mesh.receiveShadow=cfg.shadow;scene.add(mesh);chunks.set(key,mesh);}
  let playerChunk={x:0,z:0};
  function enqueueAround(x,z){
    const pcx=Math.floor(x/CHUNK),pcz=Math.floor(z/CHUNK);playerChunk={x:pcx,z:pcz};const wanted=[];
    for(let cx=pcx-cfg.view;cx<=pcx+cfg.view;cx++)for(let cz=pcz-cfg.view;cz<=pcz+cfg.view;cz++){const key=chunkKey(cx,cz);if(!chunks.has(key))wanted.push({cx,cz,d:(cx-pcx)**2+(cz-pcz)**2});}
    wanted.sort((a,b)=>a.d-b.d);queue.splice(0,queue.length,...wanted);
    for(const [key,mesh] of chunks){const [cx,cz]=key.split(',').map(Number);if(Math.abs(cx-pcx)>cfg.view+1||Math.abs(cz-pcz)>cfg.view+1){scene.remove(mesh);mesh.geometry.dispose();chunks.delete(key);}}
  }
  function processQueue(){for(let i=0;i<cfg.queuePerFrame;i++){const next=queue.shift();if(!next)break;if(Math.abs(next.cx-playerChunk.x)<=cfg.view&&Math.abs(next.cz-playerChunk.z)<=cfg.view)buildChunk(next.cx,next.cz);}}

  const savedPlayer=saved?.player||{},savedStats=saved?.stats||{};
  const player={pos:new THREE.Vector3(Number(savedPlayer.x)||0,Number(savedPlayer.y)||11,Number(savedPlayer.z)||5),vy:0,yaw:0,pitch:-.12,onGround:false,health:Number.isFinite(savedPlayer.health)?savedPlayer.health:100,hunger:Number.isFinite(savedPlayer.hunger)?savedPlayer.hunger:100,camera:'first'};
  const stats={xp:Number(savedStats.xp)||0,broken:Number(savedStats.broken)||0,placed:Number(savedStats.placed)||0,distance:Number(savedStats.distance)||0,collected:Number(savedStats.collected)||0};
  let lastDistancePos=player.pos.clone();enqueueAround(player.pos.x,player.pos.z);

  const avatar=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(.65,1,.38),new THREE.MeshStandardMaterial({color:0x3b8bd8}));const head=new THREE.Mesh(new THREE.BoxGeometry(.58,.58,.58),new THREE.MeshStandardMaterial({color:0xf0c8a0}));body.position.y=.65;head.position.y=1.42;avatar.add(body,head);scene.add(avatar);
  const animals=[];for(let i=0;i<cfg.animals;i++){const group=new THREE.Group(),mat=new THREE.MeshStandardMaterial({color:i%3===0?0xf1f1f1:i%3===1?0xb9875f:0x9b7653}),animalBody=new THREE.Mesh(new THREE.BoxGeometry(1,.65,.5),mat),animalHead=new THREE.Mesh(new THREE.BoxGeometry(.48,.48,.48),mat);animalHead.position.set(.65,.15,0);group.add(animalBody,animalHead);group.userData={dir:Math.random()*Math.PI};group.position.set((Math.random()-.5)*100,terrainHeight(0,0)+1,(Math.random()-.5)*100);scene.add(group);animals.push(group);}
  const treePositions=[];
  if(cfg.trees){const trunkMaterial=new THREE.MeshStandardMaterial({color:0x7a4b24}),leafMaterial=new THREE.MeshStandardMaterial({color:0x397c42});for(let i=0;i<cfg.trees;i++){const x=(Math.random()-.5)*180,z=(Math.random()-.5)*180,y=terrainHeight(x,z)+1;if(y<2)continue;const trunk=new THREE.Mesh(new THREE.BoxGeometry(.8,3,.8),trunkMaterial),leaf=new THREE.Mesh(new THREE.BoxGeometry(3,2.4,3),leafMaterial);trunk.position.set(x,y+1,z);leaf.position.set(x,y+3,z);treePositions.push({x,z,y});trunk.castShadow=leaf.castShadow=cfg.shadow;scene.add(trunk,leaf);}}
  if(cfg.grass){const grassMaterial=new THREE.MeshBasicMaterial({color:0x58a94f,side:THREE.DoubleSide});for(let i=0;i<cfg.grass;i++){const x=(Math.random()-.5)*170,z=(Math.random()-.5)*170,y=terrainHeight(x,z)+.45;const blade=new THREE.Mesh(new THREE.PlaneGeometry(.12,.65),grassMaterial);blade.position.set(x,y,z);blade.rotation.y=Math.random()*Math.PI;scene.add(blade);}}
  const clouds=[];
  if(cfg.clouds){const cloudMaterial=new THREE.MeshStandardMaterial({color:0xffffff,transparent:true,opacity:.85,roughness:1});for(let i=0;i<cfg.clouds;i++){const cloud=new THREE.Mesh(new THREE.BoxGeometry(6+Math.random()*8,1.2,3+Math.random()*5),cloudMaterial);cloud.position.set((Math.random()-.5)*180,24+Math.random()*18,(Math.random()-.5)*180);cloud.userData.speed=.35+Math.random()*.55;clouds.push(cloud);scene.add(cloud);}}
  const waterMaterial=new THREE.MeshPhysicalMaterial({color:0x318dcc,transparent:true,opacity:quality==='ultra'?.72:.6,roughness:quality==='ultra'?.12:.28,metalness:.08,depthWrite:false});
  const water=new THREE.Mesh(new THREE.PlaneGeometry(420,420),waterMaterial);water.rotation.x=-Math.PI/2;water.position.y=.18;water.receiveShadow=cfg.shadow;scene.add(water);
  const selection=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.012,1.012,1.012)),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.9}));selection.visible=false;scene.add(selection);

  let current=selected,paused=false,running=true,last=performance.now(),fps=0,frames=0,fpsAt=last,chunkTimer=0,hudTimer=0,progressTimer=0,animationId=0;
  const keys={};
  const keyDown=event=>{const key=event.key.toLowerCase();keys[key]=true;if(key==='f'){consumeItem();event.preventDefault();}if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(key))event.preventDefault();};
  const keyUp=event=>{keys[event.key.toLowerCase()]=false;};
  const mouseMove=event=>{if(document.pointerLockElement!==renderer.domElement||paused)return;player.yaw-=event.movementX*.0024*sensitivity;player.pitch=Math.max(-1.4,Math.min(1.4,player.pitch-event.movementY*.0024*sensitivity));};
  const canvasClick=()=>{if(!paused)renderer.domElement.requestPointerLock?.();};
  addEventListener('keydown',keyDown);addEventListener('keyup',keyUp);document.addEventListener('mousemove',mouseMove);renderer.domElement.addEventListener('click',canvasClick);

  const moveJoy={x:0,y:0},lookJoy={x:0,y:0},joystickCleanups=[];
  function bindJoystick(id,target){const root=document.getElementById(id);if(!root)return()=>{};const stick=root.querySelector('.stick');let active=null;const update=event=>{const rect=root.getBoundingClientRect(),dx=event.clientX-(rect.left+rect.width/2),dy=event.clientY-(rect.top+rect.height/2),max=rect.width*.32,length=Math.hypot(dx,dy)||1,scale=Math.min(1,max/length),x=dx*scale,y=dy*scale;stick.style.transform=`translate(calc(-50% + ${x}px),calc(-50% + ${y}px))`;target.x=x/max;target.y=y/max;};const down=event=>{active=event.pointerId;root.setPointerCapture(active);update(event);};const move=event=>{if(event.pointerId===active)update(event);};const end=event=>{if(event.pointerId!==active)return;active=null;target.x=target.y=0;stick.style.transform='translate(-50%,-50%)';};root.addEventListener('pointerdown',down);root.addEventListener('pointermove',move);root.addEventListener('pointerup',end);root.addEventListener('pointercancel',end);return()=>{root.removeEventListener('pointerdown',down);root.removeEventListener('pointermove',move);root.removeEventListener('pointerup',end);root.removeEventListener('pointercancel',end);};}
  joystickCleanups.push(bindJoystick('moveJoystick',moveJoy),bindJoystick('lookJoystick',lookJoy));

  const raycaster=new THREE.Raycaster();raycaster.far=7;
  function targetBlock(place=false){raycaster.setFromCamera(new THREE.Vector2(0,0),camera);const hit=raycaster.intersectObjects([...chunks.values()],false)[0];if(!hit)return null;const point=hit.point.clone().add(hit.face.normal.clone().multiplyScalar(place?.01:-.01));return{x:Math.floor(point.x),y:Math.floor(point.y),z:Math.floor(point.z)};}
  function rebuildAt(x,z){const cx=Math.floor(x/CHUNK),cz=Math.floor(z/CHUNK),key=chunkKey(cx,cz),old=chunks.get(key);if(old){scene.remove(old);old.geometry.dispose();chunks.delete(key);}buildChunk(cx,cz);}
  const resourceForType=value=>value===type.wood?'Madeira':value===type.stone?'Pedra':value===type.dirt?'CSS':value===type.sand?'JavaScript':'HTML';
  const blockForItem=item=>item?.name==='CSS'?type.css:item?.name==='JavaScript'?type.javascript:item?.name==='Madeira'?type.wood:item?.name==='Pedra'?type.stone:type.html;
  function breakBlock(){if(paused)return;const target=targetBlock(false);if(!target)return;const old=block(target.x,target.y,target.z);if(old===null)return;edits.set(key3(target.x,target.y,target.z),null);stats.broken++;stats.collected++;stats.xp+=mode==='challenge'?8:4;onCollect(resourceForType(old),1);rebuildAt(target.x,target.z);emitProgress(true);}
  function consumeItem(){if(paused||current?.name!=='Maçã'||current.count<=0)return false;current.count--;player.hunger=Math.min(100,player.hunger+32);player.health=Math.min(100,player.health+6);stats.collected++;onInventoryChange();onProgress({...missionData(),xp:stats.xp,lesson:'Consumir é uma ação separada de construir. A maçã restaura energia e não cria blocos.',code:'inventory.apple--; player.hunger += 32;'});return true;}
  function placeBlock(){if(paused)return;if(current?.name==='Maçã'){consumeItem();return;}const target=targetBlock(true);if(!target||!current||current.count<=0)return;edits.set(key3(target.x,target.y,target.z),blockForItem(current));current.count--;onInventoryChange();stats.placed++;stats.xp+=mode==='challenge'?10:5;rebuildAt(target.x,target.z);emitProgress(true);}
  const mouseDown=event=>{if(event.button===0)breakBlock();if(event.button===2)placeBlock();};
  const contextMenu=event=>event.preventDefault();renderer.domElement.addEventListener('mousedown',mouseDown);renderer.domElement.addEventListener('contextmenu',contextMenu);
  const actionHandlers=[];document.querySelectorAll('[data-action]').forEach(button=>{const handler=()=>{const action=button.dataset.action;if(action==='jump'&&player.onGround)player.vy=7.5;if(action==='crouch')keys.c=!keys.c;if(action==='primary')breakBlock();if(action==='secondary')placeBlock();if(action==='consume')consumeItem();};button.addEventListener('pointerdown',handler);actionHandlers.push([button,handler]);});

  function solid(x,y,z){return block(Math.round(x),Math.floor(y),Math.round(z))!==null;}
  function floorY(x,z){for(let y=HEIGHT;y>=-8;y--)if(solid(x,y,z))return y+.5;return-7.5;}
  function missionData(){
    if(mode==='free')return{title:'Exploração livre',progress:100,lesson:'Explore, construa e observe como o mundo é carregado progressivamente.',code:'requestAnimationFrame(gameLoop);'};
    const target=mode==='challenge'?{broken:12,placed:8,distance:120}:{broken:4,placed:3,distance:45};
    const parts=[Math.min(1,stats.broken/target.broken),Math.min(1,stats.placed/target.placed),Math.min(1,stats.distance/target.distance)];
    const progress=(parts.reduce((sum,value)=>sum+value,0)/parts.length)*100;
    const title=progress>=100?(mode==='challenge'?'Desafio concluído':'Missão concluída'):`Quebre ${target.broken}, construa ${target.placed} e explore ${target.distance} m`;
    let lesson='Os chunks próximos ao jogador são criados primeiro e os distantes são descartados para controlar memória e GPU.';
    let code='enqueueAround(player.x, player.z);';
    if(stats.broken<target.broken){lesson='Quebrar um bloco altera o estado do mundo, atualiza o inventário e reconstrói apenas o chunk afetado.';code='edits.set(blockKey, null); rebuildChunk();';}
    else if(stats.placed<target.placed){lesson='Construir consome um item do inventário e registra uma alteração persistente no mundo.';code='inventory.count--; edits.set(blockKey, blockType);';}
    else if(stats.distance<target.distance){lesson='Movimento, câmera e streaming trabalham juntos enquanto o jogador atravessa diferentes chunks.';code='player.position += velocity * deltaTime;';}
    return{title,progress,lesson,code};
  }
  function emitProgress(force=false){const now=performance.now();if(!force&&now-progressTimer<500)return;progressTimer=now;onProgress({...missionData(),xp:stats.xp,broken:stats.broken,placed:stats.placed,distance:Math.round(stats.distance),collected:stats.collected});}

  function update(delta,time){
    if(paused)return;
    player.yaw-=lookJoy.x*delta*2.6*sensitivity;player.pitch=Math.max(-1.4,Math.min(1.4,player.pitch-lookJoy.y*delta*2.1*sensitivity));
    const forward=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0)-moveJoy.y;
    const strafe=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+moveJoy.x;
    if((keys[' ']||keys.space)&&player.onGround)player.vy=7.5;
    const fw=new THREE.Vector3(-Math.sin(player.yaw),0,-Math.cos(player.yaw)),right=new THREE.Vector3(Math.cos(player.yaw),0,-Math.sin(player.yaw)),movement=new THREE.Vector3().addScaledVector(fw,forward).addScaledVector(right,strafe),speed=keys.c?2:keys.shift?8:4.5;
    if(movement.lengthSq()){movement.normalize().multiplyScalar(speed*delta);const next=player.pos.clone().add(movement),bodyY=player.pos.y-1;const hitsTree=treePositions.some(tree=>Math.hypot(tree.x-next.x,tree.z-next.z)<.82&&bodyY<tree.y+3&&bodyY+1.8>tree.y);if(!solid(next.x,bodyY,next.z)&&!solid(next.x,bodyY+.8,next.z)&&!hitsTree)player.pos.copy(next);}
    player.vy-=18*delta;player.pos.y+=player.vy*delta;const ground=floorY(player.pos.x,player.pos.z)+(keys.c?1.25:1.72);if(player.pos.y<=ground){player.pos.y=ground;player.vy=0;player.onGround=true;}else player.onGround=false;
    player.hunger=Math.max(0,player.hunger-delta*.16);if(player.hunger===0)player.health=Math.max(0,player.health-delta);if(player.health<=0){player.health=100;player.hunger=70;player.pos.set(0,11,5);}
    stats.distance+=player.pos.distanceTo(lastDistancePos);lastDistancePos.copy(player.pos);
    chunkTimer-=delta;if(chunkTimer<=0){chunkTimer=.25;enqueueAround(player.pos.x,player.pos.z);}processQueue();
    avatar.position.set(player.pos.x,player.pos.y-1.65,player.pos.z);avatar.rotation.y=player.yaw;avatar.visible=player.camera==='third';
    if(player.camera==='first'){camera.position.copy(player.pos);camera.rotation.order='YXZ';camera.rotation.y=player.yaw;camera.rotation.x=player.pitch;}else{camera.position.copy(player.pos).add(new THREE.Vector3(Math.sin(player.yaw)*5,2.5,Math.cos(player.yaw)*5));camera.lookAt(player.pos);}
    animals.forEach((animal,index)=>{animal.userData.dir+=Math.sin(time*.0004+index)*delta*.15;animal.position.x+=Math.cos(animal.userData.dir)*delta*.3;animal.position.z+=Math.sin(animal.userData.dir)*delta*.3;animal.position.y=floorY(animal.position.x,animal.position.z)+.7+Math.sin(time*.004+index)*.035;animal.rotation.y=-animal.userData.dir;});
    clouds.forEach((cloud,index)=>{cloud.position.x+=cloud.userData.speed*delta;if(cloud.position.x>105)cloud.position.x=-105;cloud.position.y+=Math.sin(time*.00035+index)*delta*.03;});
    water.position.y=.18+Math.sin(time*.0007)*.035;waterMaterial.opacity=(quality==='ultra'?.7:.58)+Math.sin(time*.0005)*.025;
    const target=targetBlock(false);selection.visible=Boolean(target);if(target)selection.position.set(target.x+.5,target.y+.5,target.z+.5);
    const daylight=.78+Math.sin(time*.000025)*.22;sun.intensity=2.25+daylight*.95;sun.position.x=Math.cos(time*.000025)*58;sun.position.y=36+daylight*35;sun.position.z=Math.sin(time*.000025)*44;
    emitProgress();
  }
  function loop(time){if(!running)return;const delta=Math.min(.033,(time-last)/1000);last=time;update(delta,time);renderer.render(scene,camera);frames++;if(time-fpsAt>500){fps=frames*1000/(time-fpsAt);frames=0;fpsAt=time;}if(time-hudTimer>180){hudTimer=time;const mission=missionData();onHud({fps,chunks:chunks.size,triangles:renderer.info.render.triangles,health:player.health,hunger:player.hunger,xp:stats.xp,lesson:mission.lesson,code:mission.code});}animationId=requestAnimationFrame(loop);}
  animationId=requestAnimationFrame(loop);

  const resize=()=>{const next=size();camera.aspect=next.width/next.height;camera.updateProjectionMatrix();renderer.setSize(next.width,next.height,false);};
  addEventListener('resize',resize);
  const contextLost=event=>{event.preventDefault();paused=true;onProgress({title:'Renderização interrompida',progress:0,lesson:'O contexto WebGL foi perdido. Salve o mundo e recarregue o jogo.',code:'webglcontextlost'});};
  const contextRestored=()=>{paused=false;};renderer.domElement.addEventListener('webglcontextlost',contextLost);renderer.domElement.addEventListener('webglcontextrestored',contextRestored);
  emitProgress(true);

  function destroy(){
    running=false;cancelAnimationFrame(animationId);document.exitPointerLock?.();
    removeEventListener('keydown',keyDown);removeEventListener('keyup',keyUp);removeEventListener('resize',resize);document.removeEventListener('mousemove',mouseMove);
    renderer.domElement.removeEventListener('click',canvasClick);renderer.domElement.removeEventListener('mousedown',mouseDown);renderer.domElement.removeEventListener('contextmenu',contextMenu);renderer.domElement.removeEventListener('webglcontextlost',contextLost);renderer.domElement.removeEventListener('webglcontextrestored',contextRestored);
    joystickCleanups.forEach(cleanup=>cleanup());actionHandlers.forEach(([button,handler])=>button.removeEventListener('pointerdown',handler));
    const geometries=new Set(),materials=new Set(),textures=new Set();scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);const list=Array.isArray(object.material)?object.material:[object.material];list.filter(Boolean).forEach(material=>{materials.add(material);if(material.map)textures.add(material.map);});});geometries.forEach(geometry=>geometry.dispose?.());materials.forEach(material=>material.dispose?.());textures.forEach(map=>map.dispose?.());texture.dispose();renderer.dispose();host.replaceChildren();
  }
  return{
    setPaused:value=>{paused=Boolean(value);if(paused)document.exitPointerLock?.();last=performance.now();},
    setSelected:item=>{current=item;},
    toggleCamera:()=>{player.camera=player.camera==='first'?'third':'first';},
    serialize:()=>({version:10,quality,mode,player:{x:player.pos.x,y:player.pos.y,z:player.pos.z,health:player.health,hunger:player.hunger},stats:{...stats},edits:[...edits]}),
    destroy
  };
}
