// noinspection JSUnusedGlobalSymbols, SpellCheckingInspection

export const GAME_TITLE = "VAGUDLE";

export const ACHIEVEMENT_REVEAL_UNLOCKED_TEXT = "Conquista desbloqueada!";
export const WIN_CELEBRATION_TITLE_TEXT = "VOCÊ VENCEU!";
export const LOADING_WORDS_TEXT = "CARREGANDO PALAVRAS...";
export const PLAY_NORMAL_GAME_BUTTON_TEXT = () => `JOGAR ${GAME_TITLE} NORMAL`;
export const TRY_AGAIN_BUTTON_TEXT = "TENTAR NOVAMENTE";

export const WIN_MESSAGES = ["Ótimo trabalho!", "Incrível", "Mandou bem!"];
export const GAME_COPIED_MESSAGE = "Jogo copiado para a área de transferência";
export const DISCORD_ACCOUNT_LINKED_MESSAGE = "Conta do Discord vinculada!";
export const NOT_ENOUGH_LETTERS_MESSAGE = "Letras insuficientes";
export const WORD_NOT_FOUND_MESSAGE = "Palavra não encontrada";
export const CORRECT_WORD_MESSAGE = (solution: string) =>
  `A palavra era ${solution}`;
export const ENTER_TEXT = "Enter";
export const DELETE_TEXT = "Apagar";
export const STATISTICS_TITLE = "Estatísticas";
export const GUESS_DISTRIBUTION_TEXT = "Distribuição de palpites";
export const TOTAL_TRIES_TEXT = "Total de tentativas";
export const SUCCESS_RATE_TEXT = "Taxa de sucesso";
export const CURRENT_STREAK_TEXT = "Sequência atual";
export const BEST_STREAK_TEXT = "Melhor sequência";
export const DAYS_PLAYED_TEXT = "Dias jogados";
export const LAST_COMPLETED_TEXT = "Último concluído";
export const DISCOURAGE_INAPP_BROWSER_TEXT =
  "Você está usando um navegador incorporado e pode ter problemas ao compartilhar ou salvar seus resultados. Recomendamos que você use o navegador padrão do seu dispositivo.";
export const CHALLENGE_WIN_MESSAGES = [
  "Desafio conquistado!",
  "Desafio concluído.",
  "Mestre do desafio!",
];

export const MODAL_TITLE_SETTINGS = "Configurações";
export const MODAL_TITLE_ACHIEVEMENTS = "Conquistas";
export const MODAL_TITLE_VIDEO_ATTRIBUTION = "Créditos do vídeo";
export const MODAL_TITLE_CLOUD_SAVE_FOUND = "Save na nuvem encontrado";
export const MODAL_TITLE_DAILY_SCHEDULE = "Programação do Diário";
export const MODAL_TITLE_DAILY_LEADERBOARD = "Ranking diário";
export const MODAL_TITLE_RESET_ALL_DATA = "Redefinir todos os dados";
export const MODAL_TITLE_CREATE_CHALLENGE = "Criar desafio";
export const MODAL_TITLE_OFFLINE_MODE = "Você está offline";
export const MODAL_TITLE_WEBGL_UNAVAILABLE = "Gráficos não suportados";

export const OFFLINE_MODE_INTRO_TEXT =
  "Não conseguimos acessar os servidores do Vagudle. Você ainda pode jogar o jogo básico offline.";
export const OFFLINE_MODE_AVAILABLE_HEADING = "AINDA DISPONÍVEL";
export const OFFLINE_MODE_AVAILABLE_ITEMS = [
  "Jogos ilimitados nos modos normal e difícil",
  "Configurações de tamanho da palavra e de jogabilidade",
  "Planos de fundo e efeitos sonoros",
  "Estatísticas e conquistas locais",
];
export const OFFLINE_MODE_UNAVAILABLE_HEADING = "PODE NÃO FUNCIONAR";
export const OFFLINE_MODE_UNAVAILABLE_ITEMS = [
  "Modo Diário e o ranking diário",
  "Duelos e links de desafio",
  "Save na nuvem e login na conta",
];
export const OFFLINE_MODE_DISMISS_BUTTON_TEXT = "JOGAR OFFLINE";
export const OFFLINE_MODE_CHECK_AGAIN_BUTTON_TEXT = "VERIFICAR NOVAMENTE";
export const OFFLINE_MODE_CHECKING_BUTTON_TEXT = "VERIFICANDO...";
export const OFFLINE_MODE_STILL_OFFLINE_TEXT =
  "Ainda não conseguimos acessar os servidores do Vagudle. Tente novamente em instantes.";
export const OFFLINE_MODE_CONNECTED_TEXT =
  "Você está online e conectado aos servidores do Vagudle. Tudo pronto para jogar!";
export const OFFLINE_MODE_CONTINUE_BUTTON_TEXT = "CONTINUAR";

export const WEBGL_UNAVAILABLE_BODY_TEXT = (backgroundLabel: string) =>
  `${backgroundLabel} precisa de WebGL, que seu navegador ou dispositivo não suporta. Tente atualizar os drivers gráficos, trocar de navegador ou escolher outro plano de fundo.`;
export const WEBGL_UNAVAILABLE_DISMISS_BUTTON_TEXT = "OK";
export const WEBGL_UNAVAILABLE_DEFAULT_BACKGROUND_LABEL = "Este plano de fundo";

export const SETTINGS_HARD_MODE_LABEL = "Modo Difícil";
export const SETTINGS_HARD_MODE_DESCRIPTION =
  "Apenas 9 tentativas para adivinhar a palavra incomum em inglês.";
export const SETTINGS_SHOW_GRAY_COUNT_LABEL = "Mostrar contagem de cinzas";
export const SETTINGS_SHOW_GRAY_COUNT_DESCRIPTION =
  "Mostra o número de letras cinza (ausentes) ao lado de cada palpite.";
export const SETTINGS_AUTO_GRAY_LABEL = "Cinza automático";
export const SETTINGS_AUTO_GRAY_DESCRIPTION =
  "Linhas totalmente cinza deixam automaticamente em cinza as letras correspondentes em todos os lugares. Os quadrados pintados automaticamente ficam protegidos e permanecem após as redefinições.";
export const SETTINGS_AUTO_GREEN_LABEL = "Verde automático";
export const SETTINGS_AUTO_GREEN_DESCRIPTION =
  "Pintar um quadrado de verde pinta de verde a mesma letra naquela coluna. Alterar um quadrado verde remove esses verdes automáticos.";
export const SETTINGS_EXTRA_EFFECTS_LABEL = "Sons e animações extras";
export const SETTINGS_EXTRA_EFFECTS_DESCRIPTION =
  "Ativa ou desativa os fogos de artifício da vitória, o trombone da derrota, a revelação do baú de conquistas e o áudio dos vídeos de plano de fundo.";
export const SETTINGS_BACKGROUND_LABEL = "PLANO DE FUNDO";
export const SETTINGS_BACKGROUND_DESCRIPTION_FREE =
  "Escolha o estilo do seu plano de fundo. Todos os planos de fundo estão disponíveis neste modo.";
export const SETTINGS_BACKGROUND_DESCRIPTION_LOCKED =
  "Escolha o estilo do seu plano de fundo. Novos são desbloqueados por meio de conquistas.";

export const SETTINGS_LANGUAGE_LABEL = "Idioma";
export const SETTINGS_LANGUAGE_DESCRIPTION =
  "Escolha o idioma usado nos menus e nos textos. As listas de palavras continuam em inglês.";
export const SETTINGS_LANGUAGE_ARIA_LABEL = "Selecionar idioma";
export const SETTINGS_LANGUAGE_SAVING_TEXT = "Salvando...";

export const SETTINGS_NOTIFICATIONS_DAILY_STREAK_LABEL =
  "Alerta de perda de sequência";
export const SETTINGS_NOTIFICATIONS_DAILY_STREAK_DESCRIPTION =
  "Receba um aviso antes de a sua sequência ser zerada, caso você ainda não tenha jogado a palavra do dia de hoje.";
export const SETTINGS_NOTIFICATIONS_STREAK_HOURS_SUFFIX =
  "horas antes de zerar";
export const SETTINGS_NOTIFICATIONS_CUSTOM_TIME_LABEL =
  "Horário personalizado do lembrete";
export const SETTINGS_NOTIFICATIONS_CUSTOM_TIME_DESCRIPTION =
  "Escolha um horário específico todos os dias para receber um lembrete para jogar.";
export const SETTINGS_NOTIFICATIONS_INACTIVITY_LABEL =
  "Lembrete de inatividade";
export const SETTINGS_NOTIFICATIONS_INACTIVITY_DESCRIPTION =
  "Receba um empurrãozinho se você ficar um tempo sem jogar.";
export const SETTINGS_NOTIFICATIONS_INACTIVITY_DAYS_SUFFIX =
  "dias de inatividade";
export const SETTINGS_NOTIFICATIONS_REMINDER_HOUR_ARIA_LABEL =
  "Hora do lembrete";
export const SETTINGS_NOTIFICATIONS_REMINDER_MINUTE_ARIA_LABEL =
  "Minuto do lembrete";
export const SETTINGS_NOTIFICATIONS_REMINDER_PERIOD_ARIA_LABEL =
  "AM ou PM do lembrete";
export const SETTINGS_NOTIFICATIONS_DECREASE_DAYS_LABEL = "Diminuir dias";
export const SETTINGS_NOTIFICATIONS_INCREASE_DAYS_LABEL = "Aumentar dias";
export const SETTINGS_NOTIFICATIONS_DECREASE_HOURS_LABEL = "Diminuir horas";
export const SETTINGS_NOTIFICATIONS_INCREASE_HOURS_LABEL = "Aumentar horas";

export const SETTINGS_HAPTICS_LABEL = "Vibração";
export const SETTINGS_HAPTICS_DESCRIPTION =
  "Sinta uma vibração em vitórias, derrotas, conquistas desbloqueadas e palavras inválidas.";

export const NAVBAR_LEAVE_DUEL_LABEL = "Sair do duelo";
export const NAVBAR_LEAVE_CHALLENGE_LABEL = "Sair do desafio";
export const NAVBAR_LEAVE_DAILY_LABEL = "Sair do Diário";
export const NAVBAR_NEW_GAME_LABEL = "Novo jogo";
export const NAVBAR_LEAVE_DUEL_TITLE = "SAIR DO DUELO?";
export const NAVBAR_LEAVE_DUEL_DESCRIPTION =
  "O seu progresso neste duelo fica salvo por 24 horas. Você pode voltar a este link quando quiser.";
