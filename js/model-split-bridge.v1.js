(function(){
  const DATA = {
    yamaha: {
      "F350": ["F350N", "F350NSA", "F350U"],
      "F150": ["F150A", "F150D"]
    },
    honda: {
      "BF150": ["BF150A", "BF150D"],
      "BF90":  ["BF90A", "BF90D"]
    }
  };

  const brandSel = document.getElementById('brandSelect');
  const baseSel  = document.getElementById('modelBaseList');
  const varSel   = document.getElementById('modelVariantList');

  function populateBase(){
    const brand = brandSel.value;
    const models = Object.keys(DATA[brand] || {});
    baseSel.innerHTML = models.map(m => `<option value="${m}">${m}</option>`).join('');
    populateVariant();
  }

  function populateVariant(){
    const brand = brandSel.value;
    const base  = baseSel.value;
    const vars  = (DATA[brand] && DATA[brand][base]) || [];
    varSel.innerHTML = vars.map(v => `<option value="${v}">${v}</option>`).join('');
  }

  brandSel?.addEventListener('change', populateBase);
  baseSel?.addEventListener('change', populateVariant);

  populateBase();
})();
