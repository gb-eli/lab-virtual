'use strict';
(function(global){
  const E=Object.create(null);

/* src/eduauth/config/platform.js */
E.CONFIG = Object.freeze({
  protocol: 'EDUAUTH',
  protocolVersion: 1,
  coreVersion: '1.0.0',
  platformId: 'lab-virtual-ds',
  platformCode: 1,
  platformName: 'Laboratório Virtual DS',
  platformVersion: '4.0.0-pages',
  environment: 'development',
  productionProvisioned: false,
  developmentWarning: 'DEVELOPMENT TEST KEY — DO NOT USE IN PRODUCTION',
  keys: {
    class: {
      keyId: 'lab-virtual-ds-class-01',
      version: 1,
      rawBase64: 'G4cY+1yxRvlq+pw6g34T9ZL76pQe+Q1xMHts8fsmdNQ='
    },
    session: {
      keyId: 'lab-virtual-ds-session-01',
      version: 1,
      rawBase64: 'SYXpUp3Z+zLMEoE9e5Axq4GeHZa2IhAeTcn3O3q4J+I='
    },
    signingPublicKeyId: 'teacher-signing-01',
    recoveryPublicKeyId: 'teacher-recovery-01'
  },
  signingPublicKeyJwk: {
    key_ops: ['verify'], ext: true, kty: 'EC',
    x: 'bwyZXZhLUqm_4O_Mlow2BImSIXbg5uDhL3oqWyhIH7Y',
    y: 'HyqXC_FF1ZN33s-EfggPSRfyibicHyNetUPiL1MlbXQ', crv: 'P-256'
  },
  recoveryPublicKeyJwk: {
    key_ops: ['encrypt'], ext: true, kty: 'RSA',
    n: 'k-aKB_CoYEfs_syXg80zwb3k51n2s0WA8JKr0BKHCP9L9SzQw_Dzriib98w-rCgwDKj5YsVGoYXEx5CCQ4zVCQXEvWDBG2M8tSemI8jDhgI7cBcKT7bVSrmZ7xLGF6Q1-DaEHqDNvRRKmJelNJpERvNWKXr3WIWmmxWvIKKGqn0N5Lnmc7jC1oMfU4GqqGbtLtwYzAgxqFGRFd_VZen12uICMqfIiJL6T1jviRMj7OqPWNOckiHgNwbdnh82P9Sh7fwcmGGYJHhHYBIZe3m9gsWr5b8LT_2hcvtcSI72QVxSbVjVyOkw_1cFZ2XGWTLEJJBUC8LAS4Lpe4g5NUAFnQ',
    e: 'AQAB', alg: 'RSA-OAEP-256'
  },
  requestCode: {
    prefix: 'EA1', encoding: 'BASE32_CROCKFORD', checksum: 'CRC32C',
    caseInsensitive: true, ignoreSeparators: true
  },
  timePolicy: {
    useUtc: true,
    classWindowSeconds: 900,
    sessionWindowSeconds: 300,
    highRiskWindowSeconds: 180,
    allowedClockDriftSlots: 1
  },
  security: {
    maximumAttempts: 5,
    progressiveDelayMs: [0, 600, 1200, 2400, 4800],
    sessionStoragePrefix: 'labds.eduauth.v1',
    auditStorageKey: 'eduauth.audit.v1',
    maxAuditEntries: 500
  }
});


/* src/eduauth/config/actions.js */
E.ACTIONS = Object.freeze({
  'lesson-start': {
    id: 'lesson-start', numericCode: 1, label: 'Iniciar atividade protegida', risk: 'LOW',
    preferredMode: 'CLASS_SHARED_PIN', pinLength: 8, ttlSeconds: 900,
    sharedAcrossClass: true, sessionBound: false, singleUse: false, requireReason: false
  },
  'challenge-start': {
    id: 'challenge-start', numericCode: 2, label: 'Iniciar desafio protegido', risk: 'LOW',
    preferredMode: 'CLASS_SHARED_PIN', pinLength: 8, ttlSeconds: 900,
    sharedAcrossClass: true, sessionBound: false, singleUse: false, requireReason: false
  },
  'teacher-mode-access': {
    id: 'teacher-mode-access', numericCode: 3, label: 'Abrir o Modo Professor', risk: 'MEDIUM',
    preferredMode: 'SESSION_SCOPED_PIN', pinLength: 8, ttlSeconds: 300,
    sharedAcrossClass: false, sessionBound: true, singleUse: true, requireReason: false
  },
  'vm-instructor-access': {
    id: 'vm-instructor-access', numericCode: 4, label: 'Liberar o painel do instrutor da máquina virtual', risk: 'MEDIUM',
    preferredMode: 'SESSION_SCOPED_PIN', pinLength: 8, ttlSeconds: 300,
    sharedAcrossClass: false, sessionBound: true, singleUse: true, requireReason: false
  },
  'teacher-activity-delete': {
    id: 'teacher-activity-delete', numericCode: 5, label: 'Excluir uma atividade local do professor', risk: 'HIGH',
    preferredMode: 'SESSION_SCOPED_PIN', strongerMode: 'SIGNED_GRANT', pinLength: 10, ttlSeconds: 180,
    sharedAcrossClass: false, sessionBound: true, singleUse: true, requireReason: true
  }
});
E.RISK_ORDER = Object.freeze({LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4});
E.MODE_CODE = Object.freeze({CLASS_SHARED_PIN:1, SESSION_SCOPED_PIN:2, SIGNED_GRANT:3, PROFILE_RECOVERY_ENVELOPE:4});
E.MODE_PREFIX = Object.freeze({CLASS_SHARED_PIN:'C1', SESSION_SCOPED_PIN:'S1', SIGNED_GRANT:'G1', PROFILE_RECOVERY_ENVELOPE:'R1'});
E.MODE_FROM_CODE = Object.freeze(Object.fromEntries(Object.entries(E.MODE_CODE).map(([key,value])=>[value,key])));


/* src/eduauth/config/registries.js */
E.REGISTRIES = Object.freeze({
  platforms: {'01':'lab-virtual-ds'},
  classes: {
    '01':'1ds-manha','02':'2ds-manha','03':'3ds-manha','04':'1adm-manha','05':'2adm-manha',
    '06':'1portos-manha','07':'2ds-noite','08':'ds-subsequente-noite','09':'outra-turma'
  },
  classLabels: {
    '1ds-manha':'1º DS — Manhã','2ds-manha':'2º DS — Manhã','3ds-manha':'3º DS — Manhã',
    '1adm-manha':'1º ADM — Manhã','2adm-manha':'2º ADM — Manhã','1portos-manha':'1º Portos — Manhã',
    '2ds-noite':'2º DS — Noite','ds-subsequente-noite':'DS Subsequente — Noite','outra-turma':'Outra turma'
  },
  subjects: {
    '01':'desenvolvimento-de-sistemas','02':'programacao-front-end','03':'introducao-programacao',
    '04':'introducao-computacao','05':'informatica-empresarial','06':'programacao-ds',
    '07':'computacao-grafica','08':'redes-e-comunicacao','09':'sistemas-operacionais','10':'outra-disciplina'
  },
  subjectLabels: {
    'desenvolvimento-de-sistemas':'Desenvolvimento de Sistemas','programacao-front-end':'Programação Front-End',
    'introducao-programacao':'Introdução à Programação','introducao-computacao':'Introdução à Computação',
    'informatica-empresarial':'Informática Empresarial','programacao-ds':'Programação no DS',
    'computacao-grafica':'Computação Gráfica','redes-e-comunicacao':'Redes e Comunicação',
    'sistemas-operacionais':'Sistemas Operacionais','outra-disciplina':'Outra disciplina'
  },
  lessons: Object.fromEntries([['00','atividade-atual'],...Array.from({length:30},(_,i)=>[String(i+1).padStart(2,'0'),`aula-${String(i+1).padStart(2,'0')}`])]),
  activities: {
    '01':'atividade-principal','02':'desafio-principal','03':'modo-professor','04':'maquina-virtual-instrutor','05':'atividade-professor-local'
  },
  actions: {'01':'lesson-start','02':'challenge-start','03':'teacher-mode-access','04':'vm-instructor-access','05':'teacher-activity-delete'}
});
E.REVERSE_REGISTRIES = Object.freeze(Object.fromEntries(
  ['platforms','classes','subjects','lessons','activities','actions'].map(name=>[
    name,Object.freeze(Object.fromEntries(Object.entries(E.REGISTRIES[name]).map(([code,id])=>[id,Number(code)])))
  ])
));


/* src/eduauth/core/encoding.js */
E.textEncoder = new TextEncoder();
E.textDecoder = new TextDecoder();
E.CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
E.toBytes = value => value instanceof Uint8Array ? value : E.textEncoder.encode(String(value ?? ''));
E.concatBytes = (...parts) => {
  const arrays=parts.map(E.toBytes), total=arrays.reduce((n,item)=>n+item.length,0), out=new Uint8Array(total);
  let offset=0; for(const item of arrays){out.set(item,offset);offset+=item.length;} return out;
};
E.bytesToHex = bytes => [...E.toBytes(bytes)].map(value=>value.toString(16).padStart(2,'0')).join('');
E.hexToBytes = hex => {
  const clean=String(hex||'').replace(/[^0-9a-f]/gi,'');
  if(clean.length%2) throw new Error('Valor hexadecimal inválido.');
  return Uint8Array.from(clean.match(/.{2}/g)?.map(value=>parseInt(value,16))||[]);
};
E.bytesToBase64 = bytes => {
  let binary=''; for(const value of E.toBytes(bytes)) binary+=String.fromCharCode(value);
  return btoa(binary);
};
E.base64ToBytes = value => {
  const binary=atob(String(value||'')); return Uint8Array.from(binary,char=>char.charCodeAt(0));
};
E.base64UrlEncode = bytes => E.bytesToBase64(bytes).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
E.base64UrlDecode = value => {
  const clean=String(value||'').replace(/-/g,'+').replace(/_/g,'/');
  return E.base64ToBytes(clean+'='.repeat((4-clean.length%4)%4));
};
E.base32Encode = input => {
  const bytes=E.toBytes(input); let bits=0,value=0,out='';
  for(const byte of bytes){value=(value<<8)|byte;bits+=8;while(bits>=5){out+=E.CROCKFORD[(value>>>(bits-5))&31];bits-=5;}}
  if(bits>0)out+=E.CROCKFORD[(value<<(5-bits))&31]; return out;
};
E.normalizeBase32 = value => String(value||'').toUpperCase().replace(/[\s-]/g,'').replace(/O/g,'0').replace(/[IL]/g,'1').replace(/U/g,'V');
E.base32Decode = input => {
  const text=E.normalizeBase32(input);let bits=0,value=0,out=[];
  for(const char of text){const index=E.CROCKFORD.indexOf(char);if(index<0)throw new Error(`Caractere inválido no código: ${char}`);value=(value<<5)|index;bits+=5;if(bits>=8){out.push((value>>>(bits-8))&255);bits-=8;}}
  return Uint8Array.from(out);
};
E.groupCode = (value,size=4) => String(value||'').match(new RegExp(`.{1,${size}}`,'g'))?.join('-')||'';
E.crc32c = input => {
  const bytes=E.toBytes(input);let crc=0xffffffff;
  for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0x82f63b78:0);}
  return (crc^0xffffffff)>>>0;
};
E.uint32Bytes = value => {const out=new Uint8Array(4);new DataView(out.buffer).setUint32(0,Number(value)>>>0,false);return out;};
E.readUint32 = (bytes,offset=0) => new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint32(offset,false);
E.checksumText = bytes => E.base32Encode(E.uint32Bytes(E.crc32c(bytes))).slice(0,7);
E.canonicalize = value => {
  if(value===null||typeof value!=='object')return value;
  if(Array.isArray(value))return value.map(E.canonicalize);
  const out={}; for(const key of Object.keys(value).sort())if(value[key]!==undefined)out[key]=E.canonicalize(value[key]); return out;
};
E.canonicalStringify = value => JSON.stringify(E.canonicalize(value));
E.canonicalEncode = value => E.textEncoder.encode(E.canonicalStringify(value));
E.constantTimeEqual = (left,right) => {
  const a=E.toBytes(left),b=E.toBytes(right);let diff=a.length^b.length,max=Math.max(a.length,b.length);
  for(let i=0;i<max;i++)diff|=(a[i%Math.max(1,a.length)]||0)^(b[i%Math.max(1,b.length)]||0);return diff===0;
};


