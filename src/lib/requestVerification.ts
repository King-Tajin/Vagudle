import { isNativeApp } from "./browser";
import { getIntegrityToken, hashRequestFields } from "./playIntegrity";
import { getTurnstileToken } from "./turnstile";

export type RequestVerification =
  { integrityToken: string } | { turnstileToken: string };

export const getRequestVerification = async (
  action: string,
  fields: string[]
): Promise<RequestVerification> => {
  if (isNativeApp()) {
    const requestHash = await hashRequestFields([action, ...fields]);
    return { integrityToken: await getIntegrityToken(requestHash) };
  }
  return { turnstileToken: await getTurnstileToken(action) };
};