export const NAVBAR_LEAVE_DAILY_TITLE = "SAIR DO DIÁRIO?";
export const NAVBAR_LEAVE_DAILY_DESCRIPTION =
  "O seu progresso na palavra do dia de hoje está salvo. Você só tem uma tentativa, então volte e termine antes da redefinição.";
export const NAVBAR_LEAVE_CHALLENGE_TITLE = "SAIR DO DESAFIO?";
export const NAVBAR_LEAVE_CHALLENGE_DESCRIPTION =
  "O seu progresso neste desafio está salvo. Você pode voltar a este link quando quiser.";
export const NAVBAR_ABANDON_GAME_TITLE = "ABANDONAR O JOGO?";
export const NAVBAR_ABANDON_GAME_DESCRIPTION =
  "Isso contará como uma derrota e zerará a sua sequência atual.";
export const NAVBAR_ABANDON_BUTTON_TEXT = "ABANDONAR";
export const NAVBAR_LEAVE_BUTTON_TEXT = "SAIR";
export const NAVBAR_KEEP_PLAYING_BUTTON_TEXT = "CONTINUAR JOGANDO";

export const BANNER_LABEL_CUSTOM_CHALLENGE = "DESAFIO PERSONALIZADO";
export const BANNER_LABEL_DUEL = "DUELO";
export const BANNER_LABEL_DAILY_PREFIX = "DIÁRIO #";
export const BANNER_DIFFICULTY_HARD_TEXT = "Difícil";
export const BANNER_DIFFICULTY_NORMAL_TEXT = "Normal";
export const BANNER_DAILY_ATTEMPT_TEXT = "1 tentativa/dia";
export const BANNER_DUEL_WINDOW_TEXT = "24h";
export const BANNER_DICTIONARY_TEXT = (dictLabel: string) =>
  `Dicionário ${dictLabel}`;

export const ERROR_INVALID_CHALLENGE_TITLE = "LINK DE DESAFIO INVÁLIDO";
export const ERROR_INVALID_CHALLENGE_DESCRIPTION =
  "Este link de desafio está quebrado ou foi adulterado. Peça a quem enviou para compartilhá-lo novamente.";
export const ERROR_INVALID_DUEL_TITLE = "LINK DE DUELO INVÁLIDO";
export const ERROR_INVALID_DUEL_DESCRIPTION =
  "Este link de duelo está quebrado ou foi adulterado. Peça um novo link.";
export const ERROR_DUEL_EXPIRED_TITLE = "DUELO EXPIRADO";
export const ERROR_DUEL_EXPIRED_DESCRIPTION =
  "Este link de duelo expirou. Os links de duelo são válidos por apenas 24 horas. Peça para criarem um novo duelo.";
export const ERROR_ACTIVITY_DUEL_EXPIRED_DESCRIPTION =
  "Este duelo expirou. Os duelos da Atividade são válidos por apenas 24 horas. Peça para enviarem um novo duelo no Discord.";
export const ERROR_WRONG_ACCOUNT_TITLE = "CONTA ERRADA";
export const ERROR_WRONG_ACCOUNT_DESCRIPTION =
  "Este duelo não foi enviado para a sua conta do Discord. Verifique se você está conectado com o usuário certo.";
export const ERROR_HAVE_YOU_PLAYED_TITLE = "VOCÊ JÁ JOGOU ANTES?";
export const ERROR_LINK_ACCOUNT_DESCRIPTION =
  "Vincule a sua conta existente do Vagudle para manter as suas estatísticas ou comece uma nova só para o Discord.";
export const ERROR_LINK_EXISTING_BUTTON_TEXT = "JÁ JOGUEI ANTES";
export const ERROR_START_FRESH_BUTTON_TEXT = "COMEÇAR DO ZERO";
export const ERROR_LINKING_IN_PROGRESS_DESCRIPTION =
  "Conclua o login na página que acabou de abrir e volte aqui — isso será detectado automaticamente.";
export const ERROR_LINKING_FAILED_DESCRIPTION =
  "Não foi possível iniciar a vinculação agora. Tente novamente em instantes.";
export const ERROR_ALREADY_PLAYED_TITLE = "VOCÊ JÁ JOGOU HOJE";
export const ERROR_ALREADY_PLAYED_WEB_DESCRIPTION =
  "Você já jogou a palavra do dia de hoje no site.";
export const ERROR_ALREADY_PLAYED_DEFAULT_DESCRIPTION =
  "Você já jogou a palavra do dia de hoje.";
export const ERROR_SOMETHING_WRONG_TITLE = "ALGO DEU ERRADO";
export const ERROR_SOMETHING_WRONG_HINT =
  "Se isso continuar acontecendo, verifique o console do navegador para ver os detalhes.";
export const ACTIVITY_ERROR_MESSAGES: Record<
  "daily" | "daily_link" | "duel" | "duel_word",
  string
> = {
  daily:
    "Não foi possível carregar a palavra do dia de hoje. Tente entrar novamente na atividade pelo Discord.",
  daily_link:
    "Não foi possível vincular a sua conta. Tente entrar novamente na atividade pelo Discord.",
  duel: "Não foi possível carregar o seu duelo. Tente entrar novamente na atividade pelo Discord.",
  duel_word:
    "Não foi possível carregar a palavra deste duelo. Tente entrar novamente na atividade pelo Discord.",
};

export const CLOSE_BUTTON_LABEL = "Fechar";

export const INFO_MODAL_TITLE = "INFORMAÇÕES";
export const INFO_TAB_HOWTO_LABEL = "COMO JOGAR";
export const INFO_TAB_FEATURES_LABEL = "RECURSOS";
export const INFO_TAB_CHALLENGES_LABEL = "DESAFIOS";
export const INFO_TAB_ABOUT_LABEL = "SOBRE";
export const INFO_TAB_OPENSOURCE_LABEL = "CÓDIGO";
export const INFO_TAB_FEEDBACK_LABEL = "FEEDBACK";
export const INFO_MODAL_FOOTER_TOS_LABEL = "TERMOS";
export const INFO_MODAL_FOOTER_PRIVACY_LABEL = "POLÍTICA DE PRIVACIDADE";

export const ABOUT_INTRO_TEXT_BEFORE_LINK =
  "Vagudle é um jogo de adivinhação de palavras inspirado no";
export const ABOUT_INTRO_TEXT_AFTER_LINK =
  ", com ferramentas extras para ajudar você a resolver o quebra-cabeça e sem aquele limite diário chato para atrapalhar.";
export const ABOUT_DISCORD_TEXT_BEFORE_LINK = "O";
export const ABOUT_DISCORD_LINK_TEXT = "servidor do Discord";
export const ABOUT_DISCORD_TEXT_AFTER_LINK =
  "tem um recurso exclusivo de Duelo, no qual você pode desafiar outros membros frente a frente e competir em um ranking ao vivo para ver quem descobre a palavra com menos palpites.";
export const ABOUT_FAVICON_ALT = "Favicon do Vagudle";
export const ABOUT_ICON_ALT = "Ícone do Vagudle";
export const ABOUT_RESET_BUTTON_TITLE =
  "Apaga todo o progresso salvo, as estatísticas, as conquistas e as configurações.";
export const ABOUT_RESET_BUTTON_TEXT = "REDEFINIR TODOS OS DADOS";
export const ABOUT_RESTORE_ATTRIBUTIONS_TITLE =
  "Ocultou o botão de créditos de um plano de fundo em vídeo? Traga-o de volta aqui.";
export const ABOUT_RESTORE_ATTRIBUTIONS_TEXT = "RESTAURAR CRÉDITOS";
export const ABOUT_ATTRIBUTIONS_VISIBLE_TEXT = "CRÉDITOS VISÍVEIS";
export const ABOUT_STORE_BUTTON_TEXT = "VISITAR A LOJA";

export const CHALLENGES_IN_GAME_HEADING = "NO JOGO";
export const CHALLENGES_STEP1_TEXT_PART1 = "Abra as";
export const CHALLENGES_SETTINGS_LABEL = "Configurações";
export const CHALLENGES_STEP1_TEXT_PART2 = "e vá até a aba";
export const CHALLENGES_CHALLENGE_TAB_LABEL = "Desafio";
export const CHALLENGES_STEP1_TEXT_PART3 =
  "para começar. Escolha um dicionário, defina quantos palpites permitir, digite a sua palavra secreta e clique em Gerar link. Compartilhe o link para que outras pessoas joguem a sua palavra personalizada exatamente com as configurações que você escolheu.";
export const CHALLENGES_RESULTS_NOTE_TEXT =
  "Os resultados nunca contam para as estatísticas de quem recebe o desafio, e o progresso fica salvo no link para que a pessoa possa voltar a ele quando quiser.";
export const CHALLENGES_VIA_DISCORD_HEADING = "PELO DISCORD";
export const CHALLENGES_DISCORD_TEXT_PART1 = "No";
export const CHALLENGES_DISCORD_LINK_TEXT = "servidor do Discord King-Tajin";
export const CHALLENGES_DISCORD_TEXT_PART2 = ", use o comando";
export const CHALLENGES_DISCORD_TEXT_PART3 =
  "para gerar um link de desafio diretamente pelo Discord.";

export const HOWTO_INTRO_TEXT_PART1 = "Digite uma palavra e pressione";
export const HOWTO_INTRO_TEXT_PART2 =
  "para enviar um palpite. Você tem 11 tentativas para encontrar a palavra escondida.";
export const HOWTO_PAINT_HEADING = "PINTE O RESULTADO";
export const HOWTO_PAINT_DESCRIPTION =
  "Os quadrados não são coloridos automaticamente. Selecione um pincel e depois clique ou arraste sobre os quadrados para marcar o que você consegue deduzir com as poucas pistas que tem.";
export const HOWTO_GREEN_DESCRIPTION = "Letra certa, lugar certo";
export const HOWTO_YELLOW_DESCRIPTION = "Letra certa, lugar errado";
export const HOWTO_GRAY_DESCRIPTION = "Letra não está na palavra";
export const HOWTO_ROW_TOOLS_HEADING = "FERRAMENTAS DA LINHA";
export const HOWTO_CLEAR_ROW_DESCRIPTION =
  "Limpa as cores pintadas dessa linha";
export const HOWTO_BADGE_COUNT_DESCRIPTION =
  "Contagem de letras corretas, presentes e ausentes por linha";
export const HOWTO_KEYBOARD_HEADING = "TECLADO";
export const HOWTO_KEYBOARD_DESCRIPTION =
  "As cores do teclado refletem as letras que você pintou no tabuleiro, então as letras confirmadas, presentes e eliminadas ficam sempre visíveis num relance.";

export const FEEDBACK_VALIDATION_ERROR_MESSAGE =
  "Preencha todos os campos obrigatórios.";
export const FEEDBACK_SUBMIT_ERROR_MESSAGE =
  "Falha ao enviar o feedback. Tente novamente.";
