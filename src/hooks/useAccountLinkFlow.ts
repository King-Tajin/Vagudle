import { useEffect, useRef, useState } from "react";
import type {
  DiscordSaveChoice,
  DiscordSaveConflict,
  ResolveDiscordSaveResult,
} from "../lib/cloudSync";

type LinkStatus = "idle" | "linking" | "linked" | "conflict" | "error";

type LinkResult =
  | { status: "linked" }
  | { status: "error"; message: string }
  | { status: "conflict"; conflict: DiscordSaveConflict };

export type AccountLinkFn = (
  token: string,
  confirmation: string,
  signal: AbortSignal
) => Promise<LinkResult>;

export type ResolveConflictFn = (
  ticket: string,
  keep: DiscordSaveChoice,
  signal: AbortSignal
) => Promise<ResolveDiscordSaveResult>;

export const useAccountLinkFlow = (
  token: string | null,
  user: { providerId: string } | null,
  linkedProviderId: string,
  linkFn: AccountLinkFn,
  resolveConflictFn?: ResolveConflictFn
) => {
  const [linkStatus, setLinkStatus] = useState<LinkStatus>("idle");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<DiscordSaveConflict | null>(null);
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
    } else if (result.status === "conflict") {
      setConflict(result.conflict);
      setLinkStatus("conflict");
    } else {
      setLinkStatus("error");
      setLinkError(result.message);
    }
  };

  const resolveConflict = async (keep: DiscordSaveChoice) => {
    if (
      !conflict ||
      !resolveConflictFn ||
      controllerRef.current?.signal.aborted === false
    )
      return;

    const controller = new AbortController();
    controllerRef.current = controller;
    setLinkError(null);
    setLinkStatus("linking");

    const result = await resolveConflictFn(
      conflict.ticket,
      keep,
      controller.signal
    );
    if (controller.signal.aborted) return;

    controllerRef.current = null;
    if (result.status === "linked") {
      setConflict(null);
      setLinkStatus("linked");
    } else {
      setLinkError(result.message);
      setLinkStatus("conflict");
    }
  };

  const resetLinkStatus = () => {
    setLinkStatus("idle");
    setLinkError(null);
    setConflict(null);
  };

  return {
    linkStatus,
    linkError,
    conflict,
    resetLinkStatus,
    startLink,
    resolveConflict,
  };
};
