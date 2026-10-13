import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import DiscordIcon from "../../../assets/icons/discord.svg?react";
import { ActivityLink } from "../../ActivityLink";
import {
  useCloudAuth,
  isPlayGamesAvailable,
  type AuthFlowMessage,
} from "../../../hooks/useCloudAuth";
import {
  getStoredDiscordSession,
  openDiscordLinkFlow,
  initiateDiscordLink,
} from "../../../lib/discordCloudAuth";
import {
  getStoredPlayGamesSession,
  openPlayGamesLinkFlow,
} from "../../../lib/playGamesCloudAuth";
import {
  formatRelativeTime,
  getIdTokenForCurrentUser,
  fetchLinkStatus,
  type LinkStatus,
} from "../../../lib/cloudSync";
import { getLastUsedAccount } from "../../../lib/lastUsedAccount";
import { providerButtonStyle } from "./styles";
import {
  ActivityLinkSection,
  PlayGamesLinkPrompt,
  LinkAccountButton,
  LinkPlayGamesToAccountButton,
} from "./CloudSaveLinkWidgets";
import { LastUsedBadge, ProviderList } from "./CloudSaveProviderList";
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

type EntryMode = "choice" | "signin" | "create-gate" | "create-providers";

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
    authFlowMessage,
    clearAuthFlowMessage,
    emailLinkSent,
    emailLinkSending,
    emailLinkBusy,
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
  const [entryMode, setEntryMode] = useState<EntryMode>("choice");
  const [ageGateChecked, setAgeGateChecked] = useState(false);
  const [ageGateBlockedError, setAgeGateBlockedError] = useState(false);

  const [previousAuthFlowMessage, setPreviousAuthFlowMessage] =
    useState<AuthFlowMessage | null>(null);
  if (authFlowMessage !== previousAuthFlowMessage) {
    setPreviousAuthFlowMessage(authFlowMessage);
    if (authFlowMessage && entryMode === "choice") {
      setEntryMode(
        authFlowMessage === "not_registered" ? "signin" : "create-providers"
      );
    }
  }

  const lastUsed = user ? null : getLastUsedAccount();

  const goToChoice = () => {
    setEntryMode("choice");
    setAgeGateChecked(false);
    setAgeGateBlockedError(false);
    clearAuthFlowMessage();
  };

  const goToSignIn = () => {
    setEntryMode("signin");
    clearAuthFlowMessage();
  };

  const goToCreateGate = () => {
    setEntryMode("create-gate");
    setAgeGateChecked(false);
    setAgeGateBlockedError(false);
    clearAuthFlowMessage();
  };

  const handleAgeGateContinue = () => {
    if (!ageGateChecked) {
      setAgeGateBlockedError(true);
      return;
    }
    setAgeGateBlockedError(false);
    setEntryMode("create-providers");
  };

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
          {entryMode === "choice" && (
            <>
              <p className="font-code text-xs text-gray-500 leading-snug mb-1">
                {strings.CLOUD_SAVE_SIGN_IN_PROMPT_TEXT}
              </p>
              <button
                type="button"
                onClick={goToSignIn}
                className="relative w-full font-pixel text-xs tracking-widest px-3 py-2"
                style={providerButtonStyle}
              >
                {strings.CLOUD_SAVE_SIGN_IN_BUTTON_TEXT}
                {lastUsed && <LastUsedBadge />}
              </button>
              <button
                type="button"
                onClick={goToCreateGate}
                className="w-full font-pixel text-xs tracking-widest px-3 py-2"
                style={providerButtonStyle}
              >
                {strings.CLOUD_SAVE_CREATE_ACCOUNT_BUTTON_TEXT}
              </button>
            </>
          )}

          {entryMode === "signin" && (
            <>
              <button
                type="button"
                onClick={goToChoice}
                className="font-pixel text-[10px] tracking-widest px-3 py-1.5 mb-1"
                style={providerButtonStyle}
              >
                {strings.CLOUD_SAVE_BACK_BUTTON_TEXT}
              </button>
              <ProviderList
                intent="signin"
                lastUsed={lastUsed}
                isActivityMode={isActivityMode}
                playGamesAvailable={playGamesAvailable}
                email={email}
                setEmail={setEmail}
                emailLinkSent={emailLinkSent}
                emailLinkSending={emailLinkSending}
                emailLinkBusy={emailLinkBusy}
                authFlowMessage={authFlowMessage}
                actionError={actionError}
                onGoToOtherIntent={goToCreateGate}
                signInWithGoogle={signInWithGoogle}
                signInWithGithub={signInWithGithub}
                signInWithDiscord={signInWithDiscord}
                signInWithPlayGames={signInWithPlayGames}
                sendEmailLink={sendEmailLink}
              />
            </>
          )}

          {entryMode === "create-gate" && (
            <>
              <button
                type="button"
                onClick={goToChoice}
                className="font-pixel text-[10px] tracking-widest px-3 py-1.5 mb-1"
                style={providerButtonStyle}
              >
                {strings.CLOUD_SAVE_BACK_BUTTON_TEXT}
              </button>
              <p className="font-pixel text-xs text-crown-amber tracking-widest leading-none mb-2">
                {strings.CLOUD_SAVE_AGE_GATE_HEADING}
              </p>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ageGateChecked}
                  onChange={(e) => {
                    setAgeGateChecked(e.target.checked);
                    if (e.target.checked) setAgeGateBlockedError(false);
                  }}
                  className="mt-0.5 shrink-0"
                />
                <span className="font-code text-xs text-gray-300 leading-snug">
                  {strings.CLOUD_SAVE_AGE_GATE_AGREEMENT_TEXT_PART1}{" "}
                  <ActivityLink
                    href="https://vagudle.king-tajin.dev/terms"
                    className="text-crown-gold underline hover:text-crown-amber transition-colors"
                  >
                    {strings.CLOUD_SAVE_AGE_GATE_TOS_LINK_TEXT}
                  </ActivityLink>{" "}
                  {strings.CLOUD_SAVE_AGE_GATE_AGREEMENT_TEXT_PART2}{" "}
                  <ActivityLink
                    href="https://vagudle.king-tajin.dev/privacy"
                    className="text-crown-gold underline hover:text-crown-amber transition-colors"
                  >
                    {strings.CLOUD_SAVE_AGE_GATE_PRIVACY_LINK_TEXT}
                  </ActivityLink>
                  {strings.CLOUD_SAVE_AGE_GATE_AGREEMENT_TEXT_PART3}
                </span>
              </label>
              {ageGateBlockedError && (
                <p className="font-code text-xs text-spice-red leading-snug">
                  {strings.CLOUD_SAVE_AGE_GATE_BLOCKED_ERROR_TEXT}
                </p>
              )}
              <button
                type="button"
                onClick={handleAgeGateContinue}
                disabled={!ageGateChecked}
                className="w-full font-pixel text-xs tracking-widest px-3 py-2 disabled:opacity-40"
                style={providerButtonStyle}
              >
                {strings.CLOUD_SAVE_AGE_GATE_CONTINUE_BUTTON_TEXT}
              </button>
            </>
          )}

          {entryMode === "create-providers" && (
            <>
              <button
                type="button"
                onClick={goToChoice}
                className="font-pixel text-[10px] tracking-widest px-3 py-1.5 mb-1"
                style={providerButtonStyle}
              >
                {strings.CLOUD_SAVE_BACK_BUTTON_TEXT}
              </button>
              <ProviderList
                intent="create"
                lastUsed={null}
                isActivityMode={isActivityMode}
                playGamesAvailable={playGamesAvailable}
                email={email}
                setEmail={setEmail}
                emailLinkSent={emailLinkSent}
                emailLinkSending={emailLinkSending}
                emailLinkBusy={emailLinkBusy}
                authFlowMessage={authFlowMessage}
                actionError={actionError}
                onGoToOtherIntent={goToSignIn}
                signInWithGoogle={signInWithGoogle}
                signInWithGithub={signInWithGithub}
                signInWithDiscord={signInWithDiscord}
                signInWithPlayGames={signInWithPlayGames}
                sendEmailLink={sendEmailLink}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};
