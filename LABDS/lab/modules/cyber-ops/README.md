# Cyber Ops — Shadow Grid Modular (v6.1)

Laboratório virtual **front-end, offline e educativo** de investigação e defesa cibernética, preparado para incorporação ao Laboratório Virtual DS e publicação direta no GitHub Pages.

## Organização dos módulos

- **Resposta a Incidentes:** ransomware, tráfego, disponibilidade, contenção e recuperação.
- **Investigação e Inteligência Humana:** CFTV, acessos, engenharia social, portunhol e russo.
- **Criptointeligência e Operações Globais:** lógica, binário, Morse, integridade de dados e coordenação internacional fictícia.

O aluno pode começar por qualquer módulo. Dentro de cada módulo, a segunda fase é liberada após a conclusão da primeira.

## Recursos revisados

- missões com história, briefing, transmissões e informações progressivas;
- cores e ambientação diferentes por módulo e por fase;
- cronômetro, ameaça, prejuízo simulado e eventos de falha de rede, indisponibilidade e risco de descoberta;
- apoio contextual da central, pesquisa tática em dois níveis e pistas limitadas;
- personagens brasileiros, norte-americanos, asiáticos, latino-americanos e fonte russa;
- interceptações em russo, portunhol, Morse e binário;
- emblemas, cargos, pontuação, histórico e exportação de evidências;
- ferramentas locais para rede, acessos, EDR, terminal didático, transações, domínios, rastreamento, VPN, tradução e bases institucionais cenográficas;
- PWA com cache versionado e compatibilidade com GitHub Pages.

## Segurança e simulação

NASA-LAB, FBI-LAB, INTERPOL-LAB, PF-LAB, satélites, telefonia, IMEI, bancos, domínios e endereços IP são **dados fictícios ou reservados para documentação**. Não existem integrações reais, consultas externas, exploração de sistemas ou acesso a bancos de dados governamentais.

## Estrutura técnica

### Interface

- `index.html` — telas, painéis e diálogos;
- `assets/css/01-base.css` — variáveis, componentes básicos, boot e acesso;
- `assets/css/02-hq-mission.css` — sala de operações, mapa, missões e ferramentas de fase;
- `assets/css/03-cinematic.css` — transmissões, personagens, honrarias e prioridades mobile;
- `assets/css/04-toolkit.css` — simuladores e painéis da central de ferramentas;
- `assets/css/05-v6-modular.css` — módulos, temas, interceptações, apoio e ajustes finais.

### Lógica

- `assets/js/01-data.js` — configurações, narrativas, personagens, módulos e dados das missões;
- `assets/js/02-core.js` — estado local, navegação, sala de operações, boot e ciclo da missão;
- `assets/js/03-mission-engine.js` — renderização das fases, validações, penalidades, apoio, emblemas e resultados;
- `assets/js/04-toolkit-export.js` — ferramentas simuladas e exportação de evidências;
- `assets/js/05-bootstrap.js` — eventos, configurações, PWA e inicialização visual;
- `sw.js` e `manifest.webmanifest` — instalação e funcionamento offline.

Não há etapa de compilação. Basta publicar a pasta completa.

## Incorporação ao Laboratório Virtual DS

A aplicação pode ser incorporada como rota/página independente, `iframe` interno ou módulo aberto em nova área. Preserve os caminhos relativos da pasta `assets` e o arquivo `sw.js`. Caso o Laboratório Virtual DS já possua um service worker próprio, recomenda-se integrar a lista de arquivos do Cyber Ops ao cache principal em vez de registrar dois workers no mesmo escopo.

## Documentação da revisão

- `CHANGELOG_V6.md` — alterações da versão;
- `REVISAO_TECNICA_V6_1.md` — verificações, arquitetura e resultado dos testes.
