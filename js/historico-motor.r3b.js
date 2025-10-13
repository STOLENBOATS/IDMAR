// IDMAR — Histórico MOTOR (r3b) — filtros, ordenação, CSV, miniatura e forense
(function(w,d){
  w.IDMAR=w.IDMAR||{}; w.NAV=w.NAV||w.IDMAR;
  NAV.STORAGE = NAV.STORAGE || { SESSION:'IDMAR_SESSION', WIN_HISTORY:'hist_win', MOTOR_HISTORY:'hist_motor' };

  function ready(fn){ if(d.readyState==='loading'){ d.addEventListener('DOMContentLoaded', fn); } else { fn(); } }
  function load(key){ try{ return JSON.parse(localStorage.getItem(key)||'[]'); }catch(e){ return []; } }
  function save(key, val){ try{ localStorage.setItem(key, JSON.stringify(val||[])); }catch(e){} }
  function ts(x){ if(x==null) return 0; if(typeof x==='number') return x; if(/^[0-9]+$/.test(String(x))) return Number(x); var t=Date.parse(x); return isNaN(t)?0:t; }

  function $id(id){ return d.getElementById(id); }
  function findInput(){ return $id('hist_motor_search') || d.querySelector('input[type="search"]'); }
  function findBrand(){ return $id('hist_motor_brand') || d.querySelector('select[aria-label="Marca"], select'); }
  function findState(){ return $id('hist_motor_state') || d.querySelector('select[aria-label="Estado"]'); }
  function findFrom(){ return $id('hist_motor_from') || d.querySelector('input[type="date"]:not([id$="to"])'); }
  function findTo(){ return $id('hist_motor_to') || d.querySelectorAll('input[type="date"]')[1]; }
  function findTableBody(){ return $id('hist_motor_tbody') || d.querySelector('table tbody'); }
  
  function trEN_MOTOR(pt){
    if(!pt) return '';
    const s=(''+pt).trim();
    if(/^ok$/i.test(s)) return 'OK';
    if(/Estrutura v[aá]lida/i.test(s)) return s + ' / <span class="en">Structure valid</span>';
    if(/S[eé]rie/i.test(s) && /inv[aá]lida/i.test(s)) return s + ' / <span class="en">Invalid serial</span>';
    return s + ' / <span class="en">' + s + '</span>';
  }
  function trStatePTEN(valid){
    return valid ? 'Válido / <span class="en">Valid</span>' : 'Inválido / <span class="en">Invalid</span>';
  }

  function findCSV(){ return $id('hist_motor_csv') || Array.from(d.querySelectorAll('button,input[type="button"]')).find(b=>/exportar/i.test(b.textContent||b.value||'')); }
  function findClear(){ return $id('hist_motor_clear') || Array.from(d.querySelectorAll('button,input[type="button"]')).find(b=>/limpar/i.test(b.textContent||b.value||'')); }

  function applyFilters(data, q, br, st, from, to){
    const qn = (q||'').trim().toLowerCase();
    const fts = from? ts(from + (from.length<12?'T00:00:00':'')) : null;
    const tts = to?   ts(to   + (to.length<12?'T23:59:59':'')) : null;
    return data.filter(r=>{
      const blob = ((r.sn||r.serial||'')+' '+(r.brand||'')+' '+(r.model||'')+' '+(r.reason||'')).toLowerCase();
      if(qn && blob.indexOf(qn)===-1) return false;
      if(br && String(r.brand||'')!==br) return false;
      if(st==='ok' && !r.valid) return false;
      if(st==='bad' && r.valid) return false;
      const dt = ts(r.date||r.dt||r.time||r.when||r.timestamp||r.createdAt);
      if(fts!=null && dt<fts) return false;
      if(tts!=null && dt>tts) return false;
      return true;
    });
  }

  function render(){
    const key = NAV.STORAGE.MOTOR_HISTORY;
    const raw = load(key);
    const tbody = findTableBody();
    if(!tbody) return;

    const input = findInput();
    const brandSel = findBrand();
    const stateSel = findState();
    const from = findFrom();
    const to = findTo();
    const q = input && input.value || '';
    const br = brandSel && brandSel.value || '';
    let st = stateSel && stateSel.value || 'all';
    if(/válido/i.test(st) || /valid/i.test(st)) st = 'ok';
    if(/inválido/i.test(st) || /invalid/i.test(st)) st = 'bad';

    const sorted = [...raw].sort((a,b)=> ts(b.date||b.dt||b.time||b.timestamp)-ts(a.date||a.dt||a.time||a.timestamp));
    const data = applyFilters(sorted, q, br, st, from && from.value, to && to.value);

    tbody.innerHTML='';
    data.forEach(r=>{
      const dtxt = new Date(ts(r.date||r.dt||r.time||r.timestamp)).toLocaleString();
      const state = r.valid ? '<span class="badge good">Válido</span>' : '<span class="badge bad">Inválido</span>';
      const reason = r.reason || '';
      const photo = r.photoName || '';
      const thumb = r.photoData ? '<img src="'+r.photoData+'" alt="" style="height:44px;border-radius:6px;border:1px solid var(--border)">' : '';
      const forIcon = r.forense ? ' 🔍' : '';
      const sn = r.sn || r.serial || '';
      const tr = d.createElement('tr');
      tr.innerHTML = '<td>'+dtxt+'</td>'
                   + '<td>'+ sn +'</td>'
                   + '<td>'+ (r.brand||'') + forIcon + '</td>'
                   + '<td>'+ (r.model||'') + '</td>'
                   + '<td>'+ trStatePTEN(!!r.valid) + '</td>' + '<td>'+ trEN_MOTOR(reason) + '</td>'
                   + '<td>'+photo+'</td>'
                   + '<td>'+thumb+'</td>';
      if(r.forense){ tr.title = 'Forense: ' + JSON.stringify(r.forense); }
      tbody.appendChild(tr);
    });
  }

  function toCSV(rows){
    const esc=v=>(''+(v==null?'':v)).replace(/"/g,'""');
    const header=['date','brand','model','sn','valid','reason','photoName','forense.hash','forense.flags','forense.notes'];
    const lines=[header.join(',')];
    rows.forEach(r=>{
      const line=[
        r.date||r.dt||r.time||r.timestamp||'',
        r.brand||'',
        r.model||'',
        r.sn||r.serial||'',
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
    const input = findInput(); const brandSel = findBrand(); const stateSel = findState(); const from = findFrom(); const to = findTo();
    if(input) input.addEventListener('input', render);
    if(brandSel) brandSel.addEventListener('change', render);
    if(stateSel) stateSel.addEventListener('change', render);
    if(from) from.addEventListener('change', render);
    if(to) to.addEventListener('change', render);
    const csvBtn = findCSV();
    if(csvBtn) csvBtn.addEventListener('click', function(e){
      e.preventDefault();
      const all = load(NAV.STORAGE.MOTOR_HISTORY);
      const sorted = [...all].sort((a,b)=> ts(b.date||b.dt||b.time||b.timestamp)-ts(a.date||a.dt||a.time||a.timestamp));
      const csv = toCSV(sorted);
      const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
      const url = URL.createObjectURL(blob);
      const a = d.createElement('a'); a.href=url; a.download='historico_motor.csv'; a.click();
      URL.revokeObjectURL(url);
    });
    const clrBtn = findClear();
    if(clrBtn) clrBtn.addEventListener('click', function(e){
      e.preventDefault();
      if(confirm('Limpar histórico Motor? Esta ação é irreversível.')){ save(NAV.STORAGE.MOTOR_HISTORY, []); render(); }
    });
  }

  ready(function(){ wire(); render(); });
})(window, document);
