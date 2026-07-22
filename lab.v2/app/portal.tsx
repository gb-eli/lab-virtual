"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Tab = "inicio" | "laboratorios" | "desafios" | "jogos" | "diagnostico" | "seguranca";
type Difficulty = "basico" | "intermediario" | "avancado";
type Question = { id: string; difficulty: Difficulty; category: string; prompt: string; options: string[] };
type ChallengeResult = { correct: boolean; explanation: string; xp: number };
type DiagnosticItem = { label: string; value: string; note?: string };

const NAV: Array<{ id: Tab; label: string; icon: string }> = [
  { id: "inicio", label: "Visão geral", icon: "◫" },
  { id: "laboratorios", label: "Laboratórios", icon: ">_" },
  { id: "desafios", label: "Desafios", icon: "◆" },
  { id: "jogos", label: "Jogos", icon: "✦" },
  { id: "diagnostico", label: "Diagnóstico", icon: "◎" },
  { id: "seguranca", label: "Segurança", icon: "⌾" },
];

const LABS = [
  ["CMD", "Comandos, arquivos e automação Windows", "Terminal", "Básico"],
  ["PowerShell", "Objetos, sistema e administração", "Terminal", "Intermediário"],
  ["Bash + Linux", "Shell, permissões e pipelines", "Terminal", "Intermediário"],
  ["JavaScript", "Execução isolada em Web Worker", "Programação", "Básico"],
  ["Python", "Pyodide isolado e exercícios", "Programação", "Básico"],
  ["Front-end", "HTML, CSS e preview seguro", "Web", "Intermediário"],
  ["SQL", "SQLite, consultas e modelagem", "Dados", "Intermediário"],
  ["Redes", "IP, ping, traceroute e topologias", "Redes", "Intermediário"],
  ["Máquina virtual", "17 perfis de sistemas e instalação", "Sistemas", "Avançado"],
  ["Hardware", "Montagem, energia e compatibilidade", "Hardware", "Intermediário"],
  ["Computação gráfica", "Cores, pixels e contraste", "Gráficos", "Básico"],
  ["Blocos", "Programação visual e sequência lógica", "Lógica", "Básico"],
];

function elapsedLabel(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

function createSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function StatusDot({ tone = "green" }: { tone?: "green" | "amber" | "blue" }) {
  return <span className={`status-dot ${tone}`} aria-hidden="true" />;
}

function SectionHeader({ eyebrow, title, text, action }: { eyebrow: string; title: string; text: string; action?: React.ReactNode }) {
  return (
    <header className="section-header">
      <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2><p>{text}</p></div>
      {action}
    </header>
  );
}

function Metric({ value, label, tone }: { value: string; label: string; tone: string }) {
  return <article className="metric-card"><span className={`metric-icon ${tone}`}><i /></span><div><strong>{value}</strong><small>{label}</small></div></article>;
}

function Overview({ goTo, seconds }: { goTo: (tab: Tab) => void; seconds: number }) {
  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="live-pill"><StatusDot /> Ambiente educacional ativo</span>
          <h1>Aprenda tecnologia<br /><em>experimentando.</em></h1>
          <p>Terminais, programação, redes, hardware, sistemas operacionais, desafios e ferramentas reais — em um espaço controlado e feito para a sala de aula.</p>
          <div className="hero-actions"><button className="button primary" onClick={() => goTo("laboratorios")}>Abrir laboratórios <span>→</span></button><button className="button ghost" onClick={() => goTo("jogos")}>Explorar jogos</button></div>
          <div className="trust-row"><span><StatusDot /> Sem instalação</span><span><StatusDot tone="blue" /> Dados locais</span><span><StatusDot tone="amber" /> Permissões sob controle</span></div>
        </div>
        <div className="hero-visual" aria-label="Visualização tridimensional de um núcleo tecnológico">
          <div className="orbit orbit-one"><i /><i /><i /></div><div className="orbit orbit-two"><i /><i /></div>
          <div className="tech-cube"><div className="cube-face front">{`{ }`}<small>CODE</small></div><div className="cube-face back">01</div><div className="cube-face right">IP</div><div className="cube-face left">SQL</div><div className="cube-face top">DS</div><div className="cube-face bottom">AI</div></div>
          <div className="float-chip chip-a"><span>CPU</span><b>8 threads</b></div><div className="float-chip chip-b"><span>NETWORK</span><b>online</b></div><div className="float-chip chip-c"><span>SESSION</span><b>{elapsedLabel(seconds)}</b></div>
        </div>
      </section>

      <section className="metrics-grid"><Metric value="12" label="laboratórios integrados" tone="violet" /><Metric value="18" label="desafios protegidos" tone="cyan" /><Metric value="5" label="jogos educacionais" tone="orange" /><Metric value="100%" label="controle de permissões" tone="green" /></section>

      <section>
        <SectionHeader eyebrow="ROTAS DE APRENDIZAGEM" title="Escolha como praticar" text="Do primeiro contato ao diagnóstico técnico, cada área registra seu próprio progresso neste navegador." />
        <div className="path-grid">
          <button className="path-card purple" onClick={() => goTo("laboratorios")}><span className="path-number">01</span><div className="path-symbol">&gt;_</div><h3>Laboratórios</h3><p>Use terminais, IDEs, banco de dados, VM e ferramentas gráficas.</p><b>12 ambientes <i>→</i></b></button>
          <button className="path-card cyan" onClick={() => goTo("desafios")}><span className="path-number">02</span><div className="path-symbol">◆</div><h3>Desafios</h3><p>Responda questões graduais com correção no servidor e feedback pedagógico.</p><b>3 níveis <i>→</i></b></button>
          <button className="path-card amber" onClick={() => goTo("jogos")}><span className="path-number">03</span><div className="path-symbol">✦</div><h3>Jogos</h3><p>Treine reflexo, lógica, coordenadas, cores e tomada de decisão.</p><b>5 experiências <i>→</i></b></button>
          <button className="path-card green" onClick={() => goTo("diagnostico")}><span className="path-number">04</span><div className="path-symbol">◎</div><h3>Diagnóstico</h3><p>Descubra o que o navegador pode informar e teste permissões conscientemente.</p><b>dados reais <i>→</i></b></button>
        </div>
      </section>

      <section className="security-banner"><div className="shield-graphic">◇<i /></div><div><span className="eyebrow">SEGURANÇA POR ARQUITETURA</span><h2>O gabarito não viaja com a página.</h2><p>As questões chegam uma por vez e são corrigidas no servidor. No navegador ficam apenas a pergunta atual e o feedback necessário.</p></div><button className="button ghost" onClick={() => goTo("seguranca")}>Entender a proteção</button></section>
    </div>
  );
}

