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
export const DAYS_PLAYED_TEXT = "Days played";
export const LAST_COMPLETED_TEXT = "Last completed";
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
export const MODAL_TITLE_WEBGL_UNAVAILABLE = "Graphics Not Supported";

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

export const WEBGL_UNAVAILABLE_BODY_TEXT = (backgroundLabel: string) =>
  `${backgroundLabel} needs WebGL, which your browser or device doesn't support. Try updating your graphics drivers, switching browsers, or picking a different background.`;
export const WEBGL_UNAVAILABLE_DISMISS_BUTTON_TEXT = "OK";

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

export const SETTINGS_NOTIFICATIONS_DAILY_STREAK_LABEL = "Streak Reset Warning";
export const SETTINGS_NOTIFICATIONS_DAILY_STREAK_DESCRIPTION =
  "Get warned before your streak resets, if you haven't played today's daily yet.";
export const SETTINGS_NOTIFICATIONS_STREAK_HOURS_SUFFIX = "hours before reset";
export const SETTINGS_NOTIFICATIONS_CUSTOM_TIME_LABEL = "Custom Reminder Time";
export const SETTINGS_NOTIFICATIONS_CUSTOM_TIME_DESCRIPTION =
  "Pick a specific time each day to get a reminder to play.";
export const SETTINGS_NOTIFICATIONS_INACTIVITY_LABEL = "Inactivity Reminder";
export const SETTINGS_NOTIFICATIONS_INACTIVITY_DESCRIPTION =
  "Get nudged if you haven't played in a while.";
export const SETTINGS_NOTIFICATIONS_INACTIVITY_DAYS_SUFFIX =
  "days of inactivity";

export const SETTINGS_HAPTICS_LABEL = "Haptic Feedback";
export const SETTINGS_HAPTICS_DESCRIPTION =
  "Feel a vibration on wins, losses, achievement unlocks, and invalid words.";

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

export const CLOSE_BUTTON_LABEL = "Close";

export const INFO_MODAL_TITLE = "INFORMATION";
export const INFO_TAB_HOWTO_LABEL = "HOW TO";
export const INFO_TAB_FEATURES_LABEL = "FEATURES";
export const INFO_TAB_CHALLENGES_LABEL = "CHALLENGES";
export const INFO_TAB_ABOUT_LABEL = "ABOUT";
export const INFO_TAB_OPENSOURCE_LABEL = "SOURCE";
export const INFO_TAB_FEEDBACK_LABEL = "FEEDBACK";
export const INFO_MODAL_FOOTER_TOS_LABEL = "TOS";
export const INFO_MODAL_FOOTER_AUTHOR_LABEL = "KING TAJIN";
export const INFO_MODAL_FOOTER_PRIVACY_LABEL = "PRIVACY POLICY";

export const ABOUT_INTRO_TEXT_BEFORE_LINK =
  "Vagudle is a word-guessing game inspired by";
export const ABOUT_INTRO_LINK_TEXT = "Hardle";
export const ABOUT_INTRO_TEXT_AFTER_LINK =
  ", with extra tools to help you solve the puzzle and no pesky daily limit to get in your way.";
export const ABOUT_DISCORD_TEXT_BEFORE_LINK = "The";
export const ABOUT_DISCORD_LINK_TEXT = "Discord server";
export const ABOUT_DISCORD_TEXT_AFTER_LINK =
  "has an exclusive Duel feature where you can challenge other members head-to-head and compete on a live leaderboard to see who can crack the word in the fewest guesses.";
export const ABOUT_FAVICON_ALT = "Vagudle favicon";
export const ABOUT_ICON_ALT = "Vagudle icon";
export const ABOUT_RESET_BUTTON_TITLE =
  "Erases all saved progress, stats, achievements, and settings.";
export const ABOUT_RESET_BUTTON_TEXT = "RESET ALL DATA";
export const ABOUT_RESTORE_ATTRIBUTIONS_TITLE =
  "Hid a video background's attribution button? Bring it back here.";
export const ABOUT_RESTORE_ATTRIBUTIONS_TEXT = "RESTORE ATTRIBUTIONS";
export const ABOUT_ATTRIBUTIONS_VISIBLE_TEXT = "ATTRIBUTIONS VISIBLE";
export const ABOUT_STORE_BUTTON_TEXT = "VISIT THE STORE";
export const ABOUT_STORE_URL_DISPLAY_TEXT = "store.king-tajin.dev →";

