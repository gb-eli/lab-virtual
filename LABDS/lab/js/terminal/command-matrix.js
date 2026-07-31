'use strict';
(function(){
  window.LABDS = window.LABDS || {};
  function tokenize(line){
    const tokens=[];let current='',quote=null;
    for(const ch of String(line||'')){
      if(quote){if(ch===quote)quote=null;else current+=ch;continue;}
      if(ch==='"'||ch==="'"){quote=ch;continue;}
      if(/\s/.test(ch)){if(current){tokens.push(current);current='';}}else current+=ch;
    }
    if(current)tokens.push(current);
    return tokens;
  }
  function parse(line){const raw=String(line||'').trim(),tokens=tokenize(raw),command=(tokens.shift()||'').toLowerCase();return {line:raw,command,args:tokens,options:tokens.filter(v=>/^[-/]/.test(v)),operands:tokens.filter(v=>!/^[-/]/.test(v))};}
  const MATRIX={
    cmd:{
      tree:{options:['/f','/a'],changes:[],event:'command_execution'},dir:{options:['/s','/b','/a','/p'],changes:[]},mkdir:{aliases:['md'],changes:['directory_created']},rmdir:{aliases:['rd'],options:['/s','/q'],changes:['directory_removed']},copy:{changes:['file_copied']},xcopy:{options:['/s','/e','/i','/y'],changes:['file_copied']},move:{changes:['file_moved']},ren:{aliases:['rename'],changes:['file_renamed']},del:{aliases:['erase'],options:['/q','/s'],changes:['file_removed']},type:{changes:[]},echo:{changes:['file_changed_when_redirected']},cd:{changes:['directory_changed']}
    },
    powershell:{'get-childitem':{aliases:['ls','dir'],options:['-recurse','-force','-file','-directory']},'new-item':{options:['-itemtype','-name','-path'],changes:['item_created']},'remove-item':{options:['-recurse','-force'],changes:['item_removed']},'copy-item':{options:['-recurse'],changes:['item_copied']},'move-item':{changes:['item_moved']},'rename-item':{changes:['item_renamed']},'set-content':{changes:['file_changed']},'add-content':{changes:['file_changed']}},
    bash:{tree:{options:['-a','-l'],valueOptions:['-L']},ls:{options:['-l','-a','-la','-al','-R']},mkdir:{options:['-p'],changes:['directory_created']},cp:{options:['-r','-R'],changes:['item_copied']},rm:{options:['-r','-R','-f','-rf','-fr'],changes:['item_removed']},chmod:{changes:['permissions_changed']}}
  };
  function descriptor(shell,command){const table=MATRIX[shell]||{};if(table[command])return table[command];for(const [name,item] of Object.entries(table))if((item.aliases||[]).includes(command))return {...item,canonical:name};return null;}
  window.LABDS.CommandAudit={tokenize,parse,MATRIX,descriptor};
})();
