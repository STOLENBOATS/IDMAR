
/* IDMAR — Histórico WIN r1.1 (filtros + CSV + compat keys + foto from meta.forense) */
(() => {
  function readKey(k){ try{ const raw=localStorage.getItem(k); if(!raw) return []; const arr=JSON.parse(raw); return Array.isArray(arr)?arr:[]; }catch{return []} }
  function deriveFoto(r){
    // prefer explicit field; otherwise summarize meta.forense
    if (r.foto) return r.foto;
    const fx = (r.meta && Array.isArray(r.meta.forense)) ? r.meta.forense : [];
    if (fx.length === 0) return '';
    // show first filename and count
    const first = fx[0]?.file || '';
    return first ? `${first} (+${Math.max(0, fx.length-1)})` : `${fx.length} anexo(s)`;
  }
  function sanitize(x){
    const o = Object.assign({}, x);
    o.ts = o.ts || x.timestamp || '';
    o.win = o.win || x.hin || '';
    o.estado = o.estado || (o.valid===true?'ok':(o.valid===false?'erro':'')) || '';
    o.estadoLabel = o.estadoLabel || (o.valid ? 'Válido' : 'Inválido');
    o.justificacao = o.justificacao || x.reason || '';
    o.meta = o.meta || x.meta || {};
    o.foto = deriveFoto(o);
    return o;
  }
  function readAll() {
    const A = readKey('history_win');
    const B = readKey('historyWin');
    const all = [...A, ...B].map(sanitize);
    const seen = new Set();
    return all.filter(x=>{
      const k = `${x.id||''}|${x.ts||''}|${x.win||''}`;
      if (seen.has(k)) return false; seen.add(k); return true;
    }).sort((a,b)=> (b.ts||'').localeCompare(a.ts||''));
  }

  const $tbody = document.getElementById('histWinBody') || document.querySelector('tbody');
  const $q     = document.getElementById('q') || document.querySelector('input[type="search"]');
  const $fEst  = document.getElementById('fEstado') || document.querySelector('[data-filter="estado"]');
  const $from  = document.getElementById('fromDate') || document.querySelector('[data-filter="from"]');
  const $to    = document.getElementById('toDate') || document.querySelector('[data-filter="to"]');
  const $btnCSV= document.getElementById('btnExport') || document.querySelector('[data-export="csv"]');

  function render(rows){
    if (!$tbody) return;
    $tbody.innerHTML = '';
    if (!rows.length){
      const tr = document.createElement('tr');
      const td = document.createElement('td'); td.colSpan = 5; td.style.opacity='.75';
      td.textContent = 'Sem registos [No records]';
      tr.appendChild(td); $tbody.appendChild(tr); return;
    }
    for (const r of rows){
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${fmtTs(r.ts)}</td>
        <td>${esc(r.win)}</td>
        <td><span class="badge ${r.estado==='ok'?'good':'bad'}">${esc(r.estadoLabel||'')}</span></td>
        <td>${esc(r.justificacao||'')}</td>
        <td>${esc(r.foto||'')}</td>`;
      $tbody.appendChild(tr);
    }
  }

  function applyFilters(){
    const all = readAll();
    const q = ($q?.value || '').trim().toLowerCase();
    const est = ($fEst?.value || '').toLowerCase();
    const from = ($from?.value || '');
    const to   = ($to?.value || '');
    const toEnd = to ? to + 'T23:59:59' : '';

    const out = all.filter(r=>{
      if (est && r.estado !== est) return false;
      if (from && (!r.ts || r.ts < from)) return false;
      if (toEnd && (!r.ts || r.ts > toEnd)) return false;
      if (q){
        const metaTxt = (()=>{
          try{ return JSON.stringify(r.meta && r.meta.forense ? r.meta.forense : []); }catch(_){ return ''; }
        })().toLowerCase();
        const hay = `${r.win||''} ${r.estadoLabel||''} ${r.justificacao||''} ${r.foto||''} ${metaTxt}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    render(out);
  }

  function toCSV(rows){
    const head = ['Data/Hora','WIN / HIN','Estado','Justificação','Foto'];
    const lines = [head];
    for (const r of rows){
      lines.push([ fmtTs(r.ts), r.win||'', r.estadoLabel||'', r.justificacao||'', r.foto||'' ]);
    }
    return lines.map(cols => cols.map(csvCell).join(';')).join('\\r\\n');
  }
  function downloadCSV(){
    const rows = readAll();
    const q = ($q?.value || '').trim(); const est=($fEst?.value||''); const from=$from?.value||''; const to=$to?.value||'';
    const toEnd = to ? to + 'T23:59:59' : '';
    const filtered = rows.filter(r=>{
      if (est && r.estado !== est) return false;
      if (from && (!r.ts || r.ts < from)) return false;
      if (toEnd && (!r.ts || r.ts > toEnd)) return false;
      if (q){
        const metaTxt = (()=>{ try{ return JSON.stringify(r.meta?.forense||[]); }catch(_){ return ''; } })().toLowerCase();
        const hay = `${r.win||''} ${r.estadoLabel||''} ${r.justificacao||''} ${r.foto||''} ${metaTxt}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    const blob = new Blob([toCSV(filtered)], {type:'text/csv;charset=utf-8;'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `historico-win_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  function esc(s){ return (s==null?'':String(s)).replace(/[<>&]/g, c=>({ '<':'&lt;','>':'&gt;','&':'&amp;' }[c])); }
  function fmtTs(ts){ if(!ts) return ''; try{ const d=new Date(ts); if (isNaN(d)) return ts; return d.toLocaleString(); }catch{ return ts; } }
  function csvCell(s){ const v = s==null?'':String(s); return /[;"\\n]/.test(v) ? `"${v.replace(/"/g,'""')}"` : v; }

  function bind(){
    ['input','change'].forEach(ev=>{
      $q && $q.addEventListener(ev, applyFilters);
      $fEst && $fEst.addEventListener(ev, applyFilters);
      $from && $from.addEventListener(ev, applyFilters);
      $to && $to.addEventListener(ev, applyFilters);
    });
    $btnCSV && $btnCSV.addEventListener('click', (e)=>{ e.preventDefault(); downloadCSV(); });
    applyFilters();
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();