export const CHALLENGES_IN_GAME_HEADING = "IN THE GAME";
export const CHALLENGES_STEP1_TEXT_PART1 = "Open";
export const CHALLENGES_SETTINGS_LABEL = "Settings";
export const CHALLENGES_STEP1_TEXT_PART2 = "and go to the";
export const CHALLENGES_CHALLENGE_TAB_LABEL = "Challenge";
export const CHALLENGES_STEP1_TEXT_PART3 =
  "tab. Pick a dictionary, choose how many guesses to allow, type your secret word, and hit Generate Link. Share the link to let others play your custom word with exactly the settings you chose.";
export const CHALLENGES_RESULTS_NOTE_TEXT =
  "Results never count toward the recipient's stats, and their progress is saved to the link so they can come back to it any time.";
export const CHALLENGES_VIA_DISCORD_HEADING = "VIA DISCORD";
export const CHALLENGES_DISCORD_TEXT_PART1 = "In the";
export const CHALLENGES_DISCORD_LINK_TEXT = "King-Tajin Discord server";
export const CHALLENGES_DISCORD_TEXT_PART2 = ", use the";
export const CHALLENGES_SLASH_COMMAND_LABEL = "/vagudle_challenge";
export const CHALLENGES_DISCORD_TEXT_PART3 =
  "slash command to generate a challenge link directly from Discord.";

export const HOWTO_INTRO_TEXT_PART1 = "Type a word and press";
export const HOWTO_INTRO_TEXT_PART2 =
  "to submit a guess. You have 11 tries to find the hidden word.";
export const HOWTO_PAINT_HEADING = "PAINT THE RESULT";
export const HOWTO_PAINT_DESCRIPTION =
  "Cells don't color automatically. Select a brush, then click or drag cells to mark what you can figure out with the limited clues you have.";
export const HOWTO_GREEN_DESCRIPTION = "Right letter, right spot";
export const HOWTO_YELLOW_DESCRIPTION = "Right letter, wrong spot";
export const HOWTO_GRAY_DESCRIPTION = "Letter not in the word";
export const HOWTO_ROW_TOOLS_HEADING = "ROW TOOLS";
export const HOWTO_CLEAR_ROW_DESCRIPTION = "Clears that row's painted colors";
export const HOWTO_BADGE_COUNT_DESCRIPTION =
  "Count of correct, present, and absent letters per row";
export const HOWTO_KEYBOARD_HEADING = "KEYBOARD";
export const HOWTO_KEYBOARD_DESCRIPTION =
  "Key colors update as you paint — confirmed, present, and eliminated letters are always visible at a glance.";

export const FEEDBACK_VALIDATION_ERROR_MESSAGE =
  "Please fill in all required fields.";
export const FEEDBACK_SUBMIT_ERROR_MESSAGE =
  "Failed to send feedback. Please try again.";
export const FEEDBACK_SUCCESS_TITLE = "FEEDBACK RECEIVED!";
export const FEEDBACK_SUCCESS_MESSAGE = "Thanks for helping improve Vagudle.";
export const FEEDBACK_SEND_ANOTHER_BUTTON_TEXT = "SEND ANOTHER";
export const FEEDBACK_TYPE_LABEL = "FEEDBACK TYPE *";
export const FEEDBACK_POSITIVE_LABEL = "Positive";
export const FEEDBACK_NEGATIVE_LABEL = "Negative";
export const FEEDBACK_CATEGORY_LABEL = "CATEGORY *";
export const FEEDBACK_CATEGORY_PLACEHOLDER = "Select a category...";
export const FEEDBACK_CATEGORY_BUG_REPORT = "Bug Report";
export const FEEDBACK_CATEGORY_FEATURE_REQUEST = "Feature Request";
export const FEEDBACK_CATEGORY_GENERAL = "General Feedback";
export const FEEDBACK_EMAIL_LABEL = "EMAIL (OPTIONAL)";
export const FEEDBACK_EMAIL_PLACEHOLDER = "your.email@example.com";
export const FEEDBACK_EMAIL_HINT = "Only if you want a response";
export const FEEDBACK_MESSAGE_LABEL = "YOUR FEEDBACK *";
export const FEEDBACK_MESSAGE_FULLSCREEN_LABEL = "YOUR FEEDBACK";
export const FEEDBACK_MESSAGE_PLACEHOLDER = "Tell us what's on your mind...";
export const FEEDBACK_CHARACTERS_LEFT_TEXT = (remaining: number) =>
  `${remaining.toLocaleString()} characters left`;
