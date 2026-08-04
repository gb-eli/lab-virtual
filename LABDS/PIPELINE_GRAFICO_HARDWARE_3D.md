# Pipeline gráfico — Hardware Studio 3D

## 1. Objetivo visual

Produzir uma experiência visual progressiva: funcional em aparelhos simples e altamente detalhada em aparelhos potentes, sem criar duas plataformas diferentes.

## 2. Camadas visuais

### Geometria

- formas simples para Baixo;
- malhas médias para Médio;
- detalhes funcionais para Alto;
- detalhes finos, parafusos, conectores e interior completo para Ultra;
- LOD automático por distância e tamanho na tela.

### Materiais

Perfis reutilizáveis:

- metal pintado;
- alumínio escovado;
- aço bruto;
- plástico fosco;
- plástico brilhante;
- vidro claro;
- vidro escurecido;
- borracha;
- tecido;
- PCB;
- cobre;
- RGB emissivo;
- madeira de mesa.

### Texturas

Mapas possíveis:

- base color;
- roughness;
- metallic;
- normal;
- ambient occlusion;
- emissive;
- opacity.

A resolução deve depender da qualidade e da importância visual do objeto.

## 3. Resolução de texturas

| Qualidade | Itens pequenos | Peças principais | Ambiente |
|---|---:|---:|---:|
| Baixo | cor/material procedural | 256–512 px | 256–512 px |
| Médio | 256–512 px | 512–1024 px | 512–1024 px |
| Alto | 512 px | 1024 px | 1024 px |
| Ultra | 512–1024 px | 1024–2048 px seletivos | 1024–2048 px seletivos |

Não usar 4K em massa. Textura maior só quando a inspeção aproximada justificar.

## 4. Iluminação

### Baixo

- luz ambiente;
- uma luz direcional;
- sem sombras ou sombras mínimas.

### Médio

- iluminação principal e preenchimento;
- sombras reduzidas;
- emissivo simples.

### Alto

- ambiente HDR pré-processado;
- sombras melhores;
- contato e oclusão aproximada;
- vidro e reflexos simplificados.

### Ultra

- iluminação de apresentação;
- sombras de contato;
- ambient occlusion;
- bloom controlado;
- reflexos aproximados;
- profundidade de campo no modo cinema;
- exposição e tone mapping ajustados.

## 5. Shaders

Shaders próprios somente quando agregarem valor:

- vidro do gabinete;
- RGB;
- airflow e calor;
- tela do monitor;
- fumaça educativa;
- fogo virtual controlado;
- destaque de inspeção;
- holograma/encaixe fantasma.

Todo shader deve ter fallback para material padrão.

## 6. Reflexos e ray tracing

Caminho principal:

- PBR;
- environment maps;
- reflection probes aproximados;
- screen-space ou planar reflection apenas onde seguro;
- sombras e oclusão para aumentar percepção de profundidade.

WebGPU/ray tracing:

- somente experimental;
- detectado por recurso;
- nunca obrigatório;
- não impedir entrada no laboratório;
- não substituir o caminho WebGL2.

## 7. Partículas

Tipos:

- airflow;
- poeira;
- calor;
- RGB discreto;
- fumaça;
- fagulhas controladas no incidente;
- extinção.

Regras:

- quantidade por qualidade;
- pausa fora da tela;
- limite total;
- pooling;
- sem criação contínua de objetos JavaScript;
- desligamento automático no modo Baixo.

## 8. Tela dos monitores

A tela deve usar textura dinâmica ou canvas compartilhado para:

- desligado;
- POST;
- boot;
- desktop simulado;
- benchmark;
- jogo/animação educativa;
- gráficos de desempenho;
- alerta térmico.

Com múltiplos monitores, evitar um canvas independente pesado por tela. Usar atualizações limitadas e compartilhamento quando possível.

## 9. Modo inspeção

Ao abrir uma peça:

- ocultar ou reduzir a cena principal;
- centralizar o item;
- carregar LOD superior somente da peça;
- permitir zoom limitado;
- carregar detalhes sob demanda;
- liberar o LOD ao sair.

## 10. Modo cinema

- caminhos de câmera pré-calculados;
- colisão de câmera;
- profundidade de campo apenas Alto/Ultra;
- resolução dinâmica;
- ocultar HUD;
- interromper por qualquer entrada do usuário;
- reduzir efeitos se FPS cair.

## 11. Fumaça e fogo educativo

- só ativar após condição extrema explícita;
- usar partículas e sprite/mesh animado otimizado;
- limitar duração e quantidade;
- não depender de simulação volumétrica pesada;
- permitir desativar efeitos intensos por acessibilidade;
- registrar a ocorrência e a ação do aluno.

## 12. Critérios de qualidade visual

- escala coerente;
- materiais distinguíveis;
- vidro sem ordenar transparência incorretamente;
- ausência de z-fighting;
- sem textura invertida ou esticada;
- sombras sem cintilação excessiva;
- RGB sem saturação excessiva;
- conectores e portas legíveis em inspeção;
- cenas atuais e retrô visualmente distintas;
- diferença perceptível entre Baixo, Médio, Alto e Ultra.
