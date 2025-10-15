// [IDMAR] header override v4 — branding + ribbons + timing-safe + logout wire
(function (w, d) {
  console.log("[IDMAR] override v4 carregado");

  var APP_NAME = w.IDMAR_APP_NAME || "IDMAR";
  var APP_SUB  = w.IDMAR_APP_SUB  || "Identificação Marítima — Cascos & Motores";
  var HIDE_NAV = !!w.IDMAR_HIDE_NAV;

  // ajuda para construir caminhos na mesma pasta (ex.: /IDMAR/)
  function baseUrl(file){ return (location.pathname.replace(/[^\/]+$/, '') || '/') + file; }

  // Mapa de navegação
  var MAP = [
    { href: "validador.html",       label: "Validador",        id: "validador" },
    { href: "historico_win.html",   label: "Histórico WIN",    id: "hist_win" },
    { href: "historico_motor.html", label: "Histórico Motor",  id: "hist_motor" },
    { href: "forense.html",         label: "Forense",          id: "forense" },
    { href: "login.html",           label: "Sair",             id: "logout" } // ligado ao logout()
  ];

  function $(s,c){return (c||d).querySelector(s)}
  function $all(s,c){return Array.from((c||d).querySelectorAll(s))}

  // 🔌 Liga o item "Sair" ao IDMAR.logout()
  function wireLogout(root){
    var a = (root||d).querySelector('a[data-section="logout"]');
    if (!a || a.__wired) return;
    a.__wired = true;

    // neutraliza navegação direta
    a.setAttribute('href', '#');

    a.addEventListener('click', function(e){
      e.preventDefault();
      if (w.IDMAR && typeof w.IDMAR.logout === 'function') {
        w.IDMAR.logout();
        return;
      }
      // fallback ultra-seguro
      try { localStorage.removeItem('IDMAR_SESSION'); } catch(_){}
      try { sessionStorage.removeItem('IDMAR_SESSION'); } catch(_){}
      location.replace(baseUrl('login.html'));
    });
  }

  function brand(root){
    if(!root) return;

    // Branding
    var nameEl = root.querySelector('.brand h1, .brand .name, .app-title, .app-name, h1');
    var subEl  = root.querySelector('.subtitle, .brand .subtitle, .app-subtitle, p');
    if(nameEl) nameEl.textContent = APP_NAME;
    if(subEl)  subEl.textContent  = APP_SUB;

    // Nav
    var nav = root.querySelector('nav, .nav, .menu, .top-nav');
    if(HIDE_NAV && nav){ nav.style.display='none'; return; }

    // Etiqueta e acessibilidade dos links
    $all('a', nav||root).forEach(function(a){
      var raw = (a.getAttribute('href') || '').toLowerCase();
      // extrai apenas o ficheiro, mesmo que venha absoluto ou com query
      var file = raw.split('/').pop().split('?')[0];
      var m = MAP.find(function(it){ return it.href === file; });
      if(m){
        a.textContent = m.label;
        a.title = m.label;
        a.setAttribute('aria-label', m.label);
        a.classList.add('nav-ribbon');
        a.dataset.section = m.id;
      }
    });

    // Link ativo
    try{
      var current = (location.pathname.split('/').pop()||'').toLowerCase();
      $all('a.nav-ribbon', nav||root).forEach(function(a){
        var file = (a.getAttribute('href')||'').toLowerCase().split('/').pop().split('?')[0];
        if(file === current){ a.classList.add('is-active'); }
      });
    }catch(e){}

    // ➜ liga o "Sair"
    wireLogout(nav||root);
  }

  function arm(){
    var c = $('#app-header') || $('header');
    if(!c) return;

    if(c.children.length){ brand(c); return; }

    // header é injetado depois — observa e aplica quando surgir
    var mo = new MutationObserver(function(){
      if(c.children.length){
        try { brand(c); } finally { mo.disconnect(); }
      }
    });
    mo.observe(c, { childList:true, subtree:true });
  }

  if(d.readyState==='loading') d.addEventListener('DOMContentLoaded', arm);
  else arm();
})(window, document);
