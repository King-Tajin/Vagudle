import { createPortal } from "react-dom";
import { ChevronDown, Lock } from "lucide-react";
import {
  BACKGROUNDS,
  type BackgroundId,
  type BackgroundDef,
} from "../../../lib/backgrounds";
import { ACHIEVEMENTS } from "../../../lib/achievements";
import { useDropdownMenu } from "./useDropdownMenu";

const isBgUnlocked = (
  bg: BackgroundDef,
  unlockedIds: string[],
  freeBackgroundsMode: boolean
) =>
  freeBackgroundsMode ||
  !bg.requiresAchievementId ||
  unlockedIds.includes(bg.requiresAchievementId);

const getBgGroupRank = (
  bg: BackgroundDef,
  unlockedIds: string[],
  freeBackgroundsMode: boolean
) => {
  if (isBgUnlocked(bg, unlockedIds, freeBackgroundsMode)) return 0;
  const requiredAchievement = bg.requiresAchievementId
    ? ACHIEVEMENTS.find((a) => a.id === bg.requiresAchievementId)
    : undefined;
  return requiredAchievement?.hidden ? 2 : 1;
};

export const BackgroundDropdown = ({
  currentId,
  unlockedIds,
  isMobile,
  freeBackgroundsMode,
  isOpen,
  onOpenChange,
  onChange,
}: {
  currentId: BackgroundId;
  unlockedIds: string[];
  isMobile: boolean;
  freeBackgroundsMode: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (id: BackgroundId) => void;
}) => {
  const current = BACKGROUNDS.find((b) => b.id === currentId);
  const label = isMobile ? current?.mobileLabel : current?.desktopLabel;

  const { triggerRef, menuRef, menuStyle } = useDropdownMenu(isOpen, () =>
    onOpenChange(false)
  );

  return (
    <div ref={triggerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => onOpenChange(!isOpen)}
        className="flex items-center gap-1.5 font-pixel text-xs tracking-widest px-2.5 py-2"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "2px solid #3a3a4a",
          color: "#d4af37",
          cursor: "pointer",
          minWidth: 0,
        }}
      >
        {label}
        <ChevronDown className="w-3 h-3 shrink-0 text-gray-500" />
      </button>
      {isOpen &&
        menuStyle &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-100"
            style={{
              ...menuStyle,
              background: "#0d1322",
              border: "2px solid #3a3a4a",
              whiteSpace: "nowrap",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {BACKGROUNDS.toSorted(
              (a, b) =>
                getBgGroupRank(a, unlockedIds, freeBackgroundsMode) -
                getBgGroupRank(b, unlockedIds, freeBackgroundsMode)
            ).map((bg) => {
              const unlocked = isBgUnlocked(
                bg,
                unlockedIds,
                freeBackgroundsMode
              );
              const requiredAchievement = bg.requiresAchievementId
                ? ACHIEVEMENTS.find((a) => a.id === bg.requiresAchievementId)
                : undefined;
              const isHiddenLock =
                !unlocked && (requiredAchievement?.hidden ?? false);
              const bgLabel = isHiddenLock
                ? "???"
                : isMobile
                  ? bg.mobileLabel
                  : bg.desktopLabel;
              const isSelected = bg.id === currentId;

              return (
                <button
                  type="button"
                  key={bg.id}
                  onClick={() => {
                    if (!unlocked) return;
                    onChange(bg.id);
                    onOpenChange(false);
                  }}
                  className="dropdown-option w-full text-left font-pixel text-xs tracking-widest px-3 py-2 flex items-center gap-2"
                  aria-disabled={!unlocked}
                  style={{
                    color: !unlocked
                      ? "#374151"
                      : isSelected
                        ? "#d4af37"
                        : "#9ca3af",
                    textDecoration: !unlocked ? "line-through" : "none",
                    cursor: unlocked ? "pointer" : "default",
                    ...(isSelected &&
                      unlocked && { background: "rgba(80,0,170,0.2)" }),
                  }}
                >
                  {!unlocked && (
                    <Lock className="w-2.5 h-2.5 shrink-0 text-gray-700" />
                  )}
                  {bgLabel}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};
