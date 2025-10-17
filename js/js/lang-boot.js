// IDMAR - Language Boot (minimal)
// Stores & applies UI language across pages.
(function(w, d){
  w.IDMAR = w.IDMAR || {}; var NAV = w.NAV = w.NAV || w.IDMAR;
  var KEY = 'IDMAR_LANG';
  function getLang(){ try{return localStorage.getItem(KEY)||'pt';}catch(e){return 'pt';} }
  function setLang(lang){ try{localStorage.setItem(KEY, lang);}catch(e){} }
  function apply(lang){
    try{
      d.documentElement.setAttribute('lang', lang);
      d.body && d.body.classList.toggle('lang-en', lang==='en');
      d.body && d.body.classList.toggle('lang-pt', lang!=='en');
      // optional: event for pages to hook
      w.dispatchEvent(new CustomEvent('idmar:lang', {detail:{lang}}));
    }catch(e){}
  }
  // expose minimal API
  NAV.lang = { get:getLang, set:function(l){setLang(l); apply(l);} };
  // init
  apply(getLang());
})(window, document);