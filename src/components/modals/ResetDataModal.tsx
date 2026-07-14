import { useEffect, useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { BaseModal } from "./BaseModal";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
};

const COUNTDOWN_SECONDS = 20;

const DATA_CATEGORIES: { title: string; description: string }[] = [
  {
    title: "Current game",
    description: "Current in-progress word, guesses, and cell colors.",
  },
  {
    title: "Statistics",
    description:
      "Win streak, win distribution, and success rate, for both normal and hard mode.",
  },
  {
    title: "Achievements",
    description:
      "Every achievement you've unlocked and the progress toward them.",
  },
  {
    title: "Settings",
    description:
      "Word length, hard mode, gray count, auto-gray, auto-green, and extra sounds & animations.",
  },
  {
    title: "Background",
    description:
      "Your selected background theme and any hidden video attribution buttons.",
  },
  {
    title: "Challenge & Duel links",
    description:
      "Saved progress for any custom challenge or duel links you've opened.",
  },
];

export const ResetDataModal = ({ isOpen, handleClose }: Props) => {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) setSecondsLeft(COUNTDOWN_SECONDS);
  }

  useEffect(() => {
    if (!isOpen || secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [isOpen, secondsLeft]);

  const isLocked = secondsLeft > 0;

  const handleConfirm = () => {
    if (isLocked) return;
    localStorage.clear();
    window.location.reload();
  };

  return (
    <BaseModal title="Reset All Data" isOpen={isOpen} handleClose={handleClose}>
      <div className="space-y-4">
        <div
          className="flex items-start gap-2.5 p-3"
          style={{
            background: "rgba(196,30,58,0.1)",
            border: "1px solid rgba(196,30,58,0.4)",
          }}
        >
          <AlertTriangle className="w-4 h-4 text-tajin-red flex-shrink-0 mt-0.5" />
          <p className="font-code text-xs text-gray-300 leading-snug">
            This permanently erases everything Vagudle has saved in this
            browser. It cannot be undone.
          </p>
        </div>

        <div className="space-y-3">
          {DATA_CATEGORIES.map((category) => (
            <div key={category.title}>
              <p className="font-pixel text-[10px] text-crown-amber tracking-widest mb-0.5">
                {category.title.toUpperCase()}
              </p>
              <p className="font-code text-xs text-gray-500 leading-snug">
                {category.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleClose}
            className="flex-1 py-3 font-pixel text-xs tracking-widest transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "2px solid rgba(255,255,255,0.12)",
              color: "#9ca3af",
            }}
          >
            CANCEL
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLocked}
            className="flex-1 py-3 font-pixel text-xs tracking-widest flex items-center justify-center gap-2 transition-all"
            style={{
              background: isLocked
                ? "rgba(255,255,255,0.04)"
                : "linear-gradient(180deg, #dc3232 0%, #8c1f1f 100%)",
              border: `2px solid ${isLocked ? "#3a3a4a" : "#dc3232"}`,
              color: isLocked ? "#4b5563" : "#fff",
              cursor: isLocked ? "default" : "pointer",
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            {isLocked ? `WAIT ${secondsLeft}s` : "DELETE EVERYTHING"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};
