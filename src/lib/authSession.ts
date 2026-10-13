const RENEW_LOCK_NAME = "vagudle-session-renew";

const detectAuthRedirect = (): boolean => {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get("mode") === "signIn") return true;
    return url.searchParams.has("code") && url.searchParams.has("state");
  } catch {
    return false;
  }
};

export const startedFromAuthRedirect = detectAuthRedirect();

export const runExclusive = <T>(task: () => Promise<T>): Promise<T> => {
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
  return locks ? locks.request(RENEW_LOCK_NAME, task) : task();
};

type TimedSession = { token: string; expiresAt: number };

export const isSameSession = (
  a: TimedSession | null,
  b: TimedSession | null
): boolean =>
  a === b ||
  (a !== null &&
    b !== null &&
    a.token === b.token &&
    a.expiresAt === b.expiresAt);
