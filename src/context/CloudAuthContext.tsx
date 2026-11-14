import type { ReactNode } from "react";
import { useCloudAuthState } from "../hooks/useCloudAuth";
import { EmailLinkConfirmModal } from "../components/modals/EmailLinkConfirmModal";
import { CloudAuthContext } from "./cloud-auth-context";

type Props = {
  children?: ReactNode;
  warnOnSessionEnd?: boolean;
};

export const CloudAuthProvider = ({
  children,
  warnOnSessionEnd = true,
}: Props) => {
  const value = useCloudAuthState({ warnOnSessionEnd });
  return (
    <CloudAuthContext.Provider value={value}>
      {children}
      <EmailLinkConfirmModal
        prompt={value.emailLinkPrompt}
        onConfirm={value.confirmEmailLinkEmail}
        onDismiss={value.dismissEmailLinkPrompt}
      />
    </CloudAuthContext.Provider>
  );
};
