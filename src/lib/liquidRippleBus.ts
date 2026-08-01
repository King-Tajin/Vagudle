import type { CharStatus } from "./statuses";

export type RippleEvent = {
  x: number;
  y: number;
  color: CharStatus;
  strength: number;
};

type Listener = (event: RippleEvent) => void;

const listeners = new Set<Listener>();

export const subscribeToRipples = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const emitRippleAt = (
  x: number,
  y: number,
  color: CharStatus,
  strength: number
): void => {
  const event: RippleEvent = { x, y, color, strength };
  listeners.forEach((listener) => listener(event));
};

export const emitRippleFromPoint = (
  clientX: number,
  clientY: number,
  color: CharStatus,
  strength = 1
): void => {
  if (typeof window === "undefined") return;
  if (window.innerWidth === 0 || window.innerHeight === 0) return;
  emitRippleAt(
    clientX / window.innerWidth,
    clientY / window.innerHeight,
    color,
    strength
  );
};

export const emitRippleFromCell = (
  row: number,
  col: number,
  color: CharStatus,
  strength = 1
): void => {
  if (typeof document === "undefined") return;
  const el = document.querySelector(`[data-row="${row}"][data-cell="${col}"]`);
  if (!el) return;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return;
  emitRippleFromPoint(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
    color,
    strength
  );
};
