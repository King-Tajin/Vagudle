export const DAILY_TITLE =
  "Vagudle Daily: Word Game with a Leaderboard & Streaks";

export const DAILY_DESCRIPTION =
  "Vagudle Daily is a free once-a-day word puzzle. A new word unlocks every day at 08:00 UTC, rotating between 4- and 5-letter, normal and hard mode. Track your streak on the leaderboard and subscribe to a calendar reminder so you never miss one.";

export const DAILY_URL = "https://vagudle.king-tajin.dev/daily";

const ROOT_DESCRIPTION =
  "Vagudle is a free word game with more challenge: unlimited plays, harder dictionaries, up to 11 tries, custom word challenges, plus a daily mode with a leaderboard.";

const ROOT_TITLE = "Vagudle: A Harder Word Guessing Game";

const HIDDEN_MAIN_PATTERN = /<main\s+aria-hidden="true"[\s\S]*?<\/main>/;

const DAILY_HIDDEN_MAIN = `<main
        aria-hidden="true"
        style="
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
        "
      >
        <h1>Vagudle Daily: A Once-a-Day Word Puzzle with a Leaderboard</h1>
        <p>
          Vagudle Daily is a free daily word puzzle built on top of Vagudle,
          a harder take on Hardle-style guessing games. A new puzzle unlocks
          once a day at 08:00 UTC and stays the same for everyone until the
          next release. Built and maintained by
          <a href="https://King-Tajin.dev">King-Tajin</a>.
        </p>

        <h2>Daily Schedule</h2>
        <p>
          The daily word length and difficulty rotate on a repeating 7-day
          schedule: Sunday is a 4-letter normal word, Monday is 4-letter hard
          mode, Tuesday is a 5-letter normal word, Wednesday is 5-letter hard
          mode, Thursday is a 4-letter normal word, Friday is 5-letter hard
          mode, and Saturday is 4-letter hard mode. Every player around the
          world gets the same word for the day, and a new one unlocks daily
          at 08:00 UTC.
        </p>

        <h2>Streaks and Leaderboard</h2>
        <p>
          Each daily completion counts toward your streak, which is tracked
          alongside your guess count on a live leaderboard. Sign in to save
          your progress and compare your streak against other players.
        </p>

        <h2>Calendar Reminders</h2>
        <p>
          To help you keep your streak alive, Vagudle offers subscribable
          calendar reminders so a notification shows up around the time each
          day's word unlocks.
        </p>

        <h2>How to Play</h2>
        <p>
          Type a word and press Enter to submit a guess. Color counts indicate
          right letter/right spot (Green), right letter/wrong spot (Yellow),
          or letter not in the word (Gray).
        </p>

        <h2>Open Source</h2>
        <p>
          Vagudle is
          <a href="https://github.com/King-Tajin/Vagudle"
            >open source on GitHub</a
          >
          and based on
          <a href="https://github.com/markzither/react-wordle">react-wordle</a>.
          Contributions and feedback are welcome.
        </p>

        <img src="/logo192.png" alt="Vagudle logo" width="192" height="192" />
      </main>`;

export const applyDailySeo = (html) => {
  let out = html;

  out = out.replaceAll(
    'href="https://vagudle.king-tajin.dev/"',
    `href="${DAILY_URL}"`
  );
  out = out.replaceAll(
    'content="https://vagudle.king-tajin.dev/"',
    `content="${DAILY_URL}"`
  );
  out = out.replaceAll(`content="${ROOT_TITLE}"`, `content="${DAILY_TITLE}"`);
  out = out.replaceAll(
    `<title>Vagudle</title>`,
    `<title>${DAILY_TITLE}</title>`
  );
  out = out.replaceAll(
    `content="${ROOT_DESCRIPTION}"`,
    `content="${DAILY_DESCRIPTION}"`
  );

  out = out.replace(HIDDEN_MAIN_PATTERN, DAILY_HIDDEN_MAIN);

  return out;
};
