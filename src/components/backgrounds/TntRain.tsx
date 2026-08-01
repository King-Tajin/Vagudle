import React, {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import { m, animate, useMotionValue } from "framer-motion";
import { drawGravelTexture } from "../../lib/pixelTextures";
import { attachDebouncedResize } from "../../lib/animationLoop";

const TNT_IMAGE_SRC = "/images/tnt/tnt.png";
const EXPLOSION_SOUND_COUNT = 4;
const EXPLOSION_SOUND_SRCS = Array.from(
  { length: EXPLOSION_SOUND_COUNT },
  (_, i) => `/sounds/tnt/explosion${i + 1}.ogg`
);
const EXPLOSION_VOLUME = 0.12;

const TNT_SIZE_MIN = 32;
const TNT_SIZE_MAX = 52;
const FALL_DURATION_MIN = 2.5;
const FALL_DURATION_MAX = 4;
const FUSE_DURATION_MIN = 0.85;
const FUSE_DURATION_MAX = 2.1;
const SWAY_AMPLITUDE_MIN = 10;
const SWAY_AMPLITUDE_MAX = 30;
const SWAY_DURATION_MIN = 1.1;
const SWAY_DURATION_MAX = 2.2;

const EXPLOSION_FRAME_COUNT = 16;
const GENERIC_FRAME_COUNT = 8;
const EXPLOSION_FRAMES = Array.from(
  { length: EXPLOSION_FRAME_COUNT },
  (_, i) => `/images/tnt/explosion_${i}.png`
);
const GENERIC_FRAMES = Array.from(
  { length: GENERIC_FRAME_COUNT },
  (_, i) => `/images/tnt/generic_${i}.png`
);

const EXPLOSION_COUNT_MIN = 2;
const EXPLOSION_COUNT_MAX = 4;
const EXPLOSION_SIZE_MIN = 60;
const EXPLOSION_SIZE_MAX = 100;
const EXPLOSION_SPREAD_MIN = 0;
const EXPLOSION_SPREAD_MAX = 14;
const EXPLOSION_SPEED_MS = 35;

const WHITE_DUST_COUNT_MIN = 4;
const WHITE_DUST_COUNT_MAX = 8;
const WHITE_DUST_SIZE_MIN = 20;
const WHITE_DUST_SIZE_MAX = 32;
const WHITE_DUST_SPREAD_MIN = 10;
const WHITE_DUST_SPREAD_MAX = 60;
const WHITE_DUST_SPEED_MS = 55;

const GRAY_DUST_COUNT_MIN = 5;
const GRAY_DUST_COUNT_MAX = 10;
const GRAY_DUST_SIZE_MIN = 20;
const GRAY_DUST_SIZE_MAX = 32;
const GRAY_DUST_SPREAD_MIN = 20;
const GRAY_DUST_SPREAD_MAX = 90;
const GRAY_DUST_SPEED_MS = 55;

const GRAY_DUST_FILTER = "brightness(0.25) contrast(1.25)";

const PARTICLE_FADE_DURATION_MS = 250;
const PARTICLE_DRIFT_MIN = 10;
const PARTICLE_DRIFT_MAX = 22;
const PARTICLE_DRIFT_DURATION_S = 3.75;

const EXPLOSION_LIFETIME_MS =
  Math.max(
    EXPLOSION_SPEED_MS * EXPLOSION_FRAME_COUNT,
    WHITE_DUST_SPEED_MS * GENERIC_FRAME_COUNT,
    GRAY_DUST_SPEED_MS * GENERIC_FRAME_COUNT
  ) +
  PARTICLE_FADE_DURATION_MS +
  150;

type FallingTnt = {
  id: number;
  x: number;
  size: number;
  fallDuration: number;
  fallDistance: number;
  fuseDuration: number;
  swayAmplitude: number;
  swayDuration: number;
  spinDuration: number;
  spinDirection: 1 | -1;
};

type SpriteParticleData = {
  id: number;
  dx: number;
  dy: number;
  size: number;
  driftY: number;
};

type Explosion = {
  id: number;
  x: number;
  y: number;
  explosionSprites: SpriteParticleData[];
  whiteDustSprites: SpriteParticleData[];
  grayDustSprites: SpriteParticleData[];
};

let uidCounter = 0;
const nextId = () => uidCounter++;

const playExplosionSound = () => {
  try {
    const src =
      EXPLOSION_SOUND_SRCS[
        Math.floor(Math.random() * EXPLOSION_SOUND_SRCS.length)
      ];
    const audio = new Audio(src);
    audio.volume = EXPLOSION_VOLUME;
    void audio.play().catch(() => {});
  } catch {}
};

const buildSpriteGroup = (
  countMin: number,
  countMax: number,
  sizeMin: number,
  sizeMax: number,
  spreadMin: number,
  spreadMax: number
): SpriteParticleData[] => {
  const count = Math.round(countMin + Math.random() * (countMax - countMin));
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const spread = spreadMin + Math.random() * (spreadMax - spreadMin);
    return {
      id: nextId(),
      dx: Math.cos(angle) * spread,
      dy: Math.sin(angle) * spread,
      size: sizeMin + Math.random() * (sizeMax - sizeMin),
      driftY:
        PARTICLE_DRIFT_MIN +
        Math.random() * (PARTICLE_DRIFT_MAX - PARTICLE_DRIFT_MIN),
    };
  });
};

