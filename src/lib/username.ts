export const USERNAME_PATTERN = /^[A-Za-z0-9_ -]{3,20}$/;

export type UsernameStatus = {
  username: string | null;
  canChangeAt: string | null;
};

export type UpdateUsernameOutcome =
  | { status: "updated"; username: string; canChangeAt: string | null }
  | { status: "invalid" }
  | { status: "taken" }
  | { status: "rate_limited"; retryAt: string }
  | { status: "error" };

const withTimeout = <T>(
  run: (signal: AbortSignal) => Promise<T>,
  ms = 10000
): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return run(controller.signal).finally(() => clearTimeout(timeout));
};

export const fetchUsernameStatus = async (
  idToken: string
): Promise<UsernameStatus | null> => {
  try {
    return await withTimeout(async (signal) => {
      const res = await fetch("/api/username", {
        headers: { Authorization: `Bearer ${idToken}` },
        signal,
      });
      if (!res.ok) return null;
      const data = (await res.json()) as {
        success: boolean;
        username: string | null;
        canChangeAt: string | null;
      };
      if (!data.success) return null;
      return { username: data.username, canChangeAt: data.canChangeAt };
    });
  } catch {
    return null;
  }
};

export const updateUsername = async (
  idToken: string,
  username: string
): Promise<UpdateUsernameOutcome> => {
  try {
    return await withTimeout(async (signal) => {
      const res = await fetch("/api/username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ username }),
        signal,
      });
      if (!res.ok) return { status: "error" };
      const data = (await res.json()) as
        | { success: true; username: string; canChangeAt: string | null }
        | { success: false; error: string; retryAt?: string };

      if (data.success)
        return {
          status: "updated",
          username: data.username,
          canChangeAt: data.canChangeAt,
        };

      if (data.error === "invalid") return { status: "invalid" };
      if (data.error === "taken") return { status: "taken" };
      if (data.error === "rate_limited" && data.retryAt)
        return { status: "rate_limited", retryAt: data.retryAt };
      return { status: "error" };
    });
  } catch {
    return { status: "error" };
  }
};
