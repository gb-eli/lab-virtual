# Lab Virtual DS V3.8 — arquitetura modular

## Camadas

- `js/core/bootstrap.js`: inicia somente o núcleo necessário.
- `js/core/resource-loader.js`: carrega scripts, estilos, pacotes e laboratórios sob demanda.
- `js/core/performance-manager.js`: escolhe economia, equilíbrio ou qualidade conforme dispositivo e configuração.
- `modules/<modulo>/module.json`: descrevem peso, dependências, estilos e scripts de cada laboratório.
- `modules/<modulo>/index.js`: implementação isolada de cada laboratório.
- `modules/cyber-ops/`: aplicação Cyber Ops isolada em iframe, com ponte de progresso.

## Pacotes adiados

- `terminal`: comandos, sistema de arquivos, rede e controlador.
- `shell`: painel de perfil, Loja Tech, conquistas e diagnóstico, preparado após a primeira renderização.
- `eduauth`: autorização administrativa, carregada em Modo Professor, VM ou links protegidos.
- `export`: exportador, relatório de sessão e entrega no Classroom.
- `learning`: conteúdo, tutorial e modo guiado.
- `effects`: aprimoramentos visuais e efeitos de ponteiro.

## Política de carregamento

O HTML inicial não referencia laboratórios nem bibliotecas pesadas. O núcleo abre o catálogo e a sessão. Um manifesto é consultado somente ao abrir um laboratório; seus arquivos entram no cache de execução depois do primeiro uso.

## Inclusão de módulo novo

1. Criar `modules/meu-modulo-lab/index.js` ou uma aplicação isolada em `modules/meu-modulo/`.
2. Criar `modules/meu-modulo-lab/module.json`.
3. Registrar a ferramenta em `js/config.js`.
4. Não adicionar o módulo ao `CORE_FILES` do Service Worker.
