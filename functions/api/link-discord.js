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
      "discordId"
    );
    if (error) return error;

    const existingRow = await db
      .prepare(`SELECT discord_id FROM player_saves WHERE uid = ?`)
      .bind(uid)
      .first();

    if (existingRow.discord_id && existingRow.discord_id !== payload.discordId)
      return json(
        {
          success: false,
          error:
            "This account is already linked to a different Discord account.",
        },
        409
      );

    try {
      const result = await db
        .prepare(
          `UPDATE player_saves SET discord_id = ? WHERE uid = ? AND discord_id IS NULL`
        )
        .bind(payload.discordId, uid)
        .run();

      if (result.meta.changes === 0 && !existingRow.discord_id)
        return json(
          { success: false, error: "This Discord account is already linked." },
          409
        );
    } catch (error) {
      console.error("[link-discord] Constraint error:", error);
      return json(
        { success: false, error: "This Discord account is already linked." },
        409
      );
    }

    return json({ success: true });
  } catch (error) {
    console.error("[link-discord] Error:", error);
    return json({ success: false, error: "Failed to link account." }, 500);
  }
}
