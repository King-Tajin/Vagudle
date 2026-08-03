// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import {
  CORS_HEADERS,
  json,
  encode,
  checkActivityRateLimit,
} from "../_shared/api.js";
import { fetchDiscordUser } from "../_shared/discordAuth.js";

const LINK_TOKEN_TTL_MS = 15 * 60 * 1000;
const LINK_URL_BASE = "https://vagudle.king-tajin.dev/link-discord";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const rateLimited = await checkActivityRateLimit(context);
    if (rateLimited) return rateLimited;

    const db = context.env.DB;
    const linkSecret = context.env.ACCOUNT_LINK_SECRET;
    if (!db || !linkSecret)
      return json({ success: false, error: "Server misconfiguration." }, 500);

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

    const existing = await db
      .prepare(`SELECT uid FROM player_saves WHERE discord_id = ?`)
      .bind(discordId)
      .first();
    if (existing)
      return json(
        { success: false, error: "This Discord account is already linked." },
        409
      );

    const token = await encode(
      { discordId, exp: Date.now() + LINK_TOKEN_TTL_MS },
      linkSecret
    );

    return json({ success: true, url: `${LINK_URL_BASE}?token=${token}` });
  } catch (error) {
    console.error("[activity-link-token] Error:", error);
    return json({ success: false, error: "Internal error." }, 500);
  }
}
