// noinspection JSUnusedGlobalSymbols, SpellCheckingInspection

export const GAME_TITLE = "VAGUDLE";

export const ACHIEVEMENT_REVEAL_UNLOCKED_TEXT = "Prestation upplåst!";
export const WIN_CELEBRATION_TITLE_TEXT = "DU VINNER!";
export const LOADING_WORDS_TEXT = "LADDAR ORD...";
export const PLAY_NORMAL_GAME_BUTTON_TEXT = () => `SPELA NORMAL ${GAME_TITLE}`;
export const TRY_AGAIN_BUTTON_TEXT = "FÖRSÖK IGEN";

export const WIN_MESSAGES = ["Bra jobbat!", "Grymt", "Snyggt gjort!"];
export const GAME_COPIED_MESSAGE = "Spelet kopierat till urklipp";
export const DISCORD_ACCOUNT_LINKED_MESSAGE = "Discord-konto länkat!";
export const NOT_ENOUGH_LETTERS_MESSAGE = "För få bokstäver";
export const WORD_NOT_FOUND_MESSAGE = "Ordet hittades inte";
export const CORRECT_WORD_MESSAGE = (solution: string) =>
  `Ordet var ${solution}`;
export const ENTER_TEXT = "Enter";
export const DELETE_TEXT = "Radera";
export const STATISTICS_TITLE = "Statistik";
export const GUESS_DISTRIBUTION_TEXT = "Gissningsfördelning";
export const TOTAL_TRIES_TEXT = "Totalt antal försök";
export const SUCCESS_RATE_TEXT = "Vinstandel";
export const CURRENT_STREAK_TEXT = "Nuvarande svit";
export const BEST_STREAK_TEXT = "Bästa svit";
export const DAYS_PLAYED_TEXT = "Spelade dagar";
export const LAST_COMPLETED_TEXT = "Senast avklarad";
export const DISCOURAGE_INAPP_BROWSER_TEXT =
  "Du använder en inbäddad webbläsare och kan uppleva problem med att dela eller spara dina resultat. Vi rekommenderar att du istället använder enhetens standardwebbläsare.";
export const CHALLENGE_WIN_MESSAGES = [
  "Utmaningen besegrad!",
  "Utmaning genomförd.",
  "Mästare på utmaningen!",
];

export const MODAL_TITLE_SETTINGS = "Inställningar";
export const MODAL_TITLE_ACHIEVEMENTS = "Prestationer";
export const MODAL_TITLE_VIDEO_ATTRIBUTION = "Videokreditering";
export const MODAL_TITLE_CLOUD_SAVE_FOUND = "Molnsparfil hittad";
export const MODAL_TITLE_DAILY_SCHEDULE = "Dagligt schema";
export const MODAL_TITLE_DAILY_LEADERBOARD = "Daglig topplista";
export const MODAL_TITLE_RESET_ALL_DATA = "Återställ all data";
export const MODAL_TITLE_CREATE_CHALLENGE = "Skapa utmaning";
export const MODAL_TITLE_OFFLINE_MODE = "Du är offline";
export const MODAL_TITLE_WEBGL_UNAVAILABLE = "Grafik stöds inte";

export const OFFLINE_MODE_INTRO_TEXT =
  "Vi kunde inte nå Vagudles servrar. Du kan fortfarande spela grundspelet offline.";
export const OFFLINE_MODE_AVAILABLE_HEADING = "FORTFARANDE TILLGÄNGLIGT";
export const OFFLINE_MODE_AVAILABLE_ITEMS = [
  "Obegränsat med normal- och svårt läge-spel",
  "Ordlängd och spelinställningar",
  "Bakgrunder och ljudeffekter",
  "Lokal statistik och prestationer",
];
export const OFFLINE_MODE_UNAVAILABLE_HEADING = "KANSKE INTE FUNGERAR";
export const OFFLINE_MODE_UNAVAILABLE_ITEMS = [
  "Dagligt läge och den dagliga topplistan",
  "Dueller och utmaningslänkar",
  "Molnsparning och kontoinloggning",
];
export const OFFLINE_MODE_DISMISS_BUTTON_TEXT = "SPELA OFFLINE";

export const WEBGL_UNAVAILABLE_BODY_TEXT = (backgroundLabel: string) =>
  `${backgroundLabel} kräver WebGL, vilket din webbläsare eller enhet inte stöder. Försök uppdatera dina grafikdrivrutiner, byta webbläsare eller välja en annan bakgrund.`;
export const WEBGL_UNAVAILABLE_DISMISS_BUTTON_TEXT = "OK";
export const WEBGL_UNAVAILABLE_DEFAULT_BACKGROUND_LABEL = "Den här bakgrunden";

export const SETTINGS_HARD_MODE_LABEL = "Svårt läge";
export const SETTINGS_HARD_MODE_DESCRIPTION =
  "Endast 9 försök att gissa det ovanliga engelska ordet.";
export const SETTINGS_SHOW_GRAY_COUNT_LABEL = "Visa antal grå";
export const SETTINGS_SHOW_GRAY_COUNT_DESCRIPTION =
  "Visa antalet grå (saknade) bokstäver bredvid varje gissning.";
export const SETTINGS_AUTO_GRAY_LABEL = "Auto-grå";
export const SETTINGS_AUTO_GRAY_DESCRIPTION =
  "Helt grå rader auto-gråmarkerar matchande bokstäver överallt. Auto-gråmarkerade rutor är skyddade och behålls vid återställningar.";
export const SETTINGS_AUTO_GREEN_LABEL = "Auto-grön";
export const SETTINGS_AUTO_GREEN_DESCRIPTION =
  "Att färga en ruta grön auto-grönmarkerar samma bokstav i den kolumnen. Att ändra en grön ruta rensar de auto-grönmarkeringarna.";
export const SETTINGS_EXTRA_EFFECTS_LABEL = "Extra ljud & animationer";
export const SETTINGS_EXTRA_EFFECTS_DESCRIPTION =
  "Slår av/på segerfyrverkerier, en förlorartrombon, en avslöjning av prestationskista och ljud för videobakgrunder.";
export const SETTINGS_BACKGROUND_LABEL = "BAKGRUND";
export const SETTINGS_BACKGROUND_DESCRIPTION_FREE =
  "Välj din bakgrundsstil. Alla bakgrunder är tillgängliga i det här läget.";
export const SETTINGS_BACKGROUND_DESCRIPTION_LOCKED =
  "Välj din bakgrundsstil. Nya låses upp via prestationer.";

export const SETTINGS_LANGUAGE_LABEL = "Språk";
export const SETTINGS_LANGUAGE_DESCRIPTION =
  "Välj vilket språk som används för menyer och text. Ordlistorna förblir på engelska.";
export const SETTINGS_LANGUAGE_ARIA_LABEL = "Välj språk";
export const SETTINGS_LANGUAGE_SAVING_TEXT = "Sparar...";

export const SETTINGS_NOTIFICATIONS_DAILY_STREAK_LABEL =
  "Varning för svitåterställning";
export const SETTINGS_NOTIFICATIONS_DAILY_STREAK_DESCRIPTION =
  "Bli varnad innan din svit återställs, om du inte har spelat dagens dagliga ord än.";
export const SETTINGS_NOTIFICATIONS_STREAK_HOURS_SUFFIX =
  "timmar före återställning";
export const SETTINGS_NOTIFICATIONS_CUSTOM_TIME_LABEL =
  "Anpassad påminnelsetid";
export const SETTINGS_NOTIFICATIONS_CUSTOM_TIME_DESCRIPTION =
  "Välj en specifik tid varje dag för att få en påminnelse om att spela.";
export const SETTINGS_NOTIFICATIONS_INACTIVITY_LABEL =
  "Påminnelse vid inaktivitet";
export const SETTINGS_NOTIFICATIONS_INACTIVITY_DESCRIPTION =
  "Bli knuffad om du inte har spelat på ett tag.";
export const SETTINGS_NOTIFICATIONS_INACTIVITY_DAYS_SUFFIX =
  "dagars inaktivitet";
export const SETTINGS_NOTIFICATIONS_REMINDER_HOUR_ARIA_LABEL =
  "Påminnelsetimme";
export const SETTINGS_NOTIFICATIONS_REMINDER_MINUTE_ARIA_LABEL =
  "Påminnelseminut";
export const SETTINGS_NOTIFICATIONS_REMINDER_PERIOD_ARIA_LABEL =
  "Påminnelse FM eller EM";
export const SETTINGS_NOTIFICATIONS_DECREASE_DAYS_LABEL = "Minska dagar";
export const SETTINGS_NOTIFICATIONS_INCREASE_DAYS_LABEL = "Öka dagar";
export const SETTINGS_NOTIFICATIONS_DECREASE_HOURS_LABEL = "Minska timmar";
export const SETTINGS_NOTIFICATIONS_INCREASE_HOURS_LABEL = "Öka timmar";

export const SETTINGS_HAPTICS_LABEL = "Haptisk feedback";
export const SETTINGS_HAPTICS_DESCRIPTION =
  "Känn en vibration vid vinster, förluster, upplåsta prestationer och ogiltiga ord.";

export const NAVBAR_LEAVE_DUEL_LABEL = "Lämna duell";
export const NAVBAR_LEAVE_CHALLENGE_LABEL = "Lämna utmaning";
export const NAVBAR_LEAVE_DAILY_LABEL = "Lämna dagligt";
export const NAVBAR_NEW_GAME_LABEL = "Nytt spel";
export const NAVBAR_LEAVE_DUEL_TITLE = "LÄMNA DUELL?";
export const NAVBAR_LEAVE_DUEL_DESCRIPTION =
  "Ditt framsteg för den här duellen sparas i 24 timmar. Du kan återvända till den här länken när som helst.";
export const NAVBAR_LEAVE_DAILY_TITLE = "LÄMNA DAGLIGT?";
export const NAVBAR_LEAVE_DAILY_DESCRIPTION =
  "Ditt framsteg på dagens dagliga ord sparas. Du får ändå bara ett försök, så kom tillbaka och avsluta det innan återställningen.";
