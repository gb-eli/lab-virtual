'use strict';

(function(){
  window.LABDS = window.LABDS || {};

  const te = new TextEncoder();
  function bytes(value){ return value instanceof Uint8Array ? value : value instanceof ArrayBuffer ? new Uint8Array(value) : te.encode(String(value)); }
  function concat(parts){ const size=parts.reduce((n,p)=>n+p.length,0),out=new Uint8Array(size);let offset=0;parts.forEach(p=>{out.set(p,offset);offset+=p.length;});return out; }
  function safe(value){ return window.LABDS.Exporter.safeName(value).replace(/^-|-$/g,'') || 'estudante'; }
  function pad(n){return String(n).padStart(2,'0');}
  function stamp(date=new Date()){return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}`;}
  function duration(seconds){const h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),s=seconds%60;return [h&&`${h}h`,m&&`${m}min`,`${s}s`].filter(Boolean).join(' ');}
  function fmt(iso){return iso?new Date(iso).toLocaleString('pt-BR'):'Em andamento';}
  function baseName(session,suffix){return `${safe(session.studentName)}_${safe(session.studentClass).toUpperCase()}_${suffix}_${stamp(new Date(session.startedAt))}`;}
  function eventBlock(event){
    const lines=[`[${new Date(event.timestamp).toLocaleTimeString('pt-BR')}] ${event.laboratoryName} — ${event.action}`,`Tipo: ${event.eventType} | Status: ${event.status}`];
    if(event.context?.currentDirectory) lines.push(`Diretório: ${event.context.currentDirectory}`);
    if(event.input) lines.push(`Entrada:\n${event.input}`);
    if(event.output) lines.push(`Resultado:\n${event.output}`);
    if(event.error) lines.push(`Erro:\n${event.error}`);
    return lines.join('\n');
  }
  function textReport(session){
    const sum=window.LABDS.Session.summary(session);
    return [
      'LABORATÓRIO VIRTUAL DS','RELATÓRIO DE SESSÃO','',
      'ESTUDANTE',`Nome: ${session.studentName}`,`Turma: ${session.studentClass}`,'',
      'SESSÃO',`Identificador: ${session.sessionId}`,`Status: ${session.status}`,`Início: ${fmt(session.startedAt)}`,`Término: ${fmt(session.finishedAt)}`,`Duração: ${duration(sum.duration)}`,`Versão: ${session.applicationVersion}`,`Laboratórios utilizados: ${(session.labsUsed||[]).map(l=>l.name).join(', ')||'Nenhum'}`,'',
      'RESUMO',`Ações: ${sum.actions}`,`Comandos: ${sum.commands}`,`Execuções: ${sum.executions}`,`Arquivos/diretórios: ${sum.files}`,`Erros: ${sum.errors}`,`Testes: ${sum.tests}`,'',
      '='.repeat(74),'HISTÓRICO','='.repeat(74),'',
      ...(session.events||[]).map(eventBlock),
      '', '='.repeat(74),
      'Observação: este relatório registra os dados informados pelo usuário e as ações realizadas nesta sessão do navegador. Não substitui autenticação institucional.'
    ].join('\n\n');
  }

  async function sha256(value){
    const digest=await crypto.subtle.digest('SHA-256',bytes(value));
    return [...new Uint8Array(digest)].map(v=>v.toString(16).padStart(2,'0')).join('');
  }

  function wrapLine(line,width=94){
    const out=[]; let rest=String(line??'');
    if(!rest){return [''];}
    while(rest.length>width){let at=rest.lastIndexOf(' ',width);if(at<20)at=width;out.push(rest.slice(0,at));rest=rest.slice(at).trimStart();}
    out.push(rest);return out;
  }

  function pdfEscape(text){return String(text).replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/[\u2013\u2014]/g,'-').replace(/[^\x09\x0A\x0D\x20-\xFF]/g,'?');}
  function latin1(value){const s=String(value),out=new Uint8Array(s.length);for(let i=0;i<s.length;i++)out[i]=s.charCodeAt(i)&255;return out;}

  function makePdf(session){
    const report=textReport(session);
    const lines=report.split(/\r?\n/).flatMap(line=>wrapLine(line));
    const perPage=56,pages=[];
    for(let i=0;i<lines.length;i+=perPage)pages.push(lines.slice(i,i+perPage));
    const objects=[];
    const add=value=>{objects.push(value);return objects.length;};
    const catalog=add('');
    const pagesObj=add('');
    const font=add('<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>');
    const pageIds=[];
    pages.forEach((pageLines,index)=>{
      const body=['BT','/F1 8 Tf','42 802 Td','10 TL'];
      pageLines.forEach((line,lineIndex)=>{body.push(`(${pdfEscape(line)}) Tj`);if(lineIndex<pageLines.length-1)body.push('T*');});
      body.push('ET');
      body.push(`BT /F1 7 Tf 42 24 Td (Pagina ${index+1}/${pages.length} - Sessao ${pdfEscape(session.sessionId)} - ${pdfEscape(window.LABDS.VERSION)}) Tj ET`);
      const stream=body.join('\n');
      const content=add(`<< /Length ${latin1(stream).length} >>\nstream\n${stream}\nendstream`);
      const page=add(`<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${font} 0 R >> >> /Contents ${content} 0 R >>`);
      pageIds.push(page);
    });
    objects[catalog-1]=`<< /Type /Catalog /Pages ${pagesObj} 0 R >>`;
    objects[pagesObj-1]=`<< /Type /Pages /Kids [${pageIds.map(id=>`${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`;
    const chunks=[latin1('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')],offsets=[0];
    let pos=chunks[0].length;
    objects.forEach((obj,index)=>{offsets[index+1]=pos;const chunk=latin1(`${index+1} 0 obj\n${obj}\nendobj\n`);chunks.push(chunk);pos+=chunk.length;});
    const xrefPos=pos;
    let xref=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
    for(let i=1;i<=objects.length;i++)xref+=`${String(offsets[i]).padStart(10,'0')} 00000 n \n`;
    xref+=`trailer\n<< /Size ${objects.length+1} /Root ${catalog} 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
    chunks.push(latin1(xref));return concat(chunks);
  }

  const crcTable=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0;}return t;})();
  function crc32(data){let c=0xffffffff;for(const b of data)c=crcTable[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0;}
  function u16(n){return new Uint8Array([n&255,(n>>>8)&255]);}
  function u32(n){return new Uint8Array([n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255]);}
  function dosTime(date=new Date()){return ((date.getHours()<<11)|(date.getMinutes()<<5)|(date.getSeconds()>>1))&0xffff;}
  function dosDate(date=new Date()){return (((date.getFullYear()-1980)<<9)|((date.getMonth()+1)<<5)|date.getDate())&0xffff;}
  function zip(files){
    const locals=[],centrals=[];let offset=0;
    files.forEach(file=>{
      const name=bytes(file.name),data=bytes(file.data),crc=crc32(data),time=dosTime(),date=dosDate();
      const local=concat([u32(0x04034b50),u16(20),u16(0x0800),u16(0),u16(time),u16(date),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),name,data]);
      locals.push(local);
      const central=concat([u32(0x02014b50),u16(20),u16(20),u16(0x0800),u16(0),u16(time),u16(date),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),name]);
      centrals.push(central);offset+=local.length;
    });
    const central=concat(centrals),local=concat(locals);
    const end=concat([u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(central.length),u32(local.length),u16(0)]);
    return concat([local,central,end]);
  }

  function structuredSession(session,hash){return {...window.LABDS.Session.redact(session),integrity:{algorithm:'SHA-256',historyHash:hash,generatedAt:new Date().toISOString(),notice:'O hash identifica alterações no conteúdo exportado, mas não comprova autoria institucional.'}};}

  function safePath(value){
    return String(value||'arquivo').replace(/\\/g,'/').split('/').map(part=>safe(part)||'item').filter(Boolean).join('/').replace(/\.\.(?:\/|$)/g,'');
  }
  function parseMaybeJson(value){
    if(value && typeof value==='object') return value;
    try{return JSON.parse(value);}catch{return null;}
  }
  function combinedStates(dump){
    const out={...(dump?.states||{})};
    Object.entries(dump?.local||{}).forEach(([key,value])=>{
      const cleanKey=key.startsWith('labds.fallback.')?key.slice('labds.fallback.'.length):key;
      const parsed=parseMaybeJson(value);
      if(parsed!==null)out[cleanKey]=parsed;
    });
    return out;
  }
  function addVirtualTree(files,node,pathPrefix){
    if(!node||node.type!=='dir')return;
    Object.entries(node.children||{}).forEach(([name,child])=>{
      const path=`${pathPrefix}/${safe(name)||'item'}`;
      if(child?.type==='file')files.push({name:path,data:String(child.content??'')});
      else if(child?.type==='dir')addVirtualTree(files,child,path);
    });
  }
  function decodeBase64(value){
    try{const binary=atob(String(value||'')),out=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)out[i]=binary.charCodeAt(i);return out;}catch{return null;}
  }
  function stateBySuffix(states,suffix){return Object.entries(states).find(([key])=>key.endsWith(suffix))?.[1]||null;}
  async function collectArtifacts(session){
    const scoped=await window.LABDS.Storage.dumpPrefix(`session.${session.sessionId}.`);
    const terminal=await window.LABDS.Storage.dumpPrefix(`labds.fs.${session.sessionId}.`);
    const states=combinedStates(scoped),terminalStates=combinedStates(terminal),files=[];

    Object.entries(terminalStates).forEach(([key,value])=>{
      const data=parseMaybeJson(value);if(!data?.root)return;
      const match=key.match(/labds\.fs\.[^.]+\.(.+?)\.v\d+$/),terminalId=safe(match?.[1]||data.profile||'terminal');
      addVirtualTree(files,data.root,`arquivos/${terminalId}`);
      files.push({name:`configuracoes/terminal-${terminalId}.json`,data:JSON.stringify(window.LABDS.Session.redact(data),null,2)});
    });

    const js=stateBySuffix(states,'lab.javascript.state');
    if(js?.code)files.push({name:'codigos/javascript/main.js',data:js.code});
    const py=stateBySuffix(states,'lab.python.state');
    if(py?.code)files.push({name:'codigos/python/main.py',data:py.code});
    const web=stateBySuffix(states,'lab.web.state');
    if(web){if(web.html!=null)files.push({name:'codigos/front-end/index.html',data:web.html});if(web.css!=null)files.push({name:'codigos/front-end/style.css',data:web.css});if(web.js!=null)files.push({name:'codigos/front-end/app.js',data:web.js});}
    const sql=stateBySuffix(states,'lab.sql.state');
    if(sql?.sql)files.push({name:'banco-de-dados/consultas.sql',data:sql.sql});
    if(sql?.database){const db=decodeBase64(sql.database);if(db)files.push({name:'banco-de-dados/laboratorio.sqlite',data:db});}
    const configs=[['lab.network.state','configuracoes/rede.json'],['lab.vm.state','configuracoes/maquina-virtual.json'],['lab.hardware.state','configuracoes/computador.json'],['lab.graphics.state','imagens/matriz-pixels.json'],['lab.blocks.state','codigos/programacao-visual.json']];
    configs.forEach(([suffix,name])=>{const value=stateBySuffix(states,suffix);if(value)files.push({name,data:JSON.stringify(window.LABDS.Session.redact(value),null,2)});});
    files.push({name:'configuracoes/dados-locais.json',data:JSON.stringify(window.LABDS.Session.redact({scoped,terminal}),null,2)});
    return files;
  }

  async function build(session,{includeLocalData=false,onProgress=()=>{},signal}={}){
    if(!session)throw new Error('Não existe sessão para exportar.');
    const check=()=>{if(signal?.aborted)throw new DOMException('Exportação cancelada','AbortError');};
    onProgress(8,'Preparando histórico');check();
    const txt=textReport(session),hash=await sha256(txt);check();
    onProgress(25,'Gerando dados estruturados');
    const structured=structuredSession(session,hash),json=JSON.stringify(structured,null,2);check();
    onProgress(42,'Gerando PDF');const pdf=makePdf({...session,integrity:structured.integrity});check();
    const manifest={application:window.LABDS.APP_NAME,version:window.LABDS.VERSION,student:{name:session.studentName,class:session.studentClass},sessionId:session.sessionId,startedAt:session.startedAt,finishedAt:session.finishedAt,status:session.status,laboratories:(session.labsUsed||[]).map(l=>l.name),historyHash:hash,generatedAt:new Date().toISOString(),files:[]};
    const files=[{name:'historico-sessao.txt',data:txt},{name:'dados-sessao.json',data:json},{name:'relatorio-sessao.pdf',data:pdf}];
    if(includeLocalData){onProgress(58,'Coletando artefatos locais');files.push(...await collectArtifacts(session));check();}
    for(const file of files)manifest.files.push({name:file.name,size:bytes(file.data).length});
    files.push({name:'manifesto.json',data:JSON.stringify(manifest,null,2)});
    onProgress(74,'Montando pacote');check();const packageBytes=zip(files);onProgress(100,'Concluído');
    return {txt,json,pdf,zip:packageBytes,hash,manifest,structured};
  }

  async function exportFormat(format,session,options={}){
    const built=await build(session,{...options,includeLocalData:format==='zip'});
    const suffix=format==='zip'?'Sessao-Completa':'Historico';
    const filenameBase=baseName(session,suffix);
    if(format==='txt')window.LABDS.Exporter.download(built.txt,`${filenameBase}.txt`,'text/plain;charset=utf-8');
    else if(format==='json')window.LABDS.Exporter.download(built.json,`${filenameBase}.json`,'application/json;charset=utf-8');
    else if(format==='pdf')window.LABDS.Exporter.download(built.pdf,`${baseName(session,'Relatorio')}.pdf`,'application/pdf');
    else if(format==='zip')window.LABDS.Exporter.download(built.zip,`${filenameBase}.zip`,'application/zip');
    else throw new Error('Formato de exportação desconhecido.');
    const filename=`${filenameBase}.${format}`;
    window.LABDS.Session.recordExport(format,filename,'session');
    return {filename,...built};
  }

  window.LABDS.SessionExporter={textReport,makePdf,sha256,build,exportFormat,duration,fmt,baseName,zip,collectArtifacts};
})();
