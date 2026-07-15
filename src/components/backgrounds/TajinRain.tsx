import React, { useState, useEffect, useMemo } from "react";
import { m } from "framer-motion";
import { measureKeyboardStrips, StripMeasure } from "../../lib/stripMeasure";
import { createRng, seedFromNumbers } from "../../lib/seededRandom";

interface TajinParticle {
  id: number;
  startX: number;
  delay: number;
  duration: number;
  type: "chili" | "lime" | "salt";
}

export function TajinRain({
  keyboardRef,
}: {
  keyboardRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [strips, setStrips] = useState<StripMeasure>({
    leftWidth: 0,
    rightStart: 0,
    rightWidth: 0,
  });
  const [viewportH, setViewportH] = useState(() => window.innerHeight);

  useEffect(() => {
    const measure = () => {
      const el = keyboardRef.current;
      if (!el) return;
      const result = measureKeyboardStrips(el);
      if (!result) return;
      setViewportH(window.innerHeight);
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

  const particles = useMemo(() => {
    const COUNT = 45;
    const EXP = 2.8;
    const rng = createRng(
      seedFromNumbers(
        strips.leftWidth,
        strips.rightStart,
        strips.rightWidth,
        viewportH
      )
    );
    const next: TajinParticle[] = [];
    let id = 0;

    const makeParticle = (x: number): TajinParticle => ({
      id: id++,
      startX: x,
      delay: rng() * 6,
      duration: 3 + rng() * 4,
      type: (["chili", "lime", "salt"] as const)[Math.floor(rng() * 3)],
    });

    if (strips.leftWidth > 2) {
      for (let i = 0; i < COUNT; i++) {
        next.push(makeParticle(Math.pow(rng(), EXP) * strips.leftWidth));
      }
    }

    if (strips.rightWidth > 2) {
      for (let i = 0; i < COUNT; i++) {
        next.push(
          makeParticle(
            strips.rightStart + (1 - Math.pow(rng(), EXP)) * strips.rightWidth
          )
        );
      }
    }

    return next;
  }, [viewportH, strips.leftWidth, strips.rightStart, strips.rightWidth]);

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
        <m.div
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
