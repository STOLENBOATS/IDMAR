# IDMAR — Engine Family Picker (r1)

Restringe **Versão** e **Potência** ao que existe para cada **modelo**, e mostra os **intervalos de nº de série** conhecidos, para as marcas **Yamaha** e **Honda**.

> Os dados no `data/engine_families.v1.json` são *PLACEHOLDER* — substitui pelos teus intervalos/versões reais quando quiseres.

## Ficheiros
- `data/engine_families.v1.json` — catálogo de famílias (Yamaha/Honda) com `versions`, `power_options_hp`, `serial_ranges`.
- `js/engine-family-picker.v1.js` — liga ao Engine Picker existente e preenche selects/painel.
- `css/engine-family.css` — estilos.
- `snippets/engine-family.html` — bloco pronto a colar no `validador.html`.

## Integração
1) Sobe a pasta para a raiz do repo (mantém `data/`, `js/`, `css/`).
2) Em `validador.html`, **abaixo do Engine Picker**, cola `snippets/engine-family.html`.
3) Garante que o teu Engine Picker expõe `#engineBrand` e `#engineModel` (defaults do script).

## Esquema do JSON (simplificado)
```json
{
  "schema": "engine_families.v1",
  "brands": [{ 
    "id": "yamaha",
    "families": [{ 
      "model": "F40",
      "versions": [{ 
        "code": "F40F",
        "years": "2010–2015",
        "power_options_hp": [40],
        "serial_ranges": [{ "prefix": "6C5", "from": 1000001, "to": 1999999 }]
      }]
    }]
  }]
}
```

## Commit sugerido
- `feat(engine): family picker (versions/power/serial ranges) — Yamaha/Honda (r1)`

Gerado em: 2025-10-14 09:11:05
