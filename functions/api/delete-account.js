// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json, checkRateLimit } from "../_shared/api.js";
import { verifyCloudSaveToken, getBearerToken } from "../_shared/cloudAuth.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const rateLimited = await checkRateLimit(context);
    if (rateLimited) return rateLimited;

    const db = context.env.DB;
    if (!db)
      return json({ success: false, error: "Database not configured." }, 500);

    const token = getBearerToken(context.request);
    if (!token)
      return json({ success: false, error: "Missing auth token." }, 401);

    const authResult = await verifyCloudSaveToken(context.request, context.env);
    if (!authResult)
      return json({ success: false, error: "Invalid auth token." }, 401);
    const { uid } = authResult;

    await db.prepare(`DELETE FROM player_saves WHERE uid = ?`).bind(uid).run();

    return json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return json(
      { success: false, error: "Failed to delete account data." },
      500
    );
  }
}
