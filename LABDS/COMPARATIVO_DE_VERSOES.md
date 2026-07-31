# Comparativo de versões do Lab Virtual DS

## Resultado executivo

A versão pública 8.2.3 é a regressão principal: preserva apenas 34 das 51 ferramentas e 25 dos 42 módulos presentes na linha 3.7/3.8. A V3.8 é a melhor base porque mantém todo o catálogo da V3.7, integra o Cyber Ops e introduz carregamento sob demanda sem reduzir o código dos módulos. A V4.0 consolida essa base e corrige a dependência externa que podia impedir o VoxelCraft de iniciar.

| Pacote analisado | Classificação | Arquivos | Bytes descompactados | Ferramentas | Módulos de laboratório | Avaliação |
|---|---|---:|---:|---:|---:|---|
| V3.6 sem IARA | LAB_VIRTUAL | 100 | 1.593.367 | 50 | 41 | Base completa anterior ao Cyber Ops |
| V3.7 Cyber Ops | LAB_VIRTUAL | 126 | 1.951.333 | 51 | 42 | Acrescenta Cyber Ops sem remover módulos |
| V3.8 Modular Performance | LAB_VIRTUAL | 181 | 2.008.523 | 51 | 42 | Melhor núcleo e melhor base de consolidação |
| Pública 8.2.3 | LAB_VIRTUAL degradada | 229 | 1.396.583 | 34 | 25 | IARA adicionada e 17 ferramentas removidas |
| Cyber Ops 6.1 independente | MÓDULO_NATIVO_CONFIRMADO | 22 | 328.754 | — | aplicação isolada | Consultado; a cópia integrada da V3.8 foi preservada |

## Ferramentas ausentes na versão pública 8.2.3

| ID | Ferramenta restaurada na V4.0 | Melhor origem |
|---|---|---|
| audio-lab | AudioLab — Frequências e Equalização | V3.8 |
| biomonitor | BioMonitor — Batimentos e Sinais | V3.8 |
| device-sensors | Câmera, Microfone e Sensores | V3.8 |
| energy-systems | Energia, Solar e Eólica | V3.8 |
| help-center | Central de Ajuda | V3.8 |
| iptv-streaming | IPTV e Streaming | V3.8 |
| market-simulator | Mercado Tech | V3.8 |
| printing-3d | Impressão e Modelagem 3D | V3.8 |
| productivity-suite | Produtividade e Escritório | V3.8 |
| school-randomizer | Sorteios e Organização Escolar | V3.8 |
| solar-system | Sistema Solar Interativo | V3.8 |
| teacher-mode | Modo Professor e Atividades | V3.8 |
| tech-explorer | Tecnologias, Linguagens e Carreiras | V3.8 |
| thermal-panel | Clima Extremo | V3.8 |
| traffic-radar | Radar e Trânsito Inteligente | V3.8 |
| tutorial-center | Central de Tutoriais | V3.8 |
| world-tools | Relógios, Alarmes e Conversores | V3.8 |

## Degradações localizadas

- Arcade Tech: a versão pública usa implementação menor; a V4.0 preserva a variante da V3.8 com mais jogos, dados, progressão e conteúdo educacional.
- Computação Gráfica: a V4.0 preserva borracha, conta-gotas, alfa, fundos de comparação, histórico, desfazer/refazer e PNG transparente.
- Hardware: a V4.0 preserva recompensa, progressão e conclusão validada após POST correto.
- Máquina Virtual: a V4.0 preserva as correções mais recentes de navegação, região/idioma, cancelamento e autorização temporária EduAuth.
- VoxelCraft: os arquivos 3D existiam, mas o carregamento dependia do jsDelivr. A V4.0 inclui Three.js local e remove esse ponto único de falha.

## Decisão de consolidação

1. V3.8 como núcleo, catálogo, arquitetura e implementação de módulos.
2. V3.7 como prova de não regressão e origem histórica do Cyber Ops.
3. V3.6 como prova do VoxelCraft e dos módulos anteriores à integração Cyber Ops.
4. Pública 8.2.3 usada somente para identificar perdas; o módulo IARA e seus arquivos não foram incorporados.
5. Cyber Ops 6.1 independente usado para conferir integridade; não foi misturado com o CTF DS.
