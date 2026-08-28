// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, checkRateLimit } from "../_shared/api.js";
import { requireCloudAuth } from "../_shared/cloudAuth.js";
import {
  exchangeDiscordCode,
  fetchDiscordUser,
} from "../_shared/discordAuth.js";
import {
  findPlayerSaveByDiscordId,
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

    const clientId = context.env.DISCORD_CLIENT_ID;
    const clientSecret = context.env.DISCORD_CLIENT_SECRET;
    if (!clientId || !clientSecret)
      return json({ success: false, error: "Server misconfiguration." }, 500);

    const { db, uid, error } = await requireCloudAuth(context);
    if (error) return error;

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
      ({ accessToken } = await exchangeDiscordCode(
        code,
        clientId,
        clientSecret,
        redirect_uri
      ));
    } catch (error) {
      console.error("[discord-link-oauth] Exchange error:", error);
      return json({ success: false, error: "Discord linking failed." }, 400);
    }

    let discordUser;
    try {
      discordUser = await fetchDiscordUser(accessToken);
    } catch (error) {
      console.error("[discord-link-oauth] User fetch error:", error);
      return json({ success: false, error: "Discord linking failed." }, 400);
    }

    const existing = await findPlayerSaveByDiscordId(db, discordUser.id);
    if (existing && existing.uid !== uid)
      return json(
        {
          success: false,
          error:
            "This Discord account is already linked to a different account.",
        },
        409
      );

    await ensurePlayerSaveExists(db, uid);

    const result = await linkProviderIdToAccount(
      db,
      uid,
      "discord_id",
      discordUser.id
    );
    if (!result.ok)
      return json(
        {
          success: false,
          error:
            "This account is already linked to a different Discord account.",
        },
        409
      );

    return json({ success: true });
  } catch (error) {
    console.error("[discord-link-oauth] Error:", error);
    return json({ success: false, error: "Failed to link account." }, 500);
  }
}
