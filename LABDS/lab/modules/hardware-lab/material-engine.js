'use strict';
(function(){
  window.LABDS_LABS=window.LABDS_LABS||{};
  const VERSION='1.0.0';
  const QUALITY_PROFILES={
    low:{label:'Baixo',textures:false,physical:false,textureSize:0,anisotropy:1,shadowMap:0,envIntensity:.25,clearcoat:false,contactShadows:false,rgbGlow:false,maxDpr:1.1},
    medium:{label:'Médio',textures:false,physical:false,textureSize:0,anisotropy:1,shadowMap:512,envIntensity:.4,clearcoat:false,contactShadows:false,rgbGlow:false,maxDpr:1.2},
    high:{label:'Alto',textures:true,physical:true,textureSize:256,anisotropy:4,shadowMap:1024,envIntensity:.78,clearcoat:true,contactShadows:true,rgbGlow:true,maxDpr:1.55},
    ultra:{label:'Ultra',textures:true,physical:true,textureSize:512,anisotropy:8,shadowMap:2048,envIntensity:1.05,clearcoat:true,contactShadows:true,rgbGlow:true,maxDpr:2}
  };
  const PRESETS={
    generic:{roughness:.5,metalness:.25},
    paintedMetal:{roughness:.42,metalness:.68,clearcoat:.2,pattern:'paint',repeat:[6,6],bumpScale:.018},
    brushedMetal:{roughness:.3,metalness:.9,clearcoat:.18,pattern:'brushed',repeat:[2,8],bumpScale:.028},
    bareSteel:{roughness:.38,metalness:.92,pattern:'brushed',repeat:[3,10],bumpScale:.02},
    mattePlastic:{roughness:.68,metalness:.05,pattern:'rubber',repeat:[10,10],bumpScale:.014},
    glossyPlastic:{roughness:.22,metalness:.08,clearcoat:.82,clearcoatRoughness:.12,pattern:'paint',repeat:[8,8],bumpScale:.008},
    rubber:{roughness:.86,metalness:0,pattern:'rubber',repeat:[12,12],bumpScale:.032},
    fabric:{roughness:.96,metalness:0,pattern:'fabric',repeat:[12,12],bumpScale:.055},
    pcb:{roughness:.48,metalness:.12,clearcoat:.15,pattern:'pcb',repeat:[3,3],bumpScale:.012},
    copper:{roughness:.28,metalness:1,pattern:'brushed',repeat:[3,9],bumpScale:.018},
    wood:{roughness:.72,metalness:0,clearcoat:.12,pattern:'wood',repeat:[4,2],bumpScale:.035},
    carbon:{roughness:.38,metalness:.45,clearcoat:.28,pattern:'carbon',repeat:[10,10],bumpScale:.028},
    mesh:{roughness:.58,metalness:.72,pattern:'mesh',repeat:[14,14],bumpScale:.04},
    ceramic:{roughness:.22,metalness:.18,clearcoat:.55,clearcoatRoughness:.16,pattern:'paint',repeat:[6,6],bumpScale:.006},
    screen:{roughness:.08,metalness:.15,clearcoat:.78,clearcoatRoughness:.08,pattern:'screen',repeat:[1,1],bumpScale:.003},
    rgb:{roughness:.24,metalness:.2,clearcoat:.65,clearcoatRoughness:.09,emissive:true},
    glassClear:{glass:true,roughness:.055,metalness:0,opacity:.24,transmission:.78,thickness:.18,ior:1.45},
    glassSmoked:{glass:true,roughness:.09,metalness:0,opacity:.3,transmission:.56,thickness:.24,ior:1.47},
    glassFrosted:{glass:true,roughness:.42,metalness:0,opacity:.46,transmission:.36,thickness:.32,ior:1.42},
    glassOpaque:{roughness:.46,metalness:.48,clearcoat:.18,pattern:'paint',repeat:[6,6],bumpScale:.012}
  };
  const textureCache=new Map();
  const contactTextureCache=new Map();
  const environmentCache=new Map();
  let createdMaterials=0,createdTextures=0;

  function clamp(value,min,max){return Math.min(max,Math.max(min,Number(value)||0));}
  function profile(level){return QUALITY_PROFILES[level]||QUALITY_PROFILES.high;}
  function preset(name){return PRESETS[name]||PRESETS.generic;}
  function safeColor(THREE,value,fallback=0xffffff){try{return new THREE.Color(value??fallback);}catch{return new THREE.Color(fallback);}}
  function canvasAvailable(){return typeof document!=='undefined'&&typeof document.createElement==='function';}
  function createCanvas(size){const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;return canvas;}
  function seeded(index){const x=Math.sin(index*12.9898+78.233)*43758.5453;return x-Math.floor(x);}

  function drawPattern(kind,size){
    if(!canvasAvailable())return null;
    const canvas=createCanvas(size),ctx=canvas.getContext('2d',{alpha:false});
    if(!ctx)return null;
    ctx.fillStyle='#d8dde2';ctx.fillRect(0,0,size,size);
    if(kind==='brushed'){
      for(let y=0;y<size;y+=2){const light=165+Math.round(seeded(y)*70);ctx.fillStyle=`rgb(${light},${light},${light})`;ctx.fillRect(0,y,size,1);}
      for(let i=0;i<Math.max(20,size/3);i++){const y=Math.floor(seeded(i+11)*size),w=Math.max(8,seeded(i+29)*size*.5);ctx.fillStyle='rgba(255,255,255,.16)';ctx.fillRect(seeded(i+47)*(size-w),y,w,1);}
    }else if(kind==='carbon'){
      ctx.fillStyle='#aeb5bb';ctx.fillRect(0,0,size,size);const cell=Math.max(6,Math.round(size/24));
      for(let y=-cell;y<size+cell;y+=cell)for(let x=-cell;x<size+cell;x+=cell){const odd=((x/cell+y/cell)&1)!==0;ctx.save();ctx.translate(x,y);ctx.rotate(Math.PI/4);ctx.fillStyle=odd?'#dfe3e6':'#7d878e';ctx.fillRect(0,0,cell*.82,cell*.82);ctx.restore();}
    }else if(kind==='wood'){
      const gradient=ctx.createLinearGradient(0,0,size,0);gradient.addColorStop(0,'#d6b890');gradient.addColorStop(.5,'#9f7951');gradient.addColorStop(1,'#cfad83');ctx.fillStyle=gradient;ctx.fillRect(0,0,size,size);
      for(let i=0;i<Math.max(24,size/4);i++){const y=seeded(i+9)*size,amp=2+seeded(i+17)*5;ctx.strokeStyle=`rgba(78,48,24,${.08+seeded(i+3)*.2})`;ctx.lineWidth=.7+seeded(i+12)*1.6;ctx.beginPath();for(let x=0;x<=size;x+=8){const yy=y+Math.sin(x*.045+i)*amp;ctx.lineTo(x,yy);}ctx.stroke();}
    }else if(kind==='pcb'){
      ctx.fillStyle='#b9c8c0';ctx.fillRect(0,0,size,size);ctx.strokeStyle='rgba(80,100,87,.42)';ctx.lineWidth=Math.max(1,size/180);
      for(let i=0;i<18;i++){const x=seeded(i+1)*size,y=seeded(i+2)*size;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,seeded(i+4)*size);ctx.lineTo(seeded(i+5)*size,seeded(i+4)*size);ctx.stroke();}
      ctx.fillStyle='rgba(230,210,120,.7)';for(let i=0;i<28;i++){const x=seeded(i+41)*size,y=seeded(i+53)*size,r=Math.max(1,size/110);ctx.fillRect(x-r,y-r,r*2,r*2);}
    }else if(kind==='mesh'){
      ctx.fillStyle='#b8c0c6';ctx.fillRect(0,0,size,size);const step=Math.max(6,Math.round(size/22)),radius=Math.max(1.2,step*.23);ctx.fillStyle='#4c555c';
      for(let y=step/2;y<size;y+=step)for(let x=step/2;x<size;x+=step){ctx.beginPath();ctx.arc(x+(Math.round(y/step)%2?step*.5:0),y,radius,0,Math.PI*2);ctx.fill();}
    }else if(kind==='fabric'){
      ctx.fillStyle='#c4c8cb';ctx.fillRect(0,0,size,size);const step=Math.max(3,Math.round(size/42));
      for(let x=0;x<size;x+=step){ctx.strokeStyle=x%(step*2)===0?'rgba(255,255,255,.34)':'rgba(55,62,68,.22)';ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,size);ctx.stroke();}
      for(let y=0;y<size;y+=step){ctx.strokeStyle=y%(step*2)===0?'rgba(255,255,255,.3)':'rgba(55,62,68,.2)';ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(size,y);ctx.stroke();}
    }else if(kind==='rubber'||kind==='paint'){
      const base=kind==='rubber'?150:205;ctx.fillStyle=`rgb(${base},${base},${base})`;ctx.fillRect(0,0,size,size);
      const count=Math.round(size*size/(kind==='rubber'?65:115));for(let i=0;i<count;i++){const v=Math.round(base-28+seeded(i)*55),alpha=kind==='rubber'?.14:.08;ctx.fillStyle=`rgba(${v},${v},${v},${alpha})`;const r=kind==='rubber'?1.2:.75;ctx.fillRect(seeded(i+100)*size,seeded(i+200)*size,r,r);}
    }else if(kind==='screen'){
      const gradient=ctx.createLinearGradient(0,0,size,size);gradient.addColorStop(0,'#24394a');gradient.addColorStop(.45,'#7ca8c3');gradient.addColorStop(1,'#0c1d29');ctx.fillStyle=gradient;ctx.fillRect(0,0,size,size);
      ctx.strokeStyle='rgba(220,250,255,.18)';ctx.lineWidth=1;for(let y=0;y<size;y+=Math.max(3,size/64)){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(size,y);ctx.stroke();}
    }
    return canvas;
  }

  function textureKey(kind,size,repeat){return `${kind}:${size}:${repeat.join('x')}`;}
  function textureBundle(THREE,kind,quality,repeat=[1,1],renderer=null){
    const p=profile(quality);if(!p.textures||!kind||!canvasAvailable())return null;
    const size=p.textureSize,key=textureKey(kind,size,repeat);if(textureCache.has(key))return textureCache.get(key);
    const canvas=drawPattern(kind,size);if(!canvas)return null;
    const colorMap=new THREE.CanvasTexture(canvas);colorMap.wrapS=colorMap.wrapT=THREE.RepeatWrapping;colorMap.repeat.set(...repeat);if(THREE.SRGBColorSpace)colorMap.colorSpace=THREE.SRGBColorSpace;
    const bumpMap=colorMap.clone();bumpMap.needsUpdate=true;if(THREE.NoColorSpace)bumpMap.colorSpace=THREE.NoColorSpace;
    const maxAniso=renderer?.capabilities?.getMaxAnisotropy?.()||1,anisotropy=Math.min(maxAniso,p.anisotropy);colorMap.anisotropy=anisotropy;bumpMap.anisotropy=anisotropy;
    const bundle={colorMap,bumpMap};textureCache.set(key,bundle);createdTextures+=2;return bundle;
  }

  function glassPreset(style){return style==='clear'?'glassClear':style==='frosted'?'glassFrosted':style==='opaque'?'glassOpaque':'glassSmoked';}
  function resolvePreset(options={},settings={}){
    if(options.glass||options.preset==='glass')return glassPreset(settings.glassStyle||'smoked');
    if(options.preset==='case')return settings.caseFinish==='glossy'?'glossyPlastic':settings.caseFinish==='brushed'?'brushedMetal':settings.caseFinish==='carbon'?'carbon':'paintedMetal';
    return options.preset||'generic';
  }

  function createMaterial({THREE,color=0xffffff,options={},quality='high',renderer=null,settings={}}={}){
    if(!THREE)return null;
    const p=profile(quality),presetName=resolvePreset(options,settings),spec=preset(presetName),baseColor=safeColor(THREE,color);
    const emissiveColor=options.emissive?safeColor(THREE,options.emissive):spec.emissive?baseColor.clone().multiplyScalar(.42):safeColor(THREE,0x000000);
    const params={
      color:baseColor,
      roughness:options.roughness??spec.roughness??.5,
      metalness:options.metalness??spec.metalness??.25,
      transparent:Boolean(options.transparent||spec.glass),
      opacity:options.opacity??spec.opacity??1,
      emissive:emissiveColor,
      emissiveIntensity:options.emissiveIntensity??(spec.emissive?.28:0),
      envMapIntensity:options.envMapIntensity??p.envIntensity,
      depthWrite:options.depthWrite??!(options.transparent||spec.glass)
    };
    if(options.side!==undefined)params.side=options.side;
    const bundle=settings.materialDetail!==false?textureBundle(THREE,spec.pattern,quality,spec.repeat||[1,1],renderer):null;
    if(bundle){params.map=bundle.colorMap;params.bumpMap=bundle.bumpMap;params.bumpScale=options.bumpScale??spec.bumpScale??.02;}
    let material;
    if((p.physical||spec.glass)&&THREE.MeshPhysicalMaterial){
      const physical={...params,
        clearcoat:p.clearcoat?(options.clearcoat??spec.clearcoat??.18):0,
        clearcoatRoughness:options.clearcoatRoughness??spec.clearcoatRoughness??.22,
        transmission:spec.glass?(options.transmission??spec.transmission??.5):(options.transmission||0),
        thickness:spec.glass?(options.thickness??spec.thickness??.18):(options.thickness||0),
        ior:spec.glass?(options.ior??spec.ior??1.45):1.5,
        sheen:options.sheen??(presetName==='fabric'?.35:0),
        sheenRoughness:presetName==='fabric'?.82:1,
        sheenColor:presetName==='fabric'?baseColor.clone().multiplyScalar(.55):new THREE.Color(0x000000)
      };
      if(spec.glass){physical.attenuationColor=baseColor.clone().lerp(new THREE.Color(0xffffff),.42);physical.attenuationDistance=2.8;}
      material=new THREE.MeshPhysicalMaterial(physical);
    }else material=new THREE.MeshStandardMaterial(params);
    material.name=`hw-${presetName}-${quality}`;material.userData={...(material.userData||{}),hardwarePreset:presetName,quality,engineVersion:VERSION};createdMaterials++;
    return material;
  }

  function configureRenderer({THREE,renderer,quality='high',ambient='neutral'}={}){
    if(!renderer||!THREE)return profile(quality);const p=profile(quality);
    renderer.setPixelRatio(Math.min(typeof devicePixelRatio==='number'?devicePixelRatio:1,p.maxDpr));
    if(THREE.SRGBColorSpace)renderer.outputColorSpace=THREE.SRGBColorSpace;
    if(THREE.ACESFilmicToneMapping)renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=ambient==='daylight'?(quality==='ultra'?1.02:.96):quality==='ultra'?1.2:quality==='high'?1.1:1;
    renderer.shadowMap.enabled=p.shadowMap>0;if(renderer.shadowMap.enabled&&THREE.PCFSoftShadowMap)renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    if('useLegacyLights' in renderer)renderer.useLegacyLights=false;
    return p;
  }

  function createLighting({THREE,scene,quality='high',palette={},ambient='neutral',accent=0x2de2ff,layout=null}={}){
    const p=profile(quality),lights=[];if(!THREE||!scene)return{lights,fill:null,rim:null,key:null};
    const sky=ambient==='daylight'?0xf8fbff:ambient==='warm'?0xffe6c7:0xcaf4ff,ground=ambient==='daylight'?0x8899a8:ambient==='warm'?0x3b2015:0x09111b;
    const hemi=new THREE.HemisphereLight(sky,ground,quality==='ultra'?1.55:quality==='high'?1.25:1.05);scene.add(hemi);lights.push(hemi);
    const key=new THREE.DirectionalLight(0xffffff,quality==='ultra'?5.2:quality==='high'?4.2:3.2);key.position.set(10,17,12);key.castShadow=p.shadowMap>0;
    if(key.castShadow){key.shadow.mapSize.set(p.shadowMap,p.shadowMap);key.shadow.bias=-.00035;key.shadow.normalBias=.018;const extent=Math.max(12,layout?.summary?.deskWidth||16);key.shadow.camera.left=-extent;key.shadow.camera.right=extent;key.shadow.camera.top=14;key.shadow.camera.bottom=-10;key.shadow.camera.near=1;key.shadow.camera.far=55;}
    scene.add(key);lights.push(key);
    const fill=new THREE.PointLight(palette.fill||accent,quality==='ultra'?44:quality==='high'?30:18,38,1.65);fill.position.set(-7,5,9);scene.add(fill);lights.push(fill);
    const rim=new THREE.PointLight(palette.rim||0x8d5bff,quality==='ultra'?34:quality==='high'?24:14,34,1.8);rim.position.set(10,7,-10);scene.add(rim);lights.push(rim);
    if(quality==='ultra'){
      const top=new THREE.SpotLight(0xdff8ff,46,32,Math.PI*.32,.58,1.5);top.position.set(2,14,2);top.target.position.set(2,0,0);top.castShadow=false;scene.add(top,top.target);lights.push(top,top.target);
      const accentLight=new THREE.PointLight(accent,18,18,2);accentLight.position.set(-1,1,4);scene.add(accentLight);lights.push(accentLight);
    }
    return{lights,fill,rim,key};
  }

  function environmentColor(value,fallback){return typeof value==='number'?`#${value.toString(16).padStart(6,'0')}`:fallback;}
  function createEnvironmentMap({THREE,quality='high',palette={}}={}){
    const p=profile(quality);if(!THREE||!p.textures||!canvasAvailable())return null;
    const key=`${quality}:${palette.fill||0}:${palette.rim||0}`;if(environmentCache.has(key))return environmentCache.get(key);
    const size=quality==='ultra'?256:128,fill=environmentColor(palette.fill,'#4bcfff'),rim=environmentColor(palette.rim,'#9f63ff'),images=[];
    for(let face=0;face<6;face++){
      const canvas=createCanvas(size),ctx=canvas.getContext('2d',{alpha:false}),gradient=ctx.createLinearGradient(face%2?0:size,0,face%2?size:0,size);
      gradient.addColorStop(0,face<2?'#edfaff':'#8fa6b8');gradient.addColorStop(.42,face%3===0?fill:rim);gradient.addColorStop(1,'#07111d');ctx.fillStyle=gradient;ctx.fillRect(0,0,size,size);
      const glow=ctx.createRadialGradient(size*(face%2?.7:.3),size*.28,0,size*.5,size*.5,size*.75);glow.addColorStop(0,'rgba(255,255,255,.65)');glow.addColorStop(.28,'rgba(255,255,255,.12)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,size,size);images.push(canvas);
    }
    const texture=new THREE.CubeTexture(images);if(THREE.SRGBColorSpace)texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;environmentCache.set(key,texture);createdTextures++;return texture;
  }

  function contactTexture(THREE,size=256){
    if(!canvasAvailable())return null;const key=String(size);if(contactTextureCache.has(key))return contactTextureCache.get(key);
    const canvas=createCanvas(size),ctx=canvas.getContext('2d');if(!ctx)return null;ctx.clearRect(0,0,size,size);const grad=ctx.createRadialGradient(size/2,size/2,size*.06,size/2,size/2,size*.5);grad.addColorStop(0,'rgba(0,0,0,.72)');grad.addColorStop(.45,'rgba(0,0,0,.34)');grad.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,size,size);
    const texture=new THREE.CanvasTexture(canvas);if(THREE.SRGBColorSpace)texture.colorSpace=THREE.SRGBColorSpace;contactTextureCache.set(key,texture);createdTextures++;return texture;
  }

  function createContactShadow({THREE,quality='high',width=5,depth=4,position=[0,0,0],opacity=.32,rotation=[-Math.PI/2,0,0]}={}){
    if(!THREE||!profile(quality).contactShadows)return null;const texture=contactTexture(THREE,quality==='ultra'?512:256);if(!texture)return null;
    const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:clamp(opacity,0,.8),depthWrite:false,toneMapped:false});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),material);mesh.position.set(...position);mesh.rotation.set(...rotation);mesh.renderOrder=1;mesh.userData.hardwareContactShadow=true;return mesh;
  }

  function addRgbGlow({THREE,group,quality='high',color=0x2de2ff,position=[0,0,0],size=1,intensity=1}={}){
    if(!THREE||!group||!profile(quality).rgbGlow)return null;const material=new THREE.SpriteMaterial({color,transparent:true,opacity:clamp(.18*intensity,.06,.42),blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false});
    const sprite=new THREE.Sprite(material);sprite.position.set(...position);sprite.scale.set(size*2.8,size*2.8,1);sprite.userData.hardwareRgbGlow=true;group.add(sprite);return sprite;
  }

  function stats(quality='high'){const p=profile(quality);return{version:VERSION,quality,label:p.label,textures:p.textures,physical:p.physical,textureSize:p.textureSize,shadowMap:p.shadowMap,contactShadows:p.contactShadows,rgbGlow:p.rgbGlow,maxDpr:p.maxDpr,createdMaterials,createdTextures,cachedPatterns:textureCache.size,environmentMaps:environmentCache.size};}
  function clear(){for(const bundle of textureCache.values()){bundle.colorMap?.dispose?.();bundle.bumpMap?.dispose?.();}textureCache.clear();for(const texture of contactTextureCache.values())texture?.dispose?.();contactTextureCache.clear();for(const texture of environmentCache.values())texture?.dispose?.();environmentCache.clear();createdMaterials=0;createdTextures=0;}

  window.LABDS_HARDWARE_MATERIALS={VERSION,QUALITY_PROFILES,PRESETS,profile,preset,glassPreset,createMaterial,configureRenderer,createLighting,createEnvironmentMap,createContactShadow,addRgbGlow,stats,clear};
})();
