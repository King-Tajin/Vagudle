import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { getPublicOrigin } from "../lib/publicOrigin";
import type { AuthIntent } from "../lib/authIntent";
import type { AuthFlowMessage } from "../lib/cloudAuthUser";
import { EMAIL_LINK_STORAGE_KEY } from "../lib/emailLinkSignIn";
import { getTurnstileToken } from "../lib/turnstile";
import strings from "../constants/strings";

const EMAIL_LINK_RESEND_COOLDOWN_MS = 30 * 1000;
const EMAIL_LINK_RETRY_DELAY_MS = 3 * 1000;

export const useEmailLinkSender = ({
  setActionError,
  setAuthFlowMessage,
}: {
  setActionError: Dispatch<SetStateAction<string | null>>;
  setAuthFlowMessage: Dispatch<SetStateAction<AuthFlowMessage | null>>;
}) => {
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [emailLinkSending, setEmailLinkSending] = useState(false);
  const [emailLinkCoolingDown, setEmailLinkCoolingDown] = useState(false);
  const emailLinkLockRef = useRef(false);
  const emailLinkCooldownTimerRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  useEffect(
    () => () => {
      if (emailLinkCooldownTimerRef.current)
        clearTimeout(emailLinkCooldownTimerRef.current);
    },
    []
  );

  const startEmailLinkCooldown = useCallback((durationMs: number) => {
    if (emailLinkCooldownTimerRef.current)
      clearTimeout(emailLinkCooldownTimerRef.current);
    setEmailLinkCoolingDown(true);
    emailLinkCooldownTimerRef.current = setTimeout(() => {
      emailLinkCooldownTimerRef.current = null;
      setEmailLinkCoolingDown(false);
    }, durationMs);
  }, []);

  const checkEmailAccountExists = useCallback(
    async (email: string): Promise<"exists" | "not_found" | "error"> => {
      try {
        const turnstileToken = await getTurnstileToken();
        const res = await fetch("/api/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, turnstileToken }),
        });
        if (!res.ok) return "error";

        const data = (await res.json()) as {
          success: boolean;
          exists?: boolean;
        };
        if (!data.success) return "error";
        return data.exists ? "exists" : "not_found";
      } catch {
        return "error";
      }
    },
    []
  );

  const sendEmailLink = useCallback(
    async (email: string, intent: AuthIntent) => {
      if (emailLinkLockRef.current) return;
      emailLinkLockRef.current = true;
      setEmailLinkSending(true);
      setActionError(null);
      setAuthFlowMessage(null);
      setEmailLinkSent(false);

      let cooldownMs = EMAIL_LINK_RETRY_DELAY_MS;
      try {
        const existsResult = await checkEmailAccountExists(email);
        if (existsResult === "error") {
          setActionError(strings.CLOUD_AUTH_EMAIL_LINK_ERROR_TEXT);
          return;
        }
        if (intent === "signin" && existsResult === "not_found") {
          setAuthFlowMessage("not_registered");
          return;
        }
        if (intent === "create" && existsResult === "exists") {
          setAuthFlowMessage("already_registered");
          return;
        }

        const turnstileToken = await getTurnstileToken();

        const res = await fetch("/api/send-email-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            url: `${getPublicOrigin()}${window.location.pathname}${window.location.search}${window.location.hash}`,
            turnstileToken,
          }),
        });
        const data = (await res.json()) as { success: boolean };
        if (!res.ok || !data.success) {
          setActionError(strings.CLOUD_AUTH_EMAIL_LINK_ERROR_TEXT);
          return;
        }
        try {
          localStorage.setItem(EMAIL_LINK_STORAGE_KEY, email);
        } catch {}
        setEmailLinkSent(true);
        cooldownMs = EMAIL_LINK_RESEND_COOLDOWN_MS;
      } catch {
        setActionError(strings.CLOUD_AUTH_EMAIL_LINK_ERROR_TEXT);
      } finally {
        emailLinkLockRef.current = false;
        setEmailLinkSending(false);
        startEmailLinkCooldown(cooldownMs);
      }
    },
    [
      checkEmailAccountExists,
      startEmailLinkCooldown,
      setActionError,
      setAuthFlowMessage,
    ]
  );

  return {
    emailLinkSent,
    emailLinkSending,
    emailLinkBusy: emailLinkSending || emailLinkCoolingDown,
    sendEmailLink,
  };
};
