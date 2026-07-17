// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json } from "../_shared/api.js";
import {
  verifyFirebaseIdToken,
  getBearerToken,
} from "../_shared/firebaseAuth.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  try {
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
      console.error("Load auth error:", error);
      return json({ success: false, error: "Invalid auth token." }, 401);
    }

    const row = await db
      .prepare(`SELECT * FROM player_saves WHERE uid = ?`)
      .bind(uid)
      .first();

    if (!row)
      return json({ success: false, error: "No cloud save found." }, 404);

    return json({
      success: true,
      save: {
        achievements: row.achievements,
        wordConnoisseur: row.word_connoisseur,
        statsNormal: row.stats_normal,
        statsHard: row.stats_hard,
        settings: row.settings,
        backgroundId: row.background_id,
        updatedAt: row.updated_at,
      },
    });
  } catch (error) {
    console.error("Load error:", error);
    return json({ success: false, error: "Failed to load." }, 500);
  }
}
