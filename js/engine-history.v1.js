// js/engine-history.v1.js — guarda e lista registos de motores (localStorage)
(function(w, d){
  'use strict';
  const KEY = 'IDMAR_ENGINE_HISTORY';
  const MAX = 1000;

  function nowISO(){ return new Date().toISOString(); }

  function load(){
    try{ return JSON.parse(localStorage.getItem(KEY)||'[]'); }
    catch(e){ return []; }
  }
  function saveList(list){
    localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX)));
    try{ w.dispatchEvent(new Event('idmar:engine-history-changed')); }catch(e){}
  }

  function save(payload){
    const entry = {
      ts: nowISO(),
      brand: payload?.brand || '',
      model: (payload?.model || '').trim(),
      family: payload?.family || null,
      power: payload?.family?.power || null,
      serial: payload?.serial?.raw || '',
      serial_kind: payload?.serial?.kind || 'auto',
      notes: payload?.notes || '',
      extra: payload?.extra || {}
    };
    const list = load();
    list.push(entry);
    saveList(list);
    return entry;
  }

  function all(){ return load().slice().reverse(); }
  function clear(){ saveList([]); }
  function removeByTs(ts){
    const list = load().filter(e => e.ts !== ts);
    saveList(list);
  }

  function toCSV(list){
    const cols=['ts','brand','model','power','serial','serial_kind','notes'];
    const esc=v=>`"${String(v||'').replace(/"/g,'""')}"`;
    return [cols.join(',')].concat(list.map(e=>cols.map(c=>esc(e[c])).join(','))).join('\n');
  }


    const cols = ['ts','brand','model','power','serial','serial_kind','notes'];
    const esc = v => '"' + String(v||'').replace(/"/g,'""') + '"';
  }

  w.EngineHistory = { save, all, clear, removeByTs, toCSV };
})(window, document);
