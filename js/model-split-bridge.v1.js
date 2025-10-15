(function(){
  // Replace with your real model tables per brand
  var DATA = {
    yamaha: { "F350": ["F350N", "F350NSA", "F350U"], "F150": ["F150A", "F150D"] },
    honda:  { "BF150": ["BF150A", "BF150D"], "BF90":  ["BF90A", "BF90D"] }
  };
  function byId(id){ return document.getElementById(id); }
  var brandSel = byId('brandSelect');
  var baseSel  = byId('modelBaseList');
  var varSel   = byId('modelVariantList');
  function populateBase(){
    if (!brandSel || !baseSel) return;
    var brand = (brandSel.value||'').toLowerCase();
    var models = Object.keys(DATA[brand] || {});
    baseSel.innerHTML = models.map(function(m){ return '<option value="'+m+'">'+m+'</option>'; }).join('');
    populateVariant();
  }
  function populateVariant(){
    if (!brandSel || !baseSel || !varSel) return;
    var brand = (brandSel.value||'').toLowerCase();
    var base  = baseSel.value||'';
    var vars  = (DATA[brand] && DATA[brand][base]) || [];
    varSel.innerHTML = vars.map(function(v){ return '<option value="'+v+'">'+v+'</option>'; }).join('');
  }
  function init(){
    if (!brandSel || !baseSel || !varSel) return;
    brandSel.addEventListener('change', populateBase);
    baseSel.addEventListener('change', populateVariant);
    populateBase();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();