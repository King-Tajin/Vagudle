import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONSTANTS_DIR = path.resolve(__dirname, "..", "src", "constants");

const LISTS = [
  { file: "normalWords.ts", exportName: "NORMAL_WORDS" },
  { file: "hardWords.ts", exportName: "HARD_WORDS" },
  { file: "validGuesses.ts", exportName: "VALID_GUESSES" },
];

const MAX_PROBLEMS_PER_LIST = 10;
const ENTRY_TOKEN = /\s*"[^"\n]*"\s*,?/g;
const ENTRY_VALUE = /"([^"\n]*)"/g;

const parseList = (text, exportName) => {
  const declaration = new RegExp(
    `export const ${exportName}\\b[^=]*=\\s*\\[([\\s\\S]*?)\\]`
  ).exec(text);

  if (!declaration)
    return { error: `could not find "export const ${exportName} = [...]"` };

  const body = declaration[1];
  const leftover = body.replace(ENTRY_TOKEN, "").trim();

  if (leftover !== "")
    return {
      error: `unexpected content near ${JSON.stringify(leftover.slice(0, 30))}, each entry must be one double-quoted word followed by a comma`,
    };

  const words = [...body.matchAll(ENTRY_VALUE)].map((match) => match[1]);

  return words.length > 0
    ? { words }
    : { error: `${exportName} must contain words` };
};

const findProblems = (words) => {
  const problems = [];
  const report = (message) => {
    if (problems.length < MAX_PROBLEMS_PER_LIST) problems.push(message);
  };

  words.forEach((word, index) => {
    if (!/^[a-z]+$/.test(word)) {
      report(
        `entry ${index + 1} (${JSON.stringify(word)}) must be lowercase letters only`
      );
      return;
    }

    if (index === 0) return;

    const previous = words[index - 1];

    if (previous === word)
      report(`"${word}" appears twice in a row (entry ${index + 1})`);
    else if (previous > word)
      report(
        `"${word}" (entry ${index + 1}) is out of order, it comes after "${previous}"`
      );
  });

  return problems;
};

let failed = false;

for (const { file, exportName } of LISTS) {
  const text = fs.readFileSync(path.join(CONSTANTS_DIR, file), "utf8");
  const { words, error } = parseList(text, exportName);

  if (error) {
    console.error(`src/constants/${file}: ${error}`);
    failed = true;
    continue;
  }

  const problems = findProblems(words);

  if (problems.length > 0) {
    console.error(`src/constants/${file}:`);
    problems.forEach((problem) => console.error(`  ${problem}`));
    failed = true;
    continue;
  }

  console.log(
    `src/constants/${file}: ${words.length} words, sorted and unique`
  );
}

if (failed) {
  console.error(
    "\nEach word list must stay in strict alphabetical order (a to z) with no duplicates and only lowercase letters. The server finds words with a binary search, so a misplaced word is reported as invalid."
  );
  process.exit(1);
}
