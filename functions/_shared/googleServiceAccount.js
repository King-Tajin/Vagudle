const TOKEN_URL = "https://oauth2.googleapis.com/token";
const IDENTITY_TOOLKIT_SCOPE =
  "https://www.googleapis.com/auth/identitytoolkit";
const TOKEN_CACHE_SAFETY_MARGIN_SECONDS = 60;

let cachedToken = null;
let cachedTokenExpiresAt = 0;

const base64UrlEncode = (bytes) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

const base64UrlEncodeJson = (value) =>
  base64UrlEncode(new TextEncoder().encode(JSON.stringify(value)));

const pemToArrayBuffer = (pem) => {
  const base64 = pem
    .replace(/\\n/g, "\n")
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
};

const signJwt = async (clientEmail, privateKeyPem) => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: clientEmail,
    scope: IDENTITY_TOOLKIT_SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };

  const unsigned = `${base64UrlEncodeJson(header)}.${base64UrlEncodeJson(claims)}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned)
  );

  return `${unsigned}.${base64UrlEncode(new Uint8Array(signature))}`;
};

export const getGoogleServiceAccountToken = async (
  clientEmail,
  privateKeyPem
) => {
  const now = Math.floor(Date.now() / 1000);
  if (
    cachedToken &&
    now < cachedTokenExpiresAt - TOKEN_CACHE_SAFETY_MARGIN_SECONDS
  )
    return cachedToken;

  const assertion = await signJwt(clientEmail, privateKeyPem);
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) throw new Error("Failed to obtain Google access token.");

  const data = await res.json();
  cachedToken = data.access_token;
  cachedTokenExpiresAt = now + (data.expires_in ?? 3600);
  return cachedToken;
};
