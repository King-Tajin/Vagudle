// noinspection JSUnusedGlobalSymbols, SpellCheckingInspection

const polishPlural = (
  n: number,
  one: string,
  few: string,
  many: string
): string => {
  if (n === 1) return one;
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return few;
  return many;
};

export const GAME_TITLE = "VAGUDLE";

export const ACHIEVEMENT_REVEAL_UNLOCKED_TEXT = "Osiągnięcie odblokowane!";
export const WIN_CELEBRATION_TITLE_TEXT = "WYGRANA!";
export const LOADING_WORDS_TEXT = "WCZYTYWANIE SŁÓW...";
export const PLAY_NORMAL_GAME_BUTTON_TEXT = () =>
  `ZAGRAJ W NORMALNE ${GAME_TITLE}`;
export const TRY_AGAIN_BUTTON_TEXT = "SPRÓBUJ PONOWNIE";

export const WIN_MESSAGES = ["Świetna robota!", "Super!", "Brawo!"];
export const GAME_COPIED_MESSAGE = "Gra skopiowana do schowka";
export const DISCORD_ACCOUNT_LINKED_MESSAGE = "Konto Discord połączone!";
export const NOT_ENOUGH_LETTERS_MESSAGE = "Za mało liter";
export const WORD_NOT_FOUND_MESSAGE = "Nie znaleziono słowa";
export const CORRECT_WORD_MESSAGE = (solution: string) =>
  `Szukanym słowem było ${solution}`;
export const ENTER_TEXT = "Enter";
export const DELETE_TEXT = "Usuń";
export const STATISTICS_TITLE = "Statystyki";
export const GUESS_DISTRIBUTION_TEXT = "Rozkład prób";
export const TOTAL_TRIES_TEXT = "Łączna liczba prób";
export const SUCCESS_RATE_TEXT = "Wskaźnik sukcesu";
export const CURRENT_STREAK_TEXT = "Obecna seria";
export const BEST_STREAK_TEXT = "Najlepsza seria";
export const DAYS_PLAYED_TEXT = "Zagrane dni";
export const LAST_COMPLETED_TEXT = "Ostatnio ukończono";
export const DISCOURAGE_INAPP_BROWSER_TEXT =
  "Używasz wbudowanej przeglądarki, co może powodować problemy z udostępnianiem lub zapisywaniem wyników. Zalecamy skorzystanie z domyślnej przeglądarki urządzenia.";
export const CHALLENGE_WIN_MESSAGES = [
  "Wyzwanie pokonane!",
  "Wyzwanie ukończone.",
  "Mistrz wyzwania!",
];

export const MODAL_TITLE_SETTINGS = "Ustawienia";
export const MODAL_TITLE_ACHIEVEMENTS = "Osiągnięcia";
export const MODAL_TITLE_VIDEO_ATTRIBUTION = "Źródła wideo";
export const MODAL_TITLE_CLOUD_SAVE_FOUND = "Znaleziono zapis w chmurze";
export const MODAL_TITLE_DAILY_SCHEDULE = "Harmonogram dzienny";
export const MODAL_TITLE_DAILY_LEADERBOARD = "Dzienna tablica wyników";
export const MODAL_TITLE_RESET_ALL_DATA = "Zresetuj wszystkie dane";
export const MODAL_TITLE_CREATE_CHALLENGE = "Utwórz wyzwanie";
export const MODAL_TITLE_OFFLINE_MODE = "Jesteś offline";
export const MODAL_TITLE_WEBGL_UNAVAILABLE = "Grafika niedostępna";

export const OFFLINE_MODE_INTRO_TEXT =
  "Nie udało się połączyć z serwerami Vagudle. Nadal możesz grać w podstawową wersję gry offline.";
export const OFFLINE_MODE_AVAILABLE_HEADING = "NADAL DOSTĘPNE";
export const OFFLINE_MODE_AVAILABLE_ITEMS = [
  "Nieograniczone gry w trybie normalnym i trudnym",
  "Ustawienia długości słowa i rozgrywki",
  "Tła i efekty dźwiękowe",
  "Lokalne statystyki i osiągnięcia",
];
export const OFFLINE_MODE_UNAVAILABLE_HEADING = "MOŻE NIE DZIAŁAĆ";
export const OFFLINE_MODE_UNAVAILABLE_ITEMS = [
  "Tryb dzienny i dzienna tablica wyników",
  "Pojedynki i linki wyzwań",
  "Zapis w chmurze i logowanie do konta",
];
export const OFFLINE_MODE_DISMISS_BUTTON_TEXT = "GRAJ OFFLINE";

export const WEBGL_UNAVAILABLE_BODY_TEXT = (backgroundLabel: string) =>
  `${backgroundLabel} wymaga technologii WebGL, której Twoja przeglądarka lub urządzenie nie obsługuje. Spróbuj zaktualizować sterowniki grafiki, zmienić przeglądarkę lub wybrać inne tło.`;
export const WEBGL_UNAVAILABLE_DISMISS_BUTTON_TEXT = "OK";
export const WEBGL_UNAVAILABLE_DEFAULT_BACKGROUND_LABEL = "To tło";

export const SETTINGS_HARD_MODE_LABEL = "Tryb trudny";
export const SETTINGS_HARD_MODE_DESCRIPTION =
  "Tylko 9 prób na odgadnięcie rzadkiego angielskiego słowa.";
export const SETTINGS_SHOW_GRAY_COUNT_LABEL = "Pokaż liczbę szarych";
export const SETTINGS_SHOW_GRAY_COUNT_DESCRIPTION =
  "Pokazuje liczbę szarych (nieobecnych) liter przy każdej próbie.";
export const SETTINGS_AUTO_GRAY_LABEL = "Auto-szary";
export const SETTINGS_AUTO_GRAY_DESCRIPTION =
  "Całkowicie szare wiersze automatycznie zaznaczają na szaro pasujące litery wszędzie. Automatycznie zaszarzone pola są chronione i pozostają po resecie.";
export const SETTINGS_AUTO_GREEN_LABEL = "Auto-zielony";
export const SETTINGS_AUTO_GREEN_DESCRIPTION =
  "Zamalowanie pola na zielono automatycznie zaznacza tę samą literę na zielono w danej kolumnie. Zmiana zielonego pola czyści te automatyczne zaznaczenia.";
export const SETTINGS_EXTRA_EFFECTS_LABEL = "Dodatkowe dźwięki i animacje";
export const SETTINGS_EXTRA_EFFECTS_DESCRIPTION =
  "Włącza fajerwerki po wygranej, puzon po przegranej, animację skrzyni osiągnięć i dźwięk tła wideo.";
export const SETTINGS_BACKGROUND_LABEL = "TŁO";
export const SETTINGS_BACKGROUND_DESCRIPTION_FREE =
  "Wybierz styl tła. Wszystkie tła są dostępne w tym trybie.";
export const SETTINGS_BACKGROUND_DESCRIPTION_LOCKED =
  "Wybierz styl tła. Nowe odblokowują się dzięki osiągnięciom.";

export const SETTINGS_LANGUAGE_LABEL = "Język";
export const SETTINGS_LANGUAGE_DESCRIPTION =
  "Wybierz język menu i tekstów. Listy słów pozostają w języku angielskim.";
export const SETTINGS_LANGUAGE_ARIA_LABEL = "Wybierz język";
export const SETTINGS_LANGUAGE_SAVING_TEXT = "Zapisywanie...";

export const SETTINGS_NOTIFICATIONS_DAILY_STREAK_LABEL =
  "Ostrzeżenie o zerwaniu serii";
export const SETTINGS_NOTIFICATIONS_DAILY_STREAK_DESCRIPTION =
  "Otrzymuj ostrzeżenie przed zresetowaniem Twojej serii, jeśli dzisiejsze dzienne słowo nie zostało jeszcze rozegrane.";
export const SETTINGS_NOTIFICATIONS_STREAK_HOURS_SUFFIX =
  "godzin przed resetem";
export const SETTINGS_NOTIFICATIONS_CUSTOM_TIME_LABEL =
  "Własna godzina przypomnienia";
export const SETTINGS_NOTIFICATIONS_CUSTOM_TIME_DESCRIPTION =
  "Wybierz konkretną godzinę każdego dnia, aby otrzymać przypomnienie o grze.";
export const SETTINGS_NOTIFICATIONS_INACTIVITY_LABEL =
  "Przypomnienie o nieaktywności";
export const SETTINGS_NOTIFICATIONS_INACTIVITY_DESCRIPTION =
  "Otrzymaj przypomnienie po dłuższej przerwie w grze.";
export const SETTINGS_NOTIFICATIONS_INACTIVITY_DAYS_SUFFIX =
  "dni nieaktywności";
export const SETTINGS_NOTIFICATIONS_REMINDER_HOUR_ARIA_LABEL =
  "Godzina przypomnienia";
export const SETTINGS_NOTIFICATIONS_REMINDER_MINUTE_ARIA_LABEL =
  "Minuta przypomnienia";
export const SETTINGS_NOTIFICATIONS_REMINDER_PERIOD_ARIA_LABEL =
  "AM lub PM przypomnienia";
export const SETTINGS_NOTIFICATIONS_DECREASE_DAYS_LABEL = "Zmniejsz liczbę dni";
export const SETTINGS_NOTIFICATIONS_INCREASE_DAYS_LABEL = "Zwiększ liczbę dni";
export const SETTINGS_NOTIFICATIONS_DECREASE_HOURS_LABEL =
  "Zmniejsz liczbę godzin";
export const SETTINGS_NOTIFICATIONS_INCREASE_HOURS_LABEL =
  "Zwiększ liczbę godzin";

export const SETTINGS_HAPTICS_LABEL = "Wibracje";
export const SETTINGS_HAPTICS_DESCRIPTION =
  "Poczuj wibrację przy wygranych, przegranych, odblokowaniu osiągnięć i nieprawidłowych słowach.";

export const NAVBAR_LEAVE_DUEL_LABEL = "Opuść pojedynek";
export const NAVBAR_LEAVE_CHALLENGE_LABEL = "Opuść wyzwanie";
export const NAVBAR_LEAVE_DAILY_LABEL = "Opuść dzienne";
export const NAVBAR_NEW_GAME_LABEL = "Nowa gra";
export const NAVBAR_LEAVE_DUEL_TITLE = "OPUŚCIĆ POJEDYNEK?";
export const NAVBAR_LEAVE_DUEL_DESCRIPTION =
  "Twój postęp w tym pojedynku jest zapisany przez 24 godziny. Możesz wrócić do tego linku w dowolnym momencie.";
