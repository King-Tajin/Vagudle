import { useCallback, type RefObject } from "react";
import type { User } from "firebase/auth";
import { loadFirebaseAuth } from "../lib/firebase";
import { deleteCloudSave } from "../lib/cloudSync";
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
  expectedFirebaseLossRef: RefObject<boolean>;
}) => {
  const deleteAccount = useCallback(async (): Promise<DeleteAccountResult> => {
    const failure: DeleteAccountResult = {
      status: "error",
      message: strings.CLOUD_AUTH_DELETE_ACCOUNT_ERROR_TEXT,
    };

    if (firebaseUser) {
      clearSignedInMarker();
      expectedFirebaseLossRef.current = true;
      const deleted = await firebaseUser
        .getIdToken(true)
        .then((idToken) => deleteCloudSave(idToken, true))
        .catch(() => false);
      if (!deleted) {
        expectedFirebaseLossRef.current = false;
        restoreSignedInMarker();
        return failure;
      }
      await loadFirebaseAuth()
        .then(({ auth, authModule }) => authModule.signOut(auth))
        .catch(() => undefined);
      clearLastUsedAccount();
      return { status: "success" };
    }
    if (discordSession) {
      if (!(await deleteCloudSave(discordSession.token))) return failure;
      clearSignedInMarker();
      clearDiscordSession();
      applyDiscordSession(null);
      clearLastUsedAccount();
      return { status: "success" };
    }
    if (playGamesSession) {
      if (!(await deleteCloudSave(playGamesSession.token))) return failure;
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

  return { deleteAccount };
};
