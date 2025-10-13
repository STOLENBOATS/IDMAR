// validador-motor.r3d.js — validação reforçada + histórico compatível (PT/EN)
(function (w, d) {
  console.info('[IDMAR] validador-motor ATIVO: r3d');
  w.IDMAR = w.IDMAR || {};
  w.NAV = w.NAV || w.IDMAR;
  NAV.STORAGE = NAV.STORAGE || { SESSION: 'IDMAR_SESSION', WIN_HISTORY: 'hist_win', MOTOR_HISTORY: 'hist_motor' };

  function $id(id) { return d.getElementById(id); }
  function load(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; } }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val || [])); } catch (e) {} }
  function nowISO() { try { return new Date().toISOString(); } catch (e) { return String(Date.now()); } }
  function norm(x) { return (x == null) ? '' : String(x).trim(); }

  async function loadCatalog() {
    const r = await fetch('data/engines_catalog.v2.json', { cache: 'no-store' });
    if (!r.ok) throw new Error('catalog');
    return r.json();
  }

  function gatherEnv(cat, brand, family) {
    const b = (cat.brands || {})[brand] || {};
    const fams = b.families || {};
    const listFam = (family && fams[family]) ? [fams[family]] : Object.values(fams);
    const acc = { hp: new Set(), years: new Set(), models: new Set(), rig: new Set(), shaft: new Set(), displacement: new Set() };
    listFam.forEach(f => {
      const v = Array.isArray(f.variants) ? f.variants : [];
      (f.hp || []).forEach(h => acc.hp.add(String(h)));
      if (Array.isArray(f.years) && f.years.length === 2) {
        for (let y = f.years[0]; y <= f.years[1]; y++) acc.years.add(String(y));
      }
      v.forEach(x => {
        if (x.code) acc.models.add(String(x.code).toLowerCase());
        if (x.hp != null) acc.hp.add(String(x.hp));
        (x.rigging || f.rigging || []).forEach(r => acc.rig.add(String(r)));
        (x.shaft || f.shaft || []).forEach(s => acc.shaft.add(String(s)));
        (x.displacement || []).forEach(cc => acc.displacement.add(String(cc)));
      });
      (f.rigging || []).forEach(r => acc.rig.add(String(r)));
      (f.shaft || []).forEach(s => acc.shaft.add(String(s)));
    });
    return {
      hp: Array.from(acc.hp),
      years: Array.from(acc.years),
      models: Array.from(acc.models),
      rig: Array.from(acc.rig),
      shaft: Array.from(acc.shaft),
      displacement: Array.from(acc.displacement)
    };
  }

  function buildSummaryPTEN(s) {
    const parts = [];
    if (s.family) parts.push(`Família/Family: ${s.family}`);
    if (s.model) parts.push(`Modelo/Model: ${s.model}`);
    if (s.hp) parts.push(`Potência/Power: ${s.hp} hp`);
    if (s.rigging) parts.push(`Comando/Rigging: ${s.rigging}`);
    if (s.shaft) parts.push(`Coluna/Shaft: ${s.shaft}`);
    if (s.rotation) parts.push(`Rotação/Rotation: ${s.rotation}`);
    if (s.displacement) parts.push(`Cilindrada/Displacement: ${s.displacement} cc`);
    if (s.year) parts.push(`Ano/Year: ${s.year}`);
    if (s.origin) parts.push(`Origem/Origin: ${s.origin}`);
    return parts.join(' | ');
  }

  function getSel() {
    const v = id => ($id(id) && $id(id).value) || '';
    return {
      brand: ($id('brand')?.value) || '',
      family: v('eng_family'),
      model: v('eng_model') || norm($id('srch_model')?.value || ''),
      hp: v('eng_hp') || norm($id('srch_power')?.value || ''),
      displacement: v('eng_disp') || norm($id('srch_disp')?.value || ''),
      year: v('eng_year') || norm($id('srch_year')?.value || ''),
      rigging: v('eng_rig'),
      shaft: v('eng_shaft'),
      rotation: v('eng_rot'),
      color: v('eng_color'),
      gear: v('eng_gear'),
      origin: norm($id('srch_origin')?.value || '')
    };
  }

  function badge(ok, errs) {
    if (ok) return '<span class="badge good">Válido / Valid</span>';
    const lis = (errs || []).map(e => '<li>' + e + '</li>').join('');
    return '<span class="badge bad">Inválido / Invalid</span><ul style="margin:.4rem 0 .2rem .9rem">' + lis + '</ul>';
  }

  // --------- HISTÓRICO: compat total + resiliente a quota ----------
  function cryptoRandomId() {
    try {
      const a = new Uint8Array(8); crypto.getRandomValues(a);
      return Array.from(a).map(x => x.toString(16).padStart(2, '0')).join('');
    } catch { return 'id-' + Math.random().toString(16).slice(2); }
  }
  function safeWriteAll(keys, arr) {
    function tryWrite(a) {
      const json = JSON.stringify(a);
      keys.forEach(k => localStorage.setItem(k, json));
    }
    try { tryWrite(arr); return; }
    catch (e1) {
      // remove payloads pesados (ex.: base64 de foto)
      const a2 = arr.map(r => ({ ...r, photoData: '' }));
      try { tryWrite(a2); return; }
      catch (e2) {
        // última defesa: encurtar a lista até caber
        let a3 = a2.slice();
        while (a3.length > 1) {
          try { tryWrite(a3); break; }
          catch (_) { a3.pop(); }
        }
      }
    }
  }
  function recordHistoryMotorCompat(entry) {
    const readKeys = ['hist_motor', 'history_motor', 'historyMotor', 'histMotor'];
    const writeKeys = ['hist_motor', 'history_motor', 'historyMotor', 'histMotor'];

    let list = [];
    for (const k of readKeys) {
      try {
        const v = localStorage.getItem(k);
        if (v) { const a = JSON.parse(v) || []; if (Array.isArray(a) && a.length) { list = a; break; } }
      } catch { }
    }
    const newList = [entry, ...list].slice(0, 500);
    try { safeWriteAll(writeKeys, newList); } catch { }
    return entry;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const out = $id('motorOut'); if (!out) return;
    const s = getSel();

    if (!s.brand) { out.innerHTML = badge(false, ["Selecione a marca / Select the brand"]); return; }

    // 1) validação por catálogo (se engine_validation estiver carregado)
    let ok = true, errs = [];
    try {
      if (w.IDMAR_VALIDATION && typeof w.IDMAR_VALIDATION.validateSelection === 'function') {
        const res = await w.IDMAR_VALIDATION.validateSelection(
          { brand: s.brand, family: s.family, model: s.model, hp: s.hp, rigging: s.rigging, shaft: s.shaft, rotation: s.rotation, year: s.year, displacement: s.displacement },
          { catalogUrl: 'data/engines_catalog.v2.json' }
        );
        ok = !!res.ok; errs = res.errors || [];
      }
    } catch (e) { ok = false; errs.push("Erro de validação / Validation error"); }

    // 2) validação EXTRA (texto livre vs envelope da marca/família)
    try {
      const cat = await loadCatalog();
      const env = gatherEnv(cat, s.brand, s.family);
      if (s.model) {
        const found = env.models.includes(String(s.model).toLowerCase());
        if (!found) { ok = false; errs.push("Modelo (texto) não corresponde a códigos conhecidos da marca/família / Free-text model not found for brand/family"); }
      }
      if (s.hp) {
        const hpNum = String(s.hp).trim();
        if (env.hp.length && !env.hp.includes(hpNum)) {
          ok = false; errs.push("Potência (texto) fora das opções para a marca/família / Free-text power not in catalog for brand/family");
        }
      }
      if (s.year) {
        const yr = String(s.year).trim();
        if (env.years.length && !env.years.includes(yr)) {
          ok = false; errs.push("Ano (texto) fora do intervalo da família / Free-text year outside family range");
        }
      }
      if (s.displacement) {
        if (env.displacement.length && !env.displacement.includes(String(s.displacement))) {
          ok = false; errs.push("Cilindrada (texto) não coincide com registos / Free-text displacement not in records");
        }
      }
    } catch (e) { /* catálogo indisponível → segue só com o que houver */ }

    // Saída & Histórico
    const summary = buildSummaryPTEN(s);
    out.innerHTML = badge(ok, errs) + ' ' + summary;

    const photo = $id('motorPhoto'); let photoName = '', photoData = '';
    if (photo && photo.files && photo.files[0]) {
      photoName = photo.files[0].name;
      try {
        const fr = new FileReader();
        photoData = await new Promise((res, rej) => { fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(photo.files[0]); });
      } catch (e) { }
    }

    const rec = {
      id: cryptoRandomId(),
      date: nowISO(),
      brand: s.brand,
      model: s.model || (s.family ? `${s.family}` : null),
      sn: summary,                               // compatível com a coluna "S/N" do histórico
      valid: !!ok,
      reason: ok ? "Combinação compatível / Combination valid" : (errs || []).join(' ; '),
      photoName, photoData,
      // campos adicionais úteis para filtros futuros
      estado: ok ? 'ok' : 'erro',
      estadoLabel: ok ? 'Válido' : 'Inválido'
    };

    // grava em TODAS as chaves que alguma página possa ler
    recordHistoryMotorCompat(rec);
  }

  function wire() {
    const form = $id('formMotor');
    if (form && !form.dataset.bound) { form.addEventListener('submit', onSubmit); form.dataset.bound = '1'; }
  }
  if (document.readyState === 'loading') d.addEventListener('DOMContentLoaded', wire); else wire();
})(window, document);
