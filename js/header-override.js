// Header/UI overrides without touching core header script
(function(w,d){
  var APP_NAME  = w.IDMAR_APP_NAME || "IDMAR";
  var APP_SUB   = w.IDMAR_APP_SUB  || "Identificação Marítima — Cascos & Motores";
  var HIDE_NAV  = !!w.IDMAR_HIDE_NAV;

  function $(sel, ctx){ return (ctx||d).querySelector(sel); }
  function $all(sel, ctx){ return Array.from((ctx||d).querySelectorAll(sel)); }

  function setText(el, txt){ if(el){ el.textContent = txt; } }

  function tweakHeader(){
    var header = $('#app-header, header.app-header, header');
    if(!header) return;

    // app name / subtitle
    setText(header.querySelector('.brand h1, .brand .name, .brand h1.title, .app-title, .app-name, .brand-title'), APP_NAME);
    setText(header.querySelector('.subtitle, .brand .subtitle, .app-subtitle'), APP_SUB);

    // nav items
    var map = [
      {href:'validador.html', label:'Validador'},
      {href:'historico_win.html', label:'Histórico WIN'},
      {href:'historico_motor.html', label:'Histórico Motor'},
      {href:'forense.html', label:'Forense'},
      {href:'login.html', label:'Terminar sessão', id:'logout'} // fallback if a logout goes to login
    ];

    $all('nav a, .nav a, .menu a, header a').forEach(function(a){ /*RIBBON_APPLY*/
      try{
        var u = (a.getAttribute('href')||'').toLowerCase();
        var m = map.find(it=> u.indexOf(it.href)>=0);
        if(m){ a.textContent = m.label; a.title = m.label; a.setAttribute('aria-label', m.label); a.classList.add('nav-ribbon'); a.dataset.section=(m.id||m.label).toLowerCase().replace(/\s+/g,'_').replace('histórico_','hist_'); }
      }catch(e){}
    });

    // hide nav if requested (login page)
    if(HIDE_NAV){
      var nav = header.querySelector('nav, .nav, .menu, .top-nav');
      if(nav){ nav.style.display='none'; }
    }
  }

  if(d.readyState==='loading') d.addEventListener('DOMContentLoaded', tweakHeader);
  else tweakHeader();
})(window, document);