export const NAVBAR_LEAVE_CHALLENGE_TITLE = "LÄMNA UTMANING?";
export const NAVBAR_LEAVE_CHALLENGE_DESCRIPTION =
  "Ditt framsteg för den här utmaningen sparas. Du kan återvända till den här länken när som helst.";
export const NAVBAR_ABANDON_GAME_TITLE = "AVBRYT SPELET?";
export const NAVBAR_ABANDON_GAME_DESCRIPTION =
  "Det här kommer att räknas som en förlust och återställa din nuvarande svit.";
export const NAVBAR_ABANDON_BUTTON_TEXT = "AVBRYT";
export const NAVBAR_LEAVE_BUTTON_TEXT = "LÄMNA";
export const NAVBAR_KEEP_PLAYING_BUTTON_TEXT = "FORTSÄTT SPELA";

export const BANNER_LABEL_CUSTOM_CHALLENGE = "ANPASSAD UTMANING";
export const BANNER_LABEL_DUEL = "DUELL";
export const BANNER_LABEL_DAILY_PREFIX = "DAGLIGT #";
export const BANNER_DIFFICULTY_HARD_TEXT = "Svårt";
export const BANNER_DIFFICULTY_NORMAL_TEXT = "Normal";
export const BANNER_DAILY_ATTEMPT_TEXT = "1 försök/dag";
export const BANNER_DUEL_WINDOW_TEXT = "24h";

export const ERROR_INVALID_CHALLENGE_TITLE = "OGILTIG UTMANINGSLÄNK";
export const ERROR_INVALID_CHALLENGE_DESCRIPTION =
  "Den här utmaningslänken är trasig eller har manipulerats. Be avsändaren att dela den igen.";
export const ERROR_INVALID_DUEL_TITLE = "OGILTIG DUELLÄNK";
export const ERROR_INVALID_DUEL_DESCRIPTION =
  "Den här duellänken är trasig eller har manipulerats. Be om en ny länk.";
export const ERROR_DUEL_EXPIRED_TITLE = "DUELLEN HAR GÅTT UT";
export const ERROR_DUEL_EXPIRED_DESCRIPTION =
  "Den här duellänken har gått ut. Duellänkar är endast giltiga i 24 timmar. Be om att en ny duell skapas.";
export const ERROR_ACTIVITY_DUEL_EXPIRED_DESCRIPTION =
  "Den här duellen har gått ut. Aktivitetsdueller är endast giltiga i 24 timmar. Be om att en ny duell skickas i Discord.";
export const ERROR_WRONG_ACCOUNT_TITLE = "FEL KONTO";
export const ERROR_WRONG_ACCOUNT_DESCRIPTION =
  "Den här duellen skickades inte till ditt Discord-konto. Se till att du är inloggad som rätt användare.";
export const ERROR_HAVE_YOU_PLAYED_TITLE = "HAR DU SPELAT FÖRUT?";
export const ERROR_LINK_ACCOUNT_DESCRIPTION =
  "Länka ditt befintliga Vagudle-konto för att behålla din statistik, eller starta ett nytt bara för Discord.";
export const ERROR_LINK_EXISTING_BUTTON_TEXT = "JAG HAR SPELAT FÖRUT";
export const ERROR_START_FRESH_BUTTON_TEXT = "BÖRJA OM";
export const ERROR_LINKING_IN_PROGRESS_DESCRIPTION =
  "Slutför inloggningen på sidan som just öppnades, kom sedan tillbaka hit — det här kommer att fångas upp automatiskt.";
export const ERROR_LINKING_FAILED_DESCRIPTION =
  "Det gick inte att starta länkningen just nu. Försök igen om en stund.";
export const ERROR_ALREADY_PLAYED_TITLE = "REDAN SPELAT IDAG";
export const ERROR_ALREADY_PLAYED_WEB_DESCRIPTION =
  "Du har redan spelat dagens dagliga ord på webbplatsen.";
export const ERROR_ALREADY_PLAYED_DEFAULT_DESCRIPTION =
  "Du har redan spelat dagens dagliga ord.";
export const ERROR_SOMETHING_WRONG_TITLE = "NÅGOT GICK FEL";
export const ERROR_SOMETHING_WRONG_HINT =
  "Om det här fortsätter att hända, kontrollera webbläsarens konsol för mer information.";
export const ACTIVITY_ERROR_MESSAGES: Record<
  "daily" | "daily_link" | "duel" | "duel_word",
  string
> = {
  daily:
    "Det gick inte att ladda dagens dagliga ord. Försök att gå med i aktiviteten igen från Discord.",
  daily_link:
    "Det gick inte att länka ditt konto. Försök att gå med i aktiviteten igen från Discord.",
  duel: "Det gick inte att ladda din duell. Försök att gå med i aktiviteten igen från Discord.",
  duel_word:
    "Det gick inte att ladda den här duellens ord. Försök att gå med i aktiviteten igen från Discord.",
};

export const CLOSE_BUTTON_LABEL = "Stäng";

export const INFO_MODAL_TITLE = "INFORMATION";
export const INFO_TAB_HOWTO_LABEL = "SÅ HÄR GÖR DU";
export const INFO_TAB_FEATURES_LABEL = "FUNKTIONER";
export const INFO_TAB_CHALLENGES_LABEL = "UTMANINGAR";
export const INFO_TAB_ABOUT_LABEL = "OM";
export const INFO_TAB_OPENSOURCE_LABEL = "KÄLLKOD";
export const INFO_TAB_FEEDBACK_LABEL = "FEEDBACK";
export const INFO_MODAL_FOOTER_TOS_LABEL = "VILLKOR";
export const INFO_MODAL_FOOTER_PRIVACY_LABEL = "INTEGRITETSPOLICY";

export const ABOUT_INTRO_TEXT_BEFORE_LINK =
  "Vagudle är ett ordgissningsspel inspirerat av";
export const ABOUT_INTRO_TEXT_AFTER_LINK =
  ", med extra verktyg som hjälper dig att lösa pusslet och utan en irriterande daglig gräns i vägen.";
export const ABOUT_DISCORD_TEXT_BEFORE_LINK = "I";
export const ABOUT_DISCORD_LINK_TEXT = "Discord-servern";
export const ABOUT_DISCORD_TEXT_AFTER_LINK =
  "finns en exklusiv duellfunktion där du kan utmana andra medlemmar mot varandra och tävla på en topplista i realtid för att se vem som kan knäcka ordet på minst antal gissningar.";
export const ABOUT_FAVICON_ALT = "Vagudle favicon";
export const ABOUT_ICON_ALT = "Vagudle-ikon";
export const ABOUT_RESET_BUTTON_TITLE =
  "Raderar allt sparat framsteg, statistik, prestationer och inställningar.";
export const ABOUT_RESET_BUTTON_TEXT = "ÅTERSTÄLL ALL DATA";
export const ABOUT_RESTORE_ATTRIBUTIONS_TITLE =
  "Har du dolt en videobakgrunds kreditering? Ta tillbaka den här.";
export const ABOUT_RESTORE_ATTRIBUTIONS_TEXT = "ÅTERSTÄLL KREDITERINGAR";
export const ABOUT_ATTRIBUTIONS_VISIBLE_TEXT = "KREDITERINGAR SYNLIGA";
export const ABOUT_STORE_BUTTON_TEXT = "BESÖK BUTIKEN";

export const CHALLENGES_IN_GAME_HEADING = "I SPELET";
export const CHALLENGES_STEP1_TEXT_PART1 = "Öppna";
export const CHALLENGES_SETTINGS_LABEL = "Inställningar";
export const CHALLENGES_STEP1_TEXT_PART2 = "och gå till";
export const CHALLENGES_CHALLENGE_TAB_LABEL = "Utmaning";
export const CHALLENGES_STEP1_TEXT_PART3 =
  "fliken. Välj en ordlista, välj hur många gissningar som ska tillåtas, skriv ditt hemliga ord och tryck på Generera länk. Dela länken så att andra kan spela ditt anpassade ord med exakt de inställningar du valde.";
export const CHALLENGES_RESULTS_NOTE_TEXT =
  "Resultat räknas aldrig med i mottagarens statistik, och deras framsteg sparas till länken så att de kan återvända till den när som helst.";
export const CHALLENGES_VIA_DISCORD_HEADING = "VIA DISCORD";
export const CHALLENGES_DISCORD_TEXT_PART1 = "I";
export const CHALLENGES_DISCORD_LINK_TEXT = "King-Tajin Discord-server";
export const CHALLENGES_DISCORD_TEXT_PART2 = ", använd snabbkommandot";
export const CHALLENGES_DISCORD_TEXT_PART3 =
  "för att generera en utmaningslänk direkt från Discord.";

export const HOWTO_INTRO_TEXT_PART1 = "Skriv ett ord och tryck på";
export const HOWTO_INTRO_TEXT_PART2 =
  "för att skicka in en gissning. Du har 11 försök att hitta det gömda ordet.";
export const HOWTO_PAINT_HEADING = "MÅLA RESULTATET";
export const HOWTO_PAINT_DESCRIPTION =
  "Rutorna färgas inte automatiskt. Välj en pensel och klicka eller dra över rutor för att markera vad du kan lista ut med de begränsade ledtrådar du har.";
export const HOWTO_GREEN_DESCRIPTION = "Rätt bokstav, rätt plats";
export const HOWTO_YELLOW_DESCRIPTION = "Rätt bokstav, fel plats";
export const HOWTO_GRAY_DESCRIPTION = "Bokstaven finns inte i ordet";
export const HOWTO_ROW_TOOLS_HEADING = "RADVERKTYG";
export const HOWTO_CLEAR_ROW_DESCRIPTION = "Rensar radens målade färger";
export const HOWTO_BADGE_COUNT_DESCRIPTION =
  "Antal rätta, förekommande och saknade bokstäver per rad";
