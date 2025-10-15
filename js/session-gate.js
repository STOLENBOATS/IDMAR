// js/session-gate.js
(function (w) {
  const KEY = "IDMAR_SESSION";

  function hasSession(){
    try { return !!JSON.parse(localStorage.getItem(KEY)); } catch { return false; }
  }
  function createDevSession(){
    const sess = { user:"dev@idmar", role:"tester", ts:Date.now() };
    localStorage.setItem(KEY, JSON.stringify(sess));
  }
  if (w.MIEC_CONFIG?.devAutologin && !hasSession()) createDevSession();

  // funciona em subpastas (ex.: /IDMAR/login.html)
  const path = (location.pathname || "") + "";
  const isLogin = /(^|\/)login\.html?$/i.test(path);
  if (!hasSession() && !isLogin) {
    location.replace('login.html');
  }

  // helper global para terminares sessão em qualquer página
  w.IDMAR = w.IDMAR || {};
  w.IDMAR.logout = function(){
    localStorage.removeItem(KEY);
    location.replace('login.html');
  };
})(window);