/* src/eduauth/core/random.js */
E.secureRandomBytes = length => {
  if(!globalThis.crypto?.getRandomValues)throw new Error('Este navegador não oferece geração criptográfica segura.');
  const bytes=new Uint8Array(length);crypto.getRandomValues(bytes);return bytes;
};
E.randomHex = bytes => E.bytesToHex(E.secureRandomBytes(bytes));
E.getEduSessionId = () => {
  const key=`${E.CONFIG.security.sessionStoragePrefix}.sessionId`;
  let value=sessionStorage.getItem(key);
  if(!/^[0-9a-f]{12}$/i.test(value||'')){value=E.randomHex(6);sessionStorage.setItem(key,value);}
  return value.toLowerCase();
};


/* src/eduauth/core/identifiers.js */
E.slug = value => String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
E.resolveRegistryId = (registryName,value,fallback) => {
  const reverse=E.REVERSE_REGISTRIES[registryName]||{};
  const raw=String(value||'').trim();
  if(reverse[raw])return raw;
  const slug=E.slug(raw);
  if(reverse[slug])return slug;
  if(registryName==='classes'){
    const match=Object.entries(E.REGISTRIES.classLabels).find(([,label])=>E.slug(label)===slug);
    if(match)return match[0];
  }
  if(registryName==='subjects'){
    const match=Object.entries(E.REGISTRIES.subjectLabels).find(([,label])=>E.slug(label)===slug);
    if(match)return match[0];
  }
  return fallback;
};
E.registryCode = (name,id) => {
  const code=E.REVERSE_REGISTRIES[name]?.[id];if(!Number.isInteger(code))throw new Error(`Identificador não registrado: ${name}/${id}`);return code;
};
E.registryId = (name,code) => {
  const id=E.REGISTRIES[name]?.[String(code).padStart(2,'0')];if(!id)throw new Error(`Código de registro desconhecido: ${name}/${code}`);return id;
};
E.profileIdHash = async session => {
  const value=`${session?.studentName||''}|${session?.studentClass||''}`;
  const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',E.toBytes(value)));
  return E.bytesToHex(digest.slice(0,3));
};


