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
// Stage 9 (VALHALLA) is endless, so its scores run far beyond the others'.
const STAGE_SCORE_MAX = 5000;
const ENDLESS_STAGE_ID = 9;
const ENDLESS_SCORE_MAX = 1000000;
function capForStage(stageId) {
  return Number(stageId) === ENDLESS_STAGE_ID ? ENDLESS_SCORE_MAX : STAGE_SCORE_MAX;
}

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
  // Sum every stage's best (7 = Victory Parade, 9 = Valhalla endless included).
  return Object.values(scores || {}).reduce((a, v) => a + ((+v) || 0), 0);
}

// ---------- REST transport (native WebViews) ----------
// Inside WKWebView the Firebase JS SDK's network layers (WebChannel for
// Firestore AND the auth fetch pipeline) can hang without ever resolving —
// observed as "signInAnonymously neither succeeds nor fails". On native we
// therefore bypass the SDK entirely and speak plain HTTPS:
//   - Identity Toolkit REST for anonymous auth (signUp / token refresh)
//   - Firestore documents:runQuery for the public board reads
//   - the callable-function HTTP protocol for submitScore
const REST_AUTH_KEY = 'ro_lb_rest_auth';

function fetchJSON(url, opts, timeoutMs) {
  return new Promise((resolve, reject) => {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const t = setTimeout(() => {
      if (ctrl) ctrl.abort();
      reject(new Error('timeout after ' + (timeoutMs || 15000) + 'ms'));
    }, timeoutMs || 15000);
    fetch(url, Object.assign({}, opts || {}, ctrl ? { signal: ctrl.signal } : {}))
      .then((r) => r.json().then((j) => { clearTimeout(t); resolve({ status: r.status, json: j }); }))
      .catch((e) => { clearTimeout(t); reject(e); });
  });
}

