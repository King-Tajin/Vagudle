import type React from "react";
import { useRef, useState } from "react";
import { getIdTokenForCurrentUser } from "../lib/cloudSync";

type Params = {
  isDailyMode: boolean;
  setIsDailyModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSettingsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSettingsAccountJumpKey: React.Dispatch<React.SetStateAction<number>>;
  activityAccessToken: string | null;
};

export const useLeaderboardModal = ({
  isDailyMode,
  setIsDailyModalOpen,
  setIsSettingsModalOpen,
  setSettingsAccountJumpKey,
  activityAccessToken,
}: Params) => {
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  const [leaderboardIdToken, setLeaderboardIdToken] = useState<string | null>(
    null
  );
  const openRequestIdRef = useRef(0);

  const handleOpenLeaderboard = async () => {
    const requestId = ++openRequestIdRef.current;
    const idToken = await getIdTokenForCurrentUser();
    if (openRequestIdRef.current !== requestId) return;
    setLeaderboardIdToken(idToken ?? activityAccessToken ?? null);
    setIsDailyModalOpen(false);
    setIsLeaderboardModalOpen(true);
  };

  const handleCloseLeaderboard = () => {
    setIsLeaderboardModalOpen(false);
    if (isDailyMode) setIsDailyModalOpen(true);
  };

  const handleOpenSettingsFromLeaderboard = () => {
    setIsLeaderboardModalOpen(false);
    setSettingsAccountJumpKey((key) => key + 1);
    setIsSettingsModalOpen(true);
  };

  return {
    isLeaderboardModalOpen,
    leaderboardIdToken,
    handleOpenLeaderboard,
    handleCloseLeaderboard,
    handleOpenSettingsFromLeaderboard,
  };
};
