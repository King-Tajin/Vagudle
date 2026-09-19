import { DISCORD_CLIENT_ID } from "../constants/settings";
import { getPublicOrigin } from "./publicOrigin";
import type { AuthIntent } from "./authIntent";
import strings from "../constants/strings";

export const DISCORD_SESSION_STORAGE_KEY = "vagudle-discord-session:v1";
const STATE_STORAGE_KEY = "vagudle-discord-oauth-state:v1";
const MODE_STORAGE_KEY = "vagudle-discord-oauth-mode:v1";
const OUTCOME_STORAGE_KEY = "vagudle-discord-oauth-outcome:v1";

export type DiscordSession = {
  token: string;
  uid: string;
  displayName: string;
  avatarUrl: string | null;
  expiresAt: number;
};

export type DiscordSignInOutcome =
  | { status: "signed_in"; session: DiscordSession }
  | { status: "not_registered" }
  | { status: "already_registered" }
  | { status: "none" };

const getRedirectUri = (): string =>
  `${getPublicOrigin()}${window.location.pathname}`;

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

const RENEW_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

export const getStoredDiscordSessionRaw = (): DiscordSession | null => {
  try {
    const raw = localStorage.getItem(DISCORD_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as DiscordSession;
    if (!session.token) return null;
    return session;
  } catch {
    return null;
  }
};

export const getStoredDiscordSession = (): DiscordSession | null => {
  const session = getStoredDiscordSessionRaw();
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    localStorage.removeItem(DISCORD_SESSION_STORAGE_KEY);
    return null;
  }
  return session;
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

const beginDiscordOAuth = (mode: AuthIntent | "link"): void => {
  const clientId = DISCORD_CLIENT_ID;
  if (!clientId) {
    console.error("[DiscordAuth] DISCORD_CLIENT_ID is not set");
    return;
  }

  const state = randomState();
  try {
    sessionStorage.setItem(STATE_STORAGE_KEY, state);
    sessionStorage.setItem(MODE_STORAGE_KEY, mode);
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

export const signInWithDiscord = (intent: AuthIntent): void =>
  beginDiscordOAuth(intent);

export const initiateDiscordLink = (): void => beginDiscordOAuth("link");

export const storeDiscordAuthOutcome = (
  outcome: "not_registered" | "already_registered"
): void => {
  try {
    sessionStorage.setItem(OUTCOME_STORAGE_KEY, outcome);
  } catch {}
};

export const consumeDiscordAuthOutcome = ():
  "not_registered" | "already_registered" | null => {
  try {
    const outcome = sessionStorage.getItem(OUTCOME_STORAGE_KEY);
    sessionStorage.removeItem(OUTCOME_STORAGE_KEY);
    if (outcome === "not_registered" || outcome === "already_registered")
      return outcome;
    return null;
  } catch {
    return null;
  }
};

export const fetchDiscordLinkUrl = async (
  session: DiscordSession
): Promise<{ url: string } | { error: string }> => {
  try {
    const res = await fetch("/api/discord-link-token", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.token}` },
    });
    const data = (await res.json()) as {
      success: boolean;
      url?: string;
      error?: string;
    };
    if (!res.ok || !data.success || !data.url) {
      return { error: data.error ?? strings.LINK_START_ERROR_SHORT_TEXT };
    }
    return { url: data.url };
  } catch {
    return { error: strings.CLOUD_SAVE_LINK_START_ERROR_TEXT };
  }
};

export const openDiscordLinkFlow = async (
  session: DiscordSession
): Promise<{ opened: true } | { error: string }> => {
  const result = await fetchDiscordLinkUrl(session);
  if ("error" in result) return result;

  window.location.href = result.url;
  return { opened: true };
};

export const renewDiscordSession = async (
  session: DiscordSession
): Promise<DiscordSession | null> => {
  try {
    const res = await fetch("/api/discord-refresh", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.token}` },
    });
    if (!res.ok) {
      clearDiscordSession();
      return null;
    }

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
    if (!data.success || !data.token || !data.user) {
      clearDiscordSession();
      return null;
    }

    const renewed: DiscordSession = {
      token: data.token,
      uid: data.user.uid,
      displayName: data.user.displayName,
      avatarUrl: data.user.avatarUrl,
      expiresAt: data.user.expiresAt,
    };
    storeDiscordSession(renewed);
    return renewed;
  } catch {
    return null;
  }
};

export const maybeRenewDiscordSession =
  async (): Promise<DiscordSession | null> => {
    const session = getStoredDiscordSessionRaw();
    if (!session) return null;
    if (session.expiresAt - Date.now() > RENEW_THRESHOLD_MS) return session;
    return renewDiscordSession(session);
  };

export const getPendingDiscordLinkCode = (): {
  code: string;
  redirectUri: string;
} | null => {
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return null;

  let mode: string | null = null;
  try {
    mode = sessionStorage.getItem(MODE_STORAGE_KEY);
  } catch {}
  if (mode !== "link") return null;

  let expectedState: string | null = null;
  try {
    expectedState = sessionStorage.getItem(STATE_STORAGE_KEY);
  } catch {}

  url.searchParams.delete("code");
  url.searchParams.delete("state");
  window.history.replaceState({}, document.title, url.toString());

  try {
    sessionStorage.removeItem(STATE_STORAGE_KEY);
    sessionStorage.removeItem(MODE_STORAGE_KEY);
  } catch {}

  if (!expectedState || expectedState !== state) return null;
  return { code, redirectUri: getRedirectUri() };
};

export const completeDiscordSignIn =
  async (): Promise<DiscordSignInOutcome> => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) return { status: "none" };

    let mode: string | null = null;
    try {
      mode = sessionStorage.getItem(MODE_STORAGE_KEY);
    } catch {}
    if (mode === "link") return { status: "none" };
    const intent: AuthIntent = mode === "create" ? "create" : "signin";

    let expectedState: string | null = null;
    try {
      expectedState = sessionStorage.getItem(STATE_STORAGE_KEY);
    } catch {}

    url.searchParams.delete("code");
    url.searchParams.delete("state");
    window.history.replaceState({}, document.title, url.toString());

    if (!expectedState || expectedState !== state) return { status: "none" };
    try {
      sessionStorage.removeItem(STATE_STORAGE_KEY);
      sessionStorage.removeItem(MODE_STORAGE_KEY);
    } catch {}

    try {
      const res = await fetch("/api/discord-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, redirect_uri: getRedirectUri() }),
      });
      if (!res.ok) return { status: "none" };

      const data = (await res.json()) as {
        success: boolean;
        token?: string;
        isNewAccount?: boolean;
        user?: {
          uid: string;
          displayName: string;
          avatarUrl: string | null;
          expiresAt: number;
        };
      };
      if (!data.success || !data.token || !data.user) return { status: "none" };

      if (intent === "signin" && data.isNewAccount) {
        storeDiscordAuthOutcome("not_registered");
        return { status: "not_registered" };
      }
      if (intent === "create" && !data.isNewAccount) {
        storeDiscordAuthOutcome("already_registered");
        return { status: "already_registered" };
      }

      const session: DiscordSession = {
        token: data.token,
        uid: data.user.uid,
        displayName: data.user.displayName,
        avatarUrl: data.user.avatarUrl,
        expiresAt: data.user.expiresAt,
      };
      storeDiscordSession(session);
      return { status: "signed_in", session };
    } catch {
      return { status: "none" };
    }
  };
