
// js/validador-page.js
(function(){
  function validHIN(value){
    return (value||"").trim().length >= 12;
  }
  function validEngineSN(value){
    return (value||"").trim().length >= 6;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const hin = document.getElementById("hinwin");
    const btnV = document.getElementById("btnValidate");
    const msg = document.getElementById("valMsg");

    btnV?.addEventListener("click", () => {
      const value = hin.value.trim();
      if (validHIN(value)){
        msg.textContent = I18N.t("validator.ok");
        window.HistoryStore && window.HistoryStore.addWin({ ts: Date.now(), value, ok: true });
      } else {
        msg.textContent = I18N.t("validator.nok", { reason: "comprimento insuficiente" });
        window.HistoryStore && window.HistoryStore.addWin({ ts: Date.now(), value, ok: false, reason: "len" });
      }
    });

    const brand = document.getElementById("brand");
    const sn = document.getElementById("engineSN");
    const btnE = document.getElementById("btnEngine");
    const emsg = document.getElementById("engMsg");

    btnE?.addEventListener("click", () => {
      const value = sn.value.trim();
      if (validEngineSN(value)){
        emsg.textContent = I18N.t("validator.saved");
        window.HistoryStore && window.HistoryStore.addMotor({ ts: Date.now(), brand: brand.value, sn: value, ok: true });
      } else {
        emsg.textContent = I18N.t("engine.nok", { reason: "comprimento insuficiente" });
        window.HistoryStore && window.HistoryStore.addMotor({ ts: Date.now(), brand: brand.value, sn: value, ok: false, reason: "len" });
      }
    });
  });
})();