export const HOWTO_KEYBOARD_HEADING = "TANGENTBORD";
export const HOWTO_KEYBOARD_DESCRIPTION =
  "Tangentfärgerna uppdateras när du målar — bekräftade, förekommande och uteslutna bokstäver syns alltid direkt.";

export const FEEDBACK_VALIDATION_ERROR_MESSAGE =
  "Fyll i alla obligatoriska fält.";
export const FEEDBACK_SUBMIT_ERROR_MESSAGE =
  "Det gick inte att skicka feedback. Försök igen.";
export const FEEDBACK_SUCCESS_TITLE = "FEEDBACK MOTTAGEN!";
export const FEEDBACK_SUCCESS_MESSAGE =
  "Tack för att du hjälper till att förbättra Vagudle.";
export const FEEDBACK_SEND_ANOTHER_BUTTON_TEXT = "SKICKA EN TILL";
export const FEEDBACK_TYPE_LABEL = "TYP AV FEEDBACK *";
export const FEEDBACK_POSITIVE_LABEL = "Positiv";
export const FEEDBACK_NEGATIVE_LABEL = "Negativ";
export const FEEDBACK_CATEGORY_LABEL = "KATEGORI *";
export const FEEDBACK_CATEGORY_PLACEHOLDER = "Välj en kategori...";
export const FEEDBACK_CATEGORY_BUG_REPORT = "Buggrapport";
export const FEEDBACK_CATEGORY_FEATURE_REQUEST = "Funktionsförslag";
export const FEEDBACK_CATEGORY_GENERAL = "Allmän feedback";
export const FEEDBACK_EMAIL_LABEL = "E-POST (VALFRITT)";
export const FEEDBACK_EMAIL_HINT = "Endast om du vill ha ett svar";
export const FEEDBACK_MESSAGE_LABEL = "DIN FEEDBACK *";
export const FEEDBACK_MESSAGE_FULLSCREEN_LABEL = "DIN FEEDBACK";
export const FEEDBACK_MESSAGE_PLACEHOLDER = "Berätta vad du tänker på...";
export const FEEDBACK_CHARACTERS_LEFT_TEXT = (remaining: number) =>
  `${remaining.toLocaleString()} tecken kvar`;
export const FEEDBACK_EXPAND_LABEL = "Expandera";
export const FEEDBACK_COLLAPSE_LABEL = "Fäll ihop";
export const FEEDBACK_SENDING_BUTTON_TEXT = "SKICKAR...";
export const FEEDBACK_SEND_BUTTON_TEXT = "SKICKA FEEDBACK";

export const OPEN_SOURCE_INTRO_TEXT_MIDDLE = "är öppen källkod och baserat på";
export const OPEN_SOURCE_INTRO_TEXT_END = ". Bidrag och feedback är välkomna.";
export const OPEN_SOURCE_MADE_BY_TEXT = "Skapat av";
export const OPEN_SOURCE_STATS_CARD_ALT = "Vagudles GitHub-statistik";

export const FEATURES_LIST: [string, string][] = [
  [
    "Variabel ordlängd",
    "Spela med allt mellan 4 och 7 bokstäver långa ord via Inställningar.",
  ],
  [
    "Svårt läge",
    "Lösningarna väljs bland ovanliga ord och spelaren begränsas till 9 gissningar.",
  ],
  [
    "Dagligt",
    "Ett nytt ord låses upp en gång om dagen, växlande mellan 4 och 5 bokstäver samt normalt och svårt läge. Följ din svit på topplistan och prenumerera på en kalenderpåminnelse så att du aldrig missar ett.",
  ],
  [
    "Rutmålning",
    "Välj en pensel och klicka eller dra över rutor för att färga dem.",
  ],
  ["Auto-grå", "Gråmarkerar automatiskt bokstäver från helt grå rader."],
  [
    "Auto-grön",
    "Fyller automatiskt i användarmarkerade rätta bokstäver på alla rader.",
  ],
  ["Antal grå", "Visar hur många saknade bokstäver som finns i en rad."],
];

export const PROVIDER_LABEL_DEFAULT = "din leverantör";

export const RESET_DATA_CATEGORIES: { title: string; description: string }[] = [
  {
    title: "Pågående spel",
    description: "Nuvarande pågående ord, gissningar och rutfärger.",
  },
  {
    title: "Statistik",
    description:
      "Vinstsvit, vinstfördelning och vinstandel, för både normalt och svårt läge.",
  },
  {
    title: "Prestationer",
    description: "Alla prestationer du har låst upp och framstegen mot dem.",
  },
  {
    title: "Inställningar",
    description:
      "Ordlängd, svårt läge, antal grå, auto-grå, auto-grön samt extra ljud & animationer.",
  },
  {
    title: "Bakgrund",
    description:
      "Ditt valda bakgrundstema och eventuella dolda videokrediteringsknappar.",
  },
  {
    title: "Utmanings- och duellänkar",
    description:
      "Sparat framsteg för alla anpassade utmanings- eller duellänkar du har öppnat.",
  },
];

export const RESET_DATA_DELETION_STEPS = [
  "Logga in med kontot länkat till din Vagudle-data (Google, GitHub, e-post eller Discord).",
  'Tryck på "Radera min data" (eller aktivera "Radera även mitt konto" här och bekräfta sedan).',
  "Bekräfta, så raderas din data omedelbart.",
];

export const RESET_DATA_DELETION_DELETED_ITEMS = [
  "Din inloggning (Google, GitHub, e-postlänk, Discord eller Play Games).",
  "Ditt sparade spel: statistik, prestationer, inställningar och bakgrund.",
  "Din post på den dagliga topplistan och din svit.",
  "Din historik över dagliga försök.",
  "Din individuella duellmatchhistorik, om länkad till Discord.",
];

export const RESET_DATA_DELETION_KEPT_TEXT =
  "Om du har använt Vagudles Discord-integration sparas viss data kopplad " +
  "till ditt Discord-ID permanent för att bevara andra spelares " +
  "matchhistorik och din Discord-servers grupptopplistor/svitar: " +
  "sammanlagd duell-vinst/förlust-ställning och gruppens deltagarregister " +
  "för dagliga utmaningar. Detta raderas inte av stegen ovan, och det " +
  "finns ingen utgångstid för det.";

export const RESET_DATA_REAUTH_TEXT_BEFORE_PROVIDER =
  "Av säkerhetsskäl krävs en nyligen genomförd inloggning för att radera ditt konto. Godkänn raderingen genom att logga in igen med";
export const RESET_DATA_REAUTH_TEXT_AFTER_PROVIDER =
  ", varefter ditt konto och all dess data raderas permanent.";
export const RESET_DATA_CANCEL_BUTTON_TEXT = "AVBRYT";
export const RESET_DATA_AUTHORIZE_BUTTON_TEXT = "GODKÄNN RADERING";
export const RESET_DATA_WARNING_TEXT =
  "Det här raderar permanent allt som Vagudle har sparat i den här webbläsaren. Det kan inte ångras.";
export const RESET_DATA_ALSO_DELETE_ACCOUNT_LABEL = "Radera även mitt konto";
export const RESET_DATA_DETAILS_ARIA_LABEL =
  "Vad som raderas och vad som sparas";
export const RESET_DATA_DETAILS_BUTTON_TEXT = "DETALJER";
export const RESET_DATA_ACCOUNT_DESC_BEFORE_PROVIDER = "Raderar permanent din";
export const RESET_DATA_ACCOUNT_DESC_AFTER_PROVIDER =
  "inloggning till Vagudle och raderar din molnsparfil. Det kan inte ångras.";
export const RESET_DATA_NOT_SIGNED_IN_TEXT =
  "Inte inloggad, så det finns inget konto att radera.";
export const RESET_DATA_WAIT_BUTTON_TEXT = (seconds: number) =>
  `VÄNTA ${seconds}s`;
export const RESET_DATA_DELETING_BUTTON_TEXT = "RADERAR...";
export const RESET_DATA_DELETE_ACCOUNT_AND_DATA_BUTTON_TEXT =
  "RADERA KONTO & DATA";
export const RESET_DATA_DELETE_EVERYTHING_BUTTON_TEXT = "RADERA ALLT";
export const RESET_DATA_DETAILS_MODAL_TITLE = "DETALJER OM KONTORADERING";
export const RESET_DATA_HOW_TO_DELETE_HEADING = "SÅ HÄR RADERAR DU";
export const RESET_DATA_WHAT_GETS_DELETED_HEADING = "VAD SOM RADERAS";
export const RESET_DATA_WHATS_KEPT_HEADING = "VAD SOM SPARAS";
export const RESET_DATA_CLOSE_BUTTON_TEXT = "STÄNG";

export const DAILY_SCHEDULE_UNLOCK_TEXT_BEFORE_TIME =
  "Nytt dagligt ord låses upp klockan";
export const DAILY_SCHEDULE_UNLOCK_TEXT_AFTER_TIME = "din tid";
export const DAILY_SCHEDULE_TODAY_LABEL = "IDAG";
export const DAILY_SCHEDULE_WORD_LENGTH_TEXT = (letters: number) =>
  `${letters} bokstäver`;
export const DAILY_SCHEDULE_HARD_LABEL = "SVÅRT";
export const DAILY_SCHEDULE_NORMAL_LABEL = "NORMAL";
export const DAILY_SCHEDULE_ADD_TO_CALENDAR_HEADING = "LÄGG TILL I KALENDER";
export const DAILY_SCHEDULE_SUBSCRIBE_DESCRIPTION =
  "Prenumerera en gång så kontrollerar din kalenderapp automatiskt när det dagliga ordet låses upp. Välj vilken timme du vill bli påmind:";
export const DAILY_SCHEDULE_REMINDER_HOUR_ARIA_LABEL = "Påminnelsetimme";
export const DAILY_SCHEDULE_SUBSCRIBE_ARIA_LABEL =
  "Prenumerera på kalenderflöde för daglig påminnelse";
