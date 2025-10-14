// js/engine-serial-range-check.v1.js (policy-aware)
(function(w){
  function normUpper(s){ return (s||'').toString().trim().toUpperCase().replace(/\s+/g,''); }
  function splitSN(raw) { return normUpper(raw).replace(/-/g,''); }

  function applyPolicy(raw, policy){
    const s = splitSN(raw);
    const p = policy || {};
    const out = { raw: s, pretty: s, structuralOk: true };

    if (p.prefix && p.prefix.required) {
      const minP = p.prefix.min_len || 0;
      const maxP = p.prefix.max_len || minP;
      const pref = s.slice(0, Math.min(maxP, s.length));
      const body = s.slice(pref.length);
      if (p.normalize && p.normalize.auto_hyphen) {
        out.pretty = pref + (body ? '-' + body : '');
      }
      if (pref.length < minP) out.structuralOk = false;
      if (p.body && p.body.min_len && body.length < p.body.min_len) out.structuralOk = false;
      if (p.body && p.body.max_len && body.length > p.body.max_len) out.structuralOk = false;
      if (p.body && p.body.kind === 'number' && /\D/.test(body)) out.structuralOk = false;
    } else {
      const body = s;
      if (p.body && p.body.min_len && body.length < p.body.min_len) out.structuralOk = false;
      if (p.body && p.body.max_len && body.length > p.body.max_len) out.structuralOk = false;
      if (p.body && p.body.kind === 'number' && /\D/.test(body)) out.structuralOk = false;
      out.pretty = body;
    }

    return out;
  }

  function cmp(a,b){ return a===b ? 0 : (a<b ? -1 : 1); }
  function inRange(snNoHyphen, r){
    const from = ((r.prefix||'') + (r.from||'')).toUpperCase();
    const to   = ((r.prefix||'') + (r.to||'')).toUpperCase();
    return cmp(snNoHyphen, from) >= 0 && cmp(snNoHyphen, to) <= 0;
  }

  w.EngineSNRange = {
    check(snInput, ranges, policy){
      const pre = applyPolicy(snInput, policy);
      const rs = Array.isArray(ranges) ? ranges.slice() : [];
      const hits = [];
      for (const r of rs){ if (inRange(pre.raw, r)) hits.push(r); }
      if (!rs.length) return { ok: pre.structuralOk, raw: pre.raw, pretty: pre.pretty, matches: [], reason: 'sem_intervalos' };
      if (hits.length) return { ok:true, raw: pre.raw, pretty: pre.pretty, matches: hits };
      return { ok:false, raw: pre.raw, pretty: pre.pretty, matches: [], reason:'fora_dos_intervalos' };
    }
  };
})(window);
