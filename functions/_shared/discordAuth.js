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

const USERNAME_PATTERN = /^[A-Za-z0-9_ -]{3,20}$/;

export const sanitizeDiscordUsername = (raw) => {
  if (typeof raw !== "string") return null;
  const cleaned = raw
    .replace(/[^A-Za-z0-9_ -]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 20);
  return USERNAME_PATTERN.test(cleaned) ? cleaned : null;
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

export const fetchChannelGroup = async (channelId, botToken) => {
  const res = await fetch(`${DISCORD_API}/channels/${channelId}`, {
    headers: { Authorization: `Bot ${botToken}` },
  });
  if (!res.ok) throw new Error("Failed to resolve channel.");
  const channel = await res.json();

  if (channel.guild_id)
    return { groupId: channel.guild_id, groupType: "server" };
  if (channel.type === 3) return { groupId: channelId, groupType: "group_dm" };
  return { groupId: channelId, groupType: "dm" };
};
