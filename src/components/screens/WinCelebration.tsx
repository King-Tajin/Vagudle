import { useEffect, useState, useMemo } from "react";
import { m } from "framer-motion";
import cn from "classnames";
import VagudleIcon from "@/assets/icons/vagudle.svg?react";
import "./WinCelebration.css";

const PURPLES = [
  "#a855f7",
  "#c084fc",
  "#d8b4fe",
  "#7c3aed",
  "#9333ea",
  "#e879f9",
  "#f0abfc",
  "#6d28d9",
];

const FADE_OUT_AT_MS = 5000;
const CELEBRATION_DURATION_MS = 6000;
const ENTRANCE_ANIMATION_MS = 3150;

type Particle = {
  id: string;
  originX: number;
  originY: number;
  dx: number;
  dy: number;
  finalDy: number;
  color: string;
  size: number;
  shape: "circle" | "square";
  burstDelay: number;
};

function generateBurst(
  burstId: number,
  x: number,
  y: number,
  delayMs: number
): Particle[] {
  const COUNT = Math.max(
    10,
    Math.round(40 * Math.min(1, window.innerWidth / 1440))
  );
  return Array.from({ length: COUNT }, (_, i) => {
    const angle = (i / COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const speed = 80 + Math.random() * 140;
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;
    return {
      id: `${burstId}-${i}`,
      originX: x,
      originY: y,
      dx,
      dy,
      finalDy: dy + 110 + Math.random() * 70,
      color: PURPLES[Math.floor(Math.random() * PURPLES.length)],
      size: 10 + Math.random() * 14,
      shape: Math.random() > 0.45 ? "circle" : "square",
      burstDelay: delayMs / 1000,
    };
  });
}

function playWinSound() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();

    const playTone = (freq: number, start: number, dur: number, vol = 0.18) => {
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const g = ctx.createGain();
      const g2 = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(4000, start);
      filter.frequency.exponentialRampToValueAtTime(1800, start + dur);
      filter.Q.setValueAtTime(0.4, start);

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, start);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(freq * 2, start);

      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(vol, start + 0.03);
      g.gain.setValueAtTime(vol * 0.6, start + dur * 0.35);
      g.gain.exponentialRampToValueAtTime(0.001, start + dur);

      g2.gain.setValueAtTime(0, start);
      g2.gain.linearRampToValueAtTime(vol * 0.12, start + 0.03);
      g2.gain.exponentialRampToValueAtTime(0.001, start + dur);

      osc.connect(g).connect(filter).connect(ctx.destination);
      osc2.connect(g2).connect(filter);
      osc.start(start);
      osc.stop(start + dur);
      osc2.start(start);
      osc2.stop(start + dur);
    };

    const t = ctx.currentTime;
    playTone(523.25, t, 0.17);
    playTone(659.25, t + 0.14, 0.17);
    playTone(783.99, t + 0.28, 0.17);
    playTone(1046.5, t + 0.43, 0.65, 0.22);
    playTone(783.99, t + 0.43, 0.65, 0.1);
    playTone(659.25, t + 0.43, 0.65, 0.06);

    setTimeout(() => {
      try {
        void ctx.close();
      } catch {}
    }, 2500);
  } catch {}
}

type Props = {
  word: string;
  onDone: () => void;
};

export function WinCelebration({ word, onDone }: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(true);
  const [isEntranceAnimating, setIsEntranceAnimating] = useState(true);

  const cellSize = Math.min(
    72,
    Math.floor((window.innerWidth - 48) / word.length)
  );
  const fontSize = Math.round(cellSize * 0.56);

  const letterData = useMemo(
    () =>
      word
        .toUpperCase()
        .split("")
        .map((letter) => ({ letter })),
    [word]
  );

  useEffect(() => {
    playWinSound();

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const burstPoints: [number, number, number][] = [
      [vw * 0.12, vh * 0.2, 0],
      [vw * 0.88, vh * 0.18, 180],
      [vw * 0.5, vh * 0.1, 320],
      [vw * 0.22, vh * 0.58, 520],
      [vw * 0.8, vh * 0.52, 680],
      [vw * 0.5, vh * 0.38, 920],
      [vw * 0.08, vh * 0.42, 1100],
      [vw * 0.92, vh * 0.4, 1250],
      [vw * 0.35, vh * 0.22, 1450],
      [vw * 0.68, vh * 0.25, 1600],
    ];

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticles(
      burstPoints.flatMap(([x, y, delay], i) => generateBurst(i, x, y, delay))
    );

    const entranceTimer = setTimeout(
      () => setIsEntranceAnimating(false),
      ENTRANCE_ANIMATION_MS
    );
    const fadeTimer = setTimeout(() => setVisible(false), FADE_OUT_AT_MS);
    const doneTimer = setTimeout(onDone, CELEBRATION_DURATION_MS);
    return () => {
      clearTimeout(entranceTimer);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <m.div
      className="fixed inset-0"
      style={{ zIndex: 200, pointerEvents: "none" }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 win-celebration-bg" />

      {particles.map((p) => (
        <m.div
          key={p.id}
          className={cn(
            "win-celebration-particle",
            p.shape === "circle"
              ? "win-celebration-particle--circle"
              : "win-celebration-particle--square",
            isEntranceAnimating && "win-celebration-entrance-animating"
          )}
          style={
            {
              "--particle-x": `${p.originX}px`,
              "--particle-y": `${p.originY}px`,
              "--particle-size": `${p.size}px`,
              "--particle-color": p.color,
            } as React.CSSProperties
          }
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: p.dx,
            y: [0, p.dy, p.finalDy],
            opacity: [1, 0.85, 0],
            scale: [1, 1, 0.15],
            rotate: 360,
          }}
          transition={{
            duration: 1.5,
            delay: p.burstDelay,
            ease: "easeOut",
            times: [0, 0.42, 1],
          }}
        />
      ))}

      <div className="absolute win-celebration-center">
        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5, ease: "easeIn" }}
          className="font-royal font-bold text-crown-gold crown-glow tracking-wider win-celebration-title"
        >
          YOU WIN!
        </m.p>
        <div className="win-celebration-letters">
          {letterData.map(({ letter }, i) => (
            <m.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.4,
                delay: 0.2 + i * 0.1,
                ease: "easeIn",
              }}
              className={cn(
                "win-celebration-letter-cell",
                isEntranceAnimating && "win-celebration-entrance-animating"
              )}
              style={
                {
                  "--cell-size": `${cellSize}px`,
                  "--cell-font-size": `${fontSize}px`,
                } as React.CSSProperties
              }
            >
              {letter}
            </m.div>
          ))}
        </div>
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5, ease: "easeIn" }}
          className="win-celebration-logo"
        >
          <VagudleIcon />
        </m.div>
      </div>
    </m.div>
  );
}
