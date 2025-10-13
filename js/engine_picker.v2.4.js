// engine_picker.v2.4.js — suporta schema v2 (famílias/variantes) + fallback v1; PT/EN
(function(){
  const el = id => document.getElementById(id);
  const C = (...a)=>console.log('[engine_picker]', ...a);
  async function loadJSON(url){ const r=await fetch(url,{cache:'no-store'}); if(!r.ok) throw new Error(url+': '+r.status); return r.json(); }
  function uniq(a){ return Array.from(new Set(a)); }
  function stableSort(arr){
    if(!Array.isArray(arr)) return [];
    const copy=[...arr];
    const allNum=copy.every(v=>typeof v==='number'||(!isNaN(Number(v))&&v!==''));
    if(allNum) return copy.map(Number).sort((a,b)=>a-b);
    return copy.map(String).sort((a,b)=>a.localeCompare(b,'pt',{numeric:true,sensitivity:'base'}));
  }
  function makeSelect(label,id){
    const wrap=document.createElement('div');
    const lab=document.createElement('label'); lab.htmlFor=id; lab.textContent=label;
    const sel=document.createElement('select'); sel.id=id;
    wrap.append(lab, sel); return {wrap, sel};
  }
  function fill(sel, arr, ph='— selecione / select —'){
    sel.innerHTML='';
    const o0=document.createElement('option'); o0.value=''; o0.textContent=ph; sel.appendChild(o0);
    (arr||[]).forEach(v=>{
      const o=document.createElement('option');
      if(typeof v==='object'&&v&&'value'in v){ o.value=String(v.value); o.textContent=String(v.label??v.value); }
      else{ o.value=String(v); o.textContent=String(v); }
      sel.appendChild(o);
    });
  }

  // ===== Rotação: rótulos bilingues + tooltip curto =====
  function relabelRotationSelect(selectEl){
    if(!selectEl) return;
    Array.from(selectEl.options).forEach(opt=>{
      const v = String(opt.value || '').toUpperCase().trim();
      if(!v) return; // placeholder

      // Normalizar rótulos conhecidos
      if (v === 'STD' || v === 'RH' || v === 'CW') {
        opt.textContent = 'STD — Standard (RH)'; // PT/EN no mesmo rótulo
        opt.title       = 'Rotação padrão / Standard (hélice direita / right-hand)';
        opt.value       = 'STD';
      } else if (v === 'CCW' || v === 'LH' || v === 'ANTI' || v === 'COUNTER') {
        opt.textContent = 'CCW — Counter-clockwise (LH)';
        opt.title       = 'Rotação inversa / Counter-clockwise (hélice esquerda / left-hand)';
        opt.value       = 'CCW';
      } else {
        // fallback: deixa como está, mas acrescenta título bilingue genérico
        if(!opt.title) opt.title = 'Rotação / Rotation';
      }
    });
  }

// === Overrides locais (IDMAR_ENGINE_OVERRIDES) ===
function loadOverrides(){
  try{ return JSON.parse(localStorage.getItem('IDMAR_ENGINE_OVERRIDES')||'{}'); }
  catch(_){ return {}; }
}

function mergeArraysUniq(base, add){
  const A = Array.isArray(base) ? base : [];
  const B = Array.isArray(add)  ? add  : [];
  return Array.from(new Set([...A, ...B])).filter(v => v!=='' && v!=null);
}

/**
 * Suporta:
 * - v1 (brand level): hp_list, rigging, shaft_options, rotation, model_code_list, displacement_list, year_list
 * - v2 (brand.families[fam]): mesmas listas mas com nomes “*_list”; mapeadas para campos do renderer v2
 */
function mergeOverrides(cat, ov){
  if(!ov || typeof ov!=='object') return cat;
  cat.brands = cat.brands || {};

  for(const brand of Object.keys(ov)){
    cat.brands[brand] = cat.brands[brand] || {};
    const dstB = cat.brands[brand];
    const srcB = ov[brand] || {};

    // v1 brand-level
    const v1Keys = ['hp_list','rigging','shaft_options','rotation','model_code_list','displacement_list','year_list'];
    v1Keys.forEach(k=>{
      if(srcB[k]) dstB[k] = mergeArraysUniq(dstB[k], srcB[k]);
    });

    // v2 families
    dstB.families = dstB.families || {};
    const fams = srcB.families || {};
    for(const famName of Object.keys(fams)){
      const srcF = fams[famName] || {};
      const dstF = (dstB.families[famName] = dstB.families[famName] || {});

      // mapear nomes “*_list” do admin para campos que o renderer v2 usa
      // renderer usa: hp, rigging, shaft, rotation, color, gearcase, codes, years
      if(srcF.hp_list)            dstF.hp          = mergeArraysUniq(dstF.hp,          srcF.hp_list);
      if(srcF.rigging)            dstF.rigging     = mergeArraysUniq(dstF.rigging,     srcF.rigging);
      if(srcF.shaft_options)      dstF.shaft       = mergeArraysUniq(dstF.shaft,       srcF.shaft_options);
      if(srcF.rotation)           dstF.rotation    = mergeArraysUniq(dstF.rotation,    srcF.rotation);
      if(srcF.model_code_list)    dstF.codes       = mergeArraysUniq(dstF.codes,       srcF.model_code_list);
      if(srcF.displacement_list)  dstF.displacement= mergeArraysUniq(dstF.displacement,srcF.displacement_list);
      if(srcF.year_list)          dstF.years       = mergeArraysUniq(dstF.years,       srcF.year_list);

      // (opcionais caso um dia guardes também no admin)
      if(srcF.color)              dstF.color       = mergeArraysUniq(dstF.color,       srcF.color);
      if(srcF.gearcase)           dstF.gearcase    = mergeArraysUniq(dstF.gearcase,    srcF.gearcase);
    }
  }
  return cat;
}
  
  // v1 enriched fallback (simplified): brand-level lists
  function attachV1(container, cat){
    const brand = el('brand')?.value; const b = (cat.brands||{})[brand]||{};
    container.innerHTML='';
    const boxes={
      hp:  makeSelect('Potência (hp) / Power','eng_hp'),
      rig: makeSelect('Comando / Rigging','eng_rig'),
      sh:  makeSelect('Altura de coluna / Shaft','eng_shaft'),
      rot: makeSelect('Rotação / Rotation (hélice / propeller)','eng_rot'),
      mdl: makeSelect('Modelo / Model code','eng_model'),
      disp:makeSelect('Cilindrada (cc) / Displacement','eng_disp'),
      yr:  makeSelect('Ano / Year','eng_year')
    };
    Object.values(boxes).forEach(x=>container.appendChild(x.wrap));
    fill(boxes.hp.sel,  stableSort(b.hp_list||[]));
    fill(boxes.rig.sel, stableSort(b.rigging||[]));
    fill(boxes.sh.sel,  stableSort(b.shaft_options||[]));
    // rotação (v1): garantimos STD/CCW e aplicamos rótulo bilingue
    fill(boxes.rot.sel, [
      {value:'STD', label:'STD'},
      {value:'CCW', label:'CCW'}
    ]);
    relabelRotationSelect(boxes.rot.sel);

    fill(boxes.mdl.sel, stableSort(b.model_code_list||[]));
    fill(boxes.disp.sel,stableSort(b.displacement_list||[]));
    fill(boxes.yr.sel,  stableSort(b.year_list||[]));
    wireSync(boxes);
  }

  function wireSync(boxes){
    const inpModel=document.querySelector('[data-engine-field=model_code], #srch_model');
    const inpPower=document.querySelector('[data-engine-field=power], #srch_power');
    const inpDisp =document.querySelector('[data-engine-field=displacement], #srch_disp');
    const inpYear =document.querySelector('[data-engine-field=year], #srch_year');
    function sync(){
      if(inpModel && boxes.mdl && boxes.mdl.sel.value) inpModel.value=boxes.mdl.sel.value;
      if(inpPower && boxes.hp.sel.value)               inpPower.value=boxes.hp.sel.value;
      if(inpDisp  && boxes.disp && boxes.disp.sel.value) inpDisp.value=boxes.disp.sel.value;
      if(inpYear  && boxes.yr   && boxes.yr.sel.value)   inpYear.value=boxes.yr.sel.value;
    }
    ['hp','mdl','disp','yr'].forEach(k=>{ if(boxes[k]) boxes[k].sel.addEventListener('change', sync); });
    sync();
  }

  // v2 renderer
  function attachV2(container, cat){
    const brand=el('brand')?.value; const b=(cat.brands||{})[brand]||{}; const fams=b.families||{};
    container.innerHTML='';
    const boxes={
      fam: makeSelect('Família / Family','eng_family'),
      hp:  makeSelect('Potência (hp) / Power','eng_hp'),
      rig: makeSelect('Comando / Rigging','eng_rig'),
      sh:  makeSelect('Altura de coluna / Shaft','eng_shaft'),
      rot: makeSelect('Rotação / Rotation (hélice / propeller)','eng_rot'),
      col: makeSelect('Cor / Color','eng_color'),
      gc:  makeSelect('Caixa de engrenagens / Gearcase','eng_gear'),
      yr:  makeSelect('Ano / Year','eng_year'),
      mdl: makeSelect('Modelo / Model code','eng_model')
    };
    Object.values(boxes).forEach(x=>container.appendChild(x.wrap));

    const famNames=Object.keys(fams);
    fill(boxes.fam.sel, famNames);

    function listYears(a,b){ const out=[]; for(let y=a;y<=b;y++) out.push(y); return out; }
    function compute(fName){
      const f=fams[fName]||{};
      const v = Array.isArray(f.variants)&&f.variants.length ? f.variants : [];
      const allHP   = uniq([...(f.hp||[]), ...v.map(x=>x.hp).filter(Boolean)]);
      const allRig  = uniq([...(f.rigging||[]), ...v.flatMap(x=>x.rigging||[])]);
      const allS    = uniq([...(f.shaft||[]), ...v.flatMap(x=>x.shaft||[])]);
      const allRot  = uniq([...(f.rotation||[]), ...v.flatMap(x=>x.rotation||[])]);
      const allCol  = uniq([...(f.color||[]), ...v.flatMap(x=>x.color||[])]);
      const allGC   = uniq([...(f.gearcase||[]), ...v.flatMap(x=>x.gearcase||[])]);
      const codes   = uniq(v.map(x=>x.code).filter(Boolean));
      const yrs = Array.isArray(f.years)&&f.years.length===2 ? listYears(f.years[0], f.years[1]) : [];
      return {
        hp: stableSort(allHP), rig: stableSort(allRig), sh: stableSort(allS), rot: allRot,
        color: stableSort(allCol), gear: stableSort(allGC), codes: stableSort(codes), years: stableSort(yrs)
      };
    }

    function refresh(){
      const fName=boxes.fam.sel.value;
      const d=compute(fName);
      fill(boxes.hp.sel,  d.hp);
      fill(boxes.rig.sel, d.rig);
      fill(boxes.sh.sel,  d.sh);
      // rotação (v2): usamos o que vier do catálogo, mas normalizamos os rótulos
      fill(boxes.rot.sel, (d.rot && d.rot.length) ? d.rot : [{value:'STD',label:'STD'},{value:'CCW',label:'CCW'}]);
      relabelRotationSelect(boxes.rot.sel);

      fill(boxes.col.sel, d.color);
      fill(boxes.gc.sel,  d.gear);
      fill(boxes.yr.sel,  d.years);
      fill(boxes.mdl.sel, d.codes);
      wireSync(boxes);
    }

    boxes.fam.sel.addEventListener('change', refresh);
    refresh();
  }

 async function boot(){
  const s = document.currentScript;
  const url = s?.dataset?.catalog || 'data/engines_catalog.v2.json';

  // 1) carrega catálogo base
  let cat;
  try {
    cat = await loadJSON(url);
  } catch (e) {
    console.error('[engine_picker] catálogo:', e);
    return;
  }

  // 2) FUNDIR overrides locais (guardados pelo admin)
  const overrides = loadOverrides();      // <- precisa das helpers loadOverrides/mergeOverrides
  cat = mergeOverrides(cat, overrides);   //    que te passei antes

  // 3) render
  const target = document.getElementById('brandDynamic');
  if (!target) { console.warn('[engine_picker] #brandDynamic não encontrado'); return; }
  const v = Number(cat.schema_version || 1);
  C('schema_version', v, 'url', url);

  const render = () => v >= 2 ? attachV2(target, cat) : attachV1(target, cat);
  render();

  const brandSel = el('brand');
  if (brandSel && !brandSel.dataset.bound) {
    brandSel.addEventListener('change', render);
    brandSel.dataset.bound = '1';
  }
}

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
