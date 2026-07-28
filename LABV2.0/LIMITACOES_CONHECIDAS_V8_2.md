# Limitações conhecidas — versão 8.2.1

## IARA

- A IARA é um mecanismo local de busca e respostas estruturadas, não um modelo generativo remoto.
- Ela responde somente ao que está coberto nas rotas criptografadas ou no contexto do Lab Virtual DS.
- Como toda aplicação 100% front-end, a chave usada pelo navegador não é segredo absoluto contra uma pessoa com controle completo do DevTools.
- O saldo de tokens é uma simulação pedagógica local.
- A geração de imagens seleciona composições do catálogo local; não cria imagens novas por modelo generativo.
- A conversa atual não é sincronizada entre dispositivos.

## Recursos externos

- Pyodide, SQL.js e Three.js podem exigir internet na primeira execução.
- O Service Worker armazena recursos depois da instalação e do primeiro carregamento, mas o comportamento offline depende das políticas do navegador.

## Dispositivos

- WebGL, WebAssembly e memória disponível variam entre celulares e Chromebooks.
- Não foi possível validar fisicamente todos os modelos de aparelho e navegador.

## Segurança

- Workers, WebAssembly e iframes reduzem riscos, mas o navegador não é um sandbox absoluto para código hostil.
- Módulos administrativos, financeiros, de segurança, redes e criptomoedas usam dados fictícios e simulações controladas.
