// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import {
  CORS_HEADERS,
  json,
  VALID_GUESSES,
  checkActivityRateLimit,
} from "../_shared/api.js";
import { requireDiscordUser } from "../_shared/discordAuth.js";
import { resolveUidForDiscordId } from "../_shared/playerAccount.js";
import {
  getUtcDateString,
  getPreviousUtcDateString,
} from "../_shared/daily.js";
import { getGuessStatuses } from "../_shared/wordStatus.js";

const MAX_GUESSES = Math.max(...VALID_GUESSES);

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
      console.error(`[activity-daily-result] Webhook failed: ${res.status}`);
    }
  } catch (error) {
    console.error("[activity-daily-result] Webhook error:", error);
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
    const { access_token, guesses } = body;

    if (
      !access_token ||
      typeof access_token !== "string" ||
      !Array.isArray(guesses) ||
      guesses.length < 1 ||
      guesses.length > MAX_GUESSES ||
      guesses.some((g) => typeof g !== "string" || !/^[a-zA-Z]+$/.test(g))
    )
      return json({ success: false, error: "Invalid request body." }, 400);

    const discordUser = await requireDiscordUser(access_token);
    if (discordUser instanceof Response) return discordUser;
    const discordId = discordUser.id;
    const uid = await resolveUidForDiscordId(db, discordId);

    const today = getUtcDateString();
    const yesterday = getPreviousUtcDateString(today);
    const nowIso = new Date().toISOString();

    const attempt = await db
      .prepare(
        `UPDATE daily_attempts
         SET completed_at = ?
         WHERE uid = ? AND date = ? AND platform = 'discord' AND completed_at IS NULL
         RETURNING group_id, group_type`
      )
      .bind(nowIso, uid, today)
      .first();

    if (!attempt)
      return json(
        {
          success: false,
          error: "No matching attempt found or already completed.",
        },
        409
      );

    const { group_id: groupId, group_type: groupType } = attempt;

    const wordRow = await db
      .prepare(`SELECT word, word_length FROM daily_words WHERE date = ?`)
      .bind(today)
      .first();

    if (!wordRow)
      return json(
        { success: false, error: "Daily word is misconfigured." },
        500
      );

    if (guesses.some((g) => g.length !== wordRow.word_length))
      return json({ success: false, error: "Guess length mismatch." }, 400);

    const solution = wordRow.word.toUpperCase();
    const upperGuesses = guesses.map((g) => g.toUpperCase());
    const grid = upperGuesses.map((g) => getGuessStatuses(solution, g));
    const won = upperGuesses[upperGuesses.length - 1] === solution;
    const guessesUsed = upperGuesses.length;
    const wonFlag = won ? 1 : 0;

    await db.batch([
      db
        .prepare(
          `INSERT OR IGNORE INTO group_streaks
           (group_id, group_type, current_streak, best_streak, last_played_date, updated_at)
           VALUES (?, ?, 0, 0, NULL, ?)`
        )
        .bind(groupId, groupType, nowIso),
      db
        .prepare(
          `UPDATE group_streaks
           SET
             current_streak = CASE WHEN last_played_date = ? THEN current_streak + 1 ELSE 1 END,
             best_streak = MAX(best_streak, CASE WHEN last_played_date = ? THEN current_streak + 1 ELSE 1 END),
             last_played_date = ?,
             updated_at = ?
           WHERE group_id = ? AND (last_played_date IS NULL OR last_played_date <> ?)`
        )
        .bind(yesterday, yesterday, today, nowIso, groupId, today),
    ]);

    const leaderboardRow = await db
      .prepare(`SELECT username FROM daily_leaderboard WHERE uid = ?`)
      .bind(uid)
      .first();

    if (leaderboardRow?.username) {
      const username = leaderboardRow.username;
      await db.batch([
        db
          .prepare(
            `INSERT OR IGNORE INTO daily_leaderboard
             (uid, username, wins, losses, current_streak, best_streak, last_result_date, updated_at)
             VALUES (?, ?, 0, 0, 0, 0, NULL, ?)`
          )
          .bind(uid, username, nowIso),
        db
          .prepare(
            `UPDATE daily_leaderboard
             SET
               username = ?,
               wins = wins + CASE WHEN ? = 1 THEN 1 ELSE 0 END,
               losses = losses + CASE WHEN ? = 1 THEN 0 ELSE 1 END,
               current_streak = CASE
                                  WHEN ? = 1 THEN (CASE WHEN last_result_date = ? THEN current_streak + 1 ELSE 1 END)
                                  ELSE 0
                 END,
               best_streak = CASE
                               WHEN ? = 1 THEN MAX(best_streak, CASE WHEN last_result_date = ? THEN current_streak + 1 ELSE 1 END)
                               ELSE best_streak
                 END,
               last_result_date = ?,
               updated_at = ?
             WHERE uid = ? AND (last_result_date IS NULL OR last_result_date <> ?)`
          )
          .bind(
            username,
            wonFlag,
            wonFlag,
            wonFlag,
            yesterday,
            wonFlag,
            yesterday,
            today,
            nowIso,
            uid,
            today
          ),
      ]);
    }

    const webhookSecret = context.env.DAILY_WEBHOOK_SECRET;
    if (webhookSecret) {
      await notifyWebhook(
        {
          event: "finished",
          uid,
          discord_id: discordId,
          group_id: groupId,
          group_type: groupType,
          date: today,
          won,
          guesses_used: guessesUsed,
          solution,
          guesses: upperGuesses,
          grid,
        },
        webhookSecret
      );
    } else {
      console.error(
        "[activity-daily-result] DAILY_WEBHOOK_SECRET not set — skipping webhook"
      );
    }

    return json({ success: true });
  } catch (error) {
    console.error("[activity-daily-result] Error:", error);
    return json({ success: false, error: "Failed to save result." }, 500);
  }
}
