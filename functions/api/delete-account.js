// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json } from "../_shared/api.js";
import { requireCloudAuth } from "../_shared/cloudAuth.js";
import { isAccountDeleted } from "../_shared/accountGuard.js";
import {
  hasFirebaseAdminConfig,
  deleteFirebaseUser,
} from "../_shared/firebaseAdmin.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const { db, uid, issuedAt, provider, error } = await requireCloudAuth(
      context,
      { allowDeleted: true }
    );
    if (error) return error;

    const body = await context.request.json().catch(() => null);
    const deleteAuthAccount =
      body?.deleteAuthAccount === true && provider === "firebase";

    if (deleteAuthAccount && !hasFirebaseAdminConfig(context.env))
      return json({ success: false, error: "Server misconfiguration." }, 500);

    if (!(await isAccountDeleted(db, uid, issuedAt))) {
      const existingRow = await db
        .prepare(
          `SELECT discord_id, play_games_id FROM player_saves WHERE uid = ?`
        )
        .bind(uid)
        .first();

      const discordId = uid.startsWith("discord:")
        ? uid.slice("discord:".length)
        : (existingRow?.discord_id ?? null);

      const playGamesId = uid.startsWith("playgames:")
        ? uid.slice("playgames:".length)
        : (existingRow?.play_games_id ?? null);

      const tombstoneUids = [
        ...new Set(
          [
            uid,
            discordId ? `discord:${discordId}` : null,
            playGamesId ? `playgames:${playGamesId}` : null,
          ].filter(Boolean)
        ),
      ];

      const deletedAt = Math.floor(Date.now() / 1000);

      const statements = [
        ...tombstoneUids.map((tombstoneUid) =>
          db
            .prepare(
              `INSERT INTO deleted_accounts (uid, deleted_at, restarted_at)
               VALUES (?, ?, NULL)
               ON CONFLICT(uid) DO UPDATE SET
                 deleted_at = excluded.deleted_at,
                 restarted_at = NULL`
            )
            .bind(tombstoneUid, deletedAt)
        ),
        db.prepare(`DELETE FROM player_saves WHERE uid = ?`).bind(uid),
        db.prepare(`DELETE FROM daily_leaderboard WHERE uid = ?`).bind(uid),
        db.prepare(`DELETE FROM daily_attempts WHERE uid = ?`).bind(uid),
      ];

      if (discordId) {
        statements.push(
          db
            .prepare(`DELETE FROM duel_results WHERE discord_id = ?`)
            .bind(discordId)
        );
      }

      await db.batch(statements);
    }

    if (deleteAuthAccount && !(await deleteFirebaseUser(context.env, uid)))
      return json(
        { success: false, error: "Failed to delete sign-in account." },
        502
      );

    return json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return json(
      { success: false, error: "Failed to delete account data." },
      500
    );
  }
}