export const FEEDBACK_SUCCESS_TITLE = "FEEDBACK RECEBIDO!";
export const FEEDBACK_SUCCESS_MESSAGE =
  "Obrigado por ajudar a melhorar o Vagudle.";
export const FEEDBACK_SEND_ANOTHER_BUTTON_TEXT = "ENVIAR OUTRO";
export const FEEDBACK_TYPE_LABEL = "TIPO DE FEEDBACK *";
export const FEEDBACK_POSITIVE_LABEL = "Positivo";
export const FEEDBACK_NEGATIVE_LABEL = "Negativo";
export const FEEDBACK_CATEGORY_LABEL = "CATEGORIA *";
export const FEEDBACK_CATEGORY_PLACEHOLDER = "Selecione uma categoria...";
export const FEEDBACK_CATEGORY_BUG_REPORT = "Relatório de bug";
export const FEEDBACK_CATEGORY_FEATURE_REQUEST = "Sugestão de recurso";
export const FEEDBACK_CATEGORY_GENERAL = "Feedback geral";
export const FEEDBACK_EMAIL_LABEL = "E-MAIL (OPCIONAL)";
export const FEEDBACK_EMAIL_HINT = "Somente se você quiser uma resposta";
export const FEEDBACK_MESSAGE_LABEL = "SEU FEEDBACK *";
export const FEEDBACK_MESSAGE_FULLSCREEN_LABEL = "SEU FEEDBACK";
export const FEEDBACK_MESSAGE_PLACEHOLDER = "Conte o que você está pensando...";
export const FEEDBACK_CHARACTERS_LEFT_TEXT = (remaining: number) =>
  `${remaining.toLocaleString()} caracteres restantes`;
export const FEEDBACK_EXPAND_LABEL = "Expandir";
export const FEEDBACK_COLLAPSE_LABEL = "Recolher";
export const FEEDBACK_SENDING_BUTTON_TEXT = "ENVIANDO...";
export const FEEDBACK_SEND_BUTTON_TEXT = "ENVIAR FEEDBACK";

export const OPEN_SOURCE_INTRO_TEXT_MIDDLE = "é de código aberto e baseado no";
export const OPEN_SOURCE_INTRO_TEXT_END =
  ". Contribuições e feedback são bem-vindos.";
export const OPEN_SOURCE_MADE_BY_TEXT = "Feito por";
export const OPEN_SOURCE_STATS_CARD_ALT =
  "Estatísticas do repositório do Vagudle no GitHub";

export const FEATURES_LIST: [string, string][] = [
  [
    "Tamanho de palavra variável",
    "Jogue com palavras de 4 a 7 letras nas Configurações.",
  ],
  [
    "Modo difícil",
    "As soluções são escolhidas entre palavras incomuns e o jogador fica limitado a 9 palpites.",
  ],
  [
    "Diário",
    "Uma nova palavra é liberada uma vez por dia, alternando entre 4 e 5 letras e entre os modos normal e difícil. Acompanhe a sua sequência no ranking e assine um lembrete no calendário para nunca perder uma.",
  ],
  [
    "Pintura de quadrados",
    "Selecione um pincel e clique ou arraste sobre os quadrados para colori-los.",
  ],
  [
    "Cinza automático",
    "Deixa em cinza automaticamente as letras de linhas totalmente cinza.",
  ],
  [
    "Verde automático",
    "Preenche automaticamente em todas as linhas as letras corretas marcadas pelo jogador.",
  ],
  ["Contagem de cinzas", "Mostra quantas letras ausentes há em uma linha."],
];

export const PROVIDER_LABEL_DEFAULT = "seu provedor";

export const RESET_DATA_CATEGORIES: { title: string; description: string }[] = [
  {
    title: "Jogo atual",
    description: "Palavra em andamento, palpites e cores dos quadrados.",
  },
  {
    title: "Estatísticas",
    description:
      "Sequência de vitórias, distribuição de vitórias e taxa de sucesso, nos modos normal e difícil.",
  },
  {
    title: "Conquistas",
    description:
      "Todas as conquistas que você desbloqueou e o progresso em direção a elas.",
  },
  {
    title: "Configurações",
    description:
      "Tamanho da palavra, modo difícil, contagem de cinzas, cinza automático, verde automático e sons e animações extras.",
  },
  {
    title: "Plano de fundo",
    description:
      "O tema de plano de fundo selecionado e quaisquer botões de créditos de vídeo ocultos.",
  },
  {
    title: "Links de desafio e duelo",
    description:
      "O progresso salvo de qualquer link de desafio personalizado ou de duelo que você abriu.",
  },
];

export const RESET_DATA_DELETION_STEPS = [
  "Faça login com a conta vinculada aos seus dados do Vagudle (Google, GitHub, e-mail ou Discord).",
  'Pressione "Excluir meus dados" (ou ative "Excluir também minha conta" aqui e confirme).',
  "Confirme e seus dados serão excluídos imediatamente.",
];

export const RESET_DATA_DELETION_DELETED_ITEMS = [
  "O seu login (Google, GitHub, link por e-mail, Discord ou Play Games).",
  "O seu jogo salvo: estatísticas, conquistas, configurações e plano de fundo.",
  "A sua entrada no ranking diário e a sua sequência.",
  "O seu histórico de tentativas diárias.",
  "O seu histórico individual de partidas de duelo, se vinculado ao Discord.",
];

export const RESET_DATA_DELETION_KEPT_TEXT =
  "Se você usou a integração do Vagudle com o Discord, alguns dados vinculados " +
  "ao seu ID do Discord são mantidos permanentemente para preservar o histórico " +
  "de partidas de outros jogadores e os rankings e sequências em grupo do seu " +
  "servidor do Discord: classificações agregadas de vitórias e derrotas em " +
  "duelos e registros de participação em grupo na palavra do dia. Isso não é " +
  "excluído pelas etapas acima, e não há prazo de expiração para esses dados.";

export const RESET_DATA_REAUTH_TEXT_BEFORE_PROVIDER =
  "Por segurança, excluir a sua conta exige um login recente. Autorize a exclusão para entrar novamente com";
export const RESET_DATA_REAUTH_TEXT_AFTER_PROVIDER =
  ", e então a sua conta e todos os dados dela serão excluídos permanentemente.";
export const RESET_DATA_CANCEL_BUTTON_TEXT = "CANCELAR";
export const RESET_DATA_AUTHORIZE_BUTTON_TEXT = "AUTORIZAR EXCLUSÃO";
export const RESET_DATA_WARNING_TEXT =
  "Isso apaga permanentemente tudo o que o Vagudle salvou neste navegador. Não é possível desfazer.";
export const RESET_DATA_ALSO_DELETE_ACCOUNT_LABEL =
  "Excluir também minha conta";
export const RESET_DATA_DETAILS_ARIA_LABEL =
  "O que é excluído e o que é mantido";
export const RESET_DATA_DETAILS_BUTTON_TEXT = "DETALHES";
export const RESET_DATA_ACCOUNT_DESC_BEFORE_PROVIDER =
  "Exclui permanentemente o seu login do";
export const RESET_DATA_ACCOUNT_DESC_AFTER_PROVIDER =
  "no Vagudle e apaga o seu save na nuvem. Isso não pode ser desfeito.";
export const RESET_DATA_NOT_SIGNED_IN_TEXT =
  "Você não está conectado, então não há conta para excluir.";
export const RESET_DATA_WAIT_BUTTON_TEXT = (seconds: number) =>
  `AGUARDE ${seconds}s`;
export const RESET_DATA_DELETING_BUTTON_TEXT = "EXCLUINDO...";
export const RESET_DATA_DELETE_ACCOUNT_AND_DATA_BUTTON_TEXT =
  "EXCLUIR CONTA E DADOS";
export const RESET_DATA_DELETE_EVERYTHING_BUTTON_TEXT = "EXCLUIR TUDO";
export const RESET_DATA_DETAILS_MODAL_TITLE = "DETALHES DA EXCLUSÃO DA CONTA";
export const RESET_DATA_HOW_TO_DELETE_HEADING = "COMO EXCLUIR";
export const RESET_DATA_WHAT_GETS_DELETED_HEADING = "O QUE É EXCLUÍDO";
export const RESET_DATA_WHATS_KEPT_HEADING = "O QUE É MANTIDO";
export const RESET_DATA_CLOSE_BUTTON_TEXT = "FECHAR";

export const DAILY_SCHEDULE_UNLOCK_TEXT_BEFORE_TIME =
  "O novo Diário é liberado às";
export const DAILY_SCHEDULE_UNLOCK_TEXT_AFTER_TIME = "no seu horário";
export const DAILY_SCHEDULE_TODAY_LABEL = "HOJE";
export const DAILY_SCHEDULE_WORD_LENGTH_TEXT = (letters: number) =>
  `${letters} letras`;
export const DAILY_SCHEDULE_HARD_LABEL = "DIFÍCIL";
export const DAILY_SCHEDULE_NORMAL_LABEL = "NORMAL";
export const DAILY_SCHEDULE_ADD_TO_CALENDAR_HEADING = "ADICIONAR AO CALENDÁRIO";
export const DAILY_SCHEDULE_SUBSCRIBE_DESCRIPTION =
  "Assine uma vez e o seu app de calendário verifica a liberação do Diário automaticamente. Escolha a que horas você quer ser lembrado:";
export const DAILY_SCHEDULE_REMINDER_HOUR_ARIA_LABEL = "Hora do lembrete";
export const DAILY_SCHEDULE_SUBSCRIBE_ARIA_LABEL =
  "Assinar o feed de calendário do lembrete diário";
export const DAILY_SCHEDULE_OPENING_BUTTON_TEXT = "ABRINDO...";
export const DAILY_SCHEDULE_SUBSCRIBE_BUTTON_TEXT = "ASSINAR";
export const DAILY_SCHEDULE_COPY_ARIA_LABEL = "Copiar link do calendário";
export const DAILY_SCHEDULE_DOWNLOAD_PROMPT_TEXT =
  "O seu app de calendário não abriu?";
export const DAILY_SCHEDULE_DOWNLOAD_BUTTON_TEXT = "BAIXAR";
export const DAILY_SCHEDULE_DISMISS_BUTTON_TEXT = "DISPENSAR";
export const DAILY_SCHEDULE_FOOTER_NOTE_TEXT =
  'O Apple Calendar e o Outlook podem assinar diretamente pelo botão acima. No Google Agenda, use o botão de copiar e adicione em "Outras agendas → Do URL".';

export const ACHIEVEMENTS_HIDDEN_PLACEHOLDER = "???";
export const ACHIEVEMENTS_PROGRESS_LABEL = "PROGRESSO";
export const ACHIEVEMENTS_UNLOCKS_HIDDEN_TEXT = "DESBLOQUEIA: ???";
export const ACHIEVEMENTS_UNLOCKS_TEXT = (label: string) =>
  `DESBLOQUEIA: ${label}`;
