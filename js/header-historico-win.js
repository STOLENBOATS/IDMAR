/* IDMAR Header — Histórico WIN • 2025-09-18 */
(() => {
  const ACTIVE = 'historico_win.html';
  injectHeader(ACTIVE);

  function injectHeader(activeHref){
    if (document.querySelector('.app-header[data-idmar="header-only"]')) return;

    const header = h('header', 'app-header');
    header.setAttribute('data-idmar','header-only');
    styleHeader(header);

    const left = h('div'); styleFlex(left,'.75rem');
    const logo = h('img'); logo.src='img/logo-pm.png'; logo.alt='Polícia Marítima'; logo.style.height='32px';
    const titles = h('div'); const app=h('div',null,'IDMAR'); app.style.fontWeight='800'; app.style.fontSize='1.6rem'; app.style.lineHeight='1';
    const sub=h('div',null,'Identificação Marítima — Cascos & Motores'); sub.style.opacity='.8';
    titles.append(app,sub); left.append(logo,titles);

    const right = h('div'); styleFlex(right,'1rem');
    const nav = buildNav(activeHref);
    const themeBtn = document.querySelector('#idmar-theme-toggle') ||
                     document.querySelector('[data-theme-toggle]') ||
                     document.querySelector('.theme-toggle') ||
                     document.querySelector('#themeToggle');
    right.append(nav); if (themeBtn && themeBtn.parentElement !== right) right.append(themeBtn);

    header.append(left,right);
    document.body.insertBefore(header, document.body.firstChild);
  }

  function buildNav(activeHref){
    const here = (location.pathname.split('/').pop() || '').toLowerCase();
    const nav = h('nav','app-nav'); styleFlex(nav,'1rem');
    [
      ['validador.html','Validador'],
      ['historico_win.html','Histórico WIN'],
      ['historico_motor.html','Histórico Motor'],
      ['forense.html','Forense'],
      ['#logout','Sair']
    ].forEach(([href,txt])=>{
      const a=h('a',null,txt); a.href=href;
      if (href!=='#logout' && (here||ACTIVE)===href.toLowerCase()){ a.setAttribute('data-active','1'); a.style.fontWeight='700'; }
      if (href==='#logout'){
        a.addEventListener('click', (e)=>{
          e.preventDefault();
          try{ if(window.SupaAuth?.signOut) return void window.SupaAuth.signOut().finally(()=>location.href='login.html'); }catch(_){}
          location.href='login.html';
        });
      }
      nav.append(a);
    });
    return nav;
  }

  // helpers
  function h(t,c,x){ const e=document.createElement(t); if(c) e.className=c; if(x) e.textContent=x; return e; }
  function styleFlex(el,g){ el.style.display='flex'; el.style.alignItems='center'; el.style.gap=g||'.5rem'; }
  function styleHeader(el){ el.style.display='flex'; el.style.alignItems='center'; el.style.justifyContent='space-between'; el.style.gap='1rem'; el.style.padding='.75rem 1rem'; el.style.borderBottom='1px solid #e5e7eb'; el.style.background='#fff'; }
})();