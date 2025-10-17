// js/engine-v2-bridge.js
// Liga o "modelo confirmado" (picker/bridge) ao catálogo v2:
// - encontra família/versão/potência/intervalos
// - preenche selects (Versão/Potência) e info de SN
// - atualiza EnginePickerState.family para o visor
// - foca o campo do nº de motor
(function (w, d) {
  'use strict';

  const CATALOG_URL = 'data/engines_catalog.v2.json';

  let CATALOG = null;
  const $  = (id) => d.getElementById(id);
  const NN = (s) => String(s || '').toUpperCase().replace(/\s+/g, '');

  function setOptions(sel, values) {
    if (!sel) return;
    const opts = ['<option value="">—</option>']
      .concat((values || []).map(v => `<option value="${v}">${v}</option>`));
    sel.innerHTML = opts.join('');
  }

  function findHit(brand, modelCode) {
    const fams =
      CATALOG?.brands?.[brand]?.families ||
      CATALOG?.brands?.Yamaha?.families || // fallback
      {};
    const code = NN(modelCode);

    for (const [familyName, fam] of Object.entries(fams)) {
      for (const v of (fam.versions || [])) {
        const vCode = NN(v.version);
        // matches razoáveis (exatos and “prefix alike”)
        if (vCode === code || vCode.startsWith(code) || code.startsWith(vCode)) {
          return {
            family: familyName,
            version: v.version,
            power: v.power,
            ranges: v.serial?.ranges || [],
            notes:  v.serial?.notes  || '',
            rigging:   v.rigging   || '',
            shaft:     v.shaft     || '',
            rotation:  v.rotation  || '',
            gearcase:  v.gearcase  || ''
          };
        }
      }
    }
    return null;
  }

  async function loadCatalog() {
    try {
      const r = await fetch(CATALOG_URL);
      CATALOG = await r.json();
      console.log('[IDMAR] v2-bridge: catálogo v2 carregado.');
    } catch (e) {
      console.warn('[IDMAR] v2-bridge: falha a carregar catálogo v2:', e);
    }
  }

  // Escuta commits de modelo (enter, picker, base+variante)
  w.addEventListener('idmar:model-commit', (ev) => {
    if (!CATALOG) return;
    const code  = (ev.detail?.model || '').trim();
    if (!code) return;

    const brand = w.EnginePickerState?.brand || $('engineBrand')?.value || 'Yamaha';
    const hit   = findHit(brand, code);

    const verSel = $('engineVersion');
    const powSel = $('enginePower');
    const snInfo = $('engineSerialInfo');

    if (hit) {
      setOptions(verSel, [hit.version]); verSel.value = hit.version;
      setOptions(powSel, [hit.power]);   powSel.value = String(hit.power);

      const rangesTxt = hit.ranges.length
        ? hit.ranges.map(r => `${r.from}–${r.to}`).join(', ')
        : 'Sem intervalos.';
      snInfo.textContent = hit.notes ? `${hit.notes} ${rangesTxt}` : rangesTxt;

      // expõe família/versão/potência/intervalos ao visor (engine-id-visor)
      w.EnginePickerState = Object.assign({}, w.EnginePickerState, {
        family: { family: hit.family, version: hit.version, power: hit.power, ranges: hit.ranges }
      });

      // foco no campo do nº do motor (cartão 3)
      $('engine-sn-raw')?.focus();
    } else {
      setOptions(verSel, []);
      setOptions(powSel, []);
      if (snInfo) snInfo.textContent = '';
      if (w.EnginePickerState) w.EnginePickerState.family = null;
    }
  });

  w.addEventListener('DOMContentLoaded', loadCatalog);
})(window, document);
