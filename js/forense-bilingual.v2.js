// forense-bilingual.v2.js — PT/EN para a página Forense (sem :contains)
(function (d) {
  const q = sel => d.querySelector(sel);
  const qa = sel => Array.from(d.querySelectorAll(sel));
  const setText = (el, txt) => { if (el) el.textContent = txt; };
  const setHTML = (el, pt, en) => { if (el) el.innerHTML = `${pt} <span class="small">/ ${en}</span>`; };
  const setTitle = (el, t) => { if (el && !el.title) el.title = t; };

  function findByText(nodes, re){
    nodes = Array.isArray(nodes) ? nodes : qa(nodes);
    return nodes.find(n => re.test((n.textContent||'').trim()));
  }
  function renameAllByText(nodes, re, text){
    (Array.isArray(nodes)?nodes:qa(nodes))
      .filter(n => re.test((n.textContent||'').trim()))
      .forEach(n => setText(n, text));
  }

  function boot(){
    // Título
    const h1 = q('h1');
    if (h1 && /forense/i.test(h1.textContent)) setText(h1, 'Forense — Índice / Forensics — Index');

    // Secções
    const secUp = findByText(['h2','h3'].flatMap(t=>qa(t)), /Carregar evid/i);
    if (secUp) setText(secUp, 'Carregar evidências / Upload evidence');

    const secWs = findByText(['h2','h3'].flatMap(t=>qa(t)), /Workspace/i);
    if (secWs) setText(secWs, 'Workspace / Workspace');

    // Contexto
    const ctxLbl = findByText('label', /^Contexto\b/i);
    if (ctxLbl) setHTML(ctxLbl, 'Contexto', 'Context');

    // Botão anexar
    const btnAttach = findByText('button, a[role=button]', /Anexar ao histórico/i);
    if (btnAttach){
      setText(btnAttach, 'Anexar ao histórico mais recente / Attach to most recent history');
      setTitle(btnAttach, 'Anexa ao registo mais recente do contexto selecionado. / Attach to newest record in selected context.');
    }

    // Slider "Comparar"
    // (não usamos :contains — filtramos por texto)
    renameAllByText('label', /^Comparar$/i, 'Comparar / Compare');

    // Botões de ferramentas
    renameAllByText('button, a[role=button]', /Abrir lightbox/i,        'Abrir lightbox / Open lightbox');
    renameAllByText('button, a[role=button]', /^Anotar/i,               'Anotar (rect) / Annotate (rect)');
    renameAllByText('button, a[role=button]', /Limpar anotações/i,      'Limpar anotações / Clear annotations');
    renameAllByText('button, a[role=button]', /Exportar PNG/i,          'Exportar PNG anotado / Export annotated PNG');
    renameAllByText('button, a[role=button]', /Guardar.*bundle/i,       'Guardar “bundle” (JSON) / Save “bundle” (JSON)');

    // Acessibilidade nos file pickers
    qa('input[type=file]').forEach(inp=>{
      if(!inp.getAttribute('aria-label')) inp.setAttribute('aria-label','Carregar ficheiro / Upload file');
    });

    // Dica no range (se existir)
    const range = q('input[type=range]');
    if (range) setTitle(range, 'Ajusta opacidade entre imagens A/B / Adjust opacity between A/B images');

    // Opções do contexto (se forem estas palavras)
    const sel = q('select');
    if (sel) {
      qa('option', sel).forEach(o=>{
        const v=(o.value||o.textContent||'').toUpperCase();
        if (/WIN/.test(v)) o.textContent='WIN/HIN';
        if (/MOTOR|ENGINE/.test(v)) o.textContent='Motor / Engine';
      });
    }
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot);
  else boot();
})(document);