export const ACHIEVEMENTS_PREV_PAGE_LABEL = "Página anterior";
export const ACHIEVEMENTS_NEXT_PAGE_LABEL = "Próxima página";
export const ACHIEVEMENTS_PAGE_INDICATOR_TEXT = (
  current: number,
  total: number
) => `PÁGINA ${current}/${total}`;

export const ACHIEVEMENT_TEXT: Record<
  string,
  { title: string; description: string }
> = {
  first_win: {
    title: "Primeira Vitória",
    description: "Vença o seu primeiro jogo",
  },
  win_15: { title: "Jogador Experiente", description: "Vença 15 jogos" },
  win_50: { title: "Veterano", description: "Vença 50 jogos" },
  on_a_roll: { title: "Embalado", description: "Vença 5 jogos seguidos" },
  unstoppable: {
    title: "Imparável",
    description: "Vença 15 jogos seguidos",
  },
  hard_5plus: {
    title: "Hardcore",
    description: "Vença o Modo Difícil com uma palavra de 5 letras ou mais",
  },
  fifth_guess: {
    title: "Velocista",
    description: "Resolva uma palavra em 5 palpites ou menos",
  },
  seven_letters: {
    title: "Campeão Peso-Pesado",
    description: "Vença um jogo com uma palavra de 7 letras",
  },
  close_but_no_cigar: {
    title: "Na Trave",
    description:
      "Dê 3 palpites diferentes seguidos com apenas uma letra errada",
  },
  process_of_elimination: {
    title: "Processo de Eliminação",
    description:
      "Dê 3 palpites diferentes no mesmo jogo com todas as letras erradas",
  },
  word_connoisseur: {
    title: "Conhecedor de Palavras",
    description: "Dê 200 palpites únicos no modo normal ou difícil",
  },
  quack: {
    title: "Quá!",
    description:
      "Escreva DUCK na vertical em qualquer coluna ao longo de 4 palpites seguidos",
  },
  guess_mouse: {
    title: "Iiik!",
    description: "Digite MOUSE como palpite durante um jogo",
  },
  nail_biter: {
    title: "Roendo as Unhas",
    description: "Vença um jogo no seu último palpite",
  },
  diversify: {
    title: "Diversifique",
    description:
      "Vença com 3 ou mais palpites sem repetir a posição de uma letra em relação aos palpites anteriores (exceto a solução)",
  },
  blind_faith: {
    title: "Fé Cega",
    description:
      "Vença um jogo em que apenas uma posição de letra esteja correta antes do seu palpite vencedor",
  },
  completionist: {
    title: "Completista",
    description: "Desbloqueie todas as outras conquistas",
  },
};

export const NAVBAR_HOW_TO_PLAY_ARIA_LABEL = "Como jogar";
export const NAVBAR_DAILY_WORD_ARIA_LABEL = "Palavra do dia";
export const NAVBAR_DAILY_TITLE = "Diário";
export const NAVBAR_STATISTICS_ARIA_LABEL = "Estatísticas";
export const NAVBAR_SETTINGS_ARIA_LABEL = "Configurações";
export const NAVBAR_NUDGE_HEADING = "PRIMEIRA VEZ AQUI?";
export const NAVBAR_NUDGE_DESCRIPTION =
  "Confira as Configurações para personalizar o tamanho da palavra, as ferramentas de ajuda e muito mais.";
export const NAVBAR_NUDGE_DISMISS_BUTTON_TEXT = "DISPENSAR";

export const DISCLAIMER_BANNER_ARIA_LABEL = "Aviso de afiliação";
export const DISCLAIMER_BANNER_LABEL = "AVISO";
export const DISCLAIMER_BANNER_TEXT_PART1 =
  '"King-Tajin" é apenas o gamertag pessoal do desenvolvedor. Este site e seu criador';
export const DISCLAIMER_BANNER_TEXT_PART2 =
  "não são afiliados, patrocinados nem endossados pela Industrias Tajín, S.A. de C.V.";
export const DISCLAIMER_BANNER_DISMISS_ARIA_LABEL = "Dispensar aviso";
export const DISCLAIMER_BANNER_DISMISS_BUTTON_TEXT = "ENTENDI";

export const ATTRIBUTION_BUTTON_ARIA_LABEL =
  "Créditos do vídeo de plano de fundo";

export const VIDEO_BACKGROUND_DOWNLOADING_TEXT = "BAIXANDO PLANO DE FUNDO";
export const VIDEO_BACKGROUND_SIZE_TEXT = (megabytes: string) =>
  `${megabytes} MB`;
export const VIDEO_BACKGROUND_PROGRESS_TEXT = (
  received: string,
  total: string
) => `${received} MB / ${total} MB`;

export const LEADERBOARD_LOADING_TEXT = "Carregando ranking...";
export const LEADERBOARD_ERROR_TEXT =
  "Não foi possível carregar o ranking. Tente novamente mais tarde.";
export const LEADERBOARD_SIGN_IN_PROMPT_TEXT =
  "Entre para salvar o seu nome e aparecer no ranking.";
export const LEADERBOARD_GO_TO_SETTINGS_BUTTON_TEXT = "IR PARA CONFIGURAÇÕES";
export const LEADERBOARD_CHANGE_USERNAME_HEADING = "ALTERAR NOME DE USUÁRIO";
export const LEADERBOARD_SET_USERNAME_HEADING =
  "DEFINA UM NOME DE USUÁRIO PARA ENTRAR NO RANKING";
export const LEADERBOARD_USERNAME_PLACEHOLDER = "Seu nome no ranking";
export const LEADERBOARD_USERNAME_ARIA_LABEL = "Nome de usuário do ranking";
export const LEADERBOARD_SAVING_INDICATOR = "...";
export const LEADERBOARD_SAVE_BUTTON_TEXT = "SALVAR";
export const LEADERBOARD_PLAYING_AS_TEXT = "Jogando como";
export const LEADERBOARD_CHANGE_BUTTON_TEXT = "ALTERAR";
export const LEADERBOARD_COOLDOWN_TEXT_BEFORE = "Aguarde";
export const LEADERBOARD_COOLDOWN_TEXT_AFTER =
  "antes de alterar o seu nome de usuário.";
export const LEADERBOARD_EMPTY_TEXT =
  "Nenhum resultado ainda. Seja o primeiro no ranking!";
export const LEADERBOARD_PREV_BUTTON_TEXT = "ANTERIOR";
export const LEADERBOARD_PAGE_INDICATOR_TEXT = (
  page: number,
  totalPages: number
) => `Página ${page} / ${totalPages}`;
export const LEADERBOARD_NEXT_BUTTON_TEXT = "PRÓXIMA";
export const LEADERBOARD_JUMP_TO_MY_PAGE_BUTTON_TEXT = "IR PARA A MINHA PÁGINA";
export const LEADERBOARD_ROW_WINS_LOSSES_LABEL = "V/D";
export const LEADERBOARD_ROW_STREAK_LABEL = "SEQ.";
export const LEADERBOARD_ROW_BEST_LABEL = "MELHOR";
export const LEADERBOARD_HIDE_ZERO_TOGGLE_LABEL =
  "Ocultar contas que ainda não jogaram";

export const ATTRIBUTION_MODAL_BY_PREFIX = "por";
export const ATTRIBUTION_MODAL_LICENSE_PREFIX = "Licença:";
export const ATTRIBUTION_MODAL_HIDE_HEADING =
  "OCULTAR CRÉDITOS DESTE PLANO DE FUNDO";
export const ATTRIBUTION_MODAL_VIEW_SOURCE_ARIA_LABEL = (title: string) =>
  `Ver a fonte de ${title}`;
export const ATTRIBUTION_MODAL_HIDE_TOGGLE_ARIA_LABEL =
  "Ocultar créditos deste plano de fundo";

export const ACHIEVEMENT_TRAY_ARIA_LABEL = "Conquistas";
export const ACHIEVEMENT_TRAY_HIDE_ARIA_LABEL = "Ocultar bandeja de conquistas";
export const ACHIEVEMENT_TRAY_SHOW_ARIA_LABEL = "Mostrar bandeja de conquistas";

export const ACHIEVEMENT_VIEW_UNLOCKED_TITLE = "Conquista desbloqueada";
export const ACHIEVEMENT_VIEW_UNLOCKED_TITLE_WITH_COUNT = (
  current: number,
  total: number
) => `Conquista desbloqueada (${current}/${total})`;
export const ACHIEVEMENT_VIEW_BACKGROUND_UNLOCKED_TEXT = (label: string) =>
  `PLANO DE FUNDO DESBLOQUEADO: ${label}`;
export const ACHIEVEMENT_VIEW_SHARE_BUTTON_TEXT = "COMPARTILHAR";
export const ACHIEVEMENT_VIEW_EQUIP_BUTTON_TEXT = "EQUIPAR";
export const ACHIEVEMENT_VIEW_EQUIPPED_BUTTON_TEXT = "EQUIPADO";
export const ACHIEVEMENT_VIEW_NEXT_BUTTON_TEXT = "PRÓXIMA";
export const ACHIEVEMENT_VIEW_CONTINUE_BUTTON_TEXT = "CONTINUAR";

export const NORMAL_STATS_NO_GAMES_YET_TEXT = "NENHUM JOGO AINDA";
export const NORMAL_STATS_EMPTY_DAILY_TEXT =
  "Jogue a palavra do dia de hoje para ver as estatísticas aqui.";
export const NORMAL_STATS_EMPTY_HARD_TEXT =
  "Jogue uma partida no Modo Difícil para ver as estatísticas aqui.";
export const NORMAL_STATS_EMPTY_DEFAULT_TEXT =
  "Jogue uma partida para ver as estatísticas aqui.";
export const NORMAL_STATS_TAB_NORMAL_LABEL = "NORMAL";
export const NORMAL_STATS_TAB_HARD_LABEL = "DIFÍCIL";
export const NORMAL_STATS_TAB_DAILY_LABEL = "DIÁRIO";
export const NORMAL_STATS_GAMES_WON_TEXT = (games: number) =>
  `${games} ${games === 1 ? "VITÓRIA" : "VITÓRIAS"}`;
export const NORMAL_STATS_WORD_LABEL = "Palavra:";
export const NORMAL_STATS_SHARE_STATS_BUTTON_TEXT = "COMPARTILHAR ESTATÍSTICAS";
export const NORMAL_STATS_NEW_GAME_BUTTON_TEXT = "NOVO JOGO";
export const NORMAL_STATS_SHARE_GAME_BUTTON_TEXT = "COMPARTILHAR JOGO";
export const NORMAL_STATS_CHALLENGE_OTHERS_BUTTON_TEXT =
  "DESAFIAR OUTRAS PESSOAS COM ESTA PALAVRA";

