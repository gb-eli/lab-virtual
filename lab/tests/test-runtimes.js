'use strict';

const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');

async function testJavaScriptWorker(){
  const messages=[],listeners={},sources=new Map();let nextUrl=0;
  class FakeBlob{constructor(parts){this.source=parts.join('');}}
  const context={setTimeout,clearTimeout,Promise,JSON,URL:{createObjectURL(blob){const url=`blob:test-${++nextUrl}`;sources.set(url,blob.source);return url;},revokeObjectURL(url){sources.delete(url);}},Blob:FakeBlob,postMessage(message){messages.push(message);},console:{log(){},info(){},warn(){},error(){}},fetch(){},XMLHttpRequest:function(){},WebSocket:function(){},EventSource:function(){}};
  context.self=context;context.addEventListener=(type,handler)=>{listeners[type]=handler;};context.importScripts=url=>vm.runInContext(sources.get(url),context,{filename:'student-code.js'});
  vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'js/workers/javascript-runner.js'),'utf8'),context,{filename:'javascript-runner.js'});
  listeners.message({data:{type:'run',code:'console.log(2 + 3); try { await fetch("https://example.com"); } catch (error) { console.log(error.message); }',stdin:[]}});await new Promise(resolve=>setTimeout(resolve,0));
  assert.ok(messages.some(item=>item.type==='console'&&item.payload.text==='5'),'Worker JavaScript não executou o código.');
  assert.ok(messages.some(item=>item.type==='done'&&item.payload.ok===true),'Worker JavaScript não concluiu com sucesso.');
  assert.ok(messages.some(item=>item.type==='console'&&/rede bloqueado/i.test(item.payload.text)),'Worker JavaScript não bloqueou a rede.');
}

async function testPythonWorker(){
  const messages=[],listeners={};let executed='';
  const runtime={version:'3.12-test',setStdout(){},setStderr(){},async runPythonAsync(source){executed=source;return 42;},async loadPackage(){}};
  const context={Promise,JSON,postMessage(message){messages.push(message);},importScripts(){context.loadPyodide=async()=>runtime;}};
  context.self=context;context.addEventListener=(type,handler)=>{listeners[type]=handler;};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'js/workers/python-runner.js'),'utf8'),context,{filename:'python-runner.js'});
  await listeners.message({data:{type:'run',code:'print("Olá")',stdin:['Ana'],url:'pyodide.js',indexURL:'./'}});await new Promise(resolve=>setTimeout(resolve,0));
  assert.ok(executed.includes('builtins.input = __lab_input'),'Entrada Python não foi isolada.');
  assert.ok(executed.includes('print("Olá")'),'Código Python não chegou ao runtime.');
  assert.ok(messages.some(item=>item.type==='done'&&item.payload.ok===true),'Worker Python não concluiu.');
}

(async()=>{
  await testJavaScriptWorker();await testPythonWorker();
  const sql=fs.readFileSync(path.join(root,'js/labs/sql-lab.js'),'utf8');
  assert.ok(/20\*1024\*1024/.test(sql),'Limite de importação SQLite ausente.');
  assert.ok(/values\.slice\(0,500\)/.test(sql),'Limite de renderização SQL ausente.');
  console.log('✓ execução JavaScript no Worker e bloqueio de rede');
  console.log('✓ ponte de entrada e execução Python no Worker');
  console.log('✓ limites de importação e renderização SQLite');
})().catch(error=>{console.error(error);process.exit(1);});
