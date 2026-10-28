const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_TURNSTILE_TOKEN_LENGTH = 2048;

export const verifyTurnstileToken = async (secret, token, ip) => {
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
    return data.success === true;
  } catch {
    return false;
  }
};