export const FEEDBACK_EXPAND_LABEL = "Expand";
export const FEEDBACK_COLLAPSE_LABEL = "Collapse";
export const FEEDBACK_SENDING_BUTTON_TEXT = "SENDING...";
export const FEEDBACK_SEND_BUTTON_TEXT = "SEND FEEDBACK";

export const OPEN_SOURCE_PROJECT_LINK_TEXT = "Vagudle";
export const OPEN_SOURCE_INTRO_TEXT_MIDDLE = "is open source and based on";
export const OPEN_SOURCE_BASED_ON_LINK_TEXT = "react-wordle";
export const OPEN_SOURCE_INTRO_TEXT_END =
  ". Contributions and feedback are welcome.";
export const OPEN_SOURCE_MADE_BY_TEXT = "Made by";
export const OPEN_SOURCE_AUTHOR_LINK_TEXT = "King Tajin";

export const FEATURES_LIST: [string, string][] = [
  [
    "Variable word length",
    "Play with anywhere between 4 and 7-letter words via Settings.",
  ],
  [
    "Hard mode",
    "Solutions are selected from uncommon words and the player is limited to 9 guesses.",
  ],
  [
    "Daily",
    "A new word unlocks once a day, alternating between 4- and 5-letter, normal and hard mode. Track your streak on the leaderboard, and subscribe to a calendar reminder so you never miss one.",
  ],
  [
    "Cell painting",
    "Select a brush and click or drag across cells to color them.",
  ],
  ["Auto-Gray", "Automatically grays out letters from fully-gray rows."],
  [
    "Auto-Green",
    "Fills in user marked correct letters across all rows automatically.",
  ],
  ["Gray count", "Shows how many absent letters are in a row."],
];

export const PROVIDER_LABEL_GOOGLE = "Google";
export const PROVIDER_LABEL_GITHUB = "GitHub";
export const PROVIDER_LABEL_DISCORD = "Discord";
export const PROVIDER_LABEL_DEFAULT = "your provider";

export const RESET_DATA_CATEGORIES: { title: string; description: string }[] = [
  {
    title: "Current game",
    description: "Current in-progress word, guesses, and cell colors.",
  },
  {
    title: "Statistics",
    description:
      "Win streak, win distribution, and success rate, for both normal and hard mode.",
  },
  {
    title: "Achievements",
    description:
      "Every achievement you've unlocked and the progress toward them.",
  },
  {
    title: "Settings",
    description:
      "Word length, hard mode, gray count, auto-gray, auto-green, and extra sounds & animations.",
  },
  {
    title: "Background",
    description:
      "Your selected background theme and any hidden video attribution buttons.",
  },
  {
    title: "Challenge & Duel links",
    description:
      "Saved progress for any custom challenge or duel links you've opened.",
  },
];

export const RESET_DATA_DELETION_STEPS = [
  "Sign in with the account linked to your Vagudle data (Google, GitHub, email, or Discord).",
  'Press "Delete My Data" (or turn on "Also delete my account" here, then confirm).',
  "Confirm then your data is deleted immediately.",
];

export const RESET_DATA_DELETION_DELETED_ITEMS = [
  "Your sign-in (Google, GitHub, email link, Discord, or Play Games).",
  "Your saved game: stats, achievements, settings, and background.",
  "Your daily-leaderboard entry and streak.",
  "Your daily-attempt history.",
  "Your individual duel match history, if linked to Discord.",
];

export const RESET_DATA_DELETION_KEPT_TEXT =
  "If you've used Vagudle's Discord integration, some data tied to your " +
  "Discord ID is kept permanently to preserve other players' match " +
  "history and your Discord server's group leaderboards/streaks: " +
  "aggregate duel win/loss standings, and group daily-challenge " +
  "participation records. This is not deleted by the steps above, and " +
  "there is no expiry period for it.";

export const RESET_DATA_REAUTH_TEXT_BEFORE_PROVIDER =
  "For your security, deleting your account requires a recent sign-in. Authorize deletion to sign in again with";
export const RESET_DATA_REAUTH_TEXT_AFTER_PROVIDER =
  ", then your account and all its data will be permanently deleted.";
