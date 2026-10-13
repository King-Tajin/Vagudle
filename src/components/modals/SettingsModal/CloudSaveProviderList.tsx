import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import GoogleIcon from "../../../assets/icons/google.svg?react";
import GithubIcon from "../../../assets/icons/github.svg?react";
import DiscordIcon from "../../../assets/icons/discord.svg?react";
import PlayGamesIcon from "../../../assets/icons/playgames.svg?react";
import type { AuthIntent } from "../../../lib/authIntent";
import { isValidEmail } from "../../../lib/email";
import type { LastUsedAccount } from "../../../lib/lastUsedAccount";
import { providerButtonStyle } from "./styles";
import strings from "../../../constants/strings";

export const LastUsedBadge = ({
  offsetClass = "-right-2",
}: {
  offsetClass?: string;
}) => (
  <span
    className={`absolute -top-2 ${offsetClass} font-pixel text-[8px] tracking-widest px-1.5 py-0.5 rounded-full bg-yellow-400 text-black`}
  >
    {strings.CLOUD_SAVE_LAST_USED_BADGE_TEXT}
  </span>
);

export const ProviderList = ({
  intent,
  isActivityMode,
  playGamesAvailable,
  email,
  setEmail,
  emailLinkSent,
  emailLinkSending,
  emailLinkBusy,
  authFlowMessage,
  actionError,
  onGoToOtherIntent,
  signInWithGoogle,
  signInWithGithub,
  signInWithDiscord,
  signInWithPlayGames,
  sendEmailLink,
  lastUsed,
}: {
  intent: AuthIntent;
  isActivityMode: boolean;
  playGamesAvailable: boolean;
  email: string;
  setEmail: (email: string) => void;
  emailLinkSent: boolean;
  emailLinkSending: boolean;
  emailLinkBusy: boolean;
  authFlowMessage: "not_registered" | "already_registered" | null;
  actionError: string | null;
  onGoToOtherIntent: () => void;
  signInWithGoogle: (intent: AuthIntent) => void;
  signInWithGithub: (intent: AuthIntent) => void;
  signInWithDiscord: (intent: AuthIntent) => void;
  signInWithPlayGames: (intent: AuthIntent) => void;
  sendEmailLink: (email: string, intent: AuthIntent) => void;
  lastUsed: LastUsedAccount | null;
}) => {
  const isLastUsed = (providerId: string): boolean =>
    lastUsed?.providerId === providerId;
  const [lastMethod, setLastMethod] = useState<"email" | "provider">(
    "provider"
  );
  const trimmedEmail = email.trim();
  const emailValid = isValidEmail(trimmedEmail);
  const showEmailInvalid = trimmedEmail.length > 0 && !emailValid;
  const isEmailError = actionError === strings.CLOUD_AUTH_EMAIL_LINK_ERROR_TEXT;

  const withProvider = (action: (intent: AuthIntent) => void) => () => {
    setLastMethod("provider");
    action(intent);
  };

  const flowMessageBlock = authFlowMessage ? (
    <div className="space-y-1 mb-1">
      <p className="font-code text-xs text-spice-red leading-snug">
        {authFlowMessage === "not_registered"
          ? strings.CLOUD_SAVE_NOT_REGISTERED_ERROR_TEXT
          : strings.CLOUD_SAVE_ALREADY_REGISTERED_ERROR_TEXT}
      </p>
      <button
        type="button"
        onClick={onGoToOtherIntent}
        className="font-pixel text-[10px] text-crown-amber tracking-widest underline"
      >
        {authFlowMessage === "not_registered"
          ? strings.CLOUD_SAVE_CREATE_ACCOUNT_BUTTON_TEXT
          : strings.CLOUD_SAVE_SIGN_IN_BUTTON_TEXT}
      </button>
    </div>
  ) : null;

  return (
    <div className="space-y-2">
      {lastMethod === "provider" && flowMessageBlock}

      <p className="font-pixel text-[10px] text-crown-amber tracking-widest leading-none mt-2 mb-1">
        {strings.CLOUD_SAVE_DIRECT_SIGNIN_HEADING}
      </p>
      <button
        type="button"
        onClick={withProvider(signInWithGoogle)}
        className="relative w-full flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-3 py-2"
        style={providerButtonStyle}
      >
        <GoogleIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
        {strings.LINK_DISCORD_CONTINUE_GOOGLE_BUTTON_TEXT}
        {isLastUsed("google.com") && <LastUsedBadge />}
      </button>
      <button
        type="button"
        onClick={withProvider(signInWithGithub)}
        className="relative w-full flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-3 py-2"
        style={providerButtonStyle}
      >
        <GithubIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
        {strings.LINK_DISCORD_CONTINUE_GITHUB_BUTTON_TEXT}
        {isLastUsed("github.com") && <LastUsedBadge />}
      </button>
      <div className="flex gap-2 pt-1">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-label={strings.CLOUD_SAVE_EMAIL_ARIA_LABEL}
          aria-invalid={showEmailInvalid}
          aria-describedby={
            showEmailInvalid ? "cloud-save-email-error" : undefined
          }
          className="flex-1 min-w-0 border-2 font-code text-xs p-2 outline-none focus-visible:ring-2 focus-visible:ring-crown-amber"
          style={{
            background: "#0a0014",
            borderColor: showEmailInvalid ? "#ef4444" : "#3a3a4a",
            color: "#d1d5db",
          }}
        />
        <button
          type="button"
          onClick={() => {
            if (!emailValid || emailLinkBusy) return;
            setLastMethod("email");
            sendEmailLink(trimmedEmail, intent);
          }}
          disabled={!emailValid || emailLinkBusy}
          aria-busy={emailLinkSending}
          className="relative shrink-0 flex items-center gap-1.5 font-pixel text-xs tracking-widest px-3 py-2 transition duration-75 enabled:active:scale-95 enabled:active:brightness-150 disabled:opacity-40 disabled:cursor-not-allowed"
          style={providerButtonStyle}
        >
          {emailLinkSending ? (
            <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />
          ) : (
            <Mail className="w-3.5 h-3.5 shrink-0" />
          )}
          {emailLinkSending
            ? strings.CLOUD_SAVE_SENDING_BUTTON_TEXT
            : strings.CLOUD_SAVE_SEND_LINK_BUTTON_TEXT}
          {isLastUsed("password") && <LastUsedBadge />}
        </button>
      </div>
      {showEmailInvalid && (
        <p
          id="cloud-save-email-error"
          role="alert"
          className="font-code text-xs text-spice-red leading-snug"
        >
          {strings.EMAIL_INVALID_ERROR_TEXT}
        </p>
      )}
      {emailLinkSent && (
        <p className="font-code text-xs text-spice-lime">
          {strings.CLOUD_SAVE_EMAIL_SENT_TEXT}
        </p>
      )}
      {lastMethod === "email" && flowMessageBlock}
      {isEmailError && (
        <p className="font-code text-xs text-spice-red">{actionError}</p>
      )}

      {(!isActivityMode || playGamesAvailable) && (
        <>
          <p className="font-pixel text-[10px] text-crown-amber tracking-widest leading-none mt-3 mb-1">
            {strings.CLOUD_SAVE_FLEXIBLE_SIGNIN_HEADING}
          </p>
          <p className="font-code text-xs text-gray-500 leading-snug mb-1">
            {strings.CLOUD_SAVE_FLEXIBLE_SIGNIN_DESCRIPTION}
          </p>
          {!isActivityMode && (
            <button
              type="button"
              onClick={withProvider(signInWithDiscord)}
              className="relative w-full flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-3 py-2"
              style={providerButtonStyle}
            >
              <DiscordIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {strings.LINK_PLAYGAMES_CONTINUE_DISCORD_BUTTON_TEXT}
              {isLastUsed("discord.com") && <LastUsedBadge />}
            </button>
          )}
          {playGamesAvailable && (
            <button
              type="button"
              onClick={withProvider(signInWithPlayGames)}
              className="w-full relative flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-3 py-2"
              style={providerButtonStyle}
            >
              <PlayGamesIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
              {strings.CLOUD_SAVE_CONTINUE_PLAYGAMES_BUTTON_TEXT}
              {isLastUsed("playgames.google.com") && (
                <LastUsedBadge offsetClass="right-10" />
              )}
              <span className="absolute -top-2 -right-2 font-pixel text-[8px] tracking-widest px-1.5 py-0.5 rounded-full bg-yellow-400 text-black">
                BETA
              </span>
            </button>
          )}
        </>
      )}

      {actionError && !isEmailError && (
        <p className="font-code text-xs text-spice-red">{actionError}</p>
      )}
    </div>
  );
};
