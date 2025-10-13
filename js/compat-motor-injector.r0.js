/* IDMAR compat — Motor injector r0 (não destrutivo)
   Escuta o submit/click do formulário do Motor e grava no histórico
   (history_motor + historyMotor), sem alterar o teu validador.
*/
(function(){
  if (window.__IDMAR_MOTOR_COMPAT__) return; window.__IDMAR_MOTOR_COMPAT__=true;

  function q(s){return document.querySelector(s)}
  function upp(x){return (x||'').toUpperCase().trim()}
  function getJSON(k){ try{ const r=localStorage.getItem(k); return r?JSON.parse(r):[] }catch(_){ return [] } }
  function writeBoth(list){
    try{ localStorage.setItem('history_motor', JSON.stringify(list)); }catch(_){}
    try{ localStorage.setItem('historyMotor', JSON.stringify(list)); }catch(_){}
  }
  function nowIso(){ return new Date().toISOString() }
  function randId(){ return (Math.random().toString(16).slice(2))+Date.now() }

  function pickBrand(){ 
    const el = q('select[name="marca"]') || q('#brand') || q('#marcaMotor') || q('.js-motor-marca'); 
    return (el && (el.value||'').trim()) || '';
  }
  function pickSN(){
    const el = q('#snMotor') || q('input[name="sn"]') || q('.js-motor-sn') || q('#serialNumber');
    return upp(el && el.value);
  }
  function pickModel(){
    const el = document.querySelector('[data-field="model"]') || q('#modeloMotor') || q('input[name="modelo"]');
    return upp(el && el.value);
  }
  function pickResultText(){
    const cand = q('#resultadoMotor') || q('.js-result-motor') || q('[data-result="motor"]') || q('#motorOut');
    return (cand && (cand.textContent||'').trim()) || '';
  }
  function parseVerdict(text){
    if (!text) return {valid:null, msg:''};
    const t=text.toLowerCase();
    const valid = t.includes('válido') || t.includes(' valid');
    const invalid = t.includes('inválido') || t.includes(' invalid');
    return { valid: valid && !invalid, msg: text };
  }

  function record(sn, brand, model, verdict){
    const a = getJSON('history_motor'), b = getJSON('historyMotor');
    const current = (a.length ? a : b);
    const last = current[0] || {};
    // evita duplicado imediato
    if (last && last.sn === sn && last.marca === brand && last.justificacao === verdict.msg) return;

    const entry = {
      id: randId(),
      ts: nowIso(),
      marca: brand || '',
      sn: sn || '',
      modelo: model || '',
      valid: verdict.valid===true,
      estado: verdict.valid===true ? 'ok' : 'erro',
      estadoLabel: verdict.valid===true ? 'Válido' : 'Inválido',
      justificacao: verdict.msg || '',
      foto: '',
      meta: { module:'MOTOR' }
    };
    writeBoth([entry].concat(current));
  }

  function hook(){
    const form = q('#formMotor') || document.querySelector('form');
    function onSubmit(){
      // espera a tua UI escrever a mensagem no DOM
      setTimeout(function(){
        const sn = pickSN();
        const brand = pickBrand();
        const model = pickModel();
        const verdict = parseVerdict(pickResultText());
        if (sn || brand || model) record(sn, brand, model, verdict);
      }, 0);
    }
    if (form && !form.__idmarCompatBound){
      form.__idmarCompatBound = true;
      form.addEventListener('submit', onSubmit);
    }
    const btn = q('#btnMotor') || q('#btnValidarMotor') || q('.js-validate-motor');
    if (btn && !btn.__idmarCompatBound){
      btn.__idmarCompatBound = true;
      btn.addEventListener('click', function(){ setTimeout(onSubmit, 0); });
    }
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', hook); else hook();
})();
