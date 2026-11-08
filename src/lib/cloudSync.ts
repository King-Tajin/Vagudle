import { loadFirebaseAuth } from "./firebase";
import { getStoredDiscordSession } from "./discordCloudAuth";
import { getStoredPlayGamesSession } from "./playGamesCloudAuth";
import strings from "../constants/strings";

const FETCH_TIMEOUT_MS = 10000;

export const getIdTokenForCurrentUser = async (): Promise<string | null> => {
  const { auth } = await loadFirebaseAuth();
  const user = auth.currentUser;
  if (user) {
    try {
      return await user.getIdToken();
    } catch {
      return null;
    }
  }
  const discordSession = getStoredDiscordSession();
  if (discordSession) return discordSession.token;

  const playGamesSession = getStoredPlayGamesSession();
  return playGamesSession ? playGamesSession.token : null;
};

export type LinkDiscordResult =
  { status: "linked" } | { status: "error"; message: string };

const requestDiscordLink = async (
  idToken: string,
  linkToken: string,
  confirmation: string,
  signal?: AbortSignal
): Promise<LinkDiscordResult> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener("abort", onExternalAbort);
  try {
    const res = await fetch("/api/link-discord", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ link_token: linkToken, confirmation }),
      signal: controller.signal,
    });
    if (!res.ok) {
      return {
        status: "error",
        message: strings.CLOUD_SYNC_LINK_ACCOUNT_ERROR_TEXT,
      };
    }
    const data = (await res.json()) as { success: boolean; error?: string };
    if (data.success) return { status: "linked" };
    return {
      status: "error",
      message: data.error ?? strings.CLOUD_SYNC_LINK_ACCOUNT_ERROR_TEXT,
    };
  } catch {
    return {
      status: "error",
      message: strings.CLOUD_SYNC_LINK_ACCOUNT_RETRY_ERROR_TEXT,
    };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onExternalAbort);
  }
};

export const linkDiscordWithCurrentUser = async (
  linkToken: string,
  confirmation: string,
  signal?: AbortSignal
): Promise<LinkDiscordResult> => {
  const idToken = await getIdTokenForCurrentUser();
  if (!idToken) {
    return {
      status: "error",
      message: strings.CLOUD_SYNC_VERIFY_SIGNIN_ERROR_TEXT,
    };
  }
  return requestDiscordLink(idToken, linkToken, confirmation, signal);
};

export type LinkPlayGamesResult =
  { status: "linked" } | { status: "error"; message: string };

const requestPlayGamesLink = async (
  idToken: string,
  linkToken: string,
  confirmation: string,
  signal?: AbortSignal
): Promise<LinkPlayGamesResult> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener("abort", onExternalAbort);
  try {
    const res = await fetch("/api/link-playgames", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ link_token: linkToken, confirmation }),
      signal: controller.signal,
    });
    if (!res.ok) {
      return {
        status: "error",
        message: strings.CLOUD_SYNC_LINK_ACCOUNT_ERROR_TEXT,
      };
    }
    const data = (await res.json()) as { success: boolean; error?: string };
    if (data.success) return { status: "linked" };
    return {
      status: "error",
      message: data.error ?? strings.CLOUD_SYNC_LINK_ACCOUNT_ERROR_TEXT,
    };
  } catch {
    return {
      status: "error",
      message: strings.CLOUD_SYNC_LINK_ACCOUNT_RETRY_ERROR_TEXT,
    };
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onExternalAbort);
  }
};

export const linkPlayGamesWithCurrentUser = async (
  linkToken: string,
  confirmation: string,
  signal?: AbortSignal
): Promise<LinkPlayGamesResult> => {
  const idToken = await getIdTokenForCurrentUser();
  if (!idToken) {
    return {
      status: "error",
      message: strings.CLOUD_SYNC_VERIFY_SIGNIN_ERROR_TEXT,
    };
  }
  return requestPlayGamesLink(idToken, linkToken, confirmation, signal);
};

export type LinkStatus = { discordLinked: boolean; playGamesLinked: boolean };

