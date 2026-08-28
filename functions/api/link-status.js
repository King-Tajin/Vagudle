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
      .prepare(
        `SELECT discord_id, play_games_id FROM player_saves WHERE uid = ?`
      )
      .bind(uid)
      .first();

    return json({
      success: true,
      discordLinked: !!row?.discord_id,
      playGamesLinked: !!row?.play_games_id,
    });
  } catch (error) {
    console.error("[link-status] Error:", error);
    return json({ success: false, error: "Failed to load link status." }, 500);
  }
}
