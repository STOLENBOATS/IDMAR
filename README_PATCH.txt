# IDMAR — PWA Patch (drop‑in)

Este pacote contém os ficheiros necessários para ativar PWA/Service Worker no GitHub Pages
sem mexer no resto da app. Basta fazer upload pela Web UI do GitHub para a raiz do repositório.

## Conteúdo
- `manifest.webmanifest` (raiz)
- `sw.js` (raiz) — BASE-aware + runtime caching
- `js/sw-register.js` — registo do service worker (incluir em todas as páginas)
- `404.html` — fallback que redireciona para `index.html` (útil em GitHub Pages)

## Como aplicar (Web UI)
1. No GitHub → `Add file` → `Upload files`.
2. **Arrasta a pasta inteira** deste patch (ele vai criar/usar `js/` automaticamente).
3. Commit message sugerida: `feat(pwa): add js/sw-register.js and include on all pages`
4. Em seguida, edita **todas as páginas HTML** e garante, antes de `</body>`, o snippet:
   ```html
   <link rel="manifest" href="./manifest.webmanifest">
   <script defer src="./js/sw-register.js"></script>
   ```
5. (Opcional) Faz upload de `404.html` se quiseres o fallback (commit sugerido: `chore(pages): add 404.html fallback`).

## Mensagens de commit prontas
- `feat(pwa): add js/sw-register.js and include on all pages`
- `feat(pwa): BASE-aware sw.js with runtime caching (network-first HTML, cache-first assets)`
- `chore(pages): add 404.html fallback`

## Notas
- Sempre que alterares CSS/JS/HTML, **sobe** a constante `CACHE_VERSION` no `sw.js` para forçar refresh.
- Podes ver o estado em DevTools → Application → Service Workers/Manifest.
- Teste offline: DevTools → Network → (✓) Offline → recarrega.

Gerado em: 2025-10-13 22:12:07
