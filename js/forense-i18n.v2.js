// forense-i18n.v2.js — PT/EN overlay para a página Forense (não altera HTML)
(function () {
  const small = (en) => ` <span class="small">/ ${en}</span>`;
  const byText = (root, selector, map) => {
    root.querySelectorAll(selector).forEach(el => {
      const t = (el.textContent || '').trim();
      const key = Object.keys(map).find(k => {
        if (k.endsWith('*')) return t.toLowerCase().startsWith(k.slice(0, -1).toLowerCase());
        return t.toLowerCase() === k.toLowerCase();
      });
      if (!key) return;
      const val = map[key];
      // permite strings simples ou {pt,en}
      if (typeof val === 'string') { el.innerHTML = val; }
      else { el.innerHTML = `${val.pt}${small(val.en)}`; }
    });
  };

  function applyBilingual() {
    const root = document;

    // Cabeçalho
    byText(root, 'h1, h2, summary', {
      'Forense — Índice': { pt: 'Forense — Índice', en: 'Forensic — Index' },
      'Carregar evidências': { pt: 'Carregar evidências', en: 'Upload evidence' },
      'Workspace': { pt: 'Workspace', en: 'Workspace' },
      'Forense (opcional)*': { pt: 'Forense (opcional)', en: 'Forensic (optional)' },
    });

    // Botões / controlos
    byText(root, 'button, .btn, [role="button"]', {
      'Anexar ao histórico mais recente': { pt: 'Anexar ao histórico mais recente', en: 'Attach to latest history' },
      'Abrir lightbox': { pt: 'Abrir lightbox', en: 'Open lightbox' },
      'Comparar': { pt: 'Comparar', en: 'Compare' },
      'Anotar (rect)': { pt: 'Anotar (rect)', en: 'Annotate (rect)' },
      'Limpar anotações': { pt: 'Limpar anotações', en: 'Clear annotations' },
      'Exportar PNG anotado': { pt: 'Exportar PNG anotado', en: 'Export annotated PNG' },
      'Guardar “bundle” (JSON)': { pt: 'Guardar “bundle” (JSON)', en: 'Save bundle (JSON)' },
      'Guardar "bundle" (JSON)': { pt: 'Guardar “bundle” (JSON)', en: 'Save bundle (JSON)' }, // aspas normais fallback
    });

    // Rótulos/legendas que costumam aparecer como texto simples
    byText(root, 'label, .label, .panel > .title, .panel label', {
      'Contexto:*': 'Contexto / Context:',
      'Contexto:': 'Contexto / Context:',
    });

    // Tooltips úteis (se existirem elementos)
    const tips = [
      { q: 'button:contains("Comparar"), .btn:contains("Comparar")', title: 'Arraste o slider / Drag the slider' },
      { q: 'button:contains("Anotar"), .btn:contains("Anotar")', title: 'Clique e arraste para desenhar / Click and drag to draw' },
      { q: 'button:contains("Exportar PNG anotado")', title: 'Guarda a imagem com as anotações / Save image with annotations' }
    ];
    tips.forEach(({q, title}) => {
      root.querySelectorAll(q.replace(':contains', '[data-x]')).forEach(()=>{});
      // fallback genérico: aplica por texto
      root.querySelectorAll('button, .btn, [role="button"]').forEach(el=>{
        const t=(el.textContent||'').trim().toLowerCase();
        if (/comparar/.test(t) && /slider/.test(title.toLowerCase())) el.title=title;
        if (/anotar/.test(t) && /desenhar/.test(title.toLowerCase())) el.title=title;
        if (/exportar.*png/.test(t)) el.title = 'Guarda a imagem com as anotações / Save image with annotations';
      });
    });

    // “Contexto: WIN/HIN” → “Contexto / Context: WIN/HIN”
    document.querySelectorAll('*').forEach(el=>{
      const t=(el.firstChild && el.firstChild.nodeType===3) ? el.firstChild.nodeValue.trim() : '';
      if (/^Contexto:\s*/i.test(t)) {
        const rest = (el.textContent||'').replace(/^Contexto:\s*/i,'').trim();
        el.innerHTML = `Contexto / Context: ${rest}`;
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyBilingual);
  } else {
    applyBilingual();
  }
})();
