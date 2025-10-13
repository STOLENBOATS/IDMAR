(function(w,d){
  "use strict";

  // ===== i18n helpers =====
  function currentLang(){
    try { return (localStorage.getItem('IDMAR_LANG') || 'pt').toLowerCase(); } catch(e){ return 'pt'; }
  }
  function t(k){ try{ return (w.IDMAR_i18n && w.IDMAR_i18n.t) ? w.IDMAR_i18n.t(k) : k; }catch(e){ return k; } }
  function buildForensicFlags(){
    return {
      layout: { pt: t('forense.flag.layout_pt'),  en: t('forense.flag.layout_en') },
      font:   { pt: t('forense.flag.font_pt'),    en: t('forense.flag.font_en') },
      spacing:{ pt: t('forense.flag.spacing_pt'), en: t('forense.flag.spacing_en') },
      engrave:{ pt: t('forense.flag.engrave_pt'), en: t('forense.flag.engrave_en') }
    };
  }

  // ===== WIN history: envolver pushWinHistory, se existir =====
  try{
    if (typeof w.pushWinHistory === "function"){
      const _orig = w.pushWinHistory;
      w.pushWinHistory = function(rec){
        try{
          if (rec && !rec.lang) rec.lang = currentLang();
          if (rec && !rec.flags) rec.flags = buildForensicFlags();
        }catch(e){}
        return _orig.apply(this, arguments);
      };
      console.info("[IDMAR] shim: pushWinHistory envolvido (flags PT/EN + lang).");
    }
  }catch(e){ console.warn("[IDMAR] shim pushWinHistory falhou:", e); }

  // ===== Motor: validação extra + notas (se possível) =====
  try{
    if (typeof w.validateEngine === "function"){
      const _v = w.validateEngine;
      w.validateEngine = async function(){
        const res = await _v.apply(this, arguments);
        try{
          // tentar recolher brand/sn de estados comuns
          let brand = "";
          let sn = "";
          // 1) IDs mais prováveis
          const elBrand = d.querySelector('#engine-picker-hook select[name="brand"], select#engine-brand, [data-engine-brand]');
          const elSN    = d.querySelector('#engine-sn, input[name="engine-sn"], [data-engine-sn]');
          if (elBrand) brand = (elBrand.value || elBrand.textContent || "").trim();
          if (elSN)    sn    = (elSN.value    || elSN.textContent    || "").trim();
          // 2) fallback a estados globais
          if (!brand && w.IDMAR && w.IDMAR.engineState && w.IDMAR.engineState.brand) brand = String(w.IDMAR.engineState.brand);
          if (!sn && w.IDMAR && w.IDMAR.engineState && w.IDMAR.engineState.sn) sn = String(w.IDMAR.engineState.sn);

          if (w.IDMAR_EngineExtra && typeof w.IDMAR_EngineExtra.validateEngineExtra === "function"){
            const extra = w.IDMAR_EngineExtra.validateEngineExtra(sn, brand);
            const box = d.getElementById('engine-result-hook');
            if (extra && box){
              if (Array.isArray(extra.notes) && extra.notes.length){
                const ul = d.createElement('ul');
                extra.notes.forEach(n => { const li = d.createElement('li'); li.textContent = n; ul.appendChild(li); });
                box.appendChild(ul);
              }
              // Nota: não forçamos "NOK" visual para não conflitar com a tua UI; apenas acrescentamos notas.
            }
          }
        }catch(e){ console.warn("[IDMAR] shim validateEngine extra:", e); }
        return res;
      };
      console.info("[IDMAR] shim: validateEngine envolvido (extra notes).");
    }
  }catch(e){ console.warn("[IDMAR] shim validateEngine falhou:", e); }

  // ===== Tooltips/rotação uniforme =====
  function setRotateTooltip(el){
    try{ el.setAttribute('title', t('tip.rotate')); el.setAttribute('data-i18n-title','tip.rotate'); }catch(e){}
  }
  d.addEventListener('DOMContentLoaded', ()=>{
    try{
      const img = d.querySelector('.rotatable');
      if (img) setRotateTooltip(img);
      d.addEventListener('keydown', (ev)=>{
        if (ev.key && ev.key.toLowerCase()==='r' && ev.shiftKey){
          const el = d.querySelector('.rotatable');
          if (!el) return;
          const v = (parseInt(el.dataset.rot||"0",10)+90)%360;
          el.dataset.rot = String(v);
          setRotateTooltip(el);
        }
      });
      console.info("[IDMAR] shim: rotação + tooltip ativo (SHIFT+R).");
    }catch(e){}
  });

})(window, document);
