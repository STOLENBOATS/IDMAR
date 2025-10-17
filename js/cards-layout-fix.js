// Forces Card 3 (#card-motor-quick) to sit beside the previous .card as a 2-col grid.
// Works even if legacy CSS sets widths/margins.
(function(d){
  function $(sel,ctx){return Array.from((ctx||d).querySelectorAll(sel));}
  function ensure(){
    var c3 = d.getElementById('card-motor-quick');
    if(!c3) return;
    // find previous sibling with .card, walking up if necessary
    var prev = c3.previousElementSibling;
    while(prev && !prev.classList.contains('card')) prev = prev.previousElementSibling;
    if(!prev) return;
    // If already wrapped, skip
    if (c3.parentElement && c3.parentElement.classList.contains('cards-row')) return;
    var wrap = d.createElement('div');
    wrap.className = 'cards-row';
    // apply strong styles
    wrap.style.display = 'grid';
    wrap.style.gridTemplateColumns = '1fr 1fr';
    wrap.style.gap = '1rem';
    // insert before prev, then move nodes
    prev.parentElement.insertBefore(wrap, prev);
    wrap.appendChild(prev);
    wrap.appendChild(c3);
    // defensive overrides
    [prev, c3].forEach(function(el){
      el.style.width = 'auto';
      el.style.maxWidth = '100%';
      el.style.margin = '0';
    });
    var style = d.createElement('style');
    style.textContent = '.cards-row{display:grid!important;grid-template-columns:1fr 1fr!important;gap:1rem!important;align-items:start!important}'+
                        '.cards-row>.card{width:auto!important;max-width:100%!important;margin:0!important}'+
                        '@media(max-width:1024px){.cards-row{grid-template-columns:1fr!important}}';
    d.head.appendChild(style);
  }
  if (d.readyState !== 'loading') ensure(); else d.addEventListener('DOMContentLoaded', ensure);
})(document);