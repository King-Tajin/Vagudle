// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, encode, checkRateLimit } from "../_shared/api.js";
import {
  exchangePlayGamesAuthCode,
  fetchPlayGamesPlayer,
  buildPlayGamesSessionPayload,
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

    const body = await context.request.json();
    const { serverAuthCode } = body;
    if (!serverAuthCode || typeof serverAuthCode !== "string")
      return json({ success: false, error: "Missing serverAuthCode." }, 400);

    let accessToken, refreshToken;
    try {
      ({ accessToken, refreshToken } = await exchangePlayGamesAuthCode(
        serverAuthCode,
        clientId,
        clientSecret
      ));
    } catch (error) {
      console.error("Play Games login exchange error:", error);
      return json({ success: false, error: "Play Games sign-in failed." }, 400);
    }

    let player;
    try {
      player = await fetchPlayGamesPlayer(accessToken);
    } catch (error) {
      console.error("Play Games login player fetch error:", error);
      return json({ success: false, error: "Play Games sign-in failed." }, 400);
    }

    const session = buildPlayGamesSessionPayload(player, refreshToken);
    const token = await encode(session, sessionKey);

    return json({
      success: true,
      token,
      user: {
        uid: session.uid,
        displayName: session.username,
        avatarUrl: session.avatar,
        expiresAt: session.exp,
      },
    });
  } catch (error) {
    console.error("Play Games login error:", error);
    return json({ success: false, error: "Failed to sign in." }, 500);
  }
}
