const JWKS_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";
const JWKS_CACHE_TTL_MS = 60 * 60 * 1000;
const CLOCK_SKEW_SECONDS = 60;

let cachedKeys = null;
let cachedAt = 0;

const base64UrlToUint8Array = (input) => {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const base64UrlDecodeJson = (input) =>
  JSON.parse(new TextDecoder().decode(base64UrlToUint8Array(input)));

const fetchSigningKeys = async () => {
  const res = await fetch(JWKS_URL);
  if (!res.ok) throw new Error("Failed to fetch Firebase signing keys.");
  const { keys } = await res.json();
  cachedKeys = keys;
  cachedAt = Date.now();
  return keys;
};

const getSigningKey = async (kid) => {
  if (!cachedKeys || Date.now() - cachedAt > JWKS_CACHE_TTL_MS) {
    await fetchSigningKeys();
  }
  let jwk = cachedKeys.find((k) => k.kid === kid);
  if (!jwk) {
    await fetchSigningKeys();
    jwk = cachedKeys.find((k) => k.kid === kid);
  }
  if (!jwk) throw new Error("No matching signing key found.");
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
};

export const getBearerToken = (request) => {
  const header = request.headers.get("Authorization") || "";
  const match = header.match(/^Bearer (.+)$/);
  return match ? match[1] : null;
};

export const verifyFirebaseIdToken = async (idToken, projectId) => {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("Malformed token.");
  const [headerB64, payloadB64, signatureB64] = parts;

  const header = base64UrlDecodeJson(headerB64);
  if (header.alg !== "RS256") throw new Error("Unexpected token algorithm.");

  const payload = base64UrlDecodeJson(payloadB64);
  const now = Math.floor(Date.now() / 1000);

  if (payload.iss !== `https://securetoken.google.com/${projectId}`)
    throw new Error("Invalid issuer.");
  if (payload.aud !== projectId) throw new Error("Invalid audience.");
  if (typeof payload.exp !== "number" || payload.exp <= now)
    throw new Error("Token expired.");
  if (typeof payload.iat !== "number" || payload.iat > now + CLOCK_SKEW_SECONDS)
    throw new Error("Token issued in the future.");
  if (
    typeof payload.auth_time !== "number" ||
    payload.auth_time > now + CLOCK_SKEW_SECONDS
  )
    throw new Error("Invalid auth_time.");
  if (typeof payload.sub !== "string" || payload.sub.length === 0)
    throw new Error("Missing subject.");

  const key = await getSigningKey(header.kid);
  const signedData = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const signature = base64UrlToUint8Array(signatureB64);

  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    signature,
    signedData
  );
  if (!valid) throw new Error("Invalid signature.");

  return { uid: payload.sub, payload };
};
