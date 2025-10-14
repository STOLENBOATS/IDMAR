// sw.js (IDMAR)
// Bump this to force refresh after asset changes
const CACHE_VERSION = 'idmar-v1.0.1-2025-10-14';

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
  if (url.origin !== location.origin) return;

  const acceptsHTML = req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html');
  if (acceptsHTML) {
    event.respondWith(
      fetch(req).then((res) => {
        caches.open(CACHE_NAME).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match(`${BASE}index.html`)))
    );
    return;
  }

  if (req.method === 'GET') {
    event.respondWith(
      caches.match(req).then((r) =>
        r || fetch(req).then((net) => {
          if (net.ok) caches.open(CACHE_NAME).then((c) => c.put(req, net.clone()));
          return net;
        })
      )
    );
  }
});
