
// js/validator-hook.save-history.v1.js
(function (w, d) {
  'use strict';

  function collectSafe() {
    const basic = (w.EngineCollect && w.EngineCollect.collect) ? w.EngineCollect.collect() : {
      brand: w.EnginePickerState?.brand || (d.getElementById('engineBrand')?.value || ''),
      model: w.EnginePickerState?.model || (d.getElementById('engineModel')?.value || ''),
      extra: w.EngineBrandState?.data || {}
    };
    // tentar apanhar family se o meta-wire preencher
    const famVer = d.getElementById('engineVersion')?.value || '';
    const famPow = d.getElementById('enginePower')?.value || '';
    if (!basic.family && (famVer || famPow)) {
      basic.family = { version: famVer || undefined, power: famPow || undefined };
    }
    // nº série + notas
    const serialRaw = d.getElementById('engine-sn-raw')?.value || '';
    const notes = d.getElementById('engine-sn-notes')?.value || '';
    basic.serial = { raw: serialRaw.trim() };
    basic.notes = notes;
    return basic;
  }

  function onSave() {
    try {
      const payload = collectSafe();
      if (!payload.brand && !payload.model) {
        alert('Selecione a marca/modelo antes de gravar.');
        return;
      }
      if (!payload.serial?.raw) {
        alert('Introduza o nº de série antes de gravar.');
        return;
      }
      const rec = (w.EngineHistory && w.EngineHistory.save)
        ? w.EngineHistory.save(payload)
        : null;
      console.log('[IDMAR] guardado no histórico:', rec || payload);
      const visor = d.getElementById('engine-id-status');
      if (visor) visor.textContent = '✓ Registo guardado no histórico local.';
    } catch (e) {
      console.error('[IDMAR] erro a gravar histórico:', e);
      alert('Falha ao gravar no histórico (ver consola).');
    }
  }

  function arm() {
    const btn = d.getElementById('btnValidateSerial') || d.querySelector('#card-serial button[type="button"]');
    if (btn && !btn.dataset._armed_hist) {
      btn.dataset._armed_hist = '1';
      btn.addEventListener('click', onSave);
    }
  }

  d.addEventListener('DOMContentLoaded', arm);
})(window, document);
