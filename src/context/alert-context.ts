import { createContext, useContext } from "react";

export type AlertStatus = "success" | "error" | undefined;

export type ShowOptions = {
  persist?: boolean;
  delayMs?: number;
  durationMs?: number;
  onClose?: () => void;
};

export type AlertContextValue = {
  status: AlertStatus;
  message: string | null;
  isVisible: boolean;
  showSuccess: (message: string, options?: ShowOptions) => void;
  showError: (message: string, options?: ShowOptions) => void;
  dismiss: () => void;
  cancel: () => void;
};

export const AlertContext = createContext<AlertContextValue | null>({
  status: "success",
  message: null,
  isVisible: false,
  showSuccess: () => null,
  showError: () => null,
  dismiss: () => null,
  cancel: () => null,
});
AlertContext.displayName = "AlertContext";

export const useAlert = () => useContext(AlertContext) as AlertContextValue;
