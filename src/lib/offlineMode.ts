import {
  OFFLINE_MODE_PING_ATTEMPTS,
  OFFLINE_MODE_PING_TIMEOUT_MS,
  OFFLINE_MODE_PING_RETRY_DELAY_MS,
} from "../constants/settings";

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const pingBackendOnce = async (signal?: AbortSignal): Promise<boolean> => {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    OFFLINE_MODE_PING_TIMEOUT_MS
  );
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener("abort", onExternalAbort);
  try {
    const res = await fetch("/api/health", {
      signal: controller.signal,
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", onExternalAbort);
  }
};

export const checkBackendReachable = async (
  signal?: AbortSignal
): Promise<boolean> => {
  for (let attempt = 1; attempt <= OFFLINE_MODE_PING_ATTEMPTS; attempt++) {
    if (signal?.aborted) return false;
    const reachable = await pingBackendOnce(signal);
    if (reachable) return true;
    if (attempt < OFFLINE_MODE_PING_ATTEMPTS) {
      await sleep(OFFLINE_MODE_PING_RETRY_DELAY_MS);
    }
  }
  return false;
};
