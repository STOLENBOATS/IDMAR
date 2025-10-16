// js/model-split-bridge.v2.js  — v2.2 robusto (Yamaha, base/variante + pesquisa por potência)
// - Carrega data/engines_catalog.v2.json
// - Constroi índice: { BASE: { variants:Set([...]), versions:Set([...]), powers:Set([...]) } }
// - Preenche "Modelo base" logo no load
// - Filtra por input (F40, F115B, 40, 9.9, 350, etc.)
// - Emite commit explícito ao escolher base+variante

(function (w, d) {
  const DEBUG = true;
  const V2_URL = 'data/engines_catalog.v2.json';
  const els = {
    legacyModel: 'srch_model',       // input (pesquisa) — opcional
    baseSel:     'modelBaseList',    // select base (visível)
    varSel:      'modelVariantList', // select variante (visível)
  };
  const $ = (id) => d.getElementById(id);

  let index = null;   // { BASE: { variants:Set, versions:Set, powers:Set } }
  let allBases = [];  // sorted

  const log = (...a) => DEBUG && console.log('[bridge v2]', ...a);

  // Normaliza string de modelo
  function norm(s) { return String(s||'').trim().toUpperCase().replace(/\s+/g, ''); }

  // Divide versão em base+var (F115B -> base F115, var B)
  function splitModel(code) {
    const m = norm(code);
    // remove comentaros tipo "(2024+)" e sufixos compostos como "/GE"
    const clean = m.replace(/\(.*?\)/g, '').split('/')[0];
    const re = /^([A-Z]+[0-9]+(?:\.[0-9])?)([A-Z]*)$/; // suporta F9.9, F2.5B, F115B
    const mm = clean.match(re);
    if (!mm) return { base: '', variant: '' };
    return { base: mm[1], variant: mm[2] || '' };
  }

  function buildIndex(v2) {
    const yam = v2?.brands?.Yamaha?.families || {};
    const out = {};
    Object.values(yam).forEach(fam => {
      (fam.versions || []).forEach(v => {
        const ver = v.version || '';
        const sp  = splitModel(ver);
        if (!sp.base) return;
        const e = out[sp.base] || (out[sp.base] = { variants:new Set(), versions:new Set(), powers:new Set() });
        e.variants.add(sp.variant);           // '' incluído
        e.versions.add(ver);
        if (typeof v.power === 'number') e.powers.add(v.power);
      });
    });
    index = out;
    allBases = Object.keys(out).sort((a,b)=>a.localeCompare(b, 'en', {numeric:true}));
    log('índice construido. bases=', allBases.length);
  }

  function fillSelect(sel, values, placeholder) {
    if (!sel) return;
    const opts = [`<option value="">${placeholder||'—'}</option>`]
      .concat(values.map(v => `<option value="${v}">${v||'—'}</option>`));
    sel.innerHTML = opts.join('');
  }

  function refreshVariantsFor(base) {
    const sel = $(els.varSel);
    if (!sel) return;
    if (!base || !index[base]) { fillSelect(sel, [], '—'); return; }
    const variants = Array.from(index[base].variants.values()).sort((a,b)=>a.localeCompare(b));
    fillSelect(sel, variants, '—');
  }

  // Filtro por input:
  // - Se input tem letras/dígitos (ex: "F40", "F115"), faz prefix match em BASE
  // - Se input é apenas número/decimal (ex: "40", "9.9", "350"), devolve bases que contenham esse número OU tenham power == número
  function filterBasesByQuery(qRaw) {
    const q = norm(qRaw);
    if (!q) return allBases;
    const onlyDigits = /^[0-9]+(?:\.[0-9])?$/.test(qRaw.trim());
    if (onlyDigits) {
      const num = Number(qRaw.replace(',', '.'));
      return allBases.filter(b => {
        if (b.includes(String(num))) return true; // F40 contém 40
        const e = index[b];
        if (!e) return false;
        return e.powers.has(num);
      });
    } else {
      return allBases.filter(b => b.startsWith(q));
    }
  }

  // === Handlers ===
  function onLegacyInput() {
    const legacy = $(els.legacyModel);
    if (!legacy) return;
    const bases = filterBasesByQuery(legacy.value || '');
    fillSelect($(els.baseSel), bases, '—');
    // reset variantes até escolher base
    refreshVariantsFor('');
  }

  function onBaseChange(ev) {
    if (!ev.isTrusted) return;
    const base = norm($(els.baseSel)?.value || '');
    refreshVariantsFor(base);
    log('base=', base, 'variants=', index[base] ? Array.from(index[base].variants) : []);
    // não comita já — aguarda escolha explícita de variante (ou Enter no input)
  }

  function onVariantChange(ev) {
    if (!ev.isTrusted) return;
    const base = norm($(els.baseSel)?.value || '');
    const vari = norm($(els.varSel)?.value || '');
    if (!base) return;
    const code = base + (vari || '');
    log('commit por base+variante:', code);
    w.dispatchEvent(new CustomEvent('idmar:model-commit', {
      detail: { model: code, commit: true, source: 'bridge-base-variant' }
    }));
  }

  function arm() {
    const legacy = $(els.legacyModel);
    const base   = $(els.baseSel);
    const vari   = $(els.varSel);

    if (legacy && !legacy.__armed_b2) {
      legacy.__armed_b2 = true;
      legacy.addEventListener('input', onLegacyInput);
      legacy.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const txt = legacy.value || '';
          const sp  = splitModel(txt);
          const code = sp.base ? (sp.base + (sp.variant||'')) : txt.trim();
          log('commit Enter no legacy:', code);
          w.dispatchEvent(new CustomEvent('idmar:model-commit', {
            detail:{ model: code, commit:true, source:'legacy-enter' }
          }));
        }
      });
    }
    if (base && !base.__armed_b2) { base.__armed_b2 = true; base.addEventListener('change', onBaseChange); }
    if (vari && !vari.__armed_b2) { vari.__armed_b2 = true; vari.addEventListener('change', onVariantChange); }

    // Preenche "Modelo base" logo com TUDO (qualquer coisa aparece)
    fillSelect(base, allBases, '—');
    refreshVariantsFor('');
  }

  // Boot
  fetch(V2_URL)
    .then(r => r.json())
    .then(j => { buildIndex(j); arm(); })
    .catch(e => console.warn('[bridge v2] falha a carregar índice', e));
})(window, document);
