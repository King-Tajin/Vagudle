// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, checkActivityRateLimit } from "../_shared/api.js";
import { requireDiscordUserFromBody } from "../_shared/discordAuth.js";
import { findPlayerSaveByDiscordId } from "../_shared/playerAccount.js";

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

    const discordUser = await requireDiscordUserFromBody(context);
    if (discordUser instanceof Response) return discordUser;
    const discordId = discordUser.id;

    const row = await findPlayerSaveByDiscordId(db, discordId);

    if (!row) return json({ success: true, resolved: false });

    return json({ success: true, resolved: true, uid: row.uid });
  } catch (error) {
    console.error("[activity-account-status] Error:", error);
    return json({ success: false, error: "Internal error." }, 500);
  }
}
