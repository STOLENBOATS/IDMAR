IDMAR Complete Bundle r4

Conteúdo:
- js/engine-picker.js (robusto, aceita múltiplos formatos de catálogo)
- css/engine-picker.css
- js/engine-brand-config.v1.js, js/engine-brand-fields.v1.js, css/engine-brand.css
- js/engine-family-picker.v1.js, css/engine-family.css, data/engine_families.v1.json (PLACEHOLDER)
- js/engine-collect.v1.js, js/i18n-bilingual.v1.js
- validador.html (exemplo completo com tudo ligado)

Como aplicar:
1) Carrega a pasta descompactada para a raiz do repositório (mantém js/, css/, data/).
2) No teu validador.html real, substitui o bloco do Engine Picker pelo nosso (usa o <script data-picker-init>).
3) NÃO carregues o module antigo engine_picker.v2.4.js.
4) Hard Reload; se cache preso, desregista o SW e apaga caches.

Commit sugerido:
- feat(engine): robust picker + brand fields + family picker + bilingual titles

Gerado em: 2025-10-14 10:58:39
