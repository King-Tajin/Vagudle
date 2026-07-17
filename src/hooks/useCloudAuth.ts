import { useCallback, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  type User,
} from "firebase/auth";
import { auth, googleProvider, githubProvider } from "../lib/firebase";

const EMAIL_LINK_STORAGE_KEY = "vagudle-email-link-address:v1";

export type CloudAuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  providerId: string;
};

const toCloudAuthUser = (user: User): CloudAuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  providerId: user.providerData[0]?.providerId ?? "unknown",
});

export const completeEmailLinkSignIn = async (): Promise<void> => {
  if (!isSignInWithEmailLink(auth, window.location.href)) return;

  let email: string | null = null;
  try {
    email = localStorage.getItem(EMAIL_LINK_STORAGE_KEY);
  } catch {}

  if (!email) {
    email = window.prompt("Confirm your email to finish signing in:");
  }
  if (!email) return;

  try {
    await signInWithEmailLink(auth, email, window.location.href);
    try {
      localStorage.removeItem(EMAIL_LINK_STORAGE_KEY);
    } catch {}
    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState({}, document.title, url.toString());
  } catch {}
};

export const useCloudAuth = () => {
  const [user, setUser] = useState<CloudAuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [emailLinkSent, setEmailLinkSent] = useState(false);

  useEffect(
    () =>
      onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser ? toCloudAuthUser(firebaseUser) : null);
        setAuthLoading(false);
      }),
    []
  );

  const signInWithGoogle = useCallback(async () => {
    setActionError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch {
      setActionError("Google sign-in failed. Please try again.");
    }
  }, []);

  const signInWithGithub = useCallback(async () => {
    setActionError(null);
    try {
      await signInWithPopup(auth, githubProvider);
    } catch {
      setActionError("GitHub sign-in failed. Please try again.");
    }
  }, []);

  const sendEmailLink = useCallback(async (email: string) => {
    setActionError(null);
    setEmailLinkSent(false);
    try {
      await sendSignInLinkToEmail(auth, email, {
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
      await signOut(auth);
    } catch {
      setActionError("Sign-out failed. Please try again.");
    }
  }, []);

  return {
    user,
    authLoading,
    actionError,
    emailLinkSent,
    signInWithGoogle,
    signInWithGithub,
    sendEmailLink,
    signOutUser,
  };
};