export const DAILY_SCHEDULE_OPENING_BUTTON_TEXT = "ÖPPNAR...";
export const DAILY_SCHEDULE_SUBSCRIBE_BUTTON_TEXT = "PRENUMERERA";
export const DAILY_SCHEDULE_COPY_ARIA_LABEL = "Kopiera kalenderlänk";
export const DAILY_SCHEDULE_DOWNLOAD_PROMPT_TEXT =
  "Öppnades inte din kalenderapp?";
export const DAILY_SCHEDULE_DOWNLOAD_BUTTON_TEXT = "LADDA NER";
export const DAILY_SCHEDULE_DISMISS_BUTTON_TEXT = "AVFÄRDA";
export const DAILY_SCHEDULE_FOOTER_NOTE_TEXT =
  'Apple Kalender och Outlook kan prenumerera direkt via knappen ovan. För Google Kalender, använd kopieringsknappen och lägg till den under "Andra kalendrar → Från URL".';

export const ACHIEVEMENTS_HIDDEN_PLACEHOLDER = "???";
export const ACHIEVEMENTS_PROGRESS_LABEL = "FRAMSTEG";
export const ACHIEVEMENTS_UNLOCKS_HIDDEN_TEXT = "LÅSER UPP: ???";
export const ACHIEVEMENTS_UNLOCKS_TEXT = (label: string) =>
  `LÅSER UPP: ${label}`;
export const ACHIEVEMENTS_PREV_PAGE_LABEL = "Föregående sida";
export const ACHIEVEMENTS_NEXT_PAGE_LABEL = "Nästa sida";
export const ACHIEVEMENTS_PAGE_INDICATOR_TEXT = (
  current: number,
  total: number
) => `SIDA ${current}/${total}`;

export const ACHIEVEMENT_TEXT: Record<
  string,
  { title: string; description: string }
> = {
  first_win: { title: "Första segern", description: "Vinn ditt första spel" },
  win_15: { title: "Erfaren spelare", description: "Vinn 15 spel" },
  win_50: { title: "Veteran", description: "Vinn 50 spel" },
  on_a_roll: { title: "På vinnarspåret", description: "Vinn 5 spel i rad" },
  unstoppable: {
    title: "Ostoppbar",
    description: "Vinn 15 spel i rad",
  },
  hard_5plus: {
    title: "Hårdkokt",
    description: "Klara Svårt läge med ett ord på 5 bokstäver eller längre",
  },
  fifth_guess: {
    title: "Fartdjävul",
    description: "Lös ett ord på 5 gissningar eller färre",
  },
  seven_letters: {
    title: "Tungviktsmästare",
    description: "Vinn ett spel med ett 7-bokstavsord",
  },
  close_but_no_cigar: {
    title: "Nära ögat",
    description: "Gissa 3 olika ord i rad med endast en bokstav fel",
  },
  process_of_elimination: {
    title: "Elimineringsmetoden",
    description: "Gissa 3 olika ord i samma spel där varje bokstav är fel",
  },
  word_connoisseur: {
    title: "Ordkännare",
    description: "Gissa 200 unika ord i normalt eller svårt läge",
  },
  quack: {
    title: "Kvack!",
    description:
      "Stava DUCK vertikalt nedåt i valfri kolumn under 4 gissningar i rad",
  },
  guess_mouse: {
    title: "Pip!",
    description: "Skriv MOUSE som en gissning under ett spel",
  },
  nail_biter: {
    title: "Nagelbitare",
    description: "Vinn ett spel på din allra sista gissning",
  },
  diversify: {
    title: "Diversifiera",
    description:
      "Vinn på 3+ gissningar utan att upprepa en bokstavs position från dina tidigare gissningar (lösningen undantagen)",
  },
  blind_faith: {
    title: "Blind tro",
    description:
      "Vinn ett spel där endast en bokstavsposition någonsin är rätt innan din vinnande gissning",
  },
  completionist: {
    title: "Fullbordare",
    description: "Lås upp alla andra prestationer",
  },
};

export const NAVBAR_HOW_TO_PLAY_ARIA_LABEL = "Så här spelar du";
export const NAVBAR_DAILY_WORD_ARIA_LABEL = "Dagligt ord";
export const NAVBAR_DAILY_TITLE = "Dagligt";
export const NAVBAR_STATISTICS_ARIA_LABEL = "Statistik";
export const NAVBAR_SETTINGS_ARIA_LABEL = "Inställningar";
export const NAVBAR_NUDGE_HEADING = "FÖRSTA GÅNGEN HÄR?";
export const NAVBAR_NUDGE_DESCRIPTION =
  "Kolla in Inställningar för att anpassa ordlängd, användbara verktyg och mer.";
export const NAVBAR_NUDGE_DISMISS_BUTTON_TEXT = "AVFÄRDA";

export const DISCLAIMER_BANNER_ARIA_LABEL = "Ansvarsfriskrivning om koppling";
export const DISCLAIMER_BANNER_LABEL = "ANSVARSFRISKRIVNING";
export const DISCLAIMER_BANNER_TEXT_PART1 =
  '"King-Tajin" är bara utvecklarens personliga speluppnamn. Den här sidan och dess skapare är';
export const DISCLAIMER_BANNER_TEXT_PART2 =
  "inte anslutna till, sponsrade av eller godkända av Industrias Tajín, S.A. de C.V.";
export const DISCLAIMER_BANNER_DISMISS_ARIA_LABEL =
  "Avfärda ansvarsfriskrivning";
export const DISCLAIMER_BANNER_DISMISS_BUTTON_TEXT = "UPPFATTAT";

export const ATTRIBUTION_BUTTON_ARIA_LABEL = "Kreditering för bakgrundsvideo";

export const VIDEO_BACKGROUND_DOWNLOADING_TEXT = "LADDAR NER BAKGRUND";
export const VIDEO_BACKGROUND_SIZE_TEXT = (megabytes: string) =>
  `${megabytes} MB`;
export const VIDEO_BACKGROUND_PROGRESS_TEXT = (
  received: string,
  total: string
) => `${received} MB / ${total} MB`;

export const LEADERBOARD_LOADING_TEXT = "Laddar topplista...";
export const LEADERBOARD_ERROR_TEXT =
  "Det gick inte att ladda topplistan. Försök igen senare.";
export const LEADERBOARD_SIGN_IN_PROMPT_TEXT =
  "Logga in för att spara ditt namn och synas på topplistan.";
export const LEADERBOARD_GO_TO_SETTINGS_BUTTON_TEXT = "GÅ TILL INSTÄLLNINGAR";
export const LEADERBOARD_CHANGE_USERNAME_HEADING = "ÄNDRA ANVÄNDARNAMN";
export const LEADERBOARD_SET_USERNAME_HEADING =
  "ANGE ETT ANVÄNDARNAMN FÖR ATT GÅ MED I TOPPLISTAN";
export const LEADERBOARD_USERNAME_PLACEHOLDER = "Ditt topplistenamn";
export const LEADERBOARD_USERNAME_ARIA_LABEL = "Användarnamn för topplista";
export const LEADERBOARD_SAVING_INDICATOR = "...";
export const LEADERBOARD_SAVE_BUTTON_TEXT = "SPARA";
export const LEADERBOARD_PLAYING_AS_TEXT = "Spelar som";
export const LEADERBOARD_CHANGE_BUTTON_TEXT = "ÄNDRA";
export const LEADERBOARD_COOLDOWN_TEXT_BEFORE = "Vänta";
export const LEADERBOARD_COOLDOWN_TEXT_AFTER =
  "innan du ändrar ditt användarnamn.";
export const LEADERBOARD_EMPTY_TEXT =
  "Inga resultat än. Bli den första på listan!";
export const LEADERBOARD_PREV_BUTTON_TEXT = "FÖREG.";
export const LEADERBOARD_PAGE_INDICATOR_TEXT = (
  page: number,
  totalPages: number
) => `Sida ${page} / ${totalPages}`;
export const LEADERBOARD_NEXT_BUTTON_TEXT = "NÄSTA";
export const LEADERBOARD_JUMP_TO_MY_PAGE_BUTTON_TEXT = "HOPPA TILL MIN SIDA";
export const LEADERBOARD_ROW_WINS_LOSSES_LABEL = "V/F";
export const LEADERBOARD_ROW_STREAK_LABEL = "SVIT";
export const LEADERBOARD_ROW_BEST_LABEL = "BÄST";
export const LEADERBOARD_HIDE_ZERO_TOGGLE_LABEL =
  "Dölj konton som inte har spelat";

export const ATTRIBUTION_MODAL_BY_PREFIX = "av";
export const ATTRIBUTION_MODAL_LICENSE_PREFIX = "Licens:";
export const ATTRIBUTION_MODAL_HIDE_HEADING =
  "DÖLJ KREDITERING FÖR DEN HÄR BAKGRUNDEN";
export const ATTRIBUTION_MODAL_VIEW_SOURCE_ARIA_LABEL = (title: string) =>
  `Visa källa för ${title}`;
export const ATTRIBUTION_MODAL_HIDE_TOGGLE_ARIA_LABEL =
  "Dölj kreditering för den här bakgrunden";

export const ACHIEVEMENT_TRAY_ARIA_LABEL = "Prestationer";
export const ACHIEVEMENT_TRAY_HIDE_ARIA_LABEL = "Dölj prestationsfältet";
export const ACHIEVEMENT_TRAY_SHOW_ARIA_LABEL = "Visa prestationsfältet";

export const ACHIEVEMENT_VIEW_UNLOCKED_TITLE = "Prestation upplåst";
export const ACHIEVEMENT_VIEW_UNLOCKED_TITLE_WITH_COUNT = (
  current: number,
  total: number
) => `Prestation upplåst (${current}/${total})`;
export const ACHIEVEMENT_VIEW_BACKGROUND_UNLOCKED_TEXT = (label: string) =>
  `BAKGRUND UPPLÅST: ${label}`;
