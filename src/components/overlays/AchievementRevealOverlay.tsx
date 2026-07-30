import { Suspense } from "react";
import { AchievementReveal } from "../../lazyComponents";

type Props = {
  onDone: () => void;
};

export const AchievementRevealOverlay = ({ onDone }: Props) => (
  <Suspense fallback={null}>
    <AchievementReveal onDone={onDone} />
  </Suspense>
);
