// js/engine-picker.js — r5 (catalog v2-aware + local overrides)
(function (w, d) {
  'use strict';

  const DEFAULTS = {
    container: '#engine-picker',
    brandSelectId: 'engineBrand',
    modelInputId: 'engineModel',
    modelDatalistId: 'engineModelList',
    dataUrl: './data/engines_catalog.v2.json',
    i18n: {
      brand: 'Marca',
      model: 'Modelo (pesquisa)',
      placeholder: 'Escreve parte do modelo…'
    }
  };

  const OV_KEY = 'IDMAR_ENGINE_OVERRIDES';

  function el(tag, attrs = {}, kids = []) {
    const e = d.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else e.setAttribute(k, v);
    }
    kids.forEach(k => e.appendChild(k));
    return e;
  }

  function ensureContainer(sel) {
    let root = d.querySelector(sel);
    if (!root) { root = el('div', { id: sel.replace(/^#/, '') }); d.body.appendChild(root); }
    return root;
  }

  async function loadJson(url) {
    const r = await fetch(url, { credentials: 'same-origin' });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.json();
  }

  function dedup(arr) { return Array.from(new Set((arr||[]).filter(Boolean))); }

  function normalizeCatalog(j) {
    if (j && j.brands && typeof j.brands === 'object') {
      const out = [];
      for (const [brandName, brandObj] of Object.entries(j.brands)) {
        const models = [];
        const fams = brandObj?.families || {};
        for (const fam of Object.values(fams)) {
          (fam.versions || []).forEach(v => { const code = (v.version || '').trim(); if (code) models.push(code); });
          (fam.version_options || []).forEach(v => { if (v) models.push(String(v).trim()); });
        }
        out.push({ id: brandName, name: brandName, models: dedup(models) });
      }
      out.sort((a,b)=>a.name.localeCompare(b.name,'en',{numeric:true}));
      out.forEach(b => b.models.sort((a,b)=>a.localeCompare(b,'en',{numeric:true})));
      return { brands: out };
    }
    const raw = Array.isArray(j?.brands) ? j.brands : (Array.isArray(j) ? j : []);
    const brands = raw.map(b => ({
      id: (b.id || b.code || b.name || '').trim(),
      name: (b.name || b.label || b.id || '').trim(),
      models: Array.isArray(b.models) ? b.models.map(x => String(x).trim()) : []
    })).filter(b => b.id);
    return { brands };
  }

  function readOverrides() {
    try { return JSON.parse(localStorage.getItem(OV_KEY) || '{}'); }
    catch(e){ return {}; }
  }

  function applyOverrides(catalog) {
    const ov = readOverrides();
    if (!ov || typeof ov !== 'object') return catalog;

    const byId = new Map(catalog.brands.map(b => [b.id, b]));
    catalog.brands.forEach(b => { if (!byId.has(b.name)) byId.set(b.name, b); });

    for (const [brandName, payload] of Object.entries(ov)) {
      const target = byId.get(brandName) || (() => {
        const nb = { id: brandName, name: brandName, models: [] };
        catalog.brands.push(nb); byId.set(brandName, nb);
        return nb;
      })();

      const addModels = (list) => {
        if (!Array.isArray(list)) return;
        target.models = dedup(target.models.concat(list.map(x => String(x).trim())));
      };

      addModels(payload.model_code_list);
      if (payload.families && typeof payload.families === 'object') {
        for (const fam of Object.values(payload.families)) addModels(fam.model_code_list);
      }
    }

    catalog.brands.sort((a,b) => a.name.localeCompare(b.name,'en',{numeric:true}));
    catalog.brands.forEach(b => b.models.sort((a,b)=> a.localeCompare(b,'en',{numeric:true})));
    return catalog;
  }

  function buildUI(root, opts, catalog) {
    root.innerHTML = '';

    const wrap = el('div', { class: 'engine-picker grid gap-3 md:grid-cols-2' });

    const labBrand = el('label', { for: opts.brandSelectId, class: 'ep-label', text: 'Marca' });
    const brandSel = el('select', { id: opts.brandSelectId, class: 'ep-input' });
    brandSel.appendChild(el('option', { value: '', text: '—' }));
    catalog.brands.forEach(b => brandSel.appendChild(el('option', { value: b.id, text: b.name })));
    const brandBox = el('div', { class: 'ep-field' }, [labBrand, brandSel]);

    const labModel = el('label', { for: opts.modelInputId, class: 'ep-label', text: 'Modelo (pesquisa)' });
    const modelInput = el('input', { id: opts.modelInputId, class: 'ep-input', type: 'text',
      placeholder: 'Escreve parte do modelo…', list: opts.modelDatalistId, autocomplete: 'off' });
    const dataList = el('datalist', { id: opts.modelDatalistId });
    const modelBox = el('div', { class: 'ep-field' }, [labModel, modelInput, dataList]);

    wrap.appendChild(brandBox);
    wrap.appendChild(modelBox);
    root.appendChild(wrap);

    function hydrateModels() {
      const bid = brandSel.value;
      const brand = catalog.brands.find(b => b.id === bid || b.name === bid);
      dataList.innerHTML = '';
      (brand?.models || []).forEach(m => dataList.appendChild(el('option', { value: m })));
    }
    brandSel.addEventListener('change', hydrateModels);

    const legacy = d.querySelector('select[data-engine-field="brand"], #brand, select[name="motor-marca"]');
    if (legacy && !legacy.dataset._boundSync) {
      legacy.dataset._boundSync = '1';
      legacy.addEventListener('change', () => {
        brandSel.value = legacy.value || '';
        brandSel.dispatchEvent(new Event('change'));
      });
    }

    w.EnginePickerState = {
      get brand(){ return brandSel.value; },
      get model(){ return modelInput.value; }
    };

    hydrateModels();
  }

  let _opts = null, _root = null;
  async function init(userOpts = {}) {
    _opts = Object.assign({}, DEFAULTS, userOpts);
    _root = ensureContainer(_opts.container);

    try {
      const raw = await loadJson(_opts.dataUrl);
      let cat = normalizeCatalog(raw);
      cat = applyOverrides(cat);
      buildUI(_root, _opts, cat);
      console.log('[IDMAR] EnginePicker pronto (v2 + overrides).');
    } catch (err) {
      console.error('[IDMAR][engine_picker] falha:', err);
      _root.innerHTML = '<div class="ep-error">Não foi possível carregar o catálogo de motores.</div>' +
                        '<div class="ep-hint">Verifica data/engines_catalog.v2.json.</div>';
    }
  }

  w.addEventListener('idmar:engine-overrides-changed', () => {
    if (_opts) init(_opts);
  });

  w.EnginePicker = { init };
})(window, document);
