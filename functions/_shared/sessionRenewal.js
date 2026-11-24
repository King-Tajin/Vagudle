import { json, decode } from "./api.js";
import { getBearerToken } from "./firebaseAuth.js";
import { isAccountDeleted } from "./accountGuard.js";

export const readRenewableSession = async ({
  request,
  env,
  sessionKey,
  isRenewable,
  issuedAtOf,
}) => {
  const token = getBearerToken(request);
  if (!token)
    return {
      error: json(
        {
          success: false,
          error: "Missing session token.",
          code: "missing_token",
        },
        401
      ),
    };

  let payload;
  try {
    payload = await decode(token, sessionKey);
  } catch {
    return {
      error: json(
        {
          success: false,
          error: "Invalid session token.",
          code: "invalid_token",
        },
        401
      ),
    };
  }

  if (!isRenewable(payload))
    return {
      error: json(
        {
          success: false,
          error: "Session cannot be renewed.",
          code: "not_renewable",
        },
        401
      ),
    };

  if (
    env.DB &&
    (await isAccountDeleted(env.DB, payload.uid, issuedAtOf(payload)))
  )
    return {
      error: json(
        {
          success: false,
          error: "Session expired. Please sign in again.",
          code: "account_deleted",
        },
        401
      ),
    };

  return { payload };
};
