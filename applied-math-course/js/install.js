/* Offline support and "Install app" button for the web version.
   Service workers only run over http(s) (e.g. `npm run serve` or a hosted copy), never from file:// or inside the desktop app. */
(function () {
  'use strict';
  let framed = false; try { framed = window.top !== window.self; } catch (e) { framed = true; }
  if (window.desktop || framed || !/^https?:$/.test(location.protocol) || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => { /* offline mode unavailable; the app still works online */ }); });
  let deferred = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferred = e;
    const bar = document.querySelector('.top-inner'); if (!bar || document.getElementById('install-btn')) return;
    const b = document.createElement('button'); b.id = 'install-btn'; b.type = 'button'; b.className = 'btn btn-primary btn-sm'; b.textContent = 'Install app';
    b.addEventListener('click', async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice.catch(() => null); deferred = null; b.remove(); });
    bar.insertBefore(b, document.getElementById('theme-btn'));
  });
  window.addEventListener('appinstalled', () => { const b = document.getElementById('install-btn'); if (b) b.remove(); });
})();
