// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json } from "../_shared/api.js";
import { requireUsernameAuth } from "../_shared/cloudAuth.js";

const USERNAME_PATTERN = /^[A-Za-z0-9_ -]{3,20}$/;
const CHANGE_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

const normalizeUsername = (raw) =>
  typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";

const canChangeAtFrom = (updatedAt) =>
  updatedAt
    ? new Date(new Date(updatedAt).getTime() + CHANGE_COOLDOWN_MS).toISOString()
    : null;

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  try {
    const { db, uid, error } = await requireUsernameAuth(context);
    if (error) return error;

    const row = await db
      .prepare(
        `SELECT username, username_updated_at FROM daily_leaderboard WHERE uid = ?`
      )
      .bind(uid)
      .first();

    const canChangeAt = canChangeAtFrom(row?.username_updated_at);
    const now = Date.now();

    return json({
      success: true,
      username: row?.username ?? null,
      canChangeAt:
        canChangeAt && new Date(canChangeAt).getTime() > now
          ? canChangeAt
          : null,
    });
  } catch (error) {
    console.error("Username fetch error:", error);
    return json({ success: false, error: "Failed to load username." }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const { db, uid, error } = await requireUsernameAuth(context);
    if (error) return error;

    const body = await context.request.json();
    const username = normalizeUsername(body.username);
    if (!USERNAME_PATTERN.test(username))
      return json({ success: false, error: "invalid" }, 400);

    const nowIso = new Date().toISOString();
    const cutoff = new Date(Date.now() - CHANGE_COOLDOWN_MS).toISOString();

    await db
      .prepare(
        `INSERT OR IGNORE INTO daily_leaderboard
           (uid, username, wins, losses, current_streak, best_streak, last_result_date, updated_at)
         VALUES (?, NULL, 0, 0, 0, 0, NULL, ?)`
      )
      .bind(uid, nowIso)
      .run();

    try {
      const result = await db
        .prepare(
          `UPDATE daily_leaderboard
           SET username = ?, username_updated_at = ?
           WHERE uid = ? AND (username_updated_at IS NULL OR username_updated_at <= ?)`
        )
        .bind(username, nowIso, uid, cutoff)
        .run();

      if (result.meta.changes === 0) {
        const row = await db
          .prepare(
            `SELECT username_updated_at FROM daily_leaderboard WHERE uid = ?`
          )
          .bind(uid)
          .first();
        return json(
          {
            success: false,
            error: "rate_limited",
            retryAt: canChangeAtFrom(row?.username_updated_at),
          },
          429
        );
      }
    } catch (error) {
      if (
        String(error?.message ?? error)
          .toLowerCase()
          .includes("unique")
      )
        return json({ success: false, error: "taken" }, 409);
      console.error("Username update error:", error);
      return json({ success: false, error: "Failed to update username." }, 500);
    }

    return json({
      success: true,
      username,
      canChangeAt: canChangeAtFrom(nowIso),
    });
  } catch (error) {
    console.error("Username update error:", error);
    return json({ success: false, error: "Failed to update username." }, 500);
  }
}
