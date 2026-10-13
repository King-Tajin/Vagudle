const LAST_USED_ACCOUNT_KEY = "vagudle-last-used-account:v1";

export type LastUsedAccount = {
  providerId: string;
};

export const saveLastUsedAccount = (providerId: string): void => {
  if (providerId === "unknown") return;
  try {
    localStorage.setItem(LAST_USED_ACCOUNT_KEY, JSON.stringify({ providerId }));
  } catch {}
};

export const getLastUsedAccount = (): LastUsedAccount | null => {
  try {
    const raw = localStorage.getItem(LAST_USED_ACCOUNT_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const { providerId } = parsed as { providerId?: unknown };
    return typeof providerId === "string" ? { providerId } : null;
  } catch {
    return null;
  }
};

export const clearLastUsedAccount = (): void => {
  try {
    localStorage.removeItem(LAST_USED_ACCOUNT_KEY);
  } catch {}
};
