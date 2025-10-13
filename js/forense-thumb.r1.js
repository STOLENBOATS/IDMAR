
/* IDMAR — forense-thumb.r1
   Gera thumbnail base64 (<=320px) quando anexas ficheiro no Validador ou Forense.
   Requer: ForenseAttachCompat (para guardar no histórico).
*/
(function(){
  function byId(id){ return document.getElementById(id); }

  function hookValidators(){
    const wFile = byId('winPhoto');
    const wBtn  = byId('btnWin') || document.querySelector('#formWin button[type="submit"]');
    if (wFile && wBtn){
      wBtn.addEventListener('click', ()=>{
        const f=wFile.files&&wFile.files[0];
        if (f) setTimeout(()=>window.ForenseAttachCompat?.attachWIN(f), 30);
      });
    }
    const mFile = byId('motorPhoto');
    const mForm = byId('formMotor');
    const mBtn  = byId('btnMotor') || (mForm && mForm.querySelector('button[type="submit"]'));
    if (mFile && (mForm || mBtn)){
      (mForm||mBtn).addEventListener('submit', ()=>{
        const f=mFile.files&&mFile.files[0];
        if (f) setTimeout(()=>window.ForenseAttachCompat?.attachMotor(f), 30);
      });
      if (mBtn) mBtn.addEventListener('click', ()=>{
        const f=mFile.files&&mFile.files[0];
        if (f) setTimeout(()=>window.ForenseAttachCompat?.attachMotor(f), 30);
      });
    }
  }

  function hookForense(){
    const up = document.getElementById('forensePick') ||
               document.querySelector('input[type="file"]#evidenceFile') ||
               document.querySelector('input[type="file"][data-forense]') ||
               document.querySelector('input[type="file"]');
    if (!up) return;

    const ctxSel = document.querySelector('select#contexto, select[name="contexto"]');
    function guessKind(){
      const v = (ctxSel && (ctxSel.value||'').toLowerCase()) || '';
      if (v.includes('win')) return 'WIN';
      if (v.includes('motor')) return 'MOTOR';
      return 'WIN';
    }

    up.addEventListener('change', ()=>{
      const f = up.files && up.files[0];
      if (!f) return;
      const kind = guessKind();
      if (kind==='WIN') window.ForenseAttachCompat?.attachWIN(f);
      else window.ForenseAttachCompat?.attachMotor(f);
    });
  }

  if (document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', ()=>{ hookValidators(); hookForense(); });
  } else { hookValidators(); hookForense(); }
})();
