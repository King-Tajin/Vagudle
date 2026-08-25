// noinspection JSUnresolvedReference

import { verifyFirebaseIdToken, getBearerToken } from "./firebaseAuth.js";
import { decode, json, checkRateLimit } from "./api.js";
import { isValidDiscordSession, requireDiscordUser } from "./discordAuth.js";
import { isValidPlayGamesSession } from "./playGamesAuth.js";
import {
  findPlayerSaveByPlayGamesId,
  ensurePlayerSaveExists,
} from "./playerAccount.js";

export { getBearerToken };

export const verifyCloudSaveToken = async (request, env) => {
  const token = getBearerToken(request);
  if (!token) return null;

  if (env.FIREBASE_PROJECT_ID) {
    try {
      const { uid, payload } = await verifyFirebaseIdToken(
        token,
        env.FIREBASE_PROJECT_ID
      );
      const username = typeof payload.name === "string" ? payload.name : null;
      return { uid, username };
    } catch {}
  }

  if (env.DISCORD_SESSION_KEY) {
    try {
      const payload = await decode(token, env.DISCORD_SESSION_KEY);
      if (isValidDiscordSession(payload))
        return {
          uid: payload.uid,
          username:
            typeof payload.username === "string" ? payload.username : null,
        };
    } catch {}
  }

  if (env.PLAYGAMES_SESSION_KEY) {
    try {
      const payload = await decode(token, env.PLAYGAMES_SESSION_KEY);
      if (isValidPlayGamesSession(payload)) {
        const username =
          typeof payload.username === "string" ? payload.username : null;
        let uid = payload.uid;
        if (env.DB && typeof payload.playGamesId === "string") {
          const linkedAccount = await findPlayerSaveByPlayGamesId(
            env.DB,
            payload.playGamesId
          );
          if (linkedAccount) uid = linkedAccount.uid;
        }
        return { uid, username };
      }
    } catch {}
  }

  return null;
};

const prepareCloudAuthContext = async (context) => {
  const rateLimited = await checkRateLimit(context);
  if (rateLimited) return { error: rateLimited };

  const db = context.env.DB;
  if (!db)
    return {
      error: json({ success: false, error: "Database not configured." }, 500),
    };

  const token = getBearerToken(context.request);
  if (!token)
    return {
      error: json({ success: false, error: "Missing auth token." }, 401),
    };

  return { db, token };
};

export const requireCloudAuth = async (context) => {
  const prepared = await prepareCloudAuthContext(context);
  if (prepared.error) return prepared;
  const { db } = prepared;

  const authResult = await verifyCloudSaveToken(context.request, context.env);
  if (!authResult)
    return {
      error: json({ success: false, error: "Invalid auth token." }, 401),
    };

  return { db, uid: authResult.uid, username: authResult.username };
};

export const resolveAccountLinkToken = async (context, payloadField) => {
  const linkSecret = context.env.ACCOUNT_LINK_SECRET;
  if (!linkSecret)
    return {
      error: json({ success: false, error: "Server misconfiguration." }, 500),
    };

  const { db, uid, error } = await requireCloudAuth(context);
  if (error) return { error };

  const body = await context.request.json();
  const { link_token } = body;
  if (!link_token || typeof link_token !== "string")
    return {
      error: json({ success: false, error: "Missing link_token." }, 400),
    };

  let payload;
  try {
    payload = await decode(link_token, linkSecret);
  } catch {
    return {
      error: json({ success: false, error: "Invalid or expired link." }, 400),
    };
  }
  if (
    !payload ||
    typeof payload[payloadField] !== "string" ||
    typeof payload.exp !== "number" ||
    payload.exp <= Date.now()
  )
    return {
      error: json({ success: false, error: "Invalid or expired link." }, 400),
    };

  await ensurePlayerSaveExists(db, uid);

  return { db, uid, payload };
};

const resolveUidForDiscordAccessToken = async (accessToken, db) => {
  const discordUser = await requireDiscordUser(accessToken);
  if (discordUser instanceof Response) return null;

  const existingAccount = await db
    .prepare(`SELECT uid FROM player_saves WHERE discord_id = ?`)
    .bind(discordUser.id)
    .first();

  return existingAccount ? existingAccount.uid : `discord:${discordUser.id}`;
};

export const requireUsernameAuth = async (context) => {
  const prepared = await prepareCloudAuthContext(context);
  if (prepared.error) return prepared;
  const { db, token } = prepared;

  const authResult = await verifyCloudSaveToken(context.request, context.env);
  if (authResult)
    return { db, uid: authResult.uid, username: authResult.username };

  const discordUid = await resolveUidForDiscordAccessToken(token, db);
  if (discordUid) return { db, uid: discordUid, username: null };

  return {
    error: json({ success: false, error: "Invalid auth token." }, 401),
  };
};
