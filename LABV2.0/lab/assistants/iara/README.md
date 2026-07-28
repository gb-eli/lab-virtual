# IARA DS Premium V3 — Cofre modular

Versão reorganizada para GitHub Pages, com HTML, CSS e JavaScript separados por responsabilidade.

## Estrutura
- `index.html`: marcação e acessibilidade.
- `css/base.css`: variáveis, layout e estrutura geral.
- `css/components.css`: chat, painéis, modelos, tokens e imagens.
- `css/responsive.css`: celular, tablet e redução de movimento.
- `js/config.js`: modelos e configurações públicas.
- `js/crypto-vault.js`: abertura autenticada dos módulos AES-GCM.
- `js/search-engine.js`: roteamento por impressões digitais de palavras.
- `js/ui.js`: criação segura de elementos sem HTML do usuário.
- `js/app.js`: orquestração.
- `data/vault/`: conteúdos e catálogos criptografados.
- `data/manifest.json`: índice leve de roteamento.
- `data/credit-policy.json`: somente hashes dos códigos.

## Proteções implementadas
- conteúdo do banco armazenado com AES-GCM;
- cada assunto fica em um arquivo separado;
- somente os módulos candidatos são descriptografados;
- cache limitado a três módulos;
- autenticação e integridade do AES-GCM;
- códigos publicados somente como hashes SHA-256;
- política CSP;
- sem JavaScript inline;
- respostas renderizadas com `textContent`, reduzindo risco de XSS;
- URLs e arquivos restritos à mesma origem;
- limpeza do cache ao iniciar novo chat.

## Limite técnico importante
Em um projeto 100% front-end, nenhuma chave pode ser considerada segredo absoluto: o navegador precisa receber código suficiente para abrir os dados. Esta versão impede leitura casual dos JSONs e dificulta cópia direta, mas um usuário avançado com DevTools ainda pode recuperar conteúdo enquanto ele estiver sendo usado.

Para proteção real contra inspeção, códigos de uso único e controle por aluno, é necessário validar e entregar os dados por uma API ou Supabase.

## Execução
Publique no GitHub Pages ou use:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`.


## Detalhes do banco

A interface possui agora o item **Detalhes do banco**, no menu lateral. O painel apresenta:

- objetos JSON;
- campos indexados;
- nós estruturais;
- valores textuais;
- palavras processáveis;
- volume bruto;
- turmas, disciplinas, aulas, datas, consultas e aliases.

As métricas também ficam registradas em `data/bank-metrics.json`, facilitando a atualização quando novas bases forem adicionadas.


## Expansão de inteligência V5

Esta versão adiciona **79 registros temáticos curados** e amplia o mecanismo para **85 rotas de conhecimento ativas**.

Áreas acrescentadas:

- drones DJI e aplicações de drones;
- robótica, ROS 2 e fabricação por impressão 3D;
- realidade virtual, Meta Quest, realidade mista e óculos AR;
- história, funcionamento e uso de linguagens de programação;
- bibliotecas Python, IDEs e versões de runtimes;
- front-end, back-end, full-stack, design e dados;
- XSS, sanitização, CSP e cibersegurança;
- sistemas bancários, transporte e logística;
- Celepar, Unespar, Enem 2026 e maratonas de programação;
- matemática, português, química, física, biologia e sociologia.

Os modelos agora consultam quantidades diferentes de módulos:

- Núcleo: até 2 rotas;
- Flux: até 3;
- Plus: até 4;
- Advanced: até 6;
- Solar Ultra: até 8.

O arquivo de curadoria legível está em `_professor/base_expandida_curadoria_v5.json`. Os módulos usados pelos estudantes permanecem criptografados em `data/vault/`.
