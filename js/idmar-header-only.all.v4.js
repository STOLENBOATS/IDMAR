
/* IDMAR — Header Only v4 (patched: ribbon PT/EN + Day/Night) */
(() => {
  if (document.querySelector('.app-header[data-idmar="header-only"]')) return;

  const HREFS = [
    ['validador.html','nav.validator'],
    ['historico_win.html','nav.hist_win'],
    ['historico_motor.html','nav.hist_motor'],
    ['forense.html','nav.forense'],
    ['#logout','nav.logout'],
  ];
  const here = (location.pathname.split('/').pop() || '').toLowerCase();
  const t = (k)=> (window.IDMAR_I18N?.t(k) || k);

  const head = document.createElement('header');
  head.className = 'app-header';
  head.setAttribute('data-idmar','header-only');
  Object.assign(head.style, {display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem',padding:'.75rem 1rem',borderBottom:'1px solid #e5e7eb',background:'#fff'});

  const left = document.createElement('div');
  Object.assign(left.style,{display:'flex',alignItems:'center',gap:.75+ 'rem'});
  const img = new Image(); img.src='img/logo-pm.png'; img.alt='Polícia Marítima'; img.style.height='32px';
  const tbox = document.createElement('div');
  const app = document.createElement('div'); app.setAttribute('data-i18n-appname',''); app.textContent=t('app.name'); app.style.fontWeight='800'; app.style.fontSize='1.6rem'; app.style.lineHeight='1';
  const sub = document.createElement('div'); sub.setAttribute('data-i18n-appsub',''); sub.textContent=t('app.subtitle'); sub.style.opacity='.8';
  tbox.append(app,sub); left.append(img,tbox);

  const right = document.createElement('div');
  Object.assign(right.style,{display:'flex',alignItems:'center',gap:'1rem'});
  right.classList.add('nav-ribbon'); // key class so our ribbon toggles can hook

  const nav = document.createElement('nav');
  Object.assign(nav.style,{display:'flex',alignItems:'center',gap:'1rem'});

  HREFS.forEach(([href,key])=>{
    const a=document.createElement('a'); a.href=href; a.setAttribute('data-i18n-nav',key); a.textContent=t(key);
    if (href !== '#logout' && here === href.toLowerCase()) { a.setAttribute('data-active','1'); a.style.fontWeight='700'; }
    if (href === '#logout') {
      a.addEventListener('click', (e)=>{ e.preventDefault();
        try { if (window.SupaAuth?.signOut) return void window.SupaAuth.signOut().finally(()=>location.href='login.html'); } catch(_) {}
        location.href='login.html';
      });
    }
    nav.appendChild(a);
  });

  // (Removed inline language button to avoid duplicates; ribbon toggles will inject controls)
  right.append(nav);

  head.append(left,right);
  document.body.insertBefore(head, document.body.firstChild);

  // Apply i18n to injected header
  window.IDMAR_I18N?.apply(head);

  // === IDMAR layout normalize (margens/containers homogéneas) ===
  (function injectIdmarNormalize(){
    if (document.getElementById('idmar-normalize')) return;
    const css = `
    :root{
      --idmar-max:1100px; --idmar-pad:16px; --idmar-top:1.25rem; --idmar-gap:.75rem;
    }
    /* header fica full-bleed */
    .app-header{max-width:none !important;margin:0 !important;padding:.75rem 1rem}
    /* conteúdo alinhado */
    body>main, body>.container, main .container:first-child{
      max-width:var(--idmar-max) !important;
      margin:var(--idmar-top) auto !important;
      padding-left:var(--idmar-pad) !important;
      padding-right:var(--idmar-pad) !important;
      box-sizing:border-box;
    }
    /* painéis/blocks */
    .panel{margin:var(--idmar-gap) 0 !important}
    /* footer com mesma largura do conteúdo */
    footer{
      max-width:var(--idmar-max); margin:var(--idmar-top) auto 0 auto;
      padding-left:var(--idmar-pad); padding-right:var(--idmar-pad); width:100%;
      box-sizing:border-box;
    }`;
    const style = document.createElement('style');
    style.id = 'idmar-normalize';
    style.textContent = css;
    document.head.appendChild(style);
  })();

  /* ===== IDMAR — Ribbon PT/EN + Dia/Noite (append-only) v1 ===== */
  (function (w, d) {
    var KEY_LANG = 'idmar_lang';
    var KEY_THEME = 'idmar_theme';

    function applyTheme(theme) {
      if (theme !== 'dark') theme = 'light';
      try { localStorage.setItem(KEY_THEME, theme); } catch(e){}
      d.documentElement.classList.toggle('theme-dark', theme === 'dark');
      // Dark theme using your CSS variables:
      if (!d.getElementById('idmar-theme-style')) {
        var s = d.createElement('style'); s.id = 'idmar-theme-style';
        s.textContent = [
          'html.theme-dark{--bg:#0b1220;--fg:#e5e7eb;--bg-elev:#0f172a;--border:#1f2937;--link:#66c2ff;}',
          'html.theme-dark body{background:var(--bg);color:var(--fg)}',
          'html.theme-dark .panel,html.theme-dark .card{background:var(--bg-elev);border-color:var(--border)}',
          'html.theme-dark input,html.theme-dark select,html.theme-dark textarea{background:#0b1322;color:var(--fg);border-color:var(--border)}',
          'html.theme-dark button, html.theme-dark .btn{border-color:var(--link);background:var(--link);color:#001b33}',
          'html.theme-dark .btn.secondary{background:transparent;color:var(--link)}'
        ].join('');
        d.head.appendChild(s);
      }
      updateRibbonButtons();
    }

    // Texts must be "PT / EN" — we show the chosen side; preserves original in data attributes.
    function applyLang(lang) {
      try { localStorage.setItem(KEY_LANG, lang); } catch(e){}
      var sels = ['h1','h2','h3','h4','legend','label','th','td','button','.btn','.card-header','a','.ribbon a','.ribbon button'];
      sels.forEach(function(sel){
        d.querySelectorAll(sel).forEach(function(el){
          var isInput = el.tagName === 'INPUT';
          var prop = isInput ? 'value' : 'textContent';
          var txt = el[prop] || '';
          if (!txt) return;
          if (!el.dataset.orig) el.dataset.orig = txt; // keep original once
          var parts = el.dataset.orig.split(' / ');
          if (parts.length === 2) el[prop] = (lang === 'pt') ? parts[0] : parts[1];
        });
      });
      // placeholders
      d.querySelectorAll('input[placeholder],textarea[placeholder]').forEach(function(el){
        var ph = el.getAttribute('placeholder') || '';
        if (!ph) return;
        if (!el.dataset.origPh) el.dataset.origPh = ph;
        var P = el.dataset.origPh.split(' / ');
        if (P.length === 2) el.setAttribute('placeholder', (lang === 'pt') ? P[0] : P[1]);
      });
      // titles
      d.querySelectorAll('[title]').forEach(function(el){
        var t = el.getAttribute('title') || '';
        if (!t) return;
        if (!el.dataset.origTitle) el.dataset.origTitle = t;
        var P = el.dataset.origTitle.split(' / ');
        if (P.length === 2) el.setAttribute('title', (lang === 'pt') ? P[0] : P[1]);
      });
      updateRibbonButtons();
    }

    function makeRibbonButtons(container) {
      if (!container || container.querySelector('.idmar-lang-toggle')) return;
      // Basic chip styles (scoped)
      if (!d.getElementById('idmar-ribbon-style')) {
        var s = d.createElement('style'); s.id='idmar-ribbon-style';
        s.textContent = [
          '.idmar-chip{border:1px solid #0b6bcb;background:#0b6bcb;color:#fff;border-radius:999px;',
          'padding:6px 10px;margin-left:6px;cursor:pointer;font-weight:600;display:inline-flex;align-items:center;gap:6px}',
          '.idmar-chip.secondary{background:#fff;color:#0b6bcb}',
          '.nav-ribbon .idmar-chip{line-height:1;}'
        ].join('');
        d.head.appendChild(s);
      }
      var group = d.createElement('span');
      group.className = 'idmar-lang-toggle';
      group.innerHTML =
        '<button type="button" id="rbtn-pt" class="idmar-chip">PT</button>' +
        '<button type="button" id="rbtn-en" class="idmar-chip secondary">EN</button>' +
        '<button type="button" id="rbtn-theme" class="idmar-chip secondary" title="Dia/Noite">☀︎ Day</button>';
      container.appendChild(group);

      d.getElementById('rbtn-pt').onclick = function(){ applyLang('pt'); };
      d.getElementById('rbtn-en').onclick = function(){ applyLang('en'); };
      d.getElementById('rbtn-theme').onclick = function(){
        var cur = (localStorage.getItem(KEY_THEME) || 'light');
        applyTheme(cur === 'dark' ? 'light' : 'dark');
      };
      updateRibbonButtons();
    }

    function updateRibbonButtons() {
      var lang = localStorage.getItem(KEY_LANG) || 'pt';
      var theme = localStorage.getItem(KEY_THEME) || 'light';
      var rpt = d.getElementById('rbtn-pt');
      var ren = d.getElementById('rbtn-en');
      var rth = d.getElementById('rbtn-theme');
      if (rpt && ren) {
        if (lang === 'pt') { rpt.classList.remove('secondary'); ren.classList.add('secondary'); }
        else { ren.classList.remove('secondary'); rpt.classList.add('secondary'); }
      }
      if (rth) rth.textContent = (theme === 'dark') ? '🌙 Night' : '☀︎ Day';
    }

    // Find ribbon after header injects; works also on login
    function hookRibbon() {
      var container = d.querySelector('.nav-ribbon, .ribbon, .nav-ribbon--right, header .actions');
      if (container) {
        makeRibbonButtons(container);
        applyTheme(localStorage.getItem(KEY_THEME) || 'light');
        applyLang(localStorage.getItem(KEY_LANG) || 'pt');
        return true;
      }
      return false;
    }

    function boot() {
      if (hookRibbon()) return;
      // Header may be injected later → observe
      var mo = new MutationObserver(function(){
        if (hookRibbon()) mo.disconnect();
      });
      mo.observe(d.documentElement, { childList:true, subtree:true });
    }

    if (d.readyState !== 'loading') boot();
    else d.addEventListener('DOMContentLoaded', boot);
  })(window, document);
  /* ===== /IDMAR — Ribbon toggles ===== */

})(); // <— fecha o IIFE do header v4
