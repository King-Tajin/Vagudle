import type React from "react";
import { useState } from "react";
import { getIdTokenForCurrentUser } from "../lib/cloudSync";

type Params = {
  isDailyMode: boolean;
  setIsDailyModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsSettingsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSettingsAccountJumpKey: React.Dispatch<React.SetStateAction<number>>;
};

export const useLeaderboardModal = ({
  isDailyMode,
  setIsDailyModalOpen,
  setIsSettingsModalOpen,
  setSettingsAccountJumpKey,
}: Params) => {
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  const [leaderboardIdToken, setLeaderboardIdToken] = useState<string | null>(
    null
  );

  const handleOpenLeaderboard = async () => {
    const idToken = await getIdTokenForCurrentUser();
    setLeaderboardIdToken(idToken ?? null);
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