export const BACKGROUND_TRAY_ARIA_LABEL = "Planos de fundo";
export const BACKGROUND_TRAY_HIDE_ARIA_LABEL =
  "Ocultar bandeja de planos de fundo";
export const BACKGROUND_TRAY_SHOW_ARIA_LABEL =
  "Mostrar bandeja de planos de fundo";

export const LINK_DISCORD_INVALID_LINK_TEXT =
  "Este link está ausente ou é inválido. Volte ao Discord e tente vincular a sua conta novamente.";
export const LINK_DISCORD_LINKED_TEXT =
  "A sua conta foi vinculada. Você pode fechar esta aba e voltar ao Discord, ou retornar ao Vagudle abaixo.";
export const LINK_DISCORD_RETURN_BUTTON_TEXT = "VOLTAR AO VAGUDLE";
export const LINK_DISCORD_LINKING_TEXT = "Vinculando a sua conta...";
export const LINK_DISCORD_TRY_AGAIN_BUTTON_TEXT = "TENTAR NOVAMENTE";
export const LINK_DISCORD_SIGNED_IN_TEXT_BEFORE = "Conectado como";
export const LINK_DISCORD_SIGNED_IN_TEXT_AFTER = ". Concluindo a vinculação...";
export const LINK_DISCORD_FALLBACK_ACCOUNT_TEXT = "sua conta";
export const LINK_DISCORD_SIGN_IN_PROMPT_TEXT =
  "Entre com a sua conta existente do Vagudle para vinculá-la ao Discord.";
export const LINK_DISCORD_NO_ACCOUNT_ERROR_TEXT =
  "Nenhuma conta encontrada. Crie primeiro uma conta do Vagudle e depois volte para vinculá-la ao Discord.";
export const LINK_DISCORD_CONTINUE_GOOGLE_BUTTON_TEXT =
  "CONTINUAR COM O GOOGLE";
export const LINK_DISCORD_CONTINUE_GITHUB_BUTTON_TEXT =
  "CONTINUAR COM O GITHUB";
export const LINK_DISCORD_EMAIL_LABEL = "E-MAIL";
export const LINK_DISCORD_SEND_LINK_BUTTON_TEXT = "ENVIAR LINK DE LOGIN";
export const LINK_DISCORD_EMAIL_SENT_TEXT =
  "Verifique o seu e-mail para encontrar um link de login e abra-o neste mesmo navegador.";
export const LINK_DISCORD_HEADING = "VINCULAR A SUA CONTA";

export const COMPLETED_ROW_RESET_ARIA_LABEL = "Redefinir as cores da linha";

export const GRID_BRUSH_ARIA_LABEL = (status: string) => `Pincel: ${status}`;
export const CELL_STATUS_EMPTY_LABEL = "Vazio";
export const CELL_STATUS_WORDS: Record<
  "correct" | "present" | "absent",
  string
> = {
  correct: "correta",
  present: "presente",
  absent: "ausente",
};
export const CELL_STATUS_DESCRIPTION_TEXT = (
  letter: string,
  statusWord: string
) => `${letter}, ${statusWord}`;
export const GRID_RESET_ALL_ARIA_LABEL = "Redefinir todas as cores";
export const GRID_RESET_CONFIRM_TITLE = "REDEFINIR TODAS AS CORES?";
export const GRID_RESET_CONFIRM_TEXT_WITH_AUTOGRAY =
  "Isso vai limpar todos os quadrados pintados. Os quadrados em cinza automático permanecerão.";
export const GRID_RESET_CONFIRM_TEXT =
  "Isso vai limpar todos os quadrados pintados.";
export const GRID_RESET_BUTTON_TEXT = "REDEFINIR";
export const GRID_GUESS_HISTORY_ARIA_LABEL =
  "Histórico de palpites. Clique e arraste sobre um quadrado para pintá-lo de outra cor.";

export const DAILY_MODAL_PLAY_INTRO_TEXT =
  "Todo mundo recebe a mesma palavra hoje. Você tem uma única tentativa, então faça valer.";
export const DAILY_MODAL_WORD_LENGTH_LABEL = "TAMANHO DA PALAVRA";
export const DAILY_MODAL_DIFFICULTY_LABEL = "DIFICULDADE";
export const DAILY_MODAL_CURRENT_STREAK_LABEL = "SEQUÊNCIA ATUAL";
export const DAILY_MODAL_STREAK_DAYS_TEXT = (days: number) =>
  `${days} ${days === 1 ? "dia" : "dias"}`;
export const DAILY_MODAL_ALREADY_PLAYING_TEXT =
  "Você já está jogando a palavra de hoje. Saia para voltar ao jogo normal ou feche esta janela para continuar adivinhando.";
export const DAILY_MODAL_LOCKOUT_WARNING_TEXT =
  "⚠ Depois de terminar, você fica bloqueado até a próxima redefinição. ⚠";
export const DAILY_MODAL_LEAVE_BUTTON_TEXT = "SAIR DO DIÁRIO";
export const DAILY_MODAL_PLAY_BUTTON_TEXT = "JOGAR A PALAVRA DE HOJE";
export const DAILY_MODAL_SOLVED_TEXT = (
  guessCount: number,
  maxGuesses: number
) => `RESOLVIDO EM ${guessCount}/${maxGuesses}`;
export const DAILY_MODAL_NOT_SOLVED_TEXT = "NÃO RESOLVIDO HOJE";
export const DAILY_MODAL_VIEW_GAME_BUTTON_TEXT = "VER JOGO";
export const DAILY_MODAL_COME_BACK_TEXT =
  "Volte depois da redefinição para uma nova palavra.";
export const DAILY_MODAL_STREAK_LABEL = "SEQUÊNCIA";
export const DAILY_MODAL_BEST_LABEL = "MELHOR";
export const DAILY_MODAL_PLAYED_LABEL = "JOGOS";
export const DAILY_MODAL_NEXT_DAILY_TEXT = (countdown: string) =>
  `Próximo Diário em ${countdown}`;
export const DAILY_MODAL_SHARE_BUTTON_TEXT = "COMPARTILHAR RESULTADO";
export const RETURN_TO_NORMAL_GAME_BUTTON_TEXT = "VOLTAR AO JOGO NORMAL";
export const DAILY_MODAL_HEADING_COMPLETE = "DIÁRIO CONCLUÍDO";
export const DAILY_MODAL_HEADING_DEFAULT = "DIÁRIO";
export const DAILY_MODAL_SCHEDULE_ARIA_LABEL = "Programação do Diário";
export const DAILY_MODAL_LOADING_TEXT = "Carregando a palavra de hoje...";
export const DAILY_MODAL_ERROR_TEXT =
  "A palavra do dia de hoje ainda não está disponível. Volte em breve.";
export const DAILY_MODAL_VIEW_LEADERBOARD_BUTTON_TEXT = "VER RANKING";

export const WEEKDAY_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];
export const DAILY_CALENDAR_ON_TIME_SUFFIX = "(no horário)";

export const LINK_PLAYGAMES_INVALID_LINK_TEXT =
  "Este link está ausente ou é inválido. Volte ao app e tente vincular a sua conta novamente.";
export const LINK_PLAYGAMES_LINKED_TEXT =
  "A sua conta foi vinculada. Você pode fechar esta aba e voltar ao app.";
export const LINK_PLAYGAMES_SIGN_IN_PROMPT_TEXT =
  "Entre com a sua conta existente do Vagudle para vinculá-la ao Play Games.";
export const LINK_PLAYGAMES_CONTINUE_DISCORD_BUTTON_TEXT =
  "CONTINUAR COM O DISCORD";

export const CHALLENGE_FORM_AUTO_GENERATE_ERROR_TEXT =
  "Não foi possível gerar o link automaticamente. Edite as configurações abaixo ou tente novamente.";
export const CHALLENGE_FORM_NOTE_LABEL = "OBS.:";
export const CHALLENGE_FORM_NOTE_TEXT =
  "O dicionário escolhido tem pouco efeito na jogabilidade. Ele apenas informa ao jogador o quanto a palavra é popular.";
export const CHALLENGE_FORM_DICTIONARY_LABEL = "DICIONÁRIO";
export const CHALLENGE_FORM_WORD_LABEL = "SUA PALAVRA";
export const CHALLENGE_FORM_WORD_PLACEHOLDER =
  "Digite uma palavra (4–7 letras)...";
export const CHALLENGE_FORM_INVALID_LENGTH_TEXT =
  "A palavra precisa ter de 4 a 7 letras.";
export const CHALLENGE_FORM_INVALID_WORD_TEXT = (
  word: string,
  dictLabel: string
) => `"${word}" não está no dicionário ${dictLabel}.`;
export const CHALLENGE_FORM_AVAILABLE_IN_OTHER_DICT_TEXT = (
  dictLabel: string
) =>
  `Porém, ela está disponível no dicionário ${dictLabel}. Troque de dicionário para usá-la.`;
export const CHALLENGE_FORM_VALID_WORD_TEXT = (word: string, length: number) =>
  `"${word}" é válida — ${length} letras.`;
export const CHALLENGE_FORM_EASIER_DICT_HINT_TEXT = (dictLabel: string) =>
  `Dica: esta palavra também aparece no dicionário ${dictLabel}; trocar de dicionário dá ao jogador informações mais precisas sobre a popularidade da palavra.`;
export const CHALLENGE_FORM_MUST_BE_IN_DICT_TEXT = (dictLabel: string) =>
  `Precisa estar no dicionário ${dictLabel}.`;
export const CHALLENGE_FORM_GUESSES_ALLOWED_LABEL = "PALPITES PERMITIDOS";
export const CHALLENGE_FORM_RESULTS_WARNING_TEXT =
  "⚠ Os resultados do desafio não contam para as estatísticas de quem recebe. ⚠";
export const CHALLENGE_FORM_GENERATE_ERROR_TEXT =
  "Falha ao gerar o link. Verifique a sua conexão e tente novamente.";
export const CHALLENGE_FORM_GENERATING_BUTTON_TEXT = "GERANDO...";
export const CHALLENGE_FORM_GENERATE_BUTTON_TEXT = "GERAR LINK";
export const CHALLENGE_FORM_AI_BUTTON_TEXT = "GENERATE INTERACTIVE CHALLENGE";
export const CHALLENGE_FORM_OR_DIVIDER_TEXT = "OR";
export const CHALLENGE_AI_BACK_BUTTON_TEXT = "BACK TO CHALLENGE";
export const CHALLENGE_AI_HEADING = "VIA AI ASSISTANT";
export const CHALLENGE_AI_INTRO_TEXT =
  "Vagudle has a public MCP server, which lets AI assistants like Claude create challenges for you. Tell the AI what kind of challenge you want. It picks a real word, builds the link, and hands it back to play or share.";
