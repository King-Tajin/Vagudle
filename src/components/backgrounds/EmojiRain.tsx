import { useEffect, useState, useSyncExternalStore } from "react";
import { m } from "framer-motion";
import twemoji from "twemoji";
import emojiByChar from "unicode-emoji-json/data-by-emoji.json";

type EmojiGroup =
  | "Smileys & Emotion"
  | "People & Body"
  | "Animals & Nature"
  | "Food & Drink"
  | "Travel & Places"
  | "Activities"
  | "Objects"
  | "Symbols"
  | "Flags";

const BACKGROUND_COLOR = "#131F11";

const CATEGORY_ENABLED: Record<EmojiGroup, boolean> = {
  "Smileys & Emotion": true,
  "People & Body": true,
  "Animals & Nature": true,
  "Food & Drink": true,
  "Travel & Places": false,
  Activities: true,
  Objects: true,
  Symbols: true,
  Flags: false,
};

const TWEMOJI_VERSION = "v14.0.2";
const TWEMOJI_BASE = `https://cdn.jsdelivr.net/gh/jdecked/twemoji@${TWEMOJI_VERSION}/assets/svg`;

const EMOJI_DENSITY = 25;
const EMOJI_DENSITY_REF = 1920 * 1080;
const MAX_PARTICLES = 50;
const SIZE_MIN = 25;
const SIZE_MAX = 65;
const FALL_DURATION_MIN = 6;
const FALL_DURATION_MAX = 20;
const FALL_DELAY_MAX = FALL_DURATION_MAX;
const SWAY_AMPLITUDE_MIN = 4;
const SWAY_AMPLITUDE_MAX = 14;
const SWAY_DURATION_MIN = 3;
const SWAY_DURATION_MAX = 6;
const ENABLE_ROTATION = false;
const ROTATION_DURATION_MIN = 5;
const ROTATION_DURATION_MAX = 18;
const OPACITY_MIN = 0.85;
const OPACITY_MAX = 1;

const twemojiIconFor = (emoji: string): string | null => {
  let icon: string | null = null;
  twemoji.parse(emoji, {
    callback: (foundIcon) => {
      icon = foundIcon;
      return "";
    },
  });
  return icon;
};

const ICON_POOL: string[] = Object.entries(emojiByChar).reduce<string[]>(
  (pool, [emoji, info]) => {
    if (!CATEGORY_ENABLED[info.group as EmojiGroup]) return pool;
    const icon = twemojiIconFor(emoji);
    if (icon !== null) pool.push(icon);
    return pool;
  },
  []
);

interface EmojiParticle {
  id: number;
  icon: string;
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

const buildParticles = (): EmojiParticle[] => {
  const count = Math.min(
    MAX_PARTICLES,
    Math.max(
      1,
      Math.round(
        EMOJI_DENSITY *
          ((window.innerWidth * window.innerHeight) / EMOJI_DENSITY_REF)
      )
    )
  );
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    icon: ICON_POOL[Math.floor(Math.random() * ICON_POOL.length)],
    x: Math.random() * 100,
    size: SIZE_MIN + Math.random() * (SIZE_MAX - SIZE_MIN),
    fallDuration:
      FALL_DURATION_MIN +
      Math.random() * (FALL_DURATION_MAX - FALL_DURATION_MIN),
    fallDelay: Math.random() * FALL_DELAY_MAX,
    swayAmplitude:
      SWAY_AMPLITUDE_MIN +
      Math.random() * (SWAY_AMPLITUDE_MAX - SWAY_AMPLITUDE_MIN),
    swayDuration:
      SWAY_DURATION_MIN +
      Math.random() * (SWAY_DURATION_MAX - SWAY_DURATION_MIN),
    rotationDuration:
      ROTATION_DURATION_MIN +
      Math.random() * (ROTATION_DURATION_MAX - ROTATION_DURATION_MIN),
    rotationDirection: Math.random() < 0.5 ? 1 : -1,
    opacity: OPACITY_MIN + Math.random() * (OPACITY_MAX - OPACITY_MIN),
  }));
};

const createParticlesStore = () => {
  let snapshot = buildParticles();
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => snapshot,
    subscribe: (onStoreChange: () => void) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    handleResize: () => {
      snapshot = buildParticles();
      listeners.forEach((listener) => listener());
    },
  };
};

const EmojiItem = ({ particle }: { particle: EmojiParticle }) => (
  <m.img
    src={`${TWEMOJI_BASE}/${particle.icon}.svg`}
    alt=""
    decoding="async"
    style={{
      position: "absolute",
      left: `${particle.x}%`,
      top: -particle.size,
      width: particle.size,
      height: particle.size,
      opacity: particle.opacity,
      willChange: "transform",
    }}
    animate={{
      y: ["0vh", "110vh"],
      x: [
        -particle.swayAmplitude,
        particle.swayAmplitude,
        -particle.swayAmplitude,
      ],
      rotate: ENABLE_ROTATION
        ? particle.rotationDirection === 1
          ? [0, 360]
          : [360, 0]
        : 0,
    }}
    transition={{
      y: {
        duration: particle.fallDuration,
        delay: particle.fallDelay,
        repeat: Infinity,
        ease: "linear",
      },
      x: {
        duration: particle.swayDuration,
        repeat: Infinity,
        ease: "easeInOut",
      },
      rotate: {
        duration: particle.rotationDuration,
        repeat: Infinity,
        ease: "linear",
      },
    }}
  />
);

export const EmojiRain = () => {
  const [particlesStore] = useState(() => createParticlesStore());
  const particles = useSyncExternalStore(
    particlesStore.subscribe,
    particlesStore.getSnapshot
  );

  useEffect(() => {
    window.addEventListener("resize", particlesStore.handleResize);
    return () =>
      window.removeEventListener("resize", particlesStore.handleResize);
  }, [particlesStore]);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ background: BACKGROUND_COLOR, zIndex: 0 }}
    >
      {particles.map((particle) => (
        <EmojiItem key={particle.id} particle={particle} />
      ))}
    </div>
  );
};
