// Verifica se um SN normalizado cai num dos intervalos: [{from,to,note}]
(function(w){
  function normalize(sn){
    return (sn||'').toString().trim().toUpperCase().replace(/\s+/g,'');
  }
  function cmp(a,b){ return a===b ? 0 : (a<b ? -1 : 1); }
  function inRange(sn, r){ return cmp(sn,r.from)<=0 ? false : (cmp(sn,r.to)<=0); }
  w.EngineSNRange = {
    check(snInput, ranges){
      const sn = normalize(snInput);
      const rs = Array.isArray(ranges) ? ranges.map(r=>({from:normalize(r.from),to:normalize(r.to),note:r.note||''})) : [];
      for(const r of rs){ if(inRange(sn,r)) return { ok:true, match:r, raw:sn }; }
      return { ok:false, raw:sn, ranges:rs, reason:'fora_dos_intervalos' };
    }
  };
})(window);
