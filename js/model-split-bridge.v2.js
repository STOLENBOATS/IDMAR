// js/model-split-bridge.v2.js — v2.4 (Base/Variante + filtro por potência/fragmento)
(function (w, d) {
  const V2_URL = 'data/engines_catalog.v2.json';
  const $ = id => d.getElementById(id);
  const norm = s => String(s||'').toUpperCase().replace(/\s+/g,'');
  let index = null;      // { BASE: { variants:Set, powers:Set } }
  let allBases = [];

  function splitModel(code){
    const m = norm(code).replace(/\(.*?\)/g,'').split('/')[0]; // “F350 (2024+)” → F350
    const re = /^([A-Z]+[0-9]+(?:\.[0-9])?)([A-Z]*)$/;          // F9.9 / F115B
    const mm = m.match(re);
    return mm ? { base:mm[1], variant:mm[2]||'' } : { base:'', variant:'' };
  }

  function buildIndex(v2){
    const yam = v2?.brands?.Yamaha?.families || {};
    const out = {};
    Object.values(yam).forEach(fam=>{
      const vers = Array.isArray(fam.versions) ? fam.versions : [];
      vers.forEach(v=>{
        const code = v.version || v.code || '';
        const sp = splitModel(code);
        if (!sp.base) return;
        const e = out[sp.base] || (out[sp.base] = { variants:new Set(), powers:new Set() });
        e.variants.add(sp.variant);
        if (typeof v.power === 'number') e.powers.add(v.power);
      });
    });
    index = out;
    allBases = Object.keys(out).sort((a,b)=>a.localeCompare(b,'en',{numeric:true}));
  }

  function fillSelect(sel, values, placeholder){
    if(!sel) return;
    const opts = [`<option value="">${placeholder||'—'}</option>`]
      .concat(values.map(v=>`<option value="${v}">${v||'—'}</option>`));
    sel.innerHTML = opts.join('');
  }

  function refreshVariants(base){
    const sel = $('modelVariantList');
    if (!sel) return;
    if (!base || !index[base]) { fillSelect(sel, [], '—'); return; }
    const arr = Array.from(index[base].variants).sort((a,b)=>a.localeCompare(b));
    fillSelect(sel, arr, '—');
  }

  function filterBases(qRaw){
    if (!qRaw) return allBases;
    const q = qRaw.trim();
    // só números (potência) — ex: "40", "9.9"
    if (/^[0-9]+(?:[.,][0-9])?$/.test(q)) {
      const num = Number(q.replace(',','.'));
      return allBases.filter(b => {
        if (b.includes(String(num))) return true; // F40 contém “40”
        const e = index[b];
        return e ? e.powers.has(num) : false;
      });
    }
    // fragmento textual (ex: “F4”, “F35”)
    const up = norm(q);
    return allBases.filter(b => b.startsWith(up));
  }

  function onLegacyInput(){
    const q = ($('srch_model')?.value || '');
    fillSelect($('modelBaseList'), filterBases(q), '—');
    refreshVariants('');
  }

  function onBaseChange(ev){
    if (!ev.isTrusted) return;
    const base = norm($('modelBaseList')?.value || '');
    refreshVariants(base);
    // espelhar no picker (sem commit)
    const picker = d.querySelector('#engine-picker input#engineModel');
    if (picker) { picker.value = base; picker.dispatchEvent(new Event('input',{bubbles:true})); }
  }

  function onVariantChange(ev){
    if (!ev.isTrusted) return;
    const base = norm($('modelBaseList')?.value || '');
    const vari = norm($('modelVariantList')?.value || '');
    if (!base) return;
    const code = base + (vari || '');
    // commit explícito (meta-wire faz o resto e só aí foca o SN)
    w.dispatchEvent(new CustomEvent('idmar:model-commit', {
      detail: { model: code, commit: true, source: 'bridge-base-variant' }
    }));
    // também espelha no picker
    const picker = d.querySelector('#engine-picker input#engineModel');
    if (picker) { picker.value = code; picker.dispatchEvent(new Event('input',{bubbles:true})); }
  }

  function arm(){
    const legacy = $('srch_model');
    const base   = $('modelBaseList');
    const vari   = $('modelVariantList');
    if (legacy && !legacy.__armed_bv2){ legacy.__armed_bv2 = true; legacy.addEventListener('input', onLegacyInput); }
    if (base && !base.__armed_bv2){ base.__armed_bv2 = true; base.addEventListener('change', onBaseChange); }
    if (vari && !vari.__armed_bv2){ vari.__armed_bv2 = true; vari.addEventListener('change', onVariantChange); }
    fillSelect(base, allBases, '—');
    refreshVariants('');
  }

  fetch(V2_URL).then(r=>r.json()).then(v2=>{ buildIndex(v2); arm(); })
    .catch(e=>console.warn('[split-bridge v2] falha catálogo', e));
})(window, document);

