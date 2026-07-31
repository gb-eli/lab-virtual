# Relatório técnico — Lab Virtual DS V3.8 Modular Performance

## Objetivo

Reduzir o trabalho executado na abertura, impedir que um laboratório pesado afete toda a plataforma e tornar cada área mais simples de revisar, substituir ou atualizar.

## Arquitetura entregue

- `lab/js/core/bootstrap.js`: entrada única da aplicação.
- `lab/js/core/resource-loader.js`: carrega e deduplica scripts, estilos, pacotes e manifestos.
- `lab/js/core/performance-manager.js`: detecta condições do dispositivo e ajusta o perfil gráfico.
- `lab/modules/<id>/module.json`: peso, versão, scripts, estilos e dependências do laboratório.
- `lab/modules/<id>/index.js`: código do laboratório isolado em sua própria pasta.
- `lab/modules/cyber-ops/`: aplicação Cyber Ops isolada; não participa da abertura inicial.
- `lab/service-worker.js`: núcleo mínimo e cache de execução sob demanda.

## Estratégia de carregamento

### Caminho crítico

Na primeira renderização, o HTML chama somente `css/boot.css` e `js/core/bootstrap.js`. O bootstrap carrega o catálogo, sessão, armazenamento, acessibilidade, núcleo visual e aplicação principal.

### Pacotes adiados

- `network`: motor de rede, utilizado por Redes e Terminal.
- `terminal`: catálogo de comandos, sistema de arquivos, shells e controlador.
- `export`: arquivos, relatórios, evidências e Classroom.
- `eduauth`: somente Modo Professor, VM e rotas protegidas.
- `learning`: tutoriais e modo guiado.
- `shell`: perfil, Loja Tech, conquistas e diagnóstico.
- `effects`: efeitos visuais não essenciais.

Cada laboratório é consultado e armazenado no cache apenas quando aberto.

## Perfis de desempenho

- **Automático:** considera memória exposta pelo navegador, núcleos, economia de dados, tipo de conexão, dispositivo móvel e FPS medido.
- **Economia:** reduz efeitos e não aquece pacotes opcionais em segundo plano.
- **Equilibrado:** prepara somente recursos leves após a renderização.
- **Qualidade:** permite aquecimento de recursos visuais e pedagógicos quando o equipamento suporta.

No modo automático, a plataforma reduz a qualidade quando a medição permanece abaixo de 48 FPS e ativa economia abaixo de 30 FPS.

## Medições estáticas

As medições abaixo usam bytes reais dos arquivos não comprimidos e comparam a V3.7 original com a V3.8:

| Indicador | V3.7 | V3.8 | Redução |
|---|---:|---:|---:|
| Recursos do caminho crítico, sem HTML | 667.259 B | 325.725 B | 51,2% |
| Caminho crítico incluindo HTML | 700.817 B | 358.027 B | 48,9% |
| Núcleo listado no Service Worker | 744.046 B | 400.000 B | 46,2% |
| Scripts chamados diretamente pelo HTML | 21 | 1 | 95,2% |
| Folhas de estilo chamadas diretamente pelo HTML | 8 | 1 | 87,5% |

O código-fonte foi mantido legível, sem minificação destrutiva, para facilitar manutenção e revisão pedagógica.

## Integridade funcional preservada

- 51 ferramentas no catálogo.
- 42 módulos principais sob demanda.
- Cyber Ops integrado e isolado, com canvas adaptativo e cache autônomo sem interferência no cache principal.
- Iara DS ausente.
- perfis, sessão, histórico e progresso local.
- Loja Tech, conquistas e configurações.
- exportações, evidências e Google Classroom.
- EduAuth e Modo Professor.
- compatibilidade estrutural com GitHub Pages e PWA.

## Validação

O validador incluído em `tools/validate-project.mjs` verifica catálogo, IDs, manifestos, recursos, pacotes, sintaxe JavaScript, JSON, referências HTML, Service Worker e ausência de pré-carregamento dos laboratórios. A execução final deve retornar `status: ok`.

A automação completa em navegador local não pôde ser usada neste ambiente por restrição de acesso do Chromium ao servidor local. Por isso, a entrega se apoia em validação estática, análise de dependências, testes de sintaxe, integridade de caminhos, manifestos e pacote ZIP.
