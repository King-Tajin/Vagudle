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

const crlf = (lines) => lines.join("\r\n") + "\r\n";

const pad = (n) => String(n).padStart(2, "0");

export const dailyCalendarFileName = (hour) =>
  `daily-reminder-${pad(hour)}.ics`;

const buildFeed = (hour) => {
  const isOnTime = hour === DAILY_RELEASE_HOUR_UTC;
  const uid = `vagudle-daily-reminder-${pad(hour)}`;
  const summary = isOnTime ? "Vagudle Daily Unlocks" : "Play today's Vagudle";
  const description = isOnTime
    ? "A new Vagudle daily word is live. Keep your streak going!"
    : "Reminder to play today's Vagudle daily word.";

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
    "BEGIN:VEVENT",
    `UID:${uid}@${DOMAIN}`,
    "DTSTAMP:20260101T000000Z",
    `DTSTART:${ANCHOR_DATE.replace(/-/g, "")}T${pad(hour)}0000Z`,
    "DURATION:PT15M",
    "RRULE:FREQ=DAILY",
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
    "END:VCALENDAR",
  ];

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
