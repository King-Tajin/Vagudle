const DISCORD_API = "https://discord.com/api/v10";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export const exchangeDiscordCode = async (
  code,
  clientId,
  clientSecret,
  redirectUri
) => {
  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Discord token exchange failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
};

export const fetchDiscordUser = async (accessToken) => {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error("Failed to fetch Discord user.");
  return res.json();
};

export const buildDiscordSessionPayload = (discordUser) => ({
  uid: `discord:${discordUser.id}`,
  username: discordUser.global_name || discordUser.username,
  avatar: discordUser.avatar,
  discordId: discordUser.id,
  exp: Date.now() + SESSION_TTL_MS,
});

export const isValidDiscordSession = (payload) =>
  !!payload &&
  typeof payload.uid === "string" &&
  payload.uid.startsWith("discord:") &&
  typeof payload.exp === "number" &&
  payload.exp > Date.now();
