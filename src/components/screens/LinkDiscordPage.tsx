import {
  linkDiscordWithCurrentUser,
  resolveDiscordSaveConflict,
} from "../../lib/cloudSync";
import { LinkAccountPage } from "./LinkAccountPage";
import strings from "../../constants/strings";

export const LinkDiscordPage = () => (
  <LinkAccountPage
    idPrefix="link-discord"
    linkedProviderId="discord.com"
    linkFn={linkDiscordWithCurrentUser}
    resolveConflictFn={resolveDiscordSaveConflict}
    invalidLinkText={strings.LINK_DISCORD_INVALID_LINK_TEXT}
    linkedText={strings.LINK_DISCORD_LINKED_TEXT}
    signInPromptText={strings.LINK_DISCORD_SIGN_IN_PROMPT_TEXT}
    confirmLabelText={strings.LINK_CONFIRM_LABEL_DISCORD}
  />
);
