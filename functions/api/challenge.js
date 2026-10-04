// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import {
  CORS_HEADERS,
  json,
  decodeChallengeToken,
  checkChallengeRateLimit,
} from "../_shared/api.js";
import { createChallenge, validateConfig } from "../_shared/challenge.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const rateLimited = await checkChallengeRateLimit(context);
    if (rateLimited) return rateLimited;

    const key = context.env.CHALLENGE_KEY;
    if (!key)
      return json({ success: false, error: "Server misconfiguration." }, 500);

    const body = await context.request.json();
    const { error, encoded, id } = await createChallenge(body, key);
    if (error) return json({ success: false, error }, 400);

    return json({ success: true, encoded, id });
  } catch (error) {
    console.error("Challenge encode error:", error);
    return json({ success: false, error: "Failed to encode challenge." }, 500);
  }
}

export async function onRequestGet(context) {
  try {
    const rateLimited = await checkChallengeRateLimit(context);
    if (rateLimited) return rateLimited;

    const { parsed, error } = await decodeChallengeToken(context);
    if (error) return error;

    const { word, dict, guesses, length, id } = parsed;
    if (
      !validateConfig({ word, dict, guesses, length }) ||
      typeof id !== "string"
    )
      return json({ success: false, error: "Malformed challenge data." }, 400);

    return json({ success: true, config: { word, dict, guesses, length, id } });
  } catch (error) {
    console.error("Challenge decode error:", error);
    return json({ success: false, error: "Failed to decode challenge." }, 500);
  }
}
