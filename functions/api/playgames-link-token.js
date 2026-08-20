// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, encode, checkRateLimit } from "../_shared/api.js";
import { requirePlayGamesSession } from "../_shared/playGamesAuth.js";
import { findPlayerSaveByPlayGamesId } from "../_shared/playerAccount.js";

const LINK_TOKEN_TTL_MS = 15 * 60 * 1000;
const LINK_URL_BASE = "https://vagudle.king-tajin.dev/link-playgames";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const rateLimited = await checkRateLimit(context);
    if (rateLimited) return rateLimited;

    const db = context.env.DB;
    const linkSecret = context.env.ACCOUNT_LINK_SECRET;
    if (!db || !linkSecret)
      return json({ success: false, error: "Server misconfiguration." }, 500);

    const session = await requirePlayGamesSession(context);
    if (session instanceof Response) return session;
    const playGamesId = session.playGamesId;

    const existing = await findPlayerSaveByPlayGamesId(db, playGamesId);
    if (existing)
      return json(
        { success: false, error: "This Play Games account is already linked." },
        409
      );

    const token = await encode(
      { playGamesId, exp: Date.now() + LINK_TOKEN_TTL_MS },
      linkSecret
    );

    return json({ success: true, url: `${LINK_URL_BASE}?token=${token}` });
  } catch (error) {
    console.error("[playgames-link-token] Error:", error);
    return json({ success: false, error: "Internal error." }, 500);
  }
}
