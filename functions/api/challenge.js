// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });

const xor = (input, key) => {
  const keyBytes = key.split("").map((c) => c.charCodeAt(0));
  return input
    .split("")
    .map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ keyBytes[i % keyBytes.length])
    )
    .join("");
};

const encode = (config, key) => {
  const binary = xor(JSON.stringify(config), key);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

const decode = (token, key) => {
  const pad = token.length % 4 === 0 ? "" : "=".repeat(4 - (token.length % 4));
  const binary = atob(token.replace(/-/g, "+").replace(/_/g, "/") + pad);
  return JSON.parse(xor(binary, key));
};

const generateId = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-6);

const VALID_DICTS = ["normal", "hard", "full"];
const VALID_GUESSES = [9, 11];

const validateConfig = ({ word, dict, guesses, length }) =>
  typeof word === "string" &&
  VALID_DICTS.includes(dict) &&
  VALID_GUESSES.includes(guesses) &&
  typeof length === "number" &&
  word.length >= 4 &&
  word.length <= 7 &&
  word.length === length &&
  /^[a-zA-Z]+$/.test(word);

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const key = context.env.CHALLENGE_KEY;
    if (!key)
      return json({ success: false, error: "Server misconfiguration." }, 500);

    const body = await context.request.json();
    if (!validateConfig(body))
      return json({ success: false, error: "Invalid challenge config." }, 400);

    const id = generateId();
    const config = {
      word: body.word.toUpperCase(),
      dict: body.dict,
      guesses: body.guesses,
      length: body.length,
      id,
    };
    const encoded = encode(config, key);

    return json({ success: true, encoded, id });
  } catch (error) {
    console.error("Challenge encode error:", error);
    return json({ success: false, error: "Failed to encode challenge." }, 500);
  }
}

export async function onRequestGet(context) {
  try {
    const key = context.env.CHALLENGE_KEY;
    if (!key)
      return json({ success: false, error: "Server misconfiguration." }, 500);

    const token = new URL(context.request.url).searchParams.get("token");
    if (!token) return json({ success: false, error: "Missing token." }, 400);

    let parsed;
    try {
      parsed = decode(token, key);
    } catch {
      return json({ success: false, error: "Invalid token." }, 400);
    }

    const { word, dict, guesses, length, id } = parsed;
    if (
      !validateConfig({ word, dict, guesses, length }) ||
      typeof id !== "string"
    )
      return json({ success: false, error: "Malformed challenge data." }, 400);

    return json({ success: true, config: { word, dict, guesses, length, id } });
  } catch (error) {
    console.error("Challenge decode error:", error);
    return json({ success: false, error: "Failed to decode challenge." }, 500);
  }
}
