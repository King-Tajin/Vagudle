import { SETTINGS_NOTIFICATIONS_INACTIVITY_DAYS_SUFFIX } from "../../../constants/strings";
import { SETTINGS_NOTIFICATIONS_STREAK_HOURS_SUFFIX } from "../../../constants/strings";
import {
  INACTIVITY_NUDGE_MIN_DAYS,
  INACTIVITY_NUDGE_MAX_DAYS,
} from "../../../constants/settings";
import {
  STREAK_WARNING_MIN_HOURS,
  STREAK_WARNING_MAX_HOURS,
} from "../../../constants/settings";

const NumberStepperInput = ({
  value,
  min,
  max,
  suffix,
  decreaseLabel,
  increaseLabel,
  disabled = false,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  suffix: string;
  decreaseLabel: string;
  increaseLabel: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}) => {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <div
      className="flex items-center gap-1.5"
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <button
        type="button"
        disabled={disabled || atMin}
        onClick={() => onChange(clamp(value - 1))}
        aria-label={decreaseLabel}
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
        onClick={() => onChange(clamp(value + 1))}
        aria-label={increaseLabel}
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
      <span className="font-code text-xs text-gray-500">{suffix}</span>
    </div>
  );
};

export const InactivityDaysInput = ({
  value,
  disabled = false,
  onChange,
}: {
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) => (
  <NumberStepperInput
    value={value}
    min={INACTIVITY_NUDGE_MIN_DAYS}
    max={INACTIVITY_NUDGE_MAX_DAYS}
    suffix={SETTINGS_NOTIFICATIONS_INACTIVITY_DAYS_SUFFIX}
    decreaseLabel="Decrease days"
    increaseLabel="Increase days"
    disabled={disabled}
    onChange={onChange}
  />
);

export const StreakResetHoursInput = ({
  value,
  disabled = false,
  onChange,
}: {
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) => (
  <NumberStepperInput
    value={value}
    min={STREAK_WARNING_MIN_HOURS}
    max={STREAK_WARNING_MAX_HOURS}
    suffix={SETTINGS_NOTIFICATIONS_STREAK_HOURS_SUFFIX}
    decreaseLabel="Decrease hours"
    increaseLabel="Increase hours"
    disabled={disabled}
    onChange={onChange}
  />
);
