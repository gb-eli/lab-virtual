'use strict';

const VERSION='labds-v8.2.3-pages';
const CORE=`${VERSION}-core`;
const RUNTIME=`${VERSION}-runtime`;
const EXTERNAL=`${VERSION}-external`;
const CORE_FILES=[
  './','./index.html','./offline.html','./manifest.webmanifest',
  './css/style.css','./css/session.css','./css/vm-lab-v5.css','./css/accessibility-learning.css','./css/v8-design.css','./css/iara-integration.css',
  './assets/icon.svg','./assets/hero-tech-lab.svg',
  './js/config.js','./js/schemas.js','./js/storage.js','./js/exporter.js','./js/session.js','./js/session-exporter.js',
  './js/learning-content.js','./js/accessibility.js','./js/learning-mode.js','./js/ui-effects.js','./js/app.js',
  './js/terminal/command-catalog.js','./js/terminal/command-matrix.js','./js/terminal/fs.js','./js/terminal/network-engine.js','./js/terminal/shells.js','./js/terminal/terminal-controller.js',
  './js/labs/python-lab.js','./js/labs/javascript-lab.js','./js/labs/web-lab.js','./js/labs/sql-lab.js','./js/labs/network-lab.js',
  './js/labs/vm-lab.js','./js/labs/vm/profiles.js','./js/labs/vm/engine.js','./js/labs/vm/renderer.js','./js/labs/hardware-lab.js','./js/labs/graphics-lab.js','./js/labs/blocks-lab.js','./js/labs/data-tools-lab.js','./js/labs/git-lab.js','./js/labs/security-lab.js','./js/labs/sysadmin-lab.js',
  './js/labs/code-games-lab.js','./js/labs/voxelcraft-lab.js','./js/labs/iara-lab.js','./js/labs/fintech-lab.js','./js/labs/blockchain-lab.js','./js/labs/communication-lab.js','./js/labs/display-media-lab.js','./js/labs/automation-lab.js','./js/labs/ai-lab.js','./js/labs/network-ops-lab.js','./js/labs/game-engine-lab.js','./js/labs/electronics-lab.js',
  './games/voxelcraft/index.html','./games/voxelcraft/css/style.css','./games/voxelcraft/js/app.js','./games/voxelcraft/js/game.js','./games/voxelcraft/js/storage.js','./games/voxelcraft/manifest.json','./games/voxelcraft/README.md','./games/voxelcraft/docs/arquitetura.md',
  './js/workers/javascript-runner.js','./js/workers/python-runner.js','./js/workers/sql-runner.js',
  './assistants/iara/README.md',
  './assistants/iara/assets/generated/3d-printer-prototype.svg',
  './assistants/iara/assets/generated/ai-library.svg',
  './assistants/iara/assets/generated/ar-smart-glasses.svg',
  './assistants/iara/assets/generated/backend-servers.svg',
  './assistants/iara/assets/generated/banking-security.svg',
  './assistants/iara/assets/generated/chemistry-digital-lab.svg',
  './assistants/iara/assets/generated/cloud-server.svg',
  './assistants/iara/assets/generated/code-mountain.svg',
  './assistants/iara/assets/generated/code-orbit.svg',
  './assistants/iara/assets/generated/cyber-car.svg',
  './assistants/iara/assets/generated/cyber-cat.svg',
  './assistants/iara/assets/generated/cybersecurity-center.svg',
  './assistants/iara/assets/generated/data-engineering.svg',
  './assistants/iara/assets/generated/data-ocean.svg',
  './assistants/iara/assets/generated/database-vault.svg',
  './assistants/iara/assets/generated/digital-map.svg',
  './assistants/iara/assets/generated/dji-drone-lab.svg',
  './assistants/iara/assets/generated/frontend-workspace.svg',
  './assistants/iara/assets/generated/future-school.svg',
  './assistants/iara/assets/generated/graphic-design-studio.svg',
  './assistants/iara/assets/generated/green-computing.svg',
  './assistants/iara/assets/generated/hologram-class.svg',
  './assistants/iara/assets/generated/math-data-board.svg',
  './assistants/iara/assets/generated/neon-bike.svg',
  './assistants/iara/assets/generated/neural-city.svg',
  './assistants/iara/assets/generated/parana-tech-map.svg',
  './assistants/iara/assets/generated/pixel-forest.svg',
  './assistants/iara/assets/generated/python-snake.svg',
  './assistants/iara/assets/generated/quantum-core.svg',
  './assistants/iara/assets/generated/robot-arm-school.svg',
  './assistants/iara/assets/generated/robot-lab.svg',
  './assistants/iara/assets/generated/robotics-competition.svg',
  './assistants/iara/assets/generated/security-shield.svg',
  './assistants/iara/assets/generated/smart-bus.svg',
  './assistants/iara/assets/generated/smart-logistics-port.svg',
  './assistants/iara/assets/generated/smart-port.svg',
  './assistants/iara/assets/generated/solar-train.svg',
  './assistants/iara/assets/generated/space-drone.svg',
  './assistants/iara/assets/generated/vr-classroom.svg',
  './assistants/iara/assets/generated/web-portal.svg',
  './assistants/iara/css/base.css',
  './assistants/iara/css/components.css',
  './assistants/iara/css/lab-integration.css',
  './assistants/iara/css/responsive.css',
  './assistants/iara/data/bank-metrics.json',
  './assistants/iara/data/credit-policy.json',
  './assistants/iara/data/lab-virtual-ds-context.json',
  './assistants/iara/data/manifest.json',
  './assistants/iara/data/vault/algoritmo.vault.json',
  './assistants/iara/data/vault/backend-career.vault.json',
  './assistants/iara/data/vault/base-agv-infraestrutura-2026-001.vault.json',
  './assistants/iara/data/vault/base-agv-oferta-sistema-2026-001.vault.json',
  './assistants/iara/data/vault/base-cal-paranagua-2026-001.vault.json',
  './assistants/iara/data/vault/base-cal-pr-2026-001.vault.json',
  './assistants/iara/data/vault/base-cal-pr-2026-002.vault.json',
  './assistants/iara/data/vault/base-cal-pr-2026-003.vault.json',
  './assistants/iara/data/vault/base-cal-pr-2026-004.vault.json',
  './assistants/iara/data/vault/base-curso-agv-ds-001.vault.json',
  './assistants/iara/data/vault/base-curso-agv-meioambiente-001.vault.json',
  './assistants/iara/data/vault/base-curso-agv-portos-001.vault.json',
  './assistants/iara/data/vault/base-curso-agv-seguranca-001.vault.json',
  './assistants/iara/data/vault/base-curso-comex-historico-001.vault.json',
  './assistants/iara/data/vault/base-curso-meioambiente-matriz-001.vault.json',
  './assistants/iara/data/vault/base-curso-portos-matriz-001.vault.json',
  './assistants/iara/data/vault/base-edu-classroom-001.vault.json',
  './assistants/iara/data/vault/base-edu-classroom-api-001.vault.json',
  './assistants/iara/data/vault/base-geo-paranagua-001.vault.json',
  './assistants/iara/data/vault/base-inst-agv-001.vault.json',
  './assistants/iara/data/vault/base-linguistica-regional-001.vault.json',
  './assistants/iara/data/vault/base-parana-demografia-001.vault.json',
  './assistants/iara/data/vault/base-paranagua-cultura-001.vault.json',
  './assistants/iara/data/vault/base-paranagua-demografia-001.vault.json',
  './assistants/iara/data/vault/base-paranagua-historia-001.vault.json',
  './assistants/iara/data/vault/base-porto-historia-001.vault.json',
  './assistants/iara/data/vault/base-porto-tecnologia-001.vault.json',
  './assistants/iara/data/vault/base-tec-ruby-001.vault.json',
  './assistants/iara/data/vault/biologia-tecnologia.vault.json',
  './assistants/iara/data/vault/celepar-ia-dados.vault.json',
  './assistants/iara/data/vault/celepar.vault.json',
  './assistants/iara/data/vault/cmd.vault.json',
  './assistants/iara/data/vault/cybersecurity.vault.json',
  './assistants/iara/data/vault/design-grafico-mercado.vault.json',
  './assistants/iara/data/vault/dji-drones.vault.json',
  './assistants/iara/data/vault/drones-aplicacoes.vault.json',
  './assistants/iara/data/vault/enem-2026.vault.json',
  './assistants/iara/data/vault/engenharia-analise-mercado.vault.json',
  './assistants/iara/data/vault/fisica-tecnologia.vault.json',
  './assistants/iara/data/vault/frontend-career.vault.json',
  './assistants/iara/data/vault/frontend.vault.json',
  './assistants/iara/data/vault/fullstack-career.vault.json',
  './assistants/iara/data/vault/funcoes.vault.json',
  './assistants/iara/data/vault/github-pages.vault.json',
  './assistants/iara/data/vault/ia-modelos-linguagem.vault.json',
  './assistants/iara/data/vault/ia-uso-educacional.vault.json',
  './assistants/iara/data/vault/ides.vault.json',
  './assistants/iara/data/vault/images.vault.json',
  './assistants/iara/data/vault/impressao-3d.vault.json',
  './assistants/iara/data/vault/ling-assembly.vault.json',
  './assistants/iara/data/vault/ling-c.vault.json',
  './assistants/iara/data/vault/ling-cpp.vault.json',
  './assistants/iara/data/vault/ling-csharp.vault.json',
  './assistants/iara/data/vault/ling-dart.vault.json',
  './assistants/iara/data/vault/ling-gdscript.vault.json',
  './assistants/iara/data/vault/ling-go.vault.json',
  './assistants/iara/data/vault/ling-java.vault.json',
  './assistants/iara/data/vault/ling-javascript.vault.json',
  './assistants/iara/data/vault/ling-kotlin.vault.json',
  './assistants/iara/data/vault/ling-lua.vault.json',
  './assistants/iara/data/vault/ling-php.vault.json',
  './assistants/iara/data/vault/ling-python.vault.json',
  './assistants/iara/data/vault/ling-ruby.vault.json',
  './assistants/iara/data/vault/ling-rust.vault.json',
  './assistants/iara/data/vault/ling-sql.vault.json',
  './assistants/iara/data/vault/ling-swift.vault.json',
  './assistants/iara/data/vault/ling-typescript.vault.json',
  './assistants/iara/data/vault/maratona-programacao.vault.json',
  './assistants/iara/data/vault/matematica-complexa.vault.json',
  './assistants/iara/data/vault/matematica-operacoes.vault.json',
  './assistants/iara/data/vault/meta-orion-ar.vault.json',
  './assistants/iara/data/vault/meta-quest.vault.json',
  './assistants/iara/data/vault/portugues-gramatica.vault.json',
  './assistants/iara/data/vault/python-bibliotecas.vault.json',
  './assistants/iara/data/vault/python-variaveis.vault.json',
  './assistants/iara/data/vault/quimica-fundamentos.vault.json',
  './assistants/iara/data/vault/realidade-virtual.vault.json',
  './assistants/iara/data/vault/robotica-fundamentos.vault.json',
  './assistants/iara/data/vault/ros2.vault.json',
  './assistants/iara/data/vault/sistemas-bancarios.vault.json',
  './assistants/iara/data/vault/sistemas-logistica.vault.json',
  './assistants/iara/data/vault/sociologia.vault.json',
  './assistants/iara/data/vault/topics.vault.json',
  './assistants/iara/data/vault/unespar-enfermagem-2027.vault.json',
  './assistants/iara/data/vault/unespar.vault.json',
  './assistants/iara/data/vault/versoes-2026.vault.json',
  './assistants/iara/data/vault/xss.vault.json',
  './assistants/iara/index.html',
  './assistants/iara/js/boot.js','./assistants/iara/js/app.js',
  './assistants/iara/js/config.js','./assistants/iara/js/token-policy.js',
  './assistants/iara/js/crypto-vault.js',
  './assistants/iara/js/lab-context.js',
  './assistants/iara/js/search-engine.js',
  './assistants/iara/js/ui.js'
];

