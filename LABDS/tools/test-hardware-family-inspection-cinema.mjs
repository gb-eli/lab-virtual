#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const moduleDir=path.resolve(here,'../lab/modules/hardware-lab');
const context=vm.createContext({window:{},console,structuredClone:globalThis.structuredClone});
for(const name of ['peripheral-engine.js','layout-engine.js','computer-family-engine.js','inspection-engine.js','cinematic-engine.js']){
  const source=fs.readFileSync(path.join(moduleDir,name),'utf8');
  vm.runInContext(source,context,{filename:name});
}
const L=context.window.LABDS_HARDWARE_LAYOUT;
const F=context.window.LABDS_HARDWARE_FAMILIES;
const I=context.window.LABDS_HARDWARE_INSPECTION;
const C=context.window.LABDS_HARDWARE_CINEMATIC;
assert.ok(L&&F&&I&&C,'Os motores de layout, famílias, inspeção e cinema precisam registrar suas APIs globais.');

const ids=Object.keys(F.FAMILIES);
assert.ok(ids.length>=13,`Esperadas pelo menos 13 famílias; encontradas ${ids.length}.`);
const compact=[];
for(const id of ids){
  const profile=F.profile(id);
  assert.equal(F.normalize(id),id);
  assert.ok(profile.label&&profile.category&&profile.formFactor,`${id}: metadados incompletos.`);
  const geometry=F.sceneGeometry(id,{width:1,height:1,depth:1});
  for(const key of ['width','height','depth'])assert.ok(Number.isFinite(geometry[key])&&geometry[key]>0,`${id}: geometria ${key} inválida.`);
  const targets=F.availableInspectionTargets(id);
  assert.ok(targets.length>=4,`${id}: poucos alvos de inspeção.`);
  for(const target of targets)assert.ok(I.TARGETS[target],`${id}: alvo de inspeção desconhecido ${target}.`);
  const layout=L.calculate({caseGeometry:geometry,state:{family:id,monitorCount:1,monitorLayout:'single',monitorMount:'stock'}});
  assert.equal(layout.safe,true,`${id}: layout físico básico inseguro: ${layout.errors.join(' | ')}`);
  const caseObject=layout.objects.find(item=>item.id==='case');
  assert.ok(caseObject&&L.supported(caseObject,layout.desk,.1),`${id}: computador não está apoiado na bancada.`);
  assert.ok(L.insideSurface(caseObject,layout.desk,.04),`${id}: computador fora dos limites da bancada.`);
  const estimate=F.estimate({cpu:{price:3},gpu:{price:4},monitor:{price:2}},{family:id,monitorCount:2});
  assert.ok(estimate.min>0&&estimate.max>=estimate.min,`${id}: faixa de preço inválida.`);
  assert.equal(estimate.educational,true);
  if(!F.supportsManualAssembly(id))compact.push(id);
}
for(const expected of ['mini_pc','all_in_one','notebook','gaming_notebook'])assert.ok(compact.includes(expected),`${expected} deve usar manutenção compacta guiada.`);
assert.equal(F.supportsManualAssembly('school'),true);

const normalizedInspection=I.normalize({active:true,target:'gpu',view:'rear',zoom:9,distance:99,exploded:true});
assert.equal(normalizedInspection.target,'gpu');
assert.equal(normalizedInspection.view,'rear');
assert.equal(normalizedInspection.zoom,2.5);
assert.equal(normalizedInspection.distance,18);
assert.equal(normalizedInspection.exploded,true);
const details=I.details('gpu',{item:{label:'GPU teste',brand:'LAB DS',generation:'Atual',vram:12,tdp:220}});
assert.equal(details.label,'Placa de vídeo');
assert.ok(details.rows.some(([label,value])=>label==='VRAM'&&value==='12 GB'));
for(const view of Object.keys(I.VIEWS)){
  const camera=I.camera(view,{x:6,y:4,z:2},1.2);
  assert.ok(Number.isFinite(camera.yaw)&&Number.isFinite(camera.pitch)&&camera.distance>=4.2,`Câmera inválida na vista ${view}.`);
}

const state=C.normalize({active:false,playing:false,shot:0,speed:'normal',loop:false});
assert.ok(C.SHOTS.length>=9,'O modo cinema precisa de pelo menos nove tomadas.');
C.start(state);
assert.equal(state.active,true);assert.equal(state.playing,true);
const first=C.current(state);
const tick=C.tick(state,first.duration+0.1);
assert.equal(tick.changed,true);assert.equal(state.shot,1);
C.next(state);assert.equal(state.shot,2);
C.previous(state);assert.equal(state.shot,1);
C.pause(state);assert.equal(state.playing,false);
const pose=C.cameraPose(state,{camera:{target:[1,2,3],radius:16,minDistance:8}});
assert.ok(Number.isFinite(pose.yaw)&&Number.isFinite(pose.pitch)&&pose.distance>=8);
assert.equal(pose.target.length,3);
C.stop(state);assert.equal(state.active,false);assert.equal(state.shot,0);

console.log('Hardware A5.4 aprovado:');
console.log(`- ${ids.length} famílias de computadores`);
console.log(`- ${compact.length} famílias compactas com montagem guiada`);
console.log(`- ${Object.keys(I.TARGETS).length} alvos e ${Object.keys(I.VIEWS).length} vistas de inspeção`);
console.log(`- ${C.SHOTS.length} tomadas cinematográficas`);
