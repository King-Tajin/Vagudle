export const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const rgbToHex = (r: number, g: number, b: number): string =>
  "#" +
  [r, g, b]
    .map((v) =>
      Math.round(Math.min(255, Math.max(0, v)))
        .toString(16)
        .padStart(2, "0")
    )
    .join("");

export const lerpColor = (from: string, to: string, t: number): string => {
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
};

export const averageColor = (colors: string[]): string => {
  const sum = colors.reduce(
    ([ra, ga, ba], h) => {
      const [r, g, b] = hexToRgb(h);
      return [ra + r, ga + g, ba + b] as [number, number, number];
    },
    [0, 0, 0] as [number, number, number]
  );
  return rgbToHex(
    sum[0] / colors.length,
    sum[1] / colors.length,
    sum[2] / colors.length
  );
};
