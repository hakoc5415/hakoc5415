// POLARA — Cloud Functions
// submitScore: skoru doğrulayıp oyuncunun rekorunu ve ülke sıralamasını günceller.
// deleteAccount: hesabı + verileri kalıcı siler (gizlilik politikası taahhüdü).

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

initializeApp();
const db = getFirestore();

const REGION = 'europe-west1';
const MAX_SCORE = 5000000;      // tek oyunda fiziksel olarak ulaşılamaz üst sınır
const MIN_INTERVAL_MS = 15000;  // iki skor bildirimi arası en az süre

exports.submitScore = onCall({ region: REGION }, async (req) => {
  if (!req.auth) throw new HttpsError('unauthenticated', 'login required');
  const uid = req.auth.uid;
  const score = req.data && req.data.score;
  if (!Number.isInteger(score) || score <= 0 || score > MAX_SCORE) {
    throw new HttpsError('invalid-argument', 'bad score');
  }
  const ref = db.doc('players/' + uid);
  const out = await db.runTransaction(async (tx) => {
    // Firestore işlemi: TÜM okumalar yazmalardan önce yapılmalı
    const snap = await tx.get(ref);
    if (!snap.exists) throw new HttpsError('failed-precondition', 'no profile');
    const p = snap.data();
    const prevBest = p.best || 0;
    const cref = p.country ? db.doc('countries/' + p.country) : null;
    const csnap = cref ? await tx.get(cref) : null;
    const last = p.lastSubmitAt ? p.lastSubmitAt.toMillis() : 0;
    if (Date.now() - last < MIN_INTERVAL_MS) {
      return { best: prevBest }; // hız limiti: sessizce yok say
    }
    if (score <= prevBest) {
      tx.update(ref, { lastSubmitAt: FieldValue.serverTimestamp() });
      return { best: prevBest };
    }
    tx.update(ref, { best: score, lastSubmitAt: FieldValue.serverTimestamp() });
    // ülke sıralaması: ülkenin en iyi skoru + oyuncu sayısı (ilk skorda +1)
    if (cref) {
      const c = csnap && csnap.exists ? csnap.data() : { top: 0, topName: '', n: 0 };
      tx.set(cref, {
        top: Math.max(c.top || 0, score),
        topName: score > (c.top || 0) ? p.name : (c.topName || ''),
        n: (c.n || 0) + (prevBest === 0 ? 1 : 0)
      }, { merge: true });
    }
    return { best: score };
  });
  return out;
});

exports.deleteAccount = onCall({ region: REGION }, async (req) => {
  if (!req.auth) throw new HttpsError('unauthenticated', 'login required');
  const uid = req.auth.uid;
  // ülke oyuncu sayısını düş (skoru varsa)
  const ref = db.doc('players/' + uid);
  const snap = await ref.get();
  if (snap.exists) {
    const p = snap.data();
    if (p.country && (p.best || 0) > 0) {
      try { await db.doc('countries/' + p.country).update({ n: FieldValue.increment(-1) }); } catch (e) {}
    }
    await ref.delete();
  }
  await getAuth().deleteUser(uid);
  return { ok: true };
});
