import React, { useEffect, useRef, useState } from "react";
import { WifiOff, Wifi, Check, AlertTriangle, Loader2 } from "lucide-react";
import { BaseModal } from "./BaseModal";
import strings from "../../constants/strings";
import { checkBackendReachable } from "../../lib/offlineMode";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
};

type CheckStatus = "idle" | "checking" | "failed" | "connected";

const PRIMARY_BUTTON_STYLE = {
  background: "linear-gradient(180deg, #d4af37 0%, #b8860b 100%)",
  border: "2px solid #d4af37",
  color: "#0a0014",
};

const SECONDARY_BUTTON_STYLE = {
  background: "transparent",
  border: "2px solid #d4af37",
  color: "#d4af37",
};

const brighten = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.filter = "brightness(1.1)";
};

const reset = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.currentTarget.style.filter = "brightness(1)";
};

const OfflineModeContent = ({ handleClose }: { handleClose: () => void }) => {
  const [status, setStatus] = useState<CheckStatus>("idle");
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => controllerRef.current?.abort();
  }, []);

  const handleCheckAgain = async () => {
    if (status === "checking") return;
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus("checking");
    const reachable = await checkBackendReachable(controller.signal);
    if (controller.signal.aborted) return;
    setStatus(reachable ? "connected" : "failed");
  };

  if (status === "connected") {
    return (
      <div className="space-y-4">
        <div
          className="flex items-start gap-2.5 p-3"
          role="status"
          style={{
            background: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.4)",
          }}
        >
          <Wifi className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
          <p className="font-code text-xs text-gray-300 leading-snug">
            {strings.OFFLINE_MODE_CONNECTED_TEXT}
          </p>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="w-full py-3 font-pixel text-xs tracking-widest flex items-center justify-center gap-2 transition-[filter]"
          style={PRIMARY_BUTTON_STYLE}
          onMouseEnter={brighten}
          onMouseLeave={reset}
        >
          {strings.OFFLINE_MODE_CONTINUE_BUTTON_TEXT}
        </button>
      </div>
    );
  }

  const isChecking = status === "checking";

  return (
    <div className="space-y-4">
      <div
        className="flex items-start gap-2.5 p-3"
        style={{
          background: "rgba(212,175,55,0.1)",
          border: "1px solid rgba(212,175,55,0.4)",
        }}
      >
        <WifiOff className="w-4 h-4 text-crown-amber shrink-0 mt-0.5" />
        <p className="font-code text-xs text-gray-300 leading-snug">
          {strings.OFFLINE_MODE_INTRO_TEXT}
        </p>
      </div>

      <div>
        <p className="font-pixel text-[10px] text-crown-amber tracking-widest mb-1.5">
          {strings.OFFLINE_MODE_AVAILABLE_HEADING}
        </p>
        <ul className="space-y-1.5">
          {strings.OFFLINE_MODE_AVAILABLE_ITEMS.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <Check className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
              <span className="font-code text-xs text-gray-400 leading-snug">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="font-pixel text-[10px] text-spice-red tracking-widest mb-1.5">
          {strings.OFFLINE_MODE_UNAVAILABLE_HEADING}
        </p>
        <ul className="space-y-1.5">
          {strings.OFFLINE_MODE_UNAVAILABLE_ITEMS.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-spice-red shrink-0 mt-0.5" />
              <span className="font-code text-xs text-gray-400 leading-snug">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        {status === "failed" && (
          <p
            className="font-code text-xs text-spice-red leading-snug text-center"
            role="status"
          >
            {strings.OFFLINE_MODE_STILL_OFFLINE_TEXT}
          </p>
        )}

        <button
          type="button"
          onClick={() => void handleCheckAgain()}
          disabled={isChecking}
          className="w-full py-3 font-pixel text-xs tracking-widest flex items-center justify-center gap-2 transition-[filter] disabled:opacity-70 disabled:cursor-not-allowed"
          style={SECONDARY_BUTTON_STYLE}
          onMouseEnter={brighten}
          onMouseLeave={reset}
        >
          {isChecking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {isChecking
            ? strings.OFFLINE_MODE_CHECKING_BUTTON_TEXT
            : strings.OFFLINE_MODE_CHECK_AGAIN_BUTTON_TEXT}
        </button>

        <button
          type="button"
          onClick={handleClose}
          className="w-full py-3 font-pixel text-xs tracking-widest flex items-center justify-center gap-2 transition-[filter]"
          style={PRIMARY_BUTTON_STYLE}
          onMouseEnter={brighten}
          onMouseLeave={reset}
        >
          {strings.OFFLINE_MODE_DISMISS_BUTTON_TEXT}
        </button>
      </div>
    </div>
  );
};

export const OfflineModeModal = ({ isOpen, handleClose }: Props) => {
  return (
    <BaseModal
      title={strings.MODAL_TITLE_OFFLINE_MODE}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <OfflineModeContent handleClose={handleClose} />
    </BaseModal>
  );
};
