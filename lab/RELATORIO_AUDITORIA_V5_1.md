# Relatório de auditoria — Laboratório Virtual DS v5.1

Data: 10/07/2026  
Base auditada: `laboratorio_virtual_ds_v5_sistemas_operacionais.zip`  
Versão resultante: `5.1.0-auditoria-vm-ux`

## Escopo validado

- filtros e busca da página inicial;
- identidade visual de CMD, PowerShell, Bash, Ubuntu, Debian, Kali, Fedora, macOS e ChromeOS;
- ping e traceroute progressivos;
- sistema de arquivos virtual e `tree`, `tree /f`, `tree /a`;
- execução JavaScript e Python em Web Workers;
- limites e persistência do SQLite;
- perfis, requisitos, BIOS/UEFI, boot, partições, instalação, OOBE, desktop e recuperação da VM;
- checkpoints;
- sessão, privacidade, histórico, SHA-256 e exportações TXT/PDF/JSON/ZIP;
- estrutura estática, CSP, referências locais, PWA e build.

## Erros e fragilidades encontrados

1. A semente de rede não era reproduzível: `Date.now()` era incorporado mesmo quando o professor informava uma semente.
2. O hardware da VM podia ser alterado com a máquina ligada ou durante a instalação.
3. Cenários prontos podiam substituir a máquina em execução sem bloqueio.
4. Firmware e menu de boot podiam interromper etapas do instalador sem explicar o motivo.
5. Reiniciar ou desligar durante uma operação transitória não apresentava confirmação de perda do progresso.
6. Checkpoints podiam ser salvos no meio da cópia/reinicialização, mas o motor não conseguia retomar a tarefa assíncrona daquele ponto.
7. O checkpoint automático “Instalação iniciada” era criado já em estado transitório.
8. Uma máquina com sistema instalado era bloqueada se a ISO fosse removida.
9. A escolha manual de mídia ausente, corrompida ou de arquitetura incompatível não gerava códigos de boot específicos.
10. Todos os instaladores compartilhavam praticamente a mesma janela e cor, reduzindo a fidelidade entre Windows XP/7/8/10/11, Linux, ChromeOS e macOS.
11. A tela de instalação mostrava apenas uma frase e uma barra, sem subtarefas, estimativa ou contexto de disco/reinício.
12. A busca não normalizava acentos: `maquina` podia não encontrar `Máquina`.
13. Os filtros não anunciavam a quantidade resultante e não mantinham `aria-selected` atualizado.
14. O importador SQLite não limitava o tamanho do arquivo e não removia um carregador CDN que tivesse falhado.
15. O carregamento de biblioteca Python podia ser solicitado durante uma execução ativa.
16. Não havia teste direto dos Workers de JavaScript/Python nem teste explícito do traceroute.

## Correções realizadas

### Máquina virtual e sistemas operacionais

- bloqueio dos controles de hardware e cenários enquanto a VM está ligada;
- estado visual “hardware editável/bloqueado”;
- trilha de sete fases do processo;
- estado ao vivo da VM na barra superior;
- confirmação para reiniciar/desligar durante operações transitórias;
- bloqueio de firmware/menu de boot em fases incompatíveis;
- checkpoint somente em estados restauráveis;
- checkpoint automático movido para antes da gravação;
- conversão segura de snapshots transitórios antigos;
- boot pelo disco sem ISO quando o sistema já está instalado;
- validação específica de mídia, integridade, arquitetura e PXE;
- relatório com início/fim da instalação, etapa, progresso e reinicializações;
- monitor com OSD técnico, câmera e identificação da VM;
- instaladores com estilos específicos por perfil/família;
- progresso com checklist, estimativa e atividade de disco;
- OOBE com indicador de etapas;
- mensagens mais claras sobre mídia virtual e disco instalado;
- responsividade revisada para painéis, instalador, monitor e progresso.

### Página inicial e filtros

- normalização Unicode NFD e remoção de diacríticos;
- aliases `JS`, `VM`, `BD` e `SO`;
- busca também por ID, nome curto, sistema e tipo de execução;
- contador de resultados com `aria-live`;
- abas de categoria com `role="tab"` e `aria-selected` sincronizado.

### Redes

- semente determinística quando informada;
- modo variável preservado quando a semente fica vazia;
- cobertura de ping repetível e traceroute progressivo.

### Execução e dados

- teste de execução JavaScript no Worker e bloqueio de rede;
- teste da ponte de entrada/código do Worker Python;
- biblioteca Python bloqueada durante código em execução;
- importação SQLite limitada a 20 MB;
- carregador SQL com remoção e nova tentativa após falha;
- erro explícito de leitura do arquivo SQLite.

