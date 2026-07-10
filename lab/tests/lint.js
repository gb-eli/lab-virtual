'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'..');
const files=[];
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(['dist','.git','node_modules'].includes(entry.name))continue;const p=path.join(dir,entry.name);if(entry.isDirectory())walk(p);else if(entry.name.endsWith('.js'))files.push(p);}}
walk(root);
for(const file of files){const run=cp.spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(run.status!==0){process.stderr.write(run.stderr||run.stdout);process.exit(run.status||1);}}
const forbidden=[];
for(const file of files){if(file===__filename)continue;const text=fs.readFileSync(file,'utf8');if(/\beval\s*\(/.test(text))forbidden.push(`${path.relative(root,file)} usa eval()`);if(/new\s+Function\s*\(/.test(text))forbidden.push(`${path.relative(root,file)} usa new Function()`);}
if(forbidden.length){console.error(forbidden.join('\n'));process.exit(1);}
console.log(`✓ ${files.length} arquivos JavaScript passaram na verificação de sintaxe.`);
console.log('✓ Nenhum uso direto de eval() ou new Function() foi encontrado.');
