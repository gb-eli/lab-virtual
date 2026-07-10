'use strict';

(function(){
  const now = () => new Date().toISOString();
  const clone = obj => JSON.parse(JSON.stringify(obj));
  const dir = (children={}) => ({type:'dir', children, created:now(), modified:now()});
  const file = (content='') => ({type:'file', content, created:now(), modified:now()});

  function defaultTree(os){
    if(os === 'windows'){
      return dir({
        'Program Files': dir({'README.txt': file('Pasta simulada do Windows.')}),
        'Users': dir({'aluno': dir({
          'Desktop': dir(), 'Documents': dir({'aula.txt': file('Anotações da aula de DS')}), 'Downloads': dir(), 'Projects': dir()
        })}),
        'Windows': dir({'System32': dir()})
      });
    }
    if(os === 'macos'){
      return dir({
        'Applications': dir(), 'Library': dir(), 'System': dir(),
        'Users': dir({'aluno': dir({'Desktop': dir(), 'Documents': dir(), 'Downloads': dir(), 'Projects': dir({'README.md': file('# Projetos macOS\n')})})}),
        'Volumes': dir()
      });
    }
    return dir({
      'bin': dir(), 'boot': dir(), 'dev': dir(), 'etc': dir({'hostname': file('laboratorio-ds\n')}),
      'home': dir({'aluno': dir({'Documentos': dir(), 'Downloads': dir(), 'Projetos': dir({'README.md': file('# Laboratório Virtual DS\n')})})}),
      'root': dir(), 'tmp': dir(), 'usr': dir({'bin': dir()}), 'var': dir()
    });
  }

  class VirtualFS{
    constructor(profile){
      this.profile = profile;
      this.caseSensitive = profile.os !== 'windows';
      this.sep = profile.os === 'windows' ? '\\' : '/';
      this.home = profile.os === 'windows' ? ['Users','aluno'] : (profile.os === 'macos' ? ['Users','aluno'] : ['home','aluno']);
      this.cwd = clone(this.home);
      this.root = defaultTree(profile.os);
    }

    static storageKey(profile){ const sid=window.LABDS.Session?.scopeId?.()||'sem-sessao'; return `labds.fs.${sid}.${profile.id}.v2`; }
    static load(profile){
      const fs = new VirtualFS(profile);
      try{
        const raw = localStorage.getItem(VirtualFS.storageKey(profile));
        if(raw){
          const data = JSON.parse(raw);
          if(data && data.root && data.cwd){ fs.root = data.root; fs.cwd = data.cwd; }
        }
      }catch(e){ console.warn('Falha ao carregar FS virtual', e); }
      return fs;
    }
    save(){
      try{ localStorage.setItem(VirtualFS.storageKey(this.profile), JSON.stringify({root:this.root,cwd:this.cwd, savedAt:now()})); }catch(e){ console.warn('Falha ao salvar FS virtual', e); }
    }
    reset(){ this.root = defaultTree(this.profile.os); this.cwd = clone(this.home); this.save(); }
    exportData(){ return {version:window.LABDS_VERSION, profile:this.profile.id, os:this.profile.os, cwd:this.cwd, root:this.root, exportedAt:now()}; }
    importData(data){
      if(!data || !data.root || data.root.type !== 'dir') throw new Error('Arquivo de ambiente inválido.');
      this.root = clone(data.root);
      this.cwd = Array.isArray(data.cwd) && this.getNodeFrom(this.root, data.cwd) ? clone(data.cwd) : clone(this.home);
      if(!this.getNode(this.cwd)) this.cwd = clone(this.home);
      this.save();
    }
    getNodeFrom(root, parts=[]){
      let node = root;
      for(const part of parts){
        if(!node || node.type !== 'dir') return null;
        const keys = Object.keys(node.children || {});
        const key = this.caseSensitive ? (keys.includes(part) ? part : null) : keys.find(k => k.toLowerCase() === String(part).toLowerCase());
        if(key == null) return null;
        node = node.children[key];
      }
      return node;
    }

    displayPath(parts=this.cwd){
      if(this.profile.os === 'windows') return 'C:\\' + parts.join('\\');
      const path = '/' + parts.join('/');
      if(parts.join('/') === this.home.join('/')) return '~';
      if(parts.join('/').startsWith(this.home.join('/') + '/')) return '~/' + parts.slice(this.home.length).join('/');
      return path === '/' ? '/' : path;
    }
    promptPath(){ return this.displayPath(); }

    findKey(parent, name){
      if(!parent || parent.type !== 'dir') return null;
      if(this.caseSensitive) return Object.prototype.hasOwnProperty.call(parent.children,name) ? name : null;
      const lower = String(name).toLowerCase();
      return Object.keys(parent.children).find(k => k.toLowerCase() === lower) || null;
    }
    getNode(parts=[]){
      let node = this.root;
      for(const part of parts){
        if(!part) continue;
        if(!node || node.type !== 'dir') return null;
        const key = this.findKey(node, part);
        if(key == null) return null;
        node = node.children[key];
      }
      return node;
    }
    parentAndName(parts){
      const name = parts[parts.length-1];
      const parent = this.getNode(parts.slice(0,-1));
      return {parent,name};
    }
    exists(parts){ return !!this.getNode(parts); }
    isDir(parts){ const n = this.getNode(parts); return n && n.type === 'dir'; }
    isFile(parts){ const n = this.getNode(parts); return n && n.type === 'file'; }

    resolve(input='', base=this.cwd){
      let raw = String(input ?? '').trim();
      if(!raw || raw === '.') return clone(base);
      raw = raw.replace(/^['"]|['"]$/g,'');
      if(this.profile.os === 'windows'){
        raw = raw.replace(/^C:/i,'');
        const absolute = raw.startsWith('\\') || raw.startsWith('/');
        raw = raw.replace(/^[\\/]+/,'');
        const parts = absolute ? [] : clone(base);
        for(const seg of raw.split(/[\\/]+/)){
          if(!seg || seg === '.') continue;
          if(seg === '..') parts.pop(); else parts.push(seg);
        }
        return parts;
      }
      if(raw === '~') return clone(this.home);
      if(raw.startsWith('~/')) raw = '/' + this.home.concat(raw.slice(2).split('/')).join('/');
      const absolute = raw.startsWith('/');
      const parts = absolute ? [] : clone(base);
      for(const seg of raw.split('/')){
        if(!seg || seg === '.') continue;
        if(seg === '..') parts.pop(); else parts.push(seg);
      }
      return parts;
    }

    list(parts=this.cwd, recursive=false){
      const node = this.getNode(parts);
      if(!node || node.type !== 'dir') throw new Error('Diretório não encontrado.');
      const rows = [];
      const walk = (n, p) => {
        for(const [name, child] of Object.entries(n.children)){
          rows.push({name, node:child, path:p.concat(name)});
          if(recursive && child.type === 'dir') walk(child, p.concat(name));
        }
      };
      walk(node, parts);
      return rows;
    }
    mkdir(pathParts){
      const {parent,name} = this.parentAndName(pathParts);
      if(!name) throw new Error('Nome de pasta inválido.');
      if(!parent || parent.type !== 'dir') throw new Error('O sistema não pode encontrar o caminho especificado.');
      if(this.findKey(parent,name)) throw new Error('Já existe um arquivo ou pasta com esse nome.');
      parent.children[name] = dir(); parent.modified = now(); this.save();
    }
    mkdirp(pathParts){
      let node = this.root;
      const built = [];
      for(const part of pathParts){
        if(!part) continue;
        if(node.type !== 'dir') throw new Error('Uma parte do caminho não é uma pasta.');
        let key = this.findKey(node, part);
        if(key == null){ node.children[part] = dir(); key = part; }
        if(node.children[key].type !== 'dir') throw new Error('Uma parte do caminho não é uma pasta.');
        node = node.children[key]; built.push(key);
      }
      this.save(); return built;
    }
    writeFile(pathParts, content='', append=false){
      const {parent,name} = this.parentAndName(pathParts);
      if(!parent || parent.type !== 'dir') throw new Error('Caminho não encontrado.');
      const key = this.findKey(parent,name);
      if(key && parent.children[key].type === 'dir') throw new Error('O destino é uma pasta.');
      if(key){ parent.children[key].content = append ? (parent.children[key].content || '') + content : content; parent.children[key].modified = now(); }
      else parent.children[name] = file(content);
      parent.modified = now(); this.save();
    }
    readFile(pathParts){
      const node = this.getNode(pathParts);
      if(!node) throw new Error('Arquivo não encontrado.');
      if(node.type !== 'file') throw new Error('O caminho informado é uma pasta.');
      return node.content || '';
    }
    remove(pathParts, recursive=false){
      const {parent,name} = this.parentAndName(pathParts);
      if(!parent || parent.type !== 'dir') throw new Error('Caminho não encontrado.');
      const key = this.findKey(parent,name);
      if(!key) throw new Error('Arquivo ou pasta não encontrado.');
      const node = parent.children[key];
      if(node.type === 'dir' && Object.keys(node.children).length && !recursive) throw new Error('A pasta não está vazia.');
      delete parent.children[key]; parent.modified = now(); this.save();
    }
    rename(pathParts, newName){
      const {parent,name} = this.parentAndName(pathParts);
      if(!parent || parent.type !== 'dir') throw new Error('Caminho não encontrado.');
      const key = this.findKey(parent,name);
      if(!key) throw new Error('Arquivo ou pasta não encontrado.');
      if(this.findKey(parent,newName)) throw new Error('Já existe um item com o nome informado.');
      parent.children[newName] = parent.children[key]; delete parent.children[key]; parent.modified = now(); this.save();
    }
    copy(srcParts, dstParts, overwrite=false){
      const src = this.getNode(srcParts); if(!src) throw new Error('Arquivo ou pasta de origem não encontrado.');
      let targetParts = dstParts;
      const dstNode = this.getNode(dstParts);
      if(dstNode && dstNode.type === 'dir') targetParts = dstParts.concat(srcParts[srcParts.length-1]);
      const {parent,name} = this.parentAndName(targetParts);
      if(!parent || parent.type !== 'dir') throw new Error('Destino não encontrado.');
      const existing = this.findKey(parent,name);
      if(existing && !overwrite) throw new Error('O destino já existe.');
      if(existing) delete parent.children[existing];
      parent.children[name] = clone(src); parent.children[name].modified = now(); parent.modified = now(); this.save();
    }
    move(srcParts, dstParts){
      const src = this.getNode(srcParts); if(!src) throw new Error('Arquivo ou pasta de origem não encontrado.');
      let targetParts = dstParts;
      const dstNode = this.getNode(dstParts);
      if(dstNode && dstNode.type === 'dir') targetParts = dstParts.concat(srcParts[srcParts.length-1]);
      this.copy(srcParts, targetParts); this.remove(srcParts, true); this.save();
    }
    changeDir(pathParts){
      if(!this.isDir(pathParts)) throw new Error('O sistema não pode encontrar o caminho especificado.');
      this.cwd = pathParts; this.save();
    }
  }

  window.LABDS = window.LABDS || {};
  window.LABDS.VirtualFS = VirtualFS;
})();
