// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, checkActivityRateLimit } from "../_shared/api.js";
import { fetchDiscordUser } from "../_shared/discordAuth.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const rateLimited = await checkActivityRateLimit(context);
    if (rateLimited) return rateLimited;

    const db = context.env.DB;
    if (!db)
      return json({ success: false, error: "Database not configured." }, 500);

    const body = await context.request.json();
    const { access_token } = body;
    if (!access_token || typeof access_token !== "string")
      return json({ success: false, error: "Missing access_token." }, 400);

    let discordUser;
    try {
      discordUser = await fetchDiscordUser(access_token);
    } catch {
      return json(
        { success: false, error: "Failed to verify Discord identity." },
        401
      );
    }
    const discordId = discordUser.id;
    if (!discordId)
      return json(
        { success: false, error: "Could not resolve Discord user ID." },
        401
      );

    const row = await db
      .prepare(`SELECT uid FROM player_saves WHERE discord_id = ?`)
      .bind(discordId)
      .first();

    if (!row) return json({ success: true, resolved: false });

    return json({ success: true, resolved: true, uid: row.uid });
  } catch (error) {
    console.error("[activity-account-status] Error:", error);
    return json({ success: false, error: "Internal error." }, 500);
  }
}
