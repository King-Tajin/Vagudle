import { motion } from "framer-motion";
import { Navbar } from "../Navbar";

export const emptyNavbar = (isActivityMode = false) => (
  <Navbar
    setIsInfoModalOpen={() => {}}
    setIsStatsModalOpen={() => {}}
    setIsSettingsModalOpen={() => {}}
    handleNewGame={() => {}}
    hasActiveGame={false}
    isInfoModalOpen={false}
    isActivityMode={isActivityMode}
  />
);

export const title = (
  <motion.p
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="font-pixel text-center text-4xl text-crown-gold crown-glow tracking-widest"
  >
    VAGUDLE
  </motion.p>
);

export const returnButton = (onClick: () => void) => (
  <button
    type="button"
    onClick={onClick}
    className="font-pixel text-xs tracking-widest px-4 py-2 transition-all"
    style={{
      background: "rgba(255,215,0,0.08)",
      border: "1px solid rgba(255,215,0,0.3)",
      color: "#d4af37",
    }}
  >
    PLAY NORMAL VAGUDLE
  </button>
);

export const retryButton = () => (
  <button
    type="button"
    onClick={() => window.location.reload()}
    className="font-pixel text-xs tracking-widest px-4 py-2 transition-all"
    style={{
      background: "rgba(255,215,0,0.08)",
      border: "1px solid rgba(255,215,0,0.3)",
      color: "#d4af37",
    }}
  >
    TRY AGAIN
  </button>
);
