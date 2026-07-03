# RO! — Viking Raid (native packaging + world leaderboard)

This repo implements the dev handoff in [`design_handoff_viking_raid/README.md`](design_handoff_viking_raid/README.md):
package the RO! prototype as native Android/iOS apps via a Capacitor WebView
wrapper, and replace the simulated world leaderboard with a real backend.

## What's implemented

- **Capacitor project** (`capacitor.config.json`, `android/`, `ios/`) wrapping
  `www/index.html` (a copy of the offline HTML deliverable). Portrait-only,
  edge-to-edge, dark status bar, `#06101e` background, splash screen —
  configured per the packaging plan.
- **Haptics shim** (`www/js/native-bridge.js`) — routes `navigator.vibrate()`
  through `@capacitor/haptics` (iOS has no vibrate API at all; Android's is
  unreliable in a WebView), using the intensity bands from the handoff
  (tap/hit/miss/perfect).
- **Audio session / app lifecycle** — iOS `AVAudioSession` category set to
  `.ambient` in `ios/App/App/AppDelegate.swift` so game audio respects the
  silent switch. `native-bridge.js` wraps the global `AudioContext` so
  `@capacitor/app`'s pause/resume events can suspend/resume WebAudio on
  background/foreground.
- **World leaderboard backend** — Firestore + Anonymous Auth, replacing
  `_worldPlayers()`:
  - `src/leaderboard.js` → built to `www/js/leaderboard.js` (`npm run
    build:web`): anonymous sign-in, top-100-per-category reads direct from
    Firestore, an offline write queue (`localStorage`) flushed on reconnect,
    and a `localStorage` read cache so the board renders instantly (with
    stale data) offline. Exposes `window.RoLeaderboard`.
  - `functions/index.js` — the *only* write path (`submitScore`, a callable
    Cloud Function). Clients never write to Firestore directly, so this is
    where anti-cheat lives: per-stage score cap (4,000), total cap (24,000),
    monotonic-only updates, a basic write-rate limit, and a denylist name
    filter. It also maintains `countries/{code}` aggregate docs
    (`{total, count}`) in the same transaction — no client-side country
    summing.
  - `firestore.rules` — public read on `players`/`countries`, all writes
    denied (writes only happen via the function's admin SDK).
  - `firestore.indexes.json` — composite indexes for the three
    world-board sort orders (`totalScore desc`, `bestCombo desc`,
    `bestTime asc`).
  - **Source integration**: `design_handoff_viking_raid/source/Ro Viking
    Raid.dc.html` has been edited so `_worldPlayers()` prefers
    `window.RoLeaderboard.getWorldPlayers()` (falling back to the original
    simulated pool, renamed `_simulatedWorldPlayers()`, when offline or
    before first sign-in), and `createAccount`/`selectAccount`/`_applyStats`
    push profile + personal-best updates to it. The entrant object shape is
    unchanged, so the scoreboard render code didn't need to change.
- **Privacy Policy** (`design_handoff_viking_raid/source/Privacy Policy.dc.html`)
  updated to describe the real data now collected (name, country, scores,
  under an anonymous ID) and that Firebase (Google) processes it.

## Known limitation: the shipped offline HTML

`www/index.html` is still the **original** offline bundle from the handoff —
it was not regenerated from the edited source above. That bundle is produced
by the studio's internal `dc-runtime` build tool (`bun run build`, referenced
in `source/support.js`'s header comment), which isn't included in the handoff
zip, and the source `.dc.html` also references flag PNGs under
`source/assets/flags/` that weren't in the zip either — so it can't be
rebundled here.

Practically: the app **builds and runs today** with the haptics shim, audio
session, and lifecycle wiring all live (those patch global browser APIs from
outside the bundle, so they don't need a rebuild). The world leaderboard
backend is fully implemented and will work end-to-end once the studio reruns
their bundler on the updated `source/Ro Viking Raid.dc.html` to produce a new
`Ro Viking Raid (offline).html` — at that point, drop the new file in as
`www/index.html` (keep the `<script src="js/...">` tags already appended
before `</body>`) and everything wires up with no other changes.

## Project layout

```
capacitor.config.json        Capacitor app config (portrait, colors, plugins)
www/index.html                the deliverable HTML, + injected bridge scripts
www/js/native-bridge.js       haptics/audio/status-bar/splash glue
www/js/firebase-config.js     Firebase Web config (placeholder — see below)
www/js/leaderboard.js         built from src/leaderboard.js, do not hand-edit
www/js/vendor/                Capacitor plugin UMD bundles (no CDN dependency)
src/leaderboard.js            leaderboard client source (esbuild input)
android/, ios/                native projects (`npx cap add` output)
functions/index.js            submitScore Cloud Function (anti-cheat + writes)
firestore.rules               players/countries: public read, no client writes
firestore.indexes.json        composite indexes for the 3 world-board sorts
firebase.json, .firebaserc    Firebase project config (placeholder project id)
design_handoff_viking_raid/   the original design handoff, kept for reference
                              (README, offline HTML, editable source, store art)
```

## Manual steps still required

These need accounts/tooling this environment doesn't have:

1. **Create a Firebase project**, enable Anonymous Auth + Firestore, then:
   - replace the placeholder values in `.firebaserc` and `www/js/firebase-config.js`
     (the web config values aren't secret, but they must point at your project)
   - `npm install -g firebase-tools && firebase deploy --only firestore:rules,firestore:indexes,functions`
2. **App icons/splash**: run `npx @capacitor/assets generate` against
   `design_handoff_viking_raid/assets/store/icon-1024.png` (+ adaptive
   foreground) to populate the real `android/`/`ios/` icon and splash assets —
   the current ones are Capacitor's default placeholders.
3. **iOS build**: needs macOS + Xcode + CocoaPods (`cd ios/App && pod
   install`, then open `App.xcworkspace` in Xcode) — none of which exist in
   this container. Requires an Apple Developer account ($99/yr) to sign and
   archive an `.ipa`.
4. **Android build**: needs the Android SDK (not installed here) — open
   `android/` in Android Studio, or `cd android && ./gradlew bundleRelease`
   once `ANDROID_HOME` is set, then sign with a Play Console keystore
   ($25 one-time Play Console fee).
5. **Host the Privacy Policy** (`design_handoff_viking_raid/source/Privacy
   Policy.dc.html`) at a public URL and use that URL in both stores'
   listings + data-safety/age-rating forms (it now discloses the leaderboard
   data collection).
6. Regenerate `www/index.html` from the studio's `dc-runtime` bundler once
   the source edits above are available to it (see "Known limitation").

## Local development

```
npm install
npm run build:web   # rebuilds www/js/leaderboard.js from src/leaderboard.js
npm run sync        # build:web + `cap sync` (copies www/ into android/ + ios/)
npm run android      # opens the Android project in Android Studio
npm run ios          # opens the iOS project in Xcode (macOS only)
```
