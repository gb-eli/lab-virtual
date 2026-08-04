import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { pathToFileURL } from 'node:url';

const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const engineFile=path.join(root,'lab/modules/hardware-lab/material-engine.js');
const threeFile=path.join(root,'lab/vendor/three/three.module.min.js');
const source=fs.readFileSync(engineFile,'utf8');
const context={window:{},console,Math,Map,Set,Number,String,Boolean,Array,Object,Infinity};
vm.createContext(context);vm.runInContext(source,context,{filename:engineFile});
const api=context.window.LABDS_HARDWARE_MATERIALS;
if(!api)throw new Error('API de materiais não foi registrada.');
const THREE=await import(pathToFileURL(threeFile).href);

function assert(condition,message){if(!condition)throw new Error(message);}
assert(api.VERSION==='1.0.0','Versão inesperada do motor de materiais.');
assert(Object.keys(api.QUALITY_PROFILES).join(',')==='low,medium,high,ultra','Perfis gráficos incompletos.');
assert(api.profile('ultra').textureSize===512,'Ultra deve usar textura procedural de 512 px.');
assert(api.profile('high').shadowMap===1024,'Alto deve usar sombra de 1024 px.');
assert(api.profile('medium').textures===false,'Médio deve priorizar estabilidade sem texturas procedurais.');
assert(Object.keys(api.PRESETS).length>=18,'Catálogo de materiais PBR insuficiente.');
assert(api.glassPreset('clear')==='glassClear','Vidro claro incorreto.');
assert(api.glassPreset('frosted')==='glassFrosted','Vidro fosco incorreto.');
assert(api.glassPreset('opaque')==='glassOpaque','Painel opaco incorreto.');
assert(typeof api.createEnvironmentMap==='function','Environment map procedural ausente.');

const material=api.createMaterial({THREE,color:0x445566,quality:'ultra',options:{preset:'brushedMetal'},settings:{materialDetail:false,caseFinish:'brushed',glassStyle:'smoked'}});
assert(material?.isMeshPhysicalMaterial,'Ultra deve criar material físico.');
assert(material.userData.hardwarePreset==='brushedMetal','Preset do material não foi preservado.');
assert(material.metalness>.8,'Metal escovado deve ter metalness alto.');

const glass=api.createMaterial({THREE,color:0x91c7e8,quality:'high',options:{preset:'glass',glass:true},settings:{materialDetail:false,glassStyle:'frosted'}});
assert(glass?.isMeshPhysicalMaterial,'Vidro deve usar material físico.');
assert(glass.userData.hardwarePreset==='glassFrosted','Tratamento de vidro não aplicado.');
assert(glass.transmission>0,'Vidro fosco deve manter transmissão controlada.');

const renderer={pixelRatio:0,setPixelRatio(value){this.pixelRatio=value;},shadowMap:{enabled:false,type:null},toneMapping:null,toneMappingExposure:0,capabilities:{getMaxAnisotropy(){return 16;}}};
api.configureRenderer({THREE,renderer,quality:'high',ambient:'neutral'});
assert(renderer.pixelRatio>0&&renderer.pixelRatio<=1.55,'DPR alto fora do orçamento.');
assert(renderer.shadowMap.enabled===true,'Sombras deveriam estar ativas no Alto.');

const scene=new THREE.Scene();
const lighting=api.createLighting({THREE,scene,quality:'ultra',palette:{fill:0x2de2ff,rim:0x8d5bff},ambient:'neutral',accent:0x2de2ff,layout:{summary:{deskWidth:18}}});
assert(lighting.key?.isDirectionalLight,'Luz principal ausente.');
assert(lighting.key.shadow.mapSize.width===2048,'Shadow map Ultra incorreto.');
assert(scene.children.length>=6,'Iluminação Ultra incompleta.');

const stats=api.stats('ultra');
assert(stats.physical===true&&stats.contactShadows===true&&stats.rgbGlow===true,'Recursos Ultra incompletos.');
material.dispose();glass.dispose();api.clear();
console.log('OK — motor de materiais PBR, vidro, perfis gráficos e iluminação validados.');
