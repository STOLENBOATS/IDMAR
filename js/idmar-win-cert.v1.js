/*! IDMAR – Certificado de Conformidade (drop-in) v1.2
 * Uso: inclui UMA vez, de preferência após os scripts do validador WIN:
 *   <script src="js/idmar-win-cert.v1.js?v=1.2"></script>
 * Não altera HTML existente. Cria e gere um painel próprio no bloco do WIN.
 */
(function (w, d) {
  if (w.__IDMAR_WIN_CERT_V12__) return; w.__IDMAR_WIN_CERT_V12__ = true;

  const LS_KEY = "IDMAR_LANG";
  const t = (pt, en) =>
    ((localStorage.getItem(LS_KEY) || d.documentElement.getAttribute("lang") || "pt")
      .toLowerCase() === "en" ? en : pt);
  const qs = (s, r) => (r || d).querySelector(s);

  // -------- Helpers: parse do ano do modelo a partir de HIN/CIN --------
  function sanitize(x) {
    return String(x || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase().trim();
  }
  function fix2(n) { return (n >= 70 ? 1900 + n : 2000 + n); }
  function parseModelYear(code) {
    const c = sanitize(code); if (!c) return null;
    // EU CIN (ISO 10087): 14 chars, últimos 2 dígitos = ano modelo
    if (c.length === 14 && /^\w{14}$/.test(c)) {
      const yy = c.slice(-2); if (/^\d{2}$/.test(yy)) return fix2(+yy);
    }
    // US HIN (1984+): 12 chars, últimos 2 dígitos = ano modelo
    if (c.length === 12 && /^\w{12}$/.test(c)) {
      const yy = c.slice(-2); if (/^\d{2}$/.test(yy)) return fix2(+yy);
    }
    // Fallback: 2 dígitos finais
    const m = c.match(/(\d{2})$/);
    if (m) return fix2(+m[1]);
    return null;
  }

  // -------- Regras do certificado --------
  function rule(year, flags) {
    if (year == null) return {
      level: "info", code: "CE_UNKNOWN",
      title: t("Certificado de Conformidade", "Certificate of Conformity"),
      detail: t("Sem ano de modelo — não é possível determinar obrigação CE.",
                "No model year — cannot determine CE obligation.")
    };
    if (year < 1998) return {
      level: "ok", code: "CE_NOT_REQUIRED",
      title: t("Certificado de Conformidade", "Certificate of Conformity"),
      detail: t("Dispensado (anterior a 1998 — fora do âmbito RCD).",
                "Not required (before 1998 — outside RCD scope).")
    };
    // Construção amadora ou importado usado extra-UE → PCA
    if (flags.pca) return {
      level: "warn", code: "CE_PCA_REQUIRED",
      title: t("Certificado de Conformidade (PCA)", "Certificate of Conformity (PCA)"),
      detail: t("Requer Avaliação Pós-Construção (PCA) com Declaração UE de Conformidade.",
                "Requires Post Construction Assessment (PCA) with EU Declaration of Conformity.")
    };
    if (year >= 2016) return {
      level: "need", code: "CE_EU_DOC_REQUIRED",
      title: t("Declaração UE de Conformidade", "EU Declaration of Conformity"),
      detail: t("Obrigatória ao abrigo da Diretiva 2013/53/EU (RCD II).",
                "Mandatory under Directive 2013/53/EU (RCD II).")
    };
    return {
      level: "need", code: "CE_DOC_REQUIRED",
      title: t("Declaração de Conformidade CE", "CE Declaration of Conformity"),
      detail: t("Obrigatória ao abrigo da Diretiva 94/25/CE (RCD I).",
                "Mandatory under Directive 94/25/EC (RCD I).")
    };
  }

  // -------- UI --------
  function badge(r) {
    const colors = { ok: "#065f46", need: "#7c2d12", warn: "#92400e", info: "#1f2937" };
    const bgs = { ok: "#10b98120", need: "#ef444420", warn: "#f59e0b20", info: "#6b728020" };
    return `<span style="display:inline-block;padding:.15rem .55rem;border-radius:999px;background:${bgs[r.level]};color:${colors[r.level]};font-weight:600">${r.title}</span>`;
  }

  function ensurePanel() {
    let host = qs("#winCertPanel");
    if (host) return host;

    host = d.createElement("section");
    host.id = "winCertPanel";
    host.style.cssText =
      "margin-top:.75rem;border:1px solid var(--border,#e5e7eb);border-radius:12px;padding:.8rem 1rem;background:var(--bg-elev,#fff)";
    const anchor =
      qs("#winOut") || qs("#winResult") || qs("#interpWinBody")?.parentElement ||
      qs("#formWin") || qs("main") || d.body;
    anchor.appendChild(host);

    // flags + “certificado apresentado”
    const controls = d.createElement("div");
    controls.style.cssText = "display:flex;gap:10px;flex-wrap:wrap;margin:0 0 .5rem 0";
    controls.innerHTML = `
      <label style="display:flex;gap:.35rem;align-items:center">
        <input type="checkbox" id="flagHome"> <span>${t("Construção amadora","Home-built")}</span>
      </label>
      <label style="display:flex;gap:.35rem;align-items:center">
        <input type="checkbox" id="flagImported"> <span>${t("Importado usado (extra-UE)","Imported used (non-EU)")}</span>
      </label>
      <label style="display:flex;gap:.35rem;align-items:center;margin-left:auto">
        <input type="checkbox" id="certPresented"> <span>${t("Certificado apresentado","Certificate presented")}</span>
      </label>`;
    host.appendChild(controls);

    const body = d.createElement("div");
    body.id = "winCertBody";
    host.appendChild(body);

    controls.addEventListener("change", () => render());
    return host;
  }

  function currentWIN() {
    const el = qs("#win") || qs("#hin") || qs('input[name="win"]');
    return el ? el.value : "";
  }

  function render() {
    const host = ensurePanel();
    const body = qs("#winCertBody", host);
    const year = parseModelYear(currentWIN());
    const flags = { pca: (qs("#flagHome", host)?.checked || qs("#flagImported", host)?.checked) };
    const r = rule(year, flags);

    body.innerHTML = `
      <div style="display:flex;gap:.5rem;align-items:center;flex-wrap:wrap;margin:.25rem 0 .35rem 0">
        ${badge(r)}
        <small style="opacity:.8">${t("Modelo","Model year")}: ${year ?? "—"}</small>
      </div>
      <div style="font-size:.95em;opacity:.9;margin-top:.2rem">${r.detail}</div>`;
  }

  function hook() {
    const input = qs("#win") || qs("#hin") || qs('input[name="win"]');
    if (input && !input.__win_cert_hook) {
      input.__win_cert_hook = true;
      input.addEventListener("input", render);
    }
    render();
    // Reagir a alterações no bloco de resultados
    try {
      const targets = [qs("#winOut"), qs("#winResult"), qs("#interpWinBody")?.parentElement].filter(Boolean);
      const mo = new MutationObserver(render);
      targets.forEach(t => mo.observe(t, { childList: true, subtree: true }));
    } catch (e) {}
    // Mudança de idioma
    d.addEventListener("idmar:ui-updated", render);
    w.addEventListener("storage", e => { if (e.key === LS_KEY) render(); });
  }

  function boot() {
    if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", hook);
    else hook();
  }
  boot();
})(window, document);
