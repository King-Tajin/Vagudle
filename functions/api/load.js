// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, checkRateLimit } from "../_shared/api.js";
import { verifyCloudSaveToken, getBearerToken } from "../_shared/cloudAuth.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  try {
    const rateLimited = await checkRateLimit(context);
    if (rateLimited) return rateLimited;

    const db = context.env.DB;
    if (!db)
      return json({ success: false, error: "Database not configured." }, 500);

    const token = getBearerToken(context.request);
    if (!token)
      return json({ success: false, error: "Missing auth token." }, 401);

    const authResult = await verifyCloudSaveToken(context.request, context.env);
    if (!authResult)
      return json({ success: false, error: "Invalid auth token." }, 401);
    const { uid } = authResult;

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
