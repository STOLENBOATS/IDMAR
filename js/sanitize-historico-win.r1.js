
// IDMAR — sanitize-historico-win.r1
// Normaliza histórico WIN: garante .foto e .thumb no nível raiz
(() => {
  const K1 = 'history_win', K2 = 'historyWin';
  const raw = localStorage.getItem(K1) || localStorage.getItem(K2) || '[]';
  let list; try { list = JSON.parse(raw) || []; } catch { list = []; }

  let changed = false;
  list = list.map(x => {
    const foto  = x.foto  || x.fotoNome || x.meta?.foto  || (x.meta?.forense && x.meta.forense[0]?.file) || '';
    const thumb = x.thumb || x.meta?.thumb || x.meta?.thumbnail || (x.meta?.forense && x.meta.forense[0]?.thumb) || '';
    if (foto !== x.foto || thumb !== x.thumb) {
      changed = true;
      return { ...x, foto, thumb };
    }
    return x;
  });

  if (changed) {
    try {
      const s = JSON.stringify(list);
      localStorage.setItem(K1, s);
      localStorage.setItem(K2, s);
    } catch (_) {}
  }
  console.log('[sanitize-win.r1] OK');
})();
