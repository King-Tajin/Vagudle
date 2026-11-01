export const SITE_ORIGIN = "https://vagudle.king-tajin.dev";

const MONTH_NAMES = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

function pad(value) {
  return String(value).padStart(2, "0");
}

export function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function parseLastUpdated(text) {
  const match = /^last updated:[ \t]*(.+)$/im.exec(String(text ?? ""));
  if (!match) return null;
  const value = match[1].trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return Number.isNaN(new Date(value).getTime()) ? null : value;
  }

  const parts = value.replace(/,/g, " ").split(/\s+/);
  const month = MONTH_NAMES.indexOf((parts[0] ?? "").toLowerCase());
  if (month === -1) return null;

  if (parts.length === 2 && /^\d{4}$/.test(parts[1])) {
    return `${parts[1]}-${pad(month + 1)}`;
  }

  if (
    parts.length === 3 &&
    /^\d{1,2}$/.test(parts[1]) &&
    /^\d{4}$/.test(parts[2])
  ) {
    const year = Number(parts[2]);
    const day = Number(parts[1]);
    const check = new Date(Date.UTC(year, month, day));
    if (check.getUTCMonth() !== month || check.getUTCDate() !== day)
      return null;
    return `${year}-${pad(month + 1)}-${pad(day)}`;
  }

  return null;
}
