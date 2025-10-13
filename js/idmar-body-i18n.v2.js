// js/idmar-body-i18n.v2.js
// PT default; EN when selected in header or localStorage.IDMAR_LANG.
// Works with: data-en / data-en-placeholder, bilingual "PT / EN", and a PT->EN dictionary.
(function(){
  const LS_KEY = "IDMAR_LANG";
  const NODES = "h1,h2,h3,h4,h5,h6,label,button,summary,legend,th,td,span,strong,b,p,li,a";
  const ATTRS = ["title","aria-label"];
  const DICT = new Map(Object.entries({
    // --- Validator ---
    "Validador":"Validator",
    "Validador WIN":"HIN/WIN Validator",
    "Validador Motor":"Engine Validator",
    "WIN / HIN":"HIN / WIN",
    "Marca":"Brand",
    "Código do modelo":"Model code",
    "Modelo (pesquisa)":"Model (search)",
    "Potência (hp)":"Power (hp)",
    "Cilindrada (cc)":"Displacement (cc)",
    "Ano":"Year",
    "Origem":"Origin",
    "Foto opcional":"Optional photo",
    "Forense (opcional)":"Forensics (optional)",
    "Campo":"Field",
    "Valor":"Value",
    "Interpretação":"Meaning",
    "Validar WIN":"Validate WIN",
    "Validar Motor":"Validate Engine",
    "Selecionar":"Select",
    "Analisar":"Analyze",
    // --- Forense page ---
    "Forense — Índice":"Forensics — Index",
    "Carregar evidências":"Upload evidence",
    "Workspace":"Workspace",
    "Abrir lightbox":"Open lightbox",
    "Comparar":"Compare",
    "Anotar (rect)":"Annotate (rect)",
    "Limpar anotações":"Clear annotations",
    "Exportar PNG anotado":"Export annotated PNG",
    "Guardar “bundle” (JSON)":"Save bundle (JSON)",
    "Checklist forense":"Forensic checklist",
    "Rebites inconsistentes/adicionados":"Rivets inconsistent/added",
    "Cordões de solda anómalos":"Abnormal weld beads",
    "Placa remarcada/substituída":"Re-marked/replaced plate",
    "Camadas de tinta/abrasões":"Paint layers/abrasions",
    "Etiqueta adulterada/ausente (motor)":"Tampered/missing label (engine)",
    "Core plug danificado/removido (motor)":"Core plug damaged/removed (engine)",
    "Solda/corrosão anómala no boss (motor)":"Abnormal weld/corrosion at boss (engine)",
    "Remarcação no bloco (motor)":"Re-stamping on block (engine)",
    "Notas":"Notes",
    "Contexto: WIN/HIN":"Context: HIN/WIN",
    "Contexto: Motor":"Context: Engine",
    "Larga a fotografia aqui ou clica para escolher…":"Drop a photo here or click to select…",
    // --- History ---
    "Histórico — WIN":"History — HIN/WIN",
    "Histórico — Motores":"History — Engines",
    "Estado (todos)":"State (all)",
    "Válido":"Valid",
    "Inválido":"Invalid",
    "Exportar CSV":"Export CSV",
    "Limpar histórico (WIN)":"Clear history (HIN/WIN)",
    "Limpar histórico (Motor)":"Clear history (Engine)",
    "Quando":"When",
    "WIN/HIN":"HIN/WIN",
    "Estado":"State",
    "Justificação":"Reason",
    "Foto (nome)":"Photo (name)",
    "Miniatura":"Thumbnail"
  }));

  const PH_MAP = new Map(Object.entries({
    "Ex.: PT-ABC12345D404":"E.g.: PT-ABC12345D404",
    "Ex.: DF140A":"E.g.: DF140A",
    "Ex.: 150":"E.g.: 150",
    "Ex.: 2670":"E.g.: 2670",
    "Ex.: 2017":"E.g.: 2017",
    "Ex.: Japão":"E.g.: Japan",
    "Pesquisar (WIN / texto)":"Search (HIN/WIN / text)",
    "Pesquisar (S/N / marca / modelo / texto)":"Search (S/N / brand / model / text)",
    "De":"From",
    "Até":"To",
    "Observações técnicas…":"Technical notes…"
  }));

  const getLang = () => (localStorage.getItem(LS_KEY) || (document.documentElement.getAttribute('lang')||'pt')).toLowerCase();
  const norm = s => (s||"").replace(/\s+/g," ").trim();

  function splitPair(s){
    if (!s) return null;
    const i = s.indexOf(" / ");
    return i>=0 ? [s.slice(0,i).trim(), s.slice(i+3).trim()] : null;
  }

  function apply(root=document){
    const lang = getLang();

    // text elements
    root.querySelectorAll(NODES).forEach(el=>{
      let pt = el.getAttribute("data-pt");
      let en = el.getAttribute("data-en");

      if (!pt && !en){
        const raw = norm(el.textContent);
        const pair = splitPair(raw);
        if (pair){
          pt = pair[0]; en = pair[1];
          el.setAttribute("data-pt", pt);
          el.setAttribute("data-en", en);
        } else if (DICT.has(raw)){
          pt = raw; en = DICT.get(raw);
          el.setAttribute("data-pt", pt);
          el.setAttribute("data-en", en);
        } else {
          // nothing to do
        }
      }

      if (lang === "en" && en){
        el.textContent = en;
      } else if (pt){
        el.textContent = pt;
      }
    });

    // placeholders
    root.querySelectorAll("input[placeholder],textarea[placeholder]").forEach(inp=>{
      let pt = inp.getAttribute("data-pt-placeholder");
      let en = inp.getAttribute("data-en-placeholder");
      if (!pt && !en){
        const ph = inp.getAttribute("placeholder") || "";
        const pair = splitPair(ph);
        if (pair){
          pt = pair[0]; en = pair[1];
          inp.setAttribute("data-pt-placeholder", pt);
          inp.setAttribute("data-en-placeholder", en);
        } else if (PH_MAP.has(ph)){
          pt = ph; en = PH_MAP.get(ph);
          inp.setAttribute("data-pt-placeholder", pt);
          inp.setAttribute("data-en-placeholder", en);
        }
      }
      if (lang === "en" && en){
        inp.setAttribute("placeholder", en);
      } else if (pt){
        inp.setAttribute("placeholder", pt);
      }
    });

    // attributes
    root.querySelectorAll("*").forEach(el=>{
      ATTRS.forEach(a=>{
        const ptA = el.getAttribute("data-ptattr-"+a);
        const enA = el.getAttribute("data-enattr-"+a);
        let pt = ptA, en = enA;
        if (!pt && !en){
          const v = el.getAttribute(a);
          const pair = splitPair(v);
          if (pair){
            pt = pair[0]; en = pair[1];
            el.setAttribute("data-ptattr-"+a, pt);
            el.setAttribute("data-enattr-"+a, en);
          }
        }
        if (lang === "en" && en){
          el.setAttribute(a, en);
        } else if (pt){
          el.setAttribute(a, pt);
        }
      });
    });

    // options
    root.querySelectorAll("option").forEach(opt=>{
      let pt = opt.getAttribute("data-pt");
      let en = opt.getAttribute("data-en");
      if (!pt && !en){
        const raw = norm(opt.textContent);
        const pair = splitPair(raw);
        if (pair){
          pt = pair[0]; en = pair[1];
          opt.setAttribute("data-pt", pt);
          opt.setAttribute("data-en", en);
        } else if (DICT.has(raw)){
          pt = raw; en = DICT.get(raw);
          opt.setAttribute("data-pt", pt);
          opt.setAttribute("data-en", en);
        }
      }
      if (lang === "en" && en){
        opt.textContent = en;
      } else if (pt){
        opt.textContent = pt;
      }
    });

    document.documentElement.setAttribute("lang", lang);
  }

  function boot(){
    // header selector wiring
    const sel = document.getElementById("langSel");
    if (sel){
      try { sel.value = getLang(); } catch(e){}
      sel.addEventListener("change", ()=>{
        localStorage.setItem(LS_KEY, sel.value);
        apply(document);
        document.dispatchEvent(new CustomEvent("idmar:ui-updated"));
      });
    }
    apply(document);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  // react to header injections or cross-tab changes
  document.addEventListener("idmar:ui-updated", ()=>apply(document));
  window.addEventListener("storage", e=>{ if (e.key===LS_KEY) apply(document); });

  // safety: if content is injected late
  try{
    const mo = new MutationObserver(m=>{
      for (const rec of m){ if (rec.addedNodes && rec.addedNodes.length){ apply(document); break; } }
    });
    mo.observe(document.body, {childList:true, subtree:true});
  }catch(e){}
})();