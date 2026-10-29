// noinspection JSUnresolvedReference

import { CORS_HEADERS, json } from "../_shared/api.js";
import { getGoogleServiceAccountToken } from "../_shared/googleServiceAccount.js";
import { verifyRequestToken } from "../_shared/requestVerification.js";

const VERIFICATION_ACTION = "check-email";

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const clientEmail = context.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = context.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    if (!clientEmail || !privateKey)
      return json({ success: false, error: "Server misconfiguration." }, 500);

    const body = await context.request.json();
    const email = body?.email;
    if (typeof email !== "string" || !email.includes("@"))
      return json({ success: false, error: "Invalid email." }, 400);

    const ip = context.request.headers.get("CF-Connecting-IP") || "unknown";
    const verification = await verifyRequestToken({
      env: context.env,
      body,
      ip,
      action: VERIFICATION_ACTION,
      fields: [email],
    });
    if (verification === "misconfigured")
      return json({ success: false, error: "Server misconfiguration." }, 500);
    if (verification !== "ok")
      return json({ success: false, error: "Verification failed." }, 403);

    const accessToken = await getGoogleServiceAccountToken(
      clientEmail,
      privateKey
    );

    const res = await fetch(
      "https://identitytoolkit.googleapis.com/v1/accounts:lookup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email: [email] }),
      }
    );

    if (!res.ok) return json({ success: false, error: "Lookup failed." }, 502);

    const data = await res.json();
    const exists = Array.isArray(data.users) && data.users.length > 0;

    return json({ success: true, exists });
  } catch {
    return json({ success: false, error: "Lookup failed." }, 500);
  }
}
