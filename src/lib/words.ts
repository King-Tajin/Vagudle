let SCRABBLE_SET: Set<string> | null = null;
let NORMAL_WORDS_ARR: string[] = [];
let HARD_WORDS_ARR: string[] = [];
let NORMAL_SET: Set<string> | null = null;
let HARD_SET: Set<string> | null = null;

export const initWordLists = async () => {
  const [{ VALID_GUESSES }, { NORMAL_WORDS }, { HARD_WORDS }] =
    await Promise.all([
      import("../constants/validGuesses"),
      import("../constants/normalWords"),
      import("../constants/hardWords"),
    ]);
  SCRABBLE_SET = new Set(VALID_GUESSES.map((w) => w.toLowerCase()));
  NORMAL_WORDS_ARR = NORMAL_WORDS;
  HARD_WORDS_ARR = HARD_WORDS;
  NORMAL_SET = new Set(NORMAL_WORDS.map((w) => w.toLowerCase()));
  HARD_SET = new Set(HARD_WORDS.map((w) => w.toLowerCase()));
};

export const isWordInWordList = (word: string, hardMode: boolean) => {
  if (!SCRABBLE_SET || !NORMAL_SET || !HARD_SET) return true;
  const lower = word.toLowerCase();
  const solutionSet = hardMode ? HARD_SET : NORMAL_SET;
  return SCRABBLE_SET.has(lower) || solutionSet.has(lower);
};

export const isWinningWord = (word: string, solution: string) => {
  return localeAwareLowerCase(solution) === localeAwareLowerCase(word);
};

export const unicodeSplit = (word: string) => {
  return word.split("");
};

export const unicodeLength = (word: string) => {
  return word.length;
};

export const localeAwareLowerCase = (text: string) => {
  return text.toLowerCase();
};

export const localeAwareUpperCase = (text: string) => {
  return text.toUpperCase();
};

export const getRandomWord = (
  length: number = 5,
  hardMode: boolean = false
) => {
  const pool = (hardMode ? HARD_WORDS_ARR : NORMAL_WORDS_ARR).filter(
    (w) => w.length === length
  );
  const index = Math.floor(Math.random() * pool.length);
  return localeAwareUpperCase(pool[index] ?? "");
};
