// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import {
  CORS_HEADERS,
  json,
  encode,
  checkActivityRateLimit,
} from "../_shared/api.js";
import { requireDiscordUserFromBody } from "../_shared/discordAuth.js";
import { findPlayerSaveByDiscordId } from "../_shared/playerAccount.js";

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

    const discordUser = await requireDiscordUserFromBody(context);
    if (discordUser instanceof Response) return discordUser;
    const discordId = discordUser.id;

    const existing = await findPlayerSaveByDiscordId(db, discordId);
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
