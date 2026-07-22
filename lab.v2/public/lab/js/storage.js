'use strict';

(function(){
  window.LABDS = window.LABDS || {};
  const DB_NAME = 'laboratorio-virtual-ds';
  const DB_VERSION = 1;
  const STORE = 'states';
  let dbPromise = null;

  function openDb(){
    if(!('indexedDB' in window)) return Promise.resolve(null);
    if(dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if(!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }).catch(() => null);
    return dbPromise;
  }

  async function get(key, fallback = null){
    const db = await openDb();
    if(!db){
      try{
        const value = localStorage.getItem(`labds.fallback.${key}`);
        return value === null ? fallback : JSON.parse(value);
      }catch{return fallback;}
    }
    return new Promise(resolve => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result === undefined ? fallback : req.result);
      req.onerror = () => resolve(fallback);
    });
  }

  async function set(key, value){
    const db = await openDb();
    if(!db){
      try{ localStorage.setItem(`labds.fallback.${key}`, JSON.stringify(value)); return true; }catch{return false;}
    }
    return new Promise(resolve => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
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
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).clear();
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  }


  async function dump(){
    const db = await openDb();
    const states = {};
    if(db){
      await new Promise(resolve => {
        const tx = db.transaction(STORE, 'readonly');
        const store = tx.objectStore(STORE);
        const req = store.openCursor();
        req.onsuccess = () => {
          const cursor = req.result;
          if(cursor){ states[cursor.key] = cursor.value; cursor.continue(); }
          else resolve();
        };
        req.onerror = () => resolve();
      });
    }
    const local = {};
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(key && key.startsWith('labds.')) local[key]=localStorage.getItem(key);
    }
    return {version:window.LABDS.VERSION, exportedAt:new Date().toISOString(), states, local};
  }

  async function restore(payload){
    if(!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Backup inválido.');
    const validKey=key=>typeof key==='string'&&key.length<=220&&!['__proto__','prototype','constructor'].includes(key)&&/^[a-zA-Z0-9._:-]+$/.test(key);
    const states=payload.states&&typeof payload.states==='object'?Object.entries(payload.states):[];
    const local=payload.local&&typeof payload.local==='object'?Object.entries(payload.local):[];
    if(states.length>2000||local.length>2000)throw new Error('O backup contém itens demais.');
    if(states.some(([key])=>!validKey(key))||local.some(([key])=>!validKey(key)||!key.startsWith('labds.')))throw new Error('O backup contém chaves inválidas.');
    const db = await openDb();
    if(db && states.length){
      await new Promise(resolve => {
        const tx=db.transaction(STORE,'readwrite');
        const store=tx.objectStore(STORE);
        states.forEach(([key,value])=>store.put(value,key));
        tx.oncomplete=resolve;tx.onerror=resolve;
      });
    }
    local.forEach(([key,value])=>localStorage.setItem(key,String(value).slice(0,5_000_000)));
    return true;
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

  window.LABDS.Storage = {openDb, get, set, remove, removePrefix, dumpPrefix, clearAll, dump, restore, smallGet, smallSet};
})();
