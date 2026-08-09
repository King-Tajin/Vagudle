import { verifyFirebaseIdToken, getBearerToken } from "./firebaseAuth.js";
import { decode, json, checkRateLimit } from "./api.js";
import { isValidDiscordSession } from "./discordAuth.js";

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

  return null;
};

export const requireCloudAuth = async (context) => {
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

  const authResult = await verifyCloudSaveToken(context.request, context.env);
  if (!authResult)
    return {
      error: json({ success: false, error: "Invalid auth token." }, 401),
    };

  return { db, uid: authResult.uid, username: authResult.username };
};
