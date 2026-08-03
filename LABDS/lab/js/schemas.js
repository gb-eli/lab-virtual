'use strict';

(function(){
  window.LABDS = window.LABDS || {};

  const VERSION = 1;
  const BLOCK_TYPES = new Set(['start','set','input','output','if','else','repeat','increment','wait','function','call','move','turnRight','turnLeft','paint','close','end']);
  const DEVICES = new Set(['mobile','tablet','laptop','desktop','wide']);
  const THEMES = new Set(['system','dark','light','contrast']);
  const FONT_SIZES = new Set(['normal','large','xlarge']);
  const ALLOWED_STATE_KEYS = new Set([
    'lab.blocks.state','lab.graphics.state','lab.hardware.state','lab.javascript.state','lab.network.state',
    'lab.python.state','lab.sql.state','lab.web.state','lab.vm.v5.state','lab.git.state','lab.security.state',
    'lab.sysadmin.state','lab.codegames.state',
    'lab.hardware.v7','lab.git.v1','lab.security.v1','lab.sysadmin.v1','lab.codegames.v1','lab.codegames.v8',
    'lab.fintech.state','lab.blockchain.state','lab.communication.state','lab.displaymedia.state',
    'lab.automation.state','lab.ai.state','lab.networkops.state','lab.gameengine.state','lab.electronics.state',
    'lab.v3.global','eduauth.audit.v1','lab.help.state','lab.productivity.state','lab.market.state','lab.printing3d.state','lab.energy.state','lab.traffic.state','lab.worldtools.state','lab.iptv.state','lab.device.state','lab.teacher.state'
  ]);
  const ALLOWED_PREFIXES = ['lab.terminal.','lab.session.','lab.learning.','lab.challenge.'];

  function isPlainObject(value){
    if(!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
  }

  function finite(value, fallback=0, min=-Number.MAX_SAFE_INTEGER, max=Number.MAX_SAFE_INTEGER){
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  }

  function text(value, max=2000){
    return String(value ?? '').replace(/\u0000/g,'').slice(0,max);
  }

  function bool(value, fallback=false){ return typeof value === 'boolean' ? value : fallback; }
  function enumValue(value, allowed, fallback){ return allowed.has(value) ? value : fallback; }
  function color(value, fallback='#38e0bd'){
    const raw=String(value??'').trim();
    if(/^#[0-9a-f]{6}$/i.test(raw)) return raw.toLowerCase();
    if(/^rgba?\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}(?:\s*,\s*(?:0(?:\.\d+)?|1(?:\.0+)?))?\s*\)$/i.test(raw)) return raw.slice(0,64);
    return fallback;
  }

  function safeKey(key){
    return typeof key==='string' && key.length<=220 && !['__proto__','prototype','constructor'].includes(key) && /^[a-zA-Z0-9._:-]+$/.test(key);
  }

  function deepSanitize(value, options={}, depth=0, seen=new WeakSet()){
    const limits={maxDepth:options.maxDepth??12,maxArray:options.maxArray??3000,maxKeys:options.maxKeys??1000,maxString:options.maxString??200000};
    if(depth>limits.maxDepth) return null;
    if(value===null || typeof value==='boolean') return value;
    if(typeof value==='number') return Number.isFinite(value)?value:null;
    if(typeof value==='string') return text(value,limits.maxString);
    if(typeof value==='bigint') return String(value);
    if(typeof value==='function' || typeof value==='symbol' || typeof value==='undefined') return null;
    if(typeof value!=='object') return null;
    if(seen.has(value)) return null;
    seen.add(value);
    if(Array.isArray(value)) return value.slice(0,limits.maxArray).map(item=>deepSanitize(item,limits,depth+1,seen));
    if(!isPlainObject(value)) return null;
    const output=Object.create(null);
    for(const [key,item] of Object.entries(value).slice(0,limits.maxKeys)){
      if(!safeKey(key)) continue;
      output[key]=deepSanitize(item,limits,depth+1,seen);
    }
    return output;
  }

  function sanitizeBlocks(value){
    const input=isPlainObject(value)?value:{};
    const blocks=Array.isArray(input.blocks)?input.blocks:[];
    const visual=isPlainObject(input.visual)?input.visual:{};
    return {
      schemaVersion:2,
      blocks:blocks.slice(0,240).map(item=>({type:BLOCK_TYPES.has(item?.type)?item.type:'output'})),
      logs:Array.isArray(input.logs)?input.logs.slice(-100).map(item=>text(item,500)):[],
      speed:finite(input.speed,1,.5,2),
      studentName:text(input.studentName||'Aluno',40),
      visual:{
        x:Math.round(finite(visual.x,4,0,8)),
        y:Math.round(finite(visual.y,6,0,8)),
        dir:Math.round(finite(visual.dir,0,0,3)),
        color:color(visual.color,'#62e6ff'),
        counter:Math.round(finite(visual.counter,0,-9999,9999)),
        message:text(visual.message||'',120)
      }
    };
  }

  function sanitizeGraphics(value){
    const input=isPlainObject(value)?value:{};
    const width=Math.round(finite(input.width,16,2,48));
    const height=Math.round(finite(input.height,16,2,48));
    const pixels=Object.create(null);
    if(isPlainObject(input.pixels)){
      for(const [key,item] of Object.entries(input.pixels).slice(0,width*height)){
        const match=/^(\d{1,2}),(\d{1,2})$/.exec(key);
        if(!match) continue;
        const x=Number(match[1]),y=Number(match[2]);
        if(x<width&&y<height) pixels[`${x},${y}`]=color(item,'transparent');
      }
    }
    return {
      schemaVersion:VERSION,
      color:color(input.color),
      alpha:finite(input.alpha,1,0,1),
      width,height,
      zoom:Math.round(finite(input.zoom,22,10,42)),
      showGrid:bool(input.showGrid,true),
      tool:['paint','erase','pick'].includes(input.tool)?input.tool:'paint',
      pixels,
      history:Array.isArray(input.history)?input.history.map(item=>color(item)).slice(0,24):[]
    };
  }

  function sanitizeWeb(value){
    const input=isPlainObject(value)?value:{};
    return {
      schemaVersion:VERSION,
      html:text(input.html,200000),
      css:text(input.css,200000),
      js:text(input.js,200000),
      device:enumValue(input.device,DEVICES,'desktop'),
      auto:bool(input.auto,true),
      console:[]
    };
  }

  function sanitizeCode(value, language){
    const input=isPlainObject(value)?value:{};
    return {schemaVersion:VERSION,code:text(input.code,200000),stdin:text(input.stdin,20000),logs:[],packages:language==='python'&&Array.isArray(input.packages)?input.packages.map(v=>text(v,40)).slice(0,20):[]};
  }

  function sanitizeSql(value){
    const input=isPlainObject(value)?value:{};
    const database=typeof input.database==='string'&&input.database.length<=30_000_000?input.database:null;
    return {schemaVersion:VERSION,sql:text(input.sql,200000),database,history:Array.isArray(input.history)?input.history.slice(-100).map(item=>deepSanitize(item,{maxDepth:4,maxString:200000})):[],lastResults:[]};
  }

  function sanitizeVm(value){
    const input=deepSanitize(value,{maxDepth:10,maxArray:500,maxKeys:300,maxString:5000});
    return isPlainObject(input)?{...input,schemaVersion:VERSION}: {schemaVersion:VERSION};
  }

  function sanitizePreferences(value){
    const input=isPlainObject(value)?value:{};
    return {
      theme:enumValue(input.theme,THEMES,'system'),
      fontSize:enumValue(input.fontSize,FONT_SIZES,'normal'),
      reducedMotion:bool(input.reducedMotion,false),
      highContrast:bool(input.highContrast,false),
      sharedDevice:bool(input.sharedDevice,false)
    };
  }

  function unscopedKey(key){
    const raw=String(key||'');
    const match=/^session\.[a-zA-Z0-9-]{1,120}\.(.+)$/.exec(raw);
    return match?match[1]:raw;
  }

  function sanitizeState(key,value){
    const base=unscopedKey(key);
    if(base==='lab.blocks.state') return sanitizeBlocks(value);
    if(base==='lab.graphics.state') return sanitizeGraphics(value);
    if(base==='lab.web.state') return sanitizeWeb(value);
    if(base==='lab.javascript.state') return sanitizeCode(value,'javascript');
    if(base==='lab.python.state') return sanitizeCode(value,'python');
    if(base==='lab.sql.state') return sanitizeSql(value);
    if(base==='lab.vm.v5.state') return sanitizeVm(value);
    return deepSanitize(value,{maxDepth:14,maxArray:5000,maxKeys:1500,maxString:500000});
  }

  function isAllowedStateKey(key){ const base=unscopedKey(key);return ALLOWED_STATE_KEYS.has(base)||ALLOWED_PREFIXES.some(prefix=>base.startsWith(prefix)); }

  function sanitizeDump(payload){
    if(!isPlainObject(payload)) throw new Error('Backup inválido: estrutura principal incorreta.');
    const stateEntries=isPlainObject(payload.states)?Object.entries(payload.states):[];
    const localEntries=isPlainObject(payload.local)?Object.entries(payload.local):[];
    if(stateEntries.length>2000||localEntries.length>2000) throw new Error('O backup contém itens demais.');
    const states=Object.create(null),local=Object.create(null),rejected=[];
    for(const [key,value] of stateEntries){
      if(!safeKey(key)||!isAllowedStateKey(key)){rejected.push(key);continue;}
      states[key]=sanitizeState(key,value);
    }
    for(const [key,value] of localEntries){
      if(!safeKey(key)||!key.startsWith('labds.')){rejected.push(key);continue;}
      const raw=text(value,5_000_000);
      if(key==='labds.pref.accessibility'){
        try{local[key]=JSON.stringify(sanitizePreferences(JSON.parse(raw)));}catch{local[key]=JSON.stringify(sanitizePreferences({}));}
      }else local[key]=raw;
    }
    if(rejected.length>50) throw new Error('O backup contém muitas chaves não reconhecidas.');
    return {schemaVersion:VERSION,states,local,rejected};
  }

  window.LABDS.Schemas={VERSION,safeKey,deepSanitize,sanitizeState,sanitizeDump,sanitizePreferences,sanitizeBlocks,sanitizeGraphics,sanitizeWeb,sanitizeSql,isAllowedStateKey};
})();
