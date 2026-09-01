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
import strings from "../../../constants/strings";

const PROVIDER_LABELS: Record<string, string> = {
  "google.com": "Google",
  "github.com": "GitHub",
  password: strings.CLOUD_SAVE_PROVIDER_LABEL_EMAIL,
  "discord.com": "Discord",
  "playgames.google.com": strings.CLOUD_SAVE_PROVIDER_LABEL_PLAYGAMES,
};

const getProviderLabel = (providerId: string): string =>
  PROVIDER_LABELS[providerId] ?? strings.CLOUD_SAVE_PROVIDER_LABEL_UNKNOWN;

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
        {strings.CLOUD_SAVE_AUTO_SIGNED_IN_TEXT}
      </p>
      {mode === "waiting" ? (
        <p className="font-code text-xs text-gray-500 leading-snug">
          {strings.CLOUD_SAVE_WAITING_LINK_TEXT}
        </p>
      ) : (
        <button
          type="button"
          onClick={() => void handleLink()}
          disabled={mode === "linking" || !accessToken}
          className="w-full font-pixel text-xs tracking-widest px-3 py-2 disabled:opacity-40"
          style={providerButtonStyle}
        >
          {mode === "linking"
            ? strings.CLOUD_SAVE_OPENING_LINK_BUTTON_TEXT
            : strings.CLOUD_SAVE_LINK_EXISTING_ACCOUNT_BUTTON_TEXT}
        </button>
      )}
      {mode === "error" && (
        <p className="font-code text-xs text-spice-red leading-snug">
          {strings.CLOUD_SAVE_LINK_START_ERROR_TEXT}
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
        {strings.CLOUD_SAVE_PLAYGAMES_PROMPT_TEXT}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void handleLink()}
          disabled={mode === "opening"}
          className="flex-1 font-pixel text-xs tracking-widest px-3 py-2 disabled:opacity-40"
          style={providerButtonStyle}
        >
          {mode === "opening"
            ? strings.CLOUD_SAVE_OPENING_BUTTON_TEXT
            : strings.CLOUD_SAVE_LINK_ACCOUNT_BUTTON_TEXT}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="flex-1 font-pixel text-xs tracking-widest px-3 py-2"
          style={providerButtonStyle}
        >
          {strings.CLOUD_SAVE_SKIP_BUTTON_TEXT}
        </button>
      </div>
      {mode === "error" && (
        <p className="font-code text-xs text-spice-red leading-snug">
          {strings.CLOUD_SAVE_LINK_START_ERROR_TEXT}
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
        {mode === "opening"
          ? strings.CLOUD_SAVE_OPENING_LINK_BUTTON_TEXT
          : label}
      </button>
      {mode === "error" && (
        <p className="font-code text-xs text-spice-red leading-snug">
          {strings.CLOUD_SAVE_LINK_START_ERROR_TEXT}
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
        {mode === "linking"
          ? strings.CLOUD_SAVE_LINKING_BUTTON_TEXT
          : strings.CLOUD_SAVE_LINK_PLAYGAMES_BUTTON_TEXT}
      </button>
      {mode === "error" && (
        <p className="font-code text-xs text-spice-red leading-snug">
          {strings.CLOUD_SAVE_PLAYGAMES_LINK_ERROR_TEXT}
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
  const linkStatusRequestIdRef = useRef(0);

  const refreshLinkStatus = useCallback(async () => {
    const requestId = ++linkStatusRequestIdRef.current;
    const idToken = await getIdTokenForCurrentUser();
    const status = idToken ? await fetchLinkStatus(idToken) : null;
    if (linkStatusRequestIdRef.current === requestId) setLinkStatus(status);
  }, []);

  useEffect(() => {
    const requestId = ++linkStatusRequestIdRef.current;
    let cancelled = false;
    void (async () => {
      const idToken = await getIdTokenForCurrentUser();
      if (cancelled || linkStatusRequestIdRef.current !== requestId) return;
      const status = idToken ? await fetchLinkStatus(idToken) : null;
      if (!cancelled && linkStatusRequestIdRef.current === requestId)
        setLinkStatus(status);
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
    if (!user) return null;

    const primaryLabel = getProviderLabel(user.providerId);
    const linked = new Set<string>();

    for (const providerId of user.providerIds) {
      const label = getProviderLabel(providerId);
      if (
        label !== strings.CLOUD_SAVE_PROVIDER_LABEL_UNKNOWN &&
        label !== primaryLabel
      )
        linked.add(label);
    }

    if (linkStatus?.discordLinked && primaryLabel !== "Discord")
      linked.add("Discord");
    if (
      linkStatus?.playGamesLinked &&
      primaryLabel !== strings.CLOUD_SAVE_PROVIDER_LABEL_PLAYGAMES
    )
      linked.add(strings.CLOUD_SAVE_PROVIDER_LABEL_PLAYGAMES);

    return linked.size > 0
      ? strings.CLOUD_SAVE_ALSO_LINKED_TEXT(Array.from(linked).join(", "))
      : null;
  }, [user, linkStatus?.discordLinked, linkStatus?.playGamesLinked]);

  return (
    <div className="py-3">
      <p className="font-pixel text-xs text-crown-amber tracking-widest leading-none mb-2">
        {strings.CLOUD_SAVE_HEADING}
      </p>
      <div className="flex items-start gap-1.5 mb-2">
        <AlertTriangle
          className="w-3.5 h-3.5 shrink-0 mt-0.5 text-crown-amber"
          aria-hidden="true"
        />
        <p className="font-code text-xs text-gray-500 leading-snug">
          {strings.CLOUD_SAVE_IN_PROGRESS_WARNING_TEXT}
        </p>
      </div>
      <div className="flex items-start gap-1.5 mb-2">
        <ShieldCheck
          className="w-3.5 h-3.5 shrink-0 mt-0.5 text-spice-lime"
          aria-hidden="true"
        />
        <p className="font-code text-xs text-gray-500 leading-snug">
          {strings.CLOUD_SAVE_PRIVACY_TEXT}
        </p>
      </div>
      {isActivityMode ? (
        <ActivityLinkSection accessToken={activityAccessToken} />
      ) : authLoading ? (
        <p className="font-code text-xs text-gray-500">
          {strings.CLOUD_SAVE_CHECKING_STATUS_TEXT}
        </p>
      ) : user ? (
        <div className="space-y-2">
          {user.providerId === "playgames.google.com" &&
            showPlayGamesLinkPrompt && (
              <PlayGamesLinkPrompt onDismiss={dismissPlayGamesLinkPrompt} />
            )}
          <p className="font-code text-xs text-gray-300 leading-snug">
            {strings.CLOUD_SAVE_SIGNED_IN_AS_TEXT}{" "}
            <span className="text-spice-lime">
              {user.email ?? user.displayName ?? user.uid}
            </span>{" "}
            {strings.CLOUD_SAVE_ACCOUNT_TYPE_SUFFIX_TEXT(accountTypeLabel)}
            {linkedAccountsLabel && <> · {linkedAccountsLabel}</>}
          </p>
          <p className="font-code text-xs text-gray-500">
            {isCloudUpToDate ? (
              <span className="text-spice-lime">
                {strings.CLOUD_SAVE_UP_TO_DATE_TEXT}
              </span>
            ) : (
              strings.CLOUD_SAVE_SYNCING_TEXT
            )}
            {cloudUpdatedAt && (
              <>
                {" "}
                ·{" "}
                {strings.CLOUD_SAVE_LAST_SAVED_TEXT(
                  formatRelativeTime(cloudUpdatedAt)
                )}
              </>
            )}
          </p>
          {user.providerId === "discord.com" && !linkStatus?.discordLinked && (
            <LinkAccountButton
              label={strings.CLOUD_SAVE_LINK_ACCOUNT_BUTTON_TEXT}
              onLink={async () => {
                const session = getStoredDiscordSession();
                if (!session)
                  return {
                    error: strings.CLOUD_SAVE_LINK_START_ERROR_TEXT,
                  };
                return openDiscordLinkFlow(session);
              }}
            />
          )}
          {user.providerId === "playgames.google.com" &&
            !linkStatus?.playGamesLinked && (
              <LinkAccountButton
                label={strings.CLOUD_SAVE_LINK_ACCOUNT_BUTTON_TEXT}
                onLink={async () => {
                  const session = getStoredPlayGamesSession();
                  if (!session)
                    return {
                      error: strings.CLOUD_SAVE_LINK_START_ERROR_TEXT,
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
              {strings.CLOUD_SAVE_LINK_DISCORD_BUTTON_TEXT}
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
            {strings.CLOUD_SAVE_SIGN_OUT_BUTTON_TEXT}
          </button>
          {actionError && (
            <p className="font-code text-xs text-spice-red">{actionError}</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="font-code text-xs text-gray-500 leading-snug mb-1">
            {strings.CLOUD_SAVE_SIGN_IN_PROMPT_TEXT}
          </p>

          <p className="font-pixel text-[10px] text-crown-amber tracking-widest leading-none mt-2 mb-1">
            {strings.CLOUD_SAVE_DIRECT_SIGNIN_HEADING}
          </p>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-3 py-2"
            style={providerButtonStyle}
          >
            <GoogleIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
            {strings.LINK_DISCORD_CONTINUE_GOOGLE_BUTTON_TEXT}
          </button>
          <button
            type="button"
            onClick={signInWithGithub}
            className="w-full flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-3 py-2"
            style={providerButtonStyle}
          >
            <GithubIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
            {strings.LINK_DISCORD_CONTINUE_GITHUB_BUTTON_TEXT}
          </button>
          <div className="flex gap-2 pt-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label={strings.CLOUD_SAVE_EMAIL_ARIA_LABEL}
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
              {strings.CLOUD_SAVE_SEND_LINK_BUTTON_TEXT}
            </button>
          </div>
          {emailLinkSent && (
            <p className="font-code text-xs text-spice-lime">
              {strings.CLOUD_SAVE_EMAIL_SENT_TEXT}
            </p>
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
                  onClick={signInWithDiscord}
                  className="w-full flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-3 py-2"
                  style={providerButtonStyle}
                >
                  <DiscordIcon
                    className="w-4 h-4 shrink-0"
                    aria-hidden="true"
                  />
                  {strings.LINK_PLAYGAMES_CONTINUE_DISCORD_BUTTON_TEXT}
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
                  {strings.CLOUD_SAVE_CONTINUE_PLAYGAMES_BUTTON_TEXT}
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
