// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, checkActivityRateLimit } from "../_shared/api.js";
import { fetchDiscordUser, fetchChannelGroup } from "../_shared/discordAuth.js";
import { getUtcDateString, getRotationForDate } from "../_shared/daily.js";

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
      console.error(`[activity-daily-start] Webhook failed: ${res.status}`);
    }
  } catch (error) {
    console.error("[activity-daily-start] Webhook error:", error);
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
    const botToken = context.env.DISCORD_BOT_TOKEN;
    if (!db || !botToken)
      return json({ success: false, error: "Server misconfiguration." }, 500);

    const body = await context.request.json();
    const { access_token, channel_id, standalone } = body;
    if (
      !access_token ||
      typeof access_token !== "string" ||
      !channel_id ||
      typeof channel_id !== "string"
    )
      return json(
        { success: false, error: "Missing access_token or channel_id." },
        400
      );

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

    let uid;
    if (existingAccount) uid = existingAccount.uid;
    else if (standalone === true) uid = `discord:${discordId}`;
    else return json({ success: false, error: "account_not_linked" }, 409);

    let group;
    try {
      group = await fetchChannelGroup(channel_id, botToken);
    } catch {
      return json({ success: false, error: "Failed to resolve group." }, 500);
    }

    const date = getUtcDateString();
    const startedAt = new Date().toISOString();

    const insertResult = await db
      .prepare(
        `INSERT INTO daily_attempts (uid, date, platform, group_id, group_type, started_at)
         VALUES (?, ?, 'discord', ?, ?, ?)
         ON CONFLICT(uid, date) DO NOTHING`
      )
      .bind(uid, date, group.groupId, group.groupType, startedAt)
      .run();

    if (insertResult.meta.changes === 0) {
      const existingAttempt = await db
        .prepare(
          `SELECT platform, group_id, group_type, completed_at
           FROM daily_attempts WHERE uid = ? AND date = ?`
        )
        .bind(uid, date)
        .first();
      return json(
        {
          success: false,
          error: "already_attempted",
          platform: existingAttempt?.platform,
          groupId: existingAttempt?.group_id,
          groupType: existingAttempt?.group_type,
        },
        409
      );
    }

    const rotation = getRotationForDate(date);
    const wordRow = await db
      .prepare(
        `SELECT word, word_length, hard_mode FROM daily_words WHERE date = ?`
      )
      .bind(date)
      .first();

    if (
      !wordRow ||
      typeof wordRow.word !== "string" ||
      !/^[a-zA-Z]+$/.test(wordRow.word) ||
      wordRow.word.length !== wordRow.word_length
    )
      return json(
        { success: false, error: "Daily word is misconfigured." },
        500
      );

    if (
      wordRow.word_length !== rotation.length ||
      Boolean(wordRow.hard_mode) !== rotation.hardMode
    ) {
      console.error(
        `Daily word for ${date} does not match the expected rotation.`
      );
    }

    const webhookSecret = context.env.DAILY_WEBHOOK_SECRET;
    if (webhookSecret) {
      await notifyWebhook(
        {
          event: "started",
          uid,
          discord_id: discordId,
          group_id: group.groupId,
          group_type: group.groupType,
          date,
        },
        webhookSecret
      );
    } else {
      console.error(
        "[activity-daily-start] DAILY_WEBHOOK_SECRET not set — skipping webhook"
      );
    }

    return json({
      success: true,
      uid,
      date,
      word: wordRow.word.toUpperCase(),
      wordLength: wordRow.word_length,
      hardMode: Boolean(wordRow.hard_mode),
      groupId: group.groupId,
      groupType: group.groupType,
    });
  } catch (error) {
    console.error("[activity-daily-start] Error:", error);
    return json({ success: false, error: "Internal error." }, 500);
  }
}
