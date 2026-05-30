import { DiscordSDK } from "@discord/embedded-app-sdk";

const frameId = new URLSearchParams(window.location.search).get("frame_id");
export const isDiscordActivity = window.self !== window.top && frameId !== null;

let _sdk: DiscordSDK | null = null;

export const openExternalLink = (url: string): void => {
  if (_sdk) {
    void _sdk.commands.openExternalLink({ url });
  }
};

export const initDiscordSDK = async (): Promise<void> => {
  if (!isDiscordActivity) return;
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID as string;
  if (!clientId) {
    console.error("[Discord] VITE_DISCORD_CLIENT_ID is not set");
    return;
  }
  _sdk = new DiscordSDK(clientId);
  await _sdk.ready();
};
