'use strict';

(function(){
  const entries = (items) => items.map(([command, description, example]) => ({command, description, example}));

  const cmd = entries([
    ['dir', 'Lista arquivos e pastas do diretório atual.', 'dir /a'],
    ['cd', 'Mostra ou altera o diretório atual.', 'cd Projects'],
    ['cls', 'Limpa a tela.', 'cls'],
    ['mkdir / md', 'Cria uma ou mais pastas.', 'mkdir projeto'],
    ['rmdir / rd', 'Remove uma pasta vazia ou usa /s para conteúdo.', 'rmdir /s projeto'],
    ['tree', 'Exibe a árvore de diretórios; /f inclui arquivos.', 'tree /f'],
    ['echo', 'Exibe texto ou grava conteúdo com > e >>.', 'echo Olá > arquivo.txt'],
    ['type', 'Exibe o conteúdo de um arquivo.', 'type arquivo.txt'],
    ['copy / xcopy', 'Copia arquivo ou pasta virtual.', 'copy arquivo.txt backup.txt'],
    ['move', 'Move arquivo ou pasta.', 'move arquivo.txt Documents'],
    ['ren / rename', 'Renomeia arquivo ou pasta.', 'ren antigo.txt novo.txt'],
    ['del / erase', 'Exclui arquivos.', 'del arquivo.txt'],
    ['find / findstr', 'Procura texto dentro de um arquivo.', 'find "DS" README.txt'],
    ['systeminfo', 'Mostra informações simuladas do sistema.', 'systeminfo'],
    ['ipconfig', 'Mostra a configuração de rede simulada.', 'ipconfig'],
    ['ping / tracert', 'Simula diagnóstico de rede sem acessar a rede real.', 'ping exemplo.local'],
    ['tasklist', 'Lista processos virtuais.', 'tasklist'],
    ['help', 'Mostra a lista ou ajuda de um comando.', 'help dir']
  ]);

  const powershell = entries([
    ['Get-ChildItem', 'Lista itens do diretório; aliases: ls e dir.', 'Get-ChildItem'],
    ['Set-Location', 'Altera o diretório; alias: cd.', 'Set-Location Projects'],
    ['Get-Location', 'Mostra o diretório atual; alias: pwd.', 'Get-Location'],
    ['New-Item', 'Cria arquivo ou pasta.', 'New-Item -ItemType Directory -Name Projeto'],
    ['Remove-Item', 'Remove item; -Recurse remove pasta com conteúdo.', 'Remove-Item Projeto -Recurse'],
    ['Copy-Item', 'Copia item virtual.', 'Copy-Item README.txt copia.txt'],
    ['Move-Item', 'Move item virtual.', 'Move-Item copia.txt Projects'],
    ['Rename-Item', 'Renomeia item virtual.', 'Rename-Item antigo.txt novo.txt'],
    ['Get-Content', 'Lê o conteúdo de um arquivo.', 'Get-Content README.txt'],
    ['Set-Content', 'Substitui o conteúdo de um arquivo.', 'Set-Content README.txt "Laboratório DS"'],
    ['Add-Content', 'Acrescenta conteúdo a um arquivo.', 'Add-Content README.txt "Nova linha"'],
    ['Test-Path', 'Verifica se um caminho existe.', 'Test-Path README.txt'],
    ['Get-Process', 'Lista processos virtuais.', 'Get-Process'],
    ['Get-Service', 'Lista serviços virtuais.', 'Get-Service'],
    ['Get-ComputerInfo', 'Exibe informações simuladas do computador.', 'Get-ComputerInfo'],
    ['pipeline |', 'Encadeia a saída entre cmdlets.', 'Get-ChildItem | Sort-Object Name']
  ]);

  const unix = entries([
    ['ls', 'Lista arquivos; -a ocultos e -l detalhes.', 'ls -la'],
    ['cd / pwd', 'Navega e mostra o diretório atual.', 'cd Projetos'],
    ['mkdir / rmdir', 'Cria ou remove diretórios.', 'mkdir projeto'],
    ['touch', 'Cria arquivo vazio ou atualiza o arquivo.', 'touch README.md'],
    ['cat / less / more', 'Exibe conteúdo de arquivos.', 'cat README.md'],
    ['head / tail', 'Mostra o início ou o fim do arquivo.', 'head -n 5 arquivo.txt'],
    ['cp / mv', 'Copia ou move itens virtuais.', 'cp README.md copia.md'],
    ['rm', 'Exclui arquivos; -r remove pastas.', 'rm -r projeto'],
    ['tree', 'Exibe a árvore do diretório.', 'tree'],
    ['echo / printf', 'Exibe ou grava texto com > e >>.', 'echo "linha" >> arquivo.txt'],
    ['grep', 'Pesquisa texto em arquivo ou pipeline.', 'cat arquivo.txt | grep "linha"'],
    ['find / locate', 'Localiza itens no sistema virtual.', 'find / -name "*.md"'],
    ['wc / sort / uniq', 'Conta, ordena e remove duplicações.', 'cat dados.txt | sort | uniq'],
    ['chmod / chown', 'Simula alterações de permissões e proprietário.', 'chmod 644 arquivo.txt'],
    ['ps / top / kill', 'Consulta e controla processos virtuais.', 'ps'],
    ['df / du / free', 'Mostra armazenamento e memória simulados.', 'df -h'],
    ['ip / ping / traceroute', 'Simula diagnóstico de rede.', 'ip addr'],
    ['nmap / whois', 'Simula consultas de segurança e registro sem acessar a rede real.', 'nmap 192.168.56.1'],
    ['env / export', 'Consulta e define variáveis da sessão.', 'export TURMA=3DS'],
    ['apt / dnf', 'Simula o gerenciador da distribuição.', 'apt install tree'],
    ['history / man', 'Consulta histórico e ajuda.', 'man ls'],
    ['operadores', 'Combina comandos com ;, &&, || e |.', 'mkdir projeto && cd projeto']
  ]);

  const macosExtra = entries([
    ['sw_vers', 'Mostra a versão simulada do macOS.', 'sw_vers'],
    ['system_profiler', 'Exibe hardware virtual do Mac.', 'system_profiler'],
    ['open', 'Simula abertura no Finder ou em aplicativo.', 'open README.md'],
    ['say', 'Simula o comando de fala do macOS.', 'say "Olá, turma"'],
    ['diskutil', 'Mostra discos virtuais.', 'diskutil list'],
    ['networksetup', 'Mostra configuração de rede simulada.', 'networksetup -listallhardwareports'],
    ['brew', 'Simula o Homebrew.', 'brew install tree']
  ]);

  window.LABDS_COMMAND_CATALOG = {cmd, powershell, bash: unix, macos: unix.concat(macosExtra)};
})();
