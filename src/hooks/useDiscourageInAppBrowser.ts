import { useEffect } from "react";
import { DISCOURAGE_INAPP_BROWSERS } from "../constants/settings";
import { DISCOURAGE_INAPP_BROWSER_TEXT } from "../constants/strings";
import type { ShowOptions } from "../context/alert-context";

type Params = {
  showErrorAlert: (message: string, options?: ShowOptions) => void;
};

export const useDiscourageInAppBrowser = ({ showErrorAlert }: Params) => {
  useEffect(() => {
    if (!DISCOURAGE_INAPP_BROWSERS) return;
    let cancelled = false;
    void import("../lib/browser").then(({ isInAppBrowser }) => {
      if (!cancelled && isInAppBrowser()) {
        showErrorAlert(DISCOURAGE_INAPP_BROWSER_TEXT, {
          persist: false,
          durationMs: 7000,
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [showErrorAlert]);
};
