// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, checkRateLimit } from "../_shared/api.js";
import { getUtcDateString, getRotationForDate } from "../_shared/daily.js";

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

    const date = getUtcDateString();
    const rotation = getRotationForDate(date);

    const row = await db
      .prepare(
        `SELECT word, word_length, hard_mode,
                (SELECT MIN(date) FROM daily_words) AS origin_date
         FROM daily_words
         WHERE date = ?`
      )
      .bind(date)
      .first();

    if (!row) {
      return json(
        {
          success: false,
          error: "No daily word configured for today.",
          date,
        },
        404
      );
    }

    if (
      row.word_length !== rotation.length ||
      Boolean(row.hard_mode) !== rotation.hardMode
    ) {
      console.error(
        `Daily word for ${date} does not match the expected rotation ` +
          `(expected ${rotation.length} letters, ${rotation.hardMode ? "hard" : "normal"}).`
      );
    }

    if (
      typeof row.word !== "string" ||
      !/^[a-zA-Z]+$/.test(row.word) ||
      row.word.length !== row.word_length
    ) {
      return json(
        { success: false, error: "Daily word is misconfigured." },
        500
      );
    }

    return json({
      success: true,
      date,
      word: row.word.toUpperCase(),
      wordLength: row.word_length,
      hardMode: Boolean(row.hard_mode),
      originDate: row.origin_date,
    });
  } catch (error) {
    console.error("Daily word fetch error:", error);
    return json({ success: false, error: "Failed to load daily word." }, 500);
  }
}
