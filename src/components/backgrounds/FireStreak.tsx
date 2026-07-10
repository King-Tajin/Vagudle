import React, { useEffect, useRef } from "react";
import { hexToRgb, lerpColor } from "../../lib/colorUtils";

const STAGE_THRESHOLDS = [0, 1, 2, 4, 6, 10];

const STAGE_COLOR_STOPS: [string, string, string][] = [
  ["#2a0a02", "#5c1102", "#8a2705"],
  ["#3b0a02", "#7a1d05", "#a83d0d"],
  ["#5c1102", "#a83d0d", "#d1570f"],
  ["#7a1d05", "#d1570f", "#f2791a"],
  ["#a83d0d", "#f2791a", "#ffab2e"],
  ["#d1570f", "#ffab2e", "#ffe066"],
];

const STAGE_PARTICLE_COUNTS = [24, 40, 60, 85, 115, 150];
const STAGE_SPAWN_RATES_PER_SEC = [10, 16, 24, 34, 46, 60];
const STAGE_FLAME_HEIGHT_RATIOS = [0.14, 0.2, 0.28, 0.38, 0.5, 0.65];
const STAGE_GLOW_INTENSITY = [0.25, 0.35, 0.45, 0.58, 0.72, 0.9];
const STAGE_SIZE_MULTIPLIERS = [0.8, 0.9, 1.0, 1.1, 1.25, 1.4];
const STAGE_SPEED_MULTIPLIERS = [0.8, 0.9, 1.0, 1.1, 1.2, 1.35];

const PARTICLE_SIZE_MIN = 2;
const PARTICLE_SIZE_MAX = 20;
const PARTICLE_RISE_SPEED_MIN = 22;
const PARTICLE_RISE_SPEED_MAX = 95;
const PARTICLE_HORIZONTAL_DRIFT = 24;
const PARTICLE_FLICKER_FREQUENCY = 2.3;
const PARTICLE_SPAWN_WIDTH_RATIO = 0.9;

const BG_GRADIENT_TOP = "#160402";
const BG_GRADIENT_BOTTOM = "#3d0f04";
const BG_GLOW_HEIGHT_RATIO = 0.55;

const STAGE_TRANSITION_LERP_SPEED = 1.5;

type Particle = {
  x: number;
  y: number;
  vy: number;
  driftPhase: number;
  driftSpeed: number;
  size: number;
  life: number;
  maxLife: number;
};

const getStageIndex = (streak: number): number => {
  let idx = 0;
  for (let i = 0; i < STAGE_THRESHOLDS.length; i++) {
    if (streak >= STAGE_THRESHOLDS[i]) idx = i;
  }
  return idx;
};

const lerpStageValue = (values: number[], stageFloat: number): number => {
  const i0 = Math.floor(stageFloat);
  const i1 = Math.min(values.length - 1, i0 + 1);
  const t = stageFloat - i0;
  return values[i0] + (values[i1] - values[i0]) * t;
};

const lerpStageColorStops = (stageFloat: number): [string, string, string] => {
  const i0 = Math.floor(stageFloat);
  const i1 = Math.min(STAGE_COLOR_STOPS.length - 1, i0 + 1);
  const t = stageFloat - i0;
  const a = STAGE_COLOR_STOPS[i0];
  const b = STAGE_COLOR_STOPS[i1];
  return [
    lerpColor(a[0], b[0], t),
    lerpColor(a[1], b[1], t),
    lerpColor(a[2], b[2], t),
  ];
};

type Props = {
  currentStreak: number;
};

