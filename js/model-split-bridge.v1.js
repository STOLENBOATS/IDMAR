// js/model-split-bridge.v1.js
(function (w, d) {
  'use strict';

  const FAMILIES_URL = './data/engine_families.v1.json';
  let famIdx = null; // {brand:{ base:{ versions:[...], variants:[...] } }}

  // helpers
  const norm = s => (s || '').toString().trim();
  const up   = s => norm(s).toUpperCase();

  function getBrand() {
    return up(
      w.EnginePickerState?.brand ||
      d.getElementById('engineBrand')?.value ||
      d.getElementById('brand')?.value || ''
    );
  }

  function getModelInput() {
    return d.getElementById('srch_model') || d.getElementById('engineModel') || null;
  }

  function composeModel(base, variant) {
    base    = up(base);
    variant = up(variant);
    return variant ? (base + variant) : base;
  }

  function setHiddenBaseVariant(base, variant) {
    const be = d.getElementById('engineBase');
    const ve = d.getElementById('engineVariant');
    if (be) be.value = up(base || '');
    if (ve) ve.value = up(variant || '');
  }

  async function buildIndex() {
    if (famIdx !== null) return famIdx;
    famIdx = {};
    const r = await fetch(FAMILIES_URL, { credentials: 'same-origin' });
    if (!r.ok) return famIdx;
    const j = await r.json();

    (j.brands || []).forEach(b => {
      const bid = up(b.id || b.name || '');
      if (!bid) return;
      const byBase = {};
      (b.families || []).forEach(f => {
        const base = up(f.model || f.code || '');
        if (!base) return;
        const variants = new Set();
        const versions = (f.versions || []).map(v => {
          const vcode = up(v.code || '');
          let suf = '';
          if (vcode && base && vcode.startsWith(base)) {
            suf = vcode.slice(base.length);
          }
          if (suf) variants.add(suf);
          return { code: vcode, power: v.power_options_hp || v.powers || [], ranges: v.serial_ranges || [] };
        });
        byBase[base] = { versions, variants: Array.from(variants).sort() };
      });
      famIdx[bid] = byBase;
    });

    return famIdx;
  }

  function fillBaseList(baseList, brandBases) {
    baseList.innerHTML = '<option value=\"\">—</option>';
    Object.keys(brandBases).sort().forEach(base => {
      const opt = d.createElement('option');
      opt.value = base; opt.textContent = base;
      baseList.appendChild(opt);
    });
  }

  function fillVariantList(variantList, variants) {
    variantList.innerHTML = '<option value=\"\">—</option>';
    (variants || []).forEach(v => {
      const opt = d.createElement('option');
      opt.value = v; opt.textContent = v;
      variantList.appendChild(opt);
    });
  }

  function selectVersionExact(code) {
    const vSel = d.getElementById('engineVersion');
    if (!vSel) return false;
    const opt = [...vSel.options].find(o => up(o.value) === up(code));
    if (opt) {
      vSel.value = opt.value;
      vSel.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }
    return false;
  }

  function hydrateFamiliesToPicker() {
    // força o engine-family-picker a refrescar (ele lê #engineBase/#engineVariant)
    const base = d.getElementById('engineBase')?.value || '';
    const variant = d.getElementById('engineVariant')?.value || '';
    const modelInput = getModelInput();
    if (modelInput) modelInput.value = composeModel(base, variant);
    d.dispatchEvent(new Event('input', { bubbles: true }));
    d.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function init() {
    await buildIndex();

    const baseList = d.getElementById('modelBaseList');
    const varList  = d.getElementById('modelVariantList');
    if (!baseList || !varList) return;

    function refreshSuggestions() {
      const brand = getBrand();
      const brandIdx = famIdx[brand] || {};
      fillBaseList(baseList, brandIdx);
      // reset variantes
      fillVariantList(varList, []);
      setHiddenBaseVariant('', '');
      hydrateFamiliesToPicker();
    }

    function onBaseChange() {
      const brand = getBrand();
      const brandIdx = famIdx[brand] || {};
      const base = up(baseList.value);
      const variants = (brandIdx[base]?.variants || []);
      fillVariantList(varList, variants);
      setHiddenBaseVariant(base, '');
      hydrateFamiliesToPicker();
    }

    function onVariantChange() {
      const base = up(baseList.value);
      const variant = up(varList.value);
      const full = composeModel(base, variant);
      setHiddenBaseVariant(base, variant);
      hydrateFamiliesToPicker();
      // tenta selecionar a versão exata (se existir no catálogo)
      selectVersionExact(full);
    }

    // quando o utilizador muda a marca → refaz sugestões
    const pickerBrand = d.getElementById('engineBrand');
    const legacyBrand = d.getElementById('brand');
    [pickerBrand, legacyBrand].forEach(el => {
      if (!el) return;
      el.addEventListener('change', refreshSuggestions);
      el.addEventListener('input', refreshSuggestions);
    });

    baseList.addEventListener('change', onBaseChange);
    varList.addEventListener('change', onVariantChange);

    // arranque
    refreshSuggestions();
  }

  w.addEventListener('DOMContentLoaded', init);
})(window, document);
