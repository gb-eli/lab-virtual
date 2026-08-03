# Histórico de versões — Laboratório Virtual DS

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
