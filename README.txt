
IDMAR — MIC + Motores bundle (EU/UK + US) — v1
==============================================
Conteúdo:
- data/iso_countries_eu_uk_us.json   → siglas ISO → país (PT/EN)
- data/mic_eu_uk_template.csv        → template de MIC por país (UE/UK)
- data/mic_us_template.csv           → template USCG HIN/MIC
- data/engines_catalog.json          → catálogo (seed: Yamaha, Suzuki) — extensível
- js/engine_catalog.js               → loader API
- js/engine_autocomplete_addon.v1.js → add-on drop-in para autocomplete/rolls conforme Marca

Como ligar no Validador Motor (drop-in):
1) Copia as pastas /data e /js para o projeto.
2) No fim do <body> do validador, adiciona:
   <script type="module" src="js/engine_autocomplete_addon.v1.js" data-catalog="data/engines_catalog.json"></script>
3) Opcionalmente, coloca data-attributes nos inputs:
   data-engine-field="brand|letter_pair|shaft|model_code|series|power|displacement|origin"
