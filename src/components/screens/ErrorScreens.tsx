import { useState, useEffect, useRef } from "react";
import { m } from "framer-motion";
import { BackgroundGrid } from "../backgrounds/BackgroundGrid";
import {
  isDiscordActivity,
  openExternalLink,
  startDailyActivity,
  checkActivityAccountStatus,
  fetchActivityLinkUrl,
  type DailyActivityStartResult,
} from "../../lib/discord";
import { emptyNavbar, title, returnButton, retryButton } from "./screenHelpers";
import strings from "../../constants/strings";

type ReturnProps = {
  handleReturnToNormal: () => void;
};

export type ActivityErrorReason = keyof typeof strings.ACTIVITY_ERROR_MESSAGES;

export const MalformedChallengeScreen = ({
  handleReturnToNormal,
}: ReturnProps) => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar()}
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
      {title}
      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="max-w-sm w-full p-5 text-center"
        style={{
          background: "rgba(220,50,50,0.08)",
          border: "2px solid rgba(220,50,50,0.4)",
        }}
      >
        <p className="font-pixel text-xs text-spice-red tracking-widest mb-2">
          {strings.ERROR_INVALID_CHALLENGE_TITLE}
        </p>
        <p className="font-code text-sm text-gray-400 leading-relaxed mb-4">
          {strings.ERROR_INVALID_CHALLENGE_DESCRIPTION}
        </p>
        {returnButton(handleReturnToNormal)}
      </m.div>
    </div>
  </div>
);

export const MalformedDuelScreen = ({ handleReturnToNormal }: ReturnProps) => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar(isDiscordActivity)}
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
      {title}
      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="max-w-sm w-full p-5 text-center"
        style={{
          background: "rgba(220,50,50,0.08)",
          border: "2px solid rgba(220,50,50,0.4)",
        }}
      >
        <p className="font-pixel text-xs text-spice-red tracking-widest mb-2">
          {strings.ERROR_INVALID_DUEL_TITLE}
        </p>
        <p className="font-code text-sm text-gray-400 leading-relaxed mb-4">
          {strings.ERROR_INVALID_DUEL_DESCRIPTION}
        </p>
        {!isDiscordActivity && returnButton(handleReturnToNormal)}
      </m.div>
    </div>
  </div>
);

export const ExpiredDuelScreen = ({ handleReturnToNormal }: ReturnProps) => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar(isDiscordActivity)}
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
      {title}
      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="max-w-sm w-full p-5 text-center"
        style={{
          background: "rgba(220,50,50,0.08)",
          border: "2px solid rgba(220,50,50,0.4)",
        }}
      >
        <p className="font-pixel text-xs text-spice-red tracking-widest mb-2">
          {strings.ERROR_DUEL_EXPIRED_TITLE}
        </p>
        <p className="font-code text-sm text-gray-400 leading-relaxed mb-4">
          {strings.ERROR_DUEL_EXPIRED_DESCRIPTION}
        </p>
        {!isDiscordActivity && returnButton(handleReturnToNormal)}
      </m.div>
    </div>
  </div>
);

export const ActivityNotFoundScreen = () => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar(true)}
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
      {title}
      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="max-w-sm w-full p-5 text-center"
        style={{
          background: "rgba(220,50,50,0.08)",
          border: "2px solid rgba(220,50,50,0.4)",
        }}
      >
        <p className="font-pixel text-xs text-spice-red tracking-widest mb-2">
          {strings.ERROR_DUEL_EXPIRED_TITLE}
        </p>
        <p className="font-code text-sm text-gray-400 leading-relaxed">
          {strings.ERROR_ACTIVITY_DUEL_EXPIRED_DESCRIPTION}
        </p>
      </m.div>
    </div>
  </div>
);

export const ActivityWrongPlayerScreen = () => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar(true)}
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
      {title}
      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="max-w-sm w-full p-5 text-center"
        style={{
          background: "rgba(220,50,50,0.08)",
          border: "2px solid rgba(220,50,50,0.4)",
        }}
      >
        <p className="font-pixel text-xs text-spice-red tracking-widest mb-2">
          {strings.ERROR_WRONG_ACCOUNT_TITLE}
        </p>
        <p className="font-code text-sm text-gray-400 leading-relaxed">
          {strings.ERROR_WRONG_ACCOUNT_DESCRIPTION}
        </p>
      </m.div>
    </div>
  </div>
);

type ActivityAccountChoiceProps = {
  accessToken: string;
  onResolved: (result: DailyActivityStartResult) => void;
};

