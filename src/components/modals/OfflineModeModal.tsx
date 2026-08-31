import { WifiOff, Check, AlertTriangle } from "lucide-react";
import { BaseModal } from "./BaseModal";
import strings from "../../constants/strings";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
};

export const OfflineModeModal = ({ isOpen, handleClose }: Props) => {
  return (
    <BaseModal
      title={strings.MODAL_TITLE_OFFLINE_MODE}
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
          {strings.OFFLINE_MODE_DISMISS_BUTTON_TEXT}
        </button>
      </div>
    </BaseModal>
  );
};
