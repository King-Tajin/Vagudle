import { Suspense } from "react";
import { CloudSavePromptModal } from "../../lazyComponents";
import type { PromptChoice, SyncPrompt } from "../../lib/cloudSave/engine";

type Props = {
  prompt: SyncPrompt;
  onChoose: (choice: PromptChoice) => void;
};

export const CloudSavePromptOverlay = ({ prompt, onChoose }: Props) => (
  <Suspense fallback={null}>
    <CloudSavePromptModal prompt={prompt} onChoose={onChoose} />
  </Suspense>
);
