# IDMAR — Collect + Bilingual (r1)

Pacote rápido para:
1) **Ler valores** do Engine Picker + campos por marca (`EngineCollect.collect()`).
2) **Títulos bilingues** nos cartões, via `data-bi-pt` / `data-bi-en`.

## Ficheiros
- `js/engine-collect.v1.js` — `EngineCollect.collect()` → retorna `{brand, model, extra}`
- `js/i18n-bilingual.v1.js` — aplica textos "PT / EN" onde existirem `data-bi-pt|en`
- `snippets/collect+bilingual.html` — bloco pronto a colar no `validador.html`

## Como integrar
1) Sobe a pasta para a raiz do repo.
2) Em `validador.html`, **depois** dos scripts do Engine Picker e dos Brand Fields, inclui:
```html
<script defer src="./js/engine-collect.v1.js"></script>
<script defer src="./js/i18n-bilingual.v1.js"></script>
```
3) Marca os títulos com atributos:
```html
<h2 class="card-title" data-bi-pt="Validador Motor" data-bi-en="Engine Validator"></h2>
```
4) Para ler os valores quando validares/submeteres:
```js
const data = window.EngineCollect.collect(); // => { brand, model, extra }
```

## Commit sugerido
- `feat(engine): collection util + bilingual card titles (r1)`

Gerado em: 2025-10-14 09:04:58
