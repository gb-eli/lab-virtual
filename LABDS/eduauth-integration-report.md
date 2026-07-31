# Relatório de integração — EduAuth Offline

## Atualização 3.7 — Cyber Ops

A integração do Cyber Ops não altera o protocolo, as chaves ou as políticas do EduAuth. O novo módulo usa a sessão já autorizada do estudante, recebe apenas nome, turma e identificador local da sessão e registra suas evidências no histórico principal. Nenhuma credencial mestre é encaminhada ao iframe.


## Identificação

- **Plataforma:** Laboratório Virtual DS
- **Versão da plataforma:** 3.8.0-pages
- **Repositório:** gb-eli/lab-virtual
- **Origem prevista:** https://gb-eli.github.io/lab-virtual/
- **EduAuth Core:** 1.0.0
- **Data da integração:** 29/07/2026
- **Ambiente:** desenvolvimento
- **Provisionamento de produção:** não realizado

## Atualização da plataforma — 31/07/2026

A versão da plataforma foi elevada para `3.8.0-pages` com a incorporação do **Cyber Ops — Shadow Grid v6.1**. A remoção consolidada da Iara DS permanece preservada. O novo laboratório é carregado sob demanda em uma área isolada, recebe a identidade da sessão ativa e não altera o protocolo, as chaves ou as políticas do EduAuth.

### Validação da atualização 3.8

- 51 ferramentas disponíveis no catálogo;
- 42 módulos dinâmicos principais registrados;
- identidade, progresso, missões e exportações do Cyber Ops conectados ao histórico da sessão;
- progresso do Cyber Ops isolado pelo identificador local da sessão;
- Service Worker próprio do Cyber Ops desativado no modo incorporado;
- cache principal mantido leve, com os arquivos do Cyber Ops armazenados somente após o primeiro uso;
- nenhum módulo ou item de catálogo da Iara DS presente;
- laboratório didático de Inteligência Artificial preservado.

## Diagnóstico do sistema anterior

A revisão preservou o catálogo, os laboratórios, o salvamento, o Classroom, os modos gráficos e a estrutura da V3.2. Foi encontrado um mecanismo estático de autorização no painel de instrutor da máquina virtual: a interface solicitava uma senha local e comparava seu hash com um valor fixo publicado no JavaScript.

O valor anterior não é reproduzido neste relatório.

## Senhas e autorizações encontradas

| Arquivo | Linha aproximada anterior | Finalidade | Risco | Substituição |
|---|---:|---|---|---|
| `lab/modules/vm-lab/index.js` | 185 | Abrir controles avançados do instrutor | MEDIUM | `SESSION_SCOPED_PIN`, ação `vm-instructor-access` |

Também foram mapeadas ações administrativas existentes que não possuíam senha fixa, mas exigem proteção operacional:

| Ação | Risco | Modalidade |
|---|---|---|
| Abrir Modo Professor | MEDIUM | `SESSION_SCOPED_PIN` |
| Excluir atividade local do professor | HIGH | `SESSION_SCOPED_PIN` de 10 dígitos; `SIGNED_GRANT` disponível como modo mais forte |
| Abrir atividade ou desafio protegido por link | LOW | `CLASS_SHARED_PIN` |

## Arquitetura aplicada

O núcleo-fonte foi separado em:

```text
src/eduauth/
├── config/
├── core/
├── modes/
├── storage/
└── ui/
```

Para manter o pacote de publicação abaixo de 100 arquivos, o build consolida esses módulos em:

```text
lab/js/eduauth/eduauth.js
```

O bundle publicado não contém chave privada.

## Modalidades

### CLASS_SHARED_PIN

Integrado aos links de atividade criados no Modo Professor. O professor pode marcar a atividade como protegida. O link transporta turma, disciplina, aula, atividade e ação. A plataforma gera um código-base coletivo e valida um PIN de oito dígitos na janela de 15 minutos.

### SESSION_SCOPED_PIN

Integrado ao Modo Professor, ao painel do instrutor da máquina virtual e à exclusão de atividade local. As solicitações recebem identificadores e nonce gerados com `crypto.getRandomValues`, expiram, são vinculadas à ação e são consumidas quando configuradas como uso único.

### SIGNED_GRANT

O núcleo verifica tokens ECDSA P-256 no formato `EA1-G1.payload.assinatura`. A plataforma contém somente a chave pública de desenvolvimento. A exclusão de atividade apresenta essa modalidade como alternativa mais forte.

