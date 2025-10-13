/*! IDMAR theme r3 — default LIGHT + toggle */
(function(){
  try{
    // default para light se não houver preferências guardadas
    var pref = localStorage.getItem('idmar-theme');
    if(!pref){ pref = 'light'; localStorage.setItem('idmar-theme', pref); }
    document.documentElement.setAttribute('data-theme', pref);

    // helper de toggle
    window.IDMAR_setTheme = function(next){
      if(!next){ next = (localStorage.getItem('idmar-theme')==='dark') ? 'light' : 'dark'; }
      localStorage.setItem('idmar-theme', next);
      document.documentElement.setAttribute('data-theme', next);
    };

    // atalho: se existir um botão com idmar-theme-toggle, liga-o
    var btn = document.getElementById('idmar-theme-toggle');
    if(btn){ btn.addEventListener('click', function(){ IDMAR_setTheme(); }); }
  }catch(e){}
})();
