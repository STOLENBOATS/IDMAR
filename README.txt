IDMAR roll-down bridge patch
--------------------------------
Colocar estes ficheiros no teu repositório:

/js/model-split-bridge.v1.js           (novo)  → preenche os dropdowns “Modelo base” e “Variante” a partir de data/engine_families.v1.json e faz a ponte para o picker de família/versão.
/js/engine-family-picker.v1.js         (update)→ expõe CurrentBrandPolicy, auto-seleciona versão quando existe BASE+VARIANTE e hidrata potência + ranges.
/js/engine-serial-range-check.v1.js    (update)→ valida nº por política da marca + intervalos, suporta overlaps.
/js/engine-sn-panel.v2.js              (update)→ mostra todos os matches; amarelo quando só estrutural.

HTML (cartão Motor):
- Adiciona os selects:
  <select id="modelBaseList"></select>
  <select id="modelVariantList"></select>
- Garante os hidden inputs:
  <input id="engineBase" type="hidden">
  <input id="engineVariant" type="hidden">

Scripts (no fim do <body>):
  <script defer src="js/engine-family-picker.v1.js"></script>
  <script defer src="js/model-split-bridge.v1.js"></script>
  <script defer src="js/engine-serial-range-check.v1.js"></script>
  <script defer src="js/engine-sn-panel.v2.js"></script>
