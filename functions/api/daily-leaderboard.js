// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, checkRateLimit } from "../_shared/api.js";
import { verifyCloudSaveToken, getBearerToken } from "../_shared/cloudAuth.js";

const TOP_N = 10;

const toEntry = (row) => ({
  username: row.username,
  wins: row.wins,
  losses: row.losses,
  currentStreak: row.current_streak,
  bestStreak: row.best_streak,
});

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

    const topRows = await db
      .prepare(
        `SELECT uid, username, wins, losses, current_streak, best_streak
         FROM daily_leaderboard
         WHERE username IS NOT NULL
         ORDER BY best_streak DESC, wins DESC
         LIMIT ?`
      )
      .bind(TOP_N)
      .all();

    const top = (topRows.results ?? []).map(toEntry);

    let self = null;
    const token = getBearerToken(context.request);
    if (token) {
      const authResult = await verifyCloudSaveToken(
        context.request,
        context.env
      );
      if (authResult) {
        const alreadyVisible = (topRows.results ?? []).some(
          (row) => row.uid === authResult.uid
        );
        if (!alreadyVisible) {
          const ownRow = await db
            .prepare(
              `SELECT username, wins, losses, current_streak, best_streak
               FROM daily_leaderboard WHERE uid = ?`
            )
            .bind(authResult.uid)
            .first();

          if (ownRow && ownRow.username) {
            const rankResult = await db
              .prepare(
                `SELECT COUNT(*) as count FROM daily_leaderboard
                 WHERE username IS NOT NULL
                   AND (best_streak > ? OR (best_streak = ? AND wins > ?))`
              )
              .bind(ownRow.best_streak, ownRow.best_streak, ownRow.wins)
              .first();

            self = {
              ...toEntry(ownRow),
              rank: (rankResult?.count ?? 0) + 1,
            };
          }
        }
      }
    }

    return json({ success: true, top, self });
  } catch (error) {
    console.error("Daily leaderboard fetch error:", error);
    return json({ success: false, error: "Failed to load leaderboard." }, 500);
  }
}
