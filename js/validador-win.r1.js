/* IDMAR — validador-win.r1 (PT + dica EN | histórico compat) */
(()=> {
  const selInput = ['#win','#winInput','input[name="win"]','.js-win','#hin','#hinInput','input[name="hin"]'];
  const selButton=['#btnValidar','#validateBtn','.js-validate','button[type="submit"]'];
  const selOutput=['#resultado','.js-result','[data-result]'];

  function q(arr){ for(const s of arr){ const el=document.querySelector(s); if(el) return el } return null }
  function ok(pt,en,meta={})  { return {valid:true,  message:`${pt} [${en}]`, meta} }
  function fail(pt,en,meta={}){ return {valid:false, message:`${pt} [${en}]`, meta} }

  const MONTH = new Set('ABCDEFGHJKL MNP RSTUVWXYZ'.replace(/\s+/g,'').split(''));
  const reAZ=/^[A-Z]+$/, reAZ09=/^[A-Z0-9]+$/, re09=/^[0-9]+$/;

  const norm = x => (x||'').toUpperCase().trim().replace(/\s+/g,'');
  const stripHyph2 = s => s.replace(/^(..)-(.*)$/,'$1$2');
  const detectLen = s => s.length===14?'EU_OR_US_14':(s.length===16?'US_16':(s.length===15?'INVALID_15':'UNKNOWN'));

  function validateEU14(w){
    const c=w.slice(0,2), m=w.slice(2,5), free=w.slice(5,10), mon=w[10], yr=w[11], model=w.slice(12,14);
    if(!reAZ.test(c)) return fail('País inválido','Invalid country');
    if(!reAZ.test(m)) return fail('Fabricante inválido','Invalid manufacturer');
    if(!reAZ09.test(free))return fail('Série inválida','Free block invalid');
    if(!MONTH.has(mon))  return fail('Mês inválido (sem I/O/Q)','Invalid month');
    if(!re09.test(yr))   return fail('Ano inválido','Invalid year');
    if(!re09.test(model))return fail('Modelo inválido','Invalid model');
    return ok('Formato UE (14) válido','EU 14 valid',{country:c,manufacturer:m,month:mon,year:yr,model});
  }
  function validateUS14(w){
    const c=w.slice(0,2), m=w.slice(2,5), free=w.slice(5,12), mon=w[12], yr=w[13];
    if(!reAZ.test(c)) return fail('País inválido','Invalid country');
    if(!reAZ.test(m)) return fail('Fabricante inválido','Invalid manufacturer');
    if(!reAZ09.test(free))return fail('Série inválida','Free block invalid');
    if(!MONTH.has(mon))  return fail('Mês inválido (sem I/O/Q)','Invalid month');
    if(!re09.test(yr))   return fail('Ano inválido','Invalid year');
    return ok('Formato EUA (14) válido','US 14 valid',{country:c,manufacturer:m,month:mon,year:yr});
  }
  function validateUS16(w){
    const c=w.slice(0,2), m=w.slice(2,5), free=w.slice(5,12), mon=w[12], yr=w[13], model=w.slice(14,16);
    if(!reAZ.test(c)) return fail('País inválido','Invalid country');
    if(!reAZ.test(m)) return fail('Fabricante inválido','Invalid manufacturer');
    if(!reAZ09.test(free))return fail('Série inválida','Free block invalid');
    if(!MONTH.has(mon))  return fail('Mês inválido (sem I/O/Q)','Invalid month');
    if(!re09.test(yr))   return fail('Ano inválido','Invalid year');
    if(!re09.test(model))return fail('Modelo inválido','Invalid model');
    return ok('Formato EUA (16) válido','US 16 valid',{country:c,manufacturer:m,month:mon,year:yr,model});
  }

  function validate(raw){
    let w=norm(raw);
    if(!w) return fail('Campo vazio','Empty field');
    if(/[^A-Z0-9-]/.test(w)) return fail('Caracteres inválidos','Invalid chars');
    if(/^..-./.test(w)) w=stripHyph2(w);
    const len=detectLen(w);
    if(len==='INVALID_15') return fail('Formato EUA (15) inválido','US 15 invalid');
    if(len==='EU_OR_US_14'){
      const eu=validateEU14(w); if(eu.valid) return {...eu,meta:{...eu.meta,format:'EU-14',normalized:w}};
      const us14=validateUS14(w); if(us14.valid) return {...us14,meta:{...us14.meta,format:'US-14',normalized:w}};
      return eu;
    }
    if(len==='US_16'){ const us16=validateUS16(w); return {...us16,meta:{...us16.meta,format:'US-16',normalized:w}}; }
    return fail('Formato desconhecido','Unknown format',{normalized:w,length:w.length});
  }

  function record(verdict, raw){
    const a=localStorage.getItem('history_win'), b=localStorage.getItem('historyWin');
    let list=[]; try{ if(a) list=JSON.parse(a)||[]; else if(b) list=JSON.parse(b)||[] }catch(_){}
    const entry={
      id:(Math.random().toString(16).slice(2))+Date.now(),
      ts:new Date().toISOString(),
      win: verdict?.meta?.normalized || (raw||'').toUpperCase(),
      valid: !!verdict.valid,
      estado: verdict.valid?'ok':'erro',
      estadoLabel: verdict.valid?'Válido':'Inválido',
      justificacao: verdict.message||'',
      foto:'',
      meta:{...verdict.meta,module:'WIN'}
    };
    list=[entry,...list];
    try{
      localStorage.setItem('history_win',JSON.stringify(list));
      localStorage.setItem('historyWin',JSON.stringify(list));
    }catch(_){}
  }

  function bind(){
    const input=q(selInput), btn=q(selButton), out=q(selOutput);
    if(document.body.dataset.winBound) return; document.body.dataset.winBound='1';
    function run(e){ e?.preventDefault?.(); const raw=input?input.value:''; const v=validate(raw); if(out){ out.textContent=v.message; out.dataset.valid=v.valid?'1':'0'; } record(v,raw); return v; }
    btn&&btn.addEventListener('click',run);
    const form=input?input.closest('form'):document.querySelector('form'); form&&form.addEventListener('submit',run);
    input&&input.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); run(e); } });
    window.MIEC_WIN={ validateWIN:validate, run:()=>run() };
  }
  (document.readyState==='loading')?document.addEventListener('DOMContentLoaded',bind):bind();
})();