export const RESET_DATA_CANCEL_BUTTON_TEXT = "CANCEL";
export const RESET_DATA_AUTHORIZE_BUTTON_TEXT = "AUTHORIZE DELETION";
export const RESET_DATA_WARNING_TEXT =
  "This permanently erases everything Vagudle has saved in this browser. It cannot be undone.";
export const RESET_DATA_ALSO_DELETE_ACCOUNT_LABEL = "Also delete my account";
export const RESET_DATA_DETAILS_ARIA_LABEL =
  "What gets deleted and what's kept";
export const RESET_DATA_DETAILS_BUTTON_TEXT = "DETAILS";
export const RESET_DATA_ACCOUNT_DESC_BEFORE_PROVIDER =
  "Permanently deletes your";
export const RESET_DATA_ACCOUNT_DESC_AFTER_PROVIDER =
  "sign-in link to Vagudle and erases your cloud save. This cannot be undone.";
export const RESET_DATA_NOT_SIGNED_IN_TEXT =
  "Not signed in so there's no account to delete.";
export const RESET_DATA_WAIT_BUTTON_TEXT = (seconds: number) =>
  `WAIT ${seconds}s`;
export const RESET_DATA_DELETING_BUTTON_TEXT = "DELETING...";
export const RESET_DATA_DELETE_ACCOUNT_AND_DATA_BUTTON_TEXT =
  "DELETE ACCOUNT & DATA";
export const RESET_DATA_DELETE_EVERYTHING_BUTTON_TEXT = "DELETE EVERYTHING";
export const RESET_DATA_DETAILS_MODAL_TITLE = "ACCOUNT DELETION DETAILS";
export const RESET_DATA_HOW_TO_DELETE_HEADING = "HOW TO DELETE";
export const RESET_DATA_WHAT_GETS_DELETED_HEADING = "WHAT GETS DELETED";
export const RESET_DATA_WHATS_KEPT_HEADING = "WHAT'S KEPT";
export const RESET_DATA_CLOSE_BUTTON_TEXT = "CLOSE";

export const DAILY_SCHEDULE_UNLOCK_TEXT_BEFORE_TIME = "New daily unlocks at";
export const DAILY_SCHEDULE_UNLOCK_TEXT_AFTER_TIME = "your time";
export const DAILY_SCHEDULE_TODAY_LABEL = "TODAY";
export const DAILY_SCHEDULE_WORD_LENGTH_TEXT = (letters: number) =>
  `${letters} letters`;
export const DAILY_SCHEDULE_HARD_LABEL = "HARD";
export const DAILY_SCHEDULE_NORMAL_LABEL = "NORMAL";
export const DAILY_SCHEDULE_ADD_TO_CALENDAR_HEADING = "ADD TO CALENDAR";
export const DAILY_SCHEDULE_SUBSCRIBE_DESCRIPTION =
  "Subscribe once and your calendar app checks for the daily unlock automatically. Pick what hour you want reminded:";
export const DAILY_SCHEDULE_REMINDER_HOUR_ARIA_LABEL = "Reminder hour";
export const DAILY_SCHEDULE_SUBSCRIBE_ARIA_LABEL =
  "Subscribe to daily reminder calendar feed";
export const DAILY_SCHEDULE_OPENING_BUTTON_TEXT = "OPENING...";
export const DAILY_SCHEDULE_SUBSCRIBE_BUTTON_TEXT = "SUBSCRIBE";
export const DAILY_SCHEDULE_COPY_ARIA_LABEL = "Copy calendar link";
export const DAILY_SCHEDULE_DOWNLOAD_PROMPT_TEXT =
  "Didn't open your calendar app?";
export const DAILY_SCHEDULE_DOWNLOAD_BUTTON_TEXT = "DOWNLOAD";
export const DAILY_SCHEDULE_DISMISS_BUTTON_TEXT = "DISMISS";
export const DAILY_SCHEDULE_FOOTER_NOTE_TEXT =
  'Apple Calendar and Outlook can subscribe directly via the button above. For Google Calendar, use the copy button and add it under "Other calendars → From URL".';

export const ACHIEVEMENTS_HIDDEN_PLACEHOLDER = "???";
export const ACHIEVEMENTS_PROGRESS_LABEL = "PROGRESS";
export const ACHIEVEMENTS_UNLOCKS_HIDDEN_TEXT = "UNLOCKS: ???";
export const ACHIEVEMENTS_UNLOCKS_TEXT = (label: string) => `UNLOCKS: ${label}`;
export const ACHIEVEMENTS_PREV_PAGE_LABEL = "Previous page";
export const ACHIEVEMENTS_NEXT_PAGE_LABEL = "Next page";
export const ACHIEVEMENTS_PAGE_INDICATOR_TEXT = (
  current: number,
  total: number
) => `PAGE ${current}/${total}`;

