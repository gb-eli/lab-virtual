import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const files=['peripheral-engine.js','layout-engine.js'];
const context={window:{}};vm.createContext(context);
for(const file of files)vm.runInContext(fs.readFileSync(path.join(here,'../lab/modules/hardware-lab',file),'utf8'),context,{filename:file});
const P=context.window.LABDS_HARDWARE_PERIPHERALS,L=context.window.LABDS_HARDWARE_LAYOUT;
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
const monitors={
  fhd:{label:'LG 24″ Full HD',connector:'hdmi',res:[1920,1080],refresh:75,panel:'IPS'},
  qhd:{label:'Samsung 27″ QHD',connector:'dp',res:[2560,1440],refresh:165,panel:'IPS'},
  ultra:{label:'Dell 34″ Ultrawide',connector:'dp',res:[3440,1440],refresh:144,panel:'IPS'},
  super:{label:'Samsung 49″ Super Ultrawide',connector:'dp',res:[5120,1440],refresh:240,panel:'OLED'},
  none:{label:'Sem monitor',connector:null,res:[0,0],refresh:0,panel:'—'}
};
assert(P?.VERSION==='1.0.0','Motor de periféricos não carregado.');
assert(P.compatibleLayouts(1).some(item=>item.id==='single'),'Uma tela deve aceitar layout único.');
assert(P.compatibleLayouts(3).some(item=>item.id==='cockpit'),'Três telas devem aceitar cockpit.');
assert(P.compatibleMounts(2).some(item=>item.id==='dualArm'),'Duas telas devem aceitar braço duplo.');
const creator=P.buildMonitorPlan({primary:monitors.ultra,secondary:monitors.qhd,tertiary:monitors.qhd,state:{monitorCount:3,monitorLayout:'creator',monitorMount:'rail'},deskTopY:-3,centerX:5});
assert(creator.items.length===3,'Plano creator deve criar três telas.');
assert(creator.geometries[1].orientation==='portrait','Tela lateral do creator deve ficar vertical.');
assert(creator.objects.filter(item=>item.meta.kind==='screen').length===3,'Três superfícies de tela devem existir.');
assert(creator.objects.some(item=>item.meta.kind==='rail'),'Trilho profissional deve existir.');
const fallback=P.activeItems({primary:monitors.qhd,secondary:monitors.none,tertiary:monitors.none,state:{monitorCount:3,monitorLayout:'triple',monitorMount:'tripleArm'}});
assert(fallback.items.length===3&&fallback.items.every(item=>item.label===monitors.qhd.label),'Telas vazias devem repetir a principal em layout múltiplo.');

const base={caseItem:{label:'ATX',scene:[6.9,7.25,7.35]},keyboard:{label:'Teclado',type:'Mecânico'},mouse:{label:'Mouse'},audio:{label:'Headset',type:'Headset USB'},webcam:{label:'Webcam'},printer:{label:'Sem impressora',type:'—'},controller:{label:'Controle',type:'Gamepad'},ups:{label:'Sem nobreak',watts:0}};
const layouts=['single','dual','triple','creator','stacked','cockpit'];
const mounts=['stock','singleArm','dualArm','tripleArm','rail'];
const monitorOptions=[monitors.fhd,monitors.qhd,monitors.ultra,monitors.super];
let tested=0;
for(let count=1;count<=3;count++)for(const layout of layouts)for(const mount of mounts)for(const primary of monitorOptions)for(const secondary of monitorOptions){
  const normalized=P.normalize({monitorCount:count,monitorLayout:layout,monitorMount:mount});
  const result=L.calculate({...base,monitor:primary,monitor2:secondary,monitor3:monitors.qhd,state:normalized});
  tested++;
  assert(result.safe,`Layout inseguro: ${count}/${layout}/${mount}/${primary.label}: ${result.errors.join(' | ')}`);
  assert(result.summary.monitors===count,`Quantidade incorreta: esperado ${count}, obtido ${result.summary.monitors}.`);
  assert(result.summary.collisions===0,'Monitores e periféricos não podem colidir.');
  assert(result.summary.unsupported===0,'Monitores e periféricos não podem flutuar.');
  assert(result.summary.outOfBounds===0,'Setup deve caber na bancada calculada.');
}
assert(tested===1440,'A matriz deve testar 1.440 combinações multitela.');

const audios=[
  {label:'Sem áudio',type:'—'},
  {label:'Caixas de som',type:'2.0'},
  {label:'Headset',type:'Headset USB'},
  {label:'Studio',type:'Studio'},
  {label:'Microfone',type:'Criação de conteúdo'},
  {label:'Headset sem fio',type:'Headset wireless'},
  {label:'Soundbar',type:'Soundbar'}
];
const controllers=[
  {label:'Sem controle',type:'—'},
  {label:'Xbox',type:'Gamepad Xbox'},
  {label:'PlayStation',type:'Gamepad PlayStation'},
  {label:'Volante',type:'Simulação automobilística'},
  {label:'VR',type:'Realidade virtual'},
  {label:'HOTAS',type:'Simulação de voo'},
  {label:'Arcade',type:'Arcade'}
];
let peripheralMatrix=0;
for(const audio of audios)for(const controller of controllers)for(let count=1;count<=3;count++)for(const layout of layouts)for(const mount of mounts){
  const normalized=P.normalize({monitorCount:count,monitorLayout:layout,monitorMount:mount});
  const result=L.calculate({...base,audio,controller,monitor:monitors.qhd,monitor2:monitors.qhd,monitor3:monitors.qhd,printer:{label:'Impressora laser',type:'Laser'},ups:{label:'Nobreak',watts:1200},state:normalized});
  peripheralMatrix++;
  assert(result.safe,`Periférico inseguro: ${audio.type}/${controller.type}/${count}/${layout}/${mount}: ${result.errors.join(' | ')}`);
}
assert(peripheralMatrix===4410,'A matriz de áudio e controles deve testar 4.410 combinações.');
console.log(`Motor de periféricos aprovado em ${(tested+peripheralMatrix).toLocaleString('pt-BR')} combinações físicas e multitela.`);
console.log(JSON.stringify({creator:creator.summary,objects:creator.objects.length,layouts:Object.keys(P.LAYOUTS),mounts:Object.keys(P.MOUNTS)},null,2));
