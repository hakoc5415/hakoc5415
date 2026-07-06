// Source for www/js/leaderboard.js — bundled with esbuild (`npm run build:web`)
// into a single dependency-free browser file so the Capacitor WebView doesn't
// need a runtime CDN fetch of the Firebase SDK (only the actual API calls need
// network; the SDK code itself ships with the app like everything else here).
//
// Replaces the game's simulated `_worldPlayers()` pool (see README §"Leaderboard
// backend") with Firestore + Anonymous Auth, while keeping the entrant object
// shape identical: { id, name, country:{code}, scores:{stageId:best}, bestCombo, bestTime }.
//
// Integration point (in the studio's dc-runtime source, once rebundled):
//   _worldPlayers(){ return (window.RoLeaderboard && window.RoLeaderboard.getWorldPlayers(this.state.boardCat)) || this._simulatedWorldPlayers(); }
//   // after profile create/select and after recordWin/recordCombo:
//   window.RoLeaderboard && window.RoLeaderboard.setProfile({id, name, countryCode: country.code});
//   window.RoLeaderboard && window.RoLeaderboard.submitScore({stageId, score, combo, timeSec});
//   // in componentDidMount: window.addEventListener('ro-leaderboard-updated', () => this.forceUpdate());
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  collection,
  doc,
  deleteDoc,
  query,
  orderBy,
  limit as fsLimit,
  where,
  getDocs,
  getCountFromServer,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

const QUEUE_KEY = 'ro_lb_queue';
const CACHE_KEY = 'ro_world_cache';
const PROFILE_KEY = 'ro_lb_profile';
const CACHE_TTL_MS = 5 * 60 * 1000;
const TOP_N = 100;

// Mirrors the server-side caps in functions/index.js — used only for an
// instant client-side reject so a corrupt local score never even queues.
const STAGE_SCORE_MAX = 4000;
const TOTAL_SCORE_MAX = 24000;

function readJSON(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch (e) {
    return fallback;
  }
}
function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) { /* storage full / disabled — leaderboard degrades to cache-less */ }
}
function notifyUpdated() {
  try {
    window.dispatchEvent(new CustomEvent('ro-leaderboard-updated'));
  } catch (e) { /* ignore */ }
}
function totalOf(scores) {
  return [1, 2, 3, 4, 5, 6].reduce((a, id) => a + ((scores && scores[id]) || 0), 0);
}

