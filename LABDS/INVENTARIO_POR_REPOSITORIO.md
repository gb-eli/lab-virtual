# Inventário por repositório e pacote

## gb-eli/lab-virtual

- Plataforma: Lab Virtual DS.
- Pacotes confirmados: V3.6, V3.7, V3.8 e versão pública 8.2.3.
- Recursos próprios: 9 terminais; Python, JavaScript, Web e SQL; redes; sistemas; máquinas virtuais; hardware; computação gráfica; Cyber Ops; Arcade Tech; VoxelCraft; simuladores; produtividade; acessibilidade; progresso; evidências; Classroom; EduAuth integrado.
- Armazenamento: namespace e armazenamento de sessão próprios do Lab Virtual DS; VoxelCraft usa IndexedDB validado.
- Service Worker: `lab/service-worker.js`, núcleo mínimo e módulos em cache sob demanda.
- Dependências: executores online opcionais para Python/SQL e Three.js local para VoxelCraft.
- Regra: este é o único projeto consolidado neste pacote.

## Cyber Ops — Shadow Grid

- Plataforma: módulo narrativo de cibersegurança pertencente ao histórico do Lab Virtual DS.
- Pacote consultado: v6.1 revisado.
- Integração: aplicação isolada em `lab/modules/cyber-ops/` e adaptador em `lab/modules/cyber-ops-lab/`.
- Armazenamento e cache: namespaces próprios por sessão; cache isolado.
- Regra: não confundir com o repositório e a campanha independente CTF DS.

## Plataformas externas do ecossistema

| Repositório | Plataforma | Situação nesta consolidação |
|---|---|---|
| LAB-DS-3D-VR | HoloMotion 3D/VR | Não copiado; somente integrações externas existentes são permitidas |
| ctfds | CTF DS | Não copiado; Cyber Ops não é o CTF DS |
| desafio | Desafio DS | Não copiado |
| gameinformatica | Desafio Informática | Não copiado |
| rcp-adapta | Recuperação Adaptada | Não copiado |
| diagnosticoedu | Diagnóstico Edu | Não copiado |
| EDUAUTH | Autenticador | Somente componente de integração existente |
| CENTRALDS | Central de Ferramentas | Não copiado |

Nenhum ZIP externo foi usado como fonte de ferramenta para aumentar artificialmente o catálogo.
