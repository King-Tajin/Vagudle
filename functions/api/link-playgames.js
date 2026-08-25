// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json } from "../_shared/api.js";
import { resolveAccountLinkToken } from "../_shared/cloudAuth.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const { db, uid, payload, error } = await resolveAccountLinkToken(
      context,
      "playGamesId"
    );
    if (error) return error;

    const existingRow = await db
      .prepare(`SELECT play_games_id FROM player_saves WHERE uid = ?`)
      .bind(uid)
      .first();

    if (
      existingRow.play_games_id &&
      existingRow.play_games_id !== payload.playGamesId
    )
      return json(
        {
          success: false,
          error:
            "This account is already linked to a different Play Games account.",
        },
        409
      );

    try {
      const result = await db
        .prepare(
          `UPDATE player_saves SET play_games_id = ? WHERE uid = ? AND play_games_id IS NULL`
        )
        .bind(payload.playGamesId, uid)
        .run();

      if (result.meta.changes === 0 && !existingRow.play_games_id)
        return json(
          {
            success: false,
            error: "This Play Games account is already linked.",
          },
          409
        );
    } catch (error) {
      console.error("[link-playgames] Constraint error:", error);
      return json(
        { success: false, error: "This Play Games account is already linked." },
        409
      );
    }

    return json({ success: true });
  } catch (error) {
    console.error("[link-playgames] Error:", error);
    return json({ success: false, error: "Failed to link account." }, 500);
  }
}
