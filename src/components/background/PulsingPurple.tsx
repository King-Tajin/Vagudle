import React, { useEffect, useRef } from "react";
import {
  hexToRgb,
  rgbToHex,
  lerpColor,
  averageColor,
} from "../../lib/colorUtils";

const PIXEL_SIZE = 42;

const PULSE_GROUPS = 6;
const PULSE_SPEED = 0.0001;
const COLOR_UNIFORMITY = 0.8;
const BRIGHTNESS = 0.4;
const PALETTE = [
  "#0d0020",
  "#2d0055",
  "#5900b3",
  "#8a2be2",
  "#b44df7",
  "#d580ff",
  "#b44df7",
  "#8a2be2",
  "#5900b3",
  "#2d0055",
];

const AVG_COLOR = averageColor(PALETTE);

const paletteColor = (phase: number): string => {
  const idx = (phase % 1) * PALETTE.length;
  const i0 = Math.floor(idx) % PALETTE.length;
  const i1 = (i0 + 1) % PALETTE.length;
  const color = lerpColor(PALETTE[i0], PALETTE[i1], idx - Math.floor(idx));
  const uniform = lerpColor(color, AVG_COLOR, COLOR_UNIFORMITY);
  const [r, g, b] = hexToRgb(uniform);
  return rgbToHex(r * BRIGHTNESS, g * BRIGHTNESS, b * BRIGHTNESS);
};

export const PulsingPurple = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cols = 0;
    let rows = 0;
    let groupMap = new Uint8Array(0);

    const setup = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      cols = Math.ceil(canvas.width / PIXEL_SIZE);
      rows = Math.ceil(canvas.height / PIXEL_SIZE);
      groupMap = new Uint8Array(cols * rows);
      for (let i = 0; i < groupMap.length; i++) {
        groupMap[i] = Math.floor(Math.random() * PULSE_GROUPS);
      }
    };

    setup();

    const phases = Array.from(
      { length: PULSE_GROUPS },
      (_, i) => i / PULSE_GROUPS
    );

    let lastTime = performance.now();
    let rafId: number;

    const tick = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      for (let g = 0; g < PULSE_GROUPS; g++) {
        phases[g] = (phases[g] + PULSE_SPEED * delta) % 1;
      }

      const groupColors = phases.map(paletteColor);

      for (let g = 0; g < PULSE_GROUPS; g++) {
        ctx.fillStyle = groupColors[g];
        for (let i = 0; i < groupMap.length; i++) {
          if (groupMap[i] === g) {
            ctx.fillRect(
              (i % cols) * PIXEL_SIZE,
              Math.floor(i / cols) * PIXEL_SIZE,
              PIXEL_SIZE,
              PIXEL_SIZE
            );
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(setup, 150);
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
