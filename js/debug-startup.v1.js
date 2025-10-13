// debug-startup.v1.js — surfaces JS errors early to help diagnose blank pages
(function(){
  function banner(msg){
    var b = document.createElement('div');
    b.style.position='fixed'; b.style.top='0'; b.style.left='0'; b.style.right='0';
    b.style.zIndex='99999'; b.style.background='#fee2e2'; b.style.color='#991b1b';
    b.style.font='14px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Arial, sans-serif';
    b.style.padding='8px 12px'; b.style.borderBottom='1px solid #fecaca';
    b.textContent = msg;
    document.body ? document.body.appendChild(b) : document.addEventListener('DOMContentLoaded', ()=>document.body.appendChild(b));
  }
  window.addEventListener('error', function(ev){
    banner('[JS ERROR] ' + (ev.message||'unknown') + (ev.filename? ' @ '+ev.filename+':'+ev.lineno:''));
  });
  window.addEventListener('unhandledrejection', function(ev){
    banner('[PROMISE REJECTION] ' + (ev.reason && (ev.reason.message||String(ev.reason))));
  });
})();
