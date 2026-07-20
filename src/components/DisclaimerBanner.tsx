import { useState, useEffect } from "react";
import { m, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const DISMISSED_KEY = "king-tajin-disclaimer-dismissed";

export const DisclaimerBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed) setIsVisible(true);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, "true");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <m.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-100 px-4 py-4 sm:py-3"
          style={{
            background: "rgba(10,10,10,0.97)",
            borderTop: "2px solid rgba(255,215,0,0.35)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
          role="dialog"
          aria-label="Affiliation disclaimer"
        >
          <div className="mx-auto max-w-3xl flex items-center gap-4 flex-wrap sm:flex-nowrap">
            <p className="font-code text-xs sm:text-sm text-gray-400 leading-relaxed flex-1 min-w-50">
              <span className="text-crown-gold font-pixel text-[16px] tracking-widest mr-2 align-middle">
                DISCLAIMER
              </span>
              "King-Tajin" is just the developer's personal gamertag and a nod
              to being a fan of the Tajín brand. This site and its creator are{" "}
              <span className="text-gray-200">
                not affiliated with, sponsored by, or endorsed by Industrias
                Tajín, S.A. de C.V.
              </span>
            </p>
            <button
              type="button"
              onClick={handleDismiss}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 font-pixel text-[10px] tracking-widest transition-colors border-2"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderColor: "rgba(255,215,0,0.35)",
                color: "#FFD700",
              }}
              aria-label="Dismiss disclaimer"
            >
              GOT IT
              <X className="w-3 h-3" />
            </button>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
};
