'use strict';

(function(){
  const tokenize = input => {
    const tokens = [];
    const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
    let match;
    while((match = re.exec(String(input)))) tokens.push(match[1] ?? match[2] ?? match[3]);
    return tokens;
  };

  function splitOperators(input, operators){
    const result = [];
    let buffer = '';
    let quote = null;
    for(let i = 0; i < input.length; i++){
      const ch = input[i];
      if((ch === '"' || ch === "'") && input[i - 1] !== '\\'){
        quote = quote === ch ? null : (quote || ch);
        buffer += ch;
        continue;
      }
      if(!quote){
        const op = operators.find(candidate => input.startsWith(candidate, i));
        if(op){
          if(buffer.trim()) result.push({type:'command', value:buffer.trim()});
          result.push({type:'operator', value:op});
          buffer = '';
          i += op.length - 1;
          continue;
        }
      }
      buffer += ch;
    }
    if(buffer.trim()) result.push({type:'command', value:buffer.trim()});
    return result;
  }

  function splitRedirection(input){
    let quote = null;
    for(let i = 0; i < input.length; i++){
      const ch = input[i];
      if((ch === '"' || ch === "'") && input[i - 1] !== '\\') quote = quote === ch ? null : (quote || ch);
      if(!quote && ch === '>'){
        const append = input[i + 1] === '>';
        return {
          command:input.slice(0, i).trim(),
          operator:append ? '>>' : '>',
          target:input.slice(i + (append ? 2 : 1)).trim()
        };
      }
    }
    return null;
  }

  const cleanQuotes = value => String(value ?? '').replace(/^("|')|("|')$/g, '');
  const isErrorText = text => /(não é reconhecido|comando não encontrado|não encontrado|not found|erro|incorreta|cannot|acesso negado|falta operando|invalid)/i.test(String(text || ''));
  const formatDate = () => new Date().toLocaleDateString('pt-BR');
  const formatTime = () => new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});

  class Shell{
    constructor(profile, fs, print, clear){
      this.profile = profile;
      this.fs = fs;
      this.print = print;
      this.clear = clear;
      this.history = [];
    }
    prompt(){ return '> '; }
    async run(){ return ''; }
  }

  class CmdShell extends Shell{
    constructor(profile, fs, print, clear){
      super(profile, fs, print, clear);
      this.vars = {PATH:'C:\\Windows\\System32;C:\\Windows', USERNAME:'aluno', COMPUTERNAME:'LABORATORIO-DS'};
      this.promptTemplate = '$P$G';
    }

    prompt(){
      const path = `C:\\${this.fs.cwd.join('\\')}`;
      return this.promptTemplate
        .replace(/\$P/gi, path)
        .replace(/\$G/gi, '>')
        .replace(/\$L/gi, '<')
        .replace(/\$S/gi, ' ');
    }

    async run(input){
      const items = splitOperators(input.trim(), ['&&', '||', '&', '|']);
      let output = '';
      let success = true;
      let pendingOperator = '&';
      const visible = [];

      for(let index = 0; index < items.length; index++){
        const item = items[index];
        if(item.type === 'operator'){ pendingOperator = item.value; continue; }
        if(pendingOperator === '&&' && !success) continue;
        if(pendingOperator === '||' && success) continue;

        if(pendingOperator === '|' && output) output = this.runPipe(item.value, output);
        else output = this.runOne(item.value);
        success = !isErrorText(output);

        const next = items[index + 1];
        const nextIsPipe = next?.type === 'operator' && next.value === '|';
        if(!nextIsPipe && output !== '') visible.push(output);
      }
      return visible.join('\n');
    }

    runPipe(command, input){
      const parts = tokenize(command);
      const cmd = String(parts.shift() || '').toLowerCase();
      if(cmd === 'find' || cmd === 'findstr'){
        const term = cleanQuotes(parts.join(' '));
        return input.split(/\r?\n/).filter(line => line.toLowerCase().includes(term.toLowerCase())).join('\n');
      }
      return `'${cmd}' não é reconhecido como um filtro de pipeline neste ambiente.`;
    }

    runOne(line){
      try{
        const redirection = splitRedirection(line);
        if(redirection){
          const content = this.runOne(redirection.command);
          this.fs.writeFile(this.fs.resolve(cleanQuotes(redirection.target)), content ? `${content}${content.endsWith('\n') ? '' : '\n'}` : '', redirection.operator === '>>');
          return '';
        }

        const parts = tokenize(line);
        const command = String(parts.shift() || '').toLowerCase();
        switch(command){
          case 'dir': return this.dir(parts);
          case 'cd': case 'chdir': return this.cd(parts);
          case 'cls': this.clear(); return '';
          case 'mkdir': case 'md': return this.mkdir(parts);
          case 'rmdir': case 'rd': return this.rmdir(parts);
          case 'tree': return this.tree(parts);
          case 'echo': return this.echo(parts, line);
          case 'type': return this.type(parts);
          case 'copy': case 'xcopy': return this.copy(parts);
          case 'move': return this.move(parts);
          case 'ren': case 'rename': return this.rename(parts);
          case 'del': case 'erase': return this.del(parts);
          case 'help': return this.help(parts[0]);
          case 'ver': return 'Microsoft Windows [versão 11.0.26100.0000]';
          case 'vol': return 'O volume na unidade C é LABDS\nO Número de Série do Volume é 2026-DS';
          case 'whoami': return 'LABDS\\aluno';
          case 'hostname': return 'LABORATORIO-DS';
          case 'systeminfo': return this.systeminfo();
          case 'ipconfig': return this.ipconfig(parts);
          case 'ping': return this.ping(parts);
          case 'tracert': return this.tracert(parts);
          case 'nslookup': return 'A resolução DNS é processada progressivamente pelo simulador de rede.';
          case 'netstat': return this.netstat(parts);
          case 'arp': return this.arp(parts);
          case 'route': return this.route(parts);
          case 'getmac': return 'Physical Address    Transport Name\n=================== ==========================================================\n02-00-00-00-00-20   \Device\Tcpip_{LABDS-ETHERNET}';
          case 'path': return this.path(parts);
          case 'set': return this.set(parts);
          case 'date': return `A data atual é: ${new Date().toLocaleDateString('pt-BR')}`;
          case 'time': return `A hora atual é: ${new Date().toLocaleTimeString('pt-BR')}`;
          case 'title': document.title = parts.join(' ') || 'Laboratório Virtual DS'; return '';
          case 'color': return this.color(parts[0]);
          case 'prompt': this.promptTemplate = parts.join(' ') || '$P$G'; return '';
          case 'where': return this.where(parts);
          case 'find': case 'findstr': return this.find(parts);
          case 'tasklist': return this.tasklist();
          case 'comandos': case 'sobre': return this.about();
          case 'history': return this.history.map((item, index) => `${index + 1}  ${item}`).join('\n');
          case 'exit': return 'Use o botão Início para fechar este terminal simulado.';
          case '': return '';
          default: return `'${command}' não é reconhecido como um comando interno\nou externo, um programa operável ou um arquivo em lotes.`;
        }
      }catch(error){ return error.message; }
    }

    dir(args){
      const flags = args.filter(item => /^\//.test(item)).map(item => item.toLowerCase());
      const target = args.find(item => !/^\//.test(item));
      const path = target ? this.fs.resolve(target) : this.fs.cwd;
      const node = this.fs.getNode(path);
      if(!node || node.type !== 'dir') return 'O sistema não pode encontrar o caminho especificado.';
      const recursive = flags.includes('/s');
      const bare = flags.includes('/b');
      const rows = this.fs.list(path, recursive);
      if(bare) return rows.map(row => recursive ? `C:\\${row.path.join('\\')}` : row.name).join('\n');

      let output = ` O volume na unidade C é LABDS\n O Número de Série do Volume é 2026-DS\n\n Pasta de C:\\${path.join('\\')}\n\n`;
      output += `${formatDate()}  ${formatTime()}    <DIR>          .\n`;
      output += `${formatDate()}  ${formatTime()}    <DIR>          ..\n`;
      rows.forEach(row => {
        const size = row.node.type === 'file' ? String((row.node.content || '').length).padStart(14) : '   <DIR>         ';
        const name = recursive ? `C:\\${row.path.join('\\')}` : row.name;
        output += `${formatDate()}  ${formatTime()} ${size} ${name}\n`;
      });
      const fileCount = rows.filter(row => row.node.type === 'file').length;
      const dirCount = rows.filter(row => row.node.type === 'dir').length;
      return `${output}              ${fileCount} arquivo(s)\n              ${dirCount} pasta(s)`;
    }

    cd(args){
      if(!args.length) return `C:\\${this.fs.cwd.join('\\')}`;
      this.fs.changeDir(this.fs.resolve(args.join(' ')));
      return '';
    }

    mkdir(args){
      const targets = args.filter(item => !item.startsWith('/'));
      if(!targets.length) return 'A sintaxe do comando está incorreta.';
      targets.forEach(target => this.fs.mkdir(this.fs.resolve(target)));
      return '';
    }

    rmdir(args){
      const recursive = args.some(item => ['/s', '/q'].includes(item.toLowerCase()));
      const targets = args.filter(item => !item.startsWith('/'));
      if(!targets.length) return 'A sintaxe do comando está incorreta.';
      targets.forEach(target => this.fs.remove(this.fs.resolve(target), recursive));
      return '';
    }

    tree(args){
      const known=['/f','/a'];
      const unsupported=args.filter(item=>item.startsWith('/')&&!known.includes(item.toLowerCase()));
      if(unsupported.length) return `Opção não suportada pelo simulador: ${unsupported.join(' ')}`;
      const showFiles=args.some(item=>item.toLowerCase()==='/f');
      const ascii=args.some(item=>item.toLowerCase()==='/a');
      const target=args.find(item=>!item.startsWith('/'));
      const start=target?this.fs.resolve(target):this.fs.cwd;
      if(!this.fs.isDir(start)) return 'O sistema não pode encontrar o caminho especificado.';
      const glyph=ascii?{tee:'+---',last:'\\---',pipe:'|   ',space:'    '}:{tee:'├───',last:'└───',pipe:'│   ',space:'    '};
      const build=(parts,prefix='')=>{
        const node=this.fs.getNode(parts);
        const entries=Object.entries(node.children).filter(([,child])=>showFiles||child.type==='dir').sort(([a],[b])=>a.localeCompare(b,'pt-BR'));
        return entries.map(([name,child],index)=>{
          const isLast=index===entries.length-1;
          let line=`${prefix}${isLast?glyph.last:glyph.tee}${name}\n`;
          if(child.type==='dir')line+=build(parts.concat(name),`${prefix}${isLast?glyph.space:glyph.pipe}`);
          return line;
        }).join('');
      };
      const shown='C:\\'+start.join('\\');
      return `Listagem de caminhos de pasta para o volume LABDS\nNúmero de série do volume: 2026-DS\n${shown}\n${build(start)}`.trimEnd();
    }
    echo(args, original){
      if(/^echo\.$/i.test(original.trim())) return '';
      if(!args.length) return 'ECHO está ativado.';
      return args.join(' ');
    }

    type(args){
      if(!args.length) return 'A sintaxe do comando está incorreta.';
      if(args.length === 1 && args[0].toLowerCase() === 'nul') return '';
      return args.map(name => this.fs.readFile(this.fs.resolve(name))).join('\n');
    }

    copy(args){
      const targets = args.filter(item => !item.startsWith('/'));
      if(targets.length < 2) return 'A sintaxe do comando está incorreta.';
      this.fs.copy(this.fs.resolve(targets[0]), this.fs.resolve(targets[1]), true);
      return '        1 arquivo(s) copiado(s).';
    }

    move(args){
      const targets = args.filter(item => !item.startsWith('/'));
      if(targets.length < 2) return 'A sintaxe do comando está incorreta.';
      this.fs.move(this.fs.resolve(targets[0]), this.fs.resolve(targets[1]));
      return '        1 arquivo(s) movido(s).';
    }

    rename(args){
      if(args.length < 2) return 'A sintaxe do comando está incorreta.';
      this.fs.rename(this.fs.resolve(args[0]), args[1]);
      return '';
    }

    del(args){
      const targets = args.filter(item => !item.startsWith('/'));
      if(!targets.length) return 'A sintaxe do comando está incorreta.';
      targets.forEach(target => this.fs.remove(this.fs.resolve(target), false));
      return '';
    }

    help(command){
      const details = {
        dir:'DIR [caminho] [/A] [/B] [/S]\nExibe uma lista de arquivos e subdiretórios.',
        cd:'CD [caminho]\nExibe ou altera o diretório atual.',
        mkdir:'MKDIR nome\nCria um diretório.',
        rmdir:'RMDIR [/S] nome\nRemove um diretório.',
        echo:'ECHO texto [> arquivo]\nExibe texto ou grava em arquivo.',
        copy:'COPY origem destino\nCopia arquivo ou pasta virtual.',
        move:'MOVE origem destino\nMove arquivo ou pasta virtual.',
        del:'DEL arquivo\nExclui um arquivo virtual.'
      };
      if(command) return details[command.toLowerCase()] || `Não há ajuda detalhada para ${command} neste simulador.`;
      return 'Para obter mais informações, digite HELP nome-do-comando.\nDIR CD CLS MKDIR RMDIR TREE ECHO TYPE COPY XCOPY MOVE REN DEL HELP VER VOL WHOAMI HOSTNAME SYSTEMINFO IPCONFIG PING TRACERT PATH SET DATE TIME TITLE COLOR PROMPT WHERE FIND FINDSTR TASKLIST';
    }

    systeminfo(){
      return 'Nome do host:                 LABORATORIO-DS\nNome do SO:                   Microsoft Windows 11 Pro (simulado)\nVersão do SO:                 11.0.26100\nFabricante do sistema:        Laboratório Virtual DS\nTipo de sistema:              PC baseado em x64\nMemória física total:         16.384 MB\nAdaptador de Rede:            Ethernet Virtual DS';
    }

    ipconfig(args=[]){
      const all = args.some(item => item.toLowerCase() === '/all');
      const base = 'Configuração de IP do Windows\n\nAdaptador Ethernet Ethernet Virtual DS:\n\n   Sufixo DNS específico de conexão. . . . . . : escola.local\n   Endereço IPv4. . . . . . . . . . . . . . . : 192.168.0.25\n   Máscara de Sub-rede . . . . . . . . . . . . : 255.255.255.0\n   Gateway Padrão. . . . . . . . . . . . . . : 192.168.0.1';
      if(!all) return base;
      return base + '\n   DHCP Habilitado. . . . . . . . . . . . . . : Sim\n   Servidor DHCP. . . . . . . . . . . . . . . : 192.168.0.1\n   Servidores DNS. . . . . . . . . . . . . . : 192.168.0.53\n                                                 8.8.8.8\n   Endereço Físico. . . . . . . . . . . . . . : 02-00-00-00-00-20\n   Concessão Obtida. . . . . . . . . . . . . . : ' + new Date().toLocaleString('pt-BR');
    }

    netstat(args=[]){
      const all = args.some(item => item.toLowerCase() === '-a');
      const rows = [
        '  TCP    127.0.0.1:3000         0.0.0.0:0              ESCUTANDO',
        '  TCP    192.168.0.25:49731     20.201.28.151:443      ESTABELECIDA',
        '  UDP    0.0.0.0:5353           *:*'
      ];
      return 'Conexões Ativas\n\n  Proto  Endereço local         Endereço externo       Estado\n' + (all ? rows.join('\n') : rows.slice(0,2).join('\n'));
    }

    arp(){
      return 'Interface: 192.168.0.25 --- 0x7\n  Endereço IP           Endereço físico       Tipo\n  192.168.0.1           02-11-22-33-44-55     dinâmico\n  192.168.0.53          02-aa-bb-cc-dd-ee     dinâmico';
    }

    route(){
      return 'Tabela de rotas IPv4\n===========================================================================\nRotas ativas:\nDestino da rede        Máscara          Gateway       Interface  Custo\n          0.0.0.0          0.0.0.0      192.168.0.1   192.168.0.25     25\n        127.0.0.0        255.0.0.0      No vínculo     127.0.0.1     331';
    }

    about(){
      return 'Laboratório Virtual DS — CMD simulado.\nOs comandos operam somente sobre arquivos e recursos virtuais do navegador.\nUse HELP para listar comandos e o botão Rede para alterar o perfil de latência/perda.';
    }

    ping(args){
      const host = args.find(item => !item.startsWith('-')) || 'localhost';
      return `Disparando ${host} [192.168.56.1] com 32 bytes de dados:\nResposta de 192.168.56.1: bytes=32 tempo=2ms TTL=64\nResposta de 192.168.56.1: bytes=32 tempo=1ms TTL=64\n\nEstatísticas do Ping para 192.168.56.1:\n    Pacotes: Enviados = 2, Recebidos = 2, Perdidos = 0 (0% de perda)`;
    }

    tracert(args){
      const host = args[0] || 'exemplo.local';
      return `Rastreando a rota para ${host}\n  1    <1 ms    <1 ms    <1 ms  192.168.56.1\n  2     4 ms     3 ms     4 ms  laboratorio-gateway\nRastreamento concluído.`;
    }

    path(args){
      if(args.length) this.vars.PATH = args.join(' ').replace(/^PATH=/i, '');
      return `PATH=${this.vars.PATH}`;
    }

    set(args){
      if(!args.length) return Object.entries(this.vars).map(([key, value]) => `${key}=${value}`).join('\n');
      const line = args.join(' ');
      const index = line.indexOf('=');
      if(index < 0){
        const query = line.toUpperCase();
        return Object.entries(this.vars).filter(([key]) => key.toUpperCase().startsWith(query)).map(([key, value]) => `${key}=${value}`).join('\n');
      }
      this.vars[line.slice(0, index)] = line.slice(index + 1);
      return '';
    }

    color(value){
      const palette = {a:'#5cff8d', b:'#62d8ff', c:'#ff6b7f', e:'#ffe477', f:'#ffffff', 7:'#c7d2df'};
      const key = String(value || '7').slice(-1).toLowerCase();
      document.body.style.setProperty('--accent', palette[key] || '#c7d2df');
      return '';
    }

    where(args){
      const command = args[0];
      return command ? `C:\\Windows\\System32\\${command.replace(/\.exe$/i, '')}.exe` : 'INFORMAÇÕES: Não foi possível localizar arquivos para os padrões fornecidos.';
    }

    find(args){
      const term = cleanQuotes(args[0] || '');
      const filename = args.find((item, index) => index > 0 && !item.startsWith('/'));
      if(!term || !filename) return 'A sintaxe do comando está incorreta.';
      const insensitive = args.some(item => item.toLowerCase() === '/i');
      return this.fs.readFile(this.fs.resolve(filename)).split(/\r?\n/).filter(line => insensitive ? line.toLowerCase().includes(term.toLowerCase()) : line.includes(term)).join('\n');
    }

    tasklist(){
      return 'Nome da imagem                 PID Nome da sessão      Uso de memória\nSystem Idle Process              0 Services                  8 K\nexplorer.exe                  4020 Console              96.200 K\nCode.exe                      5100 Console             180.000 K\nchrome.exe                    6200 Console             250.000 K';
    }
  }

  class UnixShell extends Shell{
    constructor(profile, fs, print, clear){
      super(profile, fs, print, clear);
      this.env = {USER:'aluno', HOME:this.fs.displayPath(this.fs.home), SHELL:profile.os === 'macos' ? '/bin/zsh' : '/bin/bash', PATH:'/usr/local/bin:/usr/bin:/bin'};
    }

    prompt(){
      const path = this.fs.promptPath();
      const distro = this.profile.distro;
      if(distro === 'kali') return `┌──(aluno㉿kali-ds)-[${path}]\n└─$ `;
      if(distro === 'fedora') return `[aluno@fedora-ds ${path}]$ `;
      if(distro === 'chromeos') return `crosh@chromebook:${path}$ `;
      if(this.profile.os === 'macos') return `aluno@MacBook-Pro ${path} % `;
      const host = distro === 'ubuntu' ? 'ubuntu-ds' : distro === 'debian' ? 'debian-ds' : 'laboratorio-ds';
      return `aluno@${host}:${path}$ `;
    }

    async run(input){
      const items = splitOperators(input.trim(), ['&&', '||', ';', '|']);
      let output = '';
      let success = true;
      let pendingOperator = ';';
      const visible = [];

      for(let index = 0; index < items.length; index++){
        const item = items[index];
        if(item.type === 'operator'){ pendingOperator = item.value; continue; }
        if(pendingOperator === '&&' && !success) continue;
        if(pendingOperator === '||' && success) continue;

        output = pendingOperator === '|' ? this.runOne(item.value, output) : this.runOne(item.value, null);
        success = !isErrorText(output);

        const next = items[index + 1];
        const nextIsPipe = next?.type === 'operator' && next.value === '|';
        if(!nextIsPipe && output !== '') visible.push(output);
      }
      return visible.join('\n');
    }

    runOne(line, pipedInput){
      try{
        const redirection = splitRedirection(line);
        if(redirection){
          const content = this.runOne(redirection.command, pipedInput);
          this.fs.writeFile(this.fs.resolve(cleanQuotes(redirection.target)), content ? `${content}${content.endsWith('\n') ? '' : '\n'}` : '', redirection.operator === '>>');
          return '';
        }

        const parts = tokenize(line);
        const command = parts.shift() || '';
        if(this.profile.os === 'macos'){
          const macResult = this.runMacSpecific(command, parts);
          if(macResult !== undefined) return macResult;
        }

        switch(command){
          case 'ls': return this.ls(parts);
          case 'cd': return this.cd(parts);
          case 'pwd': return this.fs.displayPath();
          case 'mkdir': return this.mkdir(parts);
          case 'rmdir': return this.rmdir(parts);
          case 'touch': return this.touch(parts);
          case 'cat': case 'less': case 'more': return this.cat(parts, pipedInput);
          case 'head': return this.headTail(parts, pipedInput, true);
          case 'tail': return this.headTail(parts, pipedInput, false);
          case 'cp': return this.copy(parts);
          case 'mv': return this.move(parts);
          case 'rm': return this.remove(parts);
          case 'clear': this.clear(); return '';
          case 'tree': return this.tree(parts);
          case 'echo': return parts.join(' ');
          case 'printf': return parts.join(' ').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
          case 'whoami': return 'aluno';
          case 'hostname': return this.hostname();
          case 'uname': return this.uname(parts);
          case 'date': return new Date().toString();
          case 'cal': return this.calendar();
          case 'history': return this.history.map((item, index) => `${String(index + 1).padStart(4)}  ${item}`).join('\n');
          case 'man': return this.manual(parts[0]);
          case 'help': case 'comandos': return this.help();
          case 'sobre': return 'Laboratório Virtual DS — shell Unix simulado. Nenhum comando acessa o sistema ou a rede real.';
          case 'grep': return this.grep(parts, pipedInput);
          case 'find': return this.find(parts);
          case 'locate': return this.locate(parts);
          case 'wc': return this.wordCount(parts, pipedInput);
          case 'sort': return this.sort(parts, pipedInput);
          case 'uniq': return this.uniq(parts, pipedInput);
          case 'cut': return this.cut(parts, pipedInput);
          case 'chmod': return parts.length >= 2 ? '' : 'chmod: falta operando';
          case 'chown': return parts.length >= 2 ? '' : 'chown: falta operando';
          case 'ps': return '  PID TTY          TIME CMD\n 1021 pts/0    00:00:00 bash\n 2030 pts/0    00:00:00 code\n 2440 pts/0    00:00:00 node';
          case 'top': return 'top - ambiente simulado\nTasks: 42 total, 1 running, 41 sleeping\n%Cpu(s): 4.0 us, 1.0 sy, 95.0 id\nMiB Mem : 16384 total, 8030 free, 6120 used';
          case 'kill': return parts[0] ? '' : 'kill: uso: kill <pid>';
          case 'df': return 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/vda1        50G  6.2G   44G  13% /';
          case 'du': return this.diskUsage(parts);
          case 'free': return '               total        used        free      shared  buff/cache   available\nMem:           16384        6120        8030         512        2234        9750\nSwap:           2048           0        2048';
          case 'ip': case 'ifconfig': return '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet 192.168.0.26/24 brd 192.168.0.255 scope global dynamic eth0\n    inet6 fe80::200:ff:fe00:26/64 scope link';
          case 'netstat': case 'ss': return 'Netid State  Recv-Q Send-Q Local Address:Port Peer Address:Port\ntcp   LISTEN 0      128    127.0.0.1:3000      0.0.0.0:*\ntcp   ESTAB  0      0      192.168.0.26:49220 20.201.28.151:443';
          case 'route': return 'Kernel IP routing table\nDestination     Gateway         Genmask         Flags Metric Ref Use Iface\ndefault         192.168.0.1     0.0.0.0         UG    100    0   0 eth0\n192.168.0.0     0.0.0.0         255.255.255.0   U     100    0   0 eth0';
          case 'nslookup': case 'dig': return 'A resolução DNS é processada progressivamente pelo simulador de rede.';
          case 'curl': return parts[0] ? `HTTP/2 200\ncontent-type: text/html; charset=utf-8\nserver: laboratorio-ds-simulado\n\nResposta simulada de ${parts[0]}` : 'curl: informe uma URL';
          case 'wget': return parts[0] ? `--${new Date().toISOString()}--  ${parts[0]}\nResolvendo destino... 203.0.113.10\nSalvando em: “index.html”\n100%[===================>] 1.024  --.-KB/s` : 'wget: URL ausente';
          case 'nmap': return this.nmap(parts);
          case 'whois': return this.whois(parts);
          case 'ping': return this.ping(parts);
          case 'traceroute': return this.traceroute(parts);
          case 'which': return parts[0] ? `/usr/bin/${parts[0]}` : '';
          case 'whereis': return parts[0] ? `${parts[0]}: /usr/bin/${parts[0]} /usr/share/man/man1/${parts[0]}.1.gz` : '';
          case 'env': return Object.entries(this.env).map(([key, value]) => `${key}=${value}`).join('\n');
          case 'export': return this.exportVariable(parts);
          case 'nano': return this.nano(parts);
          case 'apt': return this.packageManager('apt', parts);
          case 'dnf': return this.packageManager('dnf', parts);
          case 'sudo': return parts.length ? this.runOne(parts.join(' '), pipedInput) : 'sudo: informe um comando';
          case 'vim': return this.nano(parts);
          case 'exit': return 'Use o botão Início para fechar este terminal simulado.';
          case '': return '';
          default: return `${command}: comando não encontrado`;
        }
      }catch(error){ return error.message; }
    }

    ls(args){
      const flags = args.filter(item => item.startsWith('-')).join('');
      const target = args.find(item => !item.startsWith('-'));
      const path = target ? this.fs.resolve(target) : this.fs.cwd;
      const all = flags.includes('a');
      const long = flags.includes('l');
      const rows = this.fs.list(path, false).filter(row => all || !row.name.startsWith('.'));
      if(long){
        return rows.map(row => {
          const mode = row.node.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--';
          const size = row.node.type === 'file' ? (row.node.content || '').length : 4096;
          return `${mode} 1 aluno aluno ${String(size).padStart(6)} ${formatDate()} ${row.name}${row.node.type === 'dir' ? '/' : ''}`;
        }).join('\n');
      }
      return rows.map(row => `${row.name}${row.node.type === 'dir' ? '/' : ''}`).join('  ');
    }

    cd(args){
      this.fs.changeDir(args[0] ? this.fs.resolve(args[0]) : this.fs.home);
      return '';
    }

    mkdir(args){
      const recursive = args.includes('-p');
      const targets = args.filter(item => !item.startsWith('-'));
      if(!targets.length) return 'mkdir: falta operando';
      targets.forEach(target => recursive ? this.fs.mkdirp(this.fs.resolve(target)) : this.fs.mkdir(this.fs.resolve(target)));
      return '';
    }

    rmdir(args){
      const targets = args.filter(item => !item.startsWith('-'));
      if(!targets.length) return 'rmdir: falta operando';
      targets.forEach(target => this.fs.remove(this.fs.resolve(target), false));
      return '';
    }

    touch(args){
      const targets = args.filter(item => !item.startsWith('-'));
      if(!targets.length) return 'touch: falta operando';
      targets.forEach(target => {
        const path = this.fs.resolve(target);
        const content = this.fs.exists(path) && this.fs.isFile(path) ? this.fs.readFile(path) : '';
        this.fs.writeFile(path, content, false);
      });
      return '';
    }

    cat(args, pipedInput){
      const files = args.filter(item => !item.startsWith('-'));
      if(!files.length) return pipedInput || '';
      return files.map(file => this.fs.readFile(this.fs.resolve(file))).join('\n');
    }

    headTail(args, pipedInput, fromStart){
      let count = 10;
      const nIndex = args.indexOf('-n');
      if(nIndex >= 0 && Number.isFinite(Number(args[nIndex + 1]))) count = Math.max(0, Number(args[nIndex + 1]));
      const filename = args.find((item, index) => !item.startsWith('-') && index !== nIndex + 1);
      const content = filename ? this.fs.readFile(this.fs.resolve(filename)) : (pipedInput || '');
      const lines = content.split(/\r?\n/);
      return (fromStart ? lines.slice(0, count) : lines.slice(-count)).join('\n');
    }

    copy(args){
      const recursive = args.some(item => /^-.*r/.test(item));
      const targets = args.filter(item => !item.startsWith('-'));
      if(targets.length < 2) return 'cp: falta arquivo de destino';
      const source = this.fs.getNode(this.fs.resolve(targets[0]));
      if(source?.type === 'dir' && !recursive) return `cp: -r não especificado; omitindo o diretório '${targets[0]}'`;
      this.fs.copy(this.fs.resolve(targets[0]), this.fs.resolve(targets[1]), true);
      return '';
    }

    move(args){
      const targets = args.filter(item => !item.startsWith('-'));
      if(targets.length < 2) return 'mv: falta arquivo de destino';
      this.fs.move(this.fs.resolve(targets[0]), this.fs.resolve(targets[1]));
      return '';
    }

    remove(args){
      const recursive = args.some(item => /^-.*r/.test(item));
      const targets = args.filter(item => !item.startsWith('-'));
      if(!targets.length) return 'rm: falta operando';
      targets.forEach(target => this.fs.remove(this.fs.resolve(target), recursive));
      return '';
    }

    tree(args){
      const depthIndex=args.findIndex(item=>item==='-L');
      const maxDepth=depthIndex>=0?Math.max(1,Number(args[depthIndex+1])||1):Infinity;
      const supported=new Set(['-a','-L']);
      const unsupported=args.filter((item,index)=>item.startsWith('-')&&!supported.has(item)&&index!==depthIndex+1);
      if(unsupported.length)return `tree: opção não suportada: ${unsupported.join(' ')}`;
      const target=args.find((item,index)=>!item.startsWith('-')&&index!==depthIndex+1);
      const start=target?this.fs.resolve(target):this.fs.cwd;
      if(!this.fs.isDir(start))return `tree: '${target||'.'}': diretório não encontrado`;
      let dirs=0,files=0;
      const build=(parts,prefix='',depth=1)=>{
        if(depth>maxDepth)return '';
        const entries=Object.entries(this.fs.getNode(parts).children).sort(([a],[b])=>a.localeCompare(b));
        return entries.map(([name,child],index)=>{
          const isLast=index===entries.length-1;
          if(child.type==='dir')dirs++;else files++;
          let line=`${prefix}${isLast?'└── ':'├── '}${name}${child.type==='dir'?'/':''}\n`;
          if(child.type==='dir')line+=build(parts.concat(name),`${prefix}${isLast?'    ':'│   '}`,depth+1);
          return line;
        }).join('');
      };
      const body=build(start);
      return `.\n${body}\n${dirs} director${dirs===1?'y':'ies'}, ${files} file${files===1?'':'s'}`.trimEnd();
    }
    hostname(){
      const distro = this.profile.distro;
      return distro === 'ubuntu' ? 'ubuntu-ds' : distro === 'debian' ? 'debian-ds' : distro === 'kali' ? 'kali-ds' : distro === 'fedora' ? 'fedora-ds' : this.profile.os === 'macos' ? 'MacBook-Pro' : 'laboratorio-ds';
    }

    uname(args){
      if(this.profile.os === 'macos') return args.includes('-a') ? 'Darwin MacBook-Pro 24.5.0 Darwin Kernel Version 24.5.0 arm64' : 'Darwin';
      return args.includes('-a') ? 'Linux laboratorio-ds 6.8.0-labds #1 SMP x86_64 GNU/Linux' : 'Linux';
    }

    calendar(){
      const date = new Date();
      const month = date.toLocaleString('pt-BR', {month:'long', year:'numeric'});
      return `       ${month}\nDo Se Te Qu Qu Se Sá\n 5  6  7  8  9 10 11\n12 13 14 15 16 17 18\n19 20 21 22 23 24 25\n26 27 28 29 30 31`;
    }

    manual(command){
      if(!command) return 'Qual página do manual você deseja?';
      const descriptions = {
        ls:'ls - lista o conteúdo do diretório. Opções simuladas: -a, -l e -la.',
        mkdir:'mkdir - cria diretórios. Use -p para criar caminhos intermediários.',
        rm:'rm - remove arquivos. Use -r para remover diretórios.',
        grep:'grep - pesquisa linhas que contêm um padrão.',
        find:'find - pesquisa arquivos no sistema virtual.'
      };
      return `${command.toUpperCase()}(1)\n\n${descriptions[command] || `Manual didático simulado para o comando ${command}.`}`;
    }

    help(){
      return 'Comandos simulados: ls cd pwd mkdir rmdir touch cat head tail cp mv rm clear tree echo printf whoami hostname uname date cal history man grep find locate wc sort uniq cut chmod chown ps top kill df du free ip ping traceroute which whereis env export nano apt dnf sudo';
    }

    grep(args, pipedInput){
      const insensitive = args.includes('-i');
      const numbered = args.includes('-n');
      const clean = args.filter(item => !item.startsWith('-'));
      const pattern = cleanQuotes(clean[0] || '');
      const filename = clean[1];
      const content = filename ? this.fs.readFile(this.fs.resolve(filename)) : (pipedInput || '');
      if(!pattern) return '';
      return content.split(/\r?\n/).map((line, index) => ({line, index})).filter(item => insensitive ? item.line.toLowerCase().includes(pattern.toLowerCase()) : item.line.includes(pattern)).map(item => numbered ? `${item.index + 1}:${item.line}` : item.line).join('\n');
    }

    find(args){
      const startArg = args.find(item => !item.startsWith('-')) || '.';
      const nameIndex = args.indexOf('-name');
      const pattern = nameIndex >= 0 ? cleanQuotes(args[nameIndex + 1] || '').replace(/\*/g, '') : '';
      const start = this.fs.resolve(startArg);
      return this.fs.list(start, true).filter(row => !pattern || row.name.includes(pattern)).map(row => `/${row.path.join('/')}`).join('\n');
    }

    locate(args){
      const query = args[0] || '';
      return this.fs.list([], true).filter(row => row.name.includes(query)).map(row => `/${row.path.join('/')}`).join('\n');
    }

    wordCount(args, pipedInput){
      const filename = args.find(item => !item.startsWith('-'));
      const content = filename ? this.fs.readFile(this.fs.resolve(filename)) : (pipedInput || '');
      const lines = content === '' ? 0 : content.split(/\r?\n/).length;
      const words = content.trim() ? content.trim().split(/\s+/).length : 0;
      if(args.includes('-l')) return String(lines);
      if(args.includes('-w')) return String(words);
      if(args.includes('-c')) return String(content.length);
      return `${lines} ${words} ${content.length}${filename ? ` ${filename}` : ''}`;
    }

    sort(args, pipedInput){
      const filename = args.find(item => !item.startsWith('-'));
      const content = filename ? this.fs.readFile(this.fs.resolve(filename)) : (pipedInput || '');
      return content.split(/\r?\n/).sort((a, b) => a.localeCompare(b)).join('\n');
    }

    uniq(args, pipedInput){
      const filename = args.find(item => !item.startsWith('-'));
      const content = filename ? this.fs.readFile(this.fs.resolve(filename)) : (pipedInput || '');
      const lines = content.split(/\r?\n/);
      return lines.filter((line, index) => index === 0 || line !== lines[index - 1]).join('\n');
    }

    cut(args, pipedInput){
      const delimiterIndex = args.indexOf('-d');
      const fieldIndex = args.indexOf('-f');
      const delimiter = delimiterIndex >= 0 ? cleanQuotes(args[delimiterIndex + 1] || ',') : ',';
      const field = fieldIndex >= 0 ? Math.max(1, Number(args[fieldIndex + 1]) || 1) : 1;
      const filename = args.find((item, index) => !item.startsWith('-') && index !== delimiterIndex + 1 && index !== fieldIndex + 1);
      const content = filename ? this.fs.readFile(this.fs.resolve(filename)) : (pipedInput || '');
      return content.split(/\r?\n/).map(line => line.split(delimiter)[field - 1] ?? '').join('\n');
    }

    diskUsage(){ return '4.0K\t.'; }

    ping(args){
      const host = args.find(item => !item.startsWith('-')) || 'localhost';
      return `PING ${host} (192.168.56.1) 56(84) bytes of data.\n64 bytes from 192.168.56.1: icmp_seq=1 ttl=64 time=1.2 ms\n64 bytes from 192.168.56.1: icmp_seq=2 ttl=64 time=1.0 ms\n\n--- ${host} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss`;
    }

    traceroute(args){
      const host = args[0] || 'exemplo.local';
      return `traceroute to ${host}\n 1  192.168.56.1  1.002 ms\n 2  laboratorio-gateway  3.200 ms`;
    }

    nmap(args){
      const host = args.find(item => !item.startsWith('-')) || '192.168.56.1';
      return `Starting Nmap (simulado)\nNmap scan report for ${host}\nHost is up (0.0010s latency).\nPORT     STATE SERVICE\n22/tcp   open  ssh\n80/tcp   open  http\n443/tcp  open  https\n\nNmap done: 1 IP address (1 host up) scanned. Nenhum pacote de rede real foi enviado.`;
    }

    whois(args){
      const target = args[0] || 'exemplo.local';
      return `Domain Name: ${target.toUpperCase()}\nRegistrar: LABDS SIMULATED REGISTRY\nStatus: ACTIVE\nConsulta totalmente simulada; nenhum serviço externo foi acessado.`;
    }

    exportVariable(args){
      const line = args.join(' ');
      const index = line.indexOf('=');
      if(index >= 0) this.env[line.slice(0, index)] = cleanQuotes(line.slice(index + 1));
      return '';
    }

    nano(args){
      const filename = args[0];
      if(!filename) return 'nano: informe um arquivo';
      const path = this.fs.resolve(filename);
      if(!this.fs.exists(path)) this.fs.writeFile(path, '', false);
      return `GNU nano (simulado) abriu ${filename}. Para editar pelo terminal, use echo "texto" > ${filename}.`;
    }

    packageManager(manager, args){
      const command = args[0] || '';
      if(command === 'update') return `${manager}: metadados de pacotes atualizados no ambiente simulado.`;
      if(command === 'install') return `${manager}: pacote ${args[1] || '(não informado)'} instalado no ambiente virtual (simulação).`;
      if(command === 'remove') return `${manager}: pacote ${args[1] || '(não informado)'} removido do ambiente virtual (simulação).`;
      return `${manager}: gerenciador de pacotes simulado. Use: ${manager} update | ${manager} install pacote`;
    }

    runMacSpecific(command, args){
      switch(command){
        case 'sw_vers': return 'ProductName:            macOS\nProductVersion:         15.5\nBuildVersion:           24F74';
        case 'system_profiler': return 'Hardware:\n    Model Name: MacBook Pro\n    Model Identifier: Mac15,3\n    Chip: Apple M3 (simulado)\n    Memory: 16 GB';
        case 'open': return args[0] ? `Abrindo ${args[0]} no Finder simulado.` : 'open: informe um arquivo ou aplicativo';
        case 'say': return `Falando no macOS simulado: ${args.join(' ')}`;
        case 'defaults': return 'defaults: preferências simuladas do macOS.';
        case 'diskutil': return '/dev/disk0 (internal, physical, simulated):\n   0: GUID_partition_scheme  *256.0 GB disk0\n   1: Apple_APFS Container    255.7 GB disk0s1';
        case 'networksetup': return 'Hardware Port: Wi-Fi\nDevice: en0\nEthernet Address: 02:00:00:00:00:01';
        case 'brew': return this.packageManager('brew', args);
        default: return undefined;
      }
    }
  }

  class PowerShell extends Shell{
    prompt(){ return `PS C:\\${this.fs.cwd.join('\\')}>`; }

    async run(input){
      const items = splitOperators(input.trim(), ['|', ';']);
      let output = '';
      let operator = ';';
      for(const item of items){
        if(item.type === 'operator'){ operator = item.value; continue; }
        output = this.runOne(item.value, operator === '|' ? output : null);
      }
      return output;
    }

    runOne(line, pipedInput){
      const assignment = String(line).match(/^\s*\$([A-Za-z_][\w]*)\s*=\s*(.+)$/);
      if(assignment){ this.variables[assignment[1]] = cleanQuotes(assignment[2]); return ''; }
      const variableOnly = String(line).match(/^\s*\$([A-Za-z_][\w]*)\s*$/);
      if(variableOnly) return this.variables[variableOnly[1]] ?? '';
      const parts = tokenize(line).map(part => String(part).replace(/\$([A-Za-z_][\w]*)/g, (_, name) => this.variables[name] ?? ''));
      const original = parts.shift() || '';
      const aliases = {
        ls:'Get-ChildItem', dir:'Get-ChildItem', cd:'Set-Location', pwd:'Get-Location', cat:'Get-Content',
        echo:'Write-Output', cls:'Clear-Host', cp:'Copy-Item', mv:'Move-Item', rm:'Remove-Item'
      };
      let command = aliases[original.toLowerCase()] || original;
      if(original.toLowerCase() === 'mkdir'){
        command = 'New-Item';
        parts.unshift('-ItemType', 'Directory', '-Name');
      }
      const cmd = command.toLowerCase();

      try{
        switch(cmd){
          case 'get-childitem': return this.getChildItem(parts);
          case 'set-location': this.fs.changeDir(this.fs.resolve(parts[0] || this.fs.home.join('\\'))); return '';
          case 'get-location': return `\nPath\n----\nC:\\${this.fs.cwd.join('\\')}`;
          case 'new-item': return this.newItem(parts);
          case 'remove-item': return this.removeItem(parts);
          case 'copy-item': return this.copyItem(parts);
          case 'move-item': return this.moveItem(parts);
          case 'rename-item': return this.renameItem(parts);
          case 'get-content': return this.fs.readFile(this.fs.resolve(this.firstValue(parts)));
          case 'set-content': return this.setContent(parts, false);
          case 'add-content': return this.setContent(parts, true);
          case 'clear-content': this.fs.writeFile(this.fs.resolve(this.firstValue(parts)), '', false); return '';
          case 'test-path': return this.fs.exists(this.fs.resolve(this.firstValue(parts))) ? 'True' : 'False';
          case 'get-date': return new Date().toString();
          case 'get-help': return this.help(parts[0]);
          case 'get-command': return this.getCommand();
          case 'get-process': return 'Handles  CPU    Id ProcessName\n-------  ---    -- -----------\n    120  1.2  4020 explorer\n    430  3.1  6200 chrome\n    210  0.8  5100 Code';
          case 'get-service': return 'Status   Name               DisplayName\n------   ----               -----------\nRunning  Dhcp               DHCP Client\nRunning  EventLog           Windows Event Log\nStopped  Spooler            Print Spooler';
          case 'get-computerinfo': return 'WindowsProductName       : Windows 11 Pro Simulado\nCsName                   : LABORATORIO-DS\nOsArchitecture           : 64 bits\nCsTotalPhysicalMemory    : 17179869184';
          case 'test-connection': return 'A conexão é processada progressivamente pelo simulador de rede.';
          case 'resolve-dnsname': return 'A resolução DNS é processada progressivamente pelo simulador de rede.';
          case 'get-netipconfiguration': return 'InterfaceAlias       : Ethernet Virtual DS\nIPv4Address          : 192.168.0.25\nIPv4DefaultGateway   : 192.168.0.1\nDNSServer            : 192.168.0.53, 8.8.8.8';
          case 'get-netipaddress': return 'IPAddress         : 192.168.0.25\nPrefixLength      : 24\nAddressFamily     : IPv4\nInterfaceAlias    : Ethernet Virtual DS';
          case 'get-netadapter': return 'Name                InterfaceDescription              Status LinkSpeed\n----                --------------------              ------ ---------\nEthernet Virtual DS Adaptador virtual educacional      Up     1 Gbps';
          case 'get-netroute': return 'DestinationPrefix NextHop      RouteMetric InterfaceAlias\n----------------- -------      ----------- --------------\n0.0.0.0/0         192.168.0.1 25          Ethernet Virtual DS';
          case 'get-history': return this.history.map((item,index)=>`${index+1} ${item}`).join('\n');
          case 'write-output': case 'write-host': return parts.join(' ');
          case 'clear-host': this.clear(); return '';
          case 'sort-object': return String(pipedInput || '').split(/\r?\n/).sort((a, b) => a.localeCompare(b)).join('\n');
          case 'measure-object': return `Count    : ${String(pipedInput || '').split(/\r?\n/).filter(Boolean).length}`;
          case 'where-object': return pipedInput || '';
          case 'select-string': return this.selectString(parts, pipedInput);
          case 'out-file': return this.outFile(parts, pipedInput);
          case 'comandos': case 'sobre': return 'PowerShell educacional simulado. Cmdlets, aliases, variáveis e pipelines básicos são suportados; nenhum comando acessa o Windows real.';
          case 'exit': return 'Use o botão Início para fechar este terminal simulado.';
          case '': return '';
          default: return `${command}: O termo '${command}' não é reconhecido como nome de cmdlet, função, arquivo de script ou programa operável.`;
        }
      }catch(error){ return error.message; }
    }

    param(parts, names){
      for(const name of names){
        const index = parts.findIndex(item => item.toLowerCase() === name.toLowerCase());
        if(index >= 0) return parts[index + 1];
      }
      return null;
    }

    firstValue(parts){ return parts.find(item => !item.startsWith('-')) || ''; }

    getChildItem(parts){
      const target = this.param(parts, ['-Path']) || this.firstValue(parts);
      const path = target ? this.fs.resolve(target) : this.fs.cwd;
      const recursive = parts.some(item => item.toLowerCase() === '-recurse');
      const rows = this.fs.list(path, recursive);
      return `\n    Diretório: C:\\${path.join('\\')}\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\n${rows.map(row => `${row.node.type === 'dir' ? 'd-----' : '-a----'}        ${formatDate()}     ${String(row.node.type === 'file' ? (row.node.content || '').length : '').padStart(8)} ${recursive ? row.path.join('\\') : row.name}`).join('\n')}`;
    }

    newItem(parts){
      const type = String(this.param(parts, ['-ItemType']) || 'File').toLowerCase();
      const name = this.param(parts, ['-Name', '-Path']) || parts.find(item => !item.startsWith('-') && !['directory', 'file'].includes(item.toLowerCase())) || 'NovoItem';
      const path = this.fs.resolve(name);
      if(type.includes('dir')) this.fs.mkdir(path); else this.fs.writeFile(path, '', false);
      return `\n    Diretório: C:\\${this.fs.cwd.join('\\')}\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\n${type.includes('dir') ? 'd-----' : '-a----'}        ${formatDate()}          0 ${name}`;
    }

    removeItem(parts){
      const path = this.param(parts, ['-Path']) || this.firstValue(parts);
      this.fs.remove(this.fs.resolve(path), parts.some(item => item.toLowerCase() === '-recurse'));
      return '';
    }

    copyItem(parts){
      const source = this.param(parts, ['-Path', '-LiteralPath']) || this.firstValue(parts);
      const destination = this.param(parts, ['-Destination']) || parts.filter(item => !item.startsWith('-'))[1];
      if(!source || !destination) return 'Copy-Item: informe origem e destino.';
      this.fs.copy(this.fs.resolve(source), this.fs.resolve(destination), true);
      return '';
    }

    moveItem(parts){
      const values = parts.filter(item => !item.startsWith('-'));
      if(values.length < 2) return 'Move-Item: informe origem e destino.';
      this.fs.move(this.fs.resolve(values[0]), this.fs.resolve(values[1]));
      return '';
    }

    renameItem(parts){
      const values = parts.filter(item => !item.startsWith('-'));
      if(values.length < 2) return 'Rename-Item: informe o item e o novo nome.';
      this.fs.rename(this.fs.resolve(values[0]), values[1]);
      return '';
    }

    setContent(parts, append){
      const path = this.param(parts, ['-Path']) || this.firstValue(parts);
      const value = this.param(parts, ['-Value']) || parts.filter(item => !item.startsWith('-')).slice(1).join(' ');
      if(!path) return 'Set-Content: informe um caminho.';
      this.fs.writeFile(this.fs.resolve(path), `${cleanQuotes(value)}\n`, append);
      return '';
    }

    help(command){
      return command ? `NOME\n    ${command}\n\nSINOPSE\n    Ajuda simulada do Laboratório Virtual DS para ${command}.` : 'Ajuda simulada: Get-ChildItem, Set-Location, New-Item, Remove-Item, Copy-Item, Move-Item, Rename-Item, Get-Content, Set-Content, Add-Content, Test-Path e pipelines.';
    }

    getCommand(){
      return 'CommandType     Name\n-----------     ----\nCmdlet          Get-ChildItem\nCmdlet          Set-Location\nCmdlet          New-Item\nCmdlet          Remove-Item\nCmdlet          Get-Content\nCmdlet          Set-Content';
    }

    selectString(parts, pipedInput){
      const pattern = this.param(parts, ['-Pattern']) || parts.find(item => !item.startsWith('-')) || '';
      const path = this.param(parts, ['-Path']);
      const content = path ? this.fs.readFile(this.fs.resolve(path)) : (pipedInput || '');
      return content.split(/\r?\n/).filter(line => line.toLowerCase().includes(cleanQuotes(pattern).toLowerCase())).join('\n');
    }

    outFile(parts, pipedInput){
      const path = this.param(parts, ['-FilePath']) || this.firstValue(parts);
      if(!path) return 'Out-File: informe o caminho de destino.';
      this.fs.writeFile(this.fs.resolve(path), `${pipedInput || ''}\n`, parts.some(item => item.toLowerCase() === '-append'));
      return '';
    }
  }

  function createShell(profile, fs, print, clear){
    if(profile.shell === 'cmd') return new CmdShell(profile, fs, print, clear);
    if(profile.shell === 'powershell') return new PowerShell(profile, fs, print, clear);
    return new UnixShell(profile, fs, print, clear);
  }

  window.LABDS = window.LABDS || {};
  window.LABDS.createShell = createShell;
})();
