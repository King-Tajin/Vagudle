import { useCallback, type MutableRefObject } from "react";
import type { User } from "firebase/auth";
import { loadFirebaseAuth } from "../lib/firebase";
import {
  clearDiscordSession,
  type DiscordSession,
} from "../lib/discordCloudAuth";
import {
  clearPlayGamesSession,
  type PlayGamesSession,
} from "../lib/playGamesCloudAuth";
import { clearSignedInMarker } from "../lib/signInMarker";
import { clearLastUsedAccount } from "../lib/lastUsedAccount";
import type { DeleteAccountResult } from "../lib/cloudAuthUser";
import strings from "../constants/strings";

export const useAccountDeletion = ({
  firebaseUser,
  discordSession,
  playGamesSession,
  applyDiscordSession,
  applyPlayGamesSession,
  restoreSignedInMarker,
  expectedFirebaseLossRef,
}: {
  firebaseUser: User | null;
  discordSession: DiscordSession | null;
  playGamesSession: PlayGamesSession | null;
  applyDiscordSession: (session: DiscordSession | null) => void;
  applyPlayGamesSession: (session: PlayGamesSession | null) => void;
  restoreSignedInMarker: () => void;
  expectedFirebaseLossRef: MutableRefObject<boolean>;
}) => {
  const deleteAccount = useCallback(async (): Promise<DeleteAccountResult> => {
    if (firebaseUser) {
      clearSignedInMarker();
      expectedFirebaseLossRef.current = true;
      try {
        const { authModule } = await loadFirebaseAuth();
        await authModule.deleteUser(firebaseUser);
        clearLastUsedAccount();
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
      clearLastUsedAccount();
      return { status: "success" };
    }
    if (playGamesSession) {
      clearSignedInMarker();
      clearPlayGamesSession();
      applyPlayGamesSession(null);
      clearLastUsedAccount();
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
    expectedFirebaseLossRef,
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
        clearLastUsedAccount();
        return { status: "success" };
      } catch {
        expectedFirebaseLossRef.current = false;
        restoreSignedInMarker();
        return {
          status: "error",
          message: strings.CLOUD_AUTH_REAUTH_FAILED_ERROR_TEXT,
        };
      }
    }, [firebaseUser, restoreSignedInMarker, expectedFirebaseLossRef]);

  return { deleteAccount, reauthenticateAndDeleteAccount };
};
