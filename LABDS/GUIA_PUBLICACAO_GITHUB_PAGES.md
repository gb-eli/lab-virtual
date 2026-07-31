# Publicação no GitHub Pages

1. Faça backup da versão publicada atual.
2. Envie o conteúdo desta pasta para a pasta/branch usada pelo GitHub Pages.
3. Preserve a estrutura: `index.html`, `lab/`, `tools/` e documentação.
4. Confirme que `lab/vendor/three/three.module.min.js` foi enviado; sem ele o VoxelCraft não inicia.
5. Aguarde a publicação e abra `.../lab/index.html?v=4.0.0-pages`.
6. Em DevTools > Application, confirme o Service Worker `labds-v4.0.0-pages`.
7. Recarregue duas vezes para eliminar caches antigos e execute os testes de `GUIA_DE_TESTES.md`.

Não publique somente o HTML. Os 42 diretórios de `lab/modules/`, os jogos, workers, CSS e a pasta `vendor/` são obrigatórios.
