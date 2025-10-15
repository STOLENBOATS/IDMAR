// js/model-meta-wire.v1.js
(function(w,d){
  function $(id){ return d.getElementById(id); }

  // pick JSON url from data-json attr or default
  var scriptEl = d.currentScript;
  var jsonUrl = (scriptEl && scriptEl.getAttribute('data-json')) || './data/yamaha_models.v1.json';

  var ID = {
    selectModel: 'engineModel',
    outHP: 'out-hp',
    outCC: 'out-cc',
    outYears: 'out-years',
    outRig: 'out-rig',
    outShaft: 'out-shaft',
    outRot: 'out-rot',
    outCase: 'out-case',
    outSNObs: 'out-sn-obs',
    outSNRanges: 'out-sn-ranges',
    snInput: 'engine-sn-raw',
    snNotes: 'engine-sn-notes'
  };

  var DB = null;

  function render(info){
    if(!info) return;
    $(ID.outHP)     && ($(ID.outHP).textContent     = info.hp || '—');
    $(ID.outCC)     && ($(ID.outCC).textContent     = info.cc ? (info.cc + ' cc') : '—');
    $(ID.outYears)  && ($(ID.outYears).textContent  = info.years || '—');
    $(ID.outRig)    && ($(ID.outRig).textContent    = info.rigging || '—');
    $(ID.outShaft)  && ($(ID.outShaft).textContent  = info.shaft || '—');
    $(ID.outRot)    && ($(ID.outRot).textContent    = info.rotation || '—');
    $(ID.outCase)   && ($(ID.outCase).textContent   = info.gearcase || '—');
    $(ID.outSNObs)  && ($(ID.outSNObs).textContent  = info.sn_observations || '—');
    $(ID.outSNRanges)&&($(ID.outSNRanges).textContent = info.sn_ranges || '—');

    // export to EngineCollect context if present
    w.EngineCollect = w.EngineCollect || {};
    var model = info.model || '';
    w.EngineCollect.modelMeta = { brand:'Yamaha', model: model, ...info };
  }

  function onModelChange(){
    if(!DB) return;
    var el = $(ID.selectModel) || d.querySelector('#engine-picker input#engineModel');
    if(!el) return;
    var m = (el.value || '').trim();
    // Some users may type lowercase, normalize
    var key = m.toUpperCase().replace(/\s+/g,'');
    // DB keys are exact; try exact first then case-insensitive find
    var info = DB[m] || DB[key] || null;
    if(!info){
      // try a forgiving lookup: remove dashes/spaces
      var alt = m.replace(/[\s\-]/g,'');
      info = DB[alt] || null;
      if(!info){
        // fall back to startsWith match
        var hit = Object.keys(DB).find(k => k.toUpperCase().startsWith(key));
        if(hit) info = DB[hit];
      }
    }
    if(info){
      info.model = m;
      render(info);
      $(ID.snInput) && $(ID.snInput).focus();
    }
  }

  function arm(){
    var el = $(ID.selectModel) || d.querySelector('#engine-picker input#engineModel');
    if(!el || el.__armed_meta) return;
    el.__armed_meta = true;
    el.addEventListener('change', onModelChange);
    el.addEventListener('input', onModelChange);
  }

  // load JSON then arm
  fetch(jsonUrl).then(r=>r.json()).then(function(db){
    DB = db;
    // build an index that accepts normalized keys too
    var norm = {};
    Object.keys(DB).forEach(function(k){
      norm[k] = DB[k];
      norm[k.toUpperCase()] = DB[k];
      norm[k.replace(/[\s\-]/g,'').toUpperCase()] = DB[k];
    });
    DB = norm;
    arm();
    // Observe DOM in case the picker injects later
    var mo = new MutationObserver(arm);
    mo.observe(d.documentElement, { childList:true, subtree:true });
    console.log('[IDMAR] model-meta-wire pronto:', jsonUrl);
  }).catch(function(e){
    console.warn('[IDMAR] model-meta-wire: falha a carregar JSON', e);
  });
})(window, document);
