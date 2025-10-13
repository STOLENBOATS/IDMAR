// js/i18n-core.js (patched)
(function () {
  const LS_KEY = "IDMAR_LANG";
  const DEFAULT = "pt";

  const I18N = {
    lang: localStorage.getItem(LS_KEY) || DEFAULT,
    dict: {},

    use(lang) {
      this.lang = lang;
      localStorage.setItem(LS_KEY, lang);
      this.apply();
    },

    // PATCH: apply immediately when dictionary loads
    load(dict) {
      this.dict = dict || {};
      this.apply();
    },

    t(key, vars = {}) {
      const entry = (this.dict[this.lang] && this.dict[this.lang][key]) || key;
      return entry.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
    },

    apply(root = document) {
      // data-i18n
      root.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        const txt = this.t(key);
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          if (el.hasAttribute("placeholder")) el.placeholder = txt;
          else el.value = txt;
        } else {
          el.textContent = txt;
        }
      });

      // data-i18n-attr="title:ns.key,aria-label:ns.key2"
      root.querySelectorAll("[data-i18n-attr]").forEach(el => {
        const pairs = el.getAttribute("data-i18n-attr").split(",").map(s => s.trim());
        pairs.forEach(p => {
          const [attr, key] = p.split(":").map(s => s.trim());
          el.setAttribute(attr, I18N.t(key));
        });
      });
    }
  };

  window.I18N = I18N;
  document.addEventListener("DOMContentLoaded", () => I18N.apply());
})();