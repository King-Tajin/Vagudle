import React, { useEffect, useRef } from "react";
import { lerpColor, hslToHex } from "../../lib/colorUtils";
import { pickWeightedLetter } from "../../constants/letterWeights";
import { attachResizableAnimationLoop } from "../../lib/animationLoop";

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
    const rafIdRef = { current: 0 };

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

      rafIdRef.current = requestAnimationFrame(tick);
    };

    return attachResizableAnimationLoop(rafIdRef, tick, setup);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};
