import React, { useEffect, useRef, useState } from "react";
import { m, useMotionValue, useAnimationFrame } from "framer-motion";
import CarrotUrl from "../../assets/icons/carrot.svg";
import { drawDirtTexture } from "../../lib/dirtTexture";

const CARROT_DENSITY = 40;
const CARROT_DENSITY_REF = 1920 * 1080;
const CARROT_SIZE = 96;
const SPIN_DURATION_MIN = 6;
const SPIN_DURATION_MAX = 28;
const CARROT_OPACITY_MIN = 0.9;
const CARROT_OPACITY_MAX = 1.0;
const INITIAL_ANGLE_MAX = 360;

const drawDirt = drawDirtTexture;

interface CarrotParticle {
  id: number;
  x: number;
  y: number;
  degreesPerMs: number;
  opacity: number;
  initialAngle: number;
  direction: 1 | -1;
}

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
      <m.img
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

  const [carrots] = useState<CarrotParticle[]>(() => {
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
        direction: Math.random() < 0.5 ? 1 : -1,
      };
    });
  });

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
