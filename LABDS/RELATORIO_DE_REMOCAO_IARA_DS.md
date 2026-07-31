# Relatório de remoção da IARA DS

## Resultado

A IARA DS não integra a V4.0. Não existem pasta de assistente, módulo, card, rota, iframe, banco temático, imagens, estilos, scripts ou Service Worker próprios da IARA no pacote consolidado.

## Itens excluídos em relação à versão pública

- `lab/assistants/iara/` e todo seu conteúdo;
- `lab/js/labs/iara-lab.js`;
- `lab/css/iara-integration.css`;
- card, acesso rápido, rota e contexto da ferramenta;
- assets gerados, manifestos, vaults e políticas de tokens;
- entradas de cache e armazenamento exclusivas.

## Migração de privacidade

O núcleo mantém apenas uma lista técnica de identificadores legados removidos para reconhecer e apagar dados antigos em navegadores que já executaram versões anteriores. Essa lista não carrega interface, conteúdo ou lógica da ferramenta removida e evita deixar dados residuais.

## Proteção de outros dados

A limpeza é restrita aos identificadores legados removidos. Progresso, perfis, sessões, Loja Tech, evidências, VoxelCraft, Cyber Ops e demais módulos não são apagados.
