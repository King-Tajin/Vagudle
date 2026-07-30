import RibbonIcon from "../../../../assets/icons/ribon.svg?react";
import { BaseModal } from "../../BaseModal";
import { Share2 } from "lucide-react";
import { shareAchievement } from "../../../../lib/share";
import type { Achievement } from "../../../../lib/achievements";
import { BACKGROUNDS, type BackgroundId } from "../../../../lib/backgrounds";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  achievement: Achievement;
  achievementIdx: number;
  totalAchievements: number;
  handleShareToClipboard: () => void;
  handleAchievementOkay: () => void;
  setBackgroundId?: (id: BackgroundId) => void;
};

export const AchievementView = ({
  isOpen,
  handleClose,
  achievement,
  achievementIdx,
  totalAchievements,
  handleShareToClipboard,
  handleAchievementOkay,
  setBackgroundId,
}: Props) => {
  const bgUnlock = BACKGROUNDS.find(
    (b) => b.requiresAchievementId === achievement.id
  );
  const modalTitle =
    totalAchievements > 1
      ? `Achievement Unlocked (${achievementIdx + 1}/${totalAchievements})`
      : "Achievement Unlocked";

  return (
    <BaseModal title={modalTitle} isOpen={isOpen} handleClose={handleClose}>
      <div className="flex flex-col items-center text-center py-4 gap-4">
        <RibbonIcon className="w-24 h-24" />

        <div>
          <p className="font-pixel text-sm text-crown-gold tracking-widest mb-2">
            {achievement.title}
          </p>
          <p className="font-code text-xs text-gray-400 leading-snug">
            {achievement.description}
          </p>
        </div>

        {bgUnlock && (
          <div
            className="px-3 py-2 flex items-center gap-2"
            style={{
              background: "rgba(255,215,0,0.06)",
              border: "1px solid rgba(255,215,0,0.25)",
            }}
          >
            <RibbonIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="font-pixel text-[9px] text-crown-amber tracking-widest">
              BACKGROUND UNLOCKED: {bgUnlock.desktopLabel}
            </span>
          </div>
        )}
      </div>

      <div
        className={`grid gap-3 mt-2 ${
          bgUnlock ? "grid-cols-3" : "grid-cols-2"
        }`}
      >
        <button
          type="button"
          className="flex items-center justify-center gap-2 py-3 font-pixel text-xs tracking-wider transition-colors"
          style={{
            background: "linear-gradient(180deg, #5000aa 0%, #28007c 100%)",
            border: "2px solid #5000aa",
            color: "#fff",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = "brightness(1.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = "brightness(1)";
          }}
          onClick={() => shareAchievement(achievement, handleShareToClipboard)}
        >
          <Share2 className="w-3.5 h-3.5" />
          SHARE
        </button>
        {bgUnlock && (
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-3 font-pixel text-xs tracking-wider transition-colors"
            style={{
              background: "rgba(255,215,0,0.1)",
              border: "2px solid rgba(255,215,0,0.4)",
              color: "#FFD700",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = "brightness(1.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "brightness(1)";
            }}
            onClick={() => setBackgroundId?.(bgUnlock.id)}
          >
            EQUIP
          </button>
        )}
        <button
          type="button"
          className="flex items-center justify-center gap-2 py-3 font-pixel text-xs tracking-wider transition-colors"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "2px solid rgba(255,255,255,0.12)",
            color: "#9ca3af",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = "brightness(1.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = "brightness(1)";
          }}
          onClick={handleAchievementOkay}
        >
          {achievementIdx < totalAchievements - 1 ? "NEXT" : "CONTINUE"}
        </button>
      </div>
    </BaseModal>
  );
};
