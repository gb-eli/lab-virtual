'use strict';

const nativePostMessage=self.postMessage.bind(self);
const MAX_MESSAGES=350;
const MAX_BYTES=200000;
let messages=0,bytes=0,truncated=false;

function safeValue(value,depth=0,seen=new WeakSet()){
  if(depth>4)return '[profundidade limitada]';
  try{
    if(value===null)return 'null';
    if(typeof value==='string')return value.slice(0,12000);
    if(typeof value==='undefined')return 'undefined';
    if(typeof value==='function')return `[Function ${value.name||'anonymous'}]`;
    if(typeof value==='symbol')return String(value);
    if(typeof value==='bigint')return `${value}n`;
    if(typeof value!=='object')return String(value);
    if(seen.has(value))return '[circular]';seen.add(value);
    if(Array.isArray(value))return `[${value.slice(0,100).map(item=>safeValue(item,depth+1,seen)).join(', ')}${value.length>100?', …':''}]`;
    const entries=Object.entries(value).slice(0,100).map(([key,item])=>`${key}: ${safeValue(item,depth+1,seen)}`);
    return `{${entries.join(', ')}${Object.keys(value).length>100?', …':''}}`;
  }catch{return String(value).slice(0,12000);}
}
function send(type,payload){nativePostMessage({type,payload});}
function sendConsole(level,args){
  if(messages>=MAX_MESSAGES||bytes>=MAX_BYTES){if(!truncated){truncated=true;send('console',{level:'warn',text:'Saída limitada pelo ambiente (máximo de mensagens ou bytes atingido).'});}return;}
  const text=args.map(item=>safeValue(item)).join(' ').slice(0,20000);messages++;bytes+=text.length;send('console',{level,text});
}
const safeConsole=Object.freeze({log:(...args)=>sendConsole('log',args),info:(...args)=>sendConsole('info',args),warn:(...args)=>sendConsole('warn',args),error:(...args)=>sendConsole('error',args),debug:(...args)=>sendConsole('log',args),table:(value)=>sendConsole('log',[value])});
const blocked=label=>()=>{throw new Error(`${label} bloqueado neste ambiente educacional isolado.`);};
try{Object.defineProperty(self,'postMessage',{value:undefined,writable:false,configurable:false});}catch{}
self.fetch=()=>Promise.reject(new Error('Acesso à rede bloqueado neste ambiente educacional.'));
self.XMLHttpRequest=undefined;self.WebSocket=undefined;self.EventSource=undefined;self.Worker=undefined;self.SharedWorker=undefined;

self.addEventListener('message',async event=>{
  const data=event.data||{};if(data.type!=='run')return;
  messages=0;bytes=0;truncated=false;
  const code=String(data.code||'');if(code.length>200000){send('error',{message:'Código excede 200 KB.',name:'LimitError',stack:''});send('done',{ok:false,metrics:{messages,bytes,truncated}});return;}
  const stdin=Array.isArray(data.stdin)?data.stdin.map(item=>String(item).slice(0,10000)).slice(0,200):[];let inputIndex=0;
  const prompt=(message='Entrada:')=>{const value=stdin[inputIndex++]??'';safeConsole.info(`${message} ${value}`);return value;};
  const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
  try{
    const fn=new AsyncFunction('console','prompt','fetch','XMLHttpRequest','WebSocket','EventSource','Worker','SharedWorker','importScripts','close',`"use strict";\n${code}\n//# sourceURL=labds-user-code.js`);
    const result=await fn(safeConsole,prompt,self.fetch,undefined,undefined,undefined,undefined,undefined,blocked('importScripts'),blocked('close'));
    if(result!==undefined)safeConsole.log(result);
    send('done',{ok:true,metrics:{messages,bytes,truncated}});
  }catch(error){send('error',{message:String(error?.message||error).slice(0,12000),stack:String(error?.stack||'').slice(0,40000),name:String(error?.name||'Error').slice(0,100)});send('done',{ok:false,metrics:{messages,bytes,truncated}});}
});
