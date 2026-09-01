import { CompactDropdown, type DropdownOption } from "./CompactDropdown";
import strings from "../../../constants/strings";

const HOUR_OPTIONS: DropdownOption[] = Array.from(
  { length: 12 },
  (_, i) => i + 1
).map((h) => ({ value: String(h), label: String(h).padStart(2, "0") }));

const MINUTE_OPTIONS: DropdownOption[] = Array.from(
  { length: 12 },
  (_, i) => i * 5
).map((m) => ({ value: String(m), label: String(m).padStart(2, "0") }));

const PERIOD_OPTIONS: DropdownOption[] = [
  { value: "AM", label: "AM" },
  { value: "PM", label: "PM" },
];

export const NotificationTimePicker = ({
  hour,
  minute,
  period,
  disabled = false,
  onHourChange,
  onMinuteChange,
  onPeriodChange,
}: {
  hour: number;
  minute: number;
  period: "AM" | "PM";
  disabled?: boolean;
  onHourChange: (value: number) => void;
  onMinuteChange: (value: number) => void;
  onPeriodChange: (value: "AM" | "PM") => void;
}) => {
  return (
    <div
      className="flex items-center gap-1.5"
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <CompactDropdown
        value={String(hour)}
        options={HOUR_OPTIONS}
        disabled={disabled}
        onChange={(v) => onHourChange(Number(v))}
        ariaLabel={strings.SETTINGS_NOTIFICATIONS_REMINDER_HOUR_ARIA_LABEL}
      />
      <span className="font-pixel text-xs text-gray-500">:</span>
      <CompactDropdown
        value={String(minute)}
        options={MINUTE_OPTIONS}
        disabled={disabled}
        onChange={(v) => onMinuteChange(Number(v))}
        ariaLabel={strings.SETTINGS_NOTIFICATIONS_REMINDER_MINUTE_ARIA_LABEL}
      />
      <CompactDropdown
        value={period}
        options={PERIOD_OPTIONS}
        disabled={disabled}
        onChange={(v) => onPeriodChange(v as "AM" | "PM")}
        ariaLabel={strings.SETTINGS_NOTIFICATIONS_REMINDER_PERIOD_ARIA_LABEL}
      />
    </div>
  );
};
