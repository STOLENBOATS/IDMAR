/* IDMAR — Forense r2 (export PNG + hash + anexar ao histórico) */
(() => {
  function $(sel){ return document.querySelector(sel); }
  function findCanvas(){
    return $('#wsCanvas') || $('.ws-canvas') || $('#workspace canvas') || document.querySelector('canvas');
  }
  async function sha256Hex(blob){
    const buf = await blob.arrayBuffer();
    const hash = await crypto.subtle.digest('SHA-256', buf);
    const bytes = new Uint8Array(hash);
    return Array.from(bytes).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  function readKey(k){ try{ const raw=localStorage.getItem(k); if(!raw) return []; const arr=JSON.parse(raw); return Array.isArray(arr)?arr:[]; }catch{return []} }
  function writeBoth(K1, K2, list){ try{ localStorage.setItem(K1, JSON.stringify(list)); localStorage.setItem(K2, JSON.stringify(list)); }catch(_){} }
  function readHistoryBoth(kind){
    const K1 = kind==='win' ? 'history_win' : 'history_motor';
    const K2 = kind==='win' ? 'historyWin' : 'historyMotor';
    const all = [...readKey(K1), ...readKey(K2)];
    all.sort((a,b)=> ((b.ts||'').localeCompare(a.ts||'')));
    return {K1, K2, list: all};
  }
  function attachToLatest(kind, payload){
    const {K1, K2, list} = readHistoryBoth(kind);
    if (!list.length){
      try{
        const P = JSON.parse(localStorage.getItem('forense_pending')||'[]');
        P.push({ kind, payload, ts: new Date().toISOString() });
        localStorage.setItem('forense_pending', JSON.stringify(P));
      }catch(_){}
      return { ok:false, reason:'no-history' };
    }
    const target = list[0];
    target.meta = target.meta || {};
    const arr = Array.isArray(target.meta.forense) ? target.meta.forense : [];
    arr.push(payload);
    target.meta.forense = arr;
    writeBoth(K1, K2, [target, ...list.slice(1)]);
    return { ok:true, id: target.id || null };
  }
  async function doExportAndAttach(){
    try{
      const c = findCanvas();
      if (!c) { alert('Sem canvas visível para exportar.'); return; }
      const blob = await new Promise(res=> c.toBlob(res, 'image/png', 1));
      if (!blob){ alert('Falha ao gerar PNG.'); return; }
      const name = `forense_${new Date().toISOString().replace(/[:.]/g,'-')}.png`;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 0);
      const hash = await sha256Hex(blob);
      const notes = ($('#notes')?.value || '').trim();
      const rawCtx = ($('#evContext')?.value || 'win').toLowerCase();
      const kind = rawCtx.includes('motor') ? 'motor' : 'win';
      const payload = { ts:new Date().toISOString(), file:name, hash_sha256:hash, notes };
      const r = attachToLatest(kind, payload);
      if (r.ok){
        console.log('[Forense] Anexado ao histórico:', r.id, payload);
        alert('Exportado e anexado. SHA-256: ' + hash.slice(0,16) + '…');
      } else {
        alert('Sem histórico para anexar. Guardado em fila local.');
      }
    }catch(err){
      console.error('Forense export error:', err);
      alert('Erro no export/anexo de forense.');
    }
  }
  function bind(){
    const btn = document.getElementById('exportPNG') || document.querySelector('[data-export="png"]');
    if (btn && !btn.dataset.bound){
      btn.dataset.bound = '1';
      btn.addEventListener('click', (e)=>{ e.preventDefault(); doExportAndAttach(); });
    }
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();