import { VAULT_PARTS } from './config.js?v=8.2.3';
const decoder=new TextDecoder(),encoder=new TextEncoder(),DATA_VERSION='8.2.3';
function fromBase64(value){if(typeof value!=='string'||value.length>2_000_000)throw new Error('Conteúdo Base64 inválido.');const binary=atob(value);return Uint8Array.from(binary,char=>char.charCodeAt(0));}
function reconstructPassphrase(){const base64=VAULT_PARTS.map(part=>[...part].reverse().join('')).join('');return fromBase64(base64);}
function validateManifest(raw){
  if(!raw||typeof raw!=='object')throw new Error('Manifesto do cofre inválido.');const iterations=Number(raw.iterations);if(!Number.isInteger(iterations)||iterations<100_000||iterations>1_000_000)throw new Error('Parâmetro de derivação inválido.');fromBase64(raw.salt);
  const routes=Array.isArray(raw.routes)?raw.routes.slice(0,500).map(route=>({id:String(route?.id||'').slice(0,100),file:String(route?.file||''),fingerprints:Array.isArray(route?.fingerprints)?route.fingerprints.filter(value=>/^[a-f0-9]{20}$/i.test(value)).slice(0,80):[],weight:Math.max(0,Math.min(100,Number(route?.weight)||0))})).filter(route=>route.id&&/^data\/vault\/[a-z0-9-]+\.vault\.json$/i.test(route.file)&&route.fingerprints.length):[];
  if(!routes.length)throw new Error('Manifesto sem rotas válidas.');return{...raw,iterations,routes};
}
async function deriveKey(manifest){const material=await crypto.subtle.importKey('raw',reconstructPassphrase(),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt:fromBase64(manifest.salt),iterations:manifest.iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);}
export class KnowledgeVault{
  #manifest;#keyPromise;#cache=new Map();
  constructor(manifest){this.#manifest=validateManifest(manifest);this.#keyPromise=deriveKey(this.#manifest);}
  get routes(){return this.#manifest.routes;}
  async decryptFile(url){
    const safe=String(url||'');if(!/^data\/vault\/[a-z0-9-]+\.vault\.json$/i.test(safe)||!this.#manifest.routes.some(route=>route.file===safe)&&![this.#manifest.topicsFile,this.#manifest.imagesFile].includes(safe))throw new Error('Caminho de cofre rejeitado.');if(this.#cache.has(safe))return this.#cache.get(safe);
    const promise=(async()=>{const response=await fetch(`${safe}?v=${DATA_VERSION}`,{cache:'no-store',credentials:'same-origin'});if(!response.ok)throw new Error(`Falha ao carregar cofre: ${response.status}`);const envelope=await response.json();if(!envelope||typeof envelope!=='object'||typeof envelope.nonce!=='string'||typeof envelope.aad!=='string'||typeof envelope.ciphertext!=='string')throw new Error('Envelope criptográfico inválido.');const key=await this.#keyPromise;const decrypted=await crypto.subtle.decrypt({name:'AES-GCM',iv:fromBase64(envelope.nonce),additionalData:encoder.encode(envelope.aad)},key,fromBase64(envelope.ciphertext));const text=decoder.decode(decrypted);if(text.length>1_500_000)throw new Error('Módulo descriptografado excede o limite.');const data=JSON.parse(text);if(this.#cache.size>=3){const first=this.#cache.keys().next().value;this.#cache.delete(first);}return data;})();
    this.#cache.set(safe,promise);try{return await promise;}catch(error){this.#cache.delete(safe);throw error;}
  }
  clear(){this.#cache.clear();}
}
