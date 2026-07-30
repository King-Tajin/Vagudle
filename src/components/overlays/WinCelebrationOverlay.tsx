import { Suspense } from "react";
import { WinCelebration } from "../../lazyComponents";

type Props = {
  solution: string;
  onDone: () => void;
};

export const WinCelebrationOverlay = ({ solution, onDone }: Props) => (
  <Suspense fallback={null}>
    <WinCelebration word={solution} onDone={onDone} />
  </Suspense>
);
