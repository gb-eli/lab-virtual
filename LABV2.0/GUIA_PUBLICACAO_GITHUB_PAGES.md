# Publicação no GitHub Pages — Lab Virtual DS 8.2

## Usando o ZIP pronto

1. Extraia `lab-virtual-ds-v8.2-iara-github-pages-final.zip`.
2. Apague os arquivos da versão anterior do repositório.
3. Envie todo o conteúdo extraído para a raiz da branch publicada.
4. Confirme que `.nojekyll`, `index.html`, `404.html` e a pasta `lab` estão na raiz.
5. Em **Settings → Pages**, selecione a branch e `/ (root)`.
6. Aguarde a publicação.
7. Abra em aba anônima e confirme `v8.2.1-pages`.

## Atualização do cache

O Service Worker usa `labds-v8.2.1-pages`. Depois da publicação:

1. use o aviso **Atualizar agora**, quando aparecer;
2. recarregue a página;
3. caso persista uma versão antiga, limpe os dados do site;
4. teste novamente em aba anônima.

## Teste local

```bash
npm run dev
```

Abra o endereço informado no terminal.

## Build completo

```bash
npm run package:pages
```

O artefato é criado em `dist/`.

## Rotas de validação

```text
lab/index.html?tool=iara-ds
lab/index.html?tool=voxelcraft-3d
lab/index.html?tool=code-games
lab/index.html?tool=python
lab/index.html?tool=sql
```

## Checklist rápido

- página inicial exibe `v8.2.1-pages`;
- IARA abre sem erro;
- pergunta “Quais ferramentas existem no Lab Virtual DS?” produz catálogo contextual;
- botão recomendado abre o laboratório correspondente;
- tema e tamanho de fonte são sincronizados;
- VoxelCraft e os laboratórios antigos continuam abrindo;
- Service Worker não mantém a versão 8.1.
