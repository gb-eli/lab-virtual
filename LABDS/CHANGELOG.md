# Changelog

## Hardware Studio 3D 4.28.0 — Fase A5.5 — 04/08/2026

- POST detalhado com sete etapas e diagnóstico visual no monitor.
- Instalação e inicialização simuladas de Windows 11 e Linux Mint.
- Área de trabalho educativa e monitor com telemetria de CPU, GPU, carga e FPS.
- Benchmark leve, médio, pesado e extremo.
- Ambientes térmicos climatizado, comum, quente e abafado.
- Proteções normais com throttling e desligamento antes de dano.
- Alerta interativo para pausar ou insistir no benchmark.
- Cenário extremo condicionado a falhas múltiplas, proteção desativada e decisão explícita de continuar.
- Fumaça por três segundos, princípio de incêndio virtual e extintor interativo.
- Linha do tempo térmica, logs semânticos e exportação do incidente.
- Efeitos visuais responsivos com fallback 2.5D e respeito a movimento reduzido.
- Regressão completa das fases A1 a A5.4.

# Histórico de versões — Laboratório Virtual DS

## Hardware Studio 4.27.0 — Fase A5.4 — 04/08/2026

- nova área de famílias com 13 perfis: laboratório escolar, escritório, desenvolvimento, gamer de entrada, gamer extremo, criação, workstation, open bench, mini workstation, mini PC, all-in-one, notebook e notebook gamer;
- perfis aplicam peças, gabinete, periféricos, layout, acabamento e faixa educativa de preço coerentes com cada categoria;
- mini PC, all-in-one e notebooks recebem geometrias próprias e manutenção compacta guiada, sem reutilizar incorretamente a montagem livre de gabinete torre;
- novo motor `computer-family-engine.js` para catálogo, geometria, compatibilidade de montagem, alvos de inspeção e estimativa educativa de custo;
- novo motor `inspection-engine.js` com 16 alvos, sete vistas técnicas, zoom, centralização, clonagem segura da peça e modo explodido;
- inspeção disponível para computador completo, gabinete, placa-mãe, CPU, RAM, GPU, armazenamento, fonte, refrigeração, monitor e periféricos;
- novo motor `cinematic-engine.js` com nove tomadas automáticas, velocidade lenta/normal/rápida, pausa, navegação, repetição e interface limpa;
- modo cinema apresenta ambiente, frente, interior, CPU, GPU, refrigeração, conexões traseiras, monitores e plano final;
- modo Baixo/2.5D recebe representação própria para inspeção, mantendo fallback em aparelhos sem WebGL;
- câmera de inspeção possui limites próprios e o modo cinema respeita o raio seguro calculado pelo motor físico;
- montagem manual é bloqueada nas famílias compactas integradas, evitando estados impossíveis ou peças flutuantes;
- exportação passa a registrar família, formato, preço educativo, estado da inspeção e estado do modo cinema;
- novo teste automatizado valida 13 famílias, quatro famílias compactas, 16 alvos, sete vistas e nove tomadas cinematográficas;
- validador geral atualizado para reconhecer motores auxiliares declarados no manifesto e verificar a versão 4.27.0;
- cache principal renovado para publicar os novos motores sob demanda.

## Hardware Studio 4.26.0 — Fase A5.3 — 03/08/2026

- inclusão do motor modular `peripheral-engine.js`, carregado antes do motor de layout físico;
- configurações com uma, duas ou três telas, podendo repetir o monitor principal ou usar modelos independentes;
- layouts tela única, dupla, tripla, principal com laterais verticais, empilhado e cockpit panorâmico;
- bases originais, braço individual, suporte duplo, suporte triplo e trilho profissional;
- bancada, câmera, caixas de som, webcam, teclado, mouse e acessórios passam a considerar a largura total do conjunto de telas;
- monitor secundário e terciário recebem modelo, resolução, painel e frequência independentes;
- catálogo ampliado com monitor profissional vertical, super ultrawide de 49 polegadas, tela 6K e CRT histórico;
- teclados full size RGB, 60% compacto e dividido; mouse ultraleve e trackball; headset sem fio e soundbar;
- controles diferenciados para Xbox/PlayStation, volante, joystick HOTAS, arcade e realidade virtual;
- renderização 3D de braços, trilho, bases, telas, soundbar e diferentes categorias de controle;
- modo Baixo/2.5D atualizado para representar todas as telas e seus suportes;
- nova ficha multitela mostra organização, suporte, modelos, resoluções, frequências e painéis;
- validação automatizada de 5.850 combinações multitela, áudio e controles, além da regressão de 19.200 configurações físicas;
- cache principal renovado para entregar o motor de periféricos e o manifesto 4.26.0.

