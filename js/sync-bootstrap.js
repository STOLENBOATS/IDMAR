
// js/sync-bootstrap.js
(function(){
  const onReady = async () => {
    try {
      const session = (window.IDMAR_AUTH && await window.IDMAR_AUTH.getSession()) || null;
      if (!window.HistoryService) window.HistoryService = { startAutoSync(){ console.log("[HistoryService] auto-sync noop"); } };
      if (session) {
        console.log("[sync-bootstrap] session OK → startAutoSync");
        window.HistoryService.startAutoSync();
        toast("toast.syncOn");
      } else {
        console.log("[sync-bootstrap] no session → offline");
        toast("toast.syncOff");
      }
    } catch(e) {
      console.warn("[sync-bootstrap] error", e);
    }
  };

  function toast(key){
    const msg = (window.I18N && window.I18N.t(key)) || key;
    console.log(msg);
  }

  document.addEventListener("idmar:auth-ready", onReady, { once: true });
  setTimeout(onReady, 800);
})();