function Labs() {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("Todos");
  const filtered = LABS.filter((lab) => `${lab[0]} ${lab[1]} ${lab[2]}`.toLowerCase().includes(query.toLowerCase()) && (level === "Todos" || lab[3] === level));
  return (
    <div className="page-stack">
      <SectionHeader eyebrow="AMBIENTES ISOLADOS" title="Laboratórios virtuais" text="A versão auditada foi preservada integralmente, incluindo histórico, exportação e estados locais." action={<a className="button primary" href="/lab/index.html">Abrir central completa <span>↗</span></a>} />
      <div className="filter-bar"><label className="search-field"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar laboratório..." /></label><div className="segmented">{["Todos", "Básico", "Intermediário", "Avançado"].map((item) => <button className={level === item ? "active" : ""} key={item} onClick={() => setLevel(item)}>{item}</button>)}</div></div>
      <div className="lab-grid">{filtered.map((lab, index) => <a className="lab-card" href="/lab/index.html" key={lab[0]}><span className={`lab-glyph g${index % 6}`}>{[">_", "PS", "$_", "JS", "PY", "<>", "DB", "IP", "VM", "HW", "RGB", "◫"][index]}</span><div><small>{lab[2]} · {lab[3]}</small><h3>{lab[0]}</h3><p>{lab[1]}</p></div><b>abrir <span>→</span></b></a>)}</div>
      <article className="legacy-note"><span>✓</span><div><h3>Base v5.1 validada</h3><p>112 identificadores únicos, 17 perfis de SO, CSP, PWA, Workers, IndexedDB, exportação TXT/PDF/JSON/ZIP e testes automatizados preservados.</p></div></article>
    </div>
  );
}

