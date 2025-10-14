// js/engine-family-picker.v1.js
// IDMAR — constrain Version & Power by brand/model; show Serial ranges (families v1)
(function(w, d){
  'use strict';

  const CFG = {
    dataUrl: './data/engine_families.v1.json',
    versionSelectId: 'engineVersion',
    powerSelectId: 'enginePower',
    serialPanelId: 'engineSerialInfo',
    brandSource: () => w.EnginePickerState?.brand || d.getElementById('engineBrand')?.value || '',
    modelSource: () => w.EnginePickerState?.model || d.getElementById('engineModel')?.value || ''
  };

  const state = { catalog:null };

  function el(tag, attrs={}, kids=[]){
    const e = d.createElement(tag);
    for (const [k,v] of Object.entries(attrs)) {
      if (k==='class') e.className = v;
      else if (k==='text') e.textContent = v;
      else e.setAttribute(k,v);
    }
    kids.forEach(k => e.appendChild(k));
    return e;
  }

  async function loadCatalog(){
    const res = await fetch(CFG.dataUrl, { credentials:'same-origin' });
    if (!res.ok) throw new Error('families catalog not found: ' + res.status);
    state.catalog = await res.json();
  }

  function brandKey(s){
    const v = (s||'').toLowerCase();
    if (v.includes('yamaha')) return 'yamaha';
    if (v.includes('honda')) return 'honda';
    return null;
  }

  function findFamily(cat, brandKey, model){
    const b = (cat.brands || []).find(x => x.id === brandKey);
    if (!b) return null;
    const fam = (b.families || []).find(x => (x.model || '').toLowerCase() === (model||'').toLowerCase());
    return fam || null;
  }

  function hydrateVersions(family, select){
    select.innerHTML = '';
    select.appendChild(el('option', {value:'', text:'—'}));
    if (!family) return;
    (family.versions || []).forEach(v => {
      select.appendChild(el('option', {value: v.code, text: v.code + (v.years ? (' ['+v.years+']') : '')}));
    });
  }

  function hydratePowers(version, select){
    select.innerHTML = '';
    select.appendChild(el('option', {value:'', text:'—'}));
    if (!version) return;
    (version.power_options_hp || []).forEach(hp => {
      select.appendChild(el('option', {value: String(hp), text: hp + ' hp'}));
    });
  }

  function showSerials(version, panel){
    panel.innerHTML = '';
    if (!version) return;
    const list = el('ul', {class:'ef-serials'});
    (version.serial_ranges || []).forEach(sr => {
      const pretty = (sr.prefix ? sr.prefix+'-' : '') + (sr.from || '') + ' … ' + (sr.to || '');
      list.appendChild(el('li', {text: pretty}));
    });
    panel.appendChild(el('div', {class:'ef-label', text:'Intervalos de SN (conhecidos):'}));
    panel.appendChild(list);
    if (version.notes) panel.appendChild(el('div', {class:'ef-notes', text: version.notes}));
  }

  function bindUI(){
    const verSel = d.getElementById(CFG.versionSelectId);
    const powSel = d.getElementById(CFG.powerSelectId);
    const snPanel = d.getElementById(CFG.serialPanelId);
    if (!verSel || !powSel || !snPanel) return;

    function refresh(){
      const bKey = brandKey(CFG.brandSource());
      const model = CFG.modelSource();
      const fam = findFamily(state.catalog, bKey, model);
      hydrateVersions(fam, verSel);
      powSel.innerHTML = '<option value=\"\">—</option>';
      snPanel.innerHTML = '';
    }

    verSel.addEventListener('change', () => {
      const bKey = brandKey(CFG.brandSource());
      const model = CFG.modelSource();
      const fam = findFamily(state.catalog, bKey, model);
      const version = (fam?.versions || []).find(v => v.code === verSel.value);
      hydratePowers(version, powSel);
      showSerials(version, snPanel);
    });

    // Do an initial refresh
    refresh();

    // Also refresh when legacy selects change (if present)
    const brandSel = d.getElementById('engineBrand');
    const modelInput = d.getElementById('engineModel');
    brandSel && brandSel.addEventListener('change', refresh);
    modelInput && modelInput.addEventListener('input', refresh);
  }

  async function init(){
    if (!state.catalog) await loadCatalog();
    bindUI();
  }

  w.EngineFamilyPicker = { init };
  w.addEventListener('DOMContentLoaded', () => { init().catch(console.error); });
})(window, document);
