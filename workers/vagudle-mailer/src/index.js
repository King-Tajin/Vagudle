// noinspection JSUnusedGlobalSymbols

import signInHtml from "./sign-in.html";
import signInText from "./sign-in.txt";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

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

const fillTemplate = (template, values) =>
  template.replace(/\{\{(\w+)}}/g, (match, key) => values[key] ?? match);

const renderSignInEmail = (link, env) => ({
  subject: "Sign in to Vagudle",
  html: fillTemplate(signInHtml, {
    href: escapeHtml(link),
    logo: `${env.SITE_ORIGIN}/logo192.png`,
  }),
  text: fillTemplate(signInText, { link }),
});

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

    try {
      await env.EMAIL.send({
        to: email,
        from: { email: env.FROM_ADDRESS, name: env.FROM_NAME },
        ...renderSignInEmail(link, env),
      });
    } catch (error) {
      console.error("Email send failed.", error?.code, error?.message);
      return new Response("Send failed.", { status: 502 });
    }

    return new Response(null, { status: 204 });
  },
};
