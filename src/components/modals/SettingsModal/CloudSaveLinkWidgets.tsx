import { useState, useEffect, useRef } from "react";
import PlayGamesIcon from "../../../assets/icons/playgames.svg?react";
import {
  getStoredPlayGamesSession,
  openPlayGamesLinkFlow,
  startPlayGamesLinkAuthCode,
} from "../../../lib/playGamesCloudAuth";
import { linkPlayGamesOAuthWithCurrentUser } from "../../../lib/cloudSync";
import {
  fetchActivityLinkUrl,
  checkActivityAccountStatus,
  openExternalLink,
} from "../../../lib/discord";
import { providerButtonStyle } from "./styles";
import strings from "../../../constants/strings";

export const ActivityLinkSection = ({
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

export const PlayGamesLinkPrompt = ({
  onDismiss,
}: {
  onDismiss: () => void;
}) => {
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

export const LinkAccountButton = ({
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

export const LinkPlayGamesToAccountButton = ({
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
