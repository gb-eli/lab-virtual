import { ROUTE_PEPPER } from "./config.js";

export function normalize(text) {
  return text
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function words(text) {
  return normalize(text).split(" ").filter(word => word.length >= 3);
}

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function routeCandidates(question, routes, limit = 3) {
  const unique = [...new Set(words(question))];
  const hashes = await Promise.all(unique.map(async token => (await sha256Hex(ROUTE_PEPPER + token)).slice(0, 20)));
  const hashSet = new Set(hashes);

  return routes
    .map(route => ({
      route,
      score: route.fingerprints.reduce((sum, value) => sum + (hashSet.has(value) ? 1 : 0), 0)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || b.route.weight - a.route.weight)
    .slice(0, limit);
}

export function similarity(question, entry) {
  const query = new Set(words(question));
  const corpus = new Set(words([
    entry.topic,
    entry.area,
    entry.language,
    ...(entry.aliases || []),
    ...(entry.keywords || [])
  ].join(" ")));

  if (!query.size || !corpus.size) return 0;
  let intersection = 0;
  query.forEach(word => { if (corpus.has(word)) intersection += 1; });
  return intersection / Math.sqrt(query.size * corpus.size);
}

export function isContinuation(question) {
  return /\b(isso|exemplo|outra forma|mais facil|mais fácil|detalhe|continue|ainda nao|ainda não|passo a passo)\b/i.test(question);
}
