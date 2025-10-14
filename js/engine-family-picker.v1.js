// js/engine-family-picker.v1.js
(function(w, d){
  'use strict';

  const CFG = {
    dataUrl: './data/engine_families.v1.json',
    versionSelectId: 'engineVersion',
    powerSelectId: 'enginePower',
    serialPanelId: 'engineSerialInfo',
    brandSource: function(){ return w.EnginePickerState && w.EnginePickerState.brand || d.getElementById('engineBrand')?.value || ''; },
    modelSource: function(){ return w.EnginePickerState && w.EnginePickerState.model || d.getElementById('engineModel')?.value || ''; }
  };

  const state = { catalog:null };

  function el(tag, attrs, kids){
    attrs = attrs || {}; kids = kids || [];
    const e = d.createElement(tag);
    for (const kv of Object.entries(attrs)){
      const k = kv[0], v = kv[1];
      if (k==='class') e.className = v;
      else if (k==='text') e.textContent = v;
      else e.setAttribute(k,v);
    }
    kids.forEach(function(k){ e.appendChild(k); });
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

  function findFamily(cat, bkey, model){
    const b = (cat.brands||[]).find(function(x){ return x.id === bkey; });
    if (!b) return null;
    const fam = (b.families||[]).find(function(x){ return (x.model||'').toLowerCase() === (model||'').toLowerCase(); });
    return fam || null;
  }

  function hydrateVersions(family, select){
    select.innerHTML = '';
    select.appendChild(el('option', {value:'', text:'—'}));
    if (!family) return;
    (family.versions||[]).forEach(function(v){
      select.appendChild(el('option', {value: v.code, text: v.code + (v.years ? (' ['+v.years+']') : '')}));
    });
  }

  function hydratePowers(version, select){
    select.innerHTML = '';
    select.appendChild(el('option', {value:'', text:'—'}));
    if (!version) return;
    (version.power_options_hp||[]).forEach(function(hp){
      select.appendChild(el('option', {value: String(hp), text: hp + ' hp'}));
    });
  }

  function showSerials(version, panel){
    panel.innerHTML = '';
    if (!version) return;
    const ul = el('ul', {class:'ef-serials'});
    (version.serial_ranges||[]).forEach(function(sr){
      const pretty = (sr.prefix ? sr.prefix+'-' : '') + (sr.from || '') + ' … ' + (sr.to || '');
      ul.appendChild(el('li', {text: pretty}));
    });
    panel.appendChild(el('div', {class:'ef-label', text:'Intervalos de SN (conhecidos):'}));
    panel.appendChild(ul);
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

    verSel.addEventListener('change', function(){
      const bKey = brandKey(CFG.brandSource());
      const model = CFG.modelSource();
      const fam = findFamily(state.catalog, bKey, model);
      const version = (fam && fam.versions || []).find(function(v){ return v.code === verSel.value; });
      hydratePowers(version, powSel);
      showSerials(version, snPanel);
    });

    refresh();
    const brandSel = d.getElementById('engineBrand');
    const modelInput = d.getElementById('engineModel');
    if (brandSel) brandSel.addEventListener('change', refresh);
    if (modelInput) modelInput.addEventListener('input', refresh);
  }

  async function init(){
    if (!state.catalog) await loadCatalog();
    bindUI();
  }

  w.EngineFamilyPicker = { init: init };
  w.addEventListener('DOMContentLoaded', function(){ init().catch(console.error); });
})(window, document);
