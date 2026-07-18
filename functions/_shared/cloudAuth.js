import { verifyFirebaseIdToken, getBearerToken } from "./firebaseAuth.js";
import { decode } from "./api.js";
import { isValidDiscordSession } from "./discordAuth.js";

export { getBearerToken };

export const verifyCloudSaveToken = async (request, env) => {
  const token = getBearerToken(request);
  if (!token) return null;

  if (env.FIREBASE_PROJECT_ID) {
    try {
      const { uid } = await verifyFirebaseIdToken(
        token,
        env.FIREBASE_PROJECT_ID
      );
      return { uid };
    } catch {}
  }

  if (env.DISCORD_SESSION_KEY) {
    try {
      const payload = await decode(token, env.DISCORD_SESSION_KEY);
      if (isValidDiscordSession(payload)) return { uid: payload.uid };
    } catch {}
  }

  return null;
};
