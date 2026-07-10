'use strict';

const fs=require('fs');
const vm=require('vm');
const path=require('path');
const assert=require('assert');
const {webcrypto}=require('crypto');
const root=path.resolve(__dirname,'..');
const map=new Map();
const storage={
  async get(k,f=null){return map.has(k)?structuredClone(map.get(k)):f;},
  async set(k,v){map.set(k,structuredClone(v));return true;},
  async remove(k){map.delete(k);return true;},
  async removePrefix(prefix){[...map.keys()].filter(k=>String(k).startsWith(prefix)).forEach(k=>map.delete(k));return true;},
  async dumpPrefix(prefix){const states={};for(const [k,v] of map)if(String(k).startsWith(prefix))states[k]=v;return{states,local:{}};}
};
const listeners={};
class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail;}}
const document={addEventListener(t,fn){(listeners[t]??=[]).push(fn);},dispatchEvent(ev){(listeners[ev.type]||[]).forEach(fn=>fn(ev));}};
const context={console,setTimeout,clearTimeout,TextEncoder,Uint8Array,ArrayBuffer,Blob,DOMException,performance,structuredClone,crypto:webcrypto,CustomEvent,document,window:{},localStorage:{length:0,getItem(){return null;},setItem(){},removeItem(){},key(){return null;}}};
context.window=context;
context.LABDS={VERSION:'test-1',APP_NAME:'Laboratório Virtual DS',Storage:storage,Exporter:{safeName(v){return String(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').toLowerCase();},download(){}}};
vm.createContext(context);
for(const file of ['js/session.js','js/session-exporter.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});

(async()=>{
  await context.LABDS.Session.init();
  context.LABDS.Session.create('  Ana   <script>Silva</script>  ','2º DS');
  const session=context.LABDS.Session.get();
  assert.strictEqual(session.studentName,'Ana Silva');
  assert.ok(session.sessionId.length>20);
  await storage.set(`session.${session.sessionId}.lab.javascript.state`,{code:'console.log("teste")',stdin:'',logs:[]});
  await storage.set(`labds.fs.${session.sessionId}.cmd.v2`,{profile:'cmd',cwd:['Users','aluno'],root:{type:'dir',children:{Users:{type:'dir',children:{aluno:{type:'dir',children:{'atividade.txt':{type:'file',content:'conteúdo da aula'}}}}}}}});
  context.LABDS.Session.record({laboratoryId:'python',laboratoryName:'Python',eventType:'code_execution',action:'Executar',input:'print(1)',output:'1',context:{password:'1234'}});
  assert.strictEqual(session.events.at(-1).context.password,'[não armazenado]');
  assert.strictEqual(session.events.at(-1).sequenceNumber,2);
  const built=await context.LABDS.SessionExporter.build(session,{includeLocalData:true});
  assert.ok(built.txt.includes('Ana Silva'));
  assert.strictEqual(built.hash.length,64);
  assert.strictEqual(Buffer.from(built.pdf).subarray(0,4).toString(),'%PDF');
  assert.strictEqual(Buffer.from(built.zip).readUInt32LE(0),0x04034b50);
  const zipText=Buffer.from(built.zip).toString('utf8');
  assert.ok(zipText.includes('manifesto.json'));
  assert.ok(zipText.includes('codigos/javascript/main.js'));
  assert.ok(zipText.includes('arquivos/cmd/users/aluno/atividade.txt'));
  assert.ok(built.json.includes('historyHash'));
  await context.LABDS.Session.finalize('Finalizada e limpa',{clearPersonal:true});
  assert.ok(![...map.keys()].some(key=>String(key).includes(session.sessionId)));
  console.log('✓ identificação e sanitização');
  console.log('✓ eventos sequenciais e redaction de senha');
  console.log('✓ TXT, PDF, JSON, ZIP, artefatos e SHA-256');
  console.log('✓ limpeza completa do espaço da sessão');
})().catch(error=>{console.error(error);process.exit(1);});
