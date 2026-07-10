# Relatório técnico — Laboratório Virtual DS v4

## 1. Estrutura auditada

O projeto encontrado já possuía arquitetura modular em HTML, CSS e JavaScript, motores separados para terminal/rede, módulos carregados sob demanda, IndexedDB, Service Worker e ambientes isolados. A implementação foi preservada e ampliada, sem reconstrução genérica do zero.

### Componentes mantidos e aprimorados

- catálogo e página inicial;
- motor de arquivos virtuais;
- CMD, PowerShell, Bash e macOS;
- rede simulada;
- JavaScript, Python, Web e SQL;
- VM, hardware e computação gráfica;
- PWA e persistência.

## 2. Problemas encontrados na auditoria

- ausência de identificação e isolamento formal por estudante;
- histórico fragmentado e sem modelo central de eventos;
- exportações sem relatório completo de sessão;
- arquivos virtuais dos terminais fora do pacote completo;
- limpeza de sessão não removia todos os arquivos virtuais;
- parser entre aspas removia barras invertidas de caminhos Windows;
- `tree` precisava tratar `/f`, `/a`, caminho e erros de opção;
- backups importados aceitavam chaves sem validação suficiente;
- preview web aceitava mensagens apenas por marcador textual, sem validar o iframe emissor;
- preview web não possuía política própria bloqueando conexões externas;
- JavaScript e Python precisavam de timeout automático;
- grandes resultados SQL podiam criar renderização excessiva;
- não existiam comandos formais de lint, teste e build.

## 3. Arquivos principais criados

- `js/session.js`: sessão, sanitização, isolamento, eventos, restauração e limpeza;
- `js/session-exporter.js`: TXT, PDF, JSON, ZIP, manifesto, artefatos e SHA-256;
- `js/terminal/command-matrix.js`: parser auditável e metadados de comandos;
- `css/session.css`: cabeçalho, identificação, histórico e finalização;
- `tests/test-session-export.js`;
- `tests/test-static.js`;
- `tests/lint.js`;
- `tests/build-static.js`;
- `package.json`.

## 4. Identificação e sessão

Implementado:

- nome completo obrigatório;
- turma obrigatória e opção manual;
- lista centralizada em `js/config.js`;
- sanitização de HTML, espaços e caracteres de controle;
- UUID por sessão;
- cabeçalho discreto;
- troca de estudante com encerramento da sessão anterior;
- restauração após recarregamento sem expor automaticamente o nome anterior;
- finalização mantendo ou limpando dados;
- remoção dos estados IndexedDB e sistemas de arquivos dos terminais ao limpar.

## 5. Histórico central

Todos os laboratórios usam o mesmo serviço de eventos. O registro inclui sequência, horário, tempo decorrido, laboratório, tipo, entrada, saída, status, contexto e erro.

O histórico registra ações concluídas, não teclas. Foram integrados:

- comandos e operações de rede dos terminais;
- execuções JavaScript e Python;
- consultas e alterações SQL;
- configurações e testes de rede;
- instalação de VM e BIOS;
- POST e montagem de hardware;
- computação gráfica;
- preview front-end;
- blocos e ferramentas de dados;
- importações e exportações.

## 6. Auditoria dos terminais

### Parser

- nome do comando;
- argumentos;
- opções;
- operandos;
- aspas simples e duplas;
- caminhos Windows com barras invertidas.

### CMD `tree`

Validado:

```cmd
tree
tree /f
tree /a
tree /f /a
tree C:\Users\aluno\Documents
tree "C:\Minha Pasta" /f
```

A árvore é gerada diretamente do sistema de arquivos virtual e muda conforme arquivos e pastas são criados.

### Eventos

Cada comando registra diretório antes/depois, argumentos, opções, duração, código de resultado, mudanças no sistema de arquivos e saída apresentada.

## 7. Exportação

### TXT

Relatório completo com identificação, sessão, resumo, linha do tempo, comandos, códigos e resultados.

### PDF

Gerador local, sem conversor externo:

- A4;
- múltiplas páginas;
- Courier para comandos;
- rodapé com página, sessão e versão;
- quebras de linha e conteúdo longo.

### JSON

Sessão estruturada com hash SHA-256 e aviso sobre a limitação probatória do hash.

### ZIP

Gerado localmente com CRC32 e manifesto. Inclui, quando existentes:

- histórico TXT;
- PDF;
- JSON;
- códigos Python/JavaScript/Web;
- consultas e banco SQLite;
- arquivos do sistema virtual de cada terminal;
- configurações de rede, VM e hardware;
- matriz de pixels e programação visual;
- manifesto com tamanhos e hash.

## 8. Segurança

### Aplicação

- CSP;
- sem credenciais ou chaves privadas;
- sem analytics;
- dados pessoais somente locais;
- redaction de propriedades com nomes de senha/segredo;
- importação limitada a 20 MB na interface;
- máximo de 2.000 chaves e validação de nomes no restaurador;
- normalização de nomes e caminhos de exportação;
- limite de 5.000 eventos e redução de saídas extensas.

### JavaScript

- Web Worker;
- sem `eval()` ou `new Function()` direto;
- rede, WebSocket, XHR e `importScripts` do código do estudante bloqueados;
- limite de 100 KB;
- timeout de 8 segundos;
- botão Parar.

### Python

- Pyodide em Worker;
- interrupção por término do Worker;
- timeout de 20 segundos;
- entrada omitida do histórico quando o código indicar uso de senha.

### Front-end

- iframe sandbox sem `allow-same-origin`;
- CSP interna com `connect-src 'none'`;
- mensagens aceitas apenas do iframe criado pelo laboratório;
- sem inserção do HTML do estudante no DOM principal.

