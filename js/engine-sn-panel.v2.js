// Stub: painel do Nº do motor
(function (w, d) {
  'use strict';
  const input = d.getElementById('engine-sn-raw');
  const out = d.getElementById('engine-sn-result');
  if (!input || !out) return;

  function render(res) {
    out.innerHTML = '';
    const pre = d.createElement('pre');
    pre.textContent = JSON.stringify(res, null, 2);
    out.appendChild(pre);
  }

  input.addEventListener('input', () => {
    const sn = input.value || '';
    const res = (w.EngineSNRange && w.EngineSNRange.check)
      ? w.EngineSNRange.check(sn)
      : { ok: sn.trim().length > 0, ranges: [], notes: '' };
    render(res);
  });
})(window, document);
