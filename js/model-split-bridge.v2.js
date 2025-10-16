// js/model-split-bridge.v2.js — v2.4 (robusto + sincronização com picker + UX melhorada)
(function (w, d) {
  const DEBUG = true;
  const V2_URL = 'data/engines_catalog.v2.json';
  const els = {
    legacyModel: 'srch_model',          // input "Modelo (pesquisa)"
    baseSel:     'modelBaseList',       // <select> Modelo base
    varSel:      'modelVariantList',    // <select> Variante / sufixo
    pickerInput: '#engine-picker input#engineModel' // input interno do EnginePicker (para sugestões)
  };

  const $  = (id)  => d.getElementById(id);
  const $$ = (sel) => d.querySelector(sel);
  const log = (...a) => { if (DEBUG) console.log('[bridge v2]', ...a); };

  // Índice construído a partir do catálogo v2
  // index = { BASE: { variants:Set, versions:Set, powers:Set } }
  let index = null;
  let allBases = [];

  // ===== Utilitários =====
  const norm = (s) => String(s || '').trim().toUpperCase().replace(/\s+/g, '');
  function splitModel(code) {
    // remove “( … )” e combinações com barras; aceita F9.9 / F115B
    const m = norm(code).replace(/\(.*?\)/g, '').split('/')[0];
    const re = /^([A-Z]+[0-9]+(?:\.[0-9])?)([A-Z]*)$/; // base=letras+números[.número], variante=letras
    const mm = m.match(re);
    return mm ? { base: mm[1], variant: mm[2] || '' } : { base: '', variant: '' };
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
        e.variants.add(sp.variant);       // pode ser ''
        e.versions.add(ver);
        if (typeof v.power === 'number') e.powers.add(v.power);
      });
    });
    index = out;
    allBases = Object.keys(out).sort((a,b)=>a.localeCompare(b,'en',{numeric:true}));
    log('índice construído. #bases =', allBases.length);
  }

  function fillSelect(sel, values, placeholder) {
    if (!sel) return;
    const opts = [`<option value="">${placeholder || '—'}</option>`]
      .concat((values || []).map(v => `<option value="${v}">${v || '—'}</option>`));
    sel.innerHTML = opts.join('');
  }

  function refreshVariantsFor(base) {
    const sel = $(els.varSel);
    if (!sel) return;
    if (!base || !index || !index[base]) {
      fillSelect(sel, [], '—');
      return;
    }
    const list = Array.from(index[base].variants).sort((a,b)=>a.localeCompare(b));
    fillSelect(sel, list, '—');
  }

  // ===== Filtragem de bases (UX) =====
  function filterBases(qRaw) {
    // Não listar nada sem query (evita “lista infinita” confusa)
    if (!qRaw) return [];

    const q = norm(qRaw);
    // só números: "40", "350", "9.9" (aceita vírgula)
    const onlyNum = /^[0-9]+(?:[.,][0-9])?$/.test(qRaw.trim());
    if (onlyNum) {
      const num = Number(qRaw.replace(',', '.'));
      return allBases.filter(b => {
        if (b.includes(String(num))) return true;    // contém dígitos (ex.: F40)
        const e = index[b];
        return e ? e.powers.has(num) : false;        // coincide com potência
      });
    }

    // alfanumérico: usar CONTAINS (mais tolerante que startsWith)
    return allBases.filter(b => b.includes(q));
  }

  // Alimenta input interno do EnginePicker (só para sugestões; não altera foco)
  function mirrorIntoPicker(text) {
    const input = $$(els.pickerInput);
    if (!input) return;
    input.value = text || '';
    // dispara input para o autocomplete do picker reagir
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // ===== Handlers =====
  function onLegacyInput() {
    const q = ($(els.legacyModel)?.value || '');
    const bases = filterBases(q);
    fillSelect($(els.baseSel), bases, '—');
    refreshVariantsFor('');
    // espelha string “como escrita” no input do picker para ele sugerir
    mirrorIntoPicker(q);
  }

  function onLegacyEnter(e) {
    if (e.key !== 'Enter') return;
    const raw = ($(els.legacyModel)?.value || '').trim();
    if (!raw) return;
    const sp = splitModel(raw);
    const code = sp.base ? (sp.base + (sp.variant || '')) : raw;
    finalizeCommit(code, 'legacy-enter');
  }

  function onBaseChange(ev) {
    if (!ev.isTrusted) return; // só interações humanas
    const base = norm($(els.baseSel)?.value || '');
    refreshVariantsFor(base);
    // coloca a base no picker para sugerir as variantes, mas sem commitar ainda
    mirrorIntoPicker(base);
    log('base=', base, 'variants=', index && index[base] ? Array.from(index[base].variants) : []);
  }

  function onVariantChange(ev) {
    if (!ev.isTrusted) return;
    const base = norm($(els.baseSel)?.value || '');
    const vari = norm($(els.varSel)?.value || '');
    if (!base) return;
    const code = base + (vari || '');
    finalizeCommit(code, 'bridge-base-variant');
  }

  // Emite o evento de commit (o teu model-meta-wire cuida do resto e foca SN)
  function finalizeCommit(code, source) {
    mirrorIntoPicker(code);
    log('commit:', code, 'via', source);
    w.dispatchEvent(new CustomEvent('idmar:model-commit', {
      detail: { model: code, commit: true, source }
    }));
  }

  // Armar listeners — e manter selects vazios no arranque
  function arm() {
    const legacy = $(els.legacyModel);
    const base   = $(els.baseSel);
    const vari   = $(els.varSel);

    if (legacy && !legacy.__armed_b2) {
      legacy.__armed_b2 = true;
      legacy.addEventListener('input', onLegacyInput);
      legacy.addEventListener('keydown', onLegacyEnter); // ENTER confirma
    }
    if (base && !base.__armed_b2) {
      base.__armed_b2 = true;
      base.addEventListener('change', onBaseChange);
    }
    if (vari && !vari.__armed_b2) {
      vari.__armed_b2 = true;
      vari.addEventListener('change', onVariantChange);
    }

    // Mantém vazios no arranque — só mostram após pesquisa
    fillSelect(base, [], '—');
    refreshVariantsFor('');
  }

  // ===== Boot =====
  fetch(V2_URL)
    .then(r => r.json())
    .then(j => { buildIndex(j); arm(); })
    .catch(e => console.warn('[bridge v2] falha a carregar índice', e));
})(window, document);
