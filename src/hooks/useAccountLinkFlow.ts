import { useEffect, useRef, useState } from "react";

type LinkStatus = "idle" | "linking" | "linked" | "error";

type LinkResult = { status: "linked" } | { status: "error"; message: string };

export const useAccountLinkFlow = (
  token: string | null,
  user: { providerId: string } | null,
  linkedProviderId: string,
  linkFn: (token: string, signal: AbortSignal) => Promise<LinkResult>
) => {
  const [linkStatus, setLinkStatus] = useState<LinkStatus>("idle");
  const [linkError, setLinkError] = useState<string | null>(null);
  const linkedRef = useRef(false);

  useEffect(() => {
    if (!token || !user || linkedRef.current) return;
    if (user.providerId === linkedProviderId) return;
    linkedRef.current = true;

    const controller = new AbortController();

    const run = async () => {
      setLinkStatus("linking");
      const result = await linkFn(token, controller.signal);
      const aborted = controller.signal.aborted;
      if (aborted) {
        linkedRef.current = false;
        return;
      }

      if (result.status === "linked") {
        setLinkStatus("linked");
      } else {
        setLinkStatus("error");
        setLinkError(result.message);
        linkedRef.current = false;
      }
    };

    void run();

    return () => controller.abort();
  }, [token, user, linkedProviderId, linkFn]);

  const resetLinkStatus = () => {
    setLinkStatus("idle");
    setLinkError(null);
  };

  return { linkStatus, linkError, resetLinkStatus };
};
