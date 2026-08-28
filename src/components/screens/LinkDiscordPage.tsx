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
          This link is missing or invalid. Go back to Discord and try linking
          your account again.
        </p>
      );

    if (linkStatus === "linked")
      return (
        <div className="flex flex-col gap-3">
          <p className="font-code text-sm text-gray-400 leading-relaxed">
            Your account is linked. You can close this tab and go back to
            Discord, or return to Vagudle below.
          </p>
          <a
            href="https://vagudle.king-tajin.dev/"
            className="font-pixel text-xs tracking-widest px-4 py-2 transition-colors text-center"
            style={buttonStyle}
          >
            RETURN TO VAGUDLE
          </a>
        </div>
      );

    if (linkStatus === "linking")
      return (
        <p className="font-code text-sm text-gray-400 leading-relaxed">
          Linking your account...
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
            TRY AGAIN
          </button>
        </>
      );

    if (user && user.providerId !== "discord.com")
      return (
        <p className="font-code text-sm text-gray-400 leading-relaxed">
          Signed in as {user.email ?? user.displayName ?? "your account"}.
          Finishing the link...
        </p>
      );

    return (
      <div className="flex flex-col gap-4 text-left">
        <p className="font-code text-sm text-gray-400 leading-relaxed text-center">
          Sign in with your existing Vagudle account to link it to Discord.
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            className="font-pixel text-xs tracking-widest px-4 py-2 transition-colors"
            style={buttonStyle}
          >
            CONTINUE WITH GOOGLE
          </button>
          <button
            type="button"
            onClick={() => void signInWithGithub()}
            className="font-pixel text-xs tracking-widest px-4 py-2 transition-colors"
            style={buttonStyle}
          >
            CONTINUE WITH GITHUB
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="link-discord-email"
            className="font-pixel text-xs text-crown-gold tracking-widest"
          >
            EMAIL
          </label>
          <input
            id="link-discord-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
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
            SEND SIGN-IN LINK
          </button>
          {emailLinkSent && (
            <p className="font-code text-xs text-gray-500 leading-relaxed">
              Check your email for a sign-in link, then open it in this same
              browser.
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
            LINK YOUR ACCOUNT
          </p>
          {renderBody()}
        </m.div>
      </div>
    </div>
  );
};
