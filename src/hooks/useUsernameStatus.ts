import { useEffect, useState } from "react";
import { getIdTokenForCurrentUser } from "../lib/cloudSync";
import { fetchUsernameStatus } from "../lib/username";
import type { CloudAuthUser } from "./useCloudAuth";

export const useUsernameStatus = (user: CloudAuthUser | null) => {
  const [hasUsername, setHasUsername] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      // No async work needed here, so setting state immediately is safe.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasUsername(null);
      return;
    }
    const checkUsername = async () => {
      const idToken = await getIdTokenForCurrentUser();
      if (!idToken) {
        if (!cancelled) setHasUsername(null);
        return;
      }
      const status = await fetchUsernameStatus(idToken);
      if (!cancelled) setHasUsername(status ? !!status.username : null);
    };
    void checkUsername();
    return () => {
      cancelled = true;
    };
    // Only the user id should retrigger this check.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  return hasUsername;
};
