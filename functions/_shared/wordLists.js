import { NORMAL_WORDS } from "../../src/constants/normalWords";
import { HARD_WORDS } from "../../src/constants/hardWords";
import { VALID_GUESSES } from "../../src/constants/validGuesses";

const SOURCES = {
  normal: NORMAL_WORDS,
  hard: HARD_WORDS,
  full: VALID_GUESSES,
};

const isInSortedList = (list, word) => {
  let low = 0;
  let high = list.length - 1;

  while (low <= high) {
    const mid = (low + high) >>> 1;
    const candidate = list[mid];

    if (candidate === word) return true;
    if (candidate < word) low = mid + 1;
    else high = mid - 1;
  }

  return false;
};

const patternToRegex = (pattern) =>
  new RegExp(
    `^${pattern
      .toLowerCase()
      .replace(/\*+/g, "*")
      .replace(/[?*]/g, (char) => (char === "?" ? "[a-z]" : "[a-z]*"))}$`
  );

export const isWordInDict = (word, dict) =>
  Object.hasOwn(SOURCES, dict) &&
  isInSortedList(SOURCES[dict], word.toLowerCase());

export const getDictsForWord = (word) =>
  Object.keys(SOURCES).filter((dict) => isWordInDict(word, dict));

export const searchWords = ({ dict, pattern, length, limit }) => {
  const regex = pattern ? patternToRegex(pattern) : null;
  const sample = [];
  let total = 0;

  for (const word of SOURCES[dict]) {
    if (length !== undefined && word.length !== length) continue;
    if (regex && !regex.test(word)) continue;

    total++;
    if (sample.length < limit) {
      sample.push(word);
      continue;
    }

    const slot = Math.floor(Math.random() * total);
    if (slot < limit) sample[slot] = word;
  }

  return { total, words: sample.sort() };
};
