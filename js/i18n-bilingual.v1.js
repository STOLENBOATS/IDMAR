// js/i18n-bilingual.v1.js
// Render bilingual titles using data attributes: data-bi-pt / data-bi-en
// Default format: "PT / EN"
// Usage:
//   <h2 class="card-title" data-bi-pt="Validador Motor" data-bi-en="Engine Validator"></h2>
//   <script defer src="./js/i18n-bilingual.v1.js"></script>
//   <script>Bilingual.renderAll();</script>
(function (w, d) {
  'use strict';
  const SEP = ' / ';

  function renderEl(el) {
    const pt = el.getAttribute('data-bi-pt');
    const en = el.getAttribute('data-bi-en');
    if (!pt && !en) return;
    const text = [pt, en].filter(Boolean).join(SEP);
    el.textContent = text;
    el.setAttribute('title', text);
  }

  function renderAll(root) {
    const scope = root || d;
    scope.querySelectorAll('[data-bi-pt], [data-bi-en]').forEach(renderEl);
  }

  // Optional: live observer for dynamically injected cards
  let obs;
  function observe(root) {
    const target = root || d.body;
    if (!w.MutationObserver || !target) return;
    if (obs) obs.disconnect();
    obs = new MutationObserver((list) => {
      for (const m of list) {
        if (m.type === 'childList') {
          m.addedNodes.forEach(n => {
            if (n.nodeType === 1) {
              if (n.matches && (n.matches('[data-bi-pt], [data-bi-en]'))) renderEl(n);
              if (n.querySelectorAll) n.querySelectorAll('[data-bi-pt], [data-bi-en]').forEach(renderEl);
            }
          });
        }
      }
    });
    obs.observe(target, { childList: true, subtree: true });
  }

  w.Bilingual = { renderAll, observe };
  w.addEventListener('DOMContentLoaded', () => { renderAll(); observe(); });
})(window, document);
