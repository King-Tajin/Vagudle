import strings from "../constants/strings";

export const getProviderLabel = (
  providerId: string,
  fallback: string
): string => {
  switch (providerId) {
    case "google.com":
      return "Google";
    case "github.com":
      return "GitHub";
    case "discord.com":
      return "Discord";
    case "password":
      return strings.CLOUD_SAVE_PROVIDER_LABEL_EMAIL;
    case "playgames.google.com":
      return strings.CLOUD_SAVE_PROVIDER_LABEL_PLAYGAMES;
    default:
      return fallback;
  }
};
