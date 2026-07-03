# Handoff: RO! — Viking Raid (Mobile Game, Android + iOS)

## Overview
RO! is a one-button rhythm/timing arcade game. The player is a Norwegian football fan "rowing" a viking longship to the 2026 World Cup final in America. Core loop: a line sweeps across a timing meter; the player taps **RO!** while the line is inside the gold zone (red center = PERFECT). Misses cost shields (lives). Six themed stages (fjord, bridge, royal palace, parliament, Times Square, stadium penalty-shootout finale), local player profiles with countries, rank tiers, and a leaderboard.

**Goal of this handoff:** package the game as native Android (.aab) and iOS (.ipa) apps, and replace the simulated world leaderboard with a real online backend.

## About the Design Files
The files in this bundle are **design references created in HTML** — a fully playable prototype showing the intended look, feel, audio, and behavior. They are not production code to ship as-is, BUT because this is an HTML5 game, the recommended path is a **WebView wrapper (Capacitor)** around the bundled offline HTML, plus native glue for haptics, audio session, and the leaderboard backend. Recreating the game natively (Unity/SpriteKit) is NOT required.

## Fidelity
**High-fidelity.** The prototype is the complete game: all six stages, tutorial, profiles, scoreboard, sound synthesis, music, haptics, safe-area handling, and store artwork. Treat visuals, copy, and timings as final.

## Files
- `Ro Viking Raid (offline).html` — **the deliverable**: self-contained single file (fonts, ro.mp3 chant, 100+ flag PNGs inlined). Works with no network. Put this in the Capacitor `www/` folder (rename to `index.html`).
- `Ro Viking Raid.dc.html` + `support.js` + `assets/` — the editable source (custom template runtime; edit here, re-bundle to regenerate the offline file).
- `Privacy Policy.dc.html` — store-required privacy policy (host as a public URL; replace the placeholder contact email).
- `assets/store/` — store artwork:
  - `icon-1024.png` — app icon (iOS App Store + base icon)
  - `adaptive-foreground-1024.png` — Android adaptive icon foreground (transparent; pair with a `#06101e` background layer)
  - `splash-1284x2778.png` / `splash-1080x1920.png` — splash screens
  - `feature-1024x500.png` — Google Play feature graphic

## Packaging plan (Capacitor)
1. `npm init @capacitor/app` → copy the offline HTML as `www/index.html`.
2. `npx cap add android && npx cap add ios`.
3. Config: portrait-only, fullscreen/edge-to-edge (the game already handles `env(safe-area-inset-*)`), dark status bar, `backgroundColor #06101e`.
4. Plugins: `@capacitor/haptics` (see Haptics below), `@capacitor/splash-screen`, `@capacitor/app` (pause/resume → mute audio on background).
5. iOS: set `AVAudioSession` category to `ambient` so game audio respects the silent switch; game audio is WebAudio (`AudioContext`) — resume it on first user gesture (already done in-game) and after app foregrounding.
6. Build: Android Studio → signed .aab; Xcode → archive .ipa (requires Apple Developer account, $99/yr; Play Console $25 one-time).

### Haptics
The prototype calls `navigator.vibrate(ms)` (patterns: ~10ms tap, ~25ms hit, ~60ms miss, [30,40,30] perfect). On iOS `navigator.vibrate` does not exist — shim it to Capacitor Haptics:
```js
if (!navigator.vibrate) navigator.vibrate = (p) => { Haptics.impact({ style: (Array.isArray(p)?p[0]:p) > 40 ? 'HEAVY' : 'LIGHT' }); return true; };
```

## Leaderboard backend (the main dev task)
### Current state (simulated)
In the game logic class:
- `_worldPlayers()` — returns a cached, seeded array of ~48 fake "world players": `{ id, name, country:{code}, scores:{1..6}, bestCombo, bestTime }`. It is marked with a comment: *"Simulated world leaderboard pool — replace with a live backend (e.g. Firebase) at launch."*
- The scoreboard screen has two scopes: `boardScope: 'world' | 'device'` (state, toggled by `setBoardScope`). In `world` scope, entrants = local device profiles + `_worldPlayers()`.
- Four ranking categories (`boardCat`): `total` (sum of best score per stage, with per-stage cells S1–S6), `time` (fastest single stage clear, ascending), `combo` (max combo), `country` (sum of totals grouped by country code).
- Local profiles persist in `localStorage` key `ro_profiles`: `[{ id, name (≤16 chars), country:{code}, scores:{stageId:best}, bestCombo, bestTime }]`; current profile id in `ro_current`. Scores update via `updateScore(patch)` after each stage win.

### Target
Replace `_worldPlayers()` with a real service; keep the UI contract identical (same entrant object shape) so the scoreboard code doesn't change.

