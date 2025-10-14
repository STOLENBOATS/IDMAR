Ficheiros a substituir (mesmos caminhos no repo):
- js/engine-family-picker.v1.js
- js/engine-serial-range-check.v1.js
- js/engine-sn-panel.v2.js
- data/engine_families.v1.json

Commit sugeridos:
- feat(families): match case-insensitive + prefix; expose ranges
- feat(serial): range checker panel UI
- feat(families): seed Honda BF350 (demo ranges)

Teste:
Honda → BF350 + LHU → Versão BF350LHU → Potência 350 → Nº: BAXL-1001234 → deve ficar VERDE.
