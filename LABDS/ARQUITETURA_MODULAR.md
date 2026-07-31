# Arquitetura modular V4.0

## Fluxo

1. `lab/index.html` carrega somente `css/boot.css` e `js/core/bootstrap.js`.
2. O bootstrap inicia catálogo, armazenamento, sessão, acessibilidade e aplicação.
3. `ResourceLoader` consulta `modules/<id>/module.json` ao abrir uma ferramenta.
4. Bundles compartilhados são carregados apenas quando necessários.
5. O módulo registra `mount`, `unmount`, `exportPayload` e `help` em `LABDS_LABS`.
6. Ao sair, listeners, timers, animações, iframes e recursos pesados são liberados pelo módulo.

## Limites de responsabilidade

| Camada | Responsabilidade |
|---|---|
| Núcleo | catálogo, rota, sessão, preferências, progresso e navegação |
| ResourceLoader | manifestos, scripts, estilos, deduplicação e métricas |
| PerformanceManager | perfil Automático e adaptação temporária por FPS |
| Módulos | lógica, UI e ciclo de vida da ferramenta |
| Workers | execução isolada de Python, SQL e JavaScript quando aplicável |
| DOM | menus, formulários, acessibilidade e HUD |
| Canvas/WebGL | jogos, gráficos e cenas em tempo real |
| Service Worker | núcleo mínimo e cache de runtime sob demanda |

## VoxelCraft

- simulação e inventário permanecem fora dos objetos de renderização;
- Three.js é carregado localmente somente quando o aluno inicia o mundo;
- adaptador do portal e jogo standalone comunicam-se por `postMessage` validado;
- IndexedDB salva apenas estado serializável;
- `destroy()` cancela RAF, pointer lock, listeners e libera geometria, material, textura e renderer.

## Desempenho

O modo Automático pode reduzir temporariamente resolução, distância, partículas e sombras. Baixo, Médio, Alto e Ultra continuam disponíveis manualmente. Nenhuma ferramenta é removida por perfil de desempenho.
