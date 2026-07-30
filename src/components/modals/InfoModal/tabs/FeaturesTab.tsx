const FEATURES: [string, string][] = [
  [
    "Variable word length",
    "Play with anywhere between 4 and 7-letter words via Settings.",
  ],
  [
    "Hard mode",
    "Solutions are selected from uncommon words and the player is limited to 9 guesses.",
  ],
  [
    "Daily",
    "A new word unlocks once a day, alternating between 4- and 5-letter, normal and hard mode. Track your streak on the leaderboard, and subscribe to a calendar reminder so you never miss one.",
  ],
  [
    "Cell painting",
    "Select a brush and click or drag across cells to color them.",
  ],
  ["Auto-Gray", "Automatically grays out letters from fully-gray rows."],
  [
    "Auto-Green",
    "Fills in user marked correct letters across all rows automatically.",
  ],
  ["Gray count", "Shows how many absent letters are in a row."],
];

export const FeaturesTab = () => {
  return (
    <ul className="space-y-4">
      {FEATURES.map(([feature, desc]) => (
        <li
          key={feature}
          className="flex flex-col gap-1 pb-4 border-b border-obsidian-700 last:border-0 last:pb-0"
        >
          <span className="font-pixel text-xs text-crown-gold tracking-wide">
            {feature}
          </span>
          <span className="font-code text-sm text-gray-400">{desc}</span>
        </li>
      ))}
    </ul>
  );
};
