
// js/hotfix-history-inject.js
(function(){
  if (!window.HistoryStore) {
    window.HistoryStore = {
      addWin(record){ const a = JSON.parse(localStorage.getItem("hist_win")||"[]"); a.unshift(record); localStorage.setItem("hist_win", JSON.stringify(a)); },
      addMotor(record){ const a = JSON.parse(localStorage.getItem("hist_motor")||"[]"); a.unshift(record); localStorage.setItem("hist_motor", JSON.stringify(a)); },
      allWin(){ return JSON.parse(localStorage.getItem("hist_win")||"[]"); },
      allMotor(){ return JSON.parse(localStorage.getItem("hist_motor")||"[]"); }
    };
  }
})();
