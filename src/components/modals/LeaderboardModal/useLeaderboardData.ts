import { useEffect, useReducer } from "react";
import {
  fetchDailyLeaderboard,
  type DailyLeaderboardResponse,
} from "../../../lib/daily";
import {
  fetchUsernameStatus,
  updateUsername,
  USERNAME_PATTERN,
  type UsernameStatus,
} from "../../../lib/username";
import strings from "../../../constants/strings";

export const formatCooldown = (canChangeAt: string): string => {
  const ms = new Date(canChangeAt).getTime() - Date.now();
  const days = Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
  return strings.DAILY_MODAL_STREAK_DAYS_TEXT(days);
};

type LeaderboardState = {
  status: "loading" | "error" | "loaded";
  data: DailyLeaderboardResponse | null;
  usernameStatus: UsernameStatus | null;
  isEditing: boolean;
  inputValue: string;
  isSubmitting: boolean;
  submitError: string | null;
  isPageLoading: boolean;
  hideZeroWins: boolean;
};

const initialLeaderboardState: LeaderboardState = {
  status: "loading",
  data: null,
  usernameStatus: null,
  isEditing: false,
  inputValue: "",
  isSubmitting: false,
  submitError: null,
  isPageLoading: false,
  hideZeroWins: true,
};

type LeaderboardAction =
  | { type: "loadStart" }
  | {
      type: "loadSuccess";
      data: DailyLeaderboardResponse;
      usernameStatus: UsernameStatus | null;
      isEditing: boolean;
      inputValue: string;
    }
  | { type: "loadError" }
  | { type: "submitStart" }
  | {
      type: "submitSuccess";
      usernameStatus: UsernameStatus;
      inputValue: string;
    }
  | { type: "refreshData"; data: DailyLeaderboardResponse }
  | { type: "submitError"; message: string }
  | { type: "setInputValue"; value: string }
  | { type: "startEditing" }
  | { type: "cancelEditing"; inputValue: string }
  | { type: "pageLoadStart" }
  | { type: "pageLoadSuccess"; data: DailyLeaderboardResponse }
  | { type: "pageLoadError" }
  | { type: "setHideZeroWins"; value: boolean };

function leaderboardReducer(
  state: LeaderboardState,
  action: LeaderboardAction
): LeaderboardState {
  switch (action.type) {
    case "loadStart":
      return { ...state, status: "loading", submitError: null };
    case "loadSuccess":
      return {
        ...state,
        status: "loaded",
        data: action.data,
        usernameStatus: action.usernameStatus,
        isEditing: action.isEditing,
        inputValue: action.inputValue,
      };
    case "loadError":
      return { ...state, status: "error" };
    case "submitStart":
      return { ...state, isSubmitting: true, submitError: null };
    case "submitSuccess":
      return {
        ...state,
        isSubmitting: false,
        usernameStatus: action.usernameStatus,
        inputValue: action.inputValue,
        isEditing: false,
      };
    case "refreshData":
      return { ...state, data: action.data };
    case "submitError":
      return { ...state, isSubmitting: false, submitError: action.message };
    case "setInputValue":
      return { ...state, inputValue: action.value };
    case "startEditing":
      return { ...state, isEditing: true };
    case "cancelEditing":
      return {
        ...state,
        isEditing: false,
        inputValue: action.inputValue,
        submitError: null,
      };
    case "pageLoadStart":
      return { ...state, isPageLoading: true };
    case "pageLoadSuccess":
      return { ...state, isPageLoading: false, data: action.data };
    case "pageLoadError":
      return { ...state, isPageLoading: false };
    case "setHideZeroWins":
      return { ...state, hideZeroWins: action.value };
  }
}

