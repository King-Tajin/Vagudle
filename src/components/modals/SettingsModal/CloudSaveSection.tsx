import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { AlertTriangle, Mail, ShieldCheck } from "lucide-react";
import GoogleIcon from "../../../assets/icons/google.svg?react";
import GithubIcon from "../../../assets/icons/github.svg?react";
import DiscordIcon from "../../../assets/icons/discord.svg?react";
import PlayGamesIcon from "../../../assets/icons/playgames.svg?react";
import {
  useCloudAuth,
  isPlayGamesAvailable,
} from "../../../hooks/useCloudAuth";
import {
  getStoredDiscordSession,
  openDiscordLinkFlow,
  initiateDiscordLink,
} from "../../../lib/discordCloudAuth";
import {
  getStoredPlayGamesSession,
  openPlayGamesLinkFlow,
  startPlayGamesLinkAuthCode,
} from "../../../lib/playGamesCloudAuth";
import {
  formatRelativeTime,
  getIdTokenForCurrentUser,
  fetchLinkStatus,
  linkPlayGamesOAuthWithCurrentUser,
  type LinkStatus,
} from "../../../lib/cloudSync";
import {
  fetchActivityLinkUrl,
  checkActivityAccountStatus,
  openExternalLink,
} from "../../../lib/discord";
import { providerButtonStyle } from "./styles";

const PROVIDER_LABELS: Record<string, string> = {
  "google.com": "Google",
  "github.com": "GitHub",
  password: "Email",
  "discord.com": "Discord",
  "playgames.google.com": "Play Games",
};

const getProviderLabel = (providerId: string): string =>
  PROVIDER_LABELS[providerId] ?? "Unknown";

const ActivityLinkSection = ({
  accessToken,
}: {
  accessToken: string | null;
}) => {
  const [mode, setMode] = useState<"idle" | "linking" | "waiting" | "error">(
    "idle"
  );
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (pollRef.current) clearInterval(pollRef.current);
    },
    []
  );

  const handleLink = async () => {
    if (!accessToken) return;
    setMode("linking");
    const url = await fetchActivityLinkUrl(accessToken);
    if (!url) {
      setMode("error");
      return;
    }
    openExternalLink(url);
    setMode("waiting");

    pollRef.current = setInterval(() => {
      void (async () => {
        const resolved = await checkActivityAccountStatus(accessToken);
        if (resolved) {
          if (pollRef.current) clearInterval(pollRef.current);
          window.location.reload();
        }
      })();
    }, 2500);
  };

  return (
    <div className="space-y-2">
      <p className="font-code text-xs text-gray-300">
        Auto signed in via Discord.
      </p>
      {mode === "waiting" ? (
        <p className="font-code text-xs text-gray-500 leading-snug">
          Waiting for you to finish linking in your browser...
        </p>
      ) : (
        <button
          type="button"
          onClick={() => void handleLink()}
          disabled={mode === "linking" || !accessToken}
          className="w-full font-pixel text-xs tracking-widest px-3 py-2 disabled:opacity-40"
          style={providerButtonStyle}
        >
          {mode === "linking" ? "OPENING LINK..." : "LINK EXISTING ACCOUNT"}
        </button>
      )}
      {mode === "error" && (
        <p className="font-code text-xs text-spice-red leading-snug">
          Could not start linking. Please try again.
        </p>
      )}
    </div>
  );
};

const PlayGamesLinkPrompt = ({ onDismiss }: { onDismiss: () => void }) => {
  const [mode, setMode] = useState<"idle" | "opening" | "error">("idle");

  const handleLink = async () => {
    const session = getStoredPlayGamesSession();
    if (!session) {
      setMode("error");
      return;
    }
    setMode("opening");
    const result = await openPlayGamesLinkFlow(session);
    if ("error" in result) {
      setMode("error");
      return;
    }
    onDismiss();
  };

  return (
    <div className="space-y-2 mb-3 p-3" style={providerButtonStyle}>
      <p className="font-code text-xs text-gray-300 leading-snug">
        Have an existing Vagudle account? Link it so your progress carries over.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void handleLink()}
          disabled={mode === "opening"}
          className="flex-1 font-pixel text-xs tracking-widest px-3 py-2 disabled:opacity-40"
          style={providerButtonStyle}
        >
          {mode === "opening" ? "OPENING..." : "LINK ACCOUNT"}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="flex-1 font-pixel text-xs tracking-widest px-3 py-2"
          style={providerButtonStyle}
        >
          SKIP
        </button>
      </div>
      {mode === "error" && (
        <p className="font-code text-xs text-spice-red leading-snug">
          Could not start linking. Please try again.
        </p>
      )}
    </div>
  );
};

const LinkAccountButton = ({
  label,
  onLink,
}: {
  label: string;
  onLink: () => Promise<{ opened: true } | { error: string }>;
}) => {
  const [mode, setMode] = useState<"idle" | "opening" | "error">("idle");

  const handleClick = async () => {
    setMode("opening");
    const result = await onLink();
    if ("error" in result) {
      setMode("error");
      return;
    }
    setMode("idle");
  };

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={mode === "opening"}
        className="w-full font-pixel text-xs tracking-widest px-3 py-2 disabled:opacity-40"
        style={providerButtonStyle}
      >
        {mode === "opening" ? "OPENING LINK..." : label}
      </button>
      {mode === "error" && (
        <p className="font-code text-xs text-spice-red leading-snug">
          Could not start linking. Please try again.
        </p>
      )}
    </div>
  );
};

