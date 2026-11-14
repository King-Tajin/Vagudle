import { useEffect, useRef, useState } from "react";
import { m } from "framer-motion";
import { Loader2 } from "lucide-react";
import { BackgroundGrid } from "../backgrounds/BackgroundGrid";
import { title } from "./screenHelpers";
import { DiscordSaveConflictChoice } from "../DiscordSaveConflictChoice";
import {
  completeEmailLinkSignIn,
  useCloudAuth,
} from "../../hooks/useCloudAuth";
import { EmailLinkSentNotice } from "../EmailLinkSentNotice";
import { isValidEmail } from "../../lib/email";
import { getPublicOrigin } from "../../lib/publicOrigin";
import {
  useAccountLinkFlow,
  type AccountLinkFn,
  type ResolveConflictFn,
} from "../../hooks/useAccountLinkFlow";
import strings from "../../constants/strings";

const cardStyle = {
  background: "rgba(255,215,0,0.06)",
  border: "2px solid rgba(255,215,0,0.3)",
};

const buttonStyle = {
  background: "rgba(255,215,0,0.08)",
  border: "1px solid rgba(255,215,0,0.3)",
  color: "#d4af37",
};

const inputStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#e5e5e5",
};

type LinkAccountPageProps = {
  idPrefix: string;
  linkedProviderId: string;
  linkFn: AccountLinkFn;
  resolveConflictFn?: ResolveConflictFn;
  invalidLinkText: string;
  linkedText: string;
  signInPromptText: string;
  confirmLabelText: string;
  extraSignInMethod?: { label: string; onClick: () => void };
  redirectToAppAfterLink?: boolean;
};