export const useLeaderboardData = ({
  isOpen,
  idToken,
  onUsernameSaved,
}: {
  isOpen: boolean;
  idToken: string | null;
  onUsernameSaved: () => Promise<void>;
}) => {
  const [
    {
      status,
      data,
      usernameStatus,
      isEditing,
      inputValue,
      isSubmitting,
      submitError,
      isPageLoading,
      hideZeroWins,
    },
    dispatch,
  ] = useReducer(leaderboardReducer, initialLeaderboardState);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const loadLeaderboard = async () => {
      dispatch({ type: "loadStart" });
      const [leaderboard, username] = await Promise.all([
        fetchDailyLeaderboard(idToken, 1, initialLeaderboardState.hideZeroWins),
        idToken ? fetchUsernameStatus(idToken) : Promise.resolve(null),
      ]);
      if (cancelled) return;
      if (!leaderboard) {
        dispatch({ type: "loadError" });
        return;
      }
      dispatch({
        type: "loadSuccess",
        data: leaderboard,
        usernameStatus: username,
        isEditing: !!idToken && !username?.username,
        inputValue: username?.username ?? "",
      });
    };

    void loadLeaderboard();
    return () => {
      cancelled = true;
    };
  }, [isOpen, idToken]);

  const goToPage = async (page: number) => {
    if (isPageLoading || !data) return;
    const clamped = Math.min(Math.max(1, page), data.totalPages);
    if (clamped === data.page) return;
    dispatch({ type: "pageLoadStart" });
    const leaderboard = await fetchDailyLeaderboard(
      idToken,
      clamped,
      hideZeroWins
    );
    if (!leaderboard) {
      dispatch({ type: "pageLoadError" });
      return;
    }
    dispatch({ type: "pageLoadSuccess", data: leaderboard });
  };

  const toggleHideZeroWins = async (value: boolean) => {
    if (isPageLoading) return;
    dispatch({ type: "setHideZeroWins", value });
    dispatch({ type: "pageLoadStart" });
    const leaderboard = await fetchDailyLeaderboard(idToken, 1, value);
    if (!leaderboard) {
      dispatch({ type: "pageLoadError" });
      return;
    }
    dispatch({ type: "pageLoadSuccess", data: leaderboard });
  };

  const selfPage =
    data?.self && data.pageSize > 0
      ? Math.ceil(data.self.rank / data.pageSize)
      : null;

  const handleSubmitUsername = async () => {
    if (!idToken || isSubmitting) return;
    const trimmed = inputValue.trim().replace(/\s+/g, " ");
    if (!USERNAME_PATTERN.test(trimmed)) {
      dispatch({
        type: "submitError",
        message: strings.USERNAME_VALIDATION_ERROR_TEXT,
      });
      return;
    }

    dispatch({ type: "submitStart" });
    const outcome = await updateUsername(idToken, trimmed);

    if (outcome.status === "updated") {
      dispatch({
        type: "submitSuccess",
        usernameStatus: {
          username: outcome.username,
          canChangeAt: outcome.canChangeAt,
        },
        inputValue: outcome.username,
      });
      await onUsernameSaved();
      const refreshed = await fetchDailyLeaderboard(
        idToken,
        data?.page ?? 1,
        hideZeroWins
      );
      if (refreshed) dispatch({ type: "refreshData", data: refreshed });
      return;
    }

    if (outcome.status === "invalid")
      dispatch({
        type: "submitError",
        message: strings.USERNAME_VALIDATION_ERROR_TEXT,
      });
    else if (outcome.status === "taken")
      dispatch({
        type: "submitError",
        message: strings.USERNAME_TAKEN_ERROR_TEXT,
      });
    else if (outcome.status === "rate_limited")
      dispatch({
        type: "submitError",
        message: strings.USERNAME_RATE_LIMITED_ERROR_TEXT(
          formatCooldown(outcome.retryAt)
        ),
      });
    else
      dispatch({
        type: "submitError",
        message: strings.GENERIC_ERROR_TEXT,
      });
  };

  return {
    status,
    data,
    usernameStatus,
    isEditing,
    inputValue,
    isSubmitting,
    submitError,
    isPageLoading,
    hideZeroWins,
    selfPage,
    dispatch,
    goToPage,
    toggleHideZeroWins,
    handleSubmitUsername,
  };
};
