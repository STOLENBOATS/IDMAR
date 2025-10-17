
// idmar card3-grid-inject v1
// - Applies a 3-column grid to the parent of your existing two cards
// - Adds the "Nº de Motor - Pesquisa" card as the 3rd card
// - Binds a minimal "Validate" that saves to localStorage('hist_motor') and opens historico_motor.html
(function(d){
  function injectCSS(){
    if (d.getElementById('cards-row-3-style')) return;
    var s=d.createElement('style'); s.id='cards-row-3-style';
    s.textContent=[
      '.cards-row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1rem;align-items:start}',
      '@media(max-width:1280px){.cards-row-3{grid-template-columns:1fr 1fr}}',
      '@media(max-width:900px){.cards-row-3{grid-template-columns:1fr}}',
      '.cards-row-3>.card,.cards-row-3>.panel{width:auto;max-width:100%;margin:0}'
    ].join('');
    d.head.appendChild(s);
  }
  function buildCard3(){
    var t=d.createElement('template');
    t.innerHTML = '<section id="card-motor-quick" class="card" style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:1rem;box-shadow:0 1px 2px rgba(0,0,0,.04)">'+
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
      '</div>'+
      '<div id="mq-feedback" class="muted" style="margin-top:.5rem;opacity:.8"></div>'+
    '</section>';
    return t.content.firstElementChild;
  }
  function bind(){
    var b=d.getElementById('mq-validate'); if(!b||b.dataset.bound) return;
    b.dataset.bound='1';
    b.addEventListener('click', function(){
      var v=function(id){ var el=d.getElementById(id); return (el && el.value || '').trim(); };
      var rec={ date:new Date().toISOString(), brand:v('mq-brand'), model:v('mq-model'), variant:v('mq-variant'),
                motor:v('mq-serial'), result:'Registado / Recorded', reason:'Cartão 3', photo:'' };
      try{ var arr=JSON.parse(localStorage.getItem('hist_motor')||'[]'); arr.unshift(rec);
           localStorage.setItem('hist_motor', JSON.stringify(arr)); }catch(e){ console.warn('hist_motor save',e); }
      var fb=d.getElementById('mq-feedback'); if(fb) fb.textContent='Registado: '+[rec.brand,rec.model,rec.variant,rec.motor].filter(Boolean).join(' / ');
      try{ window.location.href='historico_motor.html'; }catch(_){}
    });
  }
  function run(){
    injectCSS();
    var main=d.querySelector('main')||d.body;
    var cards=[].slice.call(main.querySelectorAll('.card,.panel'));
    if(cards.length<2) return; // need at least WIN + Motor
    var parent=cards[0].parentElement;
    if(parent!==cards[1].parentElement) parent=main; // fallback
    parent.classList.add('cards-row-3');
    if(!d.getElementById('card-motor-quick')){
      parent.appendChild(buildCard3());
    }
    bind();
  }
  if(d.readyState!=='loading') run(); else d.addEventListener('DOMContentLoaded', run);
})(document);
