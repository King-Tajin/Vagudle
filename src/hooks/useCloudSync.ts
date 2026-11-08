import { useCallback, useEffect, useRef, useState } from "react";
import { useCloudAuth } from "./useCloudAuth";
import { useAlert } from "../context/alert-context";
import { createBrowserSyncEngine } from "../lib/cloudSave/browser";
import type {
  PromptChoice,
  SyncOutcome,
  SyncPrompt,
} from "../lib/cloudSave/engine";
import { cloudSyncKey, getUpdatedAt } from "../lib/localStorage";
import strings from "../constants/strings";

export type SyncStatus =
  "idle" | "syncing" | "synced" | "offline" | "error" | "needs_choice";

type PendingPrompt = {
  prompt: SyncPrompt;
  resolve: (choice: PromptChoice) => void;
  reject: (reason: Error) => void;
};

type PromptHandler = (prompt: SyncPrompt) => Promise<PromptChoice>;

const handlers: { askUser: PromptHandler; onDeleted: () => void } = {
  askUser: () => Promise.reject(new Error("No prompt handler")),
  onDeleted: () => {},
};

const engine = createBrowserSyncEngine(
  (prompt) => handlers.askUser(prompt),
  () => handlers.onDeleted()
);

const SYNC_LOCK_NAME = "vagudle-cloud-sync";
const POLL_INTERVAL_MS = 4000;
const PULL_INTERVAL_MS = 60000;
const PUSH_DEBOUNCE_MS = 1500;
const RETRY_DELAYS_MS = [5000, 15000, 60000];

const withTabLock = async <T>(task: () => Promise<T>): Promise<T | null> => {
  if (typeof navigator === "undefined" || !("locks" in navigator))
    return task();
  return navigator.locks.request(
    SYNC_LOCK_NAME,
    { ifAvailable: true },
    async (lock) => (lock ? task() : null)
  );
};

export const useCloudSync = () => {
  const { user, signOutUser } = useCloudAuth();
  const { showError } = useAlert();
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [pendingPrompt, setPendingPrompt] = useState<PendingPrompt | null>(
    null
  );
  const [showPlayGamesLinkPrompt, setShowPlayGamesLinkPrompt] = useState(false);

  const userRef = useRef(user);
  const runSyncRef = useRef<(quiet?: boolean) => Promise<void>>(() =>
    Promise.resolve()
  );
  const pendingPromptRef = useRef<PendingPrompt | null>(null);
  const runningRef = useRef(false);
  const failuresRef = useRef(0);
  const retryTimerRef = useRef<number | null>(null);
  const stampRef = useRef<string | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    handlers.askUser = (prompt) =>
      new Promise<PromptChoice>((resolve, reject) => {
        setPendingPrompt({ prompt, resolve, reject });
      });
    handlers.onDeleted = () => {
      void signOutUser();
      showError(strings.CLOUD_SYNC_ACCOUNT_DELETED_TEXT);
    };
  }, [signOutUser, showError]);

  useEffect(() => {
    pendingPromptRef.current = pendingPrompt;
  }, [pendingPrompt]);

  const clearRetryTimer = useCallback(() => {
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
  }, []);

  const runSync = useCallback(
    async (quiet = false) => {
      const current = userRef.current;
      if (!current || runningRef.current) return;
      runningRef.current = true;
      if (!quiet) setStatus("syncing");
      stampRef.current = getUpdatedAt(cloudSyncKey);

      let outcome: SyncOutcome | null;
      try {
        outcome = await withTabLock(() =>
          engine.run({
            uid: current.uid,
            label:
              current.email ??
              current.displayName ??
              strings.CLOUD_SAVE_PROMPT_ANOTHER_ACCOUNT_LABEL,
          })
        );
      } catch {
        runningRef.current = false;
        setPendingPrompt(null);
        return;
      }
      runningRef.current = false;
      setPendingPrompt(null);

      if (outcome === null) {
        setStatus((previous) => (previous === "syncing" ? "idle" : previous));
        return;
      }

      if (outcome.kind === "synced" || outcome.kind === "unchanged") {
        failuresRef.current = 0;
        clearRetryTimer();
        setLastSyncedAt(outcome.updatedAt);
        setStatus("synced");
        if (
          outcome.kind === "synced" &&
          outcome.created &&
          current.providerId === "playgames.google.com"
        )
          setShowPlayGamesLinkPrompt(true);
        return;
      }

      if (outcome.kind === "deleted") {
        clearRetryTimer();
        setLastSyncedAt(null);
        setStatus("idle");
        return;
      }

      setStatus(!navigator.onLine ? "offline" : "error");
      const delay =
        RETRY_DELAYS_MS[
          Math.min(failuresRef.current, RETRY_DELAYS_MS.length - 1)
        ];
      failuresRef.current += 1;
      clearRetryTimer();
      retryTimerRef.current = window.setTimeout(() => {
        retryTimerRef.current = null;
        void runSyncRef.current();
      }, delay);
    },
    [clearRetryTimer]
  );

  useEffect(() => {
    runSyncRef.current = runSync;
  }, [runSync]);

  const uid = user?.uid ?? null;

  useEffect(() => {
    if (!uid) {
      failuresRef.current = 0;
      return;
    }

    const initialTimer = window.setTimeout(() => {
      void runSync();
    }, 0);

    let debounceTimer: number | null = null;
    const pollTimer = window.setInterval(() => {
      if (getUpdatedAt(cloudSyncKey) === stampRef.current) return;
      if (debounceTimer !== null) window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        debounceTimer = null;
        void runSync();
      }, PUSH_DEBOUNCE_MS);
    }, POLL_INTERVAL_MS);

    const pullTimer = window.setInterval(() => {
      if (document.visibilityState === "visible") void runSync(true);
    }, PULL_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") void runSync(true);
    };
    const handleOnline = () => {
      failuresRef.current = 0;
      void runSync();
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("online", handleOnline);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(pollTimer);
      window.clearInterval(pullTimer);
      if (debounceTimer !== null) window.clearTimeout(debounceTimer);
      clearRetryTimer();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("online", handleOnline);
      pendingPromptRef.current?.reject(new Error("cancelled"));
    };
  }, [uid, runSync, clearRetryTimer]);

  const resolvePrompt = useCallback((choice: PromptChoice) => {
    pendingPromptRef.current?.resolve(choice);
    setPendingPrompt(null);
  }, []);

  const retrySync = useCallback(() => {
    failuresRef.current = 0;
    clearRetryTimer();
    void runSync();
  }, [runSync, clearRetryTimer]);

  const dismissPlayGamesLinkPrompt = useCallback(() => {
    setShowPlayGamesLinkPrompt(false);
  }, []);

  const effectiveStatus: SyncStatus = !user
    ? "idle"
    : pendingPrompt
      ? "needs_choice"
      : status;

  return {
    pendingPrompt: pendingPrompt?.prompt ?? null,
    resolvePrompt,
    cloudUpdatedAt: user ? lastSyncedAt : null,
    syncStatus: effectiveStatus,
    retrySync,
    showPlayGamesLinkPrompt,
    dismissPlayGamesLinkPrompt,
  };
};
