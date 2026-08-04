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
const configSource=read(path.join(lab,'js/config.js'));
vm.runInNewContext(configSource,context,{filename:'config.js'});
const {VERSION,TOOLS}=context.window.LABDS;
assert(VERSION==='4.21.0',`Versão inesperada: ${VERSION}`);
const release=context.window.LABDS.RELEASE;
assert(release?.version===VERSION,'Metadados de versão não correspondem à versão instalada.');
assert(Number.isFinite(new Date(release?.updatedAt).getTime()),'Data e hora da atualização são inválidas.');
const versionFile=JSON.parse(read(path.join(lab,'version.json')));
assert(versionFile.version===VERSION,'version.json não corresponde à versão instalada.');
assert(versionFile.updatedAt===release.updatedAt,'version.json e config.js possuem horários diferentes.');
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
  const scriptSources=(manifest.scripts||[]).map(ref=>read(path.join(lab,ref)));assert(scriptSources.some(source=>source.includes('LABDS_LABS')),`Módulo ${moduleName} não contém registro LABDS_LABS em nenhum script declarado.`);
}
assert(fs.existsSync(path.join(lab,'modules/cyber-ops/index.html')),'Aplicação Cyber Ops isolada ausente.');
assert(fs.existsSync(path.join(lab,'modules/cyber-ops/module.json')),'Descritor do Cyber Ops ausente.');
assert(!modules.some(id=>/iara/i.test(id)),'A Iara ainda aparece como módulo.');
const moduleIndex=JSON.parse(read(path.join(lab,'modules/MODULE_INDEX.json')));
assert(moduleIndex.version==='4.0.0',`Versão inesperada no índice de módulos: ${moduleIndex.version}`);
assert(moduleIndex.count===modules.length,`Índice declara ${moduleIndex.count} módulos, mas o catálogo usa ${modules.length}.`);
assert(new Set(moduleIndex.modules.map(item=>item.id)).size===moduleIndex.modules.length,'Há IDs duplicados no índice de módulos.');
for(const moduleName of modules)assert(moduleIndex.modules.some(item=>item.id===moduleName),`Módulo ausente no MODULE_INDEX: ${moduleName}`);

const printingManifest=JSON.parse(read(path.join(lab,'modules/printing3d-lab/module.json')));
assert(printingManifest.version==='4.17.0','Manifesto da Impressão 3D não está na V4.17.0.');
assert(printingManifest.weight==='heavy','Impressão 3D WebGL deve ser carregada como módulo pesado sob demanda.');
assert(moduleIndex.modules.find(item=>item.id==='printing3d-lab')?.version==='4.17.0','MODULE_INDEX não referencia Impressão 3D V4.17.0.');
const printingSource=read(path.join(lab,'modules/printing3d-lab/index.js'));
for(const marker of ['THREE_URL','WebGLRenderer','createModelAsset','buildMachine','bindOrbit','printing-preflight-layout','data-print-view','data-scene-toggle','preflightReady',"status===\'heating\'","status===\'homing\'","status===\'cooling\'",'telemetryNozzle','printCanvas3d'])assert(printingSource.includes(marker),`Impressão 3D incompleta: ${marker}`);
const blocksManifest=JSON.parse(read(path.join(lab,'modules/blocks-lab/module.json')));
assert(blocksManifest.version==='4.17.0','Manifesto de Blocos não está na V4.17.0.');
assert(blocksManifest.weight==='medium','Programação em Blocos visual deve usar peso médio.');
assert(moduleIndex.modules.find(item=>item.id==='blocks-lab')?.version==='4.17.0','MODULE_INDEX não referencia Blocos V4.17.0.');
const blocksSource=read(path.join(lab,'modules/blocks-lab/index.js'));
for(const marker of ['blocksVisualCanvas','previewRoute','parseProgram','Executar visualmente','Mover 1 casa','Girar 90° à direita','blocks-variable-grid','drawScene','runToken'])assert(blocksSource.includes(marker),`Programação em Blocos visual incompleta: ${marker}`);
const fabricationStyles=read(path.join(lab,'css/v32.css'));
for(const marker of ['.printing-layout-v40','.printing-stage canvas','.printing-telemetry','.printing-preflight-layout','.blocks-workspace-v2','.blocks-visual-panel canvas','.logic-block.is-running'])assert(fabricationStyles.includes(marker),`CSS da Fase 1.5 incompleto: ${marker}`);