/* src/eduauth/core/crypto.js */
E.importHmacKey = async rawBase64 => crypto.subtle.importKey(
  'raw',E.base64ToBytes(rawBase64),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']
);
E.hmacSha256 = async (rawBase64,data) => {
  const key=await E.importHmacKey(rawBase64);
  return new Uint8Array(await crypto.subtle.sign('HMAC',key,E.toBytes(data)));
};
E.dynamicTruncate = digest => {
  const bytes=E.toBytes(digest),offset=bytes[bytes.length-1]&0x0f;
  return (((bytes[offset]&0x7f)<<24)|((bytes[offset+1]&0xff)<<16)|((bytes[offset+2]&0xff)<<8)|(bytes[offset+3]&0xff))>>>0;
};
E.pinContext = context => {
  const allowed=['protocol','version','mode','keyId','platformId','classId','subjectId','lessonId','activityId','actionId','timeSlot','policyVersion','resourceIdHash','sessionId','requestId','sessionNonce','profileIdHash','expiresAt','reasonHash'];
  const out={};for(const key of allowed)if(context[key]!==undefined&&context[key]!==''&&context[key]!==null)out[key]=context[key];return out;
};
E.pinForContext = async (context,policy) => {
  const keyConfig=context.mode==='CLASS_SHARED_PIN'?E.CONFIG.keys.class:E.CONFIG.keys.session;
  const digest=await E.hmacSha256(keyConfig.rawBase64,E.canonicalEncode(E.pinContext(context)));
  const digits=Math.max(6,Math.min(10,Number(policy.pinLength)||8));
  return String(E.dynamicTruncate(digest)%(10**digits)).padStart(digits,'0');
};
E.formatPin = pin => String(pin||'').replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim();
E.verifySignedGrant = async (token,expected={}) => {
  const parts=String(token||'').trim().split('.');
  if(parts.length!==3||parts[0]!=='EA1-G1')throw new Error('Token assinado incompatível.');
  const payloadBytes=E.base64UrlDecode(parts[1]),signature=E.base64UrlDecode(parts[2]);
  const publicKey=await crypto.subtle.importKey('jwk',E.CONFIG.signingPublicKeyJwk,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
  const valid=await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},publicKey,signature,payloadBytes);
  if(!valid)throw new Error('Assinatura da autorização inválida.');
  const grant=JSON.parse(E.textDecoder.decode(payloadBytes));
  if(grant.protocol!=='EDUAUTH'||grant.version!==1||grant.mode!=='SIGNED_GRANT')throw new Error('Conteúdo da autorização incompatível.');
  if(grant.platformId!==E.CONFIG.platformId)throw new Error('Autorização de outra plataforma.');
  if(Number(grant.expiresAt)<=Date.now())throw new Error('Autorização assinada expirada.');
  for(const field of ['actionId','resourceId','sessionId','requestId']){
    if(expected[field]&&grant[field]!==expected[field])throw new Error('Autorização assinada pertence a outro contexto.');
  }
  return grant;
};
E.createRecoveryEnvelope = async ({profileId,dataKeyBytes,requestId,sessionId}) => {
  if(!profileId||!dataKeyBytes)throw new Error('Perfil e chave de dados são obrigatórios.');
  const keyBytes=E.toBytes(dataKeyBytes);
  if(keyBytes.length<16||keyBytes.length>64)throw new Error('Chave de dados com tamanho inválido.');
  const publicKey=await crypto.subtle.importKey('jwk',E.CONFIG.recoveryPublicKeyJwk,{name:'RSA-OAEP',hash:'SHA-256'},false,['encrypt']);
  const profileDigest=new Uint8Array(await crypto.subtle.digest('SHA-256',E.toBytes(String(profileId))));
  const metadata={
    protocol:'EDUAUTH',version:1,mode:'PROFILE_RECOVERY_ENVELOPE',platformId:E.CONFIG.platformId,
    profileIdHash:E.bytesToHex(profileDigest.slice(0,12)),requestId:String(requestId||''),
    sessionId:String(sessionId||''),createdAt:Date.now(),keyId:E.CONFIG.keys.recoveryPublicKeyId
  };
  const label=E.canonicalEncode(metadata);
  const encrypted=new Uint8Array(await crypto.subtle.encrypt({name:'RSA-OAEP',label},publicKey,keyBytes));
  return `EA1-R1.${E.base64UrlEncode(label)}.${E.base64UrlEncode(encrypted)}`;
};


