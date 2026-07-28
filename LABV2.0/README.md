# Laboratório Virtual DS 8.2 — IARA integrada

Plataforma web estática para experiências educacionais de Desenvolvimento de Sistemas em computador, notebook, Chromebook, tablet e celular.

A versão 8.2.1 preserva os terminais, laboratórios práticos, Arcade Tech, VoxelCraft DS 3D e todos os módulos da versão 8.1. Ela adiciona a **IARA DS** como ferramenta nativa do portal, com o banco criptografado original e conhecimento contextual das 34 ferramentas do Lab Virtual DS.

## Publicação rápida no GitHub Pages

1. Execute `npm run package:pages` ou use o ZIP de publicação entregue.
2. Envie **o conteúdo interno de `dist/`** para a raiz da branch publicada.
3. Mantenha `.nojekyll`.
4. Em **Settings → Pages**, publique a raiz da branch.
5. Abra em aba anônima e confirme `v8.2.1-pages`.

A raiz redireciona para `lab/index.html` e preserva parâmetros como `?tool=iara-ds`.

## Comandos

```bash
npm run dev
npm run check:syntax
npm test
npm run build
npm run validate:artifact
npm run package:pages
```

## Rotas diretas

```text
lab/index.html?tool=iara-ds
lab/index.html?tool=python
lab/index.html?tool=sql
lab/index.html?tool=web
lab/index.html?tool=virtual-machine
lab/index.html?tool=hardware
lab/index.html?tool=code-games
lab/index.html?tool=voxelcraft-3d
lab/index.html?tool=artificial-intelligence
lab/index.html?tool=automation-iot
lab/index.html?tool=network-operations
```

## IARA DS

- ferramenta registrada como `iara-ds`;
- integração em `public/lab/js/labs/iara-lab.js`;
- aplicação em `public/lab/assistants/iara/`;
- 85 rotas temáticas criptografadas;
- 87 pacotes AES-GCM autenticados, contando tópicos e imagens;
- explicações rápida, clara, guiada e profunda;
- cinco perfis locais de resposta;
- catálogo visual de imagens simuladas;
- 34 ferramentas do Lab Virtual DS contextualizadas;
- recomendações com botão para abrir o laboratório indicado;
- nome, turma, tema, tamanho de fonte, redução de movimento e contraste recebidos da sessão do portal;
- funcionamento inteiramente no front-end.

A IARA é um mecanismo local de busca, roteamento e respostas estruturadas. Ela não é um modelo generativo remoto e não envia a pergunta para um serviço de IA externo.

## VoxelCraft DS 3D

- mundo procedural e streaming de chunks;
- inventário, construção e destruição de blocos;
- modos Livre, Aprendizagem e Desafio;
- perfis gráficos para celular, Chromebook e computador;
- controles por teclado, mouse e toque;
- salvamento local em IndexedDB.

## Inventário

- 34 ferramentas;
- 9 terminais;
- 25 laboratórios modulares;
- programação, bancos, sistemas, redes, hardware, gráficos, segurança, DevOps, fintech, automação, IA, mídia e jogos.

## Tecnologias

- HTML, CSS e JavaScript;
- IndexedDB e localStorage;
- Web Workers;
- WebAssembly;
- iframe sandboxado;
- Canvas 2D, SVG e WebGL 3D;
- Web Crypto AES-GCM e SHA-256;
- Service Worker e PWA;
- Pyodide, SQL.js e Three.js carregados sob demanda.

## Privacidade

Nome, turma, códigos, histórico e progresso ficam no navegador. Em equipamentos compartilhados, use **Finalizar e limpar dados pessoais**. A conversa da IARA não é enviada a um servidor e não é persistida como histórico após recarregar a página; apenas saldo pedagógico e códigos já utilizados ficam no armazenamento local.

## Atualização e cache

O Service Worker usa `labds-v8.2.1-pages`. Ao publicar outra versão, altere de forma sincronizada:

- `public/lab/js/config.js`;
- `public/lab/service-worker.js`;
- `public/lab/manifest.webmanifest`;
- `public/lab/index.html`;
- `package.json` e `package-lock.json`.

## Documentação

- `RELATORIO_IMPLEMENTACAO_V8_2.md`
- `INVENTARIO_MODULOS_V8_2.md`
- `TESTES_E_VALIDACAO_V8_2.md`
- `GUIA_PUBLICACAO_GITHUB_PAGES.md`
- `LIMITACOES_CONHECIDAS_V8_2.md`
- `CHANGELOG_V8_2.md`

## Créditos pedagógicos da IARA

A IARA inicia com **500 tokens**. Os códigos de recarga definidos pelo professor são `AGV` (+1.000), `DS` (+500) e `AURA` (+50.000), cada um utilizável uma vez por perfil do navegador. Como a aplicação é totalmente front-end, a limpeza dos dados do site remove o registro local de uso.
