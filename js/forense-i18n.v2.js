// forense-i18n.v2.js â€” PT/EN overlay para a pÃ¡gina Forense (nÃ£o altera HTML)
(function () {
  // util: aplica traduÃ§Ã£o sem quebrar HTML interno
const small = (en) => ' / ' + en;
function setTextSafely(el, textPt, textEn) {
  const onlyText = el.childNodes.length === 1 && el.firstChild && el.firstChild.nodeType === 3;
  if (onlyText) {
    el.textContent = textPt + ' / ' + textEn;
  } else {
    const base = (el.textContent || '').trim();
    el.title = (base ? base + ' â€” ' : '') + textPt + ' / ' + textEn;
  }
}
const byText = (root, selector, map) => {
  root.querySelectorAll(selector).forEach(el => {
    const t = (el.textContent || '').trim();
    const key = Object.keys(map).find(k => {
      if (k.endsWith('*')) return t.toLowerCase().startsWith(k.slice(0, -1).toLowerCase());
      return t.toLowerCase() === k.toLowerCase();
    });
    if (!key) return;
    const val = map[key];
    if (typeof val === 'string') {
      const onlyText = el.childNodes.length === 1 && el.firstChild && el.firstChild.nodeType === 3;
      if (onlyText) el.textContent = val; else el.title = val;
    } else {
      setTextSafely(el, val.pt, val.en);
    }
  });
};

  function applyBilingual() {
    const root = document;

    // CabeÃ§alho
    byText(root, 'h1, h2, summary', {
      'Forense â€” Ãndice': { pt: 'Forense â€” Ãndice', en: 'Forensic â€” Index' },
      'Carregar evidÃªncias': { pt: 'Carregar evidÃªncias', en: 'Upload evidence' },
      'Workspace': { pt: 'Workspace', en: 'Workspace' },
      'Forense (opcional)*': { pt: 'Forense (opcional)', en: 'Forensic (optional)' },
    });

    // BotÃµes / controlos
    byText(root, 'button, .btn, [role="button"]', {
      'Anexar ao histÃ³rico mais recente': { pt: 'Anexar ao histÃ³rico mais recente', en: 'Attach to latest history' },
      'Abrir lightbox': { pt: 'Abrir lightbox', en: 'Open lightbox' },
      'Comparar': { pt: 'Comparar', en: 'Compare' },
      'Anotar (rect)': { pt: 'Anotar (rect)', en: 'Annotate (rect)' },
      'Limpar anotaÃ§Ãµes': { pt: 'Limpar anotaÃ§Ãµes', en: 'Clear annotations' },
      'Exportar PNG anotado': { pt: 'Exportar PNG anotado', en: 'Export annotated PNG' },
      'Guardar â€œbundleâ€ (JSON)': { pt: 'Guardar â€œbundleâ€ (JSON)', en: 'Save bundle (JSON)' },
      'Guardar "bundle" (JSON)': { pt: 'Guardar â€œbundleâ€ (JSON)', en: 'Save bundle (JSON)' }, // aspas normais fallback
    });

    // RÃ³tulos/legendas que costumam aparecer como texto simples
    byText(root, 'label, .label, .panel > .title, .panel label', {
      'Contexto:*': 'Contexto / Context:',
      'Contexto:': 'Contexto / Context:',
    });

    // Tooltips Ãºteis (sem :contains)
[
  { needle: 'comparar', title: 'Arraste o slider / Drag the slider' },
  { needle: 'anotar',   title: 'Clique e arraste para desenhar / Click and drag to draw' },
  { needle: 'exportar png anotado', title: 'Guarda a imagem com as anotaÃ§Ãµes / Save image with annotations' }
].forEach(({ needle, title }) => {
  document.querySelectorAll('button, .btn, [role="button"]').forEach(el => {
    const t = (el.textContent || '').trim().toLowerCase();
    if (t.includes(needle)) el.title = title;
  });
});
if (!t) return;

    if (t.includes(text.toLowerCase())) {
      el.title = title;
      return;
    }

    // heurÃ­sticas antigas, se quiseres manter:
    if (/comparar/.test(t) && /slider/.test(title.toLowerCase())) el.title = title;
    if (/anotar/.test(t)   && /desenhar/.test(title.toLowerCase())) el.title = title;
    if (/exportar.*png/.test(t)) el.title = 'Guarda a imagem com as anotaÃ§Ãµes / Save image with annotations';
  });
});

    // â€œContexto: WIN/HINâ€ â†’ â€œContexto / Context: WIN/HINâ€
    document.querySelectorAll('*').forEach(el => {
  if (!el.firstChild || el.firstChild.nodeType !== 3) return;
  const raw = el.firstChild.nodeValue || '';
  const m = raw.match(/^Contexto:\s*(.*)$/i);
  if (!m) return;
  el.firstChild.nodeValue = 'Contexto / Context: ' + m[1];
});
}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBilingual);
  } else {
    applyBilingual();
  }
})();

