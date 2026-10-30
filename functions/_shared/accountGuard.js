import { json } from "./api.js";

const DELETED_CONDITION = `uid = ? AND ((? IS NULL AND restarted_at IS NULL) OR (? IS NOT NULL AND deleted_at >= ?))`;

export const NOT_DELETED_SQL = `NOT EXISTS (SELECT 1 FROM deleted_accounts WHERE ${DELETED_CONDITION})`;

export const notDeletedBinds = (uid, issuedAt) => {
  const value = typeof issuedAt === "number" ? issuedAt : null;
  return [uid, value, value, value];
};

export const isAccountDeleted = async (db, uid, issuedAt) => {
  const row = await db
    .prepare(`SELECT 1 AS hit FROM deleted_accounts WHERE ${DELETED_CONDITION}`)
    .bind(...notDeletedBinds(uid, issuedAt))
    .first();
  return Boolean(row);
};

export const accountDeletedResponse = () =>
  json({ success: false, error: "account_deleted" }, 403);

export const markAccountRestarted = (db, uid) =>
  db
    .prepare(`UPDATE deleted_accounts SET restarted_at = ? WHERE uid = ?`)
    .bind(Math.floor(Date.now() / 1000), uid)
    .run();
