// IDMAR — Histórico WIN (r3b) — filtros, ordenação, CSV, foto/miniatura, razão e forense
(function(w,d){
  w.IDMAR=w.IDMAR||{}; w.NAV=w.NAV||w.IDMAR;
  NAV.STORAGE = NAV.STORAGE || { SESSION:'IDMAR_SESSION', WIN_HISTORY:'hist_win', MOTOR_HISTORY:'hist_motor' };

  function ready(fn){ if(d.readyState==='loading'){ d.addEventListener('DOMContentLoaded', fn); } else { fn(); } }
  function load(key){ try{ return JSON.parse(localStorage.getItem(key)||'[]'); }catch(e){ return []; } }
  function save(key, val){ try{ localStorage.setItem(key, JSON.stringify(val||[])); }catch(e){} }
  function ts(x){ if(x==null) return 0; if(typeof x==='number') return x; if(/^[0-9]+$/.test(String(x))) return Number(x); var t=Date.parse(x); return isNaN(t)?0:t; }

  function $id(id){ return d.getElementById(id); }
  function findInput(){ return $id('hist_win_search') || d.querySelector('input[placeholder*="Pesquisar"], input[type="search"]'); }
  function findState(){ return $id('hist_win_state') || d.querySelector('select'); }
  function findFrom(){ return $id('hist_win_from') || d.querySelector('input[type="date"]:not([id$="to"])'); }
  function findTo(){ return $id('hist_win_to') || d.querySelectorAll('input[type="date"]')[1]; }
  function findTableBody(){ return $id('hist_win_tbody') || d.querySelector('table tbody'); }
  
  function trEN_WIN(pt){
    if(!pt) return '';
    const s=(''+pt).trim();
    // Common reasons
    if(/Estrutura v[aá]lida/i.test(s)) return s + ' / <span class="en">Structure valid</span>';
    if(/Ano de produ[cç][aã]o inconsistente/i.test(s)) return s + ' / <span class="en">Production year inconsistent</span>';
    if(/fora de 1998\+/i.test(s)) return s + ' / <span class="en">outside 1998+</span>';
    if(/Ano do modelo n[aã]o pode ser anterior/i.test(s)) return s + ' / <span class="en">Model year cannot be earlier</span>';
    if(/M[eê]s inv[aá]lido/i.test(s)) return s + ' / <span class="en">Invalid month</span>';
    if(/Tamanho inv[aá]lido/i.test(s)) return s + ' / <span class="en">Invalid length</span>';
    if(/Formato EUA n[aã]o admite 15/i.test(s)) return s + ' / <span class="en">US format does not allow 15</span>';
    if(/Caracteres inv[aá]lidos/i.test(s)) return s + ' / <span class="en">Invalid characters</span>';
    if(/Pa[ií]s inv[aá]lido/i.test(s)) return s + ' / <span class="en">Invalid country</span>';
    if(/Fabricante inv[aá]lido/i.test(s)) return s + ' / <span class="en">Invalid manufacturer</span>';
    if(/Ano do modelo fora do intervalo/i.test(s)) return s + ' / <span class="en">Model year out of range</span>';
    if(/Pr[eé]-?1998.*DoC\/CE/i.test(s)) return s + ' / <span class="en">Pre‑1998 with DoC/CE</span>';
    if(/Pr[eé]-?1998.*falta DoC\/CE/i.test(s)) return s + ' / <span class="en">Pre‑1998: missing DoC/CE</span>';
    return s + ' / <span class="en">' + s + '</span>';
  }
  function trStatePTEN(valid, pre98){
    if(pre98) return 'Pré‑1998 / <span class="en">Pre‑1998</span>';
    return valid ? 'Válido / <span class="en">Valid</span>' : 'Inválido / <span class="en">Invalid</span>';
  }

  function findCSV(){ return $id('hist_win_csv') || Array.from(d.querySelectorAll('button,input[type="button"]')).find(b=>/exportar/i.test(b.textContent||b.value||'')); }
  function findClear(){ return $id('hist_win_clear') || Array.from(d.querySelectorAll('button,input[type="button"]')).find(b=>/limpar/i.test(b.textContent||b.value||'')); }

  function applyFilters(data, q, state, from, to){
    const qn = (q||'').trim().toLowerCase();
    const fts = from? ts(from + (from.length<12?'T00:00:00':'')) : null;
    const tts = to?   ts(to   + (to.length<12?'T23:59:59':'')) : null;
    return data.filter(r=>{
      if(qn){
        const blob = (r.win||'') + ' ' + (r.reason||'');
        if(blob.toLowerCase().indexOf(qn)===-1) return false;
      }
      if(state==='ok' && !r.valid) return false;
      if(state==='bad' && r.valid) return false;
      const dt = ts(r.date||r.dt||r.time||r.when||r.timestamp||r.createdAt);
      if(fts!=null && dt<fts) return false;
      if(tts!=null && dt>tts) return false;
      return true;
    });
  }

  function render(){
    const key = NAV.STORAGE.WIN_HISTORY;
    const raw = load(key);
    const tbody = findTableBody();
    if(!tbody) return;

    const input = findInput();
    const stateSel = findState();
    const from = findFrom();
    const to = findTo();
    const q = input && input.value || '';
    let state = stateSel && stateSel.value || 'all';
    if(/válido/i.test(state) || /valid/i.test(state)) state = 'ok';
    if(/inválido/i.test(state) || /invalid/i.test(state)) state = 'bad';

    const sorted = [...raw].sort((a,b)=> ts(b.date||b.dt||b.time||b.timestamp)-ts(a.date||a.dt||a.time||a.timestamp));
    const data = applyFilters(sorted, q, state, from && from.value, to && to.value);

    tbody.innerHTML='';
    data.forEach(r=>{
      const dtxt = new Date(ts(r.date||r.dt||r.time||r.timestamp)).toLocaleString();
      const state = r.valid ? '<span class="badge good">Válido</span>' : '<span class="badge bad">Inválido</span>';
      const reason = r.reason || '';
      const photo = r.photoName || '';
      const thumb = r.photoData ? '<img src="'+r.photoData+'" alt="" style="height:44px;border-radius:6px;border:1px solid var(--border)">' : '';
      const forIcon = r.forense ? ' 🔍' : '';
      const tr = d.createElement('tr');
      tr.innerHTML = '<td>'+dtxt+'</td>'
                   + '<td>'+ (r.win||'') + forIcon + '</td>'
                   + '<td>'+ trStatePTEN(!!r.valid, !!r.pre98) + '</td>' + '<td>'+ trEN_WIN(reason) + '</td>'
                   + '<td>'+photo+'</td>'
                   + '<td>'+thumb+'</td>';
      if(r.forense){ tr.title = 'Forense: ' + JSON.stringify(r.forense); }
      tbody.appendChild(tr);
    });
  }

  function toCSV(rows){
    const esc=v=>(''+(v==null?'':v)).replace(/"/g,'""');
    const header=['date','win','valid','reason','photoName','forense.hash','forense.flags','forense.notes'];
    const lines=[header.join(',')];
    rows.forEach(r=>{
      const line=[
        r.date||r.dt||r.time||r.timestamp||'',
        r.win||'',
        r.valid?'1':'0',
        r.reason||'',
        r.photoName||'',
        (r.forense && r.forense.hash)||'',
        (r.forense && Array.isArray(r.forense.flags)? r.forense.flags.join('|') : ''),
        (r.forense && r.forense.notes)||''
      ].map(esc).map(v=>'"'+v+'"').join(',');
      lines.push(line);
    });
    return lines.join('\r\n');
  }

  function wire(){
    const input = findInput(); const stateSel = findState(); const from = findFrom(); const to = findTo();
    if(input) input.addEventListener('input', render);
    if(stateSel) stateSel.addEventListener('change', render);
    if(from) from.addEventListener('change', render);
    if(to) to.addEventListener('change', render);
    const csvBtn = findCSV();
    if(csvBtn) csvBtn.addEventListener('click', function(e){
      e.preventDefault();
      const all = load(NAV.STORAGE.WIN_HISTORY);
      const sorted = [...all].sort((a,b)=> ts(b.date||b.dt||b.time||b.timestamp)-ts(a.date||a.dt||a.time||a.timestamp));
      const csv = toCSV(sorted);
      const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
      const url = URL.createObjectURL(blob);
      const a = d.createElement('a'); a.href=url; a.download='historico_win.csv'; a.click();
      URL.revokeObjectURL(url);
    });
    const clrBtn = findClear();
    if(clrBtn) clrBtn.addEventListener('click', function(e){
      e.preventDefault();
      if(confirm('Limpar histórico WIN? Esta ação é irreversível.')){ save(NAV.STORAGE.WIN_HISTORY, []); render(); }
    });
  }

  ready(function(){ wire(); render(); });
})(window, document);
