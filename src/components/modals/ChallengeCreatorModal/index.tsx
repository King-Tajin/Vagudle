import { useEffect, useState } from "react";
import { type ChallengeDict } from "../../../lib/challenge";
import { useChallengeCreator } from "./useChallengeCreator";
import { LoadingView } from "./views/LoadingView";
import { ResultView } from "./views/ResultView";
import { FormView } from "./views/FormView";
import { AiGuideView } from "./views/AiGuideView";

type Props = {
  autoFilledWord?: string;
  autoFilledDict?: ChallengeDict;
  autoFilledGuesses?: 9 | 11;
  onBack?: () => void;
  onAiGuideChange?: (open: boolean) => void;
};

export const ChallengeCreatorModal = ({
  autoFilledWord,
  autoFilledDict,
  autoFilledGuesses,
  onBack,
  onAiGuideChange,
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
  const [showAiGuide, setShowAiGuide] = useState(false);

  useEffect(() => {
    return () => onAiGuideChange?.(false);
  }, [onAiGuideChange]);

  const toggleAiGuide = (open: boolean) => {
    setShowAiGuide(open);
    onAiGuideChange?.(open);
  };

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

  if (showAiGuide) {
    return <AiGuideView onBack={() => toggleAiGuide(false)} />;
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
      onOpenAiGuide={() => toggleAiGuide(true)}
    />
  );
};
