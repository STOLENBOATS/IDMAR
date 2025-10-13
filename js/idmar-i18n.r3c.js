// IDMAR i18n r3c — aplica traduções por data-i18n e data-i18n-ph
(function(w,d){
  const dict = {
    pt: {
      'title.validator':'IDMAR — Validador',
      'title.hwin':'IDMAR — Histórico WIN',
      'title.hmotor':'IDMAR — Histórico Motor',
      'h.validator':'Validador',
      'h.win':'Validador WIN',
      'h.motor':'Validador Motor',
      'h.hwin':'Histórico — WIN',
      'h.hmotor':'Histórico — Motores',
      'lbl.win':'WIN / HIN',
      'lbl.brand':'Marca',
      'btn.validateWin':'Validar WIN',
      'btn.validateMotor':'Validar Motor',
      'btn.exportCsv':'Exportar CSV',
      'btn.clearWin':'Limpar histórico (WIN)',
      'btn.clearMotor':'Limpar histórico (Motor)',
      'th.when':'Quando','th.state':'Estado','th.reason':'Justificação',
      'th.photo':'Foto (nome)','th.thumb':'Miniatura',
      'th.sn':'S/N','th.brand':'Marca','th.model':'Modelo',
      'ph.search':'Pesquisar (WIN / texto)','ph.searchSn':'Pesquisar (S/N / marca)'
    },
    en: {
      'title.validator':'IDMAR — Validator',
      'title.hwin':'IDMAR — WIN History',
      'title.hmotor':'IDMAR — Engine History',
      'h.validator':'Validator',
      'h.win':'WIN Validator',
      'h.motor':'Engine Validator',
      'h.hwin':'History — WIN',
      'h.hmotor':'History — Engines',
      'lbl.win':'WIN / HIN',
      'lbl.brand':'Brand',
      'btn.validateWin':'Validate WIN',
      'btn.validateMotor':'Validate Engine',
      'btn.exportCsv':'Export CSV',
      'btn.clearWin':'Clear history (WIN)',
      'btn.clearMotor':'Clear history (Engine)',
      'th.when':'When','th.state':'Status','th.reason':'Reason',
      'th.photo':'Photo (name)','th.thumb':'Thumbnail',
      'th.sn':'S/N','th.brand':'Brand','th.model':'Model',
      'ph.search':'Search (WIN / text)','ph.searchSn':'Search (S/N / brand)'
    },
    es: {
      'title.validator':'IDMAR — Validador',
      'title.hwin':'IDMAR — Histórico WIN',
      'title.hmotor':'IDMAR — Histórico Motor',
      'h.validator':'Validador',
      'h.win':'Validador WIN',
      'h.motor':'Validador Motor',
      'h.hwin':'Historial — WIN',
      'h.hmotor':'Historial — Motores',
      'lbl.win':'WIN / HIN',
      'lbl.brand':'Marca',
      'btn.validateWin':'Validar WIN',
      'btn.validateMotor':'Validar Motor',
      'btn.exportCsv':'Exportar CSV',
      'btn.clearWin':'Limpiar historial (WIN)',
      'btn.clearMotor':'Limpiar historial (Motor)',
      'th.when':'Cuándo','th.state':'Estado','th.reason':'Justificación',
      'th.photo':'Foto (nombre)','th.thumb':'Miniatura',
      'th.sn':'S/N','th.brand':'Marca','th.model':'Modelo',
      'ph.search':'Buscar (WIN / texto)','ph.searchSn':'Buscar (S/N / marca)'
    },
    de: {
      'title.validator':'IDMAR — Prüfer',
      'title.hwin':'IDMAR — WIN-Verlauf',
      'title.hmotor':'IDMAR — Motor-Verlauf',
      'h.validator':'Prüfer',
      'h.win':'WIN Prüfer',
      'h.motor':'Motor Prüfer',
      'h.hwin':'Verlauf — WIN',
      'h.hmotor':'Verlauf — Motoren',
      'lbl.win':'WIN / HIN',
      'lbl.brand':'Marke',
      'btn.validateWin':'WIN prüfen',
      'btn.validateMotor':'Motor prüfen',
      'btn.exportCsv':'CSV exportieren',
      'btn.clearWin':'Verlauf löschen (WIN)',
      'btn.clearMotor':'Verlauf löschen (Motor)',
      'th.when':'Wann','th.state':'Status','th.reason':'Begründung',
      'th.photo':'Foto (Name)','th.thumb':'Miniatur',
      'th.sn':'S/N','th.brand':'Marke','th.model':'Modell',
      'ph.search':'Suchen (WIN / Text)','ph.searchSn':'Suchen (S/N / Marke)'
    }
  };

  function t(key, lang){ 
    const L = dict[lang] || dict.pt;
    return L[key] || dict.pt[key] || key;
  }

  function applyI18n(lang){
    // texto
    d.querySelectorAll('[data-i18n]').forEach(el=>{
      const k = el.getAttribute('data-i18n');
      el.textContent = t(k, lang);
    });
    // placeholder
    d.querySelectorAll('[data-i18n-ph]').forEach(el=>{
      const k = el.getAttribute('data-i18n-ph');
      el.setAttribute('placeholder', t(k, lang));
    });
    // title tag
    const title = d.querySelector('title[data-i18n]');
    if(title){
      const k = title.getAttribute('data-i18n');
      title.textContent = t(k, lang);
    }
  }

  function init(){
    let lang = 'pt';
    try { lang = localStorage.getItem('IDMAR_LANG') || 'pt'; } catch(e){}
    applyI18n(lang);
    // Se o seletor do header mudar o idioma, recarrega
    w.addEventListener('storage', (e)=>{
      if(e.key==='IDMAR_LANG'){ location.reload(); }
    });
  }

  if(d.readyState !== 'loading') init();
  else d.addEventListener('DOMContentLoaded', init);
})(window, document);
