// Cloud Functions backing the RO! world leaderboard (see design_handoff_viking_raid/README.md
// §"Leaderboard backend"). Clients never write to Firestore directly — all writes
// go through submitScore so caps, monotonicity, rate-limiting and name
// moderation are enforced server-side instead of trusted from the device.
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

// Stages score roughly 0-4,000 each; totals above ~24,000 are impossible.
const STAGE_SCORE_MAX = 4000;
const TOTAL_SCORE_MAX = 24000;
const MAX_COMBO = 500; // generous upper bound — the game's timing meter can't produce more
const MIN_TIME_SEC = 1;
const MAX_TIME_SEC = 3600;
const MIN_WRITE_INTERVAL_MS = 1500; // basic rate limit: one score write per stage clear at most
const STAGE_IDS = [1, 2, 3, 4, 5, 6];

// Minimum-viable denylist-based moderation. Names are display-only, <=16 chars.
const PROFANITY = ['fuck', 'shit', 'bitch', 'cunt', 'nigger', 'faggot', 'asshole'];

function moderateName(raw) {
  let name = String(raw || '').trim().replace(/\s+/g, ' ').slice(0, 16);
  if (!name) name = 'VIKING';
  const lower = name.toLowerCase();
  for (const word of PROFANITY) {
    if (lower.includes(word)) {
      name = name.replace(new RegExp(word, 'ig'), (m) => '*'.repeat(m.length));
    }
  }
  return name;
}

function totalOf(scores) {
  return STAGE_IDS.reduce((sum, id) => sum + (Number(scores && scores[id]) || 0), 0);
}

exports.submitScore = onCall(async (request) => {
  const uid = request.auth && request.auth.uid;
  if (!uid) throw new HttpsError('unauthenticated', 'Anonymous sign-in required.');

  const data = request.data || {};
  const countryCode = String(data.countryCode || '').slice(0, 3).toUpperCase() || 'NO';
  const name = moderateName(data.name);
  const stageId = Number(data.stageId);
  const score = Number(data.score);
  const combo = data.combo != null ? Number(data.combo) : null;
  const timeSec = data.timeSec != null ? Number(data.timeSec) : null;

  const hasStageUpdate = STAGE_IDS.includes(stageId) && Number.isFinite(score) && score >= 0;
  if (hasStageUpdate && score > STAGE_SCORE_MAX) {
    throw new HttpsError('invalid-argument', `Score exceeds per-stage cap of ${STAGE_SCORE_MAX}.`);
  }
  if (combo != null && (!Number.isFinite(combo) || combo < 0 || combo > MAX_COMBO)) {
    throw new HttpsError('invalid-argument', 'Combo out of range.');
  }
  if (timeSec != null && (!Number.isFinite(timeSec) || timeSec < MIN_TIME_SEC || timeSec > MAX_TIME_SEC)) {
    throw new HttpsError('invalid-argument', 'Time out of range.');
  }

  const playerRef = db.collection('players').doc(uid);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(playerRef);
    const prev = snap.exists ? snap.data() : null;

    if (prev && prev.lastWriteAt) {
      const lastMs = prev.lastWriteAt.toMillis ? prev.lastWriteAt.toMillis() : 0;
      if (Date.now() - lastMs < MIN_WRITE_INTERVAL_MS) {
        throw new HttpsError('resource-exhausted', 'Writing too frequently.');
      }
    }

    const scores = { ...((prev && prev.scores) || {}) };
    if (hasStageUpdate) {
      const existing = Number(scores[stageId]) || 0;
      if (score > existing) scores[stageId] = score; // ignore non-monotonic decreases
    }

    const newTotal = totalOf(scores);
    if (newTotal > TOTAL_SCORE_MAX) {
      throw new HttpsError('invalid-argument', 'Total score exceeds the maximum possible.');
    }

    const bestCombo = Math.max((prev && prev.bestCombo) || 0, combo != null ? combo : 0);
    const bestTime = timeSec != null
      ? (prev && prev.bestTime != null ? Math.min(prev.bestTime, timeSec) : timeSec)
      : (prev ? prev.bestTime : null);

    const oldTotal = prev ? totalOf(prev.scores || {}) : 0;
    const oldCountry = prev ? prev.countryCode : null;

    tx.set(playerRef, {
      name,
      countryCode,
      scores,
      totalScore: newTotal,
      bestCombo,
      bestTime: bestTime != null ? bestTime : null,
      updatedAt: FieldValue.serverTimestamp(),
      lastWriteAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    // Country aggregate: move this player's contribution from their old
    // country (if changed) into their current one.
    if (oldCountry && oldCountry !== countryCode) {
      const oldRef = db.collection('countries').doc(oldCountry);
      tx.set(oldRef, { total: FieldValue.increment(-oldTotal), count: FieldValue.increment(-1) }, { merge: true });
      const newRef = db.collection('countries').doc(countryCode);
      tx.set(newRef, { total: FieldValue.increment(newTotal), count: FieldValue.increment(1) }, { merge: true });
    } else {
      const delta = newTotal - oldTotal;
      const countRef = db.collection('countries').doc(countryCode);
      tx.set(countRef, {
        total: FieldValue.increment(delta),
        count: FieldValue.increment(prev ? 0 : 1),
      }, { merge: true });
    }
  });

  return { ok: true };
});
