// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json } from "../_shared/api.js";
import { getGoogleServiceAccountToken } from "../_shared/googleServiceAccount.js";

const PUBLIC_HOST = "vagudle.king-tajin.dev";
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const AUTH_PARAMS = ["apiKey", "oobCode", "mode", "lang", "continueUrl"];

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

const withoutAuthParams = (url) => {
  for (const param of AUTH_PARAMS) url.searchParams.delete(param);
  return url.toString();
};

const resolveContinueUrl = (value, requestUrl) => {
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && url.hostname === PUBLIC_HOST) {
      return withoutAuthParams(url);
    }
    const requestHost = new URL(requestUrl).hostname;
    if (LOCAL_HOSTS.has(requestHost) && LOCAL_HOSTS.has(url.hostname)) {
      return withoutAuthParams(url);
    }
    return null;
  } catch {
    return null;
  }
};

const isRateLimited = async (limiter, keys) => {
  if (!limiter) return false;
  const results = await Promise.all(keys.map((key) => limiter.limit({ key })));
  return results.some(({ success }) => !success);
};

const generateSignInLink = async (env, email, continueUrl) => {
  const accessToken = await getGoogleServiceAccountToken(
    env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
  );

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/accounts:sendOobCode`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        requestType: "EMAIL_SIGNIN",
        email,
        continueUrl,
        canHandleCodeInApp: true,
        returnOobLink: true,
      }),
    }
  );
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    console.error(
      "Sign-in link request failed.",
      res.status,
      detail?.error?.message
    );
    return null;
  }

  const data = await res.json();
  if (typeof data.oobLink !== "string") {
    console.error("Sign-in link missing from response.");
    return null;
  }
  return data.oobLink;
};

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    if (
      !env.MAILER ||
      !env.FIREBASE_PROJECT_ID ||
      !env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
      !env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    )
      return json({ success: false, error: "Server misconfiguration." }, 500);

    const body = await request.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email))
      return json({ success: false, error: "Invalid email." }, 400);

    const continueUrl = resolveContinueUrl(body?.url, request.url);
    if (!continueUrl)
      return json({ success: false, error: "Invalid return URL." }, 400);

    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    if (
      await isRateLimited(env.EMAIL_RATE_LIMITER, [
        `ip:${ip}`,
        `email:${email.toLowerCase()}`,
      ])
    )
      return json(
        { success: false, error: "Too many requests. Please slow down." },
        429
      );

    const link = await generateSignInLink(env, email, continueUrl);
    if (!link)
      return json({ success: false, error: "Could not create link." }, 502);

    const res = await env.MAILER.fetch("https://mailer.internal/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, link }),
    });
    if (!res.ok) {
      console.error(
        "Mailer rejected request.",
        res.status,
        await res.text().catch(() => "")
      );
      return json({ success: false, error: "Could not send email." }, 502);
    }

    return json({ success: true });
  } catch (error) {
    console.error("Send email link failed.", error?.message);
    return json({ success: false, error: "Could not send email." }, 500);
  }
}
