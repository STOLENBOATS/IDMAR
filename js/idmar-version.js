// Auto footer version injector (configurable)
// Pattern: "IDMAR - POLÍCIA MARÍTIMA - Vs XXX - YYYY-MM-DD"
(function(w,d){
  function today(){
    try{
      const dt = new Date();
      const y = dt.getFullYear();
      const m = String(dt.getMonth()+1).padStart(2,'0');
      const da = String(dt.getDate()).padStart(2,'0');
      return `${y}-${m}-${da}`;
    }catch(e){ return ''; }
  }
  function getVersion(){
    try{
      // Priority: explicit global -> localStorage -> data-attr on <html> -> fallback
      return (w.IDMAR_VERSION && String(w.IDMAR_VERSION).trim())
          || localStorage.getItem('IDMAR_VERSION')
          || d.documentElement.getAttribute('data-idmar-version')
          || 'Vs xxx';
    }catch(e){ return 'Vs xxx'; }
  }
  function label(){
    return `IDMAR - POLÍCIA MARÍTIMA - ${getVersion()} - ${today()}`;
  }
  function inject(){
    try {
      var f = d.getElementById('app-footer') || d.querySelector('footer');
      if(!f) return;
      // Preserve existing content; add a right-aligned small badge
      var wrap = d.createElement('div');
      wrap.style.display='flex'; wrap.style.justifyContent='space-between'; wrap.style.alignItems='center';
      var left = d.createElement('div'); left.innerHTML = f.innerHTML;
      var right = d.createElement('small'); right.textContent = label(); right.style.opacity='0.85';
      wrap.appendChild(left); wrap.appendChild(right);
      f.innerHTML=''; f.appendChild(wrap);
    } catch(e){}
  }
  if(d.readyState==='loading') d.addEventListener('DOMContentLoaded', inject); else inject();
})(window, document);
