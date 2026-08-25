// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import {
  CORS_HEADERS,
  json,
  decode,
  decodeChallengeToken,
  ONE_DAY_MS,
  validateDuelParsed,
  checkRateLimit,
} from "../_shared/api.js";
import {
  isValidDailyProgressGuesses,
  isValidDailyProgressCellColors,
} from "../_shared/daily.js";

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

    const { parsed, error } = await decodeChallengeToken(context);
    if (error) return error;

    if (!validateDuelParsed(parsed))
      return json({ success: false, error: "Malformed duel data." }, 400);

    const row = await db
      .prepare(
        `SELECT guesses, cell_colors FROM duel_results
         WHERE duel_id = ? AND discord_id = ?`
      )
      .bind(parsed.id, parsed.discord_id)
      .first();

    if (!row || !row.guesses)
      return json({ success: true, guesses: null, cellColors: null });

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

    return json({ success: true, guesses, cellColors });
  } catch (error) {
    console.error("[duel-progress] Load error:", error);
    return json({ success: false, error: "Failed to load progress." }, 500);
  }
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

    const body = await context.request.json();
    const { token, guesses, cellColors } = body;

    if (
      typeof token !== "string" ||
      !isValidDailyProgressGuesses(guesses) ||
      !isValidDailyProgressCellColors(cellColors)
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
      !isValidDailyProgressGuesses(guesses, parsed.length) ||
      guesses.length > parsed.guesses
    )
      return json({ success: false, error: "Invalid guesses snapshot." }, 400);

    if (Date.now() - parsed.created_at > ONE_DAY_MS)
      return json({ success: false, error: "Duel has expired." }, 400);

    await db
      .prepare(
        `UPDATE duel_results
         SET guesses = ?, cell_colors = ?
         WHERE duel_id = ? AND discord_id = ? AND completed_at IS NULL`
      )
      .bind(
        JSON.stringify(guesses),
        JSON.stringify(cellColors ?? {}),
        parsed.id,
        parsed.discord_id
      )
      .run();

    return json({ success: true });
  } catch (error) {
    console.error("[duel-progress] Save error:", error);
    return json({ success: false, error: "Failed to save progress." }, 500);
  }
}
