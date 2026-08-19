export const GAME_TITLE = "VAGUDLE";

export const WIN_MESSAGES = ["Great Job!", "Awesome", "Well done!"];
export const GAME_COPIED_MESSAGE = "Game copied to clipboard";
export const NOT_ENOUGH_LETTERS_MESSAGE = "Not enough letters";
export const WORD_NOT_FOUND_MESSAGE = "Word not found";
export const CORRECT_WORD_MESSAGE = (solution: string) =>
  `The word was ${solution}`;
export const ENTER_TEXT = "Enter";
export const DELETE_TEXT = "Delete";
export const STATISTICS_TITLE = "Statistics";
export const GUESS_DISTRIBUTION_TEXT = "Guess Distribution";
export const TOTAL_TRIES_TEXT = "Total tries";
export const SUCCESS_RATE_TEXT = "Success rate";
export const CURRENT_STREAK_TEXT = "Current streak";
export const BEST_STREAK_TEXT = "Best streak";
export const DISCOURAGE_INAPP_BROWSER_TEXT =
  "You are using an embedded browser and may experience problems sharing or saving your results. We encourage you rather to use your device's default browser.";
export const CHALLENGE_WIN_MESSAGES = [
  "Challenge conquered!",
  "Challenge complete.",
  "Master of the challenge!",
];

export const MODAL_TITLE_SETTINGS = "Settings";
export const MODAL_TITLE_ACHIEVEMENTS = "Achievements";
export const MODAL_TITLE_VIDEO_ATTRIBUTION = "Video Attribution";
export const MODAL_TITLE_CLOUD_SAVE_FOUND = "Cloud Save Found";
export const MODAL_TITLE_DAILY_SCHEDULE = "Daily Schedule";
export const MODAL_TITLE_DAILY_LEADERBOARD = "Daily Leaderboard";
export const MODAL_TITLE_RESET_ALL_DATA = "Reset All Data";
export const MODAL_TITLE_CREATE_CHALLENGE = "Create Challenge";
export const MODAL_TITLE_OFFLINE_MODE = "You're Offline";

export const OFFLINE_MODE_INTRO_TEXT =
  "We couldn't reach the Vagudle servers. You can still play the base game offline.";
export const OFFLINE_MODE_AVAILABLE_HEADING = "STILL AVAILABLE";
export const OFFLINE_MODE_AVAILABLE_ITEMS = [
  "Unlimited normal and hard mode games",
  "Word length and gameplay settings",
  "Backgrounds and sound effects",
  "Local stats and achievements",
];
export const OFFLINE_MODE_UNAVAILABLE_HEADING = "MAY NOT WORK";
export const OFFLINE_MODE_UNAVAILABLE_ITEMS = [
  "Daily mode and the daily leaderboard",
  "Duels and challenge links",
  "Cloud save and account sign-in",
];
export const OFFLINE_MODE_DISMISS_BUTTON_TEXT = "PLAY OFFLINE";

export const SETTINGS_HARD_MODE_LABEL = "Hard Mode";
export const SETTINGS_HARD_MODE_DESCRIPTION =
  "Only 9 tries to guess the uncommon English word.";
export const SETTINGS_SHOW_GRAY_COUNT_LABEL = "Show Gray Count";
export const SETTINGS_SHOW_GRAY_COUNT_DESCRIPTION =
  "Show the number of gray (absent) letters next to each guess.";
export const SETTINGS_AUTO_GRAY_LABEL = "Auto Gray";
export const SETTINGS_AUTO_GRAY_DESCRIPTION =
  "Fully-gray rows auto-gray matching letters everywhere. Auto-grayed cells are protected and persist through resets.";
export const SETTINGS_AUTO_GREEN_LABEL = "Auto Green";
export const SETTINGS_AUTO_GREEN_DESCRIPTION =
  "Painting a cell green auto-greens the same letter in that column. Changing a green cell clears those auto-greens.";
export const SETTINGS_EXTRA_EFFECTS_LABEL = "Extra Sounds & Animations";
export const SETTINGS_EXTRA_EFFECTS_DESCRIPTION =
  "Toggles win fireworks, a loss trombone, an achievement chest reveal, and video background audio.";
export const SETTINGS_BACKGROUND_LABEL = "BACKGROUND";
export const SETTINGS_BACKGROUND_DESCRIPTION_FREE =
  "Choose your background style. All backgrounds are available in this mode.";
export const SETTINGS_BACKGROUND_DESCRIPTION_LOCKED =
  "Choose your background style. New ones unlock via achievements.";

export const NAVBAR_LEAVE_DUEL_LABEL = "Leave Duel";
export const NAVBAR_LEAVE_CHALLENGE_LABEL = "Leave Challenge";
export const NAVBAR_LEAVE_DAILY_LABEL = "Leave Daily";
export const NAVBAR_NEW_GAME_LABEL = "New Game";
export const NAVBAR_LEAVE_DUEL_TITLE = "LEAVE DUEL?";
export const NAVBAR_LEAVE_DUEL_DESCRIPTION =
  "Your progress for this duel is saved for 24 hours. You can return to this link any time.";
