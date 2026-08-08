// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json } from "../_shared/api.js";
import { requireCloudAuth } from "../_shared/cloudAuth.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const { db, uid, error } = await requireCloudAuth(context);
    if (error) return error;

    const existingRow = await db
      .prepare(`SELECT discord_id FROM player_saves WHERE uid = ?`)
      .bind(uid)
      .first();

    const discordId = uid.startsWith("discord:")
      ? uid.slice("discord:".length)
      : (existingRow?.discord_id ?? null);

    const statements = [
      db.prepare(`DELETE FROM player_saves WHERE uid = ?`).bind(uid),
      db.prepare(`DELETE FROM daily_leaderboard WHERE uid = ?`).bind(uid),
      db.prepare(`DELETE FROM daily_attempts WHERE uid = ?`).bind(uid),
      db.prepare(`DELETE FROM group_daily_results WHERE uid = ?`).bind(uid),
    ];

    if (discordId) {
      statements.push(
        db
          .prepare(`DELETE FROM duel_results WHERE discord_id = ?`)
          .bind(discordId)
      );
    }

    await db.batch(statements);

    return json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return json(
      { success: false, error: "Failed to delete account data." },
      500
    );
  }
}
