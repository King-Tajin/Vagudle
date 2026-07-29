import React, { useEffect, useRef } from "react";
import { hexToRgb, hslToHex } from "../../lib/colorUtils";
import { pickWeightedLetter } from "../../constants/letterWeights";
import { attachResizableAnimationLoop } from "../../lib/animationLoop";

const BACKGROUND_COLOR = "#0d1322";
const FLOOR_COLOR = "#000000";

const PURPLE_HUE = 275;
const PURPLE_HUE_VARIANCE = 40;
const PURPLE_SATURATION = 72;
const PURPLE_LIGHTNESS = 58;
const PURPLE_LIGHTNESS_VARIANCE = 16;

const LETTER_RADIUS_MIN = 25;
const LETTER_RADIUS_MAX = 45;
const MAX_PILE_HEIGHT_RATIO = 0.82;
const PACKING_DENSITY = 0.68;
const MAX_LETTERS = 700;

const GRAVITY = 1500;
const WALL_RESTITUTION = 0.35;
const FLOOR_RESTITUTION = 0.28;
const COLLISION_RESTITUTION = 0.2;
const FLOOR_FRICTION = 0.82;
const AIR_DRAG = 0.999;
const REST_EPSILON = 6;
const PHYSICS_SUBSTEPS = 2;

const SPAWN_RATE_PER_SEC = 45;
const SPAWN_VX_RANGE = 60;
const SPIN_DECAY = 0.9;

const FREEZE_AFTER_SECONDS = 6;

const LETTER_SOURCE_MODE = "last_guess" as "random" | "last_guess";

const pickPurpleColor = (): string => {
  const hue = PURPLE_HUE + (Math.random() * 2 - 1) * PURPLE_HUE_VARIANCE;
  const lightness =
    PURPLE_LIGHTNESS + (Math.random() * 2 - 1) * PURPLE_LIGHTNESS_VARIANCE;
  return hslToHex(
    hue,
    PURPLE_SATURATION,
    Math.min(95, Math.max(20, lightness))
  );
};

interface LetterParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  angle: number;
  spin: number;
  color: string;
  letter: string;
  age: number;
  frozen: boolean;
}

const computeTargetCount = (
  canvasWidth: number,
  canvasHeight: number,
  guessesUsed: number,
  maxGuesses: number
): number => {
  const ratio =
    maxGuesses > 0 ? Math.min(1, Math.max(0, guessesUsed / maxGuesses)) : 0;
  const targetHeight = ratio * MAX_PILE_HEIGHT_RATIO * canvasHeight;
  const targetArea = canvasWidth * targetHeight;
  const avgRadius = (LETTER_RADIUS_MIN + LETTER_RADIUS_MAX) / 2;
  const circleArea = Math.PI * avgRadius * avgRadius;
  const count = Math.round((targetArea / circleArea) * PACKING_DENSITY);
  return Math.min(MAX_LETTERS, Math.max(0, count));
};

interface LetterPileProps {
  guessesUsed: number;
  maxGuesses: number;
  guesses?: string[];
}

const EMPTY_ITEMS: string[] = [];

