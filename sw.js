// sw.js
// Versão do cache → incrementa para forçar refresh
const CACHE_VERSION = 'idmar-v1.0.0-2025-10-13';

// BASE é o path da app ("/" ou "/IDMAR/")
const BASE = new URL('./', self.location).pathname; // ex.: "/IDMAR/"

// Lista mínima de assets críticos (expande conforme necessário)
const ASSETS = [
  `${BASE}index.html`,
  `${BASE}login.html`,
  `${BASE}validador.html`,
  `${BASE}forense.html`,
  `${BASE}historico_win.html`,
  `${BASE}historico_motor.html`,
  `${BASE}css/styles.css`,
  `${BASE}css/theme-soft-light.v1.css`,
  `${BASE}css/nav-ribbon.v5.css`,
  `${BASE}js/validador-win.js`,
  `${BASE}js/validador-motor.js`,
  `${BASE}js/sw-register.js`,
  `${BASE}img/logo-pm.png`
];

const CACHE_NAME = `${CACHE_VERSION}`;

// Install → pré-cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate → limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys
        .filter((k) => k !== CACHE_NAME)
        .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Estratégia: network-first para HTML, cache-first para estáticos
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Apenas mesma origem
  if (url.origin !== location.origin) return;

  // HTML → network-first
  if (req.mode === 'navigate' || req.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((res) => res || caches.match(`${BASE}index.html`)))
    );
    return;
  }

  // Outros (CSS/JS/IMG) → cache-first
  event.respondWith(
    caches.match(req).then((res) =>
      res || fetch(req).then((netRes) => {
        // Opcional: só cachear GET e 200
        if (req.method === 'GET' && netRes.ok) {
          const copy = netRes.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        }
        return netRes;
      })
    )
  );
});
