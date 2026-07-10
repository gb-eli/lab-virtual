# Laboratório Virtual DS v5.1

Plataforma web modular para práticas do curso Técnico em Desenvolvimento de Sistemas. Funciona de forma estática no GitHub Pages, sem acessar o shell, os arquivos ou a rede real do equipamento.

O sistema não é quiz, jogo ou avaliação automática. Os estudantes exploram ferramentas, executam código, criam arquivos virtuais e exportam o histórico real da sessão.

## Novidades da versão 4

- identificação local do estudante antes da primeira ferramenta;
- turmas centralizadas em `js/config.js`;
- sessão isolada por UUID;
- cabeçalho discreto com estudante, turma e início;
- restauração segura após recarregamento;
- troca de estudante sem misturar ambientes;
- histórico central para todos os laboratórios;
- filtros, busca, expansão e cópia de eventos;
- exportação da sessão em TXT, PDF, JSON e ZIP;
- SHA-256 do histórico e manifesto de integridade;
- inclusão de códigos, banco SQLite, configurações e arquivos virtuais no pacote ZIP;
- limpeza completa de dados pessoais e do ambiente da sessão;
- auditoria e correção do parser de comandos, incluindo `tree`, `tree /f`, `tree /a` e caminhos entre aspas;
- CSP, validação de importação, limites de execução e isolamento reforçado.

## Fluxo de uso

1. O estudante abre a página e visualiza todas as ferramentas sem se identificar.
2. Ao abrir o primeiro laboratório, informa nome completo e turma.
3. A mesma sessão acompanha todas as ferramentas utilizadas.
4. Ações concluídas geram eventos; nenhuma tecla individual é registrada.
5. O estudante pode consultar e exportar o histórico.
6. Ao finalizar, escolhe manter a sessão localmente ou limpar os dados pessoais e os ambientes criados.

## Ferramentas disponíveis

### Terminais — simulação avançada

- CMD;
- PowerShell;
- Bash;
- Ubuntu;
- Debian;
- Kali Linux em contexto isolado;
- Fedora;
- macOS/Zsh;
- ChromeOS/Crosh simplificado.

Recursos:

- sistema de arquivos virtual por sessão;
- caminhos relativos e absolutos;
- criação, leitura, cópia, movimentação, renomeação e exclusão;
- histórico e autocomplete;
- redirecionamentos e pipelines básicos;
- `Ctrl+C` e `Ctrl+L`;
- ping e traceroute progressivos;
- perfis de rede com semente reproduzível;
- exportação TXT, PDF, script nativo e JSON.

### Desenvolvimento

- JavaScript real em Web Worker isolado;
- Python real com Pyodide em Web Worker;
- HTML/CSS/JavaScript em iframe sandbox;
- SQLite real via WebAssembly;
- programação visual em blocos.

### Laboratórios visuais

- redes e topologia;
- máquina virtual, BIOS/UEFI e instalação simulada;
- montagem de computador;
- cores, pixels e resolução;
- bases numéricas, Base64, Unicode e hashes.

## Identificação e privacidade

Os dados ficam somente no navegador. O projeto não possui analytics e não envia nome, turma, comandos ou códigos para um servidor da aplicação.

- nome e turma são sanitizados;
- tags HTML e caracteres de controle são removidos;
- campos/contextos identificados como senha são substituídos por `[não armazenado]`;
- ambientes são separados pelo `sessionId`;
- a sessão anterior não é exibida automaticamente na página inicial;
- a opção **Finalizar e limpar dados pessoais** remove também os arquivos virtuais daquela sessão.

Pyodide e sql.js são baixados do CDN apenas quando seus laboratórios são abertos. Os códigos do estudante não são enviados ao CDN.

## Histórico central

Cada evento pode conter:

```text
eventId
sessionId
sequenceNumber
timestamp
elapsedTime
laboratoryId
laboratoryName
eventType
action
input
output
status
context
error
```

São registrados comandos enviados, códigos executados, consultas SQL, testes simulados de rede, exportações, alterações de configuração e etapas importantes. O sistema não registra cada tecla digitada.

## Exportações da sessão

- **TXT:** histórico completo e legível;
- **PDF:** relatório A4 multipágina com fonte monoespaçada, resumo e rodapé;
- **JSON:** dados estruturados, eventos e hash;
- **ZIP:** relatório, histórico, JSON, manifesto e artefatos disponíveis.

O ZIP pode incluir:

```text
historico-sessao.txt
dados-sessao.json
relatorio-sessao.pdf
manifesto.json
arquivos/
codigos/
banco-de-dados/
imagens/
configuracoes/
```

O SHA-256 detecta alterações posteriores no histórico exportado, mas não substitui autenticação institucional.

## Estrutura

```text
laboratorio_virtual_ds/
├── index.html
├── package.json
├── manifest.webmanifest
├── service-worker.js
├── assets/
├── css/
│   ├── style.css
│   └── session.css
├── js/
│   ├── app.js
│   ├── config.js
│   ├── exporter.js
│   ├── session.js
│   ├── session-exporter.js
│   ├── storage.js
│   ├── terminal/
│   ├── labs/
│   └── workers/
├── tests/
├── dist/
└── RELATORIO_TECNICO.md
```

## Executar localmente

```bash
python -m http.server 8000
```

Acesse `http://localhost:8000`.

## Publicar no GitHub Pages

É possível publicar a raiz do projeto diretamente ou publicar o conteúdo de `dist/`.

1. Envie os arquivos para o repositório.
2. Abra **Settings > Pages**.
3. Selecione a branch `main`.
4. Use `/root`, ou publique `dist/` por uma action própria.

