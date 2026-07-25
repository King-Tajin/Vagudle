// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, checkRateLimit } from "../_shared/api.js";
import { verifyCloudSaveToken, getBearerToken } from "../_shared/cloudAuth.js";
import {
  getUtcDateString,
  getPreviousUtcDateString,
} from "../_shared/daily.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const rateLimited = await checkRateLimit(context);
    if (rateLimited) return rateLimited;

    const db = context.env.DB;
    if (!db)
      return json({ success: false, error: "Database not configured." }, 500);

    const token = getBearerToken(context.request);
    if (!token)
      return json({ success: false, error: "Missing auth token." }, 401);

    const authResult = await verifyCloudSaveToken(context.request, context.env);
    if (!authResult)
      return json({ success: false, error: "Invalid auth token." }, 401);
    const { uid } = authResult;

    const existingRow = await db
      .prepare(`SELECT username FROM daily_leaderboard WHERE uid = ?`)
      .bind(uid)
      .first();
    const username = existingRow?.username ?? null;

    if (!username)
      return json(
        {
          success: false,
          error: "no_display_name",
        },
        422
      );

    const body = await context.request.json();
    const { won } = body;
    if (typeof won !== "boolean")
      return json({ success: false, error: "Invalid request body." }, 400);

    const today = getUtcDateString();
    const yesterday = getPreviousUtcDateString(today);
    const nowIso = new Date().toISOString();
    const wonFlag = won ? 1 : 0;

    const [, updateResult, selectResult] = await db.batch([
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
      db
        .prepare(
          `SELECT wins, losses, current_streak, best_streak
           FROM daily_leaderboard WHERE uid = ?`
        )
        .bind(uid),
    ]);

    if (updateResult.meta.changes === 0)
      return json(
        { success: false, error: "Already recorded today's result." },
        409
      );

    const row = selectResult.results?.[0];

    return json({
      success: true,
      wins: row?.wins ?? 0,
      losses: row?.losses ?? 0,
      currentStreak: row?.current_streak ?? 0,
      bestStreak: row?.best_streak ?? 0,
    });
  } catch (error) {
    console.error("Daily result error:", error);
    return json({ success: false, error: "Failed to save result." }, 500);
  }
}