const hardwareManifest=JSON.parse(read(path.join(lab,'modules/hardware-lab/module.json')));
assert(hardwareManifest.version==='4.28.0','Manifesto do Hardware Studio Premium 3D não está na V4.28.0.');
assert(moduleIndex.modules.find(item=>item.id==='hardware-lab')?.version==='4.28.0','MODULE_INDEX não referencia Hardware V4.28.0.');
const hardwareSource=read(path.join(lab,'modules/hardware-lab/index.js'));
const hardwareCaseEngine=read(path.join(lab,'modules/hardware-lab/case-engine.js'));
const hardwarePeripheralEngine=read(path.join(lab,'modules/hardware-lab/peripheral-engine.js'));
const hardwareLayoutEngine=read(path.join(lab,'modules/hardware-lab/layout-engine.js'));
const hardwareThermalEngine=read(path.join(lab,'modules/hardware-lab/thermal-engine.js'));
const hardwareMaterialEngine=read(path.join(lab,'modules/hardware-lab/material-engine.js'));
const hardwareFamilyEngine=read(path.join(lab,'modules/hardware-lab/computer-family-engine.js'));
const hardwareInspectionEngine=read(path.join(lab,'modules/hardware-lab/inspection-engine.js'));
const hardwareCinematicEngine=read(path.join(lab,'modules/hardware-lab/cinematic-engine.js'));
const hardwareSystemEngine=read(path.join(lab,'modules/hardware-lab/system-runtime-engine.js'));
const hardwareIncidentEngine=read(path.join(lab,'modules/hardware-lab/benchmark-incident-engine.js'));
assert(hardwareManifest.scripts?.[1]==='modules/hardware-lab/peripheral-engine.js','Motor de periféricos deve carregar depois do motor estrutural.');
assert(hardwareManifest.scripts?.[2]==='modules/hardware-lab/layout-engine.js','Motor de layout deve carregar depois do motor de periféricos.');
assert(hardwareManifest.scripts?.[3]==='modules/hardware-lab/thermal-engine.js','Motor térmico deve carregar antes do módulo principal.');
assert(hardwareManifest.scripts?.[4]==='modules/hardware-lab/material-engine.js','Motor de materiais deve carregar antes dos motores avançados.');
assert(hardwareManifest.scripts?.[5]==='modules/hardware-lab/computer-family-engine.js','Motor de famílias deve carregar depois do pipeline gráfico.');
assert(hardwareManifest.scripts?.[6]==='modules/hardware-lab/inspection-engine.js','Motor de inspeção deve carregar depois do motor de famílias.');
assert(hardwareManifest.scripts?.[7]==='modules/hardware-lab/cinematic-engine.js','Motor de cinema deve carregar depois do motor de inspeção.');
assert(hardwareManifest.scripts?.[8]==='modules/hardware-lab/system-runtime-engine.js','Motor de sistema deve carregar depois do motor cinematográfico.');
assert(hardwareManifest.scripts?.[9]==='modules/hardware-lab/benchmark-incident-engine.js','Motor de incidente deve carregar antes da montagem.');
assert(hardwareManifest.scripts?.[10]==='modules/hardware-lab/assembly-engine.js','Motor de montagem deve carregar antes do módulo principal.');
assert(hardwareManifest.scripts?.[11]==='modules/hardware-lab/index.js','O orquestrador principal deve ser o último script do Hardware.');
for(const marker of ['LABDS_HARDWARE_PERIPHERALS','COUNTS','LAYOUTS','MOUNTS','buildMonitorPlan','compatibleLayouts','compatibleMounts'])assert(hardwarePeripheralEngine.includes(marker),`Motor de periféricos incompleto: ${marker}`);
for(const marker of ['LABDS_HARDWARE_LAYOUT','calculate','monitorGeometry','overlaps','insideSurface','supported','clampCameraDistance','clampCameraPitch'])assert(hardwareLayoutEngine.includes(marker),`Motor de layout físico incompleto: ${marker}`);
for(const marker of ['LABDS_HARDWARE_THERMAL','FAN_PROFILES','SPEED_PROFILES','FILTERS','WORKLOADS','simulate','pressure','dustRisk','chooseRadiatorLocation','buildPaths'])assert(hardwareThermalEngine.includes(marker),`Motor térmico incompleto: ${marker}`);
for(const marker of ['LABDS_HARDWARE_FAMILIES','FAMILIES','supportsManualAssembly','availableInspectionTargets','estimate','mini_pc','all_in_one','notebook','gaming_notebook'])assert(hardwareFamilyEngine.includes(marker),`Motor de famílias incompleto: ${marker}`);
for(const marker of ['LABDS_HARDWARE_INSPECTION','TARGETS','VIEWS','prepare','applyExploded','camera','dispose'])assert(hardwareInspectionEngine.includes(marker),`Motor de inspeção incompleto: ${marker}`);
for(const marker of ['LABDS_HARDWARE_CINEMATIC','SHOTS','SPEEDS','cameraPose','tick','overview','hero'])assert(hardwareCinematicEngine.includes(marker),`Motor cinematográfico incompleto: ${marker}`);
for(const marker of ['LABDS_HARDWARE_SYSTEM','OS_PROFILES','POST_STEPS','beginPost','beginInstall','installTick','bootTick','screenModel','windows11','linuxMint'])assert(hardwareSystemEngine.includes(marker),`Motor de sistema incompleto: ${marker}`);
for(const marker of ['LABDS_HARDWARE_BENCHMARK_INCIDENT','STRESS_LEVELS','ENVIRONMENTS','PROTECTIONS','predict','faultScore','extinguish','educationalOverride'])assert(hardwareIncidentEngine.includes(marker),`Motor de incidente térmico incompleto: ${marker}`);
for(const marker of ['LABDS_HARDWARE_MATERIALS','QUALITY_PROFILES','PRESETS','createMaterial','configureRenderer','createLighting','createEnvironmentMap','createContactShadow','addRgbGlow','glassFrosted','brushedMetal','carbon','pcb'])assert(hardwareMaterialEngine.includes(marker),`Motor de materiais PBR incompleto: ${marker}`);
for(const marker of ['LABDS_HARDWARE_CASES','PROFILES','enrichCatalog','normalizePanel','nextPanel','canMountRadiator','sceneGeometry','structureSummary'])assert(hardwareCaseEngine.includes(marker),`Motor estrutural dos gabinetes incompleto: ${marker}`);
assert(hardwareManifest.scripts?.[0]==='modules/hardware-lab/case-engine.js','Motor estrutural dos gabinetes deve carregar antes do módulo principal.');
for(const marker of ['Hardware Studio Premium 3D','hardware-assembly-dock','hardware-case-structure','hardware-thermal-panel','hardware-layout-safety','hardware-graphics-panel','hardware-monitor-setup','PERIPHERAL_API','monitorCount','monitorLayout','monitorMount','monitor2','monitor3','LAYOUT_API','calculateSetupLayout','THERMAL_API','MATERIAL_API','CASE_FINISHES','GLASS_STYLES','RGB_INTENSITIES','materialDetail','contactShadows','buildVisualAccents','fanProfile','filterCondition','workload','ambientTemperature','radiatorPosition','thermalOverlay','cpuTemperature','gpuTemperature','pressureDelta','dustRisk','prepareManualAssembly','setupAssemblyEngine','validateAssemblyPart','cycleCasePanel','buildCaseChassis','addFrontPanel','addSidePanel','addInternalStructure','hwCasePanel','caseSidePanel','caseStructureVisible','hwUndoAssembly','hwRedoAssembly','hwSnapSelected','hardwareCanvas3d','hardwareCanvas2d','benchmarkSuite','runBenchmark','runDiagnostic','runAssemblyDemo','buildPCScene','buildStudioEnvironment','addCurvedTube','createFloor','ShaderMaterial','MeshPhysicalMaterial','data-hw-quality','labGraphics','componentOptions','storage2','webcams','controllers','ups','MODULE_UPDATED_AT','SYSTEM_API','INCIDENT_API','installSystem','requestBenchmarkDecision','useExtinguisher','hwInstallSystem','hwIncidentFx','benchmarkFaultInjection'])assert(hardwareSource.includes(marker),`Hardware Studio Premium 3D V4.28.0 incompleto: ${marker}`);
assert(hardwareManifest.weight==='heavy','Hardware Studio 3D deve ser carregado como módulo pesado sob demanda.');
assert(hardwareManifest.styles?.includes('modules/hardware-lab/styles.css'),'Hardware Studio 3D não referencia o CSS modular.');
const hardwareAssemblyTest=spawnSync(process.execPath,[path.join(root,'tools/test-hardware-assembly.mjs')],{encoding:'utf8'});
assert(hardwareAssemblyTest.status===0,`Teste do motor de montagem falhou: ${(hardwareAssemblyTest.stderr||hardwareAssemblyTest.stdout).trim()}`);
const hardwarePeripheralTest=spawnSync(process.execPath,[path.join(root,'tools/test-hardware-peripheral-engine.mjs')],{encoding:'utf8'});
assert(hardwarePeripheralTest.status===0,`Teste do motor de periféricos falhou: ${(hardwarePeripheralTest.stderr||hardwarePeripheralTest.stdout).trim()}`);
const hardwareLayoutTest=spawnSync(process.execPath,[path.join(root,'tools/test-hardware-layout-engine.mjs')],{encoding:'utf8'});
assert(hardwareLayoutTest.status===0,`Teste do motor de layout físico falhou: ${(hardwareLayoutTest.stderr||hardwareLayoutTest.stdout).trim()}`);
const hardwareMaterialTest=spawnSync(process.execPath,[path.join(root,'tools/test-hardware-material-engine.mjs')],{encoding:'utf8'});
assert(hardwareMaterialTest.status===0,`Teste do motor de materiais PBR falhou: ${(hardwareMaterialTest.stderr||hardwareMaterialTest.stdout).trim()}`);
const hardwareAdvancedTest=spawnSync(process.execPath,[path.join(root,'tools/test-hardware-family-inspection-cinema.mjs')],{encoding:'utf8'});
assert(hardwareAdvancedTest.status===0,`Teste de famílias, inspeção e cinema falhou: ${(hardwareAdvancedTest.stderr||hardwareAdvancedTest.stdout).trim()}`);
const hardwareSystemTest=spawnSync(process.execPath,[path.join(root,'tools/test-hardware-system-benchmark-incident.mjs')],{encoding:'utf8'});
assert(hardwareSystemTest.status===0,`Teste de POST, sistema e incidente térmico falhou: ${(hardwareSystemTest.stderr||hardwareSystemTest.stdout).trim()}`);
const hardwareStyles=read(path.join(lab,'modules/hardware-lab/styles.css'));
for(const marker of ['.hardware-v421','.hardware-v4211','.hardware-assembly-dock','.hardware-assembly-actions','.hardware-assembly-parts','.hardware-render-area','.hardware-quality','.hardware-benchmark-bars','.hardware-control-grid','.hardware-layout-safety','.hardware-graphics-panel','.hardware-monitor-setup','.hardware-v426','.hardware-v427','.hardware-family-grid','.hardware-inspection-views','.hardware-cinema-track','.hardware-v428','.hardware-incident-fx','.pc-screen-progress','.hardware-incident-timeline'])assert(hardwareStyles.includes(marker),`CSS modular do Hardware Studio incompleto: ${marker}`);
const engineManifest=JSON.parse(read(path.join(lab,'modules/game-engine-lab/module.json')));
assert(engineManifest.version==='4.19.0','Manifesto do Laboratório de Engine não está na V4.19.0.');
assert(moduleIndex.modules.find(item=>item.id==='game-engine-lab')?.version==='4.19.0','MODULE_INDEX não referencia Engine V4.19.0.');
const engineSource=read(path.join(lab,'modules/game-engine-lab/index.js'));
for(const marker of ['voxelWorld','setBlockTarget','editVoxelAt','sumBlocks','drawProfilerScene','performance.now','Profiler real','Editor de mundo 2.5D','undoVoxel','redoVoxel','profilerAdvice','platformPaused','MODULE_UPDATED_AT'])assert(engineSource.includes(marker),`Laboratório de Engine V4.19.0 incompleto: ${marker}`);
const visualUpgradeStyles=read(path.join(lab,'css/v32.css'));
for(const marker of ['.hardware-canvas-wrap canvas','.hardware-part-strip','.hardware-diagnostics-grid','.engine-v419 .engine-stage canvas'])assert(visualUpgradeStyles.includes(marker),`CSS da Fase 1.7 incompleto: ${marker}`);

