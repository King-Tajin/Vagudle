// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, encode } from "../_shared/api.js";
import {
  exchangeDiscordCode,
  fetchDiscordUser,
  buildDiscordSessionPayload,
  isPermanentDiscordAuthError,
} from "../_shared/discordAuth.js";
import { findPlayerSaveByDiscordId } from "../_shared/playerAccount.js";

const loginFailure = (error) =>
  isPermanentDiscordAuthError(error)
    ? json({ success: false, error: "Discord sign-in failed." }, 400)
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
    const db = context.env.DB;
    if (!clientId || !clientSecret || !sessionKey || !db)
      return json({ success: false, error: "Server misconfiguration." }, 500);

    const body = await context.request.json();
    const { code, redirect_uri } = body;
    if (
      !code ||
      typeof code !== "string" ||
      !redirect_uri ||
      typeof redirect_uri !== "string"
    )
      return json({ success: false, error: "Missing code." }, 400);

    let accessToken, refreshToken;
    try {
      ({ accessToken, refreshToken } = await exchangeDiscordCode(
        code,
        clientId,
        clientSecret,
        redirect_uri
      ));
    } catch (error) {
      console.error("Discord login exchange error:", error);
      return loginFailure(error);
    }

    let discordUser;
    try {
      discordUser = await fetchDiscordUser(accessToken);
    } catch (error) {
      console.error("Discord login user fetch error:", error);
      return loginFailure(error);
    }

    const session = buildDiscordSessionPayload(discordUser, refreshToken);
    const token = await encode(session, sessionKey);
    const existingAccount = await findPlayerSaveByDiscordId(db, discordUser.id);

    return json({
      success: true,
      token,
      isNewAccount: !existingAccount,
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
    console.error("Discord login error:", error);
    return json({ success: false, error: "Failed to sign in." }, 500);
  }
}
