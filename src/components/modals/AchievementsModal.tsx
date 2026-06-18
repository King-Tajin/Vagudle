import { Award, Lock, SquareCheckBig } from "lucide-react";
import { BaseModal } from "./BaseModal";
import { ACHIEVEMENTS } from "../../lib/achievements";
import { BACKGROUNDS } from "../../lib/backgrounds";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  unlockedIds: string[];
};

const bgUnlockedBy = (achievementId: string) =>
  BACKGROUNDS.find((b) => b.requiresAchievementId === achievementId);

export const AchievementsModal = ({ isOpen, handleClose, unlockedIds }: Props) => (
  <BaseModal title="Achievements" isOpen={isOpen} handleClose={handleClose}>
    <div className="space-y-2">
      {ACHIEVEMENTS.map((a) => {
        const isUnlocked = unlockedIds.includes(a.id);
        const isHiddenLocked = !isUnlocked && a.hidden;
        const bg = bgUnlockedBy(a.id);

        return (
          <div
            key={a.id}
            className="flex items-start gap-3 p-3"
            style={{
              background: isUnlocked
                ? "rgba(80,0,170,0.1)"
                : "rgba(255,255,255,0.02)",
              border: `1px solid ${
                isUnlocked ? "rgba(80,0,170,0.35)" : "rgba(255,255,255,0.06)"
              }`,
              opacity: isUnlocked ? 1 : 0.55,
            }}
          >
            <div className="flex-shrink-0 mt-0.5">
              {isUnlocked ? (
                <SquareCheckBig className="w-6 h-6 text-tajin-lime" />
              ) : (
                <Lock className="w-4 h-4 text-gray-600" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="font-pixel text-xs tracking-widest leading-none mb-1.5"
                style={{
                  color: isUnlocked ? "#fff" : "#6b7280",
                  textDecoration:
                    !isUnlocked && !a.hidden ? "line-through" : "none",
                }}
              >
                {isHiddenLocked ? "???" : a.title}
              </p>
              <p className="font-code text-xs text-gray-500 leading-snug">
                {isHiddenLocked ? "???" : a.description}
              </p>

              {bg && (
                <div
                  className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5"
                  style={{
                    background: "rgba(255,215,0,0.06)",
                    border: "1px solid rgba(255,215,0,0.2)",
                  }}
                >
                  <Award className="w-3 h-3 text-crown-amber flex-shrink-0" />
                  <span className="font-pixel text-[8px] text-crown-amber tracking-widest">
                    {isHiddenLocked
                      ? "UNLOCKS: ???"
                      : `UNLOCKS: ${bg.desktopLabel}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </BaseModal>
);
