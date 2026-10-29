// noinspection JSUnresolvedReference

import { getGoogleServiceAccountToken } from "./googleServiceAccount.js";

const PLAY_INTEGRITY_SCOPE = "https://www.googleapis.com/auth/playintegrity";
const MAX_INTEGRITY_TOKEN_LENGTH = 16384;
const DEFAULT_MAX_AGE_MS = 2 * 60 * 1000;
const MAX_FUTURE_SKEW_MS = 30 * 1000;
const ACCEPTED_DEVICE_VERDICTS = [
  "MEETS_DEVICE_INTEGRITY",
  "MEETS_STRONG_INTEGRITY",
];

export const hashRequestFields = async (fields) => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(fields))
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
};

export const isPlayIntegrityConfigured = (env) =>
  Boolean(
    env.ANDROID_PACKAGE_NAME &&
    env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  );

export const verifyPlayIntegrityToken = async (
  env,
  token,
  expectedRequestHash,
  maxAgeMs = DEFAULT_MAX_AGE_MS
) => {
  if (
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > MAX_INTEGRITY_TOKEN_LENGTH
  )
    return false;

  const packageName = env.ANDROID_PACKAGE_NAME;

  try {
    const accessToken = await getGoogleServiceAccountToken(
      env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
      PLAY_INTEGRITY_SCOPE
    );

    const res = await fetch(
      `https://playintegrity.googleapis.com/v1/${encodeURIComponent(packageName)}:decodeIntegrityToken`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ integrityToken: token }),
      }
    );
    if (!res.ok) {
      console.error("Play Integrity decode failed.", res.status);
      return false;
    }

    const payload = (await res.json())?.tokenPayloadExternal;
    const request = payload?.requestDetails;
    const app = payload?.appIntegrity;
    const device = payload?.deviceIntegrity;

    if (request?.requestPackageName !== packageName) return false;
    if (request.requestHash !== expectedRequestHash) return false;

    const issuedAt = Number(request.timestampMillis);
    const age = Date.now() - issuedAt;
    if (
      !Number.isFinite(issuedAt) ||
      age > maxAgeMs ||
      age < -MAX_FUTURE_SKEW_MS
    )
      return false;

    if (app?.appRecognitionVerdict !== "PLAY_RECOGNIZED") return false;
    if (app.packageName !== packageName) return false;

    const verdicts = device?.deviceRecognitionVerdict;
    return (
      Array.isArray(verdicts) &&
      ACCEPTED_DEVICE_VERDICTS.some((verdict) => verdicts.includes(verdict))
    );
  } catch (error) {
    console.error("Play Integrity verification failed.", error?.message);
    return false;
  }
};