export const NAVBAR_LEAVE_DAILY_TITLE = "OPUŚCIĆ DZIENNE?";
export const NAVBAR_LEAVE_DAILY_DESCRIPTION =
  "Twój postęp w dzisiejszym dziennym słowie jest zapisany. Nadal masz tylko jedną próbę, więc wróć i dokończ przed resetem.";
export const NAVBAR_LEAVE_CHALLENGE_TITLE = "OPUŚCIĆ WYZWANIE?";
export const NAVBAR_LEAVE_CHALLENGE_DESCRIPTION =
  "Twój postęp w tym wyzwaniu jest zapisany. Możesz wrócić do tego linku w dowolnym momencie.";
export const NAVBAR_ABANDON_GAME_TITLE = "PORZUCIĆ GRĘ?";
export const NAVBAR_ABANDON_GAME_DESCRIPTION =
  "Będzie to liczone jako porażka i zresetuje Twoją obecną serię.";
export const NAVBAR_ABANDON_BUTTON_TEXT = "PORZUĆ";
export const NAVBAR_LEAVE_BUTTON_TEXT = "OPUŚĆ";
export const NAVBAR_KEEP_PLAYING_BUTTON_TEXT = "GRAJ DALEJ";

export const BANNER_LABEL_CUSTOM_CHALLENGE = "WŁASNE WYZWANIE";
export const BANNER_LABEL_DUEL = "POJEDYNEK";
export const BANNER_LABEL_DAILY_PREFIX = "DZIENNE #";
export const BANNER_DIFFICULTY_HARD_TEXT = "Trudny";
export const BANNER_DIFFICULTY_NORMAL_TEXT = "Normalny";
export const BANNER_DAILY_ATTEMPT_TEXT = "1 próba/dzień";
export const BANNER_DUEL_WINDOW_TEXT = "24h";

export const ERROR_INVALID_CHALLENGE_TITLE = "NIEPRAWIDŁOWY LINK WYZWANIA";
export const ERROR_INVALID_CHALLENGE_DESCRIPTION =
  "Ten link wyzwania jest uszkodzony lub został naruszony. Poproś nadawcę o ponowne udostępnienie.";
export const ERROR_INVALID_DUEL_TITLE = "NIEPRAWIDŁOWY LINK POJEDYNKU";
export const ERROR_INVALID_DUEL_DESCRIPTION =
  "Ten link pojedynku jest uszkodzony lub został naruszony. Poproś o nowy link.";
export const ERROR_DUEL_EXPIRED_TITLE = "POJEDYNEK WYGASŁ";
export const ERROR_DUEL_EXPIRED_DESCRIPTION =
  "Ten link pojedynku wygasł. Linki pojedynków są ważne tylko przez 24 godziny. Poproś o utworzenie nowego pojedynku.";
export const ERROR_ACTIVITY_DUEL_EXPIRED_DESCRIPTION =
  "Ten pojedynek wygasł. Pojedynki z aktywności Discord są ważne tylko przez 24 godziny. Poproś o wysłanie nowego pojedynku na Discordzie.";
export const ERROR_WRONG_ACCOUNT_TITLE = "NIEPRAWIDŁOWE KONTO";
export const ERROR_WRONG_ACCOUNT_DESCRIPTION =
  "Ten pojedynek nie został wysłany na Twoje konto Discord. Sprawdź, czy zalogowano się na właściwe konto.";
export const ERROR_HAVE_YOU_PLAYED_TITLE = "MASZ JUŻ KONTO?";
export const ERROR_LINK_ACCOUNT_DESCRIPTION =
  "Połącz swoje istniejące konto Vagudle, aby zachować statystyki, lub zacznij nowe konto tylko na potrzeby Discorda.";
export const ERROR_LINK_EXISTING_BUTTON_TEXT = "MAM JUŻ KONTO";
export const ERROR_START_FRESH_BUTTON_TEXT = "ZACZNIJ OD NOWA";
export const ERROR_LINKING_IN_PROGRESS_DESCRIPTION =
  "Dokończ logowanie na stronie, która właśnie się otworzyła, a następnie wróć tutaj — zostanie to wykryte automatycznie.";
export const ERROR_LINKING_FAILED_DESCRIPTION =
  "Nie udało się rozpocząć łączenia. Spróbuj ponownie za chwilę.";
export const ERROR_ALREADY_PLAYED_TITLE = "JUŻ ZAGRANO DZISIAJ";
export const ERROR_ALREADY_PLAYED_WEB_DESCRIPTION =
  "Dzisiejsze dzienne słowo zostało już rozegrane na stronie internetowej.";
export const ERROR_ALREADY_PLAYED_DEFAULT_DESCRIPTION =
  "Dzisiejsze dzienne słowo zostało już rozegrane.";
export const ERROR_SOMETHING_WRONG_TITLE = "COŚ POSZŁO NIE TAK";
export const ERROR_SOMETHING_WRONG_HINT =
  "Jeśli problem się powtarza, sprawdź konsolę przeglądarki, aby uzyskać więcej informacji.";
export const ACTIVITY_ERROR_MESSAGES: Record<
  "daily" | "daily_link" | "duel" | "duel_word",
  string
> = {
  daily:
    "Nie udało się wczytać dzisiejszego dziennego słowa. Spróbuj dołączyć do aktywności ponownie z Discorda.",
  daily_link:
    "Nie udało się połączyć konta. Spróbuj dołączyć do aktywności ponownie z Discorda.",
  duel: "Nie udało się wczytać pojedynku. Spróbuj dołączyć do aktywności ponownie z Discorda.",
  duel_word:
    "Nie udało się wczytać słowa tego pojedynku. Spróbuj dołączyć do aktywności ponownie z Discorda.",
};

export const CLOSE_BUTTON_LABEL = "Zamknij";

export const INFO_MODAL_TITLE = "INFORMACJE";
export const INFO_TAB_HOWTO_LABEL = "JAK GRAĆ";
export const INFO_TAB_FEATURES_LABEL = "FUNKCJE";
export const INFO_TAB_CHALLENGES_LABEL = "WYZWANIA";
export const INFO_TAB_ABOUT_LABEL = "O GRZE";
export const INFO_TAB_OPENSOURCE_LABEL = "ŹRÓDŁO";
export const INFO_TAB_FEEDBACK_LABEL = "OPINIE";
export const INFO_MODAL_FOOTER_TOS_LABEL = "REGULAMIN";
export const INFO_MODAL_FOOTER_PRIVACY_LABEL = "POLITYKA PRYWATNOŚCI";

export const ABOUT_INTRO_TEXT_BEFORE_LINK =
  "Vagudle to gra słowna inspirowana grą";
export const ABOUT_INTRO_TEXT_AFTER_LINK =
  ", z dodatkowymi narzędziami pomagającymi rozwiązać zagadkę i bez irytującego dziennego limitu.";
export const ABOUT_DISCORD_TEXT_BEFORE_LINK = "Nasz";
export const ABOUT_DISCORD_LINK_TEXT = "serwer Discord";
export const ABOUT_DISCORD_TEXT_AFTER_LINK =
  "oferuje ekskluzywną funkcję Pojedynku, w której możesz rzucić wyzwanie innym członkom w starciu jeden na jeden i rywalizować na żywej tablicy wyników, sprawdzając, kto rozwiąże słowo w najmniejszej liczbie prób.";
export const ABOUT_FAVICON_ALT = "Ikona favicon Vagudle";
export const ABOUT_ICON_ALT = "Ikona Vagudle";
export const ABOUT_RESET_BUTTON_TITLE =
  "Usuwa cały zapisany postęp, statystyki, osiągnięcia i ustawienia.";
export const ABOUT_RESET_BUTTON_TEXT = "ZRESETUJ WSZYSTKIE DANE";
export const ABOUT_RESTORE_ATTRIBUTIONS_TITLE =
  "Ukryto przycisk źródła tła wideo? Przywróć go tutaj.";
export const ABOUT_RESTORE_ATTRIBUTIONS_TEXT = "PRZYWRÓĆ ŹRÓDŁA";
export const ABOUT_ATTRIBUTIONS_VISIBLE_TEXT = "ŹRÓDŁA WIDOCZNE";
export const ABOUT_STORE_BUTTON_TEXT = "ODWIEDŹ SKLEP";

export const CHALLENGES_IN_GAME_HEADING = "W GRZE";
export const CHALLENGES_STEP1_TEXT_PART1 = "Otwórz";
export const CHALLENGES_SETTINGS_LABEL = "Ustawienia";
export const CHALLENGES_STEP1_TEXT_PART2 = "i przejdź do zakładki";
export const CHALLENGES_CHALLENGE_TAB_LABEL = "Wyzwanie.";
export const CHALLENGES_STEP1_TEXT_PART3 =
  "Wybierz słownik, ustal liczbę dozwolonych prób, wpisz swoje tajne słowo, a następnie naciśnij „Wygeneruj link”. Udostępnij ten link, aby inni mogli zagrać z Twoim słowem przy dokładnie takich samych ustawieniach, jakie zostały wybrane.";
export const CHALLENGES_RESULTS_NOTE_TEXT =
  "Wyniki nigdy nie liczą się do statystyk odbiorcy, a jego postęp jest zapisywany pod linkiem, więc może do niego wrócić w dowolnym momencie.";
export const CHALLENGES_VIA_DISCORD_HEADING = "PRZEZ DISCORD";
export const CHALLENGES_DISCORD_TEXT_PART1 = "Na";
export const CHALLENGES_DISCORD_LINK_TEXT = "serwerze Discord King-Tajin";
export const CHALLENGES_DISCORD_TEXT_PART2 = ", użyj polecenia";
export const CHALLENGES_DISCORD_TEXT_PART3 =
  "aby wygenerować link do wyzwania bezpośrednio z Discorda.";

export const HOWTO_INTRO_TEXT_PART1 = "Wpisz słowo i naciśnij";
export const HOWTO_INTRO_TEXT_PART2 =
  "aby zatwierdzić próbę. Masz 11 prób na odgadnięcie ukrytego słowa.";
export const HOWTO_PAINT_HEADING = "POMALUJ WYNIK";
export const HOWTO_PAINT_DESCRIPTION =
  "Pola nie kolorują się automatycznie. Wybierz pędzel, a następnie kliknij lub przeciągnij po polach, aby zaznaczyć to, co uda się ustalić na podstawie dostępnych wskazówek.";
export const HOWTO_GREEN_DESCRIPTION = "Właściwa litera, właściwe miejsce";
export const HOWTO_YELLOW_DESCRIPTION = "Właściwa litera, złe miejsce";
export const HOWTO_GRAY_DESCRIPTION = "Litery nie ma w słowie";
export const HOWTO_ROW_TOOLS_HEADING = "NARZĘDZIA WIERSZA";
export const HOWTO_CLEAR_ROW_DESCRIPTION =
  "Czyści pokolorowane pola w tym wierszu";
