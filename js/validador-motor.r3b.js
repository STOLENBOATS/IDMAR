// IDMAR — Validador Motor (r3b) com campos dinâmicos por marca + histórico + forense
(function(w,d){
  w.IDMAR=w.IDMAR||{}; w.NAV=w.NAV||w.IDMAR;
  NAV.STORAGE = NAV.STORAGE || { SESSION:'IDMAR_SESSION', WIN_HISTORY:'hist_win', MOTOR_HISTORY:'hist_motor' };

  function $id(id){ return d.getElementById(id); }
  function load(key){ try{ return JSON.parse(localStorage.getItem(key)||'[]'); }catch(e){ return []; } }
  function save(key, val){ try{ localStorage.setItem(key, JSON.stringify(val||[])); }catch(e){} }
  function readFileAsDataURL(file){ return new Promise((res,rej)=>{ if(!file){ res(''); return; }
  async function compressImageFile(file, maxW=1024, maxH=768, quality=0.72){
    try{
      const blob = file;
      const fr = new FileReader();
      const dataURL = await new Promise((res,rej)=>{ fr.onload=()=>res(fr.result); fr.onerror=rej; fr.readAsDataURL(blob); });
      const img = new Image();
      const imgData = await new Promise((res,rej)=>{ img.onload=()=>res(); img.onerror=rej; img.src=dataURL; });
      const w = img.width, h = img.height;
      let nw=w, nh=h;
      if(w>maxW || h>maxH){
        const ratio = Math.min(maxW/w, maxH/h);
        nw = Math.round(w*ratio); nh = Math.round(h*ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = nw; canvas.height = nh;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, nw, nh);
      const out = canvas.toDataURL('image/jpeg', quality);
      // safety cap ~300KB: if still huge, reduce quality
      if(out.length > 400000){
        return canvas.toDataURL('image/jpeg', 0.6);
      }
      return out;
    }catch(e){
      // fallback to raw dataURL if anything fails
      try{
        const fr2 = new FileReader();
        return await new Promise((res,rej)=>{ fr2.onload=()=>res(fr2.result); fr2.onerror=rej; fr2.readAsDataURL(file); });
      }catch(e2){ return ''; }
    }
  }
 const r=new FileReader(); r.onload=()=>res(r.result||''); r.onerror=rej; r.readAsDataURL(file); }); }

  const SCHEMAS={
    "Yamaha":[
      {id:"yam_model",   label:"Código do modelo / Model code", ph:"F350NSA"},
      {id:"yam_shaft",   label:"Shaft", ph:"S / L / X / U / UL / N"},
      {id:"yam_yearpair",label:"Par de letras (ano)", ph:"BA, BB..."},
      {id:"yam_serial",  label:"Série (6–7 dígitos)", ph:"1005843"}
    ],
    "Honda":[
      {id:"hon_frame", label:"N.º de quadro (externo)", ph:"xxxxx..."},
      {id:"hon_engine",label:"N.º motor (bloco)", ph:"BF150A..."}
    ],
    "Suzuki":[
      {id:"suz_model", label:"Código do modelo", ph:"DF140A"},
      {id:"suz_serial",label:"Série (6 dígitos)", ph:"123456"}
    ],
    "Tohatsu":[
      {id:"toh_model", label:"Código do modelo", ph:"MFS 60"},
      {id:"toh_shaft", label:"Shaft", ph:"S / L / X / U / UL / N"},
      {id:"toh_serial",label:"Série (6–7 dígitos)", ph:"1234567"}
    ],
    "Mercury":[
      {id:"mer_engine", label:"N.º motor", ph:"Etiqueta / core plug"}
    ],
    "MerCruiser":[
      {id:"mrc_engine",  label:"Engine no.",  ph:"A123456"},
      {id:"mrc_drive",   label:"Drive no.",   ph:"A123456"},
      {id:"mrc_transom", label:"Transom no.", ph:"A123456"}
    ],
    "Volvo Penta":[
      {id:"vol_engine", label:"N.º motor", ph:"Etiqueta/bloco"},
      {id:"vol_trans",  label:"N.º transmissão (sail/shaft/IPs)", ph:"Etiqueta/bloco"}
    ],
    "Yanmar":[
      {id:"yan_engine",  label:"N.º motor (etiqueta)", ph:"Etiqueta/bloco"},
      {id:"yan_engine2", label:"N.º motor (estampado)", ph:"Estampado no bloco"}
    ],
    "Evinrude/Johnson":[
      {id:"evj_engine", label:"Engine number", ph:"OMC/BRP — ver nota"}
    ]
  };

  // mapeia id → data-engine-field para o add-on
  function dataFieldFor(id){
    const s = String(id).toLowerCase();
    if (s.includes('shaft'))                return 'shaft';
    if (s.includes('yearpair') || s.includes('letter') || s.includes('par')) return 'letter_pair';
    if (s.includes('serial') || s.includes('serie'))  return 'series';
    if (s.includes('model')  || s.includes('codigo')) return 'model_code';
    // os restantes (engine/frame/etc.) não são usados pelo add-on de catálogo
    return null;
  }

  function renderFields(){
    const brandSel=$id('brand'); const dyn=$id('brandDynamic');
    if(!brandSel||!dyn) return;
    const schema=SCHEMAS[brandSel.value]||[];
    dyn.innerHTML='';
    schema.forEach(f=>{
      const wrap=d.createElement('div');
      const input = d.createElement('input');
      input.id = f.id;
      input.type = 'text';
      input.placeholder = f.ph;
      const df = dataFieldFor(f.id);
      if (df) input.setAttribute('data-engine-field', df);  // <<<<<<  AQUI
      const label = d.createElement('label');
      label.textContent = f.label;
      wrap.appendChild(label);
      wrap.appendChild(input);
      dyn.appendChild(wrap);
    });
    // Nota por marca
    let txt=''; const note=$id('brandNote')||d.createElement('div');
    note.id='brandNote'; note.className='small';
    if(brandSel.value==='Mercury'){ txt="≤30hp podem ser Tohatsu; verificar sticker e core plug."; }
    if(brandSel.value==='MerCruiser'){ txt="Desde 2010: 7 dígitos iniciados por 'A'. Engine/Drive/Transom podem existir."; }
    if(brandSel.value==='Evinrude/Johnson'){ txt="OMC até 2000 não rastreável; BRP cessou 2007/2020."; }
    if(brandSel.value==='Tohatsu'){ txt=">60hp por Honda; ≤30hp por Mercury; ≤15hp por Tohatsu para Evinrude."; }
    note.textContent=txt; dyn.appendChild(note);
  }

  async function onSubmitMotor(e){
    e.preventDefault();
    const brandSel=$id('brand'); const dyn=$id('brandDynamic'); const out=$id('motorOut'); const file=$id('motorPhoto');
    if(!brandSel||!dyn||!out) return;
    const inputs=Array.from(dyn.querySelectorAll('input'));
    const serialParts=inputs.map(i=> (i.previousElementSibling?.textContent||i.id)+': '+i.value.trim()).filter(s=>/:\s*\S/.test(s));
    const hasSerialInfo=inputs.some(i=>i.value.trim().length>0);
    const search={ model:$id('srch_model')?.value.trim()||'', power:$id('srch_power')?.value.trim()||'', disp:$id('srch_disp')?.value.trim()||'', year:$id('srch_year')?.value.trim()||'', origin:$id('srch_origin')?.value.trim()||'' };
    const hasSearch=Object.values(search).some(v=>v.length>0);
    if(!hasSerialInfo && !hasSearch){ out.innerHTML='<span class="badge bad">Preencha pelo menos os campos de pesquisa ou de série</span>'; return; }
    const summary=[];
    if(hasSearch){ summary.push(`Pesquisa: Modelo=${search.model||'-'} | Potência(hp)=${search.power||'-'} | Cilindrada(cc)=${search.disp||'-'} | Ano=${search.year||'-'} | Origem=${search.origin||'-'}`); }
    if(hasSerialInfo){ summary.push('Identificação: '+serialParts.join(' · ')); }
    out.innerHTML='<span class="badge good">Registo criado</span> ' + summary.join(' | ');

    let photoName='', photoData=''; if(file && file.files && file.files[0]){ photoName=file.files[0].name; try{ photoData=await compressImageFile(file.files[0]); }catch(e){} }
    const rec={date:new Date().toISOString(), brand:brandSel.value, sn: summary.join(' | '), model:search.model||'', valid:true, reason:'OK', photoName, photoData};
    const arr=load(NAV.STORAGE.MOTOR_HISTORY); arr.unshift(rec); save(NAV.STORAGE.MOTOR_HISTORY, arr);
  }

  function wire(){
    const brandSel=$id('brand'); if(brandSel){ brandSel.addEventListener('change', renderFields); renderFields(); }
    const form=$id('formMotor'); if(form){ form.addEventListener('submit', onSubmitMotor); }
  }

  // Forense add-on
  (function(){
    function ensureForenseUI(){
      const form=$id('formMotor'); if(!form) return;
      if($id('forenseBox_formMotor')) return;
      const box=d.createElement('details'); box.id='forenseBox_formMotor'; box.className='forense-box'; box.innerHTML =
        '<summary>Forense (opcional)</summary>'
        + '<div class="forense-grid">'
        + '<label><input type="checkbox" id="flagEtiqueta_formMotor"> Etiqueta adulterada/ausente</label>'
        + '<label><input type="checkbox" id="flagCore_formMotor"> Core plug danificado/removido</label>'
        + '<label><input type="checkbox" id="flagBoss_formMotor"> Solda/corrosão anómala no boss</label>'
        + '<label><input type="checkbox" id="flagBloco_formMotor"> Remarcação no bloco</label>'
        + '<textarea id="forenseNotes_formMotor" rows="3" placeholder="Notas forenses…"></textarea>'
        + '</div>';
      const anchor=$id('motorPhoto'); (anchor&&anchor.parentElement)? anchor.parentElement.insertAdjacentElement('afterend', box) : form.appendChild(box);
    }
    async function sha256OfFile(file){
      try{ const buf=await file.arrayBuffer(); const hash=await crypto.subtle.digest('SHA-256', buf); return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join(''); }catch(e){ return null; }
    }
    function ts(x){ if(x==null) return 0; if(typeof x==='number') return x; if(/^\d+$/.test(String(x))) return Number(x); const t=Date.parse(x); return isNaN(t)?0:t; }
    function load(key){ try{ return JSON.parse(localStorage.getItem(key)||'[]'); }catch(e){ return []; } }
    function save(key, val){ try{ localStorage.setItem(key, JSON.stringify(val||[])); }catch(e){} }
    function attach(){
      setTimeout(async function(){
        const key=NAV.STORAGE.MOTOR_HISTORY; let arr=load(key); if(!arr.length) return;
        let idx=0, best=-1; for(let i=0;i<arr.length;i++){ const t=ts(arr[i].date||arr[i].dt||arr[i].time||arr[i].timestamp); if(t>=best){ best=t; idx=i; } }
        const photo=$id('motorPhoto'); const file=(photo&&photo.files&&photo.files[0])? photo.files[0]: null;
        const hash=file? await sha256OfFile(file): null;
        const flags=[];
        if($id('flagEtiqueta_formMotor')?.checked) flags.push('etiqueta');
        if($id('flagCore_formMotor')?.checked) flags.push('coreplug');
        if($id('flagBoss_formMotor')?.checked) flags.push('boss');
        if($id('flagBloco_formMotor')?.checked) flags.push('bloco');
        const notes=($id('forenseNotes_formMotor')?.value)||'';
        const rec=arr[idx]||{};
        const forense=(hash||flags.length||notes)? {hash,flags,notes}: null;
        if(forense){ rec.forense=forense; arr[idx]=rec; save(key, arr); }
      }, 0);
    }
    d.addEventListener('DOMContentLoaded', function(){
      ensureForenseUI();
      const form=$id('formMotor'); if(form) form.addEventListener('submit', attach);
    });
  })();

  d.addEventListener('DOMContentLoaded', wire);
})(window, document);
