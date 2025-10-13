(function(w,d){
  "use strict";

  // ========= utils i18n =========
  function getLang(){ try { return (localStorage.getItem('IDMAR_LANG') || 'pt').toLowerCase(); } catch(e){ return 'pt'; } }
  function t(k){
    try { return (w.IDMAR_i18n && typeof w.IDMAR_i18n.t==="function") ? w.IDMAR_i18n.t(k) : k; }
    catch(e){ return k; }
  }
  function buildFlags(){
    return {
      layout: { pt: t('forense.flag.layout_pt'),  en: t('forense.flag.layout_en') },
      font:   { pt: t('forense.flag.font_pt'),    en: t('forense.flag.font_en') },
      spacing:{ pt: t('forense.flag.spacing_pt'), en: t('forense.flag.spacing_en') },
      engrave:{ pt: t('forense.flag.engrave_pt'), en: t('forense.flag.engrave_en') }
    };
  }

  // ========= 1) HISTÓRICO WIN via hook ao localStorage.setItem =========
  (function(){
    const LS = w.localStorage;
    if (!LS || LS.__idmar_hooked__) return;
    const getKey = ()=> (w.NAV && w.NAV.STORAGE && w.NAV.STORAGE.WIN_HISTORY) || "hist_win";

    // função que garante lang/flags nos registos
    function upgradeArray(arr){
      if (!Array.isArray(arr)) return arr;
      const L = getLang(), FLAGS = buildFlags();
      return arr.map(r=>{
        if (r && typeof r==="object"){
          if (!r.lang)  r.lang = L;
          if (!r.flags) r.flags = FLAGS;
        }
        return r;
      });
    }

    // hook setItem apenas para a chave de histórico
    const _set = LS.setItem.bind(LS);
    LS.setItem = function(k,v){
      try{
        if (k === getKey() && typeof v === "string" && v.trim().startsWith("[")){
          const arr = JSON.parse(v);
          v = JSON.stringify(upgradeArray(arr));
        }
      }catch(e){}
      return _set(k,v);
    };

    // migração imediata do que já existe
    try{
      const k = getKey();
      const raw = LS.getItem(k);
      if (raw){
        const arr = JSON.parse(raw);
        const up  = upgradeArray(arr);
        if (JSON.stringify(arr) !== JSON.stringify(up)){
          LS.setItem(k, JSON.stringify(up));
          console.info("[IDMAR shim] WIN history: registos atualizados com lang + flags.");
        }
      }
    }catch(e){}

    LS.__idmar_hooked__ = true;
    console.info("[IDMAR shim] setItem hook ativo para histórico WIN (", getKey(), ").");
  })();

  // ========= 2) MOTOR: notas extra via MutationObserver =========
  (function(){
    const targetId = "engine-result-hook";
    function pickBrand(){
      const el = d.querySelector('#engine-picker-hook select[name="brand"], select#engine-brand, [data-engine-brand]');
      if (el) return (el.value || el.textContent || "").trim();
      if (w.IDMAR?.engineState?.brand) return String(w.IDMAR.engineState.brand);
      return "";
    }
    function pickSN(){
      const el = d.querySelector('#engine-sn, input[name="engine-sn"], [data-engine-sn]');
      if (el) return (el.value || el.textContent || "").trim();
      if (w.IDMAR?.engineState?.sn) return String(w.IDMAR.engineState.sn);
      return "";
    }
    function appendNotes(notes){
      const box = d.getElementById(targetId);
      if (!box || !Array.isArray(notes) || !notes.length) return;
      // evita duplicados
      if (box.querySelector('[data-idmar-extra-notes="1"]')) return;
      const ul = d.createElement('ul');
      ul.setAttribute('data-idmar-extra-notes','1');
      notes.forEach(n=>{ const li = d.createElement('li'); li.textContent = n; ul.appendChild(li); });
      box.appendChild(ul);
    }
    function runExtra(){
      try{
        if (!w.IDMAR_EngineExtra || typeof w.IDMAR_EngineExtra.validateEngineExtra!=="function") return;
        const extra = w.IDMAR_EngineExtra.validateEngineExtra(pickSN(), pickBrand());
        if (extra && Array.isArray(extra.notes) && extra.notes.length){
          appendNotes(extra.notes);
        }
      }catch(e){}
    }

    function installObserver(){
      const box = d.getElementById(targetId);
      if (!box) return false;
      const mo = new MutationObserver(runExtra);
      mo.observe(box, { childList:true, subtree:true });
      // também corre já
      runExtra();
      console.info("[IDMAR shim] Motor: MutationObserver ativo para notas extra.");
      return true;
    }

    if (!installObserver()){
      d.addEventListener('DOMContentLoaded', installObserver, { once:true });
    }
  })();

  // ========= 3) Tooltips/rotação uniformes =========
  (function(){
    function setRotateTooltip(el){
      try{
        el.setAttribute('title', t('tip.rotate'));
        el.setAttribute('data-i18n-title','tip.rotate');
      }catch(e){}
    }
    d.addEventListener('DOMContentLoaded', ()=>{
      try{
        const img = d.querySelector('.rotatable');
        if (img) setRotateTooltip(img);
        d.addEventListener('keydown', (ev)=>{
          if (ev.key && ev.key.toLowerCase()==='r' && ev.shiftKey){
            const el = d.querySelector('.rotatable'); if (!el) return;
            const v = (parseInt(el.dataset.rot||"0",10)+90)%360;
            el.dataset.rot = String(v);
            setRotateTooltip(el);
          }
        });
        console.info("[IDMAR shim] rotação + tooltip ativo (SHIFT+R).");
      }catch(e){}
    });
  })();

})(window, document);
(function(){
  if (Document.prototype.__idmar_qsa_patched__) return;
  const _qsa = Document.prototype.querySelectorAll;

  // cria array-like com forEach (suficiente para a maioria dos usos)
  function asList(arr){ arr.forEach = Array.prototype.forEach; return arr; }

  Document.prototype.querySelectorAll = function(selector){
    try {
      // primeiro, tenta normal
      return _qsa.call(this, selector);
    } catch (e) {
      try {
        // 1) corrige padrões inválidos do tipo [data-x]("Texto") -> :contains("Texto")
        let sel = String(selector).replace(/\[data-x\]\("([^"]+)"\)/g, ':contains("$1")');

        // 2) divide por vírgulas e processa cada parte
        const parts = sel.split(',').map(s => s.trim()).filter(Boolean);
        let out = [];
        for (const part of parts){
          // suporta :contains("Texto")
          const m = part.match(/^(.*?):contains\("([^"]+)"\)$/);
          if (m){
            const base = m[1] || '*';
            const text = m[2].toLowerCase();
            const nodes = _qsa.call(this, base);
            out = out.concat(Array.from(nodes).filter(el => (el.textContent||'').toLowerCase().includes(text)));
            continue;
          }
          // tenta novamente com a parte isolada
          try { out = out.concat(Array.from(_qsa.call(this, part))); } catch(_) { /* ignora */ }
        }
        return asList(out);
      } catch(_) {
        // último recurso: lista vazia, não rebenta a execução
        return asList([]);
      }
    }
  };

  Document.prototype.__idmar_qsa_patched__ = true;
  console.info("[IDMAR shim] querySelectorAll patch: :contains() + fallback ativo.");
})();