const arcadeManifest=JSON.parse(read(path.join(lab,'modules/code-games-lab/module.json')));
assert(arcadeManifest.version==='4.15.0',`Versão inesperada dos Simuladores Interativos DS: ${arcadeManifest.version}`);
assert(moduleIndex.modules.find(item=>item.id==='code-games-lab')?.version==='4.15.0','MODULE_INDEX não referencia Simuladores Interativos DS V4.15.0.');
const arcadeTool=TOOLS.find(tool=>tool.id==='code-games');
assert(arcadeTool?.name==='Simuladores Interativos DS','Catálogo não apresenta a nova identidade dos simuladores.');
assert(arcadeTool?.description?.startsWith('Três simuladores'),'Catálogo não anuncia os três simuladores preservados.');
assert(arcadeTool?.experiences?.includes('simulator')&&!arcadeTool?.experiences?.includes('game'),'Simuladores Interativos DS ainda está classificado como jogo.');
const arcadeSource=read(path.join(lab,'modules/code-games-lab/index.js'));
for(const simulatorId of ['trio','trend','drone'])assert(new RegExp(`\n    ${simulatorId}:\{name:`).test(arcadeSource),`Simulador ausente: ${simulatorId}`);
const activeCatalog=arcadeSource.match(/const GAMES=\{([\s\S]*?)\n  \};/)?.[1]||'';
for(const removedId of ['snake','hangman','pac','memory','platform'])assert(!new RegExp(`\n    ${removedId}:\{name:`).test(activeCatalog),`Jogo ainda ativo no catálogo interno: ${removedId}`);
for(const marker of ['Simuladores Interativos DS','Fliperama DS — A Evolução dos Jogos','openFliperamaDs','FLIPERAMA_DS_URL','Em breve'])assert(arcadeSource.includes(marker)||configSource.includes(marker),`Ponte para o Fliperama incompleta: ${marker}`);
for(const marker of ['arcade-system-dock','arcade-library-drawer','arcade-mobile-gate','startOrResumeMobileGame','renderMobileEntry','visualViewport','resolveDroneQuality','stepDroneFlight','sampleDroneGamepad','data-drone-camera','ACESFilmicToneMapping','droneMissionMedal','droneLandingGrade','updateDroneHazard','data-drone-checkpoint-reset','droneMissionPanel','droneWeatherForPhase','sampleDroneWeather','applyDroneWeather','droneWeatherFlash','dataset.droneWeather','normalizeDroneQualityMode','estimateDroneHardwareProfile','droneFrameMetrics','recommendDroneQuality','evaluateDroneAdaptiveTier','data-drone-quality-mode','data-drone-benchmark','dronePerfFps','normalizeControlScale','normalizeControlOpacity','arcadeReducedMotion','arcadeHapticPattern','data-control-scale','data-control-opacity','data-control-haptics','data-control-invert-y','data-drone-precision','requestArcadeWakeLock','arcadeGameProgress','arcadeSessionDefaults','normalizeArcadeSession','arcadeSessionHudMarkup','arcade-session-hud','arcadeSessionProgress','arcadeCompletion','activeArcadeDialog','handleArcadeDialogKey','renderGameRecovery','data-retry-game','schemaVersion:13','data-close-control-settings','drone-customization-panel','data-drone-model','data-drone-environment','data-drone-weather-mode','normalizeDroneModel','resolveDroneWeather','drone-flight-track','dronePreflightReady','data-drone-preflight','data-drone-arm','normalizeDroneFlightMode','normalizeDroneControlMode','droneTelemetrySample','droneBatteryDrain','droneFailsafeState','data-drone-sensor-camera','drone-telemetry-panel'])assert(arcadeSource.includes(marker),`Navegação móvel do Arcade incompleta: ${marker}`);
assert(!arcadeSource.includes('V4.9.0'),'O código do Arcade ainda contém identificação visual da V4.9.0.');
const arcadeStyles=read(path.join(lab,'modules/code-games-lab/styles.css'));
for(const selector of ['.arcade-system-dock','.arcade-library-drawer','.arcade-mobile-gate','[data-action="action"]','.drone-flight-toolbar','.drone-crosshair','[data-drone-camera="cockpit"]','.drone-mission-panel','.drone-route','[data-drone-checkpoint-reset]','.drone-weather-flash','.drone-weather-badge','[data-drone-weather]','.drone-performance-panel','.drone-quality-options','[data-drone-quality-mode]','.drone-benchmark-button','.arcade-sr-only','[data-arcade-contrast="high"]','[data-arcade-motion="reduced"]','[data-action="precision"]','[data-drone-precision]','.arcade-session-hud','.arcade-session-progress','.arcade-game-badges','[data-game-state="','.arcade-recovery-panel',':focus-visible','.drone-preflight-panel','.drone-telemetry-panel','.drone-model-specs','.drone-sensor-button','[data-drone-armed=','[data-drone-failsafe='])assert(arcadeStyles.includes(selector),`CSS móvel do Arcade incompleto: ${selector}`);

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
for(const marker of ['homeVersionStatusBtn','versionDialog','versionRefreshBtn','versionPublishedAt'])assert(index.includes(marker),`Controle de versão ausente no HTML: ${marker}`);
const appSource=read(path.join(lab,'js/app.js'));
for(const marker of ['refreshVersionControl','relativeUpdate','compareVersions','./version.json'])assert(appSource.includes(marker),`Controle de versão ausente no app.js: ${marker}`);
const versionStyles=read(path.join(lab,'css/v32.css'));
for(const marker of ['.home-version-status','.version-overview','.version-details'])assert(versionStyles.includes(marker),`CSS de versão ausente: ${marker}`);
const directScripts=[...index.matchAll(/<script[^>]+src=["']([^"']+)/g)].map(match=>match[1]);
assert(directScripts.length===1&&directScripts[0]==='js/core/bootstrap.js','O HTML inicial deve chamar somente o bootstrap.');
const pwaManifest=JSON.parse(read(path.join(lab,'manifest.webmanifest')));
assert(pwaManifest.start_url.includes(VERSION),`Manifesto PWA não referencia a versão ${VERSION}.`);
assert(index.includes('content="4.21.0"'), 'Meta de versão do HTML não está em 4.21.0.');
const voxelGame=read(path.join(lab,'games/voxelcraft/js/game.js'));
assert(fs.existsSync(path.join(lab,'vendor/three/three.module.min.js')),'Three.js local do VoxelCraft está ausente.');
assert(fs.existsSync(path.join(lab,'vendor/three/three.core.min.js')),'Núcleo local do Three.js está ausente.');
assert(voxelGame.includes("../../../vendor/three/three.module.min.js"),'VoxelCraft não aponta para o renderizador Three.js local.');
assert(!/https:\/\/cdn\.jsdelivr\.net\/npm\/three/.test(voxelGame),'VoxelCraft ainda depende da CDN do Three.js.');
const sw=read(path.join(lab,'service-worker.js'));
assert(sw.includes("labds-v4.21.0-hardware-system-benchmark-incident-phase-a55"),'Service Worker não está no cache da Fase A5.5 de sistema e incidente térmico.');
const coreBlock=sw.match(/CORE_FILES=\[(.*?)\];/s)?.[1]||'';
const coreRefs=[...coreBlock.matchAll(/['"](\.\/?[^'"]+)['"]/g)].map(match=>match[1]);
for(const raw of coreRefs){const clean=raw==='./'?'index.html':raw.replace(/^\.\//,'');assert(fs.existsSync(path.join(lab,clean)),`Arquivo do núcleo ausente no Service Worker: ${raw}`);}
assert(!/modules\/[a-z].*\/index\.js/.test(sw.split('];',1)[0]),'Service Worker está pré-carregando laboratórios.');
assert(!/terminal-controller\.js/.test(sw.split('];',1)[0]),'Service Worker está pré-carregando o terminal pesado.');

if(errors.length){console.error(`FALHA: ${errors.length} problema(s)`);for(const error of errors)console.error(`- ${error}`);process.exit(1);}
console.log(JSON.stringify({status:'ok',version:VERSION,tools:TOOLS.length,modules:modules.length,javascriptFiles:walk(lab).filter(file=>file.endsWith('.js')).length,htmlFiles:walk(lab).filter(file=>file.endsWith('.html')).length},null,2));