/* src/eduauth/core/protocol.js */
E.modeWindowSeconds = (mode,risk) => {
  if(mode==='CLASS_SHARED_PIN')return E.CONFIG.timePolicy.classWindowSeconds;
  if(risk==='HIGH'||risk==='CRITICAL')return E.CONFIG.timePolicy.highRiskWindowSeconds;
  return E.CONFIG.timePolicy.sessionWindowSeconds;
};
E.buildContext = async ({actionId,resourceId='',classId='',subjectId='',lessonId='',activityId='',reason='',mode=null,now=Date.now()}) => {
  const policy=E.ACTIONS[actionId];if(!policy)throw new Error('Ação EduAuth não registrada.');
  const session=globalThis.LABDS?.Session?.get?.()||{};
  const selectedMode=mode||policy.preferredMode;
  const windowSeconds=E.modeWindowSeconds(selectedMode,policy.risk);
  const unixSeconds=Math.floor(now/1000),timeSlot=Math.floor(unixSeconds/windowSeconds),expiresAt=(timeSlot+1)*windowSeconds*1000;
  const resolvedClass=E.resolveRegistryId('classes',classId||session.studentClass,'outra-turma');
  const resolvedSubject=E.resolveRegistryId('subjects',subjectId,'desenvolvimento-de-sistemas');
  const resolvedLesson=E.resolveRegistryId('lessons',lessonId,'atividade-atual');
  const resolvedActivity=E.resolveRegistryId('activities',activityId,actionId==='vm-instructor-access'?'maquina-virtual-instrutor':actionId==='teacher-mode-access'?'modo-professor':actionId==='teacher-activity-delete'?'atividade-professor-local':'atividade-principal');
  const context={
    protocol:'EDUAUTH',version:1,mode:selectedMode,
    keyId:selectedMode==='CLASS_SHARED_PIN'?E.CONFIG.keys.class.keyId:E.CONFIG.keys.session.keyId,
    platformId:E.CONFIG.platformId,classId:resolvedClass,subjectId:resolvedSubject,lessonId:resolvedLesson,
    activityId:resolvedActivity,actionId,timeSlot,policyVersion:1,resourceId:String(resourceId||resolvedActivity).slice(0,80)
  };
  context.resourceIdHash=E.bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256',E.toBytes(context.resourceId))).slice(0,4));
  if(selectedMode==='SESSION_SCOPED_PIN'||selectedMode==='SIGNED_GRANT'||selectedMode==='PROFILE_RECOVERY_ENVELOPE'){
    context.sessionId=E.getEduSessionId();
    context.requestId=E.randomHex(4);
    context.sessionNonce=E.randomHex(5);
    context.profileIdHash=await E.profileIdHash(session);
    context.expiresAt=expiresAt;
  }
  if(policy.requireReason){const clean=String(reason||'').trim().slice(0,300);if(!clean)throw new Error('Informe o motivo da autorização.');context.reasonHash=E.bytesToHex(new Uint8Array(await crypto.subtle.digest('SHA-256',E.toBytes(clean))).slice(0,4));}
  return {context,policy,windowSeconds,expiresAt};
};
E.packRequestPayload = context => {
  const modeCode=E.MODE_CODE[context.mode];if(!modeCode)throw new Error('Modalidade desconhecida.');
  const base=new Uint8Array(17);
  base[0]=1;base[1]=modeCode;base[2]=1;base[3]=E.CONFIG.platformCode;
  base[4]=E.registryCode('classes',context.classId);base[5]=E.registryCode('subjects',context.subjectId);
  base[6]=E.registryCode('lessons',context.lessonId);base[7]=E.registryCode('activities',context.activityId);
  base[8]=E.registryCode('actions',context.actionId);base.set(E.uint32Bytes(context.timeSlot),9);base.set(E.hexToBytes(context.resourceIdHash),13);
  if(context.mode==='CLASS_SHARED_PIN')return base;
  const reason=context.reasonHash?E.hexToBytes(context.reasonHash):new Uint8Array(4);
  return E.concatBytes(base,E.hexToBytes(context.sessionId),E.hexToBytes(context.requestId),E.hexToBytes(context.sessionNonce),E.hexToBytes(context.profileIdHash),reason);
};
E.unpackRequestPayload = bytes => {
  if(bytes.length!==17&&bytes.length!==39)throw new Error('Tamanho do código-base inválido.');
  if(bytes[0]!==1)throw new Error('Versão do protocolo incompatível.');
  const mode=E.MODE_FROM_CODE[bytes[1]];if(!mode)throw new Error('Modalidade do código desconhecida.');
  const actionId=E.registryId('actions',bytes[8]),policy=E.ACTIONS[actionId];
  const context={protocol:'EDUAUTH',version:1,mode,keyId:mode==='CLASS_SHARED_PIN'?E.CONFIG.keys.class.keyId:E.CONFIG.keys.session.keyId,platformId:E.registryId('platforms',bytes[3]),classId:E.registryId('classes',bytes[4]),subjectId:E.registryId('subjects',bytes[5]),lessonId:E.registryId('lessons',bytes[6]),activityId:E.registryId('activities',bytes[7]),actionId,timeSlot:E.readUint32(bytes,9),policyVersion:1,resourceIdHash:E.bytesToHex(bytes.slice(13,17))};
  if(bytes.length===39){context.sessionId=E.bytesToHex(bytes.slice(17,23));context.requestId=E.bytesToHex(bytes.slice(23,27));context.sessionNonce=E.bytesToHex(bytes.slice(27,32));context.profileIdHash=E.bytesToHex(bytes.slice(32,35));const reasonHash=E.bytesToHex(bytes.slice(35,39));if(reasonHash!=='00000000')context.reasonHash=reasonHash;const seconds=E.modeWindowSeconds(mode,policy?.risk);context.expiresAt=(context.timeSlot+1)*seconds*1000;}
  return {context,policy};
};
E.createRequestCode = context => {
  const payload=E.packRequestPayload(context),body=E.base32Encode(payload),checksum=E.checksumText(payload),prefix=`EA1-${E.MODE_PREFIX[context.mode]}-K${String(1).padStart(2,'0')}`;
  return `${prefix}-${E.groupCode(body,4)}-${checksum}`;
};
E.parseRequestCode = code => {
  const text=String(code||'').trim().toUpperCase();
  const compact=text.replace(/[\s-]/g,'');
  if(!compact.startsWith('EA1'))throw new Error('Prefixo EduAuth ausente.');
  const match=text.match(/^EA1-([CSGR]1)-K(\d{2})-(.+)-([0-9A-Z]{7})$/i);
  if(!match)throw new Error('Formato do código-base inválido.');
  const payloadText=match[3].replace(/-/g,''),payload=E.base32Decode(payloadText),expected=E.checksumText(payload);
  if(E.normalizeBase32(match[4])!==expected)throw new Error('Checksum inválido. Confira a digitação.');
  const decoded=E.unpackRequestPayload(payload),expectedPrefix=E.MODE_PREFIX[decoded.context.mode];
  if(match[1].toUpperCase()!==expectedPrefix)throw new Error('Prefixo não corresponde ao conteúdo.');
  return {...decoded,requestCode:E.createRequestCode(decoded.context)};
};
E.createRequest = async options => {
  const built=await E.buildContext(options),requestCode=E.createRequestCode(built.context),pin=await E.pinForContext(built.context,built.policy);
  return {...built,requestCode,pin,createdAt:Date.now(),remainingAttempts:E.CONFIG.security.maximumAttempts,status:'pending'};
};
E.validateRequestPin = async (request,input,now=Date.now()) => {
  if(!request||request.status!=='pending')return {ok:false,error:'Solicitação indisponível.'};
  if(now>request.expiresAt){request.status='expired';return{ok:false,error:'Código inválido, expirado ou pertencente a outra solicitação.'};}
  if(request.remainingAttempts<=0){request.status='blocked';return{ok:false,error:'Código inválido, expirado ou pertencente a outra solicitação.'};}
  const clean=String(input||'').replace(/\D/g,'');
  const expected=await E.pinForContext(request.context,request.policy);
  const ok=E.constantTimeEqual(E.toBytes(clean),E.toBytes(expected));
  if(!ok){request.remainingAttempts--;if(request.remainingAttempts<=0)request.status='blocked';return{ok:false,error:'Código inválido, expirado ou pertencente a outra solicitação.',remainingAttempts:request.remainingAttempts};}
  request.status='validated';return{ok:true};
};


