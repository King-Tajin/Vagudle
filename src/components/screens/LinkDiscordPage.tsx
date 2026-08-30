import { useEffect, useState } from "react";
import { m } from "framer-motion";
import { BackgroundGrid } from "../backgrounds/BackgroundGrid";
import { title } from "./screenHelpers";
import { linkDiscordWithCurrentUser } from "../../lib/cloudSync";
import {
  completeEmailLinkSignIn,
  useCloudAuth,
} from "../../hooks/useCloudAuth";
import { useAccountLinkFlow } from "../../hooks/useAccountLinkFlow";
import {
  LINK_DISCORD_INVALID_LINK_TEXT,
  LINK_DISCORD_LINKED_TEXT,
  LINK_DISCORD_RETURN_BUTTON_TEXT,
  LINK_DISCORD_LINKING_TEXT,
  LINK_DISCORD_TRY_AGAIN_BUTTON_TEXT,
  LINK_DISCORD_SIGNED_IN_TEXT_BEFORE,
  LINK_DISCORD_SIGNED_IN_TEXT_AFTER,
  LINK_DISCORD_FALLBACK_ACCOUNT_TEXT,
  LINK_DISCORD_SIGN_IN_PROMPT_TEXT,
  LINK_DISCORD_CONTINUE_GOOGLE_BUTTON_TEXT,
  LINK_DISCORD_CONTINUE_GITHUB_BUTTON_TEXT,
  LINK_DISCORD_EMAIL_LABEL,
  LINK_DISCORD_EMAIL_PLACEHOLDER,
  LINK_DISCORD_SEND_LINK_BUTTON_TEXT,
  LINK_DISCORD_EMAIL_SENT_TEXT,
  LINK_DISCORD_HEADING,
} from "../../constants/strings";

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

export const LinkDiscordPage = () => {
  const [token] = useState(() =>
    new URLSearchParams(window.location.search).get("token")
  );
  const [email, setEmail] = useState("");

  const {
    user,
    actionError,
    emailLinkSent,
    signInWithGoogle,
    signInWithGithub,
    sendEmailLink,
  } = useCloudAuth();

  useEffect(() => {
    void completeEmailLinkSignIn();
  }, []);

  const { linkStatus, linkError, resetLinkStatus } = useAccountLinkFlow(
    token,
    user,
    "discord.com",
    linkDiscordWithCurrentUser
  );

  const renderBody = () => {
    if (!token)
      return (
        <p className="font-code text-sm text-gray-400 leading-relaxed">
          {LINK_DISCORD_INVALID_LINK_TEXT}
        </p>
      );

    if (linkStatus === "linked")
      return (
        <div className="flex flex-col gap-3">
          <p className="font-code text-sm text-gray-400 leading-relaxed">
            {LINK_DISCORD_LINKED_TEXT}
          </p>
          <a
            href="https://vagudle.king-tajin.dev/"
            className="font-pixel text-xs tracking-widest px-4 py-2 transition-colors text-center"
            style={buttonStyle}
          >
            {LINK_DISCORD_RETURN_BUTTON_TEXT}
          </a>
        </div>
      );

    if (linkStatus === "linking")
      return (
        <p className="font-code text-sm text-gray-400 leading-relaxed">
          {LINK_DISCORD_LINKING_TEXT}
        </p>
      );

    if (linkStatus === "error")
      return (
        <>
          <p className="font-code text-sm text-spice-red leading-relaxed mb-4">
            {linkError}
          </p>
          <button
            type="button"
            onClick={resetLinkStatus}
            className="font-pixel text-xs tracking-widest px-4 py-2 transition-colors"
            style={buttonStyle}
          >
            {LINK_DISCORD_TRY_AGAIN_BUTTON_TEXT}
          </button>
        </>
      );

    if (user && user.providerId !== "discord.com")
      return (
        <p className="font-code text-sm text-gray-400 leading-relaxed">
          {LINK_DISCORD_SIGNED_IN_TEXT_BEFORE}{" "}
          {user.email ?? user.displayName ?? LINK_DISCORD_FALLBACK_ACCOUNT_TEXT}
          {LINK_DISCORD_SIGNED_IN_TEXT_AFTER}
        </p>
      );

    return (
      <div className="flex flex-col gap-4 text-left">
        <p className="font-code text-sm text-gray-400 leading-relaxed text-center">
          {LINK_DISCORD_SIGN_IN_PROMPT_TEXT}
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            className="font-pixel text-xs tracking-widest px-4 py-2 transition-colors"
            style={buttonStyle}
          >
            {LINK_DISCORD_CONTINUE_GOOGLE_BUTTON_TEXT}
          </button>
          <button
            type="button"
            onClick={() => void signInWithGithub()}
            className="font-pixel text-xs tracking-widest px-4 py-2 transition-colors"
            style={buttonStyle}
          >
            {LINK_DISCORD_CONTINUE_GITHUB_BUTTON_TEXT}
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="link-discord-email"
            className="font-pixel text-xs text-crown-gold tracking-widest"
          >
            {LINK_DISCORD_EMAIL_LABEL}
          </label>
          <input
            id="link-discord-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={LINK_DISCORD_EMAIL_PLACEHOLDER}
            className="font-code text-sm px-3 py-2 rounded-none"
            style={inputStyle}
          />
          <button
            type="button"
            onClick={() => void sendEmailLink(email)}
            disabled={!email}
            className="font-pixel text-xs tracking-widest px-4 py-2 transition-colors disabled:opacity-40"
            style={buttonStyle}
          >
            {LINK_DISCORD_SEND_LINK_BUTTON_TEXT}
          </button>
          {emailLinkSent && (
            <p className="font-code text-xs text-gray-500 leading-relaxed">
              {LINK_DISCORD_EMAIL_SENT_TEXT}
            </p>
          )}
        </div>
        {actionError && (
          <p className="font-code text-xs text-spice-red leading-relaxed">
            {actionError}
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
            {LINK_DISCORD_HEADING}
          </p>
          {renderBody()}
        </m.div>
      </div>
    </div>
  );
};