export const ACHIEVEMENT_TEXT: Record<
  string,
  { title: string; description: string }
> = {
  first_win: { title: "First Victory", description: "Win your first game" },
  win_15: { title: "Seasoned Player", description: "Win 15 games" },
  win_50: { title: "Veteran", description: "Win 50 games" },
  on_a_roll: { title: "On a Roll", description: "Win 5 games in a row" },
  unstoppable: {
    title: "Unstoppable",
    description: "Win 15 games in a row",
  },
  hard_5plus: {
    title: "Hard Core",
    description: "Beat Hard Mode with a word 5 letters or longer",
  },
  fifth_guess: {
    title: "Speed Demon",
    description: "Solve a word in 5 guesses or fewer",
  },
  seven_letters: {
    title: "Heavyweight Champion",
    description: "Win a game with a 7-letter word",
  },
  close_but_no_cigar: {
    title: "Close But No Cigar",
    description:
      "Guess 3 different words in a row with only one letter incorrect",
  },
  process_of_elimination: {
    title: "Process of Elimination",
    description:
      "Guess 3 different words in the same game with every letter incorrect",
  },
  word_connoisseur: {
    title: "Word Connoisseur",
    description: "Guess 200 unique words in normal or hard mode",
  },
  quack: {
    title: "Quack!",
    description:
      "Spell DUCK vertically down any column across 4 guesses in a row",
  },
  guess_mouse: {
    title: "Squeak!",
    description: "Type MOUSE as a guess during a game",
  },
  nail_biter: {
    title: "Nail-Biter",
    description: "Win a game on your very last guess",
  },
  diversify: {
    title: "Diversify",
    description:
      "Win in 3+ guesses without repeating a letter's position across your earlier guesses (excluding solution)",
  },
  blind_faith: {
    title: "Blind Faith",
    description:
      "Win a game where only one letter position is ever correct before your winning guess",
  },
  completionist: {
    title: "Completionist",
    description: "Unlock all other achievements",
  },
};

export const NAVBAR_BRAND_TITLE = "Yellow Skipper";
export const NAVBAR_BRAND_SUBTITLE = "Games";
export const NAVBAR_HOW_TO_PLAY_ARIA_LABEL = "How to play";
export const NAVBAR_DAILY_WORD_ARIA_LABEL = "Daily word";
export const NAVBAR_DAILY_TITLE = "Daily";
export const NAVBAR_STATISTICS_ARIA_LABEL = "Statistics";
export const NAVBAR_SETTINGS_ARIA_LABEL = "Settings";
export const NAVBAR_NUDGE_HEADING = "FIRST TIME HERE?";
export const NAVBAR_NUDGE_DESCRIPTION =
  "Check out Settings to customize word length, helpful tools, and more.";
export const NAVBAR_NUDGE_DISMISS_BUTTON_TEXT = "DISMISS";

export const DISCLAIMER_BANNER_ARIA_LABEL = "Affiliation disclaimer";
export const DISCLAIMER_BANNER_LABEL = "DISCLAIMER";
export const DISCLAIMER_BANNER_TEXT_PART1 =
  '"King-Tajin" is just the developer\'s personal gamertag. This site and its creator are';
export const DISCLAIMER_BANNER_TEXT_PART2 =
  "not affiliated with, sponsored by, or endorsed by Industrias Tajín, S.A. de C.V.";
export const DISCLAIMER_BANNER_DISMISS_ARIA_LABEL = "Dismiss disclaimer";
export const DISCLAIMER_BANNER_DISMISS_BUTTON_TEXT = "GOT IT";

export const ATTRIBUTION_BUTTON_ARIA_LABEL = "Background video attribution";

export const LEADERBOARD_LOADING_TEXT = "Loading leaderboard...";
export const LEADERBOARD_ERROR_TEXT =
  "Couldn't load the leaderboard. Please try again later.";
export const LEADERBOARD_SIGN_IN_PROMPT_TEXT =
  "Sign in to save your name and appear on the leaderboard.";
export const LEADERBOARD_GO_TO_SETTINGS_BUTTON_TEXT = "GO TO SETTINGS";
export const LEADERBOARD_CHANGE_USERNAME_HEADING = "CHANGE USERNAME";
export const LEADERBOARD_SET_USERNAME_HEADING =
  "SET A USERNAME TO JOIN THE LEADERBOARD";