export const CHALLENGE_AI_NOTE_TEXT =
  "The word stays hidden inside the link, and results never count toward stats.";
export const CHALLENGE_AI_CONNECT_HEADING = "CONNECT IT ONCE";
export const CHALLENGE_AI_SERVER_URL_LABEL = "SERVER URL";
export const CHALLENGE_AI_CLAUDE_LABEL = "CLAUDE";
export const CHALLENGE_AI_CLAUDE_STEPS_TEXT =
  "Settings → Connectors → Add custom connector → paste the URL.";
export const CHALLENGE_AI_CLAUDE_CODE_LABEL = "CLAUDE CODE";
export const CHALLENGE_AI_OTHER_LABEL = "OTHER ASSISTANTS";
export const CHALLENGE_AI_OTHER_TEXT =
  "Any assistant that supports remote MCP servers can use the same URL.";
export const CHALLENGE_AI_SETUP_GUIDE_LINK_TEXT = "Full setup guide →";
export const CHALLENGE_AI_NO_INSTALL_TEXT =
  "Nothing to install and no account needed.";
export const CHALLENGE_AI_PROMPT_HEADING = "START WITH THIS PROMPT";
export const CHALLENGE_AI_PROMPT_INTRO_TEXT =
  "Turn the Vagudle connector on in the chat first, then paste this. The AI will ask a few questions, then build your challenge.";
export const CHALLENGE_AI_PROMPT_TEXT = `Make me a Vagudle challenge with the Vagudle connector. First ask me, in one message, about: difficulty (Easy, Medium, Hard or Extreme), word length (4 to 7 letters, or surprise me), a theme (mine or a random one), and whether I want hints (none, the theme, the first letter, or a short clue). Then pick a word, create the challenge, and send me the link without revealing the word.

Easy = normal dictionary, 11 guesses. Medium = normal, 9. Hard = hard, 9. Extreme = full, 9.

If you can't find the Vagudle tools, read https://vagudle.king-tajin.dev/docs/mcp.md and tell me how to connect them. Don't invent a link.`;

export const CHALLENGE_CREATOR_BACK_TO_STATS_BUTTON_TEXT =
  "VOLTAR ÀS ESTATÍSTICAS";
export const CHALLENGE_CREATOR_READY_LABEL = "DESAFIO PRONTO";
export const CHALLENGE_CREATOR_LETTERS_TEXT = (letters: number) =>
  `${letters} letras`;
export const CHALLENGE_CREATOR_GUESSES_TEXT = (guesses: number) =>
  `${guesses} palpites`;
export const CHALLENGE_CREATOR_COPIED_BUTTON_TEXT = "COPIADO!";
export const CHALLENGE_CREATOR_COPY_BUTTON_TEXT = "COPIAR";
export const CHALLENGE_CREATOR_SHARED_BUTTON_TEXT = "COMPARTILHADO!";
export const CHALLENGE_CREATOR_SHARE_BUTTON_TEXT = "COMPARTILHAR";
export const CHALLENGE_CREATOR_EDIT_BUTTON_TEXT = "EDITAR";
export const CHALLENGE_CREATOR_GENERATING_LINK_TEXT = "GERANDO LINK...";

export const CLOUD_SAVE_PROVIDER_LABEL_EMAIL = "E-mail";
export const CLOUD_SAVE_PROVIDER_LABEL_PLAYGAMES = "Play Games";
export const CLOUD_SAVE_PROVIDER_LABEL_UNKNOWN = "Desconhecido";
export const CLOUD_SAVE_AUTO_SIGNED_IN_TEXT = "Login automático pelo Discord.";
export const CLOUD_SAVE_WAITING_LINK_TEXT =
  "Aguardando você concluir a vinculação no navegador...";
export const CLOUD_SAVE_OPENING_LINK_BUTTON_TEXT = "ABRINDO LINK...";
export const CLOUD_SAVE_LINK_EXISTING_ACCOUNT_BUTTON_TEXT =
  "VINCULAR CONTA EXISTENTE";
export const CLOUD_SAVE_LINK_START_ERROR_TEXT =
  "Não foi possível iniciar a vinculação. Tente novamente.";
export const CLOUD_SAVE_PLAYGAMES_PROMPT_TEXT =
  "Já tem uma conta do Vagudle? Vincule-a para levar o seu progresso junto.";
export const CLOUD_SAVE_OPENING_BUTTON_TEXT = "ABRINDO...";
export const CLOUD_SAVE_LINK_ACCOUNT_BUTTON_TEXT = "VINCULAR CONTA";
export const CLOUD_SAVE_SKIP_BUTTON_TEXT = "PULAR";
export const CLOUD_SAVE_PLAYGAMES_LINK_ERROR_TEXT =
  "Não foi possível vincular o Play Games. Tente novamente.";
export const CLOUD_SAVE_LINKING_BUTTON_TEXT = "VINCULANDO...";
export const CLOUD_SAVE_LINK_PLAYGAMES_BUTTON_TEXT = "VINCULAR PLAY GAMES";
export const CLOUD_SAVE_ALSO_LINKED_TEXT = (list: string) =>
  `Também vinculado: ${list}`;
export const CLOUD_SAVE_HEADING = "SAVE NA NUVEM";
export const CLOUD_SAVE_IN_PROGRESS_WARNING_TEXT =
  "O save na nuvem não guarda jogos que estão em andamento.";
export const CLOUD_SAVE_PRIVACY_TEXT =
  "Os seus dados nunca são vendidos. Os e-mails são mantidos apenas caso você precise de suporte.";
export const CLOUD_SAVE_CHECKING_STATUS_TEXT =
  "Verificando o status do login...";
export const CLOUD_SAVE_SIGNED_IN_AS_TEXT = "Conectado como";
export const CLOUD_SAVE_ACCOUNT_TYPE_SUFFIX_TEXT = (type: string) =>
  `— conta ${type}`;
export const CLOUD_SAVE_UP_TO_DATE_TEXT = "Atualizado";
export const CLOUD_SAVE_SYNCING_TEXT = "Sincronizando...";
export const CLOUD_SAVE_LAST_SAVED_TEXT = (time: string) =>
  `Último save ${time}`;
export const CLOUD_SAVE_LINK_DISCORD_BUTTON_TEXT = "VINCULAR DISCORD";
export const CLOUD_SAVE_SIGN_OUT_BUTTON_TEXT = "SAIR";
export const CLOUD_SAVE_SIGN_IN_PROMPT_TEXT =
  "Entre para manter as suas estatísticas, conquistas e configurações sincronizadas entre dispositivos.";
export const CLOUD_SAVE_SIGN_IN_BUTTON_TEXT = "ENTRAR";
export const CLOUD_SAVE_CREATE_ACCOUNT_BUTTON_TEXT = "CRIAR CONTA";
export const CLOUD_SAVE_BACK_BUTTON_TEXT = "‹ VOLTAR";
export const CLOUD_SAVE_NOT_REGISTERED_ERROR_TEXT =
  "Nenhuma conta encontrada. Crie uma conta ou escolha outra opção de login.";
export const CLOUD_SAVE_ALREADY_REGISTERED_ERROR_TEXT =
  "Já existe uma conta. Entre nela.";
export const CLOUD_SAVE_AGE_GATE_HEADING = "ANTES DE CONTINUAR";
export const CLOUD_SAVE_AGE_GATE_AGREEMENT_TEXT_PART1 =
  "Confirmo que tenho 13 anos ou mais e concordo com os";
export const CLOUD_SAVE_AGE_GATE_TOS_LINK_TEXT = "Termos de Serviço";
export const CLOUD_SAVE_AGE_GATE_AGREEMENT_TEXT_PART2 = "e a";
export const CLOUD_SAVE_AGE_GATE_PRIVACY_LINK_TEXT = "Política de Privacidade";
export const CLOUD_SAVE_AGE_GATE_AGREEMENT_TEXT_PART3 = ".";
export const CLOUD_SAVE_AGE_GATE_BLOCKED_ERROR_TEXT =
  "Você precisa confirmar que tem 13 anos ou mais e concordar com os Termos de Serviço e a Política de Privacidade para criar uma conta.";
export const CLOUD_SAVE_AGE_GATE_CONTINUE_BUTTON_TEXT = "CONTINUAR";
export const CLOUD_SAVE_DIRECT_SIGNIN_HEADING = "LOGIN DIRETO";
export const CLOUD_SAVE_EMAIL_ARIA_LABEL = "Endereço de e-mail";
export const EMAIL_INVALID_ERROR_TEXT = "Insira um endereço de e-mail válido.";
export const CLOUD_SAVE_SEND_LINK_BUTTON_TEXT = "ENVIAR LINK";
export const CLOUD_SAVE_EMAIL_SENT_TEXT =
  "Verifique o seu e-mail para encontrar um link de login.";
export const CLOUD_SAVE_FLEXIBLE_SIGNIN_HEADING = "LOGIN FLEXÍVEL";
export const CLOUD_SAVE_FLEXIBLE_SIGNIN_DESCRIPTION =
  "Funciona sozinho ou pode ser vinculado a outra conta a qualquer momento por aqui.";
export const CLOUD_SAVE_CONTINUE_PLAYGAMES_BUTTON_TEXT =
  "CONTINUAR COM O PLAY GAMES";

export const CLOUD_SAVE_CONFLICT_DATE_FALLBACK_TEXT = "Desconhecida";
export const CLOUD_SAVE_CONFLICT_UPDATED_TEXT = (date: string) =>
  `Atualizado em ${date}`;
export const CLOUD_SAVE_CONFLICT_ACHIEVEMENTS_UNLOCKED_TEXT = (count: number) =>
  `${count} ${count === 1 ? "conquista desbloqueada" : "conquistas desbloqueadas"}`;
export const CLOUD_SAVE_CONFLICT_NORMAL_WON_TEXT = (
  won: number,
  total: number
) => `Normal: ${won}/${total} vitórias`;
export const CLOUD_SAVE_CONFLICT_HARD_WON_TEXT = (won: number, total: number) =>
  `Difícil: ${won}/${total} vitórias`;
export const CLOUD_SAVE_CONFLICT_DAILY_WON_TEXT = (
  won: number,
  total: number,
  streak: number
) => `Diário: ${won}/${total} vitórias, sequência ${streak}`;
export const CLOUD_SAVE_CONFLICT_INTRO_TEXT =
  "Você tem um save neste dispositivo e um save na nuvem. Escolha qual manter, mas as conquistas serão mescladas de qualquer forma, então você não perde progresso nelas.";
