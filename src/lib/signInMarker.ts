const SIGNED_IN_MARKER_KEY = "vagudle-was-signed-in:v1";

export const markSignedIn = (providerId: string): void => {
  try {
    localStorage.setItem(
      SIGNED_IN_MARKER_KEY,
      JSON.stringify({ providerId, at: Date.now() })
    );
  } catch {}
};

export const clearSignedInMarker = (): void => {
  try {
    localStorage.removeItem(SIGNED_IN_MARKER_KEY);
  } catch {}
};

export const hasSignedInMarker = (): boolean => {
  try {
    return localStorage.getItem(SIGNED_IN_MARKER_KEY) !== null;
  } catch {
    return false;
  }
};
