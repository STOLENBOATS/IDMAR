
// IDMAR — forense-enable-uploader.r1
// Liga o input de ficheiro e mostra preview no #forenseWorkspace
(() => {
  const pick = document.getElementById('forensePick')
           || document.querySelector('input[type="file"]#evidenceFile')
           || document.querySelector('input[type="file"][data-forense]')
           || document.querySelector('input[type="file"]');
  if (!pick) { console.warn('[forense-enable-uploader.r1] sem input'); return; }

  const host = document.getElementById('forenseWorkspace')
           || document.querySelector('[data-forense-workspace]');

  pick.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (host) {
      const url = URL.createObjectURL(f);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); };
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.src = url;
      host.replaceChildren(img);
    }
    console.log('[forense-enable-uploader.r1] preview ok:', f.name);
  });

  console.log('[forense-enable-uploader.r1] ligado');
})();
