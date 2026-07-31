// POLARA — çevrimiçi katman (Firebase Auth + Firestore + Cloud Functions)
// FIREBASE_CONFIG boşsa hiçbir şey yüklenmez; oyun çevrimdışı modda çalışır.
// Firebase SDK'sı dinamik import ile yüklenir — oyunun ilk açılışını yavaşlatmaz.

import { FIREBASE_CONFIG, FIREBASE_EMULATOR } from './firebase-config.js';

// kullanıcı adı: 3-20 karakter, harf/rakam/altçizgi/tire (e-posta yerel kısmına gömülür)
export const USERNAME_RE = /^[a-zA-Z0-9_-]{3,20}$/;
const EMAIL_DOMAIN = 'polara.users';

let _init = null;
let fb = null; // { auth, db, fns, mods: {...} }

export function isOnline() { return !!FIREBASE_CONFIG; }

async function ensureInit() {
  if (!FIREBASE_CONFIG) throw new Error('offline');
  if (_init) return _init;
  _init = (async () => {
    const [appM, authM, fsM, fnM] = await Promise.all([
      import('firebase/app'),
      import('firebase/auth'),
      import('firebase/firestore'),
      import('firebase/functions')
    ]);
    const app = appM.initializeApp(FIREBASE_CONFIG);
    const auth = authM.getAuth(app);
    const db = fsM.getFirestore(app);
    const fns = fnM.getFunctions(app, 'europe-west1');
    if (FIREBASE_EMULATOR) {
      authM.connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      fsM.connectFirestoreEmulator(db, 'localhost', 8080);
      fnM.connectFunctionsEmulator(fns, 'localhost', 5001);
    }
    fb = { auth, db, fns, authM, fsM, fnM };
    return fb;
  })();
  return _init;
}

function userEmail(name) { return name.toLowerCase() + '@' + EMAIL_DOMAIN; }

// Firebase hata kodları → oyunun i18n hata anahtarları
function mapErr(e) {
  const c = (e && e.code) || '';
  if (c.includes('email-already-in-use')) return 'errTaken';
  if (c.includes('user-not-found')) return 'errNoUser';
  if (c.includes('wrong-password') || c.includes('invalid-credential') || c.includes('invalid-login-credentials')) return 'errBadPass';
  if (c.includes('weak-password')) return 'errShortPass';
  if (c.includes('too-many-requests')) return 'errNet';
  return 'errNet';
}

// oturum açık kullanıcıyı (varsa) profiliyle döndürür — açılışta çağrılır
export async function restoreSession() {
  const { auth, db, fsM, authM } = await ensureInit();
  const user = await new Promise((resolve) => {
    const un = authM.onAuthStateChanged(auth, (u) => { un(); resolve(u); });
  });
  if (!user) return null;
  try {
    const snap = await fsM.getDoc(fsM.doc(db, 'players', user.uid));
    if (!snap.exists()) return null;
    const d = snap.data();
    return { name: d.name, country: d.country, avatar: d.avatar || 0, best: d.best || 0, uid: user.uid };
  } catch (e) { return null; }
}

export async function register(name, pass, country, avatar) {
  if (!USERNAME_RE.test(name)) throw { key: 'errUserFormat' };
  const { auth, db, fsM, authM } = await ensureInit();
  let cred;
  try {
    cred = await authM.createUserWithEmailAndPassword(auth, userEmail(name), pass);
  } catch (e) { throw { key: mapErr(e) }; }
  const profile = { name, nameLower: name.toLowerCase(), country, avatar: avatar || 0, best: 0, createdAt: fsM.serverTimestamp() };
  try {
    await fsM.setDoc(fsM.doc(db, 'players', cred.user.uid), profile);
  } catch (e) { throw { key: 'errNet' }; }
  return { name, country, avatar: avatar || 0, best: 0, uid: cred.user.uid };
}

export async function login(name, pass) {
  if (!USERNAME_RE.test(name)) throw { key: 'errNoUser' };
  const { auth, db, fsM, authM } = await ensureInit();
  let cred;
  try {
    cred = await authM.signInWithEmailAndPassword(auth, userEmail(name), pass);
  } catch (e) { throw { key: mapErr(e) }; }
  try {
    const snap = await fsM.getDoc(fsM.doc(db, 'players', cred.user.uid));
    const d = snap.exists() ? snap.data() : { name, country: '', avatar: 0, best: 0 };
    return { name: d.name || name, country: d.country || '', avatar: d.avatar || 0, best: d.best || 0, uid: cred.user.uid };
  } catch (e) { throw { key: 'errNet' }; }
}

export async function logout() {
  if (!FIREBASE_CONFIG || !fb) return;
  try { await fb.authM.signOut(fb.auth); } catch (e) {}
}

// yeni kişisel rekoru sunucuya bildirir (doğrulama Cloud Function'da)
export async function submitScore(score) {
  const { fns, fnM } = await ensureInit();
  const call = fnM.httpsCallable(fns, 'submitScore');
  const res = await call({ score });
  return res.data; // { best }
}

// ilk 100 oyuncu
export async function fetchLeaderboard() {
  const { db, fsM } = await ensureInit();
  const q = fsM.query(fsM.collection(db, 'players'), fsM.orderBy('best', 'desc'), fsM.limit(100));
  const snap = await fsM.getDocs(q);
  const rows = [];
  snap.forEach((d) => { const v = d.data(); if ((v.best || 0) > 0) rows.push({ name: v.name, country: v.country, s: v.best || 0, uid: d.id }); });
  return rows;
}

// ülke sıralaması (Cloud Function günceller: en iyi skor + oyuncu sayısı)
export async function fetchCountries() {
  const { db, fsM } = await ensureInit();
  const q = fsM.query(fsM.collection(db, 'countries'), fsM.orderBy('top', 'desc'), fsM.limit(100));
  const snap = await fsM.getDocs(q);
  const rows = [];
  snap.forEach((d) => { const v = d.data(); rows.push({ country: d.id, top: v.top || 0, n: v.n || 0 }); });
  return rows;
}

// hesabı ve verileri kalıcı siler (Cloud Function: auth + Firestore)
export async function deleteAccount() {
  const { fns, fnM } = await ensureInit();
  const call = fnM.httpsCallable(fns, 'deleteAccount');
  await call({});
  await logout();
}
