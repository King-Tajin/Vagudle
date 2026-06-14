import React, { useState, useEffect, useMemo } from "react";

const PARTICLE_SIZE = 35;
const SPREAD = 1.5;

const PARTICLE_HEIGHT = (PARTICLE_SIZE * 30) / 73;
const CELL_SIZE = PARTICLE_SIZE * 3.5;
const HALF_DIAG = Math.sqrt(PARTICLE_SIZE ** 2 + PARTICLE_HEIGHT ** 2) / 2;
const OVERSPILL = CELL_SIZE * 0.6;

const COLORS = ["#22c55e", "#eab308", "#58626e"];

interface StripMeasure {
  leftWidth: number;
  rightStart: number;
  rightWidth: number;
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

  useEffect(() => {
    const measure = () => {
      const el = keyboardRef.current;
      if (!el) return;
      const buttons = el.querySelectorAll("button");
      if (buttons.length === 0) return;

      let minLeft = Infinity;
      let maxRight = -Infinity;
      buttons.forEach((btn) => {
        const label = btn.getAttribute("aria-label") ?? "";
        const isSpecial =
          label.toLowerCase().startsWith("enter") ||
          label.toLowerCase().startsWith("delete");
        if (isSpecial) return;
        const r = btn.getBoundingClientRect();
        if (r.left < minLeft) minLeft = r.left;
        if (r.right > maxRight) maxRight = r.right;
      });

      if (minLeft === Infinity || maxRight === -Infinity) return;

      const vw = window.innerWidth;
      const leftWidth = Math.max(0, minLeft - 8);
      const rightStart = maxRight + 8;
      const rightWidth = Math.max(0, vw - rightStart);

      setStrips((prev) => {
        if (
          Math.abs(prev.leftWidth - leftWidth) < 1 &&
          Math.abs(prev.rightStart - rightStart) < 1 &&
          Math.abs(prev.rightWidth - rightWidth) < 1
        )
          return prev;
        return { leftWidth, rightStart, rightWidth };
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

  const sprinkles = useMemo(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;
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

    if (strips.leftWidth >= CELL_SIZE) {
      const leftCols = Math.floor((strips.leftWidth + OVERSPILL) / CELL_SIZE);
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < leftCols; col++) {
          const x = col * CELL_SIZE + padding + Math.random() * range;
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
    }

    if (strips.rightWidth >= CELL_SIZE) {
      const rightCols = Math.floor((strips.rightWidth + OVERSPILL) / CELL_SIZE);
      const rightOrigin = W - rightCols * CELL_SIZE;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < rightCols; col++) {
          const x =
            rightOrigin + col * CELL_SIZE + padding + Math.random() * range;
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
    }

    return items;
  }, [strips.leftWidth, strips.rightWidth]);

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
