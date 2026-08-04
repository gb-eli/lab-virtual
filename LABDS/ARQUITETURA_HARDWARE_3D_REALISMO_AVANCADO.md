# Arquitetura proposta — Hardware Studio 3D com realismo avançado

## 1. Diagnóstico atual

O módulo atual já possui seis arquivos principais dentro de `lab/modules/hardware-lab/`:

- `index.js` — aproximadamente 140 KB;
- `styles.css`;
- `module.json`;
- `assembly-engine.js`;
- `case-engine.js`;
- `thermal-engine.js`.

O `index.js` ainda concentra catálogo, interface, criação da cena e animações. A expansão direta nesse arquivo aumentaria risco de regressão e dificuldade de manutenção.

## 2. Regra estrutural

Nenhuma pasta nova será criada. Os novos motores entrarão diretamente na pasta existente:

`LABDS/lab/modules/hardware-lab/`

## 3. Motores planejados

| Arquivo futuro | Responsabilidade |
|---|---|
| `asset-catalog.js` | máquinas, peças, periféricos, materiais, preços e metadados |
| `scene-constraints.js` | zonas, apoios, colisões, escala e limites |
| `material-pipeline.js` | materiais PBR, texturas, shaders e qualidade |
| `setup-engine.js` | mesas, monitores, suportes e periféricos |
| `inspection-engine.js` | peça isolada, câmera, zoom, vistas e visual explodido |
| `cinema-engine.js` | trajetórias de câmera e apresentação |
| `system-display.js` | POST, boot, desktop e conteúdo do monitor |
| `benchmark-engine.js` | carga, desempenho, temperatura e throttling |
| `incident-engine.js` | alertas, desligamento, fumaça e incidente educativo |
| `environment-engine.js` | ambientes, iluminação, temperatura e bancada |
| `pricing-engine.js` | preços educativos e comparação |
| `asset-loader.js` | carregamento, cache, referência e descarte de ativos |

Esses nomes poderão ser refinados durante cada subfase, mas a separação de responsabilidades deverá ser preservada.

## 4. Ordem prevista no manifesto

A ordem lógica futura de scripts será:

1. catálogos e utilitários;
2. estruturas de gabinete;
3. térmica;
4. restrições e colisão;
5. materiais;
6. ativos;
7. setup;
8. montagem;
9. inspeção;
10. cinema;
11. sistema do monitor;
12. benchmark/incidente;
13. aplicação principal.

## 5. Estado único do módulo

Estrutura proposta:

```js
state = {
  selection: {},
  caseState: {},
  assembly: {},
  thermal: {},
  setup: {
    environmentId: 'classroom',
    deskId: 'technical-bench',
    monitorLayoutId: 'single',
    peripherals: {},
    transforms: {}
  },
  graphics: {
    requested: 'auto',
    resolved: 'medium',
    pixelRatio: 1,
    effects: {}
  },
  inspection: {
    active: false,
    itemId: null,
    view: 'orbit'
  },
  presentation: {
    mode: 'manual',
    playing: false,
    shot: 0
  },
  benchmark: {
    preset: 'medium',
    running: false,
    elapsed: 0,
    warnings: [],
    protectionEnabled: true
  },
  pricing: {
    referenceDate: '',
    currency: 'BRL'
  }
};
```

## 6. Contrato de item visual

Todo item renderizável deve ter:

```js
{
  id,
  category,
  label,
  dimensionsMm: [width, height, depth],
  pivot,
  anchors,
  collision,
  lod,
  materialProfile,
  compatibleWith,
  priceRange,
  educationalMetadata
}
```

Sem dimensões, pivô, âncoras e colisão, o item não deverá entrar no catálogo público.

## 7. Sistema de coordenadas

- unidade da cena documentada e coerente;
- eixo vertical único;
- origem local por objeto;
- pivô localizado no apoio físico ou centro mecânico;
- dimensões reais convertidas para escala da cena;
- zonas de mesa em coordenadas locais;
- transformações persistidas de forma serializável.

## 8. Colisão em camadas

### Camada 1 — regras

- categoria permitida na zona;
- número máximo de objetos;
- suporte compatível;
- dependência estrutural.

### Camada 2 — caixas simples

- AABB ou OBB para posicionamento rápido;
- prevenção de sobreposição;
- limites de mesa, parede e suporte.

### Camada 3 — precisão

- volumes menores em portas, encaixes e suportes;
- usada somente durante manipulação próxima;
- desativada no modo Baixo quando não for essencial.

## 9. Ciclo de vida

Todo motor deverá oferecer, conforme aplicável:

- `init(context)`;
- `update(delta)`;
- `serialize()`;
- `restore(data)`;
- `setQuality(profile)`;
- `dispose()`.

## 10. Carregamento e descarte

- ativos carregados somente ao selecionar a categoria;
- referências compartilhadas para materiais e geometrias repetidas;
- descarte quando o último consumidor sair;
- cancelamento de carregamentos ao fechar o módulo;
- texturas e modelos antigos liberados ao trocar de família;
- limite de memória observado pelo gerenciador de desempenho.

## 11. Logs semânticos preparados

Eventos planejados:

- `hardware_item_selected`;
- `hardware_item_inspected`;
- `hardware_item_positioned`;
- `hardware_collision_rejected`;
- `hardware_monitor_layout_changed`;
- `hardware_environment_changed`;
- `hardware_benchmark_started`;
- `hardware_thermal_warning`;
- `hardware_benchmark_paused`;
- `hardware_protective_shutdown`;
- `hardware_incident_triggered`;
- `hardware_incident_resolved`;
- `hardware_configuration_priced`;
- `hardware_cinema_started`.

## 12. Política de marcas e ativos

- nomes de marcas podem ser usados em descrição educativa quando necessário;
- geometrias e texturas devem ser próprias, genéricas, licenciadas ou de domínio permitido;
- evitar logotipos aplicados a modelos sem autorização;
- manter atribuições quando a licença exigir;
- registrar origem e licença de cada ativo futuro.
