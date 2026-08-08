// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json } from "../_shared/api.js";
import { requireCloudAuth } from "../_shared/cloudAuth.js";
import {
  getUtcDateString,
  isValidDailyProgressGuesses,
  isValidDailyProgressCellColors,
} from "../_shared/daily.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  try {
    const { db, uid, error } = await requireCloudAuth(context);
    if (error) return error;

    const date = getUtcDateString();

    const row = await db
      .prepare(
        `SELECT guesses, cell_colors FROM daily_attempts WHERE uid = ? AND date = ?`
      )
      .bind(uid, date)
      .first();

    if (!row || !row.guesses)
      return json({ success: true, date, guesses: null, cellColors: null });

    let guesses = null;
    let cellColors = null;
    try {
      guesses = JSON.parse(row.guesses);
    } catch {
      guesses = null;
    }
    try {
      cellColors = row.cell_colors ? JSON.parse(row.cell_colors) : null;
    } catch {
      cellColors = null;
    }

    return json({ success: true, date, guesses, cellColors });
  } catch (error) {
    console.error("[daily-progress] Load error:", error);
    return json({ success: false, error: "Failed to load progress." }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const { db, uid, error } = await requireCloudAuth(context);
    if (error) return error;

    const body = await context.request.json();
    const { guesses, cellColors } = body;

    if (
      !isValidDailyProgressGuesses(guesses) ||
      !isValidDailyProgressCellColors(cellColors)
    )
      return json({ success: false, error: "Invalid progress data." }, 400);

    const date = getUtcDateString();
    const nowIso = new Date().toISOString();

    await db
      .prepare(
        `INSERT INTO daily_attempts (uid, date, platform, started_at, guesses, cell_colors)
         VALUES (?, ?, 'web', ?, ?, ?)
         ON CONFLICT(uid, date) DO UPDATE SET
           guesses = excluded.guesses,
           cell_colors = excluded.cell_colors
         WHERE daily_attempts.completed_at IS NULL`
      )
      .bind(
        uid,
        date,
        nowIso,
        JSON.stringify(guesses),
        JSON.stringify(cellColors ?? {})
      )
      .run();

    return json({ success: true });
  } catch (error) {
    console.error("[daily-progress] Save error:", error);
    return json({ success: false, error: "Failed to save progress." }, 500);
  }
}
