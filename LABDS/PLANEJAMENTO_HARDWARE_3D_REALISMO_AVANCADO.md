# Planejamento oficial — Hardware Studio 3D com realismo avançado

## 1. Objetivo

Evoluir o Hardware Studio 3D de um laboratório procedural funcional para uma experiência educacional altamente visual, manipulável, modular e otimizada, preservando a montagem manual, a estrutura dos gabinetes e o motor térmico já implementados.

O resultado pretendido deve permitir:

- montar e desmontar computadores manualmente;
- personalizar gabinete, materiais, iluminação, ambiente e periféricos;
- comparar gerações e famílias de computadores;
- inspecionar peças isoladamente em 360°;
- apresentar o computador em modo cinema;
- ligar o computador e visualizar POST, sistema e benchmark simulado;
- avaliar preço aproximado, desempenho, consumo e temperatura;
- experimentar falhas térmicas em cenário educativo controlado;
- funcionar em celular, tablet, Chromebook, notebook e desktop.

## 2. Base preservada

- A1: montagem manual, encaixe, rotação, desfazer e refazer;
- A2: oito gabinetes, dimensões, painéis, suportes e estrutura;
- A3: airflow, ventoinhas, pressão, temperatura, poeira e cargas de trabalho;
- carregamento modular sob demanda;
- modos Automático, Baixo, Médio, Alto e Ultra;
- GitHub Pages e execução sem servidor.

## 3. Princípios de implementação

1. Corrigir bugs físicos antes de adicionar dezenas de objetos.
2. Separar catálogo, renderização, lógica e interface.
3. Não carregar modelos e texturas que não estão visíveis.
4. Não sacrificar o modo Baixo para melhorar o Ultra.
5. Toda peça deve ter escala, pontos de ancoragem e caixa de colisão.
6. Toda animação deve poder ser interrompida.
7. Toda cena pesada deve liberar memória ao sair.
8. Preços serão educativos e datados, nunca apresentados como cotação ao vivo.
9. Marcas poderão aparecer como referência descritiva; os modelos visuais deverão ser próprios, genéricos ou licenciados.
10. Incêndio será uma simulação extrema condicionada a múltiplas falhas e insistência após alertas.

## 4. Novos modos

### 4.1 Modo Construção

- montagem livre;
- montagem guiada;
- encaixes fantasma;
- colisão;
- cabos e parafusos;
- desmontagem;
- manutenção.

### 4.2 Modo Setup

- uma, duas ou três telas;
- monitor horizontal, vertical, ultrawide e super ultrawide;
- teclado, mouse, headset, webcam, caixas de som, controles e joystick;
- suportes simples, duplos e triplos;
- escolha de mesa, bancada e ambiente;
- presets gamer, escritório, workstation, técnico e retrô.

### 4.3 Modo Inspeção

- peça isolada;
- zoom controlado;
- rotação 360°;
- vistas técnicas;
- visual explodido;
- informações, conectores, compatibilidade e preço.

### 4.4 Modo Cinema

- câmera automática;
- apresentação frontal, lateral, traseira e interna;
- destaque de componentes;
- esconder interface;
- fullscreen;
- velocidade ajustável;
- uso em demonstração de aula.

### 4.5 Modo Ligado

- botão de energia;
- ventoinhas, LEDs e RGB;
- POST;
- monitor acendendo;
- boot visual educativo;
- área de trabalho inspirada em Windows ou Linux Mint;
- demonstração de aplicativo, jogo ou renderização;
- telemetria no monitor ou HUD.

### 4.6 Modo Benchmark

- leve, médio, pesado e extremo;
- FPS, temperatura, consumo e utilização;
- comportamento dependente de componentes, ambiente e refrigeração;
- throttling e desligamento protetivo;
- cenário térmico crítico opcional.

### 4.7 Modo Incidente Térmico

Fluxo didático:

