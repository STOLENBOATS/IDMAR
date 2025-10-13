// validador-motor.r3c.js — histórico + validação (PT/EN)
(function(w,d){
  w.IDMAR=w.IDMAR||{}; w.NAV=w.NAV||w.IDMAR;
  NAV.STORAGE = NAV.STORAGE || { SESSION:'IDMAR_SESSION', WIN_HISTORY:'hist_win', MOTOR_HISTORY:'hist_motor' };
  function $id(id){ return d.getElementById(id); }
  function load(key){ try{ return JSON.parse(localStorage.getItem(key)||'[]'); }catch(e){ return []; } }
  function save(key,val){ try{ localStorage.setItem(key, JSON.stringify(val||[])); }catch(e){} }
  function nowISO(){ try{ return new Date().toISOString(); }catch(e){ return String(Date.now()); } }
  function getSel(){ const v=id=>($id(id)&&$id(id).value)||''; return {
    brand: ($id('brand')?.value)||'',
    family: v('eng_family'),
    model: v('eng_model') || ($id('srch_model')?.value||''),
    hp: v('eng_hp') || ($id('srch_power')?.value||''),
    displacement: v('eng_disp') || ($id('srch_disp')?.value||''),
    year: v('eng_year') || ($id('srch_year')?.value||''),
    rigging: v('eng_rig'),
    shaft: v('eng_shaft'),
    rotation: v('eng_rot'),
    color: v('eng_color'),
    gear: v('eng_gear'),
    origin: ($id('srch_origin')?.value)||''
  };}
  function badge(ok, errs){ if(ok) return '<span class="badge good">Válido / Valid</span>'; const lis=(errs||[]).map(e=>'<li>'+e+'</li>').join(''); return '<span class="badge bad">Inválido / Invalid</span><ul style="margin:.4rem 0 .2rem .9rem">'+lis+'</ul>'; }
  async function onSubmit(e){
    e.preventDefault();
    const out=$id('motorOut'); if(!out) return;
    const s=getSel();
    if(!s.brand){ out.innerHTML=badge(false,["Selecione a marca / Select the brand"]); return; }
    if(!s.model && !s.hp){ out.innerHTML=badge(false,["Preencha Modelo ou Potência / Fill Model or Power"]); return; }
    let res={ok:true,errors:[]};
    try{
      if(w.IDMAR_VALIDATION && typeof w.IDMAR_VALIDATION.validateSelection==='function'){
        res = await w.IDMAR_VALIDATION.validateSelection({
          brand:s.brand,family:s.family,model:s.model,hp:s.hp,rigging:s.rigging,shaft:s.shaft,rotation:s.rotation,year:s.year,displacement:s.displacement
        }, {catalogUrl:'data/engines_catalog.v2.json'});
      }
    }catch(e){ res={ok:false,errors:["Erro de validação / Validation error"]}; }
    const photo=$id('motorPhoto'); let photoName='', photoData='';
    if(photo && photo.files && photo.files[0]){
      photoName=photo.files[0].name;
      try{ const fr=new FileReader(); photoData=await new Promise((res,rej)=>{ fr.onload=()=>res(fr.result); fr.onerror=rej; fr.readAsDataURL(photo.files[0]); }); }catch(e){}
    }
    const parts=[];
    if(s.family) parts.push(`Família/Family: ${s.family}`);
    if(s.model) parts.push(`Modelo/Model: ${s.model}`);
    if(s.hp) parts.push(`Potência/Power: ${s.hp} hp`);
    if(s.rigging) parts.push(`Comando/Rigging: ${s.rigging}`);
    if(s.shaft) parts.push(`Coluna/Shaft: ${s.shaft}`);
    if(s.rotation) parts.push(`Rotação/Rotation: ${s.rotation}`);
    if(s.displacement) parts.push(`Cilindrada/Displacement: ${s.displacement} cc`);
    if(s.year) parts.push(`Ano/Year: ${s.year}`);
    if(s.origin) parts.push(`Origem/Origin: ${s.origin}`);
    out.innerHTML = badge(res.ok,res.errors) + ' ' + parts.join(' | ');
    const rec = {date:nowISO(), ...s, valid:!!res.ok, reason: res.ok? "Combinação compatível / Combination valid" : (res.errors||[]).join(' ; '), photoName, photoData};
    try{ const key= NAV.STORAGE.MOTOR_HISTORY || 'hist_motor'; const arr=load(key); arr.unshift(rec); save(key, arr); }catch(e){ console.error('Falha ao gravar histórico', e); }
  }
  function wire(){ const form=$id('formMotor'); if(form && !form.dataset.bound){ form.addEventListener('submit', onSubmit); form.dataset.bound='1'; } }
  if(document.readyState==='loading') d.addEventListener('DOMContentLoaded', wire); else wire();
})(window, document);