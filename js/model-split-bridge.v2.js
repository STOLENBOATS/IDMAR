// js/model-split-bridge.v2.js — v2.3 (robusto + sincronização com picker)
(function (w, d) {
  const DEBUG = true;
  const V2_URL = 'data/engines_catalog.v2.json';
  const els = {
    legacyModel: 'srch_model',
    baseSel:     'modelBaseList',
    varSel:      'modelVariantList',
    pickerInput:  '#engine-picker input#engineModel'
  };
  const $ = (id) => d.getElementById(id);
  const $$ = (sel) => d.querySelector(sel);
  const log = (...a) => DEBUG && console.log('[bridge v2]', ...a);

  let index = null;   // { BASE: { variants:Set, versions:Set, powers:Set } }
  let allBases = [];

  const norm = s => String(s||'').trim().toUpperCase().replace(/\s+/g, '');
  function splitModel(code) {
    const m = norm(code).replace(/\(.*?\)/g, '').split('/')[0];
    const re = /^([A-Z]+[0-9]+(?:\.[0-9])?)([A-Z]*)$/; // F9.9 / F115B
    const mm = m.match(re);
    return mm ? { base:mm[1], variant:mm[2]||'' } : { base:'', variant:'' };
  }

  function buildIndex(v2) {
    const yam = v2?.brands?.Yamaha?.families || {};
    const out = {};
    Object.values(yam).forEach(fam => {
      (fam.versions||[]).forEach(v => {
        const ver = v.version || '';
        const sp  = splitModel(ver);
        if (!sp.base) return;
        const e = out[sp.base] || (out[sp.base] = { variants:new Set(), versions:new Set(), powers:new Set() });
        e.variants.add(sp.variant);
        e.versions.add(ver);
        if (typeof v.power === 'number') e.powers.add(v.power);
      });
    });
    index = out;
    allBases = Object.keys(out).sort((a,b)=>a.localeCompare(b,'en',{numeric:true}));
    log('índice construído. bases=', allBases.length);
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
    const list = Array.from(index[base].variants).sort((a,b)=>a.localeCompare(b));
    fillSelect(sel, list, '—');
  }

  function filterBases(qRaw) {
    if (!qRaw) return allBases;
    const q = norm(qRaw);
    const onlyNum = /^[0-9]+(?:\.[0-9])?$/.test(qRaw.trim());
    if (onlyNum) {
      const num = Number(qRaw.replace(',', '.'));
      return allBases.filter(b => {
        if (b.includes(String(num))) return true;
        const e = index[b];
        return e ? e.powers.has(num) : false;
      });
    }
    return allBases.filter(b => b.startsWith(q));
  }

  function mirrorIntoPicker(code) {
    const input = $$(els.pickerInput);
    if (!input) return;
    input.value = code || '';
    input.dispatchEvent(new Event('input', { bubbles:true }));
  }

  // ==== Handlers ====
  function onLegacyInput() {
    const q = ($(els.legacyModel)?.value || '');
    fillSelect($(els.baseSel), filterBases(q), '—');
    refreshVariantsFor('');
  }
  function onLegacyEnter(e) {
    if (e.key !== 'Enter') return;
    const raw = ($(els.legacyModel)?.value || '').trim();
    if (!raw) return;
    const sp = splitModel(raw);
    const code = sp.base ? (sp.base + (sp.variant||'')) : raw;
    finalizeCommit(code, 'legacy-enter');
  }
  function onBaseChange(ev) {
    if (!ev.isTrusted) return;
    const base = norm($(els.baseSel)?.value || '');
    refreshVariantsFor(base);
    mirrorIntoPicker(base);
    log('base=', base, 'variants=', index[base] ? Array.from(index[base].variants) : []);
  }
  function onVariantChange(ev) {
    if (!ev.isTrusted) return;
    const base = norm($(els.baseSel)?.value || '');
    const vari = norm($(els.varSel)?.value || '');
    if (!base) return;
    const code = base + (vari || '');
    finalizeCommit(code, 'bridge-base-variant');
  }

  function finalizeCommit(code, source) {
    mirrorIntoPicker(code);
    log('commit:', code, 'via', source);
    w.dispatchEvent(new CustomEvent('idmar:model-commit', {
      detail: { model: code, commit: true, source }
    }));
  }

  function arm() {
    const legacy = $(els.legacyModel);
    const base   = $(els.baseSel);
    const vari   = $(els.varSel);

    if (legacy && !legacy.__armed_b2) {
      legacy.__armed_b2 = true;
      legacy.addEventListener('input', onLegacyInput);
      legacy.addEventListener('keydown', onLegacyEnter);
    }
    if (base && !base.__armed_b2) {
      base.__armed_b2 = true;
      base.addEventListener('change', onBaseChange);
    }
    if (vari && !vari.__armed_b2) {
      vari.__armed_b2 = true;
      vari.addEventListener('change', onVariantChange);
    }

    // Mostra tudo no arranque
    fillSelect(base, allBases, '—');
    refreshVariantsFor('');
  }

  fetch(V2_URL)
    .then(r => r.json())
    .then(j => { buildIndex(j); arm(); })
    .catch(e => console.warn('[bridge v2] falha a carregar índice', e));
})(window, document);
