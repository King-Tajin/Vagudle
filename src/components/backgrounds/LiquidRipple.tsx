import React, { useEffect, useRef } from "react";
import WebGLFluidEnhanced from "webgl-fluid-enhanced";
import {
  subscribeToRipples,
  type RippleEvent,
} from "../../lib/liquidRippleBus";
import type { CharStatus } from "../../lib/statuses";

const BASE_BACKGROUND = "#05060d";

const STATUS_HEX: Record<CharStatus, string> = {
  correct: "#22c55e",
  present: "#eab308",
  absent: "#64748b",
  "auto-absent": "#64748b",
};

const FLUID_CONFIG = {
  simResolution: 128,
  dyeResolution: 1024,
  densityDissipation: 0.55,
  velocityDissipation: 0.12,
  pressure: 0.8,
  pressureIterations: 20,
  curl: 12,
  splatRadius: 0.25,
  shading: true,
  hover: false,
  backgroundColor: BASE_BACKGROUND,
  transparent: false,
  bloom: true,
  bloomIterations: 8,
  bloomResolution: 256,
  bloomIntensity: 0.3,
  bloomThreshold: 0.3,
  bloomSoftKnee: 0.7,
  sunrays: true,
  sunraysResolution: 196,
  sunraysWeight: 0.3,
};

const REVEAL_DELAY_MS = 260;
const REVEAL_TRANSITION_MS = 300;
const RIPPLE_MAX_FORCE = 5400;
const HEAD_COLOR_INTENSITY = 4;
const TRAIL_COLOR_INTENSITY = 2.25;
const TRAIL_FORCE_SCALE = 0.55;
const TRAIL_OFFSET = 46;

const AUTO_COLOR_EXPONENT = 2.15;
const AUTO_FORCE_EXPONENT = 1.15;
const AUTO_RADIUS_EXPONENT = 1.45;

type RGB = { r: number; g: number; b: number };

type FluidSimulation = {
  canvas: HTMLCanvasElement;
  splatRadius: number;
  splat: (x: number, y: number, dx: number, dy: number, color: RGB) => void;
};

const getSimulation = (fluid: WebGLFluidEnhanced): FluidSimulation | null => {
  const sim = (fluid as unknown as { simulation?: FluidSimulation }).simulation;
  return sim ?? null;
};

const hexToRgb01 = (hex: string): RGB => {
  const value = hex.replace("#", "");
  return {
    r: parseInt(value.substring(0, 2), 16) / 255,
    g: parseInt(value.substring(2, 4), 16) / 255,
    b: parseInt(value.substring(4, 6), 16) / 255,
  };
};

const scaleRgb = (color: RGB, amount: number): RGB => ({
  r: color.r * amount,
  g: color.g * amount,
  b: color.b * amount,
});

export const LiquidRipple = (): React.JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    container.style.opacity = "0";
    container.style.transition = "none";

    let fluid: WebGLFluidEnhanced | null = null;
    try {
      fluid = new WebGLFluidEnhanced(container);
      fluid.setConfig(FLUID_CONFIG);
      fluid.start();
    } catch {
      return;
    }

    const revealTimeout = window.setTimeout(() => {
      container.style.transition = `opacity ${REVEAL_TRANSITION_MS}ms ease`;
      container.style.opacity = "1";
    }, REVEAL_DELAY_MS);

    const applyRipple = (event: RippleEvent) => {
      if (!fluid) return;
      const sim = getSimulation(fluid);
      if (!sim) return;

      const x = event.x * window.innerWidth;
      const y = event.y * window.innerHeight;

      const colorScale = Math.pow(event.strength, AUTO_COLOR_EXPONENT);
      const forceScale = Math.pow(event.strength, AUTO_FORCE_EXPONENT);
      const radiusScale = Math.pow(event.strength, AUTO_RADIUS_EXPONENT);

      const kick = RIPPLE_MAX_FORCE * forceScale;
      const baseAngle = Math.random() * Math.PI * 2;
      const dirX = Math.cos(baseAngle);
      const dirY = Math.sin(baseAngle);
      const baseRgb = hexToRgb01(STATUS_HEX[event.color]);
      const headColor = scaleRgb(baseRgb, HEAD_COLOR_INTENSITY * colorScale);
      const trailColor = scaleRgb(baseRgb, TRAIL_COLOR_INTENSITY * colorScale);

      const originalRadius = sim.splatRadius;
      sim.splatRadius = originalRadius * radiusScale;

      const headDx = dirX * kick;
      const headDy = dirY * kick;
      const headNx = x / sim.canvas.width;
      const headNy = 1 - y / sim.canvas.clientHeight;
      sim.splat(headNx, headNy, headDx, headDy, headColor);

      const trailX = x - dirX * TRAIL_OFFSET;
      const trailY = y - dirY * TRAIL_OFFSET;
      const trailDx = dirX * kick * TRAIL_FORCE_SCALE;
      const trailDy = dirY * kick * TRAIL_FORCE_SCALE;
      const trailNx = trailX / sim.canvas.width;
      const trailNy = 1 - trailY / sim.canvas.clientHeight;
      sim.splat(trailNx, trailNy, trailDx, trailDy, trailColor);

      sim.splatRadius = originalRadius;
    };

    const unsubscribe = subscribeToRipples(applyRipple);

    return () => {
      window.clearTimeout(revealTimeout);
      unsubscribe();
      fluid?.stop();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0, background: BASE_BACKGROUND }}
    >
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", opacity: 0 }}
      />
    </div>
  );
};