export const ACHIEVEMENT_VIEW_SHARE_BUTTON_TEXT = "DELA";
export const ACHIEVEMENT_VIEW_EQUIP_BUTTON_TEXT = "ANVÄND";
export const ACHIEVEMENT_VIEW_NEXT_BUTTON_TEXT = "NÄSTA";
export const ACHIEVEMENT_VIEW_CONTINUE_BUTTON_TEXT = "FORTSÄTT";

export const NORMAL_STATS_NO_GAMES_YET_TEXT = "INGA SPEL ÄNNU";
export const NORMAL_STATS_EMPTY_DAILY_TEXT =
  "Spela dagens dagliga ord för att se statistik här.";
export const NORMAL_STATS_EMPTY_HARD_TEXT =
  "Spela ett spel i Svårt läge för att se statistik här.";
export const NORMAL_STATS_EMPTY_DEFAULT_TEXT =
  "Spela ett spel för att se statistik här.";
export const NORMAL_STATS_TAB_NORMAL_LABEL = "NORMAL";
export const NORMAL_STATS_TAB_HARD_LABEL = "SVÅRT";
export const NORMAL_STATS_TAB_DAILY_LABEL = "DAGLIGT";
export const NORMAL_STATS_GAMES_WON_TEXT = (games: number) =>
  `${games} SPEL ${games === 1 ? "VUNNET" : "VUNNA"}`;
export const NORMAL_STATS_SHARE_STATS_BUTTON_TEXT = "DELA STATISTIK";
export const NORMAL_STATS_NEW_GAME_BUTTON_TEXT = "NYTT SPEL";
export const NORMAL_STATS_SHARE_GAME_BUTTON_TEXT = "DELA SPEL";
export const NORMAL_STATS_CHALLENGE_OTHERS_BUTTON_TEXT =
  "UTMANA ANDRA MED DETTA ORD";

export const BACKGROUND_TRAY_ARIA_LABEL = "Bakgrunder";
export const BACKGROUND_TRAY_HIDE_ARIA_LABEL = "Dölj bakgrundsfältet";
export const BACKGROUND_TRAY_SHOW_ARIA_LABEL = "Visa bakgrundsfältet";

export const LINK_DISCORD_INVALID_LINK_TEXT =
  "Den här länken saknas eller är ogiltig. Gå tillbaka till Discord och försök länka ditt konto igen.";
export const LINK_DISCORD_LINKED_TEXT =
  "Ditt konto är länkat. Du kan stänga den här fliken och gå tillbaka till Discord, eller återgå till Vagudle nedan.";
export const LINK_DISCORD_RETURN_BUTTON_TEXT = "ÅTERGÅ TILL VAGUDLE";
export const LINK_DISCORD_LINKING_TEXT = "Länkar ditt konto...";
export const LINK_DISCORD_TRY_AGAIN_BUTTON_TEXT = "FÖRSÖK IGEN";
export const LINK_DISCORD_SIGNED_IN_TEXT_BEFORE = "Inloggad som";
export const LINK_DISCORD_SIGNED_IN_TEXT_AFTER = ". Slutför länkningen...";
export const LINK_DISCORD_FALLBACK_ACCOUNT_TEXT = "ditt konto";
export const LINK_DISCORD_SIGN_IN_PROMPT_TEXT =
  "Logga in med ditt befintliga Vagudle-konto för att länka det till Discord.";
export const LINK_DISCORD_CONTINUE_GOOGLE_BUTTON_TEXT = "FORTSÄTT MED GOOGLE";
export const LINK_DISCORD_CONTINUE_GITHUB_BUTTON_TEXT = "FORTSÄTT MED GITHUB";
export const LINK_DISCORD_EMAIL_LABEL = "E-POST";
export const LINK_DISCORD_SEND_LINK_BUTTON_TEXT = "SKICKA INLOGGNINGSLÄNK";
export const LINK_DISCORD_EMAIL_SENT_TEXT =
  "Kolla din e-post efter en inloggningslänk och öppna den sedan i samma webbläsare.";
export const LINK_DISCORD_HEADING = "LÄNKA DITT KONTO";

export const COMPLETED_ROW_RESET_ARIA_LABEL = "Återställ radfärger";

export const GRID_BRUSH_ARIA_LABEL = (status: string) => `${status}-pensel`;
export const CELL_STATUS_EMPTY_LABEL = "Tom";
export const CELL_STATUS_WORDS: Record<
  "correct" | "present" | "absent",
  string
> = {
  correct: "rätt",
  present: "förekommer",
  absent: "saknas",
};
export const CELL_STATUS_DESCRIPTION_TEXT = (
  letter: string,
  statusWord: string
) => `${letter}, ${statusWord}`;
export const GRID_RESET_ALL_ARIA_LABEL = "Återställ alla färger";
export const GRID_RESET_CONFIRM_TITLE = "ÅTERSTÄLL ALLA FÄRGER?";
export const GRID_RESET_CONFIRM_TEXT_WITH_AUTOGRAY =
  "Det här rensar alla målade rutor. Auto-gråmarkerade rutor behålls.";
export const GRID_RESET_CONFIRM_TEXT = "Det här rensar alla målade rutor.";
export const GRID_RESET_BUTTON_TEXT = "ÅTERSTÄLL";
export const GRID_GUESS_HISTORY_ARIA_LABEL =
  "Gissningshistorik. Klicka och dra över en bricka för att omfärga den.";

export const DAILY_MODAL_PLAY_INTRO_TEXT =
  "Alla får samma ord idag. Du får ett försök, så gör det räknas.";
export const DAILY_MODAL_WORD_LENGTH_LABEL = "ORDLÄNGD";
export const DAILY_MODAL_DIFFICULTY_LABEL = "SVÅRIGHETSGRAD";
export const DAILY_MODAL_CURRENT_STREAK_LABEL = "NUVARANDE SVIT";
export const DAILY_MODAL_STREAK_DAYS_TEXT = (days: number) =>
  `${days} ${days === 1 ? "dag" : "dagar"}`;
export const DAILY_MODAL_ALREADY_PLAYING_TEXT =
  "Du spelar redan dagens ord. Lämna för att gå tillbaka till ett normalt spel, eller stäng det här för att fortsätta gissa.";
export const DAILY_MODAL_LOCKOUT_WARNING_TEXT =
  "⚠ När du är klar blir du utelåst till nästa återställning. ⚠";
export const DAILY_MODAL_LEAVE_BUTTON_TEXT = "LÄMNA DAGLIGT";
export const DAILY_MODAL_PLAY_BUTTON_TEXT = "SPELA DAGENS ORD";
export const DAILY_MODAL_SOLVED_TEXT = (
  guessCount: number,
  maxGuesses: number
) => `LÖST PÅ ${guessCount}/${maxGuesses}`;
export const DAILY_MODAL_NOT_SOLVED_TEXT = "INTE LÖST IDAG";
export const DAILY_MODAL_VIEW_GAME_BUTTON_TEXT = "VISA SPEL";
export const DAILY_MODAL_COME_BACK_TEXT =
  "Kom tillbaka efter återställningen för ett nytt ord.";
export const DAILY_MODAL_STREAK_LABEL = "SVIT";
export const DAILY_MODAL_BEST_LABEL = "BÄST";
export const DAILY_MODAL_PLAYED_LABEL = "SPELAT";
export const DAILY_MODAL_NEXT_DAILY_TEXT = (countdown: string) =>
  `Nästa dagliga om ${countdown}`;
export const DAILY_MODAL_SHARE_BUTTON_TEXT = "DELA RESULTAT";
export const RETURN_TO_NORMAL_GAME_BUTTON_TEXT = "ÅTERGÅ TILL NORMALT SPEL";
export const DAILY_MODAL_HEADING_COMPLETE = "DAGLIGT KLART";
export const DAILY_MODAL_HEADING_DEFAULT = "DAGLIGT";
export const DAILY_MODAL_SCHEDULE_ARIA_LABEL = "Dagligt schema";
export const DAILY_MODAL_LOADING_TEXT = "Laddar dagens ord...";
export const DAILY_MODAL_ERROR_TEXT =
  "Dagens ord är inte tillgängligt än. Kom tillbaka snart.";
export const DAILY_MODAL_VIEW_LEADERBOARD_BUTTON_TEXT = "VISA TOPPLISTA";

export const WEEKDAY_NAMES = [
  "Söndag",
  "Måndag",
  "Tisdag",
  "Onsdag",
  "Torsdag",
  "Fredag",
  "Lördag",
];
export const DAILY_CALENDAR_ON_TIME_SUFFIX = "(i tid)";

export const LINK_PLAYGAMES_INVALID_LINK_TEXT =
  "Den här länken saknas eller är ogiltig. Gå tillbaka till appen och försök länka ditt konto igen.";
export const LINK_PLAYGAMES_LINKED_TEXT =
  "Ditt konto är länkat. Du kan stänga den här fliken och gå tillbaka till appen.";
export const LINK_PLAYGAMES_SIGN_IN_PROMPT_TEXT =
  "Logga in med ditt befintliga Vagudle-konto för att länka det till Play Games.";
export const LINK_PLAYGAMES_CONTINUE_DISCORD_BUTTON_TEXT =
  "FORTSÄTT MED DISCORD";

export const CHALLENGE_FORM_AUTO_GENERATE_ERROR_TEXT =
  "Det gick inte att generera länken automatiskt. Ändra inställningarna nedan eller försök igen.";
export const CHALLENGE_FORM_NOTE_LABEL = "OBS:";
export const CHALLENGE_FORM_NOTE_TEXT =
  "Den valda ordlistan har liten inverkan på spelet. Den låter bara spelaren veta hur vanligt ordet är.";
export const CHALLENGE_FORM_DICTIONARY_LABEL = "ORDLISTA";
export const CHALLENGE_FORM_WORD_LABEL = "DITT ORD";
export const CHALLENGE_FORM_WORD_PLACEHOLDER =
  "Skriv ett ord (4–7 bokstäver)...";
