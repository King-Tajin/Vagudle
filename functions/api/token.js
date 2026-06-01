// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json } from "../_shared/api.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const clientId = context.env.DISCORD_CLIENT_ID;
    const clientSecret = context.env.DISCORD_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return json({ error: "Server misconfiguration." }, 500);
    }

    const body = await context.request.json();
    const { code } = body;
    if (!code || typeof code !== "string") {
      return json({ error: "Missing code." }, 400);
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
    });

    const discordRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (!discordRes.ok) {
      const err = await discordRes.text();
      console.error("[token] Discord exchange failed:", err);
      return json({ error: "Token exchange failed." }, 400);
    }

    const data = await discordRes.json();
    return json({ access_token: data.access_token });
  } catch (error) {
    console.error("[token] Error:", error);
    return json({ error: "Internal error." }, 500);
  }
}
