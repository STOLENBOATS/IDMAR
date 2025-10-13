/* IDMAR — Forense attach compat r1 (leve, sem thumbs base64) */
(function(){
  if (window.__IDMAR_FORENSE_ATTACH_R1__) return; window.__IDMAR_FORENSE_ATTACH_R1__=true;

  function $(s){ return document.querySelector(s) }
  function readKey(k){ try{ const r=localStorage.getItem(k); return r?JSON.parse(r):[] }catch(_){ return [] } }
  function writeBoth(k1,k2,list){ try{ localStorage.setItem(k1,JSON.stringify(list)); }catch(_){} try{ localStorage.setItem(k2,JSON.stringify(list)); }catch(_){} }
  function latestPair(){
    const W = readKey('history_win').concat(readKey('historyWin')).sort((a,b)=>(b.ts||'').localeCompare(a.ts||''));
    const M = readKey('history_motor').concat(readKey('historyMotor')).sort((a,b)=>(b.ts||'').localeCompare(a.ts||''));
    const w=W[0], m=M[0];
    if (w && m) return ((m.ts||'')>(w.ts||'')) ? ['motor', m] : ['win', w];
    if (m) return ['motor', m];
    if (w) return ['win', w];
    return [null, null];
  }
  async function sha256Hex(blob){ const buf=await blob.arrayBuffer(); const h=await crypto.subtle.digest('SHA-256',buf); return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('') }
  function findCanvas(){ return document.getElementById('wsCanvas') || document.querySelector('#workspace canvas') || document.querySelector('canvas') }

  function pickContext(){
    const sel = document.querySelector('#forenseContext, #forense-context, select[name="contexto"]');
    const v = (sel && (sel.value||'').toLowerCase()) || '';
    if (v.includes('motor')) return 'motor';
    if (v.includes('win') || v.includes('hin')) return 'win';
    return null;
  }

  async function doAttach(blob){
    if (!blob) return;
    const name='forense_'+new Date().toISOString().replace(/[:.]/g,'-')+'.png';
    const notes=(($('#notes')&&$('#notes').value)||'').slice(0,200);
    let hash=''; try{ hash=await sha256Hex(blob) }catch(_){}
    let kind = pickContext(); let rec = null;

    if (!kind){
      const p = latestPair(); kind = p[0]; rec = p[1];
    } else {
      const key = kind==='win' ? 'history_win' : 'history_motor';
      const alt = kind==='win' ? 'historyWin'  : 'historyMotor';
      const arr = readKey(key); const arrB = readKey(alt);
      rec = (arr.length?arr:arrB)[0];
    }
    if (!kind || !rec) { console.warn('[forense-attach.r1] Sem histórico para anexar'); return }

    const K1 = kind==='win' ? 'history_win'   : 'history_motor';
    const K2 = kind==='win' ? 'historyWin'    : 'historyMotor';
    const listA = readKey(K1), listB = readKey(K2);
    const arr = (listA.length?listA:listB).slice();
    if (!arr.length) return;

    rec.meta = rec.meta || {};
    const arrFx = Array.isArray(rec.meta.forense) ? rec.meta.forense : [];
    arrFx.push({ ts:new Date().toISOString(), file:name, hash_sha256:hash, notes:notes });
    rec.meta.forense = arrFx;
    if (!rec.foto) rec.foto = name;

    const out = [rec].concat(arr.slice(1));
    writeBoth(K1, K2, out);
    console.log('[forense-attach.r1] Anexado a', kind, rec.id || '(sem id)');
  }

  function install(){
    // tenta capturar o botão "Exportar PNG"
    const candidates = [
      '#exportPNG','[data-export="png"]','button#exportarPng','button','input[type="button"]'
    ];
    let btn = null;
    for (const s of candidates){
      const el = document.querySelector(s);
      if (el && (/png/i.test(el.id+el.name+el.textContent))) { btn = el; break; }
    }
    if (!btn || btn.__idmar_attach_r1) return;
    btn.__idmar_attach_r1 = true;

    btn.addEventListener('click', function(){
      if (window.IDMAR_FOR_EXPORT && typeof window.IDMAR_FOR_EXPORT.exportPNG==='function'){
        window.IDMAR_FOR_EXPORT.exportPNG().then(doAttach).catch(console.error);
        return;
      }
      const c = findCanvas(); if (!c) return;
      c.toBlob(function(blob){ doAttach(blob); }, 'image/png', 0.92);
    });
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', install); else install();
})();
