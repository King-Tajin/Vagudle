// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, checkActivityRateLimit } from "../_shared/api.js";
import { requireDiscordUser } from "../_shared/discordAuth.js";
import { resolveUidForDiscordId } from "../_shared/playerAccount.js";
import { getUtcDateString } from "../_shared/daily.js";

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

    const accessToken = new URL(context.request.url).searchParams.get(
      "access_token"
    );
    if (!accessToken)
      return json({ success: false, error: "Missing access_token." }, 400);

    const discordUser = await requireDiscordUser(accessToken);
    if (discordUser instanceof Response) return discordUser;
    const uid = await resolveUidForDiscordId(db, discordUser.id);

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
    console.error("[activity-daily-progress] Load error:", error);
    return json({ success: false, error: "Failed to load progress." }, 500);
  }
}
