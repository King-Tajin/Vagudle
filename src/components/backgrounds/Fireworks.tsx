import React, { useEffect, useRef } from "react";
import { hexToRgb } from "../../lib/colorUtils";

const SKY_TOP_COLOR = "#02030d";
const SKY_BOTTOM_COLOR = "#0b1030";

const STAR_COUNT = 90;
const STAR_SIZE_MIN = 0.5;
const STAR_SIZE_MAX = 1.8;
const STAR_TWINKLE_SPEED_MIN = 0.5;
const STAR_TWINKLE_SPEED_MAX = 1.6;
const STAR_BASE_OPACITY_MIN = 0.2;
const STAR_BASE_OPACITY_MAX = 0.8;

const COLOR_PALETTES: string[][] = [
  ["#ff5252", "#ffb74d", "#ffee58"],
  ["#40c4ff", "#69f0ae", "#eeff41"],
  ["#e040fb", "#ff4081", "#7c4dff"],
  ["#ffd700", "#ffffff", "#ffa000"],
  ["#00e5ff", "#18ffff", "#ffffff"],
];

const LAUNCH_INTERVAL_MIN_MS = 450;
const LAUNCH_INTERVAL_MAX_MS = 1525;
const MAX_CONCURRENT_ROCKETS = 4;
const MAX_CONCURRENT_PARTICLES = 820;

const ROCKET_SPEED_MIN = 280;
const ROCKET_SPEED_MAX = 660;
const ROCKET_WIDTH = 2.2;
const ROCKET_TRAIL_MAX_POINTS = 14;
const ROCKET_LAUNCH_X_MARGIN_RATIO = 0.08;
const ROCKET_BURST_HEIGHT_MIN_RATIO = 0.18;
const ROCKET_BURST_HEIGHT_MAX_RATIO = 0.52;
const ROCKET_HORIZONTAL_DRIFT = 24;

const BURST_PARTICLE_COUNT_MIN = 55;
const BURST_PARTICLE_COUNT_MAX = 110;
const BURST_PARTICLE_SPEED_MIN = 60;
const BURST_PARTICLE_SPEED_MAX = 260;
const BURST_PARTICLE_SIZE_MIN = 1.4;
const BURST_PARTICLE_SIZE_MAX = 3.4;
const BURST_PARTICLE_LIFETIME_MIN_MS = 900;
const BURST_PARTICLE_LIFETIME_MAX_MS = 1900;
const BURST_STREAK_CHANCE = 0.35;
const BURST_STREAK_LENGTH_RATIO = 0.045;

const GRAVITY = 130;
const PARTICLE_DRAG = 0.985;
const PARTICLE_FLICKER_SPEED_MIN = 4;
const PARTICLE_FLICKER_SPEED_MAX = 9;
const PARTICLE_FLICKER_STRENGTH = 0.35;

const SECONDARY_BURST_CHANCE = 0.4;
const SECONDARY_BURST_DELAY_MIN_MS = 220;
const SECONDARY_BURST_DELAY_MAX_MS = 420;
const SECONDARY_BURST_PARTICLE_COUNT_MIN = 14;
const SECONDARY_BURST_PARTICLE_COUNT_MAX = 30;
const SECONDARY_BURST_SPEED_MULTIPLIER = 0.45;

const GLOW_ENABLED = true;
const GLOW_BLUR_RADIUS = 12;

const SOUND_MASTER_VOLUME = 1;

const LAUNCH_SOUND_VOLUME = 0.18;
const LAUNCH_SOUND_DURATION_MS = 420;
const LAUNCH_SOUND_HIGHPASS_FREQ = 150;
const LAUNCH_SOUND_LOWPASS_START_FREQ = 500;
const LAUNCH_SOUND_LOWPASS_END_FREQ = 2200;
const LAUNCH_SOUND_FILTER_Q = 0.7;
const LAUNCH_SOUND_ATTACK_MS = 40;
const LAUNCH_SOUND_HOLD_RATIO = 0.55;

const BURST_SOUND_FILE_PATHS = [
  "/sounds/fireworks/burst-1.mp3",
  "/sounds/fireworks/burst-2.mp3",
  "/sounds/fireworks/burst-3.mp3",
  "/sounds/fireworks/burst-4.mp3",
  "/sounds/fireworks/burst-5.mp3",
];

const BURST_FILE_VOLUME_MIN = 0.375;
const BURST_FILE_VOLUME_MAX = 0.55;
const BURST_FILE_PLAYBACK_RATE_MIN = 0.65;
const BURST_FILE_PLAYBACK_RATE_MAX = 0.725;

const SECONDARY_BURST_SOUND_VOLUME_MULTIPLIER = 0.68;

type Star = {
  x: number;
  y: number;
  size: number;
  twinkleSpeed: number;
  twinklePhase: number;
  baseOpacity: number;
};

