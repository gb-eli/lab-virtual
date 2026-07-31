import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';

const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const labRoot=path.join(projectRoot,'lab');
const failures=[];
let registered=0;

for(const entry of fs.readdirSync(path.join(labRoot,'modules'),{withFileTypes:true})){
  if(!entry.isDirectory())continue;
  const manifestPath=path.join(labRoot,'modules',entry.name,'module.json');
  if(!fs.existsSync(manifestPath))continue;
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  if(manifest.id==='cyber-ops')continue;

  const context={console,URL,URLSearchParams,Date,Math,JSON,Promise,Map,Set,WeakMap,WeakSet,Array,Object,String,Number,Boolean,RegExp,Error,TypeError,Intl,TextEncoder,TextDecoder,setTimeout,clearTimeout,setInterval,clearInterval,Blob:globalThis.Blob,crypto:globalThis.crypto};
  context.window={LABDS:{VERSION:'4.0.0-pages',TOOLS:[],CATEGORY_LABELS:{},CLASSROOM_DEFAULT_URL:'https://classroom.google.com/',SECURITY_LIMITS:{},Schemas:{},Core:{}},LABDS_LABS:{}};
  context.globalThis=context;
  context.self=context.window;
  context.navigator={};
  context.location={origin:'https://example.test',href:'https://example.test/lab/index.html'};
  context.document={head:{appendChild(){}},body:{},createElement(){return{};},querySelector(){return null;},querySelectorAll(){return[];},scripts:[]};
  context.matchMedia=()=>({matches:false});
  context.addEventListener=()=>{};
  context.removeEventListener=()=>{};

  try{
    for(const ref of manifest.scripts||[]){
      vm.runInNewContext(fs.readFileSync(path.join(labRoot,ref),'utf8'),context,{filename:ref,timeout:1500});
    }
    const api=context.window.LABDS_LABS[manifest.id];
    if(!api)throw new Error('registro LABDS_LABS não encontrado');
    if(typeof api.mount!=='function'||typeof api.unmount!=='function')throw new Error('API mount/unmount incompleta');
    registered+=1;
  }catch(error){
    failures.push(`${manifest.id}: ${error.message}`);
  }
}

console.log(JSON.stringify({status:failures.length?'error':'ok',registered,failures},null,2));
if(failures.length)process.exit(1);
