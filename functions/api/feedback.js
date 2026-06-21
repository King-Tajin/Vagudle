// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const EMAIL_MAX = 254;
const MESSAGE_MAX = 15000;

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });

export async function onRequestOptions() {
  return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
  try {
    const feedbackData = await context.request.json();

    if (
      !feedbackData.sentiment ||
      !feedbackData.category ||
      !feedbackData.message
    ) {
      return json({ success: false, error: "Missing required fields" }, 400);
    }

    if (feedbackData.email && feedbackData.email.length > EMAIL_MAX) {
      return json(
        { success: false, error: "Email exceeds maximum length" },
        400
      );
    }

    if (feedbackData.message.length > MESSAGE_MAX) {
      return json(
        { success: false, error: "Message exceeds maximum length" },
        400
      );
    }

    if (!context.env.FEEDBACK_KV) {
      return json(
        {
          success: false,
          error:
            "Storage not configured. Please bind FEEDBACK_KV in Cloudflare settings.",
        },
        500
      );
    }

    const feedbackId = `feedback_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 11)}`;

    const submittedAt = new Date().toISOString();

    const feedbackRecord = {
      id: feedbackId,
      sentiment: feedbackData.sentiment,
      category: feedbackData.category,
      article: feedbackData.article || "Vagudle",
      categoryId: feedbackData.categoryId || "",
      email: feedbackData.email || "",
      message: feedbackData.message,
      submittedAt,
      userAgent: context.request.headers.get("User-Agent") || "unknown",
      ip: context.request.headers.get("CF-Connecting-IP") || "unknown",
      completed: false,
      tags: [],
    };

    await context.env.FEEDBACK_KV.put(
      feedbackId,
      JSON.stringify(feedbackRecord),
      {
        metadata: {
          sentiment: feedbackData.sentiment,
          category: feedbackData.category,
          timestamp: feedbackRecord.submittedAt,
          completed: false,
        },
      }
    );

    const dateKey = new Date().toISOString().split("T")[0];
    const indexItemKey = `index:${dateKey}:${feedbackId}`;
    await context.env.FEEDBACK_KV.put(indexItemKey, feedbackId);

    return json({
      success: true,
      message: "Feedback received successfully",
      id: feedbackId,
    });
  } catch (error) {
    console.error("Feedback error:", error);
    return json(
      { success: false, error: "Failed to process feedback: " + error.message },
      500
    );
  }
}
