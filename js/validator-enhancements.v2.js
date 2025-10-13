
// IDMAR validator addons v2 (forense PT/EN + Pre-1998 enrich + evidence thumbnail)
(function(){
  function enstyle(){ 
    if(!document.querySelector('style#idmar-en-style')){
      const st = document.createElement('style'); st.id='idmar-en-style';
      st.textContent = '.en{font-style:italic;opacity:.8} .mini-evidence{max-width:96px;max-height:64px;border:1px solid var(--border,#e5e7eb);border-radius:6px}';
      document.head.appendChild(st);
    }
  }
  function i18nForense(){
    // Left (WIN) panel
    document.querySelectorAll("details summary").forEach(sum => {
      if(/Forense/.test(sum.textContent) && !/Forensic/.test(sum.innerHTML)){
        sum.innerHTML = sum.textContent.replace("Forense (opcional)", 'Forense (opcional) / <span class="en">Forensic (optional)</span>');
      }
    });
    const labelMap = {
      "Rebites": 'Rebites / <span class="en">Rivets</span>',
      "Cordões de solda": 'Cordões de solda / <span class="en">Weld beads</span>',
      "Placa remarcada": 'Placa remarcada / <span class="en">Re‑stamped plate</span>',
      "Camadas de tinta/abrasões": 'Camadas de tinta/abrasões / <span class="en">Paint layers/abrasions</span>',
      "Etiqueta adulterada/ausente (motor)": 'Etiqueta adulterada/ausente (motor) / <span class="en">Tampered/missing label (engine)</span>',
      "Core plug danificado/removido": 'Core plug danificado/removido / <span class="en">Core plug damaged/removed</span>',
      "Solda/corrosão anómala": 'Solda/corrosão anómala / <span class="en">Abnormal weld/corrosion</span>',
      "Remarcação no bloco": 'Remarcação no bloco / <span class="en">Re‑mark on engine block</span>',
    };
    document.querySelectorAll("label").forEach(lab=>{
      const t = lab.textContent.trim();
      if(labelMap[t] && !/class="en"/.test(lab.innerHTML)){
        lab.innerHTML = labelMap[t];
      }
    });
    document.querySelectorAll("textarea, input[placeholder]").forEach(el=>{
      const ph = el.getAttribute("placeholder")||"";
      if(ph.includes("Notas forenses") && !/Forensic notes/.test(ph)){
        el.setAttribute("placeholder", "Notas forenses… / Forensic notes…");
      }
    });
  }

  // Monkey-patch interpretWIN and renderInterpretation if present
  function patchWIN(){
    const w = window;
    if (typeof w.interpretWIN !== "function" || typeof w.renderInterpretation !== "function") return;

    // Wrap interpretWIN to inject evidence + forensic checklist
    const _interpretWIN = w.interpretWIN;
    w.interpretWIN = function(win, opts){
      const info = _interpretWIN.call(this, win, opts||{});
      try{
        const winEl = document.getElementById("win");
        // nearest file input (left column)
        let file = null;
        if (winEl){
          const left = winEl.closest("section, form, div");
          const f = left && left.querySelector('input[type="file"]');
          if (f && f.files && f.files[0]) file = f.files[0];
        }
        if (file){
          info.photoName = file.name;
          try{ info.photoURL = URL.createObjectURL(file); }catch(e){}
        }
        // forensic checkboxes (left block)
        const checks = Array.from(document.querySelectorAll('details, .forense, .docce, form')).flatMap(sc=>Array.from(sc.querySelectorAll('input[type="checkbox"]:checked')));
        const flags = [];
        for (const ch of checks){
          const lab = ch.closest("label"); 
          const txt = lab ? lab.textContent.trim() : "";
          if (txt) flags.push(txt);
        }
        info.forensicFlags = flags.filter(Boolean);
      }catch(e){}
      return info;
    };

    // Wrap renderInterpretation to append pre‑1998 details & evidence
    const _renderInterpretation = w.renderInterpretation;
    w.renderInterpretation = function(info){
      _renderInterpretation.call(this, info);
      try{
        const tbody = document.getElementById("interpWinBody") || document.querySelector("#interpWinBody, table.interp tbody") || null;
        if(!tbody) return;
        function push(label, value, meaning){
          const tr = document.createElement("tr");
          tr.innerHTML = `<td>${label}</td><td>${value}</td><td>${meaning}</td>`;
          tbody.appendChild(tr);
        }
        if (info && info.pre98){
          push("Base legal","Avaliação pós‑construção (Diretiva 94/25/CE alterada por 2003/44/CE)",
               "Post‑construction assessment (EU RCD 94/25/EC amended by 2003/44/EC) — DoC/CE required");
          push("Regime","Pré‑1998","Pré‑1998 / <span class='en'>Pre‑1998</span>");
          const nb = (info.notifiedBody||"-");
          push("Organismo notificado", nb, `DoC/CE${nb && nb!=="-" ? " — "+nb : ""} / <span class='en'>DoC/CE</span>`);
        }
        if (info && info.photoName){
          let preview = info.photoName;
          if (info.photoURL){
            preview = `<div style="display:flex;gap:.5rem;align-items:center"><img class="mini-evidence" src="${info.photoURL}" alt="evidence"/><span>${info.photoName}</span></div>`;
          }
          push("Evidências", preview, "Fotografia / <span class='en'>Photo evidence</span>");
        }
        if (info && info.forensicFlags && info.forensicFlags.length){
          push("Checklist forense", info.forensicFlags.join(" • "), "Checklist forense / <span class='en'>Forensic checklist</span>");
        }
      }catch(e){}
    };
  }

  document.addEventListener("DOMContentLoaded", function(){
    enstyle();
    i18nForense();
    patchWIN();
  });
})();
