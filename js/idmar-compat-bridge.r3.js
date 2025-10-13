/*! IDMAR compat bridge r3
 *  - Define NAV.STORAGE constants esperados (SESSION, WIN_HISTORY, MOTOR_HISTORY)
 *  - Polyfills: loadFromLS, saveToLS, readFileAsDataURL
 *  - DOM aliases: suporta IDs antigos (formWin/formMotor, win, winOut, interpWinBody, brand, brandDynamic, motorOut, motorPhoto, etc.)
 *  - Deve ser carregado ANTES de validador-win.js e validador-motor.js
 */
(function(w,d){
  // 0) Garantir objetos base
  w.IDMAR = w.IDMAR || {};
  w.NAV   = w.NAV   || w.IDMAR;
  NAV.STORAGE = NAV.STORAGE || {
    SESSION: 'IDMAR_SESSION',
    WIN_HISTORY: 'hist_win',
    MOTOR_HISTORY: 'hist_motor'
  };

  // 1) Polyfills mínimos usados nos validadores legados
  w.loadFromLS = w.loadFromLS || function(key){
    try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch(e){ return []; }
  };
  w.saveToLS = w.saveToLS || function(key, arr){
    try{ localStorage.setItem(key, JSON.stringify(arr||[])); }catch(e){}
  };
  w.readFileAsDataURL = w.readFileAsDataURL || function(file){
    return new Promise(function(resolve,reject){
      try{
        if(!file) return resolve('');
        var r = new FileReader();
        r.onload = function(){ resolve(String(r.result||'')); };
        r.onerror = reject;
        r.readAsDataURL(file);
      }catch(e){ resolve(''); }
    });
  };

  // 2) DOM aliases (idempotente): tenta mapear os teus ids atuais para os ids legacy esperados
  function alias(idNew, selExisting){
    if(d.getElementById(idNew)) return; // já existe
    var el = d.querySelector(selExisting);
    if(el){ el.id = idNew; }
  }
  function ensureWinAliases(){
    alias('formWin', 'form#winForm, form[data-form="win"], form[action*="win"]');
    alias('win',      '#winInput, input[name="win"], input[name="hin"]');
    // criar caixote de saída interpretativo se não existir
    if(!d.getElementById('winOut')){
      var host = d.getElementById('winResult') || d.querySelector('#win-output .resultado');
      if(host){
        var box = d.createElement('div'); box.id='winOut'; host.prepend(box);
      }
    }
    if(!d.getElementById('interpWinBody')){
      var host = d.getElementById('winResult') || d.querySelector('#win-output .resultado');
      if(host){
        var tbl = d.createElement('table');
        tbl.innerHTML='<tbody id="interpWinBody"></tbody>';
        host.appendChild(tbl);
      }
    }
    alias('winPhoto',  '#winPhoto, input[type="file"][name="winPhoto"]');
  }
  function ensureMotorAliases(){
    alias('formMotor',  'form#motorForm, form[data-form="motor"], form[action*="motor"]');
    alias('brand',      '#brandSelect, select[name="brand"], select[name="marca"]');
    alias('brandDynamic','#brandDynamic, #motorDynamic, #dyn, form[data-form="motor"] .dynamic');
    // local de saída
    if(!d.getElementById('motorOut')){
      var host = d.getElementById('motorResult') || d.querySelector('#motor-output .resultado');
      if(host){ var box = d.createElement('div'); box.id='motorOut'; host.prepend(box); }
    }
    alias('motorPhoto', '#motorPhoto, input[type="file"][name="motorPhoto"]');
    // Campos de pesquisa opcionais: cria se não existirem (inputs *não bloqueiam*)
    function ensureInput(id){ if(!d.getElementById(id)){ var i=d.createElement('input'); i.id=id; i.type='text'; i.style.display='none'; (d.body||d.documentElement).appendChild(i); } }
    ['srch_model','srch_power','srch_disp','srch_year','srch_origin'].forEach(ensureInput);
  }

  function run(){ ensureWinAliases(); ensureMotorAliases(); }
  if(d.readyState!=='loading') run(); else d.addEventListener('DOMContentLoaded', run);

  // 3) Extra: se o login da app usou outra key, aceitar NAV_SESSION também
  try{
    var s = sessionStorage.getItem('IDMAR_SESSION') || sessionStorage.getItem('NAV_SESSION');
    if(s && s!=='ok'){ sessionStorage.setItem(NAV.STORAGE.SESSION, 'ok'); }
    if(s === 'ok' && !sessionStorage.getItem(NAV.STORAGE.SESSION)){
      sessionStorage.setItem(NAV.STORAGE.SESSION, 'ok');
    }
  }catch(e){}
})(window, document);
