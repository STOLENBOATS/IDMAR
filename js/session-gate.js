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

  const isLogin = /(^|\/)login\.html?$/.test(location.pathname) || location.pathname === '/';
  if (!hasSession() && !isLogin) {
    location.replace('login.html');
  }

  w.IDMAR = w.IDMAR || {};
  w.IDMAR.logout = function(){
    localStorage.removeItem(KEY);
    location.replace('login.html');
  };
})(window);
