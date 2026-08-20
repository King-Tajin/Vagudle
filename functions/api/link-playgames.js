// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, decode } from "../_shared/api.js";
import { requireCloudAuth } from "../_shared/cloudAuth.js";
import { ensurePlayerSaveExists } from "../_shared/playerAccount.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const linkSecret = context.env.ACCOUNT_LINK_SECRET;
    if (!linkSecret)
      return json({ success: false, error: "Server misconfiguration." }, 500);

    const { db, uid, error } = await requireCloudAuth(context);
    if (error) return error;

    const body = await context.request.json();
    const { link_token } = body;
    if (!link_token || typeof link_token !== "string")
      return json({ success: false, error: "Missing link_token." }, 400);

    let payload;
    try {
      payload = await decode(link_token, linkSecret);
    } catch {
      return json({ success: false, error: "Invalid or expired link." }, 400);
    }
    if (
      !payload ||
      typeof payload.playGamesId !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Date.now()
    )
      return json({ success: false, error: "Invalid or expired link." }, 400);

    await ensurePlayerSaveExists(db, uid);

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
