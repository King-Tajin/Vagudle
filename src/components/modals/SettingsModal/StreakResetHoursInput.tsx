import { SETTINGS_NOTIFICATIONS_STREAK_HOURS_SUFFIX } from "../../../constants/strings";
import {
  STREAK_WARNING_MIN_HOURS,
  STREAK_WARNING_MAX_HOURS,
} from "../../../constants/settings";

const clampStreakWarningHours = (n: number) =>
  Math.min(STREAK_WARNING_MAX_HOURS, Math.max(STREAK_WARNING_MIN_HOURS, n));

export const StreakResetHoursInput = ({
  value,
  disabled = false,
  onChange,
}: {
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) => {
  const atMin = value <= STREAK_WARNING_MIN_HOURS;
  const atMax = value >= STREAK_WARNING_MAX_HOURS;

  return (
    <div
      className="flex items-center gap-1.5"
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <button
        type="button"
        disabled={disabled || atMin}
        onClick={() => onChange(clampStreakWarningHours(value - 1))}
        aria-label="Decrease hours"
        className="w-7 h-7 font-pixel text-sm flex items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "2px solid #3a3a4a",
          color: disabled || atMin ? "#4b5563" : "#d4af37",
          cursor: disabled || atMin ? "not-allowed" : "pointer",
        }}
      >
        −
      </button>
      <span
        className="font-pixel text-xs tracking-widest px-3 py-1.5 text-center"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "2px solid #3a3a4a",
          color: "#d4af37",
          minWidth: "2.5rem",
        }}
      >
        {value}
      </span>
      <button
        type="button"
        disabled={disabled || atMax}
        onClick={() => onChange(clampStreakWarningHours(value + 1))}
        aria-label="Increase hours"
        className="w-7 h-7 font-pixel text-sm flex items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "2px solid #3a3a4a",
          color: disabled || atMax ? "#4b5563" : "#d4af37",
          cursor: disabled || atMax ? "not-allowed" : "pointer",
        }}
      >
        +
      </button>
      <span className="font-code text-xs text-gray-500">
        {SETTINGS_NOTIFICATIONS_STREAK_HOURS_SUFFIX}
      </span>
    </div>
  );
};
