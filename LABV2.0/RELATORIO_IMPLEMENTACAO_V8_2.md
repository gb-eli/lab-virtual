# Relatório de implementação — Laboratório Virtual DS 8.2

## Objetivo

Integrar a IARA DS ao projeto completo sem remover terminais, jogos, VoxelCraft ou laboratórios práticos, mantendo publicação estática no GitHub Pages.

## Arquitetura adotada

A IARA permanece como aplicação modular própria em `public/lab/assistants/iara/`. O portal a carrega dentro de um iframe controlado pelo módulo `iara-lab.js`. Essa estratégia preserva o CSS, os módulos ES, o cofre e a lógica original sem contaminar o namespace global da central.

A comunicação utiliza `postMessage`. Tanto o portal quanto a IARA verificam:

- `event.origin === location.origin`;
- a janela remetente correta;
- identificadores de ferramentas presentes no catálogo permitido.

## Conhecimento contextual

Foi criado `data/lab-virtual-ds-context.json`, contendo o inventário público das 34 ferramentas. A IARA pode:

- explicar o que é o portal;
- listar ferramentas por categoria;
- explicar um laboratório específico;
- recomendar ferramentas conforme o objetivo;
- oferecer botão para abrir a ferramenta indicada;
- combinar uma explicação temática do cofre com uma prática sugerida no portal.

O portal também envia o catálogo atual para o iframe. Os dados recebidos são normalizados e combinados com aliases e usos do contexto estático.

## Inteligência preservada

O pacote original foi incorporado com:

- 85 rotas temáticas;
- módulos de tópicos e imagens;
- cinco modelos locais;
- quatro níveis de explicação;
- sistema de tokens;
- geração visual simulada;
- fontes recomendadas;
- cofre AES-GCM.

Todos os 87 pacotes criptografados foram autenticados e descriptografados durante os testes automatizados.

## Segurança

- nenhuma resposta ou pergunta é enviada a uma API externa;
- o conteúdo do usuário é renderizado com `textContent`;
- não há `eval`, `new Function`, `document.write` ou atribuição a `innerHTML` nos scripts da IARA;
- caminhos do cofre seguem allowlist `data/vault/*.vault.json`;
- manifesto, envelopes, conteúdo e contexto possuem limites;
- localStorage corrompido não interrompe a inicialização;
- o iframe não recebe câmera, microfone, localização, navegação superior ou downloads automáticos.

## Acessibilidade

O portal envia para a IARA:

- tema resolvido;
- modo de tema;
- tamanho de fonte;
- redução de movimento;
- contraste elevado;
- nome e turma da sessão.

## PWA

Os 143 arquivos da IARA foram adicionados à lista de cache principal, incluindo shell, dados, imagens e módulos criptografados. Isso aumenta a disponibilidade offline após a instalação bem-sucedida do Service Worker.

## Preservação

Nenhum módulo anterior foi removido. O inventário passou de 33 para 34 ferramentas e de 24 para 25 laboratórios modulares.
