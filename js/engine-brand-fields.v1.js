// js/engine-brand-fields.v1.js
(function(w,d){
  'use strict';
  const CFG = w.IDMAR_BRAND_CONFIG || { brands:{} };
  const CONTAINER_ID = 'engine-brand-fields';
  const BRAND_SELECT_ID = 'engineBrand';

  function el(tag, attrs={}, kids=[]){
    const e = d.createElement(tag);
    for (const [k,v] of Object.entries(attrs)){
      if (k==='class') e.className = v;
      else if (k==='text') e.textContent = v;
      else e.setAttribute(k,v);
    }
    kids.forEach(k=>e.appendChild(k));
    return e;
  }

  function getBrandKey(raw){
    if (!raw) return null;
    const s = raw.toString().trim().toLowerCase();
    if (s.includes('yamaha')) return 'yamaha';
    if (s.includes('honda')) return 'honda';
    return null;
    }

  function renderFields(root, brandKey){
    root.innerHTML = '';
    if (!brandKey || !CFG.brands[brandKey]){
      root.appendChild(el('div',{class:'eb-hint', text:'Selecione uma marca para ver campos específicos.'}));
      return;
    }
    const B = CFG.brands[brandKey];
    const wrap = el('div',{class:'eb-grid'});
    B.fields.forEach(f => {
      const box = el('div',{class:'eb-field'});
      box.appendChild(el('label',{for:f.id, class:'eb-label', text:f.label + (f.required?' *':'')}));
      let input;
      if (f.type==='select'){
        input = el('select',{id:f.id, class:'eb-select'});
        input.appendChild(el('option',{value:'', text:'—'}));
        (f.options||[]).forEach(opt => input.appendChild(el('option',{value:opt, text:opt})));
      } else if (f.type==='textarea'){
        input = el('textarea',{id:f.id, class:'eb-textarea', placeholder:f.placeholder||''});
        input.rows = 3;
      } else {
        input = el('input',{id:f.id, class:'eb-input', type:f.type||'text', placeholder:f.placeholder||''});
        if (f.pattern) input.setAttribute('pattern', f.pattern);
      }
      box.appendChild(input);
      if (f.help) box.appendChild(el('div',{class:'eb-help', text:f.help}));
      wrap.appendChild(box);
    });
    root.appendChild(wrap);
    const outlet = el('div',{id:'engine-brand-validation', class:'eb-error'});
    root.appendChild(outlet);
  }

  function collectForm(root){
    const data = {};
    root.querySelectorAll('input,select,textarea').forEach(i => data[i.id] = i.value || '');
    return data;
  }

  function validate(root, brandKey){
    const outlet = root.querySelector('#engine-brand-validation');
    if (!brandKey) { outlet.textContent=''; return true; }
    const B = CFG.brands[brandKey];
    if (!B || !B.rules || !B.rules.validate) { outlet.textContent=''; return true; }
    const res = B.rules.validate(collectForm(root));
    outlet.textContent = res.ok ? '' : ('⚠ ' + res.issues.join(' • '));
    return res.ok;
  }

  function bind(){
    const brandSel = d.getElementById(BRAND_SELECT_ID);
    const root = d.getElementById(CONTAINER_ID);
    if (!brandSel || !root) return;

    const refresh = () => {
      const key = getBrandKey(brandSel.value);
      renderFields(root, key);
      validate(root, key);
      w.EngineBrandState = {
        brandKey: key,
        get data(){ return collectForm(root); }
      };
    };

    brandSel.addEventListener('change', refresh);
    root.addEventListener('input', () => validate(root, w.EngineBrandState?.brandKey));

    refresh();
  }

  w.addEventListener('DOMContentLoaded', bind);
})(window, document);
