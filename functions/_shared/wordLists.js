import { NORMAL_WORDS } from "../../src/constants/normalWords";
import { HARD_WORDS } from "../../src/constants/hardWords";
import { VALID_GUESSES } from "../../src/constants/validGuesses";

const SOURCES = {
  normal: NORMAL_WORDS,
  hard: HARD_WORDS,
  full: VALID_GUESSES,
};

const cache = new Map();

const getSet = (dict) => {
  let set = cache.get(dict);
  if (!set) {
    set = new Set(SOURCES[dict].map((w) => w.toLowerCase()));
    cache.set(dict, set);
  }
  return set;
};

export const isWordInDict = (word, dict) =>
  Object.hasOwn(SOURCES, dict) && getSet(dict).has(word.toLowerCase());
