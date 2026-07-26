// noinspection JSUnusedGlobalSymbols

export const DAILY_ROTATION = [
  { length: 4, hardMode: false },
  { length: 4, hardMode: true },
  { length: 5, hardMode: false },
  { length: 5, hardMode: true },
  { length: 4, hardMode: false },
  { length: 5, hardMode: true },
  { length: 4, hardMode: true },
];

export const DAILY_RELEASE_HOUR_UTC = 8;

export const getUtcDateString = (date = new Date()) => {
  const shifted = new Date(
    date.getTime() - DAILY_RELEASE_HOUR_UTC * 60 * 60 * 1000
  );
  return shifted.toISOString().slice(0, 10);
};

export const getRotationForDate = (dateString) => {
  const dayOfWeek = new Date(`${dateString}T00:00:00Z`).getUTCDay();
  return DAILY_ROTATION[dayOfWeek];
};

export const getPreviousUtcDateString = (dateString) => {
  const d = new Date(`${dateString}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
};
