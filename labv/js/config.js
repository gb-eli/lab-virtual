'use strict';

window.LABDS_TERMINALS = [
  { id:'cmd', name:'Prompt de Comando do Windows — CMD', category:'Terminais de comando', shell:'cmd', os:'windows', theme:'theme-cmd', icon:'C:\\>', subtitle:'Windows 11 • Ambiente CMD simulado', tags:['Windows','CMD','Arquivos'], boot:'Microsoft Windows [versão 11.0.26100.0000]\n(c) Microsoft Corporation. Todos os direitos reservados.\n' },
  { id:'powershell', name:'Windows PowerShell', category:'Terminais de comando', shell:'powershell', os:'windows', theme:'theme-ps', icon:'PS', subtitle:'Windows PowerShell • Cmdlets e aliases', tags:['PowerShell','Pipeline','Cmdlets'], boot:'Windows PowerShell\nCopyright (C) Microsoft Corporation. Todos os direitos reservados.\n' },
  { id:'linux-bash', name:'Terminal Linux Bash', category:'Terminais de comando', shell:'bash', os:'linux', distro:'linux', theme:'theme-linux', icon:'$ ', subtitle:'Bash genérico • GNU/Linux', tags:['Linux','Bash','Unix'], boot:'Laboratório Virtual DS GNU/Linux\nDigite "help" para ver comandos simulados.\n' },
  { id:'debian', name:'Terminal Linux Debian', category:'Terminais de comando', shell:'bash', os:'linux', distro:'debian', theme:'theme-debian', icon:'deb', subtitle:'Debian • apt simulado', tags:['Debian','apt','Bash'], boot:'Debian GNU/Linux 12 laboratorio-ds tty1\n' },
  { id:'ubuntu', name:'Terminal Linux Ubuntu', category:'Terminais de comando', shell:'bash', os:'linux', distro:'ubuntu', theme:'theme-ubuntu', icon:'ubu', subtitle:'Ubuntu • apt simulado', tags:['Ubuntu','apt','Bash'], boot:'Welcome to Ubuntu 24.04 LTS (GNU/Linux simulado)\n' },
  { id:'kali', name:'Terminal Linux Kali Linux', category:'Terminais de comando', shell:'bash', os:'linux', distro:'kali', theme:'theme-kali', icon:'kali', subtitle:'Kali Linux • Ferramentas em ambiente seguro simulado', tags:['Kali','Bash','Segurança simulada'], boot:'Kali GNU/Linux Rolling laboratorio virtual\nFerramentas de rede/segurança são apenas simulações didáticas.\n' },
  { id:'fedora', name:'Terminal Linux Fedora', category:'Terminais de comando', shell:'bash', os:'linux', distro:'fedora', theme:'theme-fedora', icon:'fed', subtitle:'Fedora • dnf simulado', tags:['Fedora','dnf','Bash'], boot:'Fedora Linux 40 (Workstation Edition) - sessão simulada\n' },
  { id:'macos', name:'Terminal do macOS', category:'Terminais de comando', shell:'macos', os:'macos', distro:'macos', theme:'theme-macos', icon:'% ', subtitle:'macOS Terminal • Unix simulado', tags:['macOS','Unix','Zsh'], boot:'Last login: Fri Jul 10 08:42:10 on ttys000\n' }
];

window.LABDS_VERSION = '1.1.0-static-github-pages';
