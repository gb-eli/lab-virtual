'use strict';

const fs = require('fs');
const vm = require('vm');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const storage = new Map();
const context = {
  console,
  setTimeout,
  clearTimeout,
  AbortController,
  DOMException,
  performance,
  window:{},
  document:{title:'',body:{style:{setProperty(){}}}},
  localStorage:{getItem:key=>storage.has(key)?storage.get(key):null,setItem:(key,value)=>storage.set(key,String(value)),removeItem:key=>storage.delete(key)},
};
context.window = context;
vm.createContext(context);
context.LABDS={Session:{scopeId:()=>"test-session"}};
for(const file of ['js/config.js','js/terminal/command-matrix.js','js/terminal/fs.js','js/terminal/network-engine.js','js/terminal/shells.js']){
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
}

(async()=>{
  const profile = context.LABDS.TERMINALS.find(item=>item.id==='cmd');
  const vfs = new context.LABDS.VirtualFS(profile);
  const shell = context.LABDS.createShell(profile,vfs,()=>{},()=>{});
  assert.strictEqual(await shell.run('mkdir projeto'),'');
  assert.strictEqual(await shell.run('cd projeto'),'');
  assert.strictEqual(await shell.run('echo Desenvolvimento de Sistemas > README.txt'),'');
  assert.strictEqual((await shell.run('type README.txt')).trim(),'Desenvolvimento de Sistemas');
  assert.ok((await shell.run('dir')).includes('README.txt'));
  assert.strictEqual(await shell.run('copy README.txt copia.txt'),'        1 arquivo(s) copiado(s).');
  assert.ok(vfs.exists(vfs.resolve('copia.txt')));
  await shell.run('ren copia.txt novo.txt');
  assert.ok(vfs.exists(vfs.resolve('novo.txt')));
  await shell.run('mkdir css');
  await shell.run('echo body > css\\estilo.css');
  const treeDirs=await shell.run('tree');
  const treeFiles=await shell.run('tree /f');
  const treeAscii=await shell.run('tree /f /a');
  assert.ok(treeDirs.includes('css'));
  assert.ok(!treeDirs.includes('estilo.css'));
  assert.ok(treeFiles.includes('estilo.css'));
  assert.ok(treeAscii.includes('+---')||treeAscii.includes('\\---'));
  assert.ok((await shell.run('tree inexistente')).includes('não pode encontrar'));
  const parsed=context.LABDS.CommandAudit.parse('tree "C:\\Minha Pasta" /f /a');
  assert.strictEqual(parsed.command,'tree');
  assert.ok(parsed.args.includes('C:\\Minha Pasta'));

  const linux = context.LABDS.TERMINALS.find(item=>item.id==='bash');
  const lfs = new context.LABDS.VirtualFS(linux);
  const bash = context.LABDS.createShell(linux,lfs,()=>{},()=>{});
  await bash.run('mkdir projeto && cd projeto');
  await bash.run('echo "linha um" > arquivo.txt');
  await bash.run('echo "linha dois" >> arquivo.txt');
  assert.ok((await bash.run('cat arquivo.txt | grep dois')).includes('dois'));

  const resolved = context.LABDS.NetworkEngine.resolveHost('github.com',context.LABDS.NetworkEngine.profiles.rede_estavel);
  assert.strictEqual(resolved.ok,true);
  const lines=[];
  const ping = await context.LABDS.NetworkEngine.ping({host:'8.8.8.8',count:1,style:'windows',profileId:'rede_estavel',seed:'teste',onLine:line=>lines.push(line)});
  assert.strictEqual(ping.sent,1);
  assert.ok(lines.some(line=>line.includes('Disparando')));
  assert.ok(lines.some(line=>line.includes('Estatísticas')));
  const repeatLines=[];
  const repeated = await context.LABDS.NetworkEngine.ping({host:'8.8.8.8',count:1,style:'windows',profileId:'rede_estavel',seed:'teste',onLine:line=>repeatLines.push(line)});
  assert.strictEqual(JSON.stringify(repeated.values),JSON.stringify(ping.values),'A semente de rede não reproduziu a latência.');
  const traceLines=[];
  const hops=await context.LABDS.NetworkEngine.traceroute({host:'github.com',style:'windows',profileId:'rede_estavel',seed:'aula-2ds',onLine:line=>traceLines.push(line)});
  assert.ok(hops.length>=4,'Traceroute não gerou saltos suficientes.');
  assert.ok(traceLines.some(line=>line.includes('Rastreando a rota')));
  assert.ok(traceLines.some(line=>line.includes('Rastreamento concluído')));

  console.log('✓ sistema de arquivos CMD');
  console.log('✓ tree, tree /f, tree /a e parser de aspas');
  console.log('✓ operadores e pipeline Bash');
  console.log('✓ ping progressivo e estatísticas');
  console.log('✓ semente reproduzível e traceroute progressivo');
  console.log('Todos os testes centrais passaram.');
})().catch(error=>{console.error(error);process.exit(1);});
