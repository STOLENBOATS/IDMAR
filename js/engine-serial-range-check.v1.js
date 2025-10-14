// Stub: range check para Nº do motor (podes trocar depois pela lógica real)
window.EngineSNRange = {
  check(sn) {
    // devolve um resultado neutro; ajusta quando tiveres as tabelas reais
    return { ok: !!(sn && sn.trim()), ranges: [], notes: '' };
  }
};
