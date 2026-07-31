# Relatório de desempenho

## Estratégia preservada

- caminho crítico com um script e um CSS;
- 42 módulos carregados sob demanda;
- terminal, rede, exportação, EduAuth, aprendizagem, shell e efeitos em bundles separados;
- cache de núcleo separado do cache de runtime;
- pausa e descarte dos recursos ao fechar módulos;
- monitor de FPS no modo Automático.

## Perfis

| Perfil do usuário | Efeito |
|---|---|
| Automático | considera memória, núcleos, conexão, touch e FPS |
| Econômico | mínimo de efeitos e concorrência |
| Baixo | baixa resolução, sombras desativadas e menor distância |
| Médio | equilíbrio para Chromebook/tablet |
| Alto | sombras, mais objetos, resolução e distância |
| Ultra | maior densidade, sombras, partículas e resolução disponíveis |

## VoxelCraft

O renderizador local acrescenta aproximadamente 720 KB ao pacote (módulo e núcleo), mas não ao caminho crítico. Ele só é transferido quando o jogo inicia e depois pode ser reutilizado pelo cache de runtime. A troca remove uma dependência externa instável e melhora a previsibilidade em redes escolares.

## Garantia de preservação

Nenhum módulo foi removido por desempenho. O catálogo permanece com 51 ferramentas; os recursos pesados são adiados, não eliminados.
