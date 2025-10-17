IDMAR rollback pack — restore to LAST stable

Files to overwrite in your repo (keep folders as-is):

- validador.html
- historico_win.html
- historico_motor.html
- forense.html

- js/validador-win.js
- js/validador-motor.js
- js/historico-win.r3b.js
- js/historico-motor.r3b.js
- js/idmar-header-only.all.v4.js
- js/forense-r5.js
- js/idmar-i18n.js

After copying:
1) Hard refresh each page (Ctrl/Cmd+F5).
2) On Validador: run a WIN and a Motor check, confirm new rows appear in respective históricos.
3) On Forense: export PNG and verify it attaches to the most recent record (WIN/MOTOR) and appears via "Ver anexos" in the histórico.

Notes:
- This pack intentionally reverts Validador to the stable rule engine and storage format from LAST.
- Header v4 is kept to match those pages; if you prefer v5 later, upgrade only `js/idmar-header-only...` and test.
