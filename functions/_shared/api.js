export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const importAesKey = async (secret) => {
  const keyBytes = await crypto.subtle.digest(
    "SHA-256",
    textEncoder.encode(secret)
  );
  return crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
};

export const encode = async (config, secret) => {
  const key = await importAesKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    textEncoder.encode(JSON.stringify(config))
  );
  const combined = new Uint8Array(12 + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), 12);
  return btoa(String.fromCharCode(...combined))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

export const decode = async (token, secret) => {
  const key = await importAesKey(secret);
  const pad = token.length % 4 === 0 ? "" : "=".repeat(4 - (token.length % 4));
  const binary = atob(token.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const combined = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) combined[i] = binary.charCodeAt(i);
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return JSON.parse(textDecoder.decode(plaintext));
};

export const VALID_DICTS = ["normal", "hard", "full"];
export const VALID_GUESSES = [9, 11];

export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const validateDuelParsed = ({
  word,
  dict,
  guesses,
  length,
  id,
  discord_id,
  created_at,
}) =>
  typeof word === "string" &&
  VALID_DICTS.includes(dict) &&
  VALID_GUESSES.includes(guesses) &&
  !(guesses === 11 && dict !== "normal") &&
  typeof length === "number" &&
  word.length >= 4 &&
  word.length <= 7 &&
  word.length === length &&
  /^[a-zA-Z]+$/.test(word) &&
  typeof discord_id === "string" &&
  discord_id.length > 0 &&
  typeof id === "string" &&
  id.length > 0 &&
  typeof created_at === "number";
