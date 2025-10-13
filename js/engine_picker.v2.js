// engine_picker.v2.js — configurador por selects (sem texto livre)
(function(){
  const el = sel => document.querySelector(sel);
  const create = (tag, attrs={}) => Object.assign(document.createElement(tag), attrs);

  async function loadCatalog(url){
    const r = await fetch(url); return r.json();
  }

  function uniq(a){ return Array.from(new Set(a)); }
  function by(obj, path){ return path.reduce((o,k)=>o && o[k], obj); }

  function mountSelect(labelText, id, options, placeholder="— selecione —"){
    const wrap = create('div');
    const lab  = create('label', { htmlFor:id, textContent: labelText });
    const sel  = create('select', { id });
    sel.appendChild(create('option', { value:"", textContent: placeholder }));
    options.forEach(v=>{
      sel.appendChild(create('option', { value:String(v), textContent:String(v) }));
    });
    wrap.appendChild(lab); wrap.appendChild(sel);
    return {wrap, sel, lab};
  }

  function fillSelect(sel, options, placeholder="— selecione —", keepValue=false){
    const prev = keepValue ? sel.value : "";
    sel.innerHTML = "";
    sel.appendChild(create('option', { value:"", textContent: placeholder }));
    options.forEach(v=> sel.appendChild(create('option', { value:String(v), textContent:String(v) })));
    if (keepValue && options.includes(prev)) sel.value = prev;
  }

  function variantsFor(family){
    // explode variants or build from family options
    if (Array.isArray(family.variants) && family.variants.length) return family.variants;
    const hp = family.hp || [];
    const rig = family.rigging || [];
    const shaft = family.shaft || [];
    const rot = family.rotation || [];
    const color = family.color || [];
    const gear = family.gearcase || [];
    // naive cartesian, but we render filtered per step, so no need to build all combinations now
    return hp.map(h=>({hp:h, rigging:rig, shaft:shaft, rotation:rot, color:color, gearcase:gear}));
  }

  function attach(container, catalog){
    container = container || document.getElementById('brandDynamic');
    if(!container) return;

    // Limpa UI anterior
    container.innerHTML = "";

    // 1) Marca (usa o teu select #brand)
    const selBrand = document.getElementById('brand');
    if(!selBrand){ console.warn('engine_picker: #brand não encontrado'); return; }

    // 2) Família
    const famBox = mountSelect("Família / Family", "eng_family", Object.keys(catalog.brands[selBrand.value]?.families||[]));
    // 3) HP
    const hpBox  = mountSelect("Potência (hp)", "eng_hp", []);
    // 4) Rigging
    const rigBox = mountSelect("Comando / Rigging", "eng_rig", []);
    // 5) Shaft
    const shBox  = mountSelect("Altura de coluna / Shaft", "eng_shaft", []);
    // 6) Rotação
    const rotBox = mountSelect("Rotação", "eng_rot", []);
    // 7) Cor
    const colBox = mountSelect("Cor / Color", "eng_color", []);
    // 8) Gearcase
    const gcBox  = mountSelect("Gearcase", "eng_gear", []);
    // 9) Ano
    const yrBox  = mountSelect("Ano / Year", "eng_year", []);
    // 10) Modelo (se existir code)
    const mdlBox = mountSelect("Modelo / Model code", "eng_model", []);

    // Injeta na UI (ordem)
    [famBox,hpBox,rigBox,shBox,rotBox,colBox,gcBox,yrBox,mdlBox].forEach(b=>container.appendChild(b.wrap));

    function getFamily(){
      const brand = selBrand.value;
      const fam = famBox.sel.value;
      return by(catalog, ['brands', brand, 'families', fam]) || null;
    }

    function refreshAll(){
      const fam = getFamily();
      if(!fam){
        fillSelect(hpBox.sel, []);
        fillSelect(rigBox.sel, []);
        fillSelect(shBox.sel, []);
        fillSelect(rotBox.sel, []);
        fillSelect(colBox.sel, []);
        fillSelect(gcBox.sel, []);
        fillSelect(yrBox.sel, []);
        fillSelect(mdlBox.sel, []);
        return;
      }
      const v = variantsFor(fam);

      // valores possíveis gerais da família
      const allHP   = uniq( (fam.hp||[]).concat(v.map(x=>x.hp).filter(Boolean)) );
      const allRig  = uniq( (fam.rigging||[]).concat(...v.map(x=>x.rigging||[])) );
      const allShaft= uniq( (fam.shaft||[]).concat(...v.map(x=>x.shaft||[])) );
      const allRot  = uniq( (fam.rotation||[]).concat(...v.map(x=>x.rotation||[])) );
      const allCol  = uniq( (fam.color||[]).concat(...v.map(x=>x.color||[])) );
      const allGear = uniq( (fam.gearcase||[]).concat(...v.map(x=>x.gearcase||[])) );
      const years = (fam.years && fam.years.length===2) ? Array.from({length:(fam.years[1]-fam.years[0]+1)}, (_,i)=>fam.years[0]+i) : [];

      // preenche cada select
      fillSelect(hpBox.sel, allHP);
      fillSelect(rigBox.sel, allRig);
      fillSelect(shBox.sel, allShaft);
      fillSelect(rotBox.sel, allRot);
      fillSelect(colBox.sel, allCol);
      fillSelect(gcBox.sel, allGear);
      fillSelect(yrBox.sel, years);

      // modelos (se tiver code)
      const codes = uniq(v.map(x=>x.code).filter(Boolean));
      fillSelect(mdlBox.sel, codes);

      // liga aos teus campos de pesquisa existentes (para manter histórico/validação):
      const mapToExisting = {
        model: document.querySelector('[data-engine-field=model_code], #srch_model'),
        power: document.querySelector('[data-engine-field=power], #srch_power'),
        //.displacement deixamos para futuro (depende da família)
      };

      function sync(){
        if(mapToExisting.model && mdlBox.sel.value) mapToExisting.model.value = mdlBox.sel.value;
        if(mapToExisting.power && hpBox.sel.value) mapToExisting.power.value = hpBox.sel.value;
      }
      [hpBox.sel, mdlBox.sel].forEach(s=>s.addEventListener('change', sync));
      sync();
    }

    famBox.sel.addEventListener('change', refreshAll);

    // primeira carga (se já havia marca escolhida)
    const fams = Object.keys(catalog.brands[selBrand.value]?.families||[]);
    fillSelect(famBox.sel, fams);
    refreshAll();

    // se muda a marca, recarrega famílias
    selBrand.addEventListener('change', ()=>{
      const fams2 = Object.keys(catalog.brands[selBrand.value]?.families||[]);
      fillSelect(famBox.sel, fams2);
      [hpBox,rigBox,shBox,rotBox,colBox,gcBox,yrBox,mdlBox].forEach(b=>fillSelect(b.sel, []));
    });
  }

  async function boot(){
    const script = document.currentScript;
    const url = script?.dataset?.catalog || 'data/engines_catalog.json';
    let catalog;
    try{ catalog = await loadCatalog(url); }catch(e){ console.error('engine_picker: catalog load failed', e); return; }
    const target = document.getElementById('brandDynamic');
    if (!target) return;
    attach(target, catalog);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