const LinkPlayGamesToAccountButton = ({
  onLinked,
}: {
  onLinked: () => void;
}) => {
  const [mode, setMode] = useState<"idle" | "linking" | "error">("idle");

  const handleClick = async () => {
    setMode("linking");
    const codeResult = await startPlayGamesLinkAuthCode();
    if ("error" in codeResult) {
      setMode("error");
      return;
    }
    const result = await linkPlayGamesOAuthWithCurrentUser(codeResult.code);
    if (result.status === "error") {
      setMode("error");
      return;
    }
    setMode("idle");
    onLinked();
  };

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => void handleClick()}
        disabled={mode === "linking"}
        className="w-full flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-3 py-2 disabled:opacity-40"
        style={providerButtonStyle}
      >
        <PlayGamesIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
        {mode === "linking" ? "LINKING..." : "LINK PLAY GAMES"}
      </button>
      {mode === "error" && (
        <p className="font-code text-xs text-spice-red leading-snug">
          Could not link Play Games. Please try again.
        </p>
      )}
    </div>
  );
};

export const CloudSaveSection = ({
  cloudUpdatedAt,
  isCloudUpToDate,
  isActivityMode,
  activityAccessToken,
  showPlayGamesLinkPrompt,
  dismissPlayGamesLinkPrompt,
}: {
  cloudUpdatedAt: string | null;
  isCloudUpToDate: boolean;
  isActivityMode: boolean;
  activityAccessToken: string | null;
  showPlayGamesLinkPrompt: boolean;
  dismissPlayGamesLinkPrompt: () => void;
}) => {
  const {
    user,
    authLoading,
    actionError,
    emailLinkSent,
    signInWithGoogle,
    signInWithGithub,
    signInWithDiscord,
    signInWithPlayGames,
    sendEmailLink,
    signOutUser,
  } = useCloudAuth();
  const [email, setEmail] = useState("");
  const [linkStatus, setLinkStatus] = useState<LinkStatus | null>(null);
  const playGamesAvailable = useMemo(() => isPlayGamesAvailable(), []);

  const refreshLinkStatus = useCallback(async () => {
    const idToken = await getIdTokenForCurrentUser();
    setLinkStatus(idToken ? await fetchLinkStatus(idToken) : null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const idToken = await getIdTokenForCurrentUser();
      if (cancelled) return;
      const status = idToken ? await fetchLinkStatus(idToken) : null;
      if (!cancelled) setLinkStatus(status);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const isDirectAccount =
    !!user &&
    user.providerId !== "discord.com" &&
    user.providerId !== "playgames.google.com";

  const accountTypeLabel = user ? getProviderLabel(user.providerId) : "";

  const linkedAccountsLabel = useMemo(() => {
    if (!user || !linkStatus) return null;

    const directAccount =
      user.providerId !== "discord.com" &&
      user.providerId !== "playgames.google.com";

    if (directAccount) {
      const linked: string[] = [];
      if (linkStatus.discordLinked) linked.push("Discord");
      if (linkStatus.playGamesLinked) linked.push("Play Games");
      return linked.length > 0 ? `Also linked: ${linked.join(", ")}` : null;
    }

    const nativeLinked =
      user.providerId === "discord.com"
        ? linkStatus.discordLinked
        : user.providerId === "playgames.google.com"
          ? linkStatus.playGamesLinked
          : false;

    return nativeLinked ? "Linked to a direct account" : null;
  }, [user, linkStatus]);

  return (
    <div className="py-3">
      <p className="font-pixel text-xs text-crown-amber tracking-widest leading-none mb-2">
        CLOUD SAVE
      </p>
      <div className="flex items-start gap-1.5 mb-2">
        <AlertTriangle
          className="w-3.5 h-3.5 shrink-0 mt-0.5 text-crown-amber"
          aria-hidden="true"
        />
        <p className="font-code text-xs text-gray-500 leading-snug">
          Cloud save does not save games currently in progress.
        </p>
      </div>
      <div className="flex items-start gap-1.5 mb-2">
        <ShieldCheck
          className="w-3.5 h-3.5 shrink-0 mt-0.5 text-spice-lime"
          aria-hidden="true"
        />
        <p className="font-code text-xs text-gray-500 leading-snug">
          Your data is never sold. Emails are only kept in case you need
          support.
        </p>
      </div>
      {isActivityMode ? (
        <ActivityLinkSection accessToken={activityAccessToken} />
      ) : authLoading ? (
        <p className="font-code text-xs text-gray-500">
          Checking sign-in status...
        </p>
      ) : user ? (
        <div className="space-y-2">
          {user.providerId === "playgames.google.com" &&
            showPlayGamesLinkPrompt && (
              <PlayGamesLinkPrompt onDismiss={dismissPlayGamesLinkPrompt} />
            )}
          <p className="font-code text-xs text-gray-300 leading-snug">
            Signed in as{" "}
            <span className="text-spice-lime">
              {user.email ?? user.displayName ?? user.uid}
            </span>{" "}
            — {accountTypeLabel} account
            {linkedAccountsLabel && <> · {linkedAccountsLabel}</>}
          </p>
          <p className="font-code text-xs text-gray-500">
            {isCloudUpToDate ? (
              <span className="text-spice-lime">Up to date</span>
            ) : (
              "Syncing..."
            )}
            {cloudUpdatedAt && (
              <> · Last saved {formatRelativeTime(cloudUpdatedAt)}</>
            )}
          </p>
          {user.providerId === "discord.com" && !linkStatus?.discordLinked && (
            <LinkAccountButton
              label="LINK ACCOUNT"
              onLink={async () => {
                const session = getStoredDiscordSession();
                if (!session)
                  return {
                    error: "Could not start linking. Please try again.",
                  };
                return openDiscordLinkFlow(session);
              }}
            />
          )}
          {user.providerId === "playgames.google.com" &&
            !linkStatus?.playGamesLinked && (
              <LinkAccountButton
                label="LINK ACCOUNT"
                onLink={async () => {
                  const session = getStoredPlayGamesSession();
                  if (!session)
                    return {
                      error: "Could not start linking. Please try again.",
                    };
                  return openPlayGamesLinkFlow(session);
                }}
              />
            )}
          {isDirectAccount && !linkStatus?.discordLinked && (
            <button
              type="button"
              onClick={initiateDiscordLink}
              className="w-full flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-3 py-2"
              style={providerButtonStyle}
            >
              <DiscordIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
              LINK DISCORD
            </button>
          )}
          {isDirectAccount &&
            playGamesAvailable &&
            !linkStatus?.playGamesLinked && (
              <LinkPlayGamesToAccountButton onLinked={refreshLinkStatus} />
            )}
          <button
            type="button"
            onClick={signOutUser}
            className="w-full font-pixel text-xs tracking-widest px-3 py-2"
            style={providerButtonStyle}
          >
            SIGN OUT
          </button>
          {actionError && (
            <p className="font-code text-xs text-spice-red">{actionError}</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="font-code text-xs text-gray-500 leading-snug mb-1">
            Sign in to keep your stats, achievements, and settings synced across
            devices.
          </p>

          <p className="font-pixel text-[10px] text-crown-amber tracking-widest leading-none mt-2 mb-1">
            DIRECT SIGN-IN
          </p>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-3 py-2"
            style={providerButtonStyle}
          >
            <GoogleIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
            CONTINUE WITH GOOGLE
          </button>
          <button
            type="button"
            onClick={signInWithGithub}
            className="w-full flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-3 py-2"
            style={providerButtonStyle}
          >
            <GithubIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
            CONTINUE WITH GITHUB
          </button>
          <div className="flex gap-2 pt-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
              className="flex-1 min-w-0 border-2 font-code text-xs p-2 outline-none focus-visible:ring-2 focus-visible:ring-crown-amber"
              style={{
                background: "#0a0014",
                borderColor: "#3a3a4a",
                color: "#d1d5db",
              }}
            />
            <button
              type="button"
              onClick={() => email && sendEmailLink(email)}
              className="shrink-0 flex items-center gap-1.5 font-pixel text-xs tracking-widest px-3 py-2"
              style={providerButtonStyle}
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              SEND LINK
            </button>
          </div>
          {emailLinkSent && (
            <p className="font-code text-xs text-spice-lime">
              Check your email for a sign-in link.
            </p>
          )}

          {(!isActivityMode || playGamesAvailable) && (
            <>
              <p className="font-pixel text-[10px] text-crown-amber tracking-widest leading-none mt-3 mb-1">
                FLEXIBLE SIGN-IN
              </p>
              <p className="font-code text-xs text-gray-500 leading-snug mb-1">
                Works on its own, or link it to another account anytime from
                here.
              </p>
              {!isActivityMode && (
                <button
                  type="button"
                  onClick={signInWithDiscord}
                  className="w-full flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-3 py-2"
                  style={providerButtonStyle}
                >
                  <DiscordIcon
                    className="w-4 h-4 shrink-0"
                    aria-hidden="true"
                  />
                  CONTINUE WITH DISCORD
                </button>
              )}
              {playGamesAvailable && (
                <button
                  type="button"
                  onClick={() => void signInWithPlayGames()}
                  className="w-full relative flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-3 py-2"
                  style={providerButtonStyle}
                >
                  <PlayGamesIcon
                    className="w-4 h-4 shrink-0"
                    aria-hidden="true"
                  />
                  CONTINUE WITH PLAY GAMES
                  <span className="absolute -top-2 -right-2 font-pixel text-[8px] tracking-widest px-1.5 py-0.5 rounded-full bg-yellow-400 text-black">
                    BETA
                  </span>
                </button>
              )}
            </>
          )}

          {actionError && (
            <p className="font-code text-xs text-spice-red">{actionError}</p>
          )}
        </div>
      )}
    </div>
  );
};
