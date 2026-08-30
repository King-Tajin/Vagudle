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
import { MODAL_TITLE_DAILY_SCHEDULE } from "../../constants/strings";
import {
  DAILY_SCHEDULE_UNLOCK_TEXT_BEFORE_TIME,
  DAILY_SCHEDULE_UNLOCK_TEXT_AFTER_TIME,
  DAILY_SCHEDULE_TODAY_LABEL,
  DAILY_SCHEDULE_WORD_LENGTH_TEXT,
  DAILY_SCHEDULE_HARD_LABEL,
  DAILY_SCHEDULE_NORMAL_LABEL,
  DAILY_SCHEDULE_ADD_TO_CALENDAR_HEADING,
  DAILY_SCHEDULE_SUBSCRIBE_DESCRIPTION,
  DAILY_SCHEDULE_REMINDER_HOUR_ARIA_LABEL,
  DAILY_SCHEDULE_SUBSCRIBE_ARIA_LABEL,
  DAILY_SCHEDULE_OPENING_BUTTON_TEXT,
  DAILY_SCHEDULE_SUBSCRIBE_BUTTON_TEXT,
  DAILY_SCHEDULE_COPY_ARIA_LABEL,
  DAILY_SCHEDULE_DOWNLOAD_PROMPT_TEXT,
  DAILY_SCHEDULE_DOWNLOAD_BUTTON_TEXT,
  DAILY_SCHEDULE_DISMISS_BUTTON_TEXT,
  DAILY_SCHEDULE_FOOTER_NOTE_TEXT,
} from "../../constants/strings";

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
      title={MODAL_TITLE_DAILY_SCHEDULE}
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
            {DAILY_SCHEDULE_UNLOCK_TEXT_BEFORE_TIME}{" "}
            <span className="text-crown-amber">{localUnlockTime}</span>{" "}
            {DAILY_SCHEDULE_UNLOCK_TEXT_AFTER_TIME}
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
                    {DAILY_SCHEDULE_TODAY_LABEL}
                  </span>
                )}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-code text-sm text-gray-300">
                  {DAILY_SCHEDULE_WORD_LENGTH_TEXT(entry.wordLength)}
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
                  {entry.hardMode
                    ? DAILY_SCHEDULE_HARD_LABEL
                    : DAILY_SCHEDULE_NORMAL_LABEL}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-3 border-t-2 border-obsidian-700">
          <p className="font-pixel text-[10px] text-gray-500 tracking-widest">
            {DAILY_SCHEDULE_ADD_TO_CALENDAR_HEADING}
          </p>
          <p className="font-code text-xs text-gray-500 leading-snug">
            {DAILY_SCHEDULE_SUBSCRIBE_DESCRIPTION}
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
            aria-label={DAILY_SCHEDULE_REMINDER_HOUR_ARIA_LABEL}
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
              aria-label={DAILY_SCHEDULE_SUBSCRIBE_ARIA_LABEL}
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {DAILY_SCHEDULE_OPENING_BUTTON_TEXT}
                </>
              ) : (
                <>
                  <CalendarPlus className="w-3 h-3" />
                  {DAILY_SCHEDULE_SUBSCRIBE_BUTTON_TEXT}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 pixel-border-sm text-gray-400 hover:text-white transition-colors shrink-0"
              style={{ border: "1px solid rgba(255,255,255,0.15)" }}
              aria-label={DAILY_SCHEDULE_COPY_ARIA_LABEL}
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
                {DAILY_SCHEDULE_DOWNLOAD_PROMPT_TEXT}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="font-pixel text-[9px] tracking-widest px-2 py-1.5 pixel-border-sm text-crown-amber hover:text-crown-gold transition-colors"
                  style={{ border: "1px solid rgba(212,175,55,0.4)" }}
                >
                  {DAILY_SCHEDULE_DOWNLOAD_BUTTON_TEXT}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDownloadPrompt(false)}
                  className="font-pixel text-[9px] tracking-widest px-2 py-1.5 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {DAILY_SCHEDULE_DISMISS_BUTTON_TEXT}
                </button>
              </div>
            </div>
          )}

          <p className="font-code text-[11px] text-gray-600 leading-snug">
            {DAILY_SCHEDULE_FOOTER_NOTE_TEXT}
          </p>
        </div>
      </div>
    </BaseModal>
  );
};