export const CHALLENGE_FORM_INVALID_LENGTH_TEXT =
  "Ordet måste vara 4–7 bokstäver.";
export const CHALLENGE_FORM_INVALID_WORD_TEXT = (
  word: string,
  dictLabel: string
) => `"${word}" finns inte i ordlistan ${dictLabel}.`;
export const CHALLENGE_FORM_AVAILABLE_IN_OTHER_DICT_TEXT = (
  dictLabel: string
) =>
  `Det finns dock i ordlistan ${dictLabel}. Byt ordlista för att använda det.`;
export const CHALLENGE_FORM_VALID_WORD_TEXT = (word: string, length: number) =>
  `"${word}" är giltigt — ${length} bokstäver.`;
export const CHALLENGE_FORM_EASIER_DICT_HINT_TEXT = (dictLabel: string) =>
  `Obs: det här ordet finns även i ordlistan ${dictLabel}, att byta ordlista ger spelaren mer exakt information om ordets popularitet.`;
export const CHALLENGE_FORM_MUST_BE_IN_DICT_TEXT = (dictLabel: string) =>
  `Måste finnas i ordlistan ${dictLabel}.`;
export const CHALLENGE_FORM_GUESSES_ALLOWED_LABEL = "TILLÅTNA GISSNINGAR";
export const CHALLENGE_FORM_RESULTS_WARNING_TEXT =
  "⚠ Utmaningsresultat räknas inte i mottagarens statistik. ⚠";
export const CHALLENGE_FORM_GENERATE_ERROR_TEXT =
  "Det gick inte att generera länken. Kontrollera din anslutning och försök igen.";
export const CHALLENGE_FORM_GENERATING_BUTTON_TEXT = "GENERERAR...";
export const CHALLENGE_FORM_GENERATE_BUTTON_TEXT = "GENERERA LÄNK";

export const CHALLENGE_CREATOR_BACK_TO_STATS_BUTTON_TEXT =
  "TILLBAKA TILL STATISTIK";
export const CHALLENGE_CREATOR_READY_LABEL = "UTMANING KLAR";
export const CHALLENGE_CREATOR_LETTERS_TEXT = (letters: number) =>
  `${letters} bokstäver`;
export const CHALLENGE_CREATOR_GUESSES_TEXT = (guesses: number) =>
  `${guesses} gissningar`;
export const CHALLENGE_CREATOR_COPIED_BUTTON_TEXT = "KOPIERAT!";
export const CHALLENGE_CREATOR_COPY_BUTTON_TEXT = "KOPIERA";
export const CHALLENGE_CREATOR_SHARED_BUTTON_TEXT = "DELAT!";
export const CHALLENGE_CREATOR_SHARE_BUTTON_TEXT = "DELA";
export const CHALLENGE_CREATOR_EDIT_BUTTON_TEXT = "REDIGERA";
export const CHALLENGE_CREATOR_GENERATING_LINK_TEXT = "GENERERAR LÄNK...";

export const CLOUD_SAVE_PROVIDER_LABEL_EMAIL = "E-post";
export const CLOUD_SAVE_PROVIDER_LABEL_PLAYGAMES = "Play Games";
export const CLOUD_SAVE_PROVIDER_LABEL_UNKNOWN = "Okänd";
export const CLOUD_SAVE_AUTO_SIGNED_IN_TEXT =
  "Automatiskt inloggad via Discord.";
export const CLOUD_SAVE_WAITING_LINK_TEXT =
  "Väntar på att du ska slutföra länkningen i din webbläsare...";
export const CLOUD_SAVE_OPENING_LINK_BUTTON_TEXT = "ÖPPNAR LÄNK...";
export const CLOUD_SAVE_LINK_EXISTING_ACCOUNT_BUTTON_TEXT =
  "LÄNKA BEFINTLIGT KONTO";
export const CLOUD_SAVE_LINK_START_ERROR_TEXT =
  "Det gick inte att starta länkningen. Försök igen.";
export const CLOUD_SAVE_PLAYGAMES_PROMPT_TEXT =
  "Har du redan ett Vagudle-konto? Länka det så att ditt framsteg följer med.";
export const CLOUD_SAVE_OPENING_BUTTON_TEXT = "ÖPPNAR...";
export const CLOUD_SAVE_LINK_ACCOUNT_BUTTON_TEXT = "LÄNKA KONTO";
export const CLOUD_SAVE_SKIP_BUTTON_TEXT = "HOPPA ÖVER";
export const CLOUD_SAVE_PLAYGAMES_LINK_ERROR_TEXT =
  "Det gick inte att länka Play Games. Försök igen.";
export const CLOUD_SAVE_LINKING_BUTTON_TEXT = "LÄNKAR...";
export const CLOUD_SAVE_LINK_PLAYGAMES_BUTTON_TEXT = "LÄNKA PLAY GAMES";
export const CLOUD_SAVE_ALSO_LINKED_TEXT = (list: string) =>
  `Även länkat: ${list}`;
export const CLOUD_SAVE_HEADING = "MOLNSPARNING";
export const CLOUD_SAVE_IN_PROGRESS_WARNING_TEXT =
  "Molnsparning sparar inte spel som pågår just nu.";
export const CLOUD_SAVE_PRIVACY_TEXT =
  "Din data säljs aldrig. E-postadresser sparas endast om du skulle behöva support.";
export const CLOUD_SAVE_CHECKING_STATUS_TEXT =
  "Kontrollerar inloggningsstatus...";
export const CLOUD_SAVE_SIGNED_IN_AS_TEXT = "Inloggad som";
export const CLOUD_SAVE_ACCOUNT_TYPE_SUFFIX_TEXT = (type: string) =>
  `— ${type}-konto`;
export const CLOUD_SAVE_UP_TO_DATE_TEXT = "Uppdaterad";
export const CLOUD_SAVE_SYNCING_TEXT = "Synkroniserar...";
export const CLOUD_SAVE_LAST_SAVED_TEXT = (time: string) =>
  `Senast sparad ${time}`;
export const CLOUD_SAVE_LINK_DISCORD_BUTTON_TEXT = "LÄNKA DISCORD";
export const CLOUD_SAVE_SIGN_OUT_BUTTON_TEXT = "LOGGA UT";
export const CLOUD_SAVE_SIGN_IN_PROMPT_TEXT =
  "Logga in för att hålla din statistik, prestationer och inställningar synkade mellan enheter.";
export const CLOUD_SAVE_DIRECT_SIGNIN_HEADING = "DIREKT INLOGGNING";
export const CLOUD_SAVE_EMAIL_ARIA_LABEL = "E-postadress";
export const CLOUD_SAVE_SEND_LINK_BUTTON_TEXT = "SKICKA LÄNK";
export const CLOUD_SAVE_EMAIL_SENT_TEXT =
  "Kolla din e-post efter en inloggningslänk.";
export const CLOUD_SAVE_FLEXIBLE_SIGNIN_HEADING = "FLEXIBEL INLOGGNING";
export const CLOUD_SAVE_FLEXIBLE_SIGNIN_DESCRIPTION =
  "Fungerar på egen hand, eller länka det till ett annat konto när som helst härifrån.";
export const CLOUD_SAVE_CONTINUE_PLAYGAMES_BUTTON_TEXT =
  "FORTSÄTT MED PLAY GAMES";

export const CLOUD_SAVE_CONFLICT_DATE_FALLBACK_TEXT = "Okänt";
export const CLOUD_SAVE_CONFLICT_UPDATED_TEXT = (date: string) =>
  `Uppdaterad ${date}`;
export const CLOUD_SAVE_CONFLICT_ACHIEVEMENTS_UNLOCKED_TEXT = (count: number) =>
  `${count} prestationer upplåsta`;
export const CLOUD_SAVE_CONFLICT_NORMAL_WON_TEXT = (
  won: number,
  total: number
) => `Normal: ${won}/${total} vunna`;
export const CLOUD_SAVE_CONFLICT_HARD_WON_TEXT = (won: number, total: number) =>
  `Svårt: ${won}/${total} vunna`;
export const CLOUD_SAVE_CONFLICT_DAILY_WON_TEXT = (
  won: number,
  total: number,
  streak: number
) => `Dagligt: ${won}/${total} vunna, svit ${streak}`;
export const CLOUD_SAVE_CONFLICT_INTRO_TEXT =
  "Du har en sparfil på den här enheten och en i molnet. Välj vilken du vill behålla, men prestationer slås ihop ändå, så du förlorar inget framsteg där.";
export const CLOUD_SAVE_CONFLICT_THIS_DEVICE_LABEL = "DEN HÄR ENHETEN";
export const CLOUD_SAVE_CONFLICT_CLOUD_SAVE_LABEL = "MOLNSPARNING";
export const CLOUD_SAVE_CONFLICT_SYNC_ERROR_TEXT =
  "Det gick inte att synka din sparfil. Försök igen.";
export const CLOUD_SAVE_CONFLICT_KEEP_DEVICE_BUTTON_TEXT =
  "BEHÅLL DEN HÄR ENHETEN";
export const CLOUD_SAVE_CONFLICT_KEEP_CLOUD_BUTTON_TEXT = "BEHÅLL MOLNSPARNING";

export const GENERAL_SETTINGS_DAILY_MODE_ACTIVE_TEXT = "DAGLIGT LÄGE AKTIVT";
export const GENERAL_SETTINGS_CUSTOM_CHALLENGE_ACTIVE_TEXT =
  "ANPASSAD UTMANING AKTIV";
export const CHALLENGE_DICTIONARY_SUFFIX_TEXT = "ordlista —";
export const CHALLENGE_GUESSES_ALLOWED_TEXT = (guesses: number) =>
  `${guesses} gissningar tillåtna`;
export const GENERAL_SETTINGS_DAILY_LOCKED_TEXT =
  "Ordlängd och svårighetsgrad bestäms av dagens ord och återställs vid nästa dagliga.";
