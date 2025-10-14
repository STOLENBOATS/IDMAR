# Patch: validador.html (bilingue + Engine Picker unificado + hooks corretos)

## O que foi feito
- **Bilingue** nos títulos (`data-bi-pt` / `data-bi-en`) — requer `js/i18n-bilingual.v1.js` a correr.
- **Removido** o module `engine_picker.v2.4.js` para evitar duplicação de UI/estado (ficamos com `engine-picker.js` + `EnginePicker.init()`).
- **Engine Brand Fields** e **Family Picker** incluídos (assumindo que já subiste os JS/CSS correspondentes).
- **Hooks** corrigidos para `btnMotor` e `formMotor` (antes estava a ouvir `btnValidar`).
- **Comentário HTML** fechado, e linha solta JS removida.

## Como aplicar
1) Faz upload do ficheiro `validador-patched.html` e renomeia no GitHub para **`validador.html`** (substitui o atual).
2) Garante que os seguintes ficheiros existem no repo:
   - `js/engine-picker.js`, `css/engine-picker.css`
   - `js/engine-brand-config.v1.js`, `js/engine-brand-fields.v1.js`, `css/engine-brand.css`
   - `js/engine-family-picker.v1.js`, `css/engine-family.css`, `data/engine_families.v1.json`
   - `js/engine-collect.v1.js`, `js/i18n-bilingual.v1.js`

## Mensagens de commit sugeridas
- `feat(ui): bilingual card titles (PT/EN) + Engine Picker unified`
- `feat(engine): add brand fields + family picker (versions/power/SN ranges)`

Gerado em: 2025-10-14 09:21:16
