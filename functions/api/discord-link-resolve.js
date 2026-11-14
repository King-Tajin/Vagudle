// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json } from "../_shared/api.js";
import { requireCloudAuth } from "../_shared/cloudAuth.js";
import {
  KEEP_ACCOUNT,
  KEEP_DISCORD,
  mergeDiscordSave,
  readConflictTicket,
} from "../_shared/discordLinkMerge.js";
import {
  ensurePlayerSaveExists,
  findPlayerSaveByDiscordId,
} from "../_shared/playerAccount.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const linkSecret = context.env.ACCOUNT_LINK_SECRET;
    if (!linkSecret)
      return json({ success: false, error: "Server misconfiguration." }, 500);

    const { db, uid, issuedAt, error } = await requireCloudAuth(context);
    if (error) return error;

    const body = await context.request.json();
    const { ticket, keep } = body;
    if (keep !== KEEP_ACCOUNT && keep !== KEEP_DISCORD)
      return json({ success: false, error: "Invalid choice." }, 400);

    const payload = await readConflictTicket(linkSecret, ticket);
    if (!payload || payload.uid !== uid)
      return json({ success: false, error: "Invalid or expired link." }, 400);

    await ensurePlayerSaveExists(db, uid, issuedAt);

    const result = await mergeDiscordSave(db, uid, payload.discordId, keep);
    if (result.ok) return json({ success: true });

    const existing = await findPlayerSaveByDiscordId(db, payload.discordId);
    if (existing && existing.uid === uid) return json({ success: true });

    return json(
      {
        success: false,
        error:
          result.reason === "account_linked_elsewhere"
            ? "This account is already linked to a different Discord account."
            : "These saves changed. Start linking again.",
      },
      409
    );
  } catch (error) {
    console.error("[discord-link-resolve] Error:", error);
    return json({ success: false, error: "Failed to link account." }, 500);
  }
}
