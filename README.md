# Vagudle

A word-guessing game built on top of [Hardle](https://hardle.org), with extra tools for tracking and solving the puzzle your way. Play at [vagudle.king-tajin.dev](https://vagudle.king-tajin.dev).

## How to Play

Type a word and press **Enter** to submit a guess. You have 9–11 tries (depending on difficulty) to find the hidden word.

Unlike Wordle, cells do not color automatically. After each guess, select a brush from the toolbar and click or drag across cells to mark what you can figure out with counts and guesses you made:

- 🟩 **Green brush** — right letter, right spot
- 🟨 **Yellow brush** — right letter, wrong spot
- ⬛ **Gray brush** — letter not in the word

Each row also shows a reset button (↺) on the left to clear its painted colors, and colored badge counts on the right showing how many green, yellow, and gray tiles you've marked.

The keyboard updates as you paint, so confirmed, present, and eliminated letters are always visible at a glance.

## Features

| Feature                  | Description                                                        |
| ------------------------ | ------------------------------------------------------------------ |
| **Variable word length** | Play with 4, 5, 6, or 7-letter words via Settings                  |
| **Hard mode**            | Two fewer guesses and words are older or less common English words |
| **Unlimited games**      | No daily limit — play as many games as you want                    |
| **Cell painting**        | Full manual control over coloring each cell                        |
| **Auto-Gray**            | Optionally auto-grays letters from fully-gray rows                 |
| **Auto-Green**           | Optionally locks correct letters across all rows automatically     |
| **Row badges**           | Live count of green, yellow, and gray tiles per row                |
| **Game sharing**         | Share individual games or your full stats                          |
| **Challenges**           | Create a custom word challenge and share a link for others to play |

## Running Locally

```bash
git clone https://github.com/King-Tajin/Vagudle
cd Vagudle
pnpm install
pnpm start
```

To expose to your local network:

```bash
pnpm start -- --host
```

### Challenge Links (optional)

Challenge links run through a Cloudflare Pages Function that requires [Wrangler](https://developers.cloudflare.com/workers/wrangler) to work locally. Without it, the rest of the game works normally but challenge links will fail.

Wrangler is already included as a dev dependency, so no extra install step is needed.

Copy `.dev.vars.example` to `.dev.vars`. It contains a placeholder `CHALLENGE_KEY` that you can replace with any non-empty string of your choosing.

Then instead of `pnpm start`, run:

```bash
pnpm exec wrangler pages dev -- pnpm start
```

### Duels (external app required)

The duel feature is not self-contained. Duel links cannot be generated from within Vagudle, they require an external application to:

1. Generate the encoded duel token and two player links
2. Pre-insert placeholder rows into the D1 database before the links are sent
3. Handle the webhook notification Vagudle fires on completion

Without the external app, visiting a duel link will show an invalid link error. The duel feature is used exclusively by the [Tajin Helper Bot](https://github.com/King-Tajin/King-Tajin-Discord-Bot).

## Built With

- [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion)
- [Headless UI](https://headlessui.com)

## Credits

Based on [react-wordle](https://github.com/markzither/react-wordle) by markzither, inspired by [Hardle](https://hardle.org).

Built and maintained by [King-Tajin](https://king-tajin.dev).

## License

See [LICENSE](./LICENSE).

## Privacy Policy

See [PRIVACY POLICY](https://vagudle.king-tajin.dev/privacy_policy.txt).