1. temperaturas sobem;
2. sistema avisa o aluno;
3. aluno pode pausar ou continuar;
4. continuidade provoca throttling;
5. ocorre desligamento protetivo;
6. somente em cenário extremo com proteções simuladas desativadas, múltiplas falhas e insistência: fumaça e princípio de incêndio virtual;
7. extintor virtual aparece como interação controlada;
8. diagnóstico explica causas e medidas preventivas.

### 4.8 Modo Comparação

- comparar dois computadores;
- peças, desempenho, consumo, temperatura e custo;
- comparação entre antigo e atual;
- comparação entre gamer, escritório, mini PC e workstation.

## 5. Ambientes e influência térmica

| Ambiente | Temperatura base | Ventilação | Poeira | Uso principal |
|---|---:|---|---|---|
| Comum | média | normal | média | uso geral |
| Ar-condicionado | baixa | controlada | baixa | desempenho e laboratório |
| Quente | alta | limitada | média | risco térmico |
| Mal ventilado | média-alta | baixa | alta | diagnóstico |
| Laboratório escolar | média | normal | média | aula prática |
| Oficina técnica | variável | alta | média | montagem/manutenção |
| Quarto gamer | média | normal | média | setup e benchmark |
| Escritório | média | normal | baixa | produtividade |
| Industrial | alta | variável | alta | robustez e manutenção |

## 6. Mesas e bancadas

- mesa comum;
- mesa gamer;
- mesa compacta;
- mesa em L;
- mesa grande para três monitores;
- bancada escolar;
- bancada técnica;
- bancada profissional;
- bancada aberta;
- estação de workstation.

Cada mesa deve informar área utilizável, altura, posições permitidas, quantidade máxima de telas e zonas para gabinete/periféricos.

## 7. Preço educativo

Cada item deverá ter:

- faixa de preço em reais;
- data de referência;
- classe: econômico, intermediário, avançado, premium ou profissional;
- preço mínimo, típico e máximo;
- indicação de que o valor é aproximado;
- separação entre computador e periféricos.

O cálculo deve gerar:

- custo das peças internas;
- custo dos periféricos;
- custo do setup completo;
- custo por categoria;
- comparação entre configurações.

## 8. Fases de implementação

| Fase | Escopo | Regra de avanço |
|---|---|---|
| A5.1 | colisões, apoios, escala, zonas e câmera | nenhum objeto flutuando ou atravessando outro |
| A5.2 | materiais, texturas, shaders e Ultra | quatro níveis gráficos estáveis |
| A5.3 | setup, periféricos e múltiplas telas | 1/2/3 telas sem colisão |
| A5.4A | famílias atuais | gamer, escritório, workstation, mini PC e all-in-one |
| A5.4B | famílias antigas | retrô, bege, horizontal, CRT e grande porte |
| A5.4C | notebook e compactos | notebook comum/gamer e mini workstation |
| A5.5 | inspeção individual | todas as peças principais centralizadas e navegáveis |
| A5.6 | modo cinema | câmera segura e interrompível |
| A5.7 | PC ligado e tela interativa | POST, boot e benchmark visual consistentes |
| A5.8 | benchmark térmico e incidente | alertas, pausa, proteção e logs validados |
| A5.9 | ambientes e bancadas | impacto térmico e regras espaciais validados |
| A5.10 | preços e comparação | valores datados e cálculos consistentes |
| A6 | validação, regressão e otimização | matriz completa aprovada |

## 9. Critérios finais de sucesso

- nenhum monitor, periférico ou componente flutuando;
- nenhuma sobreposição impossível;
- montagem manual preservada;
- detalhes visuais progressivos por qualidade;
- Ultra visualmente superior sem ser requisito para completar atividades;
- celular funcional no modo Baixo;
- notebooks escolares funcionais no Médio;
- aparelhos potentes capazes de Alto/Ultra;
- inspeção 360° de peças;
- múltiplos monitores e suportes;
- computador ligado e benchmark visual;
- simulação térmica educativa coerente;
- logs e exportação preparados para integração futura;
- nenhum impacto nos outros módulos do Lab DS.
