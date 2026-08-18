// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import {
  CORS_HEADERS,
  json,
  encode,
  decode,
  checkRateLimit,
} from "../_shared/api.js";
import { getBearerToken } from "../_shared/cloudAuth.js";
import {
  refreshPlayGamesToken,
  fetchPlayGamesPlayer,
  buildPlayGamesSessionPayload,
  isRenewablePlayGamesSession,
} from "../_shared/playGamesAuth.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const rateLimited = await checkRateLimit(context);
    if (rateLimited) return rateLimited;

    const clientId = context.env.PLAYGAMES_CLIENT_ID;
    const clientSecret = context.env.PLAYGAMES_CLIENT_SECRET;
    const sessionKey = context.env.PLAYGAMES_SESSION_KEY;
    if (!clientId || !clientSecret || !sessionKey)
      return json({ success: false, error: "Server misconfiguration." }, 500);

    const token = getBearerToken(context.request);
    if (!token)
      return json({ success: false, error: "Missing session token." }, 401);

    let payload;
    try {
      payload = await decode(token, sessionKey);
    } catch {
      return json({ success: false, error: "Invalid session token." }, 401);
    }

    if (!isRenewablePlayGamesSession(payload))
      return json({ success: false, error: "Session cannot be renewed." }, 401);

    let accessToken;
    try {
      ({ accessToken } = await refreshPlayGamesToken(
        payload.refreshToken,
        clientId,
        clientSecret
      ));
    } catch (error) {
      console.error("Play Games refresh exchange error:", error);
      return json(
        { success: false, error: "Session expired. Please sign in again." },
        401
      );
    }

    let player;
    try {
      player = await fetchPlayGamesPlayer(accessToken);
    } catch (error) {
      console.error("Play Games refresh player fetch error:", error);
      return json(
        { success: false, error: "Session expired. Please sign in again." },
        401
      );
    }

    const session = buildPlayGamesSessionPayload(player, payload.refreshToken);
    const newToken = await encode(session, sessionKey);

    return json({
      success: true,
      token: newToken,
      user: {
        uid: session.uid,
        displayName: session.username,
        avatarUrl: session.avatar,
        expiresAt: session.exp,
      },
    });
  } catch (error) {
    console.error("Play Games refresh error:", error);
    return json({ success: false, error: "Failed to renew session." }, 500);
  }
}