/* src/eduauth/storage/session-store.js */
E.storageKey = suffix => `${E.CONFIG.security.sessionStoragePrefix}.${suffix}`;
E.safeJsonGet = (storage,key,fallback) => {try{const raw=storage.getItem(key);return raw===null?fallback:JSON.parse(raw);}catch{return fallback;}};
E.safeJsonSet = (storage,key,value) => {try{storage.setItem(key,JSON.stringify(value));return true;}catch{return false;}};
E.authorizationScopeKey = ({actionId,resourceId='',sessionId='',classId='',lessonId='',timeSlot=''}) => [actionId,resourceId,sessionId,classId,lessonId,timeSlot].join('|');
E.getAuthorizations = () => E.safeJsonGet(sessionStorage,E.storageKey('authorizations'),{});
E.saveAuthorization = authorization => {
  const list=E.getAuthorizations(),key=E.authorizationScopeKey(authorization);list[key]=authorization;E.safeJsonSet(sessionStorage,E.storageKey('authorizations'),list);return authorization;
};
E.findAuthorization = ({actionId,resourceId='',sessionId='',classId='',lessonId='',timeSlot=''}) => {
  const list=E.getAuthorizations(),key=E.authorizationScopeKey({actionId,resourceId,sessionId,classId,lessonId,timeSlot}),item=list[key];
  if(!item||item.consumed||Number(item.expiresAt)<=Date.now()){if(item){delete list[key];E.safeJsonSet(sessionStorage,E.storageKey('authorizations'),list);}return null;}return item;
};
E.consumeAuthorization = authorization => {
  if(!authorization)return false;const list=E.getAuthorizations(),key=E.authorizationScopeKey(authorization),item=list[key];if(!item)return false;item.consumed=true;item.consumedAt=Date.now();list[key]=item;E.safeJsonSet(sessionStorage,E.storageKey('authorizations'),list);return true;
};
E.audit = async entry => {
  const safe={id:E.randomHex(6),at:new Date().toISOString(),platformId:E.CONFIG.platformId,classId:String(entry.classId||''),subjectId:String(entry.subjectId||''),lessonId:String(entry.lessonId||''),activityId:String(entry.activityId||''),actionId:String(entry.actionId||''),mode:String(entry.mode||''),risk:String(entry.risk||''),requestId:String(entry.requestId||''),sessionId:String(entry.sessionId||''),resourceId:String(entry.resourceId||''),result:String(entry.result||''),attempts:Number(entry.attempts||0),expiresAt:Number(entry.expiresAt||0),consumed:Boolean(entry.consumed),reason:String(entry.reason||'').slice(0,300)};
  const storage=globalThis.LABDS?.Storage;if(storage?.get&&storage?.set){const current=await storage.get(E.CONFIG.security.auditStorageKey,[]),list=Array.isArray(current)?current.slice(-E.CONFIG.security.maxAuditEntries+1):[];list.push(safe);await storage.set(E.CONFIG.security.auditStorageKey,list);}return safe;
};
E.getAuditLog = async () => {const list=await globalThis.LABDS?.Storage?.get?.(E.CONFIG.security.auditStorageKey,[]);return Array.isArray(list)?list:[];};


/* src/eduauth/modes/class-shared-pin.js */
E.createClassSharedRequest = options => E.createRequest({...options,mode:'CLASS_SHARED_PIN'});


/* src/eduauth/modes/session-scoped-pin.js */
E.createSessionScopedRequest = options => E.createRequest({...options,mode:'SESSION_SCOPED_PIN'});


/* src/eduauth/modes/signed-grant.js */
E.verifyGrantForRequest = async (token,request) => E.verifySignedGrant(token,{actionId:request.context.actionId,resourceId:request.context.resourceId,sessionId:request.context.sessionId,requestId:request.context.requestId});


/* src/eduauth/modes/profile-recovery-envelope.js */
E.recoveryEnvelope = options => E.createRecoveryEnvelope(options);