export const GENERAL_SETTINGS_CHALLENGE_LOCKED_TEXT =
  "Ordlängd och svårighetsgrad bestäms av den här utmaningen. Återgå till normal Vagudle för att ändra dessa.";
export const GENERAL_SETTINGS_WORD_LENGTH_HINT_TEXT =
  "Kan ändras före din första gissning:";
export const GENERAL_SETTINGS_WORD_LENGTH_ARIA_LABEL = "Ordlängd";
export const SETTINGS_WORD_LENGTH_CHANGE_BLOCKED_ERROR_TEXT =
  "Avsluta eller starta ett nytt spel innan du ändrar ordlängden!";
export const SETTINGS_DIFFICULTY_CHANGE_BLOCKED_ERROR_TEXT =
  "Avsluta eller starta ett nytt spel innan du ändrar svårighetsgrad!";
export const SETTINGS_MODAL_TAB_SETTINGS_LABEL = "INSTÄLLNINGAR";
export const SETTINGS_MODAL_TAB_CHALLENGE_LABEL = "UTMANING";

export const CHALLENGE_RESULT_MODAL_TITLE = "Utmaningsresultat";
export const CHALLENGE_RESULT_HEADING = "ANPASSAD UTMANING";
export const CHALLENGE_RESULT_COMPLETE_TEXT = "UTMANING KLAR!";
export const RESULT_SOLVED_TEXT_BEFORE = "Löst på";
export const RESULT_SOLVED_TEXT_AFTER = "gissningar";
export const CHALLENGE_RESULT_FAILED_TEXT = "UTMANING MISSLYCKADES";
export const CHALLENGE_RESULT_FAILED_DESCRIPTION =
  "Bättre lycka nästa gång! Du kan alltid fråga avsändaren om svaret.";
export const RESULT_LEAVE_BUTTON_TEXT = "LÄMNA";
export const CHALLENGE_RESULT_SHARE_BUTTON_TEXT = "DELA";

export const CHALLENGE_ACCEPT_MODAL_HEADING = "ANPASSAD UTMANING";
export const CHALLENGE_ACCEPT_MODAL_INTRO_TEXT =
  "Någon har skickat dig en anpassad Vagudle-utmaning. Här är vad du ska möta:";
export const CHALLENGE_ACCEPT_MODAL_WORD_LENGTH_LABEL = "ORDLÄNGD";
export const CHALLENGE_ACCEPT_MODAL_DICTIONARY_LABEL = "ORDLISTA";
export const CHALLENGE_ACCEPT_MODAL_GUESSES_LABEL = "GISSNINGAR";
export const CHALLENGE_ACCEPT_MODAL_LETTERS_TEXT = (letters: number) =>
  `${letters} bokstäver`;
export const CHALLENGE_ACCEPT_MODAL_ATTEMPTS_TEXT = (attempts: number) =>
  `${attempts} försök`;
export const CHALLENGE_ACCEPT_MODAL_PROGRESS_SAVED_TEXT =
  "Ditt framsteg sparas till den här länken. Återbesök när som helst för att fortsätta.";
export const CHALLENGE_ACCEPT_MODAL_RESULTS_NOT_COUNTED_TEXT =
  "⚠ Resultat räknas inte i din statistik. ⚠";
export const CHALLENGE_ACCEPT_MODAL_PLAY_BUTTON_TEXT = "SPELA UTMANING";

export const DUEL_RESULT_MODAL_TITLE = "Duellresultat";
export const DUEL_RESULT_HEADING = "DUELL";
export const DUEL_RESULT_COMPLETE_TEXT = "DUELL KLAR!";
export const DUEL_RESULT_FAILED_TEXT = "DUELL MISSLYCKADES";
export const DUEL_RESULT_FAILED_DESCRIPTION = "Bättre lycka nästa gång!";

export const DUEL_MODAL_ACCEPT_HEADING = "DUELL";
export const DUEL_MODAL_COMPLETE_HEADING = "DUELL KLAR";
export const DUEL_MODAL_CHALLENGED_INTRO_TEXT =
  "Du har blivit utmanad till en duell. Här är vad du ska möta:";
export const DUEL_MODAL_WORD_LENGTH_LABEL = "ORDLÄNGD";
export const DUEL_MODAL_LETTERS_TEXT = (letters: number) =>
  `${letters} bokstäver`;
export const DUEL_MODAL_DICTIONARY_LABEL = "ORDLISTA";
export const DUEL_MODAL_GUESSES_LABEL = "GISSNINGAR";
export const DUEL_MODAL_ATTEMPTS_TEXT = (attempts: number) =>
  `${attempts} försök`;
export const DUEL_MODAL_PROGRESS_SAVED_TEXT =
  "Ditt framsteg sparas i 24 timmar. Återbesök den här länken när som helst för att fortsätta.";
export const DUEL_MODAL_RESULTS_NOT_COUNTED_TEXT =
  "⚠ Resultat räknas inte i din statistik. ⚠";
export const DUEL_MODAL_PLAY_BUTTON_TEXT = "SPELA DUELL";
export const DUEL_MODAL_RESULT_NOT_RECORDED_TEXT = "RESULTAT EJ REGISTRERAT";
export const DUEL_MODAL_RESULT_RECORDED_TEXT = "DITT RESULTAT HAR REGISTRERATS";
export const DUEL_MODAL_SAVING_RESULT_TEXT = "SPARAR RESULTAT...";
export const DUEL_MODAL_RESULT_NOT_RECORDED_DESCRIPTION =
  "Det uppstod ett problem när ditt resultat skulle sparas. Meddela värden.";
export const DUEL_MODAL_RESULT_RECORDED_DESCRIPTION =
  "Vinnaren tillkännages när båda spelarna är klara.";
export const DUEL_MODAL_SAVING_RESULT_DESCRIPTION =
  "Vänta medan ditt resultat registreras.";
export const DUEL_MODAL_SAVING_RESULTS_TEXT = "Sparar resultat...";
export const DUEL_MODAL_RESULTS_SAVED_TEXT = "Resultat sparades framgångsrikt.";
export const DUEL_MODAL_SAVE_FAILED_TEXT =
  "Det gick inte att spara resultatet efter 3 försök. Ditt resultat registrerades inte.";
export const DUEL_MODAL_PREPARING_SAVE_TEXT =
  "Förbereder att spara resultat...";

export const CHALLENGE_DICT_LABELS: Record<"normal" | "hard" | "full", string> =
  {
    normal: "Normal",
    hard: "Svår",
    full: "Extrem",
  };
export const CHALLENGE_DICT_DESCRIPTIONS: Record<
  "normal" | "hard" | "full",
  string
> = {
  normal: "Vanliga engelska ord",
  hard: "Ovanliga engelska ord",
  full: "Fullständig Scrabble-ordlista",
};

export const USERNAME_VALIDATION_ERROR_TEXT =
  "3–20 tecken: bokstäver, siffror, mellanslag, - eller _";
export const USERNAME_TAKEN_ERROR_TEXT = "Det användarnamnet är redan taget.";
export const USERNAME_RATE_LIMITED_ERROR_TEXT = (cooldown: string) =>
  `Du kan ändra ditt namn igen om ${cooldown}.`;
export const GENERIC_ERROR_TEXT = "Något gick fel. Försök igen.";

export const CLOUD_AUTH_EMAIL_PROMPT_TEXT =
  "Bekräfta din e-post för att slutföra inloggningen:";
export const CLOUD_AUTH_GOOGLE_SIGNIN_ERROR_TEXT =
  "Google-inloggningen misslyckades. Försök igen.";
export const CLOUD_AUTH_GITHUB_SIGNIN_ERROR_TEXT =
  "GitHub-inloggningen misslyckades. Försök igen.";
export const CLOUD_AUTH_PLAYGAMES_SIGNIN_ERROR_TEXT =
  "Play Games-inloggningen misslyckades. Försök igen.";
export const CLOUD_AUTH_EMAIL_LINK_ERROR_TEXT =
  "Det gick inte att skicka inloggningslänken. Försök igen.";
export const CLOUD_AUTH_SIGNOUT_ERROR_TEXT =
  "Utloggningen misslyckades. Försök igen.";
export const CLOUD_AUTH_DELETE_ACCOUNT_ERROR_TEXT =
  "Det gick inte att radera ditt konto. Försök igen.";
export const CLOUD_AUTH_NO_ACCOUNT_ERROR_TEXT =
  "Inget inloggat konto hittades.";
export const CLOUD_AUTH_REAUTH_UNSUPPORTED_ERROR_TEXT =
  "Den här inloggningsmetoden kan inte återauktoriseras här. Logga ut, logga in igen och försök sedan radera ditt konto igen.";
export const CLOUD_AUTH_REAUTH_FAILED_ERROR_TEXT =
  "Återauktoriseringen misslyckades. Försök igen.";

export const CLOUD_SYNC_VERIFY_ERROR_TEXT =
  "Det gick inte att verifiera inloggningen för molnsynkronisering.";
export const CLOUD_SYNC_CREATE_ERROR_TEXT =
  "Det gick inte att skapa din molnsparfil.";
export const CLOUD_SYNC_UNREACHABLE_ERROR_TEXT =
  "Det gick inte att nå molnsparningen.";
export const CLOUD_SYNC_PUSH_ERROR_TEXT =
  "Det gick inte att synka till molnet.";

export const PAGE_TITLE_DUEL = "Vagudle - Duell";
export const PAGE_TITLE_CHALLENGE = "Vagudle - Utmaning";
export const PAGE_TITLE_DAILY = "Vagudle - Dagligt";

export const SHARE_HARD_MODE_TAG = " [SVÅRT]";
export const SHARE_NORMAL_MODE_TAG = " [NORMAL]";
export const SHARE_CHALLENGE_HEADER_TEXT = (
  score: number | string,
  maxChallenges: number,
  wordPart: string
) => `${GAME_TITLE} [UTMANING] — ${score}/${maxChallenges} (${wordPart})`;
export const SHARE_STATUS_HEADER_TEXT = (
  modeTag: string,
  solution: string,
  score: number | string,
  maxChallenges: number,
  wordLength: number
) =>
  `${GAME_TITLE}${modeTag} — ${solution} — ${score}/${maxChallenges} (${wordLength} bokstäver)`;
