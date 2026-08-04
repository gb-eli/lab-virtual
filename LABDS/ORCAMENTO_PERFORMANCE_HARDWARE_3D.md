# Orçamento de desempenho — Hardware Studio 3D

## 1. Objetivo

Estabelecer limites mensuráveis antes de adicionar modelos, texturas, telas, partículas e pós-processamento.

## 2. Metas por perfil

| Perfil | Meta principal | FPS de referência | Memória gráfica aproximada |
|---|---|---:|---:|
| Baixo/mobile | completar atividade | 24–30 | até 180 MB |
| Médio/escolar | interação estável | 30–45 | até 300 MB |
| Alto | experiência detalhada | 45–60 | até 500 MB |
| Ultra | apresentação visual | 45–60 em aparelho capaz | até 800 MB, com adaptação |

Os limites são metas de engenharia, não garantias absolutas em todos os dispositivos.

## 3. Orçamento de cena

### Baixo

- até 150 mil triângulos visíveis;
- até 80 draw calls preferencialmente;
- no máximo uma sombra principal;
- partículas mínimas;
- pixel ratio limitado.

### Médio

- até 350 mil triângulos visíveis;
- até 140 draw calls;
- sombras básicas;
- materiais intermediários.

### Alto

- até 800 mil triângulos visíveis;
- até 220 draw calls;
- detalhes internos;
- pós-processamento moderado.

### Ultra

- até 1,5 milhão de triângulos visíveis em cena de apresentação;
- até 300 draw calls;
- LOD e culling obrigatórios;
- detalhes finos carregados sob demanda.

## 4. Estratégias obrigatórias

- LOD;
- frustum culling;
- instancing para objetos repetidos;
- geometria compartilhada;
- materiais compartilhados;
- texturas compactadas quando suportadas;
- lazy loading;
- descarte explícito;
- pooling de partículas;
- redução dinâmica de pixel ratio;
- pausa quando `document.hidden`;
- atualização térmica em frequência menor que o render;
- atualização da tela do monitor limitada.

## 5. Múltiplos monitores

- uma tela: atualização normal;
- duas telas: reduzir frequência de conteúdo secundário;
- três telas: compartilhar fontes e limitar resolução dinâmica;
- telas fora do enquadramento não devem atualizar conteúdo complexo;
- benchmark visual não deve criar três renderizadores 3D independentes.

## 6. Inspeção

- carregar alta resolução apenas para o item inspecionado;
- reduzir ou pausar a cena de fundo;
- máximo de um ativo detalhado isolado por vez;
- liberar texturas de inspeção ao voltar.

## 7. Benchmark térmico

- lógica térmica desacoplada do FPS;
- passo fixo ou atualização limitada;
- partículas condicionadas à qualidade;
- fumaça e fogo com duração e emissão limitadas;
- extintor sem física volumétrica pesada.

## 8. Adaptação automática

Sinais:

- FPS médio;
- frame time;
- memória estimada;
- falha de contexto WebGL;
- temperatura do dispositivo não é diretamente acessível e não deve ser inventada.

Ações:

1. reduzir pixel ratio;
2. reduzir sombras;
3. reduzir partículas;
4. reduzir distância/LOD;
5. desativar reflexos;
6. reduzir atualização das telas;
7. sugerir mudança de qualidade.

## 9. Teste de vazamento

Ciclo mínimo:

1. abrir Hardware Studio 3D;
2. trocar de gabinete e ambiente;
3. abrir inspeção;
4. iniciar e parar benchmark;
5. fechar módulo;
6. repetir dez vezes;
7. verificar crescimento persistente de memória, listeners, RAF, timers e contextos.

## 10. Critério de bloqueio

Uma subfase não poderá ser publicada quando:

- travar o modo Baixo;
- perder contexto WebGL repetidamente;
- aumentar memória a cada abertura;
- criar rolagem horizontal crítica no mobile;
- impedir fechamento do módulo;
- quebrar outros laboratórios;
- tornar o Ultra necessário para usar uma função educativa.
