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

export const xor = (input, key) => {
  const keyBytes = key.split("").map((c) => c.charCodeAt(0));
  return input
    .split("")
    .map((c, i) =>
      String.fromCharCode(c.charCodeAt(0) ^ keyBytes[i % keyBytes.length])
    )
    .join("");
};

export const encode = (config, key) => {
  const binary = xor(JSON.stringify(config), key);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
};

export const decode = (token, key) => {
  const pad = token.length % 4 === 0 ? "" : "=".repeat(4 - (token.length % 4));
  const binary = atob(token.replace(/-/g, "+").replace(/_/g, "/") + pad);
  return JSON.parse(xor(binary, key));
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
  discordId,
  createdAt,
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
  typeof discordId === "string" &&
  discordId.length > 0 &&
  typeof id === "string" &&
  id.length > 0 &&
  typeof createdAt === "number";