const buildExplosionData = (): Pick<
  Explosion,
  "explosionSprites" | "whiteDustSprites" | "grayDustSprites"
> => ({
  explosionSprites: buildSpriteGroup(
    EXPLOSION_COUNT_MIN,
    EXPLOSION_COUNT_MAX,
    EXPLOSION_SIZE_MIN,
    EXPLOSION_SIZE_MAX,
    EXPLOSION_SPREAD_MIN,
    EXPLOSION_SPREAD_MAX
  ),
  whiteDustSprites: buildSpriteGroup(
    WHITE_DUST_COUNT_MIN,
    WHITE_DUST_COUNT_MAX,
    WHITE_DUST_SIZE_MIN,
    WHITE_DUST_SIZE_MAX,
    WHITE_DUST_SPREAD_MIN,
    WHITE_DUST_SPREAD_MAX
  ),
  grayDustSprites: buildSpriteGroup(
    GRAY_DUST_COUNT_MIN,
    GRAY_DUST_COUNT_MAX,
    GRAY_DUST_SIZE_MIN,
    GRAY_DUST_SIZE_MAX,
    GRAY_DUST_SPREAD_MIN,
    GRAY_DUST_SPREAD_MAX
  ),
});

function SpriteParticle({
  frames,
  frameDurationMs,
  x,
  y,
  size,
  driftY,
  filter,
}: {
  frames: string[];
  frameDurationMs: number;
  x: number;
  y: number;
  size: number;
  driftY: number;
  filter?: string;
}) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (frameIndex >= frames.length - 1) {
      setFinished(true);
      return;
    }
    const timer = setTimeout(
      () => setFrameIndex((i) => i + 1),
      frameDurationMs
    );
    return () => clearTimeout(timer);
  }, [frameIndex, frames.length, frameDurationMs]);

  return (
    <m.img
      src={frames[frameIndex]}
      alt=""
      decoding="async"
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: finished ? 0 : 1, y: driftY }}
      transition={{
        opacity: { duration: PARTICLE_FADE_DURATION_MS / 1000, ease: "easeIn" },
        y: { duration: PARTICLE_DRIFT_DURATION_S, ease: "easeIn" },
      }}
      style={{
        position: "absolute",
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        imageRendering: "pixelated",
        filter,
        pointerEvents: "none",
      }}
    />
  );
}

function FallingTntItem({
  tnt,
  onExplode,
}: {
  tnt: FallingTnt;
  onExplode: (id: number, x: number, y: number) => void;
}) {
  const y = useMotionValue(-tnt.size);

  useEffect(() => {
    const controls = animate(y, tnt.fallDistance, {
      duration: tnt.fallDuration,
      ease: "linear",
    });
    const fuseTimer = setTimeout(() => {
      onExplode(tnt.id, tnt.x + tnt.size / 2, y.get() + tnt.size / 2);
    }, tnt.fuseDuration * 1000);
    return () => {
      controls.stop();
      clearTimeout(fuseTimer);
    };
  }, []);

  return (
    <m.div
      style={{
        position: "absolute",
        left: tnt.x,
        top: 0,
        width: tnt.size,
        height: tnt.size,
        y,
      }}
    >
      <m.img
        src={TNT_IMAGE_SRC}
        alt=""
        decoding="async"
        animate={{
          x: [-tnt.swayAmplitude, tnt.swayAmplitude, -tnt.swayAmplitude],
          rotate: tnt.spinDirection === 1 ? [0, 360] : [360, 0],
        }}
        transition={{
          x: {
            duration: tnt.swayDuration,
            repeat: Infinity,
            ease: "easeInOut",
          },
          rotate: {
            duration: tnt.spinDuration,
            repeat: Infinity,
            ease: "linear",
          },
        }}
        style={{
          width: "100%",
          height: "100%",
          imageRendering: "pixelated",
        }}
      />
    </m.div>
  );
}

