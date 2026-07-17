// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import {
  CORS_HEADERS,
  json,
  decode,
  ONE_DAY_MS,
  validateDuelParsed,
  checkRateLimit,
} from "../_shared/api.js";

const WEBHOOK_URL = "https://discord-webhook.king-tajin.dev/webhook/duel";

const notifyWebhook = async (duelId, webhookSecret) => {
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Duel-Secret": webhookSecret,
      },
      body: JSON.stringify({ duel_id: duelId }),
    });
    if (!res.ok) {
      console.error(`Webhook notify failed: ${res.status} ${res.statusText}`);
    }
  } catch (error) {
    console.error("Webhook notify error:", error);
  }
};

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const rateLimited = await checkRateLimit(context);
    if (rateLimited) return rateLimited;

    const key = context.env.CHALLENGE_KEY;
    if (!key)
      return json({ success: false, error: "Server misconfiguration." }, 500);

    const db = context.env.DB;
    if (!db)
      return json({ success: false, error: "Database not configured." }, 500);

    const webhookSecret = context.env.DUEL_WEBHOOK_SECRET;

    const body = await context.request.json();
    const { token, won, guessesUsed } = body;

    if (
      typeof token !== "string" ||
      typeof won !== "boolean" ||
      typeof guessesUsed !== "number"
    )
      return json({ success: false, error: "Invalid request body." }, 400);

    let parsed;
    try {
      parsed = await decode(token, key);
    } catch {
      return json({ success: false, error: "Invalid token." }, 400);
    }

    if (!validateDuelParsed(parsed))
      return json({ success: false, error: "Malformed duel data." }, 400);

    if (
      !Number.isInteger(guessesUsed) ||
      guessesUsed < 1 ||
      guessesUsed > parsed.guesses
    )
      return json({ success: false, error: "Invalid guessesUsed." }, 400);

    if (Date.now() - parsed.created_at > ONE_DAY_MS)
      return json({ success: false, error: "Duel has expired." }, 400);

    const result = await db
      .prepare(
        `UPDATE duel_results
         SET won = ?, guesses_used = ?, completed_at = ?
         WHERE duel_id = ? AND discord_id = ? AND completed_at IS NULL`
      )
      .bind(
        won ? 1 : 0,
        guessesUsed,
        new Date().toISOString(),
        parsed.id,
        parsed.discord_id
      )
      .run();

    if (result.meta.changes === 0)
      return json(
        {
          success: false,
          error: "No matching duel row found or already completed.",
        },
        404
      );

    if (webhookSecret) {
      await notifyWebhook(parsed.id, webhookSecret);
    } else {
      console.error("DUEL_WEBHOOK_SECRET not set — skipping webhook notify");
    }

    return json({ success: true });
  } catch (error) {
    console.error("Duel result error:", error);
    return json({ success: false, error: "Failed to save result." }, 500);
  }
}
