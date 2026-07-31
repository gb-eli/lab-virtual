'use strict';
(function(){
  window.LABDS_LABS=window.LABDS_LABS||{};
  const KEY='lab.tutorials.v31';
  const MODES={objective:{label:'Objetivo',description:'Somente as ações essenciais.'},guided:{label:'Guiado',description:'Passo a passo com explicações e conferência.'},detailed:{label:'Detalhado',description:'Inclui exemplos, motivos, erros comuns e aplicação real.'}};
  const TUTORIALS=[
    {id:'classroom-entregar',category:'Google Classroom',title:'Anexar e entregar uma atividade',level:'Básico',minutes:8,icon:'CL',summary:'Baixe o arquivo da atividade, anexe no trabalho correto, confira e entregue.',source:'https://support.google.com/edu/classroom/answer/6020273?hl=pt-BR',steps:[
      ['Abra a atividade correta','Entre na turma, localize a atividade em Atividades e leia título, instruções, prazo e critérios.','Evita anexar o arquivo no trabalho errado.','Confira também se há modelo ou material do professor.'],
      ['Produza e salve o arquivo','Conclua a atividade no Lab Virtual DS ou em outra ferramenta e use Exportar/Download.','O Classroom precisa receber um arquivo existente no aparelho ou no Drive.','No Lab Virtual DS, exportar libera o botão Ir para o Classroom.'],
      ['Use Adicionar ou criar','Na área Seu trabalho, escolha Arquivo para enviar do aparelho, Google Drive para um arquivo na nuvem ou Link para um endereço.','Cada opção serve para uma origem diferente.','Em celular, o arquivo normalmente fica em Downloads.'],
      ['Espere o upload terminar','Aguarde o nome do arquivo aparecer e verifique se ele abre corretamente.','Sair antes do upload terminar pode deixar a entrega sem anexo.','Arquivos grandes precisam de mais tempo e conexão estável.'],
      ['Escreva um comentário privado quando necessário','Use o comentário privado para avisar o professor sobre dúvida, correção ou problema específico.','O comentário privado fica ligado à atividade e não é exibido à turma.','Se a informação for útil para todos, use o mural ou comentário público conforme a orientação.'],
      ['Clique em Entregar','Revise o anexo e confirme Entregar. Depois verifique se o status mudou para Entregue.','Anexar não é o mesmo que entregar.','Antes do prazo, algumas atividades permitem cancelar o envio, corrigir e reenviar.']
    ]},
    {id:'classroom-comentarios',category:'Google Classroom',title:'Comentários privados, públicos e mural',level:'Básico',minutes:6,icon:'CL',summary:'Escolha o canal correto para dúvida individual, informação coletiva ou interação da turma.',source:'https://support.google.com/edu/classroom/answer/6020273?hl=pt-BR',steps:[
      ['Identifique o assunto','Decida se a mensagem trata somente da sua entrega ou pode ajudar toda a turma.','A escolha do canal melhora organização e privacidade.','Nunca publique dados pessoais de colegas.'],
      ['Use comentário privado','Na atividade, escreva ao professor sobre erro, justificativa, arquivo corrigido ou dúvida pessoal.','Mantém o contexto junto do trabalho.','Seja objetivo: informe o que ocorreu, o que tentou e do que precisa.'],
      ['Use comentário público com responsabilidade','Comente na postagem quando a mensagem puder ser vista e respondida pela turma.','Evita várias perguntas repetidas.','Leia comentários existentes antes de perguntar.'],
      ['Use o mural para comunicados gerais','Publique somente quando a turma e o professor permitirem.','O mural é coletivo e não substitui a entrega de atividade.','Não use o mural para enviar arquivo avaliado.']
    ]},
    {id:'classroom-drive-link',category:'Google Classroom',title:'Entregar pelo Drive, arquivo ou link',level:'Básico',minutes:7,icon:'CL',summary:'Entenda quando anexar um arquivo, selecionar no Drive ou enviar um link compartilhado.',source:'https://support.google.com/edu/classroom/answer/6020273?hl=pt-BR',steps:[
      ['Escolha Arquivo','Use para PDF, ZIP, imagem, código ou relatório salvo no aparelho.','O arquivo vira uma cópia anexada à atividade.','Renomeie o arquivo antes: nome-turma-atividade.extensão.'],
      ['Escolha Google Drive','Use para Documentos, Planilhas, Apresentações e outros arquivos já armazenados na conta escolar.','Evita baixar e reenviar um documento da nuvem.','Confira se escolheu a conta escolar correta.'],
      ['Escolha Link','Use para GitHub Pages, repositório, Figma ou outra publicação acessível.','O professor abre o endereço diretamente.','Teste o link em aba anônima para verificar permissão.'],
      ['Revise permissões','Para links e Drive, confirme se o professor tem acesso.','Um link sem permissão parece entregue, mas não pode ser avaliado.','Prefira “qualquer pessoa com o link pode ver” apenas quando a política da escola permitir.']
    ]},
    {id:'gmail-enviar',category:'E-mail',title:'Enviar um e-mail profissional',level:'Básico',minutes:8,icon:'@',summary:'Preencha destinatário, assunto, corpo, assinatura e anexo com clareza.',source:'https://support.google.com/mail/answer/6584?hl=pt-BR',steps:[
      ['Confirme o destinatário','Digite o endereço correto no campo Para e revise antes de enviar.','Uma letra errada pode enviar a mensagem a outra pessoa ou causar falha.','Use endereços fictícios nos simuladores do portal.'],
      ['Escreva um assunto informativo','Resuma o motivo: “Entrega — atividade Git — Nome — Turma”.','Assuntos claros facilitam busca e organização.','Evite “Oi”, “Trabalho” ou assunto vazio.'],
      ['Organize o corpo','Cumprimente, explique o motivo, indique o anexo ou link e finalize com seu nome e turma.','O destinatário entende a ação esperada sem adivinhar.','Use parágrafos curtos e revise ortografia.'],
      ['Anexe e confira','Clique no clipe, selecione o arquivo e espere o upload terminar.','Mencionar anexo sem anexá-lo é um erro comum.','Abra o anexo antes de enviar para conferir a versão.'],
      ['Envie e verifique','Clique em Enviar e consulte Enviados.','Confirma que a mensagem saiu da caixa de rascunhos.','Mensagens reais não são enviadas pelo simulador do Lab Virtual DS.']
    ]},
    {id:'gmail-cc-cco',category:'E-mail',title:'Usar Para, CC e CCO corretamente',level:'Intermediário',minutes:6,icon:'@',summary:'Proteja destinatários e escolha quem precisa agir, acompanhar ou permanecer oculto.',source:'https://support.google.com/mail/answer/6584?hl=pt-BR',steps:[
      ['Para','Inclua quem precisa receber e agir sobre a mensagem.','Mostra o destinatário principal.','Evite colocar uma lista grande de pessoas sem necessidade.'],
      ['CC','Inclua quem deve acompanhar, sabendo que todos verão os endereços.','É uma cópia visível.','Não use CC para expor endereços pessoais de uma turma.'],
      ['CCO','Use para enviar a muitas pessoas sem revelar os demais destinatários.','Protege privacidade e reduz respostas coletivas indevidas.','Em comunicado amplo, coloque seu próprio endereço em Para e os demais em CCO.'],
      ['Responder ou responder a todos','Use Responder a todos somente quando sua resposta for relevante para todos.','Evita ruído e exposição desnecessária.','Confira os destinatários antes do envio.']
    ]},
    {id:'drive-compartilhar',category:'Nuvem e arquivos',title:'Compartilhar arquivo no Google Drive',level:'Básico',minutes:7,icon:'DR',summary:'Defina visualização, comentário ou edição e teste se o link funciona.',source:'https://support.google.com/drive/answer/2494822?hl=pt-BR',steps:[
      ['Abra Compartilhar','Selecione o arquivo e escolha Compartilhar.','Centraliza pessoas e permissões.','Confirme a conta Google usada.'],
      ['Escolha a permissão','Visualizador lê; Comentador comenta; Editor altera o arquivo.','Permissão excessiva pode causar alterações indevidas.','Para entregar atividade, visualizador costuma ser suficiente.'],
      ['Adicione pessoas ou copie o link','Informe o e-mail escolar ou configure o acesso pelo link conforme orientação.','O tipo de compartilhamento define quem entra.','Evite “público” quando o conteúdo tiver dados da turma.'],
      ['Teste o acesso','Abra o link em aba anônima ou peça a um colega autorizado para conferir.','Detecta bloqueios antes da entrega.','Nunca compartilhe senha para resolver acesso.']
    ]},
    {id:'arquivos-downloads',category:'Windows e arquivos',title:'Baixar, localizar e renomear um arquivo',level:'Básico',minutes:7,icon:'FS',summary:'Entenda a pasta Downloads, extensões e nomes organizados.',source:'https://support.microsoft.com/windows',steps:[
      ['Faça o download','Use o botão Baixar/Exportar e aguarde a conclusão.','O navegador precisa concluir a gravação.','Observe a notificação de download.'],
      ['Abra a pasta Downloads','No Windows, use Explorador de Arquivos; no Chromebook, aplicativo Arquivos; no celular, Files/Meus Arquivos.','É o local padrão de muitos navegadores.','Use Ctrl+J no navegador para abrir o histórico de downloads.'],
      ['Mostre as extensões quando possível','Identifique .pdf, .zip, .html, .js, .py e outras extensões.','A extensão indica o formato e ajuda a evitar arquivos errados.','Não troque somente a extensão para converter um arquivo.'],
      ['Renomeie com padrão','Use nome-turma-atividade-data.extensão, sem caracteres confusos.','Facilita identificação e correção.','Exemplo: gabriel-2ds-git-atividade01.zip.'],
      ['Mova para uma pasta do projeto','Crie uma estrutura por disciplina, trimestre e atividade.','Evita perder arquivos entre muitos downloads.','Faça cópia de segurança no Drive quando permitido.']
    ]},
    {id:'pastas-organizacao',category:'Windows e arquivos',title:'Criar e organizar pastas de projeto',level:'Básico',minutes:6,icon:'FS',summary:'Monte uma estrutura previsível para código, documentos e entregas.',source:'https://support.microsoft.com/windows',steps:[
      ['Crie a pasta principal','Use Novo > Pasta ou Ctrl+Shift+N.','Cada projeto precisa de um local próprio.','Use nomes curtos, sem espaços quando o projeto for de programação.'],
      ['Crie subpastas','Separe src, assets, css, js, docs e entregas conforme o projeto.','A organização facilita manutenção e publicação.','Não crie subpastas sem finalidade.'],
      ['Mantenha index.html na raiz certa','Em sites estáticos, o arquivo inicial deve estar no local publicado.','Evita Page not found no GitHub Pages.','Teste abrindo a estrutura localmente e pelo link publicado.'],
      ['Compacte somente para entrega','Use ZIP para enviar vários arquivos preservando a estrutura.','Um ZIP evita perder pastas durante o envio.','O GitHub não extrai automaticamente um ZIP enviado ao repositório.']
    ]},
    {id:'vscode-primeiro-projeto',category:'Desenvolvimento',title:'Criar um projeto no Visual Studio Code',level:'Básico',minutes:10,icon:'VS',summary:'Abra uma pasta, crie arquivos, use terminal e mantenha a estrutura organizada.',source:'https://code.visualstudio.com/docs/getstarted/getting-started',steps:[
      ['Abra uma pasta, não apenas um arquivo','Use Arquivo > Abrir Pasta e selecione a pasta do projeto.','O VS Code passa a entender toda a estrutura.','Evite editar arquivos soltos em Downloads.'],
      ['Crie os arquivos necessários','No Explorer, crie index.html, style.css e script.js ou a estrutura da linguagem.','Nomes e extensões corretos ativam recursos do editor.','Use letras minúsculas em projetos web.'],
      ['Salve e formate','Use Ctrl+S e, quando disponível, Formatar Documento.','Arquivos não salvos não aparecem corretamente no navegador ou no Git.','Observe o ponto na aba indicando alteração não salva.'],
      ['Abra o terminal integrado','Use Terminal > Novo Terminal e confira a pasta atual.','Permite executar comandos sem sair do editor.','Use pwd/cd/dir para confirmar o caminho.'],
      ['Execute ou visualize','Abra HTML no navegador, use extensão confiável quando autorizada ou execute o comando da linguagem.','O método depende do projeto.','Nunca instale extensão sem verificar origem e necessidade.']
    ]},
    {id:'git-basico',category:'Git e GitHub',title:'Criar um repositório Git local',level:'Intermediário',minutes:12,icon:'GIT',summary:'Inicialize, selecione alterações, faça commit e consulte o histórico.',source:'https://git-scm.com/docs/gittutorial',steps:[
      ['Abra a pasta correta','No terminal, navegue até a raiz do projeto.','O repositório será criado na pasta atual.','Use pwd ou cd para conferir.'],
      ['Inicialize','Execute git init.','Cria a pasta interna .git e habilita versionamento.','Não inicialize dentro de outro repositório sem intenção.'],
      ['Veja o estado','Execute git status.','Mostra arquivos novos, modificados e preparados.','Use esse comando antes e depois de cada etapa.'],
      ['Prepare arquivos','Execute git add arquivo ou git add . com atenção.','Escolhe o que fará parte do próximo commit.','Use .gitignore para arquivos temporários e segredos.'],
      ['Crie o commit','Execute git commit -m "mensagem clara".','Registra um ponto histórico.','Mensagem deve explicar a mudança, não apenas “atualização”.'],
      ['Consulte o histórico','Use git log --oneline.','Ajuda a rastrear e comparar versões.','Commits pequenos e coerentes são mais fáceis de revisar.']
    ]},
    {id:'github-criar-repo',category:'Git e GitHub',title:'Criar um repositório no GitHub',level:'Intermediário',minutes:8,icon:'GH',summary:'Crie o repositório, defina visibilidade e evite conflitos no primeiro envio.',source:'https://docs.github.com/pt/repositories/creating-and-managing-repositories/creating-a-new-repository',steps:[
      ['Escolha New repository','No GitHub, abra o menu de criação e selecione novo repositório.','Inicia o espaço remoto do projeto.','Use sua conta escolar ou pessoal conforme orientação.'],
      ['Defina nome e descrição','Use nome curto e descrição que explique o projeto.','Facilita busca e apresentação.','Evite dados pessoais no nome do repositório público.'],
      ['Escolha visibilidade','Público pode ser visto por qualquer pessoa; privado depende de permissão.','GitHub Pages e avaliação podem depender dessa escolha.','Siga a política da atividade.'],
      ['Decida sobre README inicial','Se o projeto local já tem commits, criar arquivos no remoto pode exigir merge.','Evita conflito no primeiro push.','Para iniciantes, siga exatamente o fluxo indicado pelo GitHub.'],
      ['Copie a URL correta','Use HTTPS ou SSH conforme configuração.','Essa URL será usada como remote.','Nunca copie token ou senha para o código.']
    ]},
    {id:'github-clone',category:'Git e GitHub',title:'Clonar um projeto com git clone',level:'Intermediário',minutes:7,icon:'GH',summary:'Baixe o histórico completo de um repositório e abra a pasta certa.',source:'https://docs.github.com/pt/repositories/creating-and-managing-repositories/cloning-a-repository',steps:[
      ['Copie a URL do repositório','Abra Code e copie HTTPS ou SSH.','A URL identifica o remoto.','Confirme que você tem acesso.'],
      ['Escolha a pasta pai','No terminal, entre na pasta onde o projeto será criado.','git clone cria uma nova subpasta.','Não execute dentro de uma pasta com o mesmo nome.'],
      ['Execute git clone URL','Aguarde objetos e arquivos serem baixados.','Traz arquivos, branches e histórico.','Falha de autenticação indica acesso ou credencial, não erro no código.'],
      ['Entre na pasta criada','Use cd nome-do-repositorio e git status.','Os próximos comandos precisam ocorrer dentro do projeto.','Abra essa pasta no VS Code.']
    ]},
    {id:'github-push-pages',category:'Git e GitHub',title:'Enviar projeto e publicar no GitHub Pages',level:'Intermediário',minutes:12,icon:'GH',summary:'Configure o remoto, faça push e publique um site estático.',source:'https://docs.github.com/pt/pages/getting-started-with-github-pages/creating-a-github-pages-site',steps:[
      ['Conecte o remoto','Use git remote add origin URL e confira com git remote -v.','Liga o repositório local ao GitHub.','Se origin já existe, use git remote set-url origin URL.'],
      ['Envie a branch','Use git push -u origin main após commits válidos.','Publica o histórico no remoto.','Resolva conflitos antes de forçar qualquer envio.'],
      ['Confira a raiz do site','Garanta index.html e caminhos relativos no diretório publicado.','GitHub Pages precisa encontrar o arquivo inicial.','Use .nojekyll quando houver arquivos iniciados por sublinhado ou estrutura própria.'],
      ['Ative Pages','Em Settings > Pages, escolha a branch e a pasta de publicação.','Cria o endereço público.','A publicação pode levar alguns minutos.'],
      ['Teste sem cache','Abra em aba anônima, atualize e teste links diretos.','Detecta cache antigo, caminhos errados e arquivos faltando.','Nomes de arquivos diferenciam maiúsculas e minúsculas.']
    ]},
    {id:'docs-formatar',category:'Documentos',title:'Formatar um trabalho no Word ou Google Documentos',level:'Básico',minutes:10,icon:'DOC',summary:'Use estilos, alinhamento, espaçamento, cabeçalho e exportação sem poluição visual.',source:'https://support.google.com/docs/topic/9054603?hl=pt-BR',steps:[
      ['Use estilos de título','Aplique Título, Título 1 e Título 2 em vez de aumentar fonte manualmente.','Cria hierarquia e permite sumário.','Mantenha consistência.'],
      ['Ajuste parágrafo','Configure alinhamento, recuo e espaçamento conforme a atividade.','Melhora leitura e apresentação.','Não use vários espaços para alinhar texto.'],
      ['Use negrito com intenção','Destaque palavras-chave, não parágrafos inteiros.','Excesso de destaque perde efeito.','Evite depender somente de cor.'],
      ['Insira tabela ou imagem','Adicione legenda, tamanho proporcional e alinhamento.','Elementos visuais devem explicar algo.','Não estique imagem de forma desproporcional.'],
      ['Revise e exporte','Confira ortografia, páginas, nome do arquivo e exporte PDF quando solicitado.','PDF preserva o layout.','Guarde também o arquivo editável.']
    ]},
    {id:'sheets-basico',category:'Planilhas',title:'Criar uma planilha com fórmulas e gráfico',level:'Básico',minutes:12,icon:'XLS',summary:'Organize dados, use referências, calcule resultados e escolha um gráfico adequado.',source:'https://support.google.com/docs/topic/9054603?hl=pt-BR',steps:[
      ['Crie cabeçalhos','Cada coluna deve representar um campo e cada linha um registro.','Estrutura tabular permite filtros e fórmulas.','Evite células mescladas dentro da tabela de dados.'],
      ['Digite valores consistentes','Use números como números, datas como datas e unidades no cabeçalho.','Misturar texto e número quebra cálculos.','Exemplo: Preço (R$), Quantidade, Total.'],
      ['Crie a fórmula','Inicie com = e use referências, como =B2*C2.','A fórmula atualiza quando os valores mudam.','Use $A$1 quando a referência precisar permanecer fixa.'],
      ['Copie a fórmula','Use a alça de preenchimento ou copiar/colar.','Replica a lógica com referências relativas.','Confira a primeira e a última linha.'],
      ['Filtre e ordene','Ative filtro nos cabeçalhos e escolha a coluna correta.','Ajuda a analisar sem apagar dados.','Ordene toda a tabela, não apenas uma coluna isolada.'],
      ['Crie o gráfico','Selecione rótulos e valores e escolha barras/colunas para comparação ou linha para evolução.','O tipo deve responder à pergunta.','Inclua título e descrição textual acessível.']
    ]},
    {id:'slides-apresentar',category:'Apresentações',title:'Criar uma apresentação clara',level:'Básico',minutes:10,icon:'SLD',summary:'Planeje a narrativa, reduza texto, use contraste e ensaie.',source:'https://support.google.com/docs/topic/9054603?hl=pt-BR',steps:[
      ['Defina a mensagem','Escreva o objetivo da apresentação em uma frase.','Evita slides sem direção.','Cada slide deve apoiar essa mensagem.'],
      ['Crie uma sequência','Introdução, problema, evidências, solução e conclusão.','A audiência acompanha o raciocínio.','Use títulos que antecipem a ideia principal.'],
      ['Reduza texto','Transforme parágrafos em tópicos curtos, diagramas ou imagens.','O apresentador explica; o slide apoia.','Não leia a tela inteira.'],
      ['Garanta contraste e tamanho','Use fonte legível e cores com contraste suficiente.','A apresentação pode ocorrer em tela distante ou televisão.','Teste em tela cheia.'],
      ['Ensaie e exporte','Use modo apresentação, cronometre e guarde PDF de segurança.','Detecta transições, links e texto cortado.','Leve uma cópia offline.']
    ]},
    {id:'forms-criar',category:'Formulários',title:'Criar um formulário ou questionário',level:'Intermediário',minutes:12,icon:'FRM',summary:'Escolha tipos de pergunta, validação, seções e correção.',source:'https://support.google.com/docs/topic/9055404?hl=pt-BR',steps:[
      ['Defina o objetivo','Determine qual decisão ou aprendizagem será medida.','Perguntas devem ter finalidade.','Evite coletar dado que não será utilizado.'],
      ['Escolha o tipo de campo','Resposta curta para texto breve; múltipla escolha para uma opção; caixas para várias; escala para avaliação.','O tipo afeta a qualidade das respostas.','Não use parágrafo para tudo.'],
      ['Configure obrigatoriedade e validação','Marque somente campos essenciais e limite formato quando necessário.','Reduz respostas inválidas.','Explique o formato esperado.'],
      ['Use seções e lógica','Agrupe assuntos e direcione a seção conforme a resposta quando fizer sentido.','Encurta formulários e personaliza o fluxo.','Teste todos os caminhos.'],
      ['Teste antes de enviar','Responda como estudante, confira pontuação e exportação.','Detecta pergunta ambígua ou resposta correta errada.','Use dados fictícios no teste.']
    ]},
    {id:'figma-basico',category:'Design e prototipação',title:'Criar um protótipo no Figma',level:'Intermediário',minutes:12,icon:'UI',summary:'Use frames, componentes, Auto Layout e prototipação para validar uma interface.',source:'https://help.figma.com/hc/en-us/categories/360002051613-Get-started',steps:[
      ['Crie um frame','Escolha o tamanho de celular, tablet ou desktop.','O frame representa a tela.','Projete primeiro para o contexto de uso.'],
      ['Organize camadas','Nomeie grupos e elementos de forma clara.','Facilita edição e colaboração.','Evite dezenas de Rectangle 1 sem identificação.'],
      ['Use Auto Layout','Agrupe componentes que precisam se adaptar ao texto e à tela.','Cria espaçamento e responsividade previsíveis.','Teste textos maiores.'],
      ['Crie componentes','Transforme botões, cards e campos repetidos em componentes.','Evita inconsistência.','Use variantes para estados normal, foco e desabilitado.'],
      ['Conecte o protótipo','Defina interações entre telas e execute Present.','Permite testar fluxo sem programar.','Prototipação não substitui validação técnica.']
    ]},
    {id:'canva-educacao',category:'Design e prototipação',title:'Usar o Canva for Education com organização',level:'Básico',minutes:8,icon:'CV',summary:'Crie material educacional, compartilhe com permissão adequada e exporte no formato certo.',source:'https://www.canva.com/education/',steps:[
      ['Acesse pela conta autorizada','Use a conta escolar ou o convite fornecido pela instituição.','Recursos educacionais dependem de elegibilidade e configuração.','Não compartilhe credenciais.'],
      ['Escolha o formato','Apresentação, cartaz, vídeo ou documento têm dimensões diferentes.','Evita redimensionamento e corte.','Defina onde o material será exibido.'],
      ['Use modelos como ponto de partida','Adapte cores, texto e imagens ao objetivo.','Modelo não substitui autoria e revisão.','Remova elementos desnecessários.'],
      ['Compartilhe com controle','Escolha visualizar, comentar ou editar.','Permissão correta protege o trabalho.','Teste o link antes de entregar.'],
      ['Exporte corretamente','PDF para impressão, PNG para imagem, MP4 para vídeo ou link quando solicitado.','O formato define qualidade e compatibilidade.','Guarde versão editável.']
    ]},
    {id:'dominio-hospedagem',category:'Web e hospedagem',title:'Entender domínio, DNS e hospedagem',level:'Intermediário',minutes:10,icon:'WEB',summary:'Diferencie endereço, DNS, servidor e publicação.',source:'https://registro.br/dominio/',steps:[
      ['Domínio','É um nome registrado que identifica um endereço na internet, como exemplo.com.br.','É mais fácil lembrar que um IP.','Registrar domínio não cria automaticamente um site.'],
      ['DNS','Conecta o domínio aos serviços, como site e e-mail, por registros.','Funciona como sistema de resolução de nomes.','Alterações podem levar tempo para se propagar.'],
      ['Hospedagem','É o ambiente que disponibiliza arquivos ou aplicação.','O domínio aponta para onde o conteúdo está hospedado.','GitHub Pages e Vercel são opções para projetos compatíveis.'],
      ['HTTPS','Usa certificado para proteger a conexão e confirmar o domínio.','Reduz interceptação de dados.','Nunca confie apenas no cadeado para avaliar todo o conteúdo.'],
      ['Escolha conforme o projeto','Site estático, API, banco e aplicação em tempo real exigem recursos diferentes.','Evita pagar ou configurar serviço inadequado.','Comece com estático quando não houver backend.']
    ]},
    {id:'vercel-deploy',category:'Web e hospedagem',title:'Publicar um projeto no Vercel',level:'Intermediário',minutes:9,icon:'▲',summary:'Importe um repositório, configure build e acompanhe deploys.',source:'https://vercel.com/docs/deployments/git',steps:[
      ['Prepare o repositório','Garanta que o projeto executa localmente e possui arquivos de configuração corretos.','O deploy reproduz o build do código versionado.','Não envie chaves secretas ao Git.'],
      ['Importe pelo Git','Conecte o provedor e selecione o repositório autorizado.','Cada push pode gerar uma nova versão.','Revise permissões da integração.'],
      ['Configure framework e comandos','Informe diretório raiz, comando de build e pasta de saída quando não forem detectados.','Valores errados causam build sem arquivos.','Em site estático puro, a saída pode ser a própria raiz ou dist.'],
      ['Analise logs','Se falhar, leia a primeira mensagem relevante do build.','Logs mostram dependência, caminho ou variável ausente.','Corrija no código e faça novo commit.'],
      ['Teste a URL de produção','Abra rotas, assets e atualização de página.','Um deploy concluído ainda pode ter erro funcional.','Teste em celular e aba anônima.']
    ]},
    {id:'cloud-intro',category:'Nuvem e infraestrutura',title:'Comparar AWS, Azure e Google Cloud',level:'Intermediário',minutes:10,icon:'☁',summary:'Escolha serviços por categoria, custo, região e necessidade, sem decorar marcas.',source:'https://cloud.google.com/docs/overview',steps:[
      ['Comece pelo problema','Defina se precisa de máquina virtual, armazenamento, banco, função, rede ou IA.','Serviço deve resolver uma necessidade real.','Não escolha apenas pelo nome da plataforma.'],
      ['Compare categorias equivalentes','Compute, storage, database, serverless e identidade existem em diferentes provedores.','Os nomes mudam, mas os conceitos se relacionam.','Crie uma tabela de equivalências.'],
      ['Considere custo e limites','Leia camada gratuita, cobrança por uso, transferência e região.','Recursos esquecidos podem gerar custo.','Use alertas e orçamento em ambientes de estudo.'],
      ['Proteja acesso','Use MFA, menor privilégio e contas separadas.','Contas de nuvem controlam recursos importantes.','Nunca publique chave de acesso em repositório.'],
      ['Faça laboratório controlado','Use simulador ou sandbox escolar antes de produção.','Permite aprender sem risco financeiro ou operacional.','Exporte registros da atividade.']
    ]},
    {id:'vm-intro',category:'Sistemas e virtualização',title:'Criar uma máquina virtual com segurança',level:'Intermediário',minutes:12,icon:'VM',summary:'Planeje CPU, RAM, disco, ISO, rede e snapshot.',source:'https://www.virtualbox.org/manual/',steps:[
      ['Defina o objetivo','Escolha o sistema e a tarefa que será testada.','Determina recursos e riscos.','Use imagens oficiais e licença adequada.'],
      ['Aloque recursos','Defina CPU, RAM e disco sem consumir todo o computador hospedeiro.','Excesso pode travar o aparelho.','O simulador do Lab Virtual DS mostra conflitos.'],
      ['Escolha a rede','NAT é mais isolado; bridge aproxima a VM da rede física.','A opção altera exposição e conectividade.','Em laboratório escolar, prefira o modo indicado pelo professor.'],
      ['Instale o sistema','Configure idioma, teclado, disco e usuário fictício de laboratório.','A sequência reproduz uma instalação real.','Não use senha pessoal no simulador.'],
      ['Crie snapshot','Salve um ponto antes de alteração arriscada.','Permite voltar sem reinstalar.','Snapshot não substitui backup de arquivos importantes.']
    ]},
    {id:'seguranca-phishing',category:'Segurança digital',title:'Identificar phishing e mensagens suspeitas',level:'Básico',minutes:8,icon:'SEC',summary:'Analise remetente, urgência, domínio, link, anexo e solicitação.',source:'https://support.google.com/mail/answer/8253?hl=pt-BR',steps:[
      ['Pare antes de clicar','Mensagens urgentes tentam impedir reflexão.','Tempo de análise reduz decisões impulsivas.','Não responda com dados pessoais.'],
      ['Confira remetente e domínio','Compare o endereço completo, não apenas o nome exibido.','Domínios parecidos podem enganar.','Procure troca de letras e subdomínios estranhos.'],
      ['Analise a solicitação','Desconfie de senha, código, pagamento, prêmio ou ameaça inesperada.','Instituições sérias não precisam de sua senha.','Confirme por canal oficial separado.'],
      ['Passe o mouse ou pressione o link','Veja o destino antes de abrir.','Texto visível pode esconder outro endereço.','No celular, toque prolongado sem abrir quando o sistema permitir.'],
      ['Reporte e exclua','Use denunciar phishing/spam e avise a equipe responsável.','Ajuda a proteger outros usuários.','Não encaminhe o conteúdo perigoso como brincadeira.']
    ]},
    {id:'entrega-organizada',category:'Rotina escolar',title:'Organizar uma atividade do início à entrega',level:'Básico',minutes:10,icon:'✓',summary:'Transforme instrução em checklist, registre evidências e entregue no canal correto.',source:'https://support.google.com/edu/classroom/answer/6020273?hl=pt-BR',steps:[
      ['Leia antes de iniciar','Identifique objetivo, formato, prazo, nome do arquivo e critérios.','Evita refazer o trabalho.','Transforme cada critério em um item de checklist.'],
      ['Crie a pasta da atividade','Separe materiais, código, imagens e versão final.','Mantém os arquivos localizáveis.','Use nome da disciplina e número da atividade.'],
      ['Registre o processo','Guarde capturas, logs, commits ou relatório exportado.','Demonstra como a solução foi construída.','Não registre senha ou dado sensível.'],
      ['Teste a entrega','Abra arquivo, link ou ZIP em outro navegador quando possível.','Detecta arquivo vazio ou permissão bloqueada.','Use aba anônima para links públicos.'],
      ['Entregue e confirme','Anexe, escreva observação quando necessário, clique em Entregar e confira o status.','A confirmação final é parte da atividade.','Mantenha uma cópia até a correção.']
    ]}
  ];
  let root,ctx,state,active=null;
  const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const esc=v=>String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function defaults(){return{query:'',category:'Todas',mode:'guided',completed:{},lastTutorial:null};}
  function save(){ctx.storage.set(KEY,state);}
  function categories(){return['Todas',...new Set(TUTORIALS.map(t=>t.category))];}
  function filtered(){const q=norm(state.query);return TUTORIALS.filter(t=>(state.category==='Todas'||t.category===state.category)&&(!q||norm(`${t.title} ${t.category} ${t.summary} ${t.steps.flat().join(' ')}`).includes(q)));}
  function progress(id){const done=state.completed[id]||[];const tutorial=TUTORIALS.find(t=>t.id===id);return tutorial?Math.round(done.length/tutorial.steps.length*100):0;}
  function renderList(){const host=$('#tutorialCards'),items=filtered();host.textContent='';$('#tutorialCount').textContent=`${items.length} tutorial(is)`;items.forEach(t=>{const card=document.createElement('article');card.className='tutorial-card';card.innerHTML=`<div class="tutorial-card-icon">${esc(t.icon)}</div><div><span>${esc(t.category)} • ${esc(t.level)} • ${t.minutes} min</span><h3>${esc(t.title)}</h3><p>${esc(t.summary)}</p><div class="tutorial-progress"><i style="width:${progress(t.id)}%"></i></div><small>${progress(t.id)}% concluído</small></div><button class="btn ${progress(t.id)===100?'secondary':'primary'}" type="button">${progress(t.id)===100?'Revisar':'Iniciar'}</button>`;card.querySelector('button').onclick=()=>openTutorial(t.id);host.appendChild(card);});if(!items.length)host.innerHTML='<div class="empty-state"><strong>Nenhum tutorial encontrado.</strong><span>Tente outra palavra ou categoria.</span></div>';}
  function detailFor(step){const [title,action,why,tip]=step;const mode=state.mode;return{title,body:mode==='objective'?action:mode==='guided'?`${action}\n\nPor quê: ${why}`:`${action}\n\nPor quê: ${why}\n\nDica e erro comum: ${tip}`};}
  function openTutorial(id){active=TUTORIALS.find(t=>t.id===id);if(!active)return;state.lastTutorial=id;save();const done=new Set(state.completed[id]||[]);const host=$('#tutorialDetail');host.textContent='';host.classList.add('active');const header=document.createElement('header');header.innerHTML=`<button class="tutorial-back" type="button">← Voltar</button><div><span class="eyebrow">${esc(active.category)}</span><h2>${esc(active.title)}</h2><p>${esc(active.summary)}</p></div><a class="btn secondary" href="${esc(active.source)}" target="_blank" rel="noopener noreferrer">Fonte oficial ↗</a>`;header.querySelector('button').onclick=()=>{host.classList.remove('active');active=null;renderList();};host.appendChild(header);const mode=document.createElement('div');mode.className='tutorial-mode-selector';Object.entries(MODES).forEach(([value,item])=>{const b=document.createElement('button');b.type='button';b.className=value===state.mode?'active':'';b.innerHTML=`<strong>${item.label}</strong><span>${item.description}</span>`;b.onclick=()=>{state.mode=value;save();openTutorial(id);};mode.appendChild(b);});host.appendChild(mode);const list=document.createElement('ol');list.className='tutorial-step-list';active.steps.forEach((step,index)=>{const data=detailFor(step),li=document.createElement('li');li.className=done.has(index)?'done':'';const check=document.createElement('button');check.type='button';check.className='tutorial-check';check.setAttribute('aria-pressed',String(done.has(index)));check.textContent=done.has(index)?'✓':String(index+1);const copy=document.createElement('div');const h=document.createElement('h3');h.textContent=data.title;const p=document.createElement('p');p.textContent=data.body;copy.append(h,p);check.onclick=()=>{const current=new Set(state.completed[id]||[]);current.has(index)?current.delete(index):current.add(index);state.completed[id]=[...current].sort((a,b)=>a-b);save();if(current.size===active.steps.length){ctx.core?.complete?.(`tutorial:${id}`,{xp:35,credits:15,reason:`Tutorial concluído: ${active.title}`});ctx.toast('Tutorial concluído. Progresso registrado.','success');}openTutorial(id);};li.append(check,copy);list.appendChild(li);});host.appendChild(list);const footer=document.createElement('footer');footer.className='tutorial-detail-footer';const status=document.createElement('strong');status.textContent=`${progress(id)}% concluído`;const reset=document.createElement('button');reset.className='btn secondary';reset.type='button';reset.textContent='Reiniciar checklist';reset.onclick=()=>{if(confirm('Reiniciar o checklist deste tutorial?')){delete state.completed[id];save();openTutorial(id);}};const exportBtn=document.createElement('button');exportBtn.className='btn primary';exportBtn.type='button';exportBtn.textContent='Exportar checklist';exportBtn.onclick=()=>downloadTutorial(active);footer.append(status,reset,exportBtn);host.appendChild(footer);}
  function downloadTutorial(t){const done=new Set(state.completed[t.id]||[]),profile=ctx.core?.getSnapshot?.().profile||{};const text=[`LAB VIRTUAL DS — CHECKLIST DE TUTORIAL`,`Tutorial: ${t.title}`,`Estudante: ${profile.name||'Não informado'}`,`Turma: ${profile.studentClass||'Não informada'}`,`Progresso: ${progress(t.id)}%`,`Data: ${new Date().toLocaleString('pt-BR')}`,'',...t.steps.map((s,i)=>`${done.has(i)?'[x]':'[ ]'} ${i+1}. ${s[0]} — ${s[1]}`),'',`Fonte: ${t.source}`].join('\n');ctx.exporter.download(text,`tutorial-${t.id}-${Date.now()}.txt`,'text/plain;charset=utf-8');ctx.session?.record?.({laboratoryId:'tutorial-center',laboratoryName:'Central de Tutoriais',eventType:'export',action:`Checklist exportado: ${t.title}`,status:'success'});setTimeout(()=>window.LABDS.Classroom?.prompt?.(),200);}
  function template(){return `<div class="tutorial-center-lab"><section class="tutorial-hero"><div><span class="eyebrow">APRENDER A USAR • PASSO A PASSO</span><h2>Central de Tutoriais</h2><p>Escolha o que precisa fazer hoje. Marque cada etapa, altere o nível de explicação e exporte sua evidência.</p></div><div class="tutorial-summary"><b>${TUTORIALS.length}</b><span>guias práticos</span><b>${categories().length-1}</b><span>áreas</span></div></section><section class="tutorial-toolbar"><label>Pesquisar<input id="tutorialSearch" type="search" placeholder="Classroom, e-mail, Git, planilha..."></label><label>Categoria<select id="tutorialCategory">${categories().map(c=>`<option>${esc(c)}</option>`).join('')}</select></label><span id="tutorialCount"></span></section><section id="tutorialCards" class="tutorial-card-grid"></section><section id="tutorialDetail" class="tutorial-detail" aria-live="polite"></section></div>`;}
  async function mount(host,context){root=host;ctx=context;const saved=await ctx.storage.get(KEY,{});state={...defaults(),...saved,completed:saved?.completed&&typeof saved.completed==='object'?saved.completed:{}};root.innerHTML=template();$('#tutorialSearch').value=state.query;$('#tutorialCategory').value=categories().includes(state.category)?state.category:'Todas';$('#tutorialSearch').oninput=()=>{state.query=$('#tutorialSearch').value;save();renderList();};$('#tutorialCategory').onchange=()=>{state.category=$('#tutorialCategory').value;save();renderList();};renderList();if(state.lastTutorial&&new URLSearchParams(location.search).get('tutorial')===state.lastTutorial)openTutorial(state.lastTutorial);}
  async function unmount(){await save();root=null;ctx=null;active=null;}
  function exportPayload(){const completed=Object.entries(state?.completed||{}).map(([id,steps])=>({id,title:TUTORIALS.find(t=>t.id===id)?.title||id,checked:steps.length,total:TUTORIALS.find(t=>t.id===id)?.steps.length||0}));return{text:`CENTRAL DE TUTORIAIS\nTutoriais disponíveis: ${TUTORIALS.length}\nProgresso registrado: ${completed.length}`,native:JSON.stringify({version:1,completed,mode:state?.mode},null,2),backup:state};}
  function help(){return'<p>Pesquise um tutorial, escolha o nível de explicação e marque os passos que realmente realizou. A conclusão válida registra XP uma única vez. O botão Exportar checklist gera a evidência e libera o fluxo do Google Classroom.</p>';}
  window.LABDS_LABS['tutorial-center-lab']={mount,unmount,exportPayload,help};
})();
