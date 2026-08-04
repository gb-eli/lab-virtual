'use strict';
(function(){
  window.LABDS_LABS=window.LABDS_LABS||{};

  const KEY='lab.hardware.v16';
  const LEGACY_KEY='lab.hardware.v15';
  const MODULE_VERSION='4.28.0';
  const MODULE_UPDATED_AT='2026-08-04T04:44:00-03:00';
  const THREE_URL='../../vendor/three/three.module.min.js';
  const GRAPHICS_LEVELS=['low','medium','high','ultra'];
  const COLORS={black:'#111827',white:'#e8eef5',graphite:'#334155',blue:'#175cd3',red:'#a61b2b',purple:'#6d28d9',green:'#08775d',orange:'#b45309'};
  const COLOR_LABELS={black:'Preto',white:'Branco',graphite:'Grafite',blue:'Azul',red:'Vermelho',purple:'Roxo',green:'Verde',orange:'Laranja'};
  const STUDIO_BACKDROPS={bench:'Bancada técnica',studio:'Studio RGB',classroom:'Sala maker',showcase:'Showroom premium'};
  const DESK_FINISHES={metal:'Metal industrial',wood:'Madeira clara',carbon:'Fibra de carbono',white:'Desk branco'};
  const AMBIENT_PRESETS={neutral:'Neutro',warm:'Quente',neon:'Neon',daylight:'Luz do dia'};
  const TOOL_LEVELS={compact:'Kit compacto',pro:'Kit profissional',lab:'Laboratório completo'};
  const ACCENT_COLORS={cyan:'Ciano',purple:'Roxo',amber:'Âmbar',green:'Verde',white:'Branco'};
  const ASSEMBLY_API=window.LABDS_HARDWARE_ASSEMBLY;
  const CASE_API=window.LABDS_HARDWARE_CASES;
  const THERMAL_API=window.LABDS_HARDWARE_THERMAL;
  const LAYOUT_API=window.LABDS_HARDWARE_LAYOUT;
  const MATERIAL_API=window.LABDS_HARDWARE_MATERIALS;
  const PERIPHERAL_API=window.LABDS_HARDWARE_PERIPHERALS;
  const FAMILY_API=window.LABDS_HARDWARE_FAMILIES;
  const INSPECTION_API=window.LABDS_HARDWARE_INSPECTION;
  const CINEMATIC_API=window.LABDS_HARDWARE_CINEMATIC;
  const SYSTEM_API=window.LABDS_HARDWARE_SYSTEM;
  const INCIDENT_API=window.LABDS_HARDWARE_BENCHMARK_INCIDENT;
  const CASE_FINISHES={matte:'Pintura fosca',glossy:'Pintura brilhante',brushed:'Metal escovado',carbon:'Fibra de carbono'};
  const GLASS_STYLES={clear:'Vidro claro',smoked:'Vidro fumê',frosted:'Vidro fosco',opaque:'Painel opaco'};
  const RGB_INTENSITIES={subtle:'Discreto',balanced:'Equilibrado',showcase:'Showroom'};
  const PRESET_FAMILIES={school:'school',office:'office',study:'developer',gamerBudget:'gamer_entry',gamerUltra:'gamer_ultra',creator:'creator',workstation:'workstation',compact:'mini_pc'};
  const ASSEMBLY_PARTS=ASSEMBLY_API?.PARTS||['board','cpu','ram','gpu','storage','storage2','psu','cooler'];
  const ASSEMBLY_LABELS=ASSEMBLY_API?.LABELS||{board:'Placa-mãe',cpu:'Processador',ram:'Memória RAM',gpu:'Placa de vídeo',storage:'Armazenamento principal',storage2:'Armazenamento secundário',psu:'Fonte de alimentação',cooler:'Sistema de refrigeração'};

  const parts={
    cases:{
      airflow_atx:{label:'Corsair Airflow ATX',brand:'Corsair',generation:'Airflow moderno',formats:['ATX','mATX','ITX'],gpuMax:400,radiator:360,fans:8,size:[430,465,220],style:'airflow',glass:true,price:3},
      panorama_atx:{label:'Lian Li Panorama ATX',brand:'Lian Li',generation:'Dual chamber',formats:['ATX','mATX','ITX'],gpuMax:420,radiator:360,fans:10,size:[460,460,285],style:'panorama',glass:true,price:5},
      gamer_mid:{label:'Cooler Master Gamer Mid Tower',brand:'Cooler Master',generation:'Mid tower RGB',formats:['ATX','mATX','ITX'],gpuMax:370,radiator:360,fans:7,size:[410,440,215],style:'gamer',glass:true,price:3},
      silent_atx:{label:'Fractal Silent ATX',brand:'Fractal Design',generation:'Acústica e silêncio',formats:['ATX','mATX','ITX'],gpuMax:360,radiator:360,fans:7,size:[440,470,230],style:'silent',glass:false,price:4},
      compact_matx:{label:'NZXT Compact mATX',brand:'NZXT',generation:'Compacto moderno',formats:['mATX','ITX'],gpuMax:330,radiator:280,fans:5,size:[360,390,210],style:'compact',glass:true,price:3},
      mini_itx:{label:'Thermaltake Mini ITX',brand:'Thermaltake',generation:'Small form factor',formats:['ITX'],gpuMax:280,radiator:240,fans:4,size:[285,330,185],style:'mini',glass:true,price:4},
      workstation:{label:'Dell Precision Tower',brand:'Dell',generation:'Workstation profissional',formats:['ATX','mATX'],gpuMax:380,radiator:240,fans:6,size:[470,500,230],style:'workstation',glass:false,price:5},
      openbench:{label:'Bancada aberta de testes',brand:'DS Lab',generation:'Open bench educacional',formats:['ATX','mATX','ITX'],gpuMax:500,radiator:420,fans:10,size:[500,390,380],style:'open',glass:false,price:2}
    },
    boards:{
      asus_b550:{label:'ASUS Prime B550-PLUS',brand:'ASUS',format:'ATX',socket:'AM4',ram:'DDR4',tdp:28,slots:4,m2:2,pcie:4,generation:'AM4 / PCIe 4.0',price:2},
      gigabyte_b550i:{label:'Gigabyte B550I AORUS',brand:'Gigabyte',format:'ITX',socket:'AM4',ram:'DDR4',tdp:26,slots:2,m2:2,pcie:4,generation:'AM4 ITX',price:3},
      asrock_b650m:{label:'ASRock B650M Pro RS',brand:'ASRock',format:'mATX',socket:'AM5',ram:'DDR5',tdp:32,slots:4,m2:2,pcie:4,generation:'AM5 / DDR5',price:3},
      asus_b650:{label:'ASUS TUF B650-PLUS',brand:'ASUS',format:'ATX',socket:'AM5',ram:'DDR5',tdp:38,slots:4,m2:3,pcie:5,generation:'AM5 / PCIe 5.0',price:4},
      msi_x870:{label:'MSI MAG X870 Tomahawk',brand:'MSI',format:'ATX',socket:'AM5',ram:'DDR5',tdp:46,slots:4,m2:4,pcie:5,generation:'AM5 avançada',price:5},
      msi_b760:{label:'MSI PRO B760-P',brand:'MSI',format:'ATX',socket:'LGA1700',ram:'DDR5',tdp:40,slots:4,m2:3,pcie:4,generation:'LGA1700 / DDR5',price:3},
      asus_z790:{label:'ASUS ROG Z790 Hero',brand:'ASUS',format:'ATX',socket:'LGA1700',ram:'DDR5',tdp:55,slots:4,m2:5,pcie:5,generation:'LGA1700 premium',price:5},
      gigabyte_z890:{label:'Gigabyte Z890 AORUS',brand:'Gigabyte',format:'ATX',socket:'LGA1851',ram:'DDR5',tdp:58,slots:4,m2:5,pcie:5,generation:'LGA1851 / Core Ultra',price:5}
    },
    cpus:{
      r5_5600:{label:'AMD Ryzen 5 5600',brand:'AMD',socket:'AM4',tdp:65,igpu:false,cores:6,threads:12,single:54,multi:48,media:42,generation:'Zen 3',year:'2020–2022',price:2},
      r7_5700g:{label:'AMD Ryzen 7 5700G',brand:'AMD',socket:'AM4',tdp:65,igpu:true,cores:8,threads:16,single:58,multi:60,media:52,generation:'Zen 3 com vídeo',year:'2021',price:3},
      r5_7600:{label:'AMD Ryzen 5 7600',brand:'AMD',socket:'AM5',tdp:65,igpu:true,cores:6,threads:12,single:73,multi:62,media:60,generation:'Zen 4',year:'2022–2024',price:3},
      r7_7800x3d:{label:'AMD Ryzen 7 7800X3D',brand:'AMD',socket:'AM5',tdp:120,igpu:true,cores:8,threads:16,single:80,multi:76,media:70,generation:'Zen 4 3D V-Cache',year:'2023',price:4},
      r7_9700x:{label:'AMD Ryzen 7 9700X',brand:'AMD',socket:'AM5',tdp:65,igpu:true,cores:8,threads:16,single:91,multi:84,media:82,generation:'Zen 5',year:'2024–2026',price:4},
      r9_9950x:{label:'AMD Ryzen 9 9950X',brand:'AMD',socket:'AM5',tdp:170,igpu:true,cores:16,threads:32,single:96,multi:100,media:100,generation:'Zen 5',year:'2024–2026',price:5},
      i5_12400:{label:'Intel Core i5-12400',brand:'Intel',socket:'LGA1700',tdp:65,igpu:true,cores:6,threads:12,single:62,multi:54,media:58,generation:'12ª geração',year:'2022',price:2},
      i5_14600k:{label:'Intel Core i5-14600K',brand:'Intel',socket:'LGA1700',tdp:181,igpu:true,cores:14,threads:20,single:84,multi:82,media:84,generation:'14ª geração',year:'2023–2025',price:4},
      i9_14900k:{label:'Intel Core i9-14900K',brand:'Intel',socket:'LGA1700',tdp:253,igpu:true,cores:24,threads:32,single:94,multi:98,media:98,generation:'14ª geração',year:'2023–2025',price:5},
      ultra7_265k:{label:'Intel Core Ultra 7 265K',brand:'Intel',socket:'LGA1851',tdp:250,igpu:true,cores:20,threads:20,single:92,multi:91,media:94,generation:'Core Ultra desktop',year:'2024–2026',price:5}
    },
    ram:{
      d4_8_2666:{label:'8 GB DDR4 2666 (1×8)',brand:'Kingston',type:'DDR4',sticks:1,capacity:8,speed:2666,score:30,generation:'DDR4 básica',price:1},
      d4_16_3200:{label:'16 GB DDR4 3200 (2×8)',brand:'Kingston',type:'DDR4',sticks:2,capacity:16,speed:3200,score:47,generation:'DDR4 dual-channel',price:2},
      d4_32_3600:{label:'32 GB DDR4 3600 (2×16)',brand:'Corsair',type:'DDR4',sticks:2,capacity:32,speed:3600,score:60,generation:'DDR4 performance',price:3},
      d4_64_3600:{label:'64 GB DDR4 3600 (4×16)',brand:'G.Skill',type:'DDR4',sticks:4,capacity:64,speed:3600,score:68,generation:'DDR4 workstation',price:4},
      d5_16_5600:{label:'16 GB DDR5 5600 (2×8)',brand:'Crucial',type:'DDR5',sticks:2,capacity:16,speed:5600,score:65,generation:'DDR5 inicial',price:2},
      d5_32_6000:{label:'32 GB DDR5 6000 (2×16)',brand:'Kingston Fury',type:'DDR5',sticks:2,capacity:32,speed:6000,score:82,generation:'DDR5 equilibrada',price:3},
      d5_64_6400:{label:'64 GB DDR5 6400 (2×32)',brand:'Corsair',type:'DDR5',sticks:2,capacity:64,speed:6400,score:91,generation:'DDR5 criação',price:4},
      d5_128_6000:{label:'128 GB DDR5 6000 (4×32)',brand:'G.Skill',type:'DDR5',sticks:4,capacity:128,speed:6000,score:96,generation:'DDR5 workstation',price:5}
    },
    gpus:{
      integrated:{label:'Vídeo integrado do processador',brand:'Integrado',tdp:0,requiresCable:false,vram:1,length:0,connectors:0,raster:18,compute:15,encoder:30,rt:0,pcie:0,outputs:['hdmi','dp'],generation:'Integrado',price:0},
      gtx1650:{label:'NVIDIA GeForce GTX 1650 4 GB',brand:'NVIDIA',tdp:75,requiresCable:false,vram:4,length:230,connectors:0,raster:34,compute:29,encoder:40,rt:0,pcie:3,outputs:['hdmi','dp'],generation:'GTX 16',price:1},
      rtx3060:{label:'NVIDIA GeForce RTX 3060 12 GB',brand:'NVIDIA',tdp:170,requiresCable:true,vram:12,length:285,connectors:1,raster:57,compute:58,encoder:67,rt:44,pcie:4,outputs:['hdmi','dp'],generation:'RTX 30',price:2},
      rtx4060:{label:'NVIDIA GeForce RTX 4060 8 GB',brand:'NVIDIA',tdp:115,requiresCable:true,vram:8,length:250,connectors:1,raster:64,compute:65,encoder:78,rt:58,pcie:4,outputs:['hdmi','dp'],generation:'RTX 40',price:3},
      rtx4070s:{label:'NVIDIA GeForce RTX 4070 SUPER 12 GB',brand:'NVIDIA',tdp:220,requiresCable:true,vram:12,length:310,connectors:2,raster:82,compute:83,encoder:88,rt:78,pcie:4,outputs:['hdmi','dp'],generation:'RTX 40 SUPER',price:4},
      rtx5070:{label:'NVIDIA GeForce RTX 5070 12 GB',brand:'NVIDIA',tdp:250,requiresCable:true,vram:12,length:315,connectors:2,raster:91,compute:92,encoder:96,rt:91,pcie:5,outputs:['hdmi','dp'],generation:'RTX 50',price:5},
      rtx5090:{label:'NVIDIA GeForce RTX 5090 32 GB',brand:'NVIDIA',tdp:575,requiresCable:true,vram:32,length:360,connectors:4,raster:100,compute:100,encoder:100,rt:100,pcie:5,outputs:['hdmi','dp'],generation:'RTX 50 topo',price:5},
      rx6600:{label:'AMD Radeon RX 6600 8 GB',brand:'AMD',tdp:132,requiresCable:true,vram:8,length:270,connectors:1,raster:50,compute:45,encoder:48,rt:25,pcie:4,outputs:['hdmi','dp'],generation:'RDNA 2',price:2},
      rx7600:{label:'AMD Radeon RX 7600 8 GB',brand:'AMD',tdp:165,requiresCable:true,vram:8,length:275,connectors:1,raster:63,compute:57,encoder:65,rt:39,pcie:4,outputs:['hdmi','dp'],generation:'RDNA 3',price:3},
      rx7800xt:{label:'AMD Radeon RX 7800 XT 16 GB',brand:'AMD',tdp:263,requiresCable:true,vram:16,length:320,connectors:2,raster:84,compute:78,encoder:77,rt:58,pcie:4,outputs:['hdmi','dp'],generation:'RDNA 3',price:4},
      arcb580:{label:'Intel Arc B580 12 GB',brand:'Intel',tdp:190,requiresCable:true,vram:12,length:285,connectors:1,raster:70,compute:72,encoder:85,rt:62,pcie:4,outputs:['hdmi','dp'],generation:'Arc Battlemage',price:3}
    },
    storages:{
      none:{label:'Sem armazenamento',brand:'—',type:'none',interface:'—',capacity:0,power:0,boot:false,needsData:false,needsPower:false,io:0,generation:'—',price:0},
      hdd_1tb:{label:'HDD Seagate 1 TB 7200 RPM',brand:'Seagate',type:'hdd',interface:'SATA',capacity:1000,power:10,boot:true,needsData:true,needsPower:true,io:18,generation:'Disco mecânico',price:1},
      hdd_4tb:{label:'HDD WD 4 TB',brand:'Western Digital',type:'hdd',interface:'SATA',capacity:4000,power:12,boot:true,needsData:true,needsPower:true,io:21,generation:'Armazenamento em massa',price:2},
      sata_480:{label:'SSD Kingston SATA 480 GB',brand:'Kingston',type:'ssd',interface:'SATA',capacity:480,power:5,boot:true,needsData:true,needsPower:true,io:40,generation:'SSD SATA',price:1},
      sata_1tb:{label:'SSD Samsung SATA 1 TB',brand:'Samsung',type:'ssd',interface:'SATA',capacity:1000,power:6,boot:true,needsData:true,needsPower:true,io:45,generation:'SSD SATA',price:2},
      nvme3_500:{label:'NVMe PCIe 3.0 500 GB',brand:'Crucial',type:'nvme',interface:'M.2 PCIe 3.0',capacity:500,power:6,boot:true,needsData:false,needsPower:false,io:60,generation:'NVMe Gen3',price:2},
      nvme4_1tb:{label:'NVMe PCIe 4.0 1 TB',brand:'Samsung',type:'nvme',interface:'M.2 PCIe 4.0',capacity:1000,power:8,boot:true,needsData:false,needsPower:false,io:82,generation:'NVMe Gen4',price:3},
      nvme4_2tb:{label:'NVMe PCIe 4.0 2 TB',brand:'WD Black',type:'nvme',interface:'M.2 PCIe 4.0',capacity:2000,power:9,boot:true,needsData:false,needsPower:false,io:88,generation:'NVMe Gen4',price:4},
      nvme5_2tb:{label:'NVMe PCIe 5.0 2 TB',brand:'Corsair',type:'nvme',interface:'M.2 PCIe 5.0',capacity:2000,power:12,boot:true,needsData:false,needsPower:false,io:100,generation:'NVMe Gen5',price:5}
    },
    psus:{
      p450:{label:'Cooler Master 450 W Bronze',brand:'Cooler Master',watts:450,pcie:1,efficiency:82,modular:false,price:1},
      p550:{label:'Corsair 550 W Bronze',brand:'Corsair',watts:550,pcie:1,efficiency:85,modular:false,price:2},
      p650:{label:'XPG 650 W Gold',brand:'XPG',watts:650,pcie:2,efficiency:89,modular:true,price:3},
      p750:{label:'Seasonic 750 W Gold',brand:'Seasonic',watts:750,pcie:3,efficiency:90,modular:true,price:3},
      p850:{label:'Corsair 850 W Gold',brand:'Corsair',watts:850,pcie:3,efficiency:90,modular:true,price:4},
      p1000:{label:'ASUS 1000 W Platinum',brand:'ASUS',watts:1000,pcie:4,efficiency:93,modular:true,price:5},
      p1200:{label:'Thermaltake 1200 W Platinum',brand:'Thermaltake',watts:1200,pcie:5,efficiency:94,modular:true,price:5}
    },
    coolers:{
      none:{label:'Sem refrigeração',brand:'—',capacity:0,type:'none',radiator:0,noise:0,price:0},
      stock:{label:'Cooler padrão do processador',brand:'Original',capacity:95,type:'air',radiator:0,noise:34,price:1},
      lowprofile:{label:'Noctua Low Profile',brand:'Noctua',capacity:125,type:'air',radiator:0,noise:26,price:2},
      tower:{label:'Cooler Master Torre 120 mm',brand:'Cooler Master',capacity:190,type:'air',radiator:0,noise:28,price:2},
      dualtower:{label:'DeepCool Dual Tower',brand:'DeepCool',capacity:260,type:'air',radiator:0,noise:30,price:3},
      aio240:{label:'Corsair AIO 240 mm',brand:'Corsair',capacity:285,type:'aio',radiator:240,noise:32,price:3},
      aio360:{label:'NZXT AIO 360 mm',brand:'NZXT',capacity:380,type:'aio',radiator:360,noise:35,price:4},
      custom:{label:'Loop customizado 420 mm',brand:'EKWB',capacity:500,type:'custom',radiator:420,noise:29,price:5}
    },
    nics:{
      onboard:{label:'Ethernet integrado 1 GbE',brand:'Integrado',power:2,speed:1,wifi:'Não',generation:'Gigabit Ethernet',price:0},
      gbe25:{label:'Intel Ethernet 2,5 GbE',brand:'Intel',power:4,speed:2.5,wifi:'Não',generation:'2.5 Gigabit',price:2},
      wifi5:{label:'TP-Link Wi-Fi 5',brand:'TP-Link',power:6,speed:.9,wifi:'Wi-Fi 5',generation:'802.11ac',price:1},
      wifi6:{label:'Intel Wi-Fi 6 + Bluetooth',brand:'Intel',power:7,speed:2.4,wifi:'Wi-Fi 6',generation:'802.11ax',price:2},
      wifi6e:{label:'ASUS Wi-Fi 6E',brand:'ASUS',power:8,speed:3.0,wifi:'Wi-Fi 6E',generation:'6 GHz',price:3},
      wifi7:{label:'Qualcomm Wi-Fi 7',brand:'Qualcomm',power:10,speed:5.8,wifi:'Wi-Fi 7',generation:'802.11be',price:4},
      ten:{label:'Intel Ethernet 10 GbE',brand:'Intel',power:18,speed:10,wifi:'Não',generation:'10 Gigabit',price:5}
    },
    monitors:{
      none:{label:'Sem monitor',brand:'—',connector:null,res:[0,0],refresh:0,panel:'—',hdr:false,score:0,price:0},
      fhd75:{label:'LG 24″ Full HD 75 Hz IPS',brand:'LG',connector:'hdmi',res:[1920,1080],refresh:75,panel:'IPS',hdr:false,score:35,price:1},
      fhd144:{label:'AOC 24″ Full HD 144 Hz',brand:'AOC',connector:'dp',res:[1920,1080],refresh:144,panel:'VA',hdr:false,score:52,price:2},
      fhd240:{label:'BenQ 25″ Full HD 240 Hz',brand:'BenQ',connector:'dp',res:[1920,1080],refresh:240,panel:'TN',hdr:false,score:68,price:3},
      qhd165:{label:'Samsung 27″ QHD 165 Hz',brand:'Samsung',connector:'dp',res:[2560,1440],refresh:165,panel:'IPS',hdr:true,score:78,price:4},
      uwqhd144:{label:'Dell 34″ Ultrawide 144 Hz',brand:'Dell',connector:'dp',res:[3440,1440],refresh:144,panel:'IPS',hdr:true,score:82,price:4},
      uhd60:{label:'Dell 32″ 4K 60 Hz',brand:'Dell',connector:'dp',res:[3840,2160],refresh:60,panel:'IPS',hdr:true,score:80,price:4},
      oled240:{label:'ASUS 32″ 4K OLED 240 Hz',brand:'ASUS',connector:'dp',res:[3840,2160],refresh:240,panel:'OLED',hdr:true,score:100,price:5},
      portrait27:{label:'Dell 27″ QHD profissional',brand:'Dell',connector:'dp',res:[2560,1440],refresh:75,panel:'IPS',hdr:true,score:76,price:4},
      superuw49:{label:'Samsung 49″ Super Ultrawide 240 Hz',brand:'Samsung',connector:'dp',res:[5120,1440],refresh:240,panel:'OLED',hdr:true,score:100,price:5},
      pro6k32:{label:'Apple Studio 32″ 6K referência',brand:'Apple',connector:'dp',res:[6016,3384],refresh:60,panel:'Mini LED',hdr:true,score:98,price:5},
      crt17:{label:'Monitor CRT 17″ clássico',brand:'Genérico histórico',connector:'vga',res:[1280,1024],refresh:75,panel:'CRT',hdr:false,score:24,price:1}
    },
    keyboards:{none:{label:'Sem teclado',brand:'—',type:'—',score:0,price:0},membrane:{label:'Logitech teclado de membrana',brand:'Logitech',type:'Membrana ABNT2',score:40,price:1},mechanical:{label:'Redragon mecânico TKL',brand:'Redragon',type:'Mecânico TKL',score:70,price:2},wireless:{label:'Logitech sem fio compacto',brand:'Logitech',type:'Sem fio compacto',score:62,price:2},ergonomic:{label:'Microsoft ergonômico',brand:'Microsoft',type:'Ergonômico',score:72,price:3},creator:{label:'Keychron mecânico para criação',brand:'Keychron',type:'Mecânico sem fio',score:88,price:4},fullrgb:{label:'Corsair mecânico full size RGB',brand:'Corsair',type:'Mecânico full size',score:92,price:4},compact60:{label:'Teclado gamer 60% compacto',brand:'HyperX',type:'Mecânico 60% compacto',score:78,price:3},split:{label:'Teclado dividido ergonômico',brand:'Kinesis',type:'Ergonômico dividido',score:94,price:5}},
    mice:{none:{label:'Sem mouse',brand:'—',dpi:0,score:0,price:0},office:{label:'Logitech mouse de escritório',brand:'Logitech',dpi:1600,score:42,price:1},gaming:{label:'Razer mouse gamer 20K DPI',brand:'Razer',dpi:20000,score:88,price:4},wireless:{label:'Logitech sem fio',brand:'Logitech',dpi:4000,score:66,price:2},ergonomic:{label:'Microsoft mouse ergonômico',brand:'Microsoft',dpi:2400,score:70,price:3},precision:{label:'3Dconnexion precisão/CAD',brand:'3Dconnexion',dpi:12000,score:92,price:5},lightweight:{label:'Mouse gamer ultraleve 26K DPI',brand:'Logitech',dpi:26000,score:94,price:5},trackball:{label:'Mouse trackball ergonômico',brand:'Logitech',dpi:2000,score:76,price:3}},
    audio:{none:{label:'Sem áudio',brand:'—',type:'—',score:0,price:0},speakers:{label:'Caixas de som estéreo',brand:'Edifier',type:'2.0',score:55,price:2},headset:{label:'Headset com microfone',brand:'HyperX',type:'Headset USB',score:72,price:3},studio:{label:'Monitores de áudio',brand:'JBL',type:'Studio',score:90,price:5},usbmic:{label:'Microfone USB + fones',brand:'Fifine',type:'Criação de conteúdo',score:82,price:4},wirelessHeadset:{label:'Headset gamer sem fio',brand:'SteelSeries',type:'Headset wireless',score:90,price:5},soundbar:{label:'Soundbar compacta para monitor',brand:'Creative',type:'Soundbar',score:68,price:3}},
    webcams:{none:{label:'Sem webcam',brand:'—',resolution:'—',score:0,price:0},hd:{label:'Webcam Logitech HD 720p',brand:'Logitech',resolution:'720p',score:45,price:1},fhd:{label:'Webcam Full HD 1080p',brand:'Logitech',resolution:'1080p',score:70,price:2},uhd:{label:'Webcam 4K com HDR',brand:'Dell',resolution:'4K',score:90,price:4},conference:{label:'Câmera de conferência PTZ',brand:'Aver',resolution:'4K PTZ',score:100,price:5}},
    printers:{none:{label:'Sem impressora',brand:'—',type:'—',score:0,price:0},ink:{label:'Epson tanque de tinta',brand:'Epson',type:'Jato de tinta',score:62,price:2},laser:{label:'Brother laser monocromática',brand:'Brother',type:'Laser',score:75,price:3},multifunction:{label:'HP multifuncional colorida',brand:'HP',type:'Multifuncional',score:82,price:4},photo:{label:'Canon fotográfica',brand:'Canon',type:'Fotográfica',score:88,price:4}},
    controllers:{none:{label:'Sem controle',brand:'—',type:'—',score:0,price:0},xbox:{label:'Controle Xbox sem fio',brand:'Microsoft',type:'Gamepad Xbox',score:88,price:3},playstation:{label:'Controle PlayStation',brand:'Sony',type:'Gamepad PlayStation',score:90,price:3},wheel:{label:'Volante com pedais',brand:'Logitech',type:'Simulação automobilística',score:95,price:5},vr:{label:'Óculos VR + controles',brand:'Meta',type:'Realidade virtual',score:100,price:5},flight:{label:'Joystick HOTAS de voo',brand:'Thrustmaster',type:'Simulação de voo',score:96,price:5},arcade:{label:'Controle arcade com alavanca',brand:'8BitDo',type:'Arcade',score:82,price:4}},
    ups:{none:{label:'Sem nobreak',brand:'—',watts:0,minutes:0,price:0},ups600:{label:'Nobreak 600 VA',brand:'SMS',watts:360,minutes:8,price:2},ups1200:{label:'Nobreak 1200 VA',brand:'APC',watts:720,minutes:15,price:3},ups2200:{label:'Nobreak 2200 VA senoidal',brand:'APC',watts:1320,minutes:25,price:5}}
  };

  CASE_API?.enrichCatalog?.(parts.cases);

  const presets={
    school:{label:'Laboratório escolar',case:'airflow_atx',caseColor:'blue',board:'asrock_b650m',cpu:'r5_7600',ram:'d5_16_5600',gpu:'integrated',storage:'nvme4_1tb',storage2:'none',psu:'p550',cooler:'stock',nic:'onboard',monitor:'fhd75',monitor2:'none',monitor3:'none',monitorCount:1,monitorLayout:'single',monitorMount:'stock',keyboard:'membrane',mouse:'office',audio:'speakers',webcam:'hd',printer:'ink',controller:'none',ups:'ups600',fans:2,lighting:'off'},
    office:{label:'Escritório completo',case:'compact_matx',caseColor:'white',board:'msi_b760',cpu:'i5_12400',ram:'d5_16_5600',gpu:'integrated',storage:'nvme3_500',storage2:'hdd_1tb',psu:'p450',cooler:'stock',nic:'wifi6',monitor:'fhd75',monitor2:'none',monitor3:'none',monitorCount:1,monitorLayout:'single',monitorMount:'singleArm',keyboard:'wireless',mouse:'wireless',audio:'speakers',webcam:'fhd',printer:'multifunction',controller:'none',ups:'ups600',fans:2,lighting:'off'},
    study:{label:'Estudos e programação',case:'compact_matx',caseColor:'graphite',board:'asrock_b650m',cpu:'r5_7600',ram:'d5_32_6000',gpu:'integrated',storage:'nvme4_1tb',storage2:'none',psu:'p550',cooler:'tower',nic:'wifi6',monitor:'qhd165',monitor2:'portrait27',monitor3:'none',monitorCount:2,monitorLayout:'creator',monitorMount:'dualArm',keyboard:'creator',mouse:'ergonomic',audio:'headset',webcam:'fhd',printer:'none',controller:'none',ups:'ups600',fans:3,lighting:'cyan'},
    gamerBudget:{label:'Gamer de entrada',case:'gamer_mid',caseColor:'black',board:'asus_b550',cpu:'r5_5600',ram:'d4_16_3200',gpu:'rx6600',storage:'nvme3_500',storage2:'hdd_1tb',psu:'p550',cooler:'tower',nic:'wifi6',monitor:'fhd144',monitor2:'none',monitor3:'none',monitorCount:1,monitorLayout:'single',monitorMount:'singleArm',keyboard:'mechanical',mouse:'gaming',audio:'headset',webcam:'none',printer:'none',controller:'xbox',ups:'none',fans:4,lighting:'rainbow'},
    gamerUltra:{label:'Gamer Ultra 4K',case:'panorama_atx',caseColor:'white',board:'msi_x870',cpu:'r7_9700x',ram:'d5_64_6400',gpu:'rtx5090',storage:'nvme5_2tb',storage2:'nvme4_2tb',psu:'p1200',cooler:'aio360',nic:'wifi7',monitor:'oled240',monitor2:'qhd165',monitor3:'qhd165',monitorCount:3,monitorLayout:'cockpit',monitorMount:'tripleArm',keyboard:'fullrgb',mouse:'lightweight',audio:'wirelessHeadset',webcam:'uhd',printer:'none',controller:'playstation',ups:'ups2200',fans:8,lighting:'rainbow'},
    creator:{label:'Criação de vídeo',case:'airflow_atx',caseColor:'black',board:'asus_b650',cpu:'r9_9950x',ram:'d5_64_6400',gpu:'rtx5070',storage:'nvme5_2tb',storage2:'nvme4_2tb',psu:'p850',cooler:'aio360',nic:'gbe25',monitor:'uhd60',monitor2:'portrait27',monitor3:'none',monitorCount:2,monitorLayout:'creator',monitorMount:'dualArm',keyboard:'creator',mouse:'precision',audio:'usbmic',webcam:'uhd',printer:'photo',controller:'none',ups:'ups1200',fans:6,lighting:'cyan'},
    workstation:{label:'Workstation CAD/IA',case:'workstation',caseColor:'graphite',board:'gigabyte_z890',cpu:'ultra7_265k',ram:'d5_128_6000',gpu:'rtx5090',storage:'nvme5_2tb',storage2:'nvme4_2tb',psu:'p1200',cooler:'aio360',nic:'ten',monitor:'uwqhd144',monitor2:'portrait27',monitor3:'portrait27',monitorCount:3,monitorLayout:'creator',monitorMount:'rail',keyboard:'split',mouse:'precision',audio:'studio',webcam:'conference',printer:'laser',controller:'none',ups:'ups2200',fans:6,lighting:'off'},
    compact:{label:'Mini PC compacto',case:'mini_itx',caseColor:'purple',board:'gigabyte_b550i',cpu:'r7_5700g',ram:'d4_32_3600',gpu:'integrated',storage:'nvme4_1tb',storage2:'none',psu:'p450',cooler:'lowprofile',nic:'wifi6e',monitor:'qhd165',monitor2:'none',monitor3:'none',monitorCount:1,monitorLayout:'single',monitorMount:'singleArm',keyboard:'wireless',mouse:'wireless',audio:'soundbar',webcam:'fhd',printer:'none',controller:'xbox',ups:'none',fans:2,lighting:'purple'}
  };

  const thermalPresets={
    school:{fanProfile:'balanced',fanSpeed:'auto',filterCondition:'clean',workload:'study',ambientTemperature:23,radiatorPosition:'auto'},
    office:{fanProfile:'silent',fanSpeed:'quiet',filterCondition:'clean',workload:'study',ambientTemperature:23,radiatorPosition:'auto'},
    study:{fanProfile:'positive',fanSpeed:'auto',filterCondition:'clean',workload:'study',ambientTemperature:24,radiatorPosition:'auto'},
    gamerBudget:{fanProfile:'balanced',fanSpeed:'auto',filterCondition:'clean',workload:'gaming',ambientTemperature:25,radiatorPosition:'auto'},
    gamerUltra:{fanProfile:'performance',fanSpeed:'turbo',filterCondition:'clean',workload:'gaming',ambientTemperature:24,radiatorPosition:'top'},
    creator:{fanProfile:'positive',fanSpeed:'auto',filterCondition:'clean',workload:'render',ambientTemperature:24,radiatorPosition:'top'},
    workstation:{fanProfile:'performance',fanSpeed:'auto',filterCondition:'clean',workload:'render',ambientTemperature:22,radiatorPosition:'top'},
    compact:{fanProfile:'positive',fanSpeed:'auto',filterCondition:'clean',workload:'study',ambientTemperature:24,radiatorPosition:'auto'}
  };

  const visualPresets={
    school:{caseFinish:'matte',glassStyle:'smoked',rgbIntensity:'subtle',materialDetail:true,contactShadows:true},
    office:{caseFinish:'matte',glassStyle:'opaque',rgbIntensity:'subtle',materialDetail:true,contactShadows:true},
    study:{caseFinish:'brushed',glassStyle:'smoked',rgbIntensity:'balanced',materialDetail:true,contactShadows:true},
    gamerBudget:{caseFinish:'matte',glassStyle:'clear',rgbIntensity:'balanced',materialDetail:true,contactShadows:true},
    gamerUltra:{caseFinish:'glossy',glassStyle:'clear',rgbIntensity:'showcase',materialDetail:true,contactShadows:true},
    creator:{caseFinish:'brushed',glassStyle:'smoked',rgbIntensity:'subtle',materialDetail:true,contactShadows:true},
    workstation:{caseFinish:'matte',glassStyle:'opaque',rgbIntensity:'subtle',materialDetail:true,contactShadows:true},
    compact:{caseFinish:'carbon',glassStyle:'smoked',rgbIntensity:'balanced',materialDetail:true,contactShadows:true}
  };

  const defaultConnections={boardPower:true,cpuPower:true,gpuPower:true,ramSeated:true,storageData:true,storagePower:true,storage2Data:true,storage2Power:true,frontPanel:true,cpuPaste:true,coolerMounted:true,monitorCable:true,peripheralsPower:true};
  const defaults={
    schema:18,tab:'families',mode:'guided',preset:'school',family:'school',inspection:{active:false,target:'family',view:'iso',exploded:false,zoom:1,showInfo:true,distance:6.5},cinematic:{active:false,playing:false,shot:0,elapsed:0,speed:'normal',hideUi:false,loop:true},system:{os:'windows11',phase:'off',installed:true,progress:0,postIndex:0,installIndex:0,desktopApp:'desktop',uptime:0,lastBoot:null,lastShutdown:null,message:'',error:'',throttling:0,screenBrightness:1},benchmarkIncident:{level:'medium',environment:'normal',protection:'standard',stage:'idle',progress:0,elapsed:0,cpuTemp:0,gpuTemp:0,caseTemp:0,load:0,warningAcknowledged:false,continuedAfterWarning:false,awaitingDecision:false,smokeSeconds:0,fireSeconds:0,extinguisherUsed:false,reason:'',events:[]},benchmarkFaultInjection:false,case:'airflow_atx',caseColor:'blue',caseFinish:'matte',glassStyle:'smoked',rgbIntensity:'balanced',materialDetail:true,contactShadows:true,caseSidePanel:'closed',caseStructureVisible:true,board:'asrock_b650m',cpu:'r5_7600',ram:'d5_16_5600',gpu:'integrated',storage:'nvme4_1tb',storage2:'none',psu:'p550',cooler:'stock',nic:'onboard',monitor:'fhd75',monitor2:'none',monitor3:'none',monitorCount:1,monitorLayout:'single',monitorMount:'stock',keyboard:'membrane',mouse:'office',audio:'speakers',webcam:'hd',printer:'ink',controller:'none',ups:'ups600',fans:2,fanProfile:'balanced',fanSpeed:'auto',filterCondition:'clean',workload:'study',ambientTemperature:23,radiatorPosition:'auto',thermalOverlay:true,lighting:'off',cableManagement:'standard',backdrop:'bench',deskFinish:'metal',ambientPreset:'neutral',toolkit:'pro',accentColor:'cyan',showProps:true,assemblyGuide:true,
    ...defaultConnections,state:'off',scenario:'standard',score:0,tests:0,logs:[],selectedPart:'board',exploded:false,airflow:true,cables:true,autorotate:false,labGraphics:'high',cameraYaw:-.72,cameraPitch:.36,cameraDistance:15,
    benchmarkTarget:'games',benchmarkResolution:'1080p',benchmarkQuality:'high',rayTracing:false,upscaling:'quality',benchmarkResults:null,benchmarkHistory:[],diagnosticResults:[],benchmarkRunning:false,
    assembly:{enabled:false,prepared:false,placed:{board:true,cpu:true,ram:true,gpu:true,storage:true,storage2:true,psu:true,cooler:true},positions:{},rotations:{},attempts:0,successful:0,invalid:0,history:[],future:[],lastAction:''}
  };

  let root=null,ctx=null,state=null,timers=new Set(),busy=false,resizeObserver=null;
  let THREE=null,three=null,threeToken=0,threeRaf=0,lowRaf=0,lowDrag=null,lastTime=0,assemblyEngine=null,benchmarkDecisionResolve=null,benchmarkRunToken=0;
  const $=selector=>root?.querySelector(selector);
  const $$=selector=>[...(root?.querySelectorAll(selector)||[])];
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0));
  const clone=value=>JSON.parse(JSON.stringify(value));
  const select=(group,key)=>parts[group]?.[state[key]]||parts[group]?.[defaults[key]];
  const moduleDate=()=>new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'}).format(new Date(MODULE_UPDATED_AT));
  const accentHex=()=>({cyan:0x2de2ff,purple:0x9f63ff,amber:0xffb454,green:0x42f59b,white:0xf1f8ff}[state?.accentColor]||0x2de2ff);
  const ambientScene=()=>({
    neutral:{bg:0x050d16,fog:0x07111d,fill:0x3dc9ff,rim:0x8d5bff},
    warm:{bg:0x120d0a,fog:0x20110e,fill:0xffc68a,rim:0xff845c},
    neon:{bg:0x060814,fog:0x090d1b,fill:accentHex(),rim:0x8d5bff},
    daylight:{bg:0xcad8e5,fog:0xdbe5ef,fill:0xffffff,rim:0x7ba7d9}
  }[state?.ambientPreset]||{bg:0x050d16,fog:0x07111d,fill:0x3dc9ff,rim:0x8d5bff});
  const deskColor=()=>({metal:0x465464,wood:0x7c5b3b,carbon:0x232a33,white:0xdbe8f3}[state?.deskFinish]||0x465464);
  const screenPowered=()=>!['off','error','shutdown','smoke','fire','extinguished'].includes(state?.system?.phase||'off');
  const screenEmissive=()=>state?.system?.os==='linuxMint'?0x1f7a45:0x0b6e9e;

  function calculateSetupLayout(e=evaluate()){
    const fallback={safe:true,status:'Layout básico',desk:{size:[16,.46,8.4],position:[4.7,-3.45,.2],topY:-3.22,left:-3.3,right:12.7},floor:{size:[34,.12,24],position:[3,-6.05,0]},supports:[],objects:[],warnings:[],errors:[],summary:{objects:0,collisions:0,unsupported:0,outOfBounds:0,deskWidth:16,deskDepth:8.4},camera:{target:[2,0,0],minDistance:9,maxDistance:32,minPitch:-.08,maxPitch:1.18}};
    if(!LAYOUT_API?.calculate)return fallback;
    const caseGeometry=FAMILY_API?.sceneGeometry?.(state.family,CASE_API?.sceneGeometry?.(e.parts.cs))||CASE_API?.sceneGeometry?.(e.parts.cs);
    return LAYOUT_API.calculate({caseItem:e.parts.cs,caseGeometry,monitor:e.parts.monitor,monitor2:e.parts.monitor2,monitor3:e.parts.monitor3,keyboard:e.parts.keyboard,mouse:e.parts.mouse,audio:e.parts.audio,webcam:e.parts.webcam,printer:e.parts.printer,controller:e.parts.controller,ups:e.parts.ups,state});
  }

  function normalize(raw){
    const input=raw&&typeof raw==='object'?raw:{};
    const output={...clone(defaults),...input};
    const selectors=[['case','cases'],['board','boards'],['cpu','cpus'],['ram','ram'],['gpu','gpus'],['storage','storages'],['storage2','storages'],['psu','psus'],['cooler','coolers'],['nic','nics'],['monitor','monitors'],['monitor2','monitors'],['monitor3','monitors'],['keyboard','keyboards'],['mouse','mice'],['audio','audio'],['webcam','webcams'],['printer','printers'],['controller','controllers'],['ups','ups']];
    for(const [key,group] of selectors)if(!parts[group][output[key]])output[key]=defaults[key];
    output.tab=['families','build','peripherals','inspection','cinema','benchmark','diagnostics'].includes(output.tab)?output.tab:'families';
    output.mode=['free','guided','challenge','diagnostic','maintenance'].includes(output.mode)?output.mode:'guided';
    output.preset=presets[output.preset]?output.preset:'custom';
    output.family=FAMILY_API?.normalize?.(output.family)||'school';
    output.inspection=INSPECTION_API?.normalize?.(output.inspection)||clone(defaults.inspection);
    output.cinematic=CINEMATIC_API?.normalize?.(output.cinematic)||clone(defaults.cinematic);
    output.system=SYSTEM_API?.normalize?.(output.system)||clone(defaults.system);
    if(['benchmark','warning','throttling','smoke','fire'].includes(output.system.phase))output.system.phase=output.system.installed?'desktop':'off';
    output.benchmarkIncident=INCIDENT_API?.normalize?.(output.benchmarkIncident)||clone(defaults.benchmarkIncident);
    if(['running','hot','warning','throttling','critical'].includes(output.benchmarkIncident.stage)){output.benchmarkIncident.stage='cancelled';output.benchmarkIncident.awaitingDecision=false;output.benchmarkIncident.reason='Execução anterior interrompida ao recarregar a página.';}
    output.benchmarkFaultInjection=Boolean(output.benchmarkFaultInjection);
    output.caseColor=COLORS[output.caseColor]?output.caseColor:'black';
    output.caseFinish=CASE_FINISHES[output.caseFinish]?output.caseFinish:'matte';
    output.glassStyle=GLASS_STYLES[output.glassStyle]?output.glassStyle:'smoked';
    output.rgbIntensity=RGB_INTENSITIES[output.rgbIntensity]?output.rgbIntensity:'balanced';
    output.materialDetail=output.materialDetail!==false;
    output.contactShadows=output.contactShadows!==false;
    Object.assign(output,PERIPHERAL_API?.normalize?.(output)||{monitorCount:1,monitorLayout:'single',monitorMount:'stock'});
    output.caseSidePanel=CASE_API?.normalizePanel?.(parts.cases[output.case],output.caseSidePanel)||(['closed','open','removed'].includes(output.caseSidePanel)?output.caseSidePanel:'closed');
    output.caseStructureVisible=output.caseStructureVisible!==false;
    output.lighting=['off','cyan','purple','red','rainbow'].includes(output.lighting)?output.lighting:'off';
    output.cableManagement=['basic','standard','premium'].includes(output.cableManagement)?output.cableManagement:'standard';
    output.backdrop=STUDIO_BACKDROPS[output.backdrop]?output.backdrop:'bench';
    output.deskFinish=DESK_FINISHES[output.deskFinish]?output.deskFinish:'metal';
    output.ambientPreset=AMBIENT_PRESETS[output.ambientPreset]?output.ambientPreset:'neutral';
    output.toolkit=TOOL_LEVELS[output.toolkit]?output.toolkit:'pro';
    output.accentColor=ACCENT_COLORS[output.accentColor]?output.accentColor:'cyan';
    output.showProps=Boolean(output.showProps);
    output.assemblyGuide=Boolean(output.assemblyGuide);
    output.labGraphics=GRAPHICS_LEVELS.includes(output.labGraphics)?output.labGraphics:'high';
    output.benchmarkTarget=['games','video','work','study'].includes(output.benchmarkTarget)?output.benchmarkTarget:'games';
    output.benchmarkResolution=['1080p','1440p','2160p'].includes(output.benchmarkResolution)?output.benchmarkResolution:'1080p';
    output.benchmarkQuality=['low','medium','high','ultra'].includes(output.benchmarkQuality)?output.benchmarkQuality:'high';
    output.upscaling=['off','quality','balanced','performance'].includes(output.upscaling)?output.upscaling:'quality';
    output.fans=Math.round(clamp(output.fans,0,10));
    const thermalSettings=THERMAL_API?.normalize?.(output)||{fanProfile:'balanced',fanSpeed:'auto',filterCondition:'clean',workload:'study',ambientTemperature:23,radiatorPosition:'auto',thermalOverlay:true};
    Object.assign(output,thermalSettings);
    output.cameraYaw=Number.isFinite(Number(output.cameraYaw))?Number(output.cameraYaw):defaults.cameraYaw;
    output.cameraPitch=clamp(output.cameraPitch,-.15,1.25);
    output.cameraDistance=clamp(output.cameraDistance,7,28);
    output.score=Math.max(0,Number(output.score)||0);output.tests=Math.max(0,Number(output.tests)||0);
    output.logs=Array.isArray(output.logs)?output.logs.slice(-160).map(item=>({time:String(item?.time||new Date().toISOString()),text:String(item?.text||'').slice(0,700),tone:String(item?.tone||'')})):[];
    output.benchmarkHistory=Array.isArray(output.benchmarkHistory)?output.benchmarkHistory.slice(-12):[];
    output.diagnosticResults=Array.isArray(output.diagnosticResults)?output.diagnosticResults.slice(-12):[];
    output.benchmarkRunning=false;
    output.assembly=ASSEMBLY_API?.normalizeAssembly?ASSEMBLY_API.normalizeAssembly(input.assembly||output.assembly):{...clone(defaults.assembly),...(input.assembly||{})};
    return output;
  }

  function activeAssemblyParts(){
    if(FAMILY_API?.supportsManualAssembly&&!FAMILY_API.supportsManualAssembly(state.family))return [];
    const active=['board','psu','cpu','ram','storage'];
    if(state.storage2!=='none')active.push('storage2');
    if(select('coolers','cooler').type!=='none')active.push('cooler');
    if(state.gpu!=='integrated')active.push('gpu');
    return active;
  }

  function assemblyPlaced(key){return state?.assembly?.placed?.[key]!==false;}

  function validateAssemblyPart(key){
    if(FAMILY_API?.supportsManualAssembly&&!FAMILY_API.supportsManualAssembly(state.family))return{ok:false,message:'Esta família usa manutenção compacta guiada, não montagem livre de gabinete.'};
    const e=evaluateBase();
    const placed=state.assembly?.placed||{};
    if(e.parts.cs.sidePanel!=='open'&&state.caseSidePanel==='closed')return{ok:false,message:'Abra ou remova o painel lateral antes de instalar componentes no gabinete.'};
    if(key==='board'&&!e.parts.cs.formats.includes(e.parts.board.format))return{ok:false,message:`A placa ${e.parts.board.format} não cabe neste gabinete.`};
    if(key==='cpu'&&placed.board===false)return{ok:false,message:'Instale primeiro a placa-mãe antes de encaixar o processador.'};
    if(key==='cpu'&&e.parts.board.socket!==e.parts.cpu.socket)return{ok:false,message:`Socket incompatível: ${e.parts.board.socket} × ${e.parts.cpu.socket}.`};
    if(key==='ram'&&placed.board===false)return{ok:false,message:'Instale primeiro a placa-mãe antes da memória RAM.'};
    if(key==='ram'&&(e.parts.board.ram!==e.parts.ram.type||e.parts.ram.sticks>e.parts.board.slots))return{ok:false,message:`O kit ${e.parts.ram.type} não é compatível com esta placa-mãe.`};
    if(key==='gpu'&&placed.board===false)return{ok:false,message:'Instale primeiro a placa-mãe antes da placa de vídeo.'};
    if(key==='gpu'&&e.parts.gpu.length>e.parts.cs.gpuMax)return{ok:false,message:`A GPU possui ${e.parts.gpu.length} mm e o gabinete aceita ${e.parts.cs.gpuMax} mm.`};
    if((key==='storage'||key==='storage2')&&placed.board===false)return{ok:false,message:'Instale primeiro a placa-mãe antes do armazenamento.'};
    if(key==='cooler'&&placed.cpu===false)return{ok:false,message:'Instale e trave o processador antes do sistema de refrigeração.'};
    if(key==='cooler'&&e.parts.cooler.radiator&&!CASE_API?.canMountRadiator?.(e.parts.cs,e.parts.cooler.radiator))return{ok:false,message:`O radiador de ${e.parts.cooler.radiator} mm não possui ponto de montagem compatível neste gabinete.`};
    if(key==='cooler'&&e.parts.cooler.capacity<e.parts.cpu.tdp)return{ok:false,message:`Este cooler suporta ${e.parts.cooler.capacity} W, abaixo dos ${e.parts.cpu.tdp} W do processador.`};
    return{ok:true,message:`Ponto de encaixe liberado para ${ASSEMBLY_LABELS[key]||key}.`};
  }

  function evaluateBase(){
    const assembly=state?.assembly;
    if(!assembly?.prepared)return evaluateCore(false);
    return evaluateCore(false);
  }

  function evaluate(){return evaluateCore(true);}

  function evaluateCore(includeAssembly=true){
    const cs=select('cases','case'),board=select('boards','board'),cpu=select('cpus','cpu'),ram=select('ram','ram'),gpu=select('gpus','gpu'),storage=select('storages','storage'),storage2=select('storages','storage2'),psu=select('psus','psu'),cooler=select('coolers','cooler'),nic=select('nics','nic'),monitor=select('monitors','monitor'),monitor2=select('monitors','monitor2'),monitor3=select('monitors','monitor3'),keyboard=select('keyboards','keyboard'),mouse=select('mice','mouse'),audio=select('audio','audio'),webcam=select('webcams','webcam'),printer=select('printers','printer'),controller=select('controllers','controller'),ups=select('ups','ups');
    const errors=[],warnings=[],info=[];
    if(!cs.formats.includes(board.format))errors.push(`A placa ${board.format} não cabe no gabinete selecionado.`);
    if(board.socket!==cpu.socket)errors.push(`Socket incompatível: placa ${board.socket} × processador ${cpu.socket}.`);
    if(board.ram!==ram.type)errors.push(`A placa usa ${board.ram}, mas o kit selecionado é ${ram.type}.`);
    if(ram.sticks>board.slots)errors.push(`O kit possui ${ram.sticks} módulos e a placa oferece ${board.slots} slots.`);
    if(gpu.length>cs.gpuMax)errors.push(`A GPU possui ${gpu.length} mm e o gabinete aceita até ${cs.gpuMax} mm.`);
    if(cooler.radiator&&!CASE_API?.canMountRadiator?.(cs,cooler.radiator))errors.push(`Radiador de ${cooler.radiator} mm não possui suporte físico neste gabinete.`);
    if(gpu.pcie>board.pcie)warnings.push(`A GPU é PCIe ${gpu.pcie}.0 e funcionará limitada pela placa PCIe ${board.pcie}.0.`);
    if(storage.generation==='NVMe Gen5'&&board.pcie<5)warnings.push('O SSD Gen5 funcionará com largura de banda reduzida nesta placa.');
    if(!state.boardPower)errors.push('Cabo ATX de 24 pinos desconectado.');
    if(!state.cpuPower)errors.push('Cabo EPS do processador desconectado.');
    if(!state.ramSeated)errors.push('Memória RAM não está totalmente encaixada.');
    if(!state.frontPanel)errors.push('Botão Power não está conectado ao front panel.');
    if(!state.coolerMounted)errors.push('Sistema de refrigeração não está fixado.');
    if(!state.cpuPaste&&cooler.type!=='none')warnings.push('Pasta térmica ausente.');
    if(cooler.capacity<cpu.tdp)errors.push(`O cooler suporta ${cooler.capacity} W, abaixo do perfil térmico de ${cpu.tdp} W.`);
    if(gpu.requiresCable&&!state.gpuPower)errors.push('Alimentação dedicada da GPU desconectada.');
    if(gpu.connectors>psu.pcie)errors.push(`A GPU exige ${gpu.connectors} conectores e a fonte oferece ${psu.pcie}.`);
    if(state.gpu==='integrated'&&!cpu.igpu)errors.push('O processador não possui vídeo integrado e não há GPU dedicada.');
    if(storage.needsData&&!state.storageData)errors.push('Cabo de dados do armazenamento principal desconectado.');
    if(storage.needsPower&&!state.storagePower)errors.push('Energia do armazenamento principal desconectada.');
    if(storage2.needsData&&!state.storage2Data)errors.push('Cabo de dados do armazenamento secundário desconectado.');
    if(storage2.needsPower&&!state.storage2Power)errors.push('Energia do armazenamento secundário desconectada.');
    if(!storage.boot)warnings.push('Não há unidade inicializável principal.');
    const activeMonitors=PERIPHERAL_API?.activeItems?.({primary:monitor,secondary:monitor2,tertiary:monitor3,state})?.items||[monitor,monitor2,monitor3].slice(0,state.monitorCount).filter(item=>item?.connector);
    for(const item of activeMonitors)if(item.connector&&!gpu.outputs.includes(item.connector)&&state.gpu!=='integrated')warnings.push(`O monitor ${item.label} usa ${item.connector.toUpperCase()}, mas a saída selecionada pode exigir adaptador.`);
    if(activeMonitors.length>Math.max(1,gpu.outputs.length)&&state.gpu!=='integrated')warnings.push('A quantidade de telas pode exigir adaptador, dock ou conexões adicionais.');
    if(!state.monitorCable&&state.monitor!=='none')warnings.push('Cabo do monitor desconectado.');
    if(state.keyboard==='none')warnings.push('Sem teclado.');
    if(state.mouse==='none')warnings.push('Sem mouse.');
    if(!state.peripheralsPower&&(state.monitor!=='none'||state.printer!=='none'))warnings.push('Periféricos sem alimentação elétrica.');
    const peripheralPower=activeMonitors.reduce((sum,item)=>sum+(item.score?38:0),0)+(printer.score?18:0)+(audio.score?12:0)+(webcam.score?6:0)+(controller.score?5:0);
    const consumption=Math.round((board.tdp+cpu.tdp+gpu.tdp+storage.power+storage2.power+nic.power+state.fans*3+45+peripheralPower*.35)*1.1);
    const recommended=Math.ceil(consumption*1.32/50)*50;
    if(psu.watts<consumption)errors.push(`Fonte insuficiente: consumo estimado ${consumption} W.`);else if(psu.watts<recommended)warnings.push(`Margem pequena. Recomendação aproximada: ${recommended} W.`);
    if(ups.watts&&ups.watts<consumption*.75)warnings.push('O nobreak pode não sustentar a carga total do computador.');
    const heat=cpu.tdp+gpu.tdp+storage.power+storage2.power;
    const thermal=THERMAL_API?.simulate?.({caseItem:cs,cpu,gpu,cooler,storageHeat:storage.power+storage2.power,fans:state.fans,cableManagement:state.cableManagement,panelState:state.caseSidePanel,cpuPaste:state.cpuPaste,coolerMounted:state.coolerMounted,settings:state})||{airflowScore:0,hottestTemperature:99,cpuTemperature:99,gpuTemperature:99,caseTemperature:99,noise:60,dustRisk:100,pressure:'indefinida',pressureDelta:0,warnings:['Motor térmico indisponível.'],info:[],labels:{},radiatorLocation:null,radiatorValid:false,intakeFans:0,exhaustFans:0,effectiveCfm:0,paths:{intake:[],exhaust:[]}};
    const airflow=thermal.airflowScore;
    const temperature=thermal.hottestTemperature;
    const noise=thermal.noise;
    warnings.push(...thermal.warnings);
    info.push(...thermal.info);
    if(cs.sidePanel!=='open'&&state.caseSidePanel==='closed'&&state.assembly?.enabled&&state.assembly?.prepared)warnings.push('Painel lateral fechado durante a montagem manual.');
    const priceIndex=cs.price+board.price+cpu.price+ram.price+gpu.price+storage.price+storage2.price+psu.price+cooler.price+nic.price+monitor.price+(state.monitorCount>1?monitor2.price:0)+(state.monitorCount>2?monitor3.price:0)+keyboard.price+mouse.price+audio.price+webcam.price+printer.price+controller.price+ups.price;
    const balance=Math.round(clamp(100-Math.abs(cpu.single-gpu.raster)*.65-Math.max(0,16-ram.capacity)*2-Math.max(0,55-storage.io)*.35,0,100));
    if(includeAssembly&&state.assembly?.enabled&&state.assembly?.prepared){
      for(const key of activeAssemblyParts())if(!assemblyPlaced(key))errors.push(`${ASSEMBLY_LABELS[key]||key} ainda não foi encaixado na montagem manual.`);
    }
    const finalReadiness=Math.round(clamp(100-errors.length*14-warnings.length*4,0,100));
    if(!errors.length)info.push('Compatibilidade física, elétrica, térmica e lógica validada.');
    return{errors,warnings,info,consumption,recommended,temperature,airflow,noise,thermal,priceIndex,readiness:finalReadiness,balance,ok:!errors.length,parts:{cs,board,cpu,ram,gpu,storage,storage2,psu,cooler,nic,monitor,monitor2,monitor3,keyboard,mouse,audio,webcam,printer,controller,ups}};
  }

  function benchmarkSuite(){
    const e=evaluate(),{cpu,gpu,ram,storage,storage2,monitor,keyboard,mouse}=e.parts;
    const resolutionFactor={'1080p':1,'1440p':1.38,'2160p':2.35}[state.benchmarkResolution];
    const qualityFactor={low:.72,medium:.88,high:1,ultra:1.28}[state.benchmarkQuality];
    const upscalingBoost={off:1,quality:1.16,balanced:1.28,performance:1.45}[state.upscaling];
    const rtPenalty=state.rayTracing?(gpu.rt>0?1.12+Math.max(0,70-gpu.rt)/100:.42):1;
    const systemPenalty=e.ok?1:.62;
    const memoryFactor=clamp(.65+ram.capacity/80+.08*(ram.score/100),.65,1.55);
    const fpsBase=Math.max(5,(gpu.raster*.92+cpu.single*.27+ram.score*.08)*upscalingBoost*systemPenalty/(resolutionFactor*qualityFactor*rtPenalty));
    const rows={
      games:[
        {name:'Competitivo / eSports',value:Math.round(fpsBase*1.72),unit:'FPS',detail:'Baixa latência e alto FPS'},
        {name:'Ação AAA',value:Math.round(fpsBase*1.02),unit:'FPS',detail:'Cenários complexos'},
        {name:'Mundo aberto',value:Math.round(fpsBase*.86),unit:'FPS',detail:'CPU, RAM e streaming'},
        {name:'Simulação/estratégia',value:Math.round((fpsBase*.72+cpu.multi*.48)*memoryFactor),unit:'FPS',detail:'Muitas entidades'},
        {name:'Cena com ray tracing',value:Math.round(fpsBase*(state.rayTracing?Math.max(.42,gpu.rt/100):1.12)),unit:'FPS',detail:state.rayTracing?'RT ativado':'RT desativado'}
      ],
      video:[
        {name:'Edição 1080p',value:Math.round(clamp(cpu.media*.52+gpu.encoder*.34+ram.capacity*.65+storage.io*.12,10,100)),unit:'%',detail:'Fluidez da linha do tempo'},
        {name:'Edição 4K',value:Math.round(clamp(cpu.media*.42+gpu.encoder*.42+ram.capacity*.5+storage.io*.13-12,5,100)),unit:'%',detail:'Efeitos e multicâmera'},
        {name:'Render 10 min 4K',value:Math.max(2,Math.round(42-(cpu.multi*.18+gpu.encoder*.14+ram.capacity*.04))),unit:'min',detail:'Tempo estimado menor é melhor'},
        {name:'Codificação/stream',value:Math.round(clamp(gpu.encoder*.62+cpu.media*.28+ram.capacity*.2,5,100)),unit:'%',detail:'Encoder e transmissão'},
        {name:'Projeto 8K',value:Math.round(clamp(cpu.multi*.33+gpu.compute*.38+ram.capacity*.36+storage.io*.12-25,0,100)),unit:'%',detail:'Carga profissional pesada'}
      ],
      work:[
        {name:'Escritório e navegador',value:Math.round(clamp(cpu.single*.48+ram.capacity*1.1+storage.io*.25,10,100)),unit:'%',detail:'Documentos, planilhas e abas'},
        {name:'Compilação de código',value:Math.round(clamp(cpu.multi*.63+ram.capacity*.45+storage.io*.18,5,100)),unit:'%',detail:'Projetos e dependências'},
        {name:'CAD / modelagem 3D',value:Math.round(clamp(cpu.single*.32+gpu.compute*.53+ram.capacity*.3,5,100)),unit:'%',detail:'Viewport e render'},
        {name:'Máquinas virtuais',value:Math.round(clamp(cpu.multi*.42+ram.capacity*.72+storage.io*.2-10,0,100)),unit:'%',detail:'Capacidade de virtualização'},
        {name:'Análise de dados/IA',value:Math.round(clamp(cpu.multi*.27+gpu.compute*.5+ram.capacity*.36+gpu.vram*1.2-15,0,100)),unit:'%',detail:'Processamento e aceleração'}
      ],
      study:[
        {name:'Ambiente escolar online',value:Math.round(clamp(cpu.single*.4+ram.capacity*1.15+storage.io*.2+e.parts.nic.speed*2.5,10,100)),unit:'%',detail:'Classroom, Drive e navegador'},
        {name:'IDE + servidor local',value:Math.round(clamp(cpu.single*.45+cpu.multi*.25+ram.capacity*.75+storage.io*.2,5,100)),unit:'%',detail:'Programação web'},
        {name:'Videoconferência',value:Math.round(clamp(cpu.media*.38+ram.capacity*.55+e.parts.webcam.score*.25+e.parts.nic.speed*4,5,100)),unit:'%',detail:'Câmera, áudio e rede'},
        {name:'Laboratórios 3D/WebGL',value:Math.round(clamp(gpu.raster*.55+cpu.single*.25+ram.capacity*.35,5,100)),unit:'%',detail:'Simuladores educacionais'},
        {name:'Autonomia pedagógica',value:Math.round(clamp(e.readiness*.45+e.balance*.25+monitor.score*.15+keyboard.score*.08+mouse.score*.07,5,100)),unit:'%',detail:'Conjunto equilibrado'}
      ]
    }[state.benchmarkTarget];
    const overall=Math.round(clamp(rows.reduce((sum,row)=>sum+(row.unit==='min'?Math.max(0,105-row.value*3):row.value),0)/rows.length,0,100));
    return{target:state.benchmarkTarget,overall,rows,settings:{resolution:state.benchmarkResolution,quality:state.benchmarkQuality,rayTracing:state.rayTracing,upscaling:state.upscaling},generatedAt:new Date().toISOString(),warning:'Valores didáticos simulados; não representam medições oficiais de fabricantes.'};
  }

  function componentOptions(group){return Object.entries(parts[group]).map(([id,item])=>`<option value="${id}">${esc(item.brand)} • ${esc(item.label.replace(`${item.brand} `,''))}</option>`).join('');}
  function controlSelect(id,label,group){return`<label>${label}<select id="hw_${id}">${componentOptions(group)}</select></label>`;}
  function tabButton(id,label){return`<button type="button" data-hw-tab="${id}">${label}</button>`;}

  function renderShell(){
    root.innerHTML=`<div class="hardware-studio hardware-v421 hardware-v4211 hardware-v422 hardware-v423 hardware-v424 hardware-v425 hardware-v426 hardware-v427 hardware-v428">
      <header class="hardware-studio-header">
        <div><span class="module-release-stamp">v${MODULE_VERSION} • ${moduleDate()}</span><span class="eyebrow">LABORATÓRIO EDUCACIONAL</span><h2>Hardware Studio Premium 3D</h2><p>Explore famílias completas de computadores, faça inspeção individual em 360°, use vista explodida e apresente o setup em modo cinema, preservando montagem, PBR, térmica e segurança física.</p></div>
        <div class="simulator-badges"><span>XP <b id="hwScore">0</b></span><span>Testes <b id="hwTests">0</b></span><span>Prontidão <b id="hwReady">0%</b></span></div>
      </header>
      <nav class="hardware-tabs" aria-label="Áreas do laboratório">${tabButton('families','Famílias')}${tabButton('build','Montagem 3D')}${tabButton('peripherals','Periféricos')}${tabButton('inspection','Inspeção 360°')}${tabButton('cinema','Modo cinema')}${tabButton('benchmark','Benchmarks')}${tabButton('diagnostics','Diagnóstico')}</nav>
      <div class="hardware-layout">
        <aside class="hardware-controls">
          <section data-hw-panel="families">
            <h3>Famílias de computadores</h3><p class="hardware-note">Escolha uma máquina completa. Cada perfil ajusta estrutura, peças, telas, periféricos, faixa de preço e modos disponíveis.</p>
            <div id="hwFamilyGrid" class="hardware-family-grid">${Object.entries(FAMILY_API?.FAMILIES||{}).map(([id,item])=>`<button type="button" data-hw-family="${id}"><span>${item.icon||'💻'}</span><strong>${esc(item.label)}</strong><small>${esc(item.category)}</small></button>`).join('')}</div>
            <div id="hwFamilySummary" class="hardware-family-summary"></div>
          </section>
          <section data-hw-panel="inspection" hidden>
            <h3>Inspeção individual 360°</h3><p class="hardware-note">Isole uma peça, gire em qualquer direção, aproxime, use vistas técnicas e ative a separação explodida.</p>
            <div class="hardware-control-grid"><label>Item<select id="hw_inspectionTarget">${Object.entries(INSPECTION_API?.TARGETS||{}).map(([id,item])=>`<option value="${id}">${esc(item.label)}</option>`).join('')}</select></label><label>Zoom<input id="hw_inspectionZoom" type="range" min="0.7" max="2.5" step="0.1"><output id="hwInspectionZoomOutput"></output></label></div>
            <div class="button-row"><button id="hwEnterInspection" class="btn primary" type="button">Inspecionar</button><button id="hwExitInspection" class="btn secondary" type="button">Voltar ao setup</button><button id="hwInspectionExploded" class="btn secondary" type="button">Vista explodida</button></div>
            <div class="hardware-inspection-views">${Object.entries(INSPECTION_API?.VIEWS||{}).map(([id,item])=>`<button type="button" data-hw-inspection-view="${id}">${esc(item.label)}</button>`).join('')}</div><div id="hwInspectionSummary" class="hardware-inspection-summary"></div>
          </section>
          <section data-hw-panel="cinema" hidden>
            <h3>Modo cinema e apresentação</h3><p class="hardware-note">Apresentação automática do ambiente, computador, peças internas, conexões, telas e periféricos.</p>
            <div class="hardware-control-grid"><label>Velocidade<select id="hw_cinematicSpeed">${Object.entries(CINEMATIC_API?.SPEEDS||{}).map(([id])=>`<option value="${id}">${id==='slow'?'Lenta':id==='fast'?'Rápida':'Normal'}</option>`).join('')}</select></label><label class="hardware-switch"><input id="hw_cinematicLoop" type="checkbox"> Repetir apresentação</label><label class="hardware-switch"><input id="hw_cinematicHideUi" type="checkbox"> Ocultar painéis durante a apresentação</label></div>
            <div class="button-row"><button id="hwCinemaStart" class="btn primary" type="button">Iniciar apresentação</button><button id="hwCinemaPause" class="btn secondary" type="button">Pausar</button><button id="hwCinemaPrev" class="btn secondary" type="button">Cena anterior</button><button id="hwCinemaNext" class="btn secondary" type="button">Próxima cena</button><button id="hwCinemaStop" class="btn secondary" type="button">Encerrar</button></div><div id="hwCinematicSummary" class="hardware-cinematic-summary"></div>
          </section>
          <section data-hw-panel="build" hidden>
            <h3>Perfis de montagem</h3><div class="hardware-preset-grid">${Object.entries(presets).map(([id,item])=>`<button type="button" data-hw-preset="${id}">${esc(item.label)}</button>`).join('')}</div>
            <div class="hardware-control-grid"><label>Modo<select id="hw_mode"><option value="free">Livre</option><option value="guided">Guiado</option><option value="challenge">Desafio</option><option value="diagnostic">Diagnóstico</option><option value="maintenance">Manutenção</option></select></label>${controlSelect('case','Gabinete','cases')}<label>Cor do computador<select id="hw_caseColor">${Object.entries(COLORS).map(([id])=>`<option value="${id}">${COLOR_LABELS[id]||id}</option>`).join('')}</select></label><label>Acabamento do gabinete<select id="hw_caseFinish">${Object.entries(CASE_FINISHES).map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label><label>Tratamento do vidro<select id="hw_glassStyle">${Object.entries(GLASS_STYLES).map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label>${controlSelect('board','Placa-mãe','boards')}${controlSelect('cpu','Processador','cpus')}${controlSelect('ram','Memória RAM','ram')}${controlSelect('gpu','Placa de vídeo','gpus')}${controlSelect('storage','Armazenamento principal','storages')}${controlSelect('storage2','Armazenamento secundário','storages')}${controlSelect('psu','Fonte','psus')}${controlSelect('cooler','Refrigeração','coolers')}${controlSelect('nic','Rede','nics')}<label>Ventoinhas<input id="hw_fans" type="range" min="0" max="10"><output id="hwFanOutput"></output></label><label>Perfil de ventilação<select id="hw_fanProfile">${Object.entries(THERMAL_API?.FAN_PROFILES||{}).map(([id,item])=>`<option value="${id}">${item.label}</option>`).join('')}</select></label><label>Curva das ventoinhas<select id="hw_fanSpeed">${Object.entries(THERMAL_API?.SPEED_PROFILES||{}).map(([id,item])=>`<option value="${id}">${item.label}</option>`).join('')}</select></label><label>Filtro de poeira<select id="hw_filterCondition">${Object.entries(THERMAL_API?.FILTERS||{}).map(([id,item])=>`<option value="${id}">${item.label}</option>`).join('')}</select></label><label>Carga de trabalho<select id="hw_workload">${Object.entries(THERMAL_API?.WORKLOADS||{}).map(([id,item])=>`<option value="${id}">${item.label}</option>`).join('')}</select></label><label>Temperatura ambiente<input id="hw_ambientTemperature" type="range" min="16" max="38"><output id="hwAmbientOutput"></output></label><label>Posição do radiador<select id="hw_radiatorPosition"><option value="auto">Automática</option><option value="front">Frente</option><option value="top">Topo</option><option value="side">Lateral</option><option value="bottom">Base</option><option value="rear">Traseira</option></select></label><label class="hardware-switch"><input id="hw_thermalOverlay" type="checkbox"> Mostrar mapa térmico e rotas de ar</label><label>Iluminação do PC<select id="hw_lighting"><option value="off">Desligada</option><option value="cyan">Ciano</option><option value="purple">Roxa</option><option value="red">Vermelha</option><option value="rainbow">RGB dinâmico</option></select></label><label>Intensidade do RGB<select id="hw_rgbIntensity">${Object.entries(RGB_INTENSITIES).map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label><label class="hardware-switch"><input id="hw_materialDetail" type="checkbox"> Texturas PBR e detalhes de superfície</label><label class="hardware-switch"><input id="hw_contactShadows" type="checkbox"> Sombras de contato</label><label>Organização de cabos<select id="hw_cableManagement"><option value="basic">Básica</option><option value="standard">Padrão</option><option value="premium">Premium</option></select></label><label>Cenário<select id="hw_backdrop">${Object.entries(STUDIO_BACKDROPS).map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label><label>Bancada / mesa<select id="hw_deskFinish">${Object.entries(DESK_FINISHES).map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label><label>Iluminação ambiente<select id="hw_ambientPreset">${Object.entries(AMBIENT_PRESETS).map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label><label>Kit de ferramentas<select id="hw_toolkit">${Object.entries(TOOL_LEVELS).map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label><label>Cor de destaque<select id="hw_accentColor">${Object.entries(ACCENT_COLORS).map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label><label class="hardware-switch"><input id="hw_showProps" type="checkbox"> Mostrar bancada, props e acessórios</label><label class="hardware-switch"><input id="hw_assemblyGuide" type="checkbox"> Animações guiadas de montagem</label><label class="hardware-switch"><input id="hw_caseStructureVisible" type="checkbox"> Mostrar estrutura, baias e pontos de fixação</label></div><div id="hwCaseStructure" class="hardware-case-structure"></div><div id="hwThermalPanel" class="hardware-thermal-panel"></div>
            <details><summary>Conexões e montagem manual</summary><div class="hardware-check-grid">${[['boardPower','ATX 24 pinos'],['cpuPower','EPS da CPU'],['gpuPower','Energia da GPU'],['ramSeated','RAM encaixada'],['storageData','Dados do disco principal'],['storagePower','Energia do disco principal'],['storage2Data','Dados do disco secundário'],['storage2Power','Energia do disco secundário'],['frontPanel','Front panel'],['cpuPaste','Pasta térmica'],['coolerMounted','Cooler fixado'],['monitorCable','Cabo do monitor'],['peripheralsPower','Periféricos energizados']].map(([id,label])=>`<label><input id="hw_${id}" type="checkbox"> ${label}</label>`).join('')}</div></details>
            <div class="hardware-system-controls"><label>Sistema operacional<select id="hw_systemOs">${Object.entries(SYSTEM_API?.OS_PROFILES||{}).map(([id,item])=>`<option value="${id}">${esc(item.label)}</option>`).join('')}</select></label><div class="button-row"><button id="hwPower" class="btn primary" type="button">Montar e ligar</button><button id="hwInstallSystem" class="btn secondary" type="button">Instalar/reinstalar sistema</button><button id="hwAssemblyDemo" class="btn secondary" type="button">Animação de montagem</button><button id="hwRepair" class="btn secondary" type="button">Corrigir configuração</button><button id="hwShutdown" class="btn secondary" type="button">Desligar</button></div></div><div id="hwStudioSummary" class="hardware-summary-card"></div>
          </section>
          <section data-hw-panel="peripherals" hidden>
            <h3>Entrada, saída e acessórios</h3><div class="hardware-control-grid">${controlSelect('monitor','Monitor principal','monitors')}<label>Quantidade de telas<select id="hw_monitorCount">${Object.entries(PERIPHERAL_API?.COUNTS||{1:'Uma tela',2:'Duas telas',3:'Três telas'}).map(([id,label])=>`<option value="${id}">${label}</option>`).join('')}</select></label>${controlSelect('monitor2','Segunda tela','monitors')}${controlSelect('monitor3','Terceira tela','monitors')}<label>Organização das telas<select id="hw_monitorLayout">${Object.entries(PERIPHERAL_API?.LAYOUTS||{}).map(([id,item])=>`<option value="${id}">${item.label}</option>`).join('')}</select></label><label>Suporte dos monitores<select id="hw_monitorMount">${Object.entries(PERIPHERAL_API?.MOUNTS||{}).map(([id,item])=>`<option value="${id}">${item.label}</option>`).join('')}</select></label>${controlSelect('keyboard','Teclado','keyboards')}${controlSelect('mouse','Mouse','mice')}${controlSelect('audio','Áudio e microfone','audio')}${controlSelect('webcam','Webcam/câmera','webcams')}${controlSelect('printer','Impressora','printers')}${controlSelect('controller','Controle/VR','controllers')}${controlSelect('ups','Nobreak','ups')}</div><div id="hwMonitorSetup" class="hardware-monitor-setup"></div><div id="hwPeripheralSummary" class="hardware-summary-card"></div>
          </section>
          <section data-hw-panel="benchmark" hidden>
            <h3>Benchmark, estabilidade e segurança térmica</h3><p class="hardware-note">Os resultados são educacionais. O incêndio virtual só ocorre no cenário extremo com falhas múltiplas e proteções desativadas na simulação.</p><div class="hardware-control-grid"><label>Uso principal<select id="hw_benchmarkTarget"><option value="games">Jogos</option><option value="video">Vídeo e criação</option><option value="work">Trabalho profissional</option><option value="study">Estudos e programação</option></select></label><label>Resolução<select id="hw_benchmarkResolution"><option value="1080p">Full HD 1080p</option><option value="1440p">QHD 1440p</option><option value="2160p">4K 2160p</option></select></label><label>Qualidade do aplicativo/jogo<select id="hw_benchmarkQuality"><option value="low">Baixa</option><option value="medium">Média</option><option value="high">Alta</option><option value="ultra">Ultra</option></select></label><label>Upscaling<select id="hw_upscaling"><option value="off">Desligado</option><option value="quality">Qualidade</option><option value="balanced">Balanceado</option><option value="performance">Desempenho</option></select></label><label>Nível de estresse<select id="hw_incidentLevel">${Object.entries(INCIDENT_API?.STRESS_LEVELS||{}).map(([id,item])=>`<option value="${id}">${item.label}</option>`).join('')}</select></label><label>Ambiente térmico<select id="hw_incidentEnvironment">${Object.entries(INCIDENT_API?.ENVIRONMENTS||{}).map(([id,item])=>`<option value="${id}">${item.label}</option>`).join('')}</select></label><label>Proteção térmica<select id="hw_incidentProtection">${Object.entries(INCIDENT_API?.PROTECTIONS||{}).map(([id,item])=>`<option value="${id}">${item.label}</option>`).join('')}</select></label><label class="hardware-switch"><input id="hw_benchmarkFaultInjection" type="checkbox"> Simular falhas múltiplas de refrigeração</label><label class="hardware-switch"><input id="hw_rayTracing" type="checkbox"> Ray tracing simulado</label></div><div class="button-row"><button id="hwRunBenchmark" class="btn primary" type="button">Executar benchmark completo</button><button id="hwPauseBenchmark" class="btn secondary" type="button" hidden>Pausar e proteger</button><button id="hwContinueBenchmark" class="btn danger" type="button" hidden>Continuar mesmo assim</button><button id="hwUseExtinguisher" class="btn danger" type="button" hidden>Usar extintor virtual</button></div><div id="hwBenchmarkStatus" class="hardware-summary-card"></div><div id="hwIncidentTimeline" class="hardware-incident-timeline"></div>
          </section>
          <section data-hw-panel="diagnostics" hidden>
            <h3>Cenários de falha</h3><div class="hardware-scenario-grid">${[['standard','Padrão'],['ram','RAM solta'],['power','CPU sem energia'],['gpu','GPU incompatível'],['thermal','Superaquecimento'],['storage','Disco desconectado'],['socket','Socket/RAM errados'],['peripherals','Falha de periféricos'],['maintenance','Manutenção completa']].map(([id,label])=>`<button type="button" data-hw-scenario="${id}">${label}</button>`).join('')}</div><h3>Testes técnicos</h3><div class="hardware-test-grid">${[['post','POST'],['cpu','CPU'],['memory','Memória'],['gpu','GPU'],['storage','Armazenamento'],['thermal','Térmico'],['io','Entrada e saída'],['network','Rede'],['full','Teste completo']].map(([id,label])=>`<button type="button" data-hw-test="${id}">${label}</button>`).join('')}</div><div id="hwDiagnosticResults" class="hardware-summary-card"></div>
          </section>
        </aside>
        <main class="hardware-stage-column">
          <section class="hardware-stage-shell">
            <div class="hardware-stage-toolbar"><div class="hardware-view-buttons"><button data-hw-view="front">Frontal</button><button data-hw-view="side">Lateral</button><button data-hw-view="top">Superior</button><button data-hw-view="iso">Isométrica</button><button id="hwCasePanel" data-hw-case-panel type="button">Painel lateral</button><button data-hw-toggle="exploded">Explodida</button><button data-hw-toggle="autorotate">Rotação</button></div><div class="hardware-quality"><span>Gráficos do laboratório</span>${GRAPHICS_LEVELS.map(level=>`<button type="button" data-hw-quality="${level}">${({low:'Baixo',medium:'Médio',high:'Alto',ultra:'Ultra'})[level]}</button>`).join('')}</div></div>
            <div class="hardware-render-area" data-quality="${state.labGraphics}"><canvas id="hardwareCanvas3d" aria-label="Visualização 3D interativa para montagem do computador"></canvas><canvas id="hardwareCanvas2d" aria-label="Visualização leve do computador montado"></canvas><div id="hwIncidentFx" class="hardware-incident-fx" aria-hidden="true"><div class="smoke-cloud smoke-a"></div><div class="smoke-cloud smoke-b"></div><div class="fire-core"></div><div class="fire-glow"></div></div><div class="hardware-render-overlay"><span id="hwRenderStatus">Inicializando renderização…</span><span id="hwRenderStats"></span></div><div id="hwCanvasHelp" class="hardware-canvas-help">Arraste para girar 360° • pinça/roda para zoom • toque em uma peça para inspecionar</div></div>
            <section class="hardware-assembly-dock" aria-label="Controles da montagem manual"><header><div><span>MONTAGEM MANUAL 3D</span><strong id="hwAssemblyTitle">Modo de inspeção</strong></div><b id="hwAssemblyPercent">100%</b></header><div class="hardware-assembly-progress"><i id="hwAssemblyProgressBar"></i></div><p id="hwAssemblyDescription">Ative o modo manual para separar, arrastar, girar e encaixar os componentes.</p><div class="hardware-assembly-actions"><button id="hwManualToggle" type="button">Ativar montagem manual</button><button id="hwPrepareAssembly" type="button">Separar peças</button><button id="hwSnapSelected" type="button">Encaixar selecionada</button><button id="hwRotateLeft" type="button" aria-label="Girar peça selecionada para a esquerda">Girar −15°</button><button id="hwRotateRight" type="button" aria-label="Girar peça selecionada para a direita">Girar +15°</button><button id="hwUndoAssembly" type="button">Desfazer</button><button id="hwRedoAssembly" type="button">Refazer</button><button id="hwResetAssembly" type="button">Reiniciar</button></div><div id="hwAssemblyParts" class="hardware-assembly-parts" aria-live="polite"></div></section>
            <div class="hardware-part-strip">${[['case','Gabinete'],['board','Placa-mãe'],['cpu','CPU'],['ram','RAM'],['gpu','GPU'],['storage','Disco 1'],['storage2','Disco 2'],['psu','Fonte'],['cooler','Cooler'],['monitor','Monitor'],['peripherals','Periféricos']].map(([id,label])=>`<button type="button" data-hw-part="${id}">${label}</button>`).join('')}</div>
            <div id="hwInspector" class="hardware-inspector"></div>
            <div id="hwLayoutSafety" class="hardware-layout-safety" aria-live="polite"></div><div id="hwGraphicsPanel" class="hardware-graphics-panel" aria-live="polite"></div>
          </section>
          <section class="hardware-overview-grid"><div id="hwStatus" class="state-card"></div><div id="hwMetrics" class="hardware-metrics"></div><div id="hwTechMatrix" class="hardware-tech-matrix"></div></section>
          <section id="hwBenchmarkResults" class="hardware-results" hidden></section>
          <section class="hardware-monitor-log"><div class="pc-monitor"><div id="hwScreen" class="pc-screen"><div id="hwScreenContent" class="pc-screen-content"><strong id="hwScreenTitle">SEM SINAL</strong><p id="hwScreenText">Aguardando montagem.</p></div></div><div class="monitor-neck"></div></div><div id="hwLog" class="console-card hardware-log" aria-live="polite"></div></section>
        </main>
      </div>
    </div>`;
  }

  function refreshControls(){
    if(!root)return;
    for(const [key,value] of Object.entries(state)){
      const el=$(`#hw_${key}`);if(!el)continue;
      if(el.type==='checkbox')el.checked=Boolean(value);else el.value=String(value);
    }
    $('#hwFanOutput').textContent=String(state.fans);
    const ambientOutput=$('#hwAmbientOutput');if(ambientOutput)ambientOutput.textContent=`${state.ambientTemperature} °C`;
    const allowedLayouts=new Set((PERIPHERAL_API?.compatibleLayouts?.(state.monitorCount)||[]).map(item=>item.id));
    const allowedMounts=new Set((PERIPHERAL_API?.compatibleMounts?.(state.monitorCount)||[]).map(item=>item.id));
    const layoutSelect=$('#hw_monitorLayout'),mountSelect=$('#hw_monitorMount');
    if(layoutSelect)for(const option of layoutSelect.options)option.disabled=allowedLayouts.size&&!allowedLayouts.has(option.value);
    if(mountSelect)for(const option of mountSelect.options)option.disabled=allowedMounts.size&&!allowedMounts.has(option.value);
  }

  function renderTabs(){
    $$('[data-hw-tab]').forEach(button=>button.classList.toggle('active',button.dataset.hwTab===state.tab));
    $$('[data-hw-panel]').forEach(panel=>panel.hidden=panel.dataset.hwPanel!==state.tab);
  }

  function activeMonitorItems(e=evaluate()){const plan=PERIPHERAL_API?.activeItems?.({primary:e.parts.monitor,secondary:e.parts.monitor2,tertiary:e.parts.monitor3,state});return plan?.items||[e.parts.monitor,e.parts.monitor2,e.parts.monitor3].slice(0,state.monitorCount).filter(item=>item&&item.connector);}
  function layoutMonitorDescription(e=evaluate()){const count=activeMonitorItems(e).length,layout=PERIPHERAL_API?.LAYOUTS?.[state.monitorLayout]?.label||state.monitorLayout,mount=PERIPHERAL_API?.MOUNTS?.[state.monitorMount]?.label||state.monitorMount;return `${count} tela${count===1?'':'s'} • ${layout} • ${mount}`;}

  function renderInspector(e=evaluate()){
    const map={
      case:{item:e.parts.cs,rows:[['Classe',e.parts.cs.caseClass||e.parts.cs.generation],['Dimensões',CASE_API?.dimensionsText?.(e.parts.cs)||e.parts.cs.size.join(' × ')],['Frente',e.parts.cs.frontPanelLabel||e.parts.cs.frontPanel],['Lateral',CASE_API?.panelLabel?.(e.parts.cs,state.caseSidePanel)||e.parts.cs.sidePanelLabel],['Câmaras',String(e.parts.cs.chambers||0)],['GPU máxima',`${e.parts.cs.gpuMax} mm`],['Radiadores',CASE_API?.mountSummary?.(e.parts.cs)||`${e.parts.cs.radiator} mm`]]},
      board:{item:e.parts.board,rows:[['Marca',e.parts.board.brand],['Formato',e.parts.board.format],['Socket',e.parts.board.socket],['Memória',e.parts.board.ram],['PCIe',`${e.parts.board.pcie}.0`],['M.2',String(e.parts.board.m2)]]},
      cpu:{item:e.parts.cpu,rows:[['Marca',e.parts.cpu.brand],['Geração',e.parts.cpu.generation],['Período',e.parts.cpu.year],['Núcleos/threads',`${e.parts.cpu.cores}/${e.parts.cpu.threads}`],['TDP',`${e.parts.cpu.tdp} W`]]},
      ram:{item:e.parts.ram,rows:[['Marca',e.parts.ram.brand],['Geração',e.parts.ram.generation],['Capacidade',`${e.parts.ram.capacity} GB`],['Velocidade',`${e.parts.ram.speed} MT/s`],['Módulos',String(e.parts.ram.sticks)]]},
      gpu:{item:e.parts.gpu,rows:[['Marca',e.parts.gpu.brand],['Geração',e.parts.gpu.generation],['VRAM',`${e.parts.gpu.vram} GB`],['Consumo',`${e.parts.gpu.tdp} W`],['Comprimento',e.parts.gpu.length?`${e.parts.gpu.length} mm`:'Integrada'],['Ray tracing',e.parts.gpu.rt?'Suportado na simulação':'Não']]},
      storage:{item:e.parts.storage,rows:[['Marca',e.parts.storage.brand],['Tecnologia',e.parts.storage.generation],['Interface',e.parts.storage.interface],['Capacidade',`${e.parts.storage.capacity} GB`],['Índice de I/O',`${e.parts.storage.io}/100`]]},
      storage2:{item:e.parts.storage2,rows:[['Marca',e.parts.storage2.brand],['Tecnologia',e.parts.storage2.generation],['Interface',e.parts.storage2.interface],['Capacidade',`${e.parts.storage2.capacity} GB`],['Índice de I/O',`${e.parts.storage2.io}/100`]]},
      psu:{item:e.parts.psu,rows:[['Marca',e.parts.psu.brand],['Potência',`${e.parts.psu.watts} W`],['Eficiência',`${e.parts.psu.efficiency}%`],['Modular',e.parts.psu.modular?'Sim':'Não'],['Margem',`${e.parts.psu.watts-e.consumption} W`]]},
      cooler:{item:e.parts.cooler,rows:[['Marca',e.parts.cooler.brand],['Tipo',e.parts.cooler.type],['Capacidade',`${e.parts.cooler.capacity} W`],['Radiador',e.parts.cooler.radiator?`${e.parts.cooler.radiator} mm`:'Não'],['Ruído base',`${e.parts.cooler.noise} dB`]]},
      monitor:{item:e.parts.monitor,rows:[['Configuração',layoutMonitorDescription(e)],['Marca',e.parts.monitor.brand],['Resolução',e.parts.monitor.res.join(' × ')],['Frequência',`${e.parts.monitor.refresh} Hz`],['Painel',e.parts.monitor.panel],['HDR',e.parts.monitor.hdr?'Sim':'Não']]},
      peripherals:{item:{label:'Conjunto de entrada e saída'},rows:[['Telas',layoutMonitorDescription(e)],['Teclado',e.parts.keyboard.label],['Mouse',e.parts.mouse.label],['Áudio',e.parts.audio.label],['Webcam',e.parts.webcam.label],['Impressora',e.parts.printer.label],['Controle/VR',e.parts.controller.label]]}
    };
    const info=map[state.selectedPart]||map.board;
    $('#hwInspector').innerHTML=`<div><span>COMPONENTE SELECIONADO</span><strong>${esc(info.item.label)}</strong><small>Dados didáticos para comparação e compatibilidade.</small></div><dl>${info.rows.map(([name,value])=>`<div><dt>${esc(name)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;
  }

  function familyProfile(){return FAMILY_API?.profile?.(state.family)||{label:'Computador',category:'—',formFactor:'tower',description:'',manualAssembly:true};}
  function familyPrice(e=evaluate()){return FAMILY_API?.estimate?.(e.parts,state)||{formatted:'—',reference:'—'};}
  function renderFamilyPanel(e=evaluate()){
    const family=familyProfile(),price=familyPrice(e),box=$('#hwFamilySummary');
    $$('[data-hw-family]').forEach(button=>button.classList.toggle('active',button.dataset.hwFamily===state.family));
    if(box)box.innerHTML=`<header><div><span>${esc(family.category)}</span><strong>${esc(family.icon||'💻')} ${esc(family.label)}</strong></div><b>${family.manualAssembly===false?'MANUTENÇÃO GUIADA':'MONTAGEM MANUAL'}</b></header><p>${esc(family.description)}</p><dl><div><dt>Formato</dt><dd>${esc(family.formFactor)}</dd></div><div><dt>Preço educativo</dt><dd>${esc(price.formatted)}</dd></div><div><dt>Referência</dt><dd>${esc(price.reference)}</dd></div><div><dt>Inspeções</dt><dd>${(family.inspection||[]).length}</dd></div></dl><small>Valores aproximados para comparação educacional; não são cotação ao vivo.</small>`;
  }
  function inspectionItem(e,target){const map={family:familyProfile(),case:e.parts.cs,board:e.parts.board,cpu:e.parts.cpu,ram:e.parts.ram,gpu:e.parts.gpu,storage:e.parts.storage,storage2:e.parts.storage2,psu:e.parts.psu,cooler:e.parts.cooler,monitor:e.parts.monitor,keyboard:e.parts.keyboard,mouse:e.parts.mouse,audio:e.parts.audio,webcam:e.parts.webcam,controller:e.parts.controller};return map[target]||familyProfile();}
  function renderInspectionPanel(e=evaluate()){
    const allowed=FAMILY_API?.availableInspectionTargets?.(state.family)||Object.keys(INSPECTION_API?.TARGETS||{}),selectBox=$('#hw_inspectionTarget');
    if(selectBox){for(const option of selectBox.options)option.hidden=!allowed.includes(option.value);if(!allowed.includes(state.inspection.target))state.inspection.target=allowed[0]||'family';selectBox.value=state.inspection.target;}
    const details=INSPECTION_API?.details?.(state.inspection.target,{item:inspectionItem(e,state.inspection.target),family:familyProfile()})||{label:'Inspeção',description:'',rows:[]};
    const box=$('#hwInspectionSummary');if(box)box.innerHTML=`<header><div><span>${state.inspection.active?'INSPEÇÃO ATIVA':'PRONTO PARA INSPECIONAR'}</span><strong>${esc(details.label)}</strong></div><b>${state.inspection.exploded?'EXPLODIDO':'360°'}</b></header><p>${esc(details.description)}</p><dl>${details.rows.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`;
    const zoom=$('#hw_inspectionZoom');if(zoom)zoom.value=String(state.inspection.zoom);const out=$('#hwInspectionZoomOutput');if(out)out.textContent=`${Math.round(state.inspection.zoom*100)}%`;
    $$('[data-hw-inspection-view]').forEach(button=>button.classList.toggle('active',button.dataset.hwInspectionView===state.inspection.view));
    $('#hwEnterInspection')?.classList.toggle('active',state.inspection.active);$('#hwInspectionExploded')?.classList.toggle('active',state.inspection.exploded);
  }
  function renderCinematicPanel(){
    const shot=CINEMATIC_API?.current?.(state.cinematic),box=$('#hwCinematicSummary');
    if(box)box.innerHTML=`<header><div><span>${state.cinematic.active?'APRESENTAÇÃO ATIVA':'MODO CINEMA'}</span><strong>${esc(shot?.label||'Visão geral')}</strong></div><b>${state.cinematic.shot+1}/${CINEMATIC_API?.SHOTS?.length||1}</b></header><div class="hardware-cinema-track"><i style="width:${state.cinematic.active?Math.min(100,(state.cinematic.elapsed/(shot?.duration||1))*100):0}%"></i></div><p>${state.cinematic.playing?'Câmera em movimento automático.':'Apresentação pausada ou pronta para iniciar.'}</p>`;
    const speed=$('#hw_cinematicSpeed');if(speed)speed.value=state.cinematic.speed;const loop=$('#hw_cinematicLoop');if(loop)loop.checked=state.cinematic.loop;const hide=$('#hw_cinematicHideUi');if(hide)hide.checked=state.cinematic.hideUi;
    $('.hardware-studio')?.classList.toggle('hardware-cinema-clean',Boolean(state.cinematic.active&&state.cinematic.hideUi));
  }

  function renderBenchmark(result=state.benchmarkResults){
    const section=$('#hwBenchmarkResults');
    if(!result){section.hidden=true;section.innerHTML='';return;}
    section.hidden=false;
    const labels={games:'Jogos',video:'Vídeo e criação',work:'Trabalho profissional',study:'Estudos e programação'};
    section.innerHTML=`<header><div><span>BENCHMARK SIMULADO</span><h3>${labels[result.target]}</h3></div><strong>${result.overall}/100</strong></header><div class="hardware-benchmark-bars">${result.rows.map(row=>{const max=row.unit==='FPS'?240:row.unit==='min'?45:100;const normalized=row.unit==='min'?clamp(100-row.value*2,4,100):clamp(row.value/max*100,4,100);return`<article><div><strong>${esc(row.name)}</strong><span>${esc(row.detail)}</span></div><div class="hardware-benchmark-track"><i style="width:${normalized}%"></i></div><b>${row.value} ${esc(row.unit)}</b></article>`;}).join('')}</div><p>${esc(result.warning)}</p>`;
  }

  function renderDiagnostics(){
    const box=$('#hwDiagnosticResults');
    if(!state.diagnosticResults.length){box.innerHTML='<strong>Nenhum teste executado</strong><p>Escolha um teste técnico ou execute o teste completo.</p>';return;}
    box.innerHTML=`<strong>Últimos testes</strong><ul>${state.diagnosticResults.slice(-8).reverse().map(item=>`<li class="${item.ok?'ok':'fail'}"><span>${esc(item.label)}</span><b>${item.ok?'APROVADO':'FALHA'}</b><small>${esc(item.detail)}</small></li>`).join('')}</ul>`;
  }

  function renderAssemblyPanel(){
    const assembly=state.assembly,active=activeAssemblyParts();
    const installed=active.filter(key=>assemblyPlaced(key)).length;
    const percent=active.length?Math.round(installed/active.length*100):100;
    const selectedActive=active.includes(state.selectedPart);
    const title=$('#hwAssemblyTitle'),description=$('#hwAssemblyDescription'),bar=$('#hwAssemblyProgressBar'),percentBox=$('#hwAssemblyPercent'),partsBox=$('#hwAssemblyParts'),help=$('#hwCanvasHelp');
    if(title)title.textContent=!assembly.enabled?'Modo de inspeção':assembly.prepared?`${installed} de ${active.length} componentes encaixados`:'Montagem manual pronta';
    if(description)description.textContent=!assembly.enabled?'Ative o modo manual para separar, arrastar, girar e encaixar os componentes.':assembly.prepared?(assembly.lastAction||'Arraste uma peça da bancada até o contorno correspondente. As dependências e colisões serão verificadas.'):'Clique em “Separar peças” para iniciar uma nova montagem.';
    if(bar)bar.style.width=`${percent}%`;if(percentBox)percentBox.textContent=`${percent}%`;
    if(partsBox)partsBox.innerHTML=active.map(key=>`<button type="button" data-hw-part="${key}" class="${assemblyPlaced(key)?'installed':'pending'} ${state.selectedPart===key?'active':''}"><span>${assemblyPlaced(key)?'✓':'○'}</span>${esc(ASSEMBLY_LABELS[key]||key)}</button>`).join('');
    if(help)help.textContent=assembly.enabled&&assembly.prepared?'Arraste a peça com mouse ou toque • alvo verde: disponível • amarelo: próximo • vermelho: bloqueado • pinça/roda: zoom':'Arraste para girar 360° • pinça/roda para zoom • toque em uma peça para inspecionar';
    const area=$('.hardware-render-area');if(area)area.dataset.assembly=assembly.enabled&&assembly.prepared?'active':'inspection';
    const toggle=$('#hwManualToggle');if(toggle){toggle.textContent=assembly.enabled?'Sair da montagem manual':'Ativar montagem manual';toggle.classList.toggle('active',assembly.enabled);}
    const familyAllowsAssembly=!(FAMILY_API?.supportsManualAssembly)&&true||FAMILY_API.supportsManualAssembly(state.family);
    const controls=['#hwPrepareAssembly','#hwResetAssembly'];for(const selector of controls){const button=$(selector);if(button)button.disabled=!familyAllowsAssembly||!assembly.enabled;}
    if(toggle)toggle.disabled=!familyAllowsAssembly;
    for(const selector of ['#hwSnapSelected','#hwRotateLeft','#hwRotateRight']){const button=$(selector);if(button)button.disabled=!(familyAllowsAssembly&&assembly.enabled&&assembly.prepared&&selectedActive);}
    const undo=$('#hwUndoAssembly'),redo=$('#hwRedoAssembly');if(undo)undo.disabled=!(assembly.enabled&&assembly.history.length);if(redo)redo.disabled=!(assembly.enabled&&assembly.future.length);
  }

  function runtimeTemperatures(e=evaluate()){
    const incident=state.benchmarkIncident||{};
    return{cpu:incident.stage!=='idle'&&incident.cpuTemp?incident.cpuTemp:e.thermal.cpuTemperature,gpu:incident.stage!=='idle'&&incident.gpuTemp?incident.gpuTemp:e.thermal.gpuTemperature,case:incident.stage!=='idle'&&incident.caseTemp?incident.caseTemp:e.thermal.caseTemperature};
  }

  function renderPcScreen(e=evaluate()){
    const temperatures=runtimeTemperatures(e),model=SYSTEM_API?.screenModel?.(state.system,{cpu:e.parts.cpu.label,ram:`${e.parts.ram.capacity} GB`,storage:e.parts.storage.label,family:familyProfile().label,fans:`${e.thermal.intakeFans+e.thermal.exhaustFans}`,temperatures,load:state.benchmarkIncident?.load||0,fps:state.benchmarkResults?.rows?.find(row=>row.unit==='FPS')?.value||'—'})||{phase:'off',title:'SEM SINAL',subtitle:'Aguardando energia',progress:0,classes:[],tiles:[]};
    const screen=$('#hwScreen'),content=$('#hwScreenContent');if(!screen||!content)return;
    screen.dataset.state=state.state;screen.dataset.phase=model.phase;screen.className=`pc-screen ${(model.classes||[]).join(' ')}`;
    const progress=['post','boot','install','benchmark','warning','throttling'].includes(model.phase)?`<div class="pc-screen-progress"><i style="width:${clamp(model.progress||state.benchmarkIncident?.progress*100||0,0,100)}%"></i></div>`:'';
    const tiles=(model.tiles||[]).length?`<div class="pc-screen-tiles">${model.tiles.map(([label,value])=>`<div><span>${esc(label)}</span><b>${esc(value)}</b></div>`).join('')}</div>`:'';
    const desktop=['desktop','benchmark','warning','throttling'].includes(model.phase)?`<div class="pc-desktop-bar"><span>${esc((SYSTEM_API?.OS_PROFILES?.[state.system.os]||{}).short||'Sistema')}</span><span>${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</span></div>`:'';
    content.innerHTML=`${desktop}<strong id="hwScreenTitle">${esc(model.title)}</strong><p id="hwScreenText">${esc(model.subtitle)}</p>${progress}${tiles}`;
  }

  function renderIncidentPanel(){
    const incident=state.benchmarkIncident||{},status=$('#hwBenchmarkStatus'),timeline=$('#hwIncidentTimeline'),level=INCIDENT_API?.STRESS_LEVELS?.[incident.level],environment=INCIDENT_API?.ENVIRONMENTS?.[incident.environment],protection=INCIDENT_API?.PROTECTIONS?.[incident.protection];
    if(status){const active=state.benchmarkRunning||['warning','throttling','critical','shutdown','smoke','fire','extinguished'].includes(incident.stage);status.dataset.stage=incident.stage;status.innerHTML=`<header><div><span>${active?'MONITORAMENTO EM TEMPO REAL':'PRONTO PARA TESTAR'}</span><strong>${esc(level?.label||'Médio')} • ${esc(environment?.label||'Ambiente comum')}</strong></div><b>${incident.cpuTemp||'—'} °C</b></header><div class="hardware-live-temps"><div><span>CPU</span><b>${incident.cpuTemp||'—'} °C</b></div><div><span>GPU</span><b>${incident.gpuTemp||'—'} °C</b></div><div><span>Gabinete</span><b>${incident.caseTemp||'—'} °C</b></div><div><span>Carga</span><b>${incident.load||0}%</b></div></div><div class="hardware-incident-progress"><i style="width:${Math.round((incident.progress||0)*100)}%"></i></div><p>${esc(incident.reason||`${level?.description||''} ${protection?.description||''}`)}</p>`;}
    if(timeline)timeline.innerHTML=(incident.events||[]).length?`<strong>Linha do tempo térmica</strong><ol>${incident.events.slice(-8).map(item=>`<li><time>${new Date(item.time).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</time><span>${esc(item.type)}</span><small>${esc(item.detail?.reason||item.detail?.choice||item.detail?.result||'')}</small></li>`).join('')}</ol>`:'<strong>Linha do tempo térmica</strong><p>Nenhum evento crítico registrado.</p>';
    const pause=$('#hwPauseBenchmark'),cont=$('#hwContinueBenchmark'),ext=$('#hwUseExtinguisher');if(pause)pause.hidden=!incident.awaitingDecision;if(cont)cont.hidden=!incident.awaitingDecision;if(ext)ext.hidden=incident.stage!=='fire';
    const fx=$('#hwIncidentFx');if(fx){fx.dataset.stage=incident.stage;fx.classList.toggle('show-smoke',['smoke','fire'].includes(incident.stage));fx.classList.toggle('show-fire',incident.stage==='fire');}
  }

  function renderPanels(){
    if(!root)return;
    const e=evaluate(),layout=calculateSetupLayout(e);
    renderTabs();refreshControls();renderInspector(e);renderFamilyPanel(e);renderInspectionPanel(e);renderCinematicPanel();renderBenchmark();renderDiagnostics();renderAssemblyPanel();
    $('#hwScore').textContent=String(state.score);$('#hwTests').textContent=String(state.tests);$('#hwReady').textContent=`${e.readiness}%`;
    $$('[data-hw-preset]').forEach(button=>button.classList.toggle('active',button.dataset.hwPreset===state.preset));
    $$('[data-hw-part]').forEach(button=>button.classList.toggle('active',button.dataset.hwPart===state.selectedPart));
    $$('[data-hw-quality]').forEach(button=>button.classList.toggle('active',button.dataset.hwQuality===state.labGraphics));
    $$('[data-hw-toggle]').forEach(button=>button.classList.toggle('active',Boolean(state[button.dataset.hwToggle])));
    const fullOk=e.ok&&layout.safe,status=$('#hwStatus');status.className=`state-card ${fullOk?'success':'error'}`;status.innerHTML=`<strong>${fullOk?'Montagem e setup compatíveis':'Correções necessárias'}</strong><div class="hardware-readiness"><i style="width:${e.readiness}%"></i></div><p>Prontidão ${e.readiness}% • Equilíbrio ${e.balance}%</p><ul>${[...layout.errors,...e.errors,...layout.warnings,...e.warnings,...e.info].slice(0,9).map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`;
    const metrics=[['Consumo',`${e.consumption} W`],['Fonte',`${e.parts.psu.watts} W`],['CPU',`${e.thermal.cpuTemperature} °C`],['GPU',`${e.thermal.gpuTemperature} °C`],['Gabinete',`${e.thermal.caseTemperature} °C`],['Fluxo de ar',`${e.airflow}%`],['Pressão',e.thermal.pressure],['Ruído',`${e.noise} dB`],['Poeira',`${e.thermal.dustRisk}%`],['Equilíbrio',`${e.balance}%`]];
    $('#hwMetrics').innerHTML=metrics.map(([label,value])=>`<div><span>${label}</span><b>${value}</b></div>`).join('');
    $('#hwTechMatrix').innerHTML=`<h3>Gerações, studio e tecnologias</h3><div><span>CPU</span><b>${esc(e.parts.cpu.generation)}</b></div><div><span>GPU</span><b>${esc(e.parts.gpu.generation)}</b></div><div><span>Memória</span><b>${esc(e.parts.ram.generation)}</b></div><div><span>Armazenamento</span><b>${esc(e.parts.storage.generation)}</b></div><div><span>Plataforma</span><b>${esc(e.parts.board.generation)}</b></div><div><span>Rede</span><b>${esc(e.parts.nic.generation)}</b></div><div><span>Cenário</span><b>${esc(STUDIO_BACKDROPS[state.backdrop])}</b></div><div><span>Bancada</span><b>${esc(DESK_FINISHES[state.deskFinish])}</b></div>`;
    const caseInfo=CASE_API?.structureSummary?.(e.parts.cs);const caseBox=$('#hwCaseStructure');
    if(caseBox&&caseInfo)caseBox.innerHTML=`<header><div><span>ESTRUTURA DO GABINETE</span><strong>${esc(caseInfo.classLabel)}</strong></div><b>${esc(CASE_API.panelLabel(e.parts.cs,state.caseSidePanel))}</b></header><dl><div><dt>Dimensões reais</dt><dd>${esc(caseInfo.dimensions)}</dd></div><div><dt>Painel frontal</dt><dd>${esc(caseInfo.front)}</dd></div><div><dt>Câmaras</dt><dd>${caseInfo.chambers||'Aberto'}</dd></div><div><dt>Baias</dt><dd>${esc(caseInfo.drives)}</dd></div><div class="wide"><dt>Montagens</dt><dd>${esc(caseInfo.mounts)}</dd></div></dl><p>${esc(caseInfo.notes)}</p>`;
    const thermalBox=$('#hwThermalPanel');if(thermalBox){const t=e.thermal;thermalBox.dataset.status=t.status;thermalBox.innerHTML=`<header><div><span>SIMULAÇÃO TÉRMICA</span><strong>${esc(t.labels.workload||'Carga')} • ${esc(t.status)}</strong></div><b>${t.hottestTemperature} °C</b></header><div class="hardware-thermal-gauges"><article><span>CPU</span><b>${t.cpuTemperature} °C</b><i style="--thermal:${clamp((t.cpuTemperature-25)/75*100,0,100)}%"></i></article><article><span>GPU</span><b>${t.gpuTemperature} °C</b><i style="--thermal:${clamp((t.gpuTemperature-25)/75*100,0,100)}%"></i></article><article><span>Gabinete</span><b>${t.caseTemperature} °C</b><i style="--thermal:${clamp((t.caseTemperature-20)/55*100,0,100)}%"></i></article></div><dl><div><dt>Entrada / exaustão</dt><dd>${t.intakeFans} / ${t.exhaustFans} fans</dd></div><div><dt>Vazão efetiva</dt><dd>${t.effectiveCfm} CFM</dd></div><div><dt>Pressão</dt><dd>${esc(t.pressure)} (${t.pressureDelta>0?'+':''}${t.pressureDelta} CFM)</dd></div><div><dt>Filtro</dt><dd>${esc(t.labels.filter)}</dd></div><div><dt>Radiador</dt><dd>${esc(t.labels.radiator)}</dd></div><div><dt>Risco de poeira</dt><dd>${t.dustRisk}%</dd></div></dl><p>${esc((t.warnings[0]||t.info[0]||'Fluxo de ar equilibrado para a carga selecionada.'))}</p>`;}
    const panelButton=$('#hwCasePanel');if(panelButton){panelButton.textContent=CASE_API?.panelLabel?.(e.parts.cs,state.caseSidePanel)||'Painel lateral';panelButton.classList.toggle('active',state.caseSidePanel!=='closed');panelButton.disabled=e.parts.cs.sidePanel==='open';}
    const monitors=activeMonitorItems(e);$('#hwPeripheralSummary').innerHTML=`<strong>Estação completa</strong><p>${esc(layoutMonitorDescription(e))}</p><p>${monitors.map(item=>esc(item.label)).join(' • ')}</p><p>${esc(e.parts.keyboard.label)} • ${esc(e.parts.mouse.label)} • ${esc(e.parts.audio.label)}</p><p>${esc(e.parts.webcam.label)} • ${esc(e.parts.printer.label)} • ${esc(e.parts.controller.label)}</p>`;const monitorSetup=$('#hwMonitorSetup');if(monitorSetup){monitorSetup.dataset.count=String(monitors.length);monitorSetup.innerHTML=`<header><div><span>CONFIGURAÇÃO MULTITELA</span><strong>${esc(layoutMonitorDescription(e))}</strong></div><b>${monitors.length}×</b></header><div>${monitors.map((item,index)=>`<article><span>Tela ${index+1}</span><strong>${esc(item.label)}</strong><small>${item.res.join(' × ')} • ${item.refresh} Hz • ${esc(item.panel)}</small></article>`).join('')}</div><p>${layout.summary.monitors>=3?'Bancada ampliada e distância de câmera ajustada para o conjunto triplo.':'O motor físico mantém telas, suporte, webcam e periféricos sem sobreposição.'}</p>`;}const second=$('#hw_monitor2'),third=$('#hw_monitor3');if(second)second.disabled=state.monitorCount<2;if(third)third.disabled=state.monitorCount<3;
    const studioSummary=$('#hwStudioSummary');if(studioSummary)studioSummary.innerHTML=`<strong>Studio e gabinete</strong><p>${esc(e.parts.cs.caseClass||e.parts.cs.generation)} • ${esc(CASE_API?.dimensionsText?.(e.parts.cs)||'')}</p><p>${esc(STUDIO_BACKDROPS[state.backdrop])} • ${esc(DESK_FINISHES[state.deskFinish])}</p><p>Ambiente ${esc(AMBIENT_PRESETS[state.ambientPreset])} • ${esc(CASE_FINISHES[state.caseFinish])} • ${esc(GLASS_STYLES[state.glassStyle])}</p><p>Ferramentas ${esc(TOOL_LEVELS[state.toolkit])} • RGB ${esc(RGB_INTENSITIES[state.rgbIntensity])} • Destaque ${esc(ACCENT_COLORS[state.accentColor])}</p><p>Módulo v${MODULE_VERSION} • ${moduleDate()}</p>`;
    const layoutBox=$('#hwLayoutSafety');if(layoutBox){layoutBox.dataset.status=layout.safe?'safe':'error';const notes=[...layout.errors,...layout.warnings].slice(0,6);layoutBox.innerHTML=`<header><div><span>SEGURANÇA FÍSICA DO SETUP</span><strong>${esc(layout.status)}</strong></div><b>${layout.safe?'OK':'REVISAR'}</b></header><dl><div><dt>Bancada</dt><dd>${layout.summary.deskWidth.toFixed(1)} × ${layout.summary.deskDepth.toFixed(1)} u</dd></div><div><dt>Telas</dt><dd>${layout.summary.monitors||0}</dd></div><div><dt>Objetos</dt><dd>${layout.summary.objects}</dd></div><div><dt>Colisões</dt><dd>${layout.summary.collisions}</dd></div><div><dt>Sem apoio</dt><dd>${layout.summary.unsupported}</dd></div><div><dt>Fora da área</dt><dd>${layout.summary.outOfBounds}</dd></div><div><dt>Câmera segura</dt><dd>${layout.camera.minDistance.toFixed(1)}–${layout.camera.maxDistance.toFixed(1)} u</dd></div></dl><p>${esc(notes[0]||'Todos os objetos estão apoiados, dentro da bancada e sem sobreposição.')}</p>`;}
    const graphicsBox=$('#hwGraphicsPanel');if(graphicsBox){const profile=MATERIAL_API?.profile?.(state.labGraphics)||{},stats=MATERIAL_API?.stats?.(state.labGraphics)||{};graphicsBox.dataset.quality=state.labGraphics;graphicsBox.innerHTML=`<header><div><span>PIPELINE GRÁFICO PBR</span><strong>${esc(profile.label||state.labGraphics)} • Hardware ${MODULE_VERSION}</strong></div><b>${profile.physical?'FÍSICO':'PADRÃO'}</b></header><dl><div><dt>Texturas</dt><dd>${state.materialDetail&&profile.textures?`${profile.textureSize}px procedurais`:'Simplificadas'}</dd></div><div><dt>Sombras</dt><dd>${profile.shadowMap?`${profile.shadowMap}px`:'Desligadas'}</dd></div><div><dt>Reflexos</dt><dd>${stats.environmentMaps?'Environment map':'Simplificados'}</dd></div><div><dt>Vidro</dt><dd>${esc(GLASS_STYLES[state.glassStyle])}</dd></div><div><dt>Acabamento</dt><dd>${esc(CASE_FINISHES[state.caseFinish])}</dd></div><div><dt>Draw calls</dt><dd id="hwDrawCalls">${three?.renderer?.info?.render?.calls||0}</dd></div><div><dt>Triângulos</dt><dd id="hwTriangles">${(three?.renderer?.info?.render?.triangles||0).toLocaleString('pt-BR')}</dd></div><div><dt>Texturas ativas</dt><dd id="hwTextureCount">${stats.createdTextures||0}</dd></div><div><dt>Materiais criados</dt><dd id="hwMaterialCount">${stats.createdMaterials||0}</dd></div></dl><p>${state.labGraphics==='ultra'?'Ultra ativa vidro físico, luz de apresentação, texturas maiores, glow RGB e sombras de contato.':state.labGraphics==='high'?'Alto mantém PBR, texturas procedurais e sombras otimizadas.':'Médio prioriza estabilidade com materiais simplificados.'}</p>`;}
    const osSelect=$('#hw_systemOs');if(osSelect)osSelect.value=state.system.os;const levelSelect=$('#hw_incidentLevel');if(levelSelect)levelSelect.value=state.benchmarkIncident.level;const envSelect=$('#hw_incidentEnvironment');if(envSelect)envSelect.value=state.benchmarkIncident.environment;const protectionSelect=$('#hw_incidentProtection');if(protectionSelect)protectionSelect.value=state.benchmarkIncident.protection;
    renderIncidentPanel();renderPcScreen(e);updateSceneState();
  }

  function renderLog(){const box=$('#hwLog');if(!box)return;box.innerHTML=state.logs.length?state.logs.slice(-40).map(item=>`<p class="${esc(item.tone)}"><time>${new Date(item.time).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</time> ${esc(item.text)}</p>`).join(''):'<p>Console técnico pronto.</p>';box.scrollTop=box.scrollHeight;}
  function log(text,tone=''){state.logs.push({time:new Date().toISOString(),text:String(text),tone});state.logs=state.logs.slice(-160);renderLog();}
  function persist(){if(ctx&&state)return ctx.storage.set(KEY,state);}
  function wait(ms){return new Promise(resolve=>{const id=setTimeout(()=>{timers.delete(id);resolve();},ms);timers.add(id);});}
  function clearTimers(){for(const id of timers)clearTimeout(id);timers.clear();busy=false;}

  function freshAssembly({enabled=state?.assembly?.enabled||false,prepared=false}={}){
    return ASSEMBLY_API?.normalizeAssembly?ASSEMBLY_API.normalizeAssembly({enabled,prepared,placed:Object.fromEntries(ASSEMBLY_PARTS.map(key=>[key,true]))}):clone(defaults.assembly);
  }

  function resetAssemblyForConfiguration(){
    state.assembly=freshAssembly({enabled:state.assembly?.enabled||false,prepared:false});
    assemblyEngine?.applyState();
  }

  function prepareManualAssembly(){
    if(FAMILY_API?.supportsManualAssembly&&!FAMILY_API.supportsManualAssembly(state.family)){ctx.toast?.('Esta família utiliza manutenção compacta guiada e inspeção 360°, sem montagem livre de gabinete.','warning');return;}
    if(state.labGraphics==='low'){
      state.labGraphics='medium';
      ctx.toast?.('A montagem manual usa WebGL. Qualidade Média ativada.','info');
    }
    state.exploded=false;state.autorotate=false;state.assembly=freshAssembly({enabled:true,prepared:true});
    for(const key of activeAssemblyParts())state.assembly.placed[key]=false;
    renderPanels();startRenderer(state.labGraphics!=='low');
    setTimeout(()=>{assemblyEngine?.applyState();renderPanels();persist();},80);
    log('Bancada manual preparada com as peças separadas.','info');
    if(select('cases','case').sidePanel!=='open'&&state.caseSidePanel==='closed'){log('Abra ou remova o painel lateral antes de começar os encaixes.','warning');ctx.toast?.('Abra ou remova o painel lateral para acessar o interior do gabinete.','warning');}
    ctx.logEvent?.({type:'hardware-assembly',action:'prepare',detail:{parts:activeAssemblyParts()}});
  }

  function toggleManualAssembly(){
    if(FAMILY_API?.supportsManualAssembly&&!FAMILY_API.supportsManualAssembly(state.family)){ctx.toast?.('Esta família utiliza manutenção compacta guiada e inspeção 360°, sem montagem livre de gabinete.','warning');return;}
    if(!state.assembly.enabled){prepareManualAssembly();return;}
    state.assembly.enabled=false;state.assembly.prepared=false;state.exploded=false;
    assemblyEngine?.setEnabled(false);renderPanels();persist();
    log('Montagem manual encerrada. O computador voltou à posição de inspeção.','warning');
    ctx.logEvent?.({type:'hardware-assembly',action:'disable'});
  }

  function assemblyAction(action){
    if(!assemblyEngine){ctx.toast?.('A cena 3D ainda está sendo preparada.','warning');return;}
    if(action==='undo'&&!assemblyEngine.undo())ctx.toast?.('Não há ação para desfazer.','info');
    if(action==='redo'&&!assemblyEngine.redo())ctx.toast?.('Não há ação para refazer.','info');
    if(action==='reset')assemblyEngine.reset();
    if(action==='snap')assemblyEngine.snap(state.selectedPart);
    if(action==='rotateLeft')assemblyEngine.rotate(state.selectedPart,-1);
    if(action==='rotateRight')assemblyEngine.rotate(state.selectedPart,1);
    renderPanels();persist();
  }

  function constrainAssemblyPosition(key,desired){
    const g=three?.caseGeometry;if(!g)return desired;
    desired.x=clamp(desired.x,-9,g.width/2+3.2);
    desired.y=clamp(desired.y,-g.height/2-.15,g.height/2+1.25);
    desired.z=clamp(desired.z,-g.depth/2-1.3,g.depth/2+1.3);
    return desired;
  }

  function caseExternalCollision(key,group){
    const cs=select('cases','case'),g=three?.caseGeometry;if(!g||cs.sidePanel==='open'||state.caseSidePanel!=='closed')return false;
    const p=group.position;
    return Math.abs(p.x)<=g.width/2+.18&&Math.abs(p.y)<=g.height/2+.18&&Math.abs(p.z)<=g.depth/2+.18;
  }

  function setupAssemblyEngine(){
    assemblyEngine?.destroy?.();assemblyEngine=null;
    if(!three||!ASSEMBLY_API?.create)return;
    assemblyEngine=ASSEMBLY_API.create({THREE,canvas:$('#hardwareCanvas3d'),camera:three.camera,root:three.contentRoot,partGroups:three.partGroups,state,activeParts:activeAssemblyParts,validate:validateAssemblyPart,constrain:constrainAssemblyPosition,externalCollision:caseExternalCollision,
      onSelect:key=>{state.selectedPart=key;renderPanels();highlightSelected();},
      onMessage:(message,tone)=>{log(message,tone);if(tone==='error'||tone==='warning')ctx.toast?.(message,tone);},
      onChange:event=>{
        if(event.key==='ram')state.ramSeated=event.placed!==false;
        if(event.key==='cooler')state.coolerMounted=event.placed!==false;
        renderPanels();persist();
        ctx.logEvent?.({type:'hardware-assembly',action:event.type,detail:{part:event.key||null,partLabel:event.key?ASSEMBLY_LABELS[event.key]:null,attempts:state.assembly.attempts,successful:state.assembly.successful,invalid:state.assembly.invalid,progress:assemblyEngine?.progress?.()}});
      }
    });
  }

  function applyPreset(id){
    const preset=presets[id];if(!preset)return;
    Object.assign(state,preset,thermalPresets[id]||{},visualPresets[id]||{},defaultConnections,{preset:id,family:PRESET_FAMILIES[id]||state.family,scenario:'standard',state:'off',system:SYSTEM_API?.normalize?.({...defaults.system,os:state.system?.os||'windows11',installed:state.system?.installed!==false})||clone(defaults.system),benchmarkIncident:INCIDENT_API?.normalize?.(defaults.benchmarkIncident)||clone(defaults.benchmarkIncident),benchmarkResults:null,diagnosticResults:[]});
    state.caseSidePanel=CASE_API?.normalizePanel?.(parts.cases[state.case],'closed')||'closed';
    resetAssemblyForConfiguration();
    refreshControls();renderPanels();scheduleSceneRebuild();persist();ctx.toast?.(`Perfil aplicado: ${preset.label}.`,'success');
  }

  function applyFamily(id){
    const family=FAMILY_API?.profile?.(id);if(!family)return;
    const baseId=family.preset,patch=FAMILY_API.patch(id,presets),thermal=thermalPresets[baseId]||thermalPresets.school,visual=visualPresets[baseId]||visualPresets.school;
    exitInspection(false);CINEMATIC_API?.stop?.(state.cinematic);
    Object.assign(state,patch,thermal,visual,defaultConnections,{family:id,preset:baseId||'custom',scenario:'standard',state:'off',system:SYSTEM_API?.normalize?.({...defaults.system,os:state.system?.os||'windows11',installed:state.system?.installed!==false})||clone(defaults.system),benchmarkIncident:INCIDENT_API?.normalize?.(defaults.benchmarkIncident)||clone(defaults.benchmarkIncident),benchmarkResults:null,diagnosticResults:[]});
    state.caseSidePanel=family.manualAssembly===false?'removed':(CASE_API?.normalizePanel?.(parts.cases[state.case],'closed')||'closed');
    state.assembly.enabled=false;state.assembly.prepared=false;resetAssemblyForConfiguration();
    refreshControls();renderPanels();scheduleSceneRebuild();persist();log(`Família selecionada: ${family.label}.`,'success');ctx.toast?.(`Família aplicada: ${family.label}.`,'success');
  }

  function repairBuild(){
    if(state.mode==='challenge'){ctx.toast?.('A correção automática fica bloqueada no modo Desafio.','warning');return;}
    const cpu=select('cpus','cpu');
    const matchingBoards=Object.entries(parts.boards).filter(([,item])=>item.socket===cpu.socket);
    if(!matchingBoards.some(([id])=>id===state.board))state.board=matchingBoards[0]?.[0]||defaults.board;
    const board=select('boards','board');
    const compatibleRam=Object.entries(parts.ram).filter(([,item])=>item.type===board.ram&&item.sticks<=board.slots).sort((a,b)=>b[1].capacity-a[1].capacity);
    if(select('ram','ram').type!==board.ram||select('ram','ram').sticks>board.slots)state.ram=compatibleRam.find(([,item])=>item.capacity<=32)?.[0]||compatibleRam.at(-1)?.[0]||defaults.ram;
    if(!select('cases','case').formats.includes(board.format))state.case=Object.entries(parts.cases).find(([,item])=>item.formats.includes(board.format))?.[0]||'openbench';
    if(select('gpus','gpu').length>select('cases','case').gpuMax)state.case='openbench';
    state.caseSidePanel=CASE_API?.normalizePanel?.(parts.cases[state.case],'closed')||'closed';
    state.cooler=cpu.tdp>220?'custom':cpu.tdp>150?'aio360':cpu.tdp>95?'dualtower':cpu.tdp>65?'tower':'stock';
    const minimum=Math.max(evaluate().recommended,select('gpus','gpu').tdp>400?1000:450);
    state.psu=Object.entries(parts.psus).find(([,item])=>item.watts>=minimum&&item.pcie>=select('gpus','gpu').connectors)?.[0]||'p1200';
    state.fans=Math.max(state.fans,cpu.tdp+select('gpus','gpu').tdp>350?6:3);state.fanProfile='positive';state.fanSpeed='auto';state.filterCondition='clean';state.workload='study';state.radiatorPosition='auto';
    Object.assign(state,defaultConnections,{preset:'custom',scenario:'standard',state:'off'});
    resetAssemblyForConfiguration();
    refreshControls();renderPanels();scheduleSceneRebuild();persist();log('Assistente aplicou uma configuração compatível para estudo.','success');ctx.toast?.('Configuração corrigida. Revise as mudanças.','success');
  }

  function applyScenario(id){
    Object.assign(state,defaultConnections,{scenario:id,state:'off',preset:'custom'});
    if(id==='ram')state.ramSeated=false;
    if(id==='power')state.cpuPower=false;
    if(id==='gpu')Object.assign(state,{gpu:'rtx5090',case:'mini_itx',caseSidePanel:'closed',psu:'p550',gpuPower:false});
    if(id==='thermal')Object.assign(state,{cpu:'i9_14900k',gpu:'rtx5090',cooler:'stock',fans:1,fanProfile:'negative',fanSpeed:'quiet',filterCondition:'clogged',workload:'stress',ambientTemperature:32,cpuPaste:false});
    if(id==='storage')Object.assign(state,{storage:'sata_1tb',storageData:false,storagePower:false});
    if(id==='socket')Object.assign(state,{board:'asus_b550',cpu:'r5_7600',ram:'d5_16_5600'});
    if(id==='peripherals')Object.assign(state,{monitorCable:false,peripheralsPower:false,keyboard:'none',mouse:'none'});
    if(id==='maintenance')Object.assign(state,{mode:'maintenance',storage:'hdd_4tb',fans:1,cpuPaste:false,ramSeated:false,cableManagement:'basic'});
    resetAssemblyForConfiguration();
    refreshControls();renderPanels();scheduleSceneRebuild();persist();ctx.toast?.(`Cenário aplicado: ${id}.`,'info');
  }

  async function runAssemblyDemo(){
    if(busy)return;busy=true;state.tab='build';state.exploded=true;renderPanels();updateSceneState();persist();
    const sequence=[
      ['case','Preparando gabinete, bancada e iluminação do studio.'],
      ['board','Fixando placa-mãe e alinhando espaçadores.'],
      ['cpu','Posicionando processador e travando o socket.'],
      ['ram','Encaixando módulos de memória.'],
      ['storage','Instalando armazenamento principal e secundário.'],
      ['cooler','Aplicando pasta térmica e montando o sistema de refrigeração.'],
      ['gpu','Instalando placa de vídeo e suporte estrutural.'],
      ['psu','Organizando fonte, cabos e gerenciamento interno.'],
      ['monitor','Finalizando setup com monitor, periféricos e acessórios.']
    ];
    log('Sequência guiada de montagem iniciada.','info');
    for(const [part,message] of sequence){
      state.selectedPart=part;
      if(state.assemblyGuide)renderPanels();
      updateSceneState();
      log(message,'info');
      await wait(state.assemblyGuide?420:180);
    }
    Object.assign(state,defaultConnections,{state:'off',exploded:false});
    state.assembly=freshAssembly({enabled:false,prepared:false});assemblyEngine?.applyState();
    busy=false;renderPanels();persist();log('Montagem assistida concluída. Agora você pode ligar, testar e comparar o setup.','success');
  }

  function syncPowerState(){
    const phase=state.system?.phase||'off';state.state=phase==='post'?'post':['desktop','benchmark','warning','throttling'].includes(phase)?'ready':phase==='error'?'error':'off';
  }

  async function completeBoot(){
    SYSTEM_API?.beginBoot?.(state.system);syncPowerState();renderPanels();persist();
    while(state.system.phase==='boot'){await wait(180);SYSTEM_API?.bootTick?.(state.system,14);renderPanels();}
    syncPowerState();state.score+=6;log(`${SYSTEM_API?.OS_PROFILES?.[state.system.os]?.short||'Sistema'} iniciado. Área de trabalho disponível.`,'success');renderPanels();persist();
  }

  async function powerOn(){
    if(busy||state.benchmarkRunning)return;busy=true;SYSTEM_API?.beginPost?.(state.system);syncPowerState();state.tests++;log('Energia aplicada. Iniciando POST detalhado…','info');renderPanels();persist();
    for(let index=0;index<(SYSTEM_API?.POST_STEPS?.length||0);index++){
      const step=SYSTEM_API.POST_STEPS[index];state.system.postIndex=index;state.system.progress=Math.round(index/SYSTEM_API.POST_STEPS.length*100);state.system.message=step.label;log(`POST: ${step.label}…`);renderPanels();await wait(Math.min(420,step.duration||300));
    }
    const e=evaluate();if(!e.ok){state.system.phase='error';state.system.error=e.errors[0]||'Falha de montagem.';syncPowerState();state.score+=2;log(`POST interrompido: ${state.system.error}`,'error');busy=false;renderPanels();persist();return;}
    state.system.phase='firmware';state.system.progress=100;state.system.message='POST concluído. Firmware e unidade de boot validados.';state.score+=Math.max(10,Math.round(e.readiness/5));log('POST concluído: hardware validado.','success');renderPanels();persist();
    if(state.system.installed)await completeBoot();else{log('Nenhum sistema instalado. Use “Instalar/reinstalar sistema”.','warning');ctx.toast?.('POST concluído. Instale o sistema operacional para iniciar.','info');}
    busy=false;renderPanels();persist();
  }

  async function installSystem(){
    if(busy||state.benchmarkRunning)return;const e=evaluate();if(!e.ok){ctx.toast?.('Corrija a montagem antes de instalar o sistema.','warning');return;}busy=true;state.system.os=$('#hw_systemOs')?.value||state.system.os;SYSTEM_API?.beginInstall?.(state.system);syncPowerState();log(`${SYSTEM_API?.OS_PROFILES?.[state.system.os]?.label||'Sistema'}: instalação iniciada.`,'info');renderPanels();
    while(state.system.phase==='install'){await wait(180);const result=SYSTEM_API?.installTick?.(state.system,9);renderPanels();if(result?.done)break;}
    log('Instalação concluída. Reiniciando o computador.','success');await wait(280);await completeBoot();busy=false;renderPanels();persist();
  }

  function decideBenchmark(choice){
    if(!state.benchmarkIncident?.awaitingDecision)return;state.benchmarkIncident.awaitingDecision=false;state.benchmarkIncident.warningAcknowledged=true;state.benchmarkIncident.continuedAfterWarning=choice==='continue';INCIDENT_API?.event?.(state.benchmarkIncident,'decisão do usuário',{choice});renderIncidentPanel();persist();const resolve=benchmarkDecisionResolve;benchmarkDecisionResolve=null;resolve?.(choice);
  }

  async function requestBenchmarkDecision(snapshot){
    state.benchmarkIncident.awaitingDecision=true;state.system.phase='warning';state.system.message='Seu PC está superaquecendo. Deseja pausar ou continuar?';INCIDENT_API?.event?.(state.benchmarkIncident,'alerta térmico',{reason:snapshot.reason});renderPanels();persist();ctx.toast?.('Superaquecimento detectado. Pausar o benchmark é recomendado.','warning');return new Promise(resolve=>{benchmarkDecisionResolve=resolve;});
  }

  async function runBenchmark(){
    if(state.benchmarkRunning||busy)return;if(state.system.phase!=='desktop'){ctx.toast?.('Ligue o computador e aguarde o sistema operacional iniciar.','warning');return;}
    const token=++benchmarkRunToken;state.benchmarkRunning=true;state.tab='benchmark';state.benchmarkIncident=INCIDENT_API?.normalize?.({...state.benchmarkIncident,stage:'running',progress:0,elapsed:0,cpuTemp:0,gpuTemp:0,caseTemp:0,load:0,warningAcknowledged:false,continuedAfterWarning:false,awaitingDecision:false,extinguisherUsed:false,reason:'Benchmark iniciado.',events:[]})||state.benchmarkIncident;state.system.phase='benchmark';state.system.message='Renderização, CPU, GPU, memória e armazenamento sob carga.';syncPowerState();INCIDENT_API?.event?.(state.benchmarkIncident,'benchmark iniciado',{level:state.benchmarkIncident.level});renderPanels();log(`Benchmark ${INCIDENT_API?.STRESS_LEVELS?.[state.benchmarkIncident.level]?.label||''} iniciado.`,'info');
    const level=INCIDENT_API?.STRESS_LEVELS?.[state.benchmarkIncident.level]||{duration:9};const steps=Math.max(10,Math.round(level.duration));let cancelled=false,terminated=false;
    for(let index=1;index<=steps&&token===benchmarkRunToken;index++){
      await wait(300);const progress=index/steps,e=evaluate(),snapshot=INCIDENT_API?.predict?.({thermal:e.thermal,state,caseFront:e.parts.cs.frontPanel,level:state.benchmarkIncident.level,environment:state.benchmarkIncident.environment,protection:state.benchmarkIncident.protection,progress,warningAcknowledged:state.benchmarkIncident.warningAcknowledged,continuedAfterWarning:state.benchmarkIncident.continuedAfterWarning});
      INCIDENT_API?.applySnapshot?.(state.benchmarkIncident,snapshot,progress,index*.3);state.system.phase=snapshot.stage==='running'||snapshot.stage==='hot'?'benchmark':snapshot.stage;state.system.message=snapshot.reason;state.system.throttling=snapshot.stage==='throttling'?Math.round(clamp((snapshot.peak-94)*10,10,75)):0;syncPowerState();
      if(snapshot.shouldPrompt){const choice=await requestBenchmarkDecision(snapshot);if(choice!=='continue'){cancelled=true;state.benchmarkIncident.stage='cancelled';state.benchmarkIncident.reason='Benchmark pausado pelo usuário para proteger o computador.';INCIDENT_API?.event?.(state.benchmarkIncident,'benchmark pausado',{choice:'pause'});break;}log('Usuário optou por continuar o benchmark após o alerta.','warning');}
      if(snapshot.stage==='shutdown'){terminated=true;INCIDENT_API?.event?.(state.benchmarkIncident,'desligamento térmico',{reason:snapshot.reason});log('Proteção térmica acionada: computador desligado.','error');break;}
      if(snapshot.stage==='smoke'){state.system.phase='smoke';syncPowerState();INCIDENT_API?.event?.(state.benchmarkIncident,'fumaça',{reason:snapshot.reason});log('Fumaça virtual detectada. A simulação aguardará três segundos antes do princípio de incêndio.','error');renderPanels();await wait(3000);if(token!==benchmarkRunToken)break;state.benchmarkIncident.smokeSeconds=3;state.benchmarkIncident.stage='fire';state.benchmarkIncident.reason='Princípio de incêndio virtual após três segundos de fumaça.';state.system.phase='fire';state.system.message=state.benchmarkIncident.reason;syncPowerState();INCIDENT_API?.event?.(state.benchmarkIncident,'princípio de incêndio virtual',{reason:state.benchmarkIncident.reason});log('Princípio de incêndio virtual. Use o extintor na interface.','error');terminated=true;renderPanels();break;}
      if(snapshot.stage==='fire'){state.system.phase='fire';syncPowerState();INCIDENT_API?.event?.(state.benchmarkIncident,'princípio de incêndio virtual',{reason:snapshot.reason});log('Princípio de incêndio virtual. Use o extintor na interface.','error');terminated=true;renderPanels();break;}
      renderPanels();
    }
    if(cancelled){state.system.phase='desktop';state.system.message='Benchmark interrompido com segurança.';}
    else if(state.benchmarkIncident.stage==='fire'){/* aguarda extintor */}
    else if(terminated||state.benchmarkIncident.stage==='shutdown'){state.system.phase='shutdown';state.system.message='Desligamento de emergência por proteção térmica.';await wait(480);SYSTEM_API?.finishShutdown?.(state.system);}
    else{const result=benchmarkSuite();result.thermal={level:state.benchmarkIncident.level,environment:state.benchmarkIncident.environment,protection:state.benchmarkIncident.protection,peakCpu:state.benchmarkIncident.cpuTemp,peakGpu:state.benchmarkIncident.gpuTemp,stage:state.benchmarkIncident.stage};state.benchmarkResults=result;state.benchmarkHistory.push(result);state.benchmarkHistory=state.benchmarkHistory.slice(-12);state.tests++;state.score+=Math.max(5,Math.round(result.overall/10));state.benchmarkIncident.stage='completed';state.benchmarkIncident.reason=`Benchmark concluído. Pico: CPU ${state.benchmarkIncident.cpuTemp} °C / GPU ${state.benchmarkIncident.gpuTemp} °C.`;INCIDENT_API?.event?.(state.benchmarkIncident,'benchmark concluído',{reason:state.benchmarkIncident.reason});state.system.phase='desktop';state.system.message='Benchmark concluído. Sistema estável.';log(`Benchmark concluído: ${result.overall}/100.`,'success');}
    state.benchmarkRunning=false;syncPowerState();renderPanels();persist();
  }

  function useExtinguisher(){
    if(state.benchmarkIncident?.stage!=='fire')return;INCIDENT_API?.extinguish?.(state.benchmarkIncident);state.system.phase='extinguished';state.system.message='Incidente virtual contido. Computador isolado e indisponível.';state.benchmarkRunning=false;benchmarkRunToken++;syncPowerState();log('Extintor virtual utilizado. Incidente contido; realize diagnóstico e manutenção.','success');ctx.toast?.('Incidente virtual contido. O computador permanece desligado.','success');renderPanels();persist();
  }

  async function shutdownSystem(){
    benchmarkRunToken++;if(benchmarkDecisionResolve){benchmarkDecisionResolve('pause');benchmarkDecisionResolve=null;}state.benchmarkRunning=false;clearTimers();SYSTEM_API?.shutdown?.(state.system,'Desligamento solicitado pelo usuário.');syncPowerState();log('Desligamento seguro iniciado.','warning');renderPanels();await wait(260);SYSTEM_API?.finishShutdown?.(state.system);state.benchmarkIncident.awaitingDecision=false;syncPowerState();renderPanels();persist();
  }

  function diagnosticOutcome(id){
    const e=evaluate(),outcomes={
      post:{label:'POST',ok:e.ok,detail:e.ok?'Inicialização completa.':e.errors[0]||'Falha de montagem.'},
      cpu:{label:'CPU',ok:e.parts.board.socket===e.parts.cpu.socket&&state.cpuPower&&state.coolerMounted,detail:`${e.parts.cpu.label} • ${e.temperature} °C estimados`},
      memory:{label:'Memória',ok:e.parts.board.ram===e.parts.ram.type&&e.parts.ram.sticks<=e.parts.board.slots&&state.ramSeated,detail:`${e.parts.ram.capacity} GB ${e.parts.ram.type}`},
      gpu:{label:'GPU',ok:(state.gpu==='integrated'?e.parts.cpu.igpu:true)&&e.parts.gpu.length<=e.parts.cs.gpuMax&&(!e.parts.gpu.requiresCable||state.gpuPower),detail:`${e.parts.gpu.label} • ${e.parts.gpu.vram} GB`},
      storage:{label:'Armazenamento',ok:e.parts.storage.boot&&(!e.parts.storage.needsData||state.storageData)&&(!e.parts.storage.needsPower||state.storagePower),detail:`${e.parts.storage.label} • I/O ${e.parts.storage.io}/100`},
      thermal:{label:'Térmico',ok:e.thermal.hottestTemperature<88&&e.parts.cooler.capacity>=e.parts.cpu.tdp&&state.cpuPaste&&e.thermal.radiatorValid,detail:`CPU ${e.thermal.cpuTemperature} °C • GPU ${e.thermal.gpuTemperature} °C • ${e.thermal.pressure}`},
      io:{label:'Entrada e saída',ok:state.keyboard!=='none'&&state.mouse!=='none'&&state.monitor!=='none'&&state.monitorCable&&state.peripheralsPower,detail:`${e.parts.monitor.label} • ${e.parts.keyboard.label}`},
      network:{label:'Rede',ok:state.nic!=='none',detail:`${e.parts.nic.label} • ${e.parts.nic.speed} Gb/s`}
    };
    return outcomes[id]||outcomes.post;
  }

  async function runDiagnostic(id){
    if(busy)return;busy=true;const ids=id==='full'?['post','cpu','memory','gpu','storage','thermal','io','network']:[id];
    for(const testId of ids){log(`Executando teste: ${testId}…`,'info');await wait(330);const result={...diagnosticOutcome(testId),time:new Date().toISOString()};state.diagnosticResults.push(result);log(`${result.label}: ${result.ok?'aprovado':'falha'} — ${result.detail}`,result.ok?'success':'error');}
    state.diagnosticResults=state.diagnosticResults.slice(-12);state.tests+=ids.length;state.score+=ids.filter(testId=>diagnosticOutcome(testId).ok).length*3;busy=false;renderPanels();persist();
  }

  function syncFromControls(event){
    const el=event?.target;if(!el?.id?.startsWith('hw_'))return;
    if(el.id==='hw_inspectionTarget'){state.inspection.target=el.value;renderInspectionPanel();persist();return;}
    if(el.id==='hw_inspectionZoom'){state.inspection.zoom=Number(el.value);if(state.inspection.active){if(state.labGraphics==='low')drawLow();else rebuildInspectionScene();}renderInspectionPanel();persist();return;}
    if(el.id==='hw_cinematicSpeed'){state.cinematic.speed=el.value;renderCinematicPanel();persist();return;}
    if(el.id==='hw_cinematicLoop'){state.cinematic.loop=el.checked;renderCinematicPanel();persist();return;}
    if(el.id==='hw_cinematicHideUi'){state.cinematic.hideUi=el.checked;renderCinematicPanel();persist();return;}
    if(el.id==='hw_systemOs'){state.system.os=el.value;state.system.installed=false;state.system.phase='firmware';state.system.progress=0;renderPanels();persist();log(`Sistema selecionado: ${SYSTEM_API?.OS_PROFILES?.[el.value]?.label||el.value}. Instalação necessária.`,'info');return;}
    if(el.id==='hw_incidentLevel'){state.benchmarkIncident.level=el.value;renderIncidentPanel();persist();return;}
    if(el.id==='hw_incidentEnvironment'){state.benchmarkIncident.environment=el.value;renderIncidentPanel();persist();return;}
    if(el.id==='hw_incidentProtection'){state.benchmarkIncident.protection=el.value;renderIncidentPanel();persist();return;}
    const key=el.id.slice(3);if(!(key in state))return;
    state[key]=el.type==='checkbox'?el.checked:el.type==='range'?Number(el.value):el.value;
    if(['monitorCount','monitorLayout','monitorMount'].includes(key))Object.assign(state,PERIPHERAL_API?.normalize?.(state)||{});
    if(key==='monitor'&&state.monitor==='none'){state.monitorCount=1;state.monitor2='none';state.monitor3='none';}
    if(key==='case'){state.caseSidePanel=CASE_API?.normalizePanel?.(parts.cases[state.case],'closed')||'closed';log(`Gabinete alterado para ${parts.cases[state.case].label}. Painel lateral redefinido.`,'info');}
    const structural=['case','board','cpu','ram','gpu','storage','storage2','psu','cooler'];
    if(['case','caseColor','caseFinish','glassStyle','rgbIntensity','materialDetail','contactShadows','board','cpu','ram','gpu','storage','storage2','psu','cooler','nic','monitor','monitor2','monitor3','monitorCount','monitorLayout','monitorMount','keyboard','mouse','audio','webcam','printer','controller','ups','fans','fanProfile','fanSpeed','filterCondition','workload','ambientTemperature','radiatorPosition','thermalOverlay','lighting','cableManagement','backdrop','deskFinish','ambientPreset','toolkit','accentColor','showProps','assemblyGuide','caseStructureVisible'].includes(key))state.preset='custom';
    if(structural.includes(key)&&state.assembly?.prepared){resetAssemblyForConfiguration();log('A seleção de componentes mudou; a bancada manual foi reiniciada.','warning');}
    renderPanels();persist();
    if(['case','caseColor','caseFinish','glassStyle','rgbIntensity','materialDetail','contactShadows','board','cpu','ram','gpu','storage','storage2','psu','cooler','monitor','monitor2','monitor3','monitorCount','monitorLayout','monitorMount','keyboard','mouse','audio','webcam','printer','controller','fans','fanProfile','fanSpeed','filterCondition','workload','ambientTemperature','radiatorPosition','thermalOverlay','lighting','cableManagement','backdrop','deskFinish','ambientPreset','toolkit','accentColor','showProps','caseStructureVisible'].includes(key))scheduleSceneRebuild();
  }

  function cycleCasePanel(){
    const cs=select('cases','case');
    const next=CASE_API?.nextPanel?.(cs,state.caseSidePanel)||'removed';
    if(next===state.caseSidePanel)return;
    state.caseSidePanel=next;
    const label=CASE_API?.panelLabel?.(cs,next)||next;
    log(`Painel lateral: ${label}.`,next==='closed'?'warning':'success');
    renderPanels();scheduleSceneRebuild();persist();
  }

  function inspectionSource(target){if(!three)return null;if(target==='family')return three.partGroups.family||three.partGroups.case;return three.partGroups[target]||(['keyboard','mouse','audio','webcam','controller'].includes(target)?three.partGroups.peripherals:null);}
  function rebuildInspectionScene(){
    if(!three||!state.inspection.active)return;if(three.inspectionRoot){three.scene.remove(three.inspectionRoot);INSPECTION_API?.dispose?.(three.inspectionRoot);three.inspectionRoot=null;}
    const source=inspectionSource(state.inspection.target);if(!source){state.inspection.active=false;ctx.toast?.('O item selecionado não está disponível neste setup.','warning');return;}
    const prepared=INSPECTION_API?.prepare?.({THREE,source,maxSize:6.4});if(!prepared)return;
    three.inspectionPrepared=prepared;three.inspectionRoot=prepared.root;three.scene.add(prepared.root);if(three.contentRoot)three.contentRoot.visible=false;INSPECTION_API.applyExploded(prepared,state.inspection.exploded?1.15:0);
    const camera=INSPECTION_API.camera(state.inspection.view,prepared.size,state.inspection.zoom);state.inspection.distance=camera.distance;state.cameraYaw=camera.yaw;state.cameraPitch=camera.pitch;three.target.set(0,0,0);updateThreeCamera();
  }
  function enterInspection(target=state.inspection.target){
    state.inspection.target=target;state.inspection.active=true;state.cinematic.active=false;state.cinematic.playing=false;if(state.labGraphics==='low'){drawLow();}else rebuildInspectionScene();renderPanels();persist();log(`Inspeção 360° iniciada: ${INSPECTION_API?.TARGETS?.[target]?.label||target}.`,'info');
  }
  function exitInspection(render=true){if(!state?.inspection)return;state.inspection.active=false;if(three?.inspectionRoot){three.scene.remove(three.inspectionRoot);INSPECTION_API?.dispose?.(three.inspectionRoot);three.inspectionRoot=null;three.inspectionPrepared=null;}if(three?.contentRoot)three.contentRoot.visible=true;if(three?.setupLayout)three.target.set(...three.setupLayout.camera.target);if(render){renderPanels();updateThreeCamera();persist();}}
  function setInspectionView(view){if(!INSPECTION_API?.VIEWS?.[view])return;state.inspection.view=view;if(state.labGraphics==='low'){drawLow();}else rebuildInspectionScene();renderPanels();persist();}
  function toggleInspectionExploded(){state.inspection.exploded=!state.inspection.exploded;if(three?.inspectionPrepared)INSPECTION_API?.applyExploded?.(three.inspectionPrepared,state.inspection.exploded?1.15:0);renderPanels();persist();}
  function startCinema(){exitInspection(false);CINEMATIC_API?.start?.(state.cinematic);state.tab='cinema';renderPanels();persist();log('Modo cinema iniciado.','info');}
  function stopCinema(){CINEMATIC_API?.stop?.(state.cinematic);$('.hardware-studio')?.classList.remove('hardware-cinema-clean');if(three?.setupLayout)three.target.set(...three.setupLayout.camera.target);renderPanels();updateThreeCamera();persist();}

  function setView(view){
    const views={front:[0,.18,15],side:[Math.PI/2,.22,15],top:[0,1.18,17],iso:[-.72,.36,15]};const target=views[view]||views.iso;
    state.cameraYaw=target[0];state.cameraPitch=target[1];state.cameraDistance=target[2];updateThreeCamera();persist();
  }

  function setQuality(level){
    if(!GRAPHICS_LEVELS.includes(level)||state.labGraphics===level)return;state.labGraphics=level;persist();renderPanels();startRenderer(true);ctx.toast?.(`Qualidade do laboratório: ${{low:'Baixo',medium:'Médio',high:'Alto',ultra:'Ultra'}[level]}.`,'info');
  }

  function bindEvents(){
    root.addEventListener('input',syncFromControls);
    root.addEventListener('change',syncFromControls);
    root.addEventListener('click',event=>{
      const tab=event.target.closest('[data-hw-tab]');if(tab){state.tab=tab.dataset.hwTab;renderPanels();persist();return;}
      const family=event.target.closest('[data-hw-family]');if(family){applyFamily(family.dataset.hwFamily);return;}
      const preset=event.target.closest('[data-hw-preset]');if(preset){applyPreset(preset.dataset.hwPreset);return;}
      const scenario=event.target.closest('[data-hw-scenario]');if(scenario){applyScenario(scenario.dataset.hwScenario);return;}
      const test=event.target.closest('[data-hw-test]');if(test){runDiagnostic(test.dataset.hwTest);return;}
      const inspectView=event.target.closest('[data-hw-inspection-view]');if(inspectView){setInspectionView(inspectView.dataset.hwInspectionView);return;}
      const view=event.target.closest('[data-hw-view]');if(view){setView(view.dataset.hwView);return;}
      const quality=event.target.closest('[data-hw-quality]');if(quality){setQuality(quality.dataset.hwQuality);return;}
      const casePanel=event.target.closest('[data-hw-case-panel]');if(casePanel){cycleCasePanel();return;}
      const toggle=event.target.closest('[data-hw-toggle]');if(toggle){const key=toggle.dataset.hwToggle;state[key]=!state[key];renderPanels();updateSceneState();persist();return;}
      const part=event.target.closest('[data-hw-part]');if(part){state.selectedPart=part.dataset.hwPart;renderPanels();highlightSelected();persist();return;}
    });
    $('#hwEnterInspection')?.addEventListener('click',()=>enterInspection($('#hw_inspectionTarget')?.value||state.inspection.target));$('#hwExitInspection')?.addEventListener('click',()=>exitInspection());$('#hwInspectionExploded')?.addEventListener('click',toggleInspectionExploded);
    $('#hwCinemaStart')?.addEventListener('click',startCinema);$('#hwCinemaPause')?.addEventListener('click',()=>{CINEMATIC_API?.pause?.(state.cinematic);renderCinematicPanel();persist();});$('#hwCinemaPrev')?.addEventListener('click',()=>{CINEMATIC_API?.previous?.(state.cinematic);state.cinematic.active=true;renderCinematicPanel();persist();});$('#hwCinemaNext')?.addEventListener('click',()=>{CINEMATIC_API?.next?.(state.cinematic);state.cinematic.active=true;renderCinematicPanel();persist();});$('#hwCinemaStop')?.addEventListener('click',stopCinema);
    $('#hwPower').addEventListener('click',powerOn);$('#hwInstallSystem')?.addEventListener('click',installSystem);$('#hwAssemblyDemo')?.addEventListener('click',runAssemblyDemo);$('#hwRepair').addEventListener('click',repairBuild);$('#hwRunBenchmark').addEventListener('click',runBenchmark);$('#hwPauseBenchmark')?.addEventListener('click',()=>decideBenchmark('pause'));$('#hwContinueBenchmark')?.addEventListener('click',()=>decideBenchmark('continue'));$('#hwUseExtinguisher')?.addEventListener('click',useExtinguisher);
    $('#hwManualToggle')?.addEventListener('click',toggleManualAssembly);$('#hwPrepareAssembly')?.addEventListener('click',prepareManualAssembly);$('#hwSnapSelected')?.addEventListener('click',()=>assemblyAction('snap'));$('#hwRotateLeft')?.addEventListener('click',()=>assemblyAction('rotateLeft'));$('#hwRotateRight')?.addEventListener('click',()=>assemblyAction('rotateRight'));$('#hwUndoAssembly')?.addEventListener('click',()=>assemblyAction('undo'));$('#hwRedoAssembly')?.addEventListener('click',()=>assemblyAction('redo'));$('#hwResetAssembly')?.addEventListener('click',()=>assemblyAction('reset'));
    $('#hwShutdown').addEventListener('click',shutdownSystem);
  }

  function disposeObject(object){
    object?.traverse?.(node=>{node.geometry?.dispose?.();if(Array.isArray(node.material))node.material.forEach(material=>material.dispose?.());else node.material?.dispose?.();});
  }
  function destroyThree(){
    threeToken++;cancelAnimationFrame(threeRaf);threeRaf=0;assemblyEngine?.destroy?.();assemblyEngine=null;if(!three)return;three.cleanup?.();disposeObject(three.scene);three.renderer?.dispose?.();MATERIAL_API?.clear?.();three=null;
  }

  function createMaterial(color,options={}){
    const quality=state.labGraphics;
    const material=MATERIAL_API?.createMaterial?.({THREE,color,options,quality,renderer:three?.renderer,settings:{caseFinish:state.caseFinish,glassStyle:state.glassStyle,rgbIntensity:state.rgbIntensity,materialDetail:state.materialDetail}});
    if(material){material.userData.baseEmissive=material.emissive?.clone?.()||null;material.userData.baseIntensity=material.emissiveIntensity||0;return material;}
    const base={color,roughness:options.roughness??.48,metalness:options.metalness??.28,transparent:Boolean(options.transparent),opacity:options.opacity??1,emissive:options.emissive||0x000000,emissiveIntensity:options.emissiveIntensity||0};
    if(quality==='ultra'&&THREE.MeshPhysicalMaterial)return new THREE.MeshPhysicalMaterial({...base,clearcoat:options.clearcoat??.35,clearcoatRoughness:.25,transmission:options.transmission||0,thickness:options.thickness||0});
    return new THREE.MeshStandardMaterial(base);
  }
  function mesh(geometry,material,position=[0,0,0],rotation=[0,0,0]){const object=new THREE.Mesh(geometry,material);object.position.set(...position);object.rotation.set(...rotation);object.castShadow=state.labGraphics!=='medium';object.receiveShadow=true;return object;}
  function markPart(object,key){object.userData.partKey=key;object.traverse?.(child=>child.userData.partKey=key);return object;}
  function addBox(group,key,size,position,color,options={}){const object=mesh(new THREE.BoxGeometry(...size),createMaterial(color,options),position,options.rotation||[0,0,0]);markPart(object,key);group.add(object);return object;}
  function addCylinder(group,key,radius,height,position,color,options={}){const object=mesh(new THREE.CylinderGeometry(radius,radius,height,options.segments||24),createMaterial(color,options),position,options.rotation||[0,0,0]);markPart(object,key);group.add(object);return object;}

  function rgbColor(time,index=0){
    if(state.lighting==='off')return new THREE.Color(0x0b2030);
    if(state.lighting==='cyan')return new THREE.Color(0x2de2ff);
    if(state.lighting==='purple')return new THREE.Color(0x9f63ff);
    if(state.lighting==='red')return new THREE.Color(0xff3e5f);
    const color=new THREE.Color();color.setHSL(((time*.00008)+(index*.17))%1,.88,.58);return color;
  }

  function buildStudioEnvironment(rootGroup,e,layout){
    const studio=markPart(new THREE.Group(),'peripherals');
    rootGroup.add(studio);
    const accent=accentHex(),desk=layout.desk;
    addBox(studio,'peripherals',desk.size,desk.position,deskColor(),{preset:state.deskFinish==='wood'?'wood':state.deskFinish==='carbon'?'carbon':state.deskFinish==='white'?'glossyPlastic':'paintedMetal',metalness:(state.deskFinish==='metal'||state.deskFinish==='carbon')?.62:.28,roughness:state.deskFinish==='wood'?.74:.42});
    for(const support of layout.supports)addBox(studio,'peripherals',support.size,support.position,0x283442,{preset:'brushedMetal',metalness:.72,roughness:.34});
    addBox(studio,'peripherals',[Math.max(4,desk.size[0]-.9),.18,.5],[desk.position[0],layout.summary.floorY+.72,desk.position[2]-.15],0x1a2631,{preset:'paintedMetal',metalness:.68,roughness:.42});
    const backY=desk.topY+4.2,backZ=desk.back-.32;
    if(state.backdrop!=='bench')addBox(studio,'peripherals',[desk.size[0],8,.36],[desk.position[0],backY,backZ],state.backdrop==='showcase'?0x281737:state.backdrop==='classroom'?0x1c3551:0x09111d,{metalness:.18,roughness:.82});
    if(state.backdrop==='studio'||state.backdrop==='showcase'){
      addBox(studio,'peripherals',[Math.min(8.5,desk.size[0]*.52),.16,.16],[desk.position[0],backY+2.5,backZ+.25],accent,{emissive:accent,emissiveIntensity:.45,metalness:.3});
      addBox(studio,'peripherals',[.16,4.2,.16],[layout.desk.left+.55,backY,backZ+.25],accent,{emissive:accent,emissiveIntensity:.35,metalness:.3});
      addBox(studio,'peripherals',[.16,4.2,.16],[layout.desk.right-.55,backY,backZ+.25],accent,{emissive:accent,emissiveIntensity:.35,metalness:.3});
    }
    if(state.showProps){
      const pegX=layout.desk.left+1.8,pegY=desk.topY+2.1,pegZ=backZ+.24;
      addBox(studio,'peripherals',[3.3,2.35,.12],[pegX,pegY,pegZ],0x253746,{metalness:.45,roughness:.58});
      for(let row=0;row<5;row++)for(let col=0;col<7;col++)addCylinder(studio,'peripherals',.035,.12,[pegX-1.25+col*.42,pegY-.82+row*.42,pegZ+.09],0x6d8291,{rotation:[Math.PI/2,0,0],segments:10,metalness:.75});
      addBox(studio,'peripherals',[.16,1.55,.16],[pegX-.92,pegY,.2+pegZ],0xd0d7df,{metalness:.88});
      addBox(studio,'peripherals',[.22,1.35,.16],[pegX-.35,pegY+.1,.2+pegZ],0xd0d7df,{metalness:.88});
      addBox(studio,'peripherals',[.32,1.05,.18],[pegX+.3,pegY-.05,.2+pegZ],0xf59e0b,{metalness:.35});
      if(state.toolkit!=='compact')addBox(studio,'peripherals',[1.45,.65,.25],[pegX+.75,pegY-.62,.2+pegZ],0x111827,{metalness:.48});
      if(state.toolkit==='lab')addBox(studio,'peripherals',[2.4,.8,.55],[layout.desk.right-1.65,layout.summary.floorY+.42,desk.front-.75],0x0f172a,{metalness:.5});
    }
    return studio;
  }

  function addCurvedTube(group,key,points,color,radius=.07){
    const curve=new THREE.CatmullRomCurve3(points.map(point=>new THREE.Vector3(...point)));
    const tube=mesh(new THREE.TubeGeometry(curve,28,radius,10,false),createMaterial(color,{roughness:.42,metalness:.22}));
    markPart(tube,key);group.add(tube);return tube;
  }

  function addVentSlats(group,key,{axis='y',count=12,start=-2.5,step=.42,position=[0,0,0],length=4.8,color=0x1a2631,emissive=0}={}){
    for(let i=0;i<count;i++){
      const offset=start+i*step;
      const size=axis==='y'?[length,.055,.12]:[.055,length,.12];
      const pos=[position[0]+(axis==='y'?0:offset),position[1]+(axis==='y'?offset:0),position[2]];
      addBox(group,key,size,pos,color,{metalness:.58,roughness:.36,emissive,emissiveIntensity:emissive?.12:0});
    }
  }

  function addCaseFrame(group,key,g,color){
    const t=.16,frame=.24,h=g.height,w=g.width,d=g.depth;
    const bars=[
      [[frame,h,frame],[-w/2+frame/2,0,-d/2+frame/2]],[[frame,h,frame],[w/2-frame/2,0,-d/2+frame/2]],
      [[frame,h,frame],[-w/2+frame/2,0,d/2-frame/2]],[[frame,h,frame],[w/2-frame/2,0,d/2-frame/2]],
      [[w,frame,frame],[0,h/2-frame/2,-d/2+frame/2]],[[w,frame,frame],[0,-h/2+frame/2,-d/2+frame/2]],
      [[w,frame,frame],[0,h/2-frame/2,d/2-frame/2]],[[w,frame,frame],[0,-h/2+frame/2,d/2-frame/2]],
      [[frame,frame,d],[-w/2+frame/2,h/2-frame/2,0]],[[frame,frame,d],[w/2-frame/2,h/2-frame/2,0]],
      [[frame,frame,d],[-w/2+frame/2,-h/2+frame/2,0]],[[frame,frame,d],[w/2-frame/2,-h/2+frame/2,0]]
    ];
    for(const [size,pos] of bars)addBox(group,key,size,pos,color,{preset:'case',metalness:.72,roughness:.3});
    return t;
  }

  function addFrontPanel(caseGroup,e,g,shellColor){
    const cs=e.parts.cs,z=g.depth/2-.02,w=g.width-.32,h=g.height-.34,accent=accentHex();
    if(cs.frontPanel==='open')return;
    if(cs.frontPanel==='glass'){
      const panel=addBox(caseGroup,'case',[w,h,.13],[0,0,z],0x83b8d8,{preset:'glass',glass:true,transparent:true,opacity:state.labGraphics==='ultra'?.28:.18,roughness:.08,metalness:0,transmission:state.labGraphics==='ultra'?.62:.32});panel.castShadow=false;
      addVentSlats(caseGroup,'case',{axis:'y',count:11,start:-h*.4,step:h*.08,position:[-w/2+.2,0,z+.04],length:.18,color:accent,emissive:accent});
      addVentSlats(caseGroup,'case',{axis:'y',count:11,start:-h*.4,step:h*.08,position:[w/2-.2,0,z+.04],length:.18,color:accent,emissive:accent});
      return;
    }
    if(cs.frontPanel==='mesh'||cs.frontPanel==='perforated'||cs.frontPanel==='workstation'){
      addBox(caseGroup,'case',[w,h,.14],[0,0,z],0x15212c,{preset:'mesh',metalness:.66,roughness:.56});
      const count=cs.frontPanel==='workstation'?14:18;
      addVentSlats(caseGroup,'case',{axis:'y',count,start:-h*.42,step:h*.84/Math.max(1,count-1),position:[0,0,z+.09],length:w*.78,color:cs.frontPanel==='workstation'?0x314252:0x526575});
      if(cs.frontPanel==='workstation'){
        for(let i=0;i<3;i++)addBox(caseGroup,'case',[w*.68,.18,.12],[0,h*.28-i*.42,z+.12],0x0c131b,{metalness:.55});
      }
      return;
    }
    addBox(caseGroup,'case',[w,h,.16],[0,0,z],shellColor,{preset:'case',metalness:.58,roughness:cs.frontPanel==='solid'?.62:.42});
    if(cs.frontPanel==='side-intake'||cs.frontPanel==='solid'){
      const slotColor=cs.frontPanel==='solid'?0x2d3945:accent;
      for(const side of [-1,1])addVentSlats(caseGroup,'case',{axis:'y',count:12,start:-h*.4,step:h*.073,position:[side*(w/2-.14),0,z+.1],length:.16,color:slotColor,emissive:cs.frontPanel==='side-intake'?accent:0});
    }
    if(cs.frontPanel==='side-intake')addBox(caseGroup,'case',[w*.54,.12,.08],[0,h*.32,z+.13],accent,{emissive:accent,emissiveIntensity:.32,metalness:.28});
  }

  function addSidePanel(caseGroup,e,g){
    const cs=e.parts.cs;if(cs.sidePanel==='open')return null;
    const pivot=new THREE.Group();pivot.name='case-side-panel';markPart(pivot,'case');caseGroup.add(pivot);
    const x=g.width/2-.02,depth=g.depth-.36,height=g.height-.36;
    pivot.position.set(x,0,-g.depth/2+.18);
    const isGlass=cs.sidePanel==='tempered-glass';
    const panel=addBox(pivot,'case',[.13,height,depth],[0,0,depth/2],isGlass?0x91c7e8:new THREE.Color(COLORS[state.caseColor]||COLORS.black),isGlass?{preset:'glass',glass:true,transparent:state.glassStyle!=='opaque',opacity:state.glassStyle==='opaque'?1:state.labGraphics==='ultra'?.3:.2,roughness:state.glassStyle==='frosted'?.42:.08,metalness:0,transmission:state.glassStyle==='opaque'?0:state.labGraphics==='ultra'?.64:.34}:{preset:'case',metalness:.58,roughness:.52});
    panel.castShadow=!isGlass;
    if(cs.sidePanel==='vented-steel')addVentSlats(pivot,'case',{axis:'y',count:10,start:-height*.34,step:height*.075,position:[.08,0,depth*.55],length:depth*.52,color:0x495866});
    if(isGlass){
      for(const y of [-height/2+.18,height/2-.18])for(const z of [.2,depth-.2])addCylinder(pivot,'case',.07,.08,[.09,y,z],0xbfcbd5,{rotation:[0,0,Math.PI/2],metalness:.9});
    }
    const panelState=CASE_API?.normalizePanel?.(cs,state.caseSidePanel)||state.caseSidePanel;
    if(panelState==='open')pivot.rotation.y=cs.panelHinged?-Math.PI*.58:-Math.PI*.42;
    if(panelState==='removed'){pivot.position.set(x+2.15,.65,-g.depth/2+.25);pivot.rotation.set(.05,-.2,.08);}
    three.caseSidePanel=pivot;
    return pivot;
  }

  function addInternalStructure(caseGroup,e,g){
    if(!state.caseStructureVisible)return;
    const cs=e.parts.cs,innerColor=0x263543,accent=accentHex();
    const trayX=-g.width/2+.24;
    addBox(caseGroup,'case',[.1,g.height*.72,g.depth*.68],[trayX,0,-g.depth*.08],innerColor,{metalness:.64,roughness:.48});
    const standoffY=[-1.9,-.2,1.5],standoffZ=[-g.depth*.3,-g.depth*.02,g.depth*.25];
    for(const y of standoffY)for(const z of standoffZ)addCylinder(caseGroup,'case',.055,.15,[trayX+.1,y,z],0xd0a85a,{rotation:[0,0,Math.PI/2],metalness:.9});
    const shroudHeight=Math.min(1.35,g.height*.2);
    if(cs.chambers!==2)addBox(caseGroup,'case',[g.width-.46,shroudHeight,g.depth*.43],[0,-g.height/2+shroudHeight/2+.2,g.depth*.18],0x17232e,{metalness:.55,roughness:.45});
    if(cs.chambers===2){
      addBox(caseGroup,'case',[.12,g.height-.5,g.depth-.5],[g.width*.24,0,0],0x1a2732,{metalness:.6});
      addBox(caseGroup,'case',[g.width*.34,g.height*.55,.1],[g.width*.31,0,-g.depth/2+.28],0x202e39,{metalness:.52});
    }
    const bays=Math.min(4,(cs.driveBays?.ssd25||0)+(cs.driveBays?.hdd35||0));
    for(let i=0;i<bays;i++)addBox(caseGroup,'case',[Math.min(1.4,g.width*.22),.16,1.12],[g.width*.25,-g.height*.22+i*.42,g.depth*.25],0x364653,{metalness:.68});
    for(let i=0;i<3;i++)addBox(caseGroup,'case',[.28,.62,.1],[-g.width*.18,-1.45+i*1.4,-g.depth/2+.32],0x080f16,{metalness:.2});
    const railCount=Math.min(3,Math.max(1,Math.round((cs.fans||3)/3)));
    for(let i=0;i<railCount;i++)addBox(caseGroup,'case',[g.width*.58,.06,.12],[0,g.height/2-.32,g.depth*.26-i*.55],accent,{emissive:accent,emissiveIntensity:.08,metalness:.55});
  }

  function buildCaseChassis(caseGroup,e){
    const cs=e.parts.cs,g=CASE_API?.sceneGeometry?.(cs)||{width:6.9,height:7.25,depth:7.35,half:{x:3.45,y:3.625,z:3.675},componentScale:1};
    const shellColor=new THREE.Color(COLORS[state.caseColor]||COLORS.black),open=cs.frontPanel==='open';
    if(open){
      addBox(caseGroup,'case',[g.width,.34,g.depth],[0,-g.height/2+.15,0],0x26384b,{metalness:.72});
      addBox(caseGroup,'case',[.34,g.height*.78,g.depth],[-g.width/2+.17,-g.height*.08,0],0x26384b,{metalness:.72});
      addCaseFrame(caseGroup,'case',g,0x30465b);
    }else{
      addCaseFrame(caseGroup,'case',g,shellColor);
      addBox(caseGroup,'case',[g.width-.28,.18,g.depth-.28],[0,-g.height/2+.11,0],shellColor,{preset:'case',metalness:.62,roughness:.42});
      addBox(caseGroup,'case',[g.width-.28,.18,g.depth-.28],[0,g.height/2-.11,0],shellColor,{preset:'case',metalness:.62,roughness:.42});
      addBox(caseGroup,'case',[g.width-.28,g.height-.3,.16],[0,0,-g.depth/2+.08],shellColor,{preset:'case',metalness:.58,roughness:.48});
      addBox(caseGroup,'case',[.16,g.height-.3,g.depth-.3],[-g.width/2+.08,0,0],shellColor,{preset:'case',metalness:.58,roughness:.48});
      addFrontPanel(caseGroup,e,g,shellColor);
      addSidePanel(caseGroup,e,g);
      for(let i=0;i<4;i++)addBox(caseGroup,'case',[.55,.25,.55],[-g.width*.34+i*g.width*.225,-g.height/2-.13,-g.depth*.31],0x090c12,{metalness:.12});
    }
    addInternalStructure(caseGroup,e,g);
    three.caseGeometry=g;
    return g;
  }

  function boardDimensions(format){return format==='ITX'?[3.05,3.05]:format==='mATX'?[4.05,4.55]:[4.55,5.45];}
  function radiatorPlacement(cs,size){
    const cooler=select('coolers','cooler');
    return THERMAL_API?.chooseRadiatorLocation?.(cs,{...cooler,radiator:size},state.radiatorPosition)||(CASE_API?.mountLocations?.(cs,size)||[])[0]||'top';
  }

  function buildSpecialFamilyDevice(rootGroup,e,layout,family){
    const g=FAMILY_API?.sceneGeometry?.(state.family,{width:5,height:3,depth:4})||{width:5,height:3,depth:4},shell=COLORS[state.caseColor]?parseInt(COLORS[state.caseColor].slice(1),16):0x263342;
    const familyGroup=markPart(new THREE.Group(),'family');familyGroup.name='family';rootGroup.add(familyGroup);three.partGroups.family=familyGroup;three.partGroups.case=familyGroup;three.caseGeometry=g;
    const makeGroup=(key,position)=>{const group=markPart(new THREE.Group(),key);group.position.set(...position);familyGroup.add(group);three.partGroups[key]=group;return group;};
    if(family.formFactor==='mini-pc'){
      addBox(familyGroup,'family',[g.width,g.height,g.depth],[0,0,0],shell,{preset:'case',metalness:.62,roughness:.34});addBox(familyGroup,'family',[g.width-.3,.08,g.depth-.3],[0,g.height/2+.045,0],0x1a2530,{preset:'brushedMetal'});addVentSlats(familyGroup,'family',{axis:'x',count:10,start:-g.width*.38,step:g.width*.075,position:[0,0,g.depth/2+.03],length:g.height*.65,color:0x0a121a});
      const board=makeGroup('board',[0,-.08,0]);addBox(board,'board',[g.width*.76,.12,g.depth*.72],[0,0,0],0x174c3b,{preset:'pcb'});const cpu=makeGroup('cpu',[-.55,.05,-.2]);addBox(cpu,'cpu',[.86,.12,.86],[0,0,0],0xd5d9de,{preset:'brushedMetal',metalness:.9});const ram=makeGroup('ram',[.5,.08,.15]);for(let i=0;i<2;i++)addBox(ram,'ram',[.18,.16,1.18],[-.16+i*.32,0,0],0x196f69,{preset:'pcb'});const storage=makeGroup('storage',[.65,.08,-.78]);addBox(storage,'storage',[1.35,.12,.42],[0,0,0],0x256d5d,{preset:'pcb'});const cooler=makeGroup('cooler',[-.55,.24,-.2]);createFan(cooler,'cooler',[0,0,0],.48,'cpu',[Math.PI/2,0,0]);
      for(let i=0;i<5;i++)addBox(familyGroup,'family',[.22,.16,.08],[-g.width*.28+i*.36,-g.height*.18,g.depth/2+.05],i===0?0x2d8bd3:0x111827,{preset:'glossyPlastic'});
    }else if(family.formFactor==='all-in-one'){
      addBox(familyGroup,'family',[g.width,g.height*.72,.65],[0,.55,0],0x111923,{preset:'glossyPlastic',metalness:.25});addBox(familyGroup,'family',[g.width-.32,g.height*.72-.32,.08],[0,.55,.37],0x071827,{preset:'screen',emissive:screenPowered()?screenEmissive():0x02070d,emissiveIntensity:screenPowered()?1.1:.18});addBox(familyGroup,'family',[.36,1.4,.42],[0,-1.42,0],0x425160,{preset:'brushedMetal'});addBox(familyGroup,'family',[2.5,.18,1.3],[0,-2.15,.15],0x425160,{preset:'brushedMetal'});
      const board=makeGroup('board',[0,.42,-.38]);addBox(board,'board',[3.1,2.05,.08],[0,0,0],0x174c3b,{preset:'pcb'});const cpu=makeGroup('cpu',[-.5,.62,-.3]);addBox(cpu,'cpu',[.8,.8,.12],[0,0,0],0xd5d9de,{preset:'brushedMetal'});const ram=makeGroup('ram',[.55,.6,-.28]);addBox(ram,'ram',[.22,1.35,.12],[0,0,0],0x196f69,{preset:'pcb'});const storage=makeGroup('storage',[1.35,.1,-.28]);addBox(storage,'storage',[1.2,.42,.12],[0,0,0],0x256d5d,{preset:'pcb'});const cooler=makeGroup('cooler',[-1.75,.55,-.25]);createFan(cooler,'cooler',[0,0,0],.52,'cpu',[Math.PI/2,0,0]);
    }else{
      const baseY=-g.height/2+.38,screenY=baseY+g.height*.52;addBox(familyGroup,'family',[g.width,.55,g.depth],[0,baseY,0],shell,{preset:'case',metalness:.48});addBox(familyGroup,'family',[g.width*.96,.18,g.depth*.76],[0,baseY+.36,.36],0x182431,{preset:'mattePlastic'});addBox(familyGroup,'family',[g.width*.58,.04,g.depth*.34],[0,baseY+.48,.88],0x273744,{preset:'mattePlastic'});addBox(familyGroup,'family',[g.width*.98,g.height*.7,.28],[0,screenY,-g.depth*.42],0x111923,{preset:'glossyPlastic',rotation:[-.1,0,0]});addBox(familyGroup,'family',[g.width*.9,g.height*.62,.05],[0,screenY,-g.depth*.42+.17],0x071827,{preset:'screen',emissive:screenPowered()?screenEmissive():0x02070d,emissiveIntensity:screenPowered()?1.1:.2,rotation:[-.1,0,0]});
      const board=makeGroup('board',[0,baseY+.12,-.2]);addBox(board,'board',[g.width*.67,.1,g.depth*.5],[0,0,0],0x174c3b,{preset:'pcb'});const cpu=makeGroup('cpu',[-.65,baseY+.2,-.35]);addBox(cpu,'cpu',[.76,.12,.76],[0,0,0],0xd5d9de,{preset:'brushedMetal'});const ram=makeGroup('ram',[.25,baseY+.2,-.25]);for(let i=0;i<2;i++)addBox(ram,'ram',[.18,.12,1.05],[-.14+i*.28,0,0],0x196f69,{preset:'pcb'});const storage=makeGroup('storage',[1.15,baseY+.2,-.35]);addBox(storage,'storage',[1.22,.12,.4],[0,0,0],0x256d5d,{preset:'pcb'});const cooler=makeGroup('cooler',[-1.75,baseY+.24,-.25]);for(let i=0;i<(family.formFactor==='gaming-notebook'?2:1);i++)createFan(cooler,'cooler',[i*.95,0,0],.44,'cpu',[Math.PI/2,0,0]);if(family.formFactor==='gaming-notebook'){const gpu=makeGroup('gpu',[.95,baseY+.2,-.2]);addBox(gpu,'gpu',[1.25,.12,.72],[0,0,0],0x263238,{preset:'pcb'});}
    }
    return g;
  }

  function buildPCScene(){
    if(!three||!THREE)return;
    if(three.contentRoot){three.scene.remove(three.contentRoot);disposeObject(three.contentRoot);}assemblyEngine?.destroy?.();assemblyEngine=null;
    const e=evaluate(),layout=calculateSetupLayout(e),rootGroup=new THREE.Group();three.contentRoot=rootGroup;three.scene.add(rootGroup);three.partGroups={};three.fans=[];three.rgbMaterials=[];three.rgbGlows=[];three.caseSidePanel=null;three.setupLayout=layout;
    createFloor(layout);buildStudioEnvironment(rootGroup,e,layout);
    three.target.set(...layout.camera.target);state.cameraDistance=LAYOUT_API?.clampCameraDistance?.(layout,state.cameraDistance)||state.cameraDistance;state.cameraPitch=LAYOUT_API?.clampCameraPitch?.(layout,state.cameraPitch)||state.cameraPitch;
    const family=familyProfile(),special=['mini-pc','all-in-one','notebook','gaming-notebook'].includes(family.formFactor);
    if(special){const g=buildSpecialFamilyDevice(rootGroup,e,layout,family);buildExternalDevices(rootGroup,e,layout);if(['all-in-one','notebook','gaming-notebook'].includes(family.formFactor)&&!activeMonitorItems(e).length)three.partGroups.monitor=three.partGroups.family;buildVisualAccents(rootGroup,e,layout);highlightSelected();if(state.inspection.active)rebuildInspectionScene();return;}
    const caseGroup=markPart(new THREE.Group(),'case');caseGroup.name='case';rootGroup.add(caseGroup);three.partGroups.case=caseGroup;three.partGroups.family=caseGroup;
    const g=buildCaseChassis(caseGroup,e),backZ=-g.depth/2+.42,[boardW,boardH]=boardDimensions(e.parts.board.format),boardX=-g.width/2+boardW/2+.34;

    const boardGroup=markPart(new THREE.Group(),'board');boardGroup.position.set(boardX,.05,backZ);rootGroup.add(boardGroup);three.partGroups.board=boardGroup;addBox(boardGroup,'board',[boardW,boardH,.18],[0,0,0],0x184b3b,{preset:'pcb',metalness:.12,roughness:.46});
    for(let i=0;i<8;i++)addBox(boardGroup,'board',[.2,.5,.26],[-boardW*.38+(i%4)*boardW*.25,-boardH*.4+Math.floor(i/4)*boardH*.8,.24],0xb4c9d3,{metalness:.75});
    const cpuGroup=markPart(new THREE.Group(),'cpu');cpuGroup.position.set(boardX-.18,.4,backZ+.32);rootGroup.add(cpuGroup);three.partGroups.cpu=cpuGroup;addBox(cpuGroup,'cpu',[1.2,1.2,.18],[0,0,0],0xd7dce1,{preset:'brushedMetal',metalness:.94,roughness:.24});
    const ramGroup=markPart(new THREE.Group(),'ram');ramGroup.position.set(boardX+boardW*.31,.38,backZ+.42);rootGroup.add(ramGroup);three.partGroups.ram=ramGroup;for(let i=0;i<e.parts.ram.sticks;i++){const material=createMaterial(i%2?0x1a9bd4:0x167c70,{preset:'pcb',metalness:.28,emissive:state.lighting==='off'?0x000000:0x08445a,emissiveIntensity:.3});const stick=mesh(new THREE.BoxGeometry(.2,Math.min(2.45,boardH*.52),.34),material,[-.46+i*.38,0,0]);markPart(stick,'ram');ramGroup.add(stick);three.rgbMaterials.push(material);}

    const gpuGroup=markPart(new THREE.Group(),'gpu');gpuGroup.position.set(boardX+boardW*.18,-g.height*.2,backZ+1.25);rootGroup.add(gpuGroup);three.partGroups.gpu=gpuGroup;if(state.gpu!=='integrated'){const usable=Math.max(3.15,g.width-.72),gpuLength=clamp((e.parts.gpu.length/Math.max(1,e.parts.cs.gpuMax))*usable,3.0,usable);addBox(gpuGroup,'gpu',[gpuLength,1.02,.7],[.18,0,0],e.parts.gpu.brand==='AMD'?0x8f1f2d:e.parts.gpu.brand==='Intel'?0x1665a7:0x263238,{preset:'mattePlastic',metalness:.36,roughness:.46});addBox(gpuGroup,'gpu',[gpuLength-.35,.14,.08],[.18,.46,.36],accentHex(),{emissive:accentHex(),emissiveIntensity:state.lighting==='off'?0:.35,metalness:.25});const fanCount=e.parts.gpu.tdp>300?3:2;for(let i=0;i<fanCount;i++)createFan(gpuGroup,'gpu',[-gpuLength/2+.85+i*(gpuLength-1.7)/Math.max(1,fanCount-1),0,.41],.4,'gpu');if(e.parts.gpu.tdp>250)addBox(gpuGroup,'gpu',[.12,1.15,.4],[-gpuLength/2+.5,-.56,.1],0x8391a1,{metalness:.78});}

    const storageGroup=markPart(new THREE.Group(),'storage');storageGroup.position.set(g.width*.24,g.height*.18,backZ+.5);rootGroup.add(storageGroup);three.partGroups.storage=storageGroup;if(e.parts.storage.type==='nvme')addBox(storageGroup,'storage',[1.5,.36,.15],[0,0,0],0x256d5d,{preset:'pcb',metalness:.18});else addBox(storageGroup,'storage',[1.65,1.1,.43],[0,0,0],e.parts.storage.type==='hdd'?0x434b55:0x305b7c,{preset:'brushedMetal',metalness:.78});
    const storage2Group=markPart(new THREE.Group(),'storage2');storage2Group.position.set(g.width*.25,-g.height*.08,g.depth*.18);rootGroup.add(storage2Group);three.partGroups.storage2=storage2Group;if(state.storage2!=='none')addBox(storage2Group,'storage2',[1.75,1.15,.44],[0,0,0],e.parts.storage2.type==='hdd'?0x3f454c:0x2c6480,{preset:'brushedMetal',metalness:.72});
    const psuGroup=markPart(new THREE.Group(),'psu');psuGroup.position.set(e.parts.cs.chambers===2?g.width*.27:-g.width*.18,-g.height/2+.9,g.depth*.2);rootGroup.add(psuGroup);three.partGroups.psu=psuGroup;addBox(psuGroup,'psu',[Math.min(3,g.width*.45),1.4,2.15],[0,0,0],0x202833,{preset:'paintedMetal',metalness:.78});createFan(psuGroup,'psu',[0,.72,0],.57,'psu',[Math.PI/2,0,0]);

    const coolerGroup=markPart(new THREE.Group(),'cooler');coolerGroup.position.set(boardX-.18,.4,backZ+.95);rootGroup.add(coolerGroup);three.partGroups.cooler=coolerGroup;if(e.parts.cooler.type==='air'){const towerHeight=Math.min(2.15,g.width*.42);addBox(coolerGroup,'cooler',[1.65,towerHeight,1.28],[0,0,.34],0x7b8996,{preset:'brushedMetal',metalness:.88});addBox(coolerGroup,'cooler',[1.35,.11,1.12],[0,towerHeight*.42,.94],accentHex(),{emissive:accentHex(),emissiveIntensity:state.lighting==='off'?0:.28,metalness:.25});createFan(coolerGroup,'cooler',[0,0,1.04],.66,'cpu');}else if(['aio','custom'].includes(e.parts.cooler.type)){
      addCylinder(coolerGroup,'cooler',.58,.34,[0,0,.16],0x1b2938,{rotation:[Math.PI/2,0,0],metalness:.65});addCylinder(coolerGroup,'cooler',.3,.17,[0,0,.42],accentHex(),{rotation:[Math.PI/2,0,0],metalness:.2,emissive:accentHex(),emissiveIntensity:state.lighting==='off'?0:.35});
      const size=e.parts.cooler.radiator,mount=radiatorPlacement(e.parts.cs,size),fanCount=size>=360?3:2,radLength=fanCount===3?4.45:3.0;
      if(mount==='top'||mount==='bottom'){
        const y=mount==='top'?g.height/2-.43:-g.height/2+.44;addBox(coolerGroup,'cooler',[radLength,.48,1.0],[g.width*.12-boardX,y-.4,1.0-backZ],0x27313b,{metalness:.7});for(let i=0;i<fanCount;i++)createFan(coolerGroup,'cooler',[g.width*.12-boardX-radLength/2+.72+i*(radLength-1.44)/Math.max(1,fanCount-1),y-.12,1.0-backZ],.44,'radiator',[Math.PI/2,0,0]);
      }else{
        const x=mount==='side'?g.width/2-.72-boardX:g.width*.08-boardX,z=mount==='front'?g.depth/2-.52-backZ:g.depth*.18-backZ;addBox(coolerGroup,'cooler',[1.0,radLength,.48],[x,0,z],0x27313b,{metalness:.7});for(let i=0;i<fanCount;i++)createFan(coolerGroup,'cooler',[x,-radLength/2+.72+i*(radLength-1.44)/Math.max(1,fanCount-1),z+.3],.44,'radiator');
      }
      addCurvedTube(coolerGroup,'cooler',[[.12,.12,.3],[.7,1.0,.9],[1.15,1.75,1.8]],0x3b4550,.065);addCurvedTube(coolerGroup,'cooler',[[-.12,.12,.3],[.35,1.0,1.1],[.9,1.8,2.1]],0x3b4550,.065);if(e.parts.cooler.type==='custom')addCylinder(coolerGroup,'cooler',.3,1.2,[Math.min(2.5,g.width*.3),.4,Math.min(2,g.depth*.28)],accentHex(),{metalness:.22,transparent:true,opacity:.65,emissive:accentHex(),emissiveIntensity:.18});
    }

    const intakePoints=[],exhaustPoints=[];
    if(e.parts.cs.frontPanel!=='open')for(let i=0;i<3;i++)intakePoints.push({p:[0,g.height*.27-i*g.height*.27,g.depth/2-.28],r:[0,0,0],location:'front'});
    if(e.parts.cs.chambers===2||e.parts.cs.frontPanel==='glass')for(let i=0;i<3;i++)intakePoints.push({p:[g.width/2-.32,g.height*.25-i*g.height*.25,g.depth*.15],r:[0,-Math.PI/2,0],location:'side'});
    if((e.parts.cs.mounts?.bottom||[]).length)for(let i=0;i<2;i++)intakePoints.push({p:[-g.width*.18+i*g.width*.36,-g.height/2+.27,g.depth*.12],r:[Math.PI/2,0,0],location:'bottom'});
    exhaustPoints.push({p:[g.width*.28,g.height*.23,-g.depth/2+.25],r:[0,Math.PI,0],location:'rear'});
    if((e.parts.cs.mounts?.top||[]).length)for(let i=0;i<3;i++)exhaustPoints.push({p:[-g.width*.22+i*g.width*.22,g.height/2-.27,g.depth*.18-i*g.depth*.2],r:[Math.PI/2,0,0],location:'top'});
    for(let i=0;i<Math.min(e.thermal.intakeFans,intakePoints.length);i++)createFan(caseGroup,'case',intakePoints[i].p,.58,'intake',intakePoints[i].r);
    for(let i=0;i<Math.min(e.thermal.exhaustFans,exhaustPoints.length);i++)createFan(caseGroup,'case',exhaustPoints[i].p,.58,'exhaust',exhaustPoints[i].r);

    buildCables(rootGroup,e);buildExternalDevices(rootGroup,e,layout);buildAirflow(rootGroup,e);buildVisualAccents(rootGroup,e,layout);applyExploded();setupAssemblyEngine();highlightSelected();if(state.inspection.active)rebuildInspectionScene();
  }


  function buildVisualAccents(rootGroup,e,layout){
    if(!MATERIAL_API||!THREE)return;
    if(state.contactShadows){
      const deskTop=layout.desk.topY+.012,caseObject=layout.objects.find(item=>item.id==='case');
      if(caseObject){const shadow=MATERIAL_API.createContactShadow?.({THREE,quality:state.labGraphics,width:caseObject.size[0]*1.28,depth:caseObject.size[2]*1.2,position:[caseObject.position[0],deskTop,caseObject.position[2]],opacity:state.labGraphics==='ultra'?.38:.26});if(shadow){rootGroup.add(shadow);three.contactShadow=shadow;}}
      const monitor=layout.objects.find(item=>item.id==='monitor-base');if(monitor){const shadow=MATERIAL_API.createContactShadow?.({THREE,quality:state.labGraphics,width:monitor.size[0]*1.7,depth:monitor.size[2]*1.8,position:[monitor.position[0],deskTop+.005,monitor.position[2]],opacity:.22});if(shadow)rootGroup.add(shadow);}
    }
    if(state.lighting!=='off'&&state.labGraphics!=='medium'){
      const strength=state.rgbIntensity==='showcase'?1.35:state.rgbIntensity==='subtle'?.62:1;
      const g=three.caseGeometry||{width:6.9,height:7.25,depth:7.35};
      for(const [position,size] of [[[0,g.height*.18,g.depth*.28],1.15],[[0,-g.height*.22,g.depth*.26],.9]]){
        const glow=MATERIAL_API.addRgbGlow?.({THREE,group:rootGroup,quality:state.labGraphics,color:accentHex(),position,size,intensity:strength});if(glow)three.rgbGlows.push(glow);
      }
    }
  }

  function createFan(group,key,position,radius,type,rotation=[0,0,0]){
    const fan=new THREE.Group();fan.position.set(...position);fan.rotation.set(...rotation);fan.userData.airRole=type;markPart(fan,key);
    const roleColor=type==='intake'?0x2de2ff:type==='exhaust'?0xff7b54:0x73d8ed;
    const ring=mesh(new THREE.TorusGeometry(radius,.07,10,36),createMaterial(roleColor,{preset:'rgb',metalness:.42,emissive:roleColor,emissiveIntensity:(type==='intake'||type==='exhaust') ? .16 : 0}),[0,0,0]);fan.add(ring);
    const hub=mesh(new THREE.CylinderGeometry(radius*.18,radius*.18,.18,20),createMaterial(0x0d1720,{preset:'mattePlastic',metalness:.32}),[0,0,0],[Math.PI/2,0,0]);fan.add(hub);
    const blades=new THREE.Group();for(let i=0;i<7;i++){const blade=mesh(new THREE.BoxGeometry(radius*.55,.08,radius*.18),createMaterial(roleColor,{preset:'glossyPlastic',transparent:true,opacity:.7,emissive:roleColor,emissiveIntensity:.34}),[radius*.32,0,0]);blade.rotation.z=i*Math.PI*2/7+.3;blades.add(blade);}fan.add(blades);three.fans.push({blades,type,direction:type==='exhaust'?-1:1});group.add(fan);return fan;
  }

  function buildCables(rootGroup,e){
    if(!state.cables||(state.assembly?.enabled&&state.assembly?.prepared))return;const cableMaterial=color=>createMaterial(color,{preset:'rubber',roughness:.86,metalness:0});
    const cable=(start,end,color,key)=>{const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(...start),new THREE.Vector3((start[0]+end[0])/2,start[1]+1.1,(start[2]+end[2])/2),new THREE.Vector3(...end)]),tube=mesh(new THREE.TubeGeometry(curve,24,.055,8,false),cableMaterial(color));markPart(tube,key);rootGroup.add(tube);};
    cable([-1.6,-2.1,2.2],[-2.5,1.5,-2.5],state.boardPower?0x18222b:0xff304f,'board');cable([-1.1,-2.1,2.2],[-1.4,1.6,-2.4],state.cpuPower?0x151e28:0xff304f,'cpu');
    if(e.parts.gpu.requiresCable)cable([-.4,-2.1,2.2],[1.4,-1.3,-1.3],state.gpuPower?0x1b242d:0xff304f,'gpu');
    if(e.parts.storage.needsData)cable([1.6,1.9,-2],[2.1,-.3,-2.7],state.storageData?0xe74c3c:0xff304f,'storage');
    if(state.cableManagement==='premium'){cable([-2.5,-2.5,2.3],[-2.9,-1.2,-2.4],0x202a34,'board');cable([-2.2,-2.5,2.3],[2.5,1.8,-2.7],0x202a34,'storage');}
  }

  function buildExternalDevices(rootGroup,e,layout){
    const byId=id=>layout.objects.find(item=>item.id===id);
    const monitorGroup=markPart(new THREE.Group(),'monitor');rootGroup.add(monitorGroup);three.partGroups.monitor=monitorGroup;
    const monitorItems=layout.objects.filter(item=>item.role==='monitor');
    for(const item of monitorItems){const [x,y,z]=item.position,kind=item.meta?.kind||'';
      if(kind==='screen'){const model=item.meta?.item||e.parts.monitor,panel=model.panel||'IPS';addBox(monitorGroup,'monitor',item.size,item.position,panel==='OLED'?0x05080c:panel==='CRT'?0x34302b:0x101b25,{preset:'glossyPlastic',metalness:.28,roughness:.22,rotation:item.rotation});addBox(monitorGroup,'monitor',[Math.max(.2,item.size[0]-.36),Math.max(.2,item.size[1]-.36),.075],[x,y,z+.16],0x10263a,{preset:'screen',emissive:screenPowered()?screenEmissive():0x02070d,emissiveIntensity:screenPowered()?1.2:.16,roughness:.08,rotation:item.rotation});}
      else if(kind==='base'||kind==='neck'||kind==='pole'||kind==='rail'||kind==='arm'||kind==='clamp')addBox(monitorGroup,'monitor',item.size,item.position,kind==='arm'||kind==='rail'?0x506071:0x283443,{preset:'brushedMetal',metalness:.78,roughness:.3,rotation:item.rotation});
    }
    const peripherals=markPart(new THREE.Group(),'peripherals');rootGroup.add(peripherals);three.partGroups.peripherals=peripherals;
    for(const item of layout.objects){
      if(['case','monitor-screen','monitor-neck','monitor-base'].includes(item.id))continue;
      const [x,y,z]=item.position;
      if(item.id==='keyboard'){
        addBox(peripherals,'peripherals',item.size,item.position,state.keyboard==='creator'?0xd8dce2:0x202a36,{preset:state.keyboard==='creator'?'glossyPlastic':'mattePlastic',metalness:.2,roughness:.56});
        const rows=state.labGraphics==='ultra'?5:3,cols=state.labGraphics==='ultra'?15:10;
        for(let row=0;row<rows;row++)for(let col=0;col<cols;col++)addBox(peripherals,'peripherals',[item.size[0]/cols*.68,.035,item.size[2]/rows*.48],[x-item.size[0]*.43+col*item.size[0]/cols,y+item.size[1]/2+.02,z-item.size[2]*.32+row*item.size[2]/rows],0x516273,{metalness:.18,roughness:.6});
      }else if(item.id==='mouse'){
        const mouse=mesh(new THREE.SphereGeometry(.5,18,12),createMaterial(state.mouse==='gaming'?0x202733:0x39495a,{preset:state.mouse==='gaming'?'glossyPlastic':'mattePlastic',metalness:.18,roughness:.44}),item.position);mouse.scale.set(item.size[0],item.size[1]*1.45,item.size[2]);markPart(mouse,'peripherals');peripherals.add(mouse);
      }else if(item.id.startsWith('speaker')){
        addBox(peripherals,'peripherals',item.size,item.position,0x202833,{preset:'fabric',metalness:.18,roughness:.68});
        addCylinder(peripherals,'peripherals',item.size[0]*.25,.08,[x,y+.22,z+item.size[2]/2+.05],0x080d12,{rotation:[Math.PI/2,0,0],metalness:.18});
      }else if(item.id==='soundbar'){
        addBox(peripherals,'peripherals',item.size,item.position,0x202833,{preset:'fabric',metalness:.16,roughness:.72});
        addBox(peripherals,'peripherals',[item.size[0]*.72,.08,.04],[x,y,z+item.size[2]/2+.03],0x0b1720,{emissive:screenPowered()?0x38d9ff:0x000000,emissiveIntensity:.25});
      }else if(item.id==='headset-stand'){
        addBox(peripherals,'peripherals',[.18,item.size[1],.18],item.position,0x7f8d99,{metalness:.82});
        addBox(peripherals,'peripherals',[.75,.12,.5],[x,y-item.size[1]/2+.06,z],0x26323d,{metalness:.55});
      }else if(item.id==='headset'){
        const band=mesh(new THREE.TorusGeometry(.48,.09,10,28,Math.PI),createMaterial(0x18232d,{preset:'fabric',metalness:.04,roughness:.9}),item.position,[0,0,Math.PI]);markPart(band,'peripherals');peripherals.add(band);
        addBox(peripherals,'peripherals',[.3,.58,.42],[x-.48,y-.25,z],0x202c38,{metalness:.3});addBox(peripherals,'peripherals',[.3,.58,.42],[x+.48,y-.25,z],0x202c38,{metalness:.3});
      }else if(item.id==='microphone'){
        addCylinder(peripherals,'peripherals',.16,.65,[x,y+.25,z],0x151e27,{segments:20,metalness:.55});addBox(peripherals,'peripherals',[.5,.1,.5],[x,y-item.size[1]/2+.05,z],0x2d3945,{metalness:.65});
      }else if(item.id==='webcam'){
        addBox(peripherals,'peripherals',item.size,item.position,0x111827,{metalness:.5});addCylinder(peripherals,'peripherals',.09,.08,[x,y,z+item.size[2]/2+.06],0x0d6c91,{rotation:[Math.PI/2,0,0],metalness:.24});
      }else if(item.id==='printer'){
        addBox(peripherals,'peripherals',item.size,item.position,0xcbd5e1,{metalness:.2,roughness:.58});addBox(peripherals,'peripherals',[item.size[0]*.72,.08,item.size[2]*.55],[x,y+item.size[1]/2+.05,z],0x1f2937,{metalness:.25});
      }else if(item.id==='controller'){
        const type=String(item.meta?.controllerType||e.parts.controller.type||'Gamepad');
        if(type.includes('automobilística')){const wheel=mesh(new THREE.TorusGeometry(.62,.11,12,32),createMaterial(0x141c24,{preset:'rubber',roughness:.82}),[x,y+.35,z],[Math.PI/2,0,0]);markPart(wheel,'peripherals');peripherals.add(wheel);addBox(peripherals,'peripherals',[1.35,.55,1.1],[x,y-.34,z],0x242f3a,{preset:'mattePlastic'});}
        else if(type.includes('voo')){addBox(peripherals,'peripherals',[1.15,.32,1.05],[x,y-item.size[1]/2+.16,z],0x202b36,{preset:'mattePlastic'});addCylinder(peripherals,'peripherals',.12,1.1,[x,y+.15,z],0x364758,{segments:18,metalness:.45});addBox(peripherals,'peripherals',[.42,.36,.35],[x,y+.78,z],0x151e27,{preset:'rubber'});}
        else if(type.includes('Arcade')){addBox(peripherals,'peripherals',item.size,item.position,0x273443,{preset:'paintedMetal',metalness:.42});addCylinder(peripherals,'peripherals',.08,.52,[x-.55,y+.5,z],0x141b23,{segments:16});addCylinder(peripherals,'peripherals',.15,.08,[x+.32,y+.42,z+.18],0xe84a5f,{rotation:[Math.PI/2,0,0]});addCylinder(peripherals,'peripherals',.15,.08,[x+.68,y+.42,z-.05],0x4ac7e8,{rotation:[Math.PI/2,0,0]});}
        else if(type.includes('Realidade')){addBox(peripherals,'peripherals',item.size,item.position,0xe5e7eb,{preset:'glossyPlastic',roughness:.28});addBox(peripherals,'peripherals',[item.size[0]*.62,.18,.08],[x,y,z+item.size[2]/2+.05],0x101820,{preset:'screen',emissive:0x5b78ff,emissiveIntensity:.2});}
        else{addBox(peripherals,'peripherals',item.size,item.position,state.controller==='playstation'?0xe5e7eb:0x202833,{preset:'glossyPlastic',metalness:.25,roughness:.42});addCylinder(peripherals,'peripherals',.11,.08,[x-.38,y+.2,z+.22],0x111827,{rotation:[Math.PI/2,0,0]});addCylinder(peripherals,'peripherals',.11,.08,[x+.38,y+.2,z+.22],0x111827,{rotation:[Math.PI/2,0,0]});}
      }else if(item.id==='ups'){
        addBox(peripherals,'peripherals',item.size,item.position,0x1d2731,{metalness:.55});addBox(peripherals,'peripherals',[item.size[0]*.55,.22,.08],[x,y+.28,z+item.size[2]/2+.05],0x0b1822,{emissive:0x38d9ff,emissiveIntensity:.18});
      }
    }
  }

  function buildAirflow(rootGroup,e){
    if(!state.airflow||!state.thermalOverlay||state.labGraphics==='medium'||(state.assembly?.enabled&&state.assembly?.prepared))return;
    const g=three.caseGeometry||{width:6.9,height:7.25,depth:7.35};
    const pathDefs=[...(e.thermal.paths?.intake||[]).map(path=>({...path,role:'intake'})),...(e.thermal.paths?.exhaust||[]).map(path=>({...path,role:'exhaust'}))];
    const count=state.labGraphics==='ultra'?280:120,positions=new Float32Array(count*3),colors=new Float32Array(count*3),particles=[];
    for(let i=0;i<count;i++){
      const path=pathDefs[i%Math.max(1,pathDefs.length)]||{from:[0,0,1],to:[0,0,-1],role:'intake'};
      const start=new THREE.Vector3(path.from[0]*g.width*.5,path.from[1]*g.height*.5,path.from[2]*g.depth*.5);
      const end=new THREE.Vector3(path.to[0]*g.width*.5,path.to[1]*g.height*.5,path.to[2]*g.depth*.5);
      const progress=Math.random(),jitter=new THREE.Vector3((Math.random()-.5)*.7,(Math.random()-.5)*.7,(Math.random()-.5)*.7);
      const point=start.clone().lerp(end,progress).add(jitter);positions.set([point.x,point.y,point.z],i*3);
      const color=new THREE.Color(path.role==='intake'?0x38d9ff:0xff875c);colors.set([color.r,color.g,color.b],i*3);
      particles.push({start,end,progress,speed:(.18+Math.random()*.18)*(e.thermal.effectiveCfm/120+.35),jitter,role:path.role});
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
    const material=new THREE.PointsMaterial({size:state.labGraphics==='ultra'?.065:.048,vertexColors:true,transparent:true,opacity:.58,depthWrite:false});
    const points=new THREE.Points(geometry,material);rootGroup.add(points);three.airflowPoints=points;three.airflowParticles=particles;
  }

  function applyExploded(){
    if(!three?.partGroups)return;if(state.assembly?.enabled&&state.assembly?.prepared){assemblyEngine?.applyState();return;}const offsets={board:[-1.6,0,-1.5],cpu:[-1.1,1.5,-.5],ram:[.4,1.7,-.2],gpu:[1.8,-.4,.7],storage:[2,1.2,.7],storage2:[2.4,1.8,1.3],psu:[-1.2,-1.2,2.3],cooler:[-.5,1.9,1],monitor:[2.3,.2,0],peripherals:[1.2,-.4,1.8]};
    for(const [key,group] of Object.entries(three.partGroups)){if(!group.userData.basePosition)group.userData.basePosition=group.position.clone();const base=group.userData.basePosition,offset=offsets[key]||[0,0,0];group.position.set(base.x+(state.exploded?offset[0]:0),base.y+(state.exploded?offset[1]:0),base.z+(state.exploded?offset[2]:0));}
  }

  function highlightSelected(){
    if(!three?.scene)return;three.scene.traverse(node=>{if(!node.material||!node.userData.partKey)return;const selected=node.userData.partKey===state.selectedPart;if('emissive' in node.material){node.material.emissive.set(selected?0x176f8a:node.material.userData?.baseEmissive||0x000000);node.material.emissiveIntensity=selected ? .72 : (node.material.userData?.baseIntensity||0);}});
  }

  function createFloor(layout){
    if(three.floor){three.scene.remove(three.floor);disposeObject(three.floor);three.floor=null;three.gridMaterial=null;}
    const width=layout?.floor?.size?.[0]||34,depth=layout?.floor?.size?.[2]||24,x=layout?.floor?.position?.[0]||3,y=(layout?.floor?.position?.[1]||-6.11)+(layout?.floor?.size?.[1]||.12)/2;
    if(state.labGraphics==='ultra'){
      const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{uTime:{value:0},uColor:{value:new THREE.Color(0x35c9ee)}},vertexShader:'varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec2 vUv; uniform float uTime; uniform vec3 uColor; void main(){vec2 grid=abs(fract(vUv*28.0-.5)-.5)/fwidth(vUv*28.0);float line=1.0-min(min(grid.x,grid.y),1.0);float pulse=.35+.25*sin(uTime+vUv.x*8.0);gl_FragColor=vec4(uColor,line*.22*pulse);}' });const floor=mesh(new THREE.PlaneGeometry(width,depth),material,[x,y,0],[-Math.PI/2,0,0]);three.scene.add(floor);three.floor=floor;three.gridMaterial=material;
    }else{const floor=mesh(new THREE.PlaneGeometry(width,depth),createMaterial(0x08131f,{preset:'mattePlastic',roughness:.9,metalness:.08}),[x,y,0],[-Math.PI/2,0,0]);floor.receiveShadow=true;three.scene.add(floor);three.floor=floor;}
  }

  async function initThree(){
    const token=++threeToken,canvas=$('#hardwareCanvas3d');if(!canvas)return;
    const fallbackToLow=(message,expectedToken=token)=>{
      if(expectedToken!==threeToken||!root)return;
      console.warn('[Hardware Studio 3D]',message);
      destroyThree();state.labGraphics='low';refreshControls();renderPanels();startLowRenderer();persist();ctx.toast?.('WebGL indisponível. Modo Baixo ativado.','warning');
    };
    if(!THREE){
      try{THREE=await import(THREE_URL);}
      catch(error){fallbackToLow(`Falha ao carregar Three.js: ${error?.message||error}`);return;}
    }
    if(token!==threeToken||!root||state.labGraphics==='low')return;
    destroyThree();const renderToken=++threeToken;
    try{
      const quality=state.labGraphics,renderer=new THREE.WebGLRenderer({canvas,antialias:quality!=='medium',alpha:false,powerPreference:quality==='medium'?'default':'high-performance'}),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(48,1,.1,120),target=new THREE.Vector3(2,0,0),layout=calculateSetupLayout(evaluate());
      const palette=ambientScene(),graphicsProfile=MATERIAL_API?.configureRenderer?.({THREE,renderer,quality,ambient:state.ambientPreset})||MATERIAL_API?.profile?.(quality),environmentMap=MATERIAL_API?.createEnvironmentMap?.({THREE,quality,palette})||null;renderer.setClearColor(palette.bg,1);if(environmentMap)scene.environment=environmentMap;
      scene.fog=new THREE.FogExp2(palette.fog,quality==='ultra'?.018:quality==='high'?.025:.034);const lighting=MATERIAL_API?.createLighting?.({THREE,scene,quality,palette,ambient:state.ambientPreset,accent:accentHex(),layout})||{};const fill=lighting.fill||new THREE.PointLight(palette.fill,18,32),rim=lighting.rim||new THREE.PointLight(palette.rim,14,28);if(!lighting.fill){fill.position.set(-6,4,8);scene.add(fill);}if(!lighting.rim){rim.position.set(10,6,-10);scene.add(rim);}
      three={renderer,scene,camera,target,partGroups:{},fans:[],rgbMaterials:[],rgbGlows:[],contentRoot:null,last:performance.now(),lastStatsUpdate:0,dragging:false,pointers:new Map(),raycaster:new THREE.Raycaster(),pointer:new THREE.Vector2(),fill,rim,key:lighting.key||null,cleanup:null,floor:null,setupLayout:null,graphicsProfile,environmentMap};
      buildPCScene();bindThreeControls(canvas);resizeRenderer();updateThreeCamera();animateThree();$('#hwRenderStatus').textContent=`WebGL 3D • ${quality.toUpperCase()}`;
    }catch(error){fallbackToLow(`Contexto WebGL indisponível: ${error?.message||error}`,renderToken);}
  }

  function bindThreeControls(canvas){
    const down=event=>{if(state.cinematic?.playing){CINEMATIC_API?.pause?.(state.cinematic);renderCinematicPanel();}
      if(assemblyEngine?.pointerDown(event)){three.dragging=true;return;}
      canvas.setPointerCapture?.(event.pointerId);three.pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY});three.dragging=true;
    };
    const move=event=>{
      if(assemblyEngine?.dragging){assemblyEngine.pointerMove(event);return;}
      if(!three?.pointers.has(event.pointerId))return;const pointer=three.pointers.get(event.pointerId),dx=event.clientX-pointer.x,dy=event.clientY-pointer.y;pointer.x=event.clientX;pointer.y=event.clientY;
      if(three.pointers.size===1){state.cameraYaw-=dx*.008;state.cameraPitch=LAYOUT_API?.clampCameraPitch?.(three.setupLayout,state.cameraPitch+dy*.006)||clamp(state.cameraPitch+dy*.006,-.08,1.18);updateThreeCamera();}
      else if(three.pointers.size===2){const values=[...three.pointers.values()],distance=Math.hypot(values[0].x-values[1].x,values[0].y-values[1].y),previous=three.lastPinch||distance;state.cameraDistance=LAYOUT_API?.clampCameraDistance?.(three.setupLayout,state.cameraDistance-(distance-previous)*.025)||clamp(state.cameraDistance-(distance-previous)*.025,9,32);three.lastPinch=distance;updateThreeCamera();}
    };
    const up=event=>{
      if(assemblyEngine?.dragging){assemblyEngine.pointerUp(event);if(three)three.dragging=false;renderPanels();persist();return;}
      const pointer=three?.pointers.get(event.pointerId);if(pointer&&Math.hypot(event.clientX-pointer.startX,event.clientY-pointer.startY)<7)pickThreePart(event);three?.pointers.delete(event.pointerId);if(three){three.dragging=three.pointers.size>0;if(three.pointers.size<2)three.lastPinch=0;}persist();
    };
    const wheel=event=>{event.preventDefault();if(state.inspection?.active)state.inspection.distance=clamp(state.inspection.distance+Math.sign(event.deltaY)*.45,3,18);else state.cameraDistance=LAYOUT_API?.clampCameraDistance?.(three.setupLayout,state.cameraDistance+Math.sign(event.deltaY)*1.1)||clamp(state.cameraDistance+Math.sign(event.deltaY)*1.1,9,32);updateThreeCamera();persist();};
    const keydown=event=>{if(!state.assembly?.enabled||!state.assembly?.prepared)return;if(event.key.toLowerCase()==='r'){event.preventDefault();assemblyAction(event.shiftKey?'rotateLeft':'rotateRight');}else if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();assemblyAction(event.shiftKey?'redo':'undo');}};
    canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('wheel',wheel,{passive:false});canvas.addEventListener('dblclick',()=>setView('iso'));window.addEventListener('keydown',keydown);
    three.cleanup=()=>{canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('wheel',wheel);window.removeEventListener('keydown',keydown);};
  }

  function pickThreePart(event){
    if(!three)return;const selected=assemblyEngine?.selectAt?.(event);if(selected){state.selectedPart=selected;renderPanels();highlightSelected();persist();return;}const rect=$('#hardwareCanvas3d').getBoundingClientRect();three.pointer.x=(event.clientX-rect.left)/rect.width*2-1;three.pointer.y=-(event.clientY-rect.top)/rect.height*2+1;three.raycaster.setFromCamera(three.pointer,three.camera);const hit=three.raycaster.intersectObjects(three.contentRoot?.children||[],true).find(item=>item.object.userData.partKey);if(hit){state.selectedPart=hit.object.userData.partKey;renderPanels();highlightSelected();persist();}
  }

  function updateThreeCamera(){if(!three)return;const layout=three.setupLayout;if(state.inspection?.active){state.inspection.distance=clamp(state.inspection.distance,3,18);state.cameraPitch=clamp(state.cameraPitch,-.85,1.35);}else{state.cameraDistance=LAYOUT_API?.clampCameraDistance?.(layout,state.cameraDistance)||clamp(state.cameraDistance,9,32);state.cameraPitch=LAYOUT_API?.clampCameraPitch?.(layout,state.cameraPitch)||clamp(state.cameraPitch,-.08,1.18);}const d=state.inspection?.active?state.inspection.distance:state.cameraDistance,p=state.cameraPitch,y=state.cameraYaw;three.camera.position.set(three.target.x+Math.cos(p)*Math.sin(y)*d,three.target.y+Math.sin(p)*d,three.target.z+Math.cos(p)*Math.cos(y)*d);three.camera.lookAt(three.target);}
  function resizeRenderer(){if(!three)return;const canvas=$('#hardwareCanvas3d'),rect=canvas?.getBoundingClientRect();if(!rect?.width||!rect?.height)return;const height=Math.max(430,rect.height);three.renderer.setSize(rect.width,height,false);three.camera.aspect=rect.width/height;three.camera.updateProjectionMatrix();}
  function animateThree(time=performance.now()){
    if(!three)return;const dt=Math.min(.05,(time-three.last)/1000);three.last=time;if(state.cinematic?.active){const tick=CINEMATIC_API?.tick?.(state.cinematic,dt),pose=CINEMATIC_API?.cameraPose?.(state.cinematic,three.setupLayout);if(pose){state.cameraYaw+=(pose.yaw-state.cameraYaw)*Math.min(1,dt*2.4);state.cameraPitch+=(pose.pitch-state.cameraPitch)*Math.min(1,dt*2.4);state.cameraDistance+=(pose.distance-state.cameraDistance)*Math.min(1,dt*2.1);three.target.lerp(new THREE.Vector3(...pose.target),Math.min(1,dt*2.2));updateThreeCamera();}const track=$('#hwCinematicSummary .hardware-cinema-track i');if(track)track.style.width=`${Math.round((tick?.progress||0)*100)}%`;if(tick?.changed)renderCinematicPanel();}else if(state.autorotate&&!three.dragging){state.cameraYaw+=dt*.2;updateThreeCamera();}
    const running=state.state==='ready'||state.benchmarkRunning;for(const fan of three.fans)fan.blades.rotation.z-=dt*(running?8:1.2)*(fan.direction||1)*(state.fanSpeed==='turbo'?1.3:state.fanSpeed==='quiet'?.72:1);
    const color=rgbColor(time);for(const material of three.rgbMaterials){if(material.emissive){material.emissive.copy(color);material.emissiveIntensity=state.lighting==='off'?0:(state.rgbIntensity==='showcase'?1.05:state.rgbIntensity==='subtle'?.42:.72);}}
    if(three.airflowPoints&&three.airflowParticles){const pos=three.airflowPoints.geometry.attributes.position;for(let i=0;i<pos.count;i++){const particle=three.airflowParticles[i];particle.progress+=dt*particle.speed*(running?1.45:.55);if(particle.progress>1)particle.progress-=1;const point=particle.start.clone().lerp(particle.end,particle.progress).add(particle.jitter);pos.setXYZ(i,point.x,point.y,point.z);}pos.needsUpdate=true;three.airflowPoints.visible=state.airflow&&state.thermalOverlay;}
    if(three.gridMaterial)three.gridMaterial.uniforms.uTime.value=time*.001;
    if(state.lighting==='off'){const palette=ambientScene();three.fill.color.set(palette.fill);three.rim.color.set(palette.rim);}else{three.fill.color.copy(rgbColor(time,0));three.rim.color.copy(rgbColor(time,1));}
    three.renderer.render(three.scene,three.camera);const fps=Math.round(1/Math.max(.001,dt));$('#hwRenderStats').textContent=`${fps} FPS • DPR ${three.renderer.getPixelRatio().toFixed(1)}`;if(time-three.lastStatsUpdate>650){three.lastStatsUpdate=time;const info=three.renderer.info.render,stats=MATERIAL_API?.stats?.(state.labGraphics)||{};const calls=$('#hwDrawCalls'),triangles=$('#hwTriangles'),textures=$('#hwTextureCount'),materials=$('#hwMaterialCount');if(calls)calls.textContent=String(info.calls||0);if(triangles)triangles.textContent=(info.triangles||0).toLocaleString('pt-BR');if(textures)textures.textContent=String(stats.createdTextures||0);if(materials)materials.textContent=String(stats.createdMaterials||0);}threeRaf=requestAnimationFrame(animateThree);
  }

  function scheduleSceneRebuild(){if(state.labGraphics==='low'){drawLow();return;}clearTimeout(scheduleSceneRebuild.timer);scheduleSceneRebuild.timer=setTimeout(()=>{if(three)buildPCScene();else initThree();},50);}
  function updateSceneState(){if(three){applyExploded();highlightSelected();if(three.airflowPoints)three.airflowPoints.visible=state.airflow&&state.thermalOverlay;}const fx=$('#hwIncidentFx');if(fx){const stage=state.benchmarkIncident?.stage||'idle';fx.dataset.stage=stage;fx.classList.toggle('show-smoke',['smoke','fire'].includes(stage));fx.classList.toggle('show-fire',stage==='fire');}}

  function setupLowCanvas(){const canvas=$('#hardwareCanvas2d'),rect=canvas?.getBoundingClientRect();if(!canvas||!rect?.width)return null;const dpr=Math.min(1.35,devicePixelRatio||1),width=Math.max(320,rect.width),height=Math.max(430,rect.height);if(canvas.width!==Math.round(width*dpr)||canvas.height!==Math.round(height*dpr)){canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);}const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);return{canvas,c,width,height};}
  function drawLow(time=performance.now()){
    if(state.labGraphics!=='low'||!root)return;
    const setup=setupLowCanvas();if(!setup){lowRaf=requestAnimationFrame(drawLow);return;}
    const{canvas,c,width:w,height:h}=setup,e=evaluate(),layout=calculateSetupLayout(e);
    const lowDt=Math.min(.05,(time-(canvas._lastFrameTime||time))/1000);canvas._lastFrameTime=time;
    if(state.cinematic?.active){const tick=CINEMATIC_API?.tick?.(state.cinematic,lowDt),pose=CINEMATIC_API?.cameraPose?.(state.cinematic,layout);if(pose){state.cameraYaw+=(pose.yaw-state.cameraYaw)*Math.min(1,lowDt*2.4);state.cameraPitch+=(pose.pitch-state.cameraPitch)*Math.min(1,lowDt*2.4);state.cameraDistance+=(pose.distance-state.cameraDistance)*Math.min(1,lowDt*2.1);}const track=$('#hwCinematicSummary .hardware-cinema-track i');if(track)track.style.width=`${Math.round((tick?.progress||0)*100)}%`;if(tick?.changed)renderCinematicPanel();}
    if(state.inspection?.active){c.clearRect(0,0,w,h);const bg=c.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#07121f');bg.addColorStop(1,'#15243a');c.fillStyle=bg;c.fillRect(0,0,w,h);c.strokeStyle='rgba(73,215,255,.22)';for(let x=0;x<w;x+=30){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}const label=INSPECTION_API?.TARGETS?.[state.inspection.target]?.label||'Componente';const scale=Math.min(w,h)*.26*state.inspection.zoom;c.save();c.translate(w/2,h/2);c.rotate(state.cameraYaw*.16);c.fillStyle='#263848';c.strokeStyle='#61e4ff';c.lineWidth=3;if(state.inspection.target==='cpu'){c.fillRect(-scale*.5,-scale*.5,scale,scale);c.strokeRect(-scale*.5,-scale*.5,scale,scale);}else if(state.inspection.target==='gpu'){c.fillRect(-scale,-scale*.35,scale*2,scale*.7);c.strokeRect(-scale,-scale*.35,scale*2,scale*.7);}else{c.fillRect(-scale*.8,-scale*.55,scale*1.6,scale*1.1);c.strokeRect(-scale*.8,-scale*.55,scale*1.6,scale*1.1);}if(state.inspection.exploded){c.strokeStyle='#ffb454';for(let i=0;i<4;i++)c.strokeRect(-scale*.8-i*10,-scale*.55-i*7,scale*1.6+i*20,scale*1.1+i*14);}c.restore();c.fillStyle='#e8f8ff';c.font='700 18px system-ui';c.fillText(`INSPEÇÃO 360° • ${label}`,24,42);c.fillStyle='#90b9ca';c.font='13px system-ui';c.fillText(`${INSPECTION_API?.VIEWS?.[state.inspection.view]?.label||'Isométrica'} • Zoom ${Math.round(state.inspection.zoom*100)}%`,24,66);$('#hwRenderStatus').textContent='Inspeção 2.5D • Modo Baixo';$('#hwRenderStats').textContent=state.inspection.exploded?'Vista explodida':'Vista isolada';lowRaf=requestAnimationFrame(drawLow);return;}
    const color=COLORS[state.caseColor]||COLORS.black,g=FAMILY_API?.sceneGeometry?.(state.family,CASE_API?.sceneGeometry?.(e.parts.cs))||CASE_API?.sceneGeometry?.(e.parts.cs)||{width:6.9,height:7.25,depth:7.35};
    c.clearRect(0,0,w,h);const bg=c.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#06111d');bg.addColorStop(1,'#111b2a');c.fillStyle=bg;c.fillRect(0,0,w,h);c.strokeStyle='rgba(80,210,245,.1)';for(let x=0;x<w;x+=28){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}for(let y=0;y<h;y+=28){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
    const margin=28,span=Math.max(1,layout.desk.right-layout.desk.left),unit=Math.min((w-margin*2)/span,(h-155)/Math.max(g.height,6)),worldX=x=>margin+(x-layout.desk.left)*unit,deskY=h*.78,cx=worldX(0),cy=deskY-g.height*unit/2,caseW=g.width*unit,caseH=g.height*unit,scale=unit/1.05,panelOpen=state.caseSidePanel!=='closed',front=e.parts.cs.frontPanel;
    c.fillStyle=state.deskFinish==='white'?'#dbe8f3':state.deskFinish==='wood'?'#7c5b3b':state.deskFinish==='carbon'?'#232a33':'#465464';c.fillRect(worldX(layout.desk.left),deskY,layout.summary.deskWidth*unit,Math.max(8,.46*unit));
    c.fillStyle='#283442';for(const support of layout.supports){const x=worldX(support.position[0]),height=support.size[1]*unit;c.fillRect(x-support.size[0]*unit/2,deskY+Math.max(8,.46*unit),Math.max(4,support.size[0]*unit),Math.max(12,height));}
    c.save();c.translate(cx,cy);c.rotate(Math.sin(state.cameraYaw)*.06);c.fillStyle=color;c.fillRect(-caseW/2,-caseH/2,caseW,caseH);c.fillStyle='rgba(15,35,52,.92)';c.fillRect(-caseW/2+17*scale,-caseH/2+17*scale,caseW-34*scale,caseH-34*scale);c.strokeStyle='#79e7ff';c.lineWidth=1.2;c.strokeRect(-caseW/2,-caseH/2,caseW,caseH);
    if(front==='mesh'||front==='perforated'||front==='workstation'){c.strokeStyle='rgba(150,190,207,.52)';for(let y=-caseH*.42;y<caseH*.43;y+=10*scale){c.beginPath();c.moveTo(-caseW/2+5*scale,y);c.lineTo(caseW/2-5*scale,y);c.stroke();}}
    if(front==='glass'){c.fillStyle='rgba(122,198,229,.13)';c.fillRect(-caseW/2+5*scale,-caseH/2+5*scale,caseW-10*scale,caseH-10*scale);}
    if(front==='solid'||front==='side-intake'){c.fillStyle='rgba(0,0,0,.22)';c.fillRect(-caseW/2+7*scale,-caseH/2+7*scale,caseW-14*scale,caseH-14*scale);c.strokeStyle=front==='side-intake'?'#53dff7':'#425768';for(let y=-caseH*.38;y<caseH*.39;y+=18*scale){for(const side of [-1,1]){c.beginPath();c.moveTo(side*(caseW/2-5*scale),y);c.lineTo(side*(caseW/2-14*scale),y);c.stroke();}}}
    if(state.caseStructureVisible){c.strokeStyle='rgba(176,204,219,.22)';c.strokeRect(-caseW*.39,-caseH*.36,caseW*.7,caseH*.68);c.fillStyle='rgba(34,52,66,.7)';c.fillRect(-caseW*.43,caseH*.23,caseW*.82,caseH*.16);}
    const explode=state.exploded?1.18:1;c.fillStyle='#185342';c.fillRect((-caseW*.35)*explode,-caseH*.28,caseW*.42,caseH*.58);c.fillStyle='#d1d7de';c.fillRect(-caseW*.22,-caseH*.12,caseW*.12,caseW*.12);c.fillStyle='#1683a8';for(let i=0;i<e.parts.ram.sticks;i++)c.fillRect(caseW*.03+i*12*scale,-caseH*.24,7*scale,Math.min(105*scale,caseH*.35));if(state.gpu!=='integrated'){c.fillStyle=e.parts.gpu.brand==='AMD'?'#8f2633':'#26343d';c.fillRect(-caseW*.05,caseH*.04,caseW*.52,55*scale);}c.fillStyle='#27313b';c.fillRect(-caseW*.35,caseH*.26,caseW*.38,caseH*.18);c.fillStyle='#2d657d';c.fillRect(caseW*.13,-caseH*.32,caseW*.22,45*scale);
    if(e.parts.cs.sidePanel!=='open'){c.strokeStyle=panelOpen?'rgba(103,239,185,.8)':'rgba(143,207,233,.65)';c.lineWidth=panelOpen?3:2;c.strokeRect(panelOpen?caseW*.54:-caseW/2+3*scale,panelOpen?-caseH*.42:-caseH/2+3*scale,panelOpen?caseW*.32:caseW-6*scale,panelOpen?caseH*.84:caseH-6*scale);}
    if(state.thermalOverlay&&state.airflow){c.lineWidth=3;c.strokeStyle='rgba(56,217,255,.78)';for(let i=0;i<Math.max(1,e.thermal.intakeFans);i++){const y=-caseH*.28+i*caseH*.18;c.beginPath();c.moveTo(caseW*.52,y);c.lineTo(caseW*.12,y);c.stroke();}c.strokeStyle='rgba(255,135,92,.78)';for(let i=0;i<Math.max(1,e.thermal.exhaustFans);i++){const x=-caseW*.18+i*caseW*.18;c.beginPath();c.moveTo(x,-caseH*.05);c.lineTo(x,-caseH*.5);c.stroke();}}
    c.restore();
    for(const lowScreen of layout.objects.filter(item=>item.meta?.kind==='screen')){const sx=worldX(lowScreen.position[0]),sw=lowScreen.size[0]*unit,sh=lowScreen.size[1]*unit,sy=deskY-(lowScreen.position[1]-layout.desk.topY)*unit;c.fillStyle='#101b25';c.fillRect(sx-sw/2,sy-sh/2,sw,sh);c.fillStyle=['desktop','benchmark','warning','throttling'].includes(state.system?.phase)?(state.system.os==='linuxMint'?'#265b36':'#0b6e9e'):['smoke','fire','shutdown'].includes(state.system?.phase)?'#170506':'#02070d';c.fillRect(sx-sw*.44,sy-sh*.4,sw*.88,sh*.8);}for(const support of layout.objects.filter(item=>['base','neck','pole','rail','arm','clamp'].includes(item.meta?.kind))){const x=worldX(support.position[0]),y=deskY-(support.position[1]-layout.desk.topY)*unit;c.fillStyle='#283443';c.fillRect(x-support.size[0]*unit/2,y-support.size[1]*unit/2,Math.max(3,support.size[0]*unit),Math.max(3,support.size[1]*unit));}
    for(const id of ['keyboard','mouse','controller']){const item=layout.objects.find(entry=>entry.id===id);if(!item)continue;const x=worldX(item.position[0]),width=Math.max(5,item.size[0]*unit);c.fillStyle=id==='keyboard'?'#263542':id==='mouse'?'#39495a':'#202833';c.fillRect(x-width/2,deskY-Math.max(4,item.size[1]*unit),width,Math.max(4,item.size[1]*unit));}
    if(state.cinematic?.active){const shot=CINEMATIC_API?.current?.(state.cinematic);c.fillStyle='rgba(5,13,22,.76)';c.fillRect(18,18,Math.min(w-36,330),52);c.fillStyle='#75e8ff';c.font='700 11px system-ui';c.fillText('MODO CINEMA',30,39);c.fillStyle='#f2fbff';c.font='700 14px system-ui';c.fillText(shot?.label||'Apresentação automática',30,59,Math.min(w-60,290));}
    c.fillStyle=layout.safe?'#62e6b0':'#ff8090';c.font='700 11px system-ui';c.fillText(layout.safe?'SETUP FÍSICO SEGURO':'REVISAR COLISÕES',20,118);
    c.fillStyle='#e5f8ff';c.font='700 15px system-ui';c.fillText(`${e.parts.cs.caseClass} • ${e.parts.cpu.label}`,20,78,Math.max(160,w-40));c.fillStyle='#8db6c9';c.font='12px system-ui';c.fillText(`Modo Baixo • ${CASE_API?.dimensionsText?.(e.parts.cs)||''}`,20,98,Math.max(160,w-40));c.fillStyle='#d5f7ff';c.fillText(`Painel: ${CASE_API?.panelLabel?.(e.parts.cs,state.caseSidePanel)||state.caseSidePanel} • Prontidão ${e.readiness}%`,20,h-42);c.fillStyle='#91b9ca';c.fillText(`${STUDIO_BACKDROPS[state.backdrop]} • ${DESK_FINISHES[state.deskFinish]} • ${AMBIENT_PRESETS[state.ambientPreset]}`,20,h-22);$('#hwRenderStatus').textContent='Canvas 2D/2.5D • Modo Baixo';$('#hwRenderStats').textContent=`CPU ${e.thermal.cpuTemperature} °C • GPU ${e.thermal.gpuTemperature} °C • ${e.thermal.pressure}`;canvas._lastDraw=time;lowRaf=requestAnimationFrame(drawLow);
  }

  function bindLowControls(){
    const canvas=$('#hardwareCanvas2d');if(!canvas)return;const down=event=>{lowDrag={x:event.clientX,y:event.clientY,yaw:state.cameraYaw,pitch:state.cameraPitch};canvas.setPointerCapture?.(event.pointerId);};const move=event=>{if(!lowDrag)return;state.cameraYaw=lowDrag.yaw+(event.clientX-lowDrag.x)*.009;state.cameraPitch=LAYOUT_API?.clampCameraPitch?.(calculateSetupLayout(),lowDrag.pitch+(event.clientY-lowDrag.y)*.006)||clamp(lowDrag.pitch+(event.clientY-lowDrag.y)*.006,-.08,1.18);};const up=()=>{lowDrag=null;persist();};const wheel=event=>{event.preventDefault();if(state.inspection?.active){state.inspection.zoom=clamp(state.inspection.zoom-Math.sign(event.deltaY)*.1,.7,2.5);renderInspectionPanel();}else state.cameraDistance=LAYOUT_API?.clampCameraDistance?.(calculateSetupLayout(),state.cameraDistance+Math.sign(event.deltaY))||clamp(state.cameraDistance+Math.sign(event.deltaY),9,32);persist();};canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);canvas.addEventListener('wheel',wheel,{passive:false});canvas._cleanup=()=>{canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',up);canvas.removeEventListener('wheel',wheel);};
  }

  function startLowRenderer(){destroyThree();cancelAnimationFrame(lowRaf);const canvas=$('#hardwareCanvas2d');canvas?._cleanup?.();const area=$('.hardware-render-area');area.dataset.quality='low';canvas.hidden=false;$('#hardwareCanvas3d').hidden=true;bindLowControls();lowRaf=requestAnimationFrame(drawLow);}
  function startRenderer(force=false){
    cancelAnimationFrame(lowRaf);lowRaf=0;$('#hardwareCanvas2d')._cleanup?.();const area=$('.hardware-render-area');if(!area)return;area.dataset.quality=state.labGraphics;
    if(state.labGraphics==='low'){startLowRenderer();return;}$('#hardwareCanvas2d').hidden=true;$('#hardwareCanvas3d').hidden=false;if(force)destroyThree();initThree();
  }

  async function mount(host,context){
    root=host;ctx=context;const legacy=await ctx.storage.get(LEGACY_KEY,null);state=normalize(await ctx.storage.get(KEY,legacy||defaults));renderShell();refreshControls();bindEvents();bindLowControls();renderPanels();renderLog();resizeObserver=new ResizeObserver(()=>{resizeRenderer();if(state.labGraphics==='low')drawLow();});resizeObserver.observe($('.hardware-render-area'));startRenderer();
  }

  function hardwareContext(e=evaluate()){const layout=calculateSetupLayout(e),family=familyProfile(),price=familyPrice(e);return{system:state.system,benchmarkIncident:state.benchmarkIncident,family:{id:state.family,label:family.label,category:family.category,formFactor:family.formFactor,price},inspection:state.inspection,cinematic:state.cinematic,case:e.parts.cs.label,board:e.parts.board.label,cpu:e.parts.cpu.label,ram:e.parts.ram.label,gpu:e.parts.gpu.label,storage:e.parts.storage.label,storage2:e.parts.storage2.label,psu:e.parts.psu.label,cooling:e.parts.cooler.label,monitor:e.parts.monitor.label,monitors:activeMonitorItems(e).map(item=>item.label),monitorSetup:{count:state.monitorCount,layout:state.monitorLayout,mount:state.monitorMount},peripherals:[e.parts.keyboard.label,e.parts.mouse.label,e.parts.audio.label,e.parts.webcam.label,e.parts.printer.label],consumptionW:e.consumption,recommendedW:e.recommended,temperatureC:e.temperature,airflow:e.airflow,thermal:e.thermal,readiness:e.readiness,balance:e.balance,compatible:e.ok&&layout.safe,graphics:state.labGraphics,physicalLayout:{safe:layout.safe,status:layout.status,desk:layout.summary,camera:layout.camera,warnings:layout.warnings,errors:layout.errors},visual:{quality:state.labGraphics,caseFinish:state.caseFinish,glassStyle:state.glassStyle,rgbIntensity:state.rgbIntensity,materialDetail:state.materialDetail,contactShadows:state.contactShadows,pipeline:MATERIAL_API?.stats?.(state.labGraphics)||null},caseStructure:{class:e.parts.cs.caseClass,dimensionsMm:e.parts.cs.dimensionsMm,frontPanel:e.parts.cs.frontPanel,sidePanel:e.parts.cs.sidePanel,panelState:state.caseSidePanel,chambers:e.parts.cs.chambers,mounts:e.parts.cs.mounts},assembly:{enabled:state.assembly.enabled,prepared:state.assembly.prepared,progress:assemblyEngine?.progress?.()||null,attempts:state.assembly.attempts,successful:state.assembly.successful,invalid:state.assembly.invalid,placed:state.assembly.placed},warnings:[...layout.warnings,...e.warnings],errors:[...layout.errors,...e.errors]};}
  function exportPayload(){const e=evaluate(),benchmark=state.benchmarkResults,layout=calculateSetupLayout(e);return{text:['HARDWARE STUDIO 3D',`Versão do módulo: ${MODULE_VERSION}`,`Atualizado em: ${moduleDate()}`,`Qualidade gráfica: ${state.labGraphics}`,`Pipeline visual: ${CASE_FINISHES[state.caseFinish]} • ${GLASS_STYLES[state.glassStyle]} • RGB ${RGB_INTENSITIES[state.rgbIntensity]}`,`Texturas PBR: ${state.materialDetail?'ativas':'simplificadas'} • Sombras de contato: ${state.contactShadows?'ativas':'desligadas'}`,`Família: ${familyProfile().label} (${familyProfile().formFactor})`,`Preço educativo: ${familyPrice(e).formatted} — referência ${familyPrice(e).reference}`,`Modo: ${state.mode}`,`Studio: ${STUDIO_BACKDROPS[state.backdrop]} / ${DESK_FINISHES[state.deskFinish]} / ${AMBIENT_PRESETS[state.ambientPreset]}`,`Ferramentas: ${TOOL_LEVELS[state.toolkit]} • Destaque ${ACCENT_COLORS[state.accentColor]}`,`Gabinete: ${e.parts.cs.label} — ${e.parts.cs.caseClass} — ${state.caseColor}`,`Dimensões: ${CASE_API?.dimensionsText?.(e.parts.cs)||'—'}`,`Painel frontal: ${e.parts.cs.frontPanelLabel||e.parts.cs.frontPanel}`,`Painel lateral: ${CASE_API?.panelLabel?.(e.parts.cs,state.caseSidePanel)||state.caseSidePanel}`,`Montagens de radiador: ${CASE_API?.mountSummary?.(e.parts.cs)||'—'}`,`Placa-mãe: ${e.parts.board.label}`,`Processador: ${e.parts.cpu.label} (${e.parts.cpu.generation})`,`Memória: ${e.parts.ram.label}`,`GPU: ${e.parts.gpu.label} (${e.parts.gpu.generation})`,`Armazenamento principal: ${e.parts.storage.label}`,`Armazenamento secundário: ${e.parts.storage2.label}`,`Fonte: ${e.parts.psu.label}`,`Refrigeração: ${e.parts.cooler.label}`,`Monitores: ${activeMonitorItems(e).map(item=>item.label).join(' • ')}`,`Layout de telas: ${layoutMonitorDescription(e)}`,`Layout físico: ${layout.status} • bancada ${layout.summary.deskWidth.toFixed(1)} × ${layout.summary.deskDepth.toFixed(1)} u`,`Entrada: ${e.parts.keyboard.label} / ${e.parts.mouse.label}`,`Saída: ${e.parts.audio.label} / ${e.parts.printer.label}`,`Consumo: ${e.consumption} W`,`Temperatura CPU/GPU/Gabinete: ${e.thermal.cpuTemperature}/${e.thermal.gpuTemperature}/${e.thermal.caseTemperature} °C`,`Fluxo: ${e.thermal.effectiveCfm} CFM • ${e.thermal.pressure} • entrada ${e.thermal.intakeFans} / exaustão ${e.thermal.exhaustFans}`,`Filtro: ${e.thermal.labels.filter} • risco de poeira ${e.thermal.dustRisk}%`,`Carga térmica: ${e.thermal.labels.workload} • ambiente ${state.ambientTemperature} °C`,`Radiador: ${e.thermal.labels.radiator}`,`Prontidão: ${e.readiness}%`,`Equilíbrio: ${e.balance}%`,`Compatibilidade: ${e.ok?'OK':'FALHA'}`,`Montagem manual: ${state.assembly.enabled?(state.assembly.prepared?'ativa':'ativada'):'desativada'}`,`Encaixes corretos: ${state.assembly.successful} • tentativas inválidas: ${state.assembly.invalid}`,`Sistema operacional: ${SYSTEM_API?.OS_PROFILES?.[state.system.os]?.label||state.system.os} • fase ${state.system.phase}`,`Incidente térmico: ${state.benchmarkIncident.stage} • CPU ${state.benchmarkIncident.cpuTemp||'—'} °C • GPU ${state.benchmarkIncident.gpuTemp||'—'} °C`,benchmark?`Benchmark ${benchmark.target}: ${benchmark.overall}/100`:'Benchmark: não executado','',...state.logs.map(item=>`[${new Date(item.time).toLocaleString('pt-BR')}] ${item.text}`)].join('\n'),native:JSON.stringify({state,context:hardwareContext(e)},null,2),backup:state,meta:[{label:'Compatibilidade',value:e.ok&&layout.safe?'OK':'Falha'},{label:'Prontidão',value:`${e.readiness}%`},{label:'Benchmark',value:benchmark?`${benchmark.overall}/100`:'—'}]};}
  function help(){return`<h3>Hardware Studio Premium 3D</h3><p><strong>Versão ${MODULE_VERSION}</strong> • atualizada em ${moduleDate()}.</p><p>Esta versão adiciona famílias completas, inspeção 360°, modo cinema, POST detalhado, instalação simulada de Windows 11 ou Linux Mint, área de trabalho, benchmark térmico progressivo, throttling, desligamento de proteção e incidente extremo educativo com extintor virtual. Escolha perfis ou monte livremente. O laboratório valida socket, memória, formato, energia, refrigeração, armazenamento, monitor e periféricos. Agora também oferece montagem manual 3D por mouse ou toque, gabinetes com classes e dimensões próprias, painel lateral manipulável, motor térmico por zonas e um motor de layout físico que dimensiona a bancada, apoia monitor e periféricos, impede sobreposição e mantém a câmera fora dos objetos. A estação agora suporta uma, duas ou três telas, braços articulados, trilho profissional, telas verticais, empilhadas e cockpit panorâmico. Os modos Baixo, Médio, Alto e Ultra ajustam a qualidade da cena; Ultra ativa materiais PBR, vidro, sombras, shader de grade, RGB e partículas. Os benchmarks são didáticos e não representam medições oficiais.</p>`;}
  async function unmount(){benchmarkRunToken++;if(benchmarkDecisionResolve){benchmarkDecisionResolve('pause');benchmarkDecisionResolve=null;}if(state?.cinematic)CINEMATIC_API?.stop?.(state.cinematic);exitInspection(false);clearTimers();resizeObserver?.disconnect();resizeObserver=null;destroyThree();cancelAnimationFrame(lowRaf);$('#hardwareCanvas2d')?._cleanup?.();await persist();root=null;ctx=null;state=null;}

  window.LABDS_LABS['hardware-lab']={mount,unmount,exportPayload,help};
})();
