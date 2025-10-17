// IDMAR header-only r3b — só desenha o header; NÃO aplica CSS globais
(function(w,d){
  function renderHeader(){
    const bar = d.getElementById('fallback-topbar');
    if(!bar) return;
    bar.innerHTML = `
      <div class="idmar-topbar" style="display:flex;align-items:center;gap:.75rem;padding:.75rem 1rem;border-bottom:1px solid #e5e7eb;background:#ffffff">
        <img src="img/logo-pm.png" alt="Polícia Marítima" style="height:36px"/>
        <div style="display:flex;flex-direction:column">
          <span style="font-weight:800">IDMAR</span>
          <small>Identificação Marítima — Cascos & Motores</small>
        </div>
        <nav style="margin-left:auto;display:flex;gap:1rem">
          <a href="validador.html">Validador</a>
          <a href="historico_win.html">Histórico WIN</a>
          <a href="historico_motor.html">Histórico Motor</a>
          <a href="forense.html">Forense</a>
          <a href="#" id="idmar-logout">Sair</a>
        </nav>
        <div style="display:flex;gap:.5rem;align-items:center;margin-left:.75rem">
          <select id="idmar-lang" aria-label="Idioma">
            <option value="pt">PT</option>
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="de">DE</option>
          </select>
          <button id="idmar-theme" title="Alternar tema">🌗</button>
        </div>
      </div>
    `;

    // Idioma persistente
    const lg = d.getElementById('idmar-lang');
    try{
      lg.value = localStorage.getItem('IDMAR_LANG') || 'pt';
      lg.addEventListener('change', ()=>{
        localStorage.setItem('IDMAR_LANG', lg.value);
        location.reload();
      });
    }catch(e){}

    // Tema persistente (só define data-theme; não inclui CSS)
    d.getElementById('idmar-theme').addEventListener('click', ()=>{
      const el = d.documentElement;
      const mode = el.dataset.theme === 'dark' ? 'light' : 'dark';
      el.dataset.theme = mode;
      try{ localStorage.setItem('IDMAR_THEME', mode); }catch(e){}
    });

    // Logout
    d.getElementById('idmar-logout').addEventListener('click', (ev)=>{
      ev.preventDefault();
      try{ sessionStorage.clear(); }catch(e){}
      location.href = 'login.html';
    });
  }

  if(d.readyState !== 'loading') renderHeader();
  else d.addEventListener('DOMContentLoaded', renderHeader);
})(window, document);
