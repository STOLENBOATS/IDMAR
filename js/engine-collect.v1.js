// js/engine-collect.v1.js
(function (w, d) {
  'use strict';

  function collect() {
    // Estado vindo do picker/meta-wire
    const stBrand = w.EnginePickerState?.brand || '';
    const stModel = w.EnginePickerState?.model || '';
    const stFamily = w.EnginePickerState?.family || null; // {family, version, power, ranges?}

    // Fallbacks visuais (se por algum motivo o estado ainda não tiver sido preenchido)
    const uiBrand = (d.getElementById('engineBrand')?.value || '').trim();
    const uiModel = (d.querySelector('#engine-picker #engineModel')?.value || '').trim();

    // Campos extra específicos da marca (ex.: rigging, shaft, rotation…)
    const extra = w.EngineBrandState?.data || {};

    // Nº de série (para o visor e validações simples)
    const snRaw = (d.getElementById('engine-sn-raw')?.value || '').trim();

    const brand = (stBrand || uiBrand || '').trim();
    const model = (stModel || uiModel || '').trim();

    const payload = {
      brand,
      model,
      extra
    };

    if (stFamily) payload.family = stFamily;
    if (snRaw) payload.serial = { raw: snRaw };

    return payload;
  }

  function debugLog(prefix) {
    const data = collect();
    console.info(prefix || '[IDMAR collect]', data);
    return data;
  }

  function autoHook() {
    // Botão de validar do CARTÃO 3 (ou equivalente)
    const btn = d.querySelector('#btnMotor, #btnValidar, button[data-action="validate"]');
    if (btn && !btn.dataset._ec) {
      btn.dataset._ec = '1';
      btn.addEventListener('click', () => debugLog('[IDMAR VALIDAR SN:]'));
    }

    // Submissão de form se existir (mantém compatibilidade)
    const form = d.querySelector('#formMotor, form#validador, form[name="validador"]');
    if (form && !form.dataset._ec) {
      form.dataset._ec = '1';
      form.addEventListener('submit', () => debugLog('[IDMAR collect][submit]'));
    }
  }

  w.addEventListener('DOMContentLoaded', autoHook);

  // API pública
  w.EngineCollect = { collect, debugLog };
})(window, document);
