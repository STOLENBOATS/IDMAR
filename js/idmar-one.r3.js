/*! IDMAR One r3 — bootstrap único para todas as páginas
 *  Inclui: NAV shim, tema (light por defeito), i18n, histórico (core+hook),
 *          UI interpretativa (renderWinResult/renderMotorResult).
 *  Seguro para carregar em TODAS as páginas (idempotente).
 */
(function(w,d){
  if (w.__IDMAR_ONE_R3__) return; w.__IDMAR_ONE_R3__ = true;

  /* --- 0) NAV shim síncrono (para validadores legados) --- */
  w.IDMAR = w.IDMAR || {};
  w.NAV   = w.NAV   || w.IDMAR;
  NAV.util = NAV.util || {
    qs: (sel, root=d)=> root.querySelector(sel),
    qsa: (sel, root=d)=> Array.from(root.querySelectorAll(sel)),
    on: (el, ev, fn)=> el && el.addEventListener(ev, fn),
  };
  if (w.IDMAR_HIST && !NAV.history) NAV.history = w.IDMAR_HIST;
  NAV.toast = NAV.toast || function(){};
  NAV.log   = NAV.log   || function(){};

  /* --- 1) Tema (LIGHT por defeito) + toggle --- */
  (function(){
    try{
      var pref = localStorage.getItem('idmar-theme');
      if(!pref){ pref = 'light'; localStorage.setItem('idmar-theme', pref); }
      d.documentElement.setAttribute('data-theme', pref);
      w.IDMAR_setTheme = function(next){
        if(!next){ next = (localStorage.getItem('idmar-theme')==='dark')?'light':'dark'; }
        localStorage.setItem('idmar-theme', next);
        d.documentElement.setAttribute('data-theme', next);
      };
      var btn = d.getElementById('idmar-theme-toggle');
      if(btn){ btn.addEventListener('click', function(){ w.IDMAR_setTheme(); }); }
    }catch(e){}
  })();

  /* --- 2) i18n mínimo PT/EN via data-i18n --- */
  (function(){
    var DICT = {
      pt: { field:'Campo', value:'Valor', meaning:'Interpretação', rules:'Regras aplicadas' },
      en: { field:'Field', value:'Value', meaning:'Meaning', rules:'Applied rules' }
    };
    function apply(lang, root){
      (root||d).querySelectorAll('[data-i18n]').forEach(function(el){
        var k = el.getAttribute('data-i18n'), s = (DICT[lang]||{})[k];
        if (s) { if (el.firstChild) el.firstChild.nodeValue = s; else el.textContent = s; }
      });
    }
    var lang = localStorage.getItem('idmar-lang') || 'pt';
    apply(lang);
    w.IDMAR_lang = {
      set: function(l){ localStorage.setItem('idmar-lang', l); apply(l); }
    };
  })();

  /* --- 3) Histórico core (localStorage) --- */
  (function(g){
    if (g.IDMAR_HIST) return; // já definido?
    var KEYS = { win:'hist_win', motor:'hist_motor' };
    function now(){ return Date.now(); }
    function iso(ts){ try{ return new Date(ts).toISOString(); }catch(e){ return ''; } }
    function save(type, rec){
      var key = KEYS[type]; if(!key) return;
      try{
        var list = JSON.parse(localStorage.getItem(key) || '[]');
        var ts = rec.ts || now();
        var entry = Object.assign({ ts:ts, when:iso(ts) }, rec);
        list.push(entry);
        localStorage.setItem(key, JSON.stringify(list.slice(-1000)));
        return entry;
      }catch(e){ console.error('IDMAR history save error', e); }
    }
    function all(type){
      var key = KEYS[type]; if(!key) return [];
      try{ return JSON.parse(localStorage.getItem(key) || '[]'); }
      catch(e){ return []; }
    }
    function clear(type){ var key = KEYS[type]; if(!key) return; localStorage.removeItem(key); }
    function filter(list, opts){
      opts = opts||{};
      return list.filter(function(r){
        if(opts.query){
          var q = opts.query.toLowerCase();
          var hay = [r.win||'',r.nuipc||'',r.sn||'',r.brand||'',r.model||'',r.notes||''].join(' ').toLowerCase();
          if(hay.indexOf(q)===-1) return false;
        }
        if(Array.isArray(opts.status) && opts.status.length){
          if(opts.status.indexOf((r.status||'').toLowerCase())===-1) return false;
        }
        if(opts.brand && r.brand && r.brand!==opts.brand) return false;
        if(opts.from || opts.to){
          var ts = r.ts||0;
          if(opts.from && ts < opts.from) return false;
          if(opts.to && ts > opts.to) return false;
        }
        return true;
      });
    }
    function toCSV(type, list){
      var cols = ['when','type','win','sn','brand','model','status','photo','notes'];
      var hdr = cols.join(',');
      var rows = list.map(function(r){ return cols.map(function(k){ return JSON.stringify(r[k]||''); }).join(','); });
      var blob = [hdr].concat(rows).join('\n');
      var a = d.createElement('a');
      a.href = URL.createObjectURL(new Blob([blob], {type:'text/csv;charset=utf-8;'}));
      a.download = 'idmar_'+type+'_historico.csv';
      a.click();
      URL.revokeObjectURL(a.href);
    }
    g.IDMAR_HIST = { save:save, all:all, clear:clear, filter:filter, toCSV:toCSV };
    // ponte para NAV.history se ainda não tiver
    if (!NAV.history) NAV.history = g.IDMAR_HIST;
  })(w);

  /* --- 4) Hook (só ativa se a página tiver os elementos) --- */
  function domReady(fn){ if(d.readyState!=='loading') fn(); else d.addEventListener('DOMContentLoaded', fn); }
  domReady(function(){
    // WIN
    var winForm = d.querySelector('form#winForm, form[data-form="win"], form[action*="win"]');
    var winInput= d.querySelector('#winInput, input[name="win"], input[name="hin"]');
    var winBtn  = d.querySelector('#btnWin, button[name="validate_win"], button#validateWin');
    function grabWinStatus(){
      var el = d.querySelector('#win-output .status, #win-output .resultado, #winResult .status, #winResult, .win-result .status');
      var txt = el && el.textContent || ''; var s='';
      if(/inv[aá]lid/i.test(txt)) s='inválido'; else if(/v[aá]lid/i.test(txt)) s='válido'; return s;
    }
    function saveWin(){
      var val = (winInput && winInput.value || '').trim(); if(!val) return;
      var status = grabWinStatus();
      w.IDMAR_HIST && IDMAR_HIST.save('win', { type:'win', win:val, status:status });
    }
    if(winForm){ winForm.addEventListener('submit', function(){ setTimeout(saveWin, 80); }); }
    if(winBtn ){ winBtn .addEventListener('click',  function(){ setTimeout(saveWin, 80); }); }

    // MOTOR
    var motorForm = d.querySelector('form#motorForm, form[data-form="motor"], form[action*="motor"]');
    var snInput   = d.querySelector('#snInput, input[name="serial"], input[name="sn"], input[name="engine_sn"]');
    var brandSel  = d.querySelector('#brandSelect, select[name="brand"], select[name="marca"]');
    var modelInput= d.querySelector('#modelInput, input[name="model"], input[name="modelo"]');
    var motorBtn  = d.querySelector('#btnMotor, button[name="validate_motor"], button#validateMotor');
    function grabMotorStatus(){
      var el = d.querySelector('#motor-output .status, #motor-output .resultado, #motorResult .status, #motorResult, .motor-result .status');
      var txt = el && el.textContent || ''; var s='';
      if(/inv[aá]lid/i.test(txt)) s='inválido'; else if(/v[aá]lid/i.test(txt)) s='válido'; return s;
    }
    function saveMotor(){
      var sn = (snInput && snInput.value || '').trim(); if(!sn) return;
      var brand = (brandSel && brandSel.value) || '';
      var model = (modelInput && modelInput.value) || '';
      var status = grabMotorStatus();
      w.IDMAR_HIST && IDMAR_HIST.save('motor', { type:'motor', sn:sn, brand:brand, model:model, status:status });
    }
    if(motorForm){ motorForm.addEventListener('submit', function(){ setTimeout(saveMotor, 80); }); }
    if(motorBtn ){ motorBtn .addEventListener('click',  function(){ setTimeout(saveMotor, 80); }); }

    // HISTÓRICO (só se a tabela existir)
    var tbd = d.querySelector('#hist-tbl tbody');
    if(tbd){
      var TYPE = d.body.dataset.hist || 'win';
      var inpQ = d.getElementById('hist-q');
      var selEstado = d.getElementById('hist-estado');
      var selMarca = d.getElementById('hist-marca');
      var inpFrom = d.getElementById('hist-from');
      var inpTo = d.getElementById('hist-to');
      var btnClear = d.getElementById('hist-clear');
      var btnCSV = d.getElementById('hist-csv');

      function render(list){
        tbd.innerHTML='';
        list.sort(function(a,b){ return (b.ts||0)-(a.ts||0); });
        list.forEach(function(r){
          var tr = d.createElement('tr');
          var main = (TYPE==='win' ? (r.win||'') : (r.sn||''));
          var brand = r.brand||''; var model=r.model||'';
          var status = r.status||''; var when=r.when||'';
          tr.innerHTML = '<td>'+when+'</td><td>'+main+'</td>'+(TYPE==='motor'?('<td>'+brand+'</td><td>'+model+'</td>'):'')+'<td>'+status+'</td>';
          tbd.appendChild(tr);
        });
      }
      function apply(){
        var all = (w.IDMAR_HIST && IDMAR_HIST.all(TYPE)) || [];
        var opts = { query:(inpQ && inpQ.value || '').trim(),
                     status:(selEstado && selEstado.value ? [selEstado.value.toLowerCase()] : []) };
        if(inpFrom && inpFrom.value){ opts.from = Date.parse(inpFrom.value); }
        if(inpTo && inpTo.value){ opts.to = Date.parse(inpTo.value+'T23:59:59'); }
        if(TYPE==='motor' && selMarca && selMarca.value){ opts.brand = selMarca.value; }
        var filtered = (w.IDMAR_HIST && IDMAR_HIST.filter(all, opts)) || [];
        render(filtered);
      }
      [inpQ, selEstado, selMarca, inpFrom, inpTo].forEach(function(el){
        if(el){ el.addEventListener('input', apply); if(el.tagName==='SELECT'){ el.addEventListener('change', apply); } }
      });
      if(btnClear) btnClear.addEventListener('click', function(){ if(confirm('Limpar histórico?')){ w.IDMAR_HIST && IDMAR_HIST.clear(TYPE); apply(); } });
      if(btnCSV)   btnCSV  .addEventListener('click', function(){ var all=(w.IDMAR_HIST && IDMAR_HIST.all(TYPE))||[]; var filtered=(w.IDMAR_HIST && IDMAR_HIST.filter(all,{ query:(inpQ&&inpQ.value||'').trim() }))||[]; w.IDMAR_HIST && IDMAR_HIST.toCSV(TYPE, filtered); });
      apply();
    }
  });

  /* --- 5) UI interpretativa (renderizadores públicos) --- */
  (function(){
    if (w.renderWinResult && w.renderMotorResult) return;
    function el(tag, cls){ var e=d.createElement(tag); if(cls) e.className=cls; return e; }
    function badge(status){ var b=el('span','badge '+(status==='válido'?'ok':'nok')); b.textContent=status||''; return b; }
    function table(fields){
      var t=el('table','tbl'); t.innerHTML='<thead><tr><th data-i18n="field">Campo</th><th data-i18n="value">Valor</th><th data-i18n="meaning">Interpretação</th></tr></thead><tbody></tbody>';
      var tb=t.querySelector('tbody'); (fields||[]).forEach(function(r){ var tr=d.createElement('tr'); tr.innerHTML='<td>'+(r.label||'')+'</td><td>'+(r.value||'')+'</td><td>'+(r.meaning||'')+'</td>'; tb.appendChild(tr); });
      return t;
    }
    function rulesBlock(rules){
      if(!Array.isArray(rules) || !rules.length) return null;
      var div=el('div','panel'); div.innerHTML='<h3 data-i18n="rules">Regras aplicadas</h3><ul class="rules">'+rules.map(function(r){return '<li>'+r+'</li>'}).join('')+'</ul>'; return div;
    }
    w.renderWinResult = function(res){
      var box=d.getElementById('winResult'); if(!box) return; box.innerHTML='';
      var head=el('div','result-header'); head.appendChild(badge(res.status||'')); box.appendChild(head);
      box.appendChild(table(res.fields||[])); var rb=rulesBlock(res.rules); if(rb) box.appendChild(rb);
      if (typeof w.showWinForense==='function'){ var btn=el('button','btn ghost'); btn.textContent='Forense / Forensics'; btn.onclick=function(){ w.showWinForense(res); }; box.appendChild(btn); }
    };
    w.renderMotorResult = function(res){
      var box=d.getElementById('motorResult'); if(!box) return; box.innerHTML='';
      var head=el('div','result-header'); head.appendChild(badge(res.status||'')); box.appendChild(head);
      box.appendChild(table(res.fields||[])); var rb=rulesBlock(res.rules); if(rb) box.appendChild(rb);
      if (typeof w.showMotorForense==='function'){ var btn=el('button','btn ghost'); btn.textContent='Forense / Forensics'; btn.onclick=function(){ w.showMotorForense(res); }; box.appendChild(btn); }
    };
  })();

})(window, document);
