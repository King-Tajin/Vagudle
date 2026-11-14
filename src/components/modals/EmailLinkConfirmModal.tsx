import { useState } from "react";
import { Loader2 } from "lucide-react";
import { BaseModal } from "./BaseModal";
import { isValidEmail } from "../../lib/email";
import type { EmailLinkPromptState } from "../../hooks/useCloudAuth";
import strings from "../../constants/strings";

type Props = {
  prompt: EmailLinkPromptState | null;
  onConfirm: (email: string) => void;
  onDismiss: () => void;
};

const PRIMARY_BUTTON_STYLE = {
  background: "linear-gradient(180deg, #d4af37 0%, #b8860b 100%)",
  border: "2px solid #d4af37",
  color: "#0a0014",
};

const SECONDARY_BUTTON_STYLE = {
  background: "transparent",
  border: "2px solid #d4af37",
  color: "#d4af37",
};

const EmailLinkConfirmBody = ({
  error,
  submitting,
  onConfirm,
  onDismiss,
}: {
  error: EmailLinkPromptState["error"];
  submitting: boolean;
  onConfirm: (email: string) => void;
  onDismiss: () => void;
}) => {
  const [email, setEmail] = useState("");
  const trimmedEmail = email.trim();
  const emailValid = isValidEmail(trimmedEmail);
  const showInvalid = trimmedEmail.length > 0 && !emailValid;
  const canSubmit = emailValid && !submitting;
  const errorText =
    error === "mismatch"
      ? strings.EMAIL_LINK_MISMATCH_ERROR_TEXT
      : showInvalid
        ? strings.EMAIL_INVALID_ERROR_TEXT
        : null;

  const submit = () => {
    if (canSubmit) onConfirm(trimmedEmail);
  };

  return (
    <div className="space-y-4">
      <p className="font-code text-xs text-gray-400 leading-snug">
        {strings.EMAIL_LINK_CONFIRM_HINT_TEXT}
      </p>
      <div className="space-y-2">
        <label
          htmlFor="email-link-confirm-input"
          className="block font-code text-xs text-gray-300 leading-snug"
        >
          {strings.CLOUD_AUTH_EMAIL_PROMPT_TEXT}
        </label>
        <input
          id="email-link-confirm-input"
          data-autofocus
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="you@example.com"
          aria-label={strings.CLOUD_SAVE_EMAIL_ARIA_LABEL}
          aria-invalid={errorText !== null}
          aria-describedby={errorText ? "email-link-confirm-error" : undefined}
          className="w-full border-2 font-code text-xs p-2 outline-none focus-visible:ring-2 focus-visible:ring-crown-amber"
          style={{
            background: "#0a0014",
            borderColor: errorText ? "#ef4444" : "#3a3a4a",
            color: "#d1d5db",
          }}
        />
        {errorText && (
          <p
            id="email-link-confirm-error"
            role="alert"
            className="font-code text-xs text-spice-red leading-snug"
          >
            {errorText}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          aria-busy={submitting}
          className="w-full py-3 font-pixel text-xs tracking-widest flex items-center justify-center gap-2 transition-[filter] enabled:hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
          style={PRIMARY_BUTTON_STYLE}
        >
          {submitting && (
            <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
          )}
          {submitting
            ? strings.EMAIL_LINK_CONFIRM_SUBMITTING_BUTTON_TEXT
            : strings.EMAIL_LINK_CONFIRM_BUTTON_TEXT}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          disabled={submitting}
          className="w-full py-3 font-pixel text-xs tracking-widest flex items-center justify-center gap-2 transition-[filter] enabled:hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
          style={SECONDARY_BUTTON_STYLE}
        >
          {strings.EMAIL_LINK_CONFIRM_CANCEL_BUTTON_TEXT}
        </button>
      </div>
    </div>
  );
};

export const EmailLinkConfirmModal = ({
  prompt,
  onConfirm,
  onDismiss,
}: Props) => (
  <BaseModal
    title={strings.MODAL_TITLE_EMAIL_LINK_CONFIRM}
    isOpen={prompt !== null}
    handleClose={onDismiss}
  >
    <EmailLinkConfirmBody
      error={prompt?.error ?? null}
      submitting={prompt?.submitting ?? false}
      onConfirm={onConfirm}
      onDismiss={onDismiss}
    />
  </BaseModal>
);
