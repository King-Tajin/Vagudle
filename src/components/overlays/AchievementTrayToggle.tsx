import { m } from "framer-motion";
import RibbonIcon from "../../assets/icons/ribon.svg?react";

// icon (w-14 = 56px) + padding (p-2 = 8px * 2) + right border (border-2 = 2px) = 74px
const ACHIEVEMENT_TRAY_WIDTH = 74;

type Props = {
  isTrayOpen: boolean;
  onToggleTray: () => void;
  onOpenAchievements: () => void;
};

export const AchievementTrayToggle = ({
  isTrayOpen,
  onToggleTray,
  onOpenAchievements,
}: Props) => (
  <m.div
    className="fixed left-0 z-20 flex items-stretch"
    style={{ top: "calc(5rem + 6px)" }}
    initial={false}
    animate={{ x: isTrayOpen ? 0 : -ACHIEVEMENT_TRAY_WIDTH }}
    transition={{ type: "spring", stiffness: 280, damping: 28 }}
  >
    <button
      type="button"
      className="p-2 flex items-center justify-center bg-obsidian-900/95 backdrop-blur-sm border-2 border-obsidian-600/50 hover:border-crown-gold/50 transition-colors"
      style={{ borderLeft: "none", borderRadius: 0 }}
      onClick={onOpenAchievements}
      aria-label="Achievements"
    >
      <RibbonIcon className="w-14 h-14" />
    </button>
    <button
      type="button"
      className="flex items-center justify-center px-1.5 bg-obsidian-900/95 backdrop-blur-sm border-2 border-obsidian-600/50 hover:border-crown-gold/50 hover:bg-obsidian-700 transition-colors text-crown-gold"
      style={{ borderLeft: "none", borderRadius: "0 6px 6px 0" }}
      onClick={onToggleTray}
      aria-label={
        isTrayOpen ? "Hide achievements tray" : "Show achievements tray"
      }
    >
      <span style={{ fontSize: "16px", lineHeight: 1 }}>
        {isTrayOpen ? "‹" : "›"}
      </span>
    </button>
  </m.div>
);
