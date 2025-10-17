
(function(w,d){
  var isAndroid = /Android/i.test(navigator.userAgent||'');
  function isPortrait(){ return w.matchMedia && w.matchMedia("(orientation: portrait)").matches; }
  function ensure(){
    var el=d.getElementById('idmar-rotate-overlay');
    if(!el){
      el=d.createElement('div'); el.id='idmar-rotate-overlay'; el.setAttribute('role','dialog'); el.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.75);display:none;z-index:2147483647;color:#fff';
      el.innerHTML='<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:2rem">'+
      '<div style="max-width:520px;width:100%;background:#0b2440;border:1px solid rgba(255,255,255,.2);border-radius:14px;padding:1.25rem;box-shadow:0 10px 25px rgba(0,0,0,.35)">'+
      '<h3 style="margin:0 0 .5rem 0">Melhor em horizontal / Best viewed in landscape</h3>'+
      '<p style="margin:.25rem 0 1rem 0;opacity:.9">Estás em Android em modo vertical. Roda o ecrã para <b>horizontal</b>.<br>You are on Android in portrait. Please rotate to <b>landscape</b>.</p>'+
      '<div style="display:flex;gap:.5rem;justify-content:flex-end"><button id="idmar-rotate-ok" style="background:#66c2ff;border:0;padding:.5rem .9rem;border-radius:10px;color:#001b33;cursor:pointer">Já rodei / I rotated</button></div>'+
      '</div></div>';
      d.body.appendChild(el);
      d.getElementById('idmar-rotate-ok').addEventListener('click', check);
    }
    return el;
  }
  function show(){ ensure().style.display='block'; }
  function hide(){ var el=d.getElementById('idmar-rotate-overlay'); if(el) el.style.display='none'; }
  function check(){ if(isAndroid && isPortrait()) show(); else hide(); }
  w.addEventListener('resize', check, {passive:true});
  w.addEventListener('orientationchange', check, {passive:true});
  if (d.readyState!=='loading') check(); else d.addEventListener('DOMContentLoaded', check);
})(window, document);
