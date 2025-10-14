// js/engine-family-picker.v1.js  (policy-enabled)
(function (w, d) {
  'use strict';
  const CFG = {
    dataUrl: './data/engine_families.v1.json',
    versionSelectId: 'engineVersion',
    powerSelectId: 'enginePower',
    serialPanelId: 'engineSerialInfo',
    brandSource: () =>
      w.EnginePickerState?.brand ||
      d.getElementById('engineBrand')?.value ||
      d.getElementById('brand')?.value || '',
    modelSource: () =>
      w.EnginePickerState?.model ||
      d.getElementById('engineModel')?.value ||
      d.getElementById('srch_model')?.value || '',
    baseInputId: 'engineBase',
    varInputId:  'engineVariant'
  };

  const S = { cat: null };
  const norm = s => (s || '').toString().trim().toLowerCase();

  function el(tag, attrs = {}, kids = []) {
    const e = d.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) =>
      k === 'class' ? (e.className = v) :
      k === 'text'  ? (e.textContent = v) :
      e.setAttribute(k, v)
    );
    kids.forEach(k => e.appendChild(k));
    return e;
  }

  async function loadCatalog() {
    const r = await fetch(CFG.dataUrl, { credentials: 'same-origin' });
    if (!r.ok) throw new Error('families catalog not found: ' + r.status);
    S.cat = await r.json();
  }

  function pickBrand(cat, brandName) {
    const bn = norm(brandName);
    if (!bn) return null;
    const brands = Array.isArray(cat?.brands) ? cat.brands : [];
    return brands.find(b => {
      const id = norm(b.id);
      const name = norm(b.name || b.label);
      return id === bn || name === bn || id.includes(bn) || name.includes(bn);
    }) || null;
  }

  function pickFamily(brandObj, modelStr) {
    if (!brandObj) return null;
    const m = (modelStr || '').toString().trim().toUpperCase();
    const families = Array.isArray(brandObj.families) ? brandObj.families : [];
    return families.find(f => {
      const base = (f.model || f.code || '').toString().trim().toUpperCase();
      return base && (m === base || m.startsWith(base));
    }) || null;
  }

  function familyRules(fam) {
    return {
      suffixRe: fam?.suffix_regex ? new RegExp(fam.suffix_regex, 'i') : null,
      suffixExamples: Array.isArray(fam?.suffix_examples) ? fam.suffix_examples : []
    };
  }

  function validateVariant(family, base, variant) {
    const rules = familyRules(family);
    const v = (variant || '').trim().toUpperCase();
    if (!rules.suffixRe) return { ok: true, code: (base||'').toUpperCase() + v };
    const ok = rules.suffixRe.test(v);
    return { ok, code: (base||'').toUpperCase() + v, examples: rules.suffixExamples };
  }

  function hydrateVersions(family, sel) {
    sel.innerHTML = '';
    sel.appendChild(el('option', { value: '', text: '—' }));
    if (!family) return;
    (family.versions || []).forEach(v => {
      const years = Array.isArray(v.years) && v.years.length ? ` [${v.years.join(', ')}]` : '';
      sel.appendChild(el('option', { value: v.code, text: (v.code || '') + years }));
    });
  }

  function hydratePowers(version, sel) {
    sel.innerHTML = '';
    sel.appendChild(el('option', { value: '', text: '—' }));
    if (!version) return;
    const powers = Array.isArray(version.power_options_hp)
      ? version.power_options_hp
      : (Array.isArray(version.powers) ? version.powers : []);
    powers.forEach(hp => sel.appendChild(el('option', { value: String(hp), text: `${hp} hp` })));
  }

  function renderRanges(version, panel) {
    panel.innerHTML = '';
    if (!version) return;
    const ul = el('ul');
    (version.serial_ranges || []).forEach(sr => {
      const pfx = sr.prefix ? (sr.prefix + '-') : '';
      const pretty = `${pfx}${sr.from} … ${pfx}${sr.to}`;
      ul.appendChild(el('li', { text: sr.note ? `${pretty} (${sr.note})` : pretty }));
    });
    panel.appendChild(el('div', { class: 'ef-label', text: 'Intervalos de SN (conhecidos):' }));
    panel.appendChild(ul);
    if (version.notes) panel.appendChild(el('div', { class: 'ef-notes', text: version.notes }));
  }

  function setFamilyState(brand, family, version, powerSel) {
    const power = powerSel?.value
      ? Number(powerSel.value)
      : (Array.isArray(version?.power_options_hp) ? version.power_options_hp[0] : null);

    // expõe política da MARCA para o painel do SN
    w.CurrentBrandPolicy = brand?.serial_policy || null;

    w.EngineFamilyState = {
      family: (family?.model || family?.code || null),
      version: (version?.code || null),
      power: power || null,
      ranges: Array.isArray(version?.serial_ranges) ? version.serial_ranges : []
    };
  }

  function bindUI() {
    const vSel = d.getElementById(CFG.versionSelectId);
    const pSel = d.getElementById(CFG.powerSelectId);
    const snPanel = d.getElementById(CFG.serialPanelId);
    const baseEl = d.getElementById(CFG.baseInputId);
    const varEl  = d.getElementById(CFG.varInputId);
    if (!vSel || !pSel || !snPanel) return;

    function refresh() {
      const brand = pickBrand(S.cat, CFG.brandSource());
      const family = pickFamily(brand, baseEl?.value || CFG.modelSource());
      hydrateVersions(family, vSel);
      pSel.innerHTML = '<option value="">—</option>';
      snPanel.innerHTML = '';
      setFamilyState(brand, family, null, pSel);

      // se tiver base/variante, tenta auto-selecionar versão
      const base = (baseEl?.value || '').toUpperCase();
      const variant = (varEl?.value || '').toUpperCase();
      if (base) {
        const res = validateVariant(family, base, variant);
        if (res.ok) {
          const opt = [...vSel.options].find(o => o.value === res.code);
          if (opt) { vSel.value = opt.value; vSel.dispatchEvent(new Event('change')); }
        }
      }
    }

    vSel.addEventListener('change', () => {
      const brand = pickBrand(S.cat, CFG.brandSource());
      const family = pickFamily(brand, baseEl?.value || CFG.modelSource());
      const version = (family?.versions || []).find(v => v.code === vSel.value);
      hydratePowers(version, pSel);
      renderRanges(version, snPanel);
      setFamilyState(brand, family, version, pSel);
    });

    pSel.addEventListener('change', () => {
      if (w.EngineFamilyState) {
        w.EngineFamilyState.power = Number(pSel.value || w.EngineFamilyState.power || 0) || null;
      }
    });

    // refresh inicial e em alterações (picker e legados)
    const brandPick = d.getElementById('engineBrand');
    const modelPick = d.getElementById('engineModel');
    const brandLegacy = d.getElementById('brand');
    const modelLegacy = d.getElementById('srch_model');
    [brandPick, modelPick, brandLegacy, modelLegacy, baseEl, varEl].forEach(el => {
      if (el) el.addEventListener('input', refresh);
      if (el) el.addEventListener('change', refresh);
    });

    refresh();
  }

  async function init() {
    try { await loadCatalog(); } catch (e) { console.warn('[families] load fail:', e); return; }
    bindUI();
  }

  w.EngineFamilyPicker = { init };
  w.addEventListener('DOMContentLoaded', () => { init().catch(console.error); });
})(window, document);
