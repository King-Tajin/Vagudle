import { loadFirebaseAuth } from "./firebase";
import strings from "../constants/strings";

export const EMAIL_LINK_STORAGE_KEY = "vagudle-email-link-address:v1";
const EMAIL_LINK_URL_PARAMS = [
  "apiKey",
  "oobCode",
  "mode",
  "lang",
  "continueUrl",
];

const looksLikeEmailSignInLink = (href: string): boolean =>
  href.includes("mode=signIn");

export type EmailLinkSignInResult = "signed_in" | "failed" | "skipped";

const stripEmailLinkParams = (): void => {
  try {
    const url = new URL(window.location.href);
    for (const param of EMAIL_LINK_URL_PARAMS) url.searchParams.delete(param);
    window.history.replaceState({}, document.title, url.toString());
  } catch {}
};

const runEmailLinkSignIn = async (
  href: string
): Promise<EmailLinkSignInResult> => {
  if (!looksLikeEmailSignInLink(href)) return "skipped";

  try {
    const { auth, authModule } = await loadFirebaseAuth();
    if (!authModule.isSignInWithEmailLink(auth, href)) return "skipped";

    let email: string | null = null;
    try {
      email = localStorage.getItem(EMAIL_LINK_STORAGE_KEY);
    } catch {}

    if (!email) {
      email = window.prompt(strings.CLOUD_AUTH_EMAIL_PROMPT_TEXT);
    }
    const trimmedEmail = email?.trim();
    if (!trimmedEmail) return "skipped";

    try {
      await authModule.signInWithEmailLink(auth, trimmedEmail, href);
    } catch {
      stripEmailLinkParams();
      return "failed";
    }

    try {
      localStorage.removeItem(EMAIL_LINK_STORAGE_KEY);
    } catch {}
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

export const completeEmailLinkSignIn = (): Promise<EmailLinkSignInResult> => {
  const href = window.location.href;
  if (emailLinkCompletion?.href === href) return emailLinkCompletion.promise;
  const promise = runEmailLinkSignIn(href);
  emailLinkCompletion = { href, promise };
  return promise;
};
