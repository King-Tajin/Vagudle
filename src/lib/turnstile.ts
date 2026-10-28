import { TURNSTILE_SITE_KEY } from "./turnstileConfig";

const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const TURNSTILE_CHALLENGE_TIMEOUT_MS = 60 * 1000;

let scriptPromise: Promise<TurnstileApi> | null = null;

const loadTurnstile = (): Promise<TurnstileApi> => {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (scriptPromise) return scriptPromise;

  const promise = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      if (window.turnstile) resolve(window.turnstile);
      else reject(new Error("Turnstile unavailable."));
    };
    script.onerror = () => reject(new Error("Turnstile failed to load."));
    document.head.appendChild(script);
  });

  scriptPromise = promise;
  promise.catch(() => {
    if (scriptPromise === promise) scriptPromise = null;
  });
  return promise;
};

export const getTurnstileToken = async (): Promise<string> => {
  if (!TURNSTILE_SITE_KEY) throw new Error("Turnstile site key missing.");
  const turnstile = await loadTurnstile();

  return new Promise<string>((resolve, reject) => {
    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;z-index:2147483647";
    const holder = document.createElement("div");
    holder.style.pointerEvents = "auto";
    overlay.appendChild(holder);
    document.body.appendChild(overlay);

    let widgetId: string | null = null;
    let settled = false;
    const timer: { id?: ReturnType<typeof setTimeout> } = {};

    const finish = (action: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer.id);
      if (widgetId !== null) {
        try {
          turnstile.remove(widgetId);
        } catch {}
      }
      overlay.remove();
      action();
    };

    const fail = (message: string) => () =>
      finish(() => reject(new Error(message)));

    timer.id = setTimeout(
      fail("Turnstile timed out."),
      TURNSTILE_CHALLENGE_TIMEOUT_MS
    );

    try {
      widgetId = turnstile.render(holder, {
        sitekey: TURNSTILE_SITE_KEY,
        appearance: "interaction-only",
        callback: (token) => finish(() => resolve(token)),
        "error-callback": fail("Turnstile failed."),
        "expired-callback": fail("Turnstile expired."),
        "timeout-callback": fail("Turnstile timed out."),
      });
    } catch {
      fail("Turnstile failed to render.")();
    }
  });
};