function Challenges() {
  const [level, setLevel] = useState<Difficulty>("basico");
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [seen, setSeen] = useState<string[]>([]);

  const next = useCallback(async (newLevel = level) => {
    setLoading(true); setSelected(null); setResult(null);
    try {
      const response = await fetch(`/api/challenge?nivel=${newLevel}&excluir=${seen.join(",")}`, { cache: "no-store" });
      const data = await response.json() as Question;
      setQuestion(data); setSeen((old) => [...old.slice(-10), data.id]);
    } finally { setLoading(false); }
  }, [level, seen]);

  useEffect(() => { const timer = window.setTimeout(() => void next(level), 0); return () => window.clearTimeout(timer); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function answer(index: number) {
    if (!question || result) return;
    setSelected(index); setLoading(true);
    try {
      const response = await fetch("/api/challenge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: question.id, option: index }) });
      const data = await response.json() as ChallengeResult;
      setResult(data); setAnswered((v) => v + 1); setXp((v) => v + data.xp); setStreak((v) => data.correct ? v + 1 : 0);
    } finally { setLoading(false); }
  }

  function changeLevel(value: Difficulty) { setLevel(value); setSeen([]); void next(value); }

  return (
    <div className="page-stack challenge-page">
      <SectionHeader eyebrow="AVALIAÇÃO FORMATIVA" title="Desafios protegidos" text="Níveis progressivos, alternativas plausíveis e explicação após cada tentativa. O gabarito permanece no servidor." />
      <div className="challenge-stats"><div><span>XP acumulado</span><strong>{xp}</strong></div><div><span>Sequência</span><strong>{streak} 🔥</strong></div><div><span>Respondidas</span><strong>{answered}</strong></div><div className="level-pick"><span>Nível</span><select value={level} onChange={(e) => changeLevel(e.target.value as Difficulty)}><option value="basico">Básico</option><option value="intermediario">Intermediário</option><option value="avancado">Avançado</option></select></div></div>
      <section className="question-shell">
        <div className="question-progress"><span style={{ width: `${Math.min(100, (answered % 6) * 16.66 + 16.66)}%` }} /></div>
        {loading && !question ? <div className="loading-card">Preparando desafio…</div> : question && <>
          <div className="question-meta"><span>{question.category}</span><small>{question.difficulty}</small></div><h2>{question.prompt}</h2>
          <div className="options-grid">{question.options.map((option, index) => <button disabled={Boolean(result) || loading} onClick={() => answer(index)} className={`${selected === index ? "selected" : ""} ${result && selected === index ? (result.correct ? "correct" : "wrong") : ""}`} key={option}><span>{String.fromCharCode(65 + index)}</span>{option}</button>)}</div>
          {result && <div className={`feedback ${result.correct ? "success" : "error"}`}><strong>{result.correct ? `Correto! +${result.xp} XP` : "Ainda não. Observe o conceito:"}</strong><p>{result.explanation}</p><button className="button primary" onClick={() => void next()}>Próximo desafio →</button></div>}
        </>}
      </section>
      <div className="protection-strip"><span>◈</span><div><b>Correção server-side</b><small>O HTML não contém banco completo nem respostas. Inspecionar a página mostra somente a questão em uso.</small></div><span>◈</span><div><b>Feedback mínimo</b><small>A API devolve somente o necessário para a tentativa atual, com cache desativado.</small></div></div>
    </div>
  );
}

function RunnerGame({ mode }: { mode: "dino" | "moto" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const bestKey = `labtech.best.${mode}`;
  const [best, setBest] = useState(0);
  const jumpRef = useRef(false);

  useEffect(() => { const timer = window.setTimeout(() => setBest(Number(localStorage.getItem(bestKey) ?? 0)), 0); return () => window.clearTimeout(timer); }, [bestKey]);
  useEffect(() => {
    if (!running) return;
    const canvas = canvasRef.current!; const ctx = canvas.getContext("2d")!;
    let frame = 0, y = 0, velocity = 0, obstacleX = canvas.width + 40, raf = 0, current = 0;
    const ground = canvas.height - 38;
    const draw = () => {
      frame++; current = Math.floor(frame / 6); setScore(current);
      if (jumpRef.current && y === 0) { velocity = mode === "dino" ? 11 : 9; jumpRef.current = false; }
      velocity -= .62; y = Math.max(0, y + velocity); if (y === 0) velocity = 0;
      obstacleX -= 5 + Math.min(5, current / 80); if (obstacleX < -30) obstacleX = canvas.width + 80 + Math.random() * 180;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height); grad.addColorStop(0, "#111b34"); grad.addColorStop(1, "#08101f"); ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "rgba(107,233,255,.18)"; for (let x = -(frame % 32); x < canvas.width; x += 32) { ctx.beginPath(); ctx.moveTo(x, ground); ctx.lineTo(x + 12, canvas.height); ctx.stroke(); }
      ctx.fillStyle = "#7585ff"; ctx.fillRect(0, ground, canvas.width, 3);
      const px = 64, py = ground - 32 - y;
      ctx.fillStyle = mode === "dino" ? "#c7ff4a" : "#ffb347";
      if (mode === "dino") { ctx.fillRect(px, py, 30, 27); ctx.fillRect(px + 21, py - 10, 19, 17); ctx.fillRect(px - 8, py + 16, 12, 7); ctx.fillStyle = "#07101e"; ctx.fillRect(px + 32, py - 6, 3, 3); }
      else { ctx.beginPath(); ctx.arc(px + 7, py + 27, 8, 0, Math.PI * 2); ctx.arc(px + 35, py + 27, 8, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = "#ffb347"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(px + 7, py + 27); ctx.lineTo(px + 19, py + 10); ctx.lineTo(px + 35, py + 27); ctx.stroke(); }
      ctx.fillStyle = "#ff5f7c"; ctx.fillRect(obstacleX, ground - 30, 23, 30); ctx.fillStyle = "rgba(255,95,124,.25)"; ctx.fillRect(obstacleX - 7, ground - 37, 37, 37);
      if (obstacleX < px + 39 && obstacleX + 23 > px && ground - 30 < py + 31) { setRunning(false); const nextBest = Math.max(best, current); setBest(nextBest); localStorage.setItem(bestKey, String(nextBest)); return; }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw); return () => cancelAnimationFrame(raf);
  }, [running, mode, best, bestKey]);

  return <div className="runner"><div className="game-hud"><span>Pontos <b>{score}</b></span><span>Recorde <b>{best}</b></span></div><canvas ref={canvasRef} width={720} height={260} onPointerDown={() => running && (jumpRef.current = true)} aria-label="Área do jogo de corrida" /><div className="game-controls"><button className="button primary" onClick={() => { setScore(0); setRunning(true); }}>{running ? "Reiniciar" : "Começar"}</button><button className="button ghost" onClick={() => jumpRef.current = true} disabled={!running}>Pular · espaço/clique</button></div></div>;
}

function HiddenPointGame() {
  const [point, setPoint] = useState({ x: 44, y: 61 });
  const [hint, setHint] = useState("Clique na área para localizar o ponto invisível.");
  const [attempts, setAttempts] = useState(0);
  function guess(e: React.PointerEvent<HTMLDivElement>) { const r = e.currentTarget.getBoundingClientRect(); const x = ((e.clientX - r.left) / r.width) * 100, y = ((e.clientY - r.top) / r.height) * 100; const d = Math.hypot(x - point.x, y - point.y); setAttempts((v) => v + 1); if (d < 5) { setHint(`Encontrado em ${attempts + 1} tentativa(s)! Novo ponto gerado.`); setPoint({ x: 15 + Math.random() * 70, y: 15 + Math.random() * 70 }); setAttempts(0); } else setHint(d < 14 ? "Muito quente!" : d < 28 ? "Quente." : d < 45 ? "Morno." : "Frio. Tente outra região."); }
  return <div className="hidden-game"><div className="hidden-stage" onPointerDown={guess}><span className="crosshair x" /><span className="crosshair y" /><i style={{ left: `${point.x}%`, top: `${point.y}%` }} /></div><div className="game-message"><strong>{hint}</strong><span>Tentativas: {attempts}</span></div></div>;
}

function ColorGame() {
  const createRound = () => { const rgb = [0, 0, 0].map(() => Math.floor(Math.random() * 256)); const answer = `#${rgb.map((n) => n.toString(16).padStart(2, "0")).join("").toUpperCase()}`; const options = new Set([answer]); while (options.size < 4) options.add(`#${[0, 0, 0].map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("").toUpperCase()}`); return { answer, options: [...options].sort(() => Math.random() - .5) }; };
  const [round, setRound] = useState(createRound); const [message, setMessage] = useState("Qual código representa esta cor?");
  function choose(value: string) { if (value === round.answer) { setMessage("Acertou! Nova cor carregada."); setTimeout(() => { setRound(createRound()); setMessage("Qual código representa esta cor?"); }, 650); } else setMessage("Não é essa. Compare luminosidade e proporção de RGB."); }
  return <div className="color-game"><div className="color-target" style={{ background: round.answer }}><span>?</span></div><strong>{message}</strong><div className="color-options">{round.options.map((value) => <button key={value} onClick={() => choose(value)}>{value}</button>)}</div></div>;
}

function RandomGame() {
  const prompts = ["Crie um algoritmo com exatamente uma repetição.", "Explique DNS em 20 segundos.", "Converta 42 para binário.", "Encontre três sinais de phishing.", "Desenhe uma rede com roteador e dois clientes.", "Escreva uma função que valide número par."];
  const [text, setText] = useState("Gire para receber uma missão aleatória."); const [spin, setSpin] = useState(false);
  return <div className="random-game"><div className={`random-wheel ${spin ? "spinning" : ""}`}><span>JS</span><span>IP</span><span>SQL</span><span>UX</span><b>?</b></div><h3>{text}</h3><button className="button primary" onClick={() => { setSpin(true); setTimeout(() => { setText(prompts[Math.floor(Math.random() * prompts.length)]); setSpin(false); }, 700); }}>Sortear missão</button></div>;
}

function Games() {
  const [game, setGame] = useState("dino");
  const games = [{ id: "dino", title: "Corrida Dino", text: "Reflexo e progressão", icon: "▰" }, { id: "moto", title: "Rota Moto", text: "Tempo e obstáculos", icon: "◉" }, { id: "point", title: "Ponto oculto", text: "Coordenadas e distância", icon: "⌖" }, { id: "color", title: "Adivinhe a cor", text: "HEX e percepção RGB", icon: "◐" }, { id: "random", title: "Missão aleatória", text: "Criatividade sob restrição", icon: "✦" }];
  return <div className="page-stack"><SectionHeader eyebrow="APRENDER JOGANDO" title="Arcade de tecnologia" text="Mecânicas originais inspiradas em jogos clássicos, sem marcas ou recursos proprietários." /><div className="game-picker">{games.map((item) => <button key={item.id} onClick={() => setGame(item.id)} className={game === item.id ? "active" : ""}><span>{item.icon}</span><div><b>{item.title}</b><small>{item.text}</small></div></button>)}</div><section className="game-stage-shell"><div className="stage-head"><div><span>JOGO ATIVO</span><h2>{games.find((item) => item.id === game)?.title}</h2></div><small>Progresso salvo somente neste navegador</small></div>{game === "dino" && <RunnerGame mode="dino" />}{game === "moto" && <RunnerGame mode="moto" />}{game === "point" && <HiddenPointGame />}{game === "color" && <ColorGame />}{game === "random" && <RandomGame />}</section></div>;
}

function Diagnostics({ sessionId, seconds, loginAt }: { sessionId: string; seconds: number; loginAt: Date }) {
  const [items, setItems] = useState<DiagnosticItem[]>([]); const [ip, setIp] = useState("Não consultado"); const [location, setLocation] = useState("Não solicitada"); const [media, setMedia] = useState("Não testados"); const [speed, setSpeed] = useState("Não medido"); const [busy, setBusy] = useState(""); const videoRef = useRef<HTMLVideoElement>(null); const activeStream = useRef<MediaStream | null>(null);
  function stopMedia() { activeStream.current?.getTracks().forEach((track) => track.stop()); activeStream.current = null; if (videoRef.current) videoRef.current.srcObject = null; }
  useEffect(() => stopMedia, []);
  async function basicScan() {
    setBusy("scan"); const nav = navigator as Navigator & { deviceMemory?: number; connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean }; getBattery?: () => Promise<{ level: number; charging: boolean }> };
    const connection = nav.connection; const result: DiagnosticItem[] = [
      { label: "Navegador", value: nav.userAgent }, { label: "Plataforma declarada", value: nav.platform || "Não informada", note: "Pode ser reduzida pelo navegador." }, { label: "Processadores lógicos", value: String(nav.hardwareConcurrency || "Não informado") }, { label: "Memória aproximada", value: nav.deviceMemory ? `${nav.deviceMemory} GB` : "API indisponível", note: "Valor arredondado para proteger privacidade." }, { label: "Tela", value: `${screen.width} × ${screen.height} · ${screen.colorDepth} bits` }, { label: "Janela", value: `${innerWidth} × ${innerHeight} · DPR ${devicePixelRatio}` }, { label: "Idioma e fuso", value: `${nav.language} · ${Intl.DateTimeFormat().resolvedOptions().timeZone}` }, { label: "Toque", value: `${nav.maxTouchPoints || 0} ponto(s)` }, { label: "Conexão estimada", value: connection ? `${connection.effectiveType ?? "?"} · ${connection.downlink ?? "?"} Mb/s · RTT ${connection.rtt ?? "?"} ms` : "API indisponível" }, { label: "Cookies", value: nav.cookieEnabled ? "Habilitados" : "Desabilitados" }, { label: "Sessão local", value: sessionId },
    ];
    try { const estimate = await nav.storage?.estimate(); if (estimate) result.push({ label: "Armazenamento do site", value: `${((estimate.usage ?? 0) / 1048576).toFixed(1)} MB usados de ${((estimate.quota ?? 0) / 1073741824).toFixed(1)} GB` }); } catch { /* feature unavailable */ }
    try { const battery = await nav.getBattery?.(); if (battery) result.push({ label: "Bateria", value: `${Math.round(battery.level * 100)}% · ${battery.charging ? "carregando" : "em uso"}` }); } catch { /* feature unavailable */ }
    try { const canvas = document.createElement("canvas"); const gl = canvas.getContext("webgl"); const ext = gl?.getExtension("WEBGL_debug_renderer_info"); const gpu = gl && ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : null; result.push({ label: "GPU/WebGL", value: gpu || (gl ? "WebGL disponível; modelo oculto" : "WebGL indisponível") }); } catch { /* feature unavailable */ }
    setItems(result); setBusy("");
  }
  async function publicIp() { setBusy("ip"); try { const r = await fetch("/api/network/ip", { cache: "no-store" }); const d = await r.json() as { ip?: string; country?: string }; setIp(d.ip ? `${d.ip}${d.country ? ` · ${d.country}` : ""}` : "Indisponível neste ambiente"); } catch { setIp("Falha na consulta"); } setBusy(""); }
  function geolocate() { setBusy("geo"); navigator.geolocation?.getCurrentPosition((pos) => { setLocation(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)} · precisão ±${Math.round(pos.coords.accuracy)} m`); setBusy(""); }, (err) => { setLocation(`Não concedida: ${err.message}`); setBusy(""); }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }); }
  async function testMedia(kind: "camera" | "microfone") { stopMedia(); setBusy(kind); try { const stream = await navigator.mediaDevices.getUserMedia(kind === "camera" ? { video: true, audio: false } : { audio: true, video: false }); activeStream.current = stream; setMedia(`${kind === "camera" ? "Câmera" : "Microfone"} autorizado · ${stream.getTracks().length} faixa(s) ativa(s)`); if (kind === "camera" && videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); } if (kind === "microfone") setTimeout(stopMedia, 1500); } catch (error) { setMedia(`Não autorizado: ${error instanceof Error ? error.message : "erro"}`); } setBusy(""); }
  async function shareScreen() { stopMedia(); setBusy("screen"); try { const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false }); activeStream.current = stream; setMedia("Compartilhamento autorizado; prévia local ativa."); if (videoRef.current) { videoRef.current.srcObject = stream; await videoRef.current.play(); } stream.getVideoTracks()[0]?.addEventListener("ended", () => { setMedia("Compartilhamento encerrado."); stopMedia(); }); } catch (error) { setMedia(`Não autorizado: ${error instanceof Error ? error.message : "erro"}`); } setBusy(""); }
  async function testSpeed() { setBusy("speed"); try { const start = performance.now(); const r = await fetch(`/api/network/speed?bytes=524288&t=${Date.now()}`, { cache: "no-store" }); const bytes = (await r.arrayBuffer()).byteLength; const duration = (performance.now() - start) / 1000; setSpeed(`${((bytes * 8) / duration / 1_000_000).toFixed(2)} Mb/s · ${(duration * 1000).toFixed(0)} ms para ${(bytes / 1024).toFixed(0)} KB`); } catch { setSpeed("Medição indisponível"); } setBusy(""); }
  return <div className="page-stack"><SectionHeader eyebrow="TRANSPARÊNCIA DE DADOS" title="Diagnóstico do dispositivo" text="Cada teste mostra o que será acessado. Dados de câmera, microfone, tela e localização não são armazenados nem enviados por esta interface." /><div className="consent-banner"><span>i</span><div><b>Você está no controle</b><p>O navegador exibirá uma confirmação própria para recursos sensíveis. Negar uma permissão não prejudica os demais laboratórios.</p></div></div><section className="diag-overview"><div><span>ID da sessão</span><code>{sessionId}</code></div><div><span>Início</span><strong>{loginAt.toLocaleTimeString("pt-BR")}</strong></div><div><span>Tempo de uso</span><strong>{elapsedLabel(seconds)}</strong></div><div><span>IP público</span><strong>{ip}</strong></div></section><div className="permission-grid"><button onClick={basicScan}><span>◫</span><b>Informações básicas</b><small>Sem solicitar permissão</small><i>{busy === "scan" ? "lendo…" : "Executar"}</i></button><button onClick={publicIp}><span>IP</span><b>IP público</b><small>Consultado no servidor</small><i>{busy === "ip" ? "consultando…" : "Consultar"}</i></button><button onClick={geolocate}><span>⌖</span><b>Localização</b><small>Exige sua autorização</small><i>{busy === "geo" ? "aguardando…" : "Solicitar"}</i></button><button onClick={() => void testMedia("camera")}><span>◉</span><b>Câmera</b><small>Prévia somente local</small><i>{busy === "camera" ? "aguardando…" : "Testar"}</i></button><button onClick={() => void testMedia("microfone")}><span>◌</span><b>Microfone</b><small>Ativado por 1,5 segundo</small><i>{busy === "microfone" ? "aguardando…" : "Testar"}</i></button><button onClick={() => void shareScreen()}><span>▣</span><b>Compartilhar tela</b><small>Você escolhe a janela</small><i>{busy === "screen" ? "aguardando…" : "Testar"}</i></button><button onClick={testSpeed}><span>↯</span><b>Velocidade</b><small>Amostra de 512 KB</small><i>{busy === "speed" ? "medindo…" : "Medir"}</i></button></div><div className="media-row"><div className="media-preview"><video ref={videoRef} muted playsInline /><span>{media}</span><button onClick={stopMedia}>Encerrar mídia</button></div><div className="live-results"><div><span>Localização</span><strong>{location}</strong></div><div><span>Rede medida</span><strong>{speed}</strong></div></div></div>{items.length > 0 && <section><SectionHeader eyebrow="RESULTADOS LOCAIS" title="O que o navegador revelou" text="Nem toda API está disponível em todos os navegadores; valores reduzidos são comportamento de privacidade esperado." /><div className="diagnostic-results">{items.map((item) => <article key={item.label}><span>{item.label}</span><strong>{item.value}</strong>{item.note && <small>{item.note}</small>}</article>)}</div></section>}</div>;
}

function SecurityLab() {
  const [url, setUrl] = useState("https://conta-exemplo.com/entrar"); const [analysis, setAnalysis] = useState<string[]>([]); const [domain, setDomain] = useState("openai.com"); const [dnsType, setDnsType] = useState("A"); const [domainResult, setDomainResult] = useState<unknown>(null); const [loading, setLoading] = useState(false);
  function analyze() { const flags: string[] = []; try { const parsed = new URL(url.includes("://") ? url : `https://${url}`); if (parsed.protocol !== "https:") flags.push("A conexão não usa HTTPS."); if (/^\d{1,3}(\.\d{1,3}){3}$/.test(parsed.hostname)) flags.push("O endereço usa um IP no lugar de um domínio."); if (parsed.username || parsed.password || url.includes("@")) flags.push("Há um símbolo @ ou credencial embutida, que pode esconder o destino real."); if (parsed.hostname.startsWith("xn--")) flags.push("O domínio usa Punycode; confira se os caracteres imitam outra marca."); if (parsed.hostname.split(".").length > 4) flags.push("Há muitos subdomínios; leia o domínio da direita para a esquerda."); if (/(login|conta|segur|atualiz|verific|premio|suporte)/i.test(parsed.hostname)) flags.push("O domínio usa palavras de urgência ou confiança; isso não prova legitimidade."); if (url.length > 120) flags.push("O endereço é muito longo e merece inspeção cuidadosa."); if (!flags.length) flags.push("Nenhum sinal óbvio foi detectado, mas isso não comprova que o site seja seguro."); } catch { flags.push("O texto não forma um endereço válido."); } setAnalysis(flags); }
  async function lookup(mode: "dns" | "rdap") { setLoading(true); setDomainResult(null); try { const r = await fetch(`/api/network/domain?domain=${encodeURIComponent(domain)}&mode=${mode}&type=${dnsType}`, { cache: "no-store" }); setDomainResult(await r.json()); } catch { setDomainResult({ error: "Consulta indisponível." }); } setLoading(false); }
  return <div className="page-stack"><SectionHeader eyebrow="CIBERSEGURANÇA DEFENSIVA" title="Links, DNS e registro de domínio" text="Ferramentas de verificação para fins educacionais. O simulador não coleta senhas nem envia formulários." /><div className="security-grid"><section className="security-tool"><div className="tool-title"><span>01</span><div><h3>Analisador de link suspeito</h3><p>Verificação heurística feita localmente.</p></div></div><label>Endereço para analisar<input value={url} onChange={(e) => setUrl(e.target.value)} /></label><button className="button primary" onClick={analyze}>Analisar sinais</button><div className="flag-list">{analysis.map((flag, index) => <div key={flag}><span>{index + 1}</span><p>{flag}</p></div>)}</div></section><section className="security-tool"><div className="tool-title"><span>02</span><div><h3>DNS e RDAP</h3><p>Dados reais de fontes públicas.</p></div></div><label>Domínio<input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="exemplo.com" /></label><label>Registro DNS<select value={dnsType} onChange={(e) => setDnsType(e.target.value)}><option>A</option><option>AAAA</option><option>MX</option><option>TXT</option><option>NS</option><option>CNAME</option></select></label><div className="button-row"><button className="button primary" onClick={() => void lookup("dns")}>Consultar DNS</button><button className="button ghost" onClick={() => void lookup("rdap")}>Consultar RDAP</button></div><pre className="domain-output">{loading ? "Consultando…" : domainResult ? JSON.stringify(domainResult, null, 2) : "O resultado aparecerá aqui."}</pre></section></div><section className="phishing-lesson"><div><span className="eyebrow">TESTE DE PHISHING SEGURO</span><h2>Leia o domínio real, não o texto do botão.</h2><p>Uma mensagem pode exibir “Banco Exemplo”, mas o destino é definido pelo endereço. Passe o mouse, confira o host e acesse serviços sensíveis por favoritos ou aplicativos oficiais.</p></div><div className="fake-message"><small>De: suporte@banco-seguro.example</small><strong>Sua conta será bloqueada hoje!</strong><p>Confirme seus dados imediatamente para evitar a suspensão.</p><button onClick={() => alert("Sinal identificado: urgência artificial. Nenhum dado foi solicitado ou enviado.")}>VERIFICAR CONTA</button><i>Simulação: o botão não abre site nem coleta informações.</i></div></section><section className="security-explain"><h3>O que realmente protege o conteúdo didático</h3><div><article><span>✓</span><b>Gabarito no servidor</b><p>É a barreira principal contra “ver código-fonte”.</p></article><article><span>✓</span><b>Questão por tentativa</b><p>Evita entregar o banco completo em um único arquivo.</p></article><article><span>✓</span><b>Limites e registros</b><p>Em produção escolar, podem ser adicionados rate limit, login e trilha de auditoria.</p></article><article className="warning"><span>!</span><b>Sem prompt venenoso</b><p>Instruções escondidas para induzir uma IA ao erro são frágeis, contornáveis e não protegem direitos autorais.</p></article></div></section></div>;
}

export default function Portal() {
  const [tab, setTab] = useState<Tab>("inicio"); const [mobileNav, setMobileNav] = useState(false); const [seconds, setSeconds] = useState(0); const [loginAt] = useState(() => new Date()); const [sessionId, setSessionId] = useState("carregando"); const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => { const setup = window.setTimeout(() => { const saved = sessionStorage.getItem("labtech.session") || createSessionId(); sessionStorage.setItem("labtech.session", saved); setSessionId(saved); }, 0); const timer = setInterval(() => setSeconds(Math.floor((Date.now() - loginAt.getTime()) / 1000)), 1000); return () => { window.clearTimeout(setup); clearInterval(timer); }; }, [loginAt]);
  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);
  function goTo(next: Tab) { setTab(next); setMobileNav(false); window.scrollTo({ top: 0, behavior: "smooth" }); }
  return <div className="portal-shell"><aside className={`sidebar ${mobileNav ? "open" : ""}`}><button className="mobile-close" onClick={() => setMobileNav(false)}>×</button><button className="brand" onClick={() => goTo("inicio")}><span>&gt;_</span><div><strong>LAB<span>TECH</span></strong><small>AMBIENTE VIRTUAL</small></div></button><nav aria-label="Navegação principal">{NAV.map((item) => <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => goTo(item.id)}><span>{item.icon}</span>{item.label}{item.id === "jogos" && <i>NOVO</i>}</button>)}</nav><div className="sidebar-card"><span><StatusDot /> SISTEMA ATIVO</span><strong>{elapsedLabel(seconds)}</strong><small>Sessão local</small></div><footer><button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? "☼ Tema claro" : "◐ Tema escuro"}</button><small>v6.0 · ambiente educacional</small></footer></aside><div className="main-column"><header className="topbar"><button className="menu-button" onClick={() => setMobileNav(true)}>☰</button><div className="breadcrumb"><span>LABTECH</span><i>/</i><strong>{NAV.find((item) => item.id === tab)?.label}</strong></div><div className="top-actions"><span className="privacy-state"><StatusDot /> Dados locais</span><a href="/lab/index.html">Modo clássico ↗</a><button className="avatar" title="Sessão anônima">AL</button></div></header><main className="content">{tab === "inicio" && <Overview goTo={goTo} seconds={seconds} />}{tab === "laboratorios" && <Labs />}{tab === "desafios" && <Challenges />}{tab === "jogos" && <Games />}{tab === "diagnostico" && <Diagnostics sessionId={sessionId} seconds={seconds} loginAt={loginAt} />}{tab === "seguranca" && <SecurityLab />}</main><footer className="site-footer"><span>LABTECH · Laboratório Virtual de Tecnologia</span><span>Privacidade por padrão · permissões somente sob ação do usuário</span></footer></div>{mobileNav && <button className="nav-backdrop" onClick={() => setMobileNav(false)} aria-label="Fechar menu" />}</div>;
}
