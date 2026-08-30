import { useRef, useState } from "react";
import {
  Send,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Maximize2,
  Minimize2,
} from "lucide-react";
import {
  FEEDBACK_VALIDATION_ERROR_MESSAGE,
  FEEDBACK_SUBMIT_ERROR_MESSAGE,
  FEEDBACK_SUCCESS_TITLE,
  FEEDBACK_SUCCESS_MESSAGE,
  FEEDBACK_SEND_ANOTHER_BUTTON_TEXT,
  FEEDBACK_TYPE_LABEL,
  FEEDBACK_POSITIVE_LABEL,
  FEEDBACK_NEGATIVE_LABEL,
  FEEDBACK_CATEGORY_LABEL,
  FEEDBACK_CATEGORY_PLACEHOLDER,
  FEEDBACK_CATEGORY_BUG_REPORT,
  FEEDBACK_CATEGORY_FEATURE_REQUEST,
  FEEDBACK_CATEGORY_GENERAL,
  FEEDBACK_EMAIL_LABEL,
  FEEDBACK_EMAIL_PLACEHOLDER,
  FEEDBACK_EMAIL_HINT,
  FEEDBACK_MESSAGE_LABEL,
  FEEDBACK_MESSAGE_FULLSCREEN_LABEL,
  FEEDBACK_MESSAGE_PLACEHOLDER,
  FEEDBACK_CHARACTERS_LEFT_TEXT,
  FEEDBACK_EXPAND_LABEL,
  FEEDBACK_COLLAPSE_LABEL,
  FEEDBACK_SENDING_BUTTON_TEXT,
  FEEDBACK_SEND_BUTTON_TEXT,
} from "../../../../constants/strings";

const EMAIL_MAX = 254;
const MESSAGE_MAX = 15000;

