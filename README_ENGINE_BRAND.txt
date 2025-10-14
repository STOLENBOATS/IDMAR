 # IDMAR — Engine Brand Pickers (r1)

Campos dinâmicos por **Marca** (Yamaha, Honda) com regras simples de validação.
Compatível com o Engine Picker (usa `#engineBrand` como fonte).

## Ficheiros
- `css/engine-brand.css` — estilos base
- `js/engine-brand-config.v1.js` — catálogo de campos & regras por marca
- `js/engine-brand-fields.v1.js` — renderização/validação dinâmica
- `snippets/brand-fields.html` — bloco pronto a colar no `validador.html`

## Como integrar
1) Faz upload desta pasta para a raiz do repo (mantém `css/` e `js/`).
2) Em `validador.html`, **abaixo do Engine Picker**, cola o bloco:
<link rel="stylesheet" href="./css/engine-brand.css">
<div id="engine-brand-fields"></div>
<script defer src="./js/engine-brand-config.v1.js"></script>
<script defer src="./js/engine-brand-fields.v1.js"></script>

3) Garante que o Engine Picker expõe/select com id **engineBrand** (default do script).

## Como ler os valores
```js
const brand = window.EnginePickerState?.brand;
const model = window.EnginePickerState?.model;
const extra = window.EngineBrandState?.data;
console.log({ brand: brand, model: model, extra: extra });
```

## Commit sugerido
- `feat(engine): brand-specific fields (Yamaha/Honda) + basic rules`

Gerado em: 2025-10-14 09:00:11
