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
  refreshDiscordToken,
  fetchDiscordUser,
  buildDiscordSessionPayload,
  isRenewableDiscordSession,
} from "../_shared/discordAuth.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const rateLimited = await checkRateLimit(context);
    if (rateLimited) return rateLimited;

    const clientId = context.env.DISCORD_CLIENT_ID;
    const clientSecret = context.env.DISCORD_CLIENT_SECRET;
    const sessionKey = context.env.DISCORD_SESSION_KEY;
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

    if (!isRenewableDiscordSession(payload))
      return json({ success: false, error: "Session cannot be renewed." }, 401);

    let accessToken, refreshToken;
    try {
      ({ accessToken, refreshToken } = await refreshDiscordToken(
        payload.refreshToken,
        clientId,
        clientSecret
      ));
    } catch (error) {
      console.error("Discord refresh exchange error:", error);
      return json(
        { success: false, error: "Session expired. Please sign in again." },
        401
      );
    }

    let discordUser;
    try {
      discordUser = await fetchDiscordUser(accessToken);
    } catch (error) {
      console.error("Discord refresh user fetch error:", error);
      return json(
        { success: false, error: "Session expired. Please sign in again." },
        401
      );
    }

    const session = buildDiscordSessionPayload(discordUser, refreshToken);
    const newToken = await encode(session, sessionKey);

    return json({
      success: true,
      token: newToken,
      user: {
        uid: session.uid,
        displayName: session.username,
        avatarUrl: session.avatar
          ? `https://cdn.discordapp.com/avatars/${session.discordId}/${session.avatar}.png`
          : null,
        expiresAt: session.exp,
      },
    });
  } catch (error) {
    console.error("Discord refresh error:", error);
    return json({ success: false, error: "Failed to renew session." }, 500);
  }
}
