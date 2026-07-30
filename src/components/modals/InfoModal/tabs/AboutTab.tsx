import { RotateCcw, Trash2 } from "lucide-react";
import HatIcon from "@/assets/icons/propeller-hat.svg?react";
import { ActivityLink } from "../../../ActivityLink";

type Props = {
  hasHiddenAttributions: boolean;
  onRestoreHiddenAttributions: () => void;
  onOpenResetModal: () => void;
};

export const AboutTab = ({
  hasHiddenAttributions,
  onRestoreHiddenAttributions,
  onOpenResetModal,
}: Props) => {
  return (
    <div className="space-y-4">
      <p className="font-code text-sm text-gray-400 leading-relaxed">
        Vagudle is a word-guessing game inspired by{" "}
        <ActivityLink
          href="https://hardle.org"
          className="text-crown-gold underline hover:text-crown-amber transition-colors"
        >
          Hardle
        </ActivityLink>
        , with extra tools to help you solve the puzzle and no pesky daily limit
        to get in your way.
      </p>

      <div className="border-t border-obsidian-700" />

      <p className="font-code text-sm text-gray-400 leading-relaxed">
        The{" "}
        <ActivityLink
          href="https://discord.gg/sU2XRxK8EB"
          className="text-crown-gold underline hover:text-crown-amber transition-colors"
        >
          Discord server
        </ActivityLink>{" "}
        has an exclusive Duel feature where you can challenge other members
        head-to-head and compete on a live leaderboard to see who can crack the
        word in the fewest guesses.
      </p>

      <div className="border-t border-obsidian-700" />

      <div className="flex gap-4 justify-center pt-1 pb-2">
        <img
          src="/favicon.svg"
          alt="Vagudle favicon"
          width={48}
          height={48}
          style={{
            width: "calc(50% - 8px)",
            height: "auto",
            aspectRatio: "1 / 1",
            imageRendering: "pixelated",
          }}
        />
        <img
          src="/icon.svg"
          alt="Vagudle icon"
          width={48}
          height={48}
          style={{
            width: "calc(50% - 8px)",
            height: "auto",
            aspectRatio: "1 / 1",
            imageRendering: "pixelated",
          }}
        />
      </div>

      <div className="flex justify-between gap-3">
        <button
          type="button"
          onClick={onOpenResetModal}
          title="Erases all saved progress, stats, achievements, and settings."
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 font-pixel text-[10px] tracking-widest transition-colors"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "2px solid rgba(255,255,255,0.12)",
            color: "#9ca3af",
          }}
        >
          <Trash2 className="w-3 h-3" />
          RESET ALL DATA
        </button>

        <button
          type="button"
          onClick={onRestoreHiddenAttributions}
          disabled={!hasHiddenAttributions}
          title="Hid a video background's attribution button? Bring it back here."
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 font-pixel text-[10px] tracking-widest transition-colors"
          style={{
            background: hasHiddenAttributions
              ? "rgba(255,255,255,0.04)"
              : "transparent",
            border: `2px solid ${
              hasHiddenAttributions
                ? "rgba(255,255,255,0.12)"
                : "rgba(255,255,255,0.05)"
            }`,
            color: hasHiddenAttributions ? "#9ca3af" : "#4b5563",
            cursor: hasHiddenAttributions ? "pointer" : "default",
          }}
        >
          <RotateCcw className="w-3 h-3" />
          {hasHiddenAttributions
            ? "RESTORE ATTRIBUTIONS"
            : "ATTRIBUTIONS VISIBLE"}
        </button>
      </div>

      <ActivityLink
        href="https://store.king-tajin.dev/"
        className="shiny-btn block w-full relative overflow-hidden"
      >
        <div className="shiny-btn-shimmer absolute inset-y-0" />
        <div className="relative z-10 flex flex-col items-center gap-2 py-5 px-4">
          <HatIcon className="shiny-btn-crown w-10 h-10 text-crown-gold" />
          <span
            className="font-pixel text-2xl tracking-widest crown-glow"
            style={{ color: "#FFD700" }}
          >
            VISIT THE STORE
          </span>
          <span
            className="font-code text-xs tracking-wide"
            style={{ color: "#FFBF00", opacity: 0.65 }}
          >
            store.king-tajin.dev →
          </span>
        </div>
      </ActivityLink>
    </div>
  );
};
