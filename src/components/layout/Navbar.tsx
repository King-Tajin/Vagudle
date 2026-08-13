import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import { m, AnimatePresence } from "framer-motion";
import { CalendarDays } from "lucide-react";
import {
  ChartBarIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { openExternalLink } from "../../lib/discord";
import type { GameMode } from "../../lib/gameMode";
import MudskipperIcon from "@/assets/icons/mudskipper.svg?react";

const SETTINGS_NUDGE_KEY = "vagudle-settings-nudge-dismissed";

type Props = {
  setIsInfoModalOpen: (value: boolean) => void;
  setIsStatsModalOpen: (value: boolean) => void;
  setIsSettingsModalOpen: (value: boolean) => void;
  handleNewGame: () => void;
  hasActiveGame: boolean;
  gameMode?: GameMode;
  isInfoModalOpen: boolean;
  isActivityMode?: boolean;
  onOpenDaily?: () => void;
};

export const Navbar = ({
  setIsInfoModalOpen,
  setIsStatsModalOpen,
  setIsSettingsModalOpen,
  handleNewGame,
  hasActiveGame,
  gameMode = "normal",
  isInfoModalOpen,
  isActivityMode = false,
  onOpenDaily,
}: Props) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const settingsRef = useRef<HTMLButtonElement>(null);
  const prevInfoModalOpen = useRef(false);
  const headerWrapperRef = useRef<HTMLDivElement>(null);
  const navbarContentRef = useRef<HTMLDivElement>(null);
  const brandTitleRef = useRef<HTMLHeadingElement>(null);
  const brandSubtitleRef = useRef<HTMLParagraphElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  const measureNavbar = useCallback(() => {
    const content = navbarContentRef.current;
    const brand = brandRef.current;
    const title = brandTitleRef.current;
    const subtitle = brandSubtitleRef.current;
    if (!content || !brand || !title) return;

    const MAX_TITLE_REM = 1.25;
    const MIN_TITLE_REM = 0.75;
    const STEP_REM = 0.01;
    const SUBTITLE_RATIO = 0.55;
    const MIN_SUBTITLE_REM = 0.1;

    let size = MAX_TITLE_REM;
    title.style.fontSize = `${size}rem`;
    if (subtitle) {
      subtitle.style.fontSize = `${Math.max(size * SUBTITLE_RATIO, MIN_SUBTITLE_REM)}rem`;
    }

    while (brand.scrollWidth > brand.clientWidth && size > MIN_TITLE_REM) {
      size = Math.max(size - STEP_REM, MIN_TITLE_REM);
      title.style.fontSize = `${size}rem`;
      if (subtitle) {
        subtitle.style.fontSize = `${Math.max(size * SUBTITLE_RATIO, MIN_SUBTITLE_REM)}rem`;
      }
    }
  }, []);
  useLayoutEffect(() => {
    measureNavbar();
  }, [measureNavbar, isActivityMode, gameMode, hasActiveGame, onOpenDaily]);

  useLayoutEffect(() => {
    const wrapper = headerWrapperRef.current;
    const content = navbarContentRef.current;
    if (!wrapper || !content) return;

    let cancelled = false;
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready
        .then(() => {
          if (!cancelled) measureNavbar();
        })
        .catch(() => {
          if (!cancelled) measureNavbar();
        });
    }

    const ro = new ResizeObserver(measureNavbar);
    ro.observe(wrapper);

    const mo = new MutationObserver(measureNavbar);
    mo.observe(content, { childList: true, subtree: true });

    return () => {
      cancelled = true;
      ro.disconnect();
      mo.disconnect();
    };
  }, [measureNavbar]);

  useEffect(() => {
    const dismissed = localStorage.getItem(SETTINGS_NUDGE_KEY);
    if (dismissed) return;
    if (prevInfoModalOpen.current && !isInfoModalOpen) {
      const t = setTimeout(() => setShowNudge(true), 1200);
      prevInfoModalOpen.current = false;
      return () => clearTimeout(t);
    }
    prevInfoModalOpen.current = isInfoModalOpen;
  }, [isInfoModalOpen]);

  const dismissNudge = () => {
    setShowNudge(false);
    localStorage.setItem(SETTINGS_NUDGE_KEY, "1");
  };

  const onSettingsClick = () => {
    dismissNudge();
    setIsSettingsModalOpen(true);
  };

  const onNewGameClick = () => {
    if (gameMode !== "normal" || hasActiveGame) {
      setShowConfirm(true);
    } else {
      handleNewGame();
    }
  };

  const onConfirm = () => {
    setShowConfirm(false);
    handleNewGame();
  };

  const leaveLabel =
    gameMode === "duel"
      ? "Leave Duel"
      : gameMode === "challenge"
        ? "Leave Challenge"
        : gameMode === "daily"
          ? "Leave Daily"
          : "New Game";

  return (
    <div className="navbar">
      <header className="sticky top-0 z-50 bg-obsidian-900/95 backdrop-blur-sm border-b-4 border-crown-gold">
        <div ref={headerWrapperRef} className="max-w-7xl mx-auto px-3 sm:px-5">
          <div ref={navbarContentRef} className="navbar-content">
            <m.button
              onClick={() => setIsInfoModalOpen(true)}
              className="shrink-0 p-1.5 sm:p-2 hover:bg-obsidian-700 rounded transition-colors min-h-9 min-w-9 sm:min-h-11 sm:min-w-11 flex items-center justify-center border-2 border-obsidian-600/50 hover:border-crown-gold/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="How to play"
            >
              <InformationCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-crown-gold" />
            </m.button>

            {isActivityMode ? (
              <m.button
                type="button"
                onClick={() =>
                  openExternalLink(
                    "https://King-Tajin.dev/yellow-skipper-games"
                  )
                }
                className="flex items-center gap-1.5 sm:gap-3 select-none min-w-0"
                whileHover={{ scale: 1.02 }}
              >
                <MudskipperIcon
                  className="h-12 w-12 sm:h-16 sm:w-16 shrink-0"
                  aria-hidden="true"
                />
                <div ref={brandRef} className="min-w-0">
                  <h1
                    ref={brandTitleRef}
                    className="font-royal font-bold text-crown-gold crown-glow tracking-wider whitespace-nowrap"
                  >
                    Yellow Skipper
                  </h1>
                  <p
                    ref={brandSubtitleRef}
                    className="font-pixel text-crown-amber -mt-1 whitespace-nowrap text-center"
                  >
                    Games
                  </p>
                </div>
              </m.button>
            ) : (
              <m.a
                href="https://King-Tajin.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 sm:gap-3 select-none min-w-0"
                whileHover={{ scale: 1.02 }}
              >
                <MudskipperIcon
                  className="h-12 w-12 sm:h-16 sm:w-16 shrink-0"
                  aria-hidden="true"
                />
                <div ref={brandRef} className="min-w-0">
                  <h1
                    ref={brandTitleRef}
                    className="font-royal font-bold text-crown-gold crown-glow tracking-wider whitespace-nowrap"
                  >
                    Yellow Skipper
                  </h1>
                  <p
                    ref={brandSubtitleRef}
                    className="font-pixel text-crown-amber -mt-1 whitespace-nowrap text-center"
                  >
                    Games
                  </p>
                </div>
              </m.a>
            )}

            <div className="right-icons">
              <m.button
                title={leaveLabel}
                onClick={onNewGameClick}
                className="shrink-0 p-1.5 sm:p-2 hover:bg-obsidian-700 rounded transition-colors min-h-9 min-w-9 sm:min-h-11 sm:min-w-11 flex items-center justify-center border-2 border-obsidian-600/50 hover:border-crown-gold/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95, rotate: 180 }}
                aria-label={leaveLabel}
              >
                <ArrowPathIcon className="h-5 w-5 sm:h-6 sm:w-6 text-crown-gold" />
              </m.button>

              {(gameMode === "normal" || gameMode === "daily") &&
                onOpenDaily && (
                  <m.button
                    onClick={onOpenDaily}
                    className={
                      gameMode === "daily"
                        ? "shrink-0 p-1.5 sm:p-2 rounded transition-colors min-h-9 min-w-9 sm:min-h-11 sm:min-w-11 flex items-center justify-center border-2"
                        : "shrink-0 p-1.5 sm:p-2 hover:bg-obsidian-700 rounded transition-colors min-h-9 min-w-9 sm:min-h-11 sm:min-w-11 flex items-center justify-center border-2 border-obsidian-600/50 hover:border-crown-gold/50"
                    }
                    style={
                      gameMode === "daily"
                        ? {
                            borderColor: "rgba(255,215,0,0.9)",
                            background: "rgba(255,215,0,0.12)",
                          }
                        : {}
                    }
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Daily word"
                    title="Daily"
                  >
                    <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 text-crown-gold" />
                  </m.button>
                )}

              <m.button
                onClick={() => setIsStatsModalOpen(true)}
                className="shrink-0 p-1.5 sm:p-2 hover:bg-obsidian-700 rounded transition-colors min-h-9 min-w-9 sm:min-h-11 sm:min-w-11 flex items-center justify-center border-2 border-obsidian-600/50 hover:border-crown-gold/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Statistics"
              >
                <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-crown-gold" />
              </m.button>

              <div className="relative shrink-0">
                <m.button
                  ref={settingsRef}
                  onClick={onSettingsClick}
                  className={
                    showNudge
                      ? "p-1.5 sm:p-2 rounded transition-colors min-h-9 min-w-9 sm:min-h-11 sm:min-w-11 flex items-center justify-center border-2"
                      : "p-1.5 sm:p-2 hover:bg-obsidian-700 rounded transition-colors min-h-9 min-w-9 sm:min-h-11 sm:min-w-11 flex items-center justify-center border-2 border-obsidian-600/50 hover:border-crown-gold/50"
                  }
                  style={
                    showNudge
                      ? {
                          borderColor: "rgba(255,215,0,0.9)",
                          background: "rgba(255,215,0,0.12)",
                          boxShadow: "0 0 12px rgba(255,215,0,0.5)",
                        }
                      : {}
                  }
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Settings"
                  animate={showNudge ? { scale: [1, 1.08, 1] } : {}}
                  transition={
                    showNudge
                      ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
                      : {}
                  }
                >
                  <Cog6ToothIcon className="h-5 w-5 sm:h-6 sm:w-6 text-crown-gold" />
                </m.button>

                <AnimatePresence>
                  {showNudge && (
                    <m.div
                      initial={{ opacity: 0, y: -6, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-52 z-50"
                      style={{
                        background: "#111",
                        border: "2px solid rgba(255,215,0,0.45)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.7)",
                      }}
                    >
                      <div
                        className="absolute -top-1.5 right-4 w-3 h-3 rotate-45"
                        style={{
                          background: "#111",
                          borderTop: "2px solid rgba(255,215,0,0.45)",
                          borderLeft: "2px solid rgba(255,215,0,0.45)",
                        }}
                      />
                      <div className="p-3">
                        <p className="font-pixel text-[9px] text-crown-amber tracking-widest mb-1">
                          FIRST TIME HERE?
                        </p>
                        <p className="font-code text-xs text-gray-300 leading-relaxed mb-3">
                          Check out Settings to customize word length, helpful
                          tools, and more.
                        </p>
                        <button
                          type="button"
                          onClick={dismissNudge}
                          className="w-full py-1.5 font-pixel text-[9px] tracking-widest transition-colors"
                          style={{
                            background: "rgba(255,215,0,0.07)",
                            border: "1px solid rgba(255,215,0,0.25)",
                            color: "#d4af37",
                          }}
                        >
                          DISMISS
                        </button>
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div className="h-1 pixel-stripe-accent" />
      </header>
      {showConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
        >
          <div
            className="mx-4 p-5 max-w-sm w-full"
            style={{
              background: "#111",
              border: "2px solid rgba(255,215,0,0.4)",
            }}
          >
            {gameMode === "duel" ? (
              <>
                <p className="font-pixel text-xs text-crown-amber tracking-widest mb-2">
                  LEAVE DUEL?
                </p>
                <p className="font-code text-sm text-gray-300 mb-5">
                  Your progress for this duel is saved for 24 hours. You can
                  return to this link any time.
                </p>
              </>
            ) : gameMode === "daily" ? (
              <>
                <p className="font-pixel text-xs text-crown-amber tracking-widest mb-2">
                  LEAVE DAILY?
                </p>
                <p className="font-code text-sm text-gray-300 mb-5">
                  Your progress on today's daily is saved. You still only get
                  one attempt, so come back and finish it before the reset.
                </p>
              </>
            ) : gameMode === "challenge" ? (
              <>
                <p className="font-pixel text-xs text-crown-amber tracking-widest mb-2">
                  LEAVE CHALLENGE?
                </p>
                <p className="font-code text-sm text-gray-300 mb-5">
                  Your progress for this challenge is saved. You can return to
                  this link any time.
                </p>
              </>
            ) : (
              <>
                <p className="font-pixel text-xs text-crown-amber tracking-widest mb-2">
                  ABANDON GAME?
                </p>
                <p className="font-code text-sm text-gray-300 mb-5">
                  This will count as a loss and reset your current streak.
                </p>
              </>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 py-2 font-pixel text-xs tracking-widest transition-colors"
                style={{
                  background: "rgba(220,50,50,0.15)",
                  border: "1px solid rgba(220,50,50,0.5)",
                  color: "#f87171",
                }}
              >
                {gameMode === "normal" ? "ABANDON" : "LEAVE"}
              </button>
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-2 font-pixel text-xs tracking-widest transition-colors"
                style={{
                  background: "rgba(255,215,0,0.08)",
                  border: "1px solid rgba(255,215,0,0.3)",
                  color: "#fbbf24",
                }}
              >
                KEEP PLAYING
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
