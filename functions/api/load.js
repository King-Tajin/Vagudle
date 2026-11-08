// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json } from "../_shared/api.js";
import { requireCloudAuth } from "../_shared/cloudAuth.js";
import { rowToSave } from "../_shared/saveRow.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  try {
    const { db, uid, error } = await requireCloudAuth(context);
    if (error) return error;

    const row = await db
      .prepare(`SELECT * FROM player_saves WHERE uid = ?`)
      .bind(uid)
      .first();

    if (!row)
      return json({ success: false, error: "No cloud save found." }, 404);

    const knownRev = Number.parseInt(
      new URL(context.request.url).searchParams.get("rev") ?? "",
      10
    );
    if (Number.isInteger(knownRev) && knownRev === row.rev)
      return json({ success: true, unchanged: true, rev: row.rev });

    return json({ success: true, save: rowToSave(row) });
  } catch (error) {
    console.error("Load error:", error);
    return json({ success: false, error: "Failed to load." }, 500);
  }
}
