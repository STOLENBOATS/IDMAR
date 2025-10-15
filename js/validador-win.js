(function(){
  const MONTH_MAP = {
    A:'Jan', B:'Fev', C:'Mar', D:'Abr', E:'Mai', F:'Jun', G:'Jul', H:'Ago', J:'Set', K:'Out', L:'Nov', M:'Dez',
    N:'Jan', P:'Fev', R:'Mar', S:'Abr', T:'Mai', U:'Jun', V:'Jul', W:'Ago', X:'Set', Y:'Out', Z:'Nov'
  };
  const FORBIDDEN = /[\s_@#$%&*+=!?;:.,\\/]/;

  function normalize(v){ return (v||'').toUpperCase().replace(/\s+/g,'').replace(/-(?=.)/,''); }
  function isAlpha(s){ return /^[A-Z]+$/.test(s); }
  function isAlnum(s){ return /^[A-Z0-9]+$/.test(s); }
  function explainUE(v){
    const seg = { country: v.slice(0,2), manufacturer: v.slice(2,5), series: v.slice(5,10), month: v[10], year: v[11], model: v.slice(12,14) };
    const monthOk = MONTH_MAP[seg.month] !== undefined;
    const issues = [];
    if (!isAlpha(seg.country)) issues.push('País inválido');
    if (!isAlpha(seg.manufacturer)) issues.push('Fabricante inválido');
    if (!isAlnum(seg.series)) issues.push('Série inválida');
    if (!monthOk) issues.push('Mês inválido (I,O,Q proibidos)');
    if (!/^[0-9]$/.test(seg.year)) issues.push('Ano (dígito) inválido');
    if (!/^[0-9]{2}$/.test(seg.model)) issues.push('Modelo (2 dígitos) inválido');
    return { seg, monthOk, issues };
  }
  function explainUS(v){
    const len = v.length;
    const seg = (len===14) ?
      { country:v.slice(0,2), manufacturer:v.slice(2,5), series:v.slice(5,12), month:v[12], year:v[13], model:'' } :
      { country:v.slice(0,2), manufacturer:v.slice(2,5), series:v.slice(5,12), month:v[12], year:v[13], model:v.slice(14,16) };
    const issues = [];
    if (!isAlpha(seg.country)) issues.push('País inválido');
    if (!isAlpha(seg.manufacturer)) issues.push('Fabricante inválido');
    if (!isAlnum(seg.series)) issues.push('Série inválida');
    if (MONTH_MAP[seg.month] === undefined) issues.push('Mês inválido (I,O,Q proibidos)');
    if (!/^[0-9]$/.test(seg.year)) issues.push('Ano (dígito) inválido');
    if (len===16 && !/^[0-9]{2}$/.test(seg.model)) issues.push('Modelo (2 dígitos) inválido');
    return { seg, issues };
  }

  function validateWIN(raw){
    const v = normalize(raw);
    if (!v) return { ok:false, reason:'Vazio', details:null };
    if (FORBIDDEN.test(v)) return { ok:false, reason:'Caracteres inválidos', details:null };
    if (v.length<14 || v.length>16 || v.length===15) return { ok:false, reason:`Comprimento inválido (${v.length})`, details:null };

    let details, ok = true, reason = 'Estrutura válida';
    if (v.length===14) {
      details = explainUE(v);
      if (details.issues.length) {
        const d2 = explainUS(v);
        if (d2.issues.length) { ok=false; reason = `Erros: ${d2.issues.join('; ')}`; details=d2; }
        else { details=d2; }
      }
    } else {
      details = explainUS(v);
      if (details.issues.length){ ok=false; reason = `Erros: ${details.issues.join('; ')}`; }
    }
    return { ok, reason, details, value:v };
  }

  function renderWIN(res){
    const box = document.getElementById('winResult');
    if (!res){ box.textContent = '—'; return; }
    if (!res.ok){ box.innerHTML = `<strong style="color:#b91c1c;">INVÁLIDO</strong><br>${res.reason}`; return; }
    const d = res.details.seg;
    const monthTxt = (d && d.month) ? ({"A":"Jan","B":"Fev","C":"Mar","D":"Abr","E":"Mai","F":"Jun","G":"Jul","H":"Ago","J":"Set","K":"Out","L":"Nov","M":"Dez","N":"Jan","P":"Fev","R":"Mar","S":"Abr","T":"Mai","U":"Jun","V":"Jul","W":"Ago","X":"Set","Y":"Out","Z":"Nov"}[d.month]||'?') : '?';
    box.innerHTML = `
      <div><strong>Válido</strong></div>
      <div><small>${res.value}</small></div>
      <hr>
      <div><strong>País:</strong> ${d.country} &nbsp; <strong>Fabricante:</strong> ${d.manufacturer}</div>
      <div><strong>Série:</strong> ${d.series||''}</div>
      <div><strong>Mês:</strong> ${d.month} (${monthTxt}) &nbsp; <strong>Ano:</strong> ${d.year}</div>
      <div><strong>Modelo:</strong> ${d.model||''}</div>
    `;
  }

  document.getElementById('btnValidateWIN')?.addEventListener('click', ()=>{
    const input = document.getElementById('winInput').value;
    const res = validateWIN(input);
    renderWIN(res);
  });
  document.getElementById('btnSaveWIN')?.addEventListener('click', ()=>{
    const input = document.getElementById('winInput').value;
    const notes = document.getElementById('winNotes').value;
    const res = validateWIN(input);
    window.HistoryService.addWIN({ value: res.value||input, ok: res.ok, reason: res.reason, notes, when: new Date().toLocaleString() });
    renderWIN(res);
    alert('Registado no histórico (WIN).');
  });
})();
