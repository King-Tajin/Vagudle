// noinspection JSUnresolvedReference

import { decode, json } from "./api.js";
import { getBearerToken } from "./firebaseAuth.js";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const PLAY_GAMES_PLAYER_URL =
  "https://games.googleapis.com/games/v1/players/me";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const exchangePlayGamesAuthCode = async (
  serverAuthCode,
  clientId,
  clientSecret
) => {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code: serverAuthCode,
    redirect_uri: "",
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Play Games token exchange failed: ${err}`);
  }

  const data = await res.json();
  return { accessToken: data.access_token, refreshToken: data.refresh_token };
};

export const refreshPlayGamesToken = async (
  refreshToken,
  clientId,
  clientSecret
) => {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Play Games token refresh failed: ${err}`);
  }

  const data = await res.json();
  return { accessToken: data.access_token };
};

export const fetchPlayGamesPlayer = async (accessToken) => {
  const res = await fetch(PLAY_GAMES_PLAYER_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Play Games player.");
  return res.json();
};

export const buildPlayGamesSessionPayload = (player, refreshToken) => ({
  uid: `playgames:${player.playerId}`,
  username: player.displayName || "Player",
  avatar: player.avatarImageUrl || null,
  playGamesId: player.playerId,
  refreshToken: refreshToken || null,
  exp: Date.now() + SESSION_TTL_MS,
});

export const isValidPlayGamesSession = (payload) =>
  !!payload &&
  typeof payload.uid === "string" &&
  payload.uid.startsWith("playgames:") &&
  typeof payload.exp === "number" &&
  payload.exp > Date.now();

export const isRenewablePlayGamesSession = (payload) =>
  !!payload &&
  typeof payload.uid === "string" &&
  payload.uid.startsWith("playgames:") &&
  typeof payload.playGamesId === "string" &&
  typeof payload.refreshToken === "string" &&
  payload.refreshToken.length > 0;

export const requirePlayGamesSession = async (context) => {
  const sessionKey = context.env.PLAYGAMES_SESSION_KEY;
  if (!sessionKey)
    return json({ success: false, error: "Server misconfiguration." }, 500);

  const token = getBearerToken(context.request);
  if (!token)
    return json({ success: false, error: "Missing auth token." }, 401);

  try {
    const payload = await decode(token, sessionKey);
    if (
      !isValidPlayGamesSession(payload) ||
      typeof payload.playGamesId !== "string"
    )
      return json({ success: false, error: "Invalid auth token." }, 401);
    return payload;
  } catch {
    return json({ success: false, error: "Invalid auth token." }, 401);
  }
};
