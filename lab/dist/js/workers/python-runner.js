'use strict';

let pyodide = null;
let currentUrls = null;

async function ensurePyodide(url, indexURL){
  if(pyodide) return pyodide;
  currentUrls={url,indexURL};
  postMessage({type:'status',payload:'Baixando o ambiente Python...'});
  importScripts(url);
  pyodide = await loadPyodide({indexURL});
  pyodide.setStdout({batched:text=>postMessage({type:'stdout',payload:text})});
  pyodide.setStderr({batched:text=>postMessage({type:'stderr',payload:text})});
  postMessage({type:'ready',payload:pyodide.version});
  return pyodide;
}

self.addEventListener('message',async event=>{
  const data=event.data||{};
  try{
    const runtime=await ensurePyodide(data.url||currentUrls?.url,data.indexURL||currentUrls?.indexURL);
    if(data.type==='run'){
      const inputs=Array.isArray(data.stdin)?data.stdin:[];
      const prefix=`import builtins\n__lab_inputs = iter(${JSON.stringify(inputs)})\ndef __lab_input(prompt=''):\n    print(prompt, end='')\n    try:\n        value = next(__lab_inputs)\n    except StopIteration:\n        value = ''\n    print(value)\n    return value\nbuiltins.input = __lab_input\n`;
      const result=await runtime.runPythonAsync(`${prefix}\n${data.code}\n`);
      if(result!==undefined&&result!==null)postMessage({type:'result',payload:String(result)});
      postMessage({type:'done',payload:{ok:true}});
    }else if(data.type==='install'){
      postMessage({type:'status',payload:`Instalando ${data.packageName}...`});
      await runtime.loadPackage(data.packageName);
      postMessage({type:'package',payload:{name:data.packageName,installed:true}});
    }else if(data.type==='version'){
      postMessage({type:'ready',payload:runtime.version});
    }
  }catch(error){postMessage({type:'error',payload:{message:error.message,stack:error.stack||''}});postMessage({type:'done',payload:{ok:false}});}
});
