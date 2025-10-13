// engine_picker.v2.1.js — tolera schema v1 e v2 e loga diagnóstico
(function(){
  const $ = s => document.querySelector(s);
  const el = id => document.getElementById(id);
  const C = (...a)=>console.log('[engine_picker]', ...a);

  async function loadCatalog(url){
    const r = await fetch(url);
    if(!r.ok) throw new Error('fetch '+url+' → '+r.status);
    return r.json();
  }
  const uniq = a => Array.from(new Set(a));

  function mount(label,id){
    const wrap = document.createElement('div');
    const lab = document.createElement('label'); lab.htmlFor=id; lab.textContent=label;
    const sel = document.createElement('select'); sel.id=id;
    wrap.append(lab, sel);
    return {wrap, sel};
  }
  function fill(sel, arr, ph='— selecione —'){
    sel.innerHTML='';
    const opt0 = document.createElement('option'); opt0.value=''; opt0.textContent=ph; sel.appendChild(opt0);
    (arr||[]).forEach(v=>{ const o=document.createElement('option'); o.value=String(v); o.textContent=String(v); sel.appendChild(o); });
  }

  function attachV2(container, catalog){
    const brand = el('brand')?.value;
    const fams = Object.keys(catalog.brands?.[brand]?.families || {});
    C('schema v2 ok; brand=', brand, 'families=', fams);

    container.innerHTML='';
    const boxes = {
      fam: mount('Família / Family','eng_family'),
      hp:  mount('Potência (hp)','eng_hp'),
      rig: mount('Comando / Rigging','eng_rig'),
      sh:  mount('Altura de coluna / Shaft','eng_shaft'),
      rot: mount('Rotação','eng_rot'),
      col: mount('Cor / Color','eng_color'),
      gc:  mount('Gearcase','eng_gear'),
      yr:  mount('Ano / Year','eng_year'),
      mdl: mount('Modelo / Model code','eng_model'),
    };
    Object.values(boxes).forEach(b=>container.appendChild(b.wrap));
    fill(boxes.fam.sel, fams);

    function getFam(){
      const f = boxes.fam.sel.value;
      return catalog.brands?.[brand]?.families?.[f] || null;
    }
    function yearsRange(range){
      if(!Array.isArray(range)||range.length!==2) return [];
      const [a,b]=range; const out=[]; for(let y=a;y<=b;y++) out.push(y); return out;
    }
    function variantsFor(f){
      if (Array.isArray(f.variants) && f.variants.length) return f.variants;
      return (f.hp||[]).map(h=>({hp:h, rigging:f.rigging||[], shaft:f.shaft||[], rotation:f.rotation||[], color:f.color||[], gearcase:f.gearcase||[] }));
    }
    function refresh(){
      const f = getFam();
      if(!f){
        ['hp','rig','sh','rot','col','gc','yr','mdl'].forEach(k=>fill(boxes[k].sel,[]));
        return;
      }
      const v = variantsFor(f);
      const allHP   = uniq((f.hp||[]).concat(v.map(x=>x.hp).filter(Boolean)));
      const allRig  = uniq((f.rigging||[]).concat(...v.map(x=>x.rigging||[])));
      const allS    = uniq((f.shaft||[]).concat(...v.map(x=>x.shaft||[])));
      const allRot  = uniq((f.rotation||[]).concat(...v.map(x=>x.rotation||[])));
      const allCol  = uniq((f.color||[]).concat(...v.map(x=>x.color||[])));
      const allGC   = uniq((f.gearcase||[]).concat(...v.map(x=>x.gearcase||[])));
      const codes   = uniq(v.map(x=>x.code).filter(Boolean));
      fill(boxes.hp.sel,  allHP);
      fill(boxes.rig.sel, allRig);
      fill(boxes.sh.sel,  allS);
      fill(boxes.rot.sel, allRot);
      fill(boxes.col.sel, allCol);
      fill(boxes.gc.sel,  allGC);
      fill(boxes.yr.sel,  yearsRange(f.years));
      fill(boxes.mdl.sel, codes);

      // sincroniza com os teus inputs de pesquisa
      const inpModel = $('[data-engine-field=model_code], #srch_model');
      const inpPower = $('[data-engine-field=power], #srch_power');
      function sync(){
        if(inpModel && boxes.mdl.sel.value) inpModel.value = boxes.mdl.sel.value;
        if(inpPower && boxes.hp.sel.value)  inpPower.value = boxes.hp.sel.value;
      }
      [boxes.hp.sel, boxes.mdl.sel].forEach(s=>s.addEventListener('change', sync));
      sync();
    }
    boxes.fam.sel.addEventListener('change', refresh);
    refresh();

    // Se mudar a marca, refaz famílias
    el('brand')?.addEventListener('change', ()=>{
      const fams2 = Object.keys(catalog.brands?.[el('brand').value]?.families || {});
      fill(boxes.fam.sel, fams2);
      ['hp','rig','sh','rot','col','gc','yr','mdl'].forEach(k=>fill(boxes[k].sel,[]));
    });
  }

  function attachV1(container, catalog){
    // fallback para schema v1 (brand-level apenas)
    const brand = el('brand')?.value;
    const b = catalog.brands?.[brand];
    C('schema v1 fallback; brand=', brand, 'keys=', Object.keys(b||{}));
    container.innerHTML='';
    const boxes = {
      hp:  mount('Potência (hp)','eng_hp'),
      rig: mount('Comando / Rigging','eng_rig'),
      sh:  mount('Altura de coluna / Shaft','eng_shaft'),
      rot: mount('Rotação','eng_rot'),
    };
    Object.values(boxes).forEach(bx=>container.appendChild(bx.wrap));
    const hp = (b?.power_hp_range and isinstance(b['power_hp_range'], list)) and [f"{b['power_hp_range'][0]}–{b['power_hp_range'][1]}"] or [];
    const rig = b.get('rigging', []);
    const sh  = b.get('shaft_options', []);
    const rot = ['STD','CCW'];
    fill(boxes.hp.sel, hp);
    fill(boxes.rig.sel, rig);
    fill(boxes.sh.sel, sh);
    fill(boxes.rot.sel, rot);
  }

  async function boot(){
    const script = document.currentScript;
    const url = script?.dataset?.catalog || 'data/engines_catalog.json';
    let cat;
    try { cat = await loadCatalog(url); }
    catch(e){ console.error('[engine_picker] erro a carregar catálogo:', e); return; }

    const target = document.getElementById('brandDynamic');
    if(!target){ console.warn('[engine_picker] #brandDynamic não encontrado'); return; }

    const v = Number(cat.schema_version||1);
    C('catalog schema_version =', v, 'url=', url);
    if (v >= 2) attachV2(target, cat);
    else attachV1(target, cat);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();