/* src/eduauth/ui/qr-code.js */
E.QR = (()=>{
  const versions=[null,{cap:17,data:19,ecc:7,align:[]},{cap:32,data:34,ecc:10,align:[6,18]},{cap:53,data:55,ecc:15,align:[6,22]},{cap:78,data:80,ecc:20,align:[6,26]},{cap:106,data:108,ecc:26,align:[6,30]}];
  const exp=new Uint8Array(512),log=new Uint8Array(256);let x=1;
  for(let i=0;i<255;i++){exp[i]=x;log[x]=i;x<<=1;if(x&0x100)x^=0x11d;}for(let i=255;i<512;i++)exp[i]=exp[i-255];
  const mul=(a,b)=>a&&b?exp[log[a]+log[b]]:0;
  function bitsPush(bits,value,length){for(let i=length-1;i>=0;i--)bits.push((value>>>i)&1);}
  function encodeData(text,version){const bytes=E.toBytes(text),info=versions[version],bits=[];bitsPush(bits,4,4);bitsPush(bits,bytes.length,8);for(const byte of bytes)bitsPush(bits,byte,8);const capacity=info.data*8;for(let i=0;i<Math.min(4,capacity-bits.length);i++)bits.push(0);while(bits.length%8)bits.push(0);const data=[];for(let i=0;i<bits.length;i+=8){let value=0;for(let j=0;j<8;j++)value=(value<<1)|(bits[i+j]||0);data.push(value);}let pad=0;while(data.length<info.data)data.push((pad++%2)?0x11:0xec);return Uint8Array.from(data);}
  function generator(degree){let poly=Uint8Array.from([1]);for(let i=0;i<degree;i++){const next=new Uint8Array(poly.length+1);for(let j=0;j<poly.length;j++){next[j]^=poly[j];next[j+1]^=mul(poly[j],exp[i]);}poly=next;}return poly;}
  function ecc(data,degree){const gen=generator(degree),rem=new Uint8Array(degree);for(const value of data){const factor=value^rem[0];rem.copyWithin(0,1);rem[degree-1]=0;for(let i=0;i<degree;i++)rem[i]^=mul(gen[i+1],factor);}return rem;}
  function formatBits(mask=0){const data=(1<<3)|mask;let rem=data<<10;for(let i=14;i>=10;i--)if((rem>>>i)&1)rem^=0x537<<(i-10);return ((data<<10)|rem)^0x5412;}
  function matrixFor(text){const bytes=E.toBytes(text);const version=versions.findIndex((item,index)=>index>0&&bytes.length<=item.cap);if(version<1)throw new Error('O conteúdo é longo demais para o QR Code local. Use copiar e colar.');const info=versions[version],size=17+4*version,modules=Array.from({length:size},()=>Array(size).fill(false)),func=Array.from({length:size},()=>Array(size).fill(false));
    const set=(x,y,value,isFunction=true)=>{if(x<0||y<0||x>=size||y>=size)return;modules[y][x]=Boolean(value);if(isFunction)func[y][x]=true;};
    function finder(left,top){for(let dy=-1;dy<=7;dy++)for(let dx=-1;dx<=7;dx++){const xx=left+dx,yy=top+dy;if(xx<0||yy<0||xx>=size||yy>=size)continue;const black=dx>=0&&dx<=6&&dy>=0&&dy<=6&&(dx===0||dx===6||dy===0||dy===6||(dx>=2&&dx<=4&&dy>=2&&dy<=4));set(xx,yy,black,true);}}
    finder(0,0);finder(size-7,0);finder(0,size-7);
    for(let i=8;i<size-8;i++){set(i,6,i%2===0,true);set(6,i,i%2===0,true);}
    for(const cy of info.align)for(const cx of info.align){if((cx===6&&cy===6)||(cx===6&&cy===size-7)||(cx===size-7&&cy===6))continue;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(cx+dx,cy+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1,true);}
    function drawFormat(){const value=formatBits(0),bit=i=>((value>>>i)&1)!==0;for(let i=0;i<=5;i++)set(8,i,bit(i),true);set(8,7,bit(6),true);set(8,8,bit(7),true);set(7,8,bit(8),true);for(let i=9;i<15;i++)set(14-i,8,bit(i),true);for(let i=0;i<8;i++)set(size-1-i,8,bit(i),true);for(let i=8;i<15;i++)set(8,size-15+i,bit(i),true);set(8,size-8,true,true);}
    drawFormat();
    const data=encodeData(text,version),all=E.concatBytes(data,ecc(data,info.ecc));let bitIndex=0,up=true;
    for(let right=size-1;right>=1;right-=2){if(right===6)right--;for(let vert=0;vert<size;vert++){const y=up?size-1-vert:vert;for(let j=0;j<2;j++){const xx=right-j;if(func[y][xx])continue;const byteIndex=bitIndex>>>3,shift=7-(bitIndex&7),raw=byteIndex<all.length?((all[byteIndex]>>>shift)&1):0,masked=raw^(((xx+y)&1)===0?1:0);modules[y][xx]=Boolean(masked);bitIndex++;}}up=!up;}
    drawFormat();return{version,size,modules};
  }
  function render(canvas,text,{scale=5,dark='#08101d',light='#ffffff'}={}){const qr=matrixFor(text),quiet=4,total=qr.size+quiet*2;canvas.width=total*scale;canvas.height=total*scale;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.fillStyle=light;ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle=dark;for(let y=0;y<qr.size;y++)for(let x=0;x<qr.size;x++)if(qr.modules[y][x])ctx.fillRect((x+quiet)*scale,(y+quiet)*scale,scale,scale);canvas.setAttribute('aria-label',`QR Code da solicitação EduAuth, versão ${qr.version}`);return qr;}
  return{matrixFor,render};
})();


