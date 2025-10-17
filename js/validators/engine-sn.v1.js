/*! IDMAR · validateEngineSN() — Engine Serial Number validator (v1) */
(function(){
  'use strict';
  function uc(s){ return (s||'').toString().trim().toUpperCase(); }
  function clean(s){ return uc(s).replace(/[\s\-/.]+/g,''); }
  function validateEngineSN(input){
    const raw = (input||'').toString();
    const norm = uc(raw), flat = clean(raw);
    const out = { ok:false, brand:null, pattern:null, normalized:norm, flat, parsed:null, errors:[], warnings:[], score:0 };
    if(!flat){ out.errors.push('Vazio'); return out; }
    if(/^[0-3][A-Z][0-9]{6}$/.test(flat)){ out.ok=true; out.brand='Mercury/MerCruiser/Mariner'; out.pattern='digit(0-3)+letter+6digits'; out.parsed={prefix:flat.slice(0,2),serial:flat.slice(2)}; out.score=90; return out; }
    if(/^[245][0-9]{9}$/.test(flat) || /^A.{6}$/.test(flat)){ out.ok=true; out.brand='Volvo Penta'; out.pattern='10d start 2/4/5 OR 7 chars "A"…'; out.parsed={serial:flat}; out.score=85; return out; }
    const yam = flat.match(/^([0-9A-Z]{2,3})([LSX]?)(\d{5,7})$/);
    if(yam){ out.ok=true; out.brand='Yamaha'; out.pattern='Prefix(2-3)[L/S/X]? + 5-7 digits'; out.parsed={prefix:yam[1],shaft:yam[2]||null,serial:yam[3]}; out.score=80; return out; }
    if(/^[A-Z0-9]{7,11}$/.test(flat)){ out.ok=true; out.brand='Honda (genérico)'; out.pattern='7-11 alfanum'; out.parsed={serial:flat}; out.warnings.push('Honda: preferir S/N completo (com prefixo).'); out.score=70; return out; }
    if(/^[A-Z0-9]{7,10}$/.test(flat)){ out.ok=true; out.brand='Suzuki (genérico)'; out.pattern='7-10 alfanum'; out.parsed={serial:flat}; out.score=65; return out; }
    out.errors.push('Formato de S/N de motor não reconhecido pelos perfis suportados.');
    out.warnings.push('Verificar etiqueta no suporte/veio e core plug.');
    out.score=30; return out;
  }
  window.IDMARValidators = window.IDMARValidators || {};
  window.IDMARValidators.validateEngineSN = validateEngineSN;
  window.IDMARValidators.validateMotor = validateEngineSN; // alias
})();