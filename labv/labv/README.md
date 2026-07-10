# Laboratório Virtual DS

Aplicação web estática para o curso Técnico em Desenvolvimento de Sistemas. O projeto oferece terminais simulados e um sistema de arquivos virtual persistente, sem acessar arquivos, programas, rede ou configurações reais do equipamento.

## Terminais incluídos

- Prompt de Comando do Windows — CMD
- Windows PowerShell
- Terminal Linux Bash
- Debian
- Ubuntu
- Kali Linux
- Fedora
- Terminal do macOS

## Recursos

- sistema de arquivos virtual independente por terminal;
- persistência no `localStorage`;
- criação, leitura, cópia, movimentação, renomeação e exclusão de arquivos/pastas;
- histórico com setas para cima e para baixo;
- autocomplete de comandos e caminhos com `Tab`;
- operadores e pipelines simulados;
- mensagens de erro coerentes com cada shell;
- painel de referência de comandos;
- ajuste de fonte;
- minimizar, maximizar, fechar e tela cheia;
- restauração de cada ambiente;
- exportação em TXT, PDF, arquivo nativo e backup JSON;
- importação de um terminal;
- backup/importação de todos os terminais;
- layout responsivo para computadores, Chromebooks, tablets e celulares.


## Exportação em múltiplos formatos

O botão **Exportar** do terminal oferece quatro opções:

1. **TXT** — relatório textual com a saída visível e o histórico de comandos;
2. **PDF** — abre uma versão organizada para imprimir ou salvar como PDF;
3. **arquivo nativo da ferramenta** — gera `.bat` no CMD, `.ps1` no PowerShell e `.sh` nos terminais Linux/macOS;
4. **JSON** — backup completo do sistema de arquivos virtual, usado para restaurar o ambiente.

A estrutura está preparada para novos laboratórios. Um laboratório Python poderá declarar `.py`, SQL poderá declarar `.sql`, HTML poderá declarar `.html`, CSS poderá declarar `.css` e JavaScript poderá declarar `.js` no arquivo `js/config.js`.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Envie **todo o conteúdo** desta pasta para a raiz do repositório.
3. No GitHub, abra `Settings` → `Pages`.
4. Em `Build and deployment`, escolha `Deploy from a branch`.
5. Selecione a branch `main` e a pasta `/ (root)`.
6. Salve e aguarde a publicação.

Não é necessário instalar dependências, executar `npm` ou configurar servidor.

## Estrutura

```text
laboratorio_virtual_ds/
├── .nojekyll
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    ├── app.js
    ├── command-catalog.js
    ├── config.js
    ├── fs.js
    └── shells.js
```

## Atalhos

- `Enter`: executar comando;
- `↑` / `↓`: navegar pelo histórico;
- `Tab`: completar comando, arquivo ou pasta;
- `Ctrl + L`: limpar a tela;
- `Ctrl + C`: cancelar a entrada atual.

## Exemplos para teste

### CMD

```bat
mkdir projeto
cd projeto
echo Desenvolvimento de Sistemas > README.txt
type README.txt
dir
tree /f
```

### PowerShell

```powershell
New-Item -ItemType Directory -Name Projeto
Set-Location Projeto
New-Item -ItemType File -Name README.txt
Set-Content README.txt "Laboratório Virtual DS"
Get-Content README.txt
Get-ChildItem | Sort-Object Name
```

### Linux

```bash
mkdir -p projeto/src
cd projeto
touch README.md
echo "Laboratório Virtual DS" > README.md
cat README.md
cp README.md copia.md
ls -la
cat README.md | grep "Virtual"
```

### macOS

```bash
sw_vers
system_profiler
mkdir projeto
cd projeto
touch README.md
echo "Laboratório Virtual DS" > README.md
cat README.md
```

## Segurança

Todos os comandos são interpretados pelo JavaScript da própria página e afetam apenas objetos virtuais salvos pelo navegador.

A aplicação não:

- executa comandos reais;
- abre o terminal do sistema;
- acessa arquivos reais;
- instala pacotes reais;
- envia pacotes de rede;
- consulta outros dispositivos;
- altera permissões ou configurações do computador.

Comandos como `ping`, `tracert`, `nmap`, `ipconfig`, `systeminfo`, `tasklist`, `ps`, `apt`, `dnf` e `brew` retornam dados exclusivamente simulados.

## Limites desta versão

O projeto simula os comandos mais usados em aula, mas não implementa integralmente todos os detalhes de um sistema operacional real. A arquitetura permite ampliar comandos e ferramentas futuramente sem trocar a estrutura principal.


## Versão

`1.2.0-multi-export`