export const LetterPile = ({
  guessesUsed,
  maxGuesses,
  guesses = EMPTY_ITEMS,
}: LetterPileProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guessesUsedRef = useRef(guessesUsed);
  const maxGuessesRef = useRef(maxGuesses);
  const guessesRef = useRef(guesses);

  useEffect(() => {
    guessesUsedRef.current = guessesUsed;
  }, [guessesUsed]);

  useEffect(() => {
    maxGuessesRef.current = maxGuesses;
  }, [maxGuesses]);

  useEffect(() => {
    guessesRef.current = guesses;
  }, [guesses]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rafIdRef = { current: 0 };
    let particles: LetterParticle[] = [];
    let trackedGuessesUsed = 0;
    let plannedCount = 0;
    let pendingSpawnCount = 0;
    let spawnAccumulator = 0;
    let letterCursor = 0;
    let lastTimestamp: number | null = null;
    let clearing = false;

    const setupSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setupSize();

    const nextLetter = (): string => {
      if (LETTER_SOURCE_MODE === "last_guess" && guessesRef.current.length) {
        const word =
          guessesRef.current[guessesRef.current.length - 1].toUpperCase();
        if (word.length > 0) {
          const chosen = word[letterCursor % word.length];
          letterCursor += 1;
          return chosen;
        }
      }
      return pickWeightedLetter();
    };

    const spawnParticle = () => {
      const r =
        LETTER_RADIUS_MIN +
        Math.random() * (LETTER_RADIUS_MAX - LETTER_RADIUS_MIN);
      particles.push({
        x: r + Math.random() * (canvas.width - 2 * r),
        y: -r - Math.random() * r * 4,
        vx: (Math.random() * 2 - 1) * SPAWN_VX_RANGE,
        vy: 0,
        r,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() * 2 - 1) * 3,
        color: pickPurpleColor(),
        letter: nextLetter(),
        age: 0,
        frozen: false,
      });
    };

    const resolveCollision = (a: LetterParticle, b: LetterParticle) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distSq = dx * dx + dy * dy;
      const minDist = a.r + b.r;
      if (distSq >= minDist * minDist || distSq === 0) return;

      const invMassA = a.frozen ? 0 : 1;
      const invMassB = b.frozen ? 0 : 1;
      const totalInvMass = invMassA + invMassB;
      if (totalInvMass === 0) return;

      const dist = Math.sqrt(distSq);
      const nx = dx / dist;
      const ny = dy / dist;
      const overlap = minDist - dist;

      const correctionA = (overlap * invMassA) / totalInvMass;
      const correctionB = (overlap * invMassB) / totalInvMass;
      a.x -= nx * correctionA;
      a.y -= ny * correctionA;
      b.x += nx * correctionB;
      b.y += ny * correctionB;

      const relVx = b.vx - a.vx;
      const relVy = b.vy - a.vy;
      const relDotNormal = relVx * nx + relVy * ny;
      if (relDotNormal >= 0) return;

      const impulse =
        (-(1 + COLLISION_RESTITUTION) * relDotNormal) / totalInvMass;
      a.vx -= impulse * nx * invMassA;
      a.vy -= impulse * ny * invMassA;
      b.vx += impulse * nx * invMassB;
      b.vy += impulse * ny * invMassB;
    };

    const stepPhysics = (dt: number) => {
      for (const p of particles) {
        if (p.frozen) continue;

        if (!clearing) {
          p.age += dt;
          if (p.age >= FREEZE_AFTER_SECONDS) {
            p.frozen = true;
            p.vx = 0;
            p.vy = 0;
            p.spin = 0;
            continue;
          }
        }

        p.vy += GRAVITY * dt;
        p.vx *= AIR_DRAG;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.x - p.r < 0) {
          p.x = p.r;
          p.vx = -p.vx * WALL_RESTITUTION;
        } else if (p.x + p.r > canvas.width) {
          p.x = canvas.width - p.r;
          p.vx = -p.vx * WALL_RESTITUTION;
        }

        if (!clearing && p.y + p.r > canvas.height) {
          p.y = canvas.height - p.r;
          p.vy = -p.vy * FLOOR_RESTITUTION;
          p.vx *= FLOOR_FRICTION;
          if (Math.abs(p.vy) < REST_EPSILON) p.vy = 0;
          if (Math.abs(p.vx) < REST_EPSILON) p.vx = 0;
        }

        p.angle += p.spin * dt;
        p.spin *= SPIN_DECAY;
      }

      if (clearing) {
        particles = particles.filter((p) => p.y - p.r <= canvas.height);
        if (particles.length === 0) clearing = false;
      }

      const cellSize = LETTER_RADIUS_MAX * 2;
      const grid = new Map<string, number[]>();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const cx = Math.floor(p.x / cellSize);
        const cy = Math.floor(p.y / cellSize);
        const key = `${cx},${cy}`;
        const bucket = grid.get(key);
        if (bucket) bucket.push(i);
        else grid.set(key, [i]);
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const cx = Math.floor(p.x / cellSize);
        const cy = Math.floor(p.y / cellSize);
        for (let ox = -1; ox <= 1; ox++) {
          for (let oy = -1; oy <= 1; oy++) {
            const bucket = grid.get(`${cx + ox},${cy + oy}`);
            if (!bucket) continue;
            for (const j of bucket) {
              if (j <= i) continue;
              resolveCollision(particles[i], particles[j]);
            }
          }
        }
      }
    };

    const draw = () => {
      ctx.fillStyle = BACKGROUND_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = FLOOR_COLOR;
      ctx.fillRect(0, canvas.height - 2, canvas.width, 2);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const p of particles) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        const [r, g, b] = hexToRgb(p.color);
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.55)`;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${Math.round(p.r * 1.1)}px sans-serif`;
        ctx.fillText(p.letter, 0, 1);

        ctx.restore();
      }
    };

    const tick = (timestamp: number) => {
      if (lastTimestamp === null) lastTimestamp = timestamp;
      const dt = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
      lastTimestamp = timestamp;

      const gu = guessesUsedRef.current;
      const mg = maxGuessesRef.current;

      if (gu < trackedGuessesUsed) {
        for (const p of particles) {
          p.frozen = false;
        }
        clearing = true;
        plannedCount = 0;
        pendingSpawnCount = 0;
        trackedGuessesUsed = gu;
      }

      if (gu !== trackedGuessesUsed) {
        trackedGuessesUsed = gu;
        const target = computeTargetCount(canvas.width, canvas.height, gu, mg);
        const delta = target - plannedCount;
        if (delta > 0) pendingSpawnCount += delta;
        plannedCount = target;
      }

      spawnAccumulator += SPAWN_RATE_PER_SEC * dt;
      while (
        spawnAccumulator >= 1 &&
        pendingSpawnCount > 0 &&
        particles.length < MAX_LETTERS
      ) {
        spawnParticle();
        pendingSpawnCount -= 1;
        spawnAccumulator -= 1;
      }

      const substepDt = dt / PHYSICS_SUBSTEPS;
      for (let i = 0; i < PHYSICS_SUBSTEPS; i++) {
        stepPhysics(substepDt);
      }

      draw();

      rafIdRef.current = requestAnimationFrame(tick);
    };

    return attachResizableAnimationLoop(rafIdRef, tick, setupSize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};
