import { linkPlayGamesWithCurrentUser } from "../../lib/cloudSync";
import { useCloudAuth } from "../../hooks/useCloudAuth";
import { LinkAccountPage } from "./LinkAccountPage";
import strings from "../../constants/strings";

export const LinkPlayGamesPage = () => {
  const { signInWithDiscord } = useCloudAuth();

  return (
    <LinkAccountPage
      idPrefix="link-playgames"
      linkedProviderId="playgames.google.com"
      linkFn={linkPlayGamesWithCurrentUser}
      invalidLinkText={strings.LINK_PLAYGAMES_INVALID_LINK_TEXT}
      linkedText={strings.LINK_PLAYGAMES_LINKED_TEXT}
      signInPromptText={strings.LINK_PLAYGAMES_SIGN_IN_PROMPT_TEXT}
      confirmLabelText={strings.LINK_CONFIRM_LABEL_PLAYGAMES}
      extraSignInMethod={{
        label: strings.LINK_PLAYGAMES_CONTINUE_DISCORD_BUTTON_TEXT,
        onClick: () => signInWithDiscord("signin"),
      }}
      redirectToAppAfterLink
    />
  );
};
