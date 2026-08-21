import { type ChallengeDict } from "../../../lib/challenge";
import { useChallengeCreator } from "./useChallengeCreator";
import { LoadingView } from "./views/LoadingView";
import { ResultView } from "./views/ResultView";
import { FormView } from "./views/FormView";

type Props = {
  autoFilledWord?: string;
  autoFilledDict?: ChallengeDict;
  autoFilledGuesses?: 9 | 11;
  onBack?: () => void;
};

export const ChallengeCreatorModal = ({
  autoFilledWord,
  autoFilledDict,
  autoFilledGuesses,
  onBack,
}: Props = {}) => {
  const {
    dict,
    guesses,
    wordInput,
    wordStatus,
    dictHints,
    cleanInput,
    generated,
    generateStatus,
    copied,
    shared,
    handleDictChange,
    handleInput,
    handleBlur,
    handleKeyDown,
    handleGuessesChange,
    generate,
    copyLink,
    handleShare,
    handleEdit,
  } = useChallengeCreator({
    autoFilledWord,
    autoFilledDict,
    autoFilledGuesses,
  });

  if (generateStatus === "loading" && autoFilledWord && !generated) {
    return <LoadingView onBack={onBack} />;
  }

  if (generated) {
    return (
      <ResultView
        generated={generated}
        dict={dict}
        guesses={guesses}
        copied={copied}
        shared={shared}
        onBack={onBack}
        onCopy={() => void copyLink()}
        onShare={() => void handleShare()}
        onEdit={handleEdit}
      />
    );
  }

  return (
    <FormView
      onBack={onBack}
      hasAutoFilledWord={Boolean(autoFilledWord)}
      generateStatus={generateStatus}
      dict={dict}
      wordInput={wordInput}
      wordStatus={wordStatus}
      dictHints={dictHints}
      cleanInput={cleanInput}
      guesses={guesses}
      onDictChange={handleDictChange}
      onInput={handleInput}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onGuessesChange={handleGuessesChange}
      onGenerate={() => void generate()}
    />
  );
};
