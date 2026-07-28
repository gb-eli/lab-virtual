# Arquitetura do VoxelCraft DS 3D

## Integração

O catálogo carrega `voxelcraft-lab.js`. Esse módulo cria um iframe da mesma origem com permissões restritas a scripts, origem, pointer lock, tela cheia e gamepad. O iframe envia apenas eventos estruturados de estado, progresso, salvamento e falha.

## Renderização

- Three.js/WebGL;
- geometria voxel por greedy meshing;
- atlas de texturas gerado em Canvas;
- chunks gerados por distância;
- fila substituída periodicamente para não processar chunks antigos;
- descarte de geometrias distantes;
- perfis de sombras, pixels e objetos.

## Ciclo de vida

Ao sair da ferramenta são removidos:

- `requestAnimationFrame`;
- eventos de teclado, mouse, toque e redimensionamento;
- pointer lock;
- geometrias, materiais e texturas;
- renderer e Canvas.

## Armazenamento

O schema 9 valida:

- posição, vida e fome;
- XP e estatísticas;
- até 15.000 edições;
- tipos de blocos permitidos;
- inventário por allowlist;
- configurações por enumeração e limites numéricos.
