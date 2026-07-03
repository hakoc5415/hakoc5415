// Runtime compatibility fixes for the offline game bundle, applied without
// rebundling (the studio's dc-runtime bundler isn't part of this project).
// Loaded after the game in www/index.html. Safe in every browser and in the
// native Capacitor WebView.
(function () {
  'use strict';

  // ---- Fix 1: RO! button on touch devices ----
  // The bundle's template binds the RO! button with `onpointerdown`, but the
  // dc-runtime event map has no entry for pointer events, so the handler is
  // never wired up (desktop testing used the Space key, which works). The
  // full-width, 84px-tall action button is the ONLY 84px button in the whole
  // UI, so we can recognise it reliably: when it's pressed, replay the game's
  // existing Space-key path, which calls ro(). No double-fire risk because the
  // native pointer handler doesn't bind at all.
  function fireRo() {
    window.dispatchEvent(new KeyboardEvent('keydown', {
      code: 'Space', key: ' ', keyCode: 32, which: 32, bubbles: true,
    }));
  }
  function roButtonFrom(el) {
    var btn = el && el.closest ? el.closest('button') : null;
    return btn && btn.style && btn.style.height === '84px' ? btn : null;
  }
  window.addEventListener('pointerdown', function (e) {
    if (roButtonFrom(e.target)) { e.preventDefault(); fireRo(); }
  }, true);
  // Fallback only where PointerEvent is unavailable (old WebViews).
  window.addEventListener('touchstart', function (e) {
    if (!('PointerEvent' in window) && roButtonFrom(e.target)) {
      e.preventDefault();
      fireRo();
    }
  }, { capture: true, passive: false });
})();
