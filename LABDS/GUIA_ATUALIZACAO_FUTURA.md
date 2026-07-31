# Guia de atualização futura

1. Nunca use a versão numericamente mais nova como única fonte.
2. Compare o catálogo e exija pelo menos 51 ferramentas e 42 módulos, salvo inclusão documentada.
3. Execute `node tools/validate-project.mjs` antes e depois da alteração.
4. Mantenha cada módulo em `lab/modules/<id>/` com manifesto, registro e ciclo de vida.
5. Não mova módulos pesados para o caminho crítico.
6. Não substitua jogos, emuladores ou canvas por cartões demonstrativos.
7. Preserve os modos Automático, Baixo, Médio, Alto e Ultra.
8. Atualize versão em config, manifesto, Service Worker, HTML, índice de módulos e testes.
9. Não reintroduza a IARA DS nem copie outras plataformas do ecossistema.
10. Teste a versão publicada, inclusive cache, atualização e restauração de progresso.
