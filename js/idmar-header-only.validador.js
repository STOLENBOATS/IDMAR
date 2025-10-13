/* IDMAR — Header Only (validador) • 2025-09-18
   Injeta um header com logo + título + navegação, sem depender de CSS extra.
   Páginas: login.html, validador.html, historico_win.html, historico_motor.html, forense.html
   Notas:
   - Evita duplicados se já houver .app-header
   - Assinala link ativo com [data-active="1"]
*/
(() => {
  const LINKS = [
    { href: 'login.html',          text: 'Login' },
    { href: 'validador.html',      text: 'Validador' },
    { href: 'historico_win.html',  text: 'Histórico WIN' },
    { href: 'historico_motor.html',text: 'Histórico Motor' },
    { href: 'forense.html',        text: 'Forense' },
  ];

  function makeHeader() {
    const header = document.createElement('header');
    header.className = 'app-header';
    header.setAttribute('data-idmar', 'header-only');

    const brand = document.createElement('div');
    brand.className = 'brand';

    const logo = document.createElement('img');
    logo.src = 'images/logo-pm.jpg'; // mantém o caminho existente
    logo.alt = 'Polícia Marítima';
    logo.className = 'logo';

    const titles = document.createElement('div');
    titles.className = 'titles';

    const h1 = document.createElement('h1');
    h1.textContent = 'M.I.E.C.';

    const sub = document.createElement('p');
    sub.className = 'subtitle';
    sub.textContent = 'Maritime Identification & Engine Checker';

    titles.appendChild(h1);
    titles.appendChild(sub);

    brand.appendChild(logo);
    brand.appendChild(titles);

    const nav = document.createElement('nav');
    nav.className = 'app-nav';

    const here = location.pathname.split('/').pop() || 'validador.html';
    LINKS.forEach(l => {
      const a = document.createElement('a');
      a.href = l.href;
      a.textContent = l.text;
      if (here.toLowerCase() === l.href.toLowerCase()) {
        a.setAttribute('data-active','1');
        a.setAttribute('aria-current','page');
      }
      nav.appendChild(a);
    });

    header.appendChild(brand);
    header.appendChild(nav);
    return header;
  }

  function injectHeader() {
    // evitar duplicados
    if (document.querySelector('.app-header[data-idmar="header-only"]')) return;

    const header = makeHeader();
    // inserir no topo do <body>
    const body = document.body;
    if (body.firstChild) {
      body.insertBefore(header, body.firstChild);
    } else {
      body.appendChild(header);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectHeader);
  } else {
    injectHeader();
  }
})();
