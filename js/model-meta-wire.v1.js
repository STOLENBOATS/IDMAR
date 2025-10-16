// js/model-meta-wire.v1.js — foco APENAS em commits explícitos
(function(w,d){
  function $(id){ return d.getElementById(id); }
  var scriptEl = d.currentScript;
  var jsonUrl  = (scriptEl && scriptEl.getAttribute('data-json')) || './data/yamaha_models.v1.json';

  var ID = {
    selectModel: 'engineModel',
    outHP: 'out-hp', outCC: 'out-cc', outYears: 'out-years',
    outRig: 'out-rig', outShaft: 'out-shaft', outRot: 'out-rot', outCase: 'out-case',
    outSNObs: 'out-sn-obs', outSNRanges: 'out-sn-ranges',
    snInput: 'engine-sn-raw'
  };

  var DB = null;

  function render(info){
    if(!info) return;
    $(ID.outHP)      && ($(ID.outHP).textContent      = info.hp || '—');
    $(ID.outCC)      && ($(ID.outCC).textContent      = info.cc ? (info.cc+' cc') : '—');
    $(ID.outYears)   && ($(ID.outYears).textContent   = info.years || '—');
    $(ID.outRig)     && ($(ID.outRig).textContent     = info.rigging || '—');
    $(ID.outShaft)   && ($(ID.outShaft).textContent   = info.shaft || '—');
    $(ID.outRot)     && ($(ID.outRot).textContent     = info.rotation || '—');
    $(ID.outCase)    && ($(ID.outCase).textContent    = info.gearcase || '—');
    $(ID.outSNObs)   && ($(ID.outSNObs).textContent   = info.sn_observations || '—');
    $(ID.outSNRanges)&& ($(ID.outSNRanges).textContent= info.sn_ranges || '—');

    w.EngineCollect = w.EngineCollect || {};
    w.EngineCollect.modelMeta = { brand:'Yamaha', model: info.model || '', ...info };
  }

  function findModel(raw){
    if(!raw) return null;
    var m = String(raw).trim();
    var key = m.toUpperCase().replace(/\s+/g,'');
    return DB[m] || DB[key] || DB[key.replace(/[\-]/g,'')] ||
           (function(){ var hit = Object.keys(DB).find(k => k.toUpperCase().replace(/\s+/g,'') === key); return hit ? DB[hit] : null; })() ||
           (function(){ var hit = Object.keys(DB).find(k => k.toUpperCase().startsWith(key)); return hit ? DB[hit] : null; })();
  }

  // commit: se true -> foca o SN; se false -> só preenche ficha
  function applyModel(maybeCode, commit){
    var info = findModel(maybeCode);
    if(!info) return;
    info = { ...info, model: maybeCode };
    render(info);
    if(commit){ var sn = $(ID.snInput); if (sn) sn.focus(); }
  }

  function arm(){
    // 1) Mudanças no input do picker NÃO fazem commit (apenas preenchem). Evita salto ao 1º carácter.
    var el = $(ID.selectModel) || d.querySelector('#engine-picker input#engineModel');
    if(el && !el.__armed_v4){
      el.__armed_v4 = true;
      el.addEventListener('change', function(e){
        applyModel(e.target.value, false); // <<< sem foco
      });
    }

    // 2) Family picker (versão) emite commit explícito
    var ver = d.getElementById('engineVersion');
    if(ver && !ver.__armed_v4){
      ver.__armed_v4 = true;
      ver.addEventListener('change', function(e){
        if(!e.isTrusted) return;
        var val = ver.value || '';
        if(val) w.dispatchEvent(new CustomEvent('idmar:model-commit', { detail:{ model: val, source:'family-version' } }));
      });
    }

    // 3) Base/Variante commit explícito é tratado pelo outro bridge → só escutamos o evento
    if(!w.__IDMAR_MODEL_COMMIT_LISTENER_V4__){
      w.__IDMAR_MODEL_COMMIT_LISTENER_V4__ = true;
      w.addEventListener('idmar:model-commit', function(ev){
        var code = ev.detail && ev.detail.model;
        if(code) applyModel(code, true); // aqui sim, com foco
      });
    }
  }

  fetch(jsonUrl).then(r=>r.json()).then(function(db){
    var norm = {};
    Object.keys(db).forEach(function(k){
      var v = db[k];
      norm[k] = v;
      norm[k.toUpperCase()] = v;
      norm[k.replace(/[\s\-]/g,'').toUpperCase()] = v;
    });
    DB = norm;
    arm();
    var mo = new MutationObserver(arm);
    mo.observe(d.documentElement, { childList:true, subtree:true });
    console.log('[IDMAR] model-meta-wire v1 (commit-explicito) OK:', jsonUrl);
  }).catch(e=>console.warn('[IDMAR] model-meta-wire: falha JSON', e));
})(window, document);
