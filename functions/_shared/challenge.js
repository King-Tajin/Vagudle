import { encode, VALID_DICTS, VALID_GUESSES } from "./api.js";
import { isWordInDict } from "./wordLists.js";

const PUBLIC_ORIGIN = "https://vagudle.king-tajin.dev";

const generateId = () =>
  Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-6);

export const validateConfig = ({ word, dict, guesses, length }) =>
  typeof word === "string" &&
  VALID_DICTS.includes(dict) &&
  VALID_GUESSES.includes(guesses) &&
  typeof length === "number" &&
  word.length >= 4 &&
  word.length <= 7 &&
  word.length === length &&
  /^[a-zA-Z]+$/.test(word);

export const createChallenge = async (input, key) => {
  if (!validateConfig(input)) return { error: "Invalid challenge config." };

  if (!isWordInDict(input.word, input.dict))
    return {
      error: `${input.word.toUpperCase()} is not in the ${input.dict} word list.`,
    };

  const id = generateId();
  const encoded = await encode(
    {
      word: input.word.toUpperCase(),
      dict: input.dict,
      guesses: input.guesses,
      length: input.length,
      id,
    },
    key
  );

  return { encoded, id };
};

export const buildChallengeUrl = (encoded) =>
  `${PUBLIC_ORIGIN}/?challenge=${encoded}`;