## Arquivos alterados

- `index.html`
- `package.json`
- `service-worker.js`
- `README.md`
- `RELATORIO_TECNICO.md`
- `RELATORIO_AUDITORIA_V5_1.md` (novo)
- `css/style.css`
- `css/vm-lab-v5.css`
- `js/app.js`
- `js/config.js`
- `js/labs/python-lab.js`
- `js/labs/sql-lab.js`
- `js/labs/vm-lab.js`
- `js/labs/vm/engine.js`
- `js/labs/vm/renderer.js`
- `js/terminal/network-engine.js`
- `tests/test-core.js`
- `tests/test-runtimes.js` (novo)
- `tests/test-static.js`
- `tests/test-vm.js`
- `dist/**` regenerado pelo build.

## Testes executados

### Lint equivalente ao script oficial

- 35 arquivos JavaScript de fonte/teste passaram em verificação de sintaxe;
- nenhum `eval()` ou `new Function()` direto foi encontrado.

### Testes centrais

- CMD, arquivos, cópia, renomeação e árvore;
- `tree`, `tree /f`, `tree /a` e caminhos entre aspas;
- Bash, operadores, redirecionamento e pipeline;
- ping progressivo e estatísticas;
- semente de rede reproduzível;
- traceroute progressivo e conclusão.

### Sessão e exportação

- identificação e sanitização;
- UUID, sequência e redaction de senha;
- TXT, PDF, JSON, ZIP, artefatos e SHA-256;
- remoção completa do espaço da sessão;
- inspeção do ZIP com relatório, histórico, JSON, código e arquivos virtuais.

### VM e instaladores

- 17 perfis de SO;
- requisitos, firmware, TPM, Secure Boot e arquitetura;
- partições NTFS, EFI, Linux e APFS;
- checkpoints e privacidade de senha;
- bloqueio de checkpoint transitório;
- boot sem ISO após instalação;
- erro de mídia ausente;
- renderização detalhada e progresso acessível.

### Runtimes

- JavaScript executado em Worker;
- rede bloqueada no Worker JavaScript;
- código e entrada encaminhados ao Worker Python;
- limites SQLite de importação e renderização.

### Estrutura e build

- 112 IDs únicos;
- 17 referências locais válidas;
- CSP, identificação, histórico e ZIP presentes;
- filtros acessíveis e busca sem acento;
- nove identidades visuais de terminal presentes;
- build estático regenerado com 36 arquivos;
- 27 scripts JavaScript do `dist/` passaram na sintaxe;
- fontes críticas e build foram comparados por SHA-256.

## Observação sobre os comandos npm

O sandbox desta sessão bloqueou o Node ao resolver o diretório pai (`EPERM` em `C:\Users\Administrador`) antes de iniciar `npm run lint`. Para não mascarar o resultado, os mesmos scripts oficiais foram executados pelo conteúdo via entrada padrão, com o diretório do projeto injetado como raiz. O build foi executado pela mesma lógica de `tests/build-static.js`. Em ambiente local comum, os comandos continuam sendo:

```bash
npm run lint
npm test
npm run build
```

## Limitações reais

- BIOS, UEFI, instaladores e sistemas operacionais são simulações educacionais de alta fidelidade; nenhuma ISO ou máquina virtual real é executada.
- As telas são recriações em HTML/CSS e não distribuem ícones, fontes, sons ou imagens proprietárias dos fabricantes.
- Python/Pyodide e SQLite/sql.js dependem do CDN no primeiro carregamento. Nesta auditoria offline foram validados os Workers, a integração e os limites, não o download real do CDN.
- O SQL ainda executa no thread principal; consultas computacionalmente caras podem bloquear a interface mesmo com limite de 200 KB e renderização de 500 linhas.
- Os terminais implementam subconjuntos educacionais, não shells completos.
- O teste visual automatizado no navegador não pôde ser concluído porque o controlador do navegador da sessão não aceitou o módulo local. A responsividade foi revisada por estrutura/CSS e testes estáticos; recomenda-se uma rodada manual final em Chrome/Chromebook, celular e TV antes da implantação ampla.
- O PDF é gerado localmente e validado por assinatura/estrutura nos testes; paginação de relatórios extremos ainda deve ser conferida com dados reais da escola.
- O hash SHA-256 detecta alterações no histórico exportado, mas não autentica institucionalmente o estudante.
