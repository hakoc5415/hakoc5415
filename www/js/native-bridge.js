// Native glue for the Capacitor wrapper around the offline RO! bundle.
// Loaded after www/js/vendor/{capacitor,haptics,app,status-bar,splash-screen}.js.
// Runs only inside the native shell — falls back to plain web behavior (this file
// no-ops) if window.Capacitor isn't present, e.g. when the offline HTML is opened
// directly in a desktop browser for design review.
(function () {
  if (!window.Capacitor || !window.Capacitor.isNativePlatform || !window.Capacitor.isNativePlatform()) return;

  // ---------- Haptics shim ----------
  // The prototype calls navigator.vibrate(ms | pattern). iOS WKWebView has no
  // vibrate API at all; Android's is unreliable inside webviews. Route both
  // through @capacitor/haptics, keeping the intensity bands from the README:
  // ~10ms tap, ~25ms hit, ~60ms miss, [30,40,30] perfect (pattern array).
  if (window.capacitorHaptics) {
    var Haptics = window.capacitorHaptics.Haptics;
    var ImpactStyle = window.capacitorHaptics.ImpactStyle;
    var NotificationType = window.capacitorHaptics.NotificationType;
    navigator.vibrate = function (pattern) {
      try {
        if (Array.isArray(pattern)) {
          Haptics.notification({ type: NotificationType.Success }); // PERFECT
        } else if (pattern > 40) {
          Haptics.impact({ style: ImpactStyle.Heavy }); // miss
        } else if (pattern >= 20) {
          Haptics.impact({ style: ImpactStyle.Medium }); // hit
        } else {
          Haptics.impact({ style: ImpactStyle.Light }); // tap
        }
      } catch (e) { /* haptics are best-effort */ }
      return true;
    };
  }

  // ---------- WebAudio lifecycle ----------
  // Wrap the global AudioContext constructor so background/foreground can
  // suspend/resume every context the game creates, without reaching into the
  // game's private state. Needed because iOS suspends WebAudio on background
  // but Capacitor's WebView doesn't always resume it automatically.
  var NativeAC = window.AudioContext || window.webkitAudioContext;
  var audioContexts = [];
  if (NativeAC) {
    var WrappedAC = function () {
      var ctx = new (Function.prototype.bind.apply(NativeAC, [null].concat([].slice.call(arguments))))();
      audioContexts.push(ctx);
      return ctx;
    };
    WrappedAC.prototype = NativeAC.prototype;
    window.AudioContext = WrappedAC;
    window.webkitAudioContext = WrappedAC;
  }

  if (window.capacitorApp) {
    window.capacitorApp.App.addListener('appStateChange', function (state) {
      audioContexts.forEach(function (ctx) {
        try {
          if (state.isActive) ctx.resume(); else ctx.suspend();
        } catch (e) { /* ignore */ }
      });
    });
  }

  // ---------- Status bar ----------
  if (window.capacitorStatusBar) {
    var StatusBar = window.capacitorStatusBar.StatusBar;
    var Style = window.capacitorStatusBar.Style;
    try {
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#06101e' });
      StatusBar.setOverlaysWebView({ overlay: true });
    } catch (e) { /* ignore on platforms that don't support one of these */ }
  }

  // ---------- Splash screen ----------
  // launchShowDuration in capacitor.config.json already auto-hides it; this is
  // a safety net in case that's ever turned off.
  if (window.capacitorSplashScreen) {
    window.addEventListener('load', function () {
      try { window.capacitorSplashScreen.SplashScreen.hide(); } catch (e) { /* ignore */ }
    });
  }
})();