## Hardware Studio 4.25.0 — Fase A5.2 — 03/08/2026

- inclusão do motor modular `material-engine.js`, carregado antes do motor de montagem e do módulo principal;
- pipeline PBR progressivo para Médio, Alto e Ultra, preservando o modo Baixo/2.5D;
- 20 perfis reutilizáveis para metal pintado, metal escovado, aço, plástico fosco e brilhante, borracha, tecido, PCB, cobre, madeira, carbono, mesh, cerâmica, tela, RGB e quatro tratamentos de vidro;
- texturas procedurais geradas localmente, sem dependência de CDN ou criação de nova pasta de assets;
- texturas de 256 px no Alto e 512 px no Ultra, com cache, repetição e anisotropia limitados pelo dispositivo;
- vidro lateral configurável como claro, fumê, fosco ou painel opaco, com transmissão, espessura, IOR e roughness progressivos;
- acabamentos configuráveis do gabinete: pintura fosca, brilhante, metal escovado e fibra de carbono;
- RGB com intensidade discreta, equilibrada ou showroom, glow aditivo controlado e emissivo ajustado pela qualidade;
- environment map procedural para reflexos aproximados em materiais físicos, sem exigir ray tracing real;
- iluminação adaptativa com luz principal, preenchimento, recorte e apresentação adicional no Ultra;
- sombras com orçamento de 512 px no Médio, 1024 px no Alto e 2048 px no Ultra;
- sombras de contato opcionais sob gabinete e monitor;
- placa-mãe, CPU, GPU, armazenamento, cooler, cabos, monitor e periféricos passam a usar perfis de superfície apropriados;
- novo painel gráfico informa pipeline, texturas, sombras, reflexos, vidro, acabamento, draw calls, triângulos, materiais e texturas ativas;
- teste automatizado valida perfis gráficos, materiais físicos, vidro, iluminação, DPR, shadow map e API do environment map;
- cache principal renovado para entregar o novo motor PBR e o manifesto 4.25.0.

## Hardware Studio 4.24.0 — Fase A5.1 — 03/08/2026

- inclusão do motor modular `layout-engine.js`, carregado antes dos motores térmico e de montagem;
- cálculo automático das dimensões da bancada conforme gabinete, monitor, teclado, mouse, áudio, impressora e acessórios;
- objetos passam a receber apoio físico, limites de superfície e volumes de colisão antes de serem desenhados;
- correção preventiva de monitor dentro do gabinete, periféricos sobrepostos, itens flutuando e objetos fora da mesa;
- monitores recebem proporções físicas calculadas por polegadas, resolução e formato convencional ou ultrawide;
- impressora, controle, webcam, headset, caixas de som, microfone e nobreak passam a ocupar zonas próprias;
- nobreak é posicionado no piso e a bancada recebe tampo e pernas coerentes com sua altura;
- câmera passa a respeitar alvo, distância mínima, distância máxima e inclinação segura calculados pelo volume do setup;
- modo Baixo/2.5D passa a representar bancada, gabinete, monitor e periféricos usando o mesmo layout físico;
- novo painel de segurança física informa dimensões da bancada, colisões, apoio, limites e distância segura da câmera;
- teste automatizado valida 19.200 combinações de gabinete, monitor, periféricos e acessórios sem colisões ou flutuação;
- cache principal renovado para entregar o novo motor físico e o manifesto 4.24.0.

## Hardware Studio 4.23.0 — Fase A3 — 03/08/2026