### PROFILE_RECOVERY_ENVELOPE

O núcleo consegue criptografar uma chave de dados para a chave pública RSA-OAEP de recuperação e gerar um envelope `EA1-R1`. O Lab Virtual DS atual não possui perfil protegido por senha; portanto, não foi criado um fluxo de redefinição artificial que alteraria o comportamento já consolidado. O recurso está disponível para futura migração de perfis protegidos.

## Código-base

- Prefixo: `EA1`
- Modos: `C1`, `S1`, `G1`, `R1`
- Codificação: Base32 Crockford
- Checksum: CRC32C
- Separadores e caixa: ignorados na leitura
- QR Code: gerado localmente e opcional
- Câmera: não obrigatória
- Fluxo principal: copiar, colar ou digitar

O código transporta registros numéricos compactos, faixa temporal, hash do recurso e, em solicitações individuais, sessão, requisição, nonce, perfil pseudonimizado e motivo quando obrigatório.

## Limitação de tentativas

- Máximo: 5 tentativas
- Mensagem neutra
- Atraso progressivo
- Bloqueio da solicitação após o limite
- Nova solicitação necessária
- Nenhum PIN digitado ou esperado é registrado

## Auditoria local

São registrados localmente:

- horário;
- plataforma;
- turma;
- disciplina;
- aula;
- atividade;
- ação;
- modalidade;
- risco;
- requisição;
- sessão;
- resultado;
- tentativas;
- expiração;
- consumo;
- motivo, quando aplicável.

Não são registrados senha, PIN esperado, chave, HMAC completo ou senha antiga.

## Arquivos criados

- `lab/js/eduauth/eduauth.js`
- `lab/css/eduauth.css`
- `src/eduauth/**`
- `eduauth-platform-manifest.json`
- `eduauth-action-registry.json`
- `eduauth-test-vectors.json`
- `eduauth-provisioning-template.json`
- `eduauth-integration-report.md`
- `scripts/build-eduauth.mjs`
- `tests/eduauth.test.mjs`

## Arquivos principais modificados

- `lab/index.html`
- `lab/js/config.js`
- `lab/js/app.js`
- `lab/js/session.js`
- `lab/js/schemas.js`
- `lab/modules/teacher-lab/index.js`
- `lab/modules/vm-lab/index.js`
- `lab/service-worker.js`
- `lab/manifest.webmanifest`
- `package.json`
- `scripts/build.mjs`
- `scripts/package-pages.mjs`

## Testes executados

- 49 testes automatizados aprovados;
- nenhum teste automatizado reprovado;
- 96 arquivos JavaScript/MJS validados por sintaxe;
- 99 arquivos no artefato estático;
- 13 rotas e recursos responderam HTTP 200;
- códigos QR coletivo e de sessão decodificados e comparados com o conteúdo original;
- vetor assinado válido aceito e vetor alterado rejeitado;
- envelope RSA-OAEP criado somente com a chave pública;
- busca de chave privada e geração insegura de nonce sem ocorrências no núcleo publicado.

Os testes físicos completos em Chrome Android, Chromebook e Edge Windows permanecem pendentes.

## Segurança e limitações reais

O EduAuth em frontend elimina senhas estáticas e reduz compartilhamento indevido, mas não oferece segurança equivalente a backend. As chaves HMAC publicadas podem ser extraídas por usuário tecnicamente avançado. O histórico local pode ser modificado por quem controla o navegador. Ações críticas devem preferir autorização assinada.

As chaves atuais são exclusivamente de desenvolvimento e estão marcadas como:

```text
DEVELOPMENT TEST KEY — DO NOT USE IN PRODUCTION
```

## Provisionamento de produção

1. Construir o EduAuth Professor.
2. Gerar chaves específicas de produção.
3. Manter chaves privadas somente no autenticador do professor.
4. Importar na plataforma apenas chaves HMAC provisionadas e chaves públicas.
5. Executar novamente os vetores de teste.
6. Publicar uma nova versão.
7. Confirmar que `productionProvisioned` foi alterado somente após validação.

## Pendências reais

- Provisionamento de produção pelo EduAuth Professor.
- Testes físicos em Chrome Android, Chromebook e Edge Windows.
- Integração do envelope de recuperação somente quando o perfil local protegido por senha for implantado.

## Resultado

A integração estrutural e os vetores de desenvolvimento são válidos. A configuração atual não deve ser utilizada como autorização real de produção.

```text
EDUAUTH PLATFORM INTEGRATION: VALID
```