export const CLOUD_SAVE_CONFLICT_THIS_DEVICE_LABEL = "ESTE DISPOSITIVO";
export const CLOUD_SAVE_CONFLICT_CLOUD_SAVE_LABEL = "SAVE NA NUVEM";
export const CLOUD_SAVE_CONFLICT_SYNC_ERROR_TEXT =
  "Não foi possível sincronizar o seu save. Tente novamente.";
export const CLOUD_SAVE_CONFLICT_KEEP_DEVICE_BUTTON_TEXT =
  "MANTER ESTE DISPOSITIVO";
export const CLOUD_SAVE_CONFLICT_KEEP_CLOUD_BUTTON_TEXT =
  "MANTER SAVE NA NUVEM";

export const GENERAL_SETTINGS_DAILY_MODE_ACTIVE_TEXT = "MODO DIÁRIO ATIVO";
export const GENERAL_SETTINGS_CUSTOM_CHALLENGE_ACTIVE_TEXT =
  "DESAFIO PERSONALIZADO ATIVO";
export const CHALLENGE_DICTIONARY_SUFFIX_TEXT = "(dicionário) —";
export const CHALLENGE_GUESSES_ALLOWED_TEXT = (guesses: number) =>
  `${guesses} palpites permitidos`;
export const GENERAL_SETTINGS_DAILY_LOCKED_TEXT =
  "O tamanho da palavra e a dificuldade são definidos pela palavra do dia de hoje e são redefinidos no próximo Diário.";
export const GENERAL_SETTINGS_CHALLENGE_LOCKED_TEXT =
  "O tamanho da palavra e a dificuldade são definidos por este desafio. Volte ao Vagudle normal para alterá-los.";
export const GENERAL_SETTINGS_WORD_LENGTH_HINT_TEXT =
  "Pode ser alterado antes do seu primeiro palpite:";
export const GENERAL_SETTINGS_WORD_LENGTH_ARIA_LABEL = "Tamanho da palavra";
export const SETTINGS_WORD_LENGTH_CHANGE_BLOCKED_ERROR_TEXT =
  "Termine ou comece um novo jogo antes de alterar o tamanho da palavra!";
export const SETTINGS_DIFFICULTY_CHANGE_BLOCKED_ERROR_TEXT =
  "Termine ou comece um novo jogo antes de alterar a dificuldade!";
export const SETTINGS_MODAL_TAB_SETTINGS_LABEL = "CONFIGURAÇÕES";
export const SETTINGS_MODAL_TAB_CHALLENGE_LABEL = "DESAFIO";
export const SETTINGS_PAGE_GAMEPLAY_LABEL = "JOGABILIDADE";
export const SETTINGS_PAGE_ACCOUNT_LABEL = "CONTA";
export const SETTINGS_PAGE_NOTIFICATIONS_LABEL = "NOTIFICAÇÕES";

export const CHALLENGE_RESULT_MODAL_TITLE = "Resultado do desafio";
export const CHALLENGE_RESULT_HEADING = "DESAFIO PERSONALIZADO";
export const CHALLENGE_RESULT_COMPLETE_TEXT = "DESAFIO CONCLUÍDO!";
export const RESULT_SOLVED_TEXT_BEFORE = "Resolvido em";
export const RESULT_SOLVED_TEXT_AFTER = "palpites";
export const CHALLENGE_RESULT_FAILED_TEXT = "DESAFIO FALHOU";
export const CHALLENGE_RESULT_FAILED_DESCRIPTION =
  "Mais sorte da próxima vez! Você sempre pode pedir a resposta a quem enviou o desafio.";
export const RESULT_LEAVE_BUTTON_TEXT = "SAIR";
export const CHALLENGE_RESULT_SHARE_BUTTON_TEXT = "COMPARTILHAR";

export const CHALLENGE_ACCEPT_MODAL_HEADING = "DESAFIO PERSONALIZADO";
export const CHALLENGE_ACCEPT_MODAL_INTRO_TEXT =
  "Alguém enviou um desafio personalizado do Vagudle para você. Veja o que te espera:";
export const CHALLENGE_ACCEPT_MODAL_WORD_LENGTH_LABEL = "TAMANHO DA PALAVRA";
export const CHALLENGE_ACCEPT_MODAL_DICTIONARY_LABEL = "DICIONÁRIO";
export const CHALLENGE_ACCEPT_MODAL_GUESSES_LABEL = "PALPITES";
export const CHALLENGE_ACCEPT_MODAL_LETTERS_TEXT = (letters: number) =>
  `${letters} letras`;
export const CHALLENGE_ACCEPT_MODAL_ATTEMPTS_TEXT = (attempts: number) =>
  `${attempts} tentativas`;
export const CHALLENGE_ACCEPT_MODAL_PROGRESS_SAVED_TEXT =
  "O seu progresso fica salvo neste link. Volte quando quiser para continuar.";
export const CHALLENGE_ACCEPT_MODAL_RESULTS_NOT_COUNTED_TEXT =
  "⚠ Os resultados não contam para as suas estatísticas. ⚠";
export const CHALLENGE_ACCEPT_MODAL_PLAY_BUTTON_TEXT = "JOGAR DESAFIO";

export const DUEL_RESULT_MODAL_TITLE = "Resultado do duelo";
export const DUEL_RESULT_HEADING = "DUELO";
export const DUEL_RESULT_COMPLETE_TEXT = "DUELO CONCLUÍDO!";
export const DUEL_RESULT_FAILED_TEXT = "DUELO FALHOU";
export const DUEL_RESULT_FAILED_DESCRIPTION = "Mais sorte da próxima vez!";

export const DUEL_MODAL_ACCEPT_HEADING = "DUELO";
export const DUEL_MODAL_COMPLETE_HEADING = "DUELO CONCLUÍDO";
export const DUEL_MODAL_CHALLENGED_INTRO_TEXT =
  "Você foi desafiado para um duelo. Veja o que te espera:";
export const DUEL_MODAL_WORD_LENGTH_LABEL = "TAMANHO DA PALAVRA";
export const DUEL_MODAL_LETTERS_TEXT = (letters: number) => `${letters} letras`;
export const DUEL_MODAL_DICTIONARY_LABEL = "DICIONÁRIO";
export const DUEL_MODAL_GUESSES_LABEL = "PALPITES";
export const DUEL_MODAL_ATTEMPTS_TEXT = (attempts: number) =>
  `${attempts} tentativas`;
export const DUEL_MODAL_PROGRESS_SAVED_TEXT =
  "O seu progresso fica salvo por 24 horas. Volte a este link quando quiser para continuar.";
export const DUEL_MODAL_RESULTS_NOT_COUNTED_TEXT =
  "⚠ Os resultados não contam para as suas estatísticas. ⚠";
export const DUEL_MODAL_PLAY_BUTTON_TEXT = "JOGAR DUELO";
export const DUEL_MODAL_RESULT_NOT_RECORDED_TEXT = "RESULTADO NÃO REGISTRADO";
export const DUEL_MODAL_RESULT_RECORDED_TEXT = "SEU RESULTADO FOI REGISTRADO";
export const DUEL_MODAL_SAVING_RESULT_TEXT = "SALVANDO RESULTADO...";
export const DUEL_MODAL_RESULT_NOT_RECORDED_DESCRIPTION =
  "Houve um problema ao salvar o seu resultado. Avise quem organizou o duelo.";
export const DUEL_MODAL_RESULT_RECORDED_DESCRIPTION =
  "O vencedor será anunciado quando os dois jogadores terminarem.";
export const DUEL_MODAL_SAVING_RESULT_DESCRIPTION =
  "Aguarde enquanto o seu resultado é registrado.";
export const DUEL_MODAL_SAVING_RESULTS_TEXT = "Salvando resultados...";
export const DUEL_MODAL_RESULTS_SAVED_TEXT = "Resultados salvos com sucesso.";
export const DUEL_MODAL_SAVE_FAILED_TEXT =
  "Falha ao salvar os resultados após 3 tentativas. O seu resultado não foi registrado.";
export const DUEL_MODAL_PREPARING_SAVE_TEXT =
  "Preparando para salvar os resultados...";

export const CHALLENGE_DICT_LABELS: Record<"normal" | "hard" | "full", string> =
  {
    normal: "Normal",
    hard: "Difícil",
    full: "Extremo",
  };
export const CHALLENGE_DICT_DESCRIPTIONS: Record<
  "normal" | "hard" | "full",
  string
> = {
  normal: "Palavras comuns em inglês",
  hard: "Palavras incomuns em inglês",
  full: "Dicionário completo do Scrabble",
};

export const USERNAME_VALIDATION_ERROR_TEXT =
  "3 a 20 caracteres: letras, números, espaços, - ou _";
export const USERNAME_TAKEN_ERROR_TEXT = "Esse nome de usuário já está em uso.";
export const USERNAME_RATE_LIMITED_ERROR_TEXT = (cooldown: string) =>
  `Você poderá alterar o seu nome novamente em ${cooldown}.`;
export const GENERIC_ERROR_TEXT = "Algo deu errado. Tente novamente.";

export const CLOUD_AUTH_EMAIL_PROMPT_TEXT =
  "Confirme o seu e-mail para concluir o login:";
export const CLOUD_AUTH_GOOGLE_SIGNIN_ERROR_TEXT =
  "Falha no login com o Google. Tente novamente.";
export const CLOUD_AUTH_GITHUB_SIGNIN_ERROR_TEXT =
  "Falha no login com o GitHub. Tente novamente.";
export const CLOUD_AUTH_PLAYGAMES_SIGNIN_ERROR_TEXT =
  "Falha no login com o Play Games. Tente novamente.";
export const CLOUD_AUTH_EMAIL_LINK_ERROR_TEXT =
  "Não foi possível enviar o link de login. Tente novamente.";
export const CLOUD_AUTH_SIGNOUT_ERROR_TEXT = "Falha ao sair. Tente novamente.";
export const CLOUD_AUTH_DELETE_ACCOUNT_ERROR_TEXT =
  "Não foi possível excluir a sua conta. Tente novamente.";
export const CLOUD_AUTH_NO_ACCOUNT_ERROR_TEXT =
  "Nenhuma conta conectada encontrada.";
export const CLOUD_AUTH_REAUTH_UNSUPPORTED_ERROR_TEXT =
  "Este método de login não pode ser reautorizado aqui. Saia, entre novamente e tente excluir a sua conta outra vez.";
export const CLOUD_AUTH_REAUTH_FAILED_ERROR_TEXT =
  "Falha na reautorização. Tente novamente.";

export const CLOUD_SYNC_VERIFY_ERROR_TEXT =
  "Não foi possível verificar o login para a sincronização na nuvem.";