/* src/eduauth/ui/authorization-modal.js */
E.labelFor = (registry,id) => {
  if(registry==='classes')return E.REGISTRIES.classLabels[id]||id;
  if(registry==='subjects')return E.REGISTRIES.subjectLabels[id]||id;
  return String(id||'').replace(/-/g,' ').replace(/\b\w/g,char=>char.toUpperCase());
};
E.ensureDialog = () => {
  let dialog=document.getElementById('eduauthDialog');if(dialog)return dialog;
  dialog=document.createElement('dialog');dialog.id='eduauthDialog';dialog.className='eduauth-dialog';
  dialog.innerHTML=`<div class="eduauth-panel">
    <header><div><span class="eduauth-brand">EDUAUTH OFFLINE</span><h2 id="eduauthTitle">Autorização do professor</h2><p id="eduauthSubtitle">Proteção operacional vinculada ao contexto.</p></div><button class="eduauth-close" type="button" aria-label="Cancelar autorização">×</button></header>
    <section class="eduauth-phase" data-phase="preparing"><div class="eduauth-spinner" aria-hidden="true"></div><div><strong>Preparando solicitação</strong><p id="eduauthPreparingText">Identificando a plataforma...</p></div></section>
    <section class="eduauth-phase hidden" data-phase="reason"><div class="eduauth-notice warning"><strong>Motivo obrigatório</strong><p>Esta ação altera dados locais protegidos. Informe um motivo objetivo para o registro.</p></div><label>Motivo da autorização<textarea id="eduauthReason" maxlength="300" rows="4" placeholder="Ex.: atividade criada por engano"></textarea></label><div class="eduauth-actions"><button class="btn secondary" data-eduauth-cancel type="button">Cancelar</button><button class="btn primary" data-eduauth-reason-next type="button">Preparar solicitação</button></div></section>
    <section class="eduauth-phase hidden" data-phase="awaiting">
      <div class="eduauth-context" id="eduauthContext"></div>
      <div class="eduauth-code-card"><span>Código-base público</span><output id="eduauthRequestCode"></output><div class="eduauth-code-actions"><button class="btn secondary" data-eduauth-copy type="button">Copiar código</button><button class="btn secondary" data-eduauth-qr type="button">Mostrar QR Code</button></div></div>
      <div class="eduauth-qr hidden" id="eduauthQrWrap"><canvas id="eduauthQrCanvas"></canvas><small>O QR Code é opcional. O fluxo comum funciona digitando ou copiando o código-base.</small></div>
      <div class="eduauth-timer-row"><span id="eduauthTimer">Validade: --:--</span><span id="eduauthAttempts">5 tentativas restantes</span></div>
      <label class="eduauth-pin-label">Senha informada pelo professor<input id="eduauthPin" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="13" placeholder="0000 0000"></label>
      <details id="eduauthSignedDetails" class="eduauth-signed hidden"><summary>Usar autorização assinada</summary><label>Token completo<textarea id="eduauthSignedToken" rows="4" spellcheck="false" placeholder="EA1-G1.payload.assinatura"></textarea></label></details>
      <div id="eduauthDevBox" class="eduauth-notice development hidden"><strong>Ambiente de desenvolvimento</strong><p>As chaves atuais são somente para testes e não devem ser utilizadas em atividades reais.</p><button class="btn secondary" data-eduauth-test-pin type="button">Preencher PIN de teste</button></div>
      <p id="eduauthFeedback" class="eduauth-feedback" role="status" aria-live="polite"></p>
      <div class="eduauth-actions"><button class="btn secondary" data-eduauth-cancel type="button">Cancelar</button><button class="btn secondary" data-eduauth-renew type="button">Nova solicitação</button><button class="btn primary" data-eduauth-validate type="button">Validar autorização</button></div>
    </section>
    <section class="eduauth-phase hidden" data-phase="success"><div class="eduauth-result success"><span>✓</span><div><strong>Autorização confirmada</strong><p id="eduauthSuccessScope"></p></div></div><button class="btn primary" data-eduauth-finish type="button">Continuar</button></section>
    <section class="eduauth-phase hidden" data-phase="error"><div class="eduauth-result error"><span>!</span><div><strong>Não foi possível validar</strong><p id="eduauthErrorText">Confira o código ou solicite uma nova senha ao professor.</p></div></div><div class="eduauth-actions"><button class="btn secondary" data-eduauth-cancel type="button">Cancelar</button><button class="btn primary" data-eduauth-renew type="button">Gerar nova solicitação</button></div></section>
    <footer><small>Proteção operacional offline. Não equivale à segurança de um servidor e os registros locais podem ser alterados por quem controla o navegador.</small></footer>
  </div>`;
  document.body.appendChild(dialog);return dialog;
};
E.setDialogPhase = (dialog,phase) => dialog.querySelectorAll('[data-phase]').forEach(section=>section.classList.toggle('hidden',section.dataset.phase!==phase));
E.collectReason = policy => new Promise(resolve=>{
  const dialog=E.ensureDialog();E.setDialogPhase(dialog,'reason');dialog.querySelector('#eduauthTitle').textContent=policy.label;dialog.querySelector('#eduauthReason').value='';
  const finish=value=>{cleanup();if(dialog.open)dialog.close();resolve(value);};
  const next=()=>{const value=dialog.querySelector('#eduauthReason').value.trim();if(value.length<5){dialog.querySelector('#eduauthReason').setCustomValidity('Informe um motivo com pelo menos 5 caracteres.');dialog.querySelector('#eduauthReason').reportValidity();return;}finish(value);};
  const cancel=()=>finish('');
  const cleanup=()=>{dialog.querySelector('[data-eduauth-reason-next]').removeEventListener('click',next);dialog.querySelectorAll('[data-eduauth-cancel],.eduauth-close').forEach(button=>button.removeEventListener('click',cancel));};
  dialog.querySelector('[data-eduauth-reason-next]').addEventListener('click',next);dialog.querySelectorAll('[data-eduauth-cancel],.eduauth-close').forEach(button=>button.addEventListener('click',cancel));dialog.showModal();setTimeout(()=>dialog.querySelector('#eduauthReason').focus(),30);
});
E.showAuthorizationDialog = request => new Promise(resolve=>{
  const dialog=E.ensureDialog(),policy=request.policy,context=request.context;
  E.setDialogPhase(dialog,'awaiting');dialog.querySelector('#eduauthTitle').textContent=policy.label;dialog.querySelector('#eduauthSubtitle').textContent=`Risco ${policy.risk} • ${context.mode.replaceAll('_',' ')}`;
  dialog.querySelector('#eduauthRequestCode').textContent=request.requestCode;
  const contextHost=dialog.querySelector('#eduauthContext');contextHost.innerHTML='';
  const rows=[['Plataforma',E.CONFIG.platformName],['Turma',E.labelFor('classes',context.classId)],['Disciplina',E.labelFor('subjects',context.subjectId)],['Aula',E.labelFor('lessons',context.lessonId)],['Atividade',E.labelFor('activities',context.activityId)],['Ação',policy.label],['Risco',policy.risk]];
  for(const [label,value] of rows){const item=document.createElement('div'),small=document.createElement('span'),strong=document.createElement('strong');small.textContent=label;strong.textContent=value;item.append(small,strong);contextHost.appendChild(item);}
  const pinInput=dialog.querySelector('#eduauthPin'),feedback=dialog.querySelector('#eduauthFeedback'),attempts=dialog.querySelector('#eduauthAttempts'),timer=dialog.querySelector('#eduauthTimer'),validate=dialog.querySelector('[data-eduauth-validate]'),qrWrap=dialog.querySelector('#eduauthQrWrap'),signed=dialog.querySelector('#eduauthSignedDetails'),signedToken=dialog.querySelector('#eduauthSignedToken'),devBox=dialog.querySelector('#eduauthDevBox');
  pinInput.value='';signedToken.value='';feedback.textContent='';qrWrap.classList.add('hidden');signed.classList.toggle('hidden',!policy.strongerMode);devBox.classList.toggle('hidden',E.CONFIG.environment!=='development');attempts.textContent=`${request.remainingAttempts} tentativas restantes`;
  const formatInput=()=>{const digits=pinInput.value.replace(/\D/g,'').slice(0,policy.pinLength);pinInput.value=E.formatPin(digits);};pinInput.addEventListener('input',formatInput);
  let timerId=0,locked=false,finished=false;
  const updateTimer=()=>{const seconds=Math.max(0,Math.ceil((request.expiresAt-Date.now())/1000)),minutes=Math.floor(seconds/60),rest=seconds%60;timer.textContent=`Validade: ${String(minutes).padStart(2,'0')}:${String(rest).padStart(2,'0')}`;if(seconds<=0){request.status='expired';validate.disabled=true;feedback.textContent='Solicitação expirada. Gere uma nova solicitação.';feedback.dataset.tone='error';}};updateTimer();timerId=setInterval(updateTimer,1000);
  const cleanup=()=>{clearInterval(timerId);pinInput.removeEventListener('input',formatInput);dialog.querySelectorAll('[data-eduauth-cancel],.eduauth-close').forEach(button=>button.removeEventListener('click',cancel));dialog.querySelectorAll('[data-eduauth-renew]').forEach(button=>button.removeEventListener('click',renew));dialog.querySelector('[data-eduauth-copy]').removeEventListener('click',copy);dialog.querySelector('[data-eduauth-qr]').removeEventListener('click',qr);dialog.querySelector('[data-eduauth-test-pin]').removeEventListener('click',testPin);validate.removeEventListener('click',submit);dialog.removeEventListener('cancel',cancelEvent);};
  const finish=result=>{if(finished)return;finished=true;cleanup();if(dialog.open)dialog.close();resolve(result);};
  const cancel=()=>finish({ok:false,cancelled:true});const cancelEvent=event=>{event.preventDefault();cancel();};const renew=()=>finish({ok:false,renew:true});
  const copy=async()=>{try{await navigator.clipboard.writeText(request.requestCode);feedback.textContent='Código-base copiado.';feedback.dataset.tone='success';}catch{feedback.textContent='Não foi possível copiar automaticamente. Selecione o código manualmente.';feedback.dataset.tone='error';}};
  const qr=()=>{qrWrap.classList.toggle('hidden');if(!qrWrap.classList.contains('hidden')){try{E.QR.render(dialog.querySelector('#eduauthQrCanvas'),request.requestCode,{scale:5});}catch(error){qrWrap.classList.add('hidden');feedback.textContent=error.message;feedback.dataset.tone='error';}}};
  const testPin=()=>{pinInput.value=E.formatPin(request.pin);feedback.textContent='PIN de desenvolvimento preenchido. Use somente para testes.';feedback.dataset.tone='warning';};
  const submit=async()=>{if(locked)return;locked=true;validate.disabled=true;feedback.textContent='Validando o código, a sessão e a atividade...';feedback.dataset.tone='info';try{
      let result;
      if(!signed.classList.contains('hidden')&&signed.open&&signedToken.value.trim()){const grant=await E.verifyGrantForRequest(signedToken.value.trim(),request);result={ok:true,grant,signed:true};}
      else result=await E.validateRequestPin(request,pinInput.value);
      if(result.ok){feedback.textContent='Autorização confirmada.';feedback.dataset.tone='success';setTimeout(()=>finish({ok:true,signed:Boolean(result.signed),grant:result.grant||null}),220);return;}
      attempts.textContent=`${request.remainingAttempts} tentativas restantes`;feedback.textContent=result.error;feedback.dataset.tone='error';
      const used=E.CONFIG.security.maximumAttempts-request.remainingAttempts,delay=E.CONFIG.security.progressiveDelayMs[Math.min(used,E.CONFIG.security.progressiveDelayMs.length-1)]||0;if(request.remainingAttempts<=0){setTimeout(()=>finish({ok:false,blocked:true}),450);return;}await new Promise(done=>setTimeout(done,delay));
    }catch(error){feedback.textContent=error.message||'Autorização inválida.';feedback.dataset.tone='error';}finally{locked=false;if(request.status==='pending')validate.disabled=false;}};
  dialog.querySelectorAll('[data-eduauth-cancel],.eduauth-close').forEach(button=>button.addEventListener('click',cancel));dialog.querySelectorAll('[data-eduauth-renew]').forEach(button=>button.addEventListener('click',renew));dialog.querySelector('[data-eduauth-copy]').addEventListener('click',copy);dialog.querySelector('[data-eduauth-qr]').addEventListener('click',qr);dialog.querySelector('[data-eduauth-test-pin]').addEventListener('click',testPin);validate.addEventListener('click',submit);dialog.addEventListener('cancel',cancelEvent);dialog.showModal();setTimeout(()=>pinInput.focus(),50);
});
E.showSuccess = async (policy,scope) => {
  const dialog=E.ensureDialog();E.setDialogPhase(dialog,'success');dialog.querySelector('#eduauthTitle').textContent='Autorização confirmada';dialog.querySelector('#eduauthSuccessScope').textContent=`A permissão foi aplicada somente para: ${policy.label}${scope?` — ${scope}`:''}.`;
  return new Promise(resolve=>{const button=dialog.querySelector('[data-eduauth-finish]'),done=()=>{button.removeEventListener('click',done);if(dialog.open)dialog.close();resolve();};button.addEventListener('click',done);dialog.showModal();button.focus();});
};


