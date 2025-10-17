<!-- js/boot-idmar.js -->
<script>
(function(w,d){
  /* ----------  A) PT/EN (validador + forense)  ---------- */
  var MAP=[['Validador WIN','WIN Validator'],['Validador Motor','Engine Validator'],
  ['Nº de Motor - Pesquisa','Engine No. - Search'],['Foto opcional','Optional photo'],
  ['Forense (opcional)','Forensic (optional)'],['Campo','Field'],['Valor','Value'],
  ['Interpretação','Meaning'],['Validar WIN','Validate WIN'],['Validar Motor','Validate Engine'],
  ['Abrir página avançada','Open advanced'],['Escolher ficheiro','Choose file'],
  ['Carregar evidências','Upload evidence'],['Anexar ao histórico mais recente','Attach to most recent history'],
  ['Workspace','Workspace'],['Abrir lightbox','Open lightbox'],['Comparar','Compare'],
  ['Anotar (rect)','Annotate (rect)'],['Limpar anotações','Clear annotations'],
  ['Exportar PNG anotado','Export annotated PNG'],['Guardar "bundle" (JSON)','Save "bundle" (JSON)'],
  ['Checklist forense','Forensic checklist'],['Notas','Notes'],
  ['Observações técnicas…','Technical observations…'],['Observações técnicas...','Technical observations...'],
  ['Rebites inconsistentes/adiados','Inconsistent/added rivets'],
  ['Cordões de solda anómalos','Anomalous weld beads'],
  ['Placa remarcada/substituída','Re-stamped/substituted plate'],
  ['Camadas de tinta/abrasões','Paint layers/abrasions'],
  ['Etiqueta adulterada/ausente (motor)','Tampered/missing label (engine)'],
  ['Core plug danificado/removido (motor)','Core plug damaged/removed (engine)'],
  ['Solda/corrosão anómala no boss (motor)','Abnormal weld/corrosion on boss (engine)'],
  ['Remarcação no bloco (motor)','Re-stamping on block (engine)']];
  function bi(t){return t.indexOf(' / ')>=0}
  function tr(t){var s=(t||'').trim();
    for(var i=0;i<MAP.length;i++)if(s.toLowerCase()===MAP[i][0].toLowerCase())return MAP[i][0]+' / '+MAP[i][1];return null}
  function bilingual(){
    ['h1','h2','h3','legend','label','th','button','.btn','.card-header'].forEach(function(sel){
      d.querySelectorAll(sel).forEach(function(el){var t=(el.textContent||'').trim(); if(!t||bi(t))return; var tx=tr(t); if(tx) el.textContent=tx;});
    });
    d.querySelectorAll('input[type="button"],input[type="submit"]').forEach(function(el){
      var v=(el.value||'').trim(); if(!v||bi(v))return; var tx=tr(v); if(tx) el.value=tx;
    });
    d.querySelectorAll('textarea').forEach(function(el){
      var ph=el.getAttribute('placeholder')||''; if(!ph||bi(ph))return; var tx=tr(ph); if(tx) el.setAttribute('placeholder',tx);
    });
  }

  /* ----------  B) 3 cartões lado-a-lado  ---------- */
  var css3='.cards-row-3{display:grid!important;grid-template-columns:1fr 1fr 1fr!important;gap:1rem!important;align-items:start!important}'+
           '.cards-row-3>.card{width:auto!important;max-width:100%!important;margin:0!important}'+
           '@media(max-width:1280px){.cards-row-3{grid-template-columns:1fr 1fr!important}}'+
           '@media(max-width:900px){.cards-row-3{grid-template-columns:1fr!important}}';
  function injectCSS(){var s=d.createElement('style');s.textContent=css3;d.head.appendChild(s)}
  function ensureCard3(){
    var c3=d.getElementById('card-motor-quick'); if(c3) return c3;
    var t=d.createElement('template'); t.innerHTML=
    '<section id="card-motor-quick" class="card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1rem;box-shadow:0 1px 2px rgba(0,0,0,.04)">'+
    '<h2 style="margin:.25rem 0">Nº de Motor - Pesquisa / Engine No. - Search</h2>'+
    '<div style="display:grid;gap:.5rem;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">'+
      '<label><b>Marca / Brand</b><input id="mq-brand" placeholder="Yamaha, Honda, Mercury..."></label>'+
      '<label><b>Modelo / Model</b><input id="mq-model" placeholder="F350, BF150, DF90..."></label>'+
      '<label><b>Variante / Variant</b><input id="mq-variant" placeholder="NSA, A, X, L..."></label>'+
      '<label><b>Nº Série / Serial</b><input id="mq-serial" placeholder="6ML-1005843 / BAAL-1234567"></label>'+
    '</div>'+
    '<div style="margin-top:.75rem;display:flex;gap:.5rem;flex-wrap:wrap">'+
      '<button id="mq-validate" class="btn" style="padding:.6rem 1rem;border:1px solid #0b6bcb;border-radius:10px;background:#0b6bcb;color:#fff;cursor:pointer">Validar nº de motor / Validate</button>'+
      '<a class="btn secondary" href="validador_motor_simplificado.html" style="padding:.6rem 1rem;border:1px solid #0b6bcb;border-radius:10px;background:#fff;color:#0b6bcb;cursor:pointer;text-decoration:none">Abrir página avançada / Open advanced</a>'+
    '</div><div id="mq-feedback" class="muted" style="margin-top:.5rem;opacity:.8"></div></section>';
    return t.content.firstElementChild;
  }
  function bindCard3(){
    var b=d.getElementById('mq-validate'); if(!b||b.dataset.bound) return; b.dataset.bound="1";
    b.addEventListener('click', function(){
      var v=(x)=> (x||'').trim();
      var rec={date:new Date().toISOString(),brand:v(d.getElementById('mq-brand')?.value),
               model:v(d.getElementById('mq-model')?.value),variant:v(d.getElementById('mq-variant')?.value),
               motor:v(d.getElementById('mq-serial')?.value),result:'Registado / Recorded',reason:'Cartão 3',photo:''};
      try{var a=JSON.parse(localStorage.getItem('hist_motor')||'[]');a.unshift(rec);localStorage.setItem('hist_motor',JSON.stringify(a));}catch(e){}
      var fb=d.getElementById('mq-feedback'); if(fb) fb.textContent='Registado: '+[rec.brand,rec.model,rec.variant,rec.motor].filter(Boolean).join(' / ');
    });
  }
  function row3(){
    var main=d.querySelector('main')||d.body; injectCSS();
    var cards=[].slice.call(main.querySelectorAll('section.card'));
    if(!cards.length){ return; }
    var win=cards.find(c=>/Validador\s*WIN/i.test(c.textContent))||cards[0];
    var mot=cards.find(c=>/Validador\s*Motor/i.test(c.textContent))||cards[1];
    var c3=ensureCard3();
    // neutralizar wrappers que impõem 100%
    [win,mot,c3].forEach(function(el){var p=el.parentElement; if(p && !p.classList.contains('cards-row-3')) p.style.display='contents';
      el.style.width='auto'; el.style.maxWidth='100%'; el.style.margin='0';});
    var wrap=d.createElement('div'); wrap.className='cards-row-3';
    (win.closest('.card')||win).parentNode.insertBefore(wrap,(win.closest('.card')||win));
    wrap.appendChild(win.closest('.card')||win);
    wrap.appendChild(mot.closest('.card')||mot);
    wrap.appendChild(c3.closest('.card')||c3);
    bindCard3();
  }

  /* ----------  C) Android portrait overlay  ---------- */
  function guard(){
    var isAndroid=/Android/i.test(navigator.userAgent||'');
    function isPortrait(){return w.matchMedia && w.matchMedia('(orientation: portrait)').matches;}
    function ensure(){
      var el=d.getElementById('idmar-rotate-overlay'); if(el) return el;
      el=d.createElement('div'); el.id='idmar-rotate-overlay'; el.setAttribute('role','dialog');
      el.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.75);display:none;z-index:2147483647;color:#fff';
      el.innerHTML='<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:2rem">'+
      '<div style="max-width:520px;width:100%;background:#0b2440;border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:1.25rem;box-shadow:0 10px 25px rgba(0,0,0,.35)">'+
      '<h3 style="margin:0 0 .5rem 0">Melhor em horizontal / Best viewed in landscape</h3>'+
      '<p style="margin:.25rem 0 1rem 0;opacity:.9">Estás em Android em modo vertical. Roda o ecrã para <b>horizontal</b>.<br>You are on Android in portrait. Please rotate to <b>landscape</b>.</p>'+
      '<div style="display:flex;gap:.5rem;justify-content:flex-end"><button id="idmar-rotate-ok" style="background:#66c2ff;border:0;padding:.5rem .9rem;border-radius:10px;color:#001b33;cursor:pointer">Já rodei / I rotated</button></div>'+
      '</div></div>'; d.body.appendChild(el);
      d.getElementById('idmar-rotate-ok').addEventListener('click', check); return el;}
    function show(){ensure().style.display='block'} function hide(){var el=d.getElementById('idmar-rotate-overlay'); if(el) el.style.display='none'}
    function check(){if(isAndroid && isPortrait()) show(); else hide()}
    w.addEventListener('resize',check,{passive:true}); w.addEventListener('orientationchange',check,{passive:true});
    check();
  }

  function boot(){
    try{ bilingual(); }catch(e){}
    try{ if(d.body && d.querySelector('section.card')) row3(); }catch(e){}
    try{ guard(); }catch(e){}
  }
  if(d.readyState!=='loading') boot(); else d.addEventListener('DOMContentLoaded', boot);
})(window,document);
</script>
