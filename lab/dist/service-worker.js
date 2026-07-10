'use strict';

const VERSION = 'labds-v5.1.0';
const CORE = `${VERSION}-core`;
const RUNTIME = `${VERSION}-runtime`;
const CORE_FILES = [
  './','./index.html','./css/style.css','./css/session.css','./css/vm-lab-v5.css','./manifest.webmanifest','./assets/icon.svg','./assets/hero-laboratorio-virtual-ds.webp','./assets/hero-laboratorio-virtual-ds.png',
  './js/config.js','./js/storage.js','./js/exporter.js','./js/session.js','./js/session-exporter.js','./js/app.js',
  './js/labs/vm-lab.js','./js/labs/vm/profiles.js','./js/labs/vm/engine.js','./js/labs/vm/renderer.js','./js/terminal/command-catalog.js','./js/terminal/command-matrix.js','./js/terminal/fs.js','./js/terminal/network-engine.js','./js/terminal/shells.js','./js/terminal/terminal-controller.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CORE).then(cache => cache.addAll(CORE_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => ![CORE,RUNTIME].includes(key)).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if(url.origin === location.origin){
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {const copy=response.clone();caches.open(RUNTIME).then(cache=>cache.put(event.request,copy));return response;}).catch(() => event.request.mode === 'navigate' ? caches.match('./index.html') : Promise.reject(new Error('Recurso offline indisponível')))));
    return;
  }
  if(/cdn\.jsdelivr\.net/.test(url.hostname)){
    event.respondWith(caches.open(RUNTIME).then(async cache => {
      const cached = await cache.match(event.request);
      if(cached) return cached;
      const response = await fetch(event.request);
      if(response.ok) cache.put(event.request,response.clone());
      return response;
    }));
  }
});
