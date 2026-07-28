'use strict';

let SQL=null,db=null,ready=false;
const MAX_DB_BYTES=20*1024*1024;
const MAX_SQL_CHARS=200000;
const MAX_RESULT_ROWS=500;
const MAX_RESULT_CELLS=20000;

function post(type,requestId,payload={},transfer=[]){self.postMessage({type,requestId,payload},transfer);}
function bytesToBase64(bytes){let binary='';const chunk=0x8000;for(let i=0;i<bytes.length;i+=chunk)binary+=String.fromCharCode(...bytes.subarray(i,i+chunk));return btoa(binary);}
function base64ToBytes(text){if(!text)return null;const binary=atob(text);if(binary.length>MAX_DB_BYTES)throw new Error('Banco salvo excede 20 MB.');const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes;}
function normalizeCell(value){if(value===null||typeof value==='number'||typeof value==='string')return value;if(value instanceof Uint8Array)return `[BLOB ${value.byteLength} bytes]`;return String(value).slice(0,20000);}
function schema(){
  const result=[];const names=db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")[0]?.values.flat()||[];
  for(const raw of names.slice(0,200)){const name=String(raw),escaped=name.replace(/"/g,'""');const cols=db.exec(`PRAGMA table_info("${escaped}")`)[0]?.values||[];result.push({name,columns:cols.slice(0,200).map(row=>({cid:row[0],name:String(row[1]),type:String(row[2]||'ANY'),notnull:Boolean(row[3]),defaultValue:row[4],pk:Boolean(row[5])}))});}
  return result;
}
async function init(payload){
  if(ready)return;
  importScripts(payload.jsUrl);if(typeof initSqlJs!=='function')throw new Error('Carregador SQL.js indisponível.');SQL=await initSqlJs({locateFile:()=>payload.wasmUrl});const bytes=base64ToBytes(payload.database);db=bytes?new SQL.Database(bytes):new SQL.Database();ready=true;
}
function execute(sql){
  if(sql.length>MAX_SQL_CHARS)throw new Error('Consulta excede 200 KB.');let totalCells=0;const raw=db.exec(sql),results=[];
  for(const set of raw){const values=[];for(const row of set.values){if(values.length>=MAX_RESULT_ROWS)break;totalCells+=row.length;if(totalCells>MAX_RESULT_CELLS)break;values.push(row.map(normalizeCell));}results.push({columns:set.columns.map(String),values,totalRows:set.values.length,truncated:set.values.length>values.length});if(totalCells>MAX_RESULT_CELLS)break;}
  const bytes=db.export();if(bytes.byteLength>MAX_DB_BYTES)throw new Error('O banco ultrapassou 20 MB após a operação.');return{results,schema:schema(),database:bytesToBase64(bytes),databaseBytes:bytes.byteLength};
}
self.addEventListener('message',async event=>{
  const {type,requestId,payload={}}=event.data||{};
  try{
    if(type==='init'){await init(payload);post('ready',requestId,{schema:schema(),version:'SQLite/SQL.js Worker'});return;}
    if(!ready)throw new Error('Motor SQL ainda não foi inicializado.');
    if(type==='exec'){const started=performance.now();const out=execute(String(payload.sql||''));post('result',requestId,{...out,elapsed:performance.now()-started});return;}
    if(type==='schema'){post('schema',requestId,{schema:schema()});return;}
    if(type==='export'){const bytes=db.export();const buffer=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);post('database',requestId,{buffer},[buffer]);return;}
    if(type==='import'){const buffer=payload.buffer;if(!(buffer instanceof ArrayBuffer)||buffer.byteLength>MAX_DB_BYTES)throw new Error('Banco inválido ou acima de 20 MB.');db?.close();db=new SQL.Database(new Uint8Array(buffer));post('imported',requestId,{schema:schema(),database:bytesToBase64(db.export())});return;}
    if(type==='reset'){db?.close();db=new SQL.Database();post('reset',requestId,{schema:[],database:null});return;}
    if(type==='close'){db?.close();db=null;ready=false;close();}
  }catch(error){post('error',requestId,{message:String(error?.message||error).slice(0,20000),name:String(error?.name||'Error').slice(0,100)});}
});