/* src/eduauth/index.js */
E.authorizationDescriptor = request => ({
  authorizationId:E.randomHex(8),requestId:request.context.requestId||'',platformId:E.CONFIG.platformId,
  actionId:request.context.actionId,resourceId:request.context.resourceId||request.context.activityId,
  sessionId:request.context.sessionId||'',classId:request.context.classId,lessonId:request.context.lessonId,
  timeSlot:request.context.timeSlot,mode:request.context.mode,risk:request.policy.risk,
  grantedAt:Date.now(),expiresAt:request.expiresAt,consumed:false
});
E.authorize = async options => {
  const policy=E.ACTIONS[options?.actionId];if(!policy)throw new Error('Ação EduAuth não registrada.');
  let reason=String(options?.reason||'').trim();if(policy.requireReason&&!reason){reason=await E.collectReason(policy);if(!reason)return false;}
  let renew=true;
  while(renew){renew=false;let request;
    try{request=await E.createRequest({...options,reason});}
    catch(error){globalThis.LABDS?.App?.toast?.(error.message,'error');return false;}
    const descriptor=E.authorizationDescriptor(request),existing=E.findAuthorization(descriptor);
    if(existing){await E.audit({...request.context,risk:policy.risk,result:'reused',attempts:0,consumed:false,reason});return true;}
    await E.audit({...request.context,risk:policy.risk,result:'requested',attempts:0,consumed:false,reason});
    const outcome=await E.showAuthorizationDialog(request);
    if(outcome.renew){renew=true;continue;}
    if(!outcome.ok){await E.audit({...request.context,risk:policy.risk,result:outcome.blocked?'blocked':outcome.cancelled?'cancelled':'rejected',attempts:E.CONFIG.security.maximumAttempts-request.remainingAttempts,consumed:false,reason});return false;}
    const authorization=E.saveAuthorization(descriptor);
    if(policy.singleUse){E.consumeAuthorization(authorization);authorization.consumed=true;}
    await E.audit({...request.context,risk:policy.risk,result:outcome.signed?'signed-grant-valid':'pin-valid',attempts:E.CONFIG.security.maximumAttempts-request.remainingAttempts,consumed:Boolean(policy.singleUse),reason});
    await E.showSuccess(policy,options?.resourceLabel||options?.resourceId||'recurso solicitado');return true;
  }
  return false;
};
E.init = async () => {E.ensureDialog();return{version:E.CONFIG.coreVersion,environment:E.CONFIG.environment,productionProvisioned:E.CONFIG.productionProvisioned};};
E.inspectCode = code => E.parseRequestCode(code);
E.developmentPinForCode = async code => {if(E.CONFIG.environment!=='development')throw new Error('Função disponível somente em desenvolvimento.');const parsed=E.parseRequestCode(code);return E.pinForContext(parsed.context,parsed.policy);};
E.publicApi = Object.freeze({
  init:E.init,authorize:E.authorize,inspectCode:E.inspectCode,developmentPinForCode:E.developmentPinForCode,
  createClassSharedRequest:E.createClassSharedRequest,createSessionScopedRequest:E.createSessionScopedRequest,
  verifySignedGrant:E.verifySignedGrant,createRecoveryEnvelope:E.createRecoveryEnvelope,getAuditLog:E.getAuditLog,
  actions:E.ACTIONS,registries:E.REGISTRIES,config:E.CONFIG,parseRequestCode:E.parseRequestCode,
  createRequestCode:E.createRequestCode,pinForContext:E.pinForContext,validateRequestPin:E.validateRequestPin,createRequest:E.createRequest,canonicalStringify:E.canonicalStringify,
  qr:E.QR
});

  global.LABDS=global.LABDS||{};
  global.LABDS.EduAuth=E.publicApi;
})(globalThis);
