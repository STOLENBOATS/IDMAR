// js/session-gate.js
(function (w) {
  const KEY = "IDMAR_SESSION";

  function hasSession(){
    try { return !!JSON.parse(localStorage.getItem(KEY)); } catch { return false; }
  }

  // Detecta login mesmo com querystrings (login.html?x=1)
  const isLogin = /(^|\/)login\.html(\?.*)?$/i.test(
    (location.pathname || "") + (location.search || "")
  );

  // Bloqueia acesso se não houver sessão (só fora do login)
  if (!hasSession() && !isLogin) {
    location.replace('login.html');
    return;
  }

  // Helper global de logout (limpa ambos os storages)
  w.IDMAR = w.IDMAR || {};
  w.IDMAR.logout = function(){
    try { localStorage.removeItem(KEY); } catch {}
    try { sessionStorage.removeItem(KEY); } catch {}
    location.replace('login.html');
  };
})(window);
