import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const source=fs.readFileSync(path.join(root,'lab/modules/hardware-lab/case-engine.js'),'utf8');
const context={window:{},console};
vm.createContext(context);
vm.runInContext(source,context,{filename:'case-engine.js'});
const api=context.window.LABDS_HARDWARE_CASES;
const assert=(condition,message)=>{if(!condition)throw new Error(message);};
assert(api,'API estrutural não registrada.');
assert(Object.keys(api.PROFILES).length===8,'O catálogo deve ter oito perfis estruturais.');
for(const [id,item] of Object.entries(api.PROFILES)){
  assert(item.caseClass,`${id}: classe ausente.`);
  assert(Array.isArray(item.dimensionsMm)&&item.dimensionsMm.length===3,`${id}: dimensões inválidas.`);
  assert(Array.isArray(item.scene)&&item.scene.length===3,`${id}: escala de cena inválida.`);
  assert(item.frontPanel,`${id}: painel frontal ausente.`);
  assert(item.sidePanel,`${id}: painel lateral ausente.`);
  assert(item.mounts&&Object.keys(item.mounts).length,`${id}: montagens ausentes.`);
  const geometry=api.sceneGeometry(item);
  assert(geometry.width>4&&geometry.height>5&&geometry.depth>5,`${id}: geometria fora da faixa.`);
}
const catalog=Object.fromEntries(Object.keys(api.PROFILES).map(id=>[id,{label:id}]));
api.enrichCatalog(catalog);
assert(catalog.airflow_atx.frontPanel==='mesh','Airflow ATX deve usar frente mesh.');
assert(catalog.panorama_atx.chambers===2,'Panorama ATX deve ter duas câmaras.');
assert(catalog.openbench.sidePanel==='open','Open bench não deve ter painel lateral.');
assert(api.nextPanel(catalog.airflow_atx,'closed')==='open','Gabinete com dobradiça deve abrir antes de remover.');
assert(api.nextPanel(catalog.airflow_atx,'open')==='removed','Painel aberto deve poder ser removido.');
assert(api.nextPanel(catalog.silent_atx,'closed')==='removed','Painel sem dobradiça deve ser removido diretamente.');
assert(api.normalizePanel(catalog.openbench,'closed')==='removed','Open bench deve permanecer sem painel.');
assert(api.canMountRadiator(catalog.airflow_atx,360),'Airflow ATX deve aceitar radiador de 360 mm.');
assert(!api.canMountRadiator(catalog.compact_matx,360),'Compact mATX não deve aceitar radiador de 360 mm.');
assert(!api.canMountRadiator(catalog.mini_itx,360),'Mini ITX não deve aceitar radiador de 360 mm.');
assert(api.canMountRadiator(catalog.openbench,420),'Open bench deve aceitar radiador de 420 mm.');
console.log(JSON.stringify({status:'ok',profiles:Object.keys(api.PROFILES).length,panelCycles:true,radiatorValidation:true},null,2));
