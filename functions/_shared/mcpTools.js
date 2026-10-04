// noinspection JSUnresolvedReference

import { VALID_DICTS, VALID_GUESSES } from "./api.js";
import { buildChallengeUrl, createChallenge } from "./challenge.js";
import { getDictsForWord, isWordInDict, searchWords } from "./wordLists.js";

const WORD_PATTERN = /^[A-Za-z]{4,7}$/;
const SEARCH_PATTERN = /^[A-Za-z?*]{1,20}$/;
const MAX_CHECK_WORDS = 25;
const MAX_SEARCH_LIMIT = 50;
const DEFAULT_SEARCH_LIMIT = 10;

const textResult = (text, extra = {}) => ({
  content: [{ type: "text", text }],
  ...extra,
});

const toolError = (text) => textResult(text, { isError: true });

const createChallengeTool = {
  name: "create_challenge",
  title: "Create Vagudle challenge",
  description:
    "Creates a shareable Vagudle challenge link. Whoever opens the link plays a Wordle-style game and must guess the secret word you choose. " +
    "The word must be 4 to 7 letters and must exist in the chosen dictionary: 'normal' is common English words, 'hard' is uncommon English words, and 'full' is the complete Scrabble dictionary (extreme). " +
    "Guesses can be 9 or 11. If the word is rejected, the error says which dictionaries contain it or that it is not a valid word, so pick another word and retry. " +
    "The link hides the word, so do not reveal it to the player unless they ask.",
  inputSchema: {
    type: "object",
    properties: {
      word: {
        type: "string",
        minLength: 4,
        maxLength: 7,
        pattern: "^[A-Za-z]{4,7}$",
        description: "The secret word, 4 to 7 letters, letters only.",
      },
      dict: {
        type: "string",
        enum: VALID_DICTS,
        default: "normal",
        description:
          "Dictionary the word must come from: normal, hard or full.",
      },
      guesses: {
        type: "integer",
        enum: VALID_GUESSES,
        default: 11,
        description: "How many guesses the player gets: 9 or 11.",
      },
    },
    required: ["word"],
    additionalProperties: false,
  },
  annotations: {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  handler: async (args, context) => {
    const { word, dict = "normal", guesses = 11 } = args;

    if (typeof word !== "string" || !WORD_PATTERN.test(word))
      return toolError("word must be 4 to 7 letters, letters only.");

    if (!VALID_DICTS.includes(dict))
      return toolError(`dict must be one of: ${VALID_DICTS.join(", ")}.`);

    if (!VALID_GUESSES.includes(guesses))
      return toolError(`guesses must be one of: ${VALID_GUESSES.join(", ")}.`);

    const upper = word.toUpperCase();

    if (!isWordInDict(word, dict)) {
      const others = VALID_DICTS.filter(
        (name) => name !== dict && isWordInDict(word, name)
      );
      return toolError(
        others.length > 0
          ? `${upper} is not in the ${dict} word list, but it is in: ${others.join(", ")}. Use a dictionary that contains it or pick another word.`
          : `${upper} is not a valid word in any dictionary. Pick another word.`
      );
    }

    const key = context.env.CHALLENGE_KEY;
    if (!key) return toolError("The server is not configured correctly.");

    const { error, encoded, id } = await createChallenge(
      { word, dict, guesses, length: word.length },
      key
    );
    if (error) return toolError(error);

    const url = buildChallengeUrl(encoded);

    return textResult(
      `Challenge created: ${url}\n${word.length} letters, ${dict} dictionary, ${guesses} guesses.`,
      {
        structuredContent: {
          url,
          id,
          length: word.length,
          dict,
          guesses,
        },
      }
    );
  },
};

const formatDicts = (dicts) => dicts.join(", ");

const checkWordsTool = {
  name: "check_words",
  title: "Check words",
  description:
    "Checks whether words are valid Vagudle words and tells you which dictionaries contain each one. " +
    "'normal' and 'hard' never share a word, and every word in either of them is also in 'full', so a word is in 'full' only, 'normal' and 'full', or 'hard' and 'full'. " +
    "Use this before create_challenge to find a dictionary that accepts your word.",
  inputSchema: {
    type: "object",
    properties: {
      words: {
        type: "array",
        minItems: 1,
        maxItems: MAX_CHECK_WORDS,
        items: { type: "string", maxLength: 32 },
        description: `The words to check, at most ${MAX_CHECK_WORDS}.`,
      },
    },
    required: ["words"],
    additionalProperties: false,
  },
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  handler: async ({ words }, _context) => {
    if (
      !Array.isArray(words) ||
      words.length < 1 ||
      words.length > MAX_CHECK_WORDS ||
      words.some((word) => typeof word !== "string" || word.length > 32)
    )
      return toolError(
        `words must be a list of 1 to ${MAX_CHECK_WORDS} strings of at most 32 characters.`
      );

    const results = words.map((raw) => {
      const word = raw.trim().toLowerCase();
      const dicts = /^[a-z]+$/.test(word) ? getDictsForWord(word) : [];
      return { word, valid: dicts.length > 0, dicts };
    });

    const lines = results.map(({ word, valid, dicts }) =>
      valid
        ? `${word.toUpperCase()}: valid, in ${formatDicts(dicts)}`
        : `${word.toUpperCase() || "(empty)"}: not a valid word in any dictionary`
    );

    return textResult(lines.join("\n"), { structuredContent: { results } });
  },
};

const searchWordsTool = {
  name: "search_words",
  title: "Search words",
  description:
    "Searches the word lists Vagudle challenges use and returns matching words, each with every dictionary it belongs to. Use it to find real words to choose from instead of guessing. " +
    "pattern matches the whole word and may contain letters, ? for exactly one letter and * for any run of letters, for example 'c?a*e', 'str*' or '*ight'. " +
    "length limits results to 4 to 7 letters. dict picks the list that is searched (normal is common words, hard is uncommon words, full is the Scrabble dictionary). " +
    "When more words match than limit allows, a random sample is returned together with the total number of matches.",
  inputSchema: {
    type: "object",
    properties: {
      pattern: {
        type: "string",
        pattern: "^[A-Za-z?*]{1,20}$",
        description:
          "Optional whole-word pattern using letters, ? (one letter) and * (any run of letters).",
      },
      length: {
        type: "integer",
        minimum: 4,
        maximum: 7,
        description: "Optional word length, 4 to 7.",
      },
      dict: {
        type: "string",
        enum: VALID_DICTS,
        default: "normal",
        description: "The dictionary to search: normal, hard or full.",
      },
      limit: {
        type: "integer",
        minimum: 1,
        maximum: MAX_SEARCH_LIMIT,
        default: DEFAULT_SEARCH_LIMIT,
        description: `How many words to return, 1 to ${MAX_SEARCH_LIMIT}.`,
      },
    },
    additionalProperties: false,
  },
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  handler: async (args, _context) => {
    const {
      pattern,
      length,
      dict = "normal",
      limit = DEFAULT_SEARCH_LIMIT,
    } = args;

    if (
      pattern !== undefined &&
      (typeof pattern !== "string" || !SEARCH_PATTERN.test(pattern))
    )
      return toolError(
        "pattern must be 1 to 20 characters: letters, ? for one letter, * for any run of letters."
      );

    if (
      length !== undefined &&
      (!Number.isInteger(length) || length < 4 || length > 7)
    )
      return toolError("length must be a whole number from 4 to 7.");

    if (!VALID_DICTS.includes(dict))
      return toolError(`dict must be one of: ${VALID_DICTS.join(", ")}.`);

    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_SEARCH_LIMIT)
      return toolError(
        `limit must be a whole number from 1 to ${MAX_SEARCH_LIMIT}.`
      );

    const { total, words } = searchWords({ dict, pattern, length, limit });
    const results = words.map((word) => ({
      word,
      dicts: getDictsForWord(word),
    }));

    if (total === 0)
      return textResult(`No words in the ${dict} list match.`, {
        structuredContent: { dict, total, results },
      });

    const header =
      total > results.length
        ? `Showing a random sample of ${results.length} of ${total} matches in the ${dict} list:`
        : `${total} ${total === 1 ? "match" : "matches"} in the ${dict} list:`;

    const lines = results.map(
      ({ word, dicts }) => `${word.toUpperCase()}: ${formatDicts(dicts)}`
    );

    return textResult([header, ...lines].join("\n"), {
      structuredContent: { dict, total, results },
    });
  },
};

export const MCP_TOOLS = [createChallengeTool, checkWordsTool, searchWordsTool];

export const listMcpTools = () =>
  MCP_TOOLS.map(({ name, title, description, inputSchema, annotations }) => ({
    name,
    title,
    description,
    inputSchema,
    ...(annotations ? { annotations } : {}),
  }));

export const findMcpTool = (name) =>
  MCP_TOOLS.find((tool) => tool.name === name);
