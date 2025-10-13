// engine_picker.v2.3.2.js — enriched v1 + overrides + brand change + stable sorting
(function(){
  const el = id => document.getElementById(id);
  const C = (...a)=>console.log('[engine_picker]', ...a);
  const OV_KEY = 'IDMAR_ENGINE_OVERRIDES';
  async function loadJSON(url){ const r = await fetch(url, {cache:'no-store'}); if(!r.ok) throw new Error(url+': '+r.status); return r.json(); }
  function uniq(a){ return Array.from(new Set(a)); }
  function mount(label,id){
    const w=document.createElement('div');
    const l=document.createElement('label'); l.htmlFor=id; l.textContent=label;
    const s=document.createElement('select'); s.id=id;
    w.append(l,s); return {wrap:w,sel:s};
  }
  function stableSort(arr){
    if(!Array.isArray(arr)) return [];
    const copy = [...arr];
    // if all numeric -> sort numeric; else string sort
    const allNum = copy.every(v => typeof v === 'number' || (!isNaN(Number(v)) && v !== ''));
    if(allNum) return copy.map(Number).sort((a,b)=>a-b);
    return copy.map(String).sort((a,b)=>a.localeCompare(b,'pt',{numeric:true,sensitivity:'base'}));
  }
  function fill(sel, arr, ph='— selecione / select —'){
    sel.innerHTML='';
    const o0=document.createElement('option'); o0.value=''; o0.textContent=ph; sel.appendChild(o0);
    (arr||[]).forEach(v=>{ 
      const o=document.createElement('option'); 
      if(typeof v==='object' && v && 'value' in v){
        o.value=String(v.value); o.textContent=String(v.label??v.value);
      }else{
        o.value=String(v); o.textContent=String(v);
      }
      sel.appendChild(o);
    });
  }
  function mergeOverrides(b, brand){
    try{
      const raw=localStorage.getItem(OV_KEY); if(!raw) return b;
      const map=JSON.parse(raw||'{}'); const ov=map[brand]; if(!ov) return b;
      const out={...b};
      ['hp_list','model_code_list','displacement_list','year_list','rigging','shaft_options'].forEach(k=>{
        if(Array.isArray(ov[k])){ const base=Array.isArray(out[k])?out[k]:[]; out[k]=uniq(base.concat(ov[k])); }
      });
      return out;
    }catch(e){ return b; }
  }
  function attachV1(container, catalog){
    const brand = el('brand')?.value;
    let b = catalog.brands?.[brand] || {}; b = mergeOverrides(b, brand);
    C('render brand=', brand, 'keys=', Object.keys(b));
    container.innerHTML='';
    const mk=(lbl,id)=>mount(lbl,id);
    const boxes={ 
      hp:mk('Potência (hp)','eng_hp'),
      rig:mk('Comando / Rigging','eng_rig'),
      sh:mk('Altura de coluna / Shaft','eng_shaft'),
      rot:mk('Rotação / Rotation (hélice / propeller)','eng_rot')
    };
    const hasM=Array.isArray(b.model_code_list)&&b.model_code_list.length;
    const hasD=Array.isArray(b.displacement_list)&&b.displacement_list.length;
    const hasY=Array.isArray(b.year_list)&&b.year_list.length;
    if(hasM) boxes.mdl=mk('Modelo / Model code','eng_model');
    if(hasD) boxes.disp=mk('Cilindrada (cc)','eng_disp');
    if(hasY) boxes.yr=mk('Ano / Year','eng_year');
    Object.values(boxes).forEach(x=>container.appendChild(x.wrap));
    let hpOptions=[]; 
    if(Array.isArray(b.hp_list)&&b.hp_list.length){ hpOptions = stableSort(b.hp_list); } 
    else if(Array.isArray(b.power_hp_range)){ hpOptions=[`${b.power_hp_range[0]}–${b.power_hp_range[1]}`]; }
    const rigOptions = stableSort(Array.isArray(b.rigging)?b.rigging:[]);
    const shOptions  = stableSort(Array.isArray(b.shaft_options)?b.shaft_options:[]);
    const rotOptions=[
      {value:'STD', label:'STD — rotação normal (clockwise)'},
      {value:'CCW', label:'CCW — contra-rotação (counter-rotating)'}
    ];
    fill(boxes.hp.sel,hpOptions);
    fill(boxes.rig.sel,rigOptions);
    fill(boxes.sh.sel,shOptions);
    fill(boxes.rot.sel,rotOptions);
    if(boxes.mdl)  fill(boxes.mdl.sel,  stableSort(b.model_code_list));
    if(boxes.disp) fill(boxes.disp.sel, stableSort(b.displacement_list));
    if(boxes.yr)   fill(boxes.yr.sel,   stableSort(b.year_list));
    const inpModel=document.querySelector('[data-engine-field=model_code], #srch_model');
    const inpPower=document.querySelector('[data-engine-field=power], #srch_power');
    const inpDisp=document.querySelector('[data-engine-field=displacement], #srch_disp');
    const inpYear=document.querySelector('[data-engine-field=year], #srch_year');
    function sync(){
      if(inpModel && boxes.mdl && boxes.mdl.sel.value) inpModel.value=boxes.mdl.sel.value;
      if(inpPower && boxes.hp.sel.value)               inpPower.value=boxes.hp.sel.value;
      if(inpDisp  && boxes.disp && boxes.disp.sel.value) inpDisp.value=boxes.disp.sel.value;
      if(inpYear  && boxes.yr   && boxes.yr.sel.value)   inpYear.value=boxes.yr.sel.value;
    }
    ['hp','mdl','disp','yr'].forEach(k=>{ if(boxes[k]) boxes[k].sel.addEventListener('change', sync); });
    sync();
  }
  async function boot(){ 
    const s=document.currentScript; const url=s?.dataset?.catalog || 'data/engines_catalog.v1.enriched.json'; 
    let cat; try{ cat=await loadJSON(url); }catch(e){ console.error('[engine_picker] erro catálogo:', e); return; }
    const target=document.getElementById('brandDynamic'); if(!target){ console.warn('[engine_picker] #brandDynamic não encontrado'); return; }
    attachV1(target, cat);
    // re-render ao trocar de marca (garantir 1 listener)
    const brandSel = el('brand');
    if(brandSel && !brandSel.dataset.pickerBound){
      brandSel.addEventListener('change', ()=>attachV1(target, cat));
      brandSel.dataset.pickerBound = '1';
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();