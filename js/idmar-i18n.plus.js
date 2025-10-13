/* IDMAR i18n (plus) — History/Validator/Login/Forense */
(() => {
  const DICT = {
    pt: {
      app: { name: "IDMAR", subtitle: "Identificação Marítima — Cascos & Motores" },
      nav: { validator:"Validador", hist_win:"Histórico WIN", hist_motor:"Histórico Motor", forense:"Forense", logout:"Sair" },
      login: {
        title:"Iniciar sessão", lead:"Aceda com as suas credenciais.",
        user_label:"Utilizador", user_ph:"nome.apelido",
        pass_label:"Palavra-passe", pass_ph:"••••••••",
        remember:"Lembrar sessão", signin:"Entrar",
        forgot:"Esqueci-me da palavra-passe", lang:"Idioma"
      },
      validator: {
        title:"Validador",
        win: { label:"WIN / HIN", validate:"Validar WIN", invalid:(p)=>`WIN inválido: ${p.win}`, valid:"WIN válido" },
        motor:{ title:"Validador de Motor", validate:"Validar Motor" }
      },
      history: {
        title_win:"Histórico WIN",
        title_motor:"Histórico Motor",
        filters:"Filtros",
        state:"Estado",
        date_range:"Intervalo de datas",
        search:"Pesquisa",
        search_ph:"WIN / S/N / Marca",
        latest_first:"Mais recente primeiro",
        export_csv:"Exportar CSV",
        table:{
          ts:"Data/Hora",
          win:"WIN / HIN",
          sn:"S/N",
          brand:"Marca",
          model:"Modelo",
          state:"Estado",
          reason:"Justificação",
          photo:"Foto"
        },
        state_ok:"Válido",
        state_err:"Inválido"
      },
      forense: {
        title:"Forense — Índice",
        load:"Carregar evidências",
        context_win:"Contexto: WIN/HIN",
        context_motor:"Contexto: Motor",
        attach:"Anexar ao histórico mais recente",
        workspace:"Workspace",
        lightbox:"Abrir lightbox",
        compare:"Comparar",
        annotate:"Anotar (rect)",
        clear:"Limpar anotações",
        export_png:"Exportar PNG anotado",
        save_bundle:"Guardar “bundle” (JSON)",
        notes:"Observações técnicas…",
        commit_attach:"Commit & Anexar"
      }
    },
    en: {
      app: { name: "IDMAR", subtitle: "Maritime Identification — Hulls & Engines" },
      nav: { validator:"Validator", hist_win:"WIN History", hist_motor:"Engine History", forense:"Forensics", logout:"Sign out" },
      login: {
        title:"Sign in", lead:"Access with your credentials.",
        user_label:"User", user_ph:"name.surname",
        pass_label:"Password", pass_ph:"••••••••",
        remember:"Remember me", signin:"Sign in",
        forgot:"Forgot your password?", lang:"Language"
      },
      validator: {
        title:"Validator",
        win: { label:"WIN / HIN", validate:"Validate WIN", invalid:(p)=>`Invalid WIN: ${p.win}`, valid:"Valid WIN" },
        motor:{ title:"Engine Validator", validate:"Validate Engine" }
      },
      history: {
        title_win:"WIN History",
        title_motor:"Engine History",
        filters:"Filters",
        state:"State",
        date_range:"Date range",
        search:"Search",
        search_ph:"WIN / S/N / Brand",
        latest_first:"Latest first",
        export_csv:"Export CSV",
        table:{
          ts:"Date/Time",
          win:"WIN / HIN",
          sn:"S/N",
          brand:"Brand",
          model:"Model",
          state:"State",
          reason:"Reason",
          photo:"Photo"
        },
        state_ok:"Valid",
        state_err:"Invalid"
      },
      forense: {
        title:"Forensics — Index",
        load:"Load evidence",
        context_win:"Context: WIN/HIN",
        context_motor:"Context: Engine",
        attach:"Attach to latest record",
        workspace:"Workspace",
        lightbox:"Open lightbox",
        compare:"Compare",
        annotate:"Annotate (rect)",
        clear:"Clear annotations",
        export_png:"Export annotated PNG",
        save_bundle:"Save bundle (JSON)",
        notes:"Technical notes…",
        commit_attach:"Commit & Attach"
      }
    }
  };

  const Lang = {
    get(){ try{ return localStorage.getItem('lang') || auto(); }catch(_){ return auto(); } },
    set(v){ try{ localStorage.setItem('lang', v); }catch(_){} }
  };
  function auto(){ return (navigator.language||'en').toLowerCase().startsWith('pt') ? 'pt' : 'en'; }
  function resolve(obj, path){ return path.split('.').reduce((o,k)=> (o && o[k] != null ? o[k] : undefined), obj); }
  function t(key, params){ const lang=Lang.get(); const entry=resolve(DICT[lang], key) ?? resolve(DICT.pt, key); return (typeof entry==='function') ? entry(params||{}) : (entry ?? key); }
  function apply(root=document){
    const lang = Lang.get();
    root.querySelectorAll('[data-i18n]').forEach(el=>{ const k=el.getAttribute('data-i18n'); const v=t(k); if(v!=null) el.textContent=v; });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{ const k=el.getAttribute('data-i18n-placeholder'); const v=t(k); if(v!=null) el.setAttribute('placeholder', v); });
    root.querySelectorAll('[data-i18n-aria]').forEach(el=>{ const k=el.getAttribute('data-i18n-aria'); const v=t(k); if(v!=null) el.setAttribute('aria-label', v); });
    document.documentElement.setAttribute('lang', lang);
    const btn=document.getElementById('idmar-lang-toggle'); if(btn) btn.textContent=lang.toUpperCase();
    const appName=document.querySelector('[data-i18n-appname]'); if(appName) appName.textContent=t('app.name');
    const appSub=document.querySelector('[data-i18n-appsub]');   if(appSub) appSub.textContent=t('app.subtitle');
    document.querySelectorAll('[data-i18n-nav]').forEach(a=>{ const key=a.getAttribute('data-i18n-nav'); a.textContent=t(key); });
  }
  window.IDMAR_I18N = { t, apply, set(l){ Lang.set(l); apply(); }, get: Lang.get };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ()=>apply());
  else apply();
})();