export const ActivityAccountChoiceScreen = ({
  accessToken,
  onResolved,
}: ActivityAccountChoiceProps) => {
  const [mode, setMode] = useState<"choice" | "linking" | "error">("choice");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => stopPolling, []);

  const handleLinkExisting = async () => {
    setMode("linking");
    const url = await fetchActivityLinkUrl(accessToken);
    if (!url) {
      setMode("error");
      return;
    }
    openExternalLink(url);

    pollRef.current = setInterval(() => {
      void (async () => {
        const resolved = await checkActivityAccountStatus(accessToken);
        if (resolved) {
          stopPolling();
          onResolved(await startDailyActivity(false));
        }
      })();
    }, 2500);
  };

  const handleCreateStandalone = async () => {
    onResolved(await startDailyActivity(true));
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
      <BackgroundGrid />
      {emptyNavbar(true)}
      <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
        {title}
        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-sm w-full p-5 text-center"
          style={{
            background: "rgba(255,215,0,0.06)",
            border: "2px solid rgba(255,215,0,0.3)",
          }}
        >
          <p className="font-pixel text-xs text-crown-gold tracking-widest mb-2">
            {strings.ERROR_HAVE_YOU_PLAYED_TITLE}
          </p>
          {mode === "choice" && (
            <>
              <p className="font-code text-sm text-gray-400 leading-relaxed mb-4">
                {strings.ERROR_LINK_ACCOUNT_DESCRIPTION}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => void handleLinkExisting()}
                  className="font-pixel text-xs tracking-widest px-4 py-2 transition-colors"
                  style={{
                    background: "rgba(255,215,0,0.08)",
                    border: "1px solid rgba(255,215,0,0.3)",
                    color: "#d4af37",
                  }}
                >
                  {strings.ERROR_LINK_EXISTING_BUTTON_TEXT}
                </button>
                <button
                  type="button"
                  onClick={() => void handleCreateStandalone()}
                  className="font-pixel text-xs tracking-widest px-4 py-2 transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    color: "#aaa",
                  }}
                >
                  {strings.ERROR_START_FRESH_BUTTON_TEXT}
                </button>
              </div>
            </>
          )}
          {mode === "linking" && (
            <p className="font-code text-sm text-gray-400 leading-relaxed">
              {strings.ERROR_LINKING_IN_PROGRESS_DESCRIPTION}
            </p>
          )}
          {mode === "error" && (
            <p className="font-code text-sm text-gray-400 leading-relaxed">
              {strings.ERROR_LINKING_FAILED_DESCRIPTION}
            </p>
          )}
        </m.div>
      </div>
    </div>
  );
};

type ActivityAlreadyPlayedProps = {
  platform?: string;
};

export const ActivityAlreadyPlayedScreen = ({
  platform,
}: ActivityAlreadyPlayedProps) => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar(true)}
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
      {title}
      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="max-w-sm w-full p-5 text-center"
        style={{
          background: "rgba(220,50,50,0.08)",
          border: "2px solid rgba(220,50,50,0.4)",
        }}
      >
        <p className="font-pixel text-xs text-spice-red tracking-widest mb-2">
          {strings.ERROR_ALREADY_PLAYED_TITLE}
        </p>
        <p className="font-code text-sm text-gray-400 leading-relaxed">
          {platform === "web"
            ? strings.ERROR_ALREADY_PLAYED_WEB_DESCRIPTION
            : strings.ERROR_ALREADY_PLAYED_DEFAULT_DESCRIPTION}
        </p>
      </m.div>
    </div>
  </div>
);

export const ActivityServerErrorScreen = ({
  reason,
}: {
  reason: ActivityErrorReason;
}) => (
  <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
    <BackgroundGrid />
    {emptyNavbar(true)}
    <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
      {title}
      <m.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="max-w-sm w-full p-5 text-center"
        style={{
          background: "rgba(220,50,50,0.08)",
          border: "2px solid rgba(220,50,50,0.4)",
        }}
      >
        <p className="font-pixel text-xs text-spice-red tracking-widest mb-2">
          {strings.ERROR_SOMETHING_WRONG_TITLE}
        </p>
        <p className="font-code text-sm text-gray-400 leading-relaxed mb-1">
          {strings.ACTIVITY_ERROR_MESSAGES[reason]}
        </p>
        <p className="font-code text-xs text-gray-600 leading-relaxed mb-4">
          {strings.ERROR_SOMETHING_WRONG_HINT}
        </p>
        {retryButton()}
      </m.div>
    </div>
  </div>
);
