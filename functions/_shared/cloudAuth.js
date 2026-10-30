// noinspection JSUnresolvedReference

import { verifyFirebaseIdToken, getBearerToken } from "./firebaseAuth.js";
import { decode, json } from "./api.js";
import {
  isValidDiscordSession,
  requireDiscordUser,
  discordSessionIssuedAt,
} from "./discordAuth.js";
import {
  isValidPlayGamesSession,
  playGamesSessionIssuedAt,
} from "./playGamesAuth.js";
import { isAccountDeleted, accountDeletedResponse } from "./accountGuard.js";
import {
  findPlayerSaveByDiscordId,
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
      const issuedAt = typeof payload.iat === "number" ? payload.iat : 0;
      return { uid, username, issuedAt, provider: "firebase" };
    } catch {}
  }

  if (env.DISCORD_SESSION_KEY) {
    try {
      const payload = await decode(token, env.DISCORD_SESSION_KEY);
      if (isValidDiscordSession(payload)) {
        const username =
          typeof payload.username === "string" ? payload.username : null;
        let uid = payload.uid;
        if (env.DB && typeof payload.discordId === "string") {
          const linkedAccount = await findPlayerSaveByDiscordId(
            env.DB,
            payload.discordId
          );
          if (linkedAccount) uid = linkedAccount.uid;
        }
        return {
          uid,
          username,
          issuedAt: discordSessionIssuedAt(payload),
          provider: "discord",
        };
      }
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
        return {
          uid,
          username,
          issuedAt: playGamesSessionIssuedAt(payload),
          provider: "playgames",
        };
      }
    } catch {}
  }

  return null;
};

const prepareCloudAuthContext = async (context) => {
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

export const requireCloudAuth = async (context, options = {}) => {
  const prepared = await prepareCloudAuthContext(context);
  if (prepared.error) return prepared;
  const { db } = prepared;

  const authResult = await verifyCloudSaveToken(context.request, context.env);
  if (!authResult)
    return {
      error: json({ success: false, error: "Invalid auth token." }, 401),
    };

  if (
    !options.allowDeleted &&
    (await isAccountDeleted(db, authResult.uid, authResult.issuedAt))
  )
    return { error: accountDeletedResponse() };

  return {
    db,
    uid: authResult.uid,
    username: authResult.username,
    issuedAt: authResult.issuedAt,
    provider: authResult.provider,
  };
};

export const resolveAccountLinkToken = async (
  context,
  payloadField,
  usernameField
) => {
  const linkSecret = context.env.ACCOUNT_LINK_SECRET;
  if (!linkSecret)
    return {
      error: json({ success: false, error: "Server misconfiguration." }, 500),
    };

  const { db, uid, issuedAt, error } = await requireCloudAuth(context);
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

  const normalizeName = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : "";
  const expectedName = normalizeName(payload[usernameField]);
  const confirmedName = normalizeName(body.confirmation);
  if (!expectedName || confirmedName !== expectedName)
    return {
      error: json(
        {
          success: false,
          error:
            "The name you entered does not match the account being linked.",
        },
        400
      ),
    };

  await ensurePlayerSaveExists(db, uid, issuedAt);

  return { db, uid, payload };
};

const resolveUidForDiscordAccessToken = async (accessToken, db, clientId) => {
  const discordUser = await requireDiscordUser(accessToken, clientId);
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
  if (authResult) {
    if (await isAccountDeleted(db, authResult.uid, authResult.issuedAt))
      return { error: accountDeletedResponse() };
    return {
      db,
      uid: authResult.uid,
      username: authResult.username,
      issuedAt: authResult.issuedAt,
    };
  }

  const discordUid = await resolveUidForDiscordAccessToken(
    token,
    db,
    context.env.DISCORD_CLIENT_ID
  );
  if (discordUid) {
    if (await isAccountDeleted(db, discordUid, null))
      return { error: accountDeletedResponse() };
    return { db, uid: discordUid, username: null, issuedAt: null };
  }

  return {
    error: json({ success: false, error: "Invalid auth token." }, 401),
  };
};
