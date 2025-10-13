/*! IDMAR · validateHullId() — CIN/HIN/WIN validator (v1) */
(function(){
  'use strict';
  const MONTHS = {A:'Jan',B:'Feb',C:'Mar',D:'Apr',E:'May',F:'Jun',G:'Jul',H:'Aug',J:'Sep',K:'Oct',L:'Nov'};
  function uc(s){ return (s||'').toString().trim().toUpperCase(); }
  function validateHullId(input){
    const raw = (input||'').toString();
    const norm = uc(raw).replace(/\s+/g,' ').trim();
    const out = { ok:false, type:null, normalized:norm, parsed:null, errors:[], warnings:[], score:0 };
    if(!norm){ out.errors.push('Vazio'); return out; }
    const ceLike = /^[A-Z]{2}-/.test(norm);
    const cleaned = ceLike ? norm : norm.replace(/[-./]/g,'');
    const CE_RE = /^([A-Z]{2})-([A-Z0-9]{3})([A-HJ-NPR-Z0-9]{5})([A-L])([0-9])([0-9]{2})$/;
    const US_RE = /^([A-Z0-9]{3})([A-HJ-NPR-Z0-9]{5})([A-L])([0-9])([0-9]{2})$/;
    if(ceLike){
      const m = norm.match(CE_RE);
      if(!m){ out.errors.push('Formato CE (14) esperado: CC-MICSSSSSMYYY'); return out; }
      const [,cc,mic,serial,mon,y,yy] = m;
      if(mon==='I') out.errors.push('Mês inválido (A–L, sem I).');
      const by2 = parseInt(y,10), my2 = parseInt(yy,10);
      if(!(my2===by2 || my2===((by2+1)%100))) out.errors.push('Inconsistência entre ano de fabrico e model year.');
      out.ok = out.errors.length===0; out.type='CE14';
      out.parsed = { country:cc, mic, serial, monthCode:mon, month:MONTHS[mon]||mon, buildYearDigit:y, modelYear:yy };
      out.score = out.ok?100:40; return out;
    } else {
      const m = cleaned.match(US_RE);
      if(!m){ out.errors.push('Formato US (12) esperado: MICSSSSSMYYY'); return out; }
      const [,mic,serial,mon,y,yy] = m;
      if(mon==='I') out.errors.push('Mês inválido (A–L, sem I).');
      const by2 = parseInt(y,10), my2 = parseInt(yy,10);
      if(!(my2===by2 || my2===((by2+1)%100))) out.errors.push('Inconsistência entre ano de fabrico e model year.');
      out.ok = out.errors.length===0; out.type='US12';
      out.parsed = { mic, serial, monthCode:mon, month:MONTHS[mon]||mon, buildYearDigit:y, modelYear:yy };
      out.score = out.ok?95:40; return out;
    }
  }
  window.IDMARValidators = window.IDMARValidators || {};
  window.IDMARValidators.validateHullId = validateHullId;
  window.IDMARValidators.validateWin = validateHullId; // alias
})();