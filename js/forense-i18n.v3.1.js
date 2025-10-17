
// forense-i18n.v3.1.js — Robust bilingual for Forense, including checklist items.
(function(w,d){
  var MAP = [
    // Buttons/labels used above
    ['Abrir lightbox','Open lightbox'],
    ['Comparar','Compare'],
    ['Anotar (rect)','Annotate (rect)'],
    ['Limpar anotações','Clear annotations'],
    ['Exportar PNG anotado','Export annotated PNG'],
    ['Guardar "bundle" (JSON)','Save "bundle" (JSON)'],
    ['Escolher ficheiro','Choose file'],
    ['Workspace','Workspace'],
    ['Checklist forense','Forensic checklist'],
    ['Anexar ao histórico mais recente','Attach to most recent history'],
    // Checklist items (best-effort mappings)
    ['Rebites inconsistentes/adiados','Inconsistent/added rivets'],
    ['Rebites inconsistentes/adiados (motor)','Inconsistent/added rivets (engine)'],
    ['Cordões de solda anómalos','Anomalous weld beads'],
    ['Placa remarcada/substituída','Re-stamped/substituted plate'],
    ['Camadas de tinta/abrasões','Paint layers/abrasions'],
    ['Etiqueta adulterada/ausente (motor)','Tampered/missing label (engine)'],
    ['Core plug danificado/removido (motor)','Core plug damaged/removed (engine)'],
    ['Solda/corrosão anómala no boss (motor)','Abnormal weld/corrosion on boss (engine)'],
    ['Remarcação no bloco (motor)','Re-stamping on block (engine)'],
    ['Notas','Notes'],
    ['Observações técnicas…','Technical observations…'],
    ['Observações técnicas...','Technical observations...']
  ];
  function isBilingualText(t){ return t.indexOf(' / ')>=0; }
  function translateText(t){
    var norm = t.replace(/\s+/g,' ').trim();
    for (var i=0;i<MAP.length;i++){
      var pt = MAP[i][0];
      if (norm.toLowerCase() === pt.toLowerCase()) return pt+' / '+MAP[i][1];
    }
    return null;
  }
  function apply(){
    // Titles
    Array.from(d.querySelectorAll('h1,h2,h3,legend,label,th,button,.btn')).forEach(function(el){
      var t = (el.textContent || '').trim();
      if (!t || isBilingualText(t)) return;
      var tx = translateText(t);
      if (tx){
        if (el.tagName==='BUTTON') el.textContent = tx;
        else el.textContent = tx;
      }
    });
    // Inputs with value (submit buttons)
    Array.from(d.querySelectorAll('input[type="button"], input[type="submit"]')).forEach(function(el){
      var v = (el.value||'').trim();
      if(!v || isBilingualText(v)) return;
      var tx = translateText(v);
      if (tx) el.value = tx;
    });
    // Textarea placeholder (notes)
    Array.from(d.querySelectorAll('textarea')).forEach(function(el){
      var ph = el.getAttribute('placeholder');
      if (!ph || isBilingualText(ph)) return;
      var tx = translateText(ph);
      if (tx) el.setAttribute('placeholder', tx);
    });
  }
  if (d.readyState!=='loading') apply(); else d.addEventListener('DOMContentLoaded', apply);
})(window, document);
