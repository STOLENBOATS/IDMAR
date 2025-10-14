// js/engine-collect.v1.js
// IDMAR — Collect current brand/model + brand-specific extra fields
// Usage:
//   <script defer src="./js/engine-collect.v1.js"></script>
//   window.EngineCollect.collect()  -> { brand, model, extra }
(function (w, d) {
  'use strict';

  function collect() {
    const brand = w.EnginePickerState?.brand || (d.getElementById('engineBrand')?.value || '');
    const model = w.EnginePickerState?.model || (d.getElementById('engineModel')?.value || '');
    const extra = w.EngineBrandState?.data || {};
    return { brand, model, extra };
  }

  // Helper to log nicely (for quick testing)
  function debugLog(prefix) {
    const data = collect();
    console.info(prefix || '[IDMAR collect]', data);
    return data;
  }

  // Auto-hook: if there is a form or validate button, attach debug log
  function autoHook() {
    const btn = d.querySelector('#btnValidar, #btn-validar, button[data-action="validate"]');
    const form = d.querySelector('#formValidador, form#validador, form[name="validador"]');
    if (btn && !btn.dataset._ec) {
      btn.dataset._ec = '1';
      btn.addEventListener('click', () => debugLog('[IDMAR collect][btn]'));
    }
    if (form && !form.dataset._ec) {
      form.dataset._ec = '1';
      form.addEventListener('submit', (ev) => { debugLog('[IDMAR collect][submit]'); });
    }
  }

  w.addEventListener('DOMContentLoaded', autoHook);
  w.EngineCollect = { collect, debugLog };
})(window, document);