export const SHARE_STATUS_CHALLENGE_TITLE = () => `${GAME_TITLE} Utmaning`;
export const SHARE_STATUS_NORMAL_TITLE = (solution: string) =>
  `${GAME_TITLE} — ${solution}`;
export const SHARE_DAILY_HEADER_TEXT = (
  dailyNumber: number,
  score: number | string,
  maxChallenges: number
) => `${GAME_TITLE} Dagligt #${dailyNumber} — ${score}/${maxChallenges}`;
export const SHARE_DAILY_TITLE = (dailyNumber: number) =>
  `${GAME_TITLE} Dagligt #${dailyNumber}`;
export const SHARE_STATS_TITLE = (modeTag: string) =>
  `${GAME_TITLE}${modeTag} Statistik`;
export const SHARE_STATS_PLAYED_LABEL = "🎮 Spelade:  ";
export const SHARE_STATS_WIN_RATE_LABEL = "✅ Vinst%:   ";
export const SHARE_STATS_STREAK_LABEL = "🔥 Svit:     ";
export const SHARE_STATS_BEST_LABEL = "🏆 Bästa:    ";
export const SHARE_STATS_GUESS_DISTRIBUTION_LABEL = "Gissningsfördelning:";
export const SHARE_DAILY_STATS_TITLE = () =>
  `${GAME_TITLE} [DAGLIGT] Statistik`;
export const SHARE_CHALLENGE_INVITE_INTRO_TEXT =
  "Jag utmanar dig till en anpassad Vagudle!";
export const SHARE_CHALLENGE_INVITE_DETAILS_TEXT = (
  length: number,
  dictLabel: string,
  guesses: number
) => `${length} bokstäver · ${dictLabel} ordlista · ${guesses} gissningar`;
export const SHARE_CHALLENGE_INVITE_NOTE_TEXT =
  "(Resultat påverkar inte din statistik)";
export const SHARE_CHALLENGE_INVITE_TITLE = "Vagudle-utmaning";
export const SHARE_ACHIEVEMENT_UNLOCKED_TEXT = (title: string) =>
  `🏆 Prestation upplåst: ${title}`;
export const SHARE_ACHIEVEMENT_BACKGROUND_UNLOCKED_TEXT = (label: string) =>
  `Upplåst bakgrund: ${label}`;
export const SHARE_ACHIEVEMENT_TITLE = "Vagudle-prestation";

export const ACHIEVEMENT_TOAST_BACKGROUND_UNLOCKED_SUFFIX_TEXT = (
  label: string
) => ` — bakgrunden ${label} har låsts upp!`;

export const NOTIFICATION_CHANNEL_NAME = "Spelpåminnelser";
export const NOTIFICATION_CHANNEL_DESCRIPTION =
  "Påminnelser för att hålla din svit vid liv och komma tillbaka och spela";
export const NOTIFICATION_STREAK_WARNING_TITLE =
  "Din svit håller på att återställas!";
export const NOTIFICATION_STREAK_WARNING_BODY =
  "Spela dagens Vagudle innan det är för sent.";
export const NOTIFICATION_CUSTOM_REMINDER_TITLE = "Förlora inte din svit!";
export const NOTIFICATION_CUSTOM_REMINDER_BODY =
  "Dagens Vagudle väntar på dig.";
export const NOTIFICATION_INACTIVITY_TITLE = "Inte spelat på ett tag?";
export const NOTIFICATION_INACTIVITY_BODY =
  "Kom tillbaka och fortsätt där du slutade.";
export const NOTIFICATION_ACTION_PLAY_NOW = "Spela nu";
export const NOTIFICATION_ACTION_PLAY_DAILY = "Spela dagens";

export const CRASH_BOUNDARY_MESSAGE_TEXT = "Något gick fel.";
export const CRASH_BOUNDARY_RELOAD_BUTTON_TEXT = "Ladda om";

export const CLOUD_SYNC_LINK_ACCOUNT_ERROR_TEXT =
  "Det gick inte att länka ditt konto.";
export const CLOUD_SYNC_LINK_ACCOUNT_RETRY_ERROR_TEXT =
  "Det gick inte att länka ditt konto. Försök igen.";
export const CLOUD_SYNC_VERIFY_SIGNIN_ERROR_TEXT =
  "Det gick inte att verifiera din inloggning. Försök igen.";
export const CLOUD_SYNC_LINK_DISCORD_ERROR_TEXT =
  "Det gick inte att länka ditt Discord-konto.";
export const CLOUD_SYNC_LINK_DISCORD_RETRY_ERROR_TEXT =
  "Det gick inte att länka ditt Discord-konto. Försök igen.";
export const CLOUD_SYNC_LINK_PLAYGAMES_ERROR_TEXT =
  "Det gick inte att länka ditt Play Games-konto.";
export const CLOUD_SYNC_LINK_PLAYGAMES_RETRY_ERROR_TEXT =
  "Det gick inte att länka ditt Play Games-konto. Försök igen.";
export const RELATIVE_TIME_JUST_NOW_TEXT = "just nu";
export const RELATIVE_TIME_UNIT_LABELS: Record<string, string> = {
  second: "sekund",
  minute: "minut",
  hour: "timme",
  day: "dag",
  month: "månad",
  year: "år",
};

export const DAILY_MODE_SIGNIN_WARNING_TEXT =
  "Logga in för att spara till topplistan";
export const DAILY_MODE_USERNAME_WARNING_TEXT =
  "Ange ett användarnamn för att spara till topplistan";

export const WORD_LISTS_LOAD_ERROR_TEXT =
  "Det gick inte att ladda ordlistorna. Uppdatera sidan.";

export const LINK_START_ERROR_SHORT_TEXT =
  "Det gick inte att starta länkningen.";
export const PLAYGAMES_NOT_AVAILABLE_ERROR_TEXT =
  "Play Games är inte tillgängligt på den här enheten.";
export const LINKING_NOT_AVAILABLE_ERROR_TEXT =
  "Länkning är inte tillgängligt på den här enheten.";

export const BACKGROUND_TEXT: Record<
  string,
  {
    desktopLabel: string;
    mobileLabel: string;
    attribution?: {
      credits: {
        role: string;
        title: string;
        creator: string;
        sourceUrl?: string;
      }[];
      license: string;
    };
  }
> = {
  sprinkles: { desktopLabel: "VAGUDLE STRÖSSEL", mobileLabel: "GRÅ" },
  flakes: { desktopLabel: "FLINGREGN", mobileLabel: "RUTNÄT" },
  tnt_rain: { desktopLabel: "TNT-REGN", mobileLabel: "TNT" },
  pulsing_purple: { desktopLabel: "PULSERANDE LILA", mobileLabel: "LILA" },
  carrots: { desktopLabel: "SNURRANDE MOROTTER", mobileLabel: "MOROTTER" },
  flying_mudskipper: {
    desktopLabel: "FLYGANDE SLAMKRYPARE",
    mobileLabel: "SLAMKRYPARE",
  },
  escalating_fire: { desktopLabel: "ESKALERANDE ELD", mobileLabel: "ELD" },
  dvd_screensaver: { desktopLabel: "DVD-SKÄRMSLÄCKARE", mobileLabel: "DVD" },
  number_rain: {
    desktopLabel: "SIFFERREGN",
    mobileLabel: "SIFFROR",
    attribution: {
      credits: [
        {
          role: "Video",
          title: "Matrix Rain Codes (4K FULL HD)",
          creator: "Fatih Kalkan",
          sourceUrl: "https://www.youtube.com/watch?v=MUVo20q6tx8",
        },
      ],
      license: "Creative Commons Erkännande-licens (återanvändning tillåten)",
    },
  },
  seven_letters: { desktopLabel: "SJUBOKSTAVSORD", mobileLabel: "ORD" },
  snowfall: { desktopLabel: "SNÖFALL", mobileLabel: "SNÖ" },
  letter_pile: { desktopLabel: "BOKSTAVSHÖG", mobileLabel: "HÖG" },
  letter_rain: { desktopLabel: "BOKSTAVSREGN", mobileLabel: "BOKSTÄVER" },
  duck_parade: { desktopLabel: "ANKPARAD", mobileLabel: "ANKOR" },
  mouse_eating: {
    desktopLabel: "MUS SOM ÄTER M&M",
    mobileLabel: "MUS",
    attribution: {
      credits: [
        {
          role: "Video",
          title:
            "Mouse eating M&M's with peaceful music for 10 minutes. (He will keep you company and be your friend)",
          creator: "June Hargadon",
          sourceUrl: "https://www.youtube.com/watch?v=bBRgYIvaL00",
        },
        {
          role: "Animation",
          title: "Creature Comforts",
          creator: "Aardman Animations",
        },
        {
          role: "Musik",
          title: "New Home (Slowed)",
          creator: "Austin Farwell",
        },
      ],
      license: "Okänd",
    },
  },
  emoji_rain: { desktopLabel: "EMOJIREGN", mobileLabel: "EMOJIS" },
  fireworks: { desktopLabel: "FYRVERKERIER", mobileLabel: "FYRVERKERIER" },
  liquid_ripple: { desktopLabel: "VÄTSKEVÅGOR", mobileLabel: "VÅGOR" },
  spinning_seal: {
    desktopLabel: "SNURRANDE SÄL",
    mobileLabel: "SÄL",
    attribution: {
      credits: [
        {
          role: "Video",
          title: "there is no need to be upset",
          creator: "High Valley",
          sourceUrl: "https://www.youtube.com/watch?v=GJDNkVDGM_s&t=14s",
        },
        {
          role: "Musik",
          title: "Happy H. Christmas",
          creator: "Maniacs of Noise",
        },
      ],
      license: "Creative Commons Erkännande (CC BY)",
    },
  },
};
