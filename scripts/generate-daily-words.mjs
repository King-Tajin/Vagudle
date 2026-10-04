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

const DAILY_RELEASE_HOUR_UTC = 8;
const DEFAULT_DAYS = 1096;
const MAX_DAYS = 100000;
const CHUNK_SIZE = 200;

const parseArgs = () =>
  Object.fromEntries(
    process.argv.slice(2).map((raw) => {
      const [key, ...rest] = raw.replace(/^--/, "").split("=");
      return [key, rest.length > 0 ? rest.join("=") : true];
    })
  );

const extractWords = (filePath) => {
  if (!fs.existsSync(filePath)) {
    console.error(`Missing ${path.relative(ROOT, filePath)}`);
    process.exit(1);
  }
  const text = fs.readFileSync(filePath, "utf8");
  return [...text.matchAll(/"([a-zA-Z]+)"/g)].map((m) => m[1].toLowerCase());
};

const hashSeed = (text) => {
  let h = 1779033703 ^ text.length;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(h ^ text.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);
  return (h ^ (h >>> 16)) >>> 0;
};

const createRandom = (seed) => {
  let a = hashSeed(seed);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffle = (arr, random) => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const INSERT_COLUMNS = "(date, word, word_length, hard_mode, created_at)";

const buildInsert = (verb, values) =>
  ["INSERT", "OR", verb, "INTO", "daily_words", INSERT_COLUMNS].join(" ") +
  " VALUES\n  " +
  values +
  ";";

const buildTrim = (end) =>
  ["DELETE", "FROM", "daily_words", "WHERE", "date", ">", `'${end}'`].join(
    " "
  ) + ";";

const poolKey = ({ length, hardMode }) =>
  `${length}-${hardMode ? "hard" : "normal"}`;

const buildPools = (listsDir, random) => {
  const normal = extractWords(path.join(listsDir, "normalWords.ts"));
  const hard = extractWords(path.join(listsDir, "hardWords.ts"));

  const pools = {};
  for (const rotation of DAILY_ROTATION) {
    const key = poolKey(rotation);
    if (pools[key]) continue;
    const source = rotation.hardMode ? hard : normal;
    pools[key] = shuffle(
      source.filter((w) => w.length === rotation.length),
      random
    );
  }
  return pools;
};

const addUtcDays = (dateString, days) => {
  const d = new Date(`${dateString}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const getGameDate = () =>
  new Date(Date.now() - DAILY_RELEASE_HOUR_UTC * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

const getRotationForDate = (dateString) => {
  const dayOfWeek = new Date(`${dateString}T00:00:00Z`).getUTCDay();
  return DAILY_ROTATION[dayOfWeek];
};

const main = () => {
  const args = parseArgs();
  const gameDate = getGameDate();
  const start =
    args.start === "today" ? gameDate : args.start || addUtcDays(gameDate, 1);
  const untilEmpty = args.days === "max";
  const days = untilEmpty ? MAX_DAYS : Number(args.days || DEFAULT_DAYS);
  const replace = Boolean(args.replace);
  const seed = args.seed ? String(args.seed) : String(Date.now());
  const listsDir = args.lists
    ? path.resolve(process.cwd(), args.lists)
    : path.join(ROOT, "src/constants");
  const outFile = args.out
    ? path.resolve(process.cwd(), args.out)
    : path.join(ROOT, "scripts/output/daily_words_seed.sql");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(start)) {
    console.error("--start must be YYYY-MM-DD or today");
    process.exit(1);
  }
  if (!Number.isFinite(days) || days < 1) {
    console.error("--days must be a positive number or max");
    process.exit(1);
  }
  if (replace && start <= gameDate) {
    console.error(
      `--replace needs a --start after the current game date (${gameDate}) so today and past words are never overwritten`
    );
    process.exit(1);
  }

  const valid = new Set(
    extractWords(path.join(ROOT, "src/constants/validGuesses.ts"))
  );
  const pools = buildPools(listsDir, createRandom(seed));
  const used = Object.fromEntries(Object.keys(pools).map((key) => [key, 0]));
  const rows = [];
  const seen = new Set();
  let exhausted = null;
  let outsideValid = 0;

  for (let i = 0; i < days; i++) {
    const date = addUtcDays(start, i);
    const rotation = getRotationForDate(date);
    const key = poolKey(rotation);
    const pool = pools[key];
    const idx = used[key];

    if (idx >= pool.length) {
      if (untilEmpty) {
        exhausted = { date, key };
        break;
      }
      throw new Error(
        `Ran out of ${rotation.hardMode ? "hard" : "normal"} words of length ${rotation.length} at ${date}`
      );
    }

    const word = pool[idx];
    if (seen.has(word)) {
      throw new Error(`Word "${word}" on ${date} is repeated`);
    }
    if (!valid.has(word)) {
      if (replace) {
        throw new Error(
          `Word "${word}" on ${date} is not in the valid guess list`
        );
      }
      outsideValid += 1;
    }
    seen.add(word);
    used[key] += 1;
    rows.push({
      date,
      word: word.toUpperCase(),
      length: rotation.length,
      hardMode: rotation.hardMode,
    });
  }

  if (untilEmpty && !exhausted) {
    throw new Error(`No pool ran out within ${MAX_DAYS} days`);
  }

  const verb = replace ? "REPLACE" : "IGNORE";
  const statements = [];
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
    const values = rows
      .slice(i, i + CHUNK_SIZE)
      .map(
        (r) =>
          `('${r.date}', '${r.word.replace(/'/g, "''")}', ${r.length}, ${r.hardMode ? 1 : 0}, datetime('now'))`
      )
      .join(",\n  ");
    statements.push(buildInsert(verb, values));
  }
  const end = rows[rows.length - 1].date;
  if (replace && untilEmpty) {
    statements.push(buildTrim(end));
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, statements.join("\n") + "\n", "utf8");

  console.log(`Seed: ${seed}`);
  console.log(`Current game date: ${gameDate}`);
  console.log(`Generated ${rows.length} daily words from ${start} to ${end}`);
  if (exhausted) {
    console.log(
      `Stopped before ${exhausted.date}: the ${exhausted.key} pool has no unused words left`
    );
  }
  if (outsideValid > 0) {
    console.warn(
      `Warning: ${outsideValid} words are not in the valid guess list`
    );
  }
  console.table(
    Object.keys(pools).map((key) => ({
      pool: key,
      size: pools[key].length,
      used: used[key],
      unused: pools[key].length - used[key],
    }))
  );
  console.log("First 5:", rows.slice(0, 5));
  console.log("Last 5:", rows.slice(-5));
  console.log(`Written to ${outFile}`);
};

main();
