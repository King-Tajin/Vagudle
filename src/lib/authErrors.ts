import strings from "../constants/strings";

const SILENT_CODES = new Set([
  "auth/popup-closed-by-user",
  "auth/cancelled-popup-request",
  "auth/user-cancelled",
]);

const getErrorCode = (error: unknown): string => {
  if (typeof error !== "object" || error === null || !("code" in error))
    return "";
  const { code } = error;
  return typeof code === "string" ? code : "";
};

export const getSignInErrorMessage = (
  error: unknown,
  fallback: string
): string | null => {
  const code = getErrorCode(error);
  if (SILENT_CODES.has(code)) return null;
  if (code === "auth/popup-blocked")
    return strings.CLOUD_AUTH_POPUP_BLOCKED_ERROR_TEXT;
  if (code === "auth/account-exists-with-different-credential")
    return strings.CLOUD_AUTH_ACCOUNT_EXISTS_ERROR_TEXT;
  if (code === "auth/network-request-failed")
    return strings.CLOUD_AUTH_NETWORK_ERROR_TEXT;
  return fallback;
};
