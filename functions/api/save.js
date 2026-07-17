// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, checkRateLimit } from "../_shared/api.js";
import {
  verifyFirebaseIdToken,
  getBearerToken,
} from "../_shared/firebaseAuth.js";

const MAX_FIELD_LENGTH = 100_000;

const isJsonString = (value) => {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > MAX_FIELD_LENGTH
  )
    return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

const isValidBackgroundId = (value) =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && /^[a-z0-9_]{1,64}$/.test(value));

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const rateLimited = await checkRateLimit(context);
    if (rateLimited) return rateLimited;

    const projectId = context.env.FIREBASE_PROJECT_ID;
    if (!projectId)
      return json({ success: false, error: "Server misconfiguration." }, 500);

    const db = context.env.DB;
    if (!db)
      return json({ success: false, error: "Database not configured." }, 500);

    const token = getBearerToken(context.request);
    if (!token)
      return json({ success: false, error: "Missing auth token." }, 401);

    let uid;
    try {
      ({ uid } = await verifyFirebaseIdToken(token, projectId));
    } catch (error) {
      console.error("Save auth error:", error);
      return json({ success: false, error: "Invalid auth token." }, 401);
    }

    const body = await context.request.json();
    const {
      achievements,
      wordConnoisseur,
      statsNormal,
      statsHard,
      settings,
      backgroundId,
    } = body;

    if (
      !isJsonString(achievements) ||
      !isJsonString(wordConnoisseur) ||
      !isJsonString(statsNormal) ||
      !isJsonString(statsHard) ||
      !isJsonString(settings) ||
      !isValidBackgroundId(backgroundId)
    )
      return json({ success: false, error: "Invalid save data." }, 400);

    const updatedAt = new Date().toISOString();

    await db
      .prepare(
        `INSERT INTO player_saves
         (uid, achievements, word_connoisseur, stats_normal, stats_hard, settings, background_id, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT(uid) DO UPDATE SET
          achievements = excluded.achievements,
                                 word_connoisseur = excluded.word_connoisseur,
                                 stats_normal = excluded.stats_normal,
                                 stats_hard = excluded.stats_hard,
                                 settings = excluded.settings,
                                 background_id = excluded.background_id,
                                 updated_at = excluded.updated_at`
      )
      .bind(
        uid,
        achievements,
        wordConnoisseur,
        statsNormal,
        statsHard,
        settings,
        backgroundId ?? null,
        updatedAt
      )
      .run();

    return json({ success: true, updatedAt });
  } catch (error) {
    console.error("Save error:", error);
    return json({ success: false, error: "Failed to save." }, 500);
  }
}
