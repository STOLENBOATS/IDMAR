/* IDMAR — Forense r2.1 (export PNG + hash + thumbnail + anexo ao histórico) */
(() => {
  function $(sel){ return document.querySelector(sel); }
  function findCanvas(){
    return document.getElementById('wsCanvas') || document.querySelector('.ws-canvas') || document.querySelector('#workspace canvas') || document.querySelector('canvas');
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
    const all = [].concat(readKey(K1), readKey(K2));
    all.sort(function(a,b){ return (b.ts||'').localeCompare(a.ts||''); });
    return {K1, K2, list: all};
  }
  function attachToLatest(kind, payload){
    const ctx = readHistoryBoth(kind);
    const K1 = ctx.K1, K2 = ctx.K2, list = ctx.list;
    if (!list.length){
      try{
        const P = JSON.parse(localStorage.getItem('forense_pending')||'[]');
        P.push({ kind: kind, payload: payload, ts: new Date().toISOString() });
        localStorage.setItem('forense_pending', JSON.stringify(P));
      }catch(_){}
      return { ok:false, reason:'no-history' };
    }
    const target = list[0];
    target.meta = target.meta || {};
    const arr = Array.isArray(target.meta.forense) ? target.meta.forense : [];
    arr.push(payload);
    target.meta.forense = arr;
    writeBoth(K1, K2, [target].concat(list.slice(1)));
    return { ok:true, id: target.id || null };
  }
  function makeThumb(canvas, maxW=256){
    const w = canvas.width, h = canvas.height;
    const scale = Math.min(1, maxW / Math.max(1, w));
    const tw = Math.max(1, Math.round(w*scale));
    const th = Math.max(1, Math.round(h*scale));
    const off = document.createElement('canvas');
    off.width = tw; off.height = th;
    const ctx = off.getContext('2d');
    ctx.drawImage(canvas, 0, 0, tw, th);
    return off.toDataURL('image/png', 0.85);
  }
  async function doExportAndAttach(){
    try{
      const c = findCanvas();
      if (!c) { alert('Sem canvas visível para exportar.'); return; }
      const blob = await new Promise(function(res){ c.toBlob(res, 'image/png', 1); });
      if (!blob){ alert('Falha ao gerar PNG.'); return; }
      const name = 'forense_' + new Date().toISOString().replace(/[:.]/g,'-') + '.png';
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 0);
      const hash = await sha256Hex(blob);
      const notes = ($('#notes') && $('#notes').value || '').trim();
      const rawCtx = ($('#evContext') && $('#evContext').value || 'win').toLowerCase();
      const kind = rawCtx.indexOf('motor')>=0 ? 'motor' : 'win';
      const thumb = makeThumb(c);
      const payload = { ts:new Date().toISOString(), file:name, hash_sha256:hash, notes:notes, thumb_dataurl: thumb };
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
      btn.addEventListener('click', function(e){ e.preventDefault(); doExportAndAttach(); });
    }
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', bind); else bind();
})();
