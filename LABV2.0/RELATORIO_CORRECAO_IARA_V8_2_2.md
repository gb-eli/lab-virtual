# Correção de carregamento da IARA DS — versão 8.2.3

## Relato reproduzido

A ferramenta permanecia em “Inicializando a IARA...” e, após o tempo limite, exibia que a inicialização não havia sido confirmada.

## Causa técnica mais provável

A página externa da versão 8.2.1 podia carregar junto com um `app.js` antigo da IARA mantido pelo Service Worker ou pelo cache HTTP. O script antigo enviava a mensagem `ready` sem o identificador `boot` adotado pela integração nova. O portal validava o iframe e a origem corretamente, porém descartava a confirmação por considerar o identificador incompatível.

Também havia uma fragilidade adicional: a camada de carregamento só desaparecia depois do `ready`. Assim, mesmo quando o documento interno já estava visível e funcional, o usuário continuava vendo a tela de espera.

## Correções implementadas

- versão unificada `8.2.3-pages`;
- Service Worker `labds-v8.2.3-pages`;
- novo `boot.js` independente do módulo principal;
- aviso `frame-loaded` assim que o documento interno é criado;
- confirmação periódica até o motor ficar pronto;
- compatibilidade com mensagens antigas que não possuem `boot`;
- rejeição mantida para identificadores explícitos de carregamentos diferentes;
- arquivos CSS, JavaScript e JSON da IARA recebem versão na URL;
- imports ES Modules internos também recebem versão;
- interface do iframe é revelada após o carregamento do documento, sem depender exclusivamente do handshake;
- timeout separado para falha de navegação do iframe;
- painel de recuperação não bloqueia toda a interface;
- erros JavaScript e rejeições assíncronas são enviados ao portal com mensagem diagnóstica;
- modo contextual básico permanece disponível caso apenas o cofre criptografado não carregue;
- arquivos auxiliares de crédito e contexto deixaram de derrubar obrigatoriamente toda a aplicação;
- botões para recarregar somente a IARA, abrir separado e continuar na tela.

## Segurança preservada

A compatibilidade com cache antigo não remove a verificação de `event.source` e `event.origin`. Uma mensagem sem `boot` só é aceita quando vem exatamente da janela do iframe atual e da mesma origem. Mensagens com um `boot` explícito diferente continuam rejeitadas.

## Arquivos principais alterados

- `public/lab/js/labs/iara-lab.js`;
- `public/lab/assistants/iara/index.html`;
- `public/lab/assistants/iara/js/boot.js`;
- `public/lab/assistants/iara/js/app.js`;
- `public/lab/assistants/iara/js/crypto-vault.js`;
- `public/lab/assistants/iara/js/lab-context.js`;
- `public/lab/css/iara-integration.css`;
- `public/lab/service-worker.js`;
- `public/lab/manifest.webmanifest`;
- arquivos de versão, build, testes e documentação.

## Validação

- 26 testes automatizados aprovados;
- 0 testes reprovados;
- 87 pacotes AES-GCM autenticados e descriptografados nos testes;
- verificação de sintaxe de todos os arquivos JavaScript;
- teste do novo protocolo de boot em ambiente `vm`;
- teste de compatibilidade com cliente antigo;
- teste de versionamento dos recursos internos;
- validação do build estático e das rotas do GitHub Pages.

A política administrativa do ambiente impediu o playtest visual por navegador local. Por isso, a validação física final continua recomendada em aba anônima e em um celular real após a publicação.
