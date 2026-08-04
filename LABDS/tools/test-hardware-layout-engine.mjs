import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const peripheralSource=fs.readFileSync(path.join(here,'../lab/modules/hardware-lab/peripheral-engine.js'),'utf8');
const source=fs.readFileSync(path.join(here,'../lab/modules/hardware-lab/layout-engine.js'),'utf8');
const context={window:{}};
vm.createContext(context);
vm.runInContext(peripheralSource,context,{filename:'peripheral-engine.js'});
vm.runInContext(source,context,{filename:'layout-engine.js'});
const API=context.window.LABDS_HARDWARE_LAYOUT;

function assert(condition,message){if(!condition)throw new Error(message);}
function fixture(overrides={}){
  return {
    caseItem:{label:'Mid Tower ATX',scene:[6.9,7.25,7.35]},
    monitor:{label:'LG 24″ Full HD 75 Hz IPS',connector:'hdmi',res:[1920,1080],panel:'IPS'},
    keyboard:{label:'Teclado mecânico',type:'Mecânico'},
    mouse:{label:'Mouse gamer'},
    audio:{label:'Caixas de som estéreo',type:'2.0'},
    webcam:{label:'Webcam Full HD'},
    printer:{label:'Sem impressora',type:'—'},
    controller:{label:'Sem controle'},
    ups:{label:'Sem nobreak',watts:0},
    ...overrides
  };
}

assert(API?.VERSION==='1.1.0','Motor de layout não foi carregado.');

const standard=API.calculate(fixture());
assert(standard.safe,'Setup padrão deveria ser seguro.');
assert(standard.summary.collisions===0,'Setup padrão não pode ter colisões.');
assert(standard.summary.unsupported===0,'Setup padrão não pode ter objetos flutuando.');
assert(standard.summary.outOfBounds===0,'Setup padrão deve respeitar a bancada.');
assert(standard.objects.some(item=>item.id==='monitor-screen-1'),'Monitor deve ser criado.');
assert(standard.camera.minDistance>=9,'Câmera deve ter distância mínima segura.');

const demanding=API.calculate(fixture({
  caseItem:{label:'Open Bench',scene:[8.55,5.65,7.4]},
  monitor:{label:'Dell 34″ Ultrawide 144 Hz',connector:'dp',res:[3440,1440],panel:'IPS'},
  audio:{label:'Monitores de áudio',type:'Studio'},
  printer:{label:'HP multifuncional colorida',type:'Multifuncional'},
  controller:{label:'Controle Xbox',type:'Gamepad'},
  ups:{label:'Nobreak 2200 VA',watts:1320}
}));
assert(demanding.safe,`Setup completo deveria ser seguro: ${demanding.errors.join(' | ')}`);
assert(demanding.summary.deskWidth>standard.summary.deskWidth,'Bancada deve crescer para ultrawide e impressora.');
assert(demanding.objects.some(item=>item.id==='printer'),'Impressora deve ocupar zona dedicada.');
assert(demanding.objects.some(item=>item.id==='ups'),'Nobreak deve ficar no piso.');
assert(demanding.warnings.some(item=>item.includes('Conjunto de telas')||item.includes('larga')),'Ultrawide deve gerar recomendação de espaço.');

const headset=API.calculate(fixture({audio:{label:'Headset com microfone',type:'Headset USB'}}));
assert(headset.safe,'Headset e suporte não podem ser tratados como colisão inválida.');
assert(headset.objects.some(item=>item.id==='headset-stand'),'Suporte de headset deve existir.');
assert(headset.objects.some(item=>item.id==='headset'),'Headset deve existir.');

const noMonitor=API.calculate(fixture({monitor:{label:'Sem monitor',connector:null,res:[0,0]},webcam:{label:'Webcam 4K'}}));
assert(noMonitor.safe,`Setup sem monitor deve manter teclado e mouse seguros: ${noMonitor.errors.join(' | ')}`);
assert(!noMonitor.objects.some(item=>item.id==='webcam'),'Webcam não deve flutuar sem monitor.');

