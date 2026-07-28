# Changelog — Laboratório Virtual DS 8.2.3

## IARA DS

- Saldo inicial definido em **500 tokens**.
- Perfis novos recebem 500 tokens; instalações antigas que estavam com saldo zero recebem uma migração única para 500.
- Saldos positivos existentes são preservados.
- Código `AGV`: acrescenta 1.000 tokens, uma única vez por perfil do navegador.
- Código `DS`: acrescenta 500 tokens, uma única vez por perfil do navegador.
- Código `AURA`: acrescenta 50.000 tokens, uma única vez por perfil do navegador.
- Corrigida a leitura de armazenamento vazio: `Number(null)` não é mais interpretado como saldo zero.
- Criado módulo isolado `token-policy.js` para inicialização, migração e limites do saldo.
- O texto da área do professor agora explica que o controle de uso único é local.
- Corrigido o atalho inicial do VoxelCraft quando a IARA estiver no modo contextual degradado.

## Plataforma

- Versão unificada em `8.2.3-pages`.
- Service Worker atualizado para `labds-v8.2.3-pages`.
- `token-policy.js` incluído no cache principal da PWA.
- Recursos da IARA atualizados com parâmetro de versão 8.2.3.
