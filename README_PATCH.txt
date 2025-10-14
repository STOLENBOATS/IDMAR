# IDMAR — PWA Patch (drop-in)

Conteúdo:
- `manifest.webmanifest` (raiz)
- `sw.js` (raiz) — BASE-aware + runtime caching
- `js/sw-register.js`
- `404.html`

Como aplicar (Web UI):
1) Add file → Upload files → arrasta a PASTA descompactada.
2) Commit sugerido: `feat(pwa): add js/sw-register.js and include on all pages`
3) Garante que TODAS as páginas têm o snippet antes de </body>:
   <link rel="manifest" href="./manifest.webmanifest">
   <script defer src="./js/sw-register.js"></script>

Notas:
- Sempre que alterares assets, sobe CACHE_VERSION no sw.js.
- Teste offline via DevTools → Network → Offline.
Gerado em 2025-10-14 08:40:46
