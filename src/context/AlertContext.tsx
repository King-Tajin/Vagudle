import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { ALERT_TIME_MS } from "../constants/settings";
import {
  AlertContext,
  type AlertStatus,
  type ShowOptions,
} from "./alert-context";

type Props = {
  children?: ReactNode;
};

export const AlertProvider = ({ children }: Props) => {
  const [status, setStatus] = useState<AlertStatus>("success");
  const [message, setMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (showStatus: AlertStatus, newMessage: string, options?: ShowOptions) => {
      const {
        delayMs = 0,
        persist,
        onClose,
        durationMs = ALERT_TIME_MS,
      } = options || {};

      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      if (durationTimerRef.current) clearTimeout(durationTimerRef.current);

      delayTimerRef.current = setTimeout(() => {
        setStatus(showStatus);
        setMessage(newMessage);
        setIsVisible(true);

        if (!persist) {
          durationTimerRef.current = setTimeout(() => {
            setIsVisible(false);
            if (onClose) {
              onClose();
            }
          }, durationMs);
        }
      }, delayMs);
    },
    [setStatus, setMessage, setIsVisible]
  );

  const showError = useCallback(
    (newMessage: string, options?: ShowOptions) => {
      show("error", newMessage, options);
    },
    [show]
  );

  const showSuccess = useCallback(
    (newMessage: string, options?: ShowOptions) => {
      show("success", newMessage, options);
    },
    [show]
  );

  const dismiss = useCallback(() => {
    setIsVisible(false);
  }, [setIsVisible]);

  const cancel = useCallback(() => {
    if (delayTimerRef.current) {
      clearTimeout(delayTimerRef.current);
      delayTimerRef.current = null;
    }
    if (durationTimerRef.current) {
      clearTimeout(durationTimerRef.current);
      durationTimerRef.current = null;
    }
  }, []);

  const value = useMemo(
    () => ({
      status,
      message,
      isVisible,
      showError,
      showSuccess,
      dismiss,
      cancel,
    }),
    [status, message, isVisible, showError, showSuccess, dismiss, cancel]
  );

  return (
    <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
  );
};
