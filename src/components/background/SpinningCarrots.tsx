import React, { useEffect, useRef, useMemo } from "react";
import { motion, useMotionValue, useAnimationFrame } from "framer-motion";
import CarrotUrl from "../../assets/icons/carrot.svg";

const PIXEL_SIZE = 6;
const COLOR_UNIFORMITY = 0.58;
const DIRT_COLORS = [
  "#3d1f0a",
  "#4a2810",
  "#5c3317",
  "#2d1508",
  "#6b4423",
  "#4e2c13",
];
const STONE_COLORS = ["#4a4a52", "#5a5a62", "#3a3a42"];
const ORGANIC_COLORS = ["#2a1505", "#1f1002", "#362010"];
const STONE_CHANCE = 0.055;
const ORGANIC_CHANCE = 0.075;

const CARROT_DENSITY = 40;
const CARROT_DENSITY_REF = 1920 * 1080;
const CARROT_SIZE = 96;
const SPIN_DURATION_MIN = 6;
const SPIN_DURATION_MAX = 28;
const CARROT_OPACITY_MIN = 0.9;
const CARROT_OPACITY_MAX = 1.0;
const INITIAL_ANGLE_MAX = 360;

const hexToRgb = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const rgbToHex = (r: number, g: number, b: number): string =>
  "#" +
  [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

const lerpColor = (from: string, to: string, t: number): string => {
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
};

const _ALL = [...DIRT_COLORS, ...STONE_COLORS, ...ORGANIC_COLORS];
const _SUM = _ALL.reduce(
  ([ra, ga, ba], h) => {
    const [r, g, b] = hexToRgb(h);
    return [ra + r, ga + g, ba + b] as [number, number, number];
  },
  [0, 0, 0] as [number, number, number]
);
const AVG_COLOR = rgbToHex(
  _SUM[0] / _ALL.length,
  _SUM[1] / _ALL.length,
  _SUM[2] / _ALL.length
);

interface CarrotParticle {
  id: number;
  x: number;
  y: number;
  degreesPerMs: number;
  opacity: number;
  initialAngle: number;
  direction: 1 | -1;
}

const drawDirt = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const cols = Math.ceil(canvas.width / PIXEL_SIZE);
  const rows = Math.ceil(canvas.height / PIXEL_SIZE);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const r = Math.random();
      let color: string;
      if (r < STONE_CHANCE) {
        color = STONE_COLORS[Math.floor(Math.random() * STONE_COLORS.length)];
      } else if (r < STONE_CHANCE + ORGANIC_CHANCE) {
        color =
          ORGANIC_COLORS[Math.floor(Math.random() * ORGANIC_COLORS.length)];
      } else {
        color = DIRT_COLORS[Math.floor(Math.random() * DIRT_COLORS.length)];
      }
      ctx.fillStyle =
        COLOR_UNIFORMITY > 0
          ? lerpColor(color, AVG_COLOR, COLOR_UNIFORMITY)
          : color;
      ctx.fillRect(col * PIXEL_SIZE, row * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }
  }
};

const CarrotItem = ({ c }: { c: CarrotParticle }) => {
  const rotation = useMotionValue(c.initialAngle);

  useAnimationFrame((_, delta) => {
    rotation.set(rotation.get() + c.degreesPerMs * delta * c.direction);
  });

  return (
    <div
      style={{
        position: "absolute",
        left: `${c.x}%`,
        top: `${c.y}%`,
        transform: "translate(-50%, -50%)",
        width: CARROT_SIZE,
        height: CARROT_SIZE,
      }}
    >
      <motion.img
        src={CarrotUrl}
        alt=""
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          opacity: c.opacity,
          rotate: rotation,
        }}
      />
    </div>
  );
};

export const SpinningCarrots = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawDirt(canvas);
    };

    resize();

    let timeoutId: ReturnType<typeof setTimeout>;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(resize, 150);
    };

    window.addEventListener("resize", debouncedResize);
    return () => {
      window.removeEventListener("resize", debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const carrots = useMemo<CarrotParticle[]>(() => {
    const count = Math.max(
      1,
      Math.round(
        CARROT_DENSITY *
          ((window.innerWidth * window.innerHeight) / CARROT_DENSITY_REF)
      )
    );
    return Array.from({ length: count }, (_, i) => {
      const durationMs =
        (SPIN_DURATION_MIN +
          Math.random() * (SPIN_DURATION_MAX - SPIN_DURATION_MIN)) *
        1000;
      return {
        id: i,
        x: 2 + Math.random() * 96,
        y: 2 + Math.random() * 96,
        degreesPerMs: 360 / durationMs,
        opacity:
          CARROT_OPACITY_MIN +
          Math.random() * (CARROT_OPACITY_MAX - CARROT_OPACITY_MIN),
        initialAngle: Math.random() * INITIAL_ANGLE_MAX,
        direction: (Math.random() < 0.5 ? 1 : -1) as 1 | -1,
      };
    });
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
      {carrots.map((c) => (
        <CarrotItem key={c.id} c={c} />
      ))}
    </div>
  );
};