export const FireStreak = ({ currentStreak }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streakRef = useRef(currentStreak);

  useEffect(() => {
    streakRef.current = currentStreak;
  }, [currentStreak]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId: number;
    let resizeTimeout: ReturnType<typeof setTimeout>;
    let particles: Particle[] = [];
    let displayedStage = getStageIndex(streakRef.current);
    let lastTimestamp: number | null = null;
    let spawnAccumulator = 0;

    const setupSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setupSize();

    const spawnParticle = (stageFloat: number) => {
      const spawnWidth = canvas.width * PARTICLE_SPAWN_WIDTH_RATIO;
      const sizeMultiplier = lerpStageValue(STAGE_SIZE_MULTIPLIERS, stageFloat);
      const speedMultiplier = lerpStageValue(
        STAGE_SPEED_MULTIPLIERS,
        stageFloat
      );
      const size =
        (PARTICLE_SIZE_MIN +
          Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN)) *
        sizeMultiplier;
      const vy =
        (PARTICLE_RISE_SPEED_MIN +
          Math.random() * (PARTICLE_RISE_SPEED_MAX - PARTICLE_RISE_SPEED_MIN)) *
        speedMultiplier;

      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * spawnWidth,
        y: canvas.height + size,
        vy,
        driftPhase: Math.random() * Math.PI * 2,
        driftSpeed: 0.5 + Math.random(),
        size,
        life: 0,
        maxLife: 1,
      });
    };

    const drawBackground = (stageFloat: number) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, BG_GRADIENT_TOP);
      gradient.addColorStop(1, BG_GRADIENT_BOTTOM);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const glowIntensity = lerpStageValue(STAGE_GLOW_INTENSITY, stageFloat);
      const glowHeight = canvas.height * BG_GLOW_HEIGHT_RATIO;
      const [, , brightStop] = lerpStageColorStops(stageFloat);
      const glow = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height,
        0,
        canvas.width / 2,
        canvas.height,
        Math.max(canvas.width, glowHeight)
      );
      const [r, g, b] = hexToRgb(brightStop);
      glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${glowIntensity})`);
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const drawParticle = (p: Particle, stageFloat: number) => {
      const lifeFraction = p.life / p.maxLife;
      const alpha = 1 - lifeFraction;
      const [dark, mid, bright] = lerpStageColorStops(stageFloat);
      const color =
        lifeFraction < 0.5
          ? lerpColor(bright, mid, lifeFraction * 2)
          : lerpColor(mid, dark, (lifeFraction - 0.5) * 2);
      const [r, g, b] = hexToRgb(color);
      const size = p.size * (1 - lifeFraction * 0.5);

      ctx.beginPath();
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.arc(p.x, p.y, Math.max(0, size), 0, Math.PI * 2);
      ctx.fill();
    };

    const tick = (timestamp: number) => {
      if (lastTimestamp === null) lastTimestamp = timestamp;
      const dt = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
      lastTimestamp = timestamp;

      const targetStage = getStageIndex(streakRef.current);
      displayedStage +=
        (targetStage - displayedStage) *
        Math.min(1, STAGE_TRANSITION_LERP_SPEED * dt);

      const flameHeight =
        canvas.height *
        lerpStageValue(STAGE_FLAME_HEIGHT_RATIOS, displayedStage);
      const maxParticles = Math.round(
        lerpStageValue(STAGE_PARTICLE_COUNTS, displayedStage)
      );
      const spawnRate = lerpStageValue(
        STAGE_SPAWN_RATES_PER_SEC,
        displayedStage
      );

      spawnAccumulator += spawnRate * dt;
      while (spawnAccumulator >= 1 && particles.length < maxParticles) {
        spawnParticle(displayedStage);
        spawnAccumulator -= 1;
      }

      drawBackground(displayedStage);

      particles = particles.filter((p) => {
        p.driftPhase += p.driftSpeed * PARTICLE_FLICKER_FREQUENCY * dt;
        p.y -= p.vy * dt;
        p.x += Math.sin(p.driftPhase) * PARTICLE_HORIZONTAL_DRIFT * dt;

        const risen = canvas.height - p.y;
        p.life = Math.min(1, risen / flameHeight);

        if (p.life >= 1) return false;

        drawParticle(p, displayedStage);
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
      clearTimeout(resizeTimeout);
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
