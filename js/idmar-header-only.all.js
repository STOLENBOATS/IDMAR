/* IDMAR header-only (compact v3) */
(() => {
  if (document.querySelector('.app-header[data-idmar="header-only"]')) return;

  const HREFS = [
    ['validador.html','Validador'],
    ['historico_win.html','Histórico WIN'],
    ['historico_motor.html','Histórico Motor'],
    ['forense.html','Forense'],
    ['#logout','Sair'],
  ];
  const here = (location.pathname.split('/').pop() || '').toLowerCase();

  const head = document.createElement('header');
  head.className = 'app-header';
  head.setAttribute('data-idmar','header-only');
  Object.assign(head.style, {display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem',padding:'.75rem 1rem',borderBottom:'1px solid #e5e7eb',background:'#fff'});

  const left = document.createElement('div');
  Object.assign(left.style,{display:'flex',alignItems:'center',gap:'.75rem'});
  const img = new Image(); img.src='img/logo-pm.png'; img.alt='Polícia Marítima'; img.style.height='32px';
  const t = document.createElement('div');
  const a = document.createElement('div'); a.textContent='IDMAR'; a.style.fontWeight='800'; a.style.fontSize='1.6rem'; a.style.lineHeight='1';
  const b = document.createElement('div'); b.innerHTML='Identificação Marítima — Cascos &amp; Motores'; b.style.opacity='.8';
  t.append(a,b); left.append(img,t);

  const right = document.createElement('div');
  Object.assign(right.style,{display:'flex',alignItems:'center',gap:'1rem'});
  const nav = document.createElement('nav');
  Object.assign(nav.style,{display:'flex',alignItems:'center',gap:'1rem'});

  HREFS.forEach(([href,txt])=>{
    const el = document.createElement('a'); el.href=href; el.textContent=txt;
    if (href !== '#logout' && here === href.toLowerCase()) { el.setAttribute('data-active','1'); el.style.fontWeight='700'; }
    if (href === '#logout') {
      el.addEventListener('click', (e)=>{ e.preventDefault();
        try { if (window.SupaAuth?.signOut) return void window.SupaAuth.signOut().finally(()=>location.href='login.html'); } catch(_) {}
        location.href='login.html';
      });
    }
    nav.appendChild(el);
  });

  const themeBtn = document.querySelector('#idmar-theme-toggle') ||
                   document.querySelector('[data-theme-toggle]') ||
                   document.querySelector('.theme-toggle') ||
                   document.querySelector('#themeToggle');

  right.append(nav); if (themeBtn && themeBtn.parentElement !== right) right.append(themeBtn);
  head.append(left,right);
  document.body.insertBefore(head, document.body.firstChild);
})();
