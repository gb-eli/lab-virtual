# Integração com o Laboratório Virtual DS

Esta cópia do **Cyber Ops — Shadow Grid v6.1** foi incorporada ao Lab Virtual DS como módulo isolado em `modules/cyber-ops/`.

## Comportamento integrado

- abertura interna por `iframe` com sandbox controlado;
- identidade do estudante recebida da sessão ativa do Lab Virtual DS;
- progresso separado por `sessionId`, evitando mistura de dados entre estudantes no mesmo navegador;
- eventos de missão, falhas, pontuação, emblemas e exportações enviados ao histórico da sessão principal;
- segundo Service Worker desativado quando `embedded=1`;
- arquivos armazenados sob demanda pelo Service Worker principal do Lab Virtual DS;
- execução autônoma preservada quando a pasta é aberta diretamente.

## Segurança

Todas as instituições, endereços, redes, transações, satélites e consultas são fictícios ou reservados para documentação. O módulo não acessa sistemas externos nem executa exploração real.
