// ribbon-admin.v1.js — injeta botão "Admin" ao lado do "Validador" com o MESMO estilo
(function () {
  const ADMIN_URL = window.IDMAR_ADMIN_URL || 'admin-engines.html';
  const LABEL = 'Item Novo / New Item';

  function findRibbonContainer() {
    return (
      document.getElementById('nav-ribbon') ||
      document.querySelector('.nav-ribbon') ||
      document.querySelector('[data-nav="ribbon"]') ||
      document.querySelector('header nav') ||
      document.querySelector('header')
    );
  }

  function findValidadorBtn() {
    // procura um <a> cujo texto contenha "Validador"
    const links = Array.from(document.querySelectorAll('header a, .nav-ribbon a, nav a'));
    return links.find(a => /validador/i.test(a.textContent || ''));
  }

  // === botão novo, herdando estilo do "Validador" quando possível ===
  function makeBtn(likeEl) {
    const a = document.createElement('a');
    a.href = ADMIN_URL;
    a.textContent = LABEL;
    a.setAttribute('data-idmar-admin-btn', '1');

    if (likeEl) {
      // herda EXATAMENTE as mesmas classes (tamanho/hover)
      a.className = likeEl.className;

      // COR DO BOTÃO (inline) — azul claro
      a.style.background = 'linear-gradient(180deg,#4FA8FF,#2F86E5)';
      a.style.color = '#fff';

      // (opcional) hover ligeiramente mais escuro
      a.addEventListener('mouseenter', () => {
        a.style.background = 'linear-gradient(180deg,#459CFF,#2A78CF)';
      });
      a.addEventListener('mouseleave', () => {
        a.style.background = 'linear-gradient(180deg,#4FA8FF,#2F86E5)';
      });

      // clona o “losango”/ícone do Validador, se existir
      const icon = likeEl.querySelector('span, i, svg');
      if (icon) a.prepend(icon.cloneNode(true));

      // copia padding/borda inline, se houver
      if (likeEl.style.padding) a.style.padding = likeEl.style.padding;
      if (likeEl.style.borderRadius) a.style.borderRadius = likeEl.style.borderRadius;
    } else {
      // Fallback (caso não ache o Validador): estilo mínimo
      a.className = 'nav-ribbon__item ribbon-btn';
      a.style.display = 'inline-flex';
      a.style.alignItems = 'center';
      a.style.gap = '8px';
      a.style.whiteSpace = 'nowrap';
      a.style.background = 'linear-gradient(180deg,#4FA8FF,#2F86E5)';
      a.style.color = '#fff';
      a.style.borderRadius = '16px';
      a.style.padding = '8.8px 16.8px 8.8px 11.2px';
      a.style.textDecoration = 'none';
      const loz = document.createElement('span');
      loz.style.width = '10px'; loz.style.height = '10px';
      loz.style.transform = 'rotate(45deg)'; loz.style.background = 'rgba(255,255,255,.35)';
      loz.style.borderRadius = '2px';
      a.prepend(loz);
    }
    return a;
  }

  function inject() {
    if (document.querySelector('[data-idmar-admin-btn]')) return true; // já existe

    const val = findValidadorBtn();
    const admin = makeBtn(val);

    if (val && val.parentElement) {
      // coloca mesmo ao lado do “Validador”
      val.insertAdjacentElement('afterend', admin);
      return true;
    }

    const ribbon = findRibbonContainer();
    if (ribbon) {
      ribbon.appendChild(admin);
      return true;
    }
    return false;
  }

  function boot() {
    if (inject()) return;
    // header é injetado por JS — observa até aparecer
    const obs = new MutationObserver(() => {
      if (inject()) obs.disconnect();
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });

    // fallback de tentativas periódicas
    let tries = 0;
    const t = setInterval(() => {
      tries++;
      if (inject() || tries > 12) clearInterval(t);
    }, 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
