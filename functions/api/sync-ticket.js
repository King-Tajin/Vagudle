// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import {
  CORS_HEADERS,
  json,
  decode,
  validateDuelParsed,
  checkRateLimit,
} from "../_shared/api.js";
import { requireCloudAuth } from "../_shared/cloudAuth.js";
import { requireDiscordUser } from "../_shared/discordAuth.js";
import { resolveUidForDiscordId } from "../_shared/playerAccount.js";
import { getUtcDateString } from "../_shared/daily.js";
import { mintSyncTicket } from "../_shared/syncTicket.js";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

const resolveDailyTicket = async (context, body) => {
  const { access_token } = body;

  if (typeof access_token === "string" && access_token) {
    const db = context.env.DB;
    if (!db)
      return {
        error: json({ success: false, error: "Database not configured." }, 500),
      };

    const rateLimited = await checkRateLimit(context);
    if (rateLimited) return { error: rateLimited };

    const discordUser = await requireDiscordUser(access_token);
    if (discordUser instanceof Response) return { error: discordUser };

    const uid = await resolveUidForDiscordId(db, discordUser.id);
    return { uid, roomId: `daily:${uid}:${getUtcDateString()}` };
  }

  const { uid, error } = await requireCloudAuth(context);
  if (error) return { error };
  return { uid, roomId: `daily:${uid}:${getUtcDateString()}` };
};

const resolveDuelTicket = async (context, body) => {
  const { token, access_token, duel_id } = body;

  if (typeof access_token === "string" && access_token) {
    if (typeof duel_id !== "string" || !duel_id)
      return {
        error: json({ success: false, error: "Missing duel_id." }, 400),
      };

    const rateLimited = await checkRateLimit(context);
    if (rateLimited) return { error: rateLimited };

    const discordUser = await requireDiscordUser(access_token);
    if (discordUser instanceof Response) return { error: discordUser };

    return {
      uid: discordUser.id,
      roomId: `duel:${duel_id}:${discordUser.id}`,
    };
  }

  const key = context.env.CHALLENGE_KEY;
  if (!key)
    return {
      error: json({ success: false, error: "Server misconfiguration." }, 500),
    };

  if (typeof token !== "string")
    return { error: json({ success: false, error: "Missing token." }, 400) };

  let parsed;
  try {
    parsed = await decode(token, key);
  } catch {
    return { error: json({ success: false, error: "Invalid token." }, 400) };
  }

  if (!validateDuelParsed(parsed))
    return {
      error: json({ success: false, error: "Malformed duel data." }, 400),
    };

  return {
    uid: parsed.discord_id,
    roomId: `duel:${parsed.id}:${parsed.discord_id}`,
  };
};

export async function onRequestPost(context) {
  try {
    if (!context.env.SYNC_TICKET_KEY)
      return json({ success: false, error: "Server misconfiguration." }, 500);

    const body = await context.request.json();

    let resolved;
    if (body.mode === "daily")
      resolved = await resolveDailyTicket(context, body);
    else if (body.mode === "duel")
      resolved = await resolveDuelTicket(context, body);
    else return json({ success: false, error: "Unsupported mode." }, 400);

    if (resolved.error) return resolved.error;

    const ticket = await mintSyncTicket(context.env, {
      uid: resolved.uid,
      roomId: resolved.roomId,
    });
    return json({ success: true, ticket });
  } catch (error) {
    console.error("[sync-ticket] Error:", error);
    return json({ success: false, error: "Failed to create ticket." }, 500);
  }
}