type Rocket = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  burstY: number;
  palette: string[];
  trail: { x: number; y: number }[];
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  flickerPhase: number;
  flickerSpeed: number;
  isStreak: boolean;
};

type PendingSecondaryBurst = {
  x: number;
  y: number;
  palette: string[];
  delayRemaining: number;
};

const randomBetween = (min: number, max: number): number =>
  min + Math.random() * (max - min);

const pickPalette = (): string[] =>
  COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];

const spawnStars = (width: number, height: number): Star[] =>
  Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height * 0.75,
    size: randomBetween(STAR_SIZE_MIN, STAR_SIZE_MAX),
    twinkleSpeed: randomBetween(STAR_TWINKLE_SPEED_MIN, STAR_TWINKLE_SPEED_MAX),
    twinklePhase: Math.random() * Math.PI * 2,
    baseOpacity: randomBetween(STAR_BASE_OPACITY_MIN, STAR_BASE_OPACITY_MAX),
  }));

const spawnRocket = (width: number, height: number): Rocket => {
  const margin = width * ROCKET_LAUNCH_X_MARGIN_RATIO;
  return {
    x: randomBetween(margin, width - margin),
    y: height,
    vx: randomBetween(-ROCKET_HORIZONTAL_DRIFT, ROCKET_HORIZONTAL_DRIFT),
    vy: -randomBetween(ROCKET_SPEED_MIN, ROCKET_SPEED_MAX),
    burstY:
      height *
      randomBetween(
        ROCKET_BURST_HEIGHT_MIN_RATIO,
        ROCKET_BURST_HEIGHT_MAX_RATIO
      ),
    palette: pickPalette(),
    trail: [],
  };
};

const spawnBurstParticles = (
  x: number,
  y: number,
  palette: string[],
  count: number,
  speedMin: number,
  speedMax: number
): Particle[] =>
  Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = randomBetween(speedMin, speedMax);
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: randomBetween(BURST_PARTICLE_SIZE_MIN, BURST_PARTICLE_SIZE_MAX),
      color: palette[Math.floor(Math.random() * palette.length)],
      life: 0,
      maxLife:
        randomBetween(
          BURST_PARTICLE_LIFETIME_MIN_MS,
          BURST_PARTICLE_LIFETIME_MAX_MS
        ) / 1000,
      flickerPhase: Math.random() * Math.PI * 2,
      flickerSpeed: randomBetween(
        PARTICLE_FLICKER_SPEED_MIN,
        PARTICLE_FLICKER_SPEED_MAX
      ),
      isStreak: Math.random() < BURST_STREAK_CHANCE,
    };
  });

const createNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
  const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
};

let cachedBurstBuffers: AudioBuffer[] | null = null;
let cachedBurstBuffersPromise: Promise<AudioBuffer[]> | null = null;

const loadBurstBuffers = (ctx: AudioContext): Promise<AudioBuffer[]> => {
  if (cachedBurstBuffers) return Promise.resolve(cachedBurstBuffers);
  if (!cachedBurstBuffersPromise) {
    cachedBurstBuffersPromise = Promise.all(
      BURST_SOUND_FILE_PATHS.map(async (path) => {
        try {
          const response = await fetch(path);
          if (!response.ok) {
            console.warn(
              `Burst sound file failed to load: ${path} (${response.status})`
            );
            return null;
          }
          const arrayBuffer = await response.arrayBuffer();
          return await ctx.decodeAudioData(arrayBuffer);
        } catch (error) {
          console.warn(`Burst sound file failed to decode: ${path}`, error);
          return null;
        }
      })
    ).then((results) => {
      const buffers = results.filter((b): b is AudioBuffer => b !== null);
      cachedBurstBuffers = buffers;
      return buffers;
    });
  }
  return cachedBurstBuffersPromise;
};

const playLaunchSound = (ctx: AudioContext, noiseBuffer: AudioBuffer): void => {
  const durationSec = LAUNCH_SOUND_DURATION_MS / 1000;
  const attackSec = LAUNCH_SOUND_ATTACK_MS / 1000;
  const holdSec = durationSec * LAUNCH_SOUND_HOLD_RATIO;

  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer;
  source.loop = true;

  const highpass = ctx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = LAUNCH_SOUND_HIGHPASS_FREQ;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.Q.value = LAUNCH_SOUND_FILTER_Q;
  lowpass.frequency.setValueAtTime(
    LAUNCH_SOUND_LOWPASS_START_FREQ,
    ctx.currentTime
  );
  lowpass.frequency.linearRampToValueAtTime(
    LAUNCH_SOUND_LOWPASS_END_FREQ,
    ctx.currentTime + durationSec
  );

  const gain = ctx.createGain();
  const volume = LAUNCH_SOUND_VOLUME * SOUND_MASTER_VOLUME;
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + attackSec);
  gain.gain.setValueAtTime(volume, ctx.currentTime + holdSec);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec);

  source
    .connect(highpass)
    .connect(lowpass)
    .connect(gain)
    .connect(ctx.destination);
  source.start();
  source.stop(ctx.currentTime + durationSec + 0.05);
};

