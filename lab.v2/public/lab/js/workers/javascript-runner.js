'use strict';

const safeValue = value => {
  try{
    if(typeof value === 'string') return value;
    if(typeof value === 'undefined') return 'undefined';
    if(typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`;
    return JSON.stringify(value, null, 2);
  }catch{return String(value);}
};

const send = (type, payload) => postMessage({type, payload});
['log','info','warn','error'].forEach(level => {
  console[level] = (...args) => send('console', {level, text:args.map(safeValue).join(' ')});
});

self.addEventListener('message', event => {
  const {type, code, stdin = []} = event.data || {};
  if(type !== 'run') return;
  let inputIndex = 0;
  self.prompt = message => {
    const value = stdin[inputIndex++] ?? '';
    console.info(`${message || 'Entrada:'} ${value}`);
    return value;
  };
  const nativeImportScripts = self.importScripts.bind(self);
  self.fetch = () => Promise.reject(new Error('Acesso à rede bloqueado neste ambiente isolado.'));
  self.XMLHttpRequest = undefined; self.WebSocket = undefined; self.EventSource = undefined;
  self.importScripts = () => { throw new Error('Importação externa bloqueada no código do estudante.'); };
  const source = `"use strict";\n(async () => {\n${String(code || '')}\n})().then(result => {\n  if(result !== undefined) console.log(result);\n  postMessage({type:'done',payload:{ok:true}});\n}).catch(error => {\n  postMessage({type:'error',payload:{message:error.message,stack:error.stack||'',name:error.name||'Error'}});\n  postMessage({type:'done',payload:{ok:false}});\n});\n//# sourceURL=labds-user-code.js`;
  const url = URL.createObjectURL(new Blob([source], {type:'text/javascript'}));
  try{ nativeImportScripts(url); }
  catch(error){ send('error',{message:error.message,stack:error.stack||'',name:error.name||'Error'});send('done',{ok:false}); }
  finally{ URL.revokeObjectURL(url); }
});
