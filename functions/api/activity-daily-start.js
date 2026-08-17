// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, checkActivityRateLimit } from "../_shared/api.js";
import {
  requireDiscordUser,
  fetchChannelGroup,
  sanitizeDiscordUsername,
} from "../_shared/discordAuth.js";
import { getUtcDateString, getRotationForDate } from "../_shared/daily.js";

const WEBHOOK_URL = "https://vagudle-webhook.king-tajin.dev/webhook/daily";

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

    const discordUser = await requireDiscordUser(access_token);
    if (discordUser instanceof Response) return discordUser;
    const discordId = discordUser.id;

    const existingAccount = await db
      .prepare(`SELECT uid FROM player_saves WHERE discord_id = ?`)
      .bind(discordId)
      .first();

    let uid;
    if (existingAccount) uid = existingAccount.uid;
    else if (standalone === true) uid = `discord:${discordId}`;
    else return json({ success: false, error: "account_not_linked" }, 409);

    const nowIso = new Date().toISOString();

    if (uid.startsWith("discord:")) {
      const leaderboardRow = await db
        .prepare(`SELECT username FROM daily_leaderboard WHERE uid = ?`)
        .bind(uid)
        .first();

      if (!leaderboardRow?.username) {
        const autoUsername = sanitizeDiscordUsername(
          discordUser.global_name || discordUser.username
        );

        if (autoUsername) {
          await db
            .prepare(
              `INSERT OR IGNORE INTO daily_leaderboard
               (uid, username, wins, losses, current_streak, best_streak, last_result_date, updated_at)
               VALUES (?, NULL, 0, 0, 0, 0, NULL, ?)`
            )
            .bind(uid, nowIso)
            .run();

          const isUniqueViolation = (error) =>
            String(error?.message ?? error)
              .toLowerCase()
              .includes("unique");

          const withRandomSuffix = (base) =>
            `${base.slice(0, 16)}${Math.floor(1000 + Math.random() * 9000)}`;

          let candidate = autoUsername;
          const maxAttempts = 5;

          for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
              await db
                .prepare(
                  `UPDATE daily_leaderboard
                   SET username = ?, username_updated_at = NULL
                   WHERE uid = ? AND username IS NULL`
                )
                .bind(candidate, uid)
                .run();
              break;
            } catch (error) {
              if (!isUniqueViolation(error)) {
                console.error(
                  "[activity-daily-start] Auto-username error:",
                  error
                );
                break;
              }
              candidate = withRandomSuffix(autoUsername);
            }
          }
        }
      }
    }

    let group;
    try {
      group = await fetchChannelGroup(channel_id, botToken);
    } catch {
      return json({ success: false, error: "Failed to resolve group." }, 500);
    }

    const date = getUtcDateString();

    const insertResult = await db
      .prepare(
        `INSERT INTO daily_attempts (uid, date, platform, group_id, group_type, started_at)
         VALUES (?, ?, 'discord', ?, ?, ?)
         ON CONFLICT(uid, date) DO NOTHING`
      )
      .bind(uid, date, group.groupId, group.groupType, nowIso)
      .run();

    const isNewAttempt = insertResult.meta.changes > 0;
    let existingAttempt = null;

    if (!isNewAttempt) {
      existingAttempt = await db
        .prepare(
          `SELECT platform, group_id, group_type, completed_at, guesses, cell_colors
           FROM daily_attempts WHERE uid = ? AND date = ?`
        )
        .bind(uid, date)
        .first();

      if (existingAttempt?.completed_at) {
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

    if (isNewAttempt) {
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
    }

    let resumedGuesses = null;
    let resumedCellColors = null;
    if (existingAttempt) {
      try {
        resumedGuesses = existingAttempt.guesses
          ? JSON.parse(existingAttempt.guesses)
          : null;
      } catch {
        resumedGuesses = null;
      }
      try {
        resumedCellColors = existingAttempt.cell_colors
          ? JSON.parse(existingAttempt.cell_colors)
          : null;
      } catch {
        resumedCellColors = null;
      }
    }

    return json({
      success: true,
      uid,
      date,
      word: wordRow.word.toUpperCase(),
      wordLength: wordRow.word_length,
      hardMode: Boolean(wordRow.hard_mode),
      groupId: existingAttempt ? existingAttempt.group_id : group.groupId,
      groupType: existingAttempt ? existingAttempt.group_type : group.groupType,
      guesses: resumedGuesses,
      cellColors: resumedCellColors,
    });
  } catch (error) {
    console.error("[activity-daily-start] Error:", error);
    return json({ success: false, error: "Internal error." }, 500);
  }
}
