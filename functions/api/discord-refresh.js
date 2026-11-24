// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, encode } from "../_shared/api.js";
import {
  refreshDiscordToken,
  fetchDiscordUser,
  buildDiscordSessionPayload,
  isRenewableDiscordSession,
  isPermanentDiscordAuthError,
  discordSessionIssuedAt,
} from "../_shared/discordAuth.js";
import { readRenewableSession } from "../_shared/sessionRenewal.js";

const renewalFailure = (error) =>
  isPermanentDiscordAuthError(error)
    ? json(
        {
          success: false,
          error: "Session expired. Please sign in again.",
          code: "reauth_required",
        },
        401
      )
    : json(
        {
          success: false,
          error: "Sign-in service is temporarily unavailable.",
          code: "temporarily_unavailable",
        },
        503
      );

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const clientId = context.env.DISCORD_CLIENT_ID;
    const clientSecret = context.env.DISCORD_CLIENT_SECRET;
    const sessionKey = context.env.DISCORD_SESSION_KEY;
    if (!clientId || !clientSecret || !sessionKey)
      return json({ success: false, error: "Server misconfiguration." }, 500);

    const { payload, error } = await readRenewableSession({
      request: context.request,
      env: context.env,
      sessionKey,
      isRenewable: isRenewableDiscordSession,
      issuedAtOf: discordSessionIssuedAt,
    });
    if (error) return error;

    let accessToken, refreshToken;
    try {
      ({ accessToken, refreshToken } = await refreshDiscordToken(
        payload.refreshToken,
        clientId,
        clientSecret
      ));
    } catch (error) {
      console.error("Discord refresh exchange error:", error);
      return renewalFailure(error);
    }

    let discordUser;
    try {
      discordUser = await fetchDiscordUser(accessToken);
    } catch (error) {
      console.error("Discord refresh user fetch error:", error);
      discordUser = {
        id: payload.discordId,
        username: payload.username,
        global_name: null,
        avatar: payload.avatar ?? null,
      };
    }

    const session = buildDiscordSessionPayload(
      discordUser,
      refreshToken || payload.refreshToken
    );
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
