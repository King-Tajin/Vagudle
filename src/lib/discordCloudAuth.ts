export const DISCORD_SESSION_STORAGE_KEY = "vagudle-discord-session:v1";
const STATE_STORAGE_KEY = "vagudle-discord-oauth-state:v1";

export type DiscordSession = {
  token: string;
  uid: string;
  displayName: string;
  avatarUrl: string | null;
  expiresAt: number;
};

const getRedirectUri = (): string =>
  `${window.location.origin}${window.location.pathname}`;

const randomState = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
};

const dispatchDiscordSessionSync = (): void => {
  try {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: DISCORD_SESSION_STORAGE_KEY,
        newValue: localStorage.getItem(DISCORD_SESSION_STORAGE_KEY),
        storageArea: localStorage,
      })
    );
  } catch {}
};

export const getStoredDiscordSession = (): DiscordSession | null => {
  try {
    const raw = localStorage.getItem(DISCORD_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as DiscordSession;
    if (!session.token || session.expiresAt <= Date.now()) {
      localStorage.removeItem(DISCORD_SESSION_STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
};

const storeDiscordSession = (session: DiscordSession): void => {
  try {
    localStorage.setItem(DISCORD_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {}
  dispatchDiscordSessionSync();
};

export const clearDiscordSession = (): void => {
  try {
    localStorage.removeItem(DISCORD_SESSION_STORAGE_KEY);
  } catch {}
  dispatchDiscordSessionSync();
};

export const signInWithDiscord = (): void => {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID as string;
  if (!clientId) {
    console.error("[DiscordAuth] VITE_DISCORD_CLIENT_ID is not set");
    return;
  }

  const state = randomState();
  try {
    sessionStorage.setItem(STATE_STORAGE_KEY, state);
  } catch {}

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getRedirectUri(),
    response_type: "code",
    scope: "identify",
    state,
  });
  window.location.href = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
};

export const completeDiscordSignIn =
  async (): Promise<DiscordSession | null> => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) return null;

    let expectedState: string | null = null;
    try {
      expectedState = sessionStorage.getItem(STATE_STORAGE_KEY);
    } catch {}

    url.searchParams.delete("code");
    url.searchParams.delete("state");
    window.history.replaceState({}, document.title, url.toString());

    if (!expectedState || expectedState !== state) return null;
    try {
      sessionStorage.removeItem(STATE_STORAGE_KEY);
    } catch {}

    try {
      const res = await fetch("/api/discord-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, redirect_uri: getRedirectUri() }),
      });
      if (!res.ok) return null;

      const data = (await res.json()) as {
        success: boolean;
        token?: string;
        user?: {
          uid: string;
          displayName: string;
          avatarUrl: string | null;
          expiresAt: number;
        };
      };
      if (!data.success || !data.token || !data.user) return null;

      const session: DiscordSession = {
        token: data.token,
        uid: data.user.uid,
        displayName: data.user.displayName,
        avatarUrl: data.user.avatarUrl,
        expiresAt: data.user.expiresAt,
      };
      storeDiscordSession(session);
      return session;
    } catch {
      return null;
    }
  };
