// noinspection JSUnresolvedReference

import { encode, decode, json } from "./api.js";
import { findPlayerSaveByDiscordId } from "./playerAccount.js";

export const DISCORD_UID_PREFIX = "discord:";

const CONFLICT_TICKET_KIND = "discord_save_conflict";
const CONFLICT_TICKET_TTL_MS = 10 * 60 * 1000;

export const KEEP_ACCOUNT = "account";
export const KEEP_DISCORD = "discord";

export const isDiscordPrimaryUid = (uid) =>
  typeof uid === "string" && uid.startsWith(DISCORD_UID_PREFIX);

export const discordUidFor = (discordId) => `${DISCORD_UID_PREFIX}${discordId}`;

const parseJsonObject = (value) => {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const toCount = (value) =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;

export const summarizeSave = (row) => {
  if (!row) return null;
  const achievements = parseJsonObject(row.achievements);
  const statsNormal = parseJsonObject(row.stats_normal);
  const statsHard = parseJsonObject(row.stats_hard);
  return {
    gamesPlayed:
      toCount(statsNormal.totalGames) + toCount(statsHard.totalGames),
    bestStreak: Math.max(
      toCount(statsNormal.bestStreak),
      toCount(statsHard.bestStreak)
    ),
    achievements: Array.isArray(achievements.unlockedIds)
      ? achievements.unlockedIds.length
      : 0,
    lastPlayedAt: row.last_played_at ?? row.updated_at ?? null,
  };
};

const loadSaveRow = (db, uid) =>
  db
    .prepare(
      `SELECT uid, discord_id, achievements, stats_normal, stats_hard, last_played_at, updated_at
       FROM player_saves WHERE uid = ?`
    )
    .bind(uid)
    .first();

export const detectDiscordLinkConflict = async (db, uid, discordId) => {
  const existing = await findPlayerSaveByDiscordId(db, discordId);
  if (!existing || existing.uid === uid) return "none";
  return existing.uid === discordUidFor(discordId)
    ? "mergeable"
    : "linked_elsewhere";
};

export const readConflictTicket = async (secret, ticket) => {
  if (typeof ticket !== "string" || !ticket) return null;
  try {
    const payload = await decode(ticket, secret);
    if (
      !payload ||
      payload.kind !== CONFLICT_TICKET_KIND ||
      typeof payload.uid !== "string" ||
      typeof payload.discordId !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Date.now()
    )
      return null;
    return payload;
  } catch {
    return null;
  }
};

export const saveConflictResponse = async (env, db, uid, discordId) => {
  const secret = env.ACCOUNT_LINK_SECRET;
  if (!secret)
    return json({ success: false, error: "Server misconfiguration." }, 500);

  const [accountRow, discordRow] = await Promise.all([
    loadSaveRow(db, uid),
    loadSaveRow(db, discordUidFor(discordId)),
  ]);
  if (!discordRow)
    return json(
      { success: false, error: "This Discord account is already linked." },
      409
    );

  const ticket = await encode(
    {
      kind: CONFLICT_TICKET_KIND,
      uid,
      discordId,
      exp: Date.now() + CONFLICT_TICKET_TTL_MS,
    },
    secret
  );

  return json(
    {
      success: false,
      code: "save_conflict",
      error: "This Discord account already has its own saved progress.",
      conflict: {
        ticket,
        account: summarizeSave(accountRow),
        discord: summarizeSave(discordRow),
      },
    },
    409
  );
};

const GUARD_SQL = `EXISTS (SELECT 1 FROM player_saves WHERE uid = ? AND discord_id IS NULL)
  AND EXISTS (SELECT 1 FROM player_saves WHERE uid = ? AND discord_id = ?)`;

const OVERWRITE_COLUMNS = [
  "achievements",
  "word_connoisseur",
  "stats_normal",
  "stats_hard",
  "daily_stats",
  "settings",
  "background_id",
];

export const mergeDiscordSave = async (db, uid, discordId, keep) => {
  const discordUid = discordUidFor(discordId);
  const [accountRow, discordRow] = await Promise.all([
    loadSaveRow(db, uid),
    loadSaveRow(db, discordUid),
  ]);

  if (!accountRow) return { ok: false, reason: "account_missing" };
  if (accountRow.discord_id && accountRow.discord_id !== discordId)
    return { ok: false, reason: "account_linked_elsewhere" };
  if (!discordRow || discordRow.discord_id !== discordId)
    return { ok: false, reason: "nothing_to_merge" };

  const guardBinds = [uid, discordUid, discordId];
  const guarded = (sql, binds) =>
    db.prepare(`${sql} AND ${GUARD_SQL}`).bind(...binds, ...guardBinds);

  const statements = [
    guarded(`UPDATE OR IGNORE daily_attempts SET uid = ? WHERE uid = ?`, [
      uid,
      discordUid,
    ]),
    guarded(`DELETE FROM daily_attempts WHERE uid = ?`, [discordUid]),
  ];

  if (keep === KEEP_DISCORD) {
    statements.push(
      guarded(`DELETE FROM daily_leaderboard WHERE uid = ?`, [uid]),
      guarded(`UPDATE daily_leaderboard SET uid = ? WHERE uid = ?`, [
        uid,
        discordUid,
      ]),
      guarded(
        `UPDATE player_saves SET ${OVERWRITE_COLUMNS.map(
          (column) =>
            `${column} = (SELECT ${column} FROM player_saves WHERE uid = ?)`
        ).join(", ")} WHERE uid = ?`,
        [...OVERWRITE_COLUMNS.map(() => discordUid), uid]
      )
    );
  } else {
    statements.push(
      guarded(`DELETE FROM daily_leaderboard WHERE uid = ?`, [discordUid])
    );
  }

  statements.push(
    guarded(
      `UPDATE player_saves SET
         first_seen_at = (SELECT MIN(first_seen_at) FROM player_saves WHERE uid IN (?, ?)),
         last_played_at = (SELECT MAX(last_played_at) FROM player_saves WHERE uid IN (?, ?))
       WHERE uid = ?`,
      [uid, discordUid, uid, discordUid, uid]
    ),
    guarded(`DELETE FROM player_saves WHERE uid = ?`, [discordUid]),
    db
      .prepare(
        `UPDATE player_saves SET discord_id = ?, rev = rev + 1, updated_at = ?
         WHERE uid = ? AND discord_id IS NULL`
      )
      .bind(discordId, new Date().toISOString(), uid)
  );

  const results = await db.batch(statements);
  const linked = results[results.length - 1].meta.changes === 1;
  return linked ? { ok: true } : { ok: false, reason: "changed" };
};
