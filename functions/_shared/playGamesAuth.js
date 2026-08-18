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
