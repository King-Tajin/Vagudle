export const createRng = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const seedFromNumbers = (...values: number[]): number => {
  let hash = 2166136261;
  for (const value of values) {
    const rounded = Math.round(value);
    hash ^= rounded;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};
