// js/validator-i18n-overlay.js (v3 - resilient)
(function(){
  const LS_KEY = "IDMAR_LANG";
  const isEN = () => {
    const ls = (localStorage.getItem(LS_KEY) || "pt").toLowerCase();
    const hl = (document.documentElement.getAttribute("lang") || "pt").toLowerCase();
    return ls === "en" || hl === "en";
  };

  const norm = s => (s||"").replace(/\s+/g," ").trim();

  const LABELS = new Map([
    ["Validador WIN", "HIN/WIN Validator"],
    ["Validador Motor", "Engine Validator"],
    ["WIN / HIN", "WIN / HIN"],
    ["Marca", "Brand"],
    ["Código do modelo / Model code", "Model code"],
    ["Shaft", "Shaft"],
    ["Par de letras (ano)", "Year letter pair"],
    ["Série (6–7 dígitos)", "Serial (6–7 digits)"],
    ["Modelo (pesquisa)", "Model (search)"],
    ["Potência (hp)", "Power (hp)"],
    ["Cilindrada (cc)", "Displacement (cc)"],
    ["Ano", "Year"],
    ["Origem", "Origin"],
    ["Foto opcional / Optional photo", "Optional photo"],
    ["Forense (opcional)", "Forensics (optional)"],
    ["Campo / Field", "Field"],
    ["Valor / Value", "Value"],
    ["Interpretação / Meaning", "Meaning"],
    ["Validar WIN", "Validate WIN"],
    ["Validar Motor", "Validate Engine"]
  ]);

  const LABELS_N = new Map(Array.from(LABELS.entries()).map(([pt,en]) => [norm(pt).toLowerCase(), en]));

  const MSG = [
    { pt: "Número válido.", en: "Valid number." },
    { pt: "Registo guardado no histórico.", en: "Record saved to history." },
    { pt_prefix: "Número inválido:", en_prefix: "Invalid number:" },
    { pt_prefix: "S/N inválido:", en_prefix: "Invalid S/N:" },
  ];

  function translatePlaceholder(pt){
    if (!pt) return pt;
    let out = pt.replace(/^\s*Ex\.\s*:/i, "E.g.:");
    out = out.replace(/\bJapão\b/g, "Japan");
    return out;
  }

  function transmuteTextNode(el){
    const txt = norm(el.textContent);
    if (!txt) return;
    const key = txt.toLowerCase();
    if (LABELS_N.has(key)) { el.textContent = LABELS_N.get(key); return; }
    for (const [pt,en] of LABELS.entries()){
      if (key.startsWith(norm(pt).toLowerCase())) {
        el.textContent = txt.replace(new RegExp("^"+pt.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")), en);
        return;
      }
    }
  }

  function translateStatic(){
    if (!isEN()) return;
    const sel = ["h1","h2","h3","label","th","button","summary","legend","span","strong","b"].join(",");
    document.querySelectorAll(sel).forEach(transmuteTextNode);
    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach(inp=>{
      inp.setAttribute("placeholder", translatePlaceholder(inp.getAttribute("placeholder")));
    });
  }

  function translateMsgEl(el){
    if (!el || !isEN()) return;
    const txt = norm(el.textContent);
    if (!txt) return;
    for (const m of MSG){
      if (m.pt && txt === norm(m.pt)){ el.textContent = m.en; return; }
    }
    for (const m of MSG){
      if (m.pt_prefix && txt.startsWith(norm(m.pt_prefix))){
        const rest = txt.slice(norm(m.pt_prefix).length).trim();
        el.textContent = m.en_prefix + (rest ? " " + rest : "");
        return;
      }
    }
  }

  function observeMessages(){
    ["valMsg","engMsg"].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      translateMsgEl(el);
      const mo = new MutationObserver(()=> translateMsgEl(el));
      mo.observe(el, { childList:true, characterData:true, subtree:true });
    });
  }

  function runAll(){ translateStatic(); observeMessages(); }

  function boot(){
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", runAll);
    else runAll();
    document.addEventListener("idmar:ui-updated", runAll);
    setTimeout(runAll, 200);
  }

  window.addEventListener("storage", (e)=>{ if (e.key === LS_KEY) setTimeout(runAll, 10); });
  document.addEventListener("change", (e)=>{ if (e.target && e.target.id === "langSel") setTimeout(runAll, 10); });

  boot();
})();
