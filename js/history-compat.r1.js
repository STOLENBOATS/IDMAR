
/* IDMAR — history-compat.r1
   - Sincroniza (history_win <-> historyWin) e (history_motor <-> historyMotor)
   - Normaliza shape: id, ts, valid/estado/estadoLabel/resultado, foto, meta.forense
   - Copia 'foto' do primeiro anexo se estiver vazio
   - Seguro para correr em qualquer página
*/
(function(){
  if (window.__IDMAR_HISTORY_COMPAT_R1__) return;
  window.__IDMAR_HISTORY_COMPAT_R1__ = true;

  const read  = k => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : []; } catch(_) { return []; } };
  const write = (k,v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(_){} };
  const isObj = x => x && typeof x === 'object' && !Array.isArray(x);

  function normalize(rec, kind){
    if (!isObj(rec)) return rec;
    if (!rec.ts) rec.ts = new Date().toISOString();
    if (!rec.id) rec.id = (Math.random().toString(16).slice(2))+Date.now();

    if (!rec.hasOwnProperty('valid') && typeof rec.estado !== 'undefined')
      rec.valid = (rec.estado === 'ok' || rec.estado === true);

    if (typeof rec.valid === 'boolean'){
      rec.estado = rec.valid ? 'ok' : 'erro';
      rec.estadoLabel = rec.valid ? 'Válido' : 'Inválido';
      rec.resultado = rec.valid ? 'VÁLIDO' : 'INVÁLIDO';
    } else {
      rec.estado      = rec.estado || 'ok';
      rec.estadoLabel = rec.estadoLabel || 'Válido';
      rec.resultado   = rec.resultado || 'VÁLIDO';
      rec.valid = (rec.estado === 'ok');
    }

    rec.meta = rec.meta || {};
    if (Array.isArray(rec.meta.forense)){
      rec.meta.forense = rec.meta.forense.map(fx=>{
        if (isObj(fx) && fx.thumb_dataurl && fx.thumb_dataurl.length > 100) delete fx.thumb_dataurl;
        return fx;
      });
      if (!rec.foto && rec.meta.forense[0] && rec.meta.forense[0].file) rec.foto = rec.meta.forense[0].file;
      if (!rec.thumb && rec.meta.forense[0] && rec.meta.forense[0].thumb) rec.thumb = rec.meta.forense[0].thumb;
    }

    if (kind==='WIN'){ if (!rec.win && rec.hin) rec.win = rec.hin; }
    if (kind==='MOTOR'){
      if (!rec.sn && rec.serial) rec.sn = rec.serial;
      if (!rec.marca && rec.brand) rec.marca = rec.brand;
    }
    if (!rec.justificacao && rec.justification) rec.justificacao = rec.justification;
    return rec;
  }

  function merge(A,B){
    const m = new Map();
    [...A,...B].forEach(r=>{
      if (!isObj(r)) return;
      const id = r.id || (r.ts+'_'+(r.win||r.sn||''));
      const prev = m.get(id);
      if (!prev || (r.ts||'')>(prev.ts||'')) m.set(id, Object.assign({}, prev, r));
    });
    return [...m.values()];
  }

  function sync(k1,k2,kind){
    const A = read(k1), B = read(k2);
    if (!A.length && !B.length) return 0;
    const out = merge(A,B).map(r=>normalize(r,kind)).sort((x,y)=>(y.ts||'').localeCompare(x.ts||''));
    write(k1,out); write(k2,out);
    return out.length;
  }

  try{
    const nW = sync('history_win','historyWin','WIN');
    const nM = sync('history_motor','historyMotor','MOTOR');
    console.log('[history-compat.r1] synced',{win:nW, motor:nM});
  }catch(e){ console.error('[history-compat.r1]', e); }
})();
