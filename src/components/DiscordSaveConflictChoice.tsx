import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  formatRelativeTime,
  type DiscordSaveChoice,
  type DiscordSaveConflict,
  type SaveSummary,
} from "../lib/cloudSync";
import strings from "../constants/strings";

type Props = {
  conflict: DiscordSaveConflict;
  busy: boolean;
  error: string | null;
  onConfirm: (keep: DiscordSaveChoice) => void;
  onCancel: () => void;
};

const PRIMARY_BUTTON_STYLE = {
  background: "linear-gradient(180deg, #d4af37 0%, #b8860b 100%)",
  border: "2px solid #d4af37",
  color: "#0a0014",
};

const SECONDARY_BUTTON_STYLE = {
  background: "transparent",
  border: "2px solid #d4af37",
  color: "#d4af37",
};

const SaveCard = ({
  heading,
  summary,
  selected,
  disabled,
  onSelect,
}: {
  heading: string;
  summary: SaveSummary | null;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    disabled={disabled}
    onClick={onSelect}
    className="w-full text-left p-3 border-2 transition-colors disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-crown-amber"
    style={{
      borderColor: selected ? "#d4af37" : "#3a3a4a",
      background: selected ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.05)",
    }}
  >
    <span className="block font-pixel text-[10px] tracking-widest text-crown-amber mb-2">
      {heading}
    </span>
    {summary ? (
      <span className="block font-code text-xs text-gray-300 leading-snug space-y-0.5">
        <span className="block">
          {strings.DISCORD_CONFLICT_GAMES_TEXT(summary.gamesPlayed)}
        </span>
        <span className="block">
          {strings.DISCORD_CONFLICT_STREAK_TEXT(summary.bestStreak)}
        </span>
        <span className="block">
          {strings.DISCORD_CONFLICT_ACHIEVEMENTS_TEXT(summary.achievements)}
        </span>
        {summary.lastPlayedAt && (
          <span className="block text-gray-500">
            {strings.DISCORD_CONFLICT_LAST_PLAYED_TEXT(
              formatRelativeTime(summary.lastPlayedAt)
            )}
          </span>
        )}
      </span>
    ) : (
      <span className="block font-code text-xs text-gray-500 leading-snug">
        {strings.DISCORD_CONFLICT_EMPTY_SAVE_TEXT}
      </span>
    )}
  </button>
);

export const DiscordSaveConflictChoice = ({
  conflict,
  busy,
  error,
  onConfirm,
  onCancel,
}: Props) => {
  const [selected, setSelected] = useState<DiscordSaveChoice | null>(null);

  return (
    <div className="space-y-4 text-left">
      <p className="font-code text-xs text-gray-400 leading-snug">
        {strings.DISCORD_CONFLICT_INTRO_TEXT}
      </p>
      <div
        role="radiogroup"
        aria-label={strings.DISCORD_CONFLICT_GROUP_ARIA_LABEL}
        className="flex flex-col gap-3"
      >
        <SaveCard
          heading={strings.DISCORD_CONFLICT_ACCOUNT_HEADING}
          summary={conflict.account}
          selected={selected === "account"}
          disabled={busy}
          onSelect={() => setSelected("account")}
        />
        <SaveCard
          heading={strings.DISCORD_CONFLICT_DISCORD_HEADING}
          summary={conflict.discord}
          selected={selected === "discord"}
          disabled={busy}
          onSelect={() => setSelected("discord")}
        />
      </div>
      {error && (
        <p
          role="alert"
          className="font-code text-xs text-spice-red leading-snug"
        >
          {error}
        </p>
      )}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => selected && onConfirm(selected)}
          disabled={!selected || busy}
          aria-busy={busy}
          className="w-full py-3 font-pixel text-xs tracking-widest flex items-center justify-center gap-2 transition-[filter] enabled:hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
          style={PRIMARY_BUTTON_STYLE}
        >
          {busy && <Loader2 className="w-3.5 h-3.5 shrink-0 animate-spin" />}
          {busy
            ? strings.DISCORD_CONFLICT_CONFIRMING_BUTTON_TEXT
            : strings.DISCORD_CONFLICT_CONFIRM_BUTTON_TEXT}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="w-full py-3 font-pixel text-xs tracking-widest transition-[filter] enabled:hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
          style={SECONDARY_BUTTON_STYLE}
        >
          {strings.DISCORD_CONFLICT_CANCEL_BUTTON_TEXT}
        </button>
      </div>
    </div>
  );
};
