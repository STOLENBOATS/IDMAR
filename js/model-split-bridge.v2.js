// js/model-split-bridge.v2.js — v2.6 (catálogo v2 + pesquisa por base/potência + auto-commit)
(function (w, d) {
  const DEBUG = true;
  const V2_URL = 'data/engines_catalog.v2.json';
  const els = {
    legacyModel: 'srch_model',     // input "Modelo (pesquisa)"
    baseSel:     'modelBaseList',  // select "Modelo base"
    varSel:      'modelVariantList',// select "Variante / sufixo"
    pickerInput: '#engine-picker input#engineModel' // input interno do EnginePicker
  };

  const $  = (id) => d.getElementById(id);
  const $$ = (sel) => d.querySelector(sel);
  const log = (...a) => { if (DEBUG) console.log('[split-bridge v2.6]', ...a); };

  // Estado
  let index = null;        // { BASE: { variants:Set, powers:Set } }
  let allBases = [];       // lista ordenada de bases (F40, F115, …)

  const norm = (s) => String(s||'').trim().toUpperCase().replace(/\s+/g,'');

  // F40, F115B, F9.9, F200G/GE → { base:'F40'|'F115'|'F9.9'|'F200', variant:''|'B'|'G/GE' }
  function splitModel(code){
    const m = norm(code).replace(/\(.*?\)/g,'').split('/')[0]; // remove parenteses e split “F200G/GE”
    const re = /^([A-Z]+[0-9]+(?:\.[0-9])?)([A-Z]*)$/;
    const mm = m.match(re);
    return mm ? { base:mm[1], variant:mm[2]||'' } : { base:'', variant:'' };
  }

  function buildIndex(v2){
    const fams = v2?.brands?.Yamaha?.families || {};
    const out = {};
    Object.values(fams).forEach(fam => {
      (fam.versions || []).forEach(v => {
        const ver = v.version || '';
        const sp  = splitModel(ver);
        if (!sp.base) return;
        const e = out[sp.base] || (out[sp.base] = { variants:new Set(), powers:new Set() });
        if (sp.variant) e.variants.add(sp.variant);
        if (typeof v.power === 'number') e.powers.add(v.power);
      });
    });
    index = out;
    allBases = Object.keys(out).sort((a,b)=>a.localeCompare(b,'en',{numeric:true}));
    log('build: schema=engines_catalog.v2 | bases', allBases.length);
  }

  function fillSelect(sel, values, placeholder){
    if (!sel) return;
    const opts = [`<option value="">${placeholder||'—'}</option>`]
      .concat((values||[]).map(v=>`<option value="${v}">${v||'—'}</option>`));
    sel.innerHTML = opts.join('');
  }

  function refreshVariantsFor(base){
    const sel = $(els.varSel);
    if (!sel) return;
    if (!base || !index[base]) { fillSelect(sel, [], '—'); return; }
    const list = Array.from(index[base].variants.values()).sort((a,b)=>a.localeCompare(b));
    fillSelect(sel, list, '—');
  }

  // Pesquisa: texto “F40” → prefixo; número “40” / “9.9” cruza com base e com powers
  function filterBases(qRaw){
    if (!qRaw) return [];
    const q = norm(qRaw);
    const onlyNum = /^[0-9]+(?:[.,][0-9])?$/.test((qRaw||'').trim());
    if (onlyNum){
      const num = Number(String(qRaw).replace(',', '.'));
      return allBases.filter(b => {
        if (b.includes(String(num))) return true;
        const e = index[b]; return e ? e.powers.has(num) : false;
      });
    }
    return allBases.filter(b => b.startsWith(q));
  }

  function mirrorIntoPicker(code){
    const input = $$(els.pickerInput);
    if (!input) return;
    input.value = code || '';
    input.dispatchEvent(new Event('input', { bubbles:true }));
  }

  function finalizeCommit(code, source){
    const model = (code||'').trim();
    if (!model) return;
    mirrorIntoPicker(model);
    log('commit:', model, 'via', source);
    w.dispatchEvent(new CustomEvent('idmar:model-commit', {
      detail: { model, commit:true, source }
    }));
  }

  // ===== Handlers =====
  function onLegacyInput(){
    const q = ($(els.legacyModel)?.value || '');
    const baseSel = $(els.baseSel);
    const matches = filterBases(q);

    // Preenche lista de bases consoante a pesquisa
    fillSelect(baseSel, matches, '—');
    refreshVariantsFor('');
    mirrorIntoPicker(q);

    // UX: se o agente já escreveu algo e só há 1 base possível → commit imediato
    if (q.trim() && matches.length === 1){
      finalizeCommit(matches[0], 'legacy-single-base');
    }
  }

  function onLegacyEnter(e){
    if (e.key !== 'Enter') return;
    const raw = ($(els.legacyModel)?.value || '').trim();
    if (!raw) return;
    const sp = splitModel(raw);
    const code = sp.base ? (sp.base + (sp.variant||'')) : raw;
    finalizeCommit(code, 'legacy-enter');
  }

  function onBaseChange(ev){
    if (!ev.isTrusted) return;
    const base = norm($(els.baseSel)?.value || '');
    refreshVariantsFor(base);
    mirrorIntoPicker(base);

    // se não houver variantes, ou só houver 1 → commit
    const variants = index[base] ? Array.from(index[base].variants) : [];
    if (!variants.length || variants.length === 1){
      const code = base + (variants[0] ? String(variants[0]).toUpperCase() : '');
      finalizeCommit(code, 'bridge-auto-variant');
    }
  }

  function onVariantChange(ev){
    if (!ev.isTrusted) return;
    const base = norm($(els.baseSel)?.value || '');
    const vari = norm($(els.varSel)?.value || '');
    if (!base) return;
    finalizeCommit(base + (vari||''), 'bridge-base-variant');
  }

  function arm(){
    const legacy = $(els.legacyModel);
    const base   = $(els.baseSel);
    const vari   = $(els.varSel);

    if (legacy && !legacy.__armed_v26){
      legacy.__armed_v26 = true;
      legacy.addEventListener('input', onLegacyInput);
      legacy.addEventListener('keydown', onLegacyEnter);
    }
    if (base && !base.__armed_v26){
      base.__armed_v26 = true;
      base.addEventListener('change', onBaseChange);
    }
    if (vari && !vari.__armed_v26){
      vari.__armed_v26 = true;
      vari.addEventListener('change', onVariantChange);
    }

    // Arranque: não despejar tudo; lista aparece quando há input
    fillSelect(base, [], '—');
    refreshVariantsFor('');
  }

  fetch(V2_URL)
    .then(r => r.json())
    .then(j => { buildIndex(j); arm(); log('OK: catálogo carregado, bases=', allBases.length); })
    .catch(e => console.warn('[split-bridge v2.6] falha a carregar', e));

})(window, document);
