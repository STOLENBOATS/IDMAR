(function(){
  const ribbon = document.getElementById('navRibbon');
  function show(target){
    document.querySelectorAll('section[id^="sec-"]').forEach(s=> s.hidden = true);
    document.querySelector(target).hidden = false;
  }
  ribbon?.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-target]');
    if (!btn) return;
    const to = btn.getAttribute('data-target');
    show(to);
  });
  show('#sec-win');
})();