export function TntRain({
  keyboardRef,
}: {
  keyboardRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [tnts, setTnts] = useState<FallingTnt[]>([]);
  const [explosions, setExplosions] = useState<Explosion[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const explosionTimers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawGravelTexture(canvas);
    };

    return attachDebouncedResize(resize);
  }, []);

  const spawnTnt = useCallback(() => {
    const size = TNT_SIZE_MIN + Math.random() * (TNT_SIZE_MAX - TNT_SIZE_MIN);
    setTnts((prev) => [
      ...prev,
      {
        id: nextId(),
        x: Math.random() * Math.max(window.innerWidth - size, 0),
        size,
        fallDuration:
          FALL_DURATION_MIN +
          Math.random() * (FALL_DURATION_MAX - FALL_DURATION_MIN),
        fallDistance: window.innerHeight + size,
        fuseDuration:
          FUSE_DURATION_MIN +
          Math.random() * (FUSE_DURATION_MAX - FUSE_DURATION_MIN),
        swayAmplitude:
          SWAY_AMPLITUDE_MIN +
          Math.random() * (SWAY_AMPLITUDE_MAX - SWAY_AMPLITUDE_MIN),
        swayDuration:
          SWAY_DURATION_MIN +
          Math.random() * (SWAY_DURATION_MAX - SWAY_DURATION_MIN),
        spinDuration: 1.2 + Math.random() * 1.6,
        spinDirection: Math.random() < 0.5 ? 1 : -1,
      },
    ]);
  }, []);

  const handleExplode = useCallback((tntId: number, x: number, y: number) => {
    setTnts((prev) => prev.filter((t) => t.id !== tntId));

    const explosionId = nextId();
    setExplosions((prev) => [
      ...prev,
      { id: explosionId, x, y, ...buildExplosionData() },
    ]);

    playExplosionSound();

    const timer = setTimeout(() => {
      setExplosions((prev) => prev.filter((e) => e.id !== explosionId));
      explosionTimers.current.delete(timer);
    }, EXPLOSION_LIFETIME_MS);
    explosionTimers.current.add(timer);
  }, []);

  const onKeydown = useEffectEvent((e: KeyboardEvent) => {
    if (e.repeat) return;
    const active = document.activeElement;
    const isTyping =
      active instanceof HTMLInputElement ||
      active instanceof HTMLTextAreaElement ||
      active instanceof HTMLSelectElement;
    if (isTyping) return;
    spawnTnt();
  });

  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKeydown(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  useEffect(() => {
    const el = keyboardRef.current;
    if (!el) return;
    const listener = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("button")) {
        spawnTnt();
      }
    };
    el.addEventListener("click", listener);
    return () => el.removeEventListener("click", listener);
  }, [keyboardRef, spawnTnt]);

  useEffect(() => {
    const timers = explosionTimers.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
      {tnts.map((tnt) => (
        <FallingTntItem key={tnt.id} tnt={tnt} onExplode={handleExplode} />
      ))}
      {explosions.map((explosion) => (
        <React.Fragment key={explosion.id}>
          {explosion.grayDustSprites.map((p) => (
            <SpriteParticle
              key={p.id}
              frames={GENERIC_FRAMES}
              frameDurationMs={GRAY_DUST_SPEED_MS}
              x={explosion.x + p.dx}
              y={explosion.y + p.dy}
              size={p.size}
              driftY={p.driftY}
              filter={GRAY_DUST_FILTER}
            />
          ))}
          {explosion.whiteDustSprites.map((p) => (
            <SpriteParticle
              key={p.id}
              frames={GENERIC_FRAMES}
              frameDurationMs={WHITE_DUST_SPEED_MS}
              x={explosion.x + p.dx}
              y={explosion.y + p.dy}
              size={p.size}
              driftY={p.driftY}
            />
          ))}
          {explosion.explosionSprites.map((p) => (
            <SpriteParticle
              key={p.id}
              frames={EXPLOSION_FRAMES}
              frameDurationMs={EXPLOSION_SPEED_MS}
              x={explosion.x + p.dx}
              y={explosion.y + p.dy}
              size={p.size}
              driftY={p.driftY}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}
