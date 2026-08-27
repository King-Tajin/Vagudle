const PUBLIC_ORIGIN = "https://vagudle.king-tajin.dev";

export function getPublicOrigin(): string {
  if (typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.()) {
    return PUBLIC_ORIGIN;
  }
  return window.location.origin;
}
