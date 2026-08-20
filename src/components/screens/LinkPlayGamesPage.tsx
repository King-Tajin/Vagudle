import { useEffect, useRef, useState } from "react";
import { m } from "framer-motion";
import { BackgroundGrid } from "../backgrounds/BackgroundGrid";
import { title } from "./screenHelpers";
import { linkPlayGamesWithCurrentUser } from "../../lib/cloudSync";
import {
  completeEmailLinkSignIn,
  useCloudAuth,
} from "../../hooks/useCloudAuth";

type LinkStatus = "idle" | "linking" | "linked" | "error";

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

export const LinkPlayGamesPage = () => {
  const [token] = useState(() =>
    new URLSearchParams(window.location.search).get("token")
  );
  const [email, setEmail] = useState("");
  const [linkStatus, setLinkStatus] = useState<LinkStatus>("idle");
  const [linkError, setLinkError] = useState<string | null>(null);
  const linkedRef = useRef(false);

  const {
    user,
    actionError,
    emailLinkSent,
    signInWithGoogle,
    signInWithGithub,
    signInWithDiscord,
    sendEmailLink,
  } = useCloudAuth();

  useEffect(() => {
    void completeEmailLinkSignIn();
  }, []);

  useEffect(() => {
    if (!token || !user || linkedRef.current) return;
    if (user.providerId === "playgames.google.com") return;
    linkedRef.current = true;

    const controller = new AbortController();

    const run = async () => {
      setLinkStatus("linking");
      const result = await linkPlayGamesWithCurrentUser(
        token,
        controller.signal
      );
      const aborted = controller.signal.aborted;
      if (aborted) {
        linkedRef.current = false;
        return;
      }

      if (result.status === "linked") {
        setLinkStatus("linked");
      } else {
        setLinkStatus("error");
        setLinkError(result.message);
        linkedRef.current = false;
      }
    };

    void run();

    return () => controller.abort();
  }, [token, user]);

  useEffect(() => {
    if (linkStatus !== "linked") return;
    if (!window.Capacitor?.isNativePlatform?.()) return;

    const timeout = setTimeout(() => {
      window.location.href = "https://vagudle.king-tajin.dev/";
    }, 1500);

    return () => clearTimeout(timeout);
  }, [linkStatus]);

  const renderBody = () => {
    if (!token)
      return (
        <p className="font-code text-sm text-gray-400 leading-relaxed">
          This link is missing or invalid. Go back to the app and try linking
          your account again.
        </p>
      );

    if (linkStatus === "linked")
      return (
        <p className="font-code text-sm text-gray-400 leading-relaxed">
          Your account is linked. You can close this tab and go back to the app.
        </p>
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
            onClick={() => {
              setLinkStatus("idle");
              setLinkError(null);
            }}
            className="font-pixel text-xs tracking-widest px-4 py-2 transition-colors"
            style={buttonStyle}
          >
            TRY AGAIN
          </button>
        </>
      );

    if (user && user.providerId !== "playgames.google.com")
      return (
        <p className="font-code text-sm text-gray-400 leading-relaxed">
          Signed in as {user.email ?? user.displayName ?? "your account"}.
          Finishing the link...
        </p>
      );

    return (
      <div className="flex flex-col gap-4 text-left">
        <p className="font-code text-sm text-gray-400 leading-relaxed text-center">
          Sign in with your existing Vagudle account to link it to Play Games.
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
          <button
            type="button"
            onClick={() => void signInWithDiscord()}
            className="font-pixel text-xs tracking-widest px-4 py-2 transition-colors"
            style={buttonStyle}
          >
            CONTINUE WITH DISCORD
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="link-playgames-email"
            className="font-pixel text-xs text-crown-gold tracking-widest"
          >
            EMAIL
          </label>
          <input
            id="link-playgames-email"
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
