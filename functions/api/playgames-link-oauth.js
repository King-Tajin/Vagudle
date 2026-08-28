// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, checkRateLimit } from "../_shared/api.js";
import { requireCloudAuth } from "../_shared/cloudAuth.js";
import {
  exchangePlayGamesAuthCode,
  fetchPlayGamesPlayer,
} from "../_shared/playGamesAuth.js";
import {
  findPlayerSaveByPlayGamesId,
  linkProviderIdToAccount,
  ensurePlayerSaveExists,
} from "../_shared/playerAccount.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const rateLimited = await checkRateLimit(context);
    if (rateLimited) return rateLimited;

    const clientId = context.env.PLAYGAMES_CLIENT_ID;
    const clientSecret = context.env.PLAYGAMES_CLIENT_SECRET;
    if (!clientId || !clientSecret)
      return json({ success: false, error: "Server misconfiguration." }, 500);

    const { db, uid, error } = await requireCloudAuth(context);
    if (error) return error;

    const body = await context.request.json();
    const { serverAuthCode } = body;
    if (!serverAuthCode || typeof serverAuthCode !== "string")
      return json({ success: false, error: "Missing serverAuthCode." }, 400);

    let accessToken;
    try {
      ({ accessToken } = await exchangePlayGamesAuthCode(
        serverAuthCode,
        clientId,
        clientSecret
      ));
    } catch (error) {
      console.error("[playgames-link-oauth] Exchange error:", error);
      return json({ success: false, error: "Play Games linking failed." }, 400);
    }

    let player;
    try {
      player = await fetchPlayGamesPlayer(accessToken);
    } catch (error) {
      console.error("[playgames-link-oauth] Player fetch error:", error);
      return json({ success: false, error: "Play Games linking failed." }, 400);
    }

    const existing = await findPlayerSaveByPlayGamesId(db, player.playerId);
    if (existing && existing.uid !== uid)
      return json(
        {
          success: false,
          error:
            "This Play Games account is already linked to a different account.",
        },
        409
      );

    await ensurePlayerSaveExists(db, uid);

    const result = await linkProviderIdToAccount(
      db,
      uid,
      "play_games_id",
      player.playerId
    );
    if (!result.ok)
      return json(
        {
          success: false,
          error:
            "This account is already linked to a different Play Games account.",
        },
        409
      );

    return json({ success: true });
  } catch (error) {
    console.error("[playgames-link-oauth] Error:", error);
    return json({ success: false, error: "Failed to link account." }, 500);
  }
}
