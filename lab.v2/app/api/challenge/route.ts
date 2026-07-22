type Difficulty = "basico" | "intermediario" | "avancado";

type Question = {
  id: string;
  difficulty: Difficulty;
  category: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

const QUESTIONS: Question[] = [
  {
    id: "alg-01",
    difficulty: "basico",
    category: "Lógica",
    prompt: "Qual estrutura executa um bloco somente quando uma condição é verdadeira?",
    options: ["Variável", "Condicional", "Comentário", "Importação"],
    answer: 1,
    explanation: "A estrutura condicional, como if/else, decide qual bloco executar a partir de uma expressão booleana.",
  },
  {
    id: "web-01",
    difficulty: "basico",
    category: "Web",
    prompt: "Qual tecnologia descreve a estrutura semântica principal de uma página?",
    options: ["CSS", "SQL", "HTML", "DNS"],
    answer: 2,
    explanation: "HTML estrutura títulos, parágrafos, formulários e demais elementos. CSS cuida da apresentação.",
  },
  {
    id: "net-01",
    difficulty: "basico",
    category: "Redes",
    prompt: "Qual serviço traduz nomes como escola.edu.br para endereços IP?",
    options: ["DNS", "FTP", "GPU", "BIOS"],
    answer: 0,
    explanation: "O DNS resolve nomes de domínio em registros como A (IPv4) e AAAA (IPv6).",
  },
  {
    id: "sec-01",
    difficulty: "basico",
    category: "Segurança",
    prompt: "Em uma página de login recebida por mensagem, qual atitude é mais segura?",
    options: ["Usar o link imediatamente", "Conferir domínio e acessar pelo endereço oficial", "Desativar o antivírus", "Reutilizar a senha"],
    answer: 1,
    explanation: "Verifique o domínio e prefira abrir o serviço pelo endereço oficial ou aplicativo conhecido.",
  },
  {
    id: "hw-01",
    difficulty: "basico",
    category: "Hardware",
    prompt: "Qual componente mantém temporariamente dados usados pelos programas em execução?",
    options: ["RAM", "Fonte", "Gabinete", "Cabo HDMI"],
    answer: 0,
    explanation: "A RAM é memória de trabalho volátil; perde seu conteúdo quando o computador é desligado.",
  },
  {
    id: "js-01",
    difficulty: "basico",
    category: "JavaScript",
    prompt: "O que a expressão 3 === '3' retorna em JavaScript?",
    options: ["true", "false", "3", "erro de sintaxe"],
    answer: 1,
    explanation: "A igualdade estrita compara valor e tipo. number e string são tipos diferentes.",
  },
  {
    id: "alg-02",
    difficulty: "intermediario",
    category: "Algoritmos",
    prompt: "Uma busca binária funciona corretamente quando a coleção está...",
    options: ["Duplicada", "Ordenada", "Criptografada", "Vazia"],
    answer: 1,
    explanation: "A busca binária elimina metade do intervalo a cada passo e, por isso, depende da ordenação.",
  },
  {
    id: "web-02",
    difficulty: "intermediario",
    category: "Web",
    prompt: "Qual atributo associa corretamente um label a um campo de formulário?",
    options: ["for apontando para o id", "href apontando para class", "src apontando para name", "alt apontando para value"],
    answer: 0,
    explanation: "O valor de for no label deve coincidir com o id do controle, melhorando clique e acessibilidade.",
  },
  {
    id: "sql-01",
    difficulty: "intermediario",
    category: "Banco de dados",
    prompt: "Qual cláusula filtra linhas antes do agrupamento em uma consulta SQL?",
    options: ["ORDER BY", "WHERE", "HAVING", "LIMIT"],
    answer: 1,
    explanation: "WHERE filtra registros antes do GROUP BY; HAVING filtra os grupos resultantes.",
  },
  {
    id: "net-02",
    difficulty: "intermediario",
    category: "Redes",
    prompt: "Em uma rede /24, quantos bits pertencem à parte de host do endereço IPv4?",
    options: ["8", "16", "24", "32"],
    answer: 0,
    explanation: "IPv4 possui 32 bits. Com prefixo /24, os 8 bits restantes identificam hosts.",
  },
  {
    id: "sec-02",
    difficulty: "intermediario",
    category: "Segurança",
    prompt: "Por que armazenar senha com hash e salt é preferível à criptografia reversível?",
    options: ["Permite recuperar a senha", "Evita guardar um segredo reversível e dificulta tabelas pré-computadas", "Deixa a senha menor", "Dispensa HTTPS"],
    answer: 1,
    explanation: "Senhas devem ser verificadas, não recuperadas. Salt único reduz a utilidade de tabelas pré-computadas.",
  },
  {
    id: "js-02",
    difficulty: "intermediario",
    category: "JavaScript",
    prompt: "Qual alternativa evita bloquear a interface durante uma tarefa de CPU longa no navegador?",
    options: ["localStorage", "Web Worker", "alert()", "innerHTML"],
    answer: 1,
    explanation: "Web Workers executam JavaScript fora da thread principal, mantendo a interface responsiva.",
  },
  {
    id: "alg-03",
    difficulty: "avancado",
    category: "Algoritmos",
    prompt: "Qual é a complexidade média de acesso a uma chave em uma tabela hash bem dimensionada?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: 0,
    explanation: "Com boa função de hash e baixa taxa de colisões, busca, inserção e remoção tendem a O(1) em média.",
  },
  {
    id: "web-03",
    difficulty: "avancado",
    category: "Web",
    prompt: "Qual controle reduz o risco de um HTML não confiável executar scripts dentro de um preview?",
    options: ["Iframe sandbox sem allow-same-origin", "Aumentar o z-index", "Codificar em Base64", "Ocultar o botão direito"],
    answer: 0,
    explanation: "Um iframe sandboxado limita capacidades. Base64 e bloqueio de interface não são controles de segurança.",
  },
  {
    id: "sql-02",
    difficulty: "avancado",
    category: "Banco de dados",
    prompt: "Qual nível de isolamento impede leituras sujas e leituras não repetíveis, mas ainda pode permitir fantasmas?",
    options: ["Read uncommitted", "Read committed", "Repeatable read", "Serializable"],
    answer: 2,
    explanation: "Repeatable read mantém as linhas lidas estáveis; o tratamento de fantasmas depende do SGBD e do mecanismo de bloqueio/MVCC.",
  },
  {
    id: "net-03",
    difficulty: "avancado",
    category: "Redes",
    prompt: "Qual registro DNS autoriza quais servidores podem enviar e-mail por um domínio?",
    options: ["A", "SPF publicado em TXT", "CNAME", "PTR"],
    answer: 1,
    explanation: "SPF é publicado como registro TXT e declara os remetentes autorizados. DKIM e DMARC complementam a proteção.",
  },
  {
    id: "sec-03",
    difficulty: "avancado",
    category: "Segurança",
    prompt: "Se perguntas e gabaritos forem enviados ao navegador, qual afirmação é correta?",
    options: ["AES no JavaScript torna tudo secreto", "Minificação impede extração", "Um usuário determinado pode recuperar conteúdo e chaves presentes no cliente", "Desabilitar DevTools resolve"],
    answer: 2,
    explanation: "Todo dado e chave necessários ao cliente podem ser observados em tempo de execução. O gabarito sensível deve permanecer no servidor.",
  },
  {
    id: "arch-01",
    difficulty: "avancado",
    category: "Arquitetura",
    prompt: "Em uma API de correção, qual desenho reduz vazamento do gabarito?",
    options: ["Enviar todas as respostas em um JSON oculto", "Validar a resposta no servidor e retornar apenas o feedback necessário", "Embaralhar nomes de variáveis", "Adicionar comentários para a IA"],
    answer: 1,
    explanation: "A validação server-side mantém o gabarito fora do código entregue e permite limitar tentativas e telemetria pedagógica.",
  },
];

const cacheHeaders = { "Cache-Control": "no-store, private" };

function difficulty(value: string | null): Difficulty {
  return value === "intermediario" || value === "avancado" ? value : "basico";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const level = difficulty(url.searchParams.get("nivel"));
  const exclude = new Set((url.searchParams.get("excluir") ?? "").split(",").slice(0, 20));
  const candidates = QUESTIONS.filter((q) => q.difficulty === level && !exclude.has(q.id));
  const pool = candidates.length ? candidates : QUESTIONS.filter((q) => q.difficulty === level);
  const question = pool[Math.floor(Math.random() * pool.length)];

  return Response.json(
    {
      id: question.id,
      difficulty: question.difficulty,
      category: question.category,
      prompt: question.prompt,
      options: question.options,
    },
    { headers: cacheHeaders },
  );
}

export async function POST(request: Request) {
  let body: { id?: string; option?: number };
  try {
    body = (await request.json()) as { id?: string; option?: number };
  } catch {
    return Response.json({ error: "Resposta inválida." }, { status: 400, headers: cacheHeaders });
  }

  const question = QUESTIONS.find((item) => item.id === body.id);
  if (!question || !Number.isInteger(body.option) || Number(body.option) < 0 || Number(body.option) > 3) {
    return Response.json({ error: "Questão ou alternativa inválida." }, { status: 400, headers: cacheHeaders });
  }

  const correct = body.option === question.answer;
  return Response.json(
    {
      correct,
      explanation: question.explanation,
      correctOption: correct ? question.answer : undefined,
      xp: correct ? (question.difficulty === "avancado" ? 30 : question.difficulty === "intermediario" ? 20 : 10) : 0,
    },
    { headers: cacheHeaders },
  );
}
