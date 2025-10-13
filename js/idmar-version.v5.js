// idmar-version.v5.js — footer text/label injector
(function(w,d){
  function today(){ const dt=new Date(); const y=dt.getFullYear(), m=String(dt.getMonth()+1).padStart(2,'0'), da=String(dt.getDate()).padStart(2,'0'); return `${y}-${m}-${da}`; }
  function label(){
    if (w.IDMAR_FOOTER_TEXT && String(w.IDMAR_FOOTER_TEXT).trim()) return String(w.IDMAR_FOOTER_TEXT);
    var ver = (w.IDMAR_VERSION && String(w.IDMAR_VERSION).trim()) || 'Vs xxx';
    return `IDMAR - POLÍCIA MARÍTIMA - ${ver} - ${today()}`;
  }
  function inject(){
    try{
      var f = d.getElementById('app-footer') || d.querySelector('footer');
      if(!f) return;
      var wrap = d.createElement('div');
      wrap.style.display='flex'; wrap.style.justifyContent='space-between'; wrap.style.alignItems='center';
      var left = d.createElement('div'); left.innerHTML = f.innerHTML;
      var right = d.createElement('small'); right.textContent = label(); right.style.opacity='0.9';
      f.innerHTML=''; wrap.appendChild(left); wrap.appendChild(right); f.appendChild(wrap);
    }catch(e){}
  }
  if(d.readyState==='loading') d.addEventListener('DOMContentLoaded', inject); else inject();
})(window, document);
