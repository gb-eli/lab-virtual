# Matriz de validação — Hardware Studio 3D

## 1. Regra de avanço

Cada subfase A5 deverá passar por validação gráfica, lógica, responsiva, de desempenho e regressão antes da próxima.

## 2. Validação gráfica

| Área | Casos obrigatórios | Critério |
|---|---|---|
| Escala | gabinete, monitor, teclado, mouse, cadeira/mesa | proporções coerentes |
| Apoio | monitores, periféricos e gabinete | nenhum objeto flutuando |
| Colisão | 1/2/3 telas e acessórios | sem interpenetração impossível |
| Materiais | metal, plástico, vidro, borracha e tecido | aparência distinguível |
| Vidro | claro, escurecido, aberto e removido | peças visíveis e ordenação correta |
| Conectores | traseira, GPU e placa-mãe | alinhamento e legibilidade |
| RGB | desligado, baixo e alto | sem excesso de bloom |
| Inspeção | CPU, GPU, SSD, NVMe, monitor e mouse | detalhes visíveis sem clipping |
| Cinema | todas as tomadas | câmera sem atravessar objetos |
| Incidente | aviso, fumaça, fogo e extinção | sequência controlada e legível |

## 3. Validação da lógica

- encaixe e desmontagem;
- compatibilidade de placa-mãe, CPU, RAM, GPU, fonte e cooler;
- abertura de painéis;
- radiador e fans;
- airflow e temperatura;
- posicionamento na mesa;
- suporte de monitor;
- quantidade de telas;
- atualização de preço;
- seleção de ambiente;
- benchmark;
- aviso e pausa;
- throttling;
- desligamento protetivo;
- cenário extremo;
- extintor virtual;
- logs;
- salvar e restaurar estado;
- desfazer e refazer.

## 4. Validação de desempenho

Métricas:

- FPS médio e percentil baixo;
- tempo de frame;
- draw calls;
- triângulos;
- texturas carregadas;
- memória estimada;
- tempo de abertura;
- tempo de troca de item;
- tempo de fechamento;
- perda de contexto WebGL;
- crescimento após ciclos.

## 5. Dispositivos e telas

### Android

- 320 × 568;
- 360 × 640;
- 390 × 844;
- 412 × 915;
- 430 × 932;
- 480 × 960.

### iPhone e safe areas

- faixas equivalentes às famílias 13, 14, 15, 16 e 17;
- retrato;
- paisagem;
- Safari;
- PWA quando aplicável.

### Tablets

- 768 × 1024;
- 800 × 1280;
- 834 × 1194;
- 1024 × 1366.

### Computadores

- 1280 × 720;
- 1366 × 768;
- 1440 × 900;
- 1920 × 1080;
- 2560 × 1440.

## 6. Entradas

- mouse;
- touch;
- caneta;
- teclado;
- gamepad quando aplicável;
- zoom por roda e pinça;
- rotação por arraste;
- acessibilidade por teclado na interface.

## 7. Regressão do módulo

Preservar:

- A1 montagem manual;
- A2 gabinetes e painéis;
- A3 térmica e airflow;
- perfis prontos;
- modo Baixo 2.5D;
- Médio, Alto e Ultra;
- exportação existente;
- abertura e fechamento;
- salvamento local.

## 8. Regressão do portal

- 50 ferramentas públicas;
- 41 módulos públicos na base analisada;
- carregamento sob demanda;
- nenhum script pesado no boot;
- nenhum conflito de CSS global;
- nenhum erro ao abrir outros módulos;
- Service Worker atualizado somente em fases de código;
- validação estrutural aprovada.

## 9. Validação do conteúdo educativo

- alerta térmico coerente;
- explicar que desligamento protetivo é comportamento esperado;
- fogo somente como cenário extremo de múltiplas falhas;
- extintor descrito como simulação, não treinamento real;
- preços identificados como aproximados;
- marcas e modelos descritos com responsabilidade;
- comparação histórica sem afirmar precisão museológica quando o modelo for representativo.

## 10. Saídas por subfase

Cada pacote de implementação deverá conter:

- lista de arquivos;
- ordem de upload;
- changelog;
- testes automatizados;
- resultado de validação;
- screenshots desktop e mobile quando possível;
- checksum;
- roteiro de teste WebGL no GitHub Pages.
