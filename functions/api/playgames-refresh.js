// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, encode } from "../_shared/api.js";
import {
  refreshPlayGamesToken,
  fetchPlayGamesPlayer,
  buildPlayGamesSessionPayload,
  isRenewablePlayGamesSession,
  isPermanentPlayGamesAuthError,
  playGamesSessionIssuedAt,
} from "../_shared/playGamesAuth.js";
import { readRenewableSession } from "../_shared/sessionRenewal.js";

const renewalFailure = (error) =>
  isPermanentPlayGamesAuthError(error)
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
    const clientId = context.env.PLAYGAMES_CLIENT_ID;
    const clientSecret = context.env.PLAYGAMES_CLIENT_SECRET;
    const sessionKey = context.env.PLAYGAMES_SESSION_KEY;
    if (!clientId || !clientSecret || !sessionKey)
      return json({ success: false, error: "Server misconfiguration." }, 500);

    const { payload, error } = await readRenewableSession({
      request: context.request,
      env: context.env,
      sessionKey,
      isRenewable: isRenewablePlayGamesSession,
      issuedAtOf: playGamesSessionIssuedAt,
    });
    if (error) return error;

    let accessToken;
    try {
      ({ accessToken } = await refreshPlayGamesToken(
        payload.refreshToken,
        clientId,
        clientSecret
      ));
    } catch (error) {
      console.error("Play Games refresh exchange error:", error);
      return renewalFailure(error);
    }

    let player;
    try {
      player = await fetchPlayGamesPlayer(accessToken);
    } catch (error) {
      console.error("Play Games refresh player fetch error:", error);
      return renewalFailure(error);
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
