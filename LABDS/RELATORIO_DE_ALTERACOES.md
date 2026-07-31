# Relatório de alterações da consolidação

| Arquivo/área | Origem | Alteração | Função preservada/recuperada | Teste |
|---|---|---|---|---|
| `lab/` | V3.8 | adotado como base | 51 ferramentas e 42 módulos | validador e registros |
| `lab/vendor/three/` | Three.js 0.180.0 | biblioteca incluída localmente | renderização VoxelCraft sem CDN | existência, sintaxe e referência |
| VoxelCraft `game.js` | V3.8 | import local, água, luz, nuvens, seleção e animações | jogo 3D e imersão | sintaxe e dependências |
| VoxelCraft adaptador | V3.8 | texto, versão e runtime local | abertura integrada e standalone | registro do módulo |
| catálogo | V3.8 | versão V4.0 | restauração das 17 ferramentas | 51 IDs únicos |
| Service Worker | V3.8 | namespace V4.0 | cache modular sem colisão | referências e núcleo mínimo |
| índice de módulos | V3.8 | versão V4.0 | 42 módulos sob demanda | igualdade catálogo/índice |
| versão pública 8.2.3 | comparação | IARA e degradações rejeitadas | exclusão autorizada e recuperação | inventário comparativo |
| documentação | nova | auditoria, proveniência, regressão e guias | transparência e manutenção | revisão estrutural |