export const FeedbackTab = () => {
  const [formData, setFormData] = useState({
    sentiment: "",
    category: "",
    email: "",
    message: "",
    article: "Vagudle",
  });
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isSubmittingRef = useRef(false);

  const messageRemaining = MESSAGE_MAX - formData.message.length;
  const messageNearLimit = messageRemaining <= 500;
  const messageAtLimit = messageRemaining <= 0;

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;

    if (!formData.sentiment || !formData.category || !formData.message) {
      setStatus("error");
      setErrorMessage(FEEDBACK_VALIDATION_ERROR_MESSAGE);
      return;
    }

    isSubmittingRef.current = true;
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        setStatus("error");
        setErrorMessage(FEEDBACK_SUBMIT_ERROR_MESSAGE);
        return;
      }

      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage(FEEDBACK_SUBMIT_ERROR_MESSAGE);
    } finally {
      isSubmittingRef.current = false;
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center">
        <CheckCircle className="w-14 h-14 text-spice-lime mb-4" />
        <h3 className="font-pixel text-sm text-crown-gold mb-2 tracking-widest">
          {FEEDBACK_SUCCESS_TITLE}
        </h3>
        <p className="font-code text-sm text-gray-400">
          {FEEDBACK_SUCCESS_MESSAGE}
        </p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setFormData({
              sentiment: "",
              category: "",
              email: "",
              message: "",
              article: "Vagudle",
            });
          }}
          className="mt-6 font-pixel text-xs text-crown-amber underline tracking-widest"
        >
          {FEEDBACK_SEND_ANOTHER_BUTTON_TEXT}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <span
          id="feedback-type-label"
          className="block font-pixel text-xs text-crown-amber mb-2 tracking-widest"
        >
          {FEEDBACK_TYPE_LABEL}
        </span>
        <div
          role="group"
          aria-labelledby="feedback-type-label"
          className="grid grid-cols-2 gap-3"
        >
          <button
            type="button"
            onClick={() => setFormData({ ...formData, sentiment: "positive" })}
            className="p-3 border-2 transition-colors flex flex-col items-center gap-1"
            style={{
              background:
                formData.sentiment === "positive"
                  ? "rgba(34,197,94,0.15)"
                  : "transparent",
              borderColor:
                formData.sentiment === "positive"
                  ? "#22c55e"
                  : "rgba(255,255,255,0.1)",
            }}
          >
            <ThumbsUp
              className="w-6 h-6"
              style={{
                color:
                  formData.sentiment === "positive" ? "#22c55e" : "#6b7280",
              }}
            />
            <span
              className="font-code text-xs"
              style={{
                color:
                  formData.sentiment === "positive" ? "#22c55e" : "#9ca3af",
              }}
            >
              {FEEDBACK_POSITIVE_LABEL}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, sentiment: "negative" })}
            className="p-3 border-2 transition-colors flex flex-col items-center gap-1"
            style={{
              background:
                formData.sentiment === "negative"
                  ? "rgba(220,50,50,0.15)"
                  : "transparent",
              borderColor:
                formData.sentiment === "negative"
                  ? "#dc3232"
                  : "rgba(255,255,255,0.1)",
            }}
          >
            <ThumbsDown
              className="w-6 h-6"
              style={{
                color:
                  formData.sentiment === "negative" ? "#f87171" : "#6b7280",
              }}
            />
            <span
              className="font-code text-xs"
              style={{
                color:
                  formData.sentiment === "negative" ? "#f87171" : "#9ca3af",
              }}
            >
              {FEEDBACK_NEGATIVE_LABEL}
            </span>
          </button>
        </div>
      </div>
      <div>
        <label
          htmlFor="feedback-category"
          className="block font-pixel text-xs text-crown-amber mb-2 tracking-widest"
        >
          {FEEDBACK_CATEGORY_LABEL}
        </label>
        <select
          id="feedback-category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className="w-full border-2 font-code text-sm p-2 outline-none focus-visible:ring-2 focus-visible:ring-crown-amber transition-colors"
          style={{
            background: "#0a0014",
            borderColor: formData.category
              ? "#d4af37"
              : "rgba(255,255,255,0.1)",
            color: formData.category ? "#d1d5db" : "#6b7280",
          }}
        >
          <option value="">{FEEDBACK_CATEGORY_PLACEHOLDER}</option>
          <option value="bug-report">{FEEDBACK_CATEGORY_BUG_REPORT}</option>
          <option value="feature-request">
            {FEEDBACK_CATEGORY_FEATURE_REQUEST}
          </option>
          <option value="general">{FEEDBACK_CATEGORY_GENERAL}</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="feedback-email"
          className="block font-pixel text-xs text-crown-amber mb-2 tracking-widest"
        >
          {FEEDBACK_EMAIL_LABEL}
        </label>
        <input
          id="feedback-email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder={FEEDBACK_EMAIL_PLACEHOLDER}
          maxLength={EMAIL_MAX}
          className="w-full border-2 font-code text-sm p-2 outline-none focus-visible:ring-2 focus-visible:ring-crown-amber transition-colors"
          style={{
            background: "#0a0014",
            borderColor: "rgba(255,255,255,0.1)",
            color: "#d1d5db",
          }}
        />
        <p className="font-code text-xs text-gray-600 mt-1">
          {FEEDBACK_EMAIL_HINT}
        </p>
      </div>
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label
            htmlFor="feedback-message"
            className="font-pixel text-xs text-crown-amber tracking-widest"
          >
            {FEEDBACK_MESSAGE_LABEL}
          </label>
          <span
            className="font-code text-xs tabular-nums"
            style={{
              color: messageAtLimit
                ? "#f87171"
                : messageNearLimit
                  ? "#fbbf24"
                  : "#4b5563",
            }}
          >
            {FEEDBACK_CHARACTERS_LEFT_TEXT(messageRemaining)}
          </span>
        </div>
        <div className="relative">
          <textarea
            id="feedback-message"
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            onKeyDown={(e) => e.stopPropagation()}
            placeholder={FEEDBACK_MESSAGE_PLACEHOLDER}
            rows={5}
            maxLength={MESSAGE_MAX}
            className="w-full border-2 font-code text-sm p-2 pb-7 outline-none focus-visible:ring-2 focus-visible:ring-crown-amber transition-colors resize-none"
            style={{
              background: "#0a0014",
              borderColor: formData.message
                ? "#d4af37"
                : "rgba(255,255,255,0.1)",
              color: "#d1d5db",
            }}
          />
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            title={FEEDBACK_EXPAND_LABEL}
            aria-label={FEEDBACK_EXPAND_LABEL}
            className="absolute bottom-2 right-2 p-1 transition-opacity opacity-40 hover:opacity-100"
            style={{ color: "#d4af37" }}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {isFullscreen && (
          <div
            className="fixed inset-0 z-9999 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setIsFullscreen(false)}
          >
            <div
              className="flex flex-col"
              style={{
                width: "90vw",
                height: "90vh",
                background: "#0a0014",
                border: "2px solid rgba(212,175,55,0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: "rgba(255,255,255,0.1)" }}
              >
                <span
                  id="feedback-message-fullscreen-label"
                  className="font-pixel text-xs text-crown-amber tracking-widest"
                >
                  {FEEDBACK_MESSAGE_FULLSCREEN_LABEL}
                </span>
                <div className="flex items-center gap-3">
                  <span
                    className="font-code text-xs tabular-nums"
                    style={{
                      color: messageAtLimit
                        ? "#f87171"
                        : messageNearLimit
                          ? "#fbbf24"
                          : "#4b5563",
                    }}
                  >
                    {FEEDBACK_CHARACTERS_LEFT_TEXT(messageRemaining)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(false)}
                    title={FEEDBACK_COLLAPSE_LABEL}
                    aria-label={FEEDBACK_COLLAPSE_LABEL}
                    className="p-1 transition-opacity opacity-60 hover:opacity-100"
                    style={{ color: "#d4af37" }}
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                onKeyDown={(e) => e.stopPropagation()}
                placeholder={FEEDBACK_MESSAGE_PLACEHOLDER}
                aria-labelledby="feedback-message-fullscreen-label"
                maxLength={MESSAGE_MAX}
                autoFocus
                className="flex-1 w-full font-code text-sm p-4 outline-none focus-visible:ring-2 focus-visible:ring-crown-amber resize-none"
                style={{
                  background: "#0a0014",
                  color: "#d1d5db",
                }}
              />
            </div>
          </div>
        )}
      </div>
      {status === "error" && (
        <div
          className="p-3 border-l-4 flex items-start gap-2"
          style={{ background: "rgba(220,50,50,0.08)", borderColor: "#dc3232" }}
        >
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="font-code text-xs text-gray-300">{errorMessage}</p>
        </div>
      )}
      <button
        type="button"
        disabled={status === "submitting"}
        onClick={handleSubmit}
        className="w-full py-3 font-pixel text-xs tracking-widest flex items-center justify-center gap-2 transition-colors"
        style={{
          background:
            status === "submitting"
              ? "rgba(255,215,0,0.05)"
              : "rgba(255,215,0,0.12)",
          border: "2px solid",
          borderColor:
            status === "submitting" ? "rgba(255,215,0,0.2)" : "#d4af37",
          color: status === "submitting" ? "#6b7280" : "#d4af37",
          cursor: status === "submitting" ? "not-allowed" : "pointer",
        }}
      >
        <Send className="w-4 h-4" />
        {status === "submitting"
          ? FEEDBACK_SENDING_BUTTON_TEXT
          : FEEDBACK_SEND_BUTTON_TEXT}
      </button>
    </div>
  );
};
