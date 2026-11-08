// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json } from "../_shared/api.js";
import { requireCloudAuth } from "../_shared/cloudAuth.js";
import {
  NOT_DELETED_SQL,
  notDeletedBinds,
  accountDeletedResponse,
  isAccountDeleted,
} from "../_shared/accountGuard.js";
import { rowToSave } from "../_shared/saveRow.js";

const MAX_FIELD_LENGTH = 100_000;

const isJsonString = (value) => {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > MAX_FIELD_LENGTH
  )
    return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

const DISCORD_UID_PREFIX = "discord:";

const discordIdFromUid = (uid) =>
  uid.startsWith(DISCORD_UID_PREFIX)
    ? uid.slice(DISCORD_UID_PREFIX.length)
    : null;

const isValidBackgroundId = (value) =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && /^[a-z0-9_]{1,64}$/.test(value));

const isValidIsoDateOrNull = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value !== "string" || value.length > 64) return false;
  return !Number.isNaN(new Date(value).getTime());
};

const MODE_LEGACY = "legacy";
const MODE_CREATE = "create";
const MODE_CAS = "cas";

const parseWriteMode = (body) => {
  if (!Object.prototype.hasOwnProperty.call(body, "baseRev"))
    return { mode: MODE_LEGACY };
  const { baseRev } = body;
  if (baseRev === undefined) return { mode: MODE_LEGACY };
  if (baseRev === null) return { mode: MODE_CREATE };
  if (Number.isInteger(baseRev) && baseRev >= 1)
    return { mode: MODE_CAS, baseRev };
  return null;
};

const CREATE_SQL = `INSERT INTO player_saves
  (uid, discord_id, achievements, word_connoisseur, stats_normal, stats_hard, daily_stats, settings, background_id, last_played_at, first_seen_at, updated_at)
  SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  WHERE ${NOT_DELETED_SQL}
  ON CONFLICT(uid) DO NOTHING
  RETURNING updated_at, rev`;

const UPSERT_SQL = `INSERT INTO player_saves
  (uid, discord_id, achievements, word_connoisseur, stats_normal, stats_hard, daily_stats, settings, background_id, last_played_at, first_seen_at, updated_at)
  SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
  WHERE ${NOT_DELETED_SQL}
    AND (? = 0 OR EXISTS (SELECT 1 FROM player_saves WHERE uid = ?))
  ON CONFLICT(uid) DO UPDATE SET
    discord_id = COALESCE(excluded.discord_id, player_saves.discord_id),
    achievements = excluded.achievements,
    word_connoisseur = excluded.word_connoisseur,
    stats_normal = excluded.stats_normal,
    stats_hard = excluded.stats_hard,
    daily_stats = excluded.daily_stats,
    settings = excluded.settings,
    background_id = excluded.background_id,
    last_played_at = excluded.last_played_at,
    first_seen_at = excluded.first_seen_at,
    rev = CASE
      WHEN player_saves.achievements IS excluded.achievements
        AND player_saves.word_connoisseur IS excluded.word_connoisseur
        AND player_saves.stats_normal IS excluded.stats_normal
        AND player_saves.stats_hard IS excluded.stats_hard
        AND player_saves.daily_stats IS excluded.daily_stats
        AND player_saves.settings IS excluded.settings
        AND player_saves.background_id IS excluded.background_id
        AND player_saves.last_played_at IS excluded.last_played_at
        AND player_saves.first_seen_at IS excluded.first_seen_at
      THEN player_saves.rev
      ELSE player_saves.rev + 1
    END,
    updated_at = CASE
      WHEN player_saves.achievements IS excluded.achievements
        AND player_saves.word_connoisseur IS excluded.word_connoisseur
        AND player_saves.stats_normal IS excluded.stats_normal
        AND player_saves.stats_hard IS excluded.stats_hard
        AND player_saves.daily_stats IS excluded.daily_stats
        AND player_saves.settings IS excluded.settings
        AND player_saves.background_id IS excluded.background_id
        AND player_saves.last_played_at IS excluded.last_played_at
        AND player_saves.first_seen_at IS excluded.first_seen_at
      THEN player_saves.updated_at
      ELSE excluded.updated_at
    END
  WHERE ? IS NULL OR player_saves.rev = ?
  RETURNING updated_at, rev`;

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const { db, uid, issuedAt, error } = await requireCloudAuth(context);
    if (error) return error;

    const body = await context.request.json();
    const {
      achievements,
      wordConnoisseur,
      statsNormal,
      statsHard,
      dailyStats,
      settings,
      backgroundId,
      lastPlayedAt,
      firstSeenAt,
    } = body;

    if (
      !isJsonString(achievements) ||
      !isJsonString(wordConnoisseur) ||
      !isJsonString(statsNormal) ||
      !isJsonString(statsHard) ||
      !isJsonString(dailyStats) ||
      !isJsonString(settings) ||
      !isValidBackgroundId(backgroundId) ||
      !isValidIsoDateOrNull(lastPlayedAt) ||
      !isValidIsoDateOrNull(firstSeenAt)
    )
      return json({ success: false, error: "Invalid save data." }, 400);

    const writeMode = parseWriteMode(body);
    if (!writeMode)
      return json({ success: false, error: "Invalid save data." }, 400);

    const discordId = discordIdFromUid(uid);
    const updatedAt = new Date().toISOString();

    const rowBinds = [
      uid,
      discordId,
      achievements,
      wordConnoisseur,
      statsNormal,
      statsHard,
      dailyStats,
      settings,
      backgroundId ?? null,
      lastPlayedAt ?? null,
      firstSeenAt ?? null,
      updatedAt,
      ...notDeletedBinds(uid, issuedAt),
    ];

    const isCreate = writeMode.mode === MODE_CREATE;
    const isCas = writeMode.mode === MODE_CAS;
    const baseRev = isCas ? writeMode.baseRev : null;

    const row = await db
      .prepare(isCreate ? CREATE_SQL : UPSERT_SQL)
      .bind(
        ...(isCreate
          ? rowBinds
          : [...rowBinds, isCas ? 1 : 0, uid, baseRev, baseRev])
      )
      .first();

    if (row)
      return json({ success: true, updatedAt: row.updated_at, rev: row.rev });

    if (writeMode.mode === MODE_LEGACY) return accountDeletedResponse();

    if (await isAccountDeleted(db, uid, issuedAt))
      return accountDeletedResponse();

    const current = await db
      .prepare(`SELECT * FROM player_saves WHERE uid = ?`)
      .bind(uid)
      .first();

    if (!current) return json({ success: false, error: "not_found" }, 409);

    return json(
      {
        success: false,
        error: "conflict",
        rev: current.rev,
        save: rowToSave(current),
      },
      409
    );
  } catch (error) {
    console.error("Save error:", error);
    return json({ success: false, error: "Failed to save." }, 500);
  }
}
