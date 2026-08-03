// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, checkActivityRateLimit } from "../_shared/api.js";
import { fetchDiscordUser } from "../_shared/discordAuth.js";
import { getUtcDateString } from "../_shared/daily.js";
import { getGuessStatuses } from "../_shared/wordStatus.js";

const WEBHOOK_URL = "https://discord-webhook.king-tajin.dev/webhook/daily";

const notifyWebhook = async (payload, webhookSecret) => {
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Daily-Secret": webhookSecret,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error(`[activity-daily-guess] Webhook failed: ${res.status}`);
    }
  } catch (error) {
    console.error("[activity-daily-guess] Webhook error:", error);
  }
};

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const rateLimited = await checkActivityRateLimit(context);
    if (rateLimited) return rateLimited;

    const db = context.env.DB;
    if (!db)
      return json({ success: false, error: "Database not configured." }, 500);

    const body = await context.request.json();
    const { access_token, guess, guess_number } = body;

    if (
      !access_token ||
      typeof access_token !== "string" ||
      typeof guess !== "string" ||
      !/^[a-zA-Z]+$/.test(guess) ||
      guess.length < 1 ||
      guess.length > 10 ||
      typeof guess_number !== "number" ||
      !Number.isInteger(guess_number) ||
      guess_number < 1
    )
      return json({ success: false, error: "Invalid request body." }, 400);

    let discordUser;
    try {
      discordUser = await fetchDiscordUser(access_token);
    } catch {
      return json(
        { success: false, error: "Failed to verify Discord identity." },
        401
      );
    }
    const discordId = discordUser.id;
    if (!discordId)
      return json(
        { success: false, error: "Could not resolve Discord user ID." },
        401
      );

    const existingAccount = await db
      .prepare(`SELECT uid FROM player_saves WHERE discord_id = ?`)
      .bind(discordId)
      .first();
    const uid = existingAccount ? existingAccount.uid : `discord:${discordId}`;

    const today = getUtcDateString();

    const attempt = await db
      .prepare(
        `SELECT group_id, group_type FROM daily_attempts
         WHERE uid = ? AND date = ? AND platform = 'discord' AND completed_at IS NULL`
      )
      .bind(uid, today)
      .first();

    if (!attempt)
      return json({ success: false, error: "No active attempt found." }, 409);

    const wordRow = await db
      .prepare(`SELECT word, word_length FROM daily_words WHERE date = ?`)
      .bind(today)
      .first();

    if (!wordRow || guess.length !== wordRow.word_length)
      return json({ success: false, error: "Guess length mismatch." }, 400);

    const statuses = getGuessStatuses(wordRow.word, guess);

    const webhookSecret = context.env.DAILY_WEBHOOK_SECRET;
    if (webhookSecret) {
      await notifyWebhook(
        {
          event: "guess",
          uid,
          discord_id: discordId,
          group_id: attempt.group_id,
          group_type: attempt.group_type,
          date: today,
          guess: guess.toUpperCase(),
          guess_number,
          statuses,
        },
        webhookSecret
      );
    } else {
      console.error(
        "[activity-daily-guess] DAILY_WEBHOOK_SECRET not set — skipping webhook"
      );
    }

    return json({ success: true, statuses });
  } catch (error) {
    console.error("[activity-daily-guess] Error:", error);
    return json({ success: false, error: "Internal error." }, 500);
  }
}
