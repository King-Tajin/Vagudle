import { useEffect, useRef, useState } from "react";
import { useCloudAuth } from "./useCloudAuth";
import {
  getIdTokenForCurrentUser,
  buildCloudSavePayloadFromLocalStorage,
  getLocalMaxUpdatedAt,
  pullCloudSave,
  pushCloudSave,
  getSyncedCloudUpdatedAt,
  setSyncedCloudUpdatedAt,
  clearSyncedCloudUpdatedAt,
  type CloudSave,
} from "../lib/cloudSync";

const POLL_INTERVAL_MS = 4000;
const PUSH_DEBOUNCE_MS = 1500;

export const useCloudSync = (isMobile: boolean) => {
  const { user } = useCloudAuth();
  const [pendingCloudSave, setPendingCloudSave] = useState<CloudSave | null>(
    null
  );
  const [syncError, setSyncError] = useState<string | null>(null);
  const [cloudUpdatedAt, setCloudUpdatedAt] = useState<string | null>(null);
  const [isUpToDate, setIsUpToDate] = useState(true);
  const resolvedUidRef = useRef<string | null>(null);
  const lastPushedAtRef = useRef<string | null>(null);
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) {
      resolvedUidRef.current = null;
      lastPushedAtRef.current = null;
      clearSyncedCloudUpdatedAt();
      return;
    }
    if (resolvedUidRef.current === user.uid) return;
    resolvedUidRef.current = user.uid;

    void (async () => {
      const idToken = await getIdTokenForCurrentUser();
      if (!idToken) {
        setSyncError("Couldn't verify sign-in for cloud sync.");
        return;
      }
      const result = await pullCloudSave(idToken);
      if (result.status === "found") {
        if (getSyncedCloudUpdatedAt() === result.save.updatedAt) {
          lastPushedAtRef.current = getLocalMaxUpdatedAt();
          setCloudUpdatedAt(result.save.updatedAt);
          setIsUpToDate(true);
        } else {
          setPendingCloudSave(result.save);
          setCloudUpdatedAt(result.save.updatedAt);
        }
      } else if (result.status === "not_found") {
        const updatedAt = await pushCloudSave(
          idToken,
          buildCloudSavePayloadFromLocalStorage(isMobile)
        );
        if (updatedAt) {
          lastPushedAtRef.current = getLocalMaxUpdatedAt();
          setSyncedCloudUpdatedAt(updatedAt);
          setCloudUpdatedAt(updatedAt);
          setIsUpToDate(true);
          setSyncError(null);
        } else {
          setSyncError("Couldn't create your cloud save.");
        }
      } else {
        setSyncError("Couldn't reach cloud save.");
      }
    })();
  }, [user, isMobile]);

  useEffect(() => {
    if (!user || pendingCloudSave) return;

    const interval = setInterval(() => {
      const latest = getLocalMaxUpdatedAt();
      if (!latest || latest === lastPushedAtRef.current) {
        setIsUpToDate(true);
        return;
      }
      setIsUpToDate(false);
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
      pushTimerRef.current = setTimeout(() => {
        void (async () => {
          const idToken = await getIdTokenForCurrentUser();
          if (!idToken) return;
          const updatedAt = await pushCloudSave(
            idToken,
            buildCloudSavePayloadFromLocalStorage(isMobile)
          );
          if (updatedAt) {
            lastPushedAtRef.current = latest;
            setSyncedCloudUpdatedAt(updatedAt);
            setCloudUpdatedAt(updatedAt);
            setIsUpToDate(true);
            setSyncError(null);
          } else {
            setSyncError("Couldn't sync to cloud.");
          }
        })();
      }, PUSH_DEBOUNCE_MS);
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
  }, [user, pendingCloudSave, isMobile]);

  const resolvePendingCloudSave = () => {
    setPendingCloudSave(null);
    lastPushedAtRef.current = getLocalMaxUpdatedAt();
    setCloudUpdatedAt(lastPushedAtRef.current);
    setIsUpToDate(true);
  };

  return {
    pendingCloudSave,
    syncError,
    cloudUpdatedAt: user ? cloudUpdatedAt : null,
    isUpToDate: user ? isUpToDate : true,
    resolvePendingCloudSave,
  };
};
