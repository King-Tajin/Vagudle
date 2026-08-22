import { SETTINGS_NOTIFICATIONS_INACTIVITY_DAYS_SUFFIX } from "../../../constants/strings";
import {
  INACTIVITY_NUDGE_MIN_DAYS,
  INACTIVITY_NUDGE_MAX_DAYS,
} from "../../../constants/settings";

const clampInactivityDays = (n: number) =>
  Math.min(INACTIVITY_NUDGE_MAX_DAYS, Math.max(INACTIVITY_NUDGE_MIN_DAYS, n));

export const InactivityDaysInput = ({
  value,
  disabled = false,
  onChange,
}: {
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) => {
  const atMin = value <= INACTIVITY_NUDGE_MIN_DAYS;
  const atMax = value >= INACTIVITY_NUDGE_MAX_DAYS;

  return (
    <div
      className="flex items-center gap-1.5"
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <button
        type="button"
        disabled={disabled || atMin}
        onClick={() => onChange(clampInactivityDays(value - 1))}
        aria-label="Decrease days"
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
        onClick={() => onChange(clampInactivityDays(value + 1))}
        aria-label="Increase days"
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
        {SETTINGS_NOTIFICATIONS_INACTIVITY_DAYS_SUFFIX}
      </span>
    </div>
  );
};