O arquivo `.nojekyll` está incluído.

## Qualidade

```bash
npm run lint
npm test
npm run build
```

- `lint`: valida a sintaxe de todos os JavaScripts e proíbe `eval()`/`new Function()` diretos;
- `test`: testa motor de arquivos, `tree`, parser, Bash, ping, sessão, sanitização, exportações, SHA-256 e estrutura estática;
- `build`: cria a versão estática em `dist/`.

## Segurança aplicada

- CSP no documento principal;
- nenhum shell real;
- nenhuma varredura real de rede;
- JavaScript em Worker com rede e importações externas bloqueadas;
- limite de código e timeout automático;
- Python em Worker com interrupção e timeout;
- preview web em iframe sandbox, CSP própria e sem acesso de rede;
- mensagens do preview aceitas somente do iframe correspondente;
- validação e limite de backups importados;
- nomes e caminhos normalizados no ZIP;
- saídas longas limitadas;
- SQL limitado na interface a 500 linhas renderizadas por conjunto.

## Limitações transparentes

- CMD, PowerShell, Bash, macOS, redes, BIOS e VM são simulações educacionais;
- os shells implementam subconjuntos coerentes, não sistemas completos;
- o SQL executa no navegador, mas ainda roda no thread principal;
- Python e SQLite exigem internet no primeiro carregamento;
- C, C++, C#, Java e outras linguagens ainda não possuem executores e não aparecem como ferramentas falsas;
- um teste visual end-to-end completo deve ser realizado em navegador real antes de uma implantação ampla.

## Identidade visual v4.1

A tela inicial utiliza o banner `assets/hero-laboratorio-virtual-ds.webp`, com fallback em PNG. A composição foi incorporada como elemento responsivo da página, mantendo busca, filtros, acessibilidade e botões funcionais separados da imagem.

## Versão 5.0 — Sistemas Operacionais e Máquinas Virtuais

A versão 5 substitui o antigo formulário linear de máquina virtual por um motor de estados modular, carregado sob demanda.

### Perfis disponíveis

- Windows XP Professional SP3;
- Windows 7 SP1;
- Windows 8;
- Windows 8.1 Update;
- Windows 10 22H2;
- Windows 11 24H2;
- Ubuntu Desktop 24.04 LTS;
- Ubuntu Desktop 26.04 LTS — perfil educacional preparado;
- Linux Mint Cinnamon;
- Debian 13 GNOME;
- Fedora Workstation;
- Arch Linux técnico;
- perfil Linux KDE Plasma;
- ChromeOS para Chromebook virtual;
- ChromeOS Flex;
- macOS em Mac Intel;
- macOS em Mac Apple silicon.

Cada perfil possui requisitos, arquitetura, firmware, regras de partição, boot, instalador, configuração inicial e ambiente de trabalho próprios. As telas são recriações educacionais produzidas em HTML/CSS; o projeto não distribui ISOs, executáveis, fontes, ícones ou sons proprietários.

### Recursos da máquina virtual

- modos simplificado e avançado;
- cenários prontos de incompatibilidade;
- configuração de RAM, CPU, disco, controlador, firmware, TPM, Secure Boot, rede e mídia;
- POST progressivo;
- BIOS clássica, UEFI gráfica, firmware de Chromebook e opções de inicialização de Mac;
- menu de boot funcional;
- particionamento automático ou manual;
- validações baseadas no estado da máquina;
- instalação progressiva com etapas específicas por perfil;
- OOBE/configuração inicial;
- desktop com Arquivos, Configurações e Terminal simulados;
- recuperação;
- checkpoints;
- relatório técnico em TXT/PDF/JSON;
- registro central no histórico da sessão;
- campo de senha simulado com conteúdo nunca persistido.

### Modo instrutor

A senha local padrão é:

```text
VM-DS#Instrutor-2026!
```

No código público é mantido apenas o hash SHA-256. Como a aplicação roda de forma totalmente estática no navegador, esse bloqueio deve ser entendido como controle pedagógico local, não como autenticação forte. Para trocar a senha, gere outro SHA-256 e substitua o hash no arquivo `js/labs/vm-lab.js`.

### Publicação

Execute:

```bash
npm run lint
npm test
npm run build
```

Publique o conteúdo de `dist/` na raiz do GitHub Pages.

## Versão 5.1 — Auditoria, UX e fidelidade da instalação

- busca do catálogo normalizada para termos com ou sem acento;
- aliases de busca para `JS`, `VM`, `BD` e `SO`;
- contador acessível de resultados e estado ARIA dos filtros;
- semente de ping/traceroute realmente reproduzível;
- teste explícito do traceroute progressivo;
- testes dos Workers JavaScript e Python;
- limite de 20 MB e nova tentativa segura no importador SQLite;
- hardware da VM bloqueado enquanto a máquina está ligada;
- confirmações antes de interromper instalação com reinício/desligamento;
- checkpoints bloqueados durante operações transitórias e restauração segura de snapshots antigos;
- boot de sistema já instalado sem exigir ISO conectada;
- erros específicos para mídia ausente, corrompida e arquitetura incompatível;
- trilha visual das fases: hardware, firmware, boot, disco, instalação, configuração e desktop;
- monitor com estado da VM e identificação técnica;
- instaladores com linguagem visual própria por geração/família de Windows, Linux, ChromeOS e macOS;
- progresso detalhado com subtarefas, estimativa, atividade de disco e configuração inicial;
- cache PWA atualizado para `v5.1.0`.

Consulte `RELATORIO_AUDITORIA_V5_1.md` para os testes, arquivos alterados e limitações reais.
