// IDMAR history bilingual enhancer v3 (unchanged from v3)
(function(){
  const mapReason = [
    [/^Estrutura válida\.?$/i, "Structure valid"],
    [/Ano de produção inconsistente/i, "Production year inconsistent"],
    [/fora de 1998\+/i, "outside 1998+"],
    [/Ano do modelo não pode ser anterior/i, "Model year cannot be earlier than production year"],
    [/M[eê]s inválido/i, "Invalid month code"],
    [/Tamanho inválido/i, "Invalid length"],
    [/Formato EUA não admite 15/i, "US format does not allow 15"],
    [/Caracteres inválidos/i, "Invalid characters"],
    [/Pa[ií]s inválido/i, "Invalid country code"],
    [/Fabricante inválido/i, "Invalid manufacturer code"],
    [/Ano do modelo fora do intervalo/i, "Model year out of allowed range"],
    [/Pré-?1998.*DoC\/CE/i, "Pre‑1998 with DoC/CE"],
    [/Pré-?1998.*falta DoC\/CE/i, "Pre‑1998: missing DoC/CE"],
  ];
  function trStatePTEN(text){
    const s = (text||"").toString().trim().toLowerCase();
    if (s.includes("pré-1998") || s.includes("pre-1998")) return 'Pré‑1998 / <span class="en">Pre‑1998</span>';
    if (s.includes("válido")) return 'Válido / <span class="en">Valid</span>';
    if (s.includes("inválido")) return 'Inválido / <span class="en">Invalid</span>';
    return text;
  }
  function trReasonPTEN(text){
    if(!text) return "";
    const s = (""+text).trim();
    for(const [re,en] of mapReason){
      if(re.test(s)) return s + ' / <span class="en">'+ en +'</span>';
    }
    return s + ' / <span class="en">'+ s +'</span>';
  }
  function patchTable(tbl){
    if(!tbl) return;
    const rows = tbl.querySelectorAll("tbody tr");
    rows.forEach(tr => {
      const tds = tr.querySelectorAll("td");
      if(tds.length < 5) return;
      const idxState = Array.from(tds).findIndex(td => /válido|inválido|pré-1998/i.test(td.textContent));
      if(idxState >= 0){
        tds[idxState].innerHTML = trStatePTEN(tds[idxState].textContent);
        if (tds[idxState+1]) tds[idxState+1].innerHTML = trReasonPTEN(tds[idxState+1].textContent);
      }
    });
  }
  function tryPatch(){ document.querySelectorAll("table").forEach(patchTable); }
  const obs = new MutationObserver(tryPatch);
  window.addEventListener("DOMContentLoaded", ()=>{ tryPatch(); obs.observe(document.body, {subtree:true, childList:true}); });
})();