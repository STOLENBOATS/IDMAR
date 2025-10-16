// js/validators/engine-sn.v2.js
(function (w) {
  'use strict';

  // Espera-se que window.EngineSNRules seja carregado (JSON do /data)
  function normalize(sn) {
    return (sn || '').trim().toUpperCase()
      .replace(/\s+/g, '')
      .replace(/[–—]/g, '-'); // normaliza traços
  }

  function detectBrand(sn, rules) {
    for (const [brand, spec] of Object.entries(rules.brands || {})) {
      for (const d of (spec.detectors || [])) {
        const re = new RegExp(d.regex);
        if (re.test(sn)) return { brand, detector: d };
      }
    }
    return { brand: null, detector: null };
  }

  function extractParts(brand, sn) {
    if (brand === 'Honda') {
      const m = sn.match(/^(BF[0-9]{2,3}[A-Z]?)-([A-Z]{4})-([0-9]{7})$/);
      if (m) return { modelCode: m[1], plant: m[2], serial: +m[3] };
    }
    if (brand === 'Mercury') {
      const m = sn.match(/^([0-9][A-Z])([0-9]{6})$/);
      if (m) return { series: m[1], serial: +m[2] };
    }
    if (brand === 'Yamaha') {
      const m = sn.match(/^([A-Z0-9]{3,5})-([A-Z]{3,4})-([0-9]{6,7})$/);
      if (m) return { modelCode: m[1], plant: m[2], serial: +m[3] };
      const m2 = sn.match(/^([A-Z]{3,5})-?([0-9]{5,7})$/);
      if (m2) return { modelCode: m2[1], serial: +m2[2] };
    }
    return {};
  }

  function applyKnownRanges(score, reasons, knownRanges, serial) {
    if (!Array.isArray(knownRanges) || serial == null) return score;
    const hit = knownRanges.find(r => serial >= (r.from||0) && serial <= (r.to||0));
    if (hit) { score += 0.3 * (hit.confidence || 0.5); reasons.push(`Dentro de intervalo fornecido.`); }
    return score;
  }

  function scoreChecks(brand, parts, spec) {
    let score = 0, reasons = [];

    if (parts.serial != null) {
      const len = String(parts.serial).length;
      if (spec.serial_length?.includes(len)) { score += 0.25; reasons.push(`Comprimento OK (${len}).`); }
      else reasons.push(`Comprimento atípico (${len}).`);
    }

    if (brand === 'Mercury' && parts.series && spec.year_series_prefix?.some(p => parts.series.startsWith(p))) {
      score += 0.25; reasons.push(`Série Mercury reconhecida (${parts.series}).`);
    }

    if (parts.plant && spec.plant_codes?.includes(parts.plant.slice(0,2))) {
      score += 0.2; reasons.push(`Planta plausível (${parts.plant}).`);
    }

    if (parts.__detectorMatch) score += 0.2;

    score = Math.max(0, Math.min(1, score));
    return { score, reasons };
  }

  function check(raw, knownRanges) {
    const sn = normalize(raw);
    if (!sn) return { ok:false, reason:'vazio', brand:null, score:0, reasons:['Campo vazio.'], parts:{ raw:'' } };

    const rules = w.EngineSNRules || { brands:{} };
    const det   = detectBrand(sn, rules);
    const brand = det.brand || 'Yamaha'; // fallback razoável
    const spec  = rules.brands[brand] || {};

    const parts = extractParts(brand, sn);
    parts.__detectorMatch = det.detector;

    let { score, reasons } = scoreChecks(brand, parts, spec);

    // aplica ranges conhecidos passados do picker/family (se existirem)
    if (parts.serial != null) score = applyKnownRanges(score, reasons, knownRanges, parts.serial);

    const verdict = {
      ok: score >= 0.6,
      score,
      brand,
      parts: { ...parts, raw: sn },
      reasons: (parts.__detectorMatch ? [`Formato reconhecido (${parts.__detectorMatch.hint||'regex'}).`] : []).concat(reasons)
    };
    return verdict;
  }

  // API pública (mantém nome para compatibilidade)
  w.EngineSNRange = w.EngineSNRange || {};
  w.EngineSNRange.check = (raw, knownRanges) => check(raw, knownRanges);
})(window);
