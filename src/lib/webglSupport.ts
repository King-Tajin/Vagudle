import type { BackgroundId } from "./backgrounds";

export const isWebglSupported = (): boolean => {
  if (typeof document === "undefined") return true;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
};

type Listener = (backgroundId: BackgroundId) => void;

const listeners = new Set<Listener>();

export const subscribeToWebglUnavailable = (
  listener: Listener
): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const notifyWebglUnavailable = (backgroundId: BackgroundId): void => {
  listeners.forEach((listener) => listener(backgroundId));
};