export const HOWTO_BADGE_COUNT_DESCRIPTION =
  "Liczba poprawnych, obecnych i nieobecnych liter w wierszu";
export const HOWTO_KEYBOARD_HEADING = "KLAWIATURA";
export const HOWTO_KEYBOARD_DESCRIPTION =
  "Kolory klawiszy aktualizują się w miarę malowania — potwierdzone, obecne i wykluczone litery są zawsze widoczne na pierwszy rzut oka.";

export const FEEDBACK_VALIDATION_ERROR_MESSAGE =
  "Wypełnij wszystkie wymagane pola.";
export const FEEDBACK_SUBMIT_ERROR_MESSAGE =
  "Nie udało się wysłać opinii. Spróbuj ponownie.";
export const FEEDBACK_SUCCESS_TITLE = "OPINIA OTRZYMANA!";
export const FEEDBACK_SUCCESS_MESSAGE =
  "Dziękujemy za pomoc w ulepszaniu Vagudle.";
export const FEEDBACK_SEND_ANOTHER_BUTTON_TEXT = "WYŚLIJ KOLEJNĄ";
export const FEEDBACK_TYPE_LABEL = "RODZAJ OPINII *";
export const FEEDBACK_POSITIVE_LABEL = "Pozytywna";
export const FEEDBACK_NEGATIVE_LABEL = "Negatywna";
export const FEEDBACK_CATEGORY_LABEL = "KATEGORIA *";
export const FEEDBACK_CATEGORY_PLACEHOLDER = "Wybierz kategorię...";
export const FEEDBACK_CATEGORY_BUG_REPORT = "Zgłoszenie błędu";
export const FEEDBACK_CATEGORY_FEATURE_REQUEST = "Propozycja funkcji";
export const FEEDBACK_CATEGORY_GENERAL = "Ogólna opinia";
export const FEEDBACK_EMAIL_LABEL = "E-MAIL (OPCJONALNIE)";
export const FEEDBACK_EMAIL_HINT = "Tylko jeśli chcesz otrzymać odpowiedź";
export const FEEDBACK_MESSAGE_LABEL = "TWOJA OPINIA *";
export const FEEDBACK_MESSAGE_FULLSCREEN_LABEL = "TWOJA OPINIA";
export const FEEDBACK_MESSAGE_PLACEHOLDER = "Napisz, co masz na myśli...";
export const FEEDBACK_CHARACTERS_LEFT_TEXT = (remaining: number) =>
  `Pozostało znaków: ${remaining.toLocaleString()}`;
export const FEEDBACK_EXPAND_LABEL = "Rozwiń";
export const FEEDBACK_COLLAPSE_LABEL = "Zwiń";
export const FEEDBACK_SENDING_BUTTON_TEXT = "WYSYŁANIE...";
export const FEEDBACK_SEND_BUTTON_TEXT = "WYŚLIJ OPINIĘ";

export const OPEN_SOURCE_INTRO_TEXT_MIDDLE =
  "jest projektem open source opartym na";
export const OPEN_SOURCE_INTRO_TEXT_END = ". Wkład i opinie są mile widziane.";
export const OPEN_SOURCE_MADE_BY_TEXT = "Stworzone przez";
export const OPEN_SOURCE_STATS_CARD_ALT =
  "Statystyki repozytorium Vagudle na GitHub";

export const FEATURES_LIST: [string, string][] = [
  [
    "Zmienna długość słowa",
    "Graj słowami o długości od 4 do 7 liter — ustawisz to w Ustawieniach.",
  ],
  [
    "Tryb trudny",
    "Słowa dobierane są spośród rzadkich wyrazów, a liczba prób jest ograniczona do 9.",
  ],
  [
    "Dzienne",
    "Nowe słowo pojawia się raz dziennie, na zmianę 4- i 5-literowe, w trybie normalnym i trudnym. Śledź swoją serię na tablicy wyników i zapisz się na przypomnienie w kalendarzu, aby nigdy nic nie przegapić.",
  ],
  [
    "Malowanie pól",
    "Wybierz pędzel i klikaj lub przeciągaj po polach, aby je pokolorować.",
  ],
  [
    "Auto-szary",
    "Automatycznie zaznacza na szaro litery z całkowicie szarych wierszy.",
  ],
  [
    "Auto-zielony",
    "Automatycznie uzupełnia oznaczone jako poprawne litery we wszystkich wierszach.",
  ],
  ["Licznik szarych", "Pokazuje, ile liter nieobecnych jest w danym wierszu."],
];

export const PROVIDER_LABEL_DEFAULT = "Twojego dostawcy";

export const RESET_DATA_CATEGORIES: { title: string; description: string }[] = [
  {
    title: "Bieżąca gra",
    description: "Aktualnie rozgrywane słowo, próby i kolory pól.",
  },
  {
    title: "Statystyki",
    description:
      "Seria zwycięstw, rozkład wygranych i wskaźnik sukcesu, zarówno w trybie normalnym, jak i trudnym.",
  },
  {
    title: "Osiągnięcia",
    description: "Wszystkie odblokowane osiągnięcia i postęp w ich zdobywaniu.",
  },
  {
    title: "Ustawienia",
    description:
      "Długość słowa, tryb trudny, licznik szarych, auto-szary, auto-zielony oraz dodatkowe dźwięki i animacje.",
  },
  {
    title: "Tło",
    description: "Wybrany motyw tła i wszelkie ukryte przyciski źródeł wideo.",
  },
  {
    title: "Linki wyzwań i pojedynków",
    description:
      "Zapisany postęp dla wszelkich otwartych linków własnych wyzwań lub pojedynków.",
  },
];

export const RESET_DATA_DELETION_STEPS = [
  "Zaloguj się na konto połączone z Twoimi danymi Vagudle (Google, GitHub, e-mail lub Discord).",
  "Naciśnij „Usuń moje dane” (lub włącz „Usuń też moje konto” tutaj, a następnie potwierdź).",
  "Potwierdź, a Twoje dane zostaną natychmiast usunięte.",
];

export const RESET_DATA_DELETION_DELETED_ITEMS = [
  "Twoje logowanie (Google, GitHub, link e-mail, Discord lub Play Games).",
  "Twój zapis gry: statystyki, osiągnięcia, ustawienia i tło.",
  "Twój wpis i seria na dziennej tablicy wyników.",
  "Historia Twoich dziennych prób.",
  "Historia Twoich pojedynków, jeśli konto jest połączone z Discordem.",
];

export const RESET_DATA_DELETION_KEPT_TEXT =
  "Jeśli korzystasz z integracji Vagudle z Discordem, część danych powiązanych z Twoim ID Discord " +
  "jest zachowywana na stałe, aby zachować historię rozgrywek innych graczy oraz grupowe " +
  "tablice wyników/serie na Twoim serwerze Discord: łączne wyniki zwycięstw/porażek w pojedynkach " +
  "oraz zapisy udziału w grupowych dziennych wyzwaniach. Nie zostaje to usunięte powyższymi " +
  "krokami i nie ma dla tego terminu wygaśnięcia.";

export const RESET_DATA_REAUTH_TEXT_BEFORE_PROVIDER =
  "Ze względów bezpieczeństwa usunięcie konta wymaga niedawnego zalogowania się. Autoryzuj usunięcie, logując się ponownie przez usługę";
export const RESET_DATA_REAUTH_TEXT_AFTER_PROVIDER =
  ", a następnie Twoje konto i wszystkie jego dane zostaną trwale usunięte.";
export const RESET_DATA_CANCEL_BUTTON_TEXT = "ANULUJ";
export const RESET_DATA_AUTHORIZE_BUTTON_TEXT = "AUTORYZUJ USUNIĘCIE";
export const RESET_DATA_WARNING_TEXT =
  "To trwale usuwa wszystko, co Vagudle zapisało w tej przeglądarce. Nie można tego cofnąć.";
export const RESET_DATA_ALSO_DELETE_ACCOUNT_LABEL = "Usuń też moje konto";
export const RESET_DATA_DETAILS_ARIA_LABEL =
  "Co zostanie usunięte, a co zachowane";
export const RESET_DATA_DETAILS_BUTTON_TEXT = "SZCZEGÓŁY";
export const RESET_DATA_ACCOUNT_DESC_BEFORE_PROVIDER =
  "Trwale usuwa Twoje połączenie logowania przez usługę";
export const RESET_DATA_ACCOUNT_DESC_AFTER_PROVIDER =
  "z Vagudle i usuwa Twój zapis w chmurze. Nie można tego cofnąć.";
export const RESET_DATA_NOT_SIGNED_IN_TEXT =
  "Brak zalogowanego konta do usunięcia.";
export const RESET_DATA_WAIT_BUTTON_TEXT = (seconds: number) =>
  `POCZEKAJ ${seconds}s`;
export const RESET_DATA_DELETING_BUTTON_TEXT = "USUWANIE...";
export const RESET_DATA_DELETE_ACCOUNT_AND_DATA_BUTTON_TEXT =
  "USUŃ KONTO I DANE";
export const RESET_DATA_DELETE_EVERYTHING_BUTTON_TEXT = "USUŃ WSZYSTKO";
export const RESET_DATA_DETAILS_MODAL_TITLE = "SZCZEGÓŁY USUNIĘCIA KONTA";
export const RESET_DATA_HOW_TO_DELETE_HEADING = "JAK USUNĄĆ";
export const RESET_DATA_WHAT_GETS_DELETED_HEADING = "CO ZOSTANIE USUNIĘTE";
export const RESET_DATA_WHATS_KEPT_HEADING = "CO ZOSTANIE ZACHOWANE";
export const RESET_DATA_CLOSE_BUTTON_TEXT = "ZAMKNIJ";

export const DAILY_SCHEDULE_UNLOCK_TEXT_BEFORE_TIME =
  "Nowe dzienne słowo pojawia się o";
export const DAILY_SCHEDULE_UNLOCK_TEXT_AFTER_TIME = "Twojego czasu lokalnego";
export const DAILY_SCHEDULE_TODAY_LABEL = "DZISIAJ";
export const DAILY_SCHEDULE_WORD_LENGTH_TEXT = (letters: number) =>
  `${letters} ${polishPlural(letters, "litera", "litery", "liter")}`;
