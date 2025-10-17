
// cards-layout-fix2.js — Aggressive runtime layout fix to place Card 3 beside Card 2
(function(d){
  function qs(sel,ctx){ return (ctx||d).querySelector(sel); }
  function qsa(sel,ctx){ return Array.from((ctx||d).querySelectorAll(sel)); }
  function getCard3(){ return d.getElementById('card-motor-quick'); }
  function getSecondCard(){
    var list = qsa('main .card');
    return list.length >= 2 ? list[1] : null;
  }
  function nearestCommonAncestor(a,b){
    if(!a || !b) return null;
    var s = new Set();
    var n=a; while(n){ s.add(n); n=n.parentElement; }
    n=b; while(n){ if(s.has(n)) return n; n=n.parentElement; }
    return null;
  }
  function ensure(){
    var c3 = getCard3();
    var c2 = getSecondCard();
    if(!c3 || !c2) return;
    if(c3.parentElement && c3.parentElement.classList.contains('cards-row')) return;
    var root = nearestCommonAncestor(c2,c3) || d.querySelector('main') || d.body;
    // Create wrapper and place both cards as direct children (flatten wrappers using display:contents)
    var wrap = d.createElement('div');
    wrap.className = 'cards-row';
    // strong CSS
    var style = d.createElement('style');
    style.textContent = [
      '.cards-row{display:grid!important;grid-template-columns:1fr 1fr!important;gap:1rem!important;align-items:start!important}',
      '.cards-row>.card{width:auto!important;max-width:100%!important;margin:0!important}',
      '@media(max-width:1024px){.cards-row{grid-template-columns:1fr!important}}'
    ].join('');
    d.head.appendChild(style);
    // Insert wrapper before c2 (pref)
    root.insertBefore(wrap, c2.closest('.card') || c2);
    // Move c2 and c3 into wrapper
    wrap.appendChild(c2.closest('.card') || c2);
    wrap.appendChild(c3.closest('.card') || c3);
    // Neutralize immediate wrappers of cards if any
    [c2, c3].forEach(function(card){
      var p = card.parentElement;
      if (p && p !== wrap && !p.classList.contains('cards-row')){
        p.style.display = 'contents';
      }
      card.style.width = 'auto'; card.style.maxWidth = '100%'; card.style.margin = '0';
    });
  }
  if (d.readyState !== 'loading') { setTimeout(ensure, 0); } else { d.addEventListener('DOMContentLoaded', ensure); }
})(document);
