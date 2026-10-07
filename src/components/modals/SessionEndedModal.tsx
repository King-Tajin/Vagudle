import React from "react";
import { AlertTriangle } from "lucide-react";
import { BaseModal } from "./BaseModal";
import strings from "../../constants/strings";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  handleOpenAccount: () => void;
};

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

export const SessionEndedModal = ({
  isOpen,
  handleClose,
  handleOpenAccount,
}: Props) => {
  return (
    <BaseModal
      title={strings.MODAL_TITLE_SESSION_ENDED}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <div className="space-y-4">
        <div
          className="flex items-start gap-2.5 p-3"
          style={{
            background: "rgba(212,175,55,0.1)",
            border: "1px solid rgba(212,175,55,0.4)",
          }}
        >
          <AlertTriangle className="w-4 h-4 text-crown-amber shrink-0 mt-0.5" />
          <p className="font-code text-xs text-gray-300 leading-snug">
            {strings.SESSION_ENDED_INTRO_TEXT}
          </p>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={handleOpenAccount}
            className="w-full py-3 font-pixel text-xs tracking-widest flex items-center justify-center gap-2 transition-[filter]"
            style={PRIMARY_BUTTON_STYLE}
            onMouseEnter={brighten}
            onMouseLeave={reset}
          >
            {strings.SESSION_ENDED_OPEN_ACCOUNT_BUTTON_TEXT}
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="w-full py-3 font-pixel text-xs tracking-widest flex items-center justify-center gap-2 transition-[filter]"
            style={SECONDARY_BUTTON_STYLE}
            onMouseEnter={brighten}
            onMouseLeave={reset}
          >
            {strings.SESSION_ENDED_CONTINUE_BUTTON_TEXT}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};
