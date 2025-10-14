# IDMAR — Engine Picker (r1)

Drop-in para criar *pickers* de **Marca** e **Modelo** de motores, a partir de `data/engines_catalog.v2.json` (schema_version 2).

## Ficheiros
- `js/engine-picker.js` — lógica de UI (carrega o catálogo, preenche Marca/Modelo)
- `css/engine-picker.css` — estilos mínimos (claro/escuro)
- `snippets/engine-picker.html` — bloco pronto a colar no `validador.html`

## Como integrar
1) **Upload** desta pasta para a raiz do repositório (mantendo `js/` e `css/`).
2) Em `validador.html`, dentro da secção **Validador Motor**, colar o conteúdo de `snippets/engine-picker.html`
   onde queres que apareça o seletor (de preferência abaixo do título).

Exemplo de bloco a colar:
```html
<link rel="stylesheet" href="./css/engine-picker.css">
<div id="engine-picker"></div>
<script defer src="./js/engine-picker.js"></script>
<script>EnginePicker.init();</script>
```

> O picker lê `./data/engines_catalog.v2.json`. Se o ficheiro estiver noutra pasta, ajusta a opção:
```html
<script>EnginePicker.init({ dataUrl: './data/engines_catalog.v2.json' });</script>
```

## Notas
- O código tolera variações comuns no catálogo (ex.: `brands` vs `manufacturers`, `models` vs `variants`). 
- Mantém compatibilidade com UI antiga: se existir um `<select>` legado de marca, ele sincroniza a seleção.
- Para obter os valores escolhidos no teu código:
```js
const brand = window.EnginePickerState?.brand;
const model = window.EnginePickerState?.model;
```

## Commit sugerido
- `feat(engine): add brand/model picker (schema_v2 catalog)`

Gerado em: 2025-10-14 08:37:55
