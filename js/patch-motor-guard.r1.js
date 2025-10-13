/* IDMAR — patch-motor-guard.r1
   - Remove entradas “vazias” em history_motor / historyMotor (sem SN e sem anexos)
   - Garante foto a partir de meta.forense[0].file quando existir
   - Ordena por ts desc e sincroniza ambas as chaves
*/
(function(){
  try{
    const read  = k => { try{ const r=localStorage.getItem(k); return r?JSON.parse(r):[] }catch(_){return[]} };
    const write = (k,v)=>{ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(_){ } };
    const hasAnexos = r => Array.isArray(r?.meta?.forense) && r.meta.forense.length>0;

    const A = read('history_motor'), B = read('historyMotor');
    if (!A.length && !B.length) return;

    const merged = [...A, ...B];
    const cleaned = merged
      .map(r=>{
        // se houver anexos e foto estiver vazia, copiar nome do primeiro
        if (!r.foto && hasAnexos(r) && r.meta.forense[0].file) r.foto = r.meta.forense[0].file;
        return r;
      })
      // manter apenas entradas com SN ou com anexos (descarta vazios acidentais)
      .filter(r => (r && ((r.sn && String(r.sn).trim()) || hasAnexos(r))));

    // ordenar desc por ts
    cleaned.sort((x,y)=> (y.ts||'').localeCompare(x.ts||''));

    write('history_motor', cleaned);
    write('historyMotor', cleaned);

    console.log('[patch-motor-guard.r1] kept:', cleaned.length);
  }catch(e){
    console.error('[patch-motor-guard.r1]', e);
  }
})();
