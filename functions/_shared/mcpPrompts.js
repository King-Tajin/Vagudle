const DIFFICULTIES = {
  easy: { label: "Easy", dict: "normal", guesses: 11 },
  medium: { label: "Medium", dict: "normal", guesses: 9 },
  hard: { label: "Hard", dict: "hard", guesses: 9 },
  extreme: { label: "Extreme", dict: "full", guesses: 9 },
};

const MAX_TEXT_LENGTH = 100;

const DIFFICULTY_LINES = Object.values(DIFFICULTIES).map(
  ({ label, dict, guesses }) =>
    `- ${label}: ${dict} dictionary, ${guesses} guesses`
);

const buildProcessText = (firstPerson) => {
  const who = firstPerson ? "I" : "they";
  return [
    "Think of candidate words that fit the theme and check them with check_words so they are in the dictionary for the chosen difficulty.",
    "You can use search_words to find alternatives by pattern or length.",
    "Create the challenge with create_challenge, and if the word is rejected, pick another and retry.",
    `Reply with the link, the settings you used and any hints ${who} asked for.`,
    "The game has no built-in hints, so give hints in the chat only.",
    `Don't reveal the word unless ${who} ask${firstPerson ? "" : "s"}.`,
  ].join(" ");
};

const normalize = (value) => value.trim().replace(/\s+/g, " ");

const PROMPT_ARGUMENTS = [
  {
    name: "difficulty",
    title: "Difficulty",
    description:
      "Easy, Medium, Hard or Extreme. Leave blank and the AI will ask.",
    question: "Difficulty: Easy, Medium, Hard or Extreme?",
    parse: (value) =>
      Object.hasOwn(DIFFICULTIES, value.toLowerCase())
        ? { value: DIFFICULTIES[value.toLowerCase()].label }
        : { error: "difficulty must be one of: Easy, Medium, Hard, Extreme." },
  },
  {
    name: "word_length",
    title: "Word length",
    description: "4, 5, 6, 7 or random. Leave blank and the AI will ask.",
    question: "Word length: 4, 5, 6 or 7 letters, or surprise me?",
    parse: (value) => {
      if (/^[4-7]$/.test(value)) return { value: `${value} letters` };
      if (value.toLowerCase() === "random")
        return { value: "any length from 4 to 7, you choose" };
      return { error: "word_length must be 4, 5, 6, 7 or random." };
    },
  },
  {
    name: "theme",
    title: "Theme",
    description:
      "A theme for the word, or random. Leave blank and the AI will ask.",
    question: "Theme: I can name one, or you can pick a random one.",
    parse: (value) =>
      value.toLowerCase() === "random"
        ? { value: "pick a random one" }
        : { value },
  },
  {
    name: "hints",
    title: "Hints",
    description:
      "none, or what you want, such as the theme, the first letter or a short clue. Leave blank and the AI will ask.",
    question:
      "Hints: none, or tell me the theme, the first letter, or a short clue?",
    parse: (value) => ({ value }),
  },
];

const ARGUMENT_NAMES = new Set(PROMPT_ARGUMENTS.map(({ name }) => name));

const numberedQuestions = (promptArguments) =>
  promptArguments.map(({ question }, index) => `${index + 1}. ${question}`);

export const INSTRUCTIONS = [
  "Vagudle is a word-guessing game. Unlike Wordle, it only shows how many letters in each guess are green, yellow or gray, not which letters, so players have to deduce them. Use create_challenge to make a shareable link that anyone can open and play, check_words to see which dictionaries contain a word, and search_words to find valid words.",
  "When a user asks for a challenge and has not given the details, ask them these questions in a single message and wait for the answers, skipping any they already answered:",
  ...numberedQuestions(PROMPT_ARGUMENTS),
  "Turn the difficulty into settings like this:",
  ...DIFFICULTY_LINES,
  buildProcessText(false),
].join("\n");

const parseArguments = (args) => {
  const unknown = Object.keys(args).filter((key) => !ARGUMENT_NAMES.has(key));
  if (unknown.length > 0)
    return {
      invalid: `Unknown argument: ${unknown.join(", ")}. Allowed: ${[...ARGUMENT_NAMES].join(", ")}.`,
    };

  const values = new Map();
  for (const { name, parse } of PROMPT_ARGUMENTS) {
    const raw = args[name];
    if (raw === undefined) continue;
    if (typeof raw !== "string")
      return { invalid: `${name} must be a string.` };

    const value = normalize(raw);
    if (value === "") continue;
    if (value.length > MAX_TEXT_LENGTH)
      return {
        invalid: `${name} must be at most ${MAX_TEXT_LENGTH} characters.`,
      };

    const parsed = parse(value);
    if (parsed.error) return { invalid: parsed.error };
    values.set(name, parsed.value);
  }

  return { values };
};

const buildPromptText = (values) => {
  const given = PROMPT_ARGUMENTS.filter(({ name }) => values.has(name));
  const missing = PROMPT_ARGUMENTS.filter(({ name }) => !values.has(name));

  const lines = ["I want to make a Vagudle challenge using the Vagudle tools."];

  if (given.length > 0) {
    lines.push(
      "",
      "Here is what I already want:",
      ...given.map(({ name, title }) => `- ${title}: ${values.get(name)}`)
    );
  }

  lines.push("");
  if (missing.length > 0) {
    lines.push(
      "Before you pick a word, ask me these questions in a single message and wait for my answers:",
      "",
      ...numberedQuestions(missing)
    );
  } else {
    lines.push("You have everything you need, so don't ask me any questions.");
  }

  lines.push(
    "",
    "Turn my difficulty into settings like this:",
    ...DIFFICULTY_LINES,
    "",
    buildProcessText(true)
  );

  return lines.join("\n");
};

const newChallengePrompt = {
  name: "new_challenge",
  title: "Create a challenge",
  description:
    "Walks you through making a Vagudle challenge. The AI asks about difficulty, word length, theme and hints, then creates the link. Any option you fill in here is not asked again.",
  arguments: PROMPT_ARGUMENTS.map(({ name, title, description }) => ({
    name,
    title,
    description,
    required: false,
  })),
  get: (args) => {
    const { invalid, values } = parseArguments(args);
    if (invalid) return { invalid };
    return {
      result: {
        description: "Create a Vagudle challenge",
        messages: [
          {
            role: "user",
            content: { type: "text", text: buildPromptText(values) },
          },
        ],
      },
    };
  },
};

const MCP_PROMPTS = [newChallengePrompt];

export const listMcpPrompts = () =>
  MCP_PROMPTS.map(({ name, title, description, arguments: promptArgs }) => ({
    name,
    title,
    description,
    arguments: promptArgs,
  }));

export const getMcpPrompt = (params) => {
  if (typeof params.name !== "string")
    return { invalid: "Missing prompt name." };

  const prompt = MCP_PROMPTS.find(({ name }) => name === params.name);
  if (!prompt) return { invalid: `Unknown prompt: ${params.name}` };

  const args = params.arguments === undefined ? {} : params.arguments;
  if (typeof args !== "object" || args === null || Array.isArray(args))
    return { invalid: "Prompt arguments must be an object." };

  return prompt.get(args);
};
