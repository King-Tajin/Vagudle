import type { User } from "firebase/auth";
import type { DiscordSession } from "./discordCloudAuth";
import type { PlayGamesSession } from "./playGamesCloudAuth";

export type CloudAuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  providerId: string;
  providerIds: string[];
};

export type DeleteAccountResult =
  { status: "success" } | { status: "error"; message: string };

export type AuthFlowMessage = "not_registered" | "already_registered";

export const toCloudAuthUser = (user: User): CloudAuthUser => {
  const providerIds = user.providerData.map((p) => p.providerId);
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    providerId: providerIds[0] ?? "unknown",
    providerIds,
  };
};

export const toCloudAuthUserFromDiscord = (
  session: DiscordSession
): CloudAuthUser => ({
  uid: session.uid,
  email: null,
  displayName: session.displayName,
  providerId: "discord.com",
  providerIds: ["discord.com"],
});

export const toCloudAuthUserFromPlayGames = (
  session: PlayGamesSession
): CloudAuthUser => ({
  uid: session.uid,
  email: null,
  displayName: session.displayName,
  providerId: "playgames.google.com",
  providerIds: ["playgames.google.com"],
});
