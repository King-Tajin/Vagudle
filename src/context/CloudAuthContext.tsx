import type { ReactNode } from "react";
import { useCloudAuthState } from "../hooks/useCloudAuth";
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
    </CloudAuthContext.Provider>
  );
};
