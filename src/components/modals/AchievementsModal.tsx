import { useLayoutEffect, useRef, useState } from "react";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Lock,
  SquareCheckBig,
} from "lucide-react";
import { BaseModal } from "./BaseModal";
import { ACHIEVEMENTS, Achievement } from "../../lib/achievements";
import { BACKGROUNDS } from "../../lib/backgrounds";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  unlockedIds: string[];
  totalWins: number;
  uniqueWordCount: number;
  currentWinStreak: number;
};

const PROGRESS_CONFIG: Record<
  string,
  { target: number; getValue: (props: Props) => number }
> = {
  win_15: { target: 15, getValue: (p) => p.totalWins },
  win_50: { target: 50, getValue: (p) => p.totalWins },
  word_connoisseur: { target: 200, getValue: (p) => p.uniqueWordCount },
  on_a_roll: { target: 5, getValue: (p) => p.currentWinStreak },
  unstoppable: { target: 15, getValue: (p) => p.currentWinStreak },
};

const bgUnlockedBy = (achievementId: string) =>
  BACKGROUNDS.find((b) => b.requiresAchievementId === achievementId);

const HeaderProgressRing = ({
  unlocked,
  total,
}: {
  unlocked: number;
  total: number;
}) => {
  const size = 38;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? unlocked / total : 0;
  const offset = circumference * (1 - pct);

  return (
    <div
      className="relative flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#achievement-ring-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
        <defs>
          <linearGradient
            id="achievement-ring-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#b8860b" />
            <stop offset="100%" stopColor="#ffd700" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute font-pixel text-[9px] leading-none text-crown-amber tracking-tighter">
        {unlocked}/{total}
      </span>
    </div>
  );
};

const ROW_GAP_PX = 12;
const OUTER_CHROME_PX = 56;
const SAFETY_BUFFER_PX = 12;
const SETTLE_RECHECK_DELAY_MS = 320;

