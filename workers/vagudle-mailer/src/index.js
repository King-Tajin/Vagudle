// noinspection JSUnusedGlobalSymbols

import signInHtml from "./sign-in.html";
import signInText from "./sign-in.txt";
import logoPng from "./vagudle-logo.png";
import titlePng from "./vagudle-title.png";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const RESEND_ENDPOINT = "https://api.resend.com/emails";

const toBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

const LOGO_CID = "vagudle-logo";
const TITLE_CID = "vagudle-title";

const INLINE_IMAGES = [
  {
    filename: "vagudle-logo.png",
    content: toBase64(logoPng),
    content_type: "image/png",
    content_id: LOGO_CID,
  },
  {
    filename: "vagudle-title.png",
    content: toBase64(titlePng),
    content_type: "image/png",
    content_id: TITLE_CID,
  },
];

const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const isTrustedSignInLink = (value, env) => {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.hostname === env.AUTH_LINK_HOST &&
      url.pathname === "/__/auth/action" &&
      url.searchParams.get("mode") === "signIn"
    );
  } catch {
    return false;
  }
};

const toSiteLink = (link, env) => {
  try {
    const source = new URL(link);
    const apiKey = source.searchParams.get("apiKey");
    const oobCode = source.searchParams.get("oobCode");
    const continueUrl = source.searchParams.get("continueUrl");
    if (!apiKey || !oobCode || !continueUrl) return link;

    const target = new URL(continueUrl);
    if (target.origin !== env.SITE_ORIGIN) return link;

    target.searchParams.set("apiKey", apiKey);
    target.searchParams.set("mode", "signIn");
    target.searchParams.set("oobCode", oobCode);
    target.searchParams.set("lang", source.searchParams.get("lang") ?? "en");
    return target.toString();
  } catch {
    return link;
  }
};

const fillTemplate = (template, values) =>
  template.replace(/\{\{(\w+)}}/g, (match, key) => values[key] ?? match);

const renderSignInEmail = (link) => ({
  subject: "Sign in to Vagudle",
  html: fillTemplate(signInHtml, {
    href: escapeHtml(link),
    logo: `cid:${LOGO_CID}`,
    title: `cid:${TITLE_CID}`,
  }),
  text: fillTemplate(signInText, { link }),
  attachments: INLINE_IMAGES,
});

const sendWithResend = async (email, message, env) => {
  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${env.FROM_NAME} <${env.FROM_ADDRESS}>`,
      to: [email],
      ...message,
    }),
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    console.error(
      "Email send failed.",
      res.status,
      detail?.name,
      detail?.message
    );
    return false;
  }
  return true;
};

export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Not found.", { status: 404 });
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return new Response("Bad request.", { status: 400 });
    }

    const email =
      typeof payload?.email === "string" ? payload.email.trim() : "";
    const link = typeof payload?.link === "string" ? payload.link : "";

    if (
      !email ||
      email.length > MAX_EMAIL_LENGTH ||
      !EMAIL_PATTERN.test(email) ||
      !isTrustedSignInLink(link, env)
    ) {
      return new Response("Bad request.", { status: 400 });
    }

    if (!env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set.");
      return new Response("Send failed.", { status: 502 });
    }

    try {
      const sent = await sendWithResend(
        email,
        renderSignInEmail(toSiteLink(link, env)),
        env
      );
      if (!sent) return new Response("Send failed.", { status: 502 });
    } catch (error) {
      console.error("Email send failed.", error?.message);
      return new Response("Send failed.", { status: 502 });
    }

    return new Response(null, { status: 204 });
  },
};
