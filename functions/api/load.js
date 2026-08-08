// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json } from "../_shared/api.js";
import { requireCloudAuth } from "../_shared/cloudAuth.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  try {
    const { db, uid, error } = await requireCloudAuth(context);
    if (error) return error;

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
        dailyStats: row.daily_stats,
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
