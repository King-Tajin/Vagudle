import type { CSSProperties } from "react";
import { Loader2 } from "lucide-react";
import strings from "../constants/strings";

type Props = {
  email: string;
  sending: boolean;
  cooldownSeconds: number;
  onResend: () => void;
  onWrongEmail: () => void;
  buttonStyle: CSSProperties;
  messageClassName: string;
};

export const EmailLinkSentNotice = ({
  email,
  sending,
  cooldownSeconds,
  onResend,
  onWrongEmail,
  buttonStyle,
  messageClassName,
}: Props) => {
  const resendDisabled = sending || cooldownSeconds > 0;

  return (
    <div className="space-y-2">
      <div
        role="status"
        className={`font-code text-xs leading-snug ${messageClassName}`}
      >
        <p className="break-words">{strings.EMAIL_LINK_SENT_TO_TEXT(email)}</p>
        <p className="mt-1 text-gray-500">
          {strings.EMAIL_LINK_SPAM_HINT_TEXT}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onResend}
          disabled={resendDisabled}
          aria-busy={sending}
          className="flex items-center justify-center gap-1.5 font-pixel text-[10px] tracking-widest px-3 py-1.5 transition duration-75 enabled:active:scale-95 enabled:active:brightness-150 disabled:opacity-40 disabled:cursor-not-allowed"
          style={buttonStyle}
        >
          {sending && <Loader2 className="w-3 h-3 shrink-0 animate-spin" />}
          {sending
            ? strings.CLOUD_SAVE_SENDING_BUTTON_TEXT
            : cooldownSeconds > 0
              ? strings.EMAIL_LINK_RESEND_COOLDOWN_BUTTON_TEXT(cooldownSeconds)
              : strings.EMAIL_LINK_RESEND_BUTTON_TEXT}
        </button>
        <button
          type="button"
          onClick={onWrongEmail}
          className="font-pixel text-[10px] text-crown-amber tracking-widest underline"
        >
          {strings.EMAIL_LINK_WRONG_EMAIL_BUTTON_TEXT}
        </button>
      </div>
    </div>
  );
};
