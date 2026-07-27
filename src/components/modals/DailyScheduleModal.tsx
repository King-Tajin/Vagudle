import { useEffect, useRef, useState } from "react";
import {
  CalendarClock,
  CalendarPlus,
  Check,
  Copy,
  Loader2,
} from "lucide-react";
import { BaseModal } from "./BaseModal";
import {
  DAILY_SCHEDULE,
  WEEKDAY_NAMES,
  DAILY_CALENDAR_HOURS,
  DAILY_CALENDAR_FIRST_HOUR_UTC,
  getLocalDailyUnlockTime,
  getCurrentDailyWeekday,
  dailyCalendarFileName,
  getDailyCalendarHourLabel,
  getDailyCalendarHttpsUrl,
  getDailyCalendarWebcalUrl,
} from "../../lib/daily";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
};

const SUBSCRIBE_FALLBACK_DELAY_MS = 8000;

export const DailyScheduleModal = ({ isOpen, handleClose }: Props) => {
  const today = getCurrentDailyWeekday();
  const localUnlockTime = getLocalDailyUnlockTime();
  const [selectedHour, setSelectedHour] = useState(
    DAILY_CALENDAR_FIRST_HOUR_UTC
  );
  const [copied, setCopied] = useState(false);
  const [showDownloadPrompt, setShowDownloadPrompt] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, []);

  const fileName = dailyCalendarFileName(selectedHour);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getDailyCalendarHttpsUrl(fileName));
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = getDailyCalendarHttpsUrl(fileName);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowDownloadPrompt(false);
  };

  const handleSubscribeClick = () => {
    setShowDownloadPrompt(false);
    setIsChecking(true);
    if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);

    let handled = false;
    const markHandled = () => {
      handled = true;
      setIsChecking(false);
    };
    document.addEventListener("visibilitychange", markHandled, {
      once: true,
    });
    window.addEventListener("blur", markHandled, { once: true });

    window.location.href = getDailyCalendarWebcalUrl(fileName);

    fallbackTimerRef.current = setTimeout(() => {
      document.removeEventListener("visibilitychange", markHandled);
      window.removeEventListener("blur", markHandled);
      setIsChecking(false);
      if (!handled) setShowDownloadPrompt(true);
    }, SUBSCRIBE_FALLBACK_DELAY_MS);
  };

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

        <div className="space-y-2 pt-3 border-t-2 border-obsidian-700">
          <p className="font-pixel text-[10px] text-gray-500 tracking-widest">
            ADD TO CALENDAR
          </p>
          <p className="font-code text-xs text-gray-500 leading-snug">
            Subscribe once and your calendar app checks for the daily unlock
            automatically. Pick what hour you want reminded:
          </p>

          <select
            value={selectedHour}
            onChange={(e) => setSelectedHour(Number(e.target.value))}
            className="w-full border-2 font-code text-sm p-2 outline-none focus-visible:ring-2 focus-visible:ring-crown-amber transition-colors"
            style={{
              background: "#0a0014",
              borderColor: "#d4af37",
              color: "#d1d5db",
            }}
            aria-label="Reminder hour"
          >
            {DAILY_CALENDAR_HOURS.map((hour) => (
              <option key={hour} value={hour}>
                {getDailyCalendarHourLabel(hour)}
              </option>
            ))}
          </select>

          <div
            className="flex items-center gap-1.5 px-3 py-2"
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <button
              type="button"
              onClick={handleSubscribeClick}
              disabled={isChecking}
              className="flex-1 flex items-center justify-center gap-1 font-pixel text-[9px] tracking-widest px-2 py-2 pixel-border-sm text-crown-amber hover:text-crown-gold transition-colors disabled:opacity-60 disabled:cursor-wait"
              style={{ border: "1px solid rgba(212,175,55,0.4)" }}
              aria-label="Subscribe to daily reminder calendar feed"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  OPENING...
                </>
              ) : (
                <>
                  <CalendarPlus className="w-3 h-3" />
                  SUBSCRIBE
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 pixel-border-sm text-gray-400 hover:text-white transition-colors shrink-0"
              style={{ border: "1px solid rgba(255,255,255,0.15)" }}
              aria-label="Copy calendar link"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>

          {showDownloadPrompt && (
            <div
              className="flex items-center justify-between gap-2 px-3 py-2"
              style={{
                background: "rgba(212,175,55,0.08)",
                border: "1px solid rgba(212,175,55,0.35)",
              }}
            >
              <p className="font-code text-xs text-gray-300 leading-snug">
                Didn't open your calendar app?
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="font-pixel text-[9px] tracking-widest px-2 py-1.5 pixel-border-sm text-crown-amber hover:text-crown-gold transition-colors"
                  style={{ border: "1px solid rgba(212,175,55,0.4)" }}
                >
                  DOWNLOAD
                </button>
                <button
                  type="button"
                  onClick={() => setShowDownloadPrompt(false)}
                  className="font-pixel text-[9px] tracking-widest px-2 py-1.5 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  DISMISS
                </button>
              </div>
            </div>
          )}

          <p className="font-code text-[11px] text-gray-600 leading-snug">
            Apple Calendar and Outlook can subscribe directly via the button
            above. For Google Calendar, use the copy button and add it under
            "Other calendars &rarr; From URL".
          </p>
        </div>
      </div>
    </BaseModal>
  );
};
