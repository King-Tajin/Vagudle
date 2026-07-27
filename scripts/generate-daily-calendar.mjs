import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public/calendar");

const DOMAIN = "vagudle.king-tajin.dev";
const DAILY_RELEASE_HOUR_UTC = 8;
const LAST_HOUR_UTC = 23;
const ANCHOR_DATE = "2026-01-01";

const DAILY_ROTATION = [
  { length: 4, hardMode: false },
  { length: 4, hardMode: true },
  { length: 5, hardMode: false },
  { length: 5, hardMode: true },
  { length: 4, hardMode: false },
  { length: 5, hardMode: true },
  { length: 4, hardMode: true },
];

const WEEKDAYS = [
  { code: "SU", name: "Sunday" },
  { code: "MO", name: "Monday" },
  { code: "TU", name: "Tuesday" },
  { code: "WE", name: "Wednesday" },
  { code: "TH", name: "Thursday" },
  { code: "FR", name: "Friday" },
  { code: "SA", name: "Saturday" },
];

const crlf = (lines) => lines.join("\r\n") + "\r\n";

const pad = (n) => String(n).padStart(2, "0");

export const dailyCalendarFileName = (hour) =>
  `daily-reminder-${pad(hour)}.ics`;

const dateForWeekday = (dayOfWeek) => {
  const anchor = new Date(`${ANCHOR_DATE}T00:00:00Z`);
  const anchorDow = anchor.getUTCDay();
  const offset = (dayOfWeek - anchorDow + 7) % 7;
  const d = new Date(anchor);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
};

const wordDescription = ({ length, hardMode }) =>
  `${length}-letter word, ${hardMode ? "Hard Mode" : "Normal Mode"}`;

const buildEvent = (hour, dayOfWeek) => {
  const isOnTime = hour === DAILY_RELEASE_HOUR_UTC;
  const weekday = WEEKDAYS[dayOfWeek];
  const rotation = DAILY_ROTATION[dayOfWeek];
  const uid = `vagudle-daily-reminder-${pad(hour)}-${weekday.code}`;
  const summary = isOnTime ? "Vagudle Daily Unlocks" : "Play today's Vagudle";
  const baseDescription = isOnTime
    ? "A new Vagudle daily word is live. Keep your streak going!"
    : "Reminder to play today's Vagudle daily word.";
  const description = `${baseDescription} Today's word: ${wordDescription(rotation)}.`;

  return [
    "BEGIN:VEVENT",
    `UID:${uid}@${DOMAIN}`,
    "DTSTAMP:20260101T000000Z",
    `DTSTART:${dateForWeekday(dayOfWeek)}T${pad(hour)}0000Z`,
    "DURATION:PT15M",
    `RRULE:FREQ=WEEKLY;BYDAY=${weekday.code}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `URL:https://${DOMAIN}/daily`,
    "TRANSP:TRANSPARENT",
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${summary}`,
    "TRIGGER:PT0S",
    "END:VALARM",
    "END:VEVENT",
  ];
};

const buildFeed = (hour) => {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Vagudle//Daily Word Unlock//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Vagudle Daily Unlock",
    "X-WR-TIMEZONE:UTC",
    "REFRESH-INTERVAL;VALUE=DURATION:P1D",
    "X-PUBLISHED-TTL:P1D",
  ];

  for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
    lines.push(...buildEvent(hour, dayOfWeek));
  }

  lines.push("END:VCALENDAR");

  return crlf(lines);
};

const main = () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (let hour = DAILY_RELEASE_HOUR_UTC; hour <= LAST_HOUR_UTC; hour++) {
    const outFile = path.join(OUT_DIR, dailyCalendarFileName(hour));
    fs.writeFileSync(outFile, buildFeed(hour), "utf8");
    console.log(`Written ${outFile}`);
  }
};

main();
