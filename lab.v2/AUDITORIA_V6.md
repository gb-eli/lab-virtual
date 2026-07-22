# Auditoria e evolução — LABTECH v6.0

Data: 22/07/2026  
Base recebida: Laboratório Virtual DS v5.1  
Resultado: portal educacional integrado, mantendo a central v5.1 em `/lab/index.html`

## 1. O que já existia e foi preservado

A base recebida já possuía arquitetura modular e cobertura funcional relevante:

- 12 áreas de laboratório e 17 perfis de sistemas operacionais;
- CMD, PowerShell, Bash, Linux e macOS simulados;
- sistema de arquivos virtual, rede, ping e traceroute;
- JavaScript e Python em Web Workers;
- SQLite, front-end em iframe sandboxado, hardware, VM e gráficos;
- sessão identificada, histórico, IndexedDB e armazenamento local;
- exportações TXT, PDF, JSON e ZIP com SHA-256;
- CSP, PWA, Service Worker e testes automatizados.

Os testes originais passaram integralmente antes da integração.

## 2. Riscos e conclusões de segurança

### 2.1 Criptografar perguntas no navegador não resolve o problema principal

Se o navegador consegue descriptografar uma pergunta ou resposta, ele também recebeu a chave ou os dados necessários para fazê-lo. Um aluno determinado pode observar memória, requisições ou execução em tempo real. Minificação, Base64, nomes embaralhados e bloqueio do botão direito aumentam apenas o esforço de cópia casual.

### 2.2 Proteção implementada

- banco de questões armazenado apenas no código executado no servidor;
- entrega de uma questão por requisição;
- resposta correta ausente do JSON entregue ao navegador;
- validação server-side da alternativa;
- `Cache-Control: no-store, private` nas questões e correções;
- validação de identificador e alternativa;
- cabeçalhos `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, COOP e HSTS em HTTPS;
- rotas externas com destino fixo e domínio validado, reduzindo risco de SSRF;
- limite de 1 MB no teste de velocidade.

### 2.3 Instruções escondidas para enganar IA

Não foram implementadas. Prompt injection defensivo dentro do código não garante que outra IA obedecerá, pode ser removido facilmente e não protege direitos autorais. A solução adotada é arquitetural: não entregar o gabarito.

### 2.4 Próxima camada recomendada para uso avaliativo formal

Para provas com nota, ainda devem ser adicionados login institucional, rate limit por estudante, embaralhamento por sessão assinado, janela de aplicação, tentativas persistidas no servidor e painel do professor. Nenhum sistema consegue impedir que um estudante fotografe ou redigite uma pergunta já exibida.

## 3. Melhorias implementadas

### Portal, UX e UI

- nova navegação lateral com seis áreas;
- tema escuro/claro;
- hero com núcleo 3D em CSS, órbitas e dados ao vivo;
- responsividade para desktop, tablet e celular;
- animações com respeito a `prefers-reduced-motion`;
- filtros e busca dos laboratórios;
- textos em português e linguagem pedagógica direta;
- integração com a central clássica v5.1.

### Desafios

- 18 questões em níveis básico, intermediário e avançado;
- categorias de lógica, JavaScript, Web, SQL, redes, segurança, hardware e arquitetura;
- alternativas plausíveis, explicações conceituais, XP e sequência;
- correção no servidor sem exposição do gabarito no HTML.

### Jogos

- Corrida Dino original, sem uso de marca ou ativos do Google;
- Rota Moto;
- Ponto oculto para coordenadas e distância;
- Adivinhe a cor em HEX/RGB;
- Missão aleatória de programação e tecnologia;
- recordes locais e desenho em Canvas.

### Diagnóstico com consentimento

- ID aleatório da sessão, horário de entrada e tempo de uso;
- navegador, plataforma declarada, tela, janela, idiomas, fuso, toque e cookies;
- núcleos lógicos, memória aproximada, armazenamento, bateria, WebGL/GPU e conexão quando as APIs existem;
- IP observado pelo servidor sob ação explícita;
- teste de velocidade com amostra indicada;
- botões separados para localização, câmera, microfone e compartilhamento de tela;
- encerramento das faixas de mídia e ausência de gravação/upload.

### Segurança e rede

- analisador heurístico local de URL suspeita;
- simulação de phishing sem coleta de credenciais;
- DNS real por DoH para A, AAAA, MX, TXT, NS e CNAME;
- consulta RDAP, sucessora do WHOIS para gTLDs, mostrando somente dados técnicos públicos selecionados;
- mensagens de falha controladas quando a fonte externa está indisponível.

## 4. Verificações realizadas

- lint do portal: sem erros;
- build Vinext/Cloudflare: aprovado;
- artefato de produção: aprovado;
- teste renderizado do starter: aprovado;
- GET de desafio: retorna apenas `id`, nível, categoria, enunciado e alternativas;
- alternativa inválida: HTTP 400;
- cabeçalhos de segurança presentes;
- QA visual no navegador da página inicial;
- desafio carregado e corrigido com XP;
- jogo iniciou e pontuou;
- diagnóstico básico exibiu 12 itens sem pedir permissão;
- IP local foi lido no ambiente de preview;
- central clássica carregou com CSS, imagem e catálogo;
- incompatibilidade com `crypto.randomUUID` detectada no QA e corrigida com fallback seguro.

## 5. Limitações conhecidas

- o preview local bloqueou acesso externo ao Google DoH; a interface tratou a falha e a rota está preparada para execução hospedada;
- APIs de memória, bateria, conexão, GPU e plataforma variam por navegador e podem reduzir precisão para proteger a privacidade;
- câmera, microfone, localização e compartilhamento dependem de HTTPS, suporte do navegador e autorização do usuário;
- o teste de velocidade mede a rota até esta aplicação com uma amostra pequena; não substitui teste laboratorial de banda;
- DNS/RDAP e heurísticas de URL não certificam que um domínio seja seguro;
- as quatro advertências de lint restantes pertencem à base v5.1 preservada e não impedem o build.

## 6. Fontes técnicas de referência

- MDN — `hardwareConcurrency`, `deviceMemory`, `getBattery`, `MediaDevices`, Permissions API e Network Information API;
- Google Public DNS — JSON API DNS over HTTPS;
- ICANN — RDAP e transição do WHOIS para RDAP em gTLDs.