- inclusão do motor modular `thermal-engine.js`, carregado antes da montagem e do módulo principal;
- simulação separada das temperaturas estimadas de CPU, GPU e interior do gabinete;
- cálculo de entrada, exaustão, vazão efetiva, pressão positiva, neutra ou negativa e risco de poeira;
- perfis Balanceado, Pressão positiva, Pressão negativa, Silencioso e Desempenho;
- curvas de ventoinhas Baixa, Automática e Turbo, combinadas com temperatura ambiente e carga de trabalho;
- filtros limpo, usado, obstruído e ausente passam a alterar vazão e acúmulo de poeira;
- cargas Ocioso, Estudo, Jogos, Renderização e Estresse total influenciam a geração de calor;
- radiadores passam a respeitar o ponto de montagem escolhido e a compatibilidade física do gabinete;
- ventoinhas de entrada e exaustão recebem identificação visual, direção e rotas de partículas próprias;
- novo painel térmico mostra temperaturas, pressão, CFM, ruído, poeira, radiador e alertas de refrigeração;
- modo Baixo 2.5D recebe setas direcionais e indicadores térmicos responsivos;
- perfis prontos passam a aplicar também parâmetros térmicos coerentes com sua finalidade;
- cache principal renovado para entregar o novo motor térmico e o manifesto 4.23.0.

## Hardware Studio 4.22.0 — Fase A2 — 03/08/2026

- inclusão do motor modular `case-engine.js`, carregado antes da montagem e do módulo principal;
- oito gabinetes passam a ter classes, dimensões reais, escalas de cena e volumes internos próprios;
- frentes físicas diferenciadas em mesh, vidro panorâmico, sólida acústica, entrada lateral, perfurada, workstation e open bench;
- painel lateral de vidro ou aço pode ser aberto ou removido conforme a construção do gabinete;
- montagem manual exige acesso lateral antes de liberar os encaixes internos;
- inclusão de chassi, moldura, bandeja da placa-mãe, standoffs, PSU shroud, baias, canais de cabos e divisão de câmara dupla;
- radiadores passam a ser validados por tamanho e ponto de montagem real disponível;
- placa-mãe, GPU, fonte, armazenamento, cooler e fans recebem posições proporcionais ao gabinete escolhido;
- nova ficha estrutural mostra dimensões, frente, lateral, câmaras, baias e suportes;
- modo Baixo recebe representação 2.5D das diferenças estruturais e do painel lateral;
- cache principal renovado para entregar o novo motor estrutural e o manifesto 4.22.0.

## Hardware Studio 4.21.1 — Fase 1 — 03/08/2026

- inclusão do motor modular `assembly-engine.js`, carregado somente ao abrir o Hardware Studio 3D;
- montagem manual por mouse, toque e caneta, com peças separadas em bancada;
- pontos de encaixe visuais e validação de ordem, socket, memória, gabinete, GPU e refrigeração;
- detecção de colisão durante reposicionamento de componentes;
- rotação da peça selecionada, encaixe assistido, desfazer, refazer e reiniciar;
- componentes opcionais são retirados automaticamente da sequência quando não existem na configuração;
- POST e prontidão passam a considerar componentes ainda não instalados;
- tentativas, encaixes corretos e falhas passam a integrar logs e exportação do laboratório;
- suporte responsivo aos controles da montagem em celular, tablet, notebook e desktop;
- cache principal renovado para garantir a entrega do novo manifesto e do motor de montagem.

## 4.0.0-pages — 31/07/2026

- consolidação baseada na V3.8, que preserva 51 ferramentas e 42 módulos sob demanda;
- restauração das 17 ferramentas ausentes na versão pública 8.2.3;
- preservação dos 9 terminais, ambientes de programação, banco de dados, redes, hardware, máquinas virtuais, gráficos, jogos e simuladores;
- VoxelCraft DS 3D restaurado como jogo WebGL real, com Three.js 0.180.0 incluído localmente;
- VoxelCraft mantém mundo procedural, chunks, câmera, colisão, quebra, construção, inventário, missões, salvamento, controles desktop/touch e modos Automático, Econômico, Baixo, Médio, Alto e Ultra;
- aprimoramentos visuais do VoxelCraft: água animada, ciclo de luz, nuvens móveis, animação de animais e realce do bloco selecionado;
- escolha manual Alta/Ultra passa a ser respeitada também em dispositivos touch; o limite móvel automático permanece nos perfis Econômico/Baixo/Médio;
- Cyber Ops v6.1 preservado em módulo isolado;
- remoção da IARA DS mantida, inclusive módulo, interface, assets, rotas e dados próprios;
- validação ampliada para exigir catálogo completo, 42 registros, Three.js local, sintaxe, JSON, referências e isolamento de cache.

