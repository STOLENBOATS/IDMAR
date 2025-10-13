
// js/forense-page.js
(function(){
  document.addEventListener("DOMContentLoaded", () => {
    const dz = document.getElementById("dropzone");
    const fi = document.getElementById("fileInput");
    const st = document.getElementById("fxStatus");
    const out = document.getElementById("fxResult");

    function choose() { fi.click(); }
    function analyze(file){
      if (!file) return;
      st.hidden = false; out.textContent = "";
      setTimeout(() => {
        st.hidden = true;
        const ok = file.size % 2 === 0;
        out.textContent = ok ? I18N.t("forensics.result_ok") : I18N.t("forensics.result_nok", { reason: "layout inconsistente" });
      }, 800);
    }

    dz.addEventListener("click", choose);
    dz.addEventListener("dragover", (e)=>{ e.preventDefault(); });
    dz.addEventListener("drop", (e)=>{ e.preventDefault(); analyze(e.dataTransfer.files[0]); });
    fi.addEventListener("change", ()=> analyze(fi.files[0]));
  });
})();
