# Changelog 8.2.3 — estabilidade da IARA

## Corrigido

- IARA presa em “Inicializando” ou “Recarregando”;
- incompatibilidade entre o wrapper novo e `app.js` antigo armazenado em cache;
- camada de loading cobrindo a interface mesmo depois do carregamento do iframe;
- ausência de diagnóstico quando um módulo ES falhava;
- dependência obrigatória de todos os três JSON de inicialização;
- falta de timeout específico para a navegação do iframe.

## Adicionado

- `assistants/iara/js/boot.js`;
- evento `frame-loaded`;
- compatibilidade de handshake com cache antigo;
- versionamento das dependências internas da IARA;
- modo contextual degradado;
- painel de recuperação não bloqueante;
- teste de runtime do boot da IARA.

## Preservado

- 34 ferramentas;
- 25 laboratórios;
- 9 terminais;
- VoxelCraft DS 3D;
- Arcade Tech;
- 85 rotas e 87 pacotes criptografados da IARA;
- todos os laboratórios práticos anteriores.
