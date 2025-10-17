// js/engine-picker.js — robust r5 (v2 + overrides + sync legado, sem mexer no foco)
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
      placeholderModel: 'Escreve parte do modelo…'
    }
  };

  const OV_KEY_V2 = 'IDMAR_ENGINE_OVERRIDES_V2'; // usado pelo admin

  // ————— utils —————
  const el = (tag, attrs = {}, kids = []) => {
    const e = d.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else e.setAttribute(k, v);
    }
    kids.forEach(k => e.appendChild(k));
    return e;
  };
  const ensureContainer = (sel) => {
    let root = d.querySelector(sel);
    if (!root) { root = el('div', { id: sel.replace(/^#/, '') }); d.body.appendChild(root); }
    return root;
  };
  const uniq = (arr) => Array.from(new Set(arr));

  // ————— carga + merge v2 —————
  function mergeCatalogV2(base, overrides) {
    if (!overrides || overrides.schema !== 'engines_catalog.v2') return base;
    base = base && typeof base === 'object' ? base : { schema: 'engines_catalog.v2', brands: {} };
    base.schema = 'engines_catalog.v2';
    base.brands = base.brands || {};
    const ob = overrides.brands || {};
    for (const brand of Object.keys(ob)) {
      base.brands[brand] = base.brands[brand] || { families: {} };
      const fams = ob[brand]?.families || {};
      for (const fname of Object.keys(fams)) {
        base.brands[brand].families[fname] = fams[fname];
      }
    }
    return base;
  }

  async function fetchJson(url) {
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('Catalog load failed: ' + res.status + ' ' + res.statusText);
    return res.json();
  }

  async function loadRawCatalog(url) {
    let j = await fetchJson(url);
    let ov = null;
    try { ov = JSON.parse(localStorage.getItem(OV_KEY_V2) || 'null'); } catch (_) {}
    if (ov && ov.schema === 'engines_catalog.v2') j = mergeCatalogV2(j, ov);
    return j;
  }

  // ————— normalização para picker —————
  function normalizeToBrandsArray(j) {
    if (j && j.schema === 'engines_catalog.v2') {
      const out = [];
      const brandsMap = j.brands || {};
      for (const [brandId, bnode] of Object.entries(brandsMap)) {
        const families = (bnode && bnode.families) || {};
        const models = [];
        for (const fname of Object.keys(families)) {
          const fam = families[fname] || {};
          const versions = Array.isArray(fam.versions) ? fam.versions : [];
          versions.forEach(v => {
            const vcode = (v && (v.version || v.code)) || '';
            if (vcode) models.push(String(vcode).trim());
          });
          const vopts = Array.isArray(fam.version_options) ? fam.version_options : [];
          vopts.forEach(v => { if (v) models.push(String(v).trim()); });
        }
        out.push({ id: brandId, name: brandId, models: uniq(models) });
      }
      return { brands: out };
    }

    // retro (v1 etc.)
    let raw = null;
    if (Array.isArray(j)) raw = j;
    else if (Array.isArray(j?.brands)) raw = j.brands;
    else if (j?.brands && typeof j.brands === 'object') {
      raw = Object.entries(j.brands).map(([id, b]) => ({ id, ...(b || {}) }));
    } else if (Array.isArray(j?.data?.brands)) raw = j.data.brands;
    else if (j?.data?.brands && typeof j.data.brands === 'object') {
      raw = Object.entries(j.data.brands).map(([id, b]) => ({ id, ...(b || {}) }));
    } else if (Array.isArray(j?.manufacturers)) raw = j.manufacturers;
    else if (j?.manufacturers && typeof j.manufacturers === 'object') {
      raw = Object.entries(j.manufacturers).map(([id, b]) => ({ id, ...(b || {}) }));
    }
    if (!Array.isArray(raw) || raw.length === 0) {
      console.error('[IDMAR][engine_picker] unexpected catalog shape:', j);
      throw new Error('No brands array found in catalog');
    }
    const norm = raw.map(b => {
      const id = (b.id || b.code || b.slug || b.name || '').toString().trim();
      const name = (b.name || b.label || id).toString().trim();
      let models = b.models || b.variants || b.items || [];
      if (!Array.isArray(models) && models && typeof models === 'object') models = Object.values(models);
      models = models.map(m => {
        if (typeof m === 'string') return m;
        if (m && (m.version || m.code || m.name || m.label)) return String(m.version || m.code || m.name || m.label);
        try { return JSON.stringify(m); } catch { return ''; }
      }).filter(Boolean);
      return { id, name, models: uniq(models) };
    }).filter(b => b.id);
    return { brands: norm };
  }

  async function loadCatalog(url) {
    const raw = await loadRawCatalog(url);
    return normalizeToBrandsArray(raw);
  }

  // ————— UI —————
  function buildUI(root, opts, catalog) {
    root.innerHTML = '';
    const wrap = el('div', { class: 'engine-picker grid gap-3 md:grid-cols-2' });

    const labBrand = el('label', { for: opts.brandSelectId, class: 'ep-label', text: opts.i18n.brand });
    const brandSel = el('select', { id: opts.brandSelectId, class: 'ep-input' });
    brandSel.appendChild(el('option', { value: '', text: '—' }));
    catalog.brands.forEach(b => brandSel.appendChild(el('option', { value: b.id, text: b.name })));
    const brandBox = el('div', { class: 'ep-field' }, [labBrand, brandSel]);

    const labModel = el('label', { for: opts.modelInputId, class: 'ep-label', text: opts.i18n.model });
    const modelInput = el('input', {
      id: opts.modelInputId, class: 'ep-input', type: 'text',
      placeholder: opts.i18n.placeholderModel, list: opts.modelDatalistId, autocomplete: 'off'
    });
    const dataList = el('datalist', { id: opts.modelDatalistId });
    const modelBox = el('div', { class: 'ep-field' }, [labModel, modelInput, dataList]);

    wrap.appendChild(brandBox);
    wrap.appendChild(modelBox);
    root.appendChild(wrap);
    return { brandSel, modelInput, dataList };
  }

  function hydrateModels(list, brand) {
    list.innerHTML = '';
    if (!brand || !Array.isArray(brand.models)) return;
    const models = [...brand.models].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
    models.forEach(m => list.appendChild(el('option', { value: m })));
  }

  const findBrandByIdOrName = (brands, idOrName) => {
    const id = (idOrName || '').trim();
    const low = id.toLowerCase();
    return brands.find(b => b.id === id) || brands.find(b => (b.name || '').toLowerCase() === low) || null;
  };

  async function init(userOpts = {}) {
    const opts = Object.assign({}, DEFAULTS, userOpts);
    const root = ensureContainer(opts.container);
    try {
      const cat = await loadCatalog(opts.dataUrl);
      const ui = buildUI(root, opts, cat);

      // 1) brand → datalist
      ui.brandSel.addEventListener('change', () => {
        const b = findBrandByIdOrName(cat.brands, ui.brandSel.value);
        hydrateModels(ui.dataList, b);
      });

      // 2) sync 2-vias com #brand legado
      const legacy = d.querySelector('select[data-engine-field="brand"], #brand, select[name="motor-marca"]');
      if (legacy && !legacy.dataset._boundSync) {
        legacy.dataset._boundSync = '1';
        legacy.addEventListener('change', () => {
          ui.brandSel.value = legacy.value || '';
          ui.brandSel.dispatchEvent(new Event('change'));
        });
        ui.brandSel.addEventListener('change', () => {
          if (legacy.value !== ui.brandSel.value) {
            legacy.value = ui.brandSel.value;
            legacy.dispatchEvent(new Event('change'));
          }
        });
        if (legacy.value) {
          ui.brandSel.value = legacy.value;
          ui.brandSel.dispatchEvent(new Event('change'));
        }
      }

      // 3) estado público
      w.EnginePickerState = {
        get brand(){ return ui.brandSel.value; },
        get model(){ return ui.modelInput.value; }
      };

      console.log('[IDMAR] EnginePicker pronto (v2-aware).');
    } catch (err) {
      console.error('[IDMAR][engine_picker] failed:', err);
      const errBox = el('div', { class: 'ep-error', text: 'Não foi possível carregar o catálogo de motores.' });
      const hint = el('div', { class: 'ep-hint', text: 'Verifica data/engines_catalog.v2.json e/ou overrides locais.' });
      root.innerHTML = ''; root.appendChild(errBox); root.appendChild(hint);
    }
  }

  w.EnginePicker = { init };
})(window, document);
