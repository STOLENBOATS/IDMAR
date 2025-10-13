(function(){
  const saved = localStorage.getItem(NAV.THEME_KEY);
  if(saved==='light'){ document.documentElement.classList.add('light'); }
  const footer = document.getElementById('footerDynamic');
  if (footer) footer.textContent = NAV.BUILD + " · " + new Date().toLocaleString();
  const toggle = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  function setIcon(){ if(icon){ icon.textContent = document.documentElement.classList.contains('light') ? '🌙' : '☀️'; } }
  setIcon();
  if (toggle) {
    toggle.addEventListener('click', ()=>{
      document.documentElement.classList.toggle('light');
      localStorage.setItem(NAV.THEME_KEY, document.documentElement.classList.contains('light') ? 'light' : 'dark');
      setIcon();
    });
  }
})();