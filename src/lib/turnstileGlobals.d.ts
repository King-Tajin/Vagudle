type TurnstileRenderOptions = {
  sitekey: string;
  appearance: "always" | "execute" | "interaction-only";
  action?: string;
  theme?: "auto" | "light" | "dark";
  retry?: "auto" | "never";
  "refresh-expired"?: "auto" | "manual" | "never";
  callback: (token: string) => void;
  "error-callback": () => void;
  "expired-callback": () => void;
  "timeout-callback": () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  remove: (widgetId: string) => void;
  reset: (widgetId: string) => void;
};

interface Window {
  turnstile?: TurnstileApi;
}
