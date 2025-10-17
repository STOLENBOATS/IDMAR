// js/model-meta-wire.v1.js — escuta commits, lê v2 e preenche ficha; foco do SN só em commit humano
(function (w, d) {
  const DATA_ATTR = 'data-json';
  const SRC = (d.currentScript && d.currentScript.getAttribute(DATA_ATTR)) || 'data/engines_catalog.v2.json';
  let catalog = null;

  const $ = (id) => d.getElementById(id);

  function byVersion(node, code){
    // percorre todas as famílias e procura version == code
    for (const famName of Object.keys(node?.families || {})) {
      const fam = node.families[famName];
      for (const v of (fam.versions || [])) {
        const vcode = v.version || v.code || '';
        if (String(vcode).toUpperCase() === String(code).toUpperCase()) {
          return { famName, fam, ver: v };
        }
      }
      // fallback: version_options
      for (const vcode of (fam.version_options || [])) {
        if (String(vcode).toUpperCase() === String(code).toUpperCase()) {
          return { famName, fam, ver: { version: vcode } };
        }
      }
    }
    return null;
  }

  function out(spanId, val, suffix=''){
    const el = $(spanId);
    if (el) el.textContent = (val==null || val==='') ? '—' : (suffix ? `${val}${suffix}` : `${val}`);
  }

  function fillFacts(hit){
    const v = hit.ver || {};
    const fam = hit.fam || {};
    out('out-hp',    v.power);
    out('out-cc',    v.displacement_cc);
    out('out-years', v.years || (fam.years || ''));
    out('out-rig',   v.rigging || fam.rigging || '');
    out('out-shaft', v.shaft   || fam.shaft   || '');
    out('out-rot',   v.rotation|| fam.rotation|| '');
    out('out-case',  v.gearcase|| fam.gearcase|| '');
    const snNotes = v.serial?.notes || fam.serial?.notes || '';
    const ranges  = v.serial?.ranges || fam.serial?.ranges || [];
    out('out-sn-obs', snNotes || '');
    out('out-sn-ranges', ranges.length ? ranges.map(r=>`${r.from}–${r.to}`).join(', ') : '');
  }

  function setFamilyOnState(brand, hit){
    w.EnginePickerState = w.EnginePickerState || {};
    w.EnginePickerState.family = {
      brand,
      family: hit.famName,
      version: hit.ver?.version || '',
      power: hit.ver?.power,
      ranges: (hit.ver?.serial?.ranges || hit.fam?.serial?.ranges || [])
    };
  }

  function focusSerial(){
    const sn = $('engine-sn-raw');
    if (sn) sn.focus();
  }

  async function ensureCatalog(){
    if (catalog) return catalog;
    const j = await fetch(SRC).then(r=>r.json());
    catalog = j;
    return catalog;
  }

  function onCommit(e){
    const code = (e?.detail?.model || '').trim();
    if (!code) return;
    ensureCatalog().then(j=>{
      const brand = (w.EnginePickerState?.brand || 'Yamaha'); // default
      const bnode = j?.brands?.[brand];
      if (!bnode) return;
      const hit = byVersion(bnode, code);
      if (!hit) return;

      // preencher ficha
      fillFacts(hit);
      // atualizar estado/ranges
      setFamilyOnState(brand, hit);
      // só em commit → foco SN
      if (e?.detail?.commit) focusSerial();
    });
  }

  w.addEventListener('idmar:model-commit', onCommit);
  // opcional: seed se já tiver valor
  // (não foca o SN aqui para evitar “saltos”)
})(window, document);
