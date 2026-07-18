// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, checkActivityRateLimit } from "../_shared/api.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const rateLimited = await checkActivityRateLimit(context);
    if (rateLimited) return rateLimited;

    const kv = context.env.FEEDBACK_AND_STATS_KV;
    if (!kv) {
      return json({ error: "Storage not configured." }, 500);
    }

    const body = await context.request.json();
    const { channel_id, access_token } = body;
    if (
      !channel_id ||
      typeof channel_id !== "string" ||
      !access_token ||
      typeof access_token !== "string"
    ) {
      return json({ error: "Missing channel_id or access_token." }, 400);
    }

    const meRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!meRes.ok) {
      return json({ error: "Failed to verify Discord identity." }, 401);
    }
    const me = await meRes.json();
    const discordId = me.id;
    if (!discordId) {
      return json({ error: "Could not resolve Discord user ID." }, 401);
    }

    const stored = await kv.get(`activity_duel:${channel_id}`, {
      type: "json",
    });
    if (!stored) {
      return json({ error: "Duel not found or expired." }, 404);
    }

    if (stored.discord_id !== discordId) {
      return json({ error: "This duel is not for your account." }, 403);
    }

    return json(stored);
  } catch (error) {
    console.error("[activity-duel] Error:", error);
    return json({ error: "Internal error." }, 500);
  }
}
