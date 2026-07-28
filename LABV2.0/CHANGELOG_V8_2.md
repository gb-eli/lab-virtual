# Changelog — Laboratório Virtual DS 8.2

## Nova ferramenta

- IARA DS integrada como laboratório nativo `iara-ds`.
- Rota direta `lab/index.html?tool=iara-ds`.
- Aplicação original preservada em `public/lab/assistants/iara/`.
- Banco original com 85 rotas temáticas e 87 pacotes AES-GCM preservado.
- Contexto estático gerado para as 34 ferramentas do portal.
- Recomendações de laboratórios e abertura direta por botão.

## Integração

- Comunicação por `postMessage` validada por origem e janela remetente.
- Identidade da sessão, versão e preferências de acessibilidade enviadas à IARA.
- Registro de perguntas, tokens e recomendações no histórico da sessão.
- Exportação de resumo da utilização da IARA.
- Modo incorporado e modo em nova aba.

## Segurança

- Renderização exclusivamente com `textContent` e criação segura de elementos.
- Validação dos caminhos dos módulos criptografados.
- Limites para manifesto, envelopes, conteúdo descriptografado e contexto do portal.
- Leitura segura do localStorage corrompido.
- IDs de ferramentas validados antes da navegação.
- CSP da IARA mantida.

## Interface

- IARA adicionada ao acesso rápido da página inicial.
- VoxelCraft e Arcade continuam em destaque.
- Tema claro, escuro, contraste elevado, tamanho de fonte e redução de movimento sincronizados.
- Catálogo de laboratórios dentro da própria IARA.
- Layout responsivo para celular e tela cheia.

## PWA

- versão unificada `8.2.1-pages`;
- Service Worker `labds-v8.2.1-pages`;
- shell, contexto, banco criptografado e imagens da IARA incluídos no cache principal;
- atalho da IARA adicionado ao manifesto.
