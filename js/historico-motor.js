/* IDMAR — histórico Motor (Fase 3)
   - Ordena mais recente → mais antigo
   - Filtros: estado + data (de/até) + pesquisa (S/N, marca, justificação)
   - Export CSV (UTF-8 + BOM)
   - Só JS; injeta toolbar + listagem própria
*/
(() => {
  const LS_KEYS = ['history_motor','historyMotor'];

  const $ = (s,root=document)=>root.querySelector(s);
  const el = (t,cls,txt)=>{const e=document.createElement(t); if(cls) e.className=cls; if(txt) e.textContent=txt; return e;};
  const parseTS = s => { const d = new Date(s); return isNaN(d) ? null : d; };
  const pad = n => String(n).padStart(2,'0');
  const fmt = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const isTrue = v => v===true || v===1 || v==='1' || v==='true' || v==='VÁLIDO';

  function readStoreKey(){ for (const k of LS_KEYS){ try{ if(localStorage.getItem(k)) return k; }catch{} } return LS_KEYS[0]; }
  function readAll(){
    const key = readStoreKey();
    try{ const arr = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(arr) ? arr : []; }catch{ return []; }
  }

  function ensureMount(){
    let wrap = $('[data-hist-motor-wrap]');
    if (wrap) return wrap;
    wrap = el('section','hist-motor-wrap');
    wrap.setAttribute('data-hist-motor-wrap','');
    const hdr = document.querySelector('.app-header') || document.body.firstChild;
    if (hdr && hdr.nextSibling) document.body.insertBefore(wrap, hdr.nextSibling);
    else document.body.insertBefore(wrap, document.body.firstChild);
    return wrap;
  }

  function buildToolbar(onApply,onClear,onExport){
    const bar = el('div','hist-toolbar');
    bar.style.display='flex'; bar.style.flexWrap='wrap'; bar.style.gap='0.5rem'; bar.style.alignItems='center';

    const status = el('select'); status.setAttribute('data-filter-status','');
    ['Todos','Válido','Inválido'].forEach(v=>{ const o=el('option',null,v); o.value=v.toLowerCase(); status.appendChild(o); });

    const from = el('input'); from.type='date'; from.setAttribute('data-filter-from','');
    const to   = el('input'); to.type='date';   to.setAttribute('data-filter-to','');

    const q = el('input'); q.type='search'; q.placeholder='Pesquisar SN/marca/justificação…'; q.setAttribute('data-filter-q','');

    const btnA = el('button',null,'Aplicar'); btnA.addEventListener('click', onApply);
    const btnC = el('button',null,'Limpar');  btnC.addEventListener('click', ()=>{ status.value='todos'; from.value=''; to.value=''; q.value=''; onClear(); });
    const btnX = el('button',null,'Export CSV'); btnX.addEventListener('click', onExport);

    bar.append(el('strong',null,'Filtros:'), status, from, to, q, btnA, btnC, btnX);
    return {bar, refs:{status,from,to,q}};
  }

  function buildList(){ const box = el('div','hist-list'); box.setAttribute('data-hist-list',''); return box; }

  function applyFilters(rows,f){
    let out = rows.slice();
    if (f.status && f.status!=='todos'){
      const wantValid = f.status==='válido';
      out = out.filter(r => isTrue(r.valid) === wantValid);
    }
    if (f.from){
      const d = new Date(f.from+'T00:00:00');
      out = out.filter(r => (parseTS(r.ts)||new Date(0)) >= d);
    }
    if (f.to){
      const d = new Date(f.to+'T23:59:59');
      out = out.filter(r => (parseTS(r.ts)||new Date(0)) <= d);
    }
    if (f.q){
      const needle = f.q.toUpperCase();
      out = out.filter(r=>{
        const sn = (r.sn || r.serial || '').toString().toUpperCase();
        const mk = (r.marca || r.brand || '').toString().toUpperCase();
        const just = (r.justificacao || r.reason || '').toString().toUpperCase();
        return sn.includes(needle) || mk.includes(needle) || just.includes(needle);
      });
    }
    return out;
  }
  function sortDesc(rows){
    return rows.slice().sort((a,b)=>{
      const da = parseTS(a.ts) || new Date(0);
      const db = parseTS(b.ts) || new Date(0);
      return db - da;
    });
  }

  function renderItems(listEl, rows){
    listEl.innerHTML = '';
    if (!rows.length){ listEl.appendChild(el('p',null,'Sem registos.')); return; }
    rows.forEach(r=>{
      const card = el('div','hist-card');
      card.style.border='1px solid #e5e7eb'; card.style.borderRadius='8px'; card.style.padding='0.75rem'; card.style.margin='0.25rem 0';

      const dt = parseTS(r.ts) || new Date(0);
      const top = el('div'); top.style.display='flex'; top.style.justifyContent='space-between'; top.style.gap='1rem';

      const left = el('div');
      const l1 = el('div',null, `${(r.marca || r.brand || '—')} • ${(r.sn || r.serial || '(sem SN)')}`);
      const l2 = el('small',null, fmt(dt));
      left.append(l1,l2);

      const badge = el('strong',null, isTrue(r.valid) ? 'VÁLIDO' : 'INVÁLIDO');
      badge.setAttribute('data-valid', isTrue(r.valid)?'1':'0');

      const just = el('div'); just.style.marginTop='0.25rem';
      just.textContent = r.justificacao || r.reason || '';

      top.append(left,badge);
      card.append(top, just);
      listEl.appendChild(card);
    });
  }

  function toCSV(rows){
    const headers = ['id','ts','marca','sn','valid','resultado','justificacao'];
    const esc = v => `"${String(v ?? '').replace(/"/g,'""')}"`;
    const lines = [headers.map(h=>esc(h)).join(',')];
    rows.forEach(r=>{
      const row = [
        r.id, r.ts, (r.marca || r.brand || ''), (r.sn || r.serial || ''),
        isTrue(r.valid)?1:0,
        (r.resultado || (isTrue(r.valid)?'VÁLIDO':'INVÁLIDO')),
        (r.justificacao || r.reason || '')
      ];
      lines.push(row.map(esc).join(','));
    });
    const blob = new Blob(["\uFEFF" + lines.join('\r\n')], {type:'text/csv;charset=utf-8;'});
    const a = el('a'); a.href = URL.createObjectURL(blob);
    a.download = `historico_motor_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
  }

  function boot(){
    if (document.body.dataset.histMotorBound) return;
    document.body.dataset.histMotorBound = '1';

    const wrap = ensureMount();
    const {bar, refs} = buildToolbar(apply, clear, () => toCSV(current));
    const list = buildList();
    wrap.append(bar, list);

    let full = sortDesc(readAll());
    let current = full.slice();

    function refresh(){
      current = sortDesc(applyFilters(full, {
        status: refs.status.value,
        from: refs.from.value,
        to: refs.to.value,
        q: refs.q.value.trim()
      }));
      renderItems(list, current);
    }
    function apply(){ refresh(); }
    function clear(){ refs.status.value='todos'; refs.from.value=''; refs.to.value=''; refs.q.value=''; refresh(); }

    refresh();
    window.IDMAR_HIST_MOTOR = { refresh, export:()=>toCSV(current) };
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
 