export const NAVBAR_LEAVE_DAILY_TITLE = "LEAVE DAILY?";
export const NAVBAR_LEAVE_DAILY_DESCRIPTION =
  "Your progress on today's daily is saved. You still only get one attempt, so come back and finish it before the reset.";
export const NAVBAR_LEAVE_CHALLENGE_TITLE = "LEAVE CHALLENGE?";
export const NAVBAR_LEAVE_CHALLENGE_DESCRIPTION =
  "Your progress for this challenge is saved. You can return to this link any time.";
export const NAVBAR_ABANDON_GAME_TITLE = "ABANDON GAME?";
export const NAVBAR_ABANDON_GAME_DESCRIPTION =
  "This will count as a loss and reset your current streak.";
export const NAVBAR_ABANDON_BUTTON_TEXT = "ABANDON";
export const NAVBAR_LEAVE_BUTTON_TEXT = "LEAVE";
export const NAVBAR_KEEP_PLAYING_BUTTON_TEXT = "KEEP PLAYING";

export const BANNER_LABEL_CUSTOM_CHALLENGE = "CUSTOM CHALLENGE";
export const BANNER_LABEL_DUEL = "DUEL";
export const BANNER_LABEL_DAILY_PREFIX = "DAILY #";
export const BANNER_DIFFICULTY_HARD_TEXT = "Hard";
export const BANNER_DIFFICULTY_NORMAL_TEXT = "Normal";
export const BANNER_DAILY_ATTEMPT_TEXT = "1 attempt/day";
export const BANNER_DUEL_WINDOW_TEXT = "24h";

export const ERROR_INVALID_CHALLENGE_TITLE = "INVALID CHALLENGE LINK";
export const ERROR_INVALID_CHALLENGE_DESCRIPTION =
  "This challenge link is broken or has been tampered with. Ask the sender to share it again.";
export const ERROR_INVALID_DUEL_TITLE = "INVALID DUEL LINK";
export const ERROR_INVALID_DUEL_DESCRIPTION =
  "This duel link is broken or has been tampered with. Ask for a new link.";
export const ERROR_DUEL_EXPIRED_TITLE = "DUEL EXPIRED";
export const ERROR_DUEL_EXPIRED_DESCRIPTION =
  "This duel link has expired. Duel links are only valid for 24 hours. Ask for a new duel to be created.";
export const ERROR_ACTIVITY_DUEL_EXPIRED_DESCRIPTION =
  "This duel has expired. Activity duels are only valid for 24 hours. Ask for a new duel to be sent in Discord.";
export const ERROR_WRONG_ACCOUNT_TITLE = "WRONG ACCOUNT";
export const ERROR_WRONG_ACCOUNT_DESCRIPTION =
  "This duel was not sent to your Discord account. Make sure you are logged in as the right user.";
export const ERROR_HAVE_YOU_PLAYED_TITLE = "HAVE YOU PLAYED BEFORE?";
export const ERROR_LINK_ACCOUNT_DESCRIPTION =
  "Link your existing Vagudle account to keep your stats, or start a new one just for Discord.";
export const ERROR_LINK_EXISTING_BUTTON_TEXT = "I'VE PLAYED BEFORE";
export const ERROR_START_FRESH_BUTTON_TEXT = "START FRESH";
export const ERROR_LINKING_IN_PROGRESS_DESCRIPTION =
  "Finish signing in from the page that just opened, then come back here — this will pick it up automatically.";
export const ERROR_LINKING_FAILED_DESCRIPTION =
  "Could not start linking right now. Try again in a moment.";
export const ERROR_ALREADY_PLAYED_TITLE = "ALREADY PLAYED TODAY";
export const ERROR_ALREADY_PLAYED_WEB_DESCRIPTION =
  "You already played today's daily on the website.";
export const ERROR_ALREADY_PLAYED_DEFAULT_DESCRIPTION =
  "You've already played today's daily.";
export const ERROR_SOMETHING_WRONG_TITLE = "SOMETHING WENT WRONG";
export const ERROR_SOMETHING_WRONG_HINT =
  "If this keeps happening, check the browser console for details.";
export const ACTIVITY_ERROR_MESSAGES: Record<
  "daily" | "daily_link" | "duel" | "duel_word",
  string
> = {
  daily:
    "Could not load today's daily. Try rejoining the activity from Discord.",
  daily_link:
    "Could not link your account. Try rejoining the activity from Discord.",
  duel: "Could not load your duel. Try rejoining the activity from Discord.",
  duel_word:
    "Could not load this duel's word. Try rejoining the activity from Discord.",
};
