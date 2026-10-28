type TurnstileRenderOptions = {
  sitekey: string;
  appearance: "always" | "execute" | "interaction-only";
  callback: (token: string) => void;
  "error-callback": () => void;
  "expired-callback": () => void;
  "timeout-callback": () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  remove: (widgetId: string) => void;
};

interface Window {
  turnstile?: TurnstileApi;
}
