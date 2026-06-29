import { Award, Lock, SquareCheckBig } from "lucide-react";
import { BaseModal } from "./BaseModal";
import { ACHIEVEMENTS } from "../../lib/achievements";
import { BACKGROUNDS } from "../../lib/backgrounds";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  unlockedIds: string[];
  totalWins: number;
  uniqueWordCount: number;
};

const PROGRESS_CONFIG: Record<
  string,
  { target: number; getValue: (props: Props) => number }
> = {
  win_15: { target: 15, getValue: (p) => p.totalWins },
  win_50: { target: 50, getValue: (p) => p.totalWins },
  word_connoisseur: { target: 200, getValue: (p) => p.uniqueWordCount },
};

const bgUnlockedBy = (achievementId: string) =>
  BACKGROUNDS.find((b) => b.requiresAchievementId === achievementId);

export const AchievementsModal = (props: Props) => {
  const { isOpen, handleClose, unlockedIds } = props;

  return (
    <BaseModal title="Achievements" isOpen={isOpen} handleClose={handleClose}>
      <div className="space-y-2">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlockedIds.includes(a.id);
          const isHiddenLocked = !isUnlocked && a.hidden;
          const bg = bgUnlockedBy(a.id);
          const cfg = PROGRESS_CONFIG[a.id];
          const showProgress = cfg !== undefined && !isUnlocked;
          const progress = cfg ? Math.min(cfg.getValue(props), cfg.target) : 0;
          const pct = cfg ? Math.round((progress / cfg.target) * 100) : 0;

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

                {showProgress && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-pixel text-[8px] text-gray-500 tracking-widest">
                        PROGRESS
                      </span>
                      <span
                        className="font-pixel text-[8px] tracking-widest"
                        style={{ color: "#d4af37" }}
                      >
                        {progress}/{cfg!.target}
                      </span>
                    </div>
                    <div
                      className="w-full h-2 overflow-hidden"
                      style={{
                        background: "rgba(255,215,0,0.06)",
                        border: "1px solid rgba(255,215,0,0.15)",
                      }}
                    >
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background:
                            "linear-gradient(90deg, #b8860b 0%, #ffd700 100%)",
                        }}
                      />
                    </div>
                  </div>
                )}

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
};
