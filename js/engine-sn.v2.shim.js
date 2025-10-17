// js/engine-sn.v2.shim.js
// Shim mínimo para validar nºs de série contra intervalos {from,to}
// Não depende de nada; expõe window.EngineSNRange.check(raw, ranges)
(function (w) {
  'use strict';
  w.EngineSNRange = {
    /**
     * @param {string} raw   - nº de série tal como escrito
     * @param {Array<{from:number|string,to:number|string}>} ranges
     * @returns {null|{ok:boolean,match?:{from:number,to:number},reason?:string}}
     */
    check(raw, ranges) {
      try {
        if (!Array.isArray(ranges) || !ranges.length) return null;
        const match = String(raw || '').match(/\d+/);
        if (!match) return { ok: false, reason: 'sem dígitos' };
        const num = Number(match[0]);
        for (const r of ranges) {
          const a = Number(r.from), b = Number(r.to);
          if (!isNaN(a) && !isNaN(b) && num >= a && num <= b) {
            return { ok: true, match: { from: a, to: b } };
          }
        }
        return { ok: false };
      } catch {
        return null;
      }
    }
  };
})(window);
