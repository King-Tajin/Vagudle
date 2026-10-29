const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_TURNSTILE_TOKEN_LENGTH = 2048;

const hostnameAllowed = (hostname, allowed) =>
  typeof hostname === "string" &&
  allowed.some((entry) =>
    entry.startsWith(".") ? hostname.endsWith(entry) : hostname === entry
  );

export const verifyTurnstileToken = async (secret, token, ip, options = {}) => {
  if (
    typeof token !== "string" ||
    token.length === 0 ||
    token.length > MAX_TURNSTILE_TOKEN_LENGTH
  )
    return false;

  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip && ip !== "unknown") form.append("remoteip", ip);

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: form,
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.success !== true) return false;

    if (options.expectedAction && data.action !== options.expectedAction)
      return false;

    if (
      options.allowedHostnames &&
      !hostnameAllowed(data.hostname, options.allowedHostnames)
    )
      return false;

    if (options.maxAgeMs) {
      const issuedAt = Date.parse(data.challenge_ts);
      if (
        !Number.isFinite(issuedAt) ||
        Date.now() - issuedAt > options.maxAgeMs
      )
        return false;
    }

    return true;
  } catch {
    return false;
  }
};
