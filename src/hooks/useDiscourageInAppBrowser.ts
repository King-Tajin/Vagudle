import { useEffect } from "react";
import { DISCOURAGE_INAPP_BROWSERS } from "../constants/settings";
import type { ShowOptions } from "../context/alert-context";
import strings from "../constants/strings";
import { isInAppBrowser } from "../lib/browser";

type Params = {
  showErrorAlert: (message: string, options?: ShowOptions) => void;
};

export const useDiscourageInAppBrowser = ({ showErrorAlert }: Params) => {
  useEffect(() => {
    if (!DISCOURAGE_INAPP_BROWSERS) return;
    if (isInAppBrowser()) {
      showErrorAlert(strings.DISCOURAGE_INAPP_BROWSER_TEXT, {
        persist: false,
        durationMs: 7000,
      });
    }
  }, [showErrorAlert]);
};
