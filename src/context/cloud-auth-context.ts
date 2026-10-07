import { createContext } from "react";
import type { CloudAuthValue } from "../hooks/useCloudAuth";

export const CloudAuthContext = createContext<CloudAuthValue | null>(null);
CloudAuthContext.displayName = "CloudAuthContext";
