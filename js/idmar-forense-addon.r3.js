// IDMAR — Forense Add-on (r3)
// Uso: incluir DEPOIS dos validadores (win & motor).
// - Injeta UI "Forense (opcional)" nos formulários de WIN e Motor.
// - Captura flags + notas e, se existir foto, calcula SHA-256 do ficheiro.
// - Anexa {forense:{hash,flags,notes}} ao registo MAIS RECENTE do histórico correspondente.
// - À prova de ordem de includes e de ausências de elementos.

(function(w,d){
  // Bootstrap mínimo
  w.IDMAR = w.IDMAR || {}; w.NAV = w.NAV || w.IDMAR;
  NAV.STORAGE = NAV.STORAGE || { SESSION:'IDMAR_SESSION', WIN_HISTORY:'hist_win', MOTOR_HISTORY:'hist_motor' };

  function ready(fn){ if(d.readyState==='loading'){ d.addEventListener('DOMContentLoaded', fn); } else { fn(); } }
  function qs(sel, root){ return (root||d).querySelector(sel); }
  function jget(key, def){ try{ var v = localStorage.getItem(key); return v? JSON.parse(v): (def||[]); }catch(e){ return def||[]; } }
  function jset(key, val){ try{ localStorage.setItem(key, JSON.stringify(val)); }catch(e){} }

  // SHA-256 do ficheiro (ou null)
  async function sha256OfFile(file){
    try{
      if(!file) return null;
      const buf = await file.arrayBuffer();
      if (w.crypto && w.crypto.subtle && w.crypto.subtle.digest){
        const hash = await w.crypto.subtle.digest('SHA-256', buf);
        return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,'0')).join('');
      } else {
        // Fallback (lento) em JS puro
        let h = 0; const u8 = new Uint8Array(buf);
        for(let i=0;i<u8.length;i++){ h = ((h<<5)-h) + u8[i]; h|=0; }
        return 'js-fallback-' + (h>>>0).toString(16);
      }
    }catch(e){ return null; }
  }

  // Encontra a melhor chave de histórico
  function bestHistoryKey(kind){
    try{
      if(kind==='win') return (NAV && NAV.STORAGE && NAV.STORAGE.WIN_HISTORY) || 'hist_win';
      return (NAV && NAV.STORAGE && NAV.STORAGE.MOTOR_HISTORY) || 'hist_motor';
    }catch(e){ return kind==='win' ? 'hist_win' : 'hist_motor'; }
  }

  // Escolhe o registo mais recente (por data ou por posição 0)
  function pickMostRecent(arr){
    if(!Array.isArray(arr) || !arr.length) return null;
    // Tentativa 1: assume ordem por unshift (mais recente = arr[0])
    const a0 = arr[0];
    // Verifica se há datas válidas; se sim, escolhe a de maior timestamp
    let bestIdx = 0, bestTs = -1, foundTs=false;
    for(let i=0;i<arr.length;i++){
      const r = arr[i]||{};
      const d = r.date || r.dt || r.time || r.when || r.timestamp || r.createdAt;
      const t = (typeof d==='number') ? d : Date.parse(d||'');
      if(!isNaN(t)){ foundTs=true; if(t>bestTs){ bestTs=t; bestIdx=i; } }
    }
    return foundTs ? arr[bestIdx] : a0;
  }

  // Cria/garante UI de forense no form
  function ensureForenseUI(kind, formEl, anchorId){
    if(!formEl) return null;
    var boxId = 'forenseBox_'+(formEl.id||kind);
    if(d.getElementById(boxId)) return d.getElementById(boxId);

    var flagsHtml = (kind==='win')
      ? '<label><input type="checkbox" id="flag_rebites_'+(formEl.id||kind)+'"> Rebites (heads/spacing)</label>'
        + '<label><input type="checkbox" id="flag_solda_'+(formEl.id||kind)+'"> Cordões de solda</label>'
        + '<label><input type="checkbox" id="flag_placa_'+(formEl.id||kind)+'"> Placa remarcada</label>'
        + '<label><input type="checkbox" id="flag_tinta_'+(formEl.id||kind)+'"> Camadas de tinta/abrasões</label>'
      : '<label><input type="checkbox" id="flag_etiqueta_'+(formEl.id||kind)+'"> Etiqueta adulterada/ausente</label>'
        + '<label><input type="checkbox" id="flag_core_'+(formEl.id||kind)+'"> Core plug danificado/removido</label>'
        + '<label><input type="checkbox" id="flag_boss_'+(formEl.id||kind)+'"> Boss/cola/solda anómala</label>'
        + '<label><input type="checkbox" id="flag_bloco_'+(formEl.id||kind)+'"> Remarcação no bloco</label>';

    var box = d.createElement('details');
    box.id = boxId;
    box.className = 'forense-box';
    box.open = false;
    box.style.marginTop = '0.6rem';
    box.style.border = '1px solid var(--border,#e5e7eb)';
    box.style.borderRadius = '12px';
    box.style.padding = '0.8rem 1rem';
    box.style.background = 'var(--bg-elev,#fff)';
    box.innerHTML = '<summary>Forense (opcional)</summary>'
                  + '<div class="forense-grid" style="display:grid;gap:.5rem;grid-template-columns:repeat(auto-fit,minmax(240px,1fr))">'
                  + flagsHtml
                  + '</div>'
                  + '<div style="margin-top:.5rem"><textarea id="forense_notes_'+(formEl.id||kind)+'" rows="3" placeholder="Notas forenses…"></textarea></div>';

    // Inserção
    var anchor = anchorId && d.getElementById(anchorId);
    if(anchor && anchor.parentElement) anchor.parentElement.insertAdjacentElement('afterend', box);
    else formEl.appendChild(box);

    return box;
  }

  // Colhe flags+notas do form
  function collectForense(kind, formEl){
    var suf = (formEl.id||kind);
    var flags = [];
    function c(id){ var el=d.getElementById(id+'_'+suf); return !!(el && el.checked); }
    if(kind==='win'){
      if(c('flag_rebites')) flags.push('rebites');
      if(c('flag_solda'))   flags.push('solda');
      if(c('flag_placa'))   flags.push('placa');
      if(c('flag_tinta'))   flags.push('tinta');
    }else{
      if(c('flag_etiqueta')) flags.push('etiqueta');
      if(c('flag_core'))     flags.push('coreplug');
      if(c('flag_boss'))     flags.push('boss');
      if(c('flag_bloco'))    flags.push('bloco');
    }
    var notesEl = d.getElementById('forense_notes_'+suf);
    var notes = notesEl ? (notesEl.value||'') : '';
    return { flags:flags, notes:notes };
  }

  // Anexa forense ao último registo do histórico
  function attachForense(kind, fileInput, payload){
    try{
      var key = bestHistoryKey(kind);
      var arr = jget(key, []);
      if(!arr.length) return; // nada para anexar
      var rec = pickMostRecent(arr); if(!rec) return;
      rec.forense = payload;
      jset(key, arr);
    }catch(e){}
  }

  ready(function(){
    // WIN
    var formWin   = d.getElementById('winForm') || d.getElementById('formWin') || qs('form[data-form="win"]');
    var winPhoto  = d.getElementById('winPhoto') || qs('#winForm input[type="file"]');
    if(formWin){
      ensureForenseUI('win', formWin, 'winPhoto');
      formWin.addEventListener('submit', async function(){
        try{
          var base = collectForense('win', formWin);
          var file = (winPhoto && winPhoto.files && winPhoto.files[0]) ? winPhoto.files[0] : null;
          var hash = await sha256OfFile(file);
          var payload = (hash || base.flags.length || base.notes) ?
                        { hash:hash, flags:base.flags, notes:base.notes } : null;
          if(payload) attachForense('win', winPhoto, payload);
        }catch(e){}
      });
    }

    // MOTOR
    var formMotor = d.getElementById('motorForm') || d.getElementById('formMotor') || qs('form[data-form="motor"]');
    var motorPhoto= d.getElementById('motorPhoto') || qs('#motorForm input[type="file"]');
    if(formMotor){
      ensureForenseUI('motor', formMotor, 'motorPhoto');
      formMotor.addEventListener('submit', async function(){
        try{
          var base = collectForense('motor', formMotor);
          var file = (motorPhoto && motorPhoto.files && motorPhoto.files[0]) ? motorPhoto.files[0] : null;
          var hash = await sha256OfFile(file);
          var payload = (hash || base.flags.length || base.notes) ?
                        { hash:hash, flags:base.flags, notes:base.notes } : null;
          if(payload) attachForense('motor', motorPhoto, payload);
        }catch(e){}
      });
    }
  });
})(window, document);