const AchievementRow = ({
  a,
  ctx,
  innerRef,
}: {
  a: Achievement;
  ctx: Props;
  innerRef?: (el: HTMLDivElement | null) => void;
}) => {
  const { unlockedIds } = ctx;
  const isUnlocked = unlockedIds.includes(a.id);
  const isHiddenLocked = !isUnlocked && a.hidden;
  const bg = bgUnlockedBy(a.id);
  const cfg = PROGRESS_CONFIG[a.id];
  const showProgress = cfg !== undefined && !isUnlocked;
  const progress = cfg ? Math.min(cfg.getValue(ctx), cfg.target) : 0;
  const pct = cfg ? Math.round((progress / cfg.target) * 100) : 0;

  return (
    <div
      ref={innerRef}
      className="flex items-start gap-3.5 p-3.5"
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
          <SquareCheckBig className="w-7 h-7 text-tajin-lime" />
        ) : (
          <Lock className="w-5 h-5 text-gray-600" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="font-pixel text-sm tracking-widest leading-tight mb-1.5"
          style={{
            color: isUnlocked ? "#fff" : "#6b7280",
            textDecoration: !isUnlocked && !a.hidden ? "line-through" : "none",
          }}
        >
          {isHiddenLocked ? "???" : a.title}
        </p>
        <p className="font-code text-[13px] text-gray-500 leading-snug">
          {isHiddenLocked ? "???" : a.description}
        </p>

        {showProgress && (
          <div className="mt-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="font-pixel text-[10px] text-gray-500 tracking-widest">
                PROGRESS
              </span>
              <span
                className="font-pixel text-[10px] tracking-widest"
                style={{ color: "#d4af37" }}
              >
                {progress}/{cfg.target}
              </span>
            </div>
            <div
              className="w-full h-2.5 overflow-hidden"
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
            className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1"
            style={{
              background: "rgba(255,215,0,0.06)",
              border: "1px solid rgba(255,215,0,0.2)",
            }}
          >
            <Award className="w-3.5 h-3.5 text-crown-amber flex-shrink-0" />
            <span className="font-pixel text-[10px] text-crown-amber tracking-widest">
              {isHiddenLocked ? "UNLOCKS: ???" : `UNLOCKS: ${bg.desktopLabel}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const AchievementsModal = (props: Props) => {
  const { isOpen, handleClose } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const measureWrapRef = useRef<HTMLDivElement>(null);
  const measureHostRef = useRef<HTMLDivElement>(null);
  const paginationRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<Achievement[][]>([ACHIEVEMENTS]);
  const [pageIndex, setPageIndex] = useState(0);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) setPageIndex(0);
  }

  useLayoutEffect(() => {
    if (!isOpen) return;

    const recompute = () => {
      const hostEls = measureHostRef.current?.children;
      if (!hostEls || hostEls.length !== ACHIEVEMENTS.length) return;
      if ((measureWrapRef.current?.getBoundingClientRect().width ?? 0) === 0)
        return;

      const heights = Array.from(hostEls).map(
        (el) => el.getBoundingClientRect().height
      );

      const top = containerRef.current?.getBoundingClientRect().top ?? 0;
      const paginationHeight =
        paginationRef.current?.getBoundingClientRect().height ?? 56;
      const available =
        window.innerHeight -
        top -
        paginationHeight -
        OUTER_CHROME_PX -
        SAFETY_BUFFER_PX;

      const newPages: Achievement[][] = [];
      let current: Achievement[] = [];
      let currentHeight = 0;

      ACHIEVEMENTS.forEach((a, i) => {
        const h = heights[i];
        const addition = h + (current.length > 0 ? ROW_GAP_PX : 0);
        if (currentHeight + addition > available && current.length > 0) {
          newPages.push(current);
          current = [];
          currentHeight = 0;
        }
        current.push(a);
        currentHeight += h + (current.length > 1 ? ROW_GAP_PX : 0);
      });
      if (current.length > 0) newPages.push(current);

      setPages(newPages.length > 0 ? newPages : [ACHIEVEMENTS]);
    };

    recompute();

    const settleTimer = window.setTimeout(recompute, SETTLE_RECHECK_DELAY_MS);
    const fontCheck =
      "fonts" in document ? document.fonts.ready.then(recompute) : null;

    const resizeObserver = new ResizeObserver(recompute);
    if (measureWrapRef.current) resizeObserver.observe(measureWrapRef.current);

    window.addEventListener("resize", recompute);

    return () => {
      window.clearTimeout(settleTimer);
      resizeObserver.disconnect();
      window.removeEventListener("resize", recompute);
      void fontCheck;
    };
  }, [isOpen]);

  const safePageIndex = pageIndex > pages.length - 1 ? 0 : pageIndex;
  const currentPage = pages[safePageIndex] ?? ACHIEVEMENTS;
  const canPrev = safePageIndex > 0;
  const canNext = safePageIndex < pages.length - 1;

  return (
    <BaseModal
      title="Achievements"
      isOpen={isOpen}
      handleClose={handleClose}
      maxWidthClass="sm:max-w-md"
      headerExtra={
        <HeaderProgressRing
          unlocked={
            ACHIEVEMENTS.filter((a) => props.unlockedIds.includes(a.id)).length
          }
          total={ACHIEVEMENTS.length}
        />
      }
    >
      <div ref={measureWrapRef} style={{ position: "relative" }}>
        <div
          ref={measureHostRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            visibility: "hidden",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          {ACHIEVEMENTS.map((a) => (
            <div key={a.id} className="mb-3">
              <AchievementRow a={a} ctx={props} />
            </div>
          ))}
        </div>
      </div>
      <div ref={containerRef} className="space-y-3">
        {currentPage.map((a) => (
          <AchievementRow key={a.id} a={a} ctx={props} />
        ))}
      </div>
      <div
        ref={paginationRef}
        className="flex items-center justify-between mt-4 pt-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <button
          type="button"
          onClick={() => canPrev && setPageIndex((i) => i - 1)}
          disabled={!canPrev}
          className="p-2 bg-obsidian-700 hover:bg-obsidian-600 disabled:opacity-30 disabled:hover:bg-obsidian-700 text-gray-300 transition-colors pixel-border-sm"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="font-pixel text-xs text-gray-400 tracking-widest">
          PAGE {safePageIndex + 1}/{pages.length}
        </span>

        <button
          type="button"
          onClick={() => canNext && setPageIndex((i) => i + 1)}
          disabled={!canNext}
          className="p-2 bg-obsidian-700 hover:bg-obsidian-600 disabled:opacity-30 disabled:hover:bg-obsidian-700 text-gray-300 transition-colors pixel-border-sm"
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </BaseModal>
  );
};
