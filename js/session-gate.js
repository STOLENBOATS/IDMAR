// js/session-gate.js  (apenas este bloco muda)
(function (w) {
  const KEY = "IDMAR_SESSION";
  // ... (resto do ficheiro igual)

  function baseUrl(file){
    return (location.pathname.replace(/[^\/]+$/, '') || '/') + file;
  }

  w.IDMAR = w.IDMAR || {};
  w.IDMAR.logout = function(){
    try { localStorage.removeItem(KEY); } catch {}
    try { sessionStorage.removeItem(KEY); } catch {}
    // força logout “sem falhas” e evita SW/relativos
    location.replace(baseUrl('login.html?logout=1'));
  };
})(window);

