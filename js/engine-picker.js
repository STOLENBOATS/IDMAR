// js/engine-picker.js (r1)
// IDMAR — Engine Picker (brands + model search) with schema_v2 support
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
      placeholderModel: 'Escreve parte do modelo…',
    }
  };

  const log = (...a) => console.info('[IDMAR][engine_picker]', ...a);

  function createEl(tag, attrs = {}, children = []) {
    const el = d.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else el.setAttribute(k, v);
    });
    children.forEach(c => el.appendChild(c));
    return el;
  }

  async function loadCatalog(url) {
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`Catalog load failed: ${res.status} ${res.statusText}`);
    const json = await res.json();
    const sv = json.schema_version || json.schemaVersion || null;
    const brands = json.brands || (json.data && json.data.brands) || json.manufacturers || [];
    if (!Array.isArray(brands) || brands.length === 0) {
      throw new Error('No brands array found in catalog');
    }
    const normBrands = brands.map(b => {
      const id = (b.id || b.code || b.slug || b.name || '').toString().trim();
      const name = (b.name || b.label || id).toString().trim();
      const models = b.models || b.variants || b.items || [];
      return { id, name, models };
    }).filter(b => b.id);
    return { schema_version: sv, brands: normBrands };
  }

  function buildUI(root, opts, catalog) {
    root.innerHTML = '';

    const wrapper = createEl('div', { class: 'engine-picker grid gap-3 md:grid-cols-2' });

    const brandLabel = createEl('label', { for: opts.brandSelectId, class: 'ep-label', text: opts.i18n.brand });
    const brandSel = createEl('select', { id: opts.brandSelectId, class: 'ep-input' });
    brandSel.appendChild(createEl('option', { value: '', text: '—' }));
    catalog.brands.forEach(b => brandSel.appendChild(createEl('option', { value: b.id, text: b.name })));

    const brandBox = createEl('div', { class: 'ep-field' }, [brandLabel, brandSel]);

    const modelLabel = createEl('label', { for: opts.modelInputId, class: 'ep-label', text: opts.i18n.model });
    const modelInput = createEl('input', {
      id: opts.modelInputId,
      class: 'ep-input',
      type: 'text',
      placeholder: opts.i18n.placeholderModel,
      list: opts.modelDatalistId,
      autocomplete: 'off'
    });
    const dataList = createEl('datalist', { id: opts.modelDatalistId });
    const modelBox = createEl('div', { class: 'ep-field' }, [modelLabel, modelInput, dataList]);

    wrapper.appendChild(brandBox);
    wrapper.appendChild(modelBox);
    root.appendChild(wrapper);

    return { brandSel, modelInput, dataList };
  }

  function hydrateModels(dataList, brand) {
    dataList.innerHTML = '';
    if (!brand || !Array.isArray(brand.models)) return;
    brand.models.forEach(m => {
      const text = typeof m === 'string' ? m : (m.name || m.label || JSON.stringify(m));
      if (text && text.trim()) {
        const opt = document.createElement('option');
        opt.value = text.trim();
        dataList.appendChild(opt);
      }
    });
  }

  function byId(brands, id) {
    return brands.find(b => b.id === id) || brands.find(b => (b.name || '').toLowerCase() === id.toLowerCase());
  }

  async function init(userOpts = {}) {
    const opts = Object.assign({}, DEFAULTS, userOpts);
    const root = d.querySelector(opts.container);
    if (!root) { log('container not found:', opts.container); return; }
    try {
      log('schema_version 2 url', opts.dataUrl);
      const catalog = await loadCatalog(opts.dataUrl);
      log('brands loaded:', catalog.brands.length);

      const ui = buildUI(root, opts, catalog);

      ui.brandSel.addEventListener('change', () => {
        const sel = ui.brandSel.value;
        const brand = byId(catalog.brands, sel);
        hydrateModels(ui.dataList, brand);
      });

      const legacyBrand = d.querySelector('select[name="motor-marca"], #motorMarca, #marcaMotor');
      if (legacyBrand && !legacyBrand.dataset._boundSync) {
        legacyBrand.dataset._boundSync = '1';
        legacyBrand.addEventListener('change', () => {
          const v = legacyBrand.value;
          if (v) {
            ui.brandSel.value = v;
            ui.brandSel.dispatchEvent(new Event('change'));
          }
        });
      }

      w.EnginePickerState = {
        get brand() { return ui.brandSel.value; },
        get model() { return ui.modelInput.value; }
      };

    } catch (err) {
  console.error('[IDMAR][engine_picker] failed:', err);
  const errBox = document.createElement('div');
  errBox.className = 'ep-error';
  errBox.textContent = 'Não foi possível carregar o catálogo de motores.';
  const hint = document.createElement('div');
  hint.className = 'ep-hint';
  hint.textContent = 'Verifica data/engines_catalog.v2.json.';
  root.innerHTML = '';
  root.appendChild(errBox);
  root.appendChild(hint);
}
  }

  w.EnginePicker = { init };
})(window, document);
