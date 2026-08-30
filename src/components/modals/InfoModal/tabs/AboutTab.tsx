import { RotateCcw, Trash2 } from "lucide-react";
import HatIcon from "@/assets/icons/propeller-hat.svg?react";
import { ActivityLink } from "../../../ActivityLink";
import {
  ABOUT_INTRO_TEXT_BEFORE_LINK,
  ABOUT_INTRO_LINK_TEXT,
  ABOUT_INTRO_TEXT_AFTER_LINK,
  ABOUT_DISCORD_TEXT_BEFORE_LINK,
  ABOUT_DISCORD_LINK_TEXT,
  ABOUT_DISCORD_TEXT_AFTER_LINK,
  ABOUT_FAVICON_ALT,
  ABOUT_ICON_ALT,
  ABOUT_RESET_BUTTON_TITLE,
  ABOUT_RESET_BUTTON_TEXT,
  ABOUT_RESTORE_ATTRIBUTIONS_TITLE,
  ABOUT_RESTORE_ATTRIBUTIONS_TEXT,
  ABOUT_ATTRIBUTIONS_VISIBLE_TEXT,
  ABOUT_STORE_BUTTON_TEXT,
  ABOUT_STORE_URL_DISPLAY_TEXT,
} from "../../../../constants/strings";

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
        {ABOUT_INTRO_TEXT_BEFORE_LINK}{" "}
        <ActivityLink
          href="https://hardle.org"
          className="text-crown-gold underline hover:text-crown-amber transition-colors"
        >
          {ABOUT_INTRO_LINK_TEXT}
        </ActivityLink>
        {ABOUT_INTRO_TEXT_AFTER_LINK}
      </p>

      <div className="border-t border-obsidian-700" />

      <p className="font-code text-sm text-gray-400 leading-relaxed">
        {ABOUT_DISCORD_TEXT_BEFORE_LINK}{" "}
        <ActivityLink
          href="https://discord.gg/sU2XRxK8EB"
          className="text-crown-gold underline hover:text-crown-amber transition-colors"
        >
          {ABOUT_DISCORD_LINK_TEXT}
        </ActivityLink>{" "}
        {ABOUT_DISCORD_TEXT_AFTER_LINK}
      </p>

      <div className="border-t border-obsidian-700" />

      <div className="flex gap-4 justify-center pt-1 pb-2">
        <img
          src="/favicon.svg"
          alt={ABOUT_FAVICON_ALT}
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
          alt={ABOUT_ICON_ALT}
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
          title={ABOUT_RESET_BUTTON_TITLE}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 font-pixel text-[10px] tracking-widest transition-colors"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "2px solid rgba(255,255,255,0.12)",
            color: "#9ca3af",
          }}
        >
          <Trash2 className="w-3 h-3" />
          {ABOUT_RESET_BUTTON_TEXT}
        </button>

        <button
          type="button"
          onClick={onRestoreHiddenAttributions}
          disabled={!hasHiddenAttributions}
          title={ABOUT_RESTORE_ATTRIBUTIONS_TITLE}
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
            ? ABOUT_RESTORE_ATTRIBUTIONS_TEXT
            : ABOUT_ATTRIBUTIONS_VISIBLE_TEXT}
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
            {ABOUT_STORE_BUTTON_TEXT}
          </span>
          <span
            className="font-code text-xs tracking-wide"
            style={{ color: "#FFBF00", opacity: 0.65 }}
          >
            {ABOUT_STORE_URL_DISPLAY_TEXT}
          </span>
        </div>
      </ActivityLink>
    </div>
  );
};