### SQL

- SQLite isolado no navegador;
- consulta limitada a 200 KB;
- renderização máxima de 500 linhas por conjunto;
- histórico reduz resultados muito extensos.

## 9. Armazenamento

- IndexedDB para estados estruturados;
- `localStorage` para preferências e sistema de arquivos síncrono;
- chaves de laboratório prefixadas com o `sessionId`;
- restauração controlada;
- exportação local;
- limpeza de todos os prefixos relacionados à sessão.

## 10. Testes executados

### Lint

```text
30 arquivos JavaScript passaram na verificação de sintaxe.
Nenhum uso direto de eval() ou new Function() foi encontrado.
```

### Motor e comandos

- criação, leitura, cópia e renomeação no CMD;
- `tree`, `tree /f`, `tree /a` e caminho inexistente;
- parser com caminho Windows entre aspas;
- operadores e pipeline Bash;
- ping progressivo e estatísticas.

### Sessão e privacidade

- nome com HTML;
- UUID;
- sequência dos eventos;
- ocultação de senha;
- isolamento e limpeza total da sessão.

### Exportação

- TXT;
- PDF;
- JSON;
- ZIP;
- SHA-256;
- códigos e arquivos virtuais dentro do ZIP.

O PDF foi validado pelo `pdfinfo` como PDF 1.4 A4 de duas páginas no teste de fumaça. O ZIP foi validado por `unzip -t` sem erros.

### Estrutura estática

- 114 IDs únicos;
- referências locais existentes;
- CSP presente;
- modais de identificação e histórico;
- opção de pacote ZIP.

### Build

```text
Build estático gerado em dist/ com 31 arquivos.
```

## 11. Dependências

Nenhuma dependência npm foi adicionada. `package.json` utiliza apenas Node.js para lint, testes e build.

Dependências externas de execução, carregadas sob demanda:

- Pyodide;
- sql.js.

## 12. Limitações reais

- não foi possível concluir automação visual end-to-end com Chromium no ambiente desta sessão; o processo headless não retornou o DOM, embora não tenha produzido erro JavaScript de aplicação;
- recomenda-se teste manual final em Chrome/Chromebook e celular;
- SQL ainda executa no thread principal;
- shells são subconjuntos educacionais;
- VM, BIOS e redes são simulações;
- o hash detecta alteração do documento, mas não autentica institucionalmente o estudante.

## 13. Resultado do build

Lint, testes e build passaram. A versão pronta para GitHub Pages está na raiz e em `dist/`.

## 14. Próximos módulos recomendados

- testes E2E com Playwright em CI;
- SQL em Worker;
- editor de arquivos integrado ao FS virtual;
- arquivo ZIP por laboratório além do pacote da sessão;
- Git e API REST simulados;
- política de retenção configurável para sessões arquivadas.

## Atualização visual v4.1

- Banner oficial integrado ao início da aplicação.
- Imagem otimizada em WebP, com fallback PNG.
- Ações principais permanecem elementos HTML reais e acessíveis.
- Hero reorganizado para reduzir poluição visual e preservar responsividade.
- Cache PWA atualizado para incluir os novos recursos visuais.

# Atualização 5.0 — Auditoria do laboratório de sistemas operacionais

## Arquivos criados

- `css/vm-lab-v5.css`
- `js/labs/vm/profiles.js`
- `js/labs/vm/engine.js`
- `js/labs/vm/renderer.js`
- `tests/test-vm.js`

## Arquivos alterados

- `index.html`
- `css/style.css`
- `js/app.js`
- `js/config.js`
- `js/labs/vm-lab.js`
- `service-worker.js`
- `package.json`
- documentação e build `dist/`

## Decisões técnicas

1. O laboratório de VM passou a utilizar máquina de estados em vez de uma única animação linear.
2. Os perfis de sistemas foram separados da lógica e da renderização.
3. Erros são derivados de requisitos de hardware, firmware, arquitetura, mídia e partições.
4. O conteúdo de senha simulada não é persistido, exportado ou incluído em eventos.
5. Os componentes visuais são recriados em CSS e não incorporam recursos proprietários.
6. O painel do instrutor utiliza comparação de hash local. Em site estático, não representa autenticação de servidor.
7. A tela inicial passou a utilizar um único catálogo filtrável; o bloco fixo de acesso rápido foi removido.
8. Os temas dos terminais foram aprofundados para CMD, PowerShell, Ubuntu, Debian, Kali, Fedora, macOS e ChromeOS.

## Cobertura atual

A versão 5 implementa o núcleo, perfis, boot, firmware, instalação, particionamento, configuração inicial, desktop básico, recuperação, checkpoints e relatório técnico. Alguns fluxos extremamente específicos do documento mestre — como todos os utilitários de recuperação de cada build, autenticações corporativas, multiboot completo e cada aplicativo de desktop — permanecem como evolução incremental, sem botões que afirmem executar funções inexistentes.

## Validação

- 34 arquivos JavaScript passaram no lint de sintaxe;
- nenhum uso direto de `eval()` ou `new Function()`;
- 17 perfis de sistema operacional validados;
- testes de requisitos, partições e checkpoints aprovados;
- senha não armazenada confirmada por teste;
- testes de terminais, sessões e exportação mantidos;
- build estático gerado com 36 arquivos.

# Atualização 5.1 — Auditoria funcional, gráfica e de UX

A revisão 5.1 preservou a arquitetura modular da v5 e concentrou as mudanças em falhas observadas no motor de VM, previsibilidade da rede, filtros, Workers e segurança de importação. O relatório detalhado está em `RELATORIO_AUDITORIA_V5_1.md`.
