// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, checkRateLimit } from "../_shared/api.js";
import { verifyCloudSaveToken, getBearerToken } from "../_shared/cloudAuth.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  try {
    const rateLimited = await checkRateLimit(context);
    if (rateLimited) return rateLimited;

    const db = context.env.DB;
    if (!db)
      return json({ success: false, error: "Database not configured." }, 500);

    const token = getBearerToken(context.request);
    if (!token) return json({ success: true, linked: false });

    const authResult = await verifyCloudSaveToken(context.request, context.env);
    if (!authResult) return json({ success: true, linked: false });

    const ownRow = await db
      .prepare(
        `SELECT username, wins, losses, current_streak, best_streak
         FROM daily_leaderboard WHERE uid = ?`
      )
      .bind(authResult.uid)
      .first();

    if (!ownRow || !ownRow.username)
      return json({ success: true, linked: true, hasUsername: false });

    const [rankResult, countResult] = await db.batch([
      db
        .prepare(
          `SELECT COUNT(*) as count FROM daily_leaderboard
           WHERE username IS NOT NULL
             AND (best_streak > ? OR (best_streak = ? AND wins > ?))`
        )
        .bind(ownRow.best_streak, ownRow.best_streak, ownRow.wins),
      db.prepare(
        `SELECT COUNT(*) as count FROM daily_leaderboard WHERE username IS NOT NULL`
      ),
    ]);

    return json({
      success: true,
      linked: true,
      hasUsername: true,
      rank: (rankResult.results?.[0]?.count ?? 0) + 1,
      outOf: countResult.results?.[0]?.count ?? 0,
    });
  } catch (error) {
    console.error("Daily leaderboard rank fetch error:", error);
    return json({ success: false, error: "Failed to load rank." }, 500);
  }
}