## 3.8.0-pages — 31/07/2026

- refatoração do Lab Virtual DS para arquitetura modular orientada a desempenho e manutenção;
- HTML inicial reduzido a um único `bootstrap.js` e um estilo mínimo de inicialização;
- 42 laboratórios reorganizados em pastas independentes `modules/<id>/`, cada uma com `module.json` e `index.js`;
- inclusão do `ResourceLoader`, com deduplicação de scripts/estilos, métricas e carregamento sob demanda;
- terminal, exportação, Classroom, EduAuth, modo de aprendizagem, shell e efeitos removidos do caminho crítico;
- criação de pacote independente para o motor de rede, compartilhado entre o laboratório de Redes e o Terminal;
- Cyber Ops preservado como aplicação isolada, carregada somente quando solicitado, com partículas e resolução adaptadas ao perfil de desempenho;
- cache autônomo do Cyber Ops isolado por prefixo para nunca apagar o cache principal do Lab Virtual DS;
- novo gerenciador de desempenho com modos automático, economia, equilibrado e qualidade, análise de hardware/rede e ajuste por FPS;
- equipamentos em modo economia deixam de realizar aquecimento visual e pedagógico em segundo plano;
- Service Worker reduzido ao núcleo essencial, com cache de módulos somente após o primeiro uso e descarte limitado do cache de execução;
- carga crítica de recursos reduzida de aproximadamente 667 KB para 326 KB, sem minificar o código-fonte;
- núcleo pré-instalado pelo Service Worker reduzido de aproximadamente 744 KB para 400 KB;
- manutenção da remoção completa da Iara DS e preservação do Cyber Ops, EduAuth, Loja, progressão, perfis e exportações.

## 3.7.0-pages — 31/07/2026

- integração do novo módulo **Cyber Ops — Shadow Grid v6.1** ao catálogo de Cibersegurança;
- inclusão de 3 áreas operacionais e 6 missões narrativas com resposta a incidentes, investigação, inteligência humana e criptointeligência;
- execução do Cyber Ops em módulo interno isolado, preservando seus estilos e scripts sem interferir nos demais laboratórios;
- identidade do estudante sincronizada com a sessão ativa do Lab Virtual DS;
- progresso do Cyber Ops separado por sessão, evitando mistura de dados entre estudantes no mesmo equipamento;
- registro no histórico principal de missões concluídas ou interrompidas, pontuação, precisão, ameaças, emblemas e exportações;
- segundo Service Worker desativado durante a incorporação; o cache principal armazena o módulo sob demanda;
- modo autônomo do Cyber Ops preservado para abertura direta da pasta;
- atualização das versões do aplicativo, PWA, EduAuth e integração VoxelCraft para `3.7.0-pages`;
- manutenção integral da remoção da Iara DS realizada na versão anterior.

## 3.6.0-pages — 31/07/2026

- remoção consolidada da Iara DS e de seus dados/cache legados;
- links antigos da Iara passam a abrir a Central de Ajuda, sem carregar chatbot ou IA externa;
- preservação do laboratório didático **Inteligência Artificial e Redes Neurais**, que continua sendo uma simulação local independente;
- limpeza automática de progresso, preferências e caches associados ao recurso removido;
- módulos de laboratórios, jogos e executores deixaram de ser pré-carregados pelo Service Worker e agora entram no cache somente quando utilizados;
- alinhamento das versões do aplicativo, PWA, EduAuth e integração do VoxelCraft;
- identidade PWA estabilizada para evitar instalações duplicadas em futuras versões;
- correção do fallback offline para reutilizar corretamente o cache do núcleo pré-instalado;
- revisão de rotas, catálogo, módulos, arquivos estáticos e compatibilidade com GitHub Pages.

## 3.5.0-pages — 30/07/2026

- loja, avatar, progressão e melhorias para publicação no GitHub Pages;
- integração EduAuth em modo de desenvolvimento;
- catálogo modular de laboratórios e carregamento dinâmico por ferramenta.