export const DAILY_SCHEDULE_HARD_LABEL = "TRUDNY";
export const DAILY_SCHEDULE_NORMAL_LABEL = "NORMALNY";
export const DAILY_SCHEDULE_ADD_TO_CALENDAR_HEADING = "DODAJ DO KALENDARZA";
export const DAILY_SCHEDULE_SUBSCRIBE_DESCRIPTION =
  "Zasubskrybuj raz, a Twoja aplikacja kalendarza będzie automatycznie sprawdzać nowe dzienne słowo. Wybierz godzinę przypomnienia:";
export const DAILY_SCHEDULE_REMINDER_HOUR_ARIA_LABEL = "Godzina przypomnienia";
export const DAILY_SCHEDULE_SUBSCRIBE_ARIA_LABEL =
  "Subskrybuj kanał kalendarza z dziennym przypomnieniem";
export const DAILY_SCHEDULE_OPENING_BUTTON_TEXT = "OTWIERANIE...";
export const DAILY_SCHEDULE_SUBSCRIBE_BUTTON_TEXT = "SUBSKRYBUJ";
export const DAILY_SCHEDULE_COPY_ARIA_LABEL = "Kopiuj link kalendarza";
export const DAILY_SCHEDULE_DOWNLOAD_PROMPT_TEXT =
  "Aplikacja kalendarza się nie otworzyła?";
export const DAILY_SCHEDULE_DOWNLOAD_BUTTON_TEXT = "POBIERZ";
export const DAILY_SCHEDULE_DISMISS_BUTTON_TEXT = "ODRZUĆ";
export const DAILY_SCHEDULE_FOOTER_NOTE_TEXT =
  "Apple Calendar i Outlook mogą subskrybować bezpośrednio za pomocą przycisku powyżej. W przypadku Google Calendar użyj przycisku kopiowania i dodaj kanał w sekcji „Inne kalendarze → Z adresu URL”.";

export const ACHIEVEMENTS_HIDDEN_PLACEHOLDER = "???";
export const ACHIEVEMENTS_PROGRESS_LABEL = "POSTĘP";
export const ACHIEVEMENTS_UNLOCKS_HIDDEN_TEXT = "ODBLOKOWUJE: ???";
export const ACHIEVEMENTS_UNLOCKS_TEXT = (label: string) =>
  `ODBLOKOWUJE: ${label}`;
export const ACHIEVEMENTS_PREV_PAGE_LABEL = "Poprzednia strona";
export const ACHIEVEMENTS_NEXT_PAGE_LABEL = "Następna strona";
export const ACHIEVEMENTS_PAGE_INDICATOR_TEXT = (
  current: number,
  total: number
) => `STRONA ${current}/${total}`;

export const ACHIEVEMENT_TEXT: Record<
  string,
  { title: string; description: string }
> = {
  first_win: {
    title: "Pierwsze zwycięstwo",
    description: "Wygraj swoją pierwszą grę",
  },
  win_15: { title: "Doświadczony gracz", description: "Wygraj 15 gier" },
  win_50: { title: "Weteran", description: "Wygraj 50 gier" },
  on_a_roll: { title: "Na fali", description: "Wygraj 5 gier z rzędu" },
  unstoppable: {
    title: "Niepowstrzymany",
    description: "Wygraj 15 gier z rzędu",
  },
  hard_5plus: {
    title: "Twardziel",
    description: "Ukończ tryb trudny słowem o długości co najmniej 5 liter",
  },
  fifth_guess: {
    title: "Błyskawica",
    description: "Rozwiąż słowo w 5 próbach lub mniej",
  },
  seven_letters: {
    title: "Mistrz wagi ciężkiej",
    description: "Wygraj grę siedmioliterowym słowem",
  },
  close_but_no_cigar: {
    title: "Tak blisko!",
    description:
      "Zgadnij 3 różne słowa z rzędu, w których tylko jedna litera jest błędna",
  },
  process_of_elimination: {
    title: "Metoda eliminacji",
    description:
      "Zgadnij 3 różne słowa w tej samej grze, w których każda litera jest błędna",
  },
  word_connoisseur: {
    title: "Koneser słów",
    description: "Odgadnij 200 unikalnych słów w trybie normalnym lub trudnym",
  },
  quack: {
    title: "Kwa!",
    description:
      "Przeliteruj DUCK pionowo w dowolnej kolumnie w czterech kolejnych próbach",
  },
  guess_mouse: {
    title: "Pisk!",
    description: "Wpisz MOUSE jako próbę podczas gry",
  },
  nail_biter: {
    title: "Wygrana na styk",
    description: "Wygraj grę w ostatniej możliwej próbie",
  },
  diversify: {
    title: "Różnorodność",
    description:
      "Wygraj w 3 lub więcej próbach, nie powtarzając pozycji litery z wcześniejszych prób (z wyłączeniem rozwiązania)",
  },
  blind_faith: {
    title: "Ślepa wiara",
    description:
      "Wygraj grę, w której tylko jedna pozycja litery była poprawna przed zwycięską próbą",
  },
  completionist: {
    title: "Kolekcjoner",
    description: "Odblokuj wszystkie pozostałe osiągnięcia",
  },
};

export const NAVBAR_HOW_TO_PLAY_ARIA_LABEL = "Jak grać";
export const NAVBAR_DAILY_WORD_ARIA_LABEL = "Dzienne słowo";
export const NAVBAR_DAILY_TITLE = "Dzienne";
export const NAVBAR_STATISTICS_ARIA_LABEL = "Statystyki";
export const NAVBAR_SETTINGS_ARIA_LABEL = "Ustawienia";
export const NAVBAR_NUDGE_HEADING = "PIERWSZY RAZ TUTAJ?";
export const NAVBAR_NUDGE_DESCRIPTION =
  "Zajrzyj do Ustawień, aby dostosować długość słowa, przydatne narzędzia i więcej.";
export const NAVBAR_NUDGE_DISMISS_BUTTON_TEXT = "ODRZUĆ";

export const DISCLAIMER_BANNER_ARIA_LABEL = "Zastrzeżenie o braku powiązania";
export const DISCLAIMER_BANNER_LABEL = "ZASTRZEŻENIE";
export const DISCLAIMER_BANNER_TEXT_PART1 =
  "„King-Tajin” to po prostu osobisty pseudonim twórcy gry. Ta strona i jej twórca są";
export const DISCLAIMER_BANNER_TEXT_PART2 =
  "niepowiązani z Industrias Tajín, S.A. de C.V. i nie są przez nią sponsorowani ani popierani.";
export const DISCLAIMER_BANNER_DISMISS_ARIA_LABEL = "Odrzuć zastrzeżenie";
export const DISCLAIMER_BANNER_DISMISS_BUTTON_TEXT = "ROZUMIEM";

export const ATTRIBUTION_BUTTON_ARIA_LABEL = "Źródło wideo w tle";

export const VIDEO_BACKGROUND_DOWNLOADING_TEXT = "POBIERANIE TŁA";
export const VIDEO_BACKGROUND_SIZE_TEXT = (megabytes: string) =>
  `${megabytes} MB`;
export const VIDEO_BACKGROUND_PROGRESS_TEXT = (
  received: string,
  total: string
) => `${received} MB / ${total} MB`;

export const LEADERBOARD_LOADING_TEXT = "Wczytywanie tablicy wyników...";
export const LEADERBOARD_ERROR_TEXT =
  "Nie udało się wczytać tablicy wyników. Spróbuj ponownie później.";
export const LEADERBOARD_SIGN_IN_PROMPT_TEXT =
  "Zaloguj się, aby zapisać swoją nazwę i pojawić się na tablicy wyników.";
export const LEADERBOARD_GO_TO_SETTINGS_BUTTON_TEXT = "PRZEJDŹ DO USTAWIEŃ";
export const LEADERBOARD_CHANGE_USERNAME_HEADING = "ZMIEŃ NAZWĘ UŻYTKOWNIKA";
export const LEADERBOARD_SET_USERNAME_HEADING =
  "USTAW NAZWĘ, ABY DOŁĄCZYĆ DO TABLICY WYNIKÓW";
export const LEADERBOARD_USERNAME_PLACEHOLDER =
  "Twoja nazwa na tablicy wyników";
export const LEADERBOARD_USERNAME_ARIA_LABEL =
  "Nazwa użytkownika na tablicy wyników";
export const LEADERBOARD_SAVING_INDICATOR = "...";
export const LEADERBOARD_SAVE_BUTTON_TEXT = "ZAPISZ";
export const LEADERBOARD_PLAYING_AS_TEXT = "Grasz jako";
export const LEADERBOARD_CHANGE_BUTTON_TEXT = "ZMIEŃ";
export const LEADERBOARD_COOLDOWN_TEXT_BEFORE = "Poczekaj jeszcze";
export const LEADERBOARD_COOLDOWN_TEXT_AFTER =
  "przed zmianą nazwy użytkownika.";
export const LEADERBOARD_EMPTY_TEXT = "Brak wyników. Zdobądź pierwsze miejsce!";
export const LEADERBOARD_PREV_BUTTON_TEXT = "POPRZEDNIA";
export const LEADERBOARD_PAGE_INDICATOR_TEXT = (
  page: number,
  totalPages: number
) => `Strona ${page} / ${totalPages}`;
export const LEADERBOARD_NEXT_BUTTON_TEXT = "NASTĘPNA";
export const LEADERBOARD_JUMP_TO_MY_PAGE_BUTTON_TEXT =
  "PRZEJDŹ DO MOJEJ STRONY";
export const LEADERBOARD_ROW_WINS_LOSSES_LABEL = "Z/P";
export const LEADERBOARD_ROW_STREAK_LABEL = "SERIA";
export const LEADERBOARD_ROW_BEST_LABEL = "REKORD";
export const LEADERBOARD_HIDE_ZERO_TOGGLE_LABEL =
  "Ukryj konta, które jeszcze nie grały";

export const ATTRIBUTION_MODAL_BY_PREFIX = "autor:";
export const ATTRIBUTION_MODAL_LICENSE_PREFIX = "Licencja:";
export const ATTRIBUTION_MODAL_HIDE_HEADING = "UKRYJ ŹRÓDŁO DLA TEGO TŁA";
export const ATTRIBUTION_MODAL_VIEW_SOURCE_ARIA_LABEL = (title: string) =>
  `Zobacz źródło dla ${title}`;
export const ATTRIBUTION_MODAL_HIDE_TOGGLE_ARIA_LABEL =
  "Ukryj źródło dla tego tła";

export const ACHIEVEMENT_TRAY_ARIA_LABEL = "Osiągnięcia";
export const ACHIEVEMENT_TRAY_HIDE_ARIA_LABEL = "Ukryj panel osiągnięć";
export const ACHIEVEMENT_TRAY_SHOW_ARIA_LABEL = "Pokaż panel osiągnięć";

