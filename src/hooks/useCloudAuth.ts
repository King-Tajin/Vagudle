import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { User, UserCredential } from "firebase/auth";
import { loadFirebaseAuth, scheduleFirebaseAuthPreload } from "../lib/firebase";
import { getPublicOrigin } from "../lib/publicOrigin";
import {
  signInWithDiscord as redirectToDiscord,
  completeDiscordSignIn as exchangeDiscordSignIn,
  consumeDiscordAuthOutcome,
  getStoredDiscordSession,
  getStoredDiscordSessionRaw,
  clearDiscordSession,
  maybeRenewDiscordSession,
  DISCORD_SESSION_STORAGE_KEY,
  type DiscordSession,
} from "../lib/discordCloudAuth";
import {
  signInWithPlayGames as triggerPlayGamesSignIn,
  getStoredPlayGamesSession,
  getStoredPlayGamesSessionRaw,
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
import type { AuthIntent } from "../lib/authIntent";
import strings from "../constants/strings";
import {
  clearSignedInMarker,
  hasSignedInMarker,
  markSignedIn,
} from "../lib/signInMarker";
import { CloudAuthContext } from "../context/cloud-auth-context";

const EMAIL_LINK_STORAGE_KEY = "vagudle-email-link-address:v1";
const RENEW_LOCK_NAME = "vagudle-session-renew";
const SESSION_CHECK_INTERVAL_MS = 60 * 1000;

const detectAuthRedirect = (): boolean => {
  try {
    const url = new URL(window.location.href);
    if (url.searchParams.get("mode") === "signIn") return true;
    return url.searchParams.has("code") && url.searchParams.has("state");
  } catch {
    return false;
  }
};

const startedFromAuthRedirect = detectAuthRedirect();

const runExclusive = <T>(task: () => Promise<T>): Promise<T> => {
  const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
  return locks ? locks.request(RENEW_LOCK_NAME, task) : task();
};

type TimedSession = { token: string; expiresAt: number };

const isSameSession = (
  a: TimedSession | null,
  b: TimedSession | null
): boolean =>
  a === b ||
  (a !== null &&
    b !== null &&
    a.token === b.token &&
    a.expiresAt === b.expiresAt);

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

export type AuthFlowMessage = "not_registered" | "already_registered";

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

export const useCloudAuthState = ({
  warnOnSessionEnd = true,
}: { warnOnSessionEnd?: boolean } = {}) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [discordSession, setDiscordSession] = useState<DiscordSession | null>(
    () => getStoredDiscordSession()
  );
  const [playGamesSession, setPlayGamesSession] =
    useState<PlayGamesSession | null>(() => getStoredPlayGamesSession());
  const [authLoading, setAuthLoading] = useState(true);
  const [authSettled, setAuthSettled] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [authFlowMessage, setAuthFlowMessage] =
    useState<AuthFlowMessage | null>(() => consumeDiscordAuthOutcome());
  const [emailLinkSent, setEmailLinkSent] = useState(false);

  const firebaseUserRef = useRef<User | null>(null);
  const discordSessionRef = useRef<DiscordSession | null>(discordSession);
  const playGamesSessionRef = useRef<PlayGamesSession | null>(playGamesSession);
  const expectedFirebaseLossRef = useRef(false);
  const startupPartsRef = useRef({
    firebase: false,
    discord: false,
    playGames: false,
  });
  const startupEvaluatedRef = useRef(false);

  const applyDiscordSession = useCallback((session: DiscordSession | null) => {
    discordSessionRef.current = session;
    setDiscordSession((prev) =>
      isSameSession(prev, session) ? prev : session
    );
  }, []);

  const applyPlayGamesSession = useCallback(
    (session: PlayGamesSession | null) => {
      playGamesSessionRef.current = session;
      setPlayGamesSession((prev) =>
        isSameSession(prev, session) ? prev : session
      );
    },
    []
  );

  const reportUnexpectedSignOut = useCallback(() => {
    if (!warnOnSessionEnd || !hasSignedInMarker()) return;
    clearSignedInMarker();
    setSessionEnded(true);
  }, [warnOnSessionEnd]);

  const dismissSessionEnded = useCallback(() => setSessionEnded(false), []);

  const restoreSignedInMarker = useCallback(() => {
    const firebase = firebaseUserRef.current;
    if (firebase) markSignedIn(toCloudAuthUser(firebase).providerId);
    else if (discordSessionRef.current) markSignedIn("discord.com");
    else if (playGamesSessionRef.current) markSignedIn("playgames.google.com");
  }, []);

  const settleStartupPart = useCallback(
    (part: "firebase" | "discord" | "playGames") => {
      const parts = startupPartsRef.current;
      parts[part] = true;
      if (!parts.firebase || !parts.discord || !parts.playGames) return;
      if (startupEvaluatedRef.current) return;
      startupEvaluatedRef.current = true;
      setAuthSettled(true);

      const isSignedIn =
        firebaseUserRef.current !== null ||
        discordSessionRef.current !== null ||
        playGamesSessionRef.current !== null;
      if (isSignedIn || startedFromAuthRedirect) return;
      if (
        getStoredDiscordSessionRaw() !== null ||
        getStoredPlayGamesSessionRaw() !== null
      )
        return;
      reportUnexpectedSignOut();
    },
    [reportUnexpectedSignOut]
  );

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    scheduleFirebaseAuthPreload();

    void loadFirebaseAuth().then(({ auth, authModule }) => {
      if (cancelled) return;
      unsubscribe = authModule.onAuthStateChanged(auth, (nextUser) => {
        const hadUser = firebaseUserRef.current !== null;
        const wasExpected = expectedFirebaseLossRef.current;
        firebaseUserRef.current = nextUser;
        setFirebaseUser(nextUser);
        setAuthLoading(false);
        if (nextUser === null) {
          expectedFirebaseLossRef.current = false;
          if (
            hadUser &&
            !wasExpected &&
            discordSessionRef.current === null &&
            playGamesSessionRef.current === null
          ) {
            reportUnexpectedSignOut();
          }
        }
        settleStartupPart("firebase");
      });
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [reportUnexpectedSignOut, settleStartupPart]);

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === DISCORD_SESSION_STORAGE_KEY) {
        const hadSession = discordSessionRef.current !== null;
        const next = getStoredDiscordSession();
        applyDiscordSession(next);
        if (hadSession && next === null && event.oldValue !== null) {
          reportUnexpectedSignOut();
        }
      }
      if (event.key === PLAYGAMES_SESSION_STORAGE_KEY) {
        const hadSession = playGamesSessionRef.current !== null;
        const next = getStoredPlayGamesSession();
        applyPlayGamesSession(next);
        if (hadSession && next === null && event.oldValue !== null) {
          reportUnexpectedSignOut();
        }
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [applyDiscordSession, applyPlayGamesSession, reportUnexpectedSignOut]);

  useEffect(() => {
    let cancelled = false;
    void runExclusive(() => maybeRenewDiscordSession())
      .then((renewed) => {
        if (!cancelled) applyDiscordSession(renewed);
      })
      .finally(() => {
        if (!cancelled) settleStartupPart("discord");
      });
    return () => {
      cancelled = true;
    };
  }, [applyDiscordSession, settleStartupPart]);

  useEffect(() => {
    let cancelled = false;
    void runExclusive(() => maybeRenewPlayGamesSession())
      .then((renewed) => {
        if (!cancelled) applyPlayGamesSession(renewed);
        if (renewed) syncPlayGamesLeaderboard();
      })
      .finally(() => {
        if (!cancelled) settleStartupPart("playGames");
      });
    return () => {
      cancelled = true;
    };
  }, [applyPlayGamesSession, settleStartupPart]);

  const checkProviderSessions = useCallback(async () => {
    if (!startupEvaluatedRef.current) return;

    const discordBefore = discordSessionRef.current;
    if (discordBefore) {
      const renewed = await runExclusive(() => maybeRenewDiscordSession());
      if (discordSessionRef.current === discordBefore) {
        if (renewed === null || renewed.expiresAt <= Date.now()) {
          clearDiscordSession();
          applyDiscordSession(null);
          reportUnexpectedSignOut();
        } else {
          applyDiscordSession(renewed);
        }
      }
    }

    const playGamesBefore = playGamesSessionRef.current;
    if (playGamesBefore) {
      const renewed = await runExclusive(() => maybeRenewPlayGamesSession());
      if (playGamesSessionRef.current === playGamesBefore) {
        if (renewed === null || renewed.expiresAt <= Date.now()) {
          clearPlayGamesSession();
          applyPlayGamesSession(null);
          reportUnexpectedSignOut();
        } else {
          applyPlayGamesSession(renewed);
        }
      }
    }
  }, [applyDiscordSession, applyPlayGamesSession, reportUnexpectedSignOut]);

  useEffect(() => {
    const run = () => {
      void checkProviderSessions();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") run();
    };
    const intervalId = window.setInterval(run, SESSION_CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkProviderSessions]);

  const clearAuthFlowMessage = useCallback(() => {
    setAuthFlowMessage(null);
  }, []);

  const resolveFirebaseIntent = useCallback(
    async (
      authModule: Awaited<ReturnType<typeof loadFirebaseAuth>>["authModule"],
      auth: Awaited<ReturnType<typeof loadFirebaseAuth>>["auth"],
      userCredential: UserCredential,
      intent: AuthIntent
    ): Promise<boolean> => {
      const isNewUser =
        authModule.getAdditionalUserInfo(userCredential)?.isNewUser ?? false;

      if (intent === "signin" && isNewUser) {
        expectedFirebaseLossRef.current = true;
        try {
          await authModule.deleteUser(userCredential.user);
        } catch {
          expectedFirebaseLossRef.current = false;
        }
        clearSignedInMarker();
        setAuthFlowMessage("not_registered");
        return false;
      }

      if (intent === "create" && !isNewUser) {
        expectedFirebaseLossRef.current = true;
        try {
          await authModule.signOut(auth);
        } catch {
          expectedFirebaseLossRef.current = false;
        }
        clearSignedInMarker();
        setAuthFlowMessage("already_registered");
        return false;
      }

      return true;
    },
    []
  );

  const signInWithGoogle = useCallback(
    async (intent: AuthIntent) => {
      setActionError(null);
      setAuthFlowMessage(null);
      try {
        const { auth, googleProvider, authModule } = await loadFirebaseAuth();

        if (isGoogleNativeAvailable()) {
          const idToken = await signInWithGoogleNative();
          if (!idToken) {
            setActionError(strings.CLOUD_AUTH_GOOGLE_SIGNIN_ERROR_TEXT);
            return;
          }
          const credential = authModule.GoogleAuthProvider.credential(idToken);
          const result = await authModule.signInWithCredential(
            auth,
            credential
          );
          await resolveFirebaseIntent(authModule, auth, result, intent);
          return;
        }

        const result = await authModule.signInWithPopup(auth, googleProvider);
        await resolveFirebaseIntent(authModule, auth, result, intent);
      } catch {
        setActionError(strings.CLOUD_AUTH_GOOGLE_SIGNIN_ERROR_TEXT);
      }
    },
    [resolveFirebaseIntent]
  );

  const signInWithGithub = useCallback(
    async (intent: AuthIntent) => {
      setActionError(null);
      setAuthFlowMessage(null);
      try {
        const { auth, githubProvider, authModule } = await loadFirebaseAuth();
        const result = await authModule.signInWithPopup(auth, githubProvider);
        await resolveFirebaseIntent(authModule, auth, result, intent);
      } catch {
        setActionError(strings.CLOUD_AUTH_GITHUB_SIGNIN_ERROR_TEXT);
      }
    },
    [resolveFirebaseIntent]
  );

  const signInWithDiscord = useCallback((intent: AuthIntent) => {
    setActionError(null);
    setAuthFlowMessage(null);
    redirectToDiscord(intent);
  }, []);

  const signInWithPlayGames = useCallback(
    async (intent: AuthIntent) => {
      setActionError(null);
      setAuthFlowMessage(null);
      try {
        const outcome = await triggerPlayGamesSignIn(intent);
        if (outcome.status === "signed_in") {
          applyPlayGamesSession(outcome.session);
          return;
        }
        if (
          outcome.status === "not_registered" ||
          outcome.status === "already_registered"
        ) {
          setAuthFlowMessage(outcome.status);
          return;
        }
        setActionError(strings.CLOUD_AUTH_PLAYGAMES_SIGNIN_ERROR_TEXT);
      } catch {
        setActionError(strings.CLOUD_AUTH_PLAYGAMES_SIGNIN_ERROR_TEXT);
      }
    },
    [applyPlayGamesSession]
  );

  const checkEmailAccountExists = useCallback(
    async (email: string): Promise<"exists" | "not_found" | "error"> => {
      try {
        const res = await fetch("/api/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!res.ok) return "error";

        const data = (await res.json()) as {
          success: boolean;
          exists?: boolean;
        };
        if (!data.success) return "error";
        return data.exists ? "exists" : "not_found";
      } catch {
        return "error";
      }
    },
    []
  );

  const sendEmailLink = useCallback(
    async (email: string, intent: AuthIntent) => {
      setActionError(null);
      setAuthFlowMessage(null);
      setEmailLinkSent(false);
      try {
        const existsResult = await checkEmailAccountExists(email);
        if (existsResult === "error") {
          setActionError(strings.CLOUD_AUTH_EMAIL_LINK_ERROR_TEXT);
          return;
        }
        if (intent === "signin" && existsResult === "not_found") {
          setAuthFlowMessage("not_registered");
          return;
        }
        if (intent === "create" && existsResult === "exists") {
          setAuthFlowMessage("already_registered");
          return;
        }

        const { auth, authModule } = await loadFirebaseAuth();
        await authModule.sendSignInLinkToEmail(auth, email, {
          url: `${getPublicOrigin()}${window.location.pathname}${window.location.search}${window.location.hash}`,
          handleCodeInApp: true,
        });
        try {
          localStorage.setItem(EMAIL_LINK_STORAGE_KEY, email);
        } catch {}
        setEmailLinkSent(true);
      } catch {
        setActionError(strings.CLOUD_AUTH_EMAIL_LINK_ERROR_TEXT);
      }
    },
    [checkEmailAccountExists]
  );

  const signOutUser = useCallback(async () => {
    setActionError(null);
    clearSignedInMarker();
    expectedFirebaseLossRef.current = firebaseUserRef.current !== null;
    try {
      const { auth, authModule } = await loadFirebaseAuth();
      await authModule.signOut(auth);
      clearDiscordSession();
      applyDiscordSession(null);
      clearPlayGamesSession();
      applyPlayGamesSession(null);
    } catch {
      expectedFirebaseLossRef.current = false;
      restoreSignedInMarker();
      setActionError(strings.CLOUD_AUTH_SIGNOUT_ERROR_TEXT);
    }
  }, [applyDiscordSession, applyPlayGamesSession, restoreSignedInMarker]);

  const deleteAccount = useCallback(async (): Promise<DeleteAccountResult> => {
    if (firebaseUser) {
      clearSignedInMarker();
      expectedFirebaseLossRef.current = true;
      try {
        const { authModule } = await loadFirebaseAuth();
        await authModule.deleteUser(firebaseUser);
        return { status: "success" };
      } catch (error) {
        expectedFirebaseLossRef.current = false;
        restoreSignedInMarker();
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
      clearSignedInMarker();
      clearDiscordSession();
      applyDiscordSession(null);
      return { status: "success" };
    }
    if (playGamesSession) {
      clearSignedInMarker();
      clearPlayGamesSession();
      applyPlayGamesSession(null);
      return { status: "success" };
    }
    return {
      status: "error",
      message: strings.CLOUD_AUTH_NO_ACCOUNT_ERROR_TEXT,
    };
  }, [
    firebaseUser,
    discordSession,
    playGamesSession,
    applyDiscordSession,
    applyPlayGamesSession,
    restoreSignedInMarker,
  ]);

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
        clearSignedInMarker();
        expectedFirebaseLossRef.current = true;
        await authModule.deleteUser(firebaseUser);
        return { status: "success" };
      } catch {
        expectedFirebaseLossRef.current = false;
        restoreSignedInMarker();
        return {
          status: "error",
          message: strings.CLOUD_AUTH_REAUTH_FAILED_ERROR_TEXT,
        };
      }
    }, [firebaseUser, restoreSignedInMarker]);

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

  useEffect(() => {
    if (user) markSignedIn(user.providerId);
  }, [user]);

  return {
    user,
    authLoading,
    authSettled,
    sessionEnded,
    dismissSessionEnded,
    actionError,
    authFlowMessage,
    clearAuthFlowMessage,
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

export type CloudAuthValue = ReturnType<typeof useCloudAuthState>;

export const useCloudAuth = (): CloudAuthValue => {
  const value = useContext(CloudAuthContext);
  if (!value) {
    throw new Error("useCloudAuth must be used within a CloudAuthProvider");
  }
  return value;
};
