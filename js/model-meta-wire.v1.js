// js/model-meta-wire.v1.js — preenche ficha e controla foco do SN só em commit humano
(function(w,d){
  const DATA_URL = (d.currentScript && d.currentScript.getAttribute('data-json')) || 'data/engines_catalog.v2.json';
  const $ = id => d.getElementById(id);

  let catalog = null;
  const out = {
    hp: $('out-hp'), cc: $('out-cc'), years: $('out-years'),
    rig: $('out-rig'), shaft: $('out-shaft'), rot: $('out-rot'),
    box: $('out-case'), snObs: $('out-sn-obs'), snRanges: $('out-sn-ranges')
  };

  function clearFacts(){
    out.hp.textContent = '—';
    out.cc.textContent = '—';
    out.years.textContent = '—';
    out.rig.textContent = '—';
    out.shaft.textContent = '—';
    out.rot.textContent = '—';
    out.box.textContent = '—';
    out.snObs.textContent = '—';
    out.snRanges.textContent = '—';
  }

  function findVersion(code){
    if(!catalog) return null;
    const fams = catalog?.brands?.Yamaha?.families || {}; // começamos por Yamaha; depois generaliza
    const U = String(code||'').toUpperCase();
    for (const famName of Object.keys(fams)) {
      const fam = fams[famName];
      for (const v of (fam.versions || [])) {
        if (String(v.version||'').toUpperCase().replace(/\s+/g,'') === U) {
          return { famName, fam, v };
        }
      }
    }
    return null;
  }

  function fillFacts(hit){
    if(!hit){ clearFacts(); return; }
    const v = hit.v;
    out.hp.textContent = (v.power ?? '—');
    out.cc.textContent = v.displacement_cc ? `${v.displacement_cc} cc` : '—';
    out.years.textContent = v.years || '—';
    out.rig.textContent = v.rigging || hit.fam.rigging?.join?.(', ') || '—';
    out.shaft.textContent = v.shaft || (hit.fam.shaft?.join?.(', ') || '—');
    out.rot.textContent = v.rotation || (hit.fam.rotation?.join?.(', ') || '—');
    out.box.textContent = v.gearcase || (hit.fam.gearcase?.join?.(', ') || '—');

    // SN info
    const sn = v.serial || {};
    out.snObs.textContent = sn.notes || '—';
    out.snRanges.textContent = (sn.ranges && sn.ranges.length)
      ? sn.ranges.map(r => `${r.from}–${r.to}`).join(' · ')
      : '—';
  }

  function applyToCollect(modelCode, hit){
    // Minimiza acoplamento: só preenche campos conhecidos
    w.EnginePickerState = w.EnginePickerState || {};
    w.EnginePickerState.model = modelCode;
    w.EnginePickerState.brand = w.EnginePickerState.brand || 'Yamaha';

    // Family picker (se usares)
    if(hit){
      w.EnginePickerState.family = {
        family: hit.famName,
        version: hit.v.version,
        power: hit.v.power,
        ranges: (hit.v.serial && hit.v.serial.ranges) || []
      };
    }
  }

  function onCommit(ev){
    const { model, commit } = ev.detail || {};
    if(!model) return;
    const hit = findVersion(model);
    fillFacts(hit);
    applyToCollect(model, hit);

    // Só em commit humano é que focamos o campo de série
    if(commit){
      const sn = $('engine-sn-raw');
      if (sn) sn.focus();
    }
    console.log('[model-meta-wire v1] commit:', model, '>>', hit ? hit.famName : '(desconhecido)');
  }

  fetch(DATA_URL).then(r=>r.json()).then(j=>{
    catalog = j;
    clearFacts();
    console.log('[model-meta-wire v1] pronto: catálogo v2 carregado.');
    w.addEventListener('idmar:model-commit', onCommit);
  }).catch(e=>{
    console.warn('[model-meta-wire v1] falha a carregar catálogo', e);
  });
})(window, document);
