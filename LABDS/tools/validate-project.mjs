import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const lab=path.join(root,'lab');
const errors=[];
const assert=(condition,message)=>{if(!condition)errors.push(message);};
const read=file=>fs.readFileSync(file,'utf8');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);

const context={window:{LABDS:{}},navigator:{},console,Date,URL,URLSearchParams,setTimeout,clearTimeout};
vm.runInNewContext(read(path.join(lab,'js/config.js')),context,{filename:'config.js'});
const {VERSION,TOOLS}=context.window.LABDS;
assert(VERSION==='4.0.0-pages',`Versão inesperada: ${VERSION}`);
assert(Array.isArray(TOOLS)&&TOOLS.length===50,`Catálogo deveria ter 50 ferramentas públicas; encontrado ${TOOLS?.length}`);
const ids=TOOLS.map(tool=>tool.id);assert(new Set(ids).size===ids.length,'Há IDs duplicados no catálogo.');
const modules=[...new Set(TOOLS.filter(tool=>tool.module).map(tool=>tool.module))];
const knownBundles=new Set(['network','terminal','export','eduauth','learning','shell','effects']);
assert(modules.length===41,`Esperados 41 módulos públicos; encontrados ${modules.length}`);
for(const moduleName of modules){
  const folder=path.join(lab,'modules',moduleName),manifestFile=path.join(folder,'module.json');
  assert(fs.existsSync(folder),`Pasta ausente: modules/${moduleName}`);
  assert(fs.existsSync(manifestFile),`Manifesto ausente: modules/${moduleName}/module.json`);
  if(!fs.existsSync(manifestFile))continue;
  const manifest=JSON.parse(read(manifestFile));
  assert(manifest.id===moduleName,`ID incorreto no manifesto ${moduleName}`);
  assert(manifest.load==='on-demand',`Módulo ${moduleName} não está sob demanda.`);
  for(const ref of [...(manifest.scripts||[]),...(manifest.styles||[])])assert(fs.existsSync(path.join(lab,ref)),`Recurso ausente em ${moduleName}: ${ref}`);
  for(const bundle of manifest.bundles||[])assert(knownBundles.has(bundle),`Pacote desconhecido em ${moduleName}: ${bundle}`);
  for(const ref of manifest.scripts||[]){const source=read(path.join(lab,ref));assert(source.includes('LABDS_LABS'),`Módulo ${moduleName} não contém registro LABDS_LABS em ${ref}`);}
}
assert(fs.existsSync(path.join(lab,'modules/cyber-ops/index.html')),'Aplicação Cyber Ops isolada ausente.');
assert(fs.existsSync(path.join(lab,'modules/cyber-ops/module.json')),'Descritor do Cyber Ops ausente.');
assert(!modules.some(id=>/iara/i.test(id)),'A Iara ainda aparece como módulo.');
const moduleIndex=JSON.parse(read(path.join(lab,'modules/MODULE_INDEX.json')));
assert(moduleIndex.version==='4.0.0',`Versão inesperada no índice de módulos: ${moduleIndex.version}`);
assert(moduleIndex.count===modules.length,`Índice declara ${moduleIndex.count} módulos, mas o catálogo usa ${modules.length}.`);
assert(new Set(moduleIndex.modules.map(item=>item.id)).size===moduleIndex.modules.length,'Há IDs duplicados no índice de módulos.');
for(const moduleName of modules)assert(moduleIndex.modules.some(item=>item.id===moduleName),`Módulo ausente no MODULE_INDEX: ${moduleName}`);
const arcadeManifest=JSON.parse(read(path.join(lab,'modules/code-games-lab/module.json')));
assert(arcadeManifest.version==='4.3.0',`Versão inesperada do Arcade: ${arcadeManifest.version}`);
assert(moduleIndex.modules.find(item=>item.id==='code-games-lab')?.version==='4.3.0','MODULE_INDEX não referencia o Arcade V4.3.0.');
const arcadeTool=TOOLS.find(tool=>tool.id==='code-games');
assert(arcadeTool?.description?.startsWith('Oito experiências'),'Catálogo não anuncia as oito experiências do Arcade.');
const arcadeSource=read(path.join(lab,'modules/code-games-lab/index.js'));
for(const gameId of ['snake','hangman','trio','trend','pac','memory','platform','drone'])assert(new RegExp(`\\n    ${gameId}:\\{name:`).test(arcadeSource),`Experiência ausente no Arcade: ${gameId}`);

for(const file of walk(lab).filter(file=>file.endsWith('.js'))){
  const source=read(file),relative=path.relative(root,file);
  if(/(^|\n)\s*(?:import|export)\s/m.test(source)||relative.includes('vendor/three/')||source.includes('export{')){
    const result=spawnSync(process.execPath,['--check','--input-type=module'],{input:source,encoding:'utf8'});
    if(result.status!==0)errors.push(`Sintaxe inválida em ${relative}: ${(result.stderr||result.stdout).trim().split('\n').at(-1)}`);
  }else{
    try{new Function(source);}catch(error){errors.push(`Sintaxe inválida em ${relative}: ${error.message}`);}
  }
}
for(const file of walk(root).filter(file=>/\.(?:json|webmanifest)$/.test(file))){try{JSON.parse(read(file));}catch(error){errors.push(`JSON inválido em ${path.relative(root,file)}: ${error.message}`);}}

