
// IDMAR layout r3c — header unificado (idioma + tema) e estilo consistente
(function(w,d){
  w.IDMAR = w.IDMAR || {};
  const CSS = `
  :root{ --bg:#f8fafc; --fg:#0f172a; --bg-elev:#ffffff; --border:#e5e7eb; --link:#0b6bcb; }
  html[data-theme="dark"]{ --bg:#0b1220; --fg:#e6edf3; --bg-elev:#0f172a; --border:#1e293b; --link:#93c5fd; }
  body{background:var(--bg);color:var(--fg)}
  .topbar{display:flex;align-items:center;gap:.75rem;padding:.75rem 1rem;border-bottom:1px solid var(--border);background:var(--bg-elev)}
  .topbar img{height:36px}
  .topbar .brand{display:flex;flex-direction:column}
  .topbar .brand .app{font-weight:800}
  .topbar .main a{margin-right:1rem;color:var(--link);text-decoration:none}
  .topbar .right-ctl{display:flex;gap:.5rem;align-items:center;margin-left:.75rem}
  .topbar select,.topbar button{border:1px solid var(--border);background:#fff;border-radius:10px;padding:.35rem .6rem}
  html[data-theme="dark"] .topbar select, html[data-theme="dark"] .topbar button{background:#0b1220;color:var(--fg)}
  .container{max-width:1200px;margin:1.25rem auto;padding:0 1rem}
  .panel{background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;padding:1rem;margin:.75rem 0}
  `;

  function ensureStyle(){
    if(d.getElementById('idmar-layout-style')) return;
    const s=d.createElement('style'); s.id='idmar-layout-style'; s.textContent=CSS; d.head.appendChild(s);
  }

  function setTheme(mode){
    d.documentElement.dataset.theme = mode;
    try{ localStorage.setItem('IDMAR_THEME', mode); }catch(e){}
  }
  function getTheme(){
    try{ return localStorage.getItem('IDMAR_THEME') || 'light'; }catch(e){ return 'light'; }
  }

  function renderHeader(){
    const bar = d.getElementById('fallback-topbar');
    if(!bar) return;
    bar.classList.add('topbar');
    bar.innerHTML = `
      <img src="img/logo-pm.png" alt="Polícia Marítima"/>
      <div class="brand">
        <span class="app">IDMAR</span>
        <small>Identificação Marítima — Cascos & Motores</small>
      </div>
      <nav class="main" style="margin-left:auto">
        <a href="validador.html">Validador</a>
        <a href="historico_win.html">Histórico WIN</a>
        <a href="historico_motor.html">Histórico Motor</a>
        <a href="forense.html">Forense</a>
        <a href="#" id="idmar-logout">Sair</a>
      </nav>
      <div class="right-ctl">
        <select id="idmar-lang" aria-label="Idioma">
          <option value="pt">PT</option>
          <option value="en">EN</option>
        </select>
        <button id="idmar-theme" title="Alternar tema">🌗</button>
      </div>
    `;

    // Lang
    const lg = d.getElementById('idmar-lang');
    try{
      lg.value = localStorage.getItem('IDMAR_LANG') || 'pt';
      lg.addEventListener('change', ()=>{
        localStorage.setItem('IDMAR_LANG', lg.value);
        location.reload();
      });
    }catch(e){}

    // Theme
    const th = d.getElementById('idmar-theme');
    th.addEventListener('click', ()=>{
      const t = (d.documentElement.dataset.theme === 'dark') ? 'light' : 'dark';
      setTheme(t);
    });

    // Logout
    const lo = d.getElementById('idmar-logout');
    lo.addEventListener('click', (ev)=>{
      ev.preventDefault();
      try{ sessionStorage.clear(); }catch(e){}
      location.href = 'login.html';
    });
  }

  function gateSession(){
    try{
      const ok = sessionStorage.getItem('IDMAR_SESSION')==='ok' || sessionStorage.getItem('NAV_SESSION')==='ok';
      if(!ok && !location.pathname.endsWith('login.html')){
        location.replace('login.html');
      }
    }catch(e){}
  }

  function init(){
    ensureStyle();
    setTheme(getTheme());
    renderHeader();
    gateSession();
  }

  if(d.readyState !== 'loading') init();
  else d.addEventListener('DOMContentLoaded', init);

  // expõe se precisares
  w.IDMAR_renderHeader = renderHeader;

})(window, document);
