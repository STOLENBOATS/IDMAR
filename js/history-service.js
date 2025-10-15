(function(w){
  const KEYS = { WIN:'hist_win', MOTOR:'hist_motor' };
  function load(key){ try{ return JSON.parse(localStorage.getItem(key))||[] }catch{ return [] } }
  function save(key, arr){ localStorage.setItem(key, JSON.stringify(arr)); }
  w.HistoryService = {
    addWIN(entry){ const arr = load(KEYS.WIN); arr.unshift(entry); save(KEYS.WIN, arr); },
    addMotor(entry){ const arr = load(KEYS.MOTOR); arr.unshift(entry); save(KEYS.MOTOR, arr); },
    listWIN(){ return load(KEYS.WIN); },
    listMotor(){ return load(KEYS.MOTOR); }
  };

  const hw = document.getElementById('histResult');
  document.getElementById('btnLoadHistWIN')?.addEventListener('click', ()=>{
    const items = w.HistoryService.listWIN();
    hw.innerHTML = items.length? items.map(r=>`<div><strong>${r.value}</strong><br><small>${r.when}</small><br>${r.reason||''}</div>`).join('<hr>') : 'Sem registos WIN.';
  });
  document.getElementById('btnLoadHistMotor')?.addEventListener('click', ()=>{
    const items = w.HistoryService.listMotor();
    hw.innerHTML = items.length? items.map(r=>`<div><strong>${r.brand||'?'} — ${r.value}</strong><br><small>${r.when}</small><br>${r.reason||''}</div>`).join('<hr>') : 'Sem registos de motores.';
  });
})(window);
