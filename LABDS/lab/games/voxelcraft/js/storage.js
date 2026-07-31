const DB = 'voxelcraft-ds';
const STORE = 'worlds';
const KEY = 'slot-1';
const SETTINGS_KEY = 'voxelcraft-ds.settings.v9';
const MAX_EDITS = 15000;
const ITEM_NAMES = new Set(['HTML','CSS','JavaScript','Madeira','Pedra','Maçã']);
const QUALITY = new Set(['auto','economy','low','medium','high','ultra']);
const MODES = new Set(['learning','free','challenge']);

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
}

function sanitizeItems(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 12).flatMap(item => {
    if (!item || !ITEM_NAMES.has(String(item.name))) return [];
    return [{ name: String(item.name), count: Math.round(clampNumber(item.count, 0, 999, 0)) }];
  });
}

function sanitizeEdits(edits) {
  if (!Array.isArray(edits)) return [];
  const result = [];
  const keyPattern = /^-?\d{1,5},-?\d{1,4},-?\d{1,5}$/;
  for (const entry of edits.slice(0, MAX_EDITS)) {
    if (!Array.isArray(entry) || entry.length !== 2) continue;
    const key = String(entry[0] || '');
    const value = entry[1];
    if (!keyPattern.test(key)) continue;
    if (value !== null && (!Number.isInteger(value) || value < 0 || value > 8)) continue;
    result.push([key, value]);
  }
  return result;
}

export function sanitizeWorld(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const player = input.player && typeof input.player === 'object' ? input.player : {};
  const stats = input.stats && typeof input.stats === 'object' ? input.stats : {};
  return {
    version: 9,
    quality: QUALITY.has(input.quality) ? input.quality : 'auto',
    mode: MODES.has(input.mode) ? input.mode : 'learning',
    player: {
      x: clampNumber(player.x, -100000, 100000, 0),
      y: clampNumber(player.y, -1000, 2000, 11),
      z: clampNumber(player.z, -100000, 100000, 5),
      health: clampNumber(player.health, 0, 100, 100),
      hunger: clampNumber(player.hunger, 0, 100, 100)
    },
    stats: {
      xp: Math.round(clampNumber(stats.xp, 0, 999999, 0)),
      broken: Math.round(clampNumber(stats.broken, 0, 999999, 0)),
      placed: Math.round(clampNumber(stats.placed, 0, 999999, 0)),
      distance: clampNumber(stats.distance, 0, 9999999, 0),
      collected: Math.round(clampNumber(stats.collected, 0, 999999, 0))
    },
    edits: sanitizeEdits(input.edits),
    items: sanitizeItems(input.items),
    savedAt: clampNumber(input.savedAt, 0, Date.now() + 86400000, Date.now())
  };
}

export function sanitizeSettings(input) {
  const settings = input && typeof input === 'object' ? input : {};
  return {
    quality: QUALITY.has(settings.quality) ? settings.quality : 'auto',
    mode: MODES.has(settings.mode) ? settings.mode : 'learning',
    fov: Math.round(clampNumber(settings.fov, 60, 105, 78)),
    sensitivity: Math.round(clampNumber(settings.sensitivity, 35, 160, 100)),
    learning: settings.learning !== false
  };
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 6);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Falha ao abrir o armazenamento local.'));
  });
}

export async function saveWorld(data) {
  const safe = sanitizeWorld({ ...data, savedAt: Date.now() });
  if (!safe) throw new Error('O estado do mundo não é válido.');
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(safe, KEY);
    tx.oncomplete = () => { db.close(); resolve(safe); };
    tx.onerror = () => { db.close(); reject(tx.error || new Error('Falha ao salvar o mundo.')); };
  });
}

export async function loadWorld() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(KEY);
    request.onsuccess = () => { const safe = sanitizeWorld(request.result); db.close(); resolve(safe); };
    request.onerror = () => { db.close(); reject(request.error || new Error('Falha ao ler o mundo salvo.')); };
  });
}

export async function clearWorld() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(KEY);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error || new Error('Falha ao apagar o mundo.')); };
  });
}

export async function hasSave() {
  try { return Boolean(await loadWorld()); } catch { return false; }
}

export function saveSettings(settings) {
  const safe = sanitizeSettings(settings);
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(safe)); } catch {}
  return safe;
}

export function loadSettings() {
  try { return sanitizeSettings(JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')); }
  catch { return sanitizeSettings({}); }
}