class RoLeaderboardClient {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.functions = null;
    this.uid = null;
    this.ready = null;
    this._lastFetch = {}; // category -> timestamp
    this._configured = false;
  }

  init(config) {
    if (this._configured) return this.ready;
    this._configured = true;
    try {
      this.app = initializeApp(config || window.RO_FIREBASE_CONFIG);
      this.auth = getAuth(this.app);
      // Firestore's default WebChannel transport fails inside native WebViews
      // (iOS WKWebView especially, where the page origin is capacitor://localhost),
      // so reads never arrive and the world board stays empty. Auto-detect is not
      // reliable there either — FORCE long-polling on the native apps, keep
      // auto-detect for normal browsers.
      const cap = window.Capacitor;
      const isNative = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
      try {
        this.db = initializeFirestore(this.app, isNative
          ? { experimentalForceLongPolling: true }
          : { experimentalAutoDetectLongPolling: true });
      } catch (e) {
        this.db = getFirestore(this.app); // already initialized (e.g. hot reload)
      }
      console.log('[RoLB] init: native=' + isNative + ' transport=' + (isNative ? 'forced-long-polling' : 'auto-detect'));
      this.functions = getFunctions(this.app);
    } catch (e) {
      console.warn('[RoLeaderboard] Firebase init failed — world board stays offline/simulated.', e);
      this.ready = Promise.resolve(false);
      return this.ready;
    }

    this.ready = new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          this.uid = user.uid;
          console.log('[RoLB] signed in anonymously, uid=' + user.uid.slice(0, 6) + '…');
          resolve(true);
        }
      });
      signInAnonymously(this.auth).catch((e) => {
        console.warn('[RoLeaderboard] anonymous sign-in failed', e);
        resolve(false);
      });
    });

    window.addEventListener('online', () => this._flushQueue());
    this.ready.then((ok) => ok && this._flushQueue());
    return this.ready;
  }

  /** Call after a local profile is created/selected. Cheap, queued like scores. */
  setProfile(profile) {
    writeJSON(PROFILE_KEY, profile);
    this._enqueue({ kind: 'profile', profile, ts: Date.now() });
    this._flushQueue();
  }

  /** Remove this device's world-board entry (players/{uid}) — called when the
   *  player deletes the profile that's currently synced. Clears the local sync
   *  state first so a pending write can't re-create the doc, then asks the
   *  deleteMyScore Cloud Function to delete it and refreshes the cached board. */
  async deleteRemote() {
    // Clear local sync state and the cached board immediately so the entry
    // disappears from the UI right away, even before the network round-trip.
    try {
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(QUEUE_KEY);
      localStorage.removeItem(CACHE_KEY);
    } catch (e) { /* ignore */ }
    this._lastFetch = {};
    notifyUpdated();
    await this.ready; // make sure anonymous auth resolved so uid exists
    if (!this.uid || !this.db) return;
    try {
      // Delete our own players/{uid} doc directly (allowed by firestore.rules).
      // Doesn't need the Cloud Function, so it can't be defeated by a missing/failed deploy.
      await deleteDoc(doc(this.db, 'players', this.uid));
    } catch (e) {
      console.warn('[RoLeaderboard] deleteRemote failed', e);
    }
    notifyUpdated();
  }

  /** Call after recordWin()/recordCombo() produce a new personal best. */
  submitScore(patch) {
    const profile = readJSON(PROFILE_KEY, null);
    if (!profile) return; // no local account yet — nothing to attribute the score to
    if (patch.score != null && patch.score > STAGE_SCORE_MAX) return; // obviously corrupt, don't even queue
    const job = { kind: 'score', profile, patch, ts: Date.now() };
    this._enqueue(job);
    this._flushQueue();
  }

  _enqueue(job) {
    const q = readJSON(QUEUE_KEY, []);
    q.push(job);
    writeJSON(QUEUE_KEY, q);
  }

  async _flushQueue() {
    if (!this.uid) return;
    let q = readJSON(QUEUE_KEY, []);
    if (!q.length) return;
    const submit = httpsCallable(this.functions, 'submitScore');
    const remaining = [];
    for (const job of q) {
      try {
        await submit({
          name: job.profile.name,
          countryCode: job.profile.countryCode,
          stageId: job.patch && job.patch.stageId,
          score: job.patch && job.patch.score,
          combo: job.patch && job.patch.combo,
          timeSec: job.patch && job.patch.timeSec,
        });
      } catch (e) {
        remaining.push(job); // stays queued — offline or transient failure
      }
    }
    writeJSON(QUEUE_KEY, remaining);
  }

  /** Synchronous read for the render path; kicks off a background refresh. */
  getWorldPlayers(category) {
    category = category || 'total';
    const cache = readJSON(CACHE_KEY, {});
    const entry = cache[category];
    const stale = !entry || Date.now() - entry.ts > CACHE_TTL_MS;
    if (stale && this.uid) this._refresh(category); // fire and forget
    return entry ? entry.players : [];
  }

  async _refresh(category) {
    if (this._lastFetch[category] && Date.now() - this._lastFetch[category] < 15000) return; // debounce
    this._lastFetch[category] = Date.now();
    try {
      const players = category === 'country'
        ? await this._fetchCountries()
        : await this._fetchTop(category);
      console.log('[RoLB] world fetch ok: ' + category + ' -> ' + players.length + ' rows');
      const cache = readJSON(CACHE_KEY, {});
      cache[category] = { players, ts: Date.now() };
      writeJSON(CACHE_KEY, cache);
      notifyUpdated();
    } catch (e) {
      console.warn('[RoLB] world fetch FAILED (' + category + '): ' + ((e && (e.code || e.message)) || e));
      this._lastFetch[category] = Date.now() - 10000; // retry in ~5s instead of the full 15s debounce
    }
  }

  async _fetchTop(category) {
    const col = collection(this.db, 'players');
    let q;
    if (category === 'time') {
      q = query(col, where('bestTime', '>', 0), orderBy('bestTime', 'asc'), fsLimit(TOP_N));
    } else if (category === 'combo') {
      q = query(col, orderBy('bestCombo', 'desc'), fsLimit(TOP_N));
    } else {
      q = query(col, orderBy('totalScore', 'desc'), fsLimit(TOP_N));
    }
    const snap = await getDocs(q);
    return snap.docs.map((d) => this._toEntrant(d.id, d.data()));
  }

  async _fetchCountries() {
    const col = collection(this.db, 'countries');
    const q = query(col, orderBy('total', 'desc'), fsLimit(TOP_N));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, country: { code: d.id }, total: d.data().total, count: d.data().count }));
  }

  _toEntrant(id, data) {
    return {
      id,
      name: data.name,
      country: { code: data.countryCode },
      scores: data.scores || {},
      bestCombo: data.bestCombo || 0,
      bestTime: data.bestTime != null ? data.bestTime : null,
    };
  }

  /** Player's own rank within a category, via count() aggregation (no need to
   *  download the whole collection). Falls back to '—' offline. */
  async getMyRank(category) {
    const profile = readJSON(PROFILE_KEY, null);
    if (!profile || !this.uid) return null;
    const col = collection(this.db, 'players');
    try {
      if (category === 'time') {
        const mine = readJSON(CACHE_KEY, {}).time;
        if (profile.bestTime == null) return null;
        const q = query(col, where('bestTime', '<', profile.bestTime));
        const snap = await getCountFromServer(q);
        return snap.data().count + 1;
      }
      const field = category === 'combo' ? 'bestCombo' : 'totalScore';
      const value = category === 'combo' ? profile.bestCombo : totalOf(profile.scores);
      const q = query(col, where(field, '>', value || 0));
      const snap = await getCountFromServer(q);
      return snap.data().count + 1;
    } catch (e) {
      return null;
    }
  }
}

window.RoLeaderboard = new RoLeaderboardClient();
window.RoLeaderboard.init();