function decodeFsValue(v) {
  if (!v || typeof v !== 'object') return v;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return parseInt(v.integerValue, 10);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('mapValue' in v) return decodeFsFields((v.mapValue && v.mapValue.fields) || {});
  if ('arrayValue' in v) return ((v.arrayValue && v.arrayValue.values) || []).map(decodeFsValue);
  return null;
}
function decodeFsFields(fields) {
  const out = {};
  for (const k in fields) out[k] = decodeFsValue(fields[k]);
  return out;
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
    const cfg = config || window.RO_FIREBASE_CONFIG;
    console.log('[RoLB] init starting; config=' + (cfg ? 'present' : 'MISSING') + ' online=' + navigator.onLine);
    // REST endpoints are used for password auth on every platform (and for all
    // traffic on native), so keep them available regardless of mode.
    if (cfg) {
      this._cfg = cfg;
      this._fsBase = 'https://firestore.googleapis.com/v1/projects/' + cfg.projectId + '/databases/(default)/documents';
      this._fnBase = 'https://us-central1-' + cfg.projectId + '.cloudfunctions.net';
    }
    const cap = window.Capacitor;
    const isNative = !!(cap && cap.isNativePlatform && cap.isNativePlatform()) || !!window.RO_FORCE_REST;
    // A stored password session always wins: it must keep working after app
    // restarts on the web build too, so REST mode is used wherever it exists.
    const sess = readJSON(REST_AUTH_KEY, null);
    if (cfg && ((isNative) || (sess && sess.username))) return this._initRest(cfg);
    try {
      this.app = initializeApp(cfg);
      this.auth = getAuth(this.app);
      // Firestore's default WebChannel transport can fail inside embedded
      // webviews; auto-detect falls back to long-polling there while keeping
      // WebChannel in normal browsers. (Native apps don't reach this path —
      // they use the REST transport above.)
      try {
        this.db = initializeFirestore(this.app, { experimentalAutoDetectLongPolling: true });
      } catch (e) {
        this.db = getFirestore(this.app); // already initialized (e.g. hot reload)
      }
      console.log('[RoLB] init: web mode (SDK, auto-detect transport)');
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
        console.warn('[RoLB] anonymous sign-in FAILED: ' + ((e && (e.code || e.message)) || e));
        resolve(false);
      });
      // If neither success nor failure within 10s, say so — a silent hang here
      // (e.g. blocked network) is otherwise invisible in the console.
      setTimeout(() => {
        if (!this.uid) console.warn('[RoLB] still not signed in after 10s — network to firebase blocked or very slow?');
      }, 10000);
    });

    window.addEventListener('online', () => this._flushQueue());
    this.ready.then((ok) => {
      if (!ok) return;
      this._flushQueue();
      // Prefetch the world board as soon as auth lands so the SCORES screen has
      // rows even if it was opened (and rendered) before sign-in completed.
      this._refresh('total');
      this._refresh('combo');
      this._refresh('country');
    });
    return this.ready;
  }

  /** Native path: plain-HTTPS Firebase (no SDK transports). */
  _initRest(cfg) {
    this.mode = 'rest';
    this._cfg = cfg;
    this._fsBase = 'https://firestore.googleapis.com/v1/projects/' + cfg.projectId + '/databases/(default)/documents';
    this._fnBase = 'https://us-central1-' + cfg.projectId + '.cloudfunctions.net';
    console.log('[RoLB] init: native -> REST mode (bypassing SDK transports)');
    // NETTEST: one cheap unauthenticated read. If even this hangs/fails, the
    // WebView itself has no working network (e.g. the simulator's network
    // process crashed) and nothing app-side can fix that.
    fetchJSON(this._fsBase + '/countries?pageSize=1&key=' + cfg.apiKey, { method: 'GET' }, 10000)
      .then((r) => console.log('[RoLB] NETTEST firestore REST: HTTP ' + r.status))
      .catch((e) => console.warn('[RoLB] NETTEST FAILED: ' + e.message + ' — WebView has no working network (restart the Simulator / try a real device)'));
    this.ready = this._restAuth().then((ok) => {
      if (ok) {
        this._flushQueue();
        this._refresh('total');
        this._refresh('combo');
        this._refresh('country');
      } else {
        // Board reads are public — fill the board even without auth.
        this._refresh('total');
        this._refresh('combo');
        this._refresh('country');
      }
      return ok;
    });
    window.addEventListener('online', () => this._flushQueue());
    return this.ready;
  }

  /** Ensure a valid anonymous REST session; sets this.uid + this._idToken. */
  async _restAuth() {
    try {
      const now = Date.now();
      let s = readJSON(REST_AUTH_KEY, null);
      if (s && s.exp && s.exp - now > 60000) {
        this.uid = s.localId;
        this._idToken = s.idToken;
        return true;
      }
      if (s && s.refreshToken) {
        try {
          const r = await fetchJSON(
            'https://securetoken.googleapis.com/v1/token?key=' + this._cfg.apiKey,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: 'grant_type=refresh_token&refresh_token=' + encodeURIComponent(s.refreshToken),
            }, 12000);
          if (r.status === 200 && r.json.id_token) {
            s = {
              localId: r.json.user_id,
              idToken: r.json.id_token,
              refreshToken: r.json.refresh_token || s.refreshToken,
              exp: now + (parseInt(r.json.expires_in, 10) || 3600) * 1000,
              username: s.username, // keep the named-account marker across refreshes
            };
            writeJSON(REST_AUTH_KEY, s);
            this.uid = s.localId;
            this._idToken = s.idToken;
            console.log('[RoLB] REST auth refreshed, uid=' + s.localId.slice(0, 6) + '…');
            return true;
          }
          console.warn('[RoLB] REST token refresh got HTTP ' + r.status);
        } catch (e) {
          console.warn('[RoLB] REST token refresh failed: ' + e.message);
        }
        // Never silently replace a NAMED account with a fresh anonymous user —
        // that would strand the player's scores under a uid they can't reach.
        if (s && s.username) return false;
      }
      const r = await fetchJSON(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + this._cfg.apiKey,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ returnSecureToken: true }),
        }, 12000);
      if (r.status === 200 && r.json.localId) {
        const sess = {
          localId: r.json.localId,
          idToken: r.json.idToken,
          refreshToken: r.json.refreshToken,
          exp: Date.now() + (parseInt(r.json.expiresIn, 10) || 3600) * 1000,
        };
        writeJSON(REST_AUTH_KEY, sess);
        this.uid = sess.localId;
        this._idToken = sess.idToken;
        console.log('[RoLB] REST anonymous sign-in ok, uid=' + sess.localId.slice(0, 6) + '…');
        return true;
      }
      console.warn('[RoLB] REST sign-in FAILED: HTTP ' + r.status + ' ' + JSON.stringify(r.json && r.json.error && r.json.error.message));
      return false;
    } catch (e) {
      console.warn('[RoLB] REST auth error: ' + e.message);
      return false;
    }
  }

  // ---------- username + password accounts ----------
  // Usernames are case-insensitive and mapped to a pseudo e-mail so Firebase's
  // ordinary email/password auth provides uniqueness, hashing and rate limits.
  _emailForUsername(username) {
    const slug = String(username || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    if (slug.length < 2) return null;
    return { slug, email: slug + '@players.ro-viking-raid.app' };
  }

  _storePasswordSession(json, username) {
    const sess = {
      localId: json.localId,
      idToken: json.idToken,
      refreshToken: json.refreshToken,
      exp: Date.now() + (parseInt(json.expiresIn, 10) || 3600) * 1000,
      username, // display marker: this session is a named account, not anonymous
    };
    writeJSON(REST_AUTH_KEY, sess);
    this.uid = sess.localId;
    this._idToken = sess.idToken;
    this.mode = 'rest'; // password sessions always speak REST, even on web
    return sess;
  }

  /** {uid, username} for the signed-in named account, or null (anonymous/no session). */
  getSessionUser() {
    const s = readJSON(REST_AUTH_KEY, null);
    return s && s.username ? { uid: s.localId, username: s.username } : null;
  }

  static _authErrorText(code) {
    if (!code) return 'Could not reach the server — check your connection.';
    if (/EMAIL_EXISTS/.test(code)) return 'That username is taken — log in instead?';
    if (/EMAIL_NOT_FOUND|INVALID_LOGIN_CREDENTIALS|INVALID_PASSWORD/.test(code)) return 'Wrong username or password.';
    if (/WEAK_PASSWORD/.test(code)) return 'Password must be at least 6 characters.';
    if (/TOO_MANY_ATTEMPTS/.test(code)) return 'Too many attempts — try again in a minute.';
    if (/OPERATION_NOT_ALLOWED|PASSWORD_LOGIN_DISABLED/.test(code)) return 'Accounts are being upgraded — try again soon.';
    return 'Sign-in failed (' + code + ').';
  }

  /** Create a named account. Returns {ok, uid} or {ok:false, error}. */
  async register(username, password) {
    const m = this._emailForUsername(username);
    if (!m) return { ok: false, error: 'Enter a name first (letters or numbers).' };
    if (!password || password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
    if (!this._cfg) return { ok: false, error: 'Leaderboard is offline.' };
    try {
      const r = await fetchJSON(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + this._cfg.apiKey,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: m.email, password, returnSecureToken: true }) }, 12000);
      if (r.status === 200 && r.json.localId) {
        this._storePasswordSession(r.json, m.slug);
        console.log('[RoLB] registered account "' + m.slug + '", uid=' + r.json.localId.slice(0, 6) + '…');
        this._flushQueue();
        return { ok: true, uid: r.json.localId };
      }
      const code = r.json && r.json.error && r.json.error.message;
      console.warn('[RoLB] register failed: ' + code);
      return { ok: false, error: RoLeaderboardClient._authErrorText(code), code };
    } catch (e) {
      return { ok: false, error: RoLeaderboardClient._authErrorText(null) };
    }
  }

  /** Log into an existing account and pull its leaderboard entry so the local
   *  profile (scores, country, display name) can be restored on this device.
   *  Returns {ok, uid, profile|null} or {ok:false, error}. */
  async login(username, password) {
    const m = this._emailForUsername(username);
    if (!m) return { ok: false, error: 'Enter your username.' };
    if (!password) return { ok: false, error: 'Enter your password.' };
    if (!this._cfg) return { ok: false, error: 'Leaderboard is offline.' };
    try {
      const r = await fetchJSON(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + this._cfg.apiKey,
        { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: m.email, password, returnSecureToken: true }) }, 12000);
      if (r.status !== 200 || !r.json.localId) {
        const code = r.json && r.json.error && r.json.error.message;
        console.warn('[RoLB] login failed: ' + code);
        return { ok: false, error: RoLeaderboardClient._authErrorText(code), code };
      }
      this._storePasswordSession(r.json, m.slug);
      console.log('[RoLB] logged in as "' + m.slug + '", uid=' + r.json.localId.slice(0, 6) + '…');
      // Restore the account's world-board entry (public read; may 404 if the
      // account never submitted a score).
      let profile = null;
      try {
        const d = await fetchJSON(this._fsBase + '/players/' + r.json.localId + '?key=' + this._cfg.apiKey, { method: 'GET' }, 12000);
        if (d.status === 200 && d.json.fields) {
          const f = decodeFsFields(d.json.fields);
          profile = {
            name: f.name, countryCode: f.countryCode,
            scores: f.scores || {}, bestCombo: f.bestCombo || 0,
            bestTime: f.bestTime != null ? f.bestTime : null,
          };
        }
      } catch (e) { /* profile stays null — fresh device, no scores yet */ }
      this._flushQueue();
      return { ok: true, uid: r.json.localId, profile };
    } catch (e) {
      return { ok: false, error: RoLeaderboardClient._authErrorText(null) };
    }
  }

  /** Sign out of the named account. Local play continues; scores stop syncing
   *  until the player logs in (or creates) an account again. */
  logout() {
    try {
      localStorage.removeItem(REST_AUTH_KEY);
      localStorage.removeItem(PROFILE_KEY);
      localStorage.removeItem(QUEUE_KEY);
    } catch (e) { /* ignore */ }
    this.uid = null;
    this._idToken = null;
    console.log('[RoLB] logged out');
    notifyUpdated();
  }

  async _restRunQuery(structuredQuery) {
    const r = await fetchJSON(this._fsBase + ':runQuery?key=' + this._cfg.apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ structuredQuery }),
    }, 15000);
    if (r.status !== 200) throw new Error('runQuery HTTP ' + r.status);
    return (Array.isArray(r.json) ? r.json : [])
      .filter((x) => x.document)
      .map((x) => ({
        id: x.document.name.split('/').pop(),
        data: decodeFsFields(x.document.fields || {}),
      }));
  }

  async _restFetchBoard(category) {
    if (category === 'country') {
      const rows = await this._restRunQuery({
        from: [{ collectionId: 'countries' }],
        orderBy: [{ field: { fieldPath: 'total' }, direction: 'DESCENDING' }],
        limit: TOP_N,
      });
      return rows.map((r) => ({ id: r.id, country: { code: r.id }, total: r.data.total, count: r.data.count }));
    }
    if (category === 'time') {
      const rows = await this._restRunQuery({
        from: [{ collectionId: 'players' }],
        where: { fieldFilter: { field: { fieldPath: 'bestTime' }, op: 'GREATER_THAN', value: { doubleValue: 0 } } },
        orderBy: [{ field: { fieldPath: 'bestTime' }, direction: 'ASCENDING' }],
        limit: TOP_N,
      });
      return rows.map((r) => this._toEntrant(r.id, r.data));
    }
    const field = category === 'combo' ? 'bestCombo' : 'totalScore';
    const rows = await this._restRunQuery({
      from: [{ collectionId: 'players' }],
      orderBy: [{ field: { fieldPath: field }, direction: 'DESCENDING' }],
      limit: TOP_N,
    });
    return rows.map((r) => this._toEntrant(r.id, r.data));
  }

  async _restSubmit(job) {
    const r = await fetchJSON(this._fnBase + '/submitScore', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this._idToken,
      },
      body: JSON.stringify({
        data: {
          name: job.profile.name,
          countryCode: job.profile.countryCode,
          stageId: job.patch && job.patch.stageId,
          score: job.patch && job.patch.score,
          combo: job.patch && job.patch.combo,
          timeSec: job.patch && job.patch.timeSec,
          scores: job.patch && job.patch.scores, // bulk resync map (optional)
        },
      }),
    }, 15000);
    if (r.status !== 200 || (r.json && r.json.error)) {
      throw new Error('submitScore HTTP ' + r.status + ' ' + JSON.stringify(r.json && r.json.error && r.json.error.message));
    }
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
    if (this.mode === 'rest') {
      const ok = await this._restAuth();
      if (ok && this.uid) {
        try {
          const r = await fetchJSON(this._fsBase + '/players/' + this.uid + '?key=' + this._cfg.apiKey, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + this._idToken },
          }, 12000);
          console.log('[RoLB] REST delete players/' + this.uid.slice(0, 6) + '…: HTTP ' + r.status);
        } catch (e) {
          console.warn('[RoLB] REST delete failed: ' + e.message);
        }
      }
      notifyUpdated();
      return;
    }
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
    if (patch.score != null && patch.score > capForStage(patch.stageId)) return; // obviously corrupt, don't even queue
    const job = { kind: 'score', profile, patch, ts: Date.now() };
    this._enqueue(job);
    this._flushQueue();
  }

  /** Push EVERY local stage best to the server in one write. Called once after
   *  app start / login so entries written by older app versions (which dropped
   *  stage 7/9) heal without needing a new personal best. Monotonic on the
   *  server, so this can never lower anything. */
  resyncScores(scoresMap) {
    const profile = readJSON(PROFILE_KEY, null);
    if (!profile || !scoresMap) return;
    const clean = {};
    for (const key of Object.keys(scoresMap)) {
      const id = Number(key);
      const v = Number(scoresMap[key]);
      if (id >= 1 && id <= 9 && isFinite(v) && v > 0 && v <= capForStage(id)) clean[id] = Math.round(v);
    }
    if (!Object.keys(clean).length) return;
    const sig = JSON.stringify(clean);
    if (this._lastResync === sig) return; // once per app session unless bests changed
    this._lastResync = sig;
    this._enqueue({ kind: 'score', profile, patch: { scores: clean }, ts: Date.now() });
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
    if (this.mode === 'rest') {
      const ok = await this._restAuth(); // refresh the token if it's near expiry
      if (!ok) return;
      const remaining = [];
      for (const job of q) {
        try {
          await this._restSubmit(job);
        } catch (e) {
          console.warn('[RoLB] REST submit failed (stays queued): ' + e.message);
          remaining.push(job);
        }
      }
      writeJSON(QUEUE_KEY, remaining);
      if (q.length !== remaining.length) {
        console.log('[RoLB] REST submitted ' + (q.length - remaining.length) + ' queued score(s)');
        this._lastFetch = {}; // let the next board render refetch fresh rows
      }
      return;
    }
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
          scores: job.patch && job.patch.scores, // bulk resync map (optional)
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
    if (stale) {
      // Board reads are public: in REST mode they don't need auth at all.
      if (this.uid || this.mode === 'rest') this._refresh(category); // fire and forget
      else if (!this._warnedNoAuth) {
        this._warnedNoAuth = true;
        console.warn('[RoLB] world board requested but not signed in yet — refresh skipped (will retry once auth completes)');
      }
    }
    return entry ? entry.players : [];
  }

  async _refresh(category) {
    if (this._lastFetch[category] && Date.now() - this._lastFetch[category] < 15000) return; // debounce
    this._lastFetch[category] = Date.now();
    try {
      const players = this.mode === 'rest'
        ? await this._restFetchBoard(category)
        : (category === 'country' ? await this._fetchCountries() : await this._fetchTop(category));
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
    if (this.mode === 'rest') {
      try {
        if (category === 'time') return null; // TIME tab is not shown anymore
        const field = category === 'combo' ? 'bestCombo' : 'totalScore';
        const value = category === 'combo' ? profile.bestCombo : totalOf(profile.scores);
        const r = await fetchJSON(this._fsBase + ':runAggregationQuery?key=' + this._cfg.apiKey, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            structuredAggregationQuery: {
              structuredQuery: {
                from: [{ collectionId: 'players' }],
                where: { fieldFilter: { field: { fieldPath: field }, op: 'GREATER_THAN', value: { integerValue: String(value || 0) } } },
              },
              aggregations: [{ count: {}, alias: 'c' }],
            },
          }),
        }, 12000);
        const c = r.status === 200 && Array.isArray(r.json) && r.json[0] && r.json[0].result
          && r.json[0].result.aggregateFields && r.json[0].result.aggregateFields.c;
        if (c && c.integerValue != null) return parseInt(c.integerValue, 10) + 1;
        return null;
      } catch (e) {
        return null;
      }
    }
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

console.log('[RoLB] script loaded');
window.RoLeaderboard = new RoLeaderboardClient();
try {
  window.RoLeaderboard.init();
} catch (e) {
  console.warn('[RoLB] init THREW: ' + ((e && e.message) || e));
}
