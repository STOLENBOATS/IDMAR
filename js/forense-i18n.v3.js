// Forense i18n v3 — no invalid CSS :contains; robust bilingual toggles.
(function(w,d){
  var T = [
    ['Carregar evidências','Upload evidence'],
    ['Anexar ao histórico mais recente','Attach to most recent history'],
    ['Abrir lightbox','Open lightbox'],
    ['Comparar','Compare'],
    ['Anotar (rect)','Annotate (rect)'],
    ['Limpar anotações','Clear annotations'],
    ['Exportar PNG anotado','Export annotated PNG'],
    ['Guardar "bundle" (JSON)','Save "bundle" (JSON)'],
    ['Escolher ficheiro','Choose file'],
    ['Workspace','Workspace'],
    ['Checklist forense','Forensic checklist']
  ];
  function setText(node, pt,en){
    if(!node) return;
    var t = (node.textContent||'').trim();
    // if already bilingual, skip
    if (t.indexOf(' / ')>=0) return;
    node.textContent = pt+' / '+en;
  }
  function run(){
    // Titles h1/h2
    Array.from(d.querySelectorAll('h1,h2')).forEach(function(h){
      var t=h.textContent.trim();
      T.forEach(function(pair){
        if (t.toLowerCase().indexOf(pair[0].toLowerCase())>=0){
          setText(h, pair[0], pair[1]);
        }
      });
    });
    // Buttons
    Array.from(d.querySelectorAll('button, .btn, input[type="button"], input[type="submit"]')).forEach(function(b){
      var t=b.textContent.trim() || b.value || '';
      T.forEach(function(pair){
        if (t.toLowerCase()==pair[0].toLowerCase()){
          if(b.tagName==='INPUT') b.value = pair[0]+' / '+pair[1];
          else setText(b, pair[0], pair[1]);
        }
      });
    });
    // Labels
    Array.from(d.querySelectorAll('label, .label')).forEach(function(l){
      var t=l.textContent.trim();
      T.forEach(function(pair){
        if (t.toLowerCase()==pair[0].toLowerCase()){
          setText(l, pair[0], pair[1]);
        }
      });
    });
  }
  if (d.readyState!=='loading') run(); else d.addEventListener('DOMContentLoaded', run);
})(window, document);