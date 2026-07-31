# Relatório de compatibilidade

| Recurso | Requisito | Fallback/observação |
|---|---|---|
| Portal e módulos DOM | navegador moderno ES2020+ | Chrome, Edge e Firefox atuais |
| VoxelCraft | WebGL 1/2 e módulos ES | exibe erro orientado quando WebGL não existe |
| Pointer lock/tela cheia | gesto do usuário | controles touch e terceira pessoa permanecem disponíveis |
| IndexedDB | navegador moderno | necessário para salvar o mundo VoxelCraft |
| Python/SQL avançados | WebAssembly e rede no primeiro uso | módulo informa falha sem apagar a ferramenta |
| Câmera/microfone/sensores | HTTPS/localhost e permissão | diagnóstico apresenta indisponibilidade |
| Áudio | gesto do usuário | ativação explícita conforme política do navegador |
| Service Worker/PWA | HTTPS/localhost | portal continua navegável sem instalação PWA |

O pacote é compatível com GitHub Pages. Caminhos são relativos e não dependem de domínio fixo.