Recommended: **Firebase** (Firestore + Anonymous Auth) or Supabase.
- On first launch: anonymous sign-in; create `players/{uid}` doc `{ name, countryCode, scores, bestCombo, bestTime, updatedAt }`.
- After `updateScore()` produces a new personal best: write the doc (fire-and-forget; the game must stay fully playable offline — queue writes, flush on reconnect).
- World board fetch: top 100 per category (Firestore composite indexes on `total desc`, `bestTime asc`, `bestCombo desc`) + the player's own rank (via `count()` aggregation of docs above them). Cache last response locally so the board renders instantly offline with a "last updated" note.
- Country board: maintain a Cloud Function-aggregated `countries/{code}` doc `{ total, count }` updated on player writes (don't sum client-side at scale).
- Anti-cheat (minimum viable): server-side max-score clamp per stage (see caps below), rate-limit writes, ignore non-monotonic decreases.
- Score caps per stage for validation: stages score roughly 0–4,000 each; totals above ~24,000 are impossible — reject.
- Name moderation: profanity filter on write; names are display-only, ≤16 chars.
- Privacy: update `Privacy Policy.dc.html` sections 1–4 when the backend ships (it currently states the world board is demo data and nothing is uploaded — that must change, and both store listings' data-safety forms too).

## Screens / Views
1. **Menu** — fjord scene background; profile chip (flag, name, rank tier, total pts) → Account; RO! logo (Anton 92px, red 3D shadow `#ba0c2f`); PLAY / STAGES / SCORES / mute row; HOW TO PLAY + PRIVACY links. Stadium music loops here.
2. **Account** — create/select local profiles: name input (≤16 chars), country picker (100+ flag PNGs), profile list sorted by total.
3. **Stages** — 6 stage cards (icon, name, subtitle, best score, lock state — stage N unlocks after winning N−1).
4. **Game** — per-stage scene (all CSS-drawn); HUD: shields ❤️, score, combo flame, progress bar FROM→TO, 44px mute + EXIT buttons; timing meter + 84px-tall full-width RO! button (fires on `pointerdown`); intro overlay with stage hint; result overlay (win: score/time/best-badge + CONTINUE; lose: retry).
5. **Scoreboard** — title, hint line, **🌍 WORLD / THIS DEVICE** scope pills, 4 category tabs (gold active state), "my rank" highlight card (`#N`, name, tier, total), scrolling ranked rows: medal/rank, flag, name, tier/country sub-line, stat value; total category adds 6 per-stage mini-cells. Current player row: gold border + `rgba(255,203,5,.12)` bg.
6. **Tutorial modal** — first launch (persisted in `ro_tut`), also via HOW TO PLAY.

## Interactions & Behavior
- Input: single `pointerdown` on the RO! button; whole page has `touch-action: manipulation`, no text selection, no tap highlight.
- Timing meter: sweep speed and gold-zone width vary per stage (stage 5–6 faster/tighter); PERFECT (red center) scores more and triggers pattern haptic.
- 3 misses (shields) = stage lost. Stage 6 is a best-of rounds goal shootout vs. a random opponent country (every 3 hits = 1 goal, miss = opponent goal).
- Audio: all SFX are WebAudio-synthesized; `ro.mp3` is the crowd chant; music loops in menu/stages (stadium theme) and during play (per-stage theme). Single mute toggle persists (`ro_muted`).
- Rank tiers by total: THRALL → KARL → HIRDMAN → BERSERKER → JARL (JARL ≥ 16,000), each with a color.

## Design Tokens
- Colors: accent red `#ba0c2f`, navy `#00205b`, gold `#ffcb05`, deep sea bg `#06101e`→`#0a1730` gradients, panel `rgba(255,255,255,.05–.16)` with 1.5px `rgba(255,255,255,.12–.5)` borders.
- Type: **Anton** (display, letter-spaced) + **Archivo** (UI/body). Fonts are inlined in the offline file; for store builds keep them bundled (no network fetch).
- Radii: 10–18px (`--radius: 18px`); buttons get a 5–6px solid "3D" bottom shadow in navy.
- Hit targets: ≥44px everywhere; RO! button 84px tall.
- Safe areas: every fullscreen layer pads with `env(safe-area-inset-top/bottom)`.

## Store checklist (already prepared vs. dev to-do)
Prepared: icon, adaptive foreground, splashes, feature graphic, privacy policy page, offline bundle, touch/safe-area/haptics UX.
Dev to-do: Capacitor wrap + signing, haptics shim, audio session config, leaderboard backend + privacy/data-safety updates, host privacy policy at a public URL, screenshots for both stores (capture from device), age rating questionnaires (game is all-ages, no ads/IAP/data).
