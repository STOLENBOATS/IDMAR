(function (w) {
  const KEY = "IDMAR_SESSION";
  function hasSession(){
    try { return !!JSON.parse(localStorage.getItem(KEY)); } catch { return false; }
  }
  function createDevSession(){
    const sess = { user:"dev@idmar", role:"tester", ts:Date.now() };
    localStorage.setItem(KEY, JSON.stringify(sess));
  }
  if (w.MIEC_CONFIG && w.MIEC_CONFIG.devAutologin && !hasSession()) createDevSession();

  // Enforce login on any page except login.html (works under subfolders like /IDMAR/login.html)
  var path = (location.pathname||"") + "";
  var isLogin = /(^|\/)login\.html?$/i.test(path);
  if (!hasSession() && !isLogin) {
    location.replace('login.html');
  }

  // Expose logout helper
  w.IDMAR = w.IDMAR || {};
  w.IDMAR.logout = function(){
    localStorage.removeItem(KEY);
    location.replace('login.html');
  };
})(window);
