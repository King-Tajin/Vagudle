import React, { Suspense } from "react";
import { BackgroundGrid } from "./BackgroundGrid";
import { VagudleSprinkles } from "./VagudleSprinkles";
import { BACKGROUNDS, type BackgroundId } from "../../lib/backgrounds";
import {
  TajinRain,
  SevenLetterWords,
  VideoBackground,
  SpinningCarrots,
  PulsingPurple,
  LetterRain,
  Snowfall,
  DvdScreensaver,
  FireStreak,
} from "../../lazyComponents";

type Props = {
  backgroundId: BackgroundId;
  isMobile: boolean;
  extraEffects: boolean;
  keyboardRef: React.RefObject<HTMLDivElement>;
  guessesUsed: number;
  maxChallenges: number;
  currentWinStreak: number;
};

export const BackgroundStage = ({
  backgroundId,
  isMobile,
  extraEffects,
  keyboardRef,
  guessesUsed,
  maxChallenges,
  currentWinStreak,
}: Props): JSX.Element | null => {
  const bg = BACKGROUNDS.find((b) => b.id === backgroundId);

  if (bg?.kind === "video" && bg.videoSrc) {
    return (
      <Suspense
        fallback={
          <div
            className="fixed inset-0 pointer-events-none"
            style={{ background: "#0d1322", zIndex: 0 }}
          />
        }
      >
        <VideoBackground
          key={bg.videoSrc}
          src={bg.videoSrc}
          audioEnabled={extraEffects}
          objectPosition={bg.objectPosition}
        />
      </Suspense>
    );
  }

  switch (backgroundId) {
    case "sprinkles":
      return isMobile ? (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ background: "#0d1322", zIndex: 0 }}
        />
      ) : (
        <VagudleSprinkles keyboardRef={keyboardRef} />
      );
    case "tajin":
      return isMobile ? (
        <BackgroundGrid />
      ) : (
        <>
          <BackgroundGrid />
          <Suspense fallback={null}>
            <TajinRain keyboardRef={keyboardRef} />
          </Suspense>
        </>
      );
    case "seven_letters":
      return (
        <Suspense
          fallback={
            <div
              className="fixed inset-0 pointer-events-none"
              style={{ background: "#ffffff", zIndex: 0 }}
            />
          }
        >
          <SevenLetterWords />
        </Suspense>
      );
    case "carrots":
      return (
        <Suspense
          fallback={
            <div
              className="fixed inset-0 pointer-events-none"
              style={{ background: "#2d1508", zIndex: 0 }}
            />
          }
        >
          <SpinningCarrots />
        </Suspense>
      );
    case "pulsing_purple":
      return (
        <Suspense
          fallback={
            <div
              className="fixed inset-0 pointer-events-none"
              style={{ background: "#0d0020", zIndex: 0 }}
            />
          }
        >
          <PulsingPurple />
        </Suspense>
      );
    case "letter_rain":
      return (
        <Suspense
          fallback={
            <div
              className="fixed inset-0 pointer-events-none"
              style={{ background: "#0d1322", zIndex: 0 }}
            />
          }
        >
          <LetterRain />
        </Suspense>
      );
    case "snowfall":
      return (
        <Suspense
          fallback={
            <div
              className="fixed inset-0 pointer-events-none"
              style={{ background: "#122341", zIndex: 0 }}
            />
          }
        >
          <Snowfall guessesUsed={guessesUsed} maxGuesses={maxChallenges} />
        </Suspense>
      );
    case "dvd_screensaver":
      return (
        <Suspense
          fallback={
            <div
              className="fixed inset-0 pointer-events-none"
              style={{ background: "#000000", zIndex: 0 }}
            />
          }
        >
          <DvdScreensaver />
        </Suspense>
      );
    case "escalating_fire":
      return (
        <Suspense
          fallback={
            <div
              className="fixed inset-0 pointer-events-none"
              style={{ background: "#3d0f04", zIndex: 0 }}
            />
          }
        >
          <FireStreak currentStreak={currentWinStreak} />
        </Suspense>
      );
    default:
      return null;
  }
};