export const ACHIEVEMENT_VIEW_UNLOCKED_TITLE = "Osiągnięcie odblokowane";
export const ACHIEVEMENT_VIEW_UNLOCKED_TITLE_WITH_COUNT = (
  current: number,
  total: number
) => `Osiągnięcie odblokowane (${current}/${total})`;
export const ACHIEVEMENT_VIEW_BACKGROUND_UNLOCKED_TEXT = (label: string) =>
  `TŁO ODBLOKOWANE: ${label}`;
export const ACHIEVEMENT_VIEW_SHARE_BUTTON_TEXT = "UDOSTĘPNIJ";
export const ACHIEVEMENT_VIEW_EQUIP_BUTTON_TEXT = "USTAW";
export const ACHIEVEMENT_VIEW_NEXT_BUTTON_TEXT = "DALEJ";
export const ACHIEVEMENT_VIEW_CONTINUE_BUTTON_TEXT = "KONTYNUUJ";

export const NORMAL_STATS_NO_GAMES_YET_TEXT = "BRAK GIER";
export const NORMAL_STATS_EMPTY_DAILY_TEXT =
  "Zagraj w dzisiejsze dzienne słowo, aby zobaczyć tu statystyki.";
export const NORMAL_STATS_EMPTY_HARD_TEXT =
  "Zagraj w trybie trudnym, aby zobaczyć tu statystyki.";
export const NORMAL_STATS_EMPTY_DEFAULT_TEXT =
  "Zagraj, aby zobaczyć tu statystyki.";
export const NORMAL_STATS_TAB_NORMAL_LABEL = "NORMALNY";
export const NORMAL_STATS_TAB_HARD_LABEL = "TRUDNY";
export const NORMAL_STATS_TAB_DAILY_LABEL = "DZIENNY";
export const NORMAL_STATS_GAMES_WON_TEXT = (games: number) =>
  `${games} ${polishPlural(games, "WYGRANA GRA", "WYGRANE GRY", "WYGRANYCH GIER")}`;
export const NORMAL_STATS_SHARE_STATS_BUTTON_TEXT = "UDOSTĘPNIJ STATYSTYKI";
export const NORMAL_STATS_NEW_GAME_BUTTON_TEXT = "NOWA GRA";
export const NORMAL_STATS_SHARE_GAME_BUTTON_TEXT = "UDOSTĘPNIJ GRĘ";
export const NORMAL_STATS_CHALLENGE_OTHERS_BUTTON_TEXT =
  "RZUĆ WYZWANIE INNYM TYM SŁOWEM";

export const BACKGROUND_TRAY_ARIA_LABEL = "Tła";
export const BACKGROUND_TRAY_HIDE_ARIA_LABEL = "Ukryj panel teł";
export const BACKGROUND_TRAY_SHOW_ARIA_LABEL = "Pokaż panel teł";

export const LINK_DISCORD_INVALID_LINK_TEXT =
  "Ten link jest nieprawidłowy lub go brakuje. Wróć do Discorda i spróbuj ponownie połączyć konto.";
export const LINK_DISCORD_LINKED_TEXT =
  "Twoje konto zostało połączone. Możesz zamknąć tę kartę i wrócić do Discorda albo wrócić do Vagudle poniżej.";
export const LINK_DISCORD_RETURN_BUTTON_TEXT = "WRÓĆ DO VAGUDLE";
export const LINK_DISCORD_LINKING_TEXT = "Łączenie konta...";
export const LINK_DISCORD_TRY_AGAIN_BUTTON_TEXT = "SPRÓBUJ PONOWNIE";
export const LINK_DISCORD_SIGNED_IN_TEXT_BEFORE = "Zalogowano jako";
export const LINK_DISCORD_SIGNED_IN_TEXT_AFTER = ". Kończenie łączenia...";
export const LINK_DISCORD_FALLBACK_ACCOUNT_TEXT = "Twoje konto";
export const LINK_DISCORD_SIGN_IN_PROMPT_TEXT =
  "Zaloguj się na swoje istniejące konto Vagudle, aby połączyć je z Discordem.";
export const LINK_DISCORD_CONTINUE_GOOGLE_BUTTON_TEXT = "KONTYNUUJ Z GOOGLE";
export const LINK_DISCORD_CONTINUE_GITHUB_BUTTON_TEXT = "KONTYNUUJ Z GITHUB";
export const LINK_DISCORD_EMAIL_LABEL = "E-MAIL";
export const LINK_DISCORD_SEND_LINK_BUTTON_TEXT = "WYŚLIJ LINK LOGOWANIA";
export const LINK_DISCORD_EMAIL_SENT_TEXT =
  "Sprawdź e-mail w poszukiwaniu linku logowania, a następnie otwórz go w tej samej przeglądarce.";
export const LINK_DISCORD_HEADING = "POŁĄCZ SWOJE KONTO";

export const COMPLETED_ROW_RESET_ARIA_LABEL = "Zresetuj kolory wiersza";

export const GRID_BRUSH_ARIA_LABEL = (status: string) => `Pędzel: ${status}`;
export const CELL_STATUS_EMPTY_LABEL = "Puste";
export const CELL_STATUS_WORDS: Record<
  "correct" | "present" | "absent",
  string
> = {
  correct: "poprawna",
  present: "obecna",
  absent: "nieobecna",
};
export const CELL_STATUS_DESCRIPTION_TEXT = (
  letter: string,
  statusWord: string
) => `${letter}, ${statusWord}`;
export const GRID_RESET_ALL_ARIA_LABEL = "Zresetuj wszystkie kolory";
export const GRID_RESET_CONFIRM_TITLE = "ZRESETOWAĆ WSZYSTKIE KOLORY?";
export const GRID_RESET_CONFIRM_TEXT_WITH_AUTOGRAY =
  "To wyczyści wszystkie pomalowane pola. Automatycznie zaszarzone pola pozostaną.";
export const GRID_RESET_CONFIRM_TEXT = "To wyczyści wszystkie pomalowane pola.";
export const GRID_RESET_BUTTON_TEXT = "RESETUJ";
export const GRID_GUESS_HISTORY_ARIA_LABEL =
  "Historia prób. Kliknij i przeciągnij po polu, aby zmienić jego kolor.";

export const DAILY_MODAL_PLAY_INTRO_TEXT =
  "Wszyscy dostają dziś to samo słowo. Masz jedną próbę, więc się postaraj.";
export const DAILY_MODAL_WORD_LENGTH_LABEL = "DŁUGOŚĆ SŁOWA";
export const DAILY_MODAL_DIFFICULTY_LABEL = "POZIOM TRUDNOŚCI";
export const DAILY_MODAL_CURRENT_STREAK_LABEL = "OBECNA SERIA";
export const DAILY_MODAL_STREAK_DAYS_TEXT = (days: number) =>
  `${days} ${days === 1 ? "dzień" : "dni"}`;
export const DAILY_MODAL_ALREADY_PLAYING_TEXT =
  "Grasz już w dzisiejsze słowo. Opuść, aby wrócić do zwykłej gry, lub zamknij to okno, aby kontynuować zgadywanie.";
export const DAILY_MODAL_LOCKOUT_WARNING_TEXT =
  "⚠ Po ukończeniu nie będziesz mieć dostępu aż do następnego resetu. ⚠";
export const DAILY_MODAL_LEAVE_BUTTON_TEXT = "OPUŚĆ DZIENNE";
export const DAILY_MODAL_PLAY_BUTTON_TEXT = "ZAGRAJ W DZISIEJSZE DZIENNE";
export const DAILY_MODAL_SOLVED_TEXT = (
  guessCount: number,
  maxGuesses: number
) => `ROZWIĄZANO W ${guessCount}/${maxGuesses}`;
export const DAILY_MODAL_NOT_SOLVED_TEXT = "NIE ROZWIĄZANO DZIŚ";
export const DAILY_MODAL_VIEW_GAME_BUTTON_TEXT = "ZOBACZ GRĘ";
export const DAILY_MODAL_COME_BACK_TEXT = "Wróć po resecie po nowe słowo.";
export const DAILY_MODAL_STREAK_LABEL = "SERIA";
export const DAILY_MODAL_BEST_LABEL = "REKORD";
export const DAILY_MODAL_PLAYED_LABEL = "ROZEGRANE";
export const DAILY_MODAL_NEXT_DAILY_TEXT = (countdown: string) =>
  `Następne dzienne za ${countdown}`;
export const DAILY_MODAL_SHARE_BUTTON_TEXT = "UDOSTĘPNIJ WYNIK";
export const RETURN_TO_NORMAL_GAME_BUTTON_TEXT = "WRÓĆ DO NORMALNEJ GRY";
export const DAILY_MODAL_HEADING_COMPLETE = "DZIENNE UKOŃCZONE";
export const DAILY_MODAL_HEADING_DEFAULT = "DZIENNE";
export const DAILY_MODAL_SCHEDULE_ARIA_LABEL = "Harmonogram dzienny";
export const DAILY_MODAL_LOADING_TEXT = "Wczytywanie dzisiejszego słowa...";
export const DAILY_MODAL_ERROR_TEXT =
  "Dzisiejsze dzienne słowo nie jest jeszcze dostępne. Sprawdź ponownie wkrótce.";
export const DAILY_MODAL_VIEW_LEADERBOARD_BUTTON_TEXT =
  "ZOBACZ TABLICĘ WYNIKÓW";

export const WEEKDAY_NAMES = [
  "Niedziela",
  "Poniedziałek",
  "Wtorek",
  "Środa",
  "Czwartek",
  "Piątek",
  "Sobota",
];
export const DAILY_CALENDAR_ON_TIME_SUFFIX = "(na czas)";

export const LINK_PLAYGAMES_INVALID_LINK_TEXT =
  "Ten link jest nieprawidłowy lub go brakuje. Wróć do aplikacji i spróbuj ponownie połączyć konto.";
export const LINK_PLAYGAMES_LINKED_TEXT =
  "Twoje konto zostało połączone. Możesz zamknąć tę kartę i wrócić do aplikacji.";
export const LINK_PLAYGAMES_SIGN_IN_PROMPT_TEXT =
  "Zaloguj się na swoje istniejące konto Vagudle, aby połączyć je z Play Games.";
export const LINK_PLAYGAMES_CONTINUE_DISCORD_BUTTON_TEXT =
  "KONTYNUUJ Z DISCORD";

export const CHALLENGE_FORM_AUTO_GENERATE_ERROR_TEXT =
  "Nie udało się automatycznie wygenerować linku. Edytuj poniższe ustawienia lub spróbuj ponownie.";
