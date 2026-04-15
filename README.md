# Vagudle

A word-guessing game built on top of [Hardle](https://hardle.org), with extra tools for tracking and solving the puzzle your way. Play at [vagudle.king-tajin.dev](https://vagudle.king-tajin.dev).

## How to Play

Type a word and press **Enter** to submit a guess. You have 9–11 tries (depending on difficulty) to find the hidden word.

Unlike Hardle, cells do not color automatically. After each guess, select a brush from the toolbar and click or drag across cells to mark what the game told you:

- 🟩 **Green brush** — right letter, right spot
- 🟨 **Yellow brush** — right letter, wrong spot
- ⬛ **Gray brush** — letter not in the word

Each row also shows a reset button (↺) on the left to clear its painted colors, and colored badge counts on the right showing how many green, yellow, and gray tiles you've marked.

The keyboard updates as you paint, so confirmed, present, and eliminated letters are always visible at a glance.

## Features

| Feature | Description |
|---|---|
| **Variable word length** | Play with 4, 5, 6, or 7-letter words via Settings |
| **Hard mode** | Two fewer guesses and words are older or less common English words |
| **Unlimited games** | No daily limit — play as many games as you want |
| **Cell painting** | Full manual control over coloring each cell |
| **Auto-Gray** | Optionally auto-grays letters from fully-gray rows |
| **Auto-Green** | Optionally locks correct letters across all rows automatically |
| **Row badges** | Live count of green, yellow, and gray tiles per row |
| **Game sharing** | Share individual games or your full stats |

## Running Locally

```bash
git clone https://github.com/King-Tajin/Vagudle
cd Vagudle
npm install
npm run start
```

To expose to your local network:

```bash
npm run start -- --host
```

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
