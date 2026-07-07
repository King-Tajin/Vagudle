import React, { useEffect, useRef } from "react";
import { lerpColor } from "../../lib/colorUtils";

const FONT_SIZE = 21;
const COLUMN_WIDTH = 21;
const FALL_SPEED_MIN = 0.02;
const FALL_SPEED_MAX = 0.18;
const LETTER_CHANGE_CHANCE = 0.01;
const MAX_TRAIL_LENGTH = 10;
const TRAIL_COLOR = "#000000";
const BACKGROUND_COLOR = "#0d1322";
const PURPLE_HUE = 275;
const PURPLE_HUE_VARIANCE = 10;
const PURPLE_SATURATION = 75;
const PURPLE_LIGHTNESS = 65;
const PURPLE_LIGHTNESS_VARIANCE = 12;

const LETTER_WEIGHTS: [string, number][] = [
  // all weights from https://en.wikipedia.org/wiki/Letter_frequency
  ["A", 8.167],
  ["B", 1.492],
  ["C", 2.782],
  ["D", 4.253],
  ["E", 12.702],
  ["F", 2.228],
  ["G", 2.015],
  ["H", 6.094],
  ["I", 6.966],
  ["J", 0.153],
  ["K", 0.772],
  ["L", 4.025],
  ["M", 2.406],
  ["N", 6.749],
  ["O", 7.507],
  ["P", 1.929],
  ["Q", 0.095],
  ["R", 5.987],
  ["S", 6.327],
  ["T", 9.056],
  ["U", 2.758],
  ["V", 0.978],
  ["W", 2.36],
  ["X", 0.15],
  ["Y", 1.974],
  ["Z", 0.074],
];

const TOTAL_WEIGHT = LETTER_WEIGHTS.reduce((sum, [, w]) => sum + w, 0);

const pickWeightedLetter = (): string => {
  let roll = Math.random() * TOTAL_WEIGHT;
  for (const [letter, weight] of LETTER_WEIGHTS) {
    roll -= weight;
    if (roll <= 0) return letter;
  }
  return LETTER_WEIGHTS[LETTER_WEIGHTS.length - 1][0];
};

const hslToHex = (h: number, s: number, l: number): string => {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const hPrime = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hPrime % 2) - 1));
  let r: number;
  let g: number;
  let b: number;
  if (hPrime < 1) [r, g, b] = [c, x, 0];
  else if (hPrime < 2) [r, g, b] = [x, c, 0];
  else if (hPrime < 3) [r, g, b] = [0, c, x];
  else if (hPrime < 4) [r, g, b] = [0, x, c];
  else if (hPrime < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = lNorm - c / 2;
  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const pickPurpleColor = (): string => {
  const hue = PURPLE_HUE + (Math.random() * 2 - 1) * PURPLE_HUE_VARIANCE;
  const lightness =
    PURPLE_LIGHTNESS + (Math.random() * 2 - 1) * PURPLE_LIGHTNESS_VARIANCE;
  return hslToHex(hue, PURPLE_SATURATION, Math.min(95, Math.max(5, lightness)));
};

interface Column {
  x: number;
  y: number;
  rowIndex: number;
  speed: number;
  headColor: string;
  letters: string[];
}

const buildColumn = (x: number, y: number): Column => ({
  x,
  y,
  rowIndex: Math.floor(y / FONT_SIZE),
  speed: FALL_SPEED_MIN + Math.random() * (FALL_SPEED_MAX - FALL_SPEED_MIN),
  headColor: pickPurpleColor(),
  letters: [pickWeightedLetter()],
});

export const LetterRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let columns: Column[] = [];
    let rafId: number;

    const setup = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const count = Math.ceil(canvas.width / COLUMN_WIDTH);
      columns = Array.from({ length: count }, (_, i) =>
        buildColumn(i * COLUMN_WIDTH, Math.random() * canvas.height)
      );
    };

    setup();

    const tick = () => {
      ctx.fillStyle = BACKGROUND_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `bold ${FONT_SIZE}px monospace`;
      ctx.textAlign = "center";

      for (const col of columns) {
        for (let i = 0; i < col.letters.length; i++) {
          const py = col.y - i * FONT_SIZE;
          if (py < -FONT_SIZE || py > canvas.height + FONT_SIZE) continue;
          const t = MAX_TRAIL_LENGTH <= 1 ? 0 : i / (MAX_TRAIL_LENGTH - 1);
          ctx.fillStyle = lerpColor(col.headColor, TRAIL_COLOR, t);
          ctx.fillText(col.letters[i], col.x + COLUMN_WIDTH / 2, py);
        }

        if (Math.random() < LETTER_CHANGE_CHANCE) {
          col.letters[0] = pickWeightedLetter();
        }

        col.y += col.speed * FONT_SIZE;
        const newRowIndex = Math.floor(col.y / FONT_SIZE);
        if (newRowIndex !== col.rowIndex) {
          col.rowIndex = newRowIndex;
          col.letters.unshift(pickWeightedLetter());
          if (col.letters.length > MAX_TRAIL_LENGTH) col.letters.pop();
        }

        if (col.y > canvas.height + MAX_TRAIL_LENGTH * FONT_SIZE) {
          const fresh = buildColumn(col.x, -FONT_SIZE);
          Object.assign(col, fresh);
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(setup, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};
