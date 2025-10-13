// engine_validation.v1.js — valida combinações segundo catálogo v2 (PT/EN)
(function(w,d){
  const NS = (w.IDMAR_VALIDATION = w.IDMAR_VALIDATION || {});
  async function loadJSON(url){ const r=await fetch(url,{cache:'no-store'}); if(!r.ok) throw new Error('catalog fetch failed '+r.status); return r.json(); }
  function inSet(val, list){ if(val==null||val==='') return true; if(!Array.isArray(list)||!list.length) return true; return list.map(String).includes(String(val)); }
  function listYears(a,b){ const out=[]; for(let y=a;y<=b;y++) out.push(y); return out; }
  function envOf(fam){
    const v=Array.isArray(fam.variants)?fam.variants:[];
    const hp=new Set([...(fam.hp||[]), ...v.map(x=>x.hp).filter(Boolean)]);
    const rig=new Set([...(fam.rigging||[]), ...v.flatMap(x=>x.rigging||[])]);
    const sh=new Set([...(fam.shaft||[]), ...v.flatMap(x=>x.shaft||[])]);
    const rot=new Set([...(fam.rotation||[]), ...v.flatMap(x=>x.rotation||[])]);
    const yrs=Array.isArray(fam.years)&&fam.years.length===2? listYears(fam.years[0], fam.years[1]): [];
    const disp=new Set(v.flatMap(x=>x.displacement||[]));
    const codes=new Set(v.map(x=>x.code).filter(Boolean));
    return {hp:[...hp],rigging:[...rig],shaft:[...sh],rotation:[...rot],years:yrs,displacement:[...disp],codes:[...codes]};
  }
  function findVariant(fam, code){ const v=Array.isArray(fam.variants)?fam.variants:[]; return v.find(x=>String(x.code)===String(code))||null; }
  function norm(x){ return x==null?'':String(x).trim(); }
  NS.validateSelection = async function(args, opts){
    const errors=[];
    const brand=norm(args.brand), family=norm(args.family), model=norm(args.model), hp=norm(args.hp), rig=norm(args.rigging), shaft=norm(args.shaft), rot=norm(args.rotation), year=norm(args.year), disp=norm(args.displacement);
    let cat=null; try{ cat=await loadJSON((opts&&opts.catalogUrl)||'data/engines_catalog.v2.json'); }catch(e){ return {ok:false, errors:["Catálogo não pôde ser carregado / Catalog could not be loaded"]}; }
    const b=(cat.brands||{})[brand]; if(!b){ return {ok:false, errors:["Marca não encontrada / Brand not found"]}; }
    const fam=(b.families||{})[family]; if(!fam){ if(family) errors.push("Família inválida / Invalid family"); return {ok:errors.length===0, errors}; }
    const env=envOf(fam); const varSpec=model? findVariant(fam, model): null;
    if(varSpec && varSpec.hp!=null){ if(hp && String(varSpec.hp)!==hp){ errors.push("Potência não corresponde ao modelo / Power does not match selected model"); } }
    else if(!inSet(hp, env.hp)){ errors.push("Potência fora da família / Power not available for this family"); }
    const rigAllowed=varSpec && Array.isArray(varSpec.rigging)&&varSpec.rigging.length? varSpec.rigging: env.rigging;
    if(!inSet(rig, rigAllowed)){ errors.push("Comando inválido / Rigging not valid"); }
    const shaftAllowed=varSpec && Array.isArray(varSpec.shaft)&&varSpec.shaft.length? varSpec.shaft: env.shaft;
    if(!inSet(shaft, shaftAllowed)){ errors.push("Altura de coluna inválida / Shaft not valid"); }
    const rotAllowed=varSpec && Array.isArray(varSpec.rotation)&&varSpec.rotation.length? varSpec.rotation: env.rotation;
    if(rot && rotAllowed.length && !inSet(rot, rotAllowed)){ errors.push("Rotação inválida / Rotation not valid"); }
    if(year){ const y=Number(year); if(isNaN(y) || (env.years.length && !env.years.includes(y))){ errors.push("Ano fora do intervalo / Year outside family range"); } }
    const dispAllowed=varSpec && Array.isArray(varSpec.displacement)&&varSpec.displacement.length? varSpec.displacement: env.displacement;
    if(dispAllowed.length && disp && !inSet(disp, dispAllowed)){ errors.push("Cilindrada inválida / Displacement not valid"); }
    return {ok:errors.length===0, errors};
  };
})(window, document);