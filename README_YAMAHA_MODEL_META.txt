# IDMAR · Yamaha model meta (v1)

## Ficheiros
- `data/yamaha_models.v1.json` — Base por **modelo** (hp, cc, anos, rigging, shaft, rotação, caixa, série).
- `js/model-meta-wire.v1.js` — Script que lê o JSON e preenche o Cartão 2; também foca o Cartão 3.
- `snippets/model-facts.html` — Marcadores HTML (spans/textarea) a colocar no Cartão 2/3.

## Como ligar (exemplo no validador.html)
1) Garante que o *picker* já está a injetar o input `#engineModel`.
2) Coloca o snippet onde queres ver os dados do modelo (Cartão 2) e a textarea (Cartão 3):
   ```html
   <!-- ... dentro do Card 2 ... -->
   <!-- inclui o conteúdo de snippets/model-facts.html -->

   <!-- ... já tens o #engine-sn-raw no Card 3; acrescenta só a textarea do snippet -->
   ```
3) Adiciona o script **depois** do `engine-picker.js` e restantes JS da página:
   ```html
   <script defer src="js/model-meta-wire.v1.js" data-json="data/yamaha_models.v1.json"></script>
   ```

Quando escreves ou escolhes um modelo (ex.: `F115B`, `F150D`, `XF425`), o script preenche os campos e coloca o foco no campo do nº de série.