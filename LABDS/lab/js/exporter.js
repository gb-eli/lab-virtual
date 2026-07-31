'use strict';

(function(){
  window.LABDS = window.LABDS || {};

  function safeName(value){
    return String(value || 'laboratorio')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
  }

  function timestamp(){ return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19); }

  function download(content, filename, mime = 'text/plain;charset=utf-8'){
    const blob = content instanceof Blob ? content : new Blob([content], {type:mime});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    document.dispatchEvent(new CustomEvent('labds:artifactexported',{detail:{filename,mime,kind:'download'}}));
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return {filename,mime};
  }

  function printPdf({title, subtitle = '', meta = [], content = '', footer = ''}){
    const popup = window.open('', '_blank', 'noopener,noreferrer');
    if(!popup) throw new Error('O navegador bloqueou a janela de impressão. Libere pop-ups e tente novamente.');
    popup.opener = null;
    const doc=popup.document;
    doc.documentElement.lang='pt-BR';
    doc.title=String(title||'Relatório');
    doc.head.textContent='';
    doc.body.textContent='';
    const charset=doc.createElement('meta');charset.setAttribute('charset','utf-8');
    const viewport=doc.createElement('meta');viewport.name='viewport';viewport.content='width=device-width,initial-scale=1';
    const style=doc.createElement('style');style.textContent='@page{size:A4;margin:15mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#142033;margin:0}header{border-bottom:3px solid #087f68;padding-bottom:12px;margin-bottom:16px}h1{font-size:24px;margin:0 0 5px}header p{margin:0;color:#5c6b7c}.meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:14px 0}.meta div{padding:9px 10px;border:1px solid #d7e0e8;border-radius:8px;background:#f7fafb}.meta b{display:block;font-size:10px;text-transform:uppercase;color:#637386}.meta span{font-size:12px}.content{white-space:pre-wrap;overflow-wrap:anywhere;font:11px/1.45 Consolas,monospace;border:1px solid #d7e0e8;border-radius:8px;background:#f7f9fb;padding:13px;min-height:80px}footer{margin-top:14px;font-size:10px;color:#657487}@media(max-width:600px){.meta{grid-template-columns:1fr}}';
    doc.head.append(charset,viewport,style);
    const header=doc.createElement('header'),heading=doc.createElement('h1'),sub=doc.createElement('p');heading.textContent=String(title||'');sub.textContent=String(subtitle||'');header.append(heading,sub);
    const metaSection=doc.createElement('section');metaSection.className='meta';
    for(const item of meta){const card=doc.createElement('div'),label=doc.createElement('b'),value=doc.createElement('span');label.textContent=String(item?.label||'');value.textContent=String(item?.value??'');card.append(label,value);metaSection.appendChild(card);}
    const contentBox=doc.createElement('div');contentBox.className='content';contentBox.textContent=String(content||'');
    const footerBox=doc.createElement('footer');footerBox.textContent=String(footer||'');
    doc.body.append(header,metaSection,contentBox,footerBox);
    const filename=`${safeName(title||'relatorio')}-${timestamp()}.pdf`;
    document.dispatchEvent(new CustomEvent('labds:artifactexported',{detail:{filename,mime:'application/pdf',kind:'print'}}));
    popup.setTimeout(()=>popup.print(),250);
    return {filename,mime:'application/pdf'};
  }

  function exportTextPackage(tool, payload, format){
    const session=window.LABDS.Session?.get?.();
    const prefix=session?`${session.studentName}_${session.studentClass}_${tool.shortName||tool.id}`:`${tool.id}`;
    const base = safeName(`${prefix}-${timestamp()}`);
    const sessionHeader=session?[`ESTUDANTE: ${session.studentName}`,`TURMA: ${session.studentClass}`,`SESSÃO: ${session.sessionId}`,''].join('\n'):'';
    const text=`${sessionHeader}${payload.text || ''}`;
    if(format === 'txt') return download(text, `${base}.txt`);
    if(format === 'backup') return download(JSON.stringify({session:session?{sessionId:session.sessionId,studentName:session.studentName,studentClass:session.studentClass}:null,artifact:payload.backup || payload}, null, 2), `${base}.json`, 'application/json;charset=utf-8');
    if(format === 'native') return download(payload.native || text, `${base}.${tool.extension || 'txt'}`, tool.mime || 'text/plain;charset=utf-8');
    if(format === 'pdf') return printPdf({
      title:`Laboratório Virtual DS — ${tool.name}`,
      subtitle:tool.runtimeLabel || '',
      meta:[
        ...(session?[{label:'Estudante',value:session.studentName},{label:'Turma',value:session.studentClass},{label:'Sessão',value:session.sessionId}]:[]),
        {label:'Ferramenta', value:tool.name},
        {label:'Exportado em', value:new Date().toLocaleString('pt-BR')},
        ...(payload.meta || [])
      ],
      content:text,
      footer:`Conteúdo produzido em ambiente educacional isolado no navegador.${session?` Sessão ${session.sessionId}.`:''}`
    });
  }

  window.LABDS.Exporter = {safeName, timestamp, download, printPdf, exportTextPackage};
})();
