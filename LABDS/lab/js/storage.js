'use strict';

(function(){
  window.LABDS = window.LABDS || {};
  const DB_NAME = 'laboratorio-virtual-ds';
  const DB_VERSION = 2;
  const STORE = 'states';
  const META_STORE = 'meta';
  let dbPromise = null;

  function openDb(){
    if(!('indexedDB' in window)) return Promise.resolve(null);
    if(dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if(!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
        if(!db.objectStoreNames.contains(META_STORE)) db.createObjectStore(META_STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('O armazenamento está bloqueado por outra aba.'));
    }).catch(() => null);
    return dbPromise;
  }

  async function get(key, fallback = null){
    const db = await openDb();
    let value=fallback;
    if(!db){
      try{
        const raw = localStorage.getItem(`labds.fallback.${key}`);
        value = raw === null ? fallback : JSON.parse(raw);
      }catch{ value=fallback; }
    }else{
      value=await new Promise(resolve => {
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).get(key);
        req.onsuccess = () => resolve(req.result === undefined ? fallback : req.result);
        req.onerror = () => resolve(fallback);
      });
    }
    return window.LABDS.Schemas?.isAllowedStateKey?.(key) ? window.LABDS.Schemas.sanitizeState(key,value) : value;
  }

  async function set(key, value){
    const safeValue=window.LABDS.Schemas?.isAllowedStateKey?.(key)?window.LABDS.Schemas.sanitizeState(key,value):value;
    const db = await openDb();
    if(!db){
      try{ localStorage.setItem(`labds.fallback.${key}`, JSON.stringify(safeValue)); return true; }catch{return false;}
    }
    return new Promise(resolve => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(safeValue, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    });
  }

  async function remove(key){
    const db = await openDb();
    if(!db){ localStorage.removeItem(`labds.fallback.${key}`); return true; }
    return new Promise(resolve => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  }

  async function clearAll(){
    const db = await openDb();
    if(!db){
      Object.keys(localStorage).filter(k => k.startsWith('labds.')).forEach(k => localStorage.removeItem(k));
      return true;
    }
    return new Promise(resolve => {
      const stores=[STORE,META_STORE].filter(name=>db.objectStoreNames.contains(name));
      const tx = db.transaction(stores, 'readwrite');
      stores.forEach(name=>tx.objectStore(name).clear());
      tx.oncomplete = () => {Object.keys(localStorage).filter(k=>k.startsWith('labds.')).forEach(k=>localStorage.removeItem(k));resolve(true);};
      tx.onerror = () => resolve(false);
    });
  }

  async function dump(){
    const db = await openDb();
    const states = Object.create(null);
    if(db){
      await new Promise(resolve => {
        const tx = db.transaction(STORE, 'readonly');
        const req = tx.objectStore(STORE).openCursor();
        req.onsuccess = () => {
          const cursor = req.result;
          if(cursor){ states[cursor.key] = cursor.value; cursor.continue(); }
          else resolve();
        };
        req.onerror = () => resolve();
      });
    }else{
      Object.keys(localStorage).filter(key=>key.startsWith('labds.fallback.')).forEach(key=>{
        const stateKey=key.replace('labds.fallback.','');
        try{states[stateKey]=JSON.parse(localStorage.getItem(key));}catch{}
      });
    }
    const local = Object.create(null);
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(key && key.startsWith('labds.') && !key.startsWith('labds.fallback.')) local[key]=localStorage.getItem(key);
    }
    return {schemaVersion:window.LABDS.Schemas?.VERSION||1,version:window.LABDS.VERSION,exportedAt:new Date().toISOString(),states,local};
  }

  async function restore(payload){
    const normalized=window.LABDS.Schemas?.sanitizeDump ? window.LABDS.Schemas.sanitizeDump(payload) : payload;
    const stateEntries=Object.entries(normalized.states||{}),localEntries=Object.entries(normalized.local||{});
    const db = await openDb();
    if(db){
      await new Promise((resolve,reject) => {
        const tx=db.transaction(STORE,'readwrite');
        const store=tx.objectStore(STORE);
        stateEntries.forEach(([key,value])=>store.put(value,key));
        tx.oncomplete=resolve;
        tx.onerror=()=>reject(tx.error||new Error('Falha ao restaurar o backup.'));
        tx.onabort=()=>reject(tx.error||new Error('Restauração interrompida.'));
      });
    }else{
      for(const [key,value] of stateEntries){
        localStorage.setItem(`labds.fallback.${key}`,JSON.stringify(value));
      }
    }
    for(const [key,value] of localEntries) localStorage.setItem(key,String(value).slice(0,5_000_000));
    return {restored:stateEntries.length+localEntries.length,rejected:normalized.rejected||[]};
  }

  async function removePrefix(prefix){
    const db = await openDb();
    if(db){
      await new Promise(resolve => {
        const tx=db.transaction(STORE,'readwrite');
        const store=tx.objectStore(STORE);
        const req=store.openCursor();
        req.onsuccess=()=>{const cursor=req.result;if(cursor){if(String(cursor.key).startsWith(prefix))cursor.delete();cursor.continue();}else resolve();};
        req.onerror=()=>resolve();
      });
    }
    Object.keys(localStorage).filter(key=>key.startsWith(`labds.fallback.${prefix}`)||key.startsWith(prefix)).forEach(key=>localStorage.removeItem(key));
    return true;
  }

  async function dumpPrefix(prefix){
    const states={};
    const db=await openDb();
    if(db){
      await new Promise(resolve=>{
        const tx=db.transaction(STORE,'readonly'),store=tx.objectStore(STORE),req=store.openCursor();
        req.onsuccess=()=>{const cursor=req.result;if(cursor){if(String(cursor.key).startsWith(prefix))states[cursor.key]=cursor.value;cursor.continue();}else resolve();};
        req.onerror=()=>resolve();
      });
    }
    const local={};
    for(let i=0;i<localStorage.length;i++){const key=localStorage.key(i);if(key&&(key.startsWith(prefix)||key.startsWith(`labds.fallback.${prefix}`)))local[key]=localStorage.getItem(key);}
    return {states,local};
  }

  function smallGet(key, fallback = null){
    try{
      const value = localStorage.getItem(`labds.pref.${key}`);
      return value === null ? fallback : JSON.parse(value);
    }catch{return fallback;}
  }
  function smallSet(key, value){
    try{ localStorage.setItem(`labds.pref.${key}`, JSON.stringify(value)); return true; }catch{return false;}
  }
  function smallRemove(key){
    try{ localStorage.removeItem(`labds.pref.${key}`); return true; }catch{return false;}
  }

  async function estimate(){
    if(navigator.storage?.estimate){
      const {usage=0,quota=0}=await navigator.storage.estimate();
      return {usage,quota,percent:quota?usage/quota*100:0};
    }
    return {usage:0,quota:0,percent:0};
  }

  window.LABDS.Storage = {openDb, get, set, remove, removePrefix, dumpPrefix, clearAll, dump, restore, smallGet, smallSet, smallRemove, estimate};
})();
