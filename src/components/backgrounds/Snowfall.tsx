import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Snowflake from "../../assets/icons/snowflake.svg?react";

const SKY_COLOR = "#122341";
const SNOW_COLOR = "#f5f9ff";

const FLAKE_DENSITY = 55;
const FLAKE_DENSITY_REF = 1920 * 1080;
const FLAKE_SIZE_MIN = 14;
const FLAKE_SIZE_MAX = 40;
const FALL_DURATION_MIN = 8;
const FALL_DURATION_MAX = 22;
const SWAY_AMPLITUDE_MIN = 3;
const SWAY_AMPLITUDE_MAX = 10;
const ROTATION_DURATION_MIN = 6;
const ROTATION_DURATION_MAX = 20;
const FLAKE_OPACITY_MIN = 0.5;
const FLAKE_OPACITY_MAX = 1;

const BUMP_COUNT = 8;
const BUMP_BASE_Y = 8;
const BUMP_HEIGHT_VARIANCE = 7;
const SNOW_HEIGHT_TRANSITION_MS = 9500;
const SNOW_HEIGHT_TRANSITION_EASING = "ease";
const MAX_SNOW_HEIGHT_PERCENT = 95;

interface Flake {
  id: number;
  x: number;
  size: number;
  fallDuration: number;
  fallDelay: number;
  swayAmplitude: number;
  swayDuration: number;
  rotationDuration: number;
  rotationDirection: 1 | -1;
  opacity: number;
}

const buildFlakes = (): Flake[] => {
  const count = Math.max(
    1,
    Math.round(
      FLAKE_DENSITY *
        ((window.innerWidth * window.innerHeight) / FLAKE_DENSITY_REF)
    )
  );
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: FLAKE_SIZE_MIN + Math.random() * (FLAKE_SIZE_MAX - FLAKE_SIZE_MIN),
    fallDuration:
      FALL_DURATION_MIN +
      Math.random() * (FALL_DURATION_MAX - FALL_DURATION_MIN),
    fallDelay: Math.random() * FALL_DURATION_MAX,
    swayAmplitude:
      SWAY_AMPLITUDE_MIN +
      Math.random() * (SWAY_AMPLITUDE_MAX - SWAY_AMPLITUDE_MIN),
    swayDuration: 3 + Math.random() * 4,
    rotationDuration:
      ROTATION_DURATION_MIN +
      Math.random() * (ROTATION_DURATION_MAX - ROTATION_DURATION_MIN),
    rotationDirection: Math.random() < 0.5 ? 1 : -1,
    opacity:
      FLAKE_OPACITY_MIN +
      Math.random() * (FLAKE_OPACITY_MAX - FLAKE_OPACITY_MIN),
  }));
};

const FlakeItem = ({ flake }: { flake: Flake }) => (
  <motion.div
    style={{
      position: "absolute",
      left: `${flake.x}%`,
      top: -flake.size,
      width: flake.size,
      height: flake.size,
    }}
    animate={{ y: ["0vh", "110vh"] }}
    transition={{
      duration: flake.fallDuration,
      delay: flake.fallDelay,
      repeat: Infinity,
      ease: "linear",
    }}
  >
    <motion.div
      style={{ width: "100%", height: "100%", opacity: flake.opacity }}
      animate={{
        x: [-flake.swayAmplitude, flake.swayAmplitude, -flake.swayAmplitude],
        rotate: flake.rotationDirection === 1 ? [0, 360] : [360, 0],
      }}
      transition={{
        x: {
          duration: flake.swayDuration,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: flake.rotationDuration,
          repeat: Infinity,
          ease: "linear",
        },
      }}
    >
      <Snowflake style={{ width: "100%", height: "100%" }} />
    </motion.div>
  </motion.div>
);

const buildWavePath = (): string => {
  const points = Array.from({ length: BUMP_COUNT + 1 }, (_, i) => ({
    x: (i * 100) / BUMP_COUNT,
    y: BUMP_BASE_Y + (Math.random() * 2 - 1) * BUMP_HEIGHT_VARIANCE,
  }));

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    d += ` Q ${points[i].x} ${points[i].y} ${xc} ${yc}`;
  }
  const last = points[points.length - 1];
  const secondLast = points[points.length - 2];
  d += ` Q ${secondLast.x} ${secondLast.y} ${last.x} ${last.y}`;
  d += ` L 100 100 L 0 100 Z`;
  return d;
};

interface SnowfallProps {
  guessesUsed: number;
  maxGuesses: number;
}

export const Snowfall = ({ guessesUsed, maxGuesses }: SnowfallProps) => {
  const [flakes, setFlakes] = useState<Flake[]>(() => buildFlakes());
  const [wavePath, setWavePath] = useState<string>(() => buildWavePath());
  const wasEmptyRef = useRef(true);

  useEffect(() => {
    const onResize = () => setFlakes(buildFlakes());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const fillRatio =
    maxGuesses > 0 ? Math.min(1, Math.max(0, guessesUsed / maxGuesses)) : 0;
  const revealPercent = fillRatio * MAX_SNOW_HEIGHT_PERCENT;
  const isEmpty = revealPercent <= 0;

  useEffect(() => {
    wasEmptyRef.current = isEmpty;
  }, [isEmpty]);

  const handleTransitionEnd = (
    event: React.TransitionEvent<HTMLDivElement>
  ) => {
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== "transform") return;
    if (isEmpty && !wasEmptyRef.current) {
      setWavePath(buildWavePath());
    }
  };

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ background: SKY_COLOR, zIndex: 0 }}
    >
      {flakes.map((flake) => (
        <FlakeItem key={flake.id} flake={flake} />
      ))}
      <div
        onTransitionEnd={handleTransitionEnd}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "100%",
          transform: `translateY(${100 - revealPercent}%)`,
          transition: `transform ${SNOW_HEIGHT_TRANSITION_MS}ms ${SNOW_HEIGHT_TRANSITION_EASING}`,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%", display: "block" }}
        >
          <path d={wavePath} fill={SNOW_COLOR} />
        </svg>
      </div>
    </div>
  );
};
