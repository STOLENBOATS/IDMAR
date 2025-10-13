// i18n boot shim: persists and applies language choice
(function(w,d){
  w.IDMAR = w.IDMAR || {}; var NAV=w.IDMAR;
  function applyLang(lang){
    try{
      if(lang){ localStorage.setItem('IDMAR_LANG', lang); }
      var L = lang || localStorage.getItem('IDMAR_LANG') || d.documentElement.getAttribute('lang') || 'pt';
      d.documentElement.setAttribute('lang', L);
      // If official i18n is available, call it
      if(w.IDMAR && IDMAR.i18n && typeof IDMAR.i18n.setLanguage==='function'){
        IDMAR.i18n.setLanguage(L);
      } else {
        // lightweight fallback: replace text of [data-i18n] if there is a dataset source (no-op otherwise)
      }
      // Dispatch a custom event so other modules can react
      var ev = new CustomEvent('idmar:langchange', {detail:{lang:L}});
      d.dispatchEvent(ev);
    }catch(e){}
  }
  // Listen to clicks on [data-lang] toggles (header dropdowns/buttons)
  d.addEventListener('click', function(ev){
    var el = ev.target.closest('[data-lang]');
    if(!el) return;
    var L = el.getAttribute('data-lang'); if(!L) return;
    applyLang(L);
  });
  // Apply on boot
  if(d.readyState==='loading') d.addEventListener('DOMContentLoaded', function(){ applyLang(); }); else applyLang();
})(window, document);
