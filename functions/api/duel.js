// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import {
  CORS_HEADERS,
  json,
  decode,
  ONE_DAY_MS,
  validateDuelParsed,
} from "../_shared/api.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  try {
    const key = context.env.CHALLENGE_KEY;
    if (!key)
      return json({ success: false, error: "Server misconfiguration." }, 500);

    const token = new URL(context.request.url).searchParams.get("token");
    if (!token) return json({ success: false, error: "Missing token." }, 400);

    let parsed;
    try {
      parsed = decode(token, key);
    } catch {
      return json({ success: false, error: "Invalid token." }, 400);
    }

    if (!validateDuelParsed(parsed))
      return json({ success: false, error: "Malformed duel data." }, 400);

    if (Date.now() - parsed.created_at > ONE_DAY_MS)
      return json({ success: true, expired: true });

    const { word, dict, guesses, length, id, discord_id, created_at } = parsed;

    return json({
      success: true,
      expired: false,
      config: { word, dict, guesses, length, id, discord_id, created_at },
    });
  } catch (error) {
    console.error("Duel decode error:", error);
    return json({ success: false, error: "Failed to decode duel." }, 500);
  }
}
