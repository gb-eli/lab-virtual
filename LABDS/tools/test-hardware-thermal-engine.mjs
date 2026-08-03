import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const source=fs.readFileSync(path.join(root,'lab/modules/hardware-lab/thermal-engine.js'),'utf8');
const context={window:{}};
vm.createContext(context);
vm.runInContext(source,context,{filename:'thermal-engine.js'});
const api=context.window.LABDS_HARDWARE_THERMAL;
if(!api)throw new Error('Motor térmico não registrado.');

const baseCase={frontPanel:'mesh',sidePanel:'tempered-glass',fans:8,airflowBias:14,chambers:1,mounts:{front:[120,240,360],top:[120,240,360],rear:[120],bottom:[120,240]}};
const base={caseItem:baseCase,cpu:{tdp:120},gpu:{tdp:220},cooler:{type:'aio',capacity:285,noise:32,radiator:240},storageHeat:12,fans:6,cableManagement:'standard',panelState:'closed',cpuPaste:true,coolerMounted:true};
const run=settings=>api.simulate({...base,settings});

const balanced=run({fanProfile:'balanced',fanSpeed:'auto',filterCondition:'clean',workload:'gaming',ambientTemperature:23,radiatorPosition:'auto'});
const positive=run({fanProfile:'positive',fanSpeed:'auto',filterCondition:'clean',workload:'gaming',ambientTemperature:23,radiatorPosition:'auto'});
const negative=run({fanProfile:'negative',fanSpeed:'auto',filterCondition:'clean',workload:'gaming',ambientTemperature:23,radiatorPosition:'auto'});
const clogged=run({fanProfile:'positive',fanSpeed:'auto',filterCondition:'clogged',workload:'gaming',ambientTemperature:23,radiatorPosition:'auto'});
const stress=run({fanProfile:'balanced',fanSpeed:'quiet',filterCondition:'used',workload:'stress',ambientTemperature:32,radiatorPosition:'front'});

const assert=(condition,message)=>{if(!condition)throw new Error(message);};
assert(positive.pressureDelta>0,'Pressão positiva não ficou positiva.');
assert(negative.pressureDelta<0,'Pressão negativa não ficou negativa.');
assert(clogged.effectiveCfm<positive.effectiveCfm,'Filtro obstruído não reduziu vazão.');
assert(clogged.dustRisk>positive.dustRisk,'Filtro obstruído não aumentou risco de poeira.');
assert(stress.hottestTemperature>balanced.hottestTemperature,'Carga extrema não elevou temperatura.');
assert(balanced.radiatorLocation==='top','Radiador automático deveria preferir topo.');
assert(Array.isArray(balanced.paths.intake)&&balanced.paths.intake.length>0,'Rotas de entrada não foram geradas.');
assert(Array.isArray(balanced.paths.exhaust)&&balanced.paths.exhaust.length>0,'Rotas de exaustão não foram geradas.');
assert(['estável','atenção','elevada','crítica','fria'].includes(balanced.status),'Status térmico inválido.');

const invalid=api.simulate({...base,caseItem:{...baseCase,mounts:{rear:[120]}},cooler:{type:'aio',capacity:380,noise:35,radiator:360},settings:{radiatorPosition:'front'}});
assert(!invalid.radiatorValid,'Radiador incompatível foi aceito.');
assert(invalid.warnings.some(item=>item.includes('radiador')||item.includes('Radiador')),'Aviso de radiador incompatível não foi gerado.');

console.log(JSON.stringify({status:'ok',balanced:{cpu:balanced.cpuTemperature,gpu:balanced.gpuTemperature,case:balanced.caseTemperature,airflow:balanced.airflowScore,pressure:balanced.pressure},positive:{pressure:positive.pressure,delta:positive.pressureDelta,dust:positive.dustRisk},negative:{pressure:negative.pressure,delta:negative.pressureDelta,dust:negative.dustRisk},clogged:{cfm:clogged.effectiveCfm,dust:clogged.dustRisk},stress:{hottest:stress.hottestTemperature,status:stress.status}},null,2));
