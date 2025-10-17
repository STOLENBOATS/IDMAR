
IDMAR helper bundle
===================

Arquivos:
- js/card3-grid-inject.v1.js     → adiciona o Cartão 3 e aplica grelha de 3 colunas (não mexe nos teus cartões existentes)
- js/android-orientation-guard.js → mostra aviso PT/EN em Android em modo portrait

Como usar (2 passos):
1) Copia a pasta `js/` deste ZIP para a **raiz** do site (onde está o validador.html).
2) Em `validador.html`, antes de </body>, adiciona:
   <script defer src="js/card3-grid-inject.v1.js"></script>
   <script defer src="js/android-orientation-guard.js"></script>

Feito. Os cartões devem aparecer lado a lado (WIN | Motor | Pesquisa) e o botão do Cartão 3 grava no histórico (localStorage 'hist_motor') e abre o histórico.

Se quiseres aplicar o aviso Android noutras páginas, adiciona só o segundo <script> nessas páginas.
