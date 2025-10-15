(function(){
  const dict = {
    pt: {
      "win.title":"Validação de WIN / HIN",
      "win.input":"Número WIN/HIN",
      "win.notes":"Notas / Observações",
      "win.btn":"Validar",
      "win.save":"Guardar no histórico",
      "motor.title":"Validação de Motor",
      "motor.brand":"Marca",
      "motor.notes":"Notas / Observações",
      "motor.btn":"Validar",
      "motor.save":"Guardar no histórico",
      "hist.title":"Histórico"
    },
    en: {
      "win.title":"WIN / HIN Validation",
      "win.input":"WIN/HIN Number",
      "win.notes":"Notes / Remarks",
      "win.btn":"Validate",
      "win.save":"Save to history",
      "motor.title":"Engine Validation",
      "motor.brand":"Brand",
      "motor.notes":"Notes / Remarks",
      "motor.btn":"Validate",
      "motor.save":"Save to history",
      "hist.title":"History"
    }
  };
  const sel = document.getElementById('langSelect');
  function apply(lang){
    const t = dict[lang]||dict.pt;
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const k = el.getAttribute('data-i18n');
      if (t[k]) el.textContent = t[k];
    });
  }
  sel?.addEventListener('change', (e)=>{
    const lang = e.target.value;
    localStorage.setItem('IDMAR_LANG', lang);
    apply(lang);
  });
  const initial = localStorage.getItem('IDMAR_LANG') || (window.MIEC_CONFIG?.locale||'pt');
  if (sel) sel.value = initial;
  apply(initial);
})();
