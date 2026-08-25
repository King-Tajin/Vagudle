// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, checkActivityRateLimit } from "../_shared/api.js";
import { requireDiscordUser } from "../_shared/discordAuth.js";
import {
  isValidDailyProgressGuesses,
  isValidDailyProgressCellColors,
} from "../_shared/daily.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  try {
    const rateLimited = await checkActivityRateLimit(context);
    if (rateLimited) return rateLimited;

    const db = context.env.DB;
    if (!db)
      return json({ success: false, error: "Database not configured." }, 500);

    const url = new URL(context.request.url);
    const accessToken = url.searchParams.get("access_token");
    const duelId = url.searchParams.get("duel_id");
    if (!accessToken || !duelId)
      return json(
        { success: false, error: "Missing access_token or duel_id." },
        400
      );

    const discordUser = await requireDiscordUser(accessToken);
    if (discordUser instanceof Response) return discordUser;

    const row = await db
      .prepare(
        `SELECT guesses, cell_colors FROM duel_results
         WHERE duel_id = ? AND discord_id = ?`
      )
      .bind(duelId, discordUser.id)
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
    console.error("[activity-duel-progress] Load error:", error);
    return json({ success: false, error: "Failed to load progress." }, 500);
  }
}

export async function onRequestPost(context) {
  try {
    const rateLimited = await checkActivityRateLimit(context);
    if (rateLimited) return rateLimited;

    const db = context.env.DB;
    if (!db)
      return json({ success: false, error: "Database not configured." }, 500);

    const body = await context.request.json();
    const { access_token, duel_id, guesses, cell_colors } = body;

    if (
      typeof access_token !== "string" ||
      typeof duel_id !== "string" ||
      !duel_id ||
      !isValidDailyProgressGuesses(guesses) ||
      !isValidDailyProgressCellColors(cell_colors)
    )
      return json({ success: false, error: "Invalid request body." }, 400);

    const discordUser = await requireDiscordUser(access_token);
    if (discordUser instanceof Response) return discordUser;

    await db
      .prepare(
        `UPDATE duel_results
         SET guesses = ?, cell_colors = ?
         WHERE duel_id = ? AND discord_id = ? AND completed_at IS NULL`
      )
      .bind(
        JSON.stringify(guesses),
        JSON.stringify(cell_colors ?? {}),
        duel_id,
        discordUser.id
      )
      .run();

    return json({ success: true });
  } catch (error) {
    console.error("[activity-duel-progress] Save error:", error);
    return json({ success: false, error: "Failed to save progress." }, 500);
  }
}
