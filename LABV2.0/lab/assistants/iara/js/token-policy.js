export const INITIAL_GRANT_VERSION = 'initial-500-v1';
export const MAX_TOKENS = 1_000_000;

function clamp(value,max=MAX_TOKENS){
  return Math.max(0,Math.min(max,Math.floor(value)));
}

export function parseStoredBalance(raw,fallback=500,max=MAX_TOKENS){
  if(raw===null||raw===undefined||String(raw).trim()==='')return clamp(fallback,max);
  const value=Number(raw);
  return Number.isFinite(value)&&value>=0?clamp(value,max):clamp(fallback,max);
}

export function initializeTokenBalance(storage,{balanceKey,grantKey,initialTokens=500,maxTokens=MAX_TOKENS}={}){
  if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function')return clamp(initialTokens,maxTokens);
  const balance=parseStoredBalance(storage.getItem(balanceKey),initialTokens,maxTokens);
  const alreadyGranted=storage.getItem(grantKey)===INITIAL_GRANT_VERSION;
  if(alreadyGranted)return balance;
  const migrated=Math.max(balance,clamp(initialTokens,maxTokens));
  storage.setItem(balanceKey,String(migrated));
  storage.setItem(grantKey,INITIAL_GRANT_VERSION);
  return migrated;
}
