import { lerpColor, averageColor } from "./colorUtils";

export const DIRT_PIXEL_SIZE = 6;
export const DIRT_COLOR_UNIFORMITY = 0.58;

export const DIRT_COLORS = [
  "#3d1f0a",
  "#4a2810",
  "#5c3317",
  "#2d1508",
  "#6b4423",
  "#4e2c13",
];
export const STONE_COLORS = ["#4a4a52", "#5a5a62", "#3a3a42"];
export const ORGANIC_COLORS = ["#2a1505", "#1f1002", "#362010"];
export const STONE_CHANCE = 0.055;
export const ORGANIC_CHANCE = 0.075;

const ALL_DIRT_COLORS = [...DIRT_COLORS, ...STONE_COLORS, ...ORGANIC_COLORS];
export const DIRT_AVG_COLOR = averageColor(ALL_DIRT_COLORS);

export const GRASS_COLORS = [
  "#3f7d20",
  "#4f9a2c",
  "#5cb033",
  "#376b1c",
  "#2f5c17",
];
export const GRASS_COLOR_UNIFORMITY = 0.4;
export const GRASS_ROWS_MIN = 2;
export const GRASS_ROWS_MAX = 4;

const GRASS_AVG_COLOR = averageColor(GRASS_COLORS);

export const drawGrassTexture = (canvas: HTMLCanvasElement): void => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const cols = Math.ceil(canvas.width / DIRT_PIXEL_SIZE);

  for (let col = 0; col < cols; col++) {
    const rows =
      GRASS_ROWS_MIN +
      Math.floor(Math.random() * (GRASS_ROWS_MAX - GRASS_ROWS_MIN + 1));

    for (let row = 0; row < rows; row++) {
      const color =
        GRASS_COLORS[Math.floor(Math.random() * GRASS_COLORS.length)];
      ctx.fillStyle = lerpColor(color, GRASS_AVG_COLOR, GRASS_COLOR_UNIFORMITY);
      ctx.fillRect(
        col * DIRT_PIXEL_SIZE,
        row * DIRT_PIXEL_SIZE,
        DIRT_PIXEL_SIZE,
        DIRT_PIXEL_SIZE
      );
    }
  }
};

export const drawDirtTexture = (canvas: HTMLCanvasElement): void => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const cols = Math.ceil(canvas.width / DIRT_PIXEL_SIZE);
  const rows = Math.ceil(canvas.height / DIRT_PIXEL_SIZE);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const r = Math.random();
      let color: string;
      if (r < STONE_CHANCE) {
        color = STONE_COLORS[Math.floor(Math.random() * STONE_COLORS.length)];
      } else if (r < STONE_CHANCE + ORGANIC_CHANCE) {
        color =
          ORGANIC_COLORS[Math.floor(Math.random() * ORGANIC_COLORS.length)];
      } else {
        color = DIRT_COLORS[Math.floor(Math.random() * DIRT_COLORS.length)];
      }
      ctx.fillStyle = lerpColor(color, DIRT_AVG_COLOR, DIRT_COLOR_UNIFORMITY);
      ctx.fillRect(
        col * DIRT_PIXEL_SIZE,
        row * DIRT_PIXEL_SIZE,
        DIRT_PIXEL_SIZE,
        DIRT_PIXEL_SIZE
      );
    }
  }
};
