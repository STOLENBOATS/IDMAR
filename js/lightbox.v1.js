// js/lightbox.v1.js
(function(){
  function ensureOverlay(){
    let back = document.querySelector('.miec-lightbox-backdrop');
    if (back) return back;
    back = document.createElement('div');
    back.className = 'miec-lightbox-backdrop';
    back.innerHTML = '<div class="miec-lightbox-close">Fechar ✕</div><div class="miec-lightbox-frame"><img alt="preview"/></div>';
    document.body.appendChild(back);
    back.addEventListener('click', (e)=>{
      if (e.target === back || e.target.classList.contains('miec-lightbox-close')) back.classList.remove('show');
    });
    return back;
  }
  function open(src){
    const back = ensureOverlay();
    back.querySelector('img').src = src;
    back.classList.add('show');
  }
  document.addEventListener('click', (e)=>{
    const t = e.target;
    if (t && t.tagName === 'IMG' && (t.classList.contains('thumb') || t.closest('.result,.forense,.card'))){
      if (t.naturalWidth > 200 || t.naturalHeight > 200){
        e.preventDefault(); open(t.src);
      }
    }
  }, true);
})();