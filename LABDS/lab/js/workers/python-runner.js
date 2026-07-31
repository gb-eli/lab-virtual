'use strict';

let pyodide=null,currentUrls=null;
const nativePostMessage=self.postMessage.bind(self),nativeFetch=self.fetch?.bind(self);
const ALLOWED_PACKAGES=new Set(['numpy','pandas','matplotlib','pillow','micropip']);
const MAX_MESSAGES=350,MAX_BYTES=200000;
let messages=0,bytes=0,truncated=false;
function post(type,payload){nativePostMessage({type,payload});}
function output(type,value){const text=String(value??'').slice(0,20000);if(messages>=MAX_MESSAGES||bytes>=MAX_BYTES){if(!truncated){truncated=true;post('stderr','Saída limitada pelo ambiente.');}return;}messages++;bytes+=text.length;post(type,text);}
function blockNetwork(){self.fetch=()=>Promise.reject(new Error('Acesso à rede bloqueado para o código do estudante.'));self.XMLHttpRequest=undefined;self.WebSocket=undefined;self.EventSource=undefined;self.Worker=undefined;self.SharedWorker=undefined;}
async function ensurePyodide(url,indexURL){
  if(pyodide)return pyodide;currentUrls={url,indexURL};post('status','Baixando o ambiente Python…');if(nativeFetch)self.fetch=nativeFetch;importScripts(url);pyodide=await loadPyodide({indexURL});pyodide.setStdout({batched:text=>output('stdout',text)});pyodide.setStderr({batched:text=>output('stderr',text)});blockNetwork();post('ready',pyodide.version);return pyodide;
}
self.addEventListener('message',async event=>{
  const data=event.data||{};messages=0;bytes=0;truncated=false;
  try{
    const runtime=await ensurePyodide(data.url||currentUrls?.url,data.indexURL||currentUrls?.indexURL);
    if(data.type==='run'){
      const code=String(data.code||'');if(code.length>200000)throw new Error('Código excede 200 KB.');const inputs=Array.isArray(data.stdin)?data.stdin.map(item=>String(item).slice(0,10000)).slice(0,200):[];
      blockNetwork();
      const prefix=`import builtins\n__lab_inputs = iter(${JSON.stringify(inputs)})\ndef __lab_input(prompt=''):\n    print(prompt, end='')\n    try:\n        value = next(__lab_inputs)\n    except StopIteration:\n        value = ''\n    print(value)\n    return value\nbuiltins.input = __lab_input\n`;
      const result=await runtime.runPythonAsync(`${prefix}\n${code}\n`);if(result!==undefined&&result!==null)output('result',String(result));post('done',{ok:true,metrics:{messages,bytes,truncated}});
    }else if(data.type==='install'){
      const packageName=String(data.packageName||'').toLowerCase();if(!ALLOWED_PACKAGES.has(packageName))throw new Error('Biblioteca fora da lista permitida neste laboratório.');post('status',`Carregando ${packageName}…`);if(nativeFetch)self.fetch=nativeFetch;await runtime.loadPackage(packageName);blockNetwork();post('package',{name:packageName,installed:true});
    }else if(data.type==='version')post('ready',runtime.version);
  }catch(error){blockNetwork();post('error',{message:String(error?.message||error).slice(0,20000),stack:String(error?.stack||'').slice(0,40000)});post('done',{ok:false,metrics:{messages,bytes,truncated}});}
});
