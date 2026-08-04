'use strict';
(function(global){
  const VERSION='1.0.0';
  const TARGETS={
    family:{label:'Computador completo',group:'family',description:'Estrutura externa, formato, acabamento e organização geral da máquina.'},
    case:{label:'Gabinete',group:'case',description:'Painéis, filtros, estrutura, baias, suportes, entradas e acabamento.'},
    board:{label:'Placa-mãe',group:'board',description:'Socket, VRM, memória, PCIe, M.2, chipset e conectores internos.'},
    cpu:{label:'Processador',group:'cpu',description:'Encapsulamento, contatos, orientação, geração e dissipação térmica.'},
    ram:{label:'Memória RAM',group:'ram',description:'Módulos, contatos, capacidade, frequência e canais.'},
    gpu:{label:'Placa de vídeo',group:'gpu',description:'Carcaça, ventoinhas, dissipador, PCB, alimentação e saídas de vídeo.'},
    storage:{label:'Armazenamento principal',group:'storage',description:'Formato, conectores, controlador e tecnologia de armazenamento.'},
    storage2:{label:'Armazenamento secundário',group:'storage2',description:'Segundo dispositivo de armazenamento e suas conexões.'},
    psu:{label:'Fonte',group:'psu',description:'Ventoinha, potência, conectores, eficiência e distribuição de energia.'},
    cooler:{label:'Refrigeração',group:'cooler',description:'Dissipador, bomba, radiador, heatpipes, fans e capacidade térmica.'},
    monitor:{label:'Monitor',group:'monitor',description:'Painel, proporção, suporte, conexões, resolução e taxa de atualização.'},
    keyboard:{label:'Teclado',group:'peripherals',filter:'keyboard',description:'Formato, teclas, switches, ergonomia e conectividade.'},
    mouse:{label:'Mouse',group:'peripherals',filter:'mouse',description:'Formato, sensor, botões, ergonomia e conectividade.'},
    audio:{label:'Headset/áudio',group:'peripherals',filter:'audio',description:'Estrutura, drivers, microfone, apoio e conexão.'},
    webcam:{label:'Webcam',group:'peripherals',filter:'webcam',description:'Lente, suporte, resolução e posição no setup.'},
    controller:{label:'Controle/joystick',group:'peripherals',filter:'controller',description:'Formato, botões, eixos, gatilhos e uso no simulador.'}
  };
  const VIEWS={iso:{label:'Isométrica',yaw:-.72,pitch:.34},front:{label:'Frontal',yaw:0,pitch:.08},rear:{label:'Traseira',yaw:Math.PI,pitch:.08},left:{label:'Lateral esquerda',yaw:-Math.PI/2,pitch:.12},right:{label:'Lateral direita',yaw:Math.PI/2,pitch:.12},top:{label:'Superior',yaw:0,pitch:1.25},bottom:{label:'Inferior',yaw:Math.PI,pitch:-.72}};
  function clone(value){return JSON.parse(JSON.stringify(value));}
  function normalize(raw={}){return{active:Boolean(raw.active),target:TARGETS[raw.target]?raw.target:'family',view:VIEWS[raw.view]?raw.view:'iso',exploded:Boolean(raw.exploded),zoom:Math.max(.7,Math.min(2.5,Number(raw.zoom)||1)),showInfo:raw.showInfo!==false,distance:Math.max(3,Math.min(18,Number(raw.distance)||6.5))};}
  function available(allowed=[]){const list=allowed.length?allowed:Object.keys(TARGETS);return list.filter(id=>TARGETS[id]).map(id=>({id,...clone(TARGETS[id])}));}
  function details(target,context={}){
    const id=TARGETS[target]?target:'family',item=context.item||{},family=context.family||{};
    const rows=[];
    if(id==='family'){rows.push(['Família',family.label||'Computador'],['Categoria',family.category||'—'],['Formato',family.formFactor||'—'],['Montagem manual',family.manualAssembly===false?'Não':'Sim']);}
    else{rows.push(['Item',item.label||TARGETS[id].label],['Marca',item.brand||'Genérica'],['Geração',item.generation||item.year||'—']);if(item.socket)rows.push(['Socket',item.socket]);if(item.type)rows.push(['Tipo',item.type]);if(item.capacity)rows.push(['Capacidade',`${item.capacity} GB`]);if(item.vram)rows.push(['VRAM',`${item.vram} GB`]);if(item.tdp!=null)rows.push(['TDP',`${item.tdp} W`]);if(item.res)rows.push(['Resolução',`${item.res[0]} × ${item.res[1]}`]);if(item.refresh)rows.push(['Atualização',`${item.refresh} Hz`]);}
    return{id,label:TARGETS[id].label,description:TARGETS[id].description,rows};
  }
  function deepCloneObject(source){
    const clone=source.clone(true);clone.traverse(node=>{if(node.material){if(Array.isArray(node.material))node.material=node.material.map(material=>material.clone());else node.material=node.material.clone();}if(node.geometry)node.geometry=node.geometry.clone();});return clone;
  }
  function prepare({THREE,source,maxSize=6.2}){
    if(!THREE||!source)return null;const root=deepCloneObject(source),box=new THREE.Box3().setFromObject(root),size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3()),largest=Math.max(size.x,size.y,size.z,.001),scale=Math.min(4,maxSize/largest);root.position.sub(center);root.scale.multiplyScalar(scale);root.userData.inspectionBase=[];root.traverse(node=>{if(node!==root&&node.parent===root)root.userData.inspectionBase.push({node,position:node.position.clone()});});return{root,size:size.multiplyScalar(scale),scale};
  }
  function applyExploded(prepared,amount=0){if(!prepared?.root)return;const entries=prepared.root.userData.inspectionBase||[];for(const entry of entries){entry.node.position.copy(entry.position);if(amount>0){const direction=entry.position.clone();if(direction.lengthSq()<.01)direction.set((entries.indexOf(entry)%3)-1,((entries.indexOf(entry)+1)%3)-1,.6);direction.normalize();entry.node.position.addScaledVector(direction,amount);}}}
  function camera(view='iso',size={x:4,y:4,z:4},zoom=1){const preset=VIEWS[view]||VIEWS.iso,largest=Math.max(size.x||4,size.y||4,size.z||4),distance=Math.max(4.2,largest*1.5)/Math.max(.7,zoom);return{yaw:preset.yaw,pitch:preset.pitch,distance};}
  function dispose(root){root?.traverse?.(node=>{node.geometry?.dispose?.();if(Array.isArray(node.material))node.material.forEach(material=>material.dispose?.());else node.material?.dispose?.();});}
  global.LABDS_HARDWARE_INSPECTION={VERSION,TARGETS,VIEWS,normalize,available,details,prepare,applyExploded,camera,dispose};
})(window);
