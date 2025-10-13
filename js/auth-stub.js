
// auth-stub.js — neutral; no real session.
window.IDMAR_AUTH = (function(){
  const api = {};
  api.getSession = async () => null;
  document.dispatchEvent(new CustomEvent("idmar:auth-ready", { detail: { session: null } }));
  return api;
})();
