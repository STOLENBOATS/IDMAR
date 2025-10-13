
// js/historico-win-page.js
(function(){
  function fmt(ts){
    const d = new Date(ts);
    return d.toLocaleString();
  }
  function render(){
    const root = document.getElementById("histTable");
    const empty = document.getElementById("histEmpty");
    const items = (window.HistoryStore && window.HistoryStore.allWin()) || [];
    if (!items.length){ empty.hidden = false; root.innerHTML = ""; return; }
    empty.hidden = true;
    const rows = items.map(r => `<tr><td>${fmt(r.ts)}</td><td>${(r.value||"")}</td><td>${r.ok?"OK":"NOK"}</td><td>${r.reason||""}</td></tr>`).join("");
    root.innerHTML = `<table><thead><tr><th>Data</th><th>WIN/HIN</th><th>Estado</th><th>Motivo</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
  document.addEventListener("DOMContentLoaded", render);
})();
