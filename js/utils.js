// utils.js — IDMAR helpers (safe to overwrite or keep your existing if already robust)
function fmtDate(d){
  try{
    if (d == null) return '—';
    if (typeof d === 'number' || (typeof d === 'string' && /^\d+$/.test(d))) {
      const n = new Date(Number(d));
      return isNaN(n) ? '—' : n.toLocaleString('pt-PT');
    }
    const n = new Date(d);
    return isNaN(n) ? '—' : n.toLocaleString('pt-PT');
  }catch(e){ return '—'; }
}
function saveToLS(key, arr){ localStorage.setItem(key, JSON.stringify(arr||[])); }
function loadFromLS(key){ try{ return JSON.parse(localStorage.getItem(key)||'[]'); }catch(e){ return []; } }
function downloadCSV(filename, rows){
  const csv = rows.map(r=>r.map(v=>(''+(v??'')).replace(/"/g,'""')).map(v=>`"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download=filename; a.style.display='none';
  document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(()=>URL.revokeObjectURL(url), 1000);
}
