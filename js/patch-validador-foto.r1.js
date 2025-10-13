
/* IDMAR — patch-validador-foto.r1
   Redundância segura: após a submissão, se houver ficheiro nos inputs,
   chama o attach compat. (Não interfere se já correu forense-thumb.r1)
*/
(function(){
  const wait = (ms)=>new Promise(r=>setTimeout(r,ms));
  function byId(id){ return document.getElementById(id); }

  async function afterWinSubmit(){
    const inp = byId('winPhoto');
    if (inp && inp.files && inp.files[0]){
      await wait(30);
      window.ForenseAttachCompat?.attachWIN(inp.files[0]);
    }
  }
  async function afterMotorSubmit(){
    const inp = byId('motorPhoto');
    if (inp && inp.files && inp.files[0]){
      await wait(30);
      window.ForenseAttachCompat?.attachMotor(inp.files[0]);
    }
  }

  function bind(){
    const fWin = byId('formWin');
    const btnW = byId('btnWin');
    if (fWin) fWin.addEventListener('submit', ()=> setTimeout(afterWinSubmit, 0));
    if (btnW) btnW.addEventListener('click', ()=> setTimeout(afterWinSubmit, 0));

    const fM = byId('formMotor');
    const btnM = byId('btnMotor');
    if (fM) fM.addEventListener('submit', ()=> setTimeout(afterMotorSubmit, 0));
    if (btnM) btnM.addEventListener('click', ()=> setTimeout(afterMotorSubmit, 0));
  }

  if (document.readyState==='loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