export const LEADERBOARD_USERNAME_PLACEHOLDER = "Your leaderboard name";
export const LEADERBOARD_USERNAME_ARIA_LABEL = "Leaderboard username";
export const LEADERBOARD_SAVING_INDICATOR = "...";
export const LEADERBOARD_SAVE_BUTTON_TEXT = "SAVE";
export const LEADERBOARD_PLAYING_AS_TEXT = "Playing as";
export const LEADERBOARD_CHANGE_BUTTON_TEXT = "CHANGE";
export const LEADERBOARD_COOLDOWN_TEXT_BEFORE = "Please wait";
export const LEADERBOARD_COOLDOWN_TEXT_AFTER = "before changing your username.";
export const LEADERBOARD_EMPTY_TEXT =
  "No results yet. Be the first on the board!";
export const LEADERBOARD_PREV_BUTTON_TEXT = "PREV";
export const LEADERBOARD_PAGE_INDICATOR_TEXT = (
  page: number,
  totalPages: number
) => `Page ${page} / ${totalPages}`;
export const LEADERBOARD_NEXT_BUTTON_TEXT = "NEXT";
export const LEADERBOARD_JUMP_TO_MY_PAGE_BUTTON_TEXT = "JUMP TO MY PAGE";

export const ATTRIBUTION_MODAL_BY_PREFIX = "by";
export const ATTRIBUTION_MODAL_LICENSE_PREFIX = "License:";
export const ATTRIBUTION_MODAL_HIDE_HEADING =
  "HIDE ATTRIBUTION FOR THIS BACKGROUND";
export const ATTRIBUTION_MODAL_VIEW_SOURCE_ARIA_LABEL = (title: string) =>
  `View source for ${title}`;
export const ATTRIBUTION_MODAL_HIDE_TOGGLE_ARIA_LABEL =
  "Hide attribution for this background";

export const ACHIEVEMENT_TRAY_ARIA_LABEL = "Achievements";
export const ACHIEVEMENT_TRAY_HIDE_ARIA_LABEL = "Hide achievements tray";
export const ACHIEVEMENT_TRAY_SHOW_ARIA_LABEL = "Show achievements tray";

export const BACKGROUND_TRAY_ARIA_LABEL = "Backgrounds";
export const BACKGROUND_TRAY_HIDE_ARIA_LABEL = "Hide background tray";
export const BACKGROUND_TRAY_SHOW_ARIA_LABEL = "Show background tray";

export const LINK_DISCORD_INVALID_LINK_TEXT =
  "This link is missing or invalid. Go back to Discord and try linking your account again.";
export const LINK_DISCORD_LINKED_TEXT =
  "Your account is linked. You can close this tab and go back to Discord, or return to Vagudle below.";
export const LINK_DISCORD_RETURN_BUTTON_TEXT = "RETURN TO VAGUDLE";
export const LINK_DISCORD_LINKING_TEXT = "Linking your account...";
export const LINK_DISCORD_TRY_AGAIN_BUTTON_TEXT = "TRY AGAIN";
export const LINK_DISCORD_SIGNED_IN_TEXT_BEFORE = "Signed in as";
export const LINK_DISCORD_SIGNED_IN_TEXT_AFTER = ". Finishing the link...";
export const LINK_DISCORD_FALLBACK_ACCOUNT_TEXT = "your account";
export const LINK_DISCORD_SIGN_IN_PROMPT_TEXT =
  "Sign in with your existing Vagudle account to link it to Discord.";
export const LINK_DISCORD_CONTINUE_GOOGLE_BUTTON_TEXT = "CONTINUE WITH GOOGLE";
export const LINK_DISCORD_CONTINUE_GITHUB_BUTTON_TEXT = "CONTINUE WITH GITHUB";
export const LINK_DISCORD_EMAIL_LABEL = "EMAIL";
export const LINK_DISCORD_EMAIL_PLACEHOLDER = "you@example.com";
export const LINK_DISCORD_SEND_LINK_BUTTON_TEXT = "SEND SIGN-IN LINK";
export const LINK_DISCORD_EMAIL_SENT_TEXT =
  "Check your email for a sign-in link, then open it in this same browser.";
export const LINK_DISCORD_HEADING = "LINK YOUR ACCOUNT";
