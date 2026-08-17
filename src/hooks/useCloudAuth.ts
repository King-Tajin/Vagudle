import { useCallback, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { loadFirebaseAuth, scheduleFirebaseAuthPreload } from "../lib/firebase";
import {
  signInWithDiscord as redirectToDiscord,
  completeDiscordSignIn as exchangeDiscordSignIn,
  getStoredDiscordSession,
  clearDiscordSession,
  maybeRenewDiscordSession,
  DISCORD_SESSION_STORAGE_KEY,
  type DiscordSession,
} from "../lib/discordCloudAuth";

const EMAIL_LINK_STORAGE_KEY = "vagudle-email-link-address:v1";

export type CloudAuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  providerId: string;
};

export type DeleteAccountResult =
  | { status: "success" }
  | { status: "needs_reauth"; providerId: string }
  | { status: "error"; message: string };

const toCloudAuthUser = (user: User): CloudAuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  providerId: user.providerData[0]?.providerId ?? "unknown",
});

const toCloudAuthUserFromDiscord = (
  session: DiscordSession
): CloudAuthUser => ({
  uid: session.uid,
  email: null,
  displayName: session.displayName,
  providerId: "discord.com",
});

const looksLikeEmailSignInLink = (href: string): boolean =>
  href.includes("mode=signIn");

export const completeEmailLinkSignIn = async (): Promise<void> => {
  if (!looksLikeEmailSignInLink(window.location.href)) return;

  const { auth, authModule } = await loadFirebaseAuth();
  if (!authModule.isSignInWithEmailLink(auth, window.location.href)) return;

  let email: string | null = null;
  try {
    email = localStorage.getItem(EMAIL_LINK_STORAGE_KEY);
  } catch {}

  if (!email) {
    email = window.prompt("Confirm your email to finish signing in:");
  }
  if (!email) return;

  try {
    await authModule.signInWithEmailLink(auth, email, window.location.href);
    try {
      localStorage.removeItem(EMAIL_LINK_STORAGE_KEY);
    } catch {}
    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState({}, document.title, url.toString());
  } catch {}
};

export const completeDiscordSignIn = async (): Promise<void> => {
  await exchangeDiscordSignIn();
};

export const useCloudAuth = () => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [discordSession, setDiscordSession] = useState<DiscordSession | null>(
    () => getStoredDiscordSession()
  );
  const [authLoading, setAuthLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [emailLinkSent, setEmailLinkSent] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    scheduleFirebaseAuthPreload();

    void loadFirebaseAuth().then(({ auth, authModule }) => {
      if (cancelled) return;
      unsubscribe = authModule.onAuthStateChanged(auth, (user) => {
        setFirebaseUser(user);
        setAuthLoading(false);
      });
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key !== DISCORD_SESSION_STORAGE_KEY) return;
      setDiscordSession(getStoredDiscordSession());
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void maybeRenewDiscordSession().then((renewed) => {
      if (!cancelled) setDiscordSession(renewed);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setActionError(null);
    try {
      const { auth, googleProvider, authModule } = await loadFirebaseAuth();
      await authModule.signInWithPopup(auth, googleProvider);
    } catch {
      setActionError("Google sign-in failed. Please try again.");
    }
  }, []);

  const signInWithGithub = useCallback(async () => {
    setActionError(null);
    try {
      const { auth, githubProvider, authModule } = await loadFirebaseAuth();
      await authModule.signInWithPopup(auth, githubProvider);
    } catch {
      setActionError("GitHub sign-in failed. Please try again.");
    }
  }, []);

  const signInWithDiscord = useCallback(() => {
    setActionError(null);
    redirectToDiscord();
  }, []);

  const sendEmailLink = useCallback(async (email: string) => {
    setActionError(null);
    setEmailLinkSent(false);
    try {
      const { auth, authModule } = await loadFirebaseAuth();
      await authModule.sendSignInLinkToEmail(auth, email, {
        url: window.location.href,
        handleCodeInApp: true,
      });
      try {
        localStorage.setItem(EMAIL_LINK_STORAGE_KEY, email);
      } catch {}
      setEmailLinkSent(true);
    } catch {
      setActionError("Couldn't send sign-in link. Please try again.");
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setActionError(null);
    try {
      const { auth, authModule } = await loadFirebaseAuth();
      await authModule.signOut(auth);
      clearDiscordSession();
      setDiscordSession(null);
    } catch {
      setActionError("Sign-out failed. Please try again.");
    }
  }, []);

  const deleteAccount = useCallback(async (): Promise<DeleteAccountResult> => {
    if (firebaseUser) {
      try {
        const { authModule } = await loadFirebaseAuth();
        await authModule.deleteUser(firebaseUser);
        return { status: "success" };
      } catch (error) {
        const code = (error as { code?: string })?.code;
        if (code === "auth/requires-recent-login") {
          const providerId =
            firebaseUser.providerData[0]?.providerId ?? "unknown";
          return { status: "needs_reauth", providerId };
        }
        return {
          status: "error",
          message: "Couldn't delete your account. Please try again.",
        };
      }
    }
    if (discordSession) {
      clearDiscordSession();
      setDiscordSession(null);
      return { status: "success" };
    }
    return { status: "error", message: "No signed-in account found." };
  }, [firebaseUser, discordSession]);

  const reauthenticateAndDeleteAccount =
    useCallback(async (): Promise<DeleteAccountResult> => {
      if (!firebaseUser)
        return { status: "error", message: "No signed-in account found." };

      const providerId = firebaseUser.providerData[0]?.providerId;

      try {
        const { authModule, googleProvider, githubProvider } =
          await loadFirebaseAuth();
        const provider =
          providerId === "google.com"
            ? googleProvider
            : providerId === "github.com"
              ? githubProvider
              : null;

        if (!provider)
          return {
            status: "error",
            message:
              "This sign-in method can't be re-authorized here. Please sign out, sign back in, then try deleting your account again.",
          };

        await authModule.reauthenticateWithPopup(firebaseUser, provider);
        await authModule.deleteUser(firebaseUser);
        return { status: "success" };
      } catch {
        return {
          status: "error",
          message: "Re-authorization failed. Please try again.",
        };
      }
    }, [firebaseUser]);

  const user = useMemo(
    () =>
      firebaseUser
        ? toCloudAuthUser(firebaseUser)
        : discordSession
          ? toCloudAuthUserFromDiscord(discordSession)
          : null,
    [firebaseUser, discordSession]
  );

  return {
    user,
    authLoading,
    actionError,
    emailLinkSent,
    signInWithGoogle,
    signInWithGithub,
    signInWithDiscord,
    sendEmailLink,
    signOutUser,
    deleteAccount,
    reauthenticateAndDeleteAccount,
  };
};
