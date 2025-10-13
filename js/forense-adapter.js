// forense-adapter.js
// Optional glue to call forensic analysis if the fallback modules are present.
// We expect (if provided) window.Forense with methods: explainWin(win) and explainMotor(payload).
// This adapter must not throw if those modules are missing.
(function(){
  function safeCall(fn, ...args){
    try{
      if(typeof fn === 'function'){ return fn(...args); }
    }catch(e){ console.warn('Forense call failed:', e); }
    return null;
  }

  function setHtmlById(id, html){
    const el = document.getElementById(id);
    if(!el) return;
    el.innerHTML = html || '<p class="muted">Sem dados forenses adicionais.</p>';
  }

  // Public helpers used by validador scripts
  window.showWinForense = function(winRaw){
    // Try different shapes of the fallback API
    const F = window.Forense || window.FORENSE || null;
    let html = null;
    if(F && typeof F.explainWin === 'function'){
      html = safeCall(F.explainWin, winRaw);
    } else if(typeof window.explainWin === 'function'){
      html = safeCall(window.explainWin, winRaw);
    }
    setHtmlById('winForense', html);
  };

  window.showMotorForense = function(payload){
    const F = window.Forense || window.FORENSE || null;
    let html = null;
    if(F && typeof F.explainMotor === 'function'){
      html = safeCall(F.explainMotor, payload);
    } else if(typeof window.explainMotor === 'function'){
      html = safeCall(window.explainMotor, payload);
    }
    setHtmlById('motorForense', html);
  };
})();