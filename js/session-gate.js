// js/session-gate.js
(function (w) {
  const KEY = "IDMAR_SESSION";

  function hasSession(){
    try { return !!JSON.parse(localStorage.getItem(KEY)); } catch { return false; }
  }
  function baseUrl(file){
    // ex.: /IDMAR/validador.html -> /IDMAR/ + file
    return (location.pathname.replace(/[^\/]+$/, '') || '/') + file;
  }

  // Detecta login mesmo com querystrings (login.html?x=1)
  const isLogin = /(^|\/)login\.html(\?.*)?$/i.test(
    (location.pathname || "") + (location.search || "")
  );

  // DEBUG (temporário)
  console.log('[GATE]', {
    path: location.pathname + (location.search||''),
    isLogin, hasSession: hasSession(),
    raw: localStorage.getItem(KEY)
  });

  // Bloqueia acesso se não houver sessão (só fora do login)
  if (!hasSession() && !isLogin) {
    const dest = baseUrl('login.html');
    console.log('[GATE] ->', dest);
    location.replace(dest);
    return;
  }

  // Helper global de logout (limpa ambos os storages)
  w.IDMAR = w.IDMAR || {};
  w.IDMAR.logout = function(){
    try { localStorage.removeItem(KEY); } catch {}
    try { sessionStorage.removeItem(KEY); } catch {}
    const dest = baseUrl('login.html');
    console.log('[GATE] logout ->', dest);
    location.replace(dest);
  };
})(window);
