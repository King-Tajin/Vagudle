import React, { useState, useEffect, useMemo } from "react";
import {
  measureKeyboardStrips,
  type StripMeasure,
} from "../../lib/stripMeasure";

const PARTICLE_SIZE = 35;
const SPREAD = 1.4;

const PARTICLE_HEIGHT = (PARTICLE_SIZE * 30) / 73;
const CELL_SIZE = PARTICLE_SIZE * 3.5;
const HALF_DIAG = Math.sqrt(PARTICLE_SIZE ** 2 + PARTICLE_HEIGHT ** 2) / 2;
const OVERSPILL = CELL_SIZE * 0.6;

const COLORS = ["#22c55e", "#eab308", "#58626e"];

interface WindowSize {
  W: number;
  H: number;
}

export const VagudleSprinkles = ({
  keyboardRef,
}: {
  keyboardRef: React.RefObject<HTMLDivElement>;
}) => {
  const [strips, setStrips] = useState<StripMeasure>({
    leftWidth: 0,
    rightStart: window.innerWidth,
    rightWidth: 0,
  });
  const [windowSize, setWindowSize] = useState<WindowSize>({
    W: window.innerWidth,
    H: window.innerHeight,
  });

  useEffect(() => {
    const measure = () => {
      const el = keyboardRef.current;
      if (!el) return;
      const result = measureKeyboardStrips(el);
      if (!result) return;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      setWindowSize((prev) => {
        if (prev.W === vw && prev.H === vh) return prev;
        return { W: vw, H: vh };
      });

      setStrips((prev) => {
        if (
          Math.abs(prev.leftWidth - result.leftWidth) < 1 &&
          Math.abs(prev.rightStart - result.rightStart) < 1 &&
          Math.abs(prev.rightWidth - result.rightWidth) < 1
        )
          return prev;
        return result;
      });
    };

    requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [keyboardRef]);

  const { leftWidth, rightWidth } = strips;
  const { W, H } = windowSize;

  const sprinkles = useMemo(() => {
    const padding = HALF_DIAG;
    const range = CELL_SIZE - 2 * padding;
    const rows = Math.ceil((H * SPREAD) / CELL_SIZE);
    const marginY = (H - rows * CELL_SIZE) / 2;
    const items: {
      id: number;
      x: number;
      y: number;
      rotation: number;
      color: string;
    }[] = [];
    let id = 0;

    const fillStrip = (cols: number, originX: number) => {
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = originX + col * CELL_SIZE + padding + Math.random() * range;
          const y = marginY + row * CELL_SIZE + padding + Math.random() * range;
          items.push({
            id: id++,
            x: (x / W) * 100,
            y: (y / H) * 100,
            rotation: Math.random() * 360,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
          });
        }
      }
    };

    if (leftWidth >= CELL_SIZE) {
      const leftCols = Math.floor((leftWidth + OVERSPILL) / CELL_SIZE);
      fillStrip(leftCols, 0);
    }

    if (rightWidth >= CELL_SIZE) {
      const rightCols = Math.floor((rightWidth + OVERSPILL) / CELL_SIZE);
      fillStrip(rightCols, W - rightCols * CELL_SIZE);
    }

    return items;
  }, [leftWidth, rightWidth, W, H]);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ background: "#0d1322", zIndex: 0 }}
    >
      {sprinkles.map((s) => (
        <div
          key={s.id}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: PARTICLE_SIZE,
            height: PARTICLE_HEIGHT,
            background: s.color,
            transform: `rotate(${s.rotation}deg)`,
            opacity: 1,
          }}
        />
      ))}
    </div>
  );
};
