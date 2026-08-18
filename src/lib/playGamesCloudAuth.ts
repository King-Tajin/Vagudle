export const PLAYGAMES_SESSION_STORAGE_KEY = "vagudle-playgames-session:v1";

export type PlayGamesSession = {
  token: string;
  uid: string;
  displayName: string;
  avatarUrl: string | null;
  expiresAt: number;
};

type CapacitorPlayGamesPlugin = {
  signIn: () => Promise<{ serverAuthCode: string }>;
};

declare global {
  interface Window {
    Capacitor?: {
      isNativePlatform?: () => boolean;
      getPlatform?: () => string;
      Plugins?: {
        PlayGamesAuth?: CapacitorPlayGamesPlugin;
      };
    };
  }
}

const RENEW_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

const dispatchPlayGamesSessionSync = (): void => {
  try {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: PLAYGAMES_SESSION_STORAGE_KEY,
        newValue: localStorage.getItem(PLAYGAMES_SESSION_STORAGE_KEY),
        storageArea: localStorage,
      })
    );
  } catch {}
};

export const getStoredPlayGamesSessionRaw = (): PlayGamesSession | null => {
  try {
    const raw = localStorage.getItem(PLAYGAMES_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as PlayGamesSession;
    if (!session.token) return null;
    return session;
  } catch {
    return null;
  }
};

export const getStoredPlayGamesSession = (): PlayGamesSession | null => {
  const session = getStoredPlayGamesSessionRaw();
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    localStorage.removeItem(PLAYGAMES_SESSION_STORAGE_KEY);
    return null;
  }
  return session;
};

const storePlayGamesSession = (session: PlayGamesSession): void => {
  try {
    localStorage.setItem(
      PLAYGAMES_SESSION_STORAGE_KEY,
      JSON.stringify(session)
    );
  } catch {}
  dispatchPlayGamesSessionSync();
};

export const clearPlayGamesSession = (): void => {
  try {
    localStorage.removeItem(PLAYGAMES_SESSION_STORAGE_KEY);
  } catch {}
  dispatchPlayGamesSessionSync();
};

export const isPlayGamesAvailable = (): boolean => {
  const capacitor = window.Capacitor;
  if (!capacitor?.isNativePlatform?.()) return false;
  if (capacitor.getPlatform?.() !== "android") return false;
  return !!capacitor.Plugins?.PlayGamesAuth;
};

const sessionFromResponse = (data: {
  success: boolean;
  token?: string;
  user?: {
    uid: string;
    displayName: string;
    avatarUrl: string | null;
    expiresAt: number;
  };
}): PlayGamesSession | null => {
  if (!data.success || !data.token || !data.user) return null;
  return {
    token: data.token,
    uid: data.user.uid,
    displayName: data.user.displayName,
    avatarUrl: data.user.avatarUrl,
    expiresAt: data.user.expiresAt,
  };
};

export const signInWithPlayGames =
  async (): Promise<PlayGamesSession | null> => {
    const plugin = window.Capacitor?.Plugins?.PlayGamesAuth;
    if (!plugin) return null;

    const { serverAuthCode } = await plugin.signIn();
    if (!serverAuthCode) return null;

    const res = await fetch("/api/playgames-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serverAuthCode }),
    });
    if (!res.ok) return null;

    const data = (await res.json()) as Parameters<
      typeof sessionFromResponse
    >[0];
    const session = sessionFromResponse(data);
    if (!session) return null;

    storePlayGamesSession(session);
    return session;
  };

export const renewPlayGamesSession = async (
  session: PlayGamesSession
): Promise<PlayGamesSession | null> => {
  try {
    const res = await fetch("/api/playgames-refresh", {
      method: "POST",
      headers: { Authorization: `Bearer ${session.token}` },
    });
    if (!res.ok) {
      clearPlayGamesSession();
      return null;
    }

    const data = (await res.json()) as Parameters<
      typeof sessionFromResponse
    >[0];
    const renewed = sessionFromResponse(data);
    if (!renewed) {
      clearPlayGamesSession();
      return null;
    }

    storePlayGamesSession(renewed);
    return renewed;
  } catch {
    return null;
  }
};

export const maybeRenewPlayGamesSession =
  async (): Promise<PlayGamesSession | null> => {
    const session = getStoredPlayGamesSessionRaw();
    if (!session) return null;
    if (session.expiresAt - Date.now() > RENEW_THRESHOLD_MS) return session;
    return renewPlayGamesSession(session);
  };
