<!-- se preferires substituir o ficheiro, usa este conteúdo: -->
<script>
// js/model-meta-wire.v1.js — foco só em commit
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

    // export para EngineCollect (se existir)
    w.EngineCollect = w.EngineCollect || {};
    w.EngineCollect.modelMeta = { brand:'Yamaha', model: info.model || '', ...info };
  }

  // lookup tolerante
  function findModel(raw){
    if(!raw) return null;
    var m = String(raw).trim();
    var key = m.toUpperCase().replace(/\s+/g,'');
    return DB[m] || DB[key] || DB[key.replace(/[\-]/g,'')] ||
           (function(){ // begins-with
              var hit = Object.keys(DB).find(k => k.toUpperCase().startsWith(key));
              return hit ? DB[hit] : null;
            })();
  }

  // aplica info; se commit=true, foca o SN
  function applyModel(maybeCode, commit){
    var info = findModel(maybeCode);
    if(!info) return;
    info = { ...info, model: maybeCode };
    render(info);
    if(commit){
      var sn = $(ID.snInput);
      if (sn) sn.focus();
    }
  }

  function arm(DBready){
    // 1) Commit implícito por change no #engineModel (picker)
    var el = $(ID.selectModel) || d.querySelector('#engine-picker input#engineModel');
    if(el && !el.__armed_v2){
      el.__armed_v2 = true;
      el.addEventListener('change', function(e){ applyModel(e.target.value, true); });
      // NÃO reagimos a 'input' aqui (evita saltos de foco durante digitação)
    }

    // 2) Commit via selects (family picker, base/variante)
    var ver = d.getElementById('engineVersion');
    if(ver && !ver.__armed_v2){
      ver.__armed_v2 = true;
      ver.addEventListener('change', function(e){ applyModel(e.target.value, true); });
    }
    var base = d.getElementById('modelBaseList');
    var vari = d.getElementById('modelVariantList');
    function tryBaseVariantCommit(){
      var b = (base?.value||'').trim(), v=(vari?.value||'').trim();
      var code = b ? (v ? (b+v) : b) : '';
      if(code) applyModel(code, true);
    }
    if(base && !base.__armed_v2){
      base.__armed_v2 = true; base.addEventListener('change', tryBaseVariantCommit);
    }
    if(vari && !vari.__armed_v2){
      vari.__armed_v2 = true; vari.addEventListener('change', tryBaseVariantCommit);
    }

    // 3) Commit explícito vindo do “bridge” (Enter no #srch_model, etc.)
    if(!w.__IDMAR_MODEL_COMMIT_LISTENER__){
      w.__IDMAR_MODEL_COMMIT_LISTENER__ = true;
      w.addEventListener('idmar:model-commit', function(ev){
        var code = ev.detail && ev.detail.model;
        if(code) applyModel(code, true);
      });
    }
  }

  fetch(jsonUrl).then(r=>r.json()).then(function(db){
    // index normalizado
    var norm = {};
    Object.keys(db).forEach(function(k){
      var v = db[k];
      norm[k] = v;
      norm[k.toUpperCase()] = v;
      norm[k.replace(/[\s\-]/g,'').toUpperCase()] = v;
    });
    DB = norm;
    arm(true);
    // observa para quando o picker injeta elementos
    var mo = new MutationObserver(()=>arm(false));
    mo.observe(d.documentElement, { childList:true, subtree:true });
    console.log('[IDMAR] model-meta-wire v1 (commit-only focus) OK:', jsonUrl);
  }).catch(function(e){
    console.warn('[IDMAR] model-meta-wire: falha a carregar JSON', e);
  });
})(window, document);
</script>
