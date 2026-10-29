const getPlayIntegrityPlugin = (): CapacitorPlayIntegrityPlugin | null => {
  if (typeof window === "undefined") return null;
  if (!window.Capacitor?.isNativePlatform?.()) return null;
  return window.Capacitor.Plugins?.PlayIntegrity ?? null;
};

export const hashRequestFields = async (fields: string[]): Promise<string> => {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(JSON.stringify(fields))
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
};

export const getIntegrityToken = async (
  requestHash: string
): Promise<string> => {
  const plugin = getPlayIntegrityPlugin();
  if (!plugin) throw new Error("Play Integrity unavailable.");

  const { token } = await plugin.requestToken({ requestHash });
  if (typeof token !== "string" || token.length === 0)
    throw new Error("Play Integrity returned no token.");
  return token;
};
