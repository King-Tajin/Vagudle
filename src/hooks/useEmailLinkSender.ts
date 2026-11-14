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
import { getRequestVerification } from "../lib/requestVerification";
import strings from "../constants/strings";

const CHECK_EMAIL_ACTION = "check-email";
const SEND_EMAIL_LINK_ACTION = "send-email-link";
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
  const [emailLinkSentTo, setEmailLinkSentTo] = useState<string | null>(null);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);
  const emailLinkLockRef = useRef(false);
  const cooldownEndsAtRef = useRef(0);
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  const stopCooldownTimer = useCallback(() => {
    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current);
      cooldownIntervalRef.current = null;
    }
  }, []);

  useEffect(() => stopCooldownTimer, [stopCooldownTimer]);

  const startEmailLinkCooldown = useCallback(
    (durationMs: number) => {
      stopCooldownTimer();
      cooldownEndsAtRef.current = Date.now() + durationMs;
      const tick = () => {
        const remaining = Math.ceil(
          (cooldownEndsAtRef.current - Date.now()) / 1000
        );
        if (remaining <= 0) {
          stopCooldownTimer();
          setCooldownSecondsLeft(0);
          return;
        }
        setCooldownSecondsLeft(remaining);
      };
      tick();
      cooldownIntervalRef.current = setInterval(tick, 500);
    },
    [stopCooldownTimer]
  );

  const resetEmailLinkSent = useCallback(() => {
    setEmailLinkSent(false);
    setEmailLinkSentTo(null);
  }, []);

  const checkEmailAccountExists = useCallback(
    async (email: string): Promise<"exists" | "not_found" | "error"> => {
      try {
        const verification = await getRequestVerification(CHECK_EMAIL_ACTION, [
          email,
        ]);
        const res = await fetch("/api/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, ...verification }),
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
    async (rawEmail: string, intent: AuthIntent) => {
      const email = rawEmail.trim();
      if (!email || emailLinkLockRef.current) return;
      emailLinkLockRef.current = true;
      setEmailLinkSending(true);
      setActionError(null);
      setAuthFlowMessage(null);

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

        const returnUrl = `${getPublicOrigin()}${window.location.pathname}${window.location.search}${window.location.hash}`;
        const verification = await getRequestVerification(
          SEND_EMAIL_LINK_ACTION,
          [email, returnUrl]
        );

        const res = await fetch("/api/send-email-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            url: returnUrl,
            ...verification,
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
        setEmailLinkSentTo(email);
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
    emailLinkSentTo,
    emailLinkSending,
    emailLinkCooldownSeconds: cooldownSecondsLeft,
    emailLinkBusy: emailLinkSending || cooldownSecondsLeft > 0,
    sendEmailLink,
    resetEmailLinkSent,
  };
};
