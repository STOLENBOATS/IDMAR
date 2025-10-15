// sw.js (IDMAR) — safe cloning + guards
const CACHE_VERSION = 'idmar-v1.0.2-2025-10-14'; // ⬅️ sobe sempre isto ao editar
const BASE = new URL('./', self.location).pathname;

const ASSETS = [
  `${BASE}index.html`,
  `${BASE}login.html`,
  `${BASE}validador.html`,
  `${BASE}forense.html`,
  `${BASE}historico_win.html`,
  `${BASE}historico_motor.html`,
  `${BASE}js/sw-register.js`,
  `${BASE}manifest.webmanifest`
];

const CACHE_NAME = CACHE_VERSION;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Só mesma origem
  if (url.origin !== location.origin) return;

  // HTML → network-first com fallback
  const acceptsHTML = req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html');
  if (acceptsHTML) {
    event.respondWith((async () => {
      try {
        const netRes = await fetch(req, { cache: 'no-store' });
        // clona já, uma vez só
        const copy = netRes.clone();
        // tenta gravar sem quebrar navegação
        caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(()=>{});
        return netRes;
      } catch {
        const cached = await caches.match(req);
        return cached || caches.match(`${BASE}index.html`);
      }
    })());
    return;
  }

  // Estáticos → cache-first; em miss, rede + put seguro
  if (req.method === 'GET') {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      const netRes = await fetch(req);
      // só cacheia respostas OK e "basic" (mesma origem, não opacas)
      if (netRes && netRes.ok && netRes.type === 'basic') {
        try {
          const copy = netRes.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy)).catch(()=>{});
        } catch {}
      }
      return netRes;
    })());
  }
});
