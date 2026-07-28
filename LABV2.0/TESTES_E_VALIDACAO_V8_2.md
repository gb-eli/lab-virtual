# Testes e validação — versão 8.2.3

## Resultado

- 26 testes aprovados;
- 0 testes reprovados;
- todos os arquivos JavaScript passaram em `node --check`;
- artefato estático validado com 25 laboratórios modulares.

## Testes automatizados

A suíte inclui:

- integração nativa da IARA;
- protocolo independente de boot e evento `frame-loaded`;
- compatibilidade com JavaScript antigo mantido em cache;
- URLs versionadas para CSS, módulos e JSON da IARA;
- modo contextual em falha parcial;
- validação de origem e janela no `postMessage`;
- presença de todos os arquivos da IARA;
- catálogo contextual com 34 ferramentas;
- preservação das 85 rotas;
- autenticação e descriptografia dos 87 pacotes AES-GCM;
- ausência de `eval`, `new Function`, `document.write` e `innerHTML` nos scripts da IARA;
- IDs HTML únicos;
- CSP;
- Service Worker 8.2;
- schemas de backup;
- máquina virtual;
- VoxelCraft;
- build estático e rotas diretas.

## Comandos

```bash
npm run check:syntax
npm test
npm run build
npm run validate:artifact
```

## Validação manual recomendada

1. criar uma sessão de estudante;
2. abrir IARA DS;
3. perguntar “Quais ferramentas existem no Lab Virtual DS?”;
4. perguntar “Qual laboratório devo usar para aprender SQL?”;
5. usar o botão **Abrir SQL**;
6. retornar e perguntar sobre variáveis em Python;
7. alterar tema, contraste e tamanho de fonte;
8. testar em 390 px e 1366 px;
9. abrir VoxelCraft e Arcade para confirmar preservação;
10. atualizar o Service Worker e verificar a versão.

## Limitação da automação

Foi tentado um teste E2E em Chromium/Playwright, mas a política administrativa do ambiente bloqueou a navegação para servidor local e também para `file://` com `ERR_BLOCKED_BY_ADMINISTRATOR`. Portanto, não afirmamos que o fluxo visual integrado foi automatizado neste ambiente.

Os testes de estrutura e lógica não substituem a validação física em todos os aparelhos escolares. WebGL, memória, teclado virtual e políticas de PWA variam por navegador.