export const fetchLinkStatus = async (
  idToken: string
): Promise<LinkStatus | null> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch("/api/link-status", {
      headers: { Authorization: `Bearer ${idToken}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = (await res.json()) as {
      success: boolean;
      discordLinked?: boolean;
      playGamesLinked?: boolean;
    };
    if (!data.success) return null;
    return {
      discordLinked: !!data.discordLinked,
      playGamesLinked: !!data.playGamesLinked,
    };
  } catch {
    return null;
  }
};

export type LinkDiscordOAuthResult =
  { status: "linked" } | { status: "error"; message: string };

export const linkDiscordOAuthWithCurrentUser = async (
  code: string,
  redirectUri: string
): Promise<LinkDiscordOAuthResult> => {
  const idToken = await getIdTokenForCurrentUser();
  if (!idToken)
    return {
      status: "error",
      message: strings.CLOUD_SYNC_VERIFY_SIGNIN_ERROR_TEXT,
    };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch("/api/discord-link-oauth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return {
        status: "error",
        message: strings.CLOUD_SYNC_LINK_DISCORD_ERROR_TEXT,
      };
    }
    const data = (await res.json()) as { success: boolean; error?: string };
    if (data.success) return { status: "linked" };
    return {
      status: "error",
      message: data.error ?? strings.CLOUD_SYNC_LINK_DISCORD_ERROR_TEXT,
    };
  } catch {
    return {
      status: "error",
      message: strings.CLOUD_SYNC_LINK_DISCORD_RETRY_ERROR_TEXT,
    };
  }
};

export type LinkPlayGamesOAuthResult =
  { status: "linked" } | { status: "error"; message: string };

export const linkPlayGamesOAuthWithCurrentUser = async (
  serverAuthCode: string
): Promise<LinkPlayGamesOAuthResult> => {
  const idToken = await getIdTokenForCurrentUser();
  if (!idToken)
    return {
      status: "error",
      message: strings.CLOUD_SYNC_VERIFY_SIGNIN_ERROR_TEXT,
    };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch("/api/playgames-link-oauth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ serverAuthCode }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      return {
        status: "error",
        message: strings.CLOUD_SYNC_LINK_PLAYGAMES_ERROR_TEXT,
      };
    }
    const data = (await res.json()) as { success: boolean; error?: string };
    if (data.success) return { status: "linked" };
    return {
      status: "error",
      message: data.error ?? strings.CLOUD_SYNC_LINK_PLAYGAMES_ERROR_TEXT,
    };
  } catch {
    return {
      status: "error",
      message: strings.CLOUD_SYNC_LINK_PLAYGAMES_RETRY_ERROR_TEXT,
    };
  }
};

export const deleteCloudSave = async (
  idToken: string,
  deleteAuthAccount = false
): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch("/api/delete-account", {
      method: "POST",
      headers: deleteAuthAccount
        ? {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          }
        : { Authorization: `Bearer ${idToken}` },
      body: deleteAuthAccount
        ? JSON.stringify({ deleteAuthAccount: true })
        : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return false;
    const data = (await res.json()) as { success: boolean };
    return data.success;
  } catch {
    return false;
  }
};

const RELATIVE_TIME_UNITS: {
  limitSeconds: number;
  divisorSeconds: number;
  label: Intl.RelativeTimeFormatUnit;
}[] = [
  { limitSeconds: 60, divisorSeconds: 1, label: "second" },
  { limitSeconds: 3600, divisorSeconds: 60, label: "minute" },
  { limitSeconds: 86400, divisorSeconds: 3600, label: "hour" },
  { limitSeconds: 2592000, divisorSeconds: 86400, label: "day" },
  { limitSeconds: 31536000, divisorSeconds: 2592000, label: "month" },
  { limitSeconds: Infinity, divisorSeconds: 31536000, label: "year" },
];

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat(
  strings.LOCALE_TAG,
  {
    numeric: "always",
  }
);

export const formatRelativeTime = (iso: string): string => {
  const diffSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  );
  if (diffSeconds < 10) return strings.RELATIVE_TIME_JUST_NOW_TEXT;
  const unit =
    RELATIVE_TIME_UNITS.find((u) => diffSeconds < u.limitSeconds) ??
    RELATIVE_TIME_UNITS[RELATIVE_TIME_UNITS.length - 1];
  const value = Math.floor(diffSeconds / unit.divisorSeconds);
  return RELATIVE_TIME_FORMATTER.format(-value, unit.label);
};
