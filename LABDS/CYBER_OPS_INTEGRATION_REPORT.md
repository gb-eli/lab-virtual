# Relatório de integração — Cyber Ops no Lab Virtual DS V3.8

## Pacotes integrados

- base: `lab-virtual-ds-v3.6-sem-iara-github-pages-final.zip`;
- módulo: `cyber-ops-shadow-grid-v6.1-revisado.zip`;
- saída: Lab Virtual DS `3.8.0-pages`.

## Arquitetura escolhida

O Cyber Ops foi incorporado em `lab/modules/cyber-ops/` e é aberto pelo módulo adaptador `lab/modules/cyber-ops-lab/index.js`. A interface usa um `iframe` interno com sandbox controlado para evitar colisões de CSS, IDs, variáveis globais, temporizadores e diálogos com os demais laboratórios.

## Integrações realizadas

- novo item `cyber-ops` no catálogo de Cibersegurança;
- carregamento dinâmico somente quando o estudante abre o módulo;
- sincronização automática de nome e turma com a sessão ativa;
- codinome local gerado a partir da sessão;
- progresso isolado pela `sessionId` em chave `labds.cyber_ops_shadow_grid_v6.<sessionId>`;
- remoção do progresso quando a sessão é finalizada com limpeza de dados pessoais;
- inclusão do progresso nos backups completos do Lab Virtual DS;
- eventos de conclusão ou falha de missão registrados no histórico principal;
- registro de pontuação, precisão, tempo, dificuldade, ameaças, tentativas, pistas e emblemas;
- exportações do Cyber Ops registradas na sessão principal;
- exportação nativa do histórico acionável pelo menu de exportação do Lab Virtual DS;
- Service Worker próprio desativado no modo incorporado para não competir com o Service Worker principal;
- funcionamento autônomo do Cyber Ops preservado quando sua pasta é aberta diretamente.

## Validações executadas

- 51 ferramentas no catálogo;
- 42 módulos dinâmicos principais;
- 83 arquivos JavaScript aprovados na validação de sintaxe da V3.8;
- 125 arquivos servidos por HTTP com resposta 200 e tamanho exato;
- nenhuma referência local quebrada em HTML;
- todos os módulos de laboratório possuem arquivo e registro correspondente;
- manifestos JSON válidos;
- 18 recursos do cache autônomo do Cyber Ops conferidos;
- teste isolado da ponte de integração aprovou: conexão, aplicação de identidade, armazenamento por sessão, resumo de progresso, metadados de missão, exportação e confirmação de comando;
- teste da configuração confirmou o Cyber Ops como simulador educacional, sem bloqueio de minutos Arcade;
- varredura confirmou ausência de `fetch`, XHR, WebSocket ou EventSource na lógica operacional do Cyber Ops; o único link externo configurável é o Google Classroom.

## Limitação do teste visual automatizado

O Chromium instalado no ambiente iniciou o protocolo de depuração, porém a política do ambiente bloqueou a navegação para o servidor local antes de qualquer requisição HTTP. Por isso, não foi possível concluir a inspeção visual automatizada no navegador neste ambiente. A estrutura, execução JavaScript isolada, referências, rotas e integração de mensagens foram validadas por testes estáticos e por VM JavaScript.

## Publicação

O conteúdo do ZIP deve ser enviado mantendo `index.html`, `.nojekyll` e a pasta `lab/` na raiz do repositório ou da branch publicada pelo GitHub Pages.
