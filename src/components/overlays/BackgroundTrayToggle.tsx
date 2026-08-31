import { m } from "framer-motion";
import { Image } from "lucide-react";
import strings from "../../constants/strings";

const BACKGROUND_TRAY_WIDTH = 74;

type Props = {
  isTrayOpen: boolean;
  onToggleTray: () => void;
  onOpenBackgrounds: () => void;
};

export const BackgroundTrayToggle = ({
  isTrayOpen,
  onToggleTray,
  onOpenBackgrounds,
}: Props) => (
  <m.div
    className="fixed left-0 z-20 flex items-stretch"
    style={{ top: "calc(5rem + 6px + env(safe-area-inset-top))" }}
    initial={false}
    animate={{ x: isTrayOpen ? 0 : -BACKGROUND_TRAY_WIDTH }}
    transition={{ type: "spring", stiffness: 280, damping: 28 }}
  >
    <button
      type="button"
      className="p-2 flex items-center justify-center bg-obsidian-900/95 backdrop-blur-sm border-2 border-obsidian-600/50 hover:border-crown-gold/50 transition-colors"
      style={{ borderLeft: "none", borderRadius: 0 }}
      onClick={onOpenBackgrounds}
      aria-label={strings.BACKGROUND_TRAY_ARIA_LABEL}
    >
      <Image className="w-14 h-14 text-crown-gold" strokeWidth={1.25} />
    </button>
    <button
      type="button"
      className="flex items-center justify-center px-1.5 bg-obsidian-900/95 backdrop-blur-sm border-2 border-obsidian-600/50 hover:border-crown-gold/50 hover:bg-obsidian-700 transition-colors text-crown-gold"
      style={{ borderLeft: "none", borderRadius: "0 6px 6px 0" }}
      onClick={onToggleTray}
      aria-label={
        isTrayOpen
          ? strings.BACKGROUND_TRAY_HIDE_ARIA_LABEL
          : strings.BACKGROUND_TRAY_SHOW_ARIA_LABEL
      }
    >
      <span style={{ fontSize: "16px", lineHeight: 1 }}>
        {isTrayOpen ? "‹" : "›"}
      </span>
    </button>
  </m.div>
);
