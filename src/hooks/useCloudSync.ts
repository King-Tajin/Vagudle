import { useEffect, useRef, useState } from "react";
import { useCloudAuth } from "./useCloudAuth";
import {
  getIdTokenForCurrentUser,
  buildCloudSavePayloadFromLocalStorage,
  getLocalMaxUpdatedAt,
  pullCloudSave,
  pushCloudSave,
  cloudSaveMatchesLocal,
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
  const [showPlayGamesLinkPrompt, setShowPlayGamesLinkPrompt] = useState(false);
  const resolvedUidRef = useRef<string | null>(null);
  const lastPushedAtRef = useRef<string | null>(null);
  const latestPendingRef = useRef<string | null>(null);
  const [pendingPushTrigger, setPendingPushTrigger] = useState(0);

  useEffect(() => {
    if (!user) {
      resolvedUidRef.current = null;
      lastPushedAtRef.current = null;
      return;
    }
    if (resolvedUidRef.current === user.uid) return;
    resolvedUidRef.current = user.uid;

    let ignore = false;

    const run = async () => {
      const idToken = await getIdTokenForCurrentUser();
      if (ignore) return;
      if (!idToken) {
        setSyncError("Couldn't verify sign-in for cloud sync.");
        return;
      }

      const result = await pullCloudSave(idToken);
      if (ignore) return;

      if (result.status === "found") {
        if (cloudSaveMatchesLocal(result.save, isMobile)) {
          lastPushedAtRef.current = getLocalMaxUpdatedAt();
          setCloudUpdatedAt(result.save.updatedAt);
          setIsUpToDate(true);
        } else {
          setPendingCloudSave(result.save);
          setCloudUpdatedAt(result.save.updatedAt);
        }
        return;
      }

      if (result.status === "not_found") {
        if (user.providerId === "playgames.google.com") {
          setShowPlayGamesLinkPrompt(true);
        }
        const updatedAt = await pushCloudSave(
          idToken,
          buildCloudSavePayloadFromLocalStorage(isMobile)
        );
        if (ignore) return;
        if (!updatedAt) {
          setSyncError("Couldn't create your cloud save.");
          return;
        }
        lastPushedAtRef.current = getLocalMaxUpdatedAt();
        setCloudUpdatedAt(updatedAt);
        setIsUpToDate(true);
        setSyncError(null);
        return;
      }

      setSyncError("Couldn't reach cloud save.");
    };

    void run();

    return () => {
      ignore = true;
    };
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
      latestPendingRef.current = latest;
      setPendingPushTrigger((n) => n + 1);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [user, pendingCloudSave]);

  useEffect(() => {
    if (!user || pendingCloudSave || pendingPushTrigger === 0) return;

    let ignore = false;
    const latest = latestPendingRef.current;

    const timeoutId = setTimeout(() => {
      const run = async () => {
        const idToken = await getIdTokenForCurrentUser();
        if (ignore) return;
        if (!idToken) return;

        const updatedAt = await pushCloudSave(
          idToken,
          buildCloudSavePayloadFromLocalStorage(isMobile)
        );
        if (ignore) return;

        if (updatedAt) {
          lastPushedAtRef.current = latest;
          setCloudUpdatedAt(updatedAt);
          setIsUpToDate(true);
          setSyncError(null);
        } else {
          setSyncError("Couldn't sync to cloud.");
        }
      };
      void run();
    }, PUSH_DEBOUNCE_MS);

    return () => {
      ignore = true;
      clearTimeout(timeoutId);
    };
  }, [user, pendingCloudSave, pendingPushTrigger, isMobile]);

  const resolvePendingCloudSave = () => {
    setPendingCloudSave(null);
    lastPushedAtRef.current = getLocalMaxUpdatedAt();
    setCloudUpdatedAt(lastPushedAtRef.current);
    setIsUpToDate(true);
  };

  const dismissPlayGamesLinkPrompt = () => {
    setShowPlayGamesLinkPrompt(false);
  };

  return {
    pendingCloudSave,
    syncError,
    cloudUpdatedAt: user ? cloudUpdatedAt : null,
    isUpToDate: user ? isUpToDate : true,
    resolvePendingCloudSave,
    showPlayGamesLinkPrompt,
    dismissPlayGamesLinkPrompt,
  };
};
