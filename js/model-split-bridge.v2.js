// js/model-split-bridge.v2.js — v2→Base/Variante com pesquisa por dígitos e fallback v1
(function(w,d){
  const V2_URL = 'data/engines_catalog.v2.json';
  const V1_URL = 'data/yamaha_models.v1.json'; // fallback
  const els = { legacyModel:'srch_model', baseSel:'modelBaseList', varSel:'modelVariantList' };
  function $(id){ return d.getElementById(id); }

  const RX = /^([A-Z]+[0-9]+(?:\.[0-9]+)?)([A-Z]*)$/;
  let index = null; // { base: { variants:Set, versions:Set } }

  function splitModel(code){
    const m = String(code||'').toUpperCase().replace(/\s+/g,'');
    const mm = m.match(RX);
    if(!mm) return { base:'', variant:'' };
    return { base:mm[1], variant:mm[2]||'' };
  }

  function ensureEntry(map, base){
    return map[base] || (map[base] = { variants:new Set(), versions:new Set() });
  }

  function buildFromV2(v2){
    const out = {};
    const fams = v2?.brands?.Yamaha?.families || {};
    Object.values(fams).forEach(fam=>{
      (fam.versions||[]).forEach(v=>{
        const code = v.version || '';
        const {base,variant} = splitModel(code);
        if(!base) return;
        const e = ensureEntry(out, base);
        e.variants.add(variant);
        e.versions.add(code);
      });
    });
    return out;
  }

  function buildFromV1(v1){
    const out = {};
    Object.keys(v1||{}).forEach(code=>{
      const {base,variant} = splitModel(code);
      if(!base) return;
      const e = ensureEntry(out, base);
      e.variants.add(variant);
      e.versions.add(code);
    });
    return out;
  }

  function fillSelect(sel, values, placeholder){
    if(!sel) return;
    const opts = [`<option value="">${placeholder||'—'}</option>`]
      .concat(values.map(v=>`<option value="${v}">${v||'—'}</option>`));
    sel.innerHTML = opts.join('');
  }

  function matchBases(query){
    if(!index) return [];
    const q = String(query||'').toUpperCase().replace(/\s+/g,'');
    if(!q) return [];
    const qDigits = q.replace(/^[A-Z]+/, '');
    const bases = Object.keys(index);

    let hits = bases.filter(b => b.startsWith(q));
    if(!hits.length && qDigits){
      hits = bases.filter(b => b.replace(/^[A-Z]+/,'').startsWith(qDigits));
    }
    if(!hits.length && qDigits){
      hits = bases.filter(b => b.replace(/^[A-Z]+/,'').includes(qDigits));
    }
    return hits.sort();
  }

  function onLegacyInput(){
    const legacy = $(els.legacyModel);
    if(!legacy) return;
    const bases = matchBases(legacy.value);
    fillSelect($(els.baseSel), bases, '—');
    fillSelect($(els.varSel), [], '—');
  }

  function onBaseChange(ev){
    if(!ev.isTrusted) return;
    const base = ($(els.baseSel)?.value || '').toUpperCase();
    if(!base || !index || !index[base]){ fillSelect($(els.varSel), [], '—'); return; }
    const variants = Array.from(index[base].variants.values()).sort((a,b)=>a.localeCompare(b));
    fillSelect($(els.varSel), variants, '—');
  }

  function onVariantChange(ev){
    if(!ev.isTrusted) return;
    const base = ($(els.baseSel)?.value || '').toUpperCase();
    const vari = ($(els.varSel)?.value || '').toUpperCase();
    if(!base) return;
    const code = base + (vari||'');
    w.dispatchEvent(new CustomEvent('idmar:model-commit', {
      detail:{ model:code, commit:true, source:'bridge-base-variant' }
    }));
  }

  function arm(){
    const legacy = $(els.legacyModel);
    if(legacy && !legacy.__armed_b3){ legacy.__armed_b3=true; legacy.addEventListener('input', onLegacyInput); }
    const base = $(els.baseSel);
    if(base && !base.__armed_b3){ base.__armed_b3=true; base.addEventListener('change', onBaseChange); }
    const vari = $(els.varSel);
    if(vari && !vari.__armed_b3){ vari.__armed_b3=true; vari.addEventListener('change', onVariantChange); }
    if(legacy && legacy.value) onLegacyInput();
  }

  async function loadIndex(){
    try{
      const v2 = await fetch(V2_URL).then(r=>r.ok?r.json():Promise.reject(r.status));
      index = buildFromV2(v2);
      console.log('[IDMAR] bridge v2: carregado v2; bases=', Object.keys(index).length);
    }catch(_){
      console.warn('[IDMAR] bridge v2: falhou v2, a usar fallback v1');
      try{
        const v1 = await fetch(V1_URL).then(r=>r.json());
        index = buildFromV1(v1);
        console.log('[IDMAR] bridge v2: fallback v1; bases=', Object.keys(index).length);
      }catch(e){
        console.error('[IDMAR] bridge v2: não foi possível carregar nenhum catálogo', e);
        index = {};
      }
    }
  }

  loadIndex().then(()=>{ arm(); });
})(window, document);