self.addEventListener('install',event=>{
  event.waitUntil((async()=>{
    const cache=await caches.open(CORE);
    await Promise.all(CORE_FILES.map(async url=>{try{await cache.add(new Request(url,{cache:'reload'}));}catch(error){console.warn('[SW] recurso principal não armazenado',url,error);}}));
  })());
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const valid=new Set([CORE,RUNTIME,EXTERNAL]);
    await Promise.all((await caches.keys()).filter(key=>key.startsWith('labds-')&&!valid.has(key)).map(key=>caches.delete(key)));
    await self.clients.claim();
  })());
});

async function networkFirst(request,{cacheName=RUNTIME,fallback=null,timeoutMs=5000}={}){
  const cache=await caches.open(cacheName),controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),timeoutMs);
  try{const response=await fetch(request,{signal:controller.signal,cache:'no-cache'});if(response&&response.ok)await cache.put(request,response.clone());return response;}
  catch{return (await cache.match(request))||(fallback?await caches.match(fallback):null)||Response.error();}
  finally{clearTimeout(timeout);}
}
async function staleWhileRevalidate(request,cacheName=RUNTIME){const cache=await caches.open(cacheName),cached=await cache.match(request),fresh=fetch(request,{cache:'no-cache'}).then(async response=>{if(response&&response.ok)await cache.put(request,response.clone());return response;}).catch(()=>null);return cached||await fresh||Response.error();}

self.addEventListener('fetch',event=>{
  const request=event.request;if(request.method!=='GET')return;const url=new URL(request.url);
  if(url.origin===self.location.origin){
    if(request.mode==='navigate'||request.destination==='document'){event.respondWith(networkFirst(request,{fallback:'./offline.html',timeoutMs:4000}));return;}
    if(['script','style','worker','sharedworker'].includes(request.destination)){event.respondWith(networkFirst(request,{timeoutMs:4500}));return;}
    event.respondWith(staleWhileRevalidate(request));return;
  }
  if(url.hostname==='cdn.jsdelivr.net')event.respondWith(staleWhileRevalidate(request,EXTERNAL));
});
self.addEventListener('message',event=>{if(event.data?.type==='SKIP_WAITING')self.skipWaiting();if(event.data?.type==='CLEAR_RUNTIME')event.waitUntil(Promise.all([caches.delete(RUNTIME),caches.delete(EXTERNAL)]));if(event.data?.type==='GET_VERSION')event.source?.postMessage?.({type:'LABDS_VERSION',version:VERSION});});
