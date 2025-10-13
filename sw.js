// sw.js (IDMAR)
// Sobe esta versão quando mudares assets => força refresh em clientes
const CACHE_VERSION = 'idmar-v1.0.0-2025-10-13';

// BASE detecta a pasta do GitHub Pages (ex.: "/IDMAR/")
const BASE = new URL('./', self.location).pathname;

// Pré-cache mínimo (HTML principal); o resto cacheia-se na 1.ª utilização
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

// Install: pré-cache páginas base
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: limpar versões antigas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch:
// - HTML => network-first com fallback ao cache/index
// - Estáticos (CSS/JS/IMG/etc) => cache-first; em miss, vai à rede e mete no cache
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Só mesma origem
  if (url.origin !== location.origin) return;

  const acceptsHTML = req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html');
  if (acceptsHTML) {
    event.respondWith(
      fetch(req).then((res) => {
        // Atualiza cache em background
        caches.open(CACHE_NAME).then((c) => c.put(req, res.clone()));
        return res;
      }).catch(() =>
        // Fallback: página específica ou index.html
        caches.match(req).then((r) => r || caches.match(`${BASE}index.html`))
      )
    );
    return;
  }

  // Estáticos + API GET mesma origem
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
