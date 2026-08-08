// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import {
  CORS_HEADERS,
  json,
  decodeChallengeToken,
  ONE_DAY_MS,
  validateDuelParsed,
  checkRateLimit,
} from "../_shared/api.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  try {
    const rateLimited = await checkRateLimit(context);
    if (rateLimited) return rateLimited;

    const { parsed, error } = await decodeChallengeToken(context);
    if (error) return error;

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
