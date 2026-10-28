import { useEffect, useRef, useState } from "react";

type LinkStatus = "idle" | "linking" | "linked" | "error";

type LinkResult = { status: "linked" } | { status: "error"; message: string };

export const useAccountLinkFlow = (
  token: string | null,
  user: { providerId: string } | null,
  linkedProviderId: string,
  linkFn: (
    token: string,
    confirmation: string,
    signal: AbortSignal
  ) => Promise<LinkResult>
) => {
  const [linkStatus, setLinkStatus] = useState<LinkStatus>("idle");
  const [linkError, setLinkError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  const startLink = async (confirmation: string) => {
    if (!token || !user || controllerRef.current?.signal.aborted === false)
      return;
    if (user.providerId === linkedProviderId) return;
    if (!confirmation.trim()) return;

    const controller = new AbortController();
    controllerRef.current = controller;
    setLinkStatus("linking");

    const result = await linkFn(token, confirmation.trim(), controller.signal);
    if (controller.signal.aborted) return;

    controllerRef.current = null;
    if (result.status === "linked") {
      setLinkStatus("linked");
    } else {
      setLinkStatus("error");
      setLinkError(result.message);
    }
  };

  const resetLinkStatus = () => {
    setLinkStatus("idle");
    setLinkError(null);
  };

  return { linkStatus, linkError, resetLinkStatus, startLink };
};
