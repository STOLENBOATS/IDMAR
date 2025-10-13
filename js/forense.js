(function(){
  let n=1;
  document.querySelectorAll('[data-figure]').forEach(f=>{
    const cap = f.querySelector('.caption .auto');
    if(cap){ cap.textContent = 'Figura ' + (n++); }
  });
})();