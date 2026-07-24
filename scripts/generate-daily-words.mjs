import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const DAILY_ROTATION = [
  { length: 4, hardMode: false },
  { length: 4, hardMode: true },
  { length: 5, hardMode: false },
  { length: 5, hardMode: true },
  { length: 4, hardMode: false },
  { length: 5, hardMode: true },
  { length: 4, hardMode: true },
];

const parseArgs = () => {
  const args = {};
  for (const raw of process.argv.slice(2)) {
    const [key, value] = raw.replace(/^--/, "").split("=");
    args[key] = value ?? true;
  }
  return args;
};

const extractWords = (filePath) => {
  const text = fs.readFileSync(filePath, "utf8");
  return [...text.matchAll(/"([a-zA-Z]+)"/g)].map((m) => m[1].toLowerCase());
};

const shuffle = (arr) => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const buildPools = () => {
  const normal = extractWords(path.join(ROOT, "src/constants/normalWords.ts"));
  const hard = extractWords(path.join(ROOT, "src/constants/hardWords.ts"));

  const pools = {};
  for (const { length, hardMode } of DAILY_ROTATION) {
    const key = `${length}-${hardMode}`;
    if (pools[key]) continue;
    const source = hardMode ? hard : normal;
    pools[key] = shuffle(source.filter((w) => w.length === length));
  }
  return pools;
};

const addUtcDays = (dateString, days) => {
  const d = new Date(`${dateString}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const getRotationForDate = (dateString) => {
  const dayOfWeek = new Date(`${dateString}T00:00:00Z`).getUTCDay();
  return DAILY_ROTATION[dayOfWeek];
};

const main = () => {
  const args = parseArgs();
  const start = args.start || addUtcDays(new Date().toISOString().slice(0, 10), 1);
  const days = Number(args.days || 1096);
  const outFile = args.out
    ? path.resolve(process.cwd(), args.out)
    : path.join(ROOT, "scripts/output/daily_words_seed.sql");

  const pools = buildPools();
  const usedIndex = { "4-false": 0, "4-true": 0, "5-false": 0, "5-true": 0 };
  const lines = [];
  const preview = [];

  for (let i = 0; i < days; i++) {
    const date = addUtcDays(start, i);
    const { length, hardMode } = getRotationForDate(date);
    const key = `${length}-${hardMode}`;
    const pool = pools[key];
    const idx = usedIndex[key];

    if (idx >= pool.length) {
      throw new Error(
        `Ran out of ${hardMode ? "hard" : "normal"} words of length ${length} at ${date}`
      );
    }

    const word = pool[idx].toUpperCase();
    usedIndex[key] += 1;

    const escapedWord = word.replace(/'/g, "''");
    lines.push(
      `INSERT OR IGNORE INTO daily_words (date, word, word_length, hard_mode, created_at) VALUES ('${date}', '${escapedWord}', ${length}, ${hardMode ? 1 : 0}, datetime('now'));`
    );
    preview.push({ date, word, length, hardMode });
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, lines.join("\n") + "\n", "utf8");

  console.log(`Generated ${lines.length} daily words from ${start} to ${addUtcDays(start, days - 1)}`);
  console.log(`Written to ${outFile}`);
  console.log("First 5:", preview.slice(0, 5));
  console.log("Last 5:", preview.slice(-5));
};

main();
