import { loadFirebaseAuth } from "./firebase";
import { getErrorCode } from "./authErrors";

export const EMAIL_LINK_STORAGE_KEY = "vagudle-email-link-address:v1";
const EMAIL_LINK_URL_PARAMS = [
  "apiKey",
  "oobCode",
  "mode",
  "lang",
  "continueUrl",
];
const EXPIRED_LINK_CODES = new Set([
  "auth/expired-action-code",
  "auth/invalid-action-code",
]);
const EMAIL_MISMATCH_CODE = "auth/invalid-email";

const looksLikeEmailSignInLink = (href: string): boolean =>
  href.includes("mode=signIn");

export type EmailLinkSignInResult =
  | "signed_in"
  | "failed"
  | "expired"
  | "needs_email"
  | "email_mismatch"
  | "skipped";

const stripEmailLinkParams = (): void => {
  try {
    const url = new URL(window.location.href);
    for (const param of EMAIL_LINK_URL_PARAMS) url.searchParams.delete(param);
    window.history.replaceState({}, document.title, url.toString());
  } catch {}
};

const readStoredEmail = (): string | null => {
  try {
    return localStorage.getItem(EMAIL_LINK_STORAGE_KEY);
  } catch {
    return null;
  }
};

const clearStoredEmail = (): void => {
  try {
    localStorage.removeItem(EMAIL_LINK_STORAGE_KEY);
  } catch {}
};

const runEmailLinkSignIn = async (
  href: string,
  providedEmail: string | undefined
): Promise<EmailLinkSignInResult> => {
  if (!looksLikeEmailSignInLink(href)) return "skipped";

  try {
    const { auth, authModule } = await loadFirebaseAuth();
    if (!authModule.isSignInWithEmailLink(auth, href)) return "skipped";

    const email = (providedEmail ?? readStoredEmail())?.trim();
    if (!email) return "needs_email";

    try {
      await authModule.signInWithEmailLink(auth, email, href);
    } catch (error) {
      const code = getErrorCode(error);
      if (code === EMAIL_MISMATCH_CODE) {
        if (providedEmail !== undefined) return "email_mismatch";
        clearStoredEmail();
        return "needs_email";
      }
      clearStoredEmail();
      stripEmailLinkParams();
      return EXPIRED_LINK_CODES.has(code) ? "expired" : "failed";
    }

    clearStoredEmail();
    stripEmailLinkParams();
    return "signed_in";
  } catch {
    return "failed";
  }
};

let emailLinkCompletion: {
  href: string;
  promise: Promise<EmailLinkSignInResult>;
} | null = null;

export const completeEmailLinkSignIn = (
  providedEmail?: string
): Promise<EmailLinkSignInResult> => {
  const href = window.location.href;
  if (providedEmail === undefined && emailLinkCompletion?.href === href)
    return emailLinkCompletion.promise;
  const promise = runEmailLinkSignIn(href, providedEmail);
  emailLinkCompletion = { href, promise };
  return promise;
};

export const cancelEmailLinkSignIn = (): void => {
  stripEmailLinkParams();
  emailLinkCompletion = null;
};