export const CLOUD_SYNC_CREATE_ERROR_TEXT =
  "Não foi possível criar o seu save na nuvem.";
export const CLOUD_SYNC_UNREACHABLE_ERROR_TEXT =
  "Não foi possível acessar o save na nuvem.";
export const CLOUD_SYNC_PUSH_ERROR_TEXT =
  "Não foi possível sincronizar com a nuvem.";

export const PAGE_TITLE_DUEL = "Vagudle - Duelo";
export const PAGE_TITLE_CHALLENGE = "Vagudle - Desafio";
export const PAGE_TITLE_DAILY = "Vagudle - Diário";

export const SHARE_HARD_MODE_TAG = " [DIFÍCIL]";
export const SHARE_NORMAL_MODE_TAG = " [NORMAL]";
export const SHARE_CHALLENGE_HEADER_TEXT = (
  score: number | string,
  maxChallenges: number,
  wordPart: string
) => `${GAME_TITLE} [DESAFIO] — ${score}/${maxChallenges} (${wordPart})`;
export const SHARE_STATUS_HEADER_TEXT = (
  modeTag: string,
  solution: string,
  score: number | string,
  maxChallenges: number,
  wordLength: number
) =>
  `${GAME_TITLE}${modeTag} — ${solution} — ${score}/${maxChallenges} (${wordLength} letras)`;
export const SHARE_STATUS_CHALLENGE_TITLE = () => `${GAME_TITLE} Desafio`;
export const SHARE_STATUS_NORMAL_TITLE = (solution: string) =>
  `${GAME_TITLE} — ${solution}`;
export const SHARE_DAILY_HEADER_TEXT = (
  dailyNumber: number,
  score: number | string,
  maxChallenges: number
) => `${GAME_TITLE} Diário #${dailyNumber} — ${score}/${maxChallenges}`;
export const SHARE_DAILY_TITLE = (dailyNumber: number) =>
  `${GAME_TITLE} Diário #${dailyNumber}`;
export const SHARE_STATS_TITLE = (modeTag: string) =>
  `${GAME_TITLE}${modeTag} Estatísticas`;
export const SHARE_STATS_PLAYED_LABEL = "🎮 Jogos:     ";
export const SHARE_STATS_WIN_RATE_LABEL = "✅ Vitória%:  ";
export const SHARE_STATS_STREAK_LABEL = "🔥 Sequência: ";
export const SHARE_STATS_BEST_LABEL = "🏆 Melhor:    ";
export const SHARE_STATS_GUESS_DISTRIBUTION_LABEL = "Distribuição de palpites:";
export const SHARE_DAILY_STATS_TITLE = () =>
  `${GAME_TITLE} [DIÁRIO] Estatísticas`;
export const SHARE_CHALLENGE_INVITE_INTRO_TEXT =
  "Estou te desafiando para um Vagudle personalizado!";
export const SHARE_CHALLENGE_INVITE_DETAILS_TEXT = (
  length: number,
  dictLabel: string,
  guesses: number
) => `${length} letras · dicionário ${dictLabel} · ${guesses} palpites`;
export const SHARE_CHALLENGE_INVITE_NOTE_TEXT =
  "(Os resultados não afetam as suas estatísticas)";
export const SHARE_CHALLENGE_INVITE_TITLE = "Desafio Vagudle";
export const SHARE_ACHIEVEMENT_UNLOCKED_TEXT = (title: string) =>
  `🏆 Conquista desbloqueada: ${title}`;
export const SHARE_ACHIEVEMENT_BACKGROUND_UNLOCKED_TEXT = (label: string) =>
  `Plano de fundo desbloqueado: ${label}`;
export const SHARE_ACHIEVEMENT_TITLE = "Conquista Vagudle";

export const ACHIEVEMENT_TOAST_BACKGROUND_UNLOCKED_SUFFIX_TEXT = (
  label: string
) => ` — plano de fundo ${label} desbloqueado!`;

export const NOTIFICATION_CHANNEL_NAME = "Lembretes para jogar";
export const NOTIFICATION_CHANNEL_DESCRIPTION =
  "Lembretes para manter a sua sequência viva e voltar a jogar";
export const NOTIFICATION_STREAK_WARNING_TITLE =
  "Sua sequência está prestes a ser zerada!";
export const NOTIFICATION_STREAK_WARNING_BODY =
  "Jogue o Vagudle de hoje antes que seja tarde demais.";
export const NOTIFICATION_CUSTOM_REMINDER_TITLE = "Não perca a sua sequência!";
export const NOTIFICATION_CUSTOM_REMINDER_BODY =
  "O Vagudle de hoje está esperando por você.";
export const NOTIFICATION_INACTIVITY_TITLE = "Faz tempo que você não joga?";
export const NOTIFICATION_INACTIVITY_BODY = "Volte e continue de onde parou.";
export const NOTIFICATION_ACTION_PLAY_NOW = "Jogar agora";
export const NOTIFICATION_ACTION_PLAY_DAILY = "Jogar o Diário";

export const CRASH_BOUNDARY_MESSAGE_TEXT = "Algo deu errado.";
export const CRASH_BOUNDARY_RELOAD_BUTTON_TEXT = "Recarregar";

export const CLOUD_SYNC_LINK_ACCOUNT_ERROR_TEXT =
  "Não foi possível vincular a sua conta.";
export const CLOUD_SYNC_LINK_ACCOUNT_RETRY_ERROR_TEXT =
  "Não foi possível vincular a sua conta. Tente novamente.";
export const CLOUD_SYNC_VERIFY_SIGNIN_ERROR_TEXT =
  "Não foi possível verificar o seu login. Tente novamente.";
export const CLOUD_SYNC_LINK_DISCORD_ERROR_TEXT =
  "Não foi possível vincular a sua conta do Discord.";
export const CLOUD_SYNC_LINK_DISCORD_RETRY_ERROR_TEXT =
  "Não foi possível vincular a sua conta do Discord. Tente novamente.";
export const CLOUD_SYNC_LINK_PLAYGAMES_ERROR_TEXT =
  "Não foi possível vincular a sua conta do Play Games.";
export const CLOUD_SYNC_LINK_PLAYGAMES_RETRY_ERROR_TEXT =
  "Não foi possível vincular a sua conta do Play Games. Tente novamente.";
export const RELATIVE_TIME_JUST_NOW_TEXT = "agora mesmo";
export const LOCALE_TAG = "pt-BR";

export const DAILY_MODE_SIGNIN_WARNING_TEXT = "Entre para salvar no ranking";
export const DAILY_MODE_USERNAME_WARNING_TEXT =
  "Defina um nome de usuário para salvar no ranking";

export const WORD_LISTS_LOAD_ERROR_TEXT =
  "Falha ao carregar as listas de palavras. Atualize a página.";

export const LINK_START_ERROR_SHORT_TEXT =
  "Não foi possível iniciar a vinculação.";
export const PLAYGAMES_NOT_AVAILABLE_ERROR_TEXT =
  "O Play Games não está disponível neste dispositivo.";
export const LINKING_NOT_AVAILABLE_ERROR_TEXT =
  "A vinculação não está disponível neste dispositivo.";

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
  sprinkles: { desktopLabel: "CONFETES VAGUDLE", mobileLabel: "CINZA" },
  flakes: { desktopLabel: "CHUVA DE FLOCOS", mobileLabel: "GRADE" },
  tnt_rain: { desktopLabel: "CHUVA DE TNT", mobileLabel: "TNT" },
  pulsing_purple: { desktopLabel: "ROXO PULSANTE", mobileLabel: "ROXO" },
  carrots: { desktopLabel: "CENOURAS GIRANDO", mobileLabel: "CENOURAS" },
  flying_mudskipper: {
    desktopLabel: "PEIXE-SALTADOR VOADOR",
    mobileLabel: "PEIXE-SALTADOR",
  },
  escalating_fire: { desktopLabel: "FOGO CRESCENTE", mobileLabel: "FOGO" },
  dvd_screensaver: {
    desktopLabel: "PROTETOR DE TELA DE DVD",
    mobileLabel: "DVD",
  },
  number_rain: {
    desktopLabel: "CHUVA DE NÚMEROS",
    mobileLabel: "NÚMEROS",
    attribution: {
      credits: [
        {
          role: "Vídeo",
          title: "Matrix Rain Codes (4K FULL HD)",
          creator: "Fatih Kalkan",
          sourceUrl: "https://www.youtube.com/watch?v=MUVo20q6tx8",
        },
      ],
      license: "Licença Creative Commons Atribuição (reutilização permitida)",
    },
  },
  seven_letters: {
    desktopLabel: "PALAVRAS DE SETE LETRAS",
    mobileLabel: "PALAVRAS",
  },
  snowfall: { desktopLabel: "QUEDA DE NEVE", mobileLabel: "NEVE" },
  letter_pile: { desktopLabel: "PILHA DE LETRAS", mobileLabel: "PILHA" },
  letter_rain: { desktopLabel: "CHUVA DE LETRAS", mobileLabel: "LETRAS" },
  duck_parade: { desktopLabel: "DESFILE DE PATOS", mobileLabel: "PATOS" },
  mouse_eating: {
    desktopLabel: "RATINHO COMENDO M&M",
    mobileLabel: "RATINHO",
    attribution: {
      credits: [
        {
          role: "Vídeo",
          title:
            "Mouse eating M&M's with peaceful music for 10 minutes. (He will keep you company and be your friend)",
          creator: "June Hargadon",
          sourceUrl: "https://www.youtube.com/watch?v=bBRgYIvaL00",
        },
        {
          role: "Animação",
          title: "Creature Comforts",
          creator: "Aardman Animations",
        },
        {
          role: "Música",
          title: "New Home (Slowed)",
          creator: "Austin Farwell",
        },
      ],
      license: "Desconhecida",
    },
  },
  emoji_rain: { desktopLabel: "CHUVA DE EMOJIS", mobileLabel: "EMOJIS" },
  fireworks: { desktopLabel: "FOGOS DE ARTIFÍCIO", mobileLabel: "FOGOS" },
  liquid_ripple: {
    desktopLabel: "ONDULAÇÕES LÍQUIDAS",
    mobileLabel: "ONDAS",
  },
  spinning_seal: {
    desktopLabel: "FOCA GIRANDO",
    mobileLabel: "FOCA",
    attribution: {
      credits: [
        {
          role: "Vídeo",
          title: "there is no need to be upset",
          creator: "High Valley",
          sourceUrl: "https://www.youtube.com/watch?v=GJDNkVDGM_s&t=14s",
        },
        {
          role: "Música",
          title: "Happy H. Christmas",
          creator: "Maniacs of Noise",
        },
      ],
      license: "Creative Commons Atribuição (CC BY)",
    },
  },
};
