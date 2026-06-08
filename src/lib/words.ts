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

export const isWordInWordList = (word: string) => {
  if (!SCRABBLE_SET || !NORMAL_SET || !HARD_SET) {
    console.error(
      "[words] isWordInWordList called before initWordLists completed"
    );
    return false;
  }
  const lower = word.toLowerCase();
  return (
    SCRABBLE_SET.has(lower) || NORMAL_SET.has(lower) || HARD_SET.has(lower)
  );
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
): string => {
  const pool = (hardMode ? HARD_WORDS_ARR : NORMAL_WORDS_ARR).filter(
    (w) => w.length === length
  );
  if (pool.length === 0) {
    const fallback = hardMode ? HARD_WORDS_ARR : NORMAL_WORDS_ARR;
    return localeAwareUpperCase(
      fallback[Math.floor(Math.random() * fallback.length)] ?? ""
    );
  }
  return localeAwareUpperCase(pool[Math.floor(Math.random() * pool.length)]);
};

export const isWordInDict = (
  word: string,
  dict: "normal" | "hard" | "full"
): boolean => {
  if (!SCRABBLE_SET || !NORMAL_SET || !HARD_SET) {
    console.error("[words] isWordInDict called before initWordLists completed");
    return false;
  }
  const lower = word.toLowerCase();
  if (dict === "full") return SCRABBLE_SET.has(lower);
  if (dict === "hard") return HARD_SET.has(lower);
  return NORMAL_SET.has(lower);
};
