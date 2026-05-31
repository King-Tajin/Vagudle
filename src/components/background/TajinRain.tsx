import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface TajinParticle {
  id: number;
  startX: number;
  delay: number;
  duration: number;
  type: "chili" | "lime" | "salt";
}

interface StripMeasure {
  leftWidth: number;
  rightStart: number;
  rightWidth: number;
}

export function TajinRain({
  keyboardRef,
}: {
  keyboardRef: React.RefObject<HTMLDivElement>;
}) {
  const [strips, setStrips] = useState<StripMeasure>({
    leftWidth: 0,
    rightStart: 0,
    rightWidth: 0,
  });
  const [viewportH, setViewportH] = useState(() => window.innerHeight);
  const [particles, setParticles] = useState<TajinParticle[]>([]);

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

      setViewportH(window.innerHeight);
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

  useEffect(() => {
    const COUNT = 45;
    const EXP = 2.8;
    const next: TajinParticle[] = [];
    let id = 0;

    const makeParticle = (x: number): TajinParticle => ({
      id: id++,
      startX: x,
      delay: Math.random() * 6,
      duration: 3 + Math.random() * 4,
      type: (["chili", "lime", "salt"] as const)[Math.floor(Math.random() * 3)],
    });

    if (strips.leftWidth > 2) {
      for (let i = 0; i < COUNT; i++) {
        next.push(
          makeParticle(Math.pow(Math.random(), EXP) * strips.leftWidth)
        );
      }
    }

    if (strips.rightWidth > 2) {
      for (let i = 0; i < COUNT; i++) {
        next.push(
          makeParticle(
            strips.rightStart +
              (1 - Math.pow(Math.random(), EXP)) * strips.rightWidth
          )
        );
      }
    }

    setParticles(next);
  }, [strips, viewportH]);

  const getColor = (type: string) => {
    switch (type) {
      case "chili":
        return "#C41E3A";
      case "lime":
        return "#A4C639";
      default:
        return "#FFD700";
    }
  };

  if (particles.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: p.startX,
            top: -8,
            width: 8,
            height: 8,
            background: getColor(p.type),
          }}
          animate={{
            y: ["0px", `${viewportH + 20}px`],
            rotate: [0, 360],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
