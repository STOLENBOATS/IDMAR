
// js/i18n-swapper.js
(function(){
  const LS_KEY = "IDMAR_LANG";
  const getLang = () => (localStorage.getItem(LS_KEY) || "pt").toLowerCase();
  const NODES = "h1,h2,h3,label,th,button,summary,legend,span,strong,b";
  const ATTRS = ["title","aria-label"];

  function apply(root=document){
    const lang = getLang();
    // text nodes
    root.querySelectorAll(NODES).forEach(el=>{
      const pt = el.dataset.pt;
      const en = el.dataset.en;
      if (lang === "en" && en){ el.textContent = en; }
      else if (pt){ el.textContent = pt; }
    });
    // placeholders
    root.querySelectorAll("input[placeholder],textarea[placeholder]").forEach(el=>{
      const pt = el.dataset.ptPlaceholder;
      let en = el.dataset.enPlaceholder;
      if (lang === "en" && en){
        en = en.replace(/^\s*Ex\.\s*:/i, "E.g.:").replace(/\bJapão\b/g,"Japan");
        el.setAttribute("placeholder", en);
      } else if (pt){
        el.setAttribute("placeholder", pt);
      }
    });
    // title/aria-label
    root.querySelectorAll("*").forEach(el=>{
      ATTRS.forEach(a=>{
        const pt = el.dataset["ptattr-"+a];
        const en = el.dataset["enattr-"+a];
        if (lang === "en" && en) el.setAttribute(a, en);
        else if (pt) el.setAttribute(a, pt);
      });
    });
    document.documentElement.setAttribute("lang", lang);
  }

  function boot(){
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => apply());
    } else apply();
  }

  // Re-apply on language change via selector or storage, and on UI updates
  document.addEventListener("change", e=>{
    if (e.target && e.target.id === "langSel") setTimeout(apply, 0);
  });
  window.addEventListener("storage", e=>{ if (e.key === LS_KEY) apply(); });
  document.addEventListener("idmar:ui-updated", () => apply());
  setInterval(()=>{ /* safety tick for late injections */ apply(); }, 1000);

  boot();
})();
