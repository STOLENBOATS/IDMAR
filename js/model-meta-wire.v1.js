// js/model-meta-wire.v1.js — preenche ficha do modelo e só foca SN em commits explícitos
(function(w,d){
  function $(id){ return d.getElementById(id); }
  var scriptEl = d.currentScript;
  var jsonUrl  = (scriptEl && scriptEl.getAttribute('data-json')) || './data/yamaha_models.v1.json';

  var ID = {
    outHP: 'out-hp', outCC: 'out-cc', outYears: 'out-years',
    outRig: 'out-rig', outShaft: 'out-shaft', outRot: 'out-rot', outCase: 'out-case',
    outSNObs: 'out-sn-obs', outSNRanges: 'out-sn-ranges',
    snInput: 'engine-sn-raw',
    baseSel: 'modelBaseList', varSel: 'modelVariantList'
  };

  var DB = null;

  function normKey(k){
    return String(k||'').toUpperCase().replace(/\s+/g,'').replace(/-/g,'');
  }

  function bestEntry(code){
    if(!DB) return null;
    var key = normKey(code);
    if(DB[key]) return DB[key];
    var cand = Object.keys(DB).find(function(k){ return k.startsWith(key); });
    return cand ? DB[cand] : null;
  }

  function put(id, text){ var el=$(id); if(el) el.textContent = (text && String(text).trim()) ? String(text) : '—'; }

  function applyFacts(modelCode){
    var e = bestEntry(modelCode);
    if(!e){
      put(ID.outHP,''); put(ID.outCC,''); put(ID.outYears,''); put(ID.outRig,''); put(ID.outShaft,'');
      put(ID.outRot,''); put(ID.outCase,''); put(ID.outSNObs,''); put(ID.outSNRanges,'');
      return;
    }
    put(ID.outHP, e.hp||'');
    put(ID.outCC, e.cc ? (e.cc+' cc') : '');
    put(ID.outYears, e.years||'');
    put(ID.outRig, e.rigging||'');
    put(ID.outShaft, e.shaft||'');
    put(ID.outRot, e.rotation||'');
    put(ID.outCase, e.gearcase||'');
    put(ID.outSNObs, e.sn_observations||'');
    put(ID.outSNRanges, e.sn_ranges||'');
  }

  function onCommit(ev){
    var det = ev && ev.detail || {};
    var model = det.model || '';
    if(!model) return;
    applyFacts(model);
    if(det.commit){
      var sn = $(ID.snInput);
      if(sn){ try{ sn.focus(); sn.select && sn.select(); }catch(_){ } }
    }
  }

  function arm(){
    if(!w.__IDMAR_MODEL_WIRED__){
      w.addEventListener('idmar:model-commit', onCommit);
      w.__IDMAR_MODEL_WIRED__ = true;
    }
    var base=$(ID.baseSel), vari=$(ID.varSel);
    function fromBV(){
      var b=(base&&base.value||'').trim(), v=(vari&&vari.value||'').trim();
      if(!b) return;
      applyFacts(b + v);
    }
    if(base && !base.__wiredFacts){ base.__wiredFacts=true; base.addEventListener('change', fromBV); }
    if(vari && !vari.__wiredFacts){ vari.__wiredFacts=true; vari.addEventListener('change', fromBV); }
  }

  fetch(jsonUrl).then(function(r){return r.json();}).then(function(db){
    var norm = {};
    Object.keys(db).forEach(function(k){
      var v = db[k];
      norm[k] = v;
      norm[normKey(k)] = v;
    });
    DB = norm;
    arm();
    var mo = new MutationObserver(arm);
    mo.observe(d.documentElement, { childList:true, subtree:true });
    console.log('[IDMAR] model-meta-wire v1 pronto:', jsonUrl);
  }).catch(function(e){
    console.warn('[IDMAR] model-meta-wire: falha a carregar JSON', e);
  });
})(window, document);
