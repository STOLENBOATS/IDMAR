// [IDMAR] header override v4 — branding + ribbons + timing-safe
(function (w, d) {
  console.log("[IDMAR] override v4 carregado");
  var APP_NAME = w.IDMAR_APP_NAME || "IDMAR";
  var APP_SUB  = w.IDMAR_APP_SUB  || "Identificação Marítima — Cascos & Motores";
  var HIDE_NAV = !!w.IDMAR_HIDE_NAV;
  var MAP = [
    { href: "validador.html",       label: "Validador",        id: "validador" },
    { href: "historico_win.html",   label: "Histórico WIN",    id: "hist_win" },
    { href: "historico_motor.html", label: "Histórico Motor",  id: "hist_motor" },
    { href: "forense.html",         label: "Forense",          id: "forense" },
    { href: "login.html",           label: "Sair",             id: "logout" }
  ];
  function $(s,c){return (c||d).querySelector(s)}; function $all(s,c){return Array.from((c||d).querySelectorAll(s))}
  function brand(root){
    if(!root) return;
    var nameEl = root.querySelector('.brand h1, .brand .name, .app-title, .app-name, h1');
    var subEl  = root.querySelector('.subtitle, .brand .subtitle, .app-subtitle, p');
    if(nameEl) nameEl.textContent = APP_NAME;
    if(subEl)  subEl.textContent  = APP_SUB;
    var nav = root.querySelector('nav, .nav, .menu, .top-nav');
    if(HIDE_NAV && nav){ nav.style.display='none'; return; }
    $all('a', nav||root).forEach(function(a){
      var href=(a.getAttribute('href')||'').toLowerCase();
      var m = MAP.find(it=> href.indexOf(it.href)>=0);
      if(m){ a.textContent=m.label; a.title=m.label; a.setAttribute('aria-label',m.label); a.classList.add('nav-ribbon'); a.dataset.section=m.id; }
    });
    try{ var path=(location.pathname.split('/').pop()||'').toLowerCase();
      $all('a.nav-ribbon', nav||root).forEach(function(a){ var u=(a.getAttribute('href')||'').toLowerCase(); if(u===path){ a.classList.add('is-active'); }});
    }catch(e){}
  }
  function arm(){
    var c = $('#app-header') || $('header');
    if(!c) return;
    if(c.children.length){ brand(c); return; }
    var mo = new MutationObserver(function(){ if(c.children.length){ try{ brand(c); } finally { mo.disconnect(); } }});
    mo.observe(c, { childList:true, subtree:true });
  }
  if(d.readyState==='loading') d.addEventListener('DOMContentLoaded', arm); else arm();
})(window, document);
