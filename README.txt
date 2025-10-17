
# IDMAR hotfix – histórico sem mexer no WIN

## O que vem aqui
- `js/engine-history.v1.js`: API de histórico (localStorage).
- `js/validator-hook.save-history.v1.js`: liga o botão do cartão 3 para gravar no histórico **sem tocar** no teu fluxo do WIN.
- `engine-history.html`: lista/exporta/apaga registos.

## Como integrar no teu `validador.html` existente
1. **Mantém** o teu HTML original (com os scripts do WIN, botões, etc.).
2. Adiciona estas duas linhas antes de `</body>`:

```html
<script defer src="js/engine-history.v1.js"></script>
<script defer src="js/validator-hook.save-history.v1.js"></script>
```

3. Garante que no Cartão 3 existe um botão para gravar, por exemplo:
```html
<button id="btnValidateSerial" type="button">Validar nº de motor</button>
```

Pronto. O botão vai:
- recolher `brand/model` do EnginePicker,
- ler o nº de série e notas,
- guardar no histórico (`localStorage["IDMAR_ENGINE_HISTORY"]`),
- atualizar o visor com a mensagem de sucesso.

Para ver o histórico, abre `engine-history.html`.
