
// js/engine-history.v1.js
(function (w) {
  'use strict';
  const KEY = 'IDMAR_ENGINE_HISTORY';
  const MAX = 1000;

  function _load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch (e) { return []; }
  }
  function _save(list) {
    localStorage.setItem(KEY, JSON.stringify(list, null, 2));
  }

  function save(entry) {
    const now = Date.now();
    const rec = Object.assign({ ts: now }, entry || {});
    const list = _load();
    list.unshift(rec);
    while (list.length > MAX) list.pop();
    _save(list);
    return rec;
  }

  function all() { return _load(); }
  function clear() { localStorage.removeItem(KEY); }
  function removeByTs(ts) {
    const list = _load().filter(x => String(x.ts) !== String(ts));
    _save(list);
  }
  function toCSV(arr) {
    arr = Array.isArray(arr) ? arr : _load();
    if (!arr.length) return 'timestamp,brand,model,serial,notes,family.version,family.power\n';
    const head = ['timestamp','brand','model','serial','notes','family.version','family.power'];
    const lines = [head.join(',')];
    for (const r of arr) {
      const row = [
        new Date(r.ts||Date.now()).toISOString(),
        (r.brand||'').replace(/,/g,' '),
        (r.model||'').replace(/,/g,' '),
        (r.serial?.raw||r.serial||'').toString().replace(/,/g,' '),
        (r.notes||'').toString().replace(/[\r\n,]+/g,' ').slice(0,400),
        (r.family?.version||'').toString().replace(/,/g,' '),
        (r.family?.power||'').toString().replace(/,/g,' ')
      ];
      lines.push(row.join(','));
    }
    return lines.join('\n') + '\n';
  }

  w.EngineHistory = { save, all, clear, removeByTs, toCSV };
})(window);
