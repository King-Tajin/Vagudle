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
  densityDissipation: 1.2,
  velocityDissipation: 0.12,
  pressure: 0.8,
  pressureIterations: 20,
  curl: 12,
  splatRadius: 0.08,
  shading: true,
  hover: false,
  backgroundColor: BASE_BACKGROUND,
  transparent: false,
  bloom: true,
  bloomIterations: 8,
  bloomResolution: 256,
  bloomIntensity: 0.005,
  bloomThreshold: 0.1,
  bloomSoftKnee: 0.7,
  sunrays: true,
  sunraysResolution: 196,
  sunraysWeight: 0.3,
};

const REVEAL_DELAY_MS = 260;
const REVEAL_TRANSITION_MS = 300;
const RIPPLE_MAX_FORCE = 5400;
const HEAD_COLOR_INTENSITY = 0.22;
const TRAIL_COLOR_INTENSITY = 0.1;
const TRAIL_FORCE_SCALE = 0.55;
const TRAIL_OFFSET = 46;
const INTENSITY_SCALE_FLOOR = 0.3;

const dimHexColor = (hex: string, intensity: number): string => {
  const value = hex.replace("#", "");
  const r = Math.round(parseInt(value.substring(0, 2), 16) * intensity);
  const g = Math.round(parseInt(value.substring(2, 4), 16) * intensity);
  const b = Math.round(parseInt(value.substring(4, 6), 16) * intensity);
  const toHex = (channel: number) => channel.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

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
      const x = event.x * window.innerWidth;
      const y = event.y * window.innerHeight;
      const kick = RIPPLE_MAX_FORCE * event.strength;
      const intensityScale =
        INTENSITY_SCALE_FLOOR + (1 - INTENSITY_SCALE_FLOOR) * event.strength;
      const baseAngle = Math.random() * Math.PI * 2;
      const dirX = Math.cos(baseAngle);
      const dirY = Math.sin(baseAngle);
      const baseColor = STATUS_HEX[event.color];
      const headColor = dimHexColor(
        baseColor,
        HEAD_COLOR_INTENSITY * intensityScale
      );
      const trailColor = dimHexColor(
        baseColor,
        TRAIL_COLOR_INTENSITY * intensityScale
      );

      const headDx = dirX * kick;
      const headDy = dirY * kick;
      fluid.splatAtLocation(x, y, headDx, headDy, headColor);

      const trailX = x - dirX * TRAIL_OFFSET;
      const trailY = y - dirY * TRAIL_OFFSET;
      const trailDx = dirX * kick * TRAIL_FORCE_SCALE;
      const trailDy = dirY * kick * TRAIL_FORCE_SCALE;
      fluid.splatAtLocation(trailX, trailY, trailDx, trailDy, trailColor);
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
