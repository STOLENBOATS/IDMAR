# IDMAR Add‑ons r3 (2025-09-16)

Inclui:
- `js/compat-nav-shim.js` — corrige `NAV is not defined` mantendo retrocompatibilidade
- `js/validador-ui.js` — renderizadores de resultado (WIN/Motor) com **Campos / Valor / Interpretação**, **Regras aplicadas** e botão **Forense** (opcional)
- `js/idmar-i18n.js` — micro i18n PT/EN via `data-i18n` e `IDMAR_lang.set('pt'|'en')`
- `js/idmar-theme.js` — tema claro por defeito + toggle (`IDMAR_setTheme()`)
- `css/idmar-theme.css` — estilos com contraste **sóbrio** (Light) + Dark opcional

Como aplicar (não destrutivo):
1. Copiar os ficheiros para o repo.
2. Em **todas as páginas** (login, validador, históricos, forense) no `<head>` adicionar:
   ```html
   <link rel="stylesheet" href="css/idmar-theme.css">
   <script src="js/idmar-theme.js"></script>
   <script src="js/idmar-i18n.js"></script>
   ```
3. Em **validador.html** (antes dos teus `validador-win.js` e `validador-motor.js`):
   ```html
   <script src="js/compat-nav-shim.js"></script>
   <script src="js/validador-ui.js"></script>
   <!-- teus validadores abaixo -->
   <script src="js/validador-win.js"></script>
   <script src="js/validador-motor.js"></script>
   ```
4. Para **mostrar resultados** com a nova UI, no fim de cada validação chama:
   ```js
   renderWinResult({ status:'válido', fields:[{label:'País',value:'PT',meaning:'Fabricante PT'}], rules:['UE: 14 chars'] });
   // ou
   renderMotorResult({ status:'inválido', fields:[...], rules:[...] });
   ```
5. Toggle do tema (opcional no header):
   ```html
   <button id="idmar-theme-toggle" title="Dia/Noite">🌗</button>
   ```

Dica: Se estiver sempre escuro, apaga a preferência local e recarrega:
```js
localStorage.removeItem('idmar-theme'); location.reload();
```
