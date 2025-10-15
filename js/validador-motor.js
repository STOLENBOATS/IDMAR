(function(){
  const brandSel = document.getElementById('brandSelect');
  const container = document.getElementById('brandFields');
  const result = document.getElementById('motorResult');

  const brandUIs = {
    yamaha(){
      return `
        <div class="field">
          <label for="snYamaha">S/N (Yamaha)</label>
          <input id="snYamaha" placeholder="ex.: 6ML N 1005843" />
        </div>
        <div class="field">
          <label for="mdlYamaha">Modelo</label>
          <input id="mdlYamaha" placeholder="ex.: F350NSA" />
        </div>`;
    },
    honda(){
      return `
        <div class="field">
          <label for="snHonda">S/N (Honda)</label>
          <input id="snHonda" placeholder="ex.: BAMJ-1234567" />
        </div>
        <div class="field">
          <label for="mdlHonda">Modelo</label>
          <input id="mdlHonda" placeholder="ex.: BF150D" />
        </div>`;
    }
  };

  function renderBrand(){
    const b = brandSel.value;
    container.innerHTML = (brandUIs[b] ? brandUIs[b]() : '<em>Marca sem campos definidos.</em>');
  }
  brandSel?.addEventListener('change', renderBrand);
  renderBrand();

  function validateMotor(){
    const b = brandSel.value;
    let value = '', issues = [];
    if (b==='yamaha'){
      value = (document.getElementById('snYamaha')?.value||'').trim();
      if (!value) issues.push('S/N vazio');
      if (!/[0-9]{5,}/.test(value)) issues.push('S/N sem série numérica longa');
    } else if (b==='honda'){
      value = (document.getElementById('snHonda')?.value||'').trim();
      if (!value) issues.push('S/N vazio');
      if (!/[0-9]{5,}/.test(value)) issues.push('S/N sem série numérica longa');
    }
    return { ok: issues.length===0, reason: issues.join('; '), brand:b, value };
  }

  function render(res){
    if (!res.ok) { result.innerHTML = `<strong style="color:#b91c1c;">INVÁLIDO</strong><br>${res.reason||'—'}`; return; }
    result.innerHTML = `<strong>Válido</strong><br><small>${res.brand.toUpperCase()} — ${res.value}</small>`;
  }

  document.getElementById('btnValidateMotor')?.addEventListener('click', ()=>{
    const r = validateMotor();
    render(r);
  });
  document.getElementById('btnSaveMotor')?.addEventListener('click', ()=>{
    const r = validateMotor();
    const notes = document.getElementById('motorNotes').value;
    window.HistoryService.addMotor({ brand:r.brand, value:r.value, ok:r.ok, reason:r.reason, notes, when:new Date().toLocaleString() });
    render(r);
    alert('Registado no histórico (Motor).');
  });
})();
