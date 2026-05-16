import { useState } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import {
  ChartBarIcon,
  CogIcon,
  InformationCircleIcon,
  RefreshIcon,
} from "@heroicons/react/outline";
import KingTajinIcon from "@/assets/icons/king-tajin.svg?react";

type Props = {
  setIsInfoModalOpen: (value: boolean) => void;
  setIsStatsModalOpen: (value: boolean) => void;
  setIsSettingsModalOpen: (value: boolean) => void;
  handleNewGame: () => void;
  hasActiveGame: boolean;
  isChallengeMode?: boolean;
};

export const Navbar = ({
  setIsInfoModalOpen,
  setIsStatsModalOpen,
  setIsSettingsModalOpen,
  handleNewGame,
  hasActiveGame,
  isChallengeMode = false,
}: Props) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const onNewGameClick = () => {
    if (hasActiveGame || (isChallengeMode && hasActiveGame)) {
      setShowConfirm(true);
    } else {
      handleNewGame();
    }
  };

  const onConfirm = () => {
    setShowConfirm(false);
    handleNewGame();
  };

  return (
    <div className="navbar">
      <header className="sticky top-0 z-50 bg-obsidian-900/95 backdrop-blur-sm border-b-4 border-crown-gold">
        <div className="max-w-7xl mx-auto px-5">
          <div className="navbar-content">
            <motion.button
              onClick={() => setIsInfoModalOpen(true)}
              className="p-2 hover:bg-obsidian-700 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border-2 border-obsidian-600/50 hover:border-crown-gold/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="How to play"
            >
              <InformationCircleIcon className="h-6 w-6 text-crown-gold" />
            </motion.button>

            <motion.a
              href="https://King-Tajin.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 select-none"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-obsidian-700 border-2 border-crown-gold flex items-center justify-center">
                  <KingTajinIcon className="w-6 h-6 text-crown-gold float-animation" />
                </div>
                <Flame className="absolute -top-1 -right-1 w-4 h-4 text-tajin-red" />
              </div>
              <div>
                <h1 className="font-royal text-xl font-bold text-crown-gold crown-glow tracking-wider">
                  King-Tajin
                </h1>
                <p className="font-pixel text-xs text-crown-amber -mt-1">
                  WEB GAMES
                </p>
              </div>
            </motion.a>

            <div className="right-icons">
              <motion.button
                title={isChallengeMode ? "Leave Challenge" : "New Game"}
                onClick={onNewGameClick}
                className="p-2 hover:bg-obsidian-700 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border-2 border-obsidian-600/50 hover:border-crown-gold/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95, rotate: 180 }}
                aria-label={isChallengeMode ? "Leave Challenge" : "New Game"}
              >
                <RefreshIcon className="h-6 w-6 text-crown-gold" />
              </motion.button>

              <motion.button
                onClick={() => setIsStatsModalOpen(true)}
                className="p-2 hover:bg-obsidian-700 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border-2 border-obsidian-600/50 hover:border-crown-gold/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Statistics"
              >
                <ChartBarIcon className="h-6 w-6 text-crown-gold" />
              </motion.button>

              <motion.button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-2 hover:bg-obsidian-700 rounded transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border-2 border-obsidian-600/50 hover:border-crown-gold/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Settings"
              >
                <CogIcon className="h-6 w-6 text-crown-gold" />
              </motion.button>
            </div>
          </div>
        </div>

        <div className="h-1 tajin-accent" />
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
            {isChallengeMode ? (
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
                onClick={onConfirm}
                className="flex-1 py-2 font-pixel text-xs tracking-widest transition-colors"
                style={{
                  background: "rgba(220,50,50,0.15)",
                  border: "1px solid rgba(220,50,50,0.5)",
                  color: "#f87171",
                }}
              >
                {isChallengeMode ? "LEAVE" : "ABANDON"}
              </button>
              <button
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