export const CHALLENGE_FORM_NOTE_LABEL = "UWAGA:";
export const CHALLENGE_FORM_NOTE_TEXT =
  "Wybrany słownik ma niewielki wpływ na rozgrywkę. Informuje jedynie gracza o popularności słowa.";
export const CHALLENGE_FORM_DICTIONARY_LABEL = "SŁOWNIK";
export const CHALLENGE_FORM_WORD_LABEL = "TWOJE SŁOWO";
export const CHALLENGE_FORM_WORD_PLACEHOLDER = "Wpisz słowo (4–7 liter)...";
export const CHALLENGE_FORM_INVALID_LENGTH_TEXT =
  "Słowo musi mieć od 4 do 7 liter.";
export const CHALLENGE_FORM_INVALID_WORD_TEXT = (
  word: string,
  dictLabel: string
) => `„${word}” nie znajduje się w słowniku ${dictLabel}.`;
export const CHALLENGE_FORM_AVAILABLE_IN_OTHER_DICT_TEXT = (
  dictLabel: string
) =>
  `Jest ono jednak dostępne w słowniku ${dictLabel}. Przełącz słownik, aby go użyć.`;
export const CHALLENGE_FORM_VALID_WORD_TEXT = (word: string, length: number) =>
  `„${word}” jest prawidłowe — ${length} ${polishPlural(length, "litera", "litery", "liter")}.`;
export const CHALLENGE_FORM_EASIER_DICT_HINT_TEXT = (dictLabel: string) =>
  `Uwaga: to słowo występuje też w słowniku ${dictLabel}, przełączenie słownika da graczowi dokładniejszą informację o popularności słowa.`;
export const CHALLENGE_FORM_MUST_BE_IN_DICT_TEXT = (dictLabel: string) =>
  `Musi znajdować się w słowniku ${dictLabel}.`;
export const CHALLENGE_FORM_GUESSES_ALLOWED_LABEL = "DOZWOLONE PRÓBY";
export const CHALLENGE_FORM_RESULTS_WARNING_TEXT =
  "⚠ Wyniki wyzwania nie liczą się do statystyk odbiorcy. ⚠";
export const CHALLENGE_FORM_GENERATE_ERROR_TEXT =
  "Nie udało się wygenerować linku. Sprawdź połączenie i spróbuj ponownie.";
export const CHALLENGE_FORM_GENERATING_BUTTON_TEXT = "GENEROWANIE...";
export const CHALLENGE_FORM_GENERATE_BUTTON_TEXT = "WYGENERUJ LINK";

export const CHALLENGE_CREATOR_BACK_TO_STATS_BUTTON_TEXT = "WRÓĆ DO STATYSTYK";
export const CHALLENGE_CREATOR_READY_LABEL = "WYZWANIE GOTOWE";
export const CHALLENGE_CREATOR_LETTERS_TEXT = (letters: number) =>
  `${letters} ${polishPlural(letters, "litera", "litery", "liter")}`;
export const CHALLENGE_CREATOR_GUESSES_TEXT = (guesses: number) =>
  `${guesses} prób`;
export const CHALLENGE_CREATOR_COPIED_BUTTON_TEXT = "SKOPIOWANO!";
export const CHALLENGE_CREATOR_COPY_BUTTON_TEXT = "KOPIUJ";
export const CHALLENGE_CREATOR_SHARED_BUTTON_TEXT = "UDOSTĘPNIONO!";
export const CHALLENGE_CREATOR_SHARE_BUTTON_TEXT = "UDOSTĘPNIJ";
export const CHALLENGE_CREATOR_EDIT_BUTTON_TEXT = "EDYTUJ";
export const CHALLENGE_CREATOR_GENERATING_LINK_TEXT = "GENEROWANIE LINKU...";

export const CLOUD_SAVE_PROVIDER_LABEL_EMAIL = "E-mail";
export const CLOUD_SAVE_PROVIDER_LABEL_PLAYGAMES = "Play Games";
export const CLOUD_SAVE_PROVIDER_LABEL_UNKNOWN = "Nieznany";
export const CLOUD_SAVE_AUTO_SIGNED_IN_TEXT =
  "Automatycznie zalogowano przez Discord.";
export const CLOUD_SAVE_WAITING_LINK_TEXT =
  "Oczekiwanie na dokończenie łączenia w przeglądarce...";
export const CLOUD_SAVE_OPENING_LINK_BUTTON_TEXT = "OTWIERANIE LINKU...";
export const CLOUD_SAVE_LINK_EXISTING_ACCOUNT_BUTTON_TEXT =
  "POŁĄCZ ISTNIEJĄCE KONTO";
export const CLOUD_SAVE_LINK_START_ERROR_TEXT =
  "Nie udało się rozpocząć łączenia. Spróbuj ponownie.";
export const CLOUD_SAVE_PLAYGAMES_PROMPT_TEXT =
  "Masz już konto Vagudle? Połącz je, aby zachować swój postęp.";
export const CLOUD_SAVE_OPENING_BUTTON_TEXT = "OTWIERANIE...";
export const CLOUD_SAVE_LINK_ACCOUNT_BUTTON_TEXT = "POŁĄCZ KONTO";
export const CLOUD_SAVE_SKIP_BUTTON_TEXT = "POMIŃ";
export const CLOUD_SAVE_PLAYGAMES_LINK_ERROR_TEXT =
  "Nie udało się połączyć z Play Games. Spróbuj ponownie.";
export const CLOUD_SAVE_LINKING_BUTTON_TEXT = "ŁĄCZENIE...";
export const CLOUD_SAVE_LINK_PLAYGAMES_BUTTON_TEXT = "POŁĄCZ Z PLAY GAMES";
export const CLOUD_SAVE_ALSO_LINKED_TEXT = (list: string) =>
  `Połączono również: ${list}`;
export const CLOUD_SAVE_HEADING = "ZAPIS W CHMURZE";
export const CLOUD_SAVE_IN_PROGRESS_WARNING_TEXT =
  "Zapis w chmurze nie obejmuje gier aktualnie w toku.";
export const CLOUD_SAVE_PRIVACY_TEXT =
  "Twoje dane nigdy nie są sprzedawane. Adresy e-mail są przechowywane wyłącznie na potrzeby wsparcia.";
export const CLOUD_SAVE_CHECKING_STATUS_TEXT = "Sprawdzanie stanu logowania...";
export const CLOUD_SAVE_SIGNED_IN_AS_TEXT = "Zalogowano jako";
export const CLOUD_SAVE_ACCOUNT_TYPE_SUFFIX_TEXT = (type: string) =>
  `— konto: ${type}`;
export const CLOUD_SAVE_UP_TO_DATE_TEXT = "Aktualne";
export const CLOUD_SAVE_SYNCING_TEXT = "Synchronizowanie...";
export const CLOUD_SAVE_LAST_SAVED_TEXT = (time: string) =>
  `Ostatnio zapisano ${time}`;
export const CLOUD_SAVE_LINK_DISCORD_BUTTON_TEXT = "POŁĄCZ DISCORD";
export const CLOUD_SAVE_SIGN_OUT_BUTTON_TEXT = "WYLOGUJ";
export const CLOUD_SAVE_SIGN_IN_PROMPT_TEXT =
  "Zaloguj się, aby synchronizować statystyki, osiągnięcia i ustawienia między urządzeniami.";
export const CLOUD_SAVE_DIRECT_SIGNIN_HEADING = "BEZPOŚREDNIE LOGOWANIE";
export const CLOUD_SAVE_EMAIL_ARIA_LABEL = "Adres e-mail";
export const CLOUD_SAVE_SEND_LINK_BUTTON_TEXT = "WYŚLIJ LINK";
export const CLOUD_SAVE_EMAIL_SENT_TEXT =
  "Sprawdź e-mail w poszukiwaniu linku logowania.";
export const CLOUD_SAVE_FLEXIBLE_SIGNIN_HEADING = "ELASTYCZNE LOGOWANIE";
export const CLOUD_SAVE_FLEXIBLE_SIGNIN_DESCRIPTION =
  "Działa samodzielnie lub można je później połączyć z innym kontem.";
export const CLOUD_SAVE_CONTINUE_PLAYGAMES_BUTTON_TEXT =
  "KONTYNUUJ Z PLAY GAMES";

export const CLOUD_SAVE_CONFLICT_DATE_FALLBACK_TEXT = "Nieznana";
export const CLOUD_SAVE_CONFLICT_UPDATED_TEXT = (date: string) =>
  `Zaktualizowano ${date}`;
export const CLOUD_SAVE_CONFLICT_ACHIEVEMENTS_UNLOCKED_TEXT = (count: number) =>
  `${count} ${polishPlural(count, "odblokowane osiągnięcie", "odblokowane osiągnięcia", "odblokowanych osiągnięć")}`;
export const CLOUD_SAVE_CONFLICT_NORMAL_WON_TEXT = (
  won: number,
  total: number
) => `Normalny: ${won}/${total} wygranych`;
export const CLOUD_SAVE_CONFLICT_HARD_WON_TEXT = (won: number, total: number) =>
  `Trudny: ${won}/${total} wygranych`;
export const CLOUD_SAVE_CONFLICT_DAILY_WON_TEXT = (
  won: number,
  total: number,
  streak: number
) => `Dzienny: ${won}/${total} wygranych, seria ${streak}`;
export const CLOUD_SAVE_CONFLICT_INTRO_TEXT =
  "Masz zapis na tym urządzeniu i zapis w chmurze. Wybierz, który zachować — osiągnięcia i tak zostaną połączone, więc nic nie przepadnie.";
export const CLOUD_SAVE_CONFLICT_THIS_DEVICE_LABEL = "TO URZĄDZENIE";
export const CLOUD_SAVE_CONFLICT_CLOUD_SAVE_LABEL = "ZAPIS W CHMURZE";
export const CLOUD_SAVE_CONFLICT_SYNC_ERROR_TEXT =
  "Nie udało się zsynchronizować zapisu. Spróbuj ponownie.";
export const CLOUD_SAVE_CONFLICT_KEEP_DEVICE_BUTTON_TEXT =
  "ZACHOWAJ TO URZĄDZENIE";
export const CLOUD_SAVE_CONFLICT_KEEP_CLOUD_BUTTON_TEXT =
  "ZACHOWAJ ZAPIS Z CHMURY";

export const GENERAL_SETTINGS_DAILY_MODE_ACTIVE_TEXT = "TRYB DZIENNY AKTYWNY";
export const GENERAL_SETTINGS_CUSTOM_CHALLENGE_ACTIVE_TEXT =
  "WŁASNE WYZWANIE AKTYWNE";
export const CHALLENGE_DICTIONARY_SUFFIX_TEXT = "słownik —";
export const CHALLENGE_GUESSES_ALLOWED_TEXT = (guesses: number) =>
  `${guesses} dozwolonych prób`;
