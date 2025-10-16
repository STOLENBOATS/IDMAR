// js/model-split-bridge.v2.js — v2→Base/Variante com pesquisa por dígitos e fallback v1
(function(w,d){
  const V2_URL = 'data/engines_catalog.v2.json';
  const V1_URL = 'data/yamaha_models.v1.json';
  const els = { legacyModel:'srch_model', baseSel:'modelBaseList', varSel:'modelVariantList' };
  function $(id){ return d.getElementById(id); }

  const RX_MODEL = /^([A-Z]+[0-9]+(?:\.[0-9]+)?)([A-Z]*)$/i;
  let index = null; // { base: { variants:Set, digits:string } }

  function splitModel(code){
    const m = String(code||'').toUpperCase().replace(/\s+/g,'');
    const mm = m.match(RX_MODEL);
    if(!mm) return { base:'', variant:'' };
    return { base:mm[1], variant:mm[2]||'' };
  }
  function digitsOfBase(base){
    const m = String(base||'').match(/(\d+(?:\.[0-9]+)?)/);
    return m ? m[1] : '';
  }
  function ensureEntry(map, base){
    return map[base] || (map[base] = { variants:new Set(), digits:digitsOfBase(base) });
  }
  function buildFromV2(v2){
    const out = {};
    const yam = v2 && v2.brands && v2.brands.Yamaha && v2.brands.Yamaha.families || {};
    Object.values(yam).forEach(fam=>{
      (fam.versions||[]).forEach(v=>{
        const code = v.version || '';
        const sp = splitModel(code);
        if(!sp.base) return;
        const e = ensureEntry(out, sp.base);
        e.variants.add(sp.variant);
      });
    });
    return out;
  }
  function buildFromV1(v1){
    const out = {};
    Object.keys(v1||{}).forEach(k=>{
      const sp = splitModel(k);
      if(!sp.base) return;
      const e = ensureEntry(out, sp.base);
      e.variants.add(sp.variant);
    });
    return out;
  }
  function fillSelect(sel, values, placeholder){
    if(!sel) return;
    const opts = [`<option value="">${placeholder||'—'}</option>`]
      .concat(values.map(v=>`<option value="${v}">${v||'—'}</option>`));
    sel.innerHTML = opts.join('');
  }
  function filterBasesByQuery(q){
    if(!index) return [];
    const Q = String(q||'').toUpperCase().replace(/\s+/g,'');
    if(!Q) return [];
    if(/^\d/.test(Q)){
      return Object.keys(index).filter(b=> (index[b].digits||'').startsWith(Q));
    }
    return Object.keys(index).filter(b=> b.startsWith(Q));
  }
  function onLegacyInput(){
    const q = ($(els.legacyModel)?.value || '');
    const bases = filterBasesByQuery(q);
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
    w.dispatchEvent(new CustomEvent('idmar:model-commit', { detail:{ model:code, commit:true, source:'bridge-v2' } }));
  }
  async function loadIndex(){
    try{
      const v2 = await fetch(V2_URL).then(r=>r.json());
      index = buildFromV2(v2);
      if(Object.keys(index).length) return;
      throw new Error('v2 vazio');
    }catch(e){
      console.warn('[IDMAR] bridge v2: falhou v2, a usar fallback v1');
      try{
        const v1 = await fetch(V1_URL).then(r=>r.json());
        index = buildFromV1(v1);
      }catch(err){
        console.error('[IDMAR] bridge v2: sem catálogos', err);
        index = {};
      }
    }
  }
  function arm(){
    const legacy = $(els.legacyModel);
    if(legacy && !legacy.__armB2){ legacy.__armB2=true; legacy.addEventListener('input', onLegacyInput); }
    const base = $(els.baseSel);
    if(base && !base.__armB2){ base.__armB2=true; base.addEventListener('change', onBaseChange); }
    const vari = $(els.varSel);
    if(vari && !vari.__armB2){ vari.__armB2=true; vari.addEventListener('change', onVariantChange); }
  }
  loadIndex().then(()=>{
    arm();
    const mo = new MutationObserver(arm);
    mo.observe(d.documentElement, { childList:true, subtree:true });
    console.log('[IDMAR] model-split-bridge v2 OK.');
  });
})(window, document);
