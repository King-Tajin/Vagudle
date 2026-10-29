import {
  hashRequestFields,
  isPlayIntegrityConfigured,
  verifyPlayIntegrityToken,
} from "./playIntegrity.js";
import { verifyTurnstileToken } from "./turnstile.js";

const PUBLIC_HOST = "vagudle.king-tajin.dev";
const INTEGRITY_MAX_AGE_MS = 2 * 60 * 1000;

export const verifyRequestToken = async ({
  env,
  body,
  ip,
  action,
  fields,
  turnstileMaxAgeMs,
}) => {
  if (typeof body?.integrityToken === "string") {
    if (!isPlayIntegrityConfigured(env)) return "misconfigured";
    const verified = await verifyPlayIntegrityToken(
      env,
      body.integrityToken,
      await hashRequestFields([action, ...fields]),
      INTEGRITY_MAX_AGE_MS
    );
    return verified ? "ok" : "failed";
  }

  if (!env.TURNSTILE_SECRET_KEY) return "misconfigured";
  const verified = await verifyTurnstileToken(
    env.TURNSTILE_SECRET_KEY,
    body?.turnstileToken,
    ip,
    {
      expectedAction: action,
      allowedHostnames: [PUBLIC_HOST],
      maxAgeMs: turnstileMaxAgeMs,
    }
  );
  return verified ? "ok" : "failed";
};