const playBurstFile = (
  ctx: AudioContext,
  buffer: AudioBuffer,
  intensity: number,
  volumeMultiplier: number
): void => {
  const volume =
    (BURST_FILE_VOLUME_MIN +
      (BURST_FILE_VOLUME_MAX - BURST_FILE_VOLUME_MIN) * intensity) *
    volumeMultiplier *
    SOUND_MASTER_VOLUME;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = randomBetween(
    BURST_FILE_PLAYBACK_RATE_MIN,
    BURST_FILE_PLAYBACK_RATE_MAX
  );

  const gain = ctx.createGain();
  gain.gain.value = volume;

  source.connect(gain).connect(ctx.destination);
  source.start();
};

const playBurstSound = (
  ctx: AudioContext,
  intensity: number,
  volumeMultiplier: number,
  fileBuffers: AudioBuffer[]
): void => {
  if (fileBuffers.length === 0) return;
  const buffer = fileBuffers[Math.floor(Math.random() * fileBuffers.length)];
  playBurstFile(ctx, buffer, intensity, volumeMultiplier);
};

type Props = {
  extraEffects: boolean;
};

export const Fireworks = ({ extraEffects }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const extraEffectsRef = useRef(extraEffects);

  useEffect(() => {
    extraEffectsRef.current = extraEffects;
  }, [extraEffects]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    let resizeTimeout: ReturnType<typeof setTimeout>;
    let stars: Star[] = [];
    let rockets: Rocket[] = [];
    let particles: Particle[] = [];
    let pendingSecondaryBursts: PendingSecondaryBurst[] = [];
    let lastTimestamp: number | null = null;
    let nextLaunchIn =
      randomBetween(LAUNCH_INTERVAL_MIN_MS, LAUNCH_INTERVAL_MAX_MS) / 1000;

    let audioContext: AudioContext | null = null;
    let noiseBuffer: AudioBuffer | null = null;
    let burstFileBuffers: AudioBuffer[] = [];

    const getAudio = (): { ctx: AudioContext; noise: AudioBuffer } | null => {
      if (!extraEffectsRef.current) return null;
      try {
        if (!audioContext) {
          const Ctx =
            window.AudioContext ??
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext;
          if (!Ctx) return null;
          audioContext = new Ctx();
          noiseBuffer = createNoiseBuffer(audioContext);
          loadBurstBuffers(audioContext)
            .then((buffers) => {
              burstFileBuffers = buffers;
            })
            .catch(() => {
              burstFileBuffers = [];
            });
        }
        if (audioContext.state === "suspended") void audioContext.resume();
        return noiseBuffer ? { ctx: audioContext, noise: noiseBuffer } : null;
      } catch {
        return null;
      }
    };

    const unlockAudio = () => {
      if (audioContext && audioContext.state === "suspended") {
        void audioContext.resume();
      }
    };
    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    window.addEventListener("touchstart", unlockAudio, { passive: true });

    const setupSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = spawnStars(canvas.width, canvas.height);
    };

    setupSize();

    const drawSky = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, SKY_TOP_COLOR);
      gradient.addColorStop(1, SKY_BOTTOM_COLOR);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawStars = (elapsed: number) => {
      for (const star of stars) {
        const twinkle =
          0.5 + 0.5 * Math.sin(elapsed * star.twinkleSpeed + star.twinklePhase);
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${star.baseOpacity * twinkle})`;
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawRocket = (rocket: Rocket) => {
      const [r, g, b] = hexToRgb(rocket.palette[0]);
      if (GLOW_ENABLED) {
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
        ctx.shadowBlur = GLOW_BLUR_RADIUS;
      }
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.9)`;
      ctx.lineWidth = ROCKET_WIDTH;
      ctx.beginPath();
      rocket.trail.forEach((point, i) => {
        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.lineTo(rocket.x, rocket.y);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const drawParticle = (particle: Particle) => {
      const lifeFraction = particle.life / particle.maxLife;
      const alpha = Math.max(0, 1 - lifeFraction);
      const flicker =
        1 -
        PARTICLE_FLICKER_STRENGTH +
        PARTICLE_FLICKER_STRENGTH * Math.sin(particle.flickerPhase);
      const [r, g, b] = hexToRgb(particle.color);
      const finalAlpha = alpha * flicker;

      if (GLOW_ENABLED) {
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${finalAlpha})`;
        ctx.shadowBlur = GLOW_BLUR_RADIUS;
      }

      if (particle.isStreak) {
        const speed = Math.hypot(particle.vx, particle.vy);
        const length = Math.max(2, speed * BURST_STREAK_LENGTH_RATIO);
        const angle = Math.atan2(particle.vy, particle.vx);
        const tailX = particle.x - Math.cos(angle) * length;
        const tailY = particle.y - Math.sin(angle) * length;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${finalAlpha})`;
        ctx.lineWidth = particle.size;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(particle.x, particle.y);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${finalAlpha})`;
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
    };

    const tick = (timestamp: number) => {
      if (lastTimestamp === null) lastTimestamp = timestamp;
      const dt = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
      lastTimestamp = timestamp;
      const elapsed = timestamp / 1000;

      drawSky();
      drawStars(elapsed);

      nextLaunchIn -= dt;
      if (nextLaunchIn <= 0 && rockets.length < MAX_CONCURRENT_ROCKETS) {
        rockets.push(spawnRocket(canvas.width, canvas.height));
        nextLaunchIn =
          randomBetween(LAUNCH_INTERVAL_MIN_MS, LAUNCH_INTERVAL_MAX_MS) / 1000;

        const audio = getAudio();
        if (audio) playLaunchSound(audio.ctx, audio.noise);
      }

      rockets = rockets.filter((rocket) => {
        rocket.trail.push({ x: rocket.x, y: rocket.y });
        if (rocket.trail.length > ROCKET_TRAIL_MAX_POINTS) rocket.trail.shift();

        rocket.x += rocket.vx * dt;
        rocket.y += rocket.vy * dt;

        drawRocket(rocket);

        if (rocket.y <= rocket.burstY) {
          const count = Math.round(
            randomBetween(BURST_PARTICLE_COUNT_MIN, BURST_PARTICLE_COUNT_MAX)
          );
          const availableSlots = MAX_CONCURRENT_PARTICLES - particles.length;
          const spawnCount = Math.max(0, Math.min(count, availableSlots));
          particles.push(
            ...spawnBurstParticles(
              rocket.x,
              rocket.y,
              rocket.palette,
              spawnCount,
              BURST_PARTICLE_SPEED_MIN,
              BURST_PARTICLE_SPEED_MAX
            )
          );

          const audio = getAudio();
          if (audio) {
            const intensity =
              (count - BURST_PARTICLE_COUNT_MIN) /
              (BURST_PARTICLE_COUNT_MAX - BURST_PARTICLE_COUNT_MIN);
            playBurstSound(audio.ctx, intensity, 1, burstFileBuffers);
          }

          if (Math.random() < SECONDARY_BURST_CHANCE) {
            pendingSecondaryBursts.push({
              x: rocket.x,
              y: rocket.y,
              palette: rocket.palette,
              delayRemaining:
                randomBetween(
                  SECONDARY_BURST_DELAY_MIN_MS,
                  SECONDARY_BURST_DELAY_MAX_MS
                ) / 1000,
            });
          }

          return false;
        }

        return true;
      });

      pendingSecondaryBursts = pendingSecondaryBursts.filter((burst) => {
        burst.delayRemaining -= dt;
        if (burst.delayRemaining > 0) return true;

        const count = Math.round(
          randomBetween(
            SECONDARY_BURST_PARTICLE_COUNT_MIN,
            SECONDARY_BURST_PARTICLE_COUNT_MAX
          )
        );
        const availableSlots = MAX_CONCURRENT_PARTICLES - particles.length;
        const spawnCount = Math.max(0, Math.min(count, availableSlots));
        particles.push(
          ...spawnBurstParticles(
            burst.x,
            burst.y,
            burst.palette,
            spawnCount,
            BURST_PARTICLE_SPEED_MIN * SECONDARY_BURST_SPEED_MULTIPLIER,
            BURST_PARTICLE_SPEED_MAX * SECONDARY_BURST_SPEED_MULTIPLIER
          )
        );

        const audio = getAudio();
        if (audio) {
          const intensity =
            (count - SECONDARY_BURST_PARTICLE_COUNT_MIN) /
            (SECONDARY_BURST_PARTICLE_COUNT_MAX -
              SECONDARY_BURST_PARTICLE_COUNT_MIN);
          playBurstSound(
            audio.ctx,
            intensity,
            SECONDARY_BURST_SOUND_VOLUME_MULTIPLIER,
            burstFileBuffers
          );
        }

        return false;
      });

      particles = particles.filter((particle) => {
        particle.life += dt;
        if (particle.life >= particle.maxLife) return false;

        particle.vx *= PARTICLE_DRAG;
        particle.vy = particle.vy * PARTICLE_DRAG + GRAVITY * dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.flickerPhase += particle.flickerSpeed * dt;

        drawParticle(particle);
        return true;
      });

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(setupSize, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      clearTimeout(resizeTimeout);
      if (audioContext) {
        try {
          void audioContext.close();
        } catch {}
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};
