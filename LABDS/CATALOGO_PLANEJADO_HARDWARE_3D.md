# Catálogo planejado — Hardware Studio 3D

## 1. Meta de catálogo

O catálogo deve crescer progressivamente. Quantidade não deve substituir qualidade. Cada item publicado precisa ter escala, colisão, materiais, nível de detalhe, informações técnicas e comportamento coerente.

## 2. Famílias de computadores

| Família | Quantidade inicial | Variações |
|---|---:|---|
| Escritório | 3 | compacto, torre e all-in-one |
| Gamer | 5 | básico, intermediário, avançado, premium e showcase |
| Workstation | 3 | torre, compacta e profissional |
| Mini PC | 3 | básico, intermediário e alto desempenho |
| Notebook | 4 | escolar, profissional, gamer e workstation móvel |
| Open bench | 2 | educacional e overclock |
| Retrô | 4 | bege vertical, desktop horizontal, CRT integrado e estação antiga |
| Histórico/grande porte | 3 | representação didática de gerações iniciais |

Meta inicial: 27 perfis completos, liberados por etapas.

## 3. Gabinetes

Categorias:

- ITX compacto;
- mATX compacto;
- ATX airflow;
- ATX silencioso;
- dual chamber;
- full tower;
- workstation;
- open frame;
- retrô bege;
- horizontal;
- curvo/arredondado;
- angular/estilizado;
- industrial;
- showcase com vidro.

Propriedades:

- dimensões;
- formatos aceitos;
- comprimento máximo de GPU;
- altura máxima de cooler;
- radiadores aceitos;
- quantidade de fans;
- número de câmaras;
- painéis e portas;
- tipo de frente;
- filtros;
- suporte para cabos;
- materiais e cores.

## 4. Monitores

| Tipo | Formatos | Tamanhos educacionais |
|---|---|---|
| Convencional | 16:9 | 21, 24, 27 e 32 pol. |
| Gamer | 16:9 | 24, 27 e 32 pol. |
| Ultrawide | 21:9 | 29, 34 e 38 pol. |
| Super ultrawide | 32:9 | 43 e 49 pol. |
| Profissional | 16:9/16:10 | 27 e 32 pol. |
| Vertical | rotação 90° | 24 e 27 pol. |
| CRT | 4:3 | 14, 17 e 19 pol. |

Layouts:

- único;
- duplo horizontal;
- duplo com um vertical;
- triplo horizontal;
- principal central e dois auxiliares;
- ultrawide único;
- super ultrawide único.

## 5. Suportes

- base original;
- braço simples;
- braço duplo;
- braço triplo;
- suporte vertical duplo;
- suporte de parede;
- suporte de mesa reforçado.

Cada suporte terá limite de peso, tamanho, quantidade e alcance.

## 6. Periféricos

### Teclados

- membrana comum;
- mecânico completo;
- TKL;
- 75%;
- 60%;
- ergonômico;
- retrô.

### Mouses

- comum;
- gamer leve;
- gamer com botões;
- vertical;
- trackball;
- retrô.

### Áudio e vídeo

- headset comum;
- headset gamer;
- headset profissional;
- webcam básica;
- webcam avançada;
- microfone de mesa;
- caixas de som compactas;
- caixas de som 2.1.

### Controles

- gamepad de layout assimétrico;
- gamepad de layout simétrico;
- controle retrô;
- joystick;
- volante simplificado como expansão futura.

## 7. Peças internas

### Processadores

Faixas:

- legado educacional;
- entrada;
- intermediário;
- avançado;
- topo de linha;
- workstation.

Metadados:

- geração;
- ano/faixa histórica;
- socket;
- núcleos e threads;
- TDP;
- presença de vídeo integrado;
- preço educativo;
- uso recomendado.

### GPUs

- integrada;
- dedicada antiga;
- entrada;
- intermediária;
- avançada;
- topo de linha;
- workstation;
- compacta/low-profile.

Detalhes visuais:

- PCB;
- dissipador;
- uma, duas ou três fans;
- backplate;
- conectores de energia;
- HDMI e DisplayPort;
- espessura em slots.

### Armazenamento

- HDD 3,5;
- HDD 2,5;
- SSD SATA 2,5;
- M.2 SATA;
- NVMe;
- unidade óptica;
- mídia legada para o modo histórico.

### Outros

- placa-mãe ATX, mATX e ITX;
- RAM DDR antiga, DDR3, DDR4 e DDR5 em perfis didáticos;
- fonte ATX e SFX;
- fonte modular e não modular;
- cooler box;
- torre a ar;
- water cooler de 120, 240, 280, 360 e 420 mm;
- ventoinhas de 80, 92, 120, 140 e 200 mm;
- placas de rede, áudio e captura.

## 8. Mesas e ambientes

Catálogo inicial:

- 9 ambientes;
- 9 mesas/bancadas;
- 5 presets completos de setup;
- 4 condições térmicas principais;
- 3 níveis de poeira;
- 3 níveis de iluminação ambiente.

## 9. Cores e materiais

Cores-base:

- preto;
- branco;
- cinza;
- prata;
- bege retrô;
- vermelho;
- azul;
- verde;
- combinações personalizadas.

Materiais:

- aço;
- alumínio;
- plástico;
- vidro claro;
- vidro escurecido;
- acrílico;
- madeira;
- borracha;
- tecido;
- mesh.

## 10. Preços

Cada item terá faixa educativa:

```json
{
  "currency": "BRL",
  "referenceDate": "AAAA-MM",
  "min": 0,
  "typical": 0,
  "max": 0,
  "sourceNote": "faixa educativa aproximada"
}
```

Os preços serão atualizados em arquivo de catálogo, sem depender de alterar a geometria ou a lógica do item.