export const GENERAL_SETTINGS_DAILY_LOCKED_TEXT =
  "Długość słowa i poziom trudności są ustalone przez dzisiejsze dzienne słowo i resetują się przy następnym dziennym.";
export const GENERAL_SETTINGS_CHALLENGE_LOCKED_TEXT =
  "Długość słowa i poziom trudności są ustalone przez to wyzwanie. Wróć do normalnego Vagudle, aby je zmienić.";
export const GENERAL_SETTINGS_WORD_LENGTH_HINT_TEXT =
  "Można zmienić przed pierwszą próbą:";
export const GENERAL_SETTINGS_WORD_LENGTH_ARIA_LABEL = "Długość słowa";
export const SETTINGS_WORD_LENGTH_CHANGE_BLOCKED_ERROR_TEXT =
  "Zakończ lub zacznij nową grę, zanim zmienisz długość słowa!";
export const SETTINGS_DIFFICULTY_CHANGE_BLOCKED_ERROR_TEXT =
  "Zakończ lub zacznij nową grę, zanim zmienisz poziom trudności!";
export const SETTINGS_MODAL_TAB_SETTINGS_LABEL = "USTAWIENIA";
export const SETTINGS_MODAL_TAB_CHALLENGE_LABEL = "WYZWANIE";

export const CHALLENGE_RESULT_MODAL_TITLE = "Wynik wyzwania";
export const CHALLENGE_RESULT_HEADING = "WŁASNE WYZWANIE";
export const CHALLENGE_RESULT_COMPLETE_TEXT = "WYZWANIE UKOŃCZONE!";
export const RESULT_SOLVED_TEXT_BEFORE = "Rozwiązano w";
export const RESULT_SOLVED_TEXT_AFTER = "próbach";
export const CHALLENGE_RESULT_FAILED_TEXT = "WYZWANIE NIEUKOŃCZONE";
export const CHALLENGE_RESULT_FAILED_DESCRIPTION =
  "Następnym razem się uda! Zawsze możesz zapytać nadawcę o odpowiedź.";
export const RESULT_LEAVE_BUTTON_TEXT = "OPUŚĆ";
export const CHALLENGE_RESULT_SHARE_BUTTON_TEXT = "UDOSTĘPNIJ";

export const CHALLENGE_ACCEPT_MODAL_HEADING = "WŁASNE WYZWANIE";
export const CHALLENGE_ACCEPT_MODAL_INTRO_TEXT =
  "Ktoś przesłał Ci własne wyzwanie Vagudle. Oto, z czym musisz się zmierzyć:";
export const CHALLENGE_ACCEPT_MODAL_WORD_LENGTH_LABEL = "DŁUGOŚĆ SŁOWA";
export const CHALLENGE_ACCEPT_MODAL_DICTIONARY_LABEL = "SŁOWNIK";
export const CHALLENGE_ACCEPT_MODAL_GUESSES_LABEL = "PRÓBY";
export const CHALLENGE_ACCEPT_MODAL_LETTERS_TEXT = (letters: number) =>
  `${letters} ${polishPlural(letters, "litera", "litery", "liter")}`;
export const CHALLENGE_ACCEPT_MODAL_ATTEMPTS_TEXT = (attempts: number) =>
  `${attempts} prób`;
export const CHALLENGE_ACCEPT_MODAL_PROGRESS_SAVED_TEXT =
  "Twój postęp jest zapisany pod tym linkiem. Wróć w dowolnym momencie, aby kontynuować.";
export const CHALLENGE_ACCEPT_MODAL_RESULTS_NOT_COUNTED_TEXT =
  "⚠ Wyniki nie liczą się do Twoich statystyk. ⚠";
export const CHALLENGE_ACCEPT_MODAL_PLAY_BUTTON_TEXT = "ZAGRAJ W WYZWANIE";

export const DUEL_RESULT_MODAL_TITLE = "Wynik pojedynku";
export const DUEL_RESULT_HEADING = "POJEDYNEK";
export const DUEL_RESULT_COMPLETE_TEXT = "POJEDYNEK UKOŃCZONY!";
export const DUEL_RESULT_FAILED_TEXT = "POJEDYNEK NIEUKOŃCZONY";
export const DUEL_RESULT_FAILED_DESCRIPTION = "Następnym razem się uda!";

export const DUEL_MODAL_ACCEPT_HEADING = "POJEDYNEK";
export const DUEL_MODAL_COMPLETE_HEADING = "POJEDYNEK UKOŃCZONY";
export const DUEL_MODAL_CHALLENGED_INTRO_TEXT =
  "Rzucono Ci wyzwanie na pojedynek. Oto, z czym musisz się zmierzyć:";
export const DUEL_MODAL_WORD_LENGTH_LABEL = "DŁUGOŚĆ SŁOWA";
export const DUEL_MODAL_LETTERS_TEXT = (letters: number) =>
  `${letters} ${polishPlural(letters, "litera", "litery", "liter")}`;
export const DUEL_MODAL_DICTIONARY_LABEL = "SŁOWNIK";
export const DUEL_MODAL_GUESSES_LABEL = "PRÓBY";
export const DUEL_MODAL_ATTEMPTS_TEXT = (attempts: number) =>
  `${attempts} prób`;
export const DUEL_MODAL_PROGRESS_SAVED_TEXT =
  "Twój postęp jest zapisany przez 24 godziny. Wróć do tego linku w dowolnym momencie, aby kontynuować.";
export const DUEL_MODAL_RESULTS_NOT_COUNTED_TEXT =
  "⚠ Wyniki nie liczą się do Twoich statystyk. ⚠";
export const DUEL_MODAL_PLAY_BUTTON_TEXT = "ZAGRAJ W POJEDYNEK";
export const DUEL_MODAL_RESULT_NOT_RECORDED_TEXT = "WYNIK NIEZAPISANY";
export const DUEL_MODAL_RESULT_RECORDED_TEXT = "TWÓJ WYNIK ZOSTAŁ ZAPISANY";
export const DUEL_MODAL_SAVING_RESULT_TEXT = "ZAPISYWANIE WYNIKU...";
export const DUEL_MODAL_RESULT_NOT_RECORDED_DESCRIPTION =
  "Wystąpił problem podczas zapisywania wyniku. Poinformuj o tym organizatora.";
export const DUEL_MODAL_RESULT_RECORDED_DESCRIPTION =
  "Zwycięzca zostanie ogłoszony, gdy oboje gracze skończą.";
export const DUEL_MODAL_SAVING_RESULT_DESCRIPTION =
  "Poczekaj, trwa zapisywanie wyniku.";
export const DUEL_MODAL_SAVING_RESULTS_TEXT = "Zapisywanie wyników...";
export const DUEL_MODAL_RESULTS_SAVED_TEXT =
  "Wyniki zostały pomyślnie zapisane.";
export const DUEL_MODAL_SAVE_FAILED_TEXT =
  "Nie udało się zapisać wyników po 3 próbach. Twój wynik nie został zapisany.";
export const DUEL_MODAL_PREPARING_SAVE_TEXT =
  "Przygotowywanie do zapisu wyników...";

export const CHALLENGE_DICT_LABELS: Record<"normal" | "hard" | "full", string> =
  {
    normal: "Normalny",
    hard: "Trudny",
    full: "Ekstremalny",
  };
export const CHALLENGE_DICT_DESCRIPTIONS: Record<
  "normal" | "hard" | "full",
  string
> = {
  normal: "Popularne angielskie słowa",
  hard: "Rzadkie angielskie słowa",
  full: "Pełny słownik Scrabble",
};

export const USERNAME_VALIDATION_ERROR_TEXT =
  "3–20 znaków: litery, cyfry, spacje, - lub _";
export const USERNAME_TAKEN_ERROR_TEXT =
  "Ta nazwa użytkownika jest już zajęta.";
export const USERNAME_RATE_LIMITED_ERROR_TEXT = (cooldown: string) =>
  `Możesz ponownie zmienić nazwę za ${cooldown}.`;
export const GENERIC_ERROR_TEXT = "Coś poszło nie tak. Spróbuj ponownie.";

export const CLOUD_AUTH_EMAIL_PROMPT_TEXT =
  "Potwierdź swój e-mail, aby zakończyć logowanie:";
export const CLOUD_AUTH_GOOGLE_SIGNIN_ERROR_TEXT =
  "Logowanie przez Google nie powiodło się. Spróbuj ponownie.";
export const CLOUD_AUTH_GITHUB_SIGNIN_ERROR_TEXT =
  "Logowanie przez GitHub nie powiodło się. Spróbuj ponownie.";
export const CLOUD_AUTH_PLAYGAMES_SIGNIN_ERROR_TEXT =
  "Logowanie przez Play Games nie powiodło się. Spróbuj ponownie.";
export const CLOUD_AUTH_EMAIL_LINK_ERROR_TEXT =
  "Nie udało się wysłać linku logowania. Spróbuj ponownie.";
export const CLOUD_AUTH_SIGNOUT_ERROR_TEXT =
  "Wylogowanie nie powiodło się. Spróbuj ponownie.";
export const CLOUD_AUTH_DELETE_ACCOUNT_ERROR_TEXT =
  "Nie udało się usunąć konta. Spróbuj ponownie.";
export const CLOUD_AUTH_NO_ACCOUNT_ERROR_TEXT =
  "Nie znaleziono zalogowanego konta.";
export const CLOUD_AUTH_REAUTH_UNSUPPORTED_ERROR_TEXT =
  "Tej metody logowania nie można ponownie autoryzować tutaj. Wyloguj się, zaloguj ponownie, a następnie spróbuj usunąć konto jeszcze raz.";
export const CLOUD_AUTH_REAUTH_FAILED_ERROR_TEXT =
  "Ponowna autoryzacja nie powiodła się. Spróbuj ponownie.";

export const CLOUD_SYNC_VERIFY_ERROR_TEXT =
  "Nie udało się zweryfikować logowania do synchronizacji w chmurze.";
export const CLOUD_SYNC_CREATE_ERROR_TEXT =
  "Nie udało się utworzyć zapisu w chmurze.";
export const CLOUD_SYNC_UNREACHABLE_ERROR_TEXT =
  "Nie udało się połączyć z zapisem w chmurze.";
export const CLOUD_SYNC_PUSH_ERROR_TEXT =
  "Nie udało się zsynchronizować z chmurą.";

export const PAGE_TITLE_DUEL = "Vagudle - Pojedynek";
export const PAGE_TITLE_CHALLENGE = "Vagudle - Wyzwanie";
export const PAGE_TITLE_DAILY = "Vagudle - Dzienne";

