// js/engine-collect.v1.js
(function (w, d) {
  'use strict';
  function collect() {
    const brand = w.EnginePickerState?.brand || (d.getElementById('engineBrand')?.value || '');
    const model = w.EnginePickerState?.model || (d.getElementById('engineModel')?.value || '');
    const extra = w.EngineBrandState?.data || {};
    return { brand, model, extra };
  }
  function debugLog(prefix) {
    const data = collect();
    console.info(prefix || '[IDMAR collect]', data);
    return data;
  }
  function autoHook() {
    const btn = d.querySelector('#btnMotor, #btnValidar, button[data-action="validate"]');
    const form = d.querySelector('#formMotor, form#validador, form[name="validador"]');
    if (btn && !btn.dataset._ec) { btn.dataset._ec='1'; btn.addEventListener('click', () => debugLog('[IDMAR collect][btn]')); }
    if (form && !form.dataset._ec) { form.dataset._ec='1'; form.addEventListener('submit', () => debugLog('[IDMAR collect][submit]')); }
  }
  w.addEventListener('DOMContentLoaded', autoHook);
  w.EngineCollect = { collect, debugLog };
})(window, document);
