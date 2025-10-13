/* IDMAR — validador-motor.r1 (campos dinâmicos + histórico compat) */
(()=> {
  const selBrand=['select[name="marca"]','#marcaMotor','.js-motor-marca','#motorMarca','#brand'];
  const selSN=['#snMotor','input[name="sn"]','.js-motor-sn','#serialNumber'];
  const selBtn=['#btnValidarMotor','.js-validate-motor','#validateMotor','button[data-module="motor"]'];
  const selOut=['#resultadoMotor','.js-result-motor','[data-result="motor"]'];
  const selMount=['#motor-dynamic','.js-motor-dynamic','[data-motor-dynamic]'];

  function q(arr){ for(const s of arr){ const el=document.querySelector(s); if(el) return el } return null }
  function c(tag,cls){ const e=document.createElement(tag); if(cls) e.className=cls; return e }
  const upper = x => (x||'').toUpperCase().trim();
  const isAlnum = x => /^[A-Z0-9-]+$/i.test(x||'');

  const BRANDS={ YAMAHA:{enabled:true,label:'Yamaha', fields:[
      {id:'model', label:'Modelo',         placeholder:'p.ex. F350NSA',   required:true},
      {id:'code',  label:'Código/Prefixo', placeholder:'p.ex. 6ML',       required:false},
      {id:'ym',    label:'Letra/Mês-Ano',  placeholder:'p.ex. N (mês/ano)',required:false},
      {id:'serial',label:'N.º Série',      placeholder:'p.ex. 1005843',   required:true},
    ]},
    HONDA:{enabled:true,label:'Honda',fields:[
      {id:'model', label:'Modelo',         placeholder:'p.ex. BF90D', required:true},
      {id:'serial',label:'N.º Série',      placeholder:'p.ex. BAZS-1100001', required:true},
    ]},
    SUZUKI:{enabled:false,label:'Suzuki',fields:[
      {id:'model',label:'Modelo',placeholder:'p.ex. DF115A',required:true},
      {id:'serial',label:'N.º Série',placeholder:'p.ex. 11501F-123456',required:true},
    ]},
  };

  function ensureMount(near){ let m=q(selMount); if(m) return m; m=c('div','motor-dynamic'); m.setAttribute('data-motor-dynamic',''); if(near&&near.parentElement) near.parentElement.insertBefore(m,near.nextSibling); else (document.querySelector('form')||document.body).appendChild(m); return m }
  function clear(el){ while(el&&el.firstChild) el.removeChild(el.firstChild) }

  function renderFields(key, sel){
    const b=BRANDS[key]; const m=ensureMount(sel); clear(m);
    if(!b||!b.enabled){ const p=c('p'); p.textContent='Marca não disponível [Brand not available]'; m.appendChild(p); return; }
    const fs=c('fieldset'), lg=c('legend'); lg.textContent=`Campos ${b.label} [${b.label} fields]`; fs.appendChild(lg);
    b.fields.forEach(f=>{ const row=c('div'); const lab=c('label'); lab.textContent=`${f.label} [${f.label}]`; lab.htmlFor=`motor-${f.id}`; const inp=c('input'); inp.type='text'; inp.id=`motor-${f.id}`; inp.setAttribute('data-field',f.id); if(f.placeholder) inp.placeholder=f.placeholder; if(f.required) inp.setAttribute('data-required','1'); row.append(lab,inp); fs.appendChild(row); });
    m.appendChild(fs);
  }

  function collect(){ const m=q(selMount)||document.querySelector('[data-motor-dynamic]'); const out={}; if(m) m.querySelectorAll('input[data-field]').forEach(i => out[i.getAttribute('data-field')]=i.value); const sn=q(selSN); if(sn && !out.serial) out.serial=sn.value; return out }

  const ok   = (pt,en,meta={}) => ({valid:true ,message:`${pt} [${en}]`,meta});
  const fail = (pt,en,meta={}) => ({valid:false,message:`${pt} [${en}]`,meta});

  function validateY(vals){
    const model=upper(vals.model), code=upper(vals.code), ym=upper(vals.ym), serial=upper(vals.serial);
    if(!model)  return fail('Modelo em falta','Missing model');
    if(!serial) return fail('N.º de série em falta','Missing serial');
    if(!isAlnum(model))  return fail('Modelo com caracteres inválidos','Model invalid');
    if(!isAlnum(serial)) return fail('Série com caracteres inválidos','Serial invalid');
    if(serial.length<5)  return fail('Série curta','Serial too short');
    const okModel = /^[A-Z]{1,2}\d{2,3}[A-Z]{0,3}$/.test(model) && (!code || /^[A-Z0-9]{2,4}$/.test(code)) && (!ym || /^[A-HJ-NPR-Z0-9]{1,3}$/.test(ym));
    if(!okModel) return fail('Padrão Yamaha pouco consistente','Yamaha pattern inconsistent',{model,code,ym,serial});
    return ok('Yamaha válido (plausível)','Yamaha valid (plausible)',{brand:'YAMAHA',model,code,ym,serial});
  }
  function validateH(vals){
    const model=upper(vals.model), serial=upper(vals.serial);
    if(!model)  return fail('Modelo em falta','Missing model');
    if(!serial) return fail('N.º de série em falta','Missing serial');
    if(!isAlnum(model))  return fail('Modelo com caracteres inválidos','Model invalid');
    if(!/^[A-Z0-9-]+$/.test(serial)) return fail('Série com caracteres inválidos','Serial invalid');
    if(!/^([A-Z]{1,3}\d{2,3}[A-Z]?)$/.test(model) || serial.length<6) return fail('Padrão Honda pouco consistente','Honda pattern inconsistent',{model,serial});
    return ok('Honda válido (plausível)','Honda valid (plausible)',{brand:'HONDA',model,serial});
  }

  function record(key, vals, verdict){
    const KA='history_motor', KB='historyMotor';
    let list=[]; try{ const a=localStorage.getItem(KA), b=localStorage.getItem(KB); if(a) list=JSON.parse(a)||[]; else if(b) list=JSON.parse(b)||[]; }catch(_){}
    const entry={
      id:(Math.random().toString(16).slice(2))+Date.now(),
      ts:new Date().toISOString(),
      marca:key,
      sn: vals.serial||vals.sn||'',
      valid: !!verdict.valid,
      estado: verdict.valid?'ok':'erro',
      estadoLabel: verdict.valid?'Válido':'Inválido',
      justificacao: verdict.message||'',
      foto:'',
      meta:{...verdict.meta,module:'MOTOR'}
    };
    list=[entry,...list];
    try{ localStorage.setItem(KA,JSON.stringify(list)); localStorage.setItem(KB,JSON.stringify(list)); }catch(_){}
  }

  function bind(){
    const brandSel=q(selBrand), btn=q(selBtn), out=q(selOut);
    if(document.body.dataset.motorBound) return; document.body.dataset.motorBound='1';
    const key=(raw=>({'YAMAHA':'YAMAHA','HONDA':'HONDA','SUZUKI':'SUZUKI'}[raw]||raw||'YAMAHA'))(upper(brandSel&&brandSel.value||'YAMAHA'));
    renderFields(key,brandSel);
    brandSel&&brandSel.addEventListener('change',()=>{ const k=(x=>({'YAMAHA':'YAMAHA','HONDA':'HONDA','SUZUKI':'SUZUKI'}[x]||x))(upper(brandSel.value||'')); renderFields(k,brandSel); });
    function run(e){ e?.preventDefault?.(); const k=(x=>({'YAMAHA':'YAMAHA','HONDA':'HONDA','SUZUKI':'SUZUKI'}[x]||x))(upper(brandSel&&brandSel.value||'')); const vals=collect();
      let v; if(k==='YAMAHA') v=validateY(vals); else if(k==='HONDA') v=validateH(vals); else v=fail('Marca não suportada','Brand not supported');
      if(out){ out.textContent=v.message; out.dataset.valid=v.valid?'1':'0'; } record(k,vals,v); return v; }
    btn&&btn.addEventListener('click',run);
    const form=brandSel?brandSel.closest('form'):document.querySelector('form'); form&&form.addEventListener('submit',run);
  }
  (document.readyState==='loading')?document.addEventListener('DOMContentLoaded',bind):bind();
})();
