// Cache simples para o app abrir sem internet no canteiro.
const CACHE = 'rdo-v6';
const ARQUIVOS = ['./', 'index.html', 'manifest.json', 'icon.svg', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Rede primeiro (pega versão nova quando há sinal), cache se estiver offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== location.origin) return; // API do tempo e fontes: direto pela rede
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok && new URL(e.request.url).origin === location.origin) {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
      }
      return r;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html')))
  );
});
