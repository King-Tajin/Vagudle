import { CalendarClock } from "lucide-react";
import { BaseModal } from "./BaseModal";
import {
  DAILY_SCHEDULE,
  WEEKDAY_NAMES,
  getLocalDailyUnlockTime,
  getCurrentDailyWeekday,
} from "../../lib/daily";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
};

export const DailyScheduleModal = ({ isOpen, handleClose }: Props) => {
  const today = getCurrentDailyWeekday();
  const localUnlockTime = getLocalDailyUnlockTime();

  return (
    <BaseModal
      title="Daily Schedule"
      isOpen={isOpen}
      handleClose={handleClose}
      maxWidthClass="sm:max-w-sm"
      zIndexClass="z-80"
    >
      <div className="space-y-4">
        <div
          className="flex items-center gap-3 p-3"
          style={{
            background: "rgba(212,175,55,0.08)",
            border: "1px solid rgba(212,175,55,0.35)",
          }}
        >
          <CalendarClock className="w-4 h-4 text-crown-amber shrink-0" />
          <p className="font-code text-sm text-gray-200 leading-snug">
            New daily unlocks at{" "}
            <span className="text-crown-amber">{localUnlockTime}</span> your
            time
          </p>
        </div>

        <div className="space-y-1.5">
          {DAILY_SCHEDULE.map((entry, i) => (
            <div
              key={WEEKDAY_NAMES[i]}
              className="flex items-center justify-between gap-3 px-3 py-2.5"
              style={{
                background:
                  i === today
                    ? "rgba(80,0,170,0.18)"
                    : "rgba(255,255,255,0.02)",
                border: `1px solid ${
                  i === today ? "rgba(80,0,170,0.5)" : "rgba(255,255,255,0.06)"
                }`,
              }}
            >
              <span className="font-code text-sm text-gray-200">
                {WEEKDAY_NAMES[i]}
                {i === today && (
                  <span className="ml-2 font-pixel text-[8px] text-crown-amber tracking-widest">
                    TODAY
                  </span>
                )}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-code text-sm text-gray-300">
                  {entry.wordLength} letters
                </span>
                <span
                  className="flex items-center gap-1 font-pixel text-[9px] tracking-widest px-2 py-1"
                  style={{
                    color: entry.hardMode ? "#ef4444" : "#9ca3af",
                    border: `1px solid ${
                      entry.hardMode
                        ? "rgba(239,68,68,0.4)"
                        : "rgba(255,255,255,0.15)"
                    }`,
                  }}
                >
                  {entry.hardMode}
                  {entry.hardMode ? "HARD" : "NORMAL"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BaseModal>
  );
};
