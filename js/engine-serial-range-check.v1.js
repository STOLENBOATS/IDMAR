// js/engine-serial-range-check.v1.js
(function(w){
  function norm(s){ return (s||'').toString().trim().toUpperCase().replace(/\s+/g,''); }
  function cmp(a,b){ return a===b ? 0 : (a<b ? -1 : 1); }
  function inRange(sn, r){
    const from = (r.prefix ? (r.prefix + '-' + (r.from||'')) : (r.from||'')).toString().toUpperCase();
    const to   = (r.prefix ? (r.prefix + '-' + (r.to||''))   : (r.to||'')).toString().toUpperCase();
    return cmp(sn, from) >= 0 && cmp(sn, to) <= 0;
  }
  w.EngineSNRange = {
    check(snInput, ranges){
      const sn = norm(snInput);
      const rs = Array.isArray(ranges) ? ranges.slice() : [];
      for(const r of rs){ if(inRange(sn,r)) return { ok:true, match:r, raw:sn }; }
      return { ok:false, raw:sn, ranges:rs, reason:'fora_dos_intervalos' };
    }
  };
})(window);