for(const file of walk(root).filter(file=>file.endsWith('.html'))){
  const base=path.dirname(file),html=read(file);
  const refs=[...html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)].map(match=>match[1]);
  for(const raw of refs){
    if(!raw||raw.startsWith('#')||/^(?:https?:|data:|blob:|mailto:|tel:|javascript:)/i.test(raw))continue;
    const clean=raw.split(/[?#]/)[0];if(!clean)continue;
    assert(fs.existsSync(path.resolve(base,clean)),`Referência quebrada em ${path.relative(root,file)}: ${raw}`);
  }
}


for(const file of walk(lab).filter(file=>file.endsWith('.css'))){
  const css=read(file),base=path.dirname(file);
  for(const match of css.matchAll(/url\(\s*['\"]?([^'\")]+)['\"]?\s*\)/g)){
    const raw=match[1].trim();
    if(!raw||raw.startsWith('#')||/^(?:https?:|data:|blob:)/i.test(raw))continue;
    const clean=raw.split(/[?#]/)[0];
    assert(fs.existsSync(path.resolve(base,clean)),`Referência CSS quebrada em ${path.relative(root,file)}: ${raw}`);
  }
}

const cyberSw=read(path.join(lab,'modules/cyber-ops/sw.js'));
const cyberCore=cyberSw.match(/CORE_ASSETS\s*=\s*\[(.*?)\];/s)?.[1]||'';
for(const match of cyberCore.matchAll(/['\"](\.\/?[^'\"]+)['\"]/g)){
  const raw=match[1],clean=raw==='./'?'index.html':raw.replace(/^\.\//,'');
  assert(fs.existsSync(path.join(lab,'modules/cyber-ops',clean)),`Recurso offline ausente no Cyber Ops: ${raw}`);
}
assert(/key\.startsWith\(CACHE_PREFIX\)/.test(cyberSw),'O Service Worker autônomo do Cyber Ops não restringe a limpeza aos próprios caches.');

const actionRegistry=JSON.parse(read(path.join(root,'eduauth-action-registry.json')));
for(const action of actionRegistry.actions||[])for(const point of action.integrationPoints||[])assert(fs.existsSync(path.join(root,point.file)),`Ponto de integração EduAuth ausente: ${point.file}`);

const index=read(path.join(lab,'index.html'));
const directScripts=[...index.matchAll(/<script[^>]+src=["']([^"']+)/g)].map(match=>match[1]);
assert(directScripts.length===1&&directScripts[0]==='js/core/bootstrap.js','O HTML inicial deve chamar somente o bootstrap.');
const pwaManifest=JSON.parse(read(path.join(lab,'manifest.webmanifest')));
assert(pwaManifest.start_url.includes(VERSION),`Manifesto PWA não referencia a versão ${VERSION}.`);
assert(index.includes('content="4.0.0"'), 'Meta de versão do HTML não está em 4.0.0.');
const voxelGame=read(path.join(lab,'games/voxelcraft/js/game.js'));
assert(fs.existsSync(path.join(lab,'vendor/three/three.module.min.js')),'Three.js local do VoxelCraft está ausente.');
assert(fs.existsSync(path.join(lab,'vendor/three/three.core.min.js')),'Núcleo local do Three.js está ausente.');
assert(voxelGame.includes("../../../vendor/three/three.module.min.js"),'VoxelCraft não aponta para o renderizador Three.js local.');
assert(!/https:\/\/cdn\.jsdelivr\.net\/npm\/three/.test(voxelGame),'VoxelCraft ainda depende da CDN do Three.js.');
const sw=read(path.join(lab,'service-worker.js'));
assert(sw.includes("labds-v4.3.0-arcade-drone-final"),'Service Worker não está no cache final do Arcade V4.3.0.');
const coreBlock=sw.match(/CORE_FILES=\[(.*?)\];/s)?.[1]||'';
const coreRefs=[...coreBlock.matchAll(/['"](\.\/?[^'"]+)['"]/g)].map(match=>match[1]);
for(const raw of coreRefs){const clean=raw==='./'?'index.html':raw.replace(/^\.\//,'');assert(fs.existsSync(path.join(lab,clean)),`Arquivo do núcleo ausente no Service Worker: ${raw}`);}
assert(!/modules\/[a-z].*\/index\.js/.test(sw.split('];',1)[0]),'Service Worker está pré-carregando laboratórios.');
assert(!/terminal-controller\.js/.test(sw.split('];',1)[0]),'Service Worker está pré-carregando o terminal pesado.');

if(errors.length){console.error(`FALHA: ${errors.length} problema(s)`);for(const error of errors)console.error(`- ${error}`);process.exit(1);}
console.log(JSON.stringify({status:'ok',version:VERSION,tools:TOOLS.length,modules:modules.length,javascriptFiles:walk(lab).filter(file=>file.endsWith('.js')).length,htmlFiles:walk(lab).filter(file=>file.endsWith('.html')).length},null,2));