const ultrawide=API.monitorGeometry({label:'Dell 34″ Ultrawide 144 Hz',res:[3440,1440],connector:'dp'});
const regular=API.monitorGeometry({label:'LG 24″ Full HD',res:[1920,1080],connector:'hdmi'});
assert(ultrawide.width>regular.width,'Ultrawide deve ser fisicamente mais largo.');
assert(ultrawide.aspect>regular.aspect,'Aspecto ultrawide deve ser reconhecido.');

assert(API.clampCameraDistance(standard,1)===standard.camera.minDistance,'Zoom não pode atravessar o setup.');
assert(API.clampCameraDistance(standard,999)===standard.camera.maxDistance,'Zoom máximo deve ser limitado.');
assert(API.clampCameraPitch(standard,-99)===standard.camera.minPitch,'Inclinação inferior da câmera deve ser limitada.');
assert(API.clampCameraPitch(standard,99)===standard.camera.maxPitch,'Inclinação superior da câmera deve ser limitada.');

const matrixCases=[
  {label:'Mini ITX',scene:[4.8,5.8,5.6]},
  {label:'mATX',scene:[5.8,6.5,6.4]},
  {label:'ATX',scene:[6.9,7.25,7.35]},
  {label:'Full Tower',scene:[8.1,9.1,8.4]},
  {label:'Open Bench',scene:[8.55,5.65,7.4]}
];
const matrixMonitors=[
  {label:'Sem monitor',connector:null,res:[0,0]},
  {label:'Monitor 21″ Full HD',res:[1920,1080]},
  {label:'LG 24″ Full HD 75 Hz IPS',res:[1920,1080]},
  {label:'Monitor gamer 27″ QHD',res:[2560,1440]},
  {label:'Dell 34″ Ultrawide 144 Hz',res:[3440,1440]},
  {label:'Super Ultrawide 49″',res:[5120,1440]}
];
const matrixKeyboards=[
  {label:'Sem teclado',type:'—'},
  {label:'Teclado compacto',type:'60% compacto'},
  {label:'Teclado mecânico',type:'Mecânico'},
  {label:'Teclado ergonômico',type:'Ergonômico'}
];
const matrixMice=[{label:'Sem mouse'},{label:'Mouse gamer'}];
const matrixAudios=[
  {label:'Sem áudio',type:'—'},
  {label:'Headset com microfone',type:'Headset USB'},
  {label:'Áudio criação',type:'Criação'},
  {label:'Caixas de som estéreo',type:'2.0'},
  {label:'Monitores de áudio',type:'Studio'}
];
const matrixPrinters=[{label:'Sem impressora',type:'—'},{label:'HP multifuncional colorida',type:'Multifuncional'}];
const matrixControllers=[{label:'Sem controle'},{label:'Controle Xbox',type:'Gamepad'}];
const matrixWebcams=[{label:'Sem webcam'},{label:'Webcam Full HD'}];
const matrixUps=[{label:'Sem nobreak',watts:0},{label:'Nobreak 2200 VA',watts:1320}];
let matrixCount=0;
for(const caseItem of matrixCases)for(const monitor of matrixMonitors)for(const keyboard of matrixKeyboards)for(const mouse of matrixMice)for(const audio of matrixAudios)for(const printer of matrixPrinters)for(const controller of matrixControllers)for(const webcam of matrixWebcams)for(const ups of matrixUps){
  const result=API.calculate({caseItem,monitor,keyboard,mouse,audio,printer,controller,webcam,ups});
  matrixCount+=1;
  assert(result.safe,`Matriz física falhou em ${caseItem.label} / ${monitor.label}: ${result.errors.join(' | ')}`);
}
assert(matrixCount===19200,'A matriz física deve validar 19.200 configurações.');

console.log(`Motor de layout físico aprovado em ${matrixCount.toLocaleString('pt-BR')} configurações.`);
console.log(JSON.stringify({standard:standard.summary,demanding:demanding.summary,camera:demanding.camera},null,2));
