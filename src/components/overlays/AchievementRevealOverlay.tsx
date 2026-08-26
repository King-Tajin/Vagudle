import { Suspense } from "react";
import { AchievementReveal } from "../../lazyComponents";

type Props = {
  onDone: () => void;
  hapticsEnabled: boolean;
};

export const AchievementRevealOverlay = ({ onDone, hapticsEnabled }: Props) => (
  <Suspense fallback={null}>
    <AchievementReveal onDone={onDone} hapticsEnabled={hapticsEnabled} />
  </Suspense>
);
