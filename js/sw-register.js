(function () {
  if (!('serviceWorker' in navigator)) return;
  const swUrl = new URL('./sw.js', location).toString();
  navigator.serviceWorker.register(swUrl, { scope: './' })
    .catch(err => console.error('[IDMAR][SW] register failed:', err));
})();
