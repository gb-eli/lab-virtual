'use strict';
(function(){
  // LABDS_LABS: recurso auxiliar carregado antes do módulo principal.
  const PROFILES={
    airflow_atx:{caseClass:'Mid Tower ATX',dimensionsMm:[430,465,220],scene:[6.9,7.25,7.35],frontPanel:'mesh',sidePanel:'tempered-glass',panelRemovable:true,panelHinged:true,chambers:1,airflowBias:14,driveBays:{ssd25:2,hdd35:2},mounts:{front:[120,140,240,280,360],top:[120,140,240,280],rear:[120]},notes:'Frente em malha com entrada direta e amplo espaço interno.'},
    panorama_atx:{caseClass:'Panorâmico ATX dual chamber',dimensionsMm:[460,460,285],scene:[8.15,7.2,7.45],frontPanel:'glass',sidePanel:'tempered-glass',panelRemovable:true,panelHinged:false,chambers:2,airflowBias:6,driveBays:{ssd25:4,hdd35:2},mounts:{side:[120,240,360],top:[120,140,240,280,360],bottom:[120,140,240,280,360]},notes:'Câmara dupla, frente panorâmica e entradas laterais e inferiores.'},
    gamer_mid:{caseClass:'Mid Tower gamer ATX',dimensionsMm:[410,440,215],scene:[6.65,6.9,7.0],frontPanel:'side-intake',sidePanel:'tempered-glass',panelRemovable:true,panelHinged:true,chambers:1,airflowBias:8,driveBays:{ssd25:2,hdd35:2},mounts:{front:[120,140,240,280,360],top:[120,240],rear:[120]},notes:'Frente sólida com entradas laterais e iluminação integrada.'},
    silent_atx:{caseClass:'Mid Tower silencioso ATX',dimensionsMm:[440,470,230],scene:[7.05,7.35,7.45],frontPanel:'solid',sidePanel:'steel',panelRemovable:true,panelHinged:false,chambers:1,airflowBias:2,driveBays:{ssd25:3,hdd35:3},mounts:{front:[120,140,240,280,360],top:[120,140,240,280],rear:[120]},notes:'Painéis fechados com manta acústica e entradas restritas.'},
    compact_matx:{caseClass:'Mini Tower mATX',dimensionsMm:[360,390,210],scene:[5.75,6.15,6.2],frontPanel:'side-intake',sidePanel:'tempered-glass',panelRemovable:true,panelHinged:false,chambers:1,airflowBias:5,driveBays:{ssd25:2,hdd35:1},mounts:{front:[120,140,240,280],top:[120,240],rear:[120]},notes:'Gabinete compacto com espaço reduzido e acesso lateral.'},
    mini_itx:{caseClass:'Small Form Factor ITX',dimensionsMm:[285,330,185],scene:[4.75,5.35,5.15],frontPanel:'perforated',sidePanel:'vented-steel',panelRemovable:true,panelHinged:false,chambers:1,airflowBias:4,driveBays:{ssd25:2,hdd35:0},mounts:{side:[120,240],top:[120],rear:[92]},notes:'Volume reduzido, painéis perfurados e tolerâncias pequenas.'},
    workstation:{caseClass:'Full Tower workstation',dimensionsMm:[470,500,230],scene:[7.35,7.85,7.8],frontPanel:'workstation',sidePanel:'steel',panelRemovable:true,panelHinged:false,chambers:1,airflowBias:3,driveBays:{ssd25:4,hdd35:4},mounts:{front:[120,140,240],rear:[120],top:[120,240]},notes:'Estrutura reforçada, baias frontais e painel lateral metálico.'},
    openbench:{caseClass:'Open Bench ATX',dimensionsMm:[500,390,380],scene:[8.55,5.65,7.4],frontPanel:'open',sidePanel:'open',panelRemovable:false,panelHinged:false,chambers:0,airflowBias:18,driveBays:{ssd25:4,hdd35:2},mounts:{side:[120,140,240,280,360,420]},notes:'Bancada aberta para testes, acesso total e ausência de painéis.'}
  };

  const FRONT_LABELS={mesh:'Malha frontal',glass:'Vidro panorâmico','side-intake':'Frente sólida com entrada lateral',solid:'Painel sólido acústico',perforated:'Painel perfurado',workstation:'Grade profissional',open:'Estrutura aberta'};
  const SIDE_LABELS={'tempered-glass':'Vidro temperado',steel:'Aço fechado','vented-steel':'Aço ventilado',open:'Sem painel lateral'};
  const PANEL_LABELS={closed:'Fechado',open:'Aberto',removed:'Removido'};

  function clone(value){return JSON.parse(JSON.stringify(value));}
  function profile(id){return clone(PROFILES[id]||PROFILES.airflow_atx);}
  function enrichCatalog(catalog){
    if(!catalog||typeof catalog!=='object')return catalog;
    for(const [id,item] of Object.entries(catalog)){
      const p=PROFILES[id]||PROFILES.airflow_atx;
      Object.assign(item,clone(p),{
        dimensionsMm:clone(p.dimensionsMm),
        size:clone(p.dimensionsMm),
        glass:p.sidePanel==='tempered-glass',
        frontPanelLabel:FRONT_LABELS[p.frontPanel]||p.frontPanel,
        sidePanelLabel:SIDE_LABELS[p.sidePanel]||p.sidePanel
      });
    }
    return catalog;
  }
  function normalizePanel(item,value){
    if(!item||item.sidePanel==='open'||!item.panelRemovable)return 'removed';
    return ['closed','open','removed'].includes(value)?value:'closed';
  }
  function nextPanel(item,current){
    if(!item||item.sidePanel==='open'||!item.panelRemovable)return 'removed';
    const modes=item.panelHinged?['closed','open','removed']:['closed','removed'];
    const index=modes.indexOf(normalizePanel(item,current));
    return modes[(index+1)%modes.length];
  }
  function panelLabel(item,state){
    if(!item||item.sidePanel==='open')return 'Sem painel lateral';
    return `${SIDE_LABELS[item.sidePanel]||item.sidePanel}: ${PANEL_LABELS[normalizePanel(item,state)]}`;
  }
  function dimensionsText(item){
    const d=item?.dimensionsMm||item?.size||[0,0,0];
    return `${d[0]} × ${d[1]} × ${d[2]} mm (P × A × L)`;
  }
  function mountLocations(item,size){
    const result=[];
    for(const [location,sizes] of Object.entries(item?.mounts||{}))if((sizes||[]).includes(Number(size)))result.push(location);
    return result;
  }
  function canMountRadiator(item,size){return !size||mountLocations(item,size).length>0;}
  function mountSummary(item){
    const labels={front:'frente',top:'topo',rear:'traseira',side:'lateral',bottom:'base'};
    return Object.entries(item?.mounts||{}).map(([location,sizes])=>`${labels[location]||location}: ${(sizes||[]).join('/')||'—'} mm`).join(' • ');
  }
  function sceneGeometry(item){
    const scene=item?.scene||[6.9,7.25,7.35];
    const [width,height,depth]=scene;
    return{
      width,height,depth,
      half:{x:width/2,y:height/2,z:depth/2},
      inner:{x:Math.max(2.1,width-.54),y:Math.max(3.8,height-.52),z:Math.max(4.2,depth-.55)},
      boardScale:Math.min(1,Math.max(.72,(height-1.2)/6.1)),
      componentScale:Math.min(1.08,Math.max(.76,(width+height+depth)/21.1))
    };
  }
  function structureSummary(item){
    return{
      classLabel:item?.caseClass||'Gabinete',
      dimensions:dimensionsText(item),
      front:FRONT_LABELS[item?.frontPanel]||item?.frontPanel||'—',
      side:SIDE_LABELS[item?.sidePanel]||item?.sidePanel||'—',
      chambers:Number(item?.chambers)||0,
      drives:`${item?.driveBays?.ssd25||0}× 2,5” • ${item?.driveBays?.hdd35||0}× 3,5”`,
      mounts:mountSummary(item),
      notes:item?.notes||''
    };
  }

  window.LABDS_HARDWARE_CASES={PROFILES,FRONT_LABELS,SIDE_LABELS,PANEL_LABELS,profile,enrichCatalog,normalizePanel,nextPanel,panelLabel,dimensionsText,mountLocations,canMountRadiator,mountSummary,sceneGeometry,structureSummary};
})();