export const SHARE_HARD_MODE_TAG = " [TRUDNY]";
export const SHARE_NORMAL_MODE_TAG = " [NORMALNY]";
export const SHARE_CHALLENGE_HEADER_TEXT = (
  score: number | string,
  maxChallenges: number,
  wordPart: string
) => `${GAME_TITLE} [WYZWANIE] — ${score}/${maxChallenges} (${wordPart})`;
export const SHARE_STATUS_HEADER_TEXT = (
  modeTag: string,
  solution: string,
  score: number | string,
  maxChallenges: number,
  wordLength: number
) =>
  `${GAME_TITLE}${modeTag} — ${solution} — ${score}/${maxChallenges} (${wordLength} ${polishPlural(wordLength, "litera", "litery", "liter")})`;
export const SHARE_STATUS_CHALLENGE_TITLE = () => `Wyzwanie ${GAME_TITLE}`;
export const SHARE_STATUS_NORMAL_TITLE = (solution: string) =>
  `${GAME_TITLE} — ${solution}`;
export const SHARE_DAILY_HEADER_TEXT = (
  dailyNumber: number,
  score: number | string,
  maxChallenges: number
) => `${GAME_TITLE} Dzienne #${dailyNumber} — ${score}/${maxChallenges}`;
export const SHARE_DAILY_TITLE = (dailyNumber: number) =>
  `${GAME_TITLE} Dzienne #${dailyNumber}`;
export const SHARE_STATS_TITLE = (modeTag: string) =>
  `${GAME_TITLE}${modeTag} Statystyki`;
export const SHARE_STATS_PLAYED_LABEL = "🎮 Zagrane:  ";
export const SHARE_STATS_WIN_RATE_LABEL = "✅ Wygrane%: ";
export const SHARE_STATS_STREAK_LABEL = "🔥 Seria:    ";
export const SHARE_STATS_BEST_LABEL = "🏆 Rekord:   ";
export const SHARE_STATS_GUESS_DISTRIBUTION_LABEL = "Rozkład prób:";
export const SHARE_DAILY_STATS_TITLE = () =>
  `${GAME_TITLE} [DZIENNE] Statystyki`;
export const SHARE_CHALLENGE_INVITE_INTRO_TEXT =
  "Rzucam Ci wyzwanie w postaci własnej gry Vagudle!";
export const SHARE_CHALLENGE_INVITE_DETAILS_TEXT = (
  length: number,
  dictLabel: string,
  guesses: number
) =>
  `${length} ${polishPlural(length, "litera", "litery", "liter")} · słownik ${dictLabel} · ${guesses} prób`;
export const SHARE_CHALLENGE_INVITE_NOTE_TEXT =
  "(Wyniki nie wpłyną na Twoje statystyki)";
export const SHARE_CHALLENGE_INVITE_TITLE = "Wyzwanie Vagudle";
export const SHARE_ACHIEVEMENT_UNLOCKED_TEXT = (title: string) =>
  `🏆 Odblokowano osiągnięcie: ${title}`;
export const SHARE_ACHIEVEMENT_BACKGROUND_UNLOCKED_TEXT = (label: string) =>
  `Odblokowano tło: ${label}`;
export const SHARE_ACHIEVEMENT_TITLE = "Osiągnięcie Vagudle";

export const ACHIEVEMENT_TOAST_BACKGROUND_UNLOCKED_SUFFIX_TEXT = (
  label: string
) => ` — odblokowano tło: ${label}!`;

export const NOTIFICATION_CHANNEL_NAME = "Przypomnienia o grze";
export const NOTIFICATION_CHANNEL_DESCRIPTION =
  "Przypomnienia, aby utrzymać serię i wrócić do gry";
export const NOTIFICATION_STREAK_WARNING_TITLE =
  "Twoja seria zaraz się zresetuje!";
export const NOTIFICATION_STREAK_WARNING_BODY =
  "Zagraj w dzisiejsze Vagudle, zanim będzie za późno.";
export const NOTIFICATION_CUSTOM_REMINDER_TITLE = "Nie trać swojej serii!";
export const NOTIFICATION_CUSTOM_REMINDER_BODY =
  "Dzisiejsze Vagudle na Ciebie czeka.";
export const NOTIFICATION_INACTIVITY_TITLE = "Tęsknimy za Tobą!";
export const NOTIFICATION_INACTIVITY_BODY = "Wróć i kontynuuj zabawę!";
export const NOTIFICATION_ACTION_PLAY_NOW = "Zagraj teraz";
export const NOTIFICATION_ACTION_PLAY_DAILY = "Zagraj dzienne";

export const CRASH_BOUNDARY_MESSAGE_TEXT = "Coś poszło nie tak.";
export const CRASH_BOUNDARY_RELOAD_BUTTON_TEXT = "Odśwież";

export const CLOUD_SYNC_LINK_ACCOUNT_ERROR_TEXT =
  "Nie udało się połączyć konta.";
export const CLOUD_SYNC_LINK_ACCOUNT_RETRY_ERROR_TEXT =
  "Nie udało się połączyć konta. Spróbuj ponownie.";
export const CLOUD_SYNC_VERIFY_SIGNIN_ERROR_TEXT =
  "Nie udało się zweryfikować logowania. Spróbuj ponownie.";
export const CLOUD_SYNC_LINK_DISCORD_ERROR_TEXT =
  "Nie udało się połączyć konta Discord.";
export const CLOUD_SYNC_LINK_DISCORD_RETRY_ERROR_TEXT =
  "Nie udało się połączyć konta Discord. Spróbuj ponownie.";
export const CLOUD_SYNC_LINK_PLAYGAMES_ERROR_TEXT =
  "Nie udało się połączyć konta Play Games.";
export const CLOUD_SYNC_LINK_PLAYGAMES_RETRY_ERROR_TEXT =
  "Nie udało się połączyć konta Play Games. Spróbuj ponownie.";
export const RELATIVE_TIME_JUST_NOW_TEXT = "przed chwilą";
export const RELATIVE_TIME_UNIT_LABELS: Record<string, string> = {
  second: "sekunda",
  minute: "minuta",
  hour: "godzina",
  day: "dzień",
  month: "miesiąc",
  year: "rok",
};

export const DAILY_MODE_SIGNIN_WARNING_TEXT =
  "Zaloguj się, aby zapisać wynik na tablicy wyników";
export const DAILY_MODE_USERNAME_WARNING_TEXT =
  "Ustaw nazwę użytkownika, aby zapisać wynik na tablicy wyników";

export const WORD_LISTS_LOAD_ERROR_TEXT =
  "Nie udało się wczytać list słów. Odśwież stronę.";

export const LINK_START_ERROR_SHORT_TEXT = "Nie udało się rozpocząć łączenia.";
export const PLAYGAMES_NOT_AVAILABLE_ERROR_TEXT =
  "Play Games nie jest dostępne na tym urządzeniu.";
export const LINKING_NOT_AVAILABLE_ERROR_TEXT =
  "Łączenie nie jest dostępne na tym urządzeniu.";

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
  sprinkles: { desktopLabel: "VAGUDLE POSYPKA", mobileLabel: "SZARY" },
  flakes: { desktopLabel: "DESZCZ PŁATKÓW", mobileLabel: "SIATKA" },
  tnt_rain: { desktopLabel: "DESZCZ TNT", mobileLabel: "TNT" },
  pulsing_purple: { desktopLabel: "PULSUJĄCY FIOLET", mobileLabel: "FIOLET" },
  carrots: { desktopLabel: "WIRUJĄCE MARCHEWKI", mobileLabel: "MARCHEWKI" },
  flying_mudskipper: {
    desktopLabel: "LATAJĄCY MUŁOSKOCZEK",
    mobileLabel: "MUŁOSKOCZEK",
  },
  escalating_fire: { desktopLabel: "NARASTAJĄCY OGIEŃ", mobileLabel: "OGIEŃ" },
  dvd_screensaver: { desktopLabel: "WYGASZACZ DVD", mobileLabel: "DVD" },
  number_rain: {
    desktopLabel: "DESZCZ CYFR",
    mobileLabel: "CYFRY",
    attribution: {
      credits: [
        {
          role: "Wideo",
          title: "Matrix Rain Codes (4K FULL HD)",
          creator: "Fatih Kalkan",
          sourceUrl: "https://www.youtube.com/watch?v=MUVo20q6tx8",
        },
      ],
      license:
        "Licencja Creative Commons Uznanie autorstwa (dozwolone ponowne wykorzystanie)",
    },
  },
  seven_letters: {
    desktopLabel: "SIEDMIOLITEROWE SŁOWA",
    mobileLabel: "SŁOWA",
  },
  snowfall: { desktopLabel: "OPADY ŚNIEGU", mobileLabel: "ŚNIEG" },
  letter_pile: { desktopLabel: "STOS LITER", mobileLabel: "STOS" },
  letter_rain: { desktopLabel: "DESZCZ LITER", mobileLabel: "LITERY" },
  duck_parade: { desktopLabel: "PARADA KACZEK", mobileLabel: "KACZKI" },
  mouse_eating: {
    desktopLabel: "MYSZ JE M&M",
    mobileLabel: "MYSZ",
    attribution: {
      credits: [
        {
          role: "Wideo",
          title:
            "Mouse eating M&M's with peaceful music for 10 minutes. (He will keep you company and be your friend)",
          creator: "June Hargadon",
          sourceUrl: "https://www.youtube.com/watch?v=bBRgYIvaL00",
        },
        {
          role: "Animacja",
          title: "Creature Comforts",
          creator: "Aardman Animations",
        },
        {
          role: "Muzyka",
          title: "New Home (Slowed)",
          creator: "Austin Farwell",
        },
      ],
      license: "Nieznana",
    },
  },
  emoji_rain: { desktopLabel: "DESZCZ EMOJI", mobileLabel: "EMOJI" },
  fireworks: { desktopLabel: "FAJERWERKI", mobileLabel: "FAJERWERKI" },
  liquid_ripple: { desktopLabel: "FALE NA WODZIE", mobileLabel: "FALE" },
  spinning_seal: {
    desktopLabel: "WIRUJĄCA FOKA",
    mobileLabel: "FOKA",
    attribution: {
      credits: [
        {
          role: "Wideo",
          title: "there is no need to be upset",
          creator: "High Valley",
          sourceUrl: "https://www.youtube.com/watch?v=GJDNkVDGM_s&t=14s",
        },
        {
          role: "Muzyka",
          title: "Happy H. Christmas",
          creator: "Maniacs of Noise",
        },
      ],
      license: "Licencja Creative Commons Uznanie autorstwa (CC BY)",
    },
  },
};
