export type PlayGamesAchievementEntry =
  | { type: "unlock"; playGamesId: string }
  | { type: "incremental"; playGamesId: string; target: number };

export const PLAY_GAMES_ACHIEVEMENT_MAP: Record<
  string,
  PlayGamesAchievementEntry
> = {
  first_win: { type: "unlock", playGamesId: "CgkIsKCwqpsCEAIQIQ" },
  win_15: {
    type: "incremental",
    playGamesId: "CgkIsKCwqpsCEAIQGw",
    target: 15,
  },
  win_50: {
    type: "incremental",
    playGamesId: "CgkIsKCwqpsCEAIQIA",
    target: 50,
  },
  on_a_roll: {
    type: "incremental",
    playGamesId: "CgkIsKCwqpsCEAIQFw",
    target: 5,
  },
  unstoppable: {
    type: "incremental",
    playGamesId: "CgkIsKCwqpsCEAIQEQ",
    target: 15,
  },
  hard_5plus: { type: "unlock", playGamesId: "CgkIsKCwqpsCEAIQGA" },
  fifth_guess: { type: "unlock", playGamesId: "CgkIsKCwqpsCEAIQFQ" },
  seven_letters: { type: "unlock", playGamesId: "CgkIsKCwqpsCEAIQGg" },
  close_but_no_cigar: { type: "unlock", playGamesId: "CgkIsKCwqpsCEAIQFA" },
  process_of_elimination: {
    type: "unlock",
    playGamesId: "CgkIsKCwqpsCEAIQHQ",
  },
  word_connoisseur: {
    type: "incremental",
    playGamesId: "CgkIsKCwqpsCEAIQEw",
    target: 200,
  },
  quack: { type: "unlock", playGamesId: "CgkIsKCwqpsCEAIQFg" },
  guess_mouse: { type: "unlock", playGamesId: "CgkIsKCwqpsCEAIQHA" },
  nail_biter: { type: "unlock", playGamesId: "CgkIsKCwqpsCEAIQGQ" },
  diversify: { type: "unlock", playGamesId: "CgkIsKCwqpsCEAIQHw" },
  blind_faith: { type: "unlock", playGamesId: "CgkIsKCwqpsCEAIQEg" },
  completionist: {
    type: "incremental",
    playGamesId: "CgkIsKCwqpsCEAIQHg",
    target: 16,
  },
};
