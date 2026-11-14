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
import {
  signInWithDiscord as redirectToDiscord,
  completeDiscordSignIn as exchangeDiscordSignIn,
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
import { saveLastUsedAccount } from "../lib/lastUsedAccount";
import { getSignInErrorMessage } from "../lib/authErrors";
import { CloudAuthContext } from "../context/cloud-auth-context";
import { useAlert } from "../context/alert-context";
import {
  runExclusive,
  isSameSession,
  startedFromAuthRedirect,
} from "../lib/authSession";
import {
  toCloudAuthUser,
  toCloudAuthUserFromDiscord,
  toCloudAuthUserFromPlayGames,
  type AuthFlowMessage,
} from "../lib/cloudAuthUser";
import { isValidEmail } from "../lib/email";
import {
  cancelEmailLinkSignIn,
  completeEmailLinkSignIn,
  type EmailLinkSignInResult,
} from "../lib/emailLinkSignIn";
import { useEmailLinkSender } from "./useEmailLinkSender";
import { useAccountDeletion } from "./useAccountDeletion";

const SESSION_CHECK_INTERVAL_MS = 60 * 1000;
const SIGN_IN_NOTICE_DURATION_MS = 8000;

export type {
  CloudAuthUser,
  DeleteAccountResult,
  AuthFlowMessage,
} from "../lib/cloudAuthUser";
export {
  completeEmailLinkSignIn,
  type EmailLinkSignInResult,
} from "../lib/emailLinkSignIn";
export { isPlayGamesAvailable };

export type EmailLinkPromptState = {
  error: "mismatch" | null;
  submitting: boolean;
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
    useState<AuthFlowMessage | null>(null);
  const [resolvingIntent, setResolvingIntent] = useState(false);
  const { showError, showSuccess } = useAlert();
  const [signInNotice, setSignInNotice] = useState(false);
  const signInNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const announceSignIn = useCallback(() => {
    setSignInNotice(true);
    showSuccess(strings.CLOUD_AUTH_SIGNED_IN_SUCCESS_TEXT);
    if (signInNoticeTimerRef.current)
      clearTimeout(signInNoticeTimerRef.current);
    signInNoticeTimerRef.current = setTimeout(() => {
      signInNoticeTimerRef.current = null;
      setSignInNotice(false);
    }, SIGN_IN_NOTICE_DURATION_MS);
  }, [showSuccess]);

  useEffect(
    () => () => {
      if (signInNoticeTimerRef.current)
        clearTimeout(signInNoticeTimerRef.current);
    },
    []
  );
  const {
    emailLinkSent,
    emailLinkSentTo,
    emailLinkSending,
    emailLinkCooldownSeconds,
    emailLinkBusy,
    sendEmailLink,
    resetEmailLinkSent,
  } = useEmailLinkSender({ setActionError, setAuthFlowMessage });
  const [emailLinkPrompt, setEmailLinkPrompt] =
    useState<EmailLinkPromptState | null>(null);

  const resetEmailLinkState = useCallback(() => {
    resetEmailLinkSent();
    setActionError(null);
  }, [resetEmailLinkSent]);

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

  useEffect(() => {
    void exchangeDiscordSignIn().then((outcome) => {
      if (outcome.status === "signed_in") {
        applyDiscordSession(outcome.session);
        announceSignIn();
        return;
      }
      if (
        outcome.status === "not_registered" ||
        outcome.status === "already_registered"
      ) {
        setAuthFlowMessage(outcome.status);
        return;
      }
      if (outcome.status === "error") {
        setActionError(strings.CLOUD_AUTH_DISCORD_SIGNIN_ERROR_TEXT);
        showError(strings.CLOUD_AUTH_DISCORD_SIGNIN_ERROR_TEXT);
      }
    });
  }, [applyDiscordSession, announceSignIn, showError]);

  const handleEmailLinkResult = useCallback(
    (result: EmailLinkSignInResult) => {
      if (result === "needs_email") {
        setEmailLinkPrompt(
          (prev) => prev ?? { error: null, submitting: false }
        );
        return;
      }
      if (result === "email_mismatch") {
        setEmailLinkPrompt({ error: "mismatch", submitting: false });
        return;
      }
      setEmailLinkPrompt(null);
      if (result === "signed_in") announceSignIn();
      if (result === "expired")
        showError(strings.CLOUD_AUTH_EMAIL_LINK_EXPIRED_TEXT);
      if (result === "failed") showError(strings.GENERIC_ERROR_TEXT);
    },
    [announceSignIn, showError]
  );

  useEffect(() => {
    void completeEmailLinkSignIn().then(handleEmailLinkResult);
  }, [handleEmailLinkResult]);

  const confirmEmailLinkEmail = useCallback(
    async (email: string) => {
      const address = email.trim();
      if (!isValidEmail(address)) return;
      setEmailLinkPrompt({ error: null, submitting: true });
      handleEmailLinkResult(await completeEmailLinkSignIn(address));
    },
    [handleEmailLinkResult]
  );

  const dismissEmailLinkPrompt = useCallback(() => {
    cancelEmailLinkSignIn();
    setEmailLinkPrompt(null);
  }, []);

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

      announceSignIn();
      return true;
    },
    [announceSignIn]
  );

  const signInWithGoogle = useCallback(
    async (intent: AuthIntent) => {
      setActionError(null);
      setAuthFlowMessage(null);
      const maskUser = firebaseUserRef.current === null;
      if (maskUser) setResolvingIntent(true);
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
      } catch (error) {
        setActionError(
          getSignInErrorMessage(
            error,
            strings.CLOUD_AUTH_GOOGLE_SIGNIN_ERROR_TEXT
          )
        );
      } finally {
        if (maskUser) setResolvingIntent(false);
      }
    },
    [resolveFirebaseIntent]
  );

  const signInWithGithub = useCallback(
    async (intent: AuthIntent) => {
      setActionError(null);
      setAuthFlowMessage(null);
      const maskUser = firebaseUserRef.current === null;
      if (maskUser) setResolvingIntent(true);
      try {
        const { auth, githubProvider, authModule } = await loadFirebaseAuth();
        const result = await authModule.signInWithPopup(auth, githubProvider);
        await resolveFirebaseIntent(authModule, auth, result, intent);
      } catch (error) {
        setActionError(
          getSignInErrorMessage(
            error,
            strings.CLOUD_AUTH_GITHUB_SIGNIN_ERROR_TEXT
          )
        );
      } finally {
        if (maskUser) setResolvingIntent(false);
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
          announceSignIn();
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
    [applyPlayGamesSession, announceSignIn]
  );

  const signOutUser = useCallback(async (): Promise<boolean> => {
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
      return true;
    } catch {
      expectedFirebaseLossRef.current = false;
      restoreSignedInMarker();
      setActionError(strings.CLOUD_AUTH_SIGNOUT_ERROR_TEXT);
      return false;
    }
  }, [applyDiscordSession, applyPlayGamesSession, restoreSignedInMarker]);
  const { deleteAccount } = useAccountDeletion({
    firebaseUser,
    discordSession,
    playGamesSession,
    applyDiscordSession,
    applyPlayGamesSession,
    restoreSignedInMarker,
    expectedFirebaseLossRef,
  });

  const user = useMemo(
    () =>
      firebaseUser && !resolvingIntent
        ? toCloudAuthUser(firebaseUser)
        : discordSession
          ? toCloudAuthUserFromDiscord(discordSession)
          : playGamesSession
            ? toCloudAuthUserFromPlayGames(playGamesSession)
            : null,
    [firebaseUser, resolvingIntent, discordSession, playGamesSession]
  );

  useEffect(() => {
    if (!user) return;
    markSignedIn(user.providerId);
    saveLastUsedAccount(user.providerId);
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
    signInNotice: user ? signInNotice : false,
    emailLinkSent,
    emailLinkSentTo,
    emailLinkSending,
    emailLinkCooldownSeconds,
    emailLinkBusy,
    emailLinkPrompt,
    resetEmailLinkState,
    confirmEmailLinkEmail,
    dismissEmailLinkPrompt,
    signInWithGoogle,
    signInWithGithub,
    signInWithDiscord,
    signInWithPlayGames,
    sendEmailLink,
    signOutUser,
    deleteAccount,
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
