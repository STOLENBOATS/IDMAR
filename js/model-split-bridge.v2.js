// js/model-split-bridge.v2.js — popula Base/Variante a partir do v2
(function(w,d){
  const V2_URL = 'data/engines_catalog.v2.json';
  const els = {
    legacyModel: 'srch_model',
    baseSel:     'modelBaseList',
    varSel:      'modelVariantList'
  };
  function $(id){ return d.getElementById(id); }
  let index = null; // { base: { variants:Set, versions:Set } }

  function splitModel(code){
    const m = String(code||'').toUpperCase().replace(/\s+/g,'');
    const r = /^([A-Z]+[0-9]+)([A-Z]*)$/;
    const mm = m.match(r);
    if(!mm) return { base:'', variant:'' };
    return { base:mm[1], variant:mm[2]||'' };
  }

  function buildIndex(v2){
    const out = {};
    const yam = v2?.brands?.Yamaha?.families || {};
    Object.values(yam).forEach(fam=>{
      (fam.versions||[]).forEach(v=>{
        const sp = splitModel(v.version||'');
        if(!sp.base) return;
        const entry = out[sp.base] || (out[sp.base] = { variants:new Set(), versions:new Set() });
        entry.variants.add(sp.variant);   // pode ser ''
        entry.versions.add(v.version);
      });
    });
    index = out;
  }

  function fillSelect(sel, values, placeholder){
    if(!sel) return;
    const opts = [`<option value="">${placeholder||'—'}</option>`]
      .concat(values.map(v=>`<option value="${v}">${v||'—'}</option>`));
    sel.innerHTML = opts.join('');
  }

  function onLegacyInput(){
    const q = ($(els.legacyModel)?.value || '').toUpperCase().replace(/\s+/g,'');
    if(!q || !index) return fillSelect($(els.baseSel), [], '—');
    const bases = Object.keys(index).filter(b => b.startsWith(q));
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
    w.dispatchEvent(new CustomEvent('idmar:model-commit', { detail:{ model:code, commit:true, source:'bridge-base-variant' }}));
  }

  function arm(){
    const legacy = $(els.legacyModel);
    if(legacy && !legacy.__armed_b1){ legacy.__armed_b1=true; legacy.addEventListener('input', onLegacyInput); }
    const base = $(els.baseSel);
    if(base && !base.__armed_b1){ base.__armed_b1=true; base.addEventListener('change', onBaseChange); }
    const vari = $(els.varSel);
    if(vari && !vari.__armed_b1){ vari.__armed_b1=true; vari.addEventListener('change', onVariantChange); }
  }

  fetch(V2_URL).then(r=>r.json()).then(v2=>{
    buildIndex(v2);
    arm();
    console.log('[IDMAR] model-split-bridge v2 OK (v2 → Base/Variante).');
  }).catch(e=>console.warn('[IDMAR] model-split-bridge v2: falha', e));
})(window, document);
