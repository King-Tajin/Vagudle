export type CapacitorFirebaseAuthPlugin = {
  signInWithGoogle: () => Promise<{
    credential?: { idToken?: string | null } | null;
  }>;
};

export const isGoogleNativeAvailable = (): boolean => {
  const capacitor = window.Capacitor;
  if (!capacitor?.isNativePlatform?.()) return false;
  return !!capacitor.Plugins?.FirebaseAuthentication;
};

export const signInWithGoogleNative = async (): Promise<string | null> => {
  const plugin = window.Capacitor?.Plugins?.FirebaseAuthentication;
  if (!plugin) return null;

  const result = await plugin.signInWithGoogle();
  return result.credential?.idToken ?? null;
};
