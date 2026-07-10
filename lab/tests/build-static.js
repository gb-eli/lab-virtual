'use strict';
const fs=require('fs'),path=require('path'),cp=require('child_process');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist');
const test=cp.spawnSync(process.execPath,[path.join(__dirname,'test-static.js')],{stdio:'inherit'});if(test.status!==0)process.exit(test.status||1);
fs.rmSync(dist,{recursive:true,force:true});fs.mkdirSync(dist,{recursive:true});
const include=['index.html','manifest.webmanifest','service-worker.js','.nojekyll','assets','css','js'];
for(const name of include){const src=path.join(root,name);if(!fs.existsSync(src))continue;fs.cpSync(src,path.join(dist,name),{recursive:true});}
const count=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).reduce((n,e)=>n+(e.isDirectory()?count(path.join(dir,e.name)):1),0);
console.log(`✓ Build estático gerado em dist/ com ${count(dist)} arquivos.`);
