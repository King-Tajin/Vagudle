// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, encode, checkRateLimit } from "../_shared/api.js";
import {
  exchangeDiscordCode,
  fetchDiscordUser,
  buildDiscordSessionPayload,
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

    const body = await context.request.json();
    const { code, redirect_uri } = body;
    if (
      !code ||
      typeof code !== "string" ||
      !redirect_uri ||
      typeof redirect_uri !== "string"
    )
      return json({ success: false, error: "Missing code." }, 400);

    let accessToken;
    try {
      accessToken = await exchangeDiscordCode(
        code,
        clientId,
        clientSecret,
        redirect_uri
      );
    } catch (error) {
      console.error("Discord login exchange error:", error);
      return json({ success: false, error: "Discord sign-in failed." }, 400);
    }

    let discordUser;
    try {
      discordUser = await fetchDiscordUser(accessToken);
    } catch (error) {
      console.error("Discord login user fetch error:", error);
      return json({ success: false, error: "Discord sign-in failed." }, 400);
    }

    const session = buildDiscordSessionPayload(discordUser);
    const token = await encode(session, sessionKey);

    return json({
      success: true,
      token,
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
