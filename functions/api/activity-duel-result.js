// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

import { CORS_HEADERS, json } from "../_shared/api.js";

const WEBHOOK_URL = "https://discord-webhook.king-tajin.dev/webhook/duel";

const notifyWebhook = async (duelId, webhookSecret) => {
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Duel-Secret": webhookSecret,
      },
      body: JSON.stringify({ duel_id: duelId }),
    });
    if (!res.ok) {
      console.error(`[activity-duel-result] Webhook failed: ${res.status}`);
    }
  } catch (error) {
    console.error("[activity-duel-result] Webhook error:", error);
  }
};

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const kv = context.env.FEEDBACK_KV;
    const db = context.env.DB;
    if (!kv || !db) {
      return json({ success: false, error: "Storage not configured." }, 500);
    }

    const body = await context.request.json();
    const { instance_id, access_token, won, guesses_used } = body;

    if (
      typeof instance_id !== "string" ||
      typeof access_token !== "string" ||
      typeof won !== "boolean" ||
      typeof guesses_used !== "number"
    ) {
      return json({ success: false, error: "Invalid request body." }, 400);
    }

    const meRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    if (!meRes.ok) {
      return json(
        { success: false, error: "Failed to verify Discord identity." },
        401
      );
    }
    const me = await meRes.json();
    const discordId = me.id;
    if (!discordId) {
      return json(
        { success: false, error: "Could not resolve Discord user ID." },
        401
      );
    }

    const stored = await kv.get(`activity_duel:${instance_id}`, {
      type: "json",
    });
    if (!stored) {
      return json({ success: false, error: "Duel not found or expired." }, 404);
    }

    if (stored.discord_id !== discordId) {
      return json(
        { success: false, error: "This duel is not for your account." },
        403
      );
    }

    const result = await db
      .prepare(
        `UPDATE duel_results
         SET won = ?, guesses_used = ?, completed_at = ?
         WHERE duel_id = ? AND discord_id = ? AND completed_at IS NULL`
      )
      .bind(
        won ? 1 : 0,
        guesses_used,
        new Date().toISOString(),
        stored.duel_id,
        discordId
      )
      .run();

    if (result.meta.changes === 0) {
      return json(
        {
          success: false,
          error: "No matching duel row found or already completed.",
        },
        404
      );
    }

    const webhookSecret = context.env.DUEL_WEBHOOK_SECRET;
    if (webhookSecret) {
      await notifyWebhook(stored.duel_id, webhookSecret);
    } else {
      console.error(
        "[activity-duel-result] DUEL_WEBHOOK_SECRET not set — skipping webhook"
      );
    }

    return json({ success: true });
  } catch (error) {
    console.error("[activity-duel-result] Error:", error);
    return json({ success: false, error: "Failed to save result." }, 500);
  }
}
