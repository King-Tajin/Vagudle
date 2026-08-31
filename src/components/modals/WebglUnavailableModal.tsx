import { AlertTriangle } from "lucide-react";
import { BaseModal } from "./BaseModal";
import strings from "../../constants/strings";

type Props = {
  isOpen: boolean;
  backgroundLabel: string | null;
  handleClose: () => void;
};

export const WebglUnavailableModal = ({
  isOpen,
  backgroundLabel,
  handleClose,
}: Props) => {
  return (
    <BaseModal
      title={strings.MODAL_TITLE_WEBGL_UNAVAILABLE}
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
            {strings.WEBGL_UNAVAILABLE_BODY_TEXT(
              backgroundLabel ?? "This background"
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="w-full py-3 font-pixel text-xs tracking-widest flex items-center justify-center gap-2 transition-[filter]"
          style={{
            background: "linear-gradient(180deg, #d4af37 0%, #b8860b 100%)",
            border: "2px solid #d4af37",
            color: "#0a0014",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = "brightness(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = "brightness(1)";
          }}
        >
          {strings.WEBGL_UNAVAILABLE_DISMISS_BUTTON_TEXT}
        </button>
      </div>
    </BaseModal>
  );
};
