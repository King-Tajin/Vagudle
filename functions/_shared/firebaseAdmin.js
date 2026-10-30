// noinspection JSUnresolvedReference

import { getGoogleServiceAccountToken } from "./googleServiceAccount.js";

export const hasFirebaseAdminConfig = (env) =>
  Boolean(
    env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY &&
    env.FIREBASE_PROJECT_ID
  );

export const deleteFirebaseUser = async (env, uid) => {
  const accessToken = await getGoogleServiceAccountToken(
    env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  );

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(env.FIREBASE_PROJECT_ID)}/accounts:delete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ localId: uid }),
    }
  );

  if (res.ok) return true;
  if (res.status !== 400) return false;

  const data = await res.json().catch(() => null);
  return data?.error?.message === "USER_NOT_FOUND";
};
