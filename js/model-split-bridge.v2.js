// js/model-split-bridge.v2.js — v2.6 (suporta 2 esquemas de catálogo + detecção robusta + UX)
(function (w, d) {
  const DEBUG = true;
  const CATALOG_URL = 'data/engines_catalog.v2.json';

  // IDs/campos no DOM
  const els = {
    legacyModel: 'srch_model',      // input "Modelo (pesquisa)"
    baseSel:     'modelBaseList',   // select Modelo base
    varSel:      'modelVariantList' // select Variante / sufixo
  };

  const $  = (id)  => d.getElementById(id);
  const $$ = (sel) => d.querySelector(sel);
  const log = (...a) => DEBUG && console.log('[split-bridge v2.6]', ...a);
  const warn = (...a) => console.warn('[split-bridge v2.6]', ...a);

  // index = { BASE: { variants:Set, versions:Set, powers:Set } }
  let index = {};
  let allBases = [];

  // ===== util =====
  const norm = (s) => String(s || '').trim().toUpperCase().replace(/\s+/g, '');

  function splitModel(code) {
    // aceita F9.9, F115B, F150, XF450, XTO450, etc.
    const m = norm(code).replace(/\(.*?\)/g, '').split('/')[0];
    // letras + números (opcional .número) seguidos de letras (variante)
    const re = /^([A-Z]+[0-9]+(?:\.[0-9])?)([A-Z]*)$/;
    const mm = m.match(re);
    return mm ? { base: mm[1], variant: mm[2] || '' } : { base: '', variant: '' };
  }

  function addToIndex(base, variant, power) {
    if (!base) return;
    const e = index[base] || (index[base] = { variants: new Set(), versions: new Set(), powers: new Set() });
    if (variant != null) e.variants.add(String(variant));
    if (typeof power === 'number' && !Number.isNaN(power)) e.powers.add(power);
  }

  // ===== builders por esquema =====
  function buildFromSchemaV2_readable(j) {
    // {"schema":"engines_catalog.v2",brands.Yamaha.families.{..}.versions[ {version,power} ]}
    const fams = j?.brands?.Yamaha?.families || {};
    let count = 0;
    Object.values(fams).forEach(fam => {
      (fam.versions || []).forEach(v => {
        const ver = v.version || '';
        const sp = splitModel(ver);
        if (!sp.base) return;
        addToIndex(sp.base, sp.variant, v.power);
        index[sp.base].versions.add(ver);
        count++;
      });
    });
    log('build: schema=engines_catalog.v2 | versions lidas =', count);
  }

  function buildFromSchemaVersion2_compact(j) {
    // {"schema_version":2, brands.Yamaha.families.{..}.variants[] || hp[]}
    const fams = j?.brands?.Yamaha?.families || {};
    let made = 0, hpSynth = 0;
    Object.values(fams).forEach(fam => {
      if (Array.isArray(fam.variants) && fam.variants.length) {
        fam.variants.forEach(v => {
          const code = v.code || '';
          const sp = splitModel(code);
          if (!sp.base) return;
          addToIndex(sp.base, sp.variant, v.hp);
          if (code) index[sp.base].versions.add(code);
          made++;
        });
      } else if (Array.isArray(fam.hp) && fam.hp.length) {
        // sem variants: sintetizamos bases tipo F{hp}
        fam.hp.forEach(hpVal => {
          const power = Number(hpVal);
          if (Number.isFinite(power)) {
            const base = 'F' + String(power).replace('.','.');
            addToIndex(base, '', power);
            index[base].versions.add(base);
            hpSynth++;
          }
        });
      }
    });
    log('build: schema_version=2 | variants=', made, '| bases sintetizadas por hp=', hpSynth);
  }

  function buildIndexFromCatalog(j) {
    index = {};
    // detetar esquema
    if (j && j.schema === 'engines_catalog.v2') {
      buildFromSchemaV2_readable(j);
    } else if (j && j.schema_version === 2) {
      buildFromSchemaVersion2_compact(j);
    } else {
      // fallback heurístico: tenta o “readable”; se nada, tenta “compact”
      buildFromSchemaV2_readable(j);
      if (!Object.keys(index).length) buildFromSchemaVersion2_compact(j);
    }
    allBases = Object.keys(index).sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
    if (!allBases.length) warn('ATENÇÃO: índice vazio. Verifica o ficheiro', CATALOG_URL, 'e o esquema/paths.');
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
    if (!base || !index[base]) { fillSelect(sel, [], '—'); return; }
    const list = Array.from(index[base].variants).sort((a,b)=>a.localeCompare(b));
    fillSelect(sel, list, '—');
  }

  // ===== filtragem =====
  function filterBases(qRaw) {
    if (!qRaw) return []; // não lista tudo; só aparece após digitar
    const q = norm(qRaw);

    // só números (aceita vírgula p/ 9,9)
    if (/^[0-9]+(?:[.,][0-9])?$/.test(qRaw.trim())) {
      const num = Number(qRaw.replace(',', '.'));
      return allBases.filter(b => {
        if (b.includes(String(num))) return true;      // contém dígitos na base (ex.: F40)
        const e = index[b];
        return e ? e.powers.has(num) : false;          // bate na potência
      });
    }

    // alfanumérico: CONTAINS (mais tolerante)
    return allBases.filter(b => b.includes(q));
  }

  // ===== ligação ao EnginePicker (só para sugestões; não comita, não foca) =====
  function getPickerInput() {
    // tenta vários seletores para ser resiliente
    return (
      $('#engineModel') ||
      $$('#engine-picker input#engineModel') ||
      $$('#engine-picker input[type="text"]') ||
      $$('#engine-picker input')
    );
  }

  function mirrorIntoPicker(text) {
    const input = getPickerInput();
    if (!input) return;
    input.value = text || '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // ===== commit -> deixa o model-meta-wire tratar da ficha e de focar o SN =====
  function finalizeCommit(code, source) {
    if (!code) return;
    mirrorIntoPicker(code); // para manter o picker sincronizado visualmente
    log('commit:', code, 'via', source);
    w.dispatchEvent(new CustomEvent('idmar:model-commit', {
      detail: { model: code, commit: true, source }
    }));
  }

  // ===== handlers =====
  function onLegacyInput() {
    const q = ($(els.legacyModel)?.value || '');
    const bases = filterBases(q);
    fillSelect($(els.baseSel), bases, '—');
    refreshVariantsFor('');
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
    if (!ev.isTrusted) return;
    const base = norm($(els.baseSel)?.value || '');
    refreshVariantsFor(base);
    mirrorIntoPicker(base);
  }

  function onVariantChange(ev) {
    if (!ev.isTrusted) return;
    const base = norm($(els.baseSel)?.value || '');
    const vari = norm($(els.varSel)?.value || '');
    if (!base) return;
    finalizeCommit(base + (vari || ''), 'bridge-base-variant');
  }

  // ===== armar =====
  function arm() {
    const legacy = $(els.legacyModel);
    const base   = $(els.baseSel);
    const vari   = $(els.varSel);

    if (!legacy) warn('Elemento não encontrado:', els.legacyModel);
    if (!base)   warn('Elemento não encontrado:', els.baseSel);
    if (!vari)   warn('Elemento não encontrado:', els.varSel);

    if (legacy && !legacy.__armed_sb) {
      legacy.__armed_sb = true;
      legacy.addEventListener('input', onLegacyInput);
      legacy.addEventListener('keydown', onLegacyEnter); // ENTER = commit
    }
    if (base && !base.__armed_sb) {
      base.__armed_sb = true;
      base.addEventListener('change', onBaseChange);
    }
    if (vari && !vari.__armed_sb) {
      vari.__armed_sb = true;
      vari.addEventListener('change', onVariantChange);
    }

    // inicia vazios
    if (base) fillSelect(base, [], '—');
    refreshVariantsFor('');
  }

  // ===== boot =====
  fetch(CATALOG_URL)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status} ao ler ${CATALOG_URL}`);
      return r.json();
    })
    .then(j => {
      buildIndexFromCatalog(j);
      arm();
      log('OK: catálogo carregado, bases=', allBases.length);
    })
    .catch(e => {
      warn('Falha a carregar catálogo:', e);
      // ainda assim arma handlers para não quebrar a página
      arm();
    });

})(window, document);