export const LinkAccountPage = ({
  idPrefix,
  linkedProviderId,
  linkFn,
  resolveConflictFn,
  invalidLinkText,
  linkedText,
  signInPromptText,
  confirmLabelText,
  extraSignInMethod,
  redirectToAppAfterLink = false,
}: LinkAccountPageProps) => {
  const [token] = useState(() =>
    new URLSearchParams(window.location.search).get("token")
  );
  const [email, setEmail] = useState("");
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [confirmation, setConfirmation] = useState("");

  const {
    user,
    actionError,
    authFlowMessage,
    emailLinkSent,
    emailLinkSentTo,
    emailLinkSending,
    emailLinkCooldownSeconds,
    emailLinkBusy,
    resetEmailLinkState,
    signInWithGoogle,
    signInWithGithub,
    sendEmailLink,
  } = useCloudAuth();

  const trimmedEmail = email.trim();
  const emailValid = isValidEmail(trimmedEmail);
  const showEmailInvalid = trimmedEmail.length > 0 && !emailValid;
  const showSentNotice =
    emailLinkSent &&
    emailLinkSentTo !== null &&
    emailLinkSentTo === trimmedEmail;

  const handleWrongEmail = () => {
    resetEmailLinkState();
    emailInputRef.current?.focus();
    emailInputRef.current?.select();
  };

  useEffect(() => {
    void completeEmailLinkSignIn();
  }, []);

  const {
    linkStatus,
    linkError,
    conflict,
    resetLinkStatus,
    startLink,
    resolveConflict,
  } = useAccountLinkFlow(
    token,
    user,
    linkedProviderId,
    linkFn,
    resolveConflictFn
  );

  useEffect(() => {
    if (!redirectToAppAfterLink || linkStatus !== "linked") return;
    if (!window.Capacitor?.isNativePlatform?.()) return;

    const timeout = setTimeout(() => {
      window.location.href = `${getPublicOrigin()}/`;
    }, 1500);

    return () => clearTimeout(timeout);
  }, [redirectToAppAfterLink, linkStatus]);

  const renderBody = () => {
    if (!token)
      return (
        <p className="font-code text-sm text-gray-400 leading-relaxed">
          {invalidLinkText}
        </p>
      );

    if (linkStatus === "linked")
      return (
        <div className="flex flex-col gap-3">
          <p className="font-code text-sm text-gray-400 leading-relaxed">
            {linkedText}
          </p>
          <a
            href={`${getPublicOrigin()}/`}
            className="font-pixel text-xs tracking-widest px-4 py-2 transition-colors text-center"
            style={buttonStyle}
          >
            {strings.LINK_DISCORD_RETURN_BUTTON_TEXT}
          </a>
        </div>
      );

    if (conflict && (linkStatus === "conflict" || linkStatus === "linking"))
      return (
        <DiscordSaveConflictChoice
          conflict={conflict}
          busy={linkStatus === "linking"}
          error={linkError}
          onConfirm={(keep) => void resolveConflict(keep)}
          onCancel={resetLinkStatus}
        />
      );

    if (linkStatus === "linking")
      return (
        <p className="font-code text-sm text-gray-400 leading-relaxed">
          {strings.LINK_DISCORD_LINKING_TEXT}
        </p>
      );

    if (linkStatus === "error")
      return (
        <>
          <p
            role="alert"
            className="font-code text-sm text-spice-red leading-relaxed mb-4"
          >
            {linkError}
          </p>
          <button
            type="button"
            onClick={resetLinkStatus}
            className="font-pixel text-xs tracking-widest px-4 py-2 transition-colors"
            style={buttonStyle}
          >
            {strings.LINK_DISCORD_TRY_AGAIN_BUTTON_TEXT}
          </button>
        </>
      );

    if (user && user.providerId !== linkedProviderId)
      return (
        <div className="flex flex-col gap-3 text-left">
          <p className="font-code text-sm text-gray-400 leading-relaxed">
            {strings.LINK_DISCORD_SIGNED_IN_TEXT_BEFORE}{" "}
            {user.email ??
              user.displayName ??
              strings.LINK_DISCORD_FALLBACK_ACCOUNT_TEXT}
            {strings.LINK_DISCORD_SIGNED_IN_TEXT_AFTER}
          </p>
          <label
            htmlFor={`${idPrefix}-confirmation`}
            className="font-code text-sm text-gray-400 leading-relaxed"
          >
            {confirmLabelText}
          </label>
          <input
            id={`${idPrefix}-confirmation`}
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="off"
            className="font-code text-sm px-3 py-2 rounded-none"
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => void startLink(confirmation)}
            disabled={!confirmation.trim()}
            className="font-pixel text-xs tracking-widest px-4 py-2 transition duration-75 enabled:active:scale-95 enabled:active:brightness-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={buttonStyle}
          >
            {strings.LINK_CONFIRM_BUTTON_TEXT}
          </button>
        </div>
      );

    return (
      <div className="flex flex-col gap-4 text-left">
        <p className="font-code text-sm text-gray-400 leading-relaxed text-center">
          {signInPromptText}
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => void signInWithGoogle("signin")}
            className="font-pixel text-xs tracking-widest px-4 py-2 transition-colors"
            style={buttonStyle}
          >
            {strings.LINK_DISCORD_CONTINUE_GOOGLE_BUTTON_TEXT}
          </button>
          <button
            type="button"
            onClick={() => void signInWithGithub("signin")}
            className="font-pixel text-xs tracking-widest px-4 py-2 transition-colors"
            style={buttonStyle}
          >
            {strings.LINK_DISCORD_CONTINUE_GITHUB_BUTTON_TEXT}
          </button>
          {extraSignInMethod && (
            <button
              type="button"
              onClick={extraSignInMethod.onClick}
              className="font-pixel text-xs tracking-widest px-4 py-2 transition-colors"
              style={buttonStyle}
            >
              {extraSignInMethod.label}
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor={`${idPrefix}-email`}
            className="font-pixel text-xs text-crown-gold tracking-widest"
          >
            {strings.LINK_DISCORD_EMAIL_LABEL}
          </label>
          <input
            id={`${idPrefix}-email`}
            ref={emailInputRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={showEmailInvalid}
            aria-describedby={
              showEmailInvalid ? `${idPrefix}-email-error` : undefined
            }
            className="font-code text-sm px-3 py-2 rounded-none"
            style={{
              ...inputStyle,
              borderColor: showEmailInvalid ? "#ef4444" : undefined,
            }}
          />
          {showEmailInvalid && (
            <p
              id={`${idPrefix}-email-error`}
              role="alert"
              className="font-code text-xs text-spice-red leading-relaxed"
            >
              {strings.EMAIL_INVALID_ERROR_TEXT}
            </p>
          )}
          <button
            type="button"
            onClick={() =>
              emailValid &&
              !emailLinkBusy &&
              void sendEmailLink(trimmedEmail, "signin")
            }
            disabled={!emailValid || emailLinkBusy}
            aria-busy={emailLinkSending}
            className="flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-4 py-2 transition duration-75 enabled:active:scale-95 enabled:active:brightness-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={buttonStyle}
          >
            {emailLinkSending && (
              <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
            )}
            {emailLinkSending
              ? strings.CLOUD_SAVE_SENDING_BUTTON_TEXT
              : emailLinkCooldownSeconds > 0 && !showSentNotice
                ? strings.EMAIL_LINK_SEND_COOLDOWN_BUTTON_TEXT(
                    emailLinkCooldownSeconds
                  )
                : strings.LINK_DISCORD_SEND_LINK_BUTTON_TEXT}
          </button>
          {showSentNotice && (
            <EmailLinkSentNotice
              email={emailLinkSentTo}
              sending={emailLinkSending}
              cooldownSeconds={emailLinkCooldownSeconds}
              onResend={() => void sendEmailLink(emailLinkSentTo, "signin")}
              onWrongEmail={handleWrongEmail}
              buttonStyle={buttonStyle}
              messageClassName="text-gray-400"
            />
          )}
        </div>
        {actionError && (
          <p
            role="alert"
            className="font-code text-xs text-spice-red leading-relaxed"
          >
            {actionError}
          </p>
        )}
        {authFlowMessage === "not_registered" && (
          <p
            role="alert"
            className="font-code text-xs text-spice-red leading-relaxed"
          >
            {strings.LINK_DISCORD_NO_ACCOUNT_ERROR_TEXT}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
      <BackgroundGrid />
      <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
        {title}
        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-sm w-full p-5 text-center"
          style={cardStyle}
        >
          <p className="font-pixel text-xs text-crown-gold tracking-widest mb-3">
            {strings.LINK_DISCORD_HEADING}
          </p>
          {renderBody()}
        </m.div>
      </div>
    </div>
  );
};
