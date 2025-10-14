// js/engine-picker.js (robust r4)
(function (w, d) {
  'use strict';

  const DEFAULTS = {
    container: '#engine-picker',
    brandSelectId: 'engineBrand',
    modelInputId: 'engineModel',
    modelDatalistId: 'engineModelList',
    dataUrl: './data/engines_catalog.v1.json',
    i18n: { brand: 'Marca', model: 'Modelo (pesquisa)', placeholderModel: 'Escreve parte do modelo…' }
  };

  function el(tag, attrs = {}, kids = []) {
    const e = d.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') e.className = v;
      else if (k === 'text') e.textContent = v;
      else e.setAttribute(k, v);
    });
    kids.forEach(k => e.appendChild(k));
    return e;
  }

  // SUBSTITUI isto no teu ficheiro js/engine-picker.js

// PATCH: aceitar brands como OBJETO (map) além de array
async function loadCatalog(url) {
  const res = await fetch(url, { credentials: 'same-origin' });
  if (!res.ok) throw new Error('Catalog load failed: ' + res.status + ' ' + res.statusText);
  const j = await res.json();

  // 1) tentar várias “caixas” conhecidas
  let raw = null;

  // array raiz
  if (Array.isArray(j)) raw = j;

  // brands como array
  else if (Array.isArray(j.brands)) raw = j.brands;

  // brands como OBJETO (map)
  else if (j.brands && typeof j.brands === 'object') {
    raw = Object.entries(j.brands).map(([id, b]) => ({ id, ...(b || {}) }));
  }

  // data.brands como array
  else if (j.data && Array.isArray(j.data.brands)) raw = j.data.brands;

  // data.brands como OBJETO (map)
  else if (j.data && j.data.brands && typeof j.data.brands === 'object') {
    raw = Object.entries(j.data.brands).map(([id, b]) => ({ id, ...(b || {}) }));
  }

  // manufacturers (array)
  else if (Array.isArray(j.manufacturers)) raw = j.manufacturers;

  // manufacturers como OBJETO (map)
  else if (j.manufacturers && typeof j.manufacturers === 'object') {
    raw = Object.entries(j.manufacturers).map(([id, b]) => ({ id, ...(b || {}) }));
  }

  if (!Array.isArray(raw) || raw.length === 0) {
    console.error('[IDMAR][engine_picker] unexpected catalog shape:', j);
    throw new Error('No brands array found in catalog');
  }

  // 2) normalização
  const norm = raw.map(b => {
    const id = (b.id || b.code || b.slug || b.name || '').toString().trim();
    const name = (b.name || b.label || id).toString().trim();

    // models pode ser array… ou OBJETO (map)
    let models = b.models || b.variants || b.items || [];
    if (!Array.isArray(models) && models && typeof models === 'object') {
      models = Object.values(models);
    }

    return { id, name, models };
  }).filter(b => b.id);

  return { brands: norm };
}

  function ensureContainer(sel) {
    var root = d.querySelector(sel);
    if (!root) {
      root = el('div', { id: sel.replace(/^#/, '') });
      d.body.appendChild(root);
    }
    return root;
  }

  function buildUI(root, opts, catalog) {
    root.innerHTML = '';

    var wrap = el('div', { class: 'engine-picker grid gap-3 md:grid-cols-2' });

    var labBrand = el('label', { for: opts.brandSelectId, class: 'ep-label', text: opts.i18n.brand });
    var brandSel = el('select', { id: opts.brandSelectId, class: 'ep-input' });
    brandSel.appendChild(el('option', { value: '', text: '—' }));
    catalog.brands.forEach(function(b){ brandSel.appendChild(el('option', { value: b.id, text: b.name })); });

    var brandBox = el('div', { class: 'ep-field' }, [labBrand, brandSel]);

    var labModel = el('label', { for: opts.modelInputId, class: 'ep-label', text: opts.i18n.model });
    var modelInput = el('input', { id: opts.modelInputId, class: 'ep-input', type: 'text', placeholder: opts.i18n.placeholderModel, list: opts.modelDatalistId, autocomplete: 'off' });
    var dataList = el('datalist', { id: opts.modelDatalistId });
    var modelBox = el('div', { class: 'ep-field' }, [labModel, modelInput, dataList]);

    wrap.appendChild(brandBox);
    wrap.appendChild(modelBox);
    root.appendChild(wrap);

    return { brandSel: brandSel, modelInput: modelInput, dataList: dataList };
  }

  function hydrateModels(list, brand) {
    list.innerHTML = '';
    if (!brand || !Array.isArray(brand.models)) return;
    brand.models.forEach(function(m){
      var t = (typeof m === 'string') ? m : (m.name || m.label || JSON.stringify(m));
      if (t && t.trim()) list.appendChild(el('option', { value: t.trim() }));
    });
  }

  function byId(brands, id) {
    var low = (id || '').toLowerCase();
    return brands.find(function(b){ return b.id === id; }) || brands.find(function(b){ return (b.name || '').toLowerCase() === low; });
  }

  async function init(userOpts = {}) {
    const opts = Object.assign({}, DEFAULTS, userOpts);
    const root = ensureContainer(opts.container);
    try {
      const cat = await loadCatalog(opts.dataUrl);
      const ui = buildUI(root, opts, cat);

      ui.brandSel.addEventListener('change', function(){
        hydrateModels(ui.dataList, byId(cat.brands, ui.brandSel.value));
      });

      // Sync com select legado se existir
      const legacy = d.querySelector('select[data-engine-field="brand"], #brand, select[name="motor-marca"]');
      if (legacy && !legacy.dataset._boundSync) {
        legacy.dataset._boundSync = '1';
        legacy.addEventListener('change', function(){
          ui.brandSel.value = legacy.value || '';
          ui.brandSel.dispatchEvent(new Event('change'));
        });
      }

      // Expor estado
      w.EnginePickerState = {
        get brand(){ return ui.brandSel.value; },
        get model(){ return ui.modelInput.value; }
      };

    } catch (err) {
      console.error('[IDMAR][engine_picker] failed:', err);
      const errBox = d.createElement('div');
      errBox.className = 'ep-error';
      errBox.textContent = 'Não foi possível carregar o catálogo de motores.';
      const hint = d.createElement('div');
      hint.className = 'ep-hint';
      hint.textContent = 'Verifica data/engines_catalog.v*.json.';
      root.innerHTML = '';
      root.appendChild(errBox);
      root.appendChild(hint);
    }
  }

  w.EnginePicker = { init };
})(window, document);
