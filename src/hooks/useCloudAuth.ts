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
import {
  signInWithPlayGames as triggerPlayGamesSignIn,
  getStoredPlayGamesSession,
  clearPlayGamesSession,
  maybeRenewPlayGamesSession,
  isPlayGamesAvailable,
  syncPlayGamesLeaderboard,
  PLAYGAMES_SESSION_STORAGE_KEY,
  type PlayGamesSession,
} from "../lib/playGamesCloudAuth";
import {
  isGoogleNativeAvailable,
  signInWithGoogleNative,
} from "../lib/googleNativeAuth";
import strings from "../constants/strings";

const EMAIL_LINK_STORAGE_KEY = "vagudle-email-link-address:v1";

export type CloudAuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  providerId: string;
  providerIds: string[];
};

export type DeleteAccountResult =
  | { status: "success" }
  | { status: "needs_reauth"; providerId: string }
  | { status: "error"; message: string };

const toCloudAuthUser = (user: User): CloudAuthUser => {
  const providerIds = user.providerData.map((p) => p.providerId);
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    providerId: providerIds[0] ?? "unknown",
    providerIds,
  };
};

const toCloudAuthUserFromDiscord = (
  session: DiscordSession
): CloudAuthUser => ({
  uid: session.uid,
  email: null,
  displayName: session.displayName,
  providerId: "discord.com",
  providerIds: ["discord.com"],
});

const toCloudAuthUserFromPlayGames = (
  session: PlayGamesSession
): CloudAuthUser => ({
  uid: session.uid,
  email: null,
  displayName: session.displayName,
  providerId: "playgames.google.com",
  providerIds: ["playgames.google.com"],
});

export { isPlayGamesAvailable };

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
    email = window.prompt(strings.CLOUD_AUTH_EMAIL_PROMPT_TEXT);
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
  const [playGamesSession, setPlayGamesSession] =
    useState<PlayGamesSession | null>(() => getStoredPlayGamesSession());
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
      if (event.key === DISCORD_SESSION_STORAGE_KEY) {
        setDiscordSession(getStoredDiscordSession());
      }
      if (event.key === PLAYGAMES_SESSION_STORAGE_KEY) {
        setPlayGamesSession(getStoredPlayGamesSession());
      }
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

  useEffect(() => {
    let cancelled = false;
    void maybeRenewPlayGamesSession().then((renewed) => {
      if (!cancelled) setPlayGamesSession(renewed);
      if (renewed) syncPlayGamesLeaderboard();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setActionError(null);
    try {
      const { auth, googleProvider, authModule } = await loadFirebaseAuth();

      if (isGoogleNativeAvailable()) {
        const idToken = await signInWithGoogleNative();
        if (!idToken) {
          setActionError(strings.CLOUD_AUTH_GOOGLE_SIGNIN_ERROR_TEXT);
          return;
        }
        const credential = authModule.GoogleAuthProvider.credential(idToken);
        await authModule.signInWithCredential(auth, credential);
        return;
      }

      await authModule.signInWithPopup(auth, googleProvider);
    } catch {
      setActionError(strings.CLOUD_AUTH_GOOGLE_SIGNIN_ERROR_TEXT);
    }
  }, []);

  const signInWithGithub = useCallback(async () => {
    setActionError(null);
    try {
      const { auth, githubProvider, authModule } = await loadFirebaseAuth();
      await authModule.signInWithPopup(auth, githubProvider);
    } catch {
      setActionError(strings.CLOUD_AUTH_GITHUB_SIGNIN_ERROR_TEXT);
    }
  }, []);

  const signInWithDiscord = useCallback(() => {
    setActionError(null);
    redirectToDiscord();
  }, []);

  const signInWithPlayGames = useCallback(async () => {
    setActionError(null);
    try {
      const session = await triggerPlayGamesSignIn();
      if (!session) {
        setActionError(strings.CLOUD_AUTH_PLAYGAMES_SIGNIN_ERROR_TEXT);
        return;
      }
      setPlayGamesSession(session);
    } catch {
      setActionError(strings.CLOUD_AUTH_PLAYGAMES_SIGNIN_ERROR_TEXT);
    }
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
      setActionError(strings.CLOUD_AUTH_EMAIL_LINK_ERROR_TEXT);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setActionError(null);
    try {
      const { auth, authModule } = await loadFirebaseAuth();
      await authModule.signOut(auth);
      clearDiscordSession();
      setDiscordSession(null);
      clearPlayGamesSession();
      setPlayGamesSession(null);
    } catch {
      setActionError(strings.CLOUD_AUTH_SIGNOUT_ERROR_TEXT);
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
          message: strings.CLOUD_AUTH_DELETE_ACCOUNT_ERROR_TEXT,
        };
      }
    }
    if (discordSession) {
      clearDiscordSession();
      setDiscordSession(null);
      return { status: "success" };
    }
    if (playGamesSession) {
      clearPlayGamesSession();
      setPlayGamesSession(null);
      return { status: "success" };
    }
    return {
      status: "error",
      message: strings.CLOUD_AUTH_NO_ACCOUNT_ERROR_TEXT,
    };
  }, [firebaseUser, discordSession, playGamesSession]);

  const reauthenticateAndDeleteAccount =
    useCallback(async (): Promise<DeleteAccountResult> => {
      if (!firebaseUser)
        return {
          status: "error",
          message: strings.CLOUD_AUTH_NO_ACCOUNT_ERROR_TEXT,
        };

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
            message: strings.CLOUD_AUTH_REAUTH_UNSUPPORTED_ERROR_TEXT,
          };

        await authModule.reauthenticateWithPopup(firebaseUser, provider);
        await authModule.deleteUser(firebaseUser);
        return { status: "success" };
      } catch {
        return {
          status: "error",
          message: strings.CLOUD_AUTH_REAUTH_FAILED_ERROR_TEXT,
        };
      }
    }, [firebaseUser]);

  const user = useMemo(
    () =>
      firebaseUser
        ? toCloudAuthUser(firebaseUser)
        : discordSession
          ? toCloudAuthUserFromDiscord(discordSession)
          : playGamesSession
            ? toCloudAuthUserFromPlayGames(playGamesSession)
            : null,
    [firebaseUser, discordSession, playGamesSession]
  );

  return {
    user,
    authLoading,
    actionError,
    emailLinkSent,
    signInWithGoogle,
    signInWithGithub,
    signInWithDiscord,
    signInWithPlayGames,
    sendEmailLink,
    signOutUser,
    deleteAccount,
    reauthenticateAndDeleteAccount,
  };